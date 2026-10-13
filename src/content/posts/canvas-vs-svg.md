---
slug: "canvas-vs-svg"
title: "Canvas 与 SVG 的比较"
description: "从绘制模型、缩放、交互、可访问性和性能成本比较 Canvas 与 SVG，按场景选择合适的图形方案。"
publishedAt: "2021-04-18T23:29:00+08:00"
updatedAt: "2026-10-13T11:52:56+08:00"
category: "engineering"
tags: ["frontend"]
source: "yuque"
sourceId: "lwwchm"
sourceTitle: "Canvas 与 SVG 的比较"
sourceUrl: "https://www.yuque.com/funlee/ez5odb/lwwchm"
---

Canvas 与 SVG 都可以在网页中绘制图形，但它们保存图形的方式不同。理解这一点，比背诵“Canvas 适合游戏，SVG 适合图表”更有用。

## 两种绘制模型

Canvas 2D 接收绘图命令，把结果写入位图。画完一个圆以后，画布不会自动保留一个可以像 DOM 节点一样查询和监听的“圆对象”。如果要移动它，通常需要清除相关区域，再根据应用保存的状态重新绘制。

SVG 使用元素描述图形。圆、路径和文字可以作为文档结构的一部分存在，浏览器根据属性绘制它们。修改圆的位置，通常就是修改元素属性。

下面用 SVG 画一个圆：

```html
<svg viewBox="0 0 200 120" width="200" height="120"
     role="img" aria-labelledby="circle-title">
  <title id="circle-title">一个蓝色圆形</title>
  <circle cx="100" cy="60" r="30" fill="#2563eb" />
</svg>
```

使用 Canvas 2D 绘制同样的图形：

```html
<canvas id="drawing" width="200" height="120"
        role="img" aria-label="一个蓝色圆形"></canvas>
<script>
  const canvas = document.querySelector('#drawing');
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.beginPath();
    ctx.arc(100, 60, 30, 0, Math.PI * 2);
    ctx.fillStyle = '#2563eb';
    ctx.fill();
  }
</script>
```

## 从几个维度比较

| 维度 | Canvas 2D | SVG |
| --- | --- | --- |
| 表达方式 | 绘图命令产生位图 | 元素与属性描述图形 |
| 图形结构 | 通常由应用自己保存 | 可以保留在文档结构中 |
| 缩放 | 需要考虑位图分辨率与重新绘制 | 矢量形状可以按比例重新栅格化 |
| 交互 | 对画布监听事件，再自行命中检测 | 可以直接对图形元素监听事件 |
| 文字与语义 | 像素本身不提供完整文档语义 | 文本与元素更便于结合选择、样式和可访问性 |
| 更新成本 | 取决于重绘区域、绘制指令和像素量 | 取决于节点规模、属性变化和浏览器渲染成本 |

SVG 也可以嵌入位图，所以“SVG 永远不会模糊”同样过于绝对。Canvas 也不是只能做低清图形；关键在于如何设置与管理绘图缓冲区。

## Canvas 缩放时为什么容易变模糊

Canvas 的 `width`、`height` 决定绘图缓冲区尺寸，CSS 尺寸决定它在页面上的显示大小。如果只通过 CSS 把画布放大，原有像素会被拉伸。

在高像素密度屏幕上，可以按设备像素比增大缓冲区，再把坐标系缩放回 CSS 像素单位：

```javascript
const width = 400;
const height = 240;
const dpr = window.devicePixelRatio || 1;

canvas.style.width = `${width}px`;
canvas.style.height = `${height}px`;
canvas.width = Math.round(width * dpr);
canvas.height = Math.round(height * dpr);
ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
// 此后可以继续按 400 × 240 的逻辑坐标绘制
```

修改 Canvas 的 `width` 或 `height` 会重置位图和绘图状态，因此调整尺寸后需要重新设置状态并重绘。更高分辨率也会增加内存与像素处理成本，不能无限提高。

## 交互与可访问性需要怎样设计

Canvas 元素当然可以接收鼠标、触摸和键盘相关事件，只是内部绘制的图形没有自动对应的 DOM 事件目标。应用需要将事件坐标转换到绘图坐标，再通过几何计算、`isPointInPath` 等方式判断命中了哪个图形。

SVG 对象可以直接绑定事件，但这也不意味着可访问性自动完成。可交互元素仍需要合理的键盘操作、名称与状态说明。

复杂 Canvas 图表通常还应提供文字摘要、数据表格或可操作的 DOM 控件，让无法直接读取图形的用户也能理解内容。只给整张画布一个名称，无法表达全部数据关系。

## 导出图片与跨域限制

Canvas 可以通过 `toBlob` 或 `toDataURL` 导出图片，但格式支持与透明度处理需要结合目标格式。PNG 可以保存透明通道，JPEG 不支持透明通道。

如果绘制了没有获得适当跨域许可的图片，画布可能被污染，随后读取像素或导出就会受到安全限制。仅仅设置 `crossOrigin` 属性不够，还需要图片服务器正确返回跨域响应头。

SVG 可以保存为矢量内容，但如果需要转成位图，同样要处理字体、外部资源和跨域等问题。

## 怎么选择更合适

图标、节点数量适中且交互明确的图形，通常适合 SVG。大量高频更新的点、粒子或需要持续重绘的画面，可以评估 Canvas；更复杂的高性能图形还可以考虑 WebGL 等方案。

地图和图表并没有唯一答案：几百个可交互节点与几十万个密集点，对渲染系统的要求完全不同。有时也可以组合使用，让 Canvas 负责密集图形，DOM 或 SVG 负责文本、焦点和交互提示。

选型应根据数据规模、更新频率、交互方式、导出需求和可访问性要求，再用接近真实业务的样例测量，而不是单靠图形类别决定。

参考：[MDN：Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)、[MDN：SVG](https://developer.mozilla.org/en-US/docs/Web/SVG)。
