---
slug: "javascript-event-loop"
title: "Event Loop"
description: "从调用栈、任务与微任务理解浏览器事件循环，并区分渲染时机、async/await 和 Node.js 的调度边界。"
publishedAt: "2021-04-13T00:43:00+08:00"
updatedAt: "2026-10-13T11:52:56+08:00"
category: "engineering"
tags: ["frontend"]
source: "yuque"
sourceId: "qeqg4i"
sourceTitle: "Event Loop"
sourceUrl: "https://www.yuque.com/funlee/ez5odb/qeqg4i"
---

JavaScript 可以同时等待多个请求、处理定时器和响应用户操作，但这不意味着这些回调同时在主线程执行。理解 Event Loop，需要把“等待工作完成”和“执行 JavaScript 回调”分开。

## 单线程究竟指什么

通常说 JavaScript 是单线程，指的是一个执行代理中的 JavaScript 任务依次执行。浏览器本身还包含网络、渲染等机制，也可以通过 Worker 运行其他线程中的 JavaScript，不能把“主线程执行脚本”理解为整个浏览器只有一个线程。

同步代码进入调用栈后，会持续执行，直到返回或抛出异常。网络请求的等待、计时等工作由宿主环境协调；条件满足后，相关回调才有机会被安排执行。

因此，`setTimeout(fn, 100)` 表示达到计时条件后安排任务，不保证 `fn` 恰好在 100 毫秒时运行。主线程繁忙、后台页面限制等因素都可能让它更晚执行。

## 任务与微任务

浏览器规范使用 task（任务）和 microtask（微任务）。日常所说的“宏任务”通常就是 task，但不要据此想象浏览器只有一条全局先进先出的任务队列：不同任务来源有各自的调度约束。

| 类型 | 常见来源 | 需要注意 |
| --- | --- | --- |
| 任务 | 定时器回调、用户交互事件、消息事件等 | 回调何时可以执行由宿主环境决定 |
| 微任务 | Promise 的反应回调、`queueMicrotask`、MutationObserver 通知 | 在微任务检查点执行，期间新增微任务也会继续被处理 |

对于常见的页面执行过程，可以用下面的顺序帮助理解：执行一个任务，在相关检查点清空微任务，然后浏览器根据渲染机会等条件处理后续工作。渲染不是每完成一个任务就必然发生，也不是任何两条 JavaScript 语句之间都可以插入。

## 看一段完整的执行顺序

下面的代码作为独立脚本执行：

```javascript
console.log('script start');

setTimeout(() => console.log('timer'), 0);

Promise.resolve().then(() => {
  console.log('promise');
  queueMicrotask(() => console.log('nested microtask'));
});

queueMicrotask(() => console.log('microtask'));

console.log('script end');
```

输出顺序为：

```text
script start
script end
promise
microtask
nested microtask
timer
```

先完成同步脚本，再处理已经排入的微任务。Promise 回调执行时又加入一个微任务，它会排在已有的 `microtask` 后面，但仍在进入定时器任务之前处理。

还要区分 Promise 的执行器和反应回调：

```javascript
new Promise(resolve => {
  console.log('executor'); // 创建 Promise 时同步执行
  resolve();
}).then(() => console.log('then')); // 通过微任务执行

console.log('after');
// executor → after → then
```

## async/await 在哪里暂停

调用 `async` 函数会返回 Promise，但函数体并不是一开始就全部异步执行。它会先同步运行到第一个 `await`，之后的继续执行通过 Promise 相关机制安排。

```javascript
async function run() {
  console.log('A');
  await 1;
  console.log('B');
}

console.log('start');
run();
console.log('end');
// start → A → end → B
```

即使等待的是普通值，`await` 后面的语句也不会直接接在当前同步栈中执行。如果在 `await` 前做了一大段计算，这段计算依然会阻塞当前线程；把函数标成 `async` 不会自动把计算交给后台线程。

## 微任务也可能让页面无法响应

“微任务优先”并不意味着应该把所有工作放进微任务。微任务检查点会继续处理新加入的微任务；如果不断递归排入微任务，其他任务和渲染可能迟迟得不到机会。

需要把大量工作分块执行时，应根据场景让出主线程，或者把适合的计算交给 Worker。仅仅反复 `await Promise.resolve()`，通常不能达到给浏览器渲染留出机会的目的。

## Node.js 不宜直接套用浏览器顺序

Node.js 同样有事件循环，但还涉及 timers、poll、check 等阶段。`setImmediate` 与 `process.nextTick` 也不是浏览器标准 API。

`process.nextTick` 有自己的队列，不能简单归为“普通 Promise 微任务”。它与 Promise 回调的相对顺序还涉及执行上下文，例如 CommonJS 脚本和 ES Module 顶层执行就存在差异。

`setTimeout(fn, 0)` 和 `setImmediate(fn)` 谁先执行，也不能脱离调用位置直接下结论；Node.js 版本与所处阶段都可能影响观察结果。面试题或调试日志应明确运行环境，再分析当前栈、各队列以及宿主调度。

参考：[HTML 标准：事件循环](https://html.spec.whatwg.org/multipage/webappapis.html#event-loops)、[Node.js：事件循环、定时器与 nextTick](https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick)。
