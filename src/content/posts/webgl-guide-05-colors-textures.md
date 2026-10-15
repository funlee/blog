---
slug: "webgl-guide-05-colors-textures"
title: "WebGL 编程指南（五）：颜色与纹理"
description: "用多个缓冲区和交错数据组织顶点属性，理解颜色插值、光栅化与纹理采样。"
publishedAt: "2019-09-24T08:47:00+08:00"
updatedAt: "2026-10-15T14:50:14+08:00"
category: "engineering"
tags: ["frontend"]
source: "yinxiang"
sourceId: "af79b45a-89d6-4c4e-b62a-7969d6b57590"
sourceTitle: "WebGL 编程指南(五)：颜色与纹理"
sourceUrl: "https://web.yinxiang.com/#?b=4f7e64f7-2736-44ba-b77b-b252036fbba5&n=af79b45a-89d6-4c4e-b62a-7969d6b57590&s=s56&"
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

## 绘制多个不同大小不同位置的点

位置、尺寸和颜色都是顶点属性。它们既可以分别保存在不同缓冲区，也可以交错放进同一个数组。下面先分别保存位置与尺寸，再把它们合并成 `x, y, size` 的布局，两种方案应产生相同结果。

交错布局里的步长与偏移都以**字节**计数。一个 `Float32` 占 4 字节，所以三个分量的步长是 12 字节，尺寸从第 8 字节开始读。`vertexAttribPointer` 记录调用当时绑定的缓冲区，后续切换 `ARRAY_BUFFER` 不会自动改写之前配置好的属性。

按照创建多个缓冲区对象来实现：

```javascript
window.onload = () => {
  // 顶点着色器
  const VSHADER_SOURCE = `
attribute vec4 a_Position;
attribute float a_PointSize;
void main() {
  gl_Position = a_Position;
  gl_PointSize = a_PointSize;
}
`;
  // 片元着色器
  const FSHADER_SOURCE = `
void main() {
  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}
`;
  const initVertexBuffers = gl => {
    // 点的坐标数据
    const vertices = new Float32Array([
      0.0, 0.5, -0.5, -0.5, 0.5, -0.5
    ]);
    let n = 3;
    // 点的尺寸数据
    const sizes = new Float32Array([
      10.0, 20.0, 30.0
    ]);
    // 创建缓冲区对象
    const vertexBuffer = gl.createBuffer();
    const sizeBuffer = gl.createBuffer();
    // 将缓冲区对象绑定到目标 -- 坐标
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    // 向缓冲区对象写入数据 -- 坐标
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    const a_Position = gl.getAttribLocation(gl.program, "a_Position");
    // 将缓冲区对象分配给 a_Position 变量 -- 坐标
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    // 连接 a_Position 变量与分配给它的缓冲区对象 -- 坐标
    gl.enableVertexAttribArray(a_Position);
    // 将缓冲区对象绑定到目标 -- 尺寸大小
    gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuffer);
    // 向缓冲区对象写入数据 -- 尺寸大小
    gl.bufferData(gl.ARRAY_BUFFER, sizes, gl.STATIC_DRAW);
    const a_PointSize = gl.getAttribLocation(gl.program, "a_PointSize");
    // 将缓冲区对象分配给 a_PointSize 变量 -- 尺寸大小
    // vertexAttribPointer(location, size, type, normalized, stride, offset)
    // 这里 size 取 1
    gl.vertexAttribPointer(a_PointSize, 1, gl.FLOAT, false, 0, 0);
    // 连接 a_PointSize 变量与分配给它的缓冲区对象 -- 尺寸大小
    gl.enableVertexAttribArray(a_PointSize);
    // 解除缓冲区对象
    // gl.bindBuffer(gl.ARRAY_BUFFER, null);
    return n;
  }
  const canvas = document.querySelector("#canvas");
  const gl = getWebGLContext(canvas);
  if(!gl) throw new Error("无法创建 WebGL 上下文");
  // 初始化着色器
  if(!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    throw new Error("着色器初始化失败");
  }
  // 设置顶点信息
  const n = initVertexBuffers(gl);
  // 设置 canvas 背景色
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  // 清空 canvas
  gl.clear(gl.COLOR_BUFFER_BIT);
  // 绘制点
  gl.drawArrays(gl.POINTS, 0, n);
}
```

按照创建单个缓冲区对象来实现，即利用`gl.vertexAttribPointer()`的步进和偏移参数：

```javascript
window.onload = () => {
  // 顶点着色器
  const VSHADER_SOURCE = `
attribute vec4 a_Position;
attribute float a_PointSize;
void main() {
  gl_Position = a_Position;
  gl_PointSize = a_PointSize;
}
`;
  // 片元着色器
  const FSHADER_SOURCE = `
void main() {
  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}
`;
  const initVertexBuffers = gl => {
    // 点的坐标和尺寸大小的数据
    const verticesSizes = new Float32Array([
      0.0, 0.5, 10.0,// 第一个点
      -0.5, -0.5, 20.0,// 第二个点
      0.5, -0.5, 30.0// 第三个点
    ]);
    let n = 3;
    // 创建缓冲区对象
    const vertexSizeBuffer = gl.createBuffer();
    // 将缓冲区对象绑定到目标
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexSizeBuffer);
    // 向缓冲区对象写入数据
    gl.bufferData(gl.ARRAY_BUFFER, verticesSizes, gl.STATIC_DRAW);
    // 获取每个数组中每个元素所占的字节数
    const FSIZE = verticesSizes.BYTES_PER_ELEMENT;
    console.log(FSIZE, verticesSizes)
    // 获取 a_Position 的存储位置，分配缓冲区并开启
    const a_Position = gl.getAttribLocation(gl.program, "a_Position");
    // 取 2 个分量，步进参数为 FSIZE * 3，偏移 0
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 3, 0);
    gl.enableVertexAttribArray(a_Position);
    // 获取 a_PointSize 的存储位置，分配缓冲区并开启
    const a_PointSize = gl.getAttribLocation(gl.program, "a_PointSize");
    // 取 1 个分量，步进参数为 FSIZE * 3，偏移 FSIZE * 2
    gl.vertexAttribPointer(a_PointSize, 1, gl.FLOAT, false, FSIZE * 3, FSIZE * 2);
    gl.enableVertexAttribArray(a_PointSize);
    // 解除缓冲区对象
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    return n;
  }
  const canvas = document.querySelector("#canvas");
  const gl = getWebGLContext(canvas);
  if(!gl) throw new Error("无法创建 WebGL 上下文");
  // 初始化着色器
  if(!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    throw new Error("着色器初始化失败");
  }
  // 设置顶点信息
  const n = initVertexBuffers(gl);
  // 设置 canvas 背景色
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  // 清空 canvas
  gl.clear(gl.COLOR_BUFFER_BIT);
  // 绘制点
  gl.drawArrays(gl.POINTS, 0, n);
}
```

## 修改颜色

加入颜色后，每个顶点的布局变为 `x, y, size, r, g, b`，共六个浮点数。位置偏移为 0，尺寸偏移为 8 字节，颜色偏移为 12 字节，步长统一为 24 字节。

顶点着色器把颜色写入 `varying`。绘制独立点时，每个点呈现自己的颜色；将模式改成 `TRIANGLES` 后，片元阶段会得到插值后的颜色，因此三角形内部出现渐变。这里的渐变不是 JavaScript 为每个像素手动计算的。

利用 varying 变量，varying 变量的作用是从顶点着色器向片元着色器传输数据

在 WebGL 中，如果顶点着色器与片元着色器中有类型和命名都相同的 varying 变量，那么顶点着色器赋给该变量的值就会被自动地传入片元着色器

```javascript
window.onload = () => {
  // 顶点着色器
  const VSHADER_SOURCE = `
attribute vec4 a_Position;
attribute float a_PointSize;
attribute vec4 a_Color;
varying vec4 v_Color;
void main() {
  gl_Position = a_Position;
  gl_PointSize = a_PointSize;
  v_Color = a_Color;
}
`;
  // 片元着色器
  // 报错信息：Failed to compile shader: ERROR: 0:1: '' : No precision specified for (float)
  // 添加 precision mediump float; 解除报错信息
  const FSHADER_SOURCE = `
precision mediump float;
varying vec4 v_Color;
void main() {
  gl_FragColor = v_Color;
}
`;
  const initVertexBuffers = gl => {
    // 点的坐标和尺寸大小的数据
    const verticesSizes = new Float32Array([
      0.0, 0.5, 10.0, 1.0, 0.0, 0.0,// 第一个点
      -0.5, -0.5, 20.0, 0.0, 1.0, 0.0,// 第二个点
      0.5, -0.5, 30.0, 0.0, 0.0, 1.0,// 第三个点
    ]);
    let n = 3;
    // 创建缓冲区对象
    const vertexSizeBuffer = gl.createBuffer();
    // 将缓冲区对象绑定到目标
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexSizeBuffer);
    // 向缓冲区对象写入数据
    gl.bufferData(gl.ARRAY_BUFFER, verticesSizes, gl.STATIC_DRAW);
    // 获取每个数组中每个元素所占的字节数
    const FSIZE = verticesSizes.BYTES_PER_ELEMENT;
    // 获取 a_Position 的存储位置，分配缓冲区并开启
    const a_Position = gl.getAttribLocation(gl.program, "a_Position");
    // 取 2 个分量，步进参数为 FSIZE * 6，偏移 0
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 6, 0);
    gl.enableVertexAttribArray(a_Position);
    // 获取 a_PointSize 的存储位置，分配缓冲区并开启
    const a_PointSize = gl.getAttribLocation(gl.program, "a_PointSize");
    // 取 1 个分量，步进参数为 FSIZE * 6，偏移 FSIZE * 2
    gl.vertexAttribPointer(a_PointSize, 1, gl.FLOAT, false, FSIZE * 6, FSIZE * 2);
    gl.enableVertexAttribArray(a_PointSize);
    // 获取 a_Color 的存储位置，分配缓冲区并开启
    const a_Color = gl.getAttribLocation(gl.program, "a_Color");
    // 取 3 个分量，步进参数为 FSIZE * 6，偏移 FSIZE * 3
    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
    gl.enableVertexAttribArray(a_Color);
    // 解除缓冲区对象
    // gl.bindBuffer(gl.ARRAY_BUFFER, null);
    return n;
  }
  const canvas = document.querySelector("#canvas");
  const gl = getWebGLContext(canvas);
  if(!gl) throw new Error("无法创建 WebGL 上下文");
  // 初始化着色器
  if(!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    throw new Error("着色器初始化失败");
  }
  // 设置顶点信息
  const n = initVertexBuffers(gl);
  // 设置 canvas 背景色
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  // 清空 canvas
  gl.clear(gl.COLOR_BUFFER_BIT);
  // 绘制点
  gl.drawArrays(gl.POINTS, 0, n);
  // 绘制三角形
  // gl.drawArrays(gl.TRIANGLES, 0, n);
}
```

## 光栅化

图元装配决定“这些顶点组成什么”，光栅化决定“图元覆盖哪些采样位置”。片元着色器处理的是候选片元，其结果还可能经过深度测试、混合等步骤，不一定直接成为最终像素颜色。

`gl_FragCoord` 是窗口坐标，不是前文以画布中心为原点的坐标。下面用绘制缓冲区的宽高将它归一化，并把 x、y 分别映射到红、蓝通道。

WebGL 在顶点着色器和片元着色器执行之间，还有如下两个步骤：

- 图形装配过程：将孤立的顶点坐标装配成几何图形，几何图形的类别由`gl.drawArrays()`函数的第一个参数决定
- 光栅化过程：将装配好的几何图形转化为片元，你可以将三维图形的片元理解为二维图形的像素

几何图形装配过程又被称为图元装配过程，因为被装配出的基本图形（点、线、面）又被称为图元，装配好的图形还需要转化为片元，将图形转换为片元的过程，称之为光栅化（rasterization），一旦光栅化过程结束后，程序就开始逐片元调用片元着色器，每调用一次，就处理一个片元，片元着色器为片元计算输出颜色，经过后续测试与混合后才可能写入颜色缓冲区。

每一个varying变量都会经历内插过程（interpolation process），深入了解内插过程，请参考《计算机图形学》一书。

例子：根据片元位置决定颜色，直观观察片元阶段的逐片元计算效果。

```javascript
window.onload = () => {
  // 顶点着色器
  const VSHADER_SOURCE = `
attribute vec4 a_Position;
void main() {
  gl_Position = a_Position;
  gl_PointSize = 10.0;
}
`;
  const FSHADER_SOURCE = `
precision mediump float;
uniform float u_Width;
uniform float u_Height;
void main() {
  gl_FragColor = vec4(gl_FragCoord.x / u_Width, 0.0, gl_FragCoord.y / u_Height, 1.0);
}
`;
  const initVertexBuffers = gl => {
    // 点的坐标和尺寸大小的数据
    const verticesSizes = new Float32Array([
      0.0, 0.5,// 第一个点
      -0.5, -0.5,// 第二个点
      0.5, -0.5,// 第三个点
    ]);
    let n = 3;
    // 创建缓冲区对象
    const vertexSizeBuffer = gl.createBuffer();
    // 将缓冲区对象绑定到目标
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexSizeBuffer);
    // 向缓冲区对象写入数据
    gl.bufferData(gl.ARRAY_BUFFER, verticesSizes, gl.STATIC_DRAW);
    // 获取 a_Position 的存储位置，分配缓冲区并开启
    const a_Position = gl.getAttribLocation(gl.program, "a_Position");
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);
    const u_Width = gl.getUniformLocation(gl.program, "u_Width");
    const u_Height = gl.getUniformLocation(gl.program, "u_Height");
    // drawingBufferWidth 颜色缓冲区的宽度
    // drawingBufferHeight 颜色缓冲区的高度
    gl.uniform1f(u_Width, gl.drawingBufferWidth);
    gl.uniform1f(u_Height, gl.drawingBufferHeight);
    // 解除缓冲区对象
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    return n;
  }
  const canvas = document.querySelector("#canvas");
  const gl = getWebGLContext(canvas);
  if(!gl) throw new Error("无法创建 WebGL 上下文");
  // 初始化着色器
  if(!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    throw new Error("着色器初始化失败");
  }
  // 设置顶点信息
  const n = initVertexBuffers(gl);
  // 设置 canvas 背景色
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  // 清空 canvas
  gl.clear(gl.COLOR_BUFFER_BIT);
  // 绘制点
  gl.drawArrays(gl.TRIANGLES, 0, n);
}
```

## 纹理

纹理坐标把几何顶点与图像上的位置联系起来。顶点阶段传出纹理坐标，片元阶段接收插值结果，再用 `texture2D` 取样。`u_Sampler` 保存的是纹理单元编号，不是图片对象，也不是 `gl.TEXTURE0` 常量本身。

下面仍使用书中 `examples/resources/sky.jpg`，运行前需要放好这张图片，或修改为自己的同源图片路径。图像加载是异步的，所以真正上传纹理和绘制要放在 `onload` 之后；工程中还应为 `onerror` 提供反馈。

迁移时把两个方向的环绕方式统一改成 `CLAMP_TO_EDGE`，配合 `LINEAR` 缩小过滤，兼容 WebGL 1 的非二次幂纹理。原笔记的 `MIRRORED_REPEAT` 不能无条件用于任意尺寸图片；使用 mipmap 或重复环绕前应确认尺寸条件。参见 [MDN 的 WebGL 纹理教程](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Using_textures_in_WebGL)。

- 纹理映射（texture mapping）：就是将一张图像（贴纸）映射（贴）到一个几何图形的表面上去，这张图像又可以称为纹理图像（texture image）或纹理（texture）
- 纹素（texels, texture elements）：组成纹理图像的像素，每个纹素的颜色都使用 RGB 或 RGBA 格式编码
- 纹理坐标（texture coordinates）：纹理图像上的坐标，通过纹理坐标可以在纹理图像上获取纹素颜色，WebGL 系统中的纹理坐标是二维的，我们使用 s 和 t 命名纹理坐标（st 坐标系统）
- WebGL 纹理坐标系统中的 t 轴的方向和 PNG、BMP、JPG 等格式图片的坐标系统的 Y 轴方向是相反的，因此，在本例的纹理坐标约定下，上传时进行 Y 轴反转即可保持图像方向正确；也可以通过调整纹理坐标实现，但不要重复翻转
- WebGL 通过一种称为纹理单元（texture unit）的机制来同时使用多个纹理

一个例子：

```javascript
window.onload = () => {
  // 顶点着色器
  const VSHADER_SOURCE = `
attribute vec4 a_Position;
attribute vec2 a_TexCoord;
varying vec2 v_TexCoord;
void main() {
  gl_Position = a_Position;
  v_TexCoord = a_TexCoord;
}
`;
  const FSHADER_SOURCE = `
precision mediump float;
uniform sampler2D u_Sampler;
varying vec2 v_TexCoord;
void main() {
  gl_FragColor = texture2D(u_Sampler, v_TexCoord);
}
`;
  const initVertexBuffers = gl => {
    // 顶点坐标 纹理坐标
    const verticesTexCoords = new Float32Array([
      -0.5, 0.5, 0.0, 1.0,
      -0.5, -0.5, 0.0, 0.0,
      0.5, 0.5, 1.0, 1.0,
      0.5, -0.5, 1.0, 0.0,
    ]);
    // 顶点数目
    let n = 4;
    // 创建缓冲区对象
    const vertexTexCoordBuffer = gl.createBuffer();
    // 将缓冲区对象绑定到目标
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexTexCoordBuffer);
    // 向缓冲区对象写入数据
    gl.bufferData(gl.ARRAY_BUFFER, verticesTexCoords, gl.STATIC_DRAW);
    const FSIZE = verticesTexCoords.BYTES_PER_ELEMENT;
    const a_Position = gl.getAttribLocation(gl.program, "a_Position");
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 4, 0);
    gl.enableVertexAttribArray(a_Position);
    const a_TexCoord = gl.getAttribLocation(gl.program, "a_TexCoord");
    gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, FSIZE * 4, FSIZE * 2);
    gl.enableVertexAttribArray(a_TexCoord);
    return n;
  }
  const initTextures = (gl, n) => {
    const texture = gl.createTexture();
    const u_Sampler = gl.getUniformLocation(gl.program, "u_Sampler");
    const image = new Image();
    image.onload = () => {
      loadTexture(gl, n, texture, u_Sampler, image);
    }
    image.onerror = () => console.error("纹理加载失败，请检查图片路径与跨域设置");
    image.src = "./examples/resources/sky.jpg";
    return true;
  }
  const loadTexture = (gl, n, texture, u_Sampler, image) => {
    // 对纹理图像进行 Y 轴反转
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    // 开启 0 号纹理单元
    gl.activeTexture(gl.TEXTURE0);
    // 绑定纹理对象
    gl.bindTexture(gl.TEXTURE_2D, texture);
    // 配置纹理参数
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    // 配置纹理图像
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    // 将 0 号纹理传递给着色器中的取样器变量
    gl.uniform1i(u_Sampler, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    // 绘制矩形
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);
  }
  const canvas = document.querySelector("#canvas");
  const gl = getWebGLContext(canvas);
  if(!gl) throw new Error("无法创建 WebGL 上下文");
  // 初始化着色器
  if(!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    throw new Error("着色器初始化失败");
  }
  // 设置顶点信息
  const n = initVertexBuffers(gl);
  // 设置 canvas 背景色
  gl.clearColor(135 / 255, 206 / 255, 235 / 255, 1.0);
  // 配置纹理
  initTextures(gl, n)
}
```

## 系列文章

- [WebGL 编程指南（一）：WebGL 概述](/posts/webgl-guide-01-overview/)
- [WebGL 编程指南（二）：WebGL 入门](/posts/webgl-guide-02-getting-started/)
- [WebGL 编程指南（三）：绘制和变换三角形](/posts/webgl-guide-03-triangles-transforms/)
- [WebGL 编程指南（四）：高级变换与动画基础](/posts/webgl-guide-04-animation/)
- [WebGL 编程指南（七）：进入三维世界](/posts/webgl-guide-07-3d-world/)

本系列保留阅读笔记的原章节编号，第六篇暂缺。
