# JavaScript 的 call、apply 与 bind

> 本文目标是了解并手写 `call`、`apply` 和 `bind` 的核心逻辑。


## 一、call、apply 和 bind 怎么用

三者都定义在 `Function.prototype` 上。第一个参数 `thisArg` 是传给目标函数的 `this`，其余参数的传递方式如下。

| 写法 | 何时执行目标函数 | 怎样传递参数 |
| --- | --- | --- |
| `fn.call(thisArg, a, b)` | 立即执行 | 逐个传入 |
| `fn.apply(thisArg, args)` | 立即执行 | 从数组或类数组对象中读取 |
| `fn.bind(thisArg, a)` | 调用返回的函数时执行 | 先传预设参数，再传本次调用的参数 |

```js
function format(prefix, suffix) {
  return prefix + this.name + suffix
}

const reader = { name: '小林' }

console.log(format.call(reader, '你好，', '！')) // '你好，小林！'
console.log(format.apply(reader, { 0: '你好，', 1: '！', length: 2 })) // '你好，小林！'

const greet = format.bind(reader, '你好，')
console.log(greet('！')) // '你好，小林！'
console.log(greet.call({ name: '小周' }, '。')) // '你好，小林。'
```

`apply` 先读取 `length`，再按顺序读取数字索引。缺失的项会按普通属性读取规则得到值，原型链上也找不到时就是 `undefined`。传入 `null` 或 `undefined` 表示零个参数。仅实现迭代协议的对象（例如 `Set`）需要先转换为数组，才能把迭代得到的元素用作参数。

`bind` 返回的新函数在普通调用时使用已绑定的 `this`，所以示例里的 `greet.call(...)` 仍读取 `reader.name`。如果目标函数可以构造，`new` 调用绑定函数时会使用构造过程创建的对象，同时仍传入预设参数。箭头函数始终使用从外层取得的 `this`。

## 二、手写 call

下面的三个实现都用独立函数接收目标函数 `fn`，便于在控制台练习。先用 `obj[key](...args)` 复现方法调用。临时属性用新的 `Symbol` 作为键，避免和已有属性重名，并在 `finally` 中清理，即使目标函数抛错也会执行清理。

```js
function myCall(fn, thisArg, ...args) {
  if (typeof fn !== 'function') {
    throw new TypeError('fn 必须是函数')
  }

  const receiver = thisArg == null ? globalThis : Object(thisArg)
  const key = Symbol('temporary method')

  Object.defineProperty(receiver, key, {
    value: fn,
    configurable: true,
  })

  try {
    return receiver[key](...args)
  } finally {
    delete receiver[key]
  }
}

function sum(a, b) {
  return this.base + a + b
}

console.log(myCall(sum, { base: 10 }, 2, 3)) // 15
```

临时属性版适合观察方法调用怎样传递接收者。它要求接收者支持新增属性，并会提前替换空值和包装基本类型，因此直接沿用它会改变严格模式示例中的结果。原生方法会把 `thisArg` 原样交给目标函数，由目标函数处理。

## 三、手写 apply

`apply` 的核心是从类数组对象提取位置参数，再用指定的 `thisArg` 调用目标函数。这里用 `Reflect.apply` 执行最后一步，使接收者的传递与原生方法一致，并支持冻结对象。

```js
function myApply(fn, thisArg, argsLike) {
  if (typeof fn !== 'function') {
    throw new TypeError('fn 必须是函数')
  }
  if (argsLike == null) {
    return Reflect.apply(fn, thisArg, [])
  }
  if (typeof argsLike !== 'object' && typeof argsLike !== 'function') {
    throw new TypeError('argsLike 必须是数组或类数组对象')
  }

  // 读取一次 length，转成非负整数，上限为 2 ** 53 - 1。
  const length = Math.min(
    Math.max(Math.trunc(+argsLike.length) || 0, 0),
    Number.MAX_SAFE_INTEGER,
  )
  const args = []
  for (let index = 0; index < length; index += 1) {
    args.push(argsLike[index])
  }

  return Reflect.apply(fn, thisArg, args)
}

function sum(a, b) {
  return this.base + a + b
}

console.log(myApply(sum, Object.freeze({ base: 10 }), {
  0: 2,
  1: 3,
  length: 2,
})) // 15
```

按索引读取参数可以处理 `{ 0: 2, length: 1 }` 这样的类数组对象。直接写 `...argsLike` 则要求对象实现迭代协议。

## 四、手写 bind

用闭包保存目标函数、`thisArg` 和预设参数。返回的函数每次执行时，把预设参数放在本次参数前面，再用 `new.target` 区分普通调用和构造调用。

```js
function myBind(fn, thisArg, ...presetArgs) {
  if (typeof fn !== 'function') {
    throw new TypeError('fn 必须是函数')
  }

  return function bound(...laterArgs) {
    const args = [...presetArgs, ...laterArgs]

    if (new.target) {
      const target = new.target === bound ? fn : new.target
      return Reflect.construct(fn, args, target)
    }

    return Reflect.apply(fn, thisArg, args)
  }
}

function format(prefix, suffix) {
  return prefix + this.name + suffix
}

const greet = myBind(format, { name: '小林' }, '你好，')
console.log(greet('！')) // '你好，小林！'

class Reader {
  constructor(name, topic) {
    this.name = name
    this.topic = topic
  }
}

const notes = {}
const BoundReader = myBind(Reader, notes, '小林')
const reader = new BoundReader('JavaScript')

console.log(reader.name, reader.topic) // '小林' 'JavaScript'
console.log(reader instanceof Reader) // true
console.log(notes.name) // undefined
```

`Reflect.construct` 负责执行真正的构造调用，因此也适用于 `class`。直接执行 `new BoundReader(...)` 时，代码把目标函数作为 `newTarget`，实例因此使用目标构造函数的原型。普通包装函数和原生绑定函数的 `name`、`length`、`prototype` 和 `instanceof BoundReader` 等可观察行为仍有差异。

延伸阅读见 [ECMAScript 规范中的 Function.prototype 方法](https://tc39.es/ecma262/2026/multipage/fundamental-objects.html#sec-properties-of-the-function-prototype-object)。
