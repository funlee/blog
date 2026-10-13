---
slug: "canvas-performance-optimization"
title: "canvas 性能优化的方法"
description: "从离屏缓存、动画调度、分层绘制和像素规模入手优化 Canvas，同时说明每种方案的成本与适用边界。"
publishedAt: "2021-04-19T00:00:00+08:00"
updatedAt: "2026-10-13T11:52:56+08:00"
category: "engineering"
tags: ["frontend"]
source: "yuque"
sourceId: "tbyrqw"
sourceTitle: "canvas 性能优化的方法"
sourceUrl: "https://www.yuque.com/funlee/ez5odb/tbyrqw"
---

Canvas 性能问题可能来自 JavaScript 计算、重复绘制、像素处理，也可能来自过大的画布。优化之前，先确认时间花在哪里，再减少真正昂贵的工作。

下面围绕 Canvas 2D 的常见场景整理几种思路。它们不是越多越好，需要结合画面规模、设备与更新频率测量。

## 缓存重复绘制的内容

如果同一段复杂图形会被反复使用，可以先画到一个不放入页面的 canvas 上，之后通过 `drawImage` 复制。这样把多次复杂绘制转换为重复使用缓存。

```javascript
function createSprite() {
  const sprite = document.createElement('canvas');
  sprite.width = 64;
  sprite.height = 64;
  const context = sprite.getContext('2d');
  if (!context) throw new Error('当前环境不支持 Canvas 2D');

  const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 28);
  gradient.addColorStop(0, '#93c5fd');
  gradient.addColorStop(1, '#2563eb');
  context.fillStyle = gradient;
  context.beginPath();
  context.arc(32, 32, 28, 0, Math.PI * 2);
  context.fill();
  return sprite;
}

const sprite = createSprite();
// ctx 为已经取得的主画布 2D 上下文
// ctx.drawImage(sprite, 20, 20);
// ctx.drawImage(sprite, 100, 20);
```

缓存区域应尽量贴合内容大小，否则每次复制会处理许多无用像素。文字、渐变、阴影等内容的缓存，在颜色、尺寸或数据改变时也必须更新。

这里的“离屏”只是没有展示在页面中的普通 canvas，并不会自动到其他线程执行。`OffscreenCanvas` 是另一套相关能力，在支持的环境中可以结合 Worker 使用；采用它还需要考虑消息传递和主线程与 Worker 的职责边界。

## 用 requestAnimationFrame 安排动画

`requestAnimationFrame` 让动画回调与浏览器的绘制安排协调，通常比固定间隔的定时器更合适。但它不会自动让昂贵的绘制变快，也不保证每秒固定执行 60 次。

动画进度应该根据经过的时间计算，而不是每次回调固定移动几个像素：

```javascript
function startAnimation(canvas) {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('当前环境不支持 Canvas 2D');
  let x = 0;
  let previous;
  let frameId;
  let stopped = false;
  const speed = 100; // 每秒移动 100 个画布坐标单位

  function frame(time) {
    if (stopped) return;
    // 对这个视觉动画限制单次步长，避免后台恢复后突然跳跃
    const delta = previous === undefined ? 0 : Math.min((time - previous) / 1000, 0.05);
    previous = time;
    const range = Math.max(1, canvas.width - 20);
    x = (x + speed * delta) % range;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(x, 20, 20, 20);
    frameId = requestAnimationFrame(frame);
  }

  frameId = requestAnimationFrame(frame);
  return function stop() {
    stopped = true;
    cancelAnimationFrame(frameId);
  };
}
```

这个独立示例使用画布自身坐标，不包含高像素密度缩放。真实项目如果有逻辑坐标系，应在同一坐标系内完成位置与边界计算。

示例限制了后台恢复后的单次步长，适合希望避免突然跳跃的视觉动画。倒计时、真实时间进度或物理模拟，应采用符合各自语义的时间处理方式，不能直接照搬。

页面或组件不再需要动画时，要调用返回的停止函数，避免留下无意义的循环。

## 把静态内容与动态内容分开

如果背景长期不变，却在每一帧都重新画一遍，就产生了不必要的工作。可以把背景放入独立图层、普通图片或 CSS，让动态画布只处理经常变化的部分。

分层也有代价：每张画布都需要位图内存，浏览器还要完成合成。因此，少量职责明确的图层通常比为每个图形创建一个 canvas 更合理。

局部更新同样需要权衡。只清除变化区域可以减少重绘，但必须处理旧位置、重叠图形和绘制顺序。如果为了维护脏区域产生复杂计算，可能不如整张重绘简单有效。

## 控制像素数量与绘图状态切换

设备像素比增加后，画布的像素数量会按比例的平方增长。例如宽高都乘以 2，缓冲区像素数就变成 4 倍。可以在清晰度和成本之间选择适当的分辨率上限，并在尺寸变化时重新绘制。

如果画布完全不需要透明背景，可以在首次获取上下文时考虑：

```javascript
const ctx = canvas.getContext('2d', { alpha: false });
```

这个选项只适用于画布可以保持不透明的场景，不能用于需要透出下层内容的图层。是否改善性能也应实测。

连续绘制相同样式的图形时，可以减少不必要的 `fillStyle`、阴影、变换等状态切换。但不能为了分组绘制而破坏遮挡关系；不同图形的透明度与混合方式也可能使“合并一次绘制”改变结果。

## 坐标取整要有条件

对于某些位图复制场景，将最终绘制位置对齐到整数像素可以减少采样开销或模糊。但不要因此把所有动画位置和几何计算都强行取整，否则会损失运动精度，导致抖动。

可以在逻辑层保留浮点位置，只在确实需要对齐的绘制调用处使用 `Math.round`。旧笔记中常见的 `x | 0`、`~~x` 会转换为 32 位整数，既可能溢出，对负数也不是普通的四舍五入。

线条是否清晰还涉及线宽、变换与设备像素比；例如某些一像素描边需要半像素对齐，不能统一套用整数坐标规则。

## 清理画布不等于清理路径

`clearRect` 清除像素，但不会重置当前路径。连续绘制独立路径时，应在合适的位置使用 `beginPath`，避免把上一轮路径继续累积进去。

同样，不要把每帧重新设置 `canvas.width` 当成通用清屏技巧。设置尺寸会重置状态和缓冲区，成本与语义都不同于单纯清除像素。

完成一次优化后，使用浏览器性能工具观察长任务、帧耗时与内存，再判断效果。比起堆叠技巧，减少重复工作、缩小绘制范围、控制像素规模，通常更容易形成可解释的收益。

参考：[原笔记参考文章](https://juejin.cn/post/6844903989197144078)、[MDN：优化 Canvas](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas)。
