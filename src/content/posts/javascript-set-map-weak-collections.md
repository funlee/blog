---
slug: "javascript-set-map-weak-collections"
title: "Set、Map、WeakSet、WeakMap 的区别"
description: "比较四种集合的键值规则、遍历能力与垃圾回收语义，理解去重、对象索引和弱引用的适用场景。"
publishedAt: "2021-04-12T23:08:00+08:00"
updatedAt: "2026-10-13T11:52:56+08:00"
category: "engineering"
tags: ["frontend"]
source: "yuque"
sourceId: "zggr7h"
sourceTitle: "Set、Map、WeakSet、WeakMap 的区别"
sourceUrl: "https://www.yuque.com/funlee/ez5odb/zggr7h"
---

这四种集合经常一起出现，可以先沿着两个维度理解：保存的是单个值还是键值对，以及是否需要让对象在没有其他引用时仍被集合保留。

## 先看整体区别

| 集合 | 保存内容 | 可使用的值或键 | 能否遍历 | 是否有 size |
| --- | --- | --- | --- | --- |
| Set | 不重复的值 | 任意 JavaScript 值 | 可以 | 有 |
| Map | 键值对 | 键和值都可以是任意 JavaScript 值 | 可以 | 有 |
| WeakSet | 弱引用成员 | 对象，以及现代规范支持的非注册 Symbol | 不可以 | 没有 |
| WeakMap | 弱引用键对应的键值对 | 键为对象或非注册 Symbol，值不限 | 不可以 | 没有 |

原笔记写于 2021 年，当时通常将弱集合的成员或键描述为“只能是对象”。现代规范已加入非注册 Symbol；使用时仍需确认目标运行环境支持。`Symbol.for()` 创建的注册 Symbol 不在允许范围内，`null` 也不可以。

## Set：根据值或身份去重

```javascript
const values = new Set([1, 2, 2, NaN, NaN, 0, -0]);
console.log([...values]); // [1, 2, NaN, 0]

values.add(3);
console.log(values.has(2)); // true
values.delete(1);
console.log(values.size); // 4
```

Set 使用 SameValueZero 判断相等：`NaN` 与自身被视为相等，`+0` 与 `-0` 被视为相等；对象则根据身份比较，而不是递归比较内容。

```javascript
const a = { id: 1 };
const b = { id: 1 };
console.log(new Set([a, a, b]).size); // 2
```

所以，`[...new Set(list)]` 很适合对原始值数组去重，但不能直接实现“根据对象的 id 去重”。后者需要明确业务键，例如使用 Map 建立索引。

Set 按插入顺序迭代，提供 `keys`、`values`、`entries` 和 `forEach`。由于没有单独的键，`keys()` 与 `values()` 的结果相同，`entries()` 则产生 `[value, value]`。

## Map：键不必是字符串

普通对象的属性键主要是字符串或 Symbol，而 Map 可以直接用对象作为键：

```javascript
const user = { id: 1 };
const scores = new Map();
scores.set(user, 95);

console.log(scores.get(user)); // 95
console.log(scores.get({ id: 1 })); // undefined：这是另一个对象
console.log(scores.has(user)); // true
```

Map 的键也使用 SameValueZero 比较，重复设置同一个键会更新其值。它保留键的插入顺序，并提供 `size`、`get`、`set`、`has`、`delete`、`clear` 等操作。

如果业务约定“相同 id 的记录保留最后一个”，可以这样处理：

```javascript
const records = [
  { id: 1, name: '旧名称' },
  { id: 2, name: '第二条' },
  { id: 1, name: '新名称' },
];
const byId = new Map(records.map(item => [item.id, item]));
console.log([...byId.values()]);
// [{ id: 1, name: '新名称' }, { id: 2, name: '第二条' }]
```

更新已有键不会把它移动到最后，以上结果的位置仍由第一次插入该键的顺序决定。

## WeakMap：为对象附加外部状态

假设需要为 DOM 元素记录状态，又不希望这个状态表成为阻止元素回收的原因，可以使用 WeakMap：

```javascript
const elementState = new WeakMap();

function register(element) {
  elementState.set(element, { clicks: 0 });
}

function recordClick(element) {
  const state = elementState.get(element);
  if (state) state.clicks += 1;
}
```

如果某个元素已经没有其他强引用，仅仅作为 WeakMap 的键不会阻止它被垃圾回收。相应条目也不需要由程序逐项枚举后清理。

但这不代表使用 WeakMap 就消除了所有内存泄漏。其他数组、闭包、事件监听等仍可能持有元素的强引用；垃圾回收何时发生也没有确定时间。不要编写依赖“下一行就已经回收”的逻辑。

WeakMap 只有 `get`、`set`、`has` 和 `delete` 等按键操作，没有 `size`、遍历方法或 `clear`。若能枚举其中成员，就可能观察到不确定的垃圾回收结果，因此它有意不提供这类能力。

## WeakSet：只关心某个对象是否属于集合

WeakSet 适合给对象打一个外部标记，而不需要为它保存额外值：

```javascript
const initialized = new WeakSet();

function initialize(target) {
  if (initialized.has(target)) return;
  // 执行初始化工作……
  initialized.add(target);
}
```

它支持 `add`、`has` 和 `delete`，同样不能遍历。`new WeakSet([[1, 2], [3, 4]])` 是合法的，因为加入集合的是两个数组对象；`new WeakSet([1, 2])` 则不合法，因为成员是数字。

选择集合时，先确定是否需要枚举全部成员、统计数量，以及是否希望集合保持对象存活。需要这些能力时通常选择 Set 或 Map；只围绕已知对象保存标记或关联信息，才考虑弱集合。

参考：[MDN：Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set)、[MDN：WeakMap](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap)。
