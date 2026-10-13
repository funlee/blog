---
slug: "npm-save-and-save-dev"
title: "你真的懂 --save 和 --save-dev 吗？"
description: "理解 npm 的 --save 与 --save-dev，以及依赖分类对安装、前端构建和 npm 包使用者的影响。"
publishedAt: "2020-05-20T08:41:00+08:00"
category: "engineering"
tags: ["frontend", "tools"]
source: "yuque"
sourceId: "llwtf2"
sourceTitle: "【8】你真的懂--save和--save-dev吗？"
sourceUrl: "https://www.yuque.com/funlee/eceni8/llwtf2"
---

## 写入不同的依赖字段

使用 `npm install` 安装 npm 包时，可以通过参数将依赖信息写入 `package.json`：

```bash
npm install <包名> --save
npm install <包名> --save-dev
```

它们最直接的区别是：`--save` 将依赖写入 `dependencies`，`--save-dev` 将依赖写入 `devDependencies`。前者用于项目运行时需要的依赖，后者用于开发、测试和构建阶段需要的工具。

在本文编写时的 npm 6 中，安装新包默认就会将其保存到 `dependencies`，因此通常可以省略 `--save`；`--save-dev` 可以简写为 `-D`。

## 安装时有什么区别

在项目根目录正常执行 `npm install`，默认会安装 `dependencies` 和 `devDependencies` 中的依赖。

使用 `npm install --production`，或者将环境变量 `NODE_ENV` 设置为 `production` 时，会跳过 `devDependencies` 中的依赖。因此，如果项目需要先编译、打包，构建阶段仍然需要安装相应的开发依赖。

## 浏览器项目与 npm 包

对于最终运行在浏览器中的项目，依赖是否进入构建产物，取决于代码的引用关系和打包工具的配置，并不是 `dependencies` 和 `devDependencies` 中的所有包都会被打包进去。依赖分类仍然有意义：业务运行需要的库与仅用于开发、测试、构建的工具，应按用途区分。

如果要发布 npm 包，这个区别就更直接了。其他人在安装你的包时，npm 会根据你的 `package.json` 安装其中声明的 `dependencies`，通常不会安装你的 `devDependencies`。所以，发布后的代码仍然需要、且没有随产物一起打包的运行时依赖，应声明在 `dependencies` 中；只用于开发和构建的工具，则放在 `devDependencies` 中。

参考：[npm 6 的 npm install 文档](https://docs.npmjs.com/cli/v6/commands/npm-install/)、[npm 的 package.json 文档](https://docs.npmjs.com/cli/v11/configuring-npm/package-json/#devdependencies)。
