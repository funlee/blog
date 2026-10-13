---
slug: "npm-shrinkwrap-dependencies"
title: "使用 npm shrinkwrap 来管理项目依赖"
description: "理解依赖版本的不确定性，记录使用 npm shrinkwrap 新增、升级、删除依赖的流程，以及它与 package-lock.json 的区别。"
publishedAt: "2020-05-24T08:34:00+08:00"
category: "engineering"
tags: ["frontend", "tools"]
source: "yuque"
sourceId: "yz21o5"
sourceTitle: "【13】使用 npm shrinkwrap 来管理项目依赖"
sourceUrl: "https://www.yuque.com/funlee/eceni8/yz21o5"
---

## 为什么要锁定依赖

npm 及其语义化版本管理，让开发过程中依赖的获取和升级变得非常容易。但不严格的版本范围，也带来了版本的不确定性，主要有以下问题：

1. 如果依赖包没有遵循语义化版本约定，在本应兼容的版本中引入了破坏性更改，而项目使用 `^` 等版本范围，就存在潜在风险。
2. npm 依赖具有层级结构。在 `package.json` 中使用精确版本，可以控制直接依赖，但不能单靠这些声明锁定所有间接依赖。第三方包不严谨的依赖声明，也可能影响项目。
3. 如果没有锁定依赖，开发阶段安装的版本与后续部署时安装的版本可能不同；间接依赖也存在同样的问题，增加了上线风险。

`npm-shrinkwrap.json` 可以记录依赖树，帮助减少上述不确定性。下面是使用它管理依赖的一套流程。

## 引入一个新包

1. 执行 `npm install PACKAGE_NAME@VERSION --save`，安装指定版本。
2. 测试功能。
3. 测试正常后，执行 `npm shrinkwrap`，生成或确认锁文件。
4. 将 `npm-shrinkwrap.json` 和 `package.json` 一起提交到代码仓库。

这里的 `PACKAGE_NAME` 和 `VERSION` 是占位符，需要替换为真实包名和版本。如果还希望 `package.json` 中保存精确版本，可以添加 `--save-exact`；仅指定安装版本，不代表保存时一定没有版本范围前缀。

## 升级一个包

1. 执行 `npm outdated`，查看依赖的更新信息。
2. 执行 `npm install PACKAGE_NAME@VERSION --save`，安装目标版本。
3. 测试功能，检查升级是否影响现有行为。
4. 执行 `npm shrinkwrap`，检查锁文件中的变化。
5. 提交更新后的 `npm-shrinkwrap.json` 和 `package.json`。

## 删除一个包

1. 执行 `npm uninstall PACKAGE_NAME --save`，删除依赖。
2. 测试功能。
3. 检查 `npm-shrinkwrap.json` 中对应的依赖变化，必要时执行 `npm shrinkwrap`。
4. 提交更新后的锁文件和 `package.json`。

## 与 package-lock.json 的区别

### 版本背景

`package-lock.json` 从 npm 5 开始引入。在更早的 npm 环境中，`npm-shrinkwrap.json` 是锁定依赖的一种方案。不同 npm 版本生成的锁文件格式也可能不同，团队应尽量统一使用的 npm 版本。

### 创建与安装

正常启用锁文件功能时，`npm install` 可以生成 `package-lock.json`。单独运行 `npm init` 主要是初始化 `package.json`，不能理解为一定会生成锁文件。

执行 `npm shrinkwrap` 时，如果已有 `package-lock.json`，会将其转换为 `npm-shrinkwrap.json`。当两个文件同时存在时，npm 优先使用 `npm-shrinkwrap.json`，忽略 `package-lock.json`。

锁文件需要与 `package.json` 保持一致，不能简单理解为它会无条件覆盖清单中的依赖要求。

### 文件更新

`npm-shrinkwrap.json` 不只会在运行 `npm shrinkwrap` 时更新。已有该文件时，安装、升级和卸载依赖的 npm 命令也会维护它。

同样，`package-lock.json` 通常由相关 npm 命令维护，并不是手动修改 `package.json` 或 `node_modules` 后，就会立即自动同步。

### 发布 npm 包

`package-lock.json` 不随 npm 包发布，主要用于项目自身的依赖安装。`npm-shrinkwrap.json` 则可以随包发布，因此会影响使用者安装该包时的依赖解析。是否采用后者，应结合发布用途决定。

## 参考资料

- [美团技术团队：使用 npm shrinkwrap 来管理项目依赖](https://tech.meituan.com/2015/10/23/npm-shrinkwrap.html)
- [原笔记中的掘金参考文章](https://juejin.im/post/5c53bea8e51d457fbe226efb)
- [npm：npm-shrinkwrap.json](https://docs.npmjs.com/cli/v11/configuring-npm/npm-shrinkwrap-json/)
