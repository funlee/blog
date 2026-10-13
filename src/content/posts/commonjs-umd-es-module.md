---
slug: "commonjs-umd-es-module"
title: "CommonJS & UMD & ES Module"
description: "整理 CommonJS、UMD 和 ES Module 的作用、加载方式及使用场景。"
publishedAt: "2020-06-02T00:01:00+08:00"
category: "engineering"
tags: ["frontend"]
source: "yuque"
sourceId: "sc5r77"
sourceTitle: "【16】CommonJS & UMD & ES Module"
sourceUrl: "https://www.yuque.com/funlee/eceni8/sc5r77"
---

## CommonJS

CommonJS 是 Node.js 最早采用的模块体系。Node.js 也支持 ES Module，因此不能把 CommonJS 理解为 Node.js 唯一的模块形式。

在 CommonJS 中，每个文件都有自己的模块作用域。文件中定义的局部变量、函数和类，默认对其他模块不可见，需要通过导出接口供外部使用。

它的主要特点是：

- 顶层声明位于模块作用域中，不会直接成为全局变量。
- 对解析到同一个文件的模块，通常只在第一次 `require` 时执行，之后返回缓存的导出结果；清除相应缓存后可以重新加载。
- `require` 在代码执行到调用处时同步加载模块，后续代码要等待它返回后再执行。

同步加载适合许多本地模块场景。浏览器通过网络加载资源时，同步等待容易影响页面响应，因此曾广泛使用 [AMD（Asynchronous Module Definition）](https://github.com/amdjs/amdjs-api/wiki/AMD-(%E4%B8%AD%E6%96%87%E7%89%88)) 等异步加载方案。浏览器也可以使用原生 ES Module，并非必须采用 AMD。

Browserify、webpack 等构建工具能够处理 CommonJS 模块，将依赖组织成适合浏览器使用的产物。

## UMD

UMD（Universal Module Definition）提供兼容多种模块环境的包装模式，可以同时照顾 CommonJS、AMD 和全局变量引用方式。

常见实现会检测运行环境：

1. 检测 AMD，例如判断 `define` 是否为函数并具有 `define.amd` 标记。
2. 检测 CommonJS，例如判断 `module`、`module.exports` 是否可用。
3. 如果没有模块加载环境，就把接口暴露到全局对象。

不同 UMD 模板的检测顺序可能不同，关键是为不同环境提供相应的导出方式，而不是固定先检测哪一种。

因此，UMD 形式的库也可以通过普通 `<script>` 标签引用，在浏览器中使用它暴露的全局接口。

## ES Module

ES2015 引入了语言层面的模块机制，使用 `import` 和 `export` 描述模块之间的依赖与接口。

在支持 ES Module 的浏览器中，可以通过 `type="module"` 引入模块：

```html
<script type="module" src="./main.js"></script>
```

模块脚本默认延后执行，通常不需要再添加 `defer`；如果添加 `async`，执行时机则会改变。这里说的是执行行为，不是浏览器自动给标签加上了一个 `defer` 属性。

Rollup 和 webpack 2 及后续版本都能够处理 ES Module。

## 参考资料

- [原笔记中的掘金参考文章](https://juejin.im/post/5b7d2f45e51d4538826f4c28)
- [Node.js：CommonJS modules](https://nodejs.org/api/modules.html)
- [UMD 模式](https://github.com/umdjs/umd)
- [MDN：JavaScript modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
