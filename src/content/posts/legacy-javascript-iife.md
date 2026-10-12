---
slug: "legacy-javascript-iife"
title: "JS匿名函数的自执行"
description: "JavaScript 匿名函数与立即执行函数的入门笔记。"
publishedAt: "2016-01-27T15:03:49+08:00"
category: "engineering"
tags: ["frontend"]
---

记录今天学习的关于JavaScript匿名函数自执行的相关问题。
我们知道JS预编译有个特点：JS在预编译阶段会解释函数声明，但是会忽略函数表达式，虽然我查阅的资料里面有说匿名函数的自执行和这个有关联，但我觉得多少有点钻牛角尖，故不在这里讨论这个问题，直接说匿名函数自执行的几种写法。

首先来看一个匿名函数表达式的形式（不能直接作为独立的函数声明运行，需要放在表达式上下文中）：

```javascript
function () {
    console.log("funlee");
}
```

## 自执行方法一：把函数和调用放在同一个括号里面

```javascript
(function () {
    console.log("funlee");
}()); //JSLint推荐写法，整体性好
```

## 自执行方法二：function 外面加括号，再调用

```javascript
(function () {
    console.log("funlee");
})();
```

## 自执行方法三：function 前面加运算符，常见的是 ! 和 void

```javascript
!function () {
    console.log("funlee");
}();

void function () {
    console.log("funlee");
}();
```

加号“+”和减号“-”运算符也可以。
