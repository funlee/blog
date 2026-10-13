---
slug: "javascript-prototype-chain"
title: "解释一下原型链"
description: "区分对象的内部原型与构造函数的 prototype，理解属性查找、遮蔽以及 class 背后的原型关系。"
publishedAt: "2021-03-20T11:01:00+08:00"
updatedAt: "2026-10-13T11:52:56+08:00"
category: "engineering"
tags: ["frontend"]
source: "yuque"
sourceId: "erqcqx"
sourceTitle: "解释一下原型链"
sourceUrl: "https://www.yuque.com/funlee/ez5odb/erqcqx"
---

JavaScript 对象不仅可以拥有自己的属性，还可以沿着原型关系访问其他对象的属性。这条连接关系，就是原型链。

## 先区分两个容易混淆的概念

普通对象有一个内部的 `[[Prototype]]`，其值是另一个对象或者 `null`。它决定属性查找时下一步去哪里。

构造函数上的 `prototype` 则是一个普通属性。对于常见的构造函数，使用 `new` 创建实例时，实例的内部原型会指向这个属性所引用的对象。

```javascript
function Person(name) {
  this.name = name;
}

Person.prototype.sayHello = function () {
  return `你好，${this.name}`;
};

const person = new Person('小李');
console.log(Object.getPrototypeOf(person) === Person.prototype); // true
console.log(person.sayHello()); // 你好，小李
```

并不是每个对象都有自己的 `prototype` 属性，也不是每种函数都有可用于构造的 `prototype`。例如箭头函数不能用作构造函数。

## 一张图串起关系

![Person 构造函数、实例与 Object.prototype 之间的原型关系](/images/posts/javascript-prototype-chain/prototype-chain.png)

图中用 `__proto__` 表示对象之间的原型关联。它是历史遗留的访问器，不是一个需要手动维护的“私有字段”。在代码中读取原型，应优先使用 `Object.getPrototypeOf`。

对于上面的实例，关系可以写成：

```text
person → Person.prototype → Object.prototype → null
```

`Person.prototype` 默认拥有一个指回 `Person` 的 `constructor` 属性，但这个属性可以被修改，不应把它当作可靠的类型鉴定机制。

## 属性是怎样被找到的

访问 `person.sayHello` 时，JavaScript 先检查 `person` 自己有没有这个属性。没有就去 `Person.prototype`，再没有就继续向上，直到找到属性或者到达 `null`。

```javascript
console.log(Object.hasOwn(person, 'name')); // true
console.log(Object.hasOwn(person, 'sayHello')); // false
console.log('sayHello' in person); // true
```

`Object.hasOwn` 只检查自有属性，`in` 会检查整条原型链。`Object.hasOwn` 是原笔记之后加入的现代 API；旧环境可使用 `Object.prototype.hasOwnProperty.call(person, 'name')`。

如果实例具有同名属性，会优先使用实例自身的属性，这叫属性遮蔽。下面以普通数据属性为例：

```javascript
Person.prototype.role = 'reader';
person.role = 'editor';
console.log(person.role); // editor

delete person.role;
console.log(person.role); // reader
```

删除实例属性并没有删除原型上的属性。也要注意，赋值不一定总会创建自有属性：继承的 setter、不可写属性等都会影响具体行为。

## 原型上的引用值是共享的

把方法放在原型上，通常是为了共享行为。但如果把可变数组也放在原型上，不同实例会访问同一份数据：

```javascript
function Team() {}
Team.prototype.members = [];

const a = new Team();
const b = new Team();
a.members.push('小李');
console.log(b.members); // ['小李']
```

如果每个实例应拥有独立成员列表，就应该在构造函数内写 `this.members = []`。是否共享需要由数据语义决定。

## Object.create 与 class

`Object.create(proto)` 可以直接创建具有指定原型的对象：

```javascript
const methods = {
  greet() { return `你好，${this.name}`; },
};
const user = Object.create(methods);
user.name = '小王';
console.log(user.greet());

const dictionary = Object.create(null);
console.log(Object.getPrototypeOf(dictionary)); // null
console.log(dictionary.toString); // undefined
```

无原型对象不会继承 `Object.prototype` 的方法。这也说明不能假设任意对象都能直接调用 `hasOwnProperty` 或 `toString`。

`class` 提供了更清晰的类语法，但实例的方法共享仍然建立在原型机制上：

```javascript
class Animal {
  speak() { return '声音'; }
}
class Cat extends Animal {
  speak() { return '喵'; }
}

const cat = new Cat();
console.log(Object.getPrototypeOf(cat) === Cat.prototype); // true
console.log(Object.getPrototypeOf(Cat.prototype) === Animal.prototype); // true
console.log(cat.speak()); // 喵
```

理解原型链后，通常不需要频繁修改已有对象的原型，更不应该随意修改内置原型。尽量在创建对象时确定关系，让后续属性查找和代码行为保持可预测。

参考：[原笔记参考：JavaScript 深入之从原型到原型链](https://github.com/mqyqingfeng/Blog/issues/2)、[MDN：继承与原型链](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Inheritance_and_the_prototype_chain)。
