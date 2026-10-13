---
slug: "understanding-object-oriented-programming"
title: "理解面向对象编程"
description: "从封装、继承和多态出发，理解面向对象如何组织职责，以及组合与 SOLID 原则的实际用途。"
publishedAt: "2021-03-13T09:52:00+08:00"
updatedAt: "2026-10-13T11:52:56+08:00"
category: "engineering"
tags: ["frontend"]
source: "yuque"
sourceId: "ha14ey"
sourceTitle: "理解面向对象编程"
sourceUrl: "https://www.yuque.com/funlee/ez5odb/ha14ey"
---

面向对象编程（Object-Oriented Programming，OOP）是一种组织程序的方式：把相关的状态和行为放在一起，通过对象之间的协作完成任务。它的价值不在于把所有函数都包进类，而在于让职责、约束和变化的位置更清晰。

## 从执行步骤到职责分工

以处理订单为例，面向过程的写法往往从执行顺序展开：检查商品、计算金额、扣减库存、发起支付。面向对象的写法则会进一步考虑，这些工作分别由谁负责，哪些数据只能通过特定操作修改。

两种方式可以共存。订单对象的一个方法内部，仍然要按步骤执行代码；一个主要由函数组成的程序，也可以拥有清晰的模块边界。项目是否易维护，取决于职责划分、依赖关系和实现质量，不能仅凭是否使用了 `class` 判断。性能也需要结合算法、数据结构和运行环境分析，不能简单断言某一种范式更快。

## 封装：让状态通过明确的规则变化

封装不仅是把数据和方法写在一起，更重要的是隐藏不需要暴露的细节，并通过接口维护约束。例如，账户余额不能由调用者随意改成负数：

```javascript
class Account {
  #balance = 0;

  get balance() {
    return this.#balance;
  }

  deposit(amount) {
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new RangeError('存入金额必须是正数');
    }
    this.#balance += amount;
  }

  withdraw(amount) {
    if (!Number.isFinite(amount) || amount <= 0 || amount > this.#balance) {
      throw new RangeError('取出金额无效或余额不足');
    }
    this.#balance -= amount;
  }
}

const account = new Account();
account.deposit(100);
account.withdraw(30);
console.log(account.balance); // 70
```

这里使用 JavaScript 私有字段表达封装。调用者关心存取操作和余额，不需要知道内部如何保存数据。示例仅讨论职责与约束；真实金额计算还需处理精度、币种和交易一致性。

## 继承与组合：两种不同的复用方式

继承让子类复用并扩展父类的行为，适合存在稳定“是一种”关系的场景。判断是否适合继承，不能只看两个类有没有相同的代码，还要看子类能否满足父类对外承诺的行为。

例如，如果父类承诺某个方法始终可用，而子类只能在调用时抛出“不支持”错误，那么这个继承关系就值得重新考虑。

组合则是让对象持有其他对象，并委托它们完成一部分工作。它表达的是“拥有或使用某种能力”，不是继承的一种实现形式。对于经常变化的能力，组合往往更方便替换：

```javascript
class Checkout {
  constructor(payment) {
    this.payment = payment;
  }

  pay(amount) {
    return this.payment.pay(amount);
  }
}

const cardPayment = {
  pay(amount) {
    return `银行卡支付 ${amount} 元`;
  },
};

const balancePayment = {
  pay(amount) {
    return `余额支付 ${amount} 元`;
  },
};

console.log(new Checkout(cardPayment).pay(100));
console.log(new Checkout(balancePayment).pay(100));
```

支付方式发生变化时，结算流程不必跟着堆叠条件分支。当然，真实支付过程还需要异步结果、失败处理等约定；这里刻意保留最小接口，用来展示对象之间的关系。

## 多态：同一种调用，不同的行为

上面的两个支付对象都提供 `pay` 方法，结算对象通过同一个接口调用它们，却可以得到不同的行为，这就是多态的一种表现。

在 JavaScript 中，不一定要先声明共同父类才能实现这种协作。只要对象满足调用者需要的接口，就可以被使用。这通常被称为鸭子类型。

需要把它和其他语言中的方法重载区分开：JavaScript 不会根据参数类型自动选择多个同名方法。重复定义同名方法，后面的定义通常会覆盖前面的定义。可选参数、参数判断，以及 TypeScript 的重载签名，都不等于运行时自动按签名分派实现。

## 把 SOLID 当作检查设计的角度

这些原则不是要求每个小项目都先搭建一套抽象体系，而是帮助我们发现耦合和职责混乱。

| 原则 | 关注的问题 | 在前端中的例子 |
| --- | --- | --- |
| 单一职责（SRP） | 一个模块是否承担了不同原因引起的变化？ | 不让一个组件同时负责页面展示、请求协议转换和复杂计费规则 |
| 开闭原则（OCP） | 新需求能否通过扩展处理，减少修改稳定逻辑？ | 用可替换的校验规则扩展表单能力 |
| 里氏替换（LSP） | 替换实现后，是否仍满足原来的行为约定？ | 替换存储实现后，不能悄悄改变错误处理与返回值语义 |
| 依赖倒置（DIP） | 业务是否被某个具体工具绑住？ | 业务依赖约定好的存储接口，由外部传入具体实现 |
| 接口隔离（ISP） | 调用者是否被迫依赖自己不用的能力？ | 只读页面依赖读取接口，无须了解完整的管理接口 |

“单一职责”并不是一个类只能有一个方法，“面向接口”也不意味着必须使用某种语言关键字。核心是缩小变化的影响范围，并让协作双方的约定足够明确。

## 什么时候值得使用面向对象

当业务中存在有生命周期的状态、需要维护的不变量，或者多种可替换的行为时，对象通常能帮助表达这些关系。对于简单的数据转换和无状态计算，直接使用函数可能更自然。

先把问题和职责说清楚，再选择合适的表达方式。抽象应当减少理解成本，而不是让一次简单修改必须穿过层层继承。

参考：[MDN：使用类](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_classes)。
