# JavaScript 原型链：从属性查找理解对象、构造函数与 class

> 本文目标：理解对象读取属性时发生了什么，并把原型链、构造函数、`new`、`instanceof` 和 `class` 串成一个完整模型。

JavaScript 中的对象不必复制一份方法给每个实例。一个对象访问不到某个属性时，可以把查找工作委托给另一个对象；那个对象还可以继续委托。这个由对象连接起来的查找路径，就是**原型链（prototype chain）**。

原型链解释了许多常见现象：数组为什么能调用 `map`，实例为什么能调用构造函数原型上的方法，`class extends` 为什么能复用父类能力，以及 `instanceof` 到底在判断什么。

## 先用一个属性读取问题建立全局视角

```js
const animal = { eats: true }
const rabbit = Object.create(animal)

rabbit.name = 'Momo'

console.log(rabbit.name) // 'Momo'
console.log(rabbit.eats) // true
console.log(rabbit.sleep) // undefined
```

`rabbit.name` 是 `rabbit` 自己的属性，直接找到。`rabbit` 没有 `eats`，JavaScript 会继续到 `animal` 查找，因此得到 `true`。`sleep` 在两者上都不存在，继续向上到链条终点后返回 `undefined`。

可以把这段关系画成：

```text
rabbit ──[[Prototype]]──► animal ──[[Prototype]]──► Object.prototype ──► null
  │                         │
  └─ name: 'Momo'           └─ eats: true
```

理解原型链的核心只有一句话：**读取属性时，先查对象自身；没有就沿着原型链一层层向上查找，直到 `null`。**

## 一、属性查找：对象没有的属性到哪里去了

### 1. 自有属性与继承属性

直接定义在对象上的属性叫**自有属性（own property）**；从原型对象查到的属性通常叫**继承属性**。

```js
const animal = { eats: true }
const rabbit = Object.create(animal)
rabbit.name = 'Momo'

console.log(Object.hasOwn(rabbit, 'name')) // true
console.log(Object.hasOwn(rabbit, 'eats')) // false

console.log('name' in rabbit) // true
console.log('eats' in rabbit) // true
```

`Object.hasOwn(object, key)` 只检查自有属性；`key in object` 会检查自有属性**和整条原型链**。现代代码优先使用 `Object.hasOwn`，它也能安全处理没有原型的对象。

### 2. 属性查找的准确顺序

对 `rabbit.eats`，可以按下面的步骤推演：

```text
1. rabbit 自己有 eats 吗？没有。
2. rabbit 的原型 animal 有 eats 吗？有，返回 true。
3. 不再继续查找。
```

对 `rabbit.sleep`：

```text
1. rabbit 没有 sleep。
2. animal 没有 sleep。
3. Object.prototype 没有 sleep。
4. 原型为 null，查找结束，读取结果是 undefined。
```

这里的“向上”不是词法作用域链，也不是函数调用栈。作用域链用于查找变量名；原型链用于查找**对象属性**。两者都是链式查找，但解决的是不同问题。

### 3. 自有属性会遮蔽原型属性

如果对象自己后来拥有了同名属性，它会优先被读取：

```js
const animal = { sound: 'unknown' }
const rabbit = Object.create(animal)

console.log(rabbit.sound) // 'unknown'

rabbit.sound = 'sniff'
console.log(rabbit.sound) // 'sniff'
console.log(animal.sound) // 'unknown'
```

这叫**遮蔽（shadowing）**。写入 `rabbit.sound` 创建或修改的是 `rabbit` 的自有属性，并不会改掉原型 `animal` 上的 `sound`。读取时先找到 `rabbit.sound`，便不再访问原型属性。

::: tip 读取与写入的直觉
普通属性读取会沿原型链查找；普通赋值通常在接收对象自身创建或更新属性。访问器属性（getter/setter）和不可写属性会让写入规则更复杂，但“自有属性优先、读取向原型查找”仍是最重要的基础模型。
:::

## 二、原型与原型链：对象之间的委托关系

每个普通对象都有一个规范内部槽 `[[Prototype]]`，它保存对象的直接原型。`[[Prototype]]` 不是可以直接用点号访问的普通属性；推荐使用 `Object.getPrototypeOf()` 读取它。

```js
const animal = { eats: true }
const rabbit = Object.create(animal)

console.log(Object.getPrototypeOf(rabbit) === animal) // true
console.log(Object.getPrototypeOf(animal) === Object.prototype) // true
console.log(Object.getPrototypeOf(Object.prototype)) // null
```

原型链最终以 `null` 结束。因为有这个终点，属性查找不会无限循环。

### 1. `Object.create`：显式指定原型

`Object.create(proto)` 会创建一个新对象，并把它的 `[[Prototype]]` 设置为 `proto`：

```js
const vehicle = {
  move() {
    return 'moving'
  },
}

const bike = Object.create(vehicle)
bike.wheels = 2

console.log(bike.move()) // 'moving'
console.log(Object.getPrototypeOf(bike) === vehicle) // true
```

这个例子很直接地展示了原型的“委托”含义：`bike` 不需要复制 `move`，找不到时把请求交给 `vehicle`。

### 2. `Object.prototype` 是多数普通对象的链尾

对象字面量 `{}` 创建的对象通常以 `Object.prototype` 为原型，因此它们能访问 `toString`、`hasOwnProperty` 等方法：

```js
const note = { title: 'Prototype' }

console.log(Object.getPrototypeOf(note) === Object.prototype) // true
console.log(typeof note.toString) // 'function'
```

`toString` 不是 `note` 的自有属性，而是从 `Object.prototype` 继承而来。

### 3. 没有原型的字典对象

有时只想要纯粹的键值容器，不希望它继承任何默认属性。可以创建原型为 `null` 的对象：

```js
const dictionary = Object.create(null)
dictionary.title = 'notes'

console.log(Object.getPrototypeOf(dictionary)) // null
console.log(Object.hasOwn(dictionary, 'title')) // true
console.log('toString' in dictionary) // false
```

这类对象没有 `toString`，也没有 `hasOwnProperty` 方法，所以不要写 `dictionary.hasOwnProperty('title')`。`Object.hasOwn(dictionary, 'title')` 不依赖对象自身的方法，更稳妥。

### 4. 为什么不推荐使用 `__proto__`

你可能见过下面的写法：

```js
// rabbit.__proto__ === animal
```

`__proto__` 是历史兼容访问器，很多环境仍支持，但它并不是描述原型关系时的首选 API。读取原型使用 `Object.getPrototypeOf(object)`；创建对象时使用 `Object.create(proto)`；需要改原型时可使用 `Object.setPrototypeOf(object, proto)`，但后者可能破坏引擎优化，通常应在对象创建时就确定好原型。

## 三、构造函数与 new：共享方法为什么放在 prototype 上

当需要反复创建同一类对象时，手写 `Object.create` 不够方便。构造函数加上 `new` 提供了一种经典的创建方式。

```js
function User(name) {
  this.name = name
}

User.prototype.greet = function greet() {
  return `Hello, ${this.name}`
}

const ada = new User('Ada')
const grace = new User('Grace')

console.log(ada.greet()) // 'Hello, Ada'
console.log(grace.greet()) // 'Hello, Grace'
console.log(Object.getPrototypeOf(ada) === User.prototype) // true
```

### 1. `.prototype` 和 `[[Prototype]]` 不是同一件事

这是初学原型链最容易混淆的地方。

- `ada` 是一个对象，它有内部槽 `[[Prototype]]`；`Object.getPrototypeOf(ada)` 可以读取它。
- `User` 是一个函数对象，它有一个普通属性 `.prototype`，这个属性的值是一个对象。
- `new User()` 会把新实例的 `[[Prototype]]` 连接到**当前的** `User.prototype`。

关系如下：

```text
ada ──[[Prototype]]──► User.prototype ──[[Prototype]]──► Object.prototype ──► null
                               │
                               └─ greet: function

User（函数对象）
  ├─ prototype: 指向上面的 User.prototype 对象
  └─ [[Prototype]]: 通常指向 Function.prototype
```

注意：`User.prototype` 并不是 `User` 本身的原型；`User` 的原型通常是 `Function.prototype`。名字相似，但角色不同。

### 2. `new` 做了哪些事

`new User('Ada')` 可以近似理解为以下步骤：

```js
function simulateNew(Constructor, ...args) {
  const instance = Object.create(Constructor.prototype)
  const result = Constructor.apply(instance, args)

  return result !== null &&
    (typeof result === 'object' || typeof result === 'function')
    ? result
    : instance
}
```

也就是：

1. 创建一个新对象。
2. 把新对象的 `[[Prototype]]` 设为构造函数当前的 `.prototype`。
3. 以新对象作为 `this` 调用构造函数。
4. 如果构造函数显式返回一个对象或函数，则返回它；否则返回这个新对象。


### 3. 为什么方法放在 `.prototype` 上

如果把方法写进构造函数，每创建一次实例都会创建一个新函数：

```js
function InefficientUser(name) {
  this.name = name
  this.greet = function greet() {
    return `Hello, ${this.name}`
  }
}
```

而放到 `User.prototype` 上时，所有实例通过原型链共享同一个 `greet` 函数：

```js
console.log(ada.greet === grace.greet) // true
console.log(Object.hasOwn(ada, 'greet')) // false
console.log(Object.hasOwn(User.prototype, 'greet')) // true
```

共享方法可以减少重复创建，也表达了“这是所有 User 的共同能力”。每个实例独有的数据（例如 `name`）则适合在构造函数内作为自有属性赋值。

### 4. `constructor` 只是普通属性

默认的原型对象通常有一个 `constructor` 属性指回构造函数：

```js
console.log(ada.constructor === User) // true
```

但不要把它当作可靠的类型判断工具。它可以被覆盖，也可能在整体替换 `.prototype` 时丢失：

```js
function Book(title) {
  this.title = title
}

Book.prototype = {
  describe() {
    return this.title
  },
}

const book = new Book('JavaScript')
console.log(book.constructor === Book) // false
```

因为新赋的对象从 `Object.prototype` 继承了 `constructor`，而不是自动带上 `Book`。如果确实需要该属性，可以显式用 `Object.defineProperty` 修复；更多时候，直接依赖实际行为或更合适的类型检查 API 更清晰。

### 5. `instanceof` 到底判断什么

```js
console.log(ada instanceof User) // true
console.log(User.prototype.isPrototypeOf(ada)) // true
console.log(ada instanceof Object) // true
```

默认情况下，`object instanceof Constructor` 会检查 `Constructor.prototype` 是否出现在 `object` 的原型链中。因此上面两种判断的核心等价：`User.prototype` 确实在 `ada` 的链上。

`instanceof` 适合检查某个构造函数/类的实例关系，但也有边界：对象若来自另一个 window 或 iframe，它的内置构造函数不是当前全局环境中的那个，`instanceof Array` 等判断可能得到意外结果。数组优先用 `Array.isArray()`；跨环境的特定对象则应选用适合该对象的品牌检查或 API。

## 四、class、extends 与 super：现代语法如何使用原型

ES2015 引入的 `class` 让创建实例和继承的语法更清晰，但它并没有抛弃原型链。

```js
class Animal {
  constructor(name) {
    this.name = name
  }

  speak() {
    return `${this.name} makes a sound`
  }
}

const cat = new Animal('Mimi')

console.log(cat.speak()) // 'Mimi makes a sound'
console.log(Object.getPrototypeOf(cat) === Animal.prototype) // true
console.log(Object.hasOwn(cat, 'speak')) // false
console.log(Object.hasOwn(Animal.prototype, 'speak')) // true
```

类体中定义的实例方法（例如 `speak`）存在于 `Animal.prototype`，而不是复制到每个实例上；实例字段 `name` 则在构造过程中写入每个实例。也就是说，`class` 语法同样在利用原型链共享行为。

### 1. `class` 不等于“把构造函数换个写法”

从原型关系看，类和构造函数密切相关：

```js
console.log(typeof Animal) // 'function'
console.log(Animal.prototype.constructor === Animal) // true
```

但类有自己的语义规则，不能简单认为“完全等同”：

- 类声明处于暂时性死区，不能在声明前用 `new` 调用。
- 类体中的代码自动以严格模式执行。
- 类构造函数不能不带 `new` 调用；普通构造函数是否强制使用 `new` 取决于其自身实现。
- 类方法不可枚举，而手动 `User.prototype.greet = ...` 创建的属性默认可枚举。

因此，理解 `class` 的原型基础很重要，但仍应使用它的正式语义来编写和阅读代码。

### 2. `extends` 建立了两层继承关系

```js
class Dog extends Animal {
  speak() {
    return `${super.speak()}: woof`
  }
}

const dog = new Dog('Bolt')

console.log(dog.speak()) // 'Bolt makes a sound: woof'
console.log(dog instanceof Dog) // true
console.log(dog instanceof Animal) // true
```

`extends` 让 `Dog.prototype` 的原型成为 `Animal.prototype`，因此查找 `dog.speak` 时先在 `Dog.prototype` 找到覆盖后的方法；其中 `super.speak()` 会从父类原型上调用 `Animal.prototype.speak`。

实例方法的链条是：

```text
dog ──► Dog.prototype ──► Animal.prototype ──► Object.prototype ──► null
```

类构造函数自身也需要继承静态方法，因此还有一条不同的链：

```text
Dog（类/函数对象） ──► Animal（类/函数对象） ──► Function.prototype ──► Object.prototype ──► null
```

这两条链解释了为什么 `Dog` 可以继承 `Animal` 的静态能力，而 `dog` 可以继承 `Animal.prototype` 的实例方法。

### 3. 派生类构造函数中的 `super()`

若子类定义自己的构造函数，必须在使用 `this` 前调用 `super()`：

```js
class Dog extends Animal {
  constructor(name, breed) {
    super(name)
    this.breed = breed
  }
}

const dog = new Dog('Bolt', 'Shepherd')
console.log(dog.name) // 'Bolt'
console.log(dog.breed) // 'Shepherd'
```

`super(name)` 会调用父类构造函数来完成父类部分的初始化。派生类在此之前还没有可用的 `this`，所以先访问 `this` 会抛出错误。

## 五、常见误区与实践建议

### 1. 不要修改内置原型

```js
// 不推荐
// Array.prototype.last = function () {
//   return this[this.length - 1]
// }
```

给 `Array.prototype`、`Object.prototype` 等内置原型添加业务方法，会影响运行环境内所有对象，可能与框架、第三方库或未来标准冲突，还可能干扰 `for...in` 等枚举行为。需要工具函数时，使用普通函数、模块导出或专用类更安全。

### 2. 避免过深的继承层级

原型继承适合表达稳定的“是一种（is-a）”关系，但多层继承会让方法来源和覆盖关系难以追踪。需要组合多种能力时，往往更适合把能力作为对象或函数组合进去：

```js
function withTimestamp(log) {
  return message => log(`[${new Date().toISOString()}] ${message}`)
}
```

组合通常比复杂继承更容易测试和替换。

### 3. `for...in` 会遍历可枚举的继承属性

```js
const base = { inherited: true }
const child = Object.create(base)
child.own = true

for (const key in child) {
  console.log(key)
}
// own
// inherited
```

`for...in` 会遍历可枚举自有属性和可枚举继承属性。若只需要对象自身的可枚举键，使用 `Object.keys(child)`；若必须用 `for...in`，搭配 `Object.hasOwn(child, key)` 过滤。

### 4. 原型链不是深拷贝或私有化工具

原型对象上的可变属性会被多个实例共享：

```js
function TeamMember(name) {
  this.name = name
}

TeamMember.prototype.tags = []

const a = new TeamMember('Ada')
const b = new TeamMember('Grace')
a.tags.push('javascript')

console.log(b.tags) // ['javascript']
```

因为两个实例最终访问的是同一个 `TeamMember.prototype.tags` 数组。每个实例独有的可变数据应在构造函数或类字段初始化时创建：

```js
class SafeTeamMember {
  constructor(name) {
    this.name = name
    this.tags = []
  }
}
```

## 六、速查表与练习

### 速查表

| 概念 | 含义 | 推荐 API / 判断 |
| --- | --- | --- |
| `[[Prototype]]` | 一个对象的直接原型内部链接 | `Object.getPrototypeOf(object)` |
| `.prototype` | 函数/类用于连接 `new` 实例的原型对象 | `Constructor.prototype` |
| 自有属性 | 直接定义在对象上的属性 | `Object.hasOwn(object, key)` |
| 原型链 | 属性查找时逐级委托的对象链 | `Object.getPrototypeOf` 逐层观察 |
| 实例关系 | 构造函数原型是否位于对象原型链中 | `object instanceof Constructor` |
| 无原型对象 | 原型为 `null` 的对象 | `Object.create(null)` |

### 练习 1：属性来自哪里？

```js
const base = { level: 1 }
const child = Object.create(base)
child.name = 'child'

console.log(Object.hasOwn(child, 'level'))
console.log('level' in child)
console.log(child.level)
```

输出依次为 `false`、`true`、`1`。`level` 不是 `child` 的自有属性，但存在于它的原型链上，因此能被 `in` 与属性读取找到。

### 练习 2：实例属性会影响原型吗？

```js
function Counter() {}
Counter.prototype.value = 0

const first = new Counter()
const second = new Counter()

first.value = 1

console.log(first.value)
console.log(second.value)
console.log(Counter.prototype.value)
```

输出依次为 `1`、`0`、`0`。给 `first.value` 赋值创建了同名自有属性，遮蔽原型上的 `value`，没有改动原型或 `second`。

### 练习 3：`instanceof` 判断的是什么？

```js
class Parent {}
class Child extends Parent {}

const value = new Child()

console.log(value instanceof Child)
console.log(value instanceof Parent)
console.log(Parent.prototype.isPrototypeOf(value))
```

三个结果都是 `true`。`Child.prototype` 和 `Parent.prototype` 都在 `value` 的原型链上。

## 小结

原型链是 JavaScript 对象复用行为的基础：读属性先看自身，再沿 `[[Prototype]]` 委托给原型对象，直到 `null`。构造函数的 `.prototype` 是 `new` 实例会连接到的原型对象；`instanceof` 正是检查这种连接是否存在。`class`、`extends` 与 `super` 让这种机制更易书写，但其共享实例方法和继承关系仍建立在原型链之上。掌握“属性从哪里查找”这条主线，就能更从容地阅读对象、类和继承相关代码。
