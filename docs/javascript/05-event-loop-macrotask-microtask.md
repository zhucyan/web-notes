# JavaScript 事件循环：从一个零延时定时器说起

点击「保存」后，页面可以在等待服务器响应时继续接收输入。等响应回来，浏览器再执行更新界面的代码。这里有两个问题：**谁负责等待？等到了，回调什么时候能运行？** 前一个问题由宿主环境（浏览器或 Node.js）处理，后一个问题涉及本文的主角——事件循环（Event Loop）。

## 一、先看一个零延时定时器

下面三行代码在浏览器和 Node.js 中都可以直接运行。先猜猜「定时器」会出现在第几行。

```js
console.log('开始')
setTimeout(() => console.log('定时器'), 0)
console.log('结束')
```

输出是 **开始 → 结束 → 定时器**。执行第二行时，JavaScript 把回调和延时交给宿主，然后马上执行第三行。即使延时条件已经满足，宿主也要等这段同步代码跑完，才有机会调用回调。这里的 `0` 表达的是希望尽快调度，实际等待时间还取决于线程正在做什么。

把视角拉近一点。**调用栈**记录了这条线程上还在执行的函数调用。调用一个函数就压入一层，返回时弹出一层。设想在第三行之后再做一项耗时 100 毫秒的同步计算，定时器就得多等这段时间。宿主可以在此期间计时、等待网络或接收输入，回调里的 JavaScript 仍要等线程空出来。

**事件循环**就是宿主反复安排这些就绪工作执行的机制。到这里，有一个自然的问题：如果线程空出来时有好几个回调在等，谁先运行？

## 二、给例子加一个 Promise

沿用上一个例子，在定时器和「结束」之间加两行。

```js
console.log('开始')
setTimeout(() => console.log('定时器'), 0)
Promise.resolve().then(() => console.log('Promise'))
queueMicrotask(() => console.log('微任务'))
console.log('结束')
```

结果是 **开始 → 结束 → Promise → 微任务 → 定时器**。这里遇到了两种不同的调度时机。

- **任务（task，也常叫宏任务）**给宿主一次执行某项工作的机会。浏览器处理用户的一次点击、运行一个到期的定时器回调，都是典型例子。
- **微任务（microtask）**适合在当前同步代码完成后，紧接着执行少量后续工作。`queueMicrotask(fn)` 直接把 `fn` 加入微任务队列。一个已经兑现的 Promise 调用 `.then(fn)`，也会把对应的回调安排为微任务。

| 执行到哪一步 | 此刻发生了什么 | 控制台新增输出 |
| --- | --- | --- |
| 第一行 | 同步调用 `console.log` | 开始 |
| `setTimeout` | 宿主开始计时，回调等待任务调度 | — |
| `.then` 和 `queueMicrotask` | 两个微任务依次入队 | — |
| 最后一行 | 当前脚本继续运行到结尾 | 结束 |
| 微任务检查点 | 从队首依次取出并运行两个回调 | Promise、微任务 |
| 定时器回调得到执行机会 | 回调中的 `console.log` 执行 | 定时器 |

为什么特意强调 Promise **已经兑现**？因为登记回调和回调入队可以发生在不同时间。`new Promise(executor)` 会同步执行 `executor`。若 Promise 还在等待结果，`.then` 先登记处理函数，直到成功或失败时，才安排相应的后续工作。比如 `fetch(url).then(showResult)` 要先等宿主处理网络请求，在请求取得响应、Promise 兑现后，`showResult` 才有资格进入微任务队列。仅凭 `.then` 写在第几行，还确定不了输出顺序。

## 三、浏览器怎样跑完一轮

### 微任务检查点会持续到队列为空

浏览器执行完一个任务后，会执行一次**微任务检查点**。把它理解成一段循环就够了：取出最早入队的微任务，运行它，再看队列里还有没有。运行期间追加的微任务也参加本次检查。有些从宿主返回的脚本执行结束、调用栈变空时，也会触发检查点。下图展示一个普通任务结束后的路径。

```text
浏览器选取一个可运行的任务
          ↓
执行任务，例如派发用户点击或调用定时器回调
          ↓
进入微任务检查点 ←───────────────┐
          │                     │
          ├─ 队列有内容 → 取队首执行 ┘
          │              （新微任务追加到队尾）
          ↓ 队列为空
浏览器可以调度后续工作，包括已就绪的渲染更新
```

试着沿图走一遍。`A` 执行时追加了 `B`，它应该排在 `C` 前面还是后面？

```js
queueMicrotask(() => {
  console.log('A')
  queueMicrotask(() => console.log('B'))
})
Promise.resolve().then(() => console.log('C'))
setTimeout(() => console.log('D'), 0)
```

同步代码结束时，队列是 `[A, C]`。取出 `A` 执行，`B` 加到队尾，队列就成了 `[C, B]`。等它清空后，定时器才有机会输出 `D`。完整顺序是 **A → C → B → D**。如果每个微任务都继续添加另一个微任务，检查点就迟迟无法结束，用户的下一次点击也会跟着等。这种现象称为**微任务饥饿**。

浏览器可以维护多个任务队列，用户输入、定时器和 `postMessage` 消息各有任务来源。浏览器从选中的队列里取最早可运行的任务，可以给用户输入更多处理机会。因此，分别来自消息和定时器的两个任务，即使注册顺序已知，也要看宿主实际选择了哪个队列。还有一个容易观察的区别：用户点击会引起浏览器安排任务，而脚本主动调用 `dispatchEvent()` 时，监听器会在这次调用中同步执行。

### 改了两次 DOM，用户会看到几次？

把下面的内容保存为 HTML 文件，在浏览器中打开并点击按钮。

```html
<button id="status">开始</button>
<script>
  const button = document.querySelector('#status')

  button.addEventListener('click', () => {
    button.textContent = '处理中'
    queueMicrotask(() => {
      button.textContent = '已完成'
    })
  })
</script>
```

点击时，按钮的 DOM 属性确实先变成「处理中」。点击回调结束后，微任务又把它改成「已完成」。等浏览器有机会更新画面时，最新文字已经是「已完成」，所以用户可能只看到最终状态。

**修改 DOM 和把结果画到屏幕上有各自的时机。** 浏览器根据刷新节奏、页面可见性等条件安排渲染，多项任务也可能在两次渲染之间完成。`requestAnimationFrame(fn)` 会让 `fn` 在一次渲染更新中、绘制前运行，适合更新动画。若一项计算会长时间占用主线程，把它包在 `queueMicrotask` 或 `await Promise.resolve()` 里仍会推迟渲染。可以把计算分批放入后续任务，让浏览器有机会处理输入和渲染，或把 CPU 密集部分交给 Web Worker。

## 四、换成 Node.js，哪些规则还能用？

开篇两个例子在 Node.js 中仍然成立。同步代码仍会运行到结束，Promise 回调和 `queueMicrotask` 仍按入队顺序执行。差别在于宿主还要安排哪些工作。浏览器要协调页面输入与渲染，Node.js 借助 **libuv**（负责事件循环和异步 I/O 的底层库）处理文件、网络和定时器等工作。

### 先看一次文件读取

将下面的代码保存为 `io-order.cjs`，用 `node io-order.cjs` 运行。`readFile` 异步读取当前文件，读完才调用传入的函数。

```js
const { readFile } = require('node:fs')

readFile(__filename, error => {
  if (error) throw error

  console.log('文件已读完')
  setTimeout(() => console.log('timeout'), 0)
  setImmediate(() => console.log('immediate'))
})
```

输出是 **文件已读完 → immediate → timeout**。`setImmediate` 把回调安排在 **check** 阶段。文件 I/O 回调中注册它时，事件循环接下来就能进入 check，而新定时器还要等到后续的定时器处理机会。

```text
文件 I/O 就绪 → 执行 readFile 回调 → 输出「文件已读完」
                        │
                        ├─ setTimeout   → 等待定时器处理
                        └─ setImmediate → 等待 check
                                          ↓
                              check 执行 immediate
                                          ↓
                              定时器机会到来，执行 timeout
```

这里的先后关系依赖于**两个调用发生在同一个 I/O 回调里**。如果把它们移到入口文件顶层，循环开始时定时器是否已经达到门槛，会影响谁先执行。Node.js 会把 `setTimeout(fn, 0)` 的延时调整为 1 毫秒，多跑几次得到相同结果也无法把它当成顶层代码的顺序保证。

理解了这次文件读取，再看阶段名称就有了对应的工作。表格列出各阶段的职责。

| 阶段 | 做什么 |
| --- | --- |
| poll | 等待 I/O 就绪，处理大多数 I/O 回调，包括上例的文件读取回调。 |
| check | 运行 `setImmediate` 回调。 |
| close callbacks | 运行部分资源的关闭回调，例如某些 socket 的 `close` 回调。 |
| timers | 运行已达到延时门槛的 `setTimeout` 和 `setInterval` 回调。 |
| pending callbacks | 运行被推迟到下一轮的部分系统 I/O 回调。 |
| idle / prepare | 供 libuv 内部使用。 |

**版本细节。** Node.js 20 系列开始采用 libuv 1.45.0。旧版在常规迭代中可以先处理到期定时器再进入 poll，新版将迭代中的定时器处理移到 poll 之后。为了兼容既有行为，默认运行模式在进入循环前还保留了一次定时器检查。复现旧例子时，可以用 `node -p process.versions.uv` 查看本机版本，并留意例子把定时器注册在了哪里。

### 再看 `process.nextTick` 插在哪里

Node.js 还有一个专用的 **next tick 队列**。在普通 I/O 回调返回、控制权交还给 Node.js 时，它会先处理 `process.nextTick` 登记的回调，再处理 Promise 和 `queueMicrotask` 所在的微任务队列，随后继续推进事件循环。这样，两次宿主回调之间也能执行微任务。递归登记 `nextTick` 会延迟后面的 I/O。

为什么有时又会看到 Promise 先输出？把同一段代码分别保存为 `order.cjs` 和 `order.mjs`，用 `node order.cjs` 和 `node order.mjs` 运行。

```js
console.log('sync')
Promise.resolve().then(() => console.log('promise'))
queueMicrotask(() => console.log('microtask'))
process.nextTick(() => console.log('nextTick'))
```

| 入口文件 | 实际顺序 | 顶层代码结束时发生了什么 |
| --- | --- | --- |
| CommonJS（`.cjs`） | `sync → nextTick → promise → microtask` | 同步入口返回给 Node.js，它先处理 next tick 队列。 |
| ES Module（`.mjs`） | `sync → promise → microtask → nextTick` | 模块顶层已经在微任务处理过程中执行。新追加的两个微任务随这次队列一起清空，随后 Node.js 才能处理 next tick 队列。 |

判断这类题时，先找出调度发生的位置。若正在清空微任务队列，在其中调用 `process.nextTick` 也要等这次微任务处理结束。这个条件比单独记忆两个 API 的优先级更精确。

## 五、自己推演两次

### 练习一：`await` 之后的代码排在哪里？

```js
async function run() {
  console.log('A')
  await 0
  console.log('B')
}

console.log('C')
run()
queueMicrotask(() => console.log('D'))
console.log('E')
```

<details>
<summary>查看输出与推演</summary>

**C → A → E → B → D**。调用 `run()` 时，同步执行到 `await`，先输出 `A`。`await 0` 会暂停这个异步函数，把恢复执行的工作安排成微任务，调用方继续登记 `D` 并输出 `E`。检查点开始时，恢复 `run` 的工作已经排在 `D` 前面，所以 `B` 先输出。若这里等待尚未兑现的 Promise，恢复时机会取决于它何时兑现。

</details>

### 练习二：在 I/O 回调里同时提交四项工作

保存为 `io-practice.cjs`，用 Node.js 运行。先预测回调返回后紧接着打印什么，再看定时器。

```js
const { readFile } = require('node:fs')

readFile(__filename, error => {
  if (error) throw error

  setTimeout(() => console.log('timer'), 0)
  setImmediate(() => console.log('immediate'))
  queueMicrotask(() => console.log('microtask'))
  process.nextTick(() => console.log('nextTick'))
  console.log('io')
})
```

<details>
<summary>查看输出与推演</summary>

**io → nextTick → microtask → immediate → timer**。`io` 在文件回调里同步输出。回调返回后先清空 next tick 队列，再执行微任务。此时 `immediate` 和 `timer` 都是在 I/O 回调内登记的，check 阶段先运行 `immediate`，之后才轮到新定时器。

</details>

## 小结

遇到新的输出顺序题，可以在纸上记三行：**当前同步代码打印了什么、微任务按什么顺序入队、还有哪些工作在等宿主调度**。浏览器例子中，再看用户关心的是 DOM 已经改变，还是画面已经更新。Node.js 例子中，则标出代码是在模块顶层、I/O 回调里，还是已经进入微任务处理过程。只要题目缺少能决定先后的条件，就保留多种可能的顺序。

## 参考资料

- [WHATWG HTML Standard · 事件循环、任务来源与渲染](https://html.spec.whatwg.org/multipage/webappapis.html#event-loops)
- [WHATWG HTML Standard · 定时器与微任务](https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#timers)
- [Node.js · 事件循环、定时器与 nextTick](https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick)
- [Node.js · queueMicrotask 与 process.nextTick 的调度顺序](https://nodejs.org/api/process.html#when-to-use-queuemicrotask-vs-processnexttick)
- [libuv 1.45.0 · 事件循环实现](https://github.com/libuv/libuv/blob/v1.45.0/src/unix/core.c)
