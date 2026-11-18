# var、let、const 与 JavaScript 数据类型：理解变量和值如何工作

> 本文目标：正确选择变量声明方式，并理解原始值、对象与函数参数传递的真实行为。

刚接触 JavaScript 时，`var`、`let`、`const` 看上去只是三种不同写法；字符串、数组和对象也像是几类可以随手使用的值。可一旦遇到“为什么 `const` 对象还能改”“为什么两个对象内容一样却不相等”“为什么函数能改对象却不能替换外部对象”等问题，真正起作用的是变量绑定、作用域和数据类型的规则。

本文把这些规则串成一条线：先选对声明方式，再认识值的类别，最后理解值在赋值、比较和函数调用中怎样流动。

## 先建立全局视角

JavaScript 中，变量不是值本身，而是一个**名字到值的绑定**。声明方式决定这个绑定能否重建、能否重新赋值、在哪个作用域可见；数据类型决定值本身如何被比较、修改和复制。

```text
声明变量
  ├─ var：函数作用域，历史语法
  ├─ let：可重新赋值的块级绑定
  └─ const：不可重新绑定的块级绑定

变量保存的值
  ├─ 原始类型：值本身
  └─ 对象类型：一个可访问对象的引用值
```

> 中文资料常把原始类型称为“基本数据类型”。本文以更接近规范语境的“原始类型（primitive）”为主；两种叫法在多数前端语境中指的是同一组值。

## 一、var、let、const：声明变量时到底选哪个

三者都能创建变量，但规则并不相同。

```js
var legacy = 'can redeclare'
var legacy = 'still allowed'

let status = 'draft'
status = 'published'

const maxRetries = 3
// maxRetries = 4 // TypeError: Assignment to constant variable.
```

### 1. 对照表

| 特性 | `var` | `let` | `const` |
| --- | --- | --- | --- |
| 作用域 | 函数作用域 | 块级作用域 | 块级作用域 |
| 同一作用域内重复声明 | 允许 | 不允许 | 不允许 |
| 声明后能否重新赋值 | 可以 | 可以 | 不可以重新绑定 |
| 声明时是否必须初始化 | 否 | 否 | 是 |
| 初始化前读取 | 得到 `undefined` | 抛出 `ReferenceError` | 抛出 `ReferenceError` |
| 现代代码建议 | 避免新增使用 | 需要重新赋值时使用 | 默认优先使用 |

简单的选择规则是：**默认 `const`；确定会重新赋值时用 `let`；除非维护旧代码，否则不用 `var`。**

### 2. `var` 是函数作用域，不是块级作用域

```js
function getLabel() {
  if (true) {
    var label = 'visible in the whole function'
  }

  return label
}

console.log(getLabel()) // 'visible in the whole function'
```

`label` 虽然写在 `if` 的 `{}` 中，仍属于整个 `getLabel` 函数。对比 `let`：

```js
function getStatus() {
  if (true) {
    let status = 'only inside this block'
    return status
  }

  // return status // ReferenceError
}
```

`let` 和 `const` 以 `{}` 为边界创建块级作用域，因此不容易让临时变量“泄漏”到外层。有关作用域链为何按代码定义位置而不是调用位置查找，可参考上一篇文章。

### 3. 为什么 `var`、`let`、`const` 在声明前不同

```js
console.log(oldValue) // undefined
// console.log(newValue) // ReferenceError

var oldValue = 'var'
let newValue = 'let'
```

在当前作用域开始执行前，`var`、`let` 和 `const` 的绑定都会被创建，但初始化时机不同：

- `var` 在执行赋值语句前已经初始化为 `undefined`。
- `let` 和 `const` 的绑定在初始化语句执行前不可访问，这段区间叫**暂时性死区（Temporal Dead Zone，TDZ）**。

所以“`let` 和 `const` 没有提升”并不精确。更准确的说法是：它们的绑定会在作用域开始时创建，但初始化前不能读取。

### 4. `const` 固定的是绑定，不是对象内容

```js
const profile = { name: 'Ada' }

profile.name = 'Grace'
profile.role = 'engineer'

console.log(profile) // { name: 'Grace', role: 'engineer' }

// profile = { name: 'Lin' } // TypeError
```

`const` 禁止的是让 `profile` 这个名字重新指向另一个值；它并没有让对象自动变成不可修改对象。若要限制对象自身的修改，可使用 `Object.freeze()`，但它默认只冻结第一层：

```js
const settings = Object.freeze({ theme: 'dark' })
// settings.theme = 'light' // 严格模式下抛错；非严格模式下赋值失败
```

### 5. 循环中的绑定差异

```js
for (var i = 0; i < 2; i += 1) {}
console.log(i) // 2

for (let j = 0; j < 2; j += 1) {}
// console.log(j) // ReferenceError
```

`i` 属于外层函数或全局作用域，循环结束后仍可访问；`j` 只属于 `for` 循环的块级作用域。更重要的是，`let` 会为循环的每次迭代提供独立绑定，这使异步回调更符合直觉：

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

第一组回调共享同一个 `i`；第二组回调各自捕获不同迭代的 `j`。这正是闭包和块级绑定一起产生的效果。

## 二、原始类型：不可再拆分的值

JavaScript 有 7 种原始类型：`undefined`、`null`、`boolean`、`number`、`string`、`symbol` 与 `bigint`。原始值不是对象；当你对字符串调用方法时，JavaScript 会临时包装它，让方法调用看起来像对象操作。

```js
const empty = undefined
const nothing = null
const ready = true
const score = 42
const title = 'Web Notes'
const token = Symbol('token')
const total = 9007199254740993n
```

### 1. 七种原始类型速览

| 类型 | 示例 | 常见用途与注意点 |
| --- | --- | --- |
| `undefined` | `let value` | 通常表示尚未赋值或缺少返回值。 |
| `null` | `const selected = null` | 由程序主动表示“没有对象/空值”。 |
| `boolean` | `true`、`false` | 条件、开关状态。 |
| `number` | `42`、`NaN`、`Infinity` | 浮点数与整数共用；整数精度有安全范围。 |
| `string` | `'hello'` | 文本；不可原地修改。 |
| `symbol` | `Symbol('id')` | 唯一标识符，常用于对象属性键。 |
| `bigint` | `123n` | 任意精度整数；不能直接与 `number` 做算术。 |

### 2. `undefined` 和 `null` 不一样

二者都经常被理解为“空”，但语义不同：

```js
let notAssigned
const selectedUser = null

console.log(notAssigned) // undefined
console.log(selectedUser) // null
```

一般约定中：

- `undefined` 表示一个变量、对象属性或函数返回值尚未提供。
- `null` 表示开发者有意设置为“没有值”，尤其常用于“没有对象”。

实际项目最重要的是在接口和团队约定中保持一致，而不是把二者机械地套进所有场景。

### 3. `number`、`NaN` 与精度

JavaScript 的普通数字采用 IEEE 754 双精度浮点数表示。因此有两个常见边界：

```js
console.log(0.1 + 0.2 === 0.3) // false
console.log(Number.isNaN(NaN)) // true
console.log(typeof NaN) // 'number'
```

- 小数计算可能有精度误差；涉及金额时应使用最小货币单位的整数，或采用专门的十进制方案。
- `NaN` 名字意为“不是一个数字”，但它的类型仍是 `number`。判断它优先使用 `Number.isNaN(value)`，不要用 `value === NaN`，后者永远为 `false`。

整数安全范围是 `Number.MAX_SAFE_INTEGER`（`9007199254740991`）以内。超出范围、又必须保证整数精确时，使用 `bigint`：

```js
const safe = 9007199254740991
const exact = 9007199254740993n

console.log(safe + 1 === safe + 2) // true，已失去精度
console.log(exact + 1n) // 9007199254740994n
```

`number` 与 `bigint` 不能直接混合算术：`1 + 1n` 会抛出 `TypeError`。要先依据业务规则显式转换。

### 4. 字符串与布尔值

字符串是不可变的原始值：

```js
let name = 'ada'
const upperName = name.toUpperCase()

console.log(name) // 'ada'
console.log(upperName) // 'ADA'
```

`toUpperCase()` 返回新字符串，并没有修改旧字符串。布尔值只有 `true` 和 `false`；在条件判断中，JavaScript 还会把其他值转换为布尔值。空字符串、`0`、`NaN`、`null`、`undefined` 和 `false` 是常见的假值（falsy），其余对象（包括空数组和空对象）都是真值（truthy）。

### 5. `symbol`：唯一的属性键

每次调用 `Symbol()` 都会创建唯一值，即使描述文字相同：

```js
const firstId = Symbol('id')
const secondId = Symbol('id')

console.log(firstId === secondId) // false

const record = {
  [firstId]: 1,
  id: 'visible id',
}
```

它适合需要避免与普通字符串属性冲突的场景，也被 JavaScript 的迭代器等内置协议使用。

### 6. 一个历史例外：`typeof null`

```js
console.log(typeof null) // 'object'
```

这是 JavaScript 早期实现遗留的历史行为，不代表 `null` 是对象。判断是否为 `null`，直接使用严格比较：

```js
value === null
```

## 三、对象类型：组织复杂数据的容器

除原始类型外，JavaScript 的复杂数据都可归入对象类型。普通对象、数组、函数、日期、正则表达式、`Map`、`Set` 等都属于对象体系。

```js
const profile = { name: 'Ada' }
const tags = ['javascript', 'types']
const format = value => value.toUpperCase()
const publishedAt = new Date('2026-11-18')
const matcher = /js/i
const scores = new Map([['Ada', 100]])
const uniqueTags = new Set(tags)
```

### 1. 怎样正确检查类型

`typeof` 适合区分大类，但它不能识别所有具体对象：

```js
console.log(typeof profile) // 'object'
console.log(typeof tags) // 'object'
console.log(typeof format) // 'function'

console.log(Array.isArray(tags)) // true
console.log(Array.isArray(profile)) // false
console.log(publishedAt instanceof Date) // true
```

常用选择如下：

| 目标 | 推荐方式 | 原因 |
| --- | --- | --- |
| 是否为字符串、数字、布尔值、函数等大类 | `typeof value` | 简洁且直接。 |
| 是否为数组 | `Array.isArray(value)` | 不会把普通对象误判为数组。 |
| 是否为 `null` | `value === null` | 避开 `typeof null` 的历史行为。 |
| 是否为当前运行环境中的某个类实例 | `value instanceof Constructor` | 可检查原型链，但跨 iframe 等环境时要谨慎。 |
| 是否为数值 `NaN` | `Number.isNaN(value)` | 不进行隐式转换，语义明确。 |

### 2. 数组不是“特殊的基本类型”

数组是对象的一种，擅长有序集合：

```js
const topics = ['scope', 'closure']
topics.push('types')

console.log(topics) // ['scope', 'closure', 'types']
```

数组可以按索引读取，也有 `map`、`filter`、`reduce` 等方法。它之所以被单独对待，是因为语言和标准库为有序序列提供了丰富 API；从类型分类上看，它仍是对象。

### 3. 函数也是对象

函数可以被调用，但它也能拥有属性、被传入其他函数或作为返回值：

```js
function greet(name) {
  return `Hello, ${name}`
}

greet.language = 'en'

console.log(greet('Ada')) // 'Hello, Ada'
console.log(greet.language) // 'en'
```

`typeof greet` 返回 `'function'` 是 JavaScript 特意提供的便利结果；从更大的对象体系看，函数依然具有对象能力。这也是回调、闭包和高阶函数能成立的基础。

## 四、赋值、比较与函数传参：值究竟如何流动

这是最容易产生“原始类型按值、对象按引用传递”误解的部分。准确结论是：**JavaScript 中所有函数参数都按值传递。**区别只在于变量保存的值是什么。

### 1. 给原始值赋值：复制值本身

```js
let firstTitle = 'draft'
let secondTitle = firstTitle

secondTitle = 'published'

console.log(firstTitle) // 'draft'
console.log(secondTitle) // 'published'
```

`firstTitle` 的字符串值被复制给 `secondTitle`。之后让 `secondTitle` 绑定新字符串，不会影响 `firstTitle`。

```text
firstTitle  ──► 'draft'
secondTitle ──► 'published'
```

### 2. 给对象赋值：复制能访问同一对象的引用值

```js
const firstProfile = { name: 'Ada' }
const secondProfile = firstProfile

secondProfile.name = 'Grace'

console.log(firstProfile.name) // 'Grace'
console.log(firstProfile === secondProfile) // true
```

这里复制的不是第二个对象，而是一个同样能访问原对象的值。因此两个变量可以观察和修改同一份对象：

```text
firstProfile  ─┐
               ├─► { name: 'Grace' }
secondProfile ─┘
```

这也是为什么 `const` 对象可以修改属性：变量绑定没有改变，被修改的是绑定所指向对象的内容。

### 3. 对象比较比较的是身份，不是内容

```js
console.log({ name: 'Ada' } === { name: 'Ada' }) // false

const one = { name: 'Ada' }
const two = one
console.log(one === two) // true
```

两个对象字面量会创建两个不同对象，即使属性完全相同，也不是同一个对象；同一对象被两个变量引用时，严格相等才为真。原始值的严格比较则比较值本身：

```js
console.log('Ada' === 'Ada') // true
console.log(42 === 42) // true
```

### 4. 参数传递始终复制一个值

```js
function rename(profile) {
  profile.name = 'Grace'
  profile = { name: 'Lin' }
}

const user = { name: 'Ada' }
rename(user)

console.log(user.name) // 'Grace'
```

调用 `rename(user)` 时，`user` 中保存的对象引用值被复制给形参 `profile`。开始时，两个变量都能访问同一个对象：

```text
user     ─┐
          ├─► { name: 'Ada' }
profile  ─┘
```

因此 `profile.name = 'Grace'` 修改的是这同一个对象，外部能看到变化。可 `profile = { name: 'Lin' }` 只是让**形参自己的绑定**转向新对象，`user` 并没有被重新赋值。

这正好证明 JavaScript 不是“对象按引用传递”：若真是按引用传递，重新给 `profile` 赋值也应改变 `user`。实际发生的是按值复制了一个引用值。

### 5. `==` 与 `===`

`===` 不做类型转换，通常应优先使用：

```js
console.log(1 === '1') // false
console.log(1 == '1') // true
```

`==` 会执行较复杂的抽象相等比较和隐式转换，容易让阅读者难以判断结果。少数场景会有意识地用 `value == null` 同时匹配 `null` 与 `undefined`，但在团队代码中，显式判断通常更清楚。

## 五、拷贝对象：浅拷贝、深拷贝与边界

当你不想让两个变量共享同一个对象时，需要创建副本。关键问题是：只复制第一层，还是连嵌套对象也复制？

### 1. 展开运算符和 `Object.assign` 是浅拷贝

```js
const source = {
  title: 'JavaScript',
  meta: { views: 1 },
}

const shallowCopy = { ...source }
shallowCopy.title = 'TypeScript'
shallowCopy.meta.views = 2

console.log(source.title) // 'JavaScript'
console.log(source.meta.views) // 2
```

顶层的 `title` 是原始值，复制后互不影响；但 `meta` 是对象，浅拷贝只复制它的引用值，所以 `source.meta` 和 `shallowCopy.meta` 仍是同一个对象。

```text
source.meta       ─┐
                   ├─► { views: 2 }
shallowCopy.meta  ─┘
```

`Object.assign({}, source)` 对普通对象的效果也是一层浅拷贝。

### 2. `structuredClone` 适合多数深拷贝需求

```js
const source = { meta: { views: 1 } }
const deepCopy = structuredClone(source)

deepCopy.meta.views = 3

console.log(source.meta.views) // 1
console.log(deepCopy.meta.views) // 3
```

`structuredClone` 会递归克隆大量内置可克隆数据，例如普通对象、数组、`Map`、`Set`、`Date`、`ArrayBuffer`。但它不是万能序列化工具：函数、DOM 节点等不可被它克隆，遇到这些值会抛出 `DataCloneError`。

不要把 `JSON.parse(JSON.stringify(value))` 当作通用深拷贝方案：它会丢失 `undefined`、`Symbol`、函数等信息，还会改变 `Date`、`Map`、`Set` 等数据的语义。

### 3. 何时应该拷贝

并非每次更新都必须深拷贝。选择取决于数据边界：

- 只需替换顶层配置，且嵌套对象允许共享时，浅拷贝足够。
- 需要在副本中独立修改嵌套数据时，使用 `structuredClone` 或针对数据结构进行明确的逐层复制。
- 有函数、类实例、DOM 节点等特殊对象时，先明确你真正要保留的语义，再选择专门方案。

## 六、速查表与练习

### 声明选择速查表

| 场景 | 建议 |
| --- | --- |
| 值不会重新绑定 | `const` |
| 计数器、累加器、状态会重新赋值 | `let` |
| 阅读或维护旧项目代码 | 理解 `var` 的函数作用域与重复声明规则 |
| 想让对象不可修改 | `const` 加上合适的不可变策略；仅 `const` 不够 |

### 数据类型速查表

| 需求 | 推荐判断或做法 |
| --- | --- |
| 判断数组 | `Array.isArray(value)` |
| 判断 `null` | `value === null` |
| 判断 `NaN` | `Number.isNaN(value)` |
| 比较两个值 | 默认使用 `===` |
| 复制一层普通对象 | `{ ...object }` 或 `Object.assign({}, object)` |
| 复制多数纯数据结构 | `structuredClone(value)` |

### 练习 1：`const` 到底限制什么？

```js
const options = { retry: 1 }
options.retry = 2

console.log(options.retry)
```

输出是 `2`。`options` 没有被重新绑定，变化的是对象内部属性。

### 练习 2：两个变量会互相影响吗？

```js
const original = { tags: ['js'] }
const copy = { ...original }

copy.tags.push('types')

console.log(original.tags)
```

输出是 `['js', 'types']`。展开运算符只浅拷贝第一层，两个对象仍共享同一个 `tags` 数组。

### 练习 3：函数能替换外部对象吗？

```js
function reset(value) {
  value = { ready: false }
}

const state = { ready: true }
reset(state)

console.log(state.ready)
```

输出是 `true`。`reset` 得到的是对象引用值的副本；重新赋值只改变局部形参 `value`，并没有改变 `state`。

## 小结

`var`、`let`、`const` 的核心差异是绑定规则和作用域，现代代码应优先使用 `const`，必要时使用 `let`。JavaScript 的值分为原始类型与对象类型：原始值在赋值时直接复制，对象变量复制的是访问同一对象的引用值。最后，不论参数是什么类型，函数调用都遵循按值传递；理解被复制的“值”究竟是原始值还是对象引用值，就能解释大多数赋值、比较、回调和状态更新问题。
