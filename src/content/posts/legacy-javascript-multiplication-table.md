---
slug: "legacy-javascript-multiplication-table"
title: "九九乘法表"
description: "用 JavaScript 循环输出九九乘法表的练习。"
publishedAt: "2016-06-22T22:26:46+08:00"
category: "engineering"
tags: ["frontend"]
---

下面用纯JS代码输出九九乘法表，利用for循环，非常easy！

```html
<script type="text/javascript">
  document.write("<table border='1'>");
  for (var i = 1; i <= 9; i++) {
    document.write("<tr>");
    for (var j = 1; j <= i; j++) {
      document.write("<td>" + i + "x" + j + "=" + i * j + "</td>");
    }
    document.write("</tr>");
  }
  document.write("</table>");
</script>
```
