---
slug: "javascript-array-flattening"
title: "数据扁平化"
description: "围绕数组扁平化比较 flat、递归与逐层展开，说明稀疏数组、引用共享和深层嵌套的边界。"
publishedAt: "2021-04-13T13:03:00+08:00"
updatedAt: "2026-10-13T11:52:56+08:00"
category: "engineering"
tags: ["frontend"]
source: "yuque"
sourceId: "kgv3cb"
sourceTitle: "数据扁平化"
sourceUrl: "https://www.yuque.com/funlee/ez5odb/kgv3cb"
---

这里讨论的“数据扁平化”，是把嵌套数组按原有顺序展开成较少层级的数组。它不等于对象字段展开，也不负责去重或排序。

```javascript
const input = [1, [2, [3, 4]], 5];
// 完全展开后的结果：[1, 2, 3, 4, 5]
```

## 优先考虑原生 flat

`Array.prototype.flat` 接收展开深度，默认只展开一层：

```javascript
const input = [1, [2, [3, 4]], 5];
console.log(input.flat()); // [1, 2, [3, 4], 5]
console.log(input.flat(Infinity)); // [1, 2, 3, 4, 5]
```

它返回新数组，不会直接修改原数组。但这不是深拷贝，保留下来的对象仍是原来的引用：

```javascript
const item = { value: 1 };
const result = [[item]].flat();
console.log(result[0] === item); // true
```

`flat` 会跳过被遍历层级中的空槽，但保留显式写入的 `undefined`。`Infinity` 表示尽可能展开嵌套层级，不代表它能安全处理循环引用或无限深的输入。

## 用递归表达嵌套结构

递归的思路很直接：遇到数组继续展开，遇到其他值就加入结果。下面面向普通数组，跳过空槽，保留原始值与对象引用：

```javascript
function flatten(input) {
  const output = [];

  function visit(array) {
    for (let i = 0; i < array.length; i += 1) {
      if (!(i in array)) continue;
      const value = array[i];
      if (Array.isArray(value)) visit(value);
      else output.push(value);
    }
  }

  visit(input);
  return output;
}

console.log(flatten([1, [2, [3]], null, undefined]));
// [1, 2, 3, null, undefined]
```

一个结果数组贯穿整个遍历，避免每一层都创建并拼接大量中间数组。对于普通、无环的输入，访问次数与遍历到的数组元素数量成正比；递归调用栈的深度则取决于嵌套层数。

## reduce 与 concat 的写法

同样的逻辑也可以写得更紧凑：

```javascript
function flattenWithReduce(input) {
  return input.reduce((result, value) => {
    return result.concat(
      Array.isArray(value) ? flattenWithReduce(value) : [value],
    );
  }, []);
}
```

这个版本便于展示“把多个结果合并成一个结果”的思想，但每次 `concat` 都会创建新数组。在很长的数组中，反复复制已经积累的结果会增加成本。代码短不一定更快。

## 逐层展开的思路与限制

原笔记还记录了一种方法：只要仍有数组，就把当前层展开一次。

```javascript
function flattenByLevels(input) {
  let result = input;
  while (result.some(Array.isArray)) {
    result = [].concat(...result);
  }
  return result;
}
```

它适合用来理解“逐层消除嵌套”，但不适合作为通用替代：展开参数过多时可能触及引擎限制；每一轮都会重新扫描和复制；如果输入本来就没有嵌套，返回的还是原数组。对于稀疏数组，展开语法与 `concat` 的组合也不完全等同于 `flat` 的空槽处理。

## 避免过深递归：显式保存遍历位置

对于嵌套很深但有限、无环的普通数组，可以用显式栈保存每层的遍历位置：

```javascript
function flattenIterative(input) {
  const output = [];
  const stack = [{ array: input, index: 0 }];

  while (stack.length > 0) {
    const frame = stack[stack.length - 1];
    if (frame.index >= frame.array.length) {
      stack.pop();
      continue;
    }

    const index = frame.index++;
    if (!(index in frame.array)) continue;
    const value = frame.array[index];
    if (Array.isArray(value)) {
      stack.push({ array: value, index: 0 });
    } else {
      output.push(value);
    }
  }
  return output;
}
```

这避免了 JavaScript 函数调用栈不断增长，但仍需要内存保存遍历路径和最终结果。它也没有实现循环引用检测：例如数组包含自身时，应提前拒绝这类数据，或者为具体业务设计循环检测策略。

日常处理普通数组优先使用 `flat`；需要学习算法或者满足特定兼容要求时，再选择手写版本，并明确深度、空槽、引用和循环结构的处理约定。

参考：[MDN：Array.prototype.flat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flat)。
