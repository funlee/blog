---
slug: "javascript-call-apply-bind"
title: "详解call、apply、bind"
description: "理解 call、apply 和 bind 对 this 与参数的处理，并厘清严格模式、箭头函数和构造调用的边界。"
publishedAt: "2021-04-18T23:18:00+08:00"
updatedAt: "2026-10-13T11:52:56+08:00"
category: "engineering"
tags: ["frontend"]
source: "yuque"
sourceId: "wvecv2"
sourceTitle: "详解call、apply、bind"
sourceUrl: "https://www.yuque.com/funlee/ez5odb/wvecv2"
---

调用同一个函数时，`this` 可能因为调用方式而变化。`call`、`apply` 和 `bind` 都能参与决定普通函数的 `this`，但它们在执行时机和参数组织上并不相同。

## 先看三个方法的区别

| 方法 | 何时执行目标函数 | 参数形式 | 结果 |
| --- | --- | --- | --- |
| `fn.call(thisArg, a, b)` | 立即执行 | 逐个传入 | 目标函数返回值 |
| `fn.apply(thisArg, args)` | 立即执行 | 数组或类数组 | 目标函数返回值 |
| `fn.bind(thisArg, a)` | 调用返回的函数时 | 可以预先绑定部分参数 | 一个新的绑定函数 |

```javascript
function describe(prefix, suffix) {
  return `${prefix}${this.name}${suffix}`;
}

const user = { name: '小李' };
console.log(describe.call(user, '你好，', '！'));
console.log(describe.apply(user, ['你好，', '！']));

const greet = describe.bind(user, '你好，');
console.log(greet('！')); // 三次结果都是：你好，小李！
```

这三个方法不会永久改写原函数，`bind` 创建的是另一个函数。调用它时，新传入的参数接在预先绑定的参数后面。

## thisArg 并不总是原样成为 this

对于严格模式中的普通函数，传入什么，`this` 就是什么，包括 `null`、`undefined` 和原始值。

```javascript
function strictThis() {
  'use strict';
  return this;
}

console.log(strictThis.call(null)); // null
console.log(strictThis.call(1)); // 1
```

非严格模式的普通函数则会把 `null`、`undefined` 替换为全局对象，并对其他原始值进行装箱。因此，“不传 this 就等于 window”只适用于特定浏览器脚本环境，不能当成通用规则。ES Module 和类中的代码默认是严格模式。

箭头函数又是另一种情况：它从词法作用域捕获 `this`，`call`、`apply` 或 `bind` 都不能重新指定它的 `this`。

```javascript
const counter = {
  value: 10,
  createReader() {
    return () => this.value;
  },
};

const read = counter.createReader();
console.log(read.call({ value: 99 })); // 10
```

## apply 接收的是类数组，不是任意可迭代对象

数组和拥有 `length`、数字索引的对象，都可以作为 `apply` 的参数列表。展开语法则要求对象可迭代：

```javascript
function sum(a, b) { return a + b; }

console.log(sum.apply(null, { 0: 2, 1: 3, length: 2 })); // 5
console.log(sum(...new Set([2, 3]))); // 5
```

因此，二者看起来相近，接受的数据却不完全相同。对非常大的数组，无论 `apply` 还是展开为函数参数，都可能遇到参数数量限制；此时用循环或归约更合适。

## 借用方法时，要满足方法对接收者的要求

常见的例子是把类数组转换为数组：

```javascript
const list = { 0: 'a', 1: 'b', length: 2 };
console.log(Array.prototype.slice.call(list)); // ['a', 'b']
console.log(Array.from(list)); // 现代代码通常更直观
```

并不是所有方法都能借给任意对象。某些内置方法要求接收者具有特定内部状态，仅仅伪造属性或者修改原型，仍然可能抛出错误。

旧式构造函数中也常见“借用父构造函数”：

```javascript
function Person(name) {
  this.name = name;
}

function Student(name, school) {
  Person.call(this, name);
  this.school = school;
}

const student = new Student('小李', '示例学校');
```

这只是复用实例初始化逻辑，不会自动建立 `Student.prototype` 与 `Person.prototype` 的继承关系。如果父类是 `class`，则不能这样普通调用，应使用 `extends` 和 `super`。

## bind 的两个边界

绑定函数再次使用 `call` 或 `bind` 时，不会覆盖最初绑定的 `this`：

```javascript
function readName() { return this.name; }
const bound = readName.bind({ name: 'A' });
console.log(bound.call({ name: 'B' })); // A
```

如果目标函数可以被构造，那么对绑定函数使用 `new` 时，绑定的 `this` 会被忽略，预先绑定的参数仍然生效：

```javascript
function User(name) { this.name = name; }
const BoundUser = User.bind({ name: '不会使用这个对象' }, '小李');
const instance = new BoundUser();
console.log(instance.name); // 小李
console.log(instance instanceof User); // true
```

绑定箭头函数不会让箭头函数获得构造能力。

## 事件监听要保留绑定后的引用

每次调用 `bind` 都会产生新的函数。如果注册与移除监听时各调用一次 `bind`，两次得到的引用不同，就无法正确移除原来的监听。

```javascript
const controller = {
  handleClick() { console.log('clicked'); },
};
const handler = controller.handleClick.bind(controller);
// button 是页面中已取得的按钮元素
// button.addEventListener('click', handler);
// 清理时：button.removeEventListener('click', handler);
```

需要立即调用时，根据参数形态选择 `call` 或 `apply`；需要稍后执行并固定上下文或部分参数时，使用 `bind`。遇到 `this` 不符合预期，先检查函数种类、严格模式和调用方式。

参考：[MDN：call](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/call)、[MDN：bind](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind)。
