---
slug: "webgl-guide-02-getting-started"
title: "WebGL 编程指南（二）：WebGL 入门"
description: "从清空画布到鼠标绘点，理解着色器、坐标系和 JavaScript 与 GPU 之间的数据传递。"
publishedAt: "2019-09-19T14:19:00+08:00"
updatedAt: "2026-10-15T14:50:14+08:00"
category: "engineering"
tags: ["frontend"]
source: "yinxiang"
sourceId: "e0d70c91-882b-49e5-8d52-86913174ac24"
sourceTitle: "WebGL 编程指南(二)：WebGL 入门"
sourceUrl: "https://web.yinxiang.com/#?b=4f7e64f7-2736-44ba-b77b-b252036fbba5&n=e0d70c91-882b-49e5-8d52-86913174ac24&s=s56&"
---

> 本文整理自 2019 年的《WebGL 编程指南》阅读笔记。发布日期采用印象笔记的创建时间；2026 年 10 月迁移时补充解释并修正示例，统一使用 WebGL 1 / GLSL ES 1.00。

从本篇开始，把上一章的渲染流程落到具体代码里：先清空画布，再绘制一个点，随后让 JavaScript 控制点的位置、尺寸和颜色。每个例子只增加一层机制，便于逐步定位问题。

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

## 第一个示例：清空画布

清空画布不需要着色器。先取得上下文，再设置清除颜色，最后执行清除操作，就能验证浏览器是否成功创建了 WebGL 绘制环境。`clearColor` 只设置状态，真正执行清除的是 `clear`。

`gl.clear()` 需要指定要清除的缓冲区位掩码。不要把“未设置清除颜色时有初始值”理解成“可以不给 clear 传参数”。

```html
<canvas id="demo" width="500" height="500">
please use a browser that supports "canvas"
</canvas>
<script src="./lib/webgl-utils.js"></script>
<script src="./lib/webgl-debug.js"></script>
<script src="./lib/cuon-utils.js"></script>
<script>
window.onload = () => {
  const canvas = document.querySelector("#demo");
  const gl = getWebGLContext(canvas);
  if(!gl) {
    console.log("Failed to get the rendering context for WebGL");
    return;
  }
  gl.clearColor(0.0, 0.0, 0.0, 1.0);// 控制颜色
  gl.clear(gl.COLOR_BUFFER_BIT);
}
</script>
```

说明：

- 本例的 RGBA 颜色使用归一化分量：RGB 通道从 0.0 到 1.0 表示强度从低到高，α 从 0.0 到 1.0 表示从透明到不透明；最终透明效果还与画布合成及混合设置有关。
- WebGL 中的`gl.clear()`，方法实际上继承自 OpenGL，它基于多基本缓冲区模型，这可比二维绘图上下文复杂得多，清空绘图区域，实际上是在清空颜色缓冲区(color buffer)，传递参数`gl.COLOR_BUFFER_BIT`就是在告诉 WebGL 清空颜色缓冲区，除了颜色缓冲区，WebGL 还会使用其他种类的缓冲区。如：深度缓冲区、模板缓冲区
- 尚未调用设置函数时，清除值的初始状态分别为：颜色缓冲区对应`gl.clearColor(0.0, 0.0, 0.0, 0.0)`、深度缓冲区的默认值是`gl.clearDepth(1.0)`、模板缓冲区的默认值是`gl.clearStencil(0)`

## 绘制一个点

下面开始使用一对着色器。顶点着色器确定位置和点尺寸，片元着色器输出红色。这里位置的第四分量为 `1.0`，所以透视除法后，点仍位于画布中心。

绘点模式是 **`gl.POINTS`**，原笔记中的 `gl.POINT` 是笔误。`gl_PointSize` 使用浮点数，实际支持的点尺寸范围由实现决定。

```html
<canvas id="demo" width="500" height="500">
please use a browser that supports "canvas"
</canvas>
<script src="./lib/webgl-utils.js"></script>
<script src="./lib/webgl-debug.js"></script>
<script src="./lib/cuon-utils.js"></script>
<script>
window.onload = () => {
  // 顶点着色器程序
  // const VSHADER_SOURCE =
  // 'void main() {\n' +
  // ' gl_Position = vec4(0.0, 0.0, 0.0, 1.0); \n' + // 设置坐标
  // ' gl_PointSize = 10.0; \n' + // 设置尺寸
  // '}\n';

  // 片元着色器程序
  // const FSHADER_SOURCE = 'void main(){\n' +
  // ' gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); \n' + // 设置颜色
  // '}\n';

  // 顶点着色器程序
  const VSHADER_SOURCE = `
void main() {
  gl_Position = vec4(0.0, 0.0, 0.0, 1.0);
  gl_PointSize = 10.0; // 浮点型，不能为 10 -- 整型
}
`;

  // 片元着色器程序
  const FSHADER_SOURCE = `
void main(){
  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}
`;

  const canvas = document.querySelector("#demo");
  const gl = getWebGLContext(canvas);
  if(!gl) {
    console.log("Failed to get the rendering context for WebGL");
    return;
  }

  // 初始化着色器
  if(!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log("Failed to initialize shaders.");
    return;
  }

  // 设置 canvas 背景色
  gl.clearColor(0.0, 0.0, 1.0, 1.0);

  // 清空 canvas
  gl.clear(gl.COLOR_BUFFER_BIT);

  // 绘制一个点
  gl.drawArrays(gl.POINTS, 0, 1);
}
</script>
```

要使用 WebGL 进行绘图就必须使用着色器，在代码中，着色器程序是以字符串的形式“嵌入”在 JS 文件中的，用`\n`结束是由于当着色器内部出错时，就能获取出错的行号，对检查源代码很有帮助，但不是必须的。

WebGL 有两种着色器：

- 顶点着色器（Vertex shader）：顶点着色器是用来描述顶点特性（如位置、颜色等）的程序，顶点（vertex）是指二维或三维空间中的一个点，比如二维或三维图形的端点或交点
- 片元着色器（Fragment shader）：进行逐片元处理过程如光照的程序，片元（fragment）是一个 WebGL 术语，可以将其理解为像素（图像的单元）

着色器运行在 WebGL 系统中，而不是 JavaScript 程序中

gl_Position 变量必须被赋值，否则着色器就无法正常工作，相反，gl_PointSize 不是必须，如果不赋值，着色器就会为其取默认值 1.0

GLSL ES 是一种强类型的编程语言：

- float 类型：表示浮点数
- vec4 类型：表示由四个浮点数组成的矢量

齐次坐标：

由四个分量组成的矢量被称为

齐次坐标

，因为它能提高处理三维数据的效率，所以在三维图形系统中被大量使用，齐次坐标使用如下的符号描述（x, y, z, w）,等价于三维坐标（x/w, y/w, z/w），所以如果齐次坐标的第 4 个分量是 1，你就可以将它当做三维坐标来使用，对于表示有限位置的齐次坐标，做透视除法时 w 不能为 0；w = 0 常用来表示方向。不要把齐次坐标的一般定义与裁剪空间中的可见性条件混为一谈。

`gl.drawArrays(mode, first, count)`:

- mode: 指定绘制的方式，可接收以下常量符号：gl.POINTS、gl.LINES、gl.LINE_STRIP、gl.LINE_LOOP、gl.TRIANGLES、gl.TRIANGLE_STRIP、gl.TRIANGLE_FAN
- first：指定从哪个顶点开始绘制（整型数），从 0 开始
- count：指定绘制需要用到多少个顶点（整型数）

当 gl_Position.w = 1、使用覆盖整个画布的视口时，可以用归一化设备坐标理解二维位置：

- `<canvas>` 的中心点：（0.0, 0.0, 0.0）
- `<canvas>` 的上边缘和下边缘：（0.0, 1.0, 0.0）和（0.0, -1.0, 0.0）
- `<canvas>` 的左边缘和右边缘：（-1.0, 0.0, 0.0）和（1.0, 0.0, 0.0）

WebGL 应用不需要像某些原生图形程序那样手动调用交换缓冲区函数；画布内容的呈现由浏览器管理。

## 通过变量绘制一个点

写死在着色器中的数值不便交互。把位置和尺寸声明为 `attribute`，JavaScript 就能在绘制前赋值。此时尚未启用对应的属性数组，所以 `vertexAttrib3f`、`vertexAttrib1f` 设置的常量属性值会参与绘制。

`getAttribLocation` 失败时返回 `-1`，而 `getUniformLocation` 失败时返回 `null`。两者的返回类型不同，排查时不要套用同一套判断。

```html
<canvas id="canvas" width="500" height="500">
please use a browser that supports "canvas"
</canvas>
<script src="./lib/webgl-utils.js"></script>
<script src="./lib/webgl-debug.js"></script>
<script src="./lib/cuon-utils.js"></script>
<script>
window.onload = () => {
  // 顶点着色器程序
  const VSHADER_SOURCE = `
attribute vec4 a_Position; attribute float a_PointSize;
void main() {
  gl_Position = a_Position;
  gl_PointSize = a_PointSize;
}
`
  // 片元着色器程序
  const FSHADER_SOURCE = `
void main() {
  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}
`
  const canvas = document.querySelector("#canvas");
  const gl = getWebGLContext(canvas);
  if(!gl) throw new Error("无法创建 WebGL 上下文");
  console.log(gl);
  if(!gl) {
    console.log("Failed to get the rendering context for WebGL");
    return;
  }
  // 初始化着色器
  if(!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log("Failed to initialize shaders.");
    return;
  }
  // 获取 attribute 变量的存储位置
  const a_Position = gl.getAttribLocation(gl.program, "a_Position");
  const a_PointSize = gl.getAttribLocation(gl.program, "a_PointSize")
  if(a_Position < 0) {
    console.log("Failed to get the storage location of a_Position");
    return;
  }
  if(a_PointSize < 0) {
    console.log("Failed to get the storage location of a_PointSize");
    return;
  }
  // 将顶点位置传输给 attribute 变量
  gl.vertexAttrib3f(a_Position, 0.0, 0.0, 0.0);
  gl.vertexAttrib1f(a_PointSize, 40.0);
  // 设置 canvas 背景色
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  // 清空 canvas
  gl.clear(gl.COLOR_BUFFER_BIT);
  // 绘制一个点
  gl.drawArrays(gl.POINTS, 0, 1);
}
</script>
```

将位置信息从 JS 中传给顶点着色器，有两种方式可以实现：

- attribute 变量：传输的是那些与顶点相关的数据
- uniform 变量：传输的是那些对于所有顶点都相同（或与顶点无关）的数据

## 通过鼠标绘制点

浏览器鼠标坐标从视口左上角起算，而这个二维例子的中心是 `(0, 0)`，向上为正。因此需要先减去画布左上角的位置，再把宽高范围映射到 `[-1, 1]`。

换算使用 `getBoundingClientRect()` 的宽高，才能适应画布被 CSS 缩放的情况。下面假设画布没有边框和内边距，也没有旋转、倾斜等 CSS 变换。每次点击保存一个点，再清空画布并重画所有已保存的点，避免依赖画布上一次绘制留下的内容。

```html
<canvas id="canvas" width="300" height="500">
please use a browser that supports "canvas"
</canvas>
<script src="./lib/webgl-utils.js"></script>
<script src="./lib/webgl-debug.js"></script>
<script src="./lib/cuon-utils.js"></script>
<script>
window.onload = () => {
  // 顶点着色器程序
  const VSHADER_SOURCE = `
attribute vec4 a_Position;
void main() {
  gl_Position = a_Position;
  gl_PointSize = 10.0;
}
`
  // 片元着色器程序
  const FSHADER_SOURCE = `
void main() {
  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}
`
  const canvas = document.querySelector("#canvas");
  const gl = getWebGLContext(canvas);
  if(!gl) throw new Error("无法创建 WebGL 上下文");
  // 初始化着色器
  if(!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log("Failed to initialize shaders.");
    return;
  }
  // 获取 attribute 变量的存储位置
  const a_Position = gl.getAttribLocation(gl.program, "a_Position");
  canvas.addEventListener("click", function(e) {
    handleClick(e, gl, canvas, a_Position);
  }, false);
  let g_points = [];// 鼠标点击位置数组
  function handleClick(e, gl, canvas, a_Position) {
    const { clientX, clientY } = e;
    const { left, top, width, height } = canvas.getBoundingClientRect();
    const x = ((clientX - left) - width / 2) / (width / 2);
    const y = (height / 2 - (clientY - top)) / (height / 2);
    g_points.push(x);
    g_points.push(y);
    gl.clear(gl.COLOR_BUFFER_BIT);
    for(let i = 0, len = g_points.length;i < len;i += 2) {
      gl.vertexAttrib3f(a_Position, g_points[i], g_points[i + 1], 0.0);
      gl.drawArrays(gl.POINTS, 0, 1);
    }
  }
}
</script>
```

## 动态改变片元着色器

这里改变的是传入片元着色器的颜色参数，不是每次点击都重新编译着色器。用一个 `uniform vec4` 保存当前颜色；绘制每个点之前更新它，就能让不同象限中的点呈现不同颜色。

示例将坐标与颜色分别保存。第一象限为红色，第三象限为绿色，其余位置为白色；边界点按代码条件归入相应分支。

```html
<canvas id="canvas" width="300" height="500">
please use a browser that supports "canvas"
</canvas>
<script src="./lib/webgl-utils.js"></script>
<script src="./lib/webgl-debug.js"></script>
<script src="./lib/cuon-utils.js"></script>
<script>
window.onload = () => {
  // 顶点着色器程序
  const VSHADER_SOURCE = `
attribute vec4 a_Position;
void main() {
  gl_Position = a_Position;
  gl_PointSize = 10.0;
}
`
  // 片元着色器程序
  const FSHADER_SOURCE = `
precision mediump float;
uniform vec4 u_FragColor;
void main() {
  gl_FragColor = u_FragColor;
}
`
  const canvas = document.querySelector("#canvas");
  const gl = getWebGLContext(canvas);
  if(!gl) throw new Error("无法创建 WebGL 上下文");
  // 初始化着色器
  if(!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log("Failed to initialize shaders.");
    return;
  }
  // 获取 attribute 变量的存储位置
  const a_Position = gl.getAttribLocation(gl.program, "a_Position");
  const u_FragColor = gl.getUniformLocation(gl.program, "u_FragColor");
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  canvas.addEventListener("click", function(e) {
    handleClick(e, gl, canvas, a_Position, u_FragColor);
    // gl.clear(gl.COLOR_BUFFER_BIT);
  }, false);
  let g_points = [];// 鼠标点击位置数组
  let g_colors = [];// 存储点颜色的数组
  function handleClick(e, gl, canvas, a_Position, u_FragColor) {
    const { clientX, clientY } = e;
    const { left, top, width, height } = canvas.getBoundingClientRect();
    const x = ((clientX - left) - width / 2) / (width / 2);
    const y = (height / 2 - (clientY - top)) / (height / 2);
    g_points.push([x, y]);
    if(x >= 0.0 && y > 0.0) {// 第一象限
      g_colors.push([1.0, 0.0, 0.0, 1.0]);
    } else if(x < 0.0 && y < 0.0) {// 第三象限
      g_colors.push([0.0, 1.0, 0.0, 1.0])
    } else {// 其他
      g_colors.push([1.0, 1.0, 1.0, 1.0]);
    }
    gl.clear(gl.COLOR_BUFFER_BIT);
    for(let i = 0, len = g_points.length;i < len;i++) {
      const rgba = g_colors[i];
      const xy = g_points[i];
      gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);
      // 将点的颜色传输到 u_FragColor
      gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
      gl.drawArrays(gl.POINTS, 0, 1);
    }
  }
}
</script>
```

- 片元着色器负责处理颜色
- `gl.getAttribLocation()`不存在返回 -1
- `gl.getUniformLocation()`不存在返回 null
- WebGL 系统中的绘制操作实际上是在颜色缓冲区中进行绘制的

## 系列文章

- [WebGL 编程指南（一）：WebGL 概述](/posts/webgl-guide-01-overview/)
- [WebGL 编程指南（三）：绘制和变换三角形](/posts/webgl-guide-03-triangles-transforms/)
- [WebGL 编程指南（四）：高级变换与动画基础](/posts/webgl-guide-04-animation/)
- [WebGL 编程指南（五）：颜色与纹理](/posts/webgl-guide-05-colors-textures/)
- [WebGL 编程指南（七）：进入三维世界](/posts/webgl-guide-07-3d-world/)

本系列保留阅读笔记的原章节编号，第六篇暂缺。
