# JavaScript 垃圾回收、可达性分析与内存泄漏定位

JavaScript 不要求开发者手动 `free` 内存，但这不代表内存问题会自动消失。只要某段不再需要的数据仍能从运行时的根对象沿引用链访问到，垃圾回收器就必须保留它；页面反复操作后，这类对象不断累积，最终会带来卡顿、崩溃甚至标签页被浏览器回收。

本文以浏览器环境和 V8 为例，先讲清“对象为什么能被回收”，再把原理落到 Chrome DevTools 的实际排查中。

## 先建立一个正确的内存观

执行 JavaScript 时，可以先用下面的简化模型理解内存：

| 区域 | 主要存放内容 | 生命周期直觉 |
| --- | --- | --- |
| 调用栈（Call Stack） | 正在执行的函数调用、局部绑定等 | 函数返回后，该调用帧通常不再需要 |
| 堆（Heap） | 对象、数组、函数、闭包捕获的数据、DOM 的 JavaScript 包装对象等 | 是否保留取决于对象是否仍可达 |

例如，变量 `user` 在栈上的绑定结束后，堆中的对象并不一定立刻消失：还要看是否存在别的引用指向它。

```javascript
function createUser() {
  const user = { id: 1, name: "Ada" };
  return user;
}

const currentUser = createUser();
```

`createUser` 返回后，它的调用帧可以退出；但返回的对象仍由 `currentUser` 引用，所以不能回收。

这也解释了一个常见误区：**内存泄漏不是“内存没有释放”的同义词，而是“不再有业务价值的数据仍被长期保留”。** 一次短暂的内存增长可能只是正常缓存、延迟回收或加载高峰；如果“执行同一套打开—关闭操作后，空闲时的内存基线持续抬高”，才更像泄漏。

可以把常见现象区分为三类：

| 现象 | 特征 | 优先处理方式 |
| --- | --- | --- |
| 内存泄漏（leak） | 同一操作重复后，存活对象或基线持续增长 | 找到持有它的引用链并解除 |
| 内存膨胀（bloat） | 内存稳定但基线本身过高，例如缓存或大列表过大 | 控制数据量、分页、虚拟列表、缓存上限 |
| 内存抖动（churn） | 大量短命对象频繁创建和回收，GC 活跃、页面卡顿 | 降低不必要的临时分配 |

## 可达性分析：对象何时可以被回收

现代 JavaScript 引擎的核心判断不是“引用计数是否为 0”，而是**可达性（reachability）**：从一组起点出发，能否沿强引用找到该对象。

### GC Roots 与引用链

这组起点通常被抽象为 **GC Roots（根集合）**。在浏览器业务代码中，可以把以下内容当作重要的心智模型：

- 当前执行中的调用栈及其局部变量；
- 全局对象，例如 `globalThis`（浏览器中通常对应 `window`）；
- 当前仍被文档树、事件系统、定时器或浏览器运行时持有的对象；
- 其他原生运行时维护的活动引用。

根集合是引擎实现细节的一部分，开发时不用枚举全部根；真正要掌握的是：**从根到目标对象的每一段引用，都可能让目标对象继续存活。**

```javascript
const session = {
  user: { id: 1, name: "Ada" },
  permissions: ["read"],
};

globalThis.currentSession = session;
// globalThis → currentSession → session → user / permissions
```

此时存在下列路径：

```text
GC Root（globalThis）
  └─ currentSession
      └─ session
          └─ user
```

把局部变量设为 `null` 不一定有用，只要路径中的任何其他边仍存在，对象依然可达。反过来，只有断开最后一条强引用路径时，对象及其仅由它持有的子对象才会变成可回收状态。

```javascript
globalThis.currentSession = null;
// 若没有其他强引用，原 session 对象图此时才“可回收”。
```

### 可达不等于永远存在，可回收也不等于立即回收

“可回收”只描述资格，不描述时刻。引擎会基于内存压力、分配速度和运行时调度选择回收机会，因此不要写依赖“赋值为 `null` 后下一行内存必然下降”的代码。

同样，手动触发 GC（开发工具中的 Collect garbage，或某些调试环境下的 `gc()`）只适合做分析时降低噪声，不能修复泄漏。真正的修复是让不再需要的对象**不可达**。

> `WeakMap` 和 `WeakSet` 的键使用弱引用，适合“给对象附加元数据、但不应由元数据容器决定对象寿命”的场景。它们不是给普通缓存打补丁的工具：键不可遍历，也不能替代明确的缓存淘汰策略。

## V8 的垃圾回收：理解即可，不要依赖实现

可达性是跨引擎的关键概念；下面的“新生代、Scavenge、标记整理”是 V8 的实现视角，用来理解性能特征即可，业务逻辑不应依赖其精确时机或阈值。

### 新生代与老生代

V8 利用“多数对象朝生夕死”的经验规律，将堆大致划分为两代：

- **新生代（young generation）**：新建对象通常先进入这里。它较小、回收更频繁，适合快速处理大量短命临时对象。
- **老生代（old generation）**：多次回收后仍存活的对象可能被晋升到这里。老生代更大，回收成本通常也更高。

因此，“少创建对象”并不是总是正确的优化目标。一个只在单次渲染中使用、很快不可达的临时对象通常不是泄漏；反而是被长生命周期容器意外保存的对象，更值得警惕。

### Scavenge、标记、清除与整理

可以把典型回收过程理解为下表。真实引擎会并行、增量或并发执行其中一部分工作，名称和细节也可能随版本演进。

| 阶段/策略 | 解决的问题 | 直觉 |
| --- | --- | --- |
| Scavenge（新生代回收） | 快速处理短命对象 | 把存活对象转移到连续空间，未存活的对象自然被遗弃 |
| Mark（标记） | 找出仍可达的对象 | 从根集合出发遍历引用图并标记 |
| Sweep（清除） | 复用不可达对象留下的空间 | 将可用内存记录为可再次分配的空闲区域 |
| Compact（整理/压缩） | 降低碎片 | 移动存活对象，使空闲空间更连续，并更新引用 |

V8 通过并行、并发和增量工作来缩短主线程停顿，但 GC 不是零成本。频繁的长时间 GC 往往意味着：分配量太大、存活对象太多，或者两者兼有。V8 对标记、清扫和压缩的说明可参考 [Orinoco 垃圾回收器介绍](https://v8.dev/blog/trash-talk)。

## 内存泄漏的本质：不再需要，却仍然可达

排查泄漏时不要先问“哪个对象没有被 GC”，而要问：**它从哪个根对象一路被谁持有？** 以下模式的共同点就是形成了一条本应在生命周期结束时断开的引用链。

### 1. 意外的全局引用

在非严格模式下，遗漏声明可能创建全局属性；即便使用了声明，把大对象放进模块级单例或 `globalThis` 后忘记清理，也会产生同样的问题。

```javascript
// 错误：非严格模式下可能创建 globalThis.latestPayload。
function remember(payload) {
  latestPayload = payload;
}

// 修复：只在需要的局部作用域中保存它。
function format(payload) {
  const latestPayload = payload;
  return latestPayload.id;
}
```

引用链是 `globalThis → latestPayload → 大对象图`。使用 ESLint 的未声明变量规则、模块化作用域和明确的状态销毁逻辑，可以在源头减少这类问题。

### 2. 没有移除的事件监听器

浏览器的事件目标会持有已注册的回调；如果回调是箭头函数或闭包，并且它又捕获了组件实例、DOM 节点或大数据，组件卸载后仍可能被 `window` 或 `document` 间接保留。

```javascript
class Panel {
  mount() {
    this.onResize = () => this.layout();
    window.addEventListener("resize", this.onResize);
  }

  unmount() {
    window.removeEventListener("resize", this.onResize);
    this.onResize = null;
  }

  layout() {
    // 更新布局
  }
}
```

关键不是“函数写在类里还是写在外面”，而是移除监听器时必须使用**同一个函数引用**。下面的写法无法移除之前注册的匿名函数：

```javascript
window.addEventListener("resize", () => render());
window.removeEventListener("resize", () => render()); // 无效：这是另一个函数对象
```

### 3. 没有清理的定时器和订阅

`setInterval`、`setTimeout`、`requestAnimationFrame`、`MutationObserver`、`ResizeObserver`、WebSocket 和自定义事件总线，都会在生命周期外继续触发或保留回调。创建它们的地方必须对应一个可调用的清理动作。

```javascript
class Poller {
  start() {
    this.timerId = window.setInterval(() => this.refresh(), 1000);
  }

  stop() {
    window.clearInterval(this.timerId);
    this.timerId = null;
  }

  refresh() {
    // 拉取或刷新数据
  }
}
```

对观察器和订阅也采用同样的成对原则：`observe()` 对应 `disconnect()`，`subscribe()` 对应 `unsubscribe()`，框架组件的挂载钩子对应卸载钩子。

### 4. 脱离文档的 DOM 节点

从页面中移除节点，只会断开它与文档树的连接；若 JavaScript 的数组、Map、闭包或事件监听器仍引用它，该节点及其子树依然可能留在内存中。这类节点常被称为 Detached DOM。

```javascript
const detachedNodes = new Map();

function openDialog(id) {
  const node = document.createElement("div");
  node.textContent = "临时对话框";
  document.body.append(node);
  detachedNodes.set(id, node);
  return node;
}

function closeDialog(id) {
  const node = detachedNodes.get(id);
  node?.remove();
  detachedNodes.delete(id); // 同时断开长期 JavaScript 引用
}
```

如果业务需要缓存 DOM，要为缓存定义上限和销毁策略；如果并不需要复用节点，不要把它放进长生命周期容器。

### 5. 闭包与无上限缓存

闭包让函数能够访问创建时的词法环境，是正常且强大的语言能力。只有当一个长生命周期回调捕获了不再需要的大对象时，闭包才会参与形成泄漏。

```javascript
function createRenderer(largeResponse) {
  return function renderTitle() {
    return largeResponse.title;
  };
}

// 如果这个回调被全局事件总线永久保存，largeResponse 也会一直可达。
const renderers = new Set();
renderers.add(createRenderer(fetchResult));
```

修复方向不是回避闭包，而是缩小捕获范围、在不需要时从事件总线移除回调，或只捕获渲染所需的轻量数据。缓存同理：没有淘汰策略的缓存就是“有意的长期引用”。

```javascript
const recentSearches = [];

function rememberRecentSearch(result) {
  recentSearches.push(result);
  if (recentSearches.length > 50) recentSearches.shift();
}
```

生产缓存还应根据业务选择 TTL、LRU、按页面会话清空或显式失效，而不是只套用固定数字。

## 用 Chrome DevTools 定位内存泄漏

Chrome DevTools 的 Memory 面板并不是“点击一下就告诉你泄漏在哪”的工具；它让你观察对象数量、分配来源和引用路径。调试期间请关闭无关标签页、尽量保持操作一致，并避免在 Console 中长期保存待检查对象——Console 自身也可能成为引用者。

### 第一步：确认它真的是泄漏

先在无操作时观察一个基线，然后重复完全相同的业务操作，例如“打开详情页 → 关闭详情页”十次。等待页面稳定后再观察：

- Chrome Task Manager 的 Memory footprint、JavaScript memory 是否总体上升；
- DOM 节点数、监听器数或某个业务类实例数是否每轮都增加；
- 多轮操作后的空闲基线能否回到接近起点。

单次曲线向上不等于泄漏。加载图片、代码分包、JIT 优化和正常缓存都可能造成阶梯；可疑的是每次“创建—销毁”循环后都残留相同类型的对象。

### Heap Snapshot：比较存活对象

Heap Snapshot 适合回答“操作完成后，哪些对象还活着、被谁持有”。建议使用一致的四步法：

1. 打开 DevTools 的 **Memory** 面板，选择 **Heap snapshot**，先获取快照 A；
2. 重复怀疑的操作，并执行相反操作使页面回到初始 UI；
3. 再取快照 B；必要时重复后取快照 C；
4. 在 **Comparison** 视图比较快照，关注数量持续为正的业务构造函数、DOM 类型、闭包和 `Detached` 对象。

在 Summary 视图可按构造函数聚合；Comparison 会展示不同快照的对象数和大小变化；Containment 有助于查看对象结构。快照展示的是从全局对象可达的内存图，拍摄快照会触发 GC，因此更适合比较“回收后仍然留下的对象”。详见 Chrome 官方的 [Heap Snapshot 指南](https://developer.chrome.com/docs/devtools/memory-problems/heap-snapshots/)。

注意两个指标：

- **Shallow Size**：对象自身占用的大小；
- **Retained Size**：若让该对象及其因此不可达的依赖对象被释放，理论上可释放的大小。

一个很小的监听器函数可能有很大的 Retained Size，因为它经由闭包或实例间接阻止了一整棵对象图回收。

### Allocation instrumentation on timeline：观察分配与回收

当你已经知道“内存增长”，但不知道“增长发生在哪次动作、哪段调用栈”时，选择 **Allocation instrumentation on timeline**：开始录制，执行一次可复现流程，结束录制，再选取时间区间查看该期间分配且在录制末尾仍存活的对象。

它的优点是把对象分配与时间轴关联；代价是插桩本身有一定开销，适合短而可控的复现。对于长时间、低开销地定位高频分配热点，可使用 **Allocation sampling**；它是采样结果，适合看趋势而非精确计数。Memory 面板中各配置的用途可参阅 [官方概览](https://developer.chrome.com/docs/devtools/memory/)。

### Retainers：顺着引用链找到持有者

选中可疑对象后，查看底部的 **Retainers**。这里展示“哪些对象指向它”，沿树向上展开就是从对象回到根的反向路径。排查时请把它翻译成人话：

```text
Window
  → document 的 click 监听器列表
    → onDocumentClick 回调
      → 闭包 / this
        → UserCard 实例
          → 已被移出文档的 root 节点
```

这条链比“看到 Detached DOM”更有价值：它告诉你应该改哪个生命周期、哪个容器或哪个监听器。Chrome 官方也建议用 Retainers 查看选中对象的引用者，并可临时忽略某个引用以探索其他路径。

## 实战：组件反复挂载后内存持续上涨

下面用一个简化组件复现典型问题。页面每次打开用户卡片都创建实例；关闭卡片时从 DOM 删除，但没有注销 `document` 事件。

### 复现问题

```javascript
class UserCard {
  constructor(root) {
    this.root = root;
    this.onDocumentClick = (event) => {
      if (!this.root.contains(event.target)) this.root.hidden = true;
    };
  }

  mount() {
    document.addEventListener("click", this.onDocumentClick);
  }

  unmount() {
    this.root.remove();
    // 错误：document 仍持有 onDocumentClick，闭包仍持有 this 和 root。
  }
}
```

每一次 `mount()` 都向长生命周期的 `document` 注册一个新函数。`unmount()` 只移除了可见节点，没有移除监听器，因此每个 `UserCard` 实例和 `root` 都仍可达。

### 用快照定位引用链

按照下面步骤操作：

1. 刷新页面，在未打开卡片时拍摄快照 A；
2. 连续执行“打开卡片 → 关闭卡片”至少三次；
3. 拍摄快照 B，并在 Comparison 中与 A 对比；
4. 搜索 `UserCard`，或搜索 `Detached` 以找到被移出文档但仍存活的节点；
5. 选中一个对象，在 Retainers 中展开到 `document` 的事件监听回调。

若每轮操作后 `UserCard` 数量都增加，且 Retainers 显示 `document → listener → onDocumentClick → UserCard`，就已经确认了引用链，而不是猜测 GC 没有及时工作。

### 修复并验证

把监听器的注销放入与挂载严格配对的卸载逻辑中：

```javascript
class UserCard {
  constructor(root) {
    this.root = root;
    this.onDocumentClick = (event) => {
      if (!this.root.contains(event.target)) this.root.hidden = true;
    };
  }

  mount() {
    document.addEventListener("click", this.onDocumentClick);
  }

  unmount() {
    document.removeEventListener("click", this.onDocumentClick);
    this.root.remove();
    this.root = null;
    this.onDocumentClick = null;
  }
}
```

移除监听器是关键动作；把字段置为 `null` 是为了让实例即便暂时被其他路径观察到，也不再持有节点。修复后重复完全相同的测试：新的快照不应再显示 `UserCard` 或 Detached 节点随轮数线性增加，空闲内存基线应趋于稳定。

## 排查与预防清单

遇到疑似泄漏时，按顺序完成下面的闭环：

1. **定义可重复场景**：明确一次操作及其反向操作，例如“进入详情 → 返回列表”。
2. **建立基线**：在页面空闲时记录内存、节点数和关键实例数。
3. **重复而非单次操作**：至少循环多次，放大残留信号。
4. **先确认趋势**：区分泄漏、正常缓存和短命对象抖动。
5. **用 Heap Snapshot 比较**：关注正增长的业务类、闭包、监听器相关对象和 Detached DOM。
6. **用 Allocation Timeline 追分配源**：当对象来源不清楚时，记录一次短流程。
7. **阅读 Retainers**：从可疑对象一路找到根与真正的持有者。
8. **成对清理资源**：`addEventListener/removeEventListener`、`setInterval/clearInterval`、`observe/disconnect`、`subscribe/unsubscribe`。
9. **约束长期容器**：为缓存设上限和失效策略；移除不再使用的 DOM、回调和 Map 条目。
10. **回归验证**：修复后重复同一测试，确认对象数量与空闲基线不再持续上涨。

在工程层面，可以把这些清理行为收敛在组件卸载钩子、资源管理器或统一的 `dispose()` 方法中；为缓存制定所有权和淘汰策略；并在长会话、路由切换或弹窗反复开关等高风险路径中加入性能回归检查。

## 总结

垃圾回收器只负责回收不可达对象，不能判断业务上“已经没用了”的数据。理解可达性分析后，内存泄漏就不再是玄学：它是一条本应断开、却仍从根对象通向旧对象的引用链。

排查时先用重复操作确认趋势，再用快照找到存活对象，最后用 Retainers 找到持有者。修复目标始终明确：在正确的生命周期点断开那条引用链，而不是等待或强迫 GC 替你解决问题。

## 参考资料

- [V8：Trash talk: the Orinoco garbage collector](https://v8.dev/blog/trash-talk)
- [Chrome DevTools：Fix memory problems](https://developer.chrome.com/docs/devtools/memory-problems/)
- [Chrome DevTools：Record heap snapshots](https://developer.chrome.com/docs/devtools/memory-problems/heap-snapshots/)
- [Chrome DevTools：Memory panel overview](https://developer.chrome.com/docs/devtools/memory/)
