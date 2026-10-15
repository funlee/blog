---
slug: "webgl-guide-03-triangles-transforms"
title: "WebGL 编程指南（三）：绘制和变换三角形"
description: "通过顶点缓冲区绘制点、三角形和矩形，再用向量与矩阵完成平移、旋转和缩放。"
publishedAt: "2019-09-23T00:00:00+08:00"
updatedAt: "2026-10-15T14:50:14+08:00"
category: "engineering"
tags: ["frontend"]
source: "yinxiang"
sourceId: "a21615ce-5fb3-4242-b081-d8b0fadf2472"
sourceTitle: "WebGL编程指南(三)：绘制和变换三角形"
sourceUrl: "https://web.yinxiang.com/#?b=4f7e64f7-2736-44ba-b77b-b252036fbba5&n=a21615ce-5fb3-4242-b081-d8b0fadf2472&s=s56&"
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

## 绘制多个点

逐个调用 `vertexAttrib` 适合少量交互演示。要一次处理多个顶点，需要把一组坐标上传到缓冲区，让 WebGL 在绘制时依次读取。

下面每个顶点有两个浮点分量，三个点共六个数。`vertexAttribPointer` 中的 `2` 表示每个顶点取两个分量，不是总顶点数；`drawArrays` 中的 `n` 才表示本次绘制读取多少个顶点。

缓冲区配置分为五步：创建、绑定、上传数据、说明读取布局、启用属性数组。少了最后一步，属性仍会使用常量值。相关参数详见 [MDN 的 vertexAttribPointer 说明](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/vertexAttribPointer)。

- WebGL 提供了一种很方便的机制，即缓冲区对象（buffer object），它可一次性地向着色器传入多个顶点的数据，缓冲区对象是 WebGL 系统中的一块内存区域
- WebGL 通常需要同时处理大量相同类型的数据，例如顶点的坐标和颜色数据，为了优化性能，WebGL 为每种基本数据类型引入了一种特殊的数组---类型化数组，浏览器事先知道数值中的数据类型，处理起来更有效率。
- 类型化数组不支持`push()`和`pop()`方法

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
  const n = initVertexBuffers(gl);
  if(n < 0) {
    console.log("Failed to set the position of the vertices");
    return;
  }
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  // 绘制三个点
  gl.drawArrays(gl.POINTS, 0, n);
  function initVertexBuffers(gl) {
    const vertices = new Float32Array([0.0, 0.5, -0.5, -0.5, 0.5, -0.5]);
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

## 利用三角形绘制矩形

顶点数据与图元类型是两件事。同样三个顶点，使用 `POINTS` 会得到三个点，改成 `TRIANGLES` 则得到一个三角形。

矩形可以拆成两个三角形。下面四个顶点围绕矩形排列，使用 `TRIANGLE_FAN`，会组成 `(0, 1, 2)` 和 `(0, 2, 3)` 两个三角形。若改用 `TRIANGLE_STRIP`，需要相应安排交错的顶点顺序，不能只替换常量而忽略顺序。

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
  const n = initVertexBuffers(gl);
  if(n < 0) {
    console.log("Failed to set the position of the vertices");
    return;
  }
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  // 绘制三个点
  gl.drawArrays(gl.TRIANGLE_FAN, 0, n);
  function initVertexBuffers(gl) {
    const vertices = new Float32Array([-0.5, 0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5]);
    let n = 4;
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

`gl.drawArrays(mode, first, count)`，其中 mode 取值如下

- `gl.POINTS`：一系列点
- `gl.LINES`：一系列单独的线段，如果点是奇数，最后一个点将被忽略
- `gl.LINE_STRIP`：一系列连接的线段
- `gl.LINE_LOOP`：连接相邻顶点，并额外连接最后一个顶点与第一个顶点，形成闭合折线
- `gl.TRIANGLES`：一系列单独的三角形
- `gl.TRIANGLE_STRIP`：一系列带状的三角形
- `gl.TRIANGLE_FAN`：一系列三角形组成的类似于扇形的图形

WebGL 只能绘制三种图形：点、线段和三角形

## 平移操作

平移最直接的表达是给位置加一个偏移量。位置的齐次分量 `w` 为 1，而平移向量的 `w` 应为 0，才能只改变 xyz，不改变位置的齐次分量。

同一种变换也可以写成 4×4 矩阵，后续便能与旋转、缩放统一组合。下面 JavaScript 数组按列存储矩阵，所以平移量出现在数组末尾。上传矩阵时 `uniformMatrix4fv` 的第二个参数必须为 `false`。

这些点击示例只需要创建一次顶点缓冲区。点击时更新变换参数并重绘，不需要反复创建相同的 GPU 资源。

GLSL ES 中的赋值操作只能发生在相同类型的变量之间

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
attribute vec4 a_Position;uniform vec4 u_Translation;
void main() {
  gl_Position = a_Position + u_Translation;
}
`
  // 片元着色器程序
  const FSHADER_SOURCE = `
void main() {
  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}
`
  // 在 x, y, z 方向上平移的距离
  const canvas = document.querySelector("#canvas");
  const gl = getWebGLContext(canvas);
  if(!gl) throw new Error("无法创建 WebGL 上下文");
  // 初始化着色器
  if(!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    throw new Error("着色器初始化失败");
  }
  // 将平移距离传输给顶点着色器
  const u_Translation = gl.getUniformLocation(gl.program, "u_Translation");
  const n = initVertexBuffers(gl);
  render();// 初始化
  canvas.addEventListener("click", function() {
    render(0.5, 0.5, 0.5);
  }, false)
  function render(Tx = 0.0, Ty = 0.0, Tz = 0.0) {
    gl.uniform4f(u_Translation, Tx, Ty, Tz, 0.0);// 最后一个参数，这里是为了使平移后的第四分量和为 1.0
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    // 绘制三个点
    gl.drawArrays(gl.TRIANGLES, 0, n);
  }
  function initVertexBuffers(gl) {
    const vertices = new Float32Array([0, 0.5, -0.5, -0.5, 0.5, -0.5]);
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

利用矩阵实现平移：

```html
<canvas id="canvas" width="300" height="500">
please use a browser that supports "canvas"
</canvas>
<script src="./lib/webgl-utils.js"></script>
<script src="./lib/webgl-debug.js"></script>
<script src="./lib/cuon-utils.js"></script>
<script>
window.onload = () => {
  const VSHADER_SOURCE = `
attribute vec4 a_Position;
uniform mat4 u_xformMatrix;
void main() {
  gl_Position = u_xformMatrix * a_Position;
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
    render(0.5, 0.5, 0.0);
  }, false)
  function render(Tx = 0.0, Ty = 0.0, Tz = 0.0) {
    const xformMatrix = new Float32Array([
      1.0, 0.0, 0.0, 0.0,
      0.0, 1.0, 0.0, 0.0,
      0.0, 0.0, 1.0, 0.0,
      Tx, Ty, Tz, 1.0
    ]);
    const u_xformMatrix = gl.getUniformLocation(gl.program, "u_xformMatrix");
    gl.uniformMatrix4fv(u_xformMatrix, false, xformMatrix);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    // 绘制三个点
    gl.drawArrays(gl.TRIANGLES, 0, n);
  }
  function initVertexBuffers(gl) {
    const vertices = new Float32Array([0, 0.5, -0.5, -0.5, 0.5, -0.5]);
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

## 旋转操作

围绕 Z 轴旋转时，z 不变，x 与 y 由三角函数重新组合。下面公式对应以原点为中心的旋转；如果希望围绕图形自身某一点转动，需要先平移到原点，旋转后再平移回去。

JavaScript 的 `Math.sin`、`Math.cos` 接收弧度，因此用角度输入时要先乘 `Math.PI / 180`。矩阵形式与直接计算形式表达的是同一个变换。

假设 p1 (x1, y1, z1) 绕 Z 轴 旋转 β 角度之后变为了点 p2(x2, y2, z2)，则有：

```text
x2 = x1cosβ - y1sinβ
y2 = x1sinβ + y1cosβ
z2 = z1
```

例子：

```html
<canvas id="canvas" width="300" height="500">
please use a browser that supports "canvas"
</canvas>
<script src="./lib/webgl-utils.js"></script>
<script src="./lib/webgl-debug.js"></script>
<script src="./lib/cuon-utils.js"></script>
<script>
window.onload = () => {
  const VSHADER_SOURCE =
    // x' = x cosβ - y sinβ
    // y' = x sinβ + y cosβ
    // z' = z
    'attribute vec4 a_Position;\n' +
    'uniform float u_CosB, u_SinB;\n' +
    'void main() {\n' +
    ' gl_Position.x = a_Position.x * u_CosB - a_Position.y * u_SinB;\n' +
    ' gl_Position.y = a_Position.x * u_SinB + a_Position.y * u_CosB;\n' +
    ' gl_Position.z = a_Position.z;\n' +
    ' gl_Position.w = 1.0;\n' +
    '}\n';
  // Fragment shader program
  const FSHADER_SOURCE =
    'void main() {\n' +
    ' gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n' +
    '}\n';
  // 在 x, y, z 方向上平移的距离
  const canvas = document.querySelector("#canvas");
  const gl = getWebGLContext(canvas);
  if(!gl) throw new Error("无法创建 WebGL 上下文");
  // 初始化着色器
  if(!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    throw new Error("着色器初始化失败");
  }
  const n = initVertexBuffers(gl);
  render(0);// 初始化
  canvas.addEventListener("click", function() {
    render(90);
  }, false)
  function render(ANGLE = 0) {
    // 将旋转图形所需的数据传输给顶点着色器
    const radian = Math.PI * ANGLE / 180.0;// 转换为弧度制
    const cosB = Math.cos(radian);
    const sinB = Math.sin(radian);
    const u_CosB = gl.getUniformLocation(gl.program, "u_CosB");
    const u_SinB = gl.getUniformLocation(gl.program, "u_SinB");
    if(!u_CosB || !u_SinB) {
      console.log('Failed to get the storage location of u_CosB or u_SinB');
      return;
    }
    gl.uniform1f(u_CosB, cosB);
    gl.uniform1f(u_SinB, sinB);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    // 绘制三个点
    gl.drawArrays(gl.TRIANGLES, 0, n);
  }
  function initVertexBuffers(gl) {
    const vertices = new Float32Array([0, 0.5, -0.5, -0.5, 0.5, -0.5]);
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

利用矩阵实现旋转：

```html
<canvas id="canvas" width="300" height="500">
please use a browser that supports "canvas"
</canvas>
<script src="./lib/webgl-utils.js"></script>
<script src="./lib/webgl-debug.js"></script>
<script src="./lib/cuon-utils.js"></script>
<script>
window.onload = () => {
  const VSHADER_SOURCE = `
attribute vec4 a_Position;
uniform mat4 u_xformMatrix;
void main() {
  gl_Position = u_xformMatrix * a_Position;
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
  render(0);// 初始化
  canvas.addEventListener("click", function() {
    render(90);
  }, false)
  function render(ANGLE = 0) {
    // 将旋转图形所需的数据传输给顶点着色器
    const radian = Math.PI * ANGLE / 180.0;// 转换为弧度制
    const cosB = Math.cos(radian);
    const sinB = Math.sin(radian);
    const xformMatrix = new Float32Array([
      cosB, sinB, 0.0, 0.0,
      -sinB, cosB, 0.0, 0.0,
      0.0, 0.0, 1.0, 0.0,
      0.0, 0.0, 0.0, 1.0
    ]);
    const u_xformMatrix = gl.getUniformLocation(gl.program, "u_xformMatrix");
    gl.uniformMatrix4fv(u_xformMatrix, false, xformMatrix);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    // 绘制三个点
    gl.drawArrays(gl.TRIANGLES, 0, n);
  }
  function initVertexBuffers(gl) {
    const vertices = new Float32Array([0, 0.5, -0.5, -0.5, 0.5, -0.5]);
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

## 缩放操作

缩放矩阵把三个轴的缩放因子放在对角线上。`Sx`、`Sy` 相同会保持形状比例；不同则会拉伸。缩放中心仍是原点，放大后顶点超出裁剪范围的部分不会显示。

二维例子中的顶点 z 为 0，所以只调整 `Sz` 通常看不到变化。观察不到变化并不一定意味着矩阵无效，还需要考虑输入数据。

```html
<canvas id="canvas" width="300" height="500">
please use a browser that supports "canvas"
</canvas>
<script src="./lib/webgl-utils.js"></script>
<script src="./lib/webgl-debug.js"></script>
<script src="./lib/cuon-utils.js"></script>
<script>
window.onload = () => {
  const VSHADER_SOURCE = `
attribute vec4 a_Position;
uniform mat4 u_xformMatrix;
void main() {
  gl_Position = u_xformMatrix * a_Position;
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
    render(2.0, 2.0, 2.0);
  }, false)
  function render(Sx = 1, Sy = 1, Sz = 1) {
    const xformMatrix = new Float32Array([
      Sx, 0, 0, 0,
      0, Sy, 0, 0,
      0, 0, Sz, 0,
      0, 0, 0, 1
    ]);
    const u_xformMatrix = gl.getUniformLocation(gl.program, "u_xformMatrix");
    gl.uniformMatrix4fv(u_xformMatrix, false, xformMatrix);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    // 绘制三个点
    gl.drawArrays(gl.TRIANGLES, 0, n);
  }
  function initVertexBuffers(gl) {
    const vertices = new Float32Array([0, 0.5, -0.5, -0.5, 0.5, -0.5]);
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

## 系列文章

- [WebGL 编程指南（一）：WebGL 概述](/posts/webgl-guide-01-overview/)
- [WebGL 编程指南（二）：WebGL 入门](/posts/webgl-guide-02-getting-started/)
- [WebGL 编程指南（四）：高级变换与动画基础](/posts/webgl-guide-04-animation/)
- [WebGL 编程指南（五）：颜色与纹理](/posts/webgl-guide-05-colors-textures/)
- [WebGL 编程指南（七）：进入三维世界](/posts/webgl-guide-07-3d-world/)

本系列保留阅读笔记的原章节编号，第六篇暂缺。
