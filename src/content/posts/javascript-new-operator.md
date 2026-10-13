---
slug: "javascript-new-operator"
title: "聊聊 JS 中的 new 操作符"
description: "通过构造过程与手写示例理解 new，辨析原型关联、返回值覆盖以及模拟实现的边界。"
publishedAt: "2021-04-17T09:56:00+08:00"
updatedAt: "2026-10-13T11:52:56+08:00"
category: "engineering"
tags: ["frontend"]
source: "yuque"
sourceId: "htpqeo"
sourceTitle: "聊聊 JS 中的 new 操作符"
sourceUrl: "https://www.yuque.com/funlee/ez5odb/htpqeo"
---

`new` 看起来只是一个关键字，却同时涉及对象创建、原型关联、函数调用和返回值处理。理解这些步骤，有助于把构造函数与原型链串起来。

## 一个普通构造函数的执行过程

```javascript
function Person(name) {
  this.name = name;
}

Person.prototype.sayHello = function () {
  return `你好，我是 ${this.name}`;
};

const person = new Person('小李');
console.log(person.name); // 小李
console.log(person.sayHello()); // 你好，我是 小李
console.log(Object.getPrototypeOf(person) === Person.prototype); // true
```

对于这样的普通构造函数，可以把 `new Person(...)` 理解为四个步骤：

1. 创建一个新的对象。
2. 将这个对象的内部原型关联到 `Person.prototype`；如果后者不是对象，则使用默认原型。
3. 以新对象作为 `this` 执行构造函数，并传入参数。
4. 根据构造函数的返回值，决定最终返回哪个对象。

实例上的 `name` 来自构造函数执行时的赋值；`sayHello` 则通过原型链找到，并没有为每个实例复制一份。

## 返回值为什么有时会覆盖实例

构造函数没有显式返回值，或者返回一个原始值时，`new` 返回新创建的实例。构造函数返回对象或函数时，则返回那个值：

```javascript
function ReturnsNull() {
  this.kind = 'instance';
  return null;
}

function ReturnsObject() {
  this.kind = 'instance';
  return { kind: 'replacement' };
}

function ReturnsFunction() {
  return function greeting() { return 'hello'; };
}

console.log(new ReturnsNull().kind); // instance
console.log(new ReturnsObject().kind); // replacement
console.log(typeof new ReturnsFunction()); // function
```

这里有两个容易漏掉的边界：`typeof null` 虽然是 `'object'`，但 `null` 仍是原始值；函数也属于可以覆盖返回结果的对象。因此，只判断 `typeof result === 'object'` 并不正确。

`result instanceof Object` 也不是可靠替代品：没有原型的对象，以及其他 realm（例如 iframe）创建的对象，都可能不满足这个判断。

## 手写一个用于理解的版本

下面的实现只面向可用 `apply` 调用的普通构造函数，用来展示主要步骤，不是对所有 `new` 语义的完整模拟：

```javascript
function myNew(Constructor, ...args) {
  const candidate = Constructor.prototype;
  const isObject = value =>
    value !== null &&
    (typeof value === 'object' || typeof value === 'function');

  const instance = Object.create(
    isObject(candidate) ? candidate : Object.prototype,
  );
  const result = Constructor.apply(instance, args);
  return isObject(result) ? result : instance;
}

const another = myNew(Person, '小王');
console.log(another.sayHello()); // 你好，我是 小王
console.log(another instanceof Person); // true
```

`Object.create` 在创建对象时就确定原型，比先创建 `{}` 再修改其原型更直接。上面的默认原型处理也只覆盖常见的同一 realm 场景。

## 为什么它不能替代真正的 new

普通调用与构造调用在语言层面不是同一件事：

- `class` 构造函数不能通过 `apply` 作为普通函数调用。
- 箭头函数不能被 `new`，这个简化实现却没有完整验证可构造性。
- 绑定函数的构造行为不是读取它的 `prototype` 后普通调用就能复现的。
- 构造函数内部的 `new.target`，在真正的构造调用与 `apply` 调用中不同。
- 某些内置对象还依赖内部槽位，不能只给一个普通对象补上原型。

如果实际需求是“接收一个构造函数和参数数组，并创建实例”，应使用语言提供的构造接口：

```javascript
class User {
  constructor(name) {
    this.name = name;
  }
}

function construct(Constructor, ...args) {
  return Reflect.construct(Constructor, args);
}

console.log(construct(User, '小李').name); // 小李
```

手写实现的意义在于理解对象与原型如何关联。遇到真正需要通用构造行为的代码，应让 `new` 或 `Reflect.construct` 负责完整语义。

参考：[MDN：new](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/new)、[MDN：Reflect.construct](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Reflect/construct)。
