---
slug: "webpack-interview-notes"
title: "webpack 面试题集合"
description: "围绕 webpack 的构建流程、Loader、Plugin、Source Map、HMR 与性能优化，整理适用于 webpack 5 的知识框架。"
publishedAt: "2021-04-21T23:57:00+08:00"
updatedAt: "2026-10-13T11:52:56+08:00"
category: "engineering"
tags: ["frontend"]
source: "yuque"
sourceId: "nfpnqw"
sourceTitle: "webpack 面试题集合"
sourceUrl: "https://www.yuque.com/funlee/ez5odb/nfpnqw"
---

webpack 的问题容易被拆成许多零散名词：Loader、Plugin、HMR、Tree Shaking、代码分割。把它们放回构建流程里理解，就能知道每项能力解决什么问题，以及应该在哪个环节排查故障。

以下主要以 webpack 5 的常见 JavaScript 项目为背景。原笔记中出现的一些旧工具和配置会说明适用年代，避免把不同版本的方案混在一起。

## webpack 在做什么

webpack 从入口模块出发，分析依赖关系，构建模块图，并根据配置把模块组织成 chunk，最终输出 JavaScript、样式、图片等资源。

“模块”“chunk”和“输出文件”不是完全相同的概念。模块是依赖图中的组织单位；chunk 是模块分组和加载安排的一部分；最终资源则是写入输出目录的文件。不能总是假定一个模块对应一个文件，或一个 chunk 只输出一种资源。

webpack 也不是只能识别 JavaScript 文本。它本身具备对 JSON、资源模块等内容的处理能力；TypeScript、JSX、特定样式语言等通常还需要相应转换工具。

## Loader 与 Plugin 有什么区别

Loader 主要参与模块内容的转换。例如把 TypeScript 转成 JavaScript，或者把 CSS 内容转成后续步骤能够处理的模块。Loader 通过 `module.rules` 配置，普通转换阶段按从右到左、从下到上的顺序执行。

```javascript
// 片段：先由 css-loader 处理依赖，再由 style-loader 在开发时注入样式
module.exports = {
  module: {
    rules: [{ test: /\.css$/i, use: ['style-loader', 'css-loader'] }],
  },
};
```

这是简化的开发用法；生产环境常使用样式提取方案。Loader 还存在 pitch 阶段，不能把普通阶段的执行顺序推广到它的所有生命周期。

Plugin 通过构建生命周期的钩子参与工作，可以处理资源输出、生成 HTML、分析构建结果等更广泛的任务。它通常在 `plugins` 中以实例形式配置。

可以把二者的区别概括为：Loader 侧重某个模块如何转换，Plugin 侧重构建流程中的扩展行为。它们没有简单的互相替代关系。

## 一次构建的大致流程

1. 读取并合并配置，创建编译器，注册插件。
2. 从入口开始解析模块，按规则执行转换，收集依赖。
3. 继续处理依赖模块，形成模块图。
4. 根据入口、动态导入与优化配置组织 chunk，生成并优化资源。
5. 输出文件，同时生成统计信息和错误信息。

这是理解流程的逻辑顺序，不表示每一步都只是一个严格串行、同步执行的函数。Loader 和插件可能包含异步工作，监听模式下还会复用缓存并处理后续变化。

## Source Map：调试能力与发布策略

Source Map 描述生成代码与原始代码的位置映射，便于在压缩、转换后定位问题。`devtool` 的选择涉及构建速度、重建速度、映射精度和源码暴露方式。

| 配置 | 常见用途 | 注意事项 |
| --- | --- | --- |
| `eval-cheap-module-source-map` | 开发调试的一种选择 | 构建性能与映射精度需要结合项目验证 |
| `source-map` | 生成独立映射文件 | 产物会包含映射引用，公开部署时可被访问 |
| `hidden-source-map` | 将映射交给错误监控系统 | 只是省略映射引用，不会自动保护公开目录里的文件 |
| `nosources-source-map` | 不把源码正文写入映射 | 仍可能暴露文件名和结构，不等于完全保密 |

需要保护源码时，应控制映射文件的上传与访问范围，而不是仅仅更换 `devtool` 名字。大型映射文件也会影响构建时间与存储体积。

## HMR 为什么能保留部分页面状态

热模块替换（HMR）允许运行中的应用接收模块更新，尽量避免整页刷新。开发服务器通知客户端有更新后，运行时取得更新内容，并沿依赖关系寻找能够接受更新的边界。

如果某个边界接收了更新，就可以执行旧模块的清理逻辑并应用新模块；如果无法安全处理，通常仍会回退到刷新。具体通信和资源加载方式取决于开发服务器、运行目标及版本，不能一概描述成某一种 JSONP 流程。

HMR 与框架的状态恢复也不是同一个层次。React Fast Refresh 等集成会在框架语义下判断哪些状态可以保留；不是安装一个 webpack 插件，就能保证任何组件修改后都保留状态。

还要清理模块持有的定时器、监听器等资源，否则热更新多次后可能重复注册。对应的 webpack 插件名是 `HotModuleReplacementPlugin`，开发服务器的集成方式应按所用版本配置。

## 优化之前，先分清要优化什么

冷启动构建、修改后的重建、产物大小和页面运行速度，是不同的指标。减少构建时间不一定会减少下载体积，拆出更多文件也不一定能提升真实加载体验。

应先测量瓶颈：是转换器慢、磁盘读取多、模块数量大、压缩耗时，还是浏览器下载与执行成本过高？然后再选择措施。

### 减少无效处理与重复工作

通过 `include`、`exclude` 缩小转换范围，避免让复杂 Loader 无差别处理所有依赖。对确实需要转译的第三方包，再明确加入范围。

webpack 5 的文件系统缓存可以加速后续构建。修改构建配置时，也应让缓存知道相关依赖发生变化。下面是一个最小配置示例，保存为 `webpack.config.cjs`，适用于项目已经安装 webpack、webpack-cli、babel-loader、@babel/core 和 @babel/preset-env 的情况：

```javascript
const path = require('node:path');

module.exports = {
  mode: 'production',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
    clean: true,
  },
  cache: {
    type: 'filesystem',
    buildDependencies: { config: [__filename] },
  },
  module: {
    rules: [{
      test: /\.js$/,
      include: path.resolve(__dirname, 'src'),
      use: {
        loader: 'babel-loader',
        options: { presets: ['@babel/preset-env'] },
      },
    }],
  },
};
```

示例中的 Babel 目标浏览器还应通过项目的 Browserslist 等配置确定。语法转换也不自动等于提供所有缺失的运行时 API，polyfill 需要按目标环境和加载策略单独处理。

`resolve.extensions` 不宜堆积无用后缀；但为了少做解析而强行只使用某个包入口，也可能丢失 ESM 版本带来的优化机会。`noParse` 则只适合明确不需要继续解析依赖的模块，不能随意用于仍含导入语句的代码。

### 并行处理要覆盖启动与通信成本

一些压缩工具支持并行执行，复杂转换也可以评估 worker 方案。但创建进程、传输数据都有开销，小项目或很轻的任务未必受益。

HappyPack、DLL、cache-loader、hard-source 等方案常见于旧文章。对于 webpack 5 项目，应先检查原生缓存和当前维护中的工具是否已经解决问题，避免重复叠加缓存层。旧版本压缩插件的 `cache` 参数，也不能直接照搬到新版本。

### 控制产物体积与加载时机

动态 `import()` 可以把非首屏必须的功能延后加载；`SplitChunksPlugin` 用于按规则提取共享代码。拆分策略应结合缓存命中和真实访问路径，不能只追求文件越小越多。

`externals` 是让某些依赖在打包结果外提供，并没有让依赖消失。它要求运行环境确实提供对应依赖，还要考虑版本、可用性和部署顺序。

图片可以在构建前或可缓存的资源流程中压缩；不必每次开发重建都重复昂贵处理。CSS 删除未使用选择器时，需要保护动态生成的类名，否则可能误删运行时才出现的样式。

## Tree Shaking 与 Scope Hoisting

Tree Shaking 利用模块的静态信息分析哪些导出未被使用，再结合副作用信息与压缩阶段删除可安全移除的代码。ESM 的静态结构更适合这类分析，但并不意味着写了 `import` 就一定没有冗余代码。

`sideEffects` 声明尤其要谨慎。样式导入、全局注册和 polyfill 都可能具有副作用；如果把整个包错误地声明为无副作用，构建工具就可能删除必要代码。例如包含样式的包可以按实际情况保留 CSS：

```json
{
  "sideEffects": ["**/*.css"]
}
```

这只是示例；如果还有其他带副作用的文件，也必须一并声明。

Scope Hoisting 则通过合并符合条件的模块作用域，减少部分包装和调用开销。它与 Tree Shaking 目标不同，也不能保证把所有模块合成一个函数。

生产模式会启用一组默认优化，但仍需要审查包的导出形式、依赖引用方式和实际构建结果。配置优化的价值最终要落实到可测量的构建速度、资源体积和用户体验上。

参考：[webpack 概念](https://webpack.js.org/concepts/)、[构建性能指南](https://webpack.js.org/guides/build-performance/)、[devtool](https://webpack.js.org/configuration/devtool/)、[Tree Shaking](https://webpack.js.org/guides/tree-shaking/)。
