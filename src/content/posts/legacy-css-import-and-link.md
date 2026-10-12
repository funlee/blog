---
slug: "legacy-css-import-and-link"
title: "import和link"
description: "记录 CSS 中 @import 与 HTML link 引入样式的区别。"
publishedAt: "2016-05-24T23:51:26+08:00"
category: "engineering"
tags: ["frontend"]
---

本质上，这两种方式都是为了加载CSS文件，但还是存在着细微的差别。

一：link属于XHTML标签，而@import完全是CSS提供的一种方式。

link标签除了可以加载CSS外，还可以做很多其它的事情，比如定义RSS，定义rel连接属性等，@import就只能加载CSS了。

二：加载发现时机的差别。浏览器解析 HTML 时就能发现 link 引用的 CSS；外部样式表中的 @import 则需要等包含它的样式表被获取并解析后才能发现，可能形成额外的串行加载。它并不是必须等整个页面下载完才开始加载。

三：兼容性的差别。@import 在 CSS1 中就已存在；早期浏览器对它的支持有差异，需要结合具体版本考虑。

四：使用 DOM 控制样式时的差别。link 是 DOM 元素，可以直接创建、删除或修改属性；@import 是 CSS 规则，不是 DOM 元素，但可以通过 CSSOM 操作，访问外部样式表规则时还受同源限制。
