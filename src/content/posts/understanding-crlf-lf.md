---
slug: "understanding-crlf-lf"
title: "理解 CRLF，LF"
description: "从一次 Go 配置文件读取问题出发，理解 CRLF 与 LF 的区别，以及 Git 中 core.autocrlf、core.safecrlf 和 .gitattributes 的作用。"
publishedAt: "2020-05-24T08:05:00+08:00"
category: "engineering"
tags: ["tools"]
source: "yuque"
sourceId: "eqsx9i"
sourceTitle: "【12】理解 CRLF，LF"
sourceUrl: "https://www.yuque.com/funlee/eceni8/eqsx9i"
---

## CRLF 与 LF 是什么

CRLF、LF 是表示文本换行的方式。CR（Carriage Return）代表回车，对应字符 `\r`；LF（Line Feed）代表换行，对应字符 `\n`。CRLF 则是 `\r\n` 两个字符的组合。

由于历史原因，不同操作系统通常使用不同的换行符：Windows 常用 CRLF，Linux 和现代 macOS 常用 LF。不过，具体文件使用哪一种换行符，还取决于编辑器和工具的设置。

## 一次跨平台读取文件的问题

系统间的这个差异，给跨平台协作开发和运行带来了不少麻烦。最近写的代码就遇到了这个问题。

下面是一段按行处理配置文件的 Go 代码。在读取一行字符之后，我想去掉开头和结尾的空格与换行符，当时的处理方式是：

```go
func InterpretQueryLine(data []byte) {
    strLine := strings.Trim(string(data), " \n")
    _ = strLine // 后续处理逻辑省略
}
```

本来在自己的 Ubuntu 系统上跑得很好，觉得没 bug 就提交了。然而，同事使用的是 Windows 系统，他编译之后怎么跑都不正常。由于我对 Go 不熟悉，调试了很久才发现是换行符的问题。

配置文件使用 CRLF 时，一次换行包含 `\r\n` 两个字符，只删除 `\n` 会留下 `\r`。在读取文件时，不能仅凭自己的系统环境假定文件的换行方式。

如果需求仍然是去掉两端的普通空格、回车和换行，可以这样处理：

```go
strLine := strings.Trim(string(data), " \r\n")
```

如果需要去掉两端所有 Unicode 空白字符，也可以使用 `strings.TrimSpace`。不过，它还会移除制表符等空白字符，要根据配置文件的规则选择。

## 换行符为什么会影响 Git 协作

平常受到换行符问题的困扰，更多来自协作开发工具，比如 Git。有时候只改了源码中的一行，提交时却发现整个文件都被修改了；有时候拉取最新分支，明明改动不大，合并时却出现了大量冲突。换行符不一致会给查看差异和合并代码带来很大不便。

为了方便下面的解释，先约定两个说法：

1. **标准化**：将文本中的 CRLF 转为 LF，通常发生在文件通过 `git add` 进入暂存区时，之后随提交保存在仓库中。
2. **检出转换**：从仓库检出文件到工作区时，按配置将 LF 转为 CRLF。

## core.autocrlf 与 core.safecrlf

### core.autocrlf

`core.autocrlf` 用于控制自动换行符转换，可选值为 `true`、`input` 和 `false`：

| 值 | 作用 |
| --- | --- |
| `true` | 对符合自动文本检测条件的文件进行标准化，检出时转换为 CRLF |
| `input` | 入库时进行标准化，检出时不转换为 CRLF |
| `false` | 关闭此配置项触发的自动转换；文件仍可能受 `.gitattributes` 控制 |

可以使用 `--global` 设置当前用户的配置，或使用 `--local` 仅针对当前仓库设置。例如，Windows 开发者希望工作区使用 CRLF，可以设置：

```bash
 git config --global core.autocrlf true
```

Linux、macOS 开发者希望入库时标准化，检出时保留 LF，可以设置：

```bash
 git config --global core.autocrlf input
```

实际配置可能受安装选项、全局设置和项目设置影响，可以查看当前生效值及其来源：

```bash
 git config --show-origin --get core.autocrlf
```

不要把自动转换理解为对所有文件无条件生效。Git 会检测文本与二进制内容，文件已经存入仓库时的换行形式也可能影响结果；混合换行符的文件应结合具体属性和配置检查。

### core.safecrlf

Git 无法绝对准确地判断所有文件是否为文本，因此提供了 `core.safecrlf`，用于在启用换行符转换时检查转换是否可逆：

- `true`：拒绝在当前配置下不可逆的转换。
- `warn`：对不可逆的转换发出警告，但继续操作。
- `false`：关闭这项检查。

例如，设置当前仓库在遇到不可逆转换时发出警告：

```bash
 git config --local core.safecrlf warn
```

CRLF 与 LF 混合的文件在统一换行符后，无法恢复原来的混合形式，因此可能触发检查。它检查的是转换的可逆性，并不是简单地禁止所有混合换行符文件。

## 用 .gitattributes 统一项目规则

`core.autocrlf` 依赖每位开发者的机器配置，很难保证每个人都设置一致。可以在项目根目录添加 `.gitattributes`，把规则随代码一起提交，让团队共享相同的约定。

文件中每行的基本形式是：

```text
pattern attr1 attr2 ...
```

`pattern` 是匹配文件路径的模式，后面是用空格分隔的属性。例如，`*.js` 匹配 JavaScript 文件，`src/**` 匹配 `src` 目录下的文件。

与换行符有关的常用属性如下：

| 属性 | 含义 |
| --- | --- |
| `text` | 明确按文本处理，入库时标准化为 LF |
| `-text` | 不进行换行符转换 |
| `text=auto` | 由 Git 判断文件是否为文本，再决定是否标准化 |
| `eol=lf` | 指定文本文件在工作区使用 LF |
| `eol=crlf` | 指定文本文件在工作区使用 CRLF |
| `binary` | 二进制属性宏，包含 `-text`，不进行换行符转换 |

显式的 `text`、`eol` 属性可以覆盖对应的自动转换行为。没有指定 `text` 时，Git 会参考 `core.autocrlf`；启用了文本转换但未指定 `eol` 时，工作区换行形式还会受 Git 配置与平台默认值影响。

同一个 `.gitattributes` 文件中，如果多条规则匹配同一文件，后面的规则会按属性覆盖前面的规则。

例如，可以为项目配置以下规则：

```gitattributes
*       text=auto
*.js    text eol=lf
*.sh    text eol=lf
*.bat   text eol=crlf
*.png   -text
*.jpg   -text
```

这组示例让 Git 自动判断其余文件；JavaScript 和 Shell 文件在工作区使用 LF，批处理文件使用 CRLF，图片不参与换行符转换。

如果文件里只有下面这一行：

```gitattributes
* text=auto
```

它会启用自动文本检测和标准化，但不会修改每个人的 `core.autocrlf` 配置，也不保证所有人的工作区使用同一种换行符。希望明确统一工作区格式时，应再指定 `eol`。

因此，在规范项目换行符方面，我更推荐使用 `.gitattributes`：规则可以随项目管理，也方便按文件类型作出不同约定。

## 参考资料

- [Mind the End of Your Line](http://adaptivepatchwork.com/2012/03/01/mind-the-end-of-your-line/)
- [Git：gitattributes 文档](https://git-scm.com/docs/gitattributes)
- [Git：core.autocrlf 与 core.safecrlf 配置](https://git-scm.com/docs/git-config#Documentation/git-config.txt-coresafecrlf)
- [Go：strings 包文档](https://pkg.go.dev/strings#Trim)
