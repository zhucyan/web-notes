# 执行上下文、作用域链、词法作用域与闭包

> 本文目标：理解 JavaScript 的变量为什么“能找到”，函数又为什么能“记住”已经执行完的函数中的变量。

很多 JavaScript 现象看起来像魔法：函数明明已经返回，为什么内部变量还在？一个函数在另一个函数里调用，为什么它读到的不是调用者的局部变量？`var`、`let` 和函数声明为什么在定义之前表现不同？

这几个问题指向同一组基础机制：**执行上下文、词法作用域、作用域链和闭包**。它们不是四个互不相关的名词，而是一次函数调用从开始到结束、再到函数逃离调用现场时的一条完整链路。

## 先用 30 秒建立全局视角

先看一个最常见的闭包例子：

```js
function createCounter(start = 0) {
  let count = start

  return function increment() {
    count += 1
    return count
  }
}

const counter = createCounter(10)

console.log(counter()) // 11
console.log(counter()) // 12
```

这段代码同时包含了本文的四个主题：

| 概念 | 在示例中的角色 |
| --- | --- |
| 执行上下文 | 每次调用 `createCounter` 或 `increment`，JavaScript 都会为这次执行准备运行环境。 |
| 词法作用域 | `increment` 写在 `createCounter` 内部，因此它天生可以访问 `createCounter` 的变量。 |
| 作用域链 | `increment` 读取 `count` 时，先找自己，再沿着外层环境向外找。 |
| 闭包 | `createCounter` 已经返回，`increment` 仍可访问那一次调用专属的 `count`。 |

可以先记住这条因果关系：

```text
函数写在哪里
   ↓ 决定
它的词法作用域
   ↓ 形成
变量查找时的作用域链
   ↓ 当函数被带到外部继续使用时
闭包让它关联的外层环境继续可访问
```

下面逐层拆开。

## 一、执行上下文：代码运行时的工作台

**执行上下文（Execution Context）**可以理解为 JavaScript 执行一段代码时的“工作台”。工作台上记录了：这段代码能使用哪些变量、`this` 是什么、以及变量向外查找时应该到哪里去。

常见的执行上下文有三类：

- **全局执行上下文**：脚本开始运行时创建；一个脚本通常有一个。
- **函数执行上下文**：每调用一次函数，就创建一个新的上下文。
- **模块执行上下文**：ES Module 在模块代码执行时使用，其顶层作用域与传统脚本不同。

### 1. 函数调用会创建新的上下文

```js
function multiply(a, b) {
  const result = a * b
  return result
}

const value = multiply(3, 4)
```

调用 `multiply(3, 4)` 时，JavaScript 会创建这一次调用专属的函数执行上下文。可以把它简化为下面这样：

```text
multiply 的执行上下文
├─ a: 3
├─ b: 4
├─ result: 12
├─ this: 由调用方式决定
└─ 外层词法环境引用: 指向 multiply 定义时所在的环境
```

函数返回后，这次调用的执行上下文会从**调用栈**中弹出。调用栈描述的是“此刻有哪些调用尚未结束”；执行上下文描述的是“其中某一次执行所拥有的运行环境”。二者密切相关，但不是同一个概念。

### 2. 用“准备阶段”和“执行阶段”理解声明

为了方便理解，我们可以把上下文的建立过程粗略分成两个阶段：

1. **准备阶段**：创建标识符绑定、关联函数声明等。
2. **执行阶段**：按顺序运行每一行代码，为变量赋值、调用函数。

```js
console.log(greet()) // 'hi'
console.log(legacyValue) // undefined
// console.log(modernValue) // ReferenceError

function greet() {
  return 'hi'
}

var legacyValue = 1
let modernValue = 2
```

为什么结果不同？

- `function greet() {}` 的函数声明在执行代码前就已经以可调用函数的形式关联到 `greet`。
- `var legacyValue` 的绑定也已建立，但在赋值语句执行前，它的值是 `undefined`。
- `let modernValue` 的绑定同样会在当前作用域中建立，但从作用域开始到它的初始化语句执行前，处于**暂时性死区（TDZ）**；读取它会抛出 `ReferenceError`。

::: warning 不要把“提升”当成完整原理
“变量提升”是解释上述现象的常用说法，但它容易让人误以为代码真的被移动到了顶部。更准确的理解是：执行上下文在运行语句前已经创建了相应绑定；不同声明的初始化时机不同。特别是，`let` 和 `const` 不是“没有提升”，而是初始化前不能访问。
:::

### 3. 每次调用都有自己的局部变量

```js
function addOne(number) {
  const next = number + 1
  return next
}

console.log(addOne(1)) // 2
console.log(addOne(10)) // 11
```

两次 `addOne` 调用会创建两个不同的函数执行上下文：一次有 `number: 1`，另一次有 `number: 10`。它们不会共享 `next`。这件事是理解“多个闭包实例为什么互不干扰”的前提。

## 二、词法作用域：作用域在写代码时就已确定

**作用域**规定了在一段代码中可以访问哪些标识符。JavaScript 使用的是**词法作用域（Lexical Scope）**，也叫静态作用域：一个函数能访问哪些外部变量，主要取决于它**定义在源码的哪个位置**，而不是它从哪里被调用。

```js
const label = 'global'

function showLabel() {
  console.log(label)
}

function run() {
  const label = 'local'
  showLabel()
}

run() // 'global'
```

不少初学者会猜输出是 `'local'`：`showLabel` 明明是在 `run` 里面调用的。可 JavaScript 不会沿着“调用者”寻找变量。`showLabel` 写在全局作用域中，它定义时能看到的 `label` 是全局的那个，所以输出 `'global'`。

如果语言采用动态作用域，调用位置会影响变量解析；JavaScript 并非如此。下面的关系很重要：

```text
定义位置决定外层作用域  ✓
调用位置决定外层作用域  ✗
```

### 1. 函数作用域与块级作用域

函数体会创建函数作用域，`let` 和 `const` 所在的 `{}` 还会创建块级作用域。

```js
function getMessage(enabled) {
  const prefix = '状态：'

  if (enabled) {
    const detail = '已开启'
    return prefix + detail
  }

  // return detail // ReferenceError：detail 只属于上面的代码块
  return prefix + '未开启'
}
```

`prefix` 属于 `getMessage` 的函数作用域，整个函数体都可以读取；`detail` 属于 `if` 的块级作用域，离开块就不能直接读取。`var` 没有块级作用域，这也是现代代码通常优先使用 `let`/`const` 的原因之一。

### 2. 词法环境是运行时的对应物

在规范层面，执行上下文会关联**词法环境（Lexical Environment）**。不用背规范算法，也可以抓住两个关键点：

- 环境中保存当前作用域的变量绑定，例如 `user`、`count`。
- 环境还保存一个对外层环境的引用。

词法作用域是代码结构带来的规则；词法环境是运行时承载这些绑定和外层关联的机制。后者把前者变成实际可执行的变量访问。

## 三、作用域链：变量是怎样被找到的

当 JavaScript 遇到一个标识符，例如 `user`，它会从当前环境开始查找。如果当前环境没有该绑定，就沿着外层环境引用一层层向外寻找。这条查找路径就是**作用域链（Scope Chain）**。

```js
const siteName = 'Web Notes'

function createGreeting(user) {
  const punctuation = '!'

  return function greet() {
    return `Hello, ${user} · ${siteName}${punctuation}`
  }
}

console.log(createGreeting('Ada')())
// Hello, Ada · Web Notes!
```

执行 `greet()` 时，可以把查找过程想成：

```text
greet 的环境
  ├─ user？没有
  ├─ siteName？没有
  └─ punctuation？没有
        ↓ 外层环境
createGreeting 的那次调用环境
  ├─ user: 'Ada'           ← 找到 user
  └─ punctuation: '!'      ← 找到 punctuation
        ↓ 外层环境
全局环境
  └─ siteName: 'Web Notes' ← 找到 siteName
```

如果一直查到最外层仍没有找到，读取变量会得到 `ReferenceError`：

```js
function readUnknown() {
  return missingValue
}

// readUnknown() // ReferenceError: missingValue is not defined
```

### 1. 查找是由内向外的

内层同名变量会遮蔽外层变量：

```js
const theme = 'light'

function render() {
  const theme = 'dark'

  function getTheme() {
    return theme
  }

  return getTheme()
}

console.log(render()) // 'dark'
```

`getTheme` 先在自己内部找 `theme`，未找到后进入 `render` 的环境，已经找到 `'dark'`，因此不会再去读取全局的 `'light'`。这叫**遮蔽（shadowing）**。

::: tip 一个实用的排查顺序
当你不知道变量来自哪里时，先看当前函数是否声明了它；再看包裹当前函数的每一层函数或代码块；最后才看模块或全局。不要根据函数的调用位置猜测。
:::

### 2. 作用域链不是调用栈

调用栈按“谁调用了谁”组织，作用域链按“函数写在谁里面”组织。它们有时看起来相似，但可以轻易分叉：

```js
const message = 'from global'

function readMessage() {
  return message
}

function caller() {
  const message = 'from caller'
  return readMessage()
}

console.log(caller()) // 'from global'
```

调用栈是 `全局 → caller → readMessage`，但 `readMessage` 的作用域链是 `readMessage → 全局`。`caller` 在调用栈上，却不在 `readMessage` 的词法作用域链上。

## 四、闭包：函数为何能记住外部变量

闭包（Closure）最准确、也最实用的理解是：**函数，以及它能够访问的外层词法环境，组成的整体。**

当内部函数被返回、作为回调传递，或存入其他地方时，它可能会在外层函数结束后才执行。只要这个函数仍可达，JavaScript 就需要保留它执行时所需的那些外层绑定。因此外层函数返回并不意味着其中所有变量都立刻消失。

### 1. 回到计数器示例

```js
function createCounter(start = 0) {
  let count = start

  return function increment() {
    count += 1
    return count
  }
}

const first = createCounter()
const second = createCounter(100)

console.log(first())  // 1
console.log(first())  // 2
console.log(second()) // 101
```

这里发生了什么？

1. 调用 `createCounter()`，创建第一份执行上下文，其中 `count` 为 `0`。
2. 返回的 `increment` 在定义位置上能访问 `count`，所以它与第一份外层环境保持关联。
3. `first()` 调用时沿作用域链找到那份 `count`，修改为 `1`，下一次再修改为 `2`。
4. 调用 `createCounter(100)` 会再创建一份全新的环境；`second` 关联的是另一份 `count`，所以输出 `101`，不影响 `first`。

可以用下图表示两个彼此独立的闭包：

```text
first  ──► increment 函数 ──► 外层环境 A: { count: 2 }
second ──► increment 函数 ──► 外层环境 B: { count: 101 }
```

### 2. 闭包不是“内层函数”的同义词

内层函数具备形成闭包的条件，但“闭包”强调的是函数与其外层环境之间的关联，而不是单纯的嵌套语法。

```js
function createFormatter(prefix) {
  return function format(value) {
    return `${prefix}: ${value}`
  }
}

const formatUser = createFormatter('用户')
console.log(formatUser('Ada')) // 用户: Ada
```

`formatUser` 被保存到外部后仍能读取 `prefix`，这是闭包最直观的应用。事件处理器、定时器回调、Promise 回调和模块私有状态都经常依赖它。

### 3. 闭包与 `this` 是两条规则

闭包解决的是自由变量（例如 `count`、`prefix`）如何访问定义处的外层环境；普通函数中的 `this` 则主要由**调用方式**决定。不要用“闭包会固定 `this`”解释问题。

如果需要保留外层的 `this`，箭头函数的词法 `this` 规则或显式绑定才是对应工具：

```js
class Timer {
  constructor() {
    this.seconds = 0
  }

  start() {
    setInterval(() => {
      this.seconds += 1
    }, 1000)
  }
}
```

箭头函数不创建自己的 `this`，它从 `start` 所在的上下文取得 `this`。这与它通过作用域链读取 `this` 的方式有关，但要和闭包保存普通变量这一主题区分开。

## 五、把四个概念串起来

再看一段略完整的代码：

```js
const appName = 'Notes'

function createLogger(category) {
  let sequence = 0

  return function log(message) {
    sequence += 1
    return `[${appName}] [${category}] #${sequence}: ${message}`
  }
}

const logNetwork = createLogger('network')

console.log(logNetwork('connected'))
// [Notes] [network] #1: connected
```

按时间顺序推演：

1. 全局代码执行，创建全局执行上下文，其中有 `appName`、`createLogger`、`logNetwork` 等绑定。
2. 调用 `createLogger('network')`，创建函数执行上下文，得到 `category: 'network'` 和 `sequence: 0`。
3. `log` 的**定义位置**在 `createLogger` 内部，因此它的词法作用域包含 `createLogger` 的环境，再向外到全局环境。
4. `createLogger` 返回后，`logNetwork` 仍持有 `log` 函数。为了让它日后可运行，包含 `category`、`sequence` 的外层环境仍然可访问，这就是闭包。
5. 调用 `logNetwork('connected')` 时创建 `log` 自己的执行上下文。读取 `sequence` 和 `category` 时到外层环境找到；读取 `appName` 时继续到全局环境找到。

对应关系可以浓缩为：

| 问题 | 应该想到的概念 |
| --- | --- |
| 这次函数调用有哪些局部变量？ | 执行上下文 |
| 这个函数理论上能看到哪些外部变量？ | 词法作用域 |
| 运行时到底按什么顺序找变量？ | 作用域链 / 词法环境链 |
| 外层函数结束后，为什么变量还可访问？ | 闭包 |

## 六、常见陷阱与实践建议

### 1. 循环中的 `var` 与 `let`

```js
for (var i = 0; i < 3; i += 1) {
  setTimeout(() => console.log(i), 0)
}
// 3
// 3
// 3

for (let j = 0; j < 3; j += 1) {
  setTimeout(() => console.log(j), 0)
}
// 0
// 1
// 2
```

第一段只有一个函数作用域中的 `i` 绑定。三个回调形成的闭包都访问同一个 `i`，等定时器运行时循环已结束，`i` 已经是 `3`。

第二段的 `let` 具有块级作用域；规范会为循环的每次迭代提供独立的绑定，因此每个回调捕获到的 `j` 值不同。旧代码中常用立即执行函数（IIFE）人为创建一层函数作用域解决第一种情况；现代代码通常直接使用 `let`。

### 2. 闭包不是内存泄漏，但可能延长对象寿命

闭包是语言的正常能力，不应该为了“避免闭包”而放弃清晰设计。真正需要留意的是：长期存活的函数会让其仍可访问的数据继续存活。

```js
function bindSearchHandler(largeCache) {
  return function onSearch(keyword) {
    return largeCache.filter(item => item.includes(keyword))
  }
}
```

如果 `onSearch` 被长期挂在全局单例或未清理的事件监听器上，`largeCache` 也会继续被保留。实践上应当在组件卸载或任务结束时移除不再需要的监听器、清空引用，并避免让闭包无意中捕获不需要的大对象。

### 3. 模块也是天然的封装边界

ES Module 的顶层绑定不会自动成为全局变量。模块可以利用闭包式的私有状态暴露有限 API：

```js
// counter.js
let count = 0

export function increment() {
  count += 1
  return count
}

export function current() {
  return count
}
```

外部模块只能通过导出的函数读写 `count`，不能直接访问它。这里的核心依旧是词法作用域与变量绑定，只是模块为这层封装提供了更自然的语法边界。

### 4. 避免不必要的同名遮蔽

遮蔽合法，但过多同名变量会让作用域链难以阅读：

```js
const config = { retry: 3 }

function request(config) {
  // 这里的 config 遮蔽了外层 config
  return config.retry
}
```

如果两个变量语义不同，优先取能表达角色的名字，例如 `defaultConfig`、`requestConfig`。当变量解析路径清晰时，闭包和回调代码也更容易维护。

## 七、速查表与练习

### 速查表

| 概念 | 一句话定义 | 关键问题 |
| --- | --- | --- |
| 执行上下文 | 一段代码执行时拥有的运行环境 | 这次调用有哪些绑定？ |
| 词法作用域 | 由代码定义位置决定的可访问范围 | 这个函数写在哪里？ |
| 作用域链 | 标识符从当前环境逐层向外的查找路径 | 这个变量会去哪里找？ |
| 闭包 | 函数与其可访问外层词法环境的组合 | 外层返回后为什么仍能访问变量？ |

### 练习 1：预测输出

```js
const value = 'outer'

function createReader() {
  const value = 'middle'

  return function read() {
    return value
  }
}

const read = createReader()
console.log(read())
```

答案是 `'middle'`。`read` 沿作用域链在 `createReader` 的环境中先找到了 `value`，不会继续读取全局值。

### 练习 2：每次调用是否共享状态？

```js
function createId() {
  let id = 0
  return () => ++id
}

const a = createId()
const b = createId()

console.log(a(), a(), b())
```

答案是 `1 2 1`。`a` 和 `b` 分别关联两次不同调用创建的外层环境。

### 练习 3：变量从哪里来？

```js
const name = 'global'

function print() {
  console.log(name)
}

function run() {
  const name = 'run'
  print()
}

run()
```

答案是 `'global'`。判断依据不是 `print` 在 `run` 中被调用，而是 `print` 在全局作用域中定义。

## 小结

理解这四个概念后，大多数“变量从哪里来”和“函数为什么记得住状态”的问题都可以按同一条路径分析：先确定当前调用的执行上下文，再看函数的定义位置，沿作用域链追踪变量，最后判断函数是否因为逃离外层调用而形成闭包。掌握这套心智模型后，异步回调、事件处理、模块封装和 React/Vue 中的状态回调都会更容易理解。
