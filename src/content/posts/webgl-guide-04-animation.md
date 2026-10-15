---
slug: "webgl-guide-04-animation"
title: "WebGL 编程指南（四）：高级变换与动画基础"
description: "理解矩阵乘法的先后顺序，使用时间差和 requestAnimationFrame 驱动旋转动画。"
publishedAt: "2019-09-23T20:54:00+08:00"
updatedAt: "2026-10-15T14:50:14+08:00"
category: "engineering"
tags: ["frontend"]
source: "yinxiang"
sourceId: "bed85d2d-fd8a-4a40-a908-853c3ee3f013"
sourceTitle: "WebGL编程指南(四)：高级变换与动画基础"
sourceUrl: "https://web.yinxiang.com/#?b=4f7e64f7-2736-44ba-b77b-b252036fbba5&n=bed85d2d-fd8a-4a40-a908-853c3ee3f013&s=s56&"
---

> 本文整理自 2019 年的《WebGL 编程指南》阅读笔记。发布日期采用印象笔记的创建时间；2026 年 10 月迁移时补充解释并修正示例，统一使用 WebGL 1 / GLSL ES 1.00。

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

## 平移加旋转

上一章把平移与旋转分开讨论。真正组合它们时，关键是乘法顺序：矩阵乘法通常不可交换，`R × T` 与 `T × R` 表示不同的运动。

书中 `Matrix4` 的 `translate` 会在当前矩阵右侧乘平移矩阵。因此 `setRotate` 后再 `translate` 得到 `R × T`；作用于列向量时，右边的平移先作用，再整体旋转。视觉上物体的平移方向也跟着转动。

如果要先让物体围绕自身原点旋转，再把它放到世界中的指定位置，应使用 `setTranslate` 后再 `rotate`，得到 `T × R`。不要直接把方法调用顺序当作顶点经历变换的顺序。

可以用一个简单的点验证：原点先沿 x 平移 0.5，再旋转 90°，最终在 `(0, 0.5)`；原点先旋转再平移，则在 `(0.5, 0)`。

```html
<canvas id="canvas" width="300" height="500">
please use a browser that supports "canvas"
</canvas>
<script src="./lib/webgl-utils.js"></script>
<script src="./lib/webgl-debug.js"></script>
<script src="./lib/cuon-utils.js"></script>
<script src="./lib/cuon-matrix.js"></script>
<script>
window.onload = () => {
  const VSHADER_SOURCE = `
attribute vec4 a_Position;
uniform mat4 u_ModelMatrix;
void main() {
  gl_Position = u_ModelMatrix * a_Position;
}
`;
  const FSHADER_SOURCE =
    'void main() {\n' +
    ' gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n' +
    '}\n';
  const canvas = document.querySelector("#canvas");
  const gl = getWebGLContext(canvas);
  if(!gl) throw new Error("无法创建 WebGL 上下文");
  // 初始化着色器
  if(!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    throw new Error("着色器初始化失败");
  }
  const n = initVertexBuffers(gl);
  render();// 初始化
  canvas.addEventListener("click", function() {
    render(60.0, 0.5);
  }, false)
  function render(ANGLE = 0, Tx = 0) {
    const modelMatrix = new Matrix4();
    modelMatrix.setRotate(ANGLE, 0, 0, 1);
    modelMatrix.translate(Tx, 0, 0);
    const u_ModelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix");
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    // 绘制三个点
    gl.drawArrays(gl.TRIANGLES, 0, n);
  }
  function initVertexBuffers(gl) {
    const vertices = new Float32Array([0.0, 0.3, -0.3, -0.3, 0.3, -0.3]);
    let n = 3;
    // 创建缓冲区对象
    const vertexBuffer = gl.createBuffer();
    if(!vertexBuffer) {
      console.log("Failed to create the buffer object");
      return -1;
    }
    // 将缓冲区对象绑定到目标
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    // 向缓冲区对象中写入数据
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    const a_Position = gl.getAttribLocation(gl.program, "a_Position");
    if(a_Position < 0) {
      return -1;
    }
    // 将缓冲区对象分配给 a_Position 变量
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    // 连接 a_Position 变量与分配给它的缓冲区对象
    gl.enableVertexAttribArray(a_Position);
    return n;
  }
}
</script>
```

## 动画

动画是连续更新状态并重绘。下面每秒转动 45°，每帧增量等于“角速度 × 两帧之间的秒数”，因此不同刷新率下的转速大致一致。

原示例在初始化计时变量之前调用了 `tick()`，第一次计算可能得到 `NaN`，再通过 `|| 1` 掩盖问题。本次将计时初始化移到第一次调用之前，删除兜底掩盖，让时间差有明确来源。

`requestAnimationFrame` 只请求下一帧，需要在回调里再次申请。浏览器通常会暂停后台页面的动画回调；如果不希望切回页面时旋转角度跳跃，可以限制单帧时间差，或在恢复显示时重置计时。参见 [MDN 的 requestAnimationFrame 说明](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame)。

```html
<canvas id="canvas" width="400" height="400">
please use a browser that supports "canvas"
</canvas>
<script src="./lib/webgl-utils.js"></script>
<script src="./lib/webgl-debug.js"></script>
<script src="./lib/cuon-utils.js"></script>
<script src="./lib/cuon-matrix.js"></script>
<script>
// 顶点着色器程序
var VSHADER_SOURCE =
  "attribute vec4 a_Position;\n" +
  "uniform mat4 u_ModelMatrix;\n" +
  "void main() {\n" +
  " gl_Position = u_ModelMatrix * a_Position;\n" +
  "}\n";
// 片元着色器程序
var FSHADER_SOURCE =
  "void main() {\n" +
  " gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n" +
  "}\n";
// 旋转角度（度/秒）
var ANGLE_STEP = 45.0;
var canvas = document.getElementById("canvas");
var gl = getWebGLContext(canvas);
if(!gl) throw new Error("无法创建 WebGL 上下文");
// 初始化着色器
if(!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
  throw new Error("着色器初始化失败");
}
var n = initVertexBuffers(gl);
gl.clearColor(0.0, 0.0, 0.0, 1.0);
// 获取 u_ModelMatrix 变量的存储位置
var u_ModelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix");
// 三角形当前的旋转角度
var currentAngle = 0.0;
// 模型矩阵，Matrix4 对象
var modelMatrix = new Matrix4();
// 开始绘制三角形
var tick = function() {
  currentAngle = animate(currentAngle);// 更新旋转角度
  draw(gl, n, currentAngle, modelMatrix, u_ModelMatrix);
  requestAnimationFrame(tick);
};
// 在首帧之前记录时间。
var g_last = Date.now();
tick();
function initVertexBuffers(gl) {
  var vertices = new Float32Array([0, 0.5, -0.5, -0.5, 0.5, -0.5]);
  var n = 3;// 顶点数量
  var vertexBuffer = gl.createBuffer();
  if(!vertexBuffer) {
    console.log("Failed to create the buffer object");
    return -1;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  var a_Position = gl.getAttribLocation(gl.program, "a_Position");
  if(a_Position < 0) {
    console.log("Failed to get the storage location of a_Position");
    return -1;
  }
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);
  return n;
}
function draw(gl, n, currentAngle, modelMatrix, u_ModelMatrix) {
  // 设置旋转矩阵
  modelMatrix.setRotate(currentAngle, 0, 0, 1);
  // 将旋转矩阵传输给顶点着色器
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.clear(gl.COLOR_BUFFER_BIT);
  // 绘制三角形
  gl.drawArrays(gl.TRIANGLES, 0, n);
}
function animate(angle) {
  // 计算距离上次调用经过多长时间
  var now = Date.now();
  // 毫秒；g_last 已在首次 tick() 前初始化
  var elapsed = now - g_last;
  g_last = now;
  // 计算距离上次调用的时间，更新当前旋转角度
  var newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
  return (newAngle %= 360);
}
</script>
```

## 系列文章

- [WebGL 编程指南（一）：WebGL 概述](/posts/webgl-guide-01-overview/)
- [WebGL 编程指南（二）：WebGL 入门](/posts/webgl-guide-02-getting-started/)
- [WebGL 编程指南（三）：绘制和变换三角形](/posts/webgl-guide-03-triangles-transforms/)
- [WebGL 编程指南（五）：颜色与纹理](/posts/webgl-guide-05-colors-textures/)
- [WebGL 编程指南（七）：进入三维世界](/posts/webgl-guide-07-3d-world/)

本系列保留阅读笔记的原章节编号，第六篇暂缺。
