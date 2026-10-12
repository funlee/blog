---
slug: "legacy-night-notes-20160505"
title: "夜半碎碎念--20160505"
description: "2016 年 5 月 5 日的前端学习笔记与夜间随想。"
publishedAt: "2016-05-05T21:54:04+08:00"
category: "notes"
tags: ["frontend"]
---

你看他们都在辞职，你得加油呦，不然都不敢辞职，加油加油！！

先来流水账：

解决IE10+浏览器中的input文本输入框会自动出现小叉叉，当你看不惯的时候可以这样清除

```css
input::-ms-clear {
  display: none;
}
```

解读 CSS 冒号：伪类使用单冒号，伪元素推荐使用双冒号；早期的伪元素也兼容单冒号写法。

这个办法只能解决IE10+的浏览器，其他版本的没办法了，因为这里使用的是微软浏览器特有的 ::-ms-clear 伪元素；伪元素本身并不是 CSS3 才新增的。

解决只让背景透明，文字不透明

你可以这样玩，利用rgba，background: rgba(0,0,0,0.3)最后一个值是透明度，范围0到1.

解决单行/多行文本省略号结尾

对于单行:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Document</title>
    <style type="text/css">
      .text-wrap {
        width: 24em;
        height: 1.3em;
        overflow: hidden;
        zoom: 1;
      }
      .text-on {
        float: left;
        height: 1.3em;
        margin-right: 3em;
        overflow: hidden;
      }
      .text-dot {
        width: 3em;
        height: 1.31em;
        float: right;
        margin-top: -1.3em;
      }
    </style>
  </head>
  <body>
    <div class="text-wrap">
      <div class="text-on">
        这个段落真的很长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长
      </div>
      <div class="text-dot">...</div>
    </div>
  </body>
</html>
```

对于多行:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Document</title>
    <script type="text/javascript" src="jquery.js"></script>
    <script type="text/javascript">
      $(function () {
        $("p").each(function () {
          var maxwidth = 88;
          if ($(this).text().length > maxwidth) {
            $(this).text($(this).text().substring(0, maxwidth));
            $(this).html($(this).html() + "...");
          }
        });
      });
    </script>
  </head>
  <body>
    <p>
      前端技术前端技术前端技术前端技术前端技术前端技术前端技术前端技术前端技术前端技术前端技术前端技术前端技术前端技术前端技术前端技术前端技术前端技术前端技术前端技术前端技术前端技术前端技术前端技术前端技术前端技术前端技术前端技术前端技术前端技术前端技术前端技术前端技术前端技术前端技术前端技术前端技术前端技术前端技术前端技术前端技术前端技术前端技术前端技术前端技术前端技术前端技术前端技术
    </p>
  </body>
</html>
```

再来点基础知识:

label可以把input嵌套进去额

HTML 布尔属性只要出现就表示 true，空字符串也是如此；即使写成 "false" 也不会变成 false，要表示 false 应移除该属性

熟悉markdown写作，提高效率！！
