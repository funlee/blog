---
slug: "webgl-guide-07-3d-world"
title: "WebGL 编程指南（七）：进入三维世界"
description: "从视点、观察目标和上方向构建视图矩阵，并补充投影与深度测试的职责。"
publishedAt: "2019-09-24T16:05:00+08:00"
updatedAt: "2026-10-15T14:50:14+08:00"
category: "engineering"
tags: ["frontend"]
source: "yinxiang"
sourceId: "715a71a0-74bf-41af-a7e3-56f017803fb6"
sourceTitle: "WebGL编程指南(七)：进入三维世界"
sourceUrl: "https://web.yinxiang.com/#?b=4f7e64f7-2736-44ba-b77b-b252036fbba5&n=715a71a0-74bf-41af-a7e3-56f017803fb6&s=s56&"
---

> 本文整理自 2019 年的《WebGL 编程指南》阅读笔记。发布日期采用印象笔记的创建时间；2026 年 10 月迁移时补充解释并修正示例，统一使用 WebGL 1 / GLSL ES 1.00。

在前面的二维练习中，主要关注顶点的 x、y 坐标。进入三维世界后，还要处理深度，并说明观察者在哪里、朝哪里看，以及视野范围有多大。

## 示例运行前的准备

示例沿用书中的辅助库。`getWebGLContext`、`initShaders`、`gl.program` 和 `Matrix4` 都是辅助代码提供的接口，不是浏览器原生 WebGL API。可从[本书作者的示例网站](https://sites.google.com/site/webglbook/)取得配套文件，保留 `lib` 目录结构。

每段示例独立运行，不要把多段 `window.onload` 粘到同一个页面。只有 JavaScript 的示例，需要先准备下面的 HTML 外壳，再把代码放在最后一个 `<script>` 内；包含完整 HTML 的例子则直接使用。

```html
<canvas id="canvas" width="500" height="500"></canvas>
<script src="./lib/webgl-utils.js"></script>
<script src="./lib/webgl-debug.js"></script>
<script src="./lib/cuon-utils.js"></script>
<script src="./lib/cuon-matrix.js"></script>
<script>
// 将本篇某一段完整 JavaScript 示例放在这里。
</script>
```

通过本地 HTTP 服务访问页面，例如在示例目录运行 `python3 -m http.server 8000`。纹理示例另需准备图片；使用跨域图片时还需要图片服务器允许 CORS。

## 视点和视线

二维示例直接把位置写入 `gl_Position`，看起来像在画布上摆放坐标。进入三维以后，需要把“物体在哪里”和“从哪里观察”分开：前者由模型数据及模型变换决定，后者由视图变换决定。

`setLookAt` 的三个参数组分别是 eye、center、up。eye 与 center 不能重合；up 也不能与视线方向平行，否则无法构造稳定的观察坐标系。原文把 `(0, 1, 0)` 写成 Y 轴负方向，迁移时已修正。

为了定义一个观察者，我们要考虑以下两点：

- 观察方向，即观察者自己在什么位置，在看场景的哪一部分
- 可视距离，即观察者能够看多远

观察者所处的位置称之为视点（eye point）

从视点出发沿着观察者方向的射线称作视线（viewing direction）

WebGL 本身没有内置相机；在常见的观察坐标系约定中，相机位于原点并朝 Z 轴负方向看。实际视点与视线由应用构造的矩阵决定。

确定观察者的状态需要确定三项信息：

- 视点：视线的起点，常用约定为 (0, 0, 0)
- 观察目标：被观察目标所在的点，常用约定为 (0, 0, -1)
- 上方向：最终绘制在屏幕上的影像中的向上的方向，通常取 Y 轴正方向 (0, 1, 0)

利用上述两个点和一个方向向量，可以创建视图矩阵（view matrix），再将矩阵传给顶点着色器。

一个理解视点、观察目标和上方向的例子：

```javascript
window.onload = () => {
  // 顶点着色器
  const VSHADER_SOURCE = `
attribute vec4 a_Position;
attribute vec4 a_Color;
uniform mat4 u_ViewMatrix;
varying vec4 v_Color;
void main() {
  gl_Position = u_ViewMatrix * a_Position;
  v_Color = a_Color;
}
`;
  // 片元着色器
  const FSHADER_SOURCE = `
precision mediump float;
varying vec4 v_Color;
void main() {
  gl_FragColor = v_Color;
}
`;
  const canvas = document.querySelector("#canvas");
  const gl = getWebGLContext(canvas);
  if(!gl) throw new Error("无法创建 WebGL 上下文");
  if(!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    throw new Error("着色器初始化失败");
  }
  // 设置顶点坐标和颜色
  const n = initVertexBuffers(gl);
  gl.clearColor(0, 0, 0, 1);
  // 获取 u_ViewMatrix 变量的存储地址
  const u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  // 设置视点、视线和上方向
  const viewMatrix = new Matrix4();
  viewMatrix.setLookAt(0.25, 0.25, 0.25, 0, 0, 0, 0, 1, 0);
  // 将视图矩阵传给 u_ViewMatrix 变量
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  // 清空canvas
  gl.clear(gl.COLOR_BUFFER_BIT);
  // 绘制三角形
  gl.drawArrays(gl.TRIANGLES, 0, n);
}
function initVertexBuffers(gl) {
  const verticesColors = new Float32Array([
    // 顶点坐标和颜色
    0.0, 0.5, -0.4, 0.4, 1.0, 0.4,// 绿色三角形--最后
    -0.5, -0.5, -0.4, 0.4, 1.0, 0.4,
    0.5, -0.5, -0.4, 1.0, 0.4, 0.4,
    0.5, 0.4, -0.2, 1.0, 0.4, 0.4,// 黄色三角形--中间
    -0.5, 0.4, -0.2, 1.0, 1.0, 0.4,
    0.0, -0.6, -0.2, 1.0, 1.0, 0.4,
    0.0, 0.5, 0.0, 0.4, 0.4, 1.0,// 蓝色三角形--最前
    -0.5, -0.5, 0.0, 0.4, 0.4, 1.0,
    0.5, -0.5, 0.0, 1.0, 0.4, 0.4,
  ]);
  let n = 9;
  const vertexColorbuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorbuffer);
  gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);
  const FSIZE = verticesColors.BYTES_PER_ELEMENT;
  const a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0);
  gl.enableVertexAttribArray(a_Position);
  const a_Color = gl.getAttribLocation(gl.program, 'a_Color');
  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
  gl.enableVertexAttribArray(a_Color);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  return n;
}
```

## 模型、视图与投影分别负责什么

上面的示例保留了原笔记的重点：仅用视图矩阵观察几个彩色三角形，没有加入透视投影。这足以观察视角变化，但不能据此认为“设置相机之后就自动产生近大远小”。

模型矩阵 M 把模型坐标转换到世界坐标；视图矩阵 V 把世界坐标转换到观察坐标；投影矩阵 P 则决定如何得到裁剪空间位置。采用列向量约定时，顶点阶段通常写作 `gl_Position = P * V * M * position`。之后由管线进行透视除法和视口变换。关于这些空间的关系，可参考 [MDN 的模型、视图与投影说明](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_model_view_projection)。

`lookAt` 本身不决定“能看多远”。近远裁剪面与视野范围属于投影的职责；正交投影没有随距离缩小的透视效果，透视投影则可以表现近大远小。

## 为什么三角形可能遮挡不对

原示例没有开启深度测试，重叠部分会受到绘制顺序影响。对于一般的不透明三维场景，可以在初始化时开启深度测试，并在每次重绘前同时清空颜色和深度缓冲区：

```javascript
// 在创建好 gl 之后设置；这是对上方示例的补充片段。
gl.enable(gl.DEPTH_TEST);
gl.clearDepth(1.0);
// 用这一行替换原来的仅清空颜色缓冲区的调用。
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
```

深度测试解决的是可见性比较，不会替你构造视图或投影矩阵。以后加入透明物体时，还要单独考虑混合与绘制顺序，不能把不透明场景的处理直接照搬。

## 建议这样观察示例

先只调整 eye 的 x 分量，观察三个三角形的相对位置；再调整 up，理解画面“向上”的方向如何变化。最后开启深度测试，对比重叠区域。每次只改一项参数，才能把画面变化与对应的变换联系起来。

## 系列文章

- [WebGL 编程指南（一）：WebGL 概述](/posts/webgl-guide-01-overview/)
- [WebGL 编程指南（二）：WebGL 入门](/posts/webgl-guide-02-getting-started/)
- [WebGL 编程指南（三）：绘制和变换三角形](/posts/webgl-guide-03-triangles-transforms/)
- [WebGL 编程指南（四）：高级变换与动画基础](/posts/webgl-guide-04-animation/)
- [WebGL 编程指南（五）：颜色与纹理](/posts/webgl-guide-05-colors-textures/)

本系列保留阅读笔记的原章节编号，第六篇暂缺。
