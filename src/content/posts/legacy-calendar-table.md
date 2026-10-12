---
slug: "legacy-calendar-table"
title: "运用表格制作日历组件"
description: "通过静态日历练习表格结构、单元格与 CSS 样式。"
publishedAt: "2016-02-03T21:55:07+08:00"
category: "engineering"
tags: ["frontend"]
---

> 本文保留了当时兼容旧版 IE 的表格写法；部分表格表现属性已不适用于现代 HTML。日历中的日期排列仅用于样式演示。

前言：一直以来对表格的知识不是很熟悉，今天通过一个练习来回顾有关表格的种种！

## 一、HTML部分

1. `<caption>`用作表格的标题，summary应用于表格标签，用于描述表格的内容。如：

```html
<table summary="A calendar style date picker">
  <caption>
    <a href="#" rel="prev">&lt;</a
    >January 2016
    <a href="#" rel="next">&gt;</a>
  </caption>
</table>
```

2. thead、tbody、tfoot把表格划分为几个逻辑部分，一个表格只能用一个thead和tfoot元素，可以有多个tbody元素。

3. 行标题和列标题使用th，可以利用scope属性设置定义是行标题(row)还是列标题(col),还可以设置rowgroup和colgroup的值，表示标题与所在行组或列组相关。如：

```html
<th scope="col">Sun</th>
```

4. 遇到空的单元格，最好在单元格中使用空格占位符。如：

```html
<td>&nbsp;</td>
```

5. 跨行用rowspan,跨列用colspan。如：

```html
<th colspan="2">我占两列宽</th>
<th rowspan="2">我占两行高</th>
```

6. 单元格边距用：cellpadding；单元格间距用：cellspacing。**这是当前在IE低版本中控制单元格间距的唯一办法**，高版本用：border-spacing如：

```html
<table cellspacing="5" cellpadding="5"></table>
```

7. 使用 "frame" 属性来控制围绕表格的边框。如：

```html
<table frame="box"></table>
```

HTML完整代码:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>calendar</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <table cellspacing="0" class="cal" summary="A calendar style date picker">
      <caption>
        <a href="#" rel="prev">&lt;</a
        >January 2016
        <a href="#" rel="next">&gt;</a>
      </caption>
      <colgroup>
        <col id="sun" />
        <col id="mon" />
        <col id="tue" />
        <col id="wed" />
        <col id="thur" />
        <col id="fri" />
        <col id="sat" />
      </colgroup>
      <thead>
        <tr>
          <th scope="col">Sun</th>
          <th scope="col">Mon</th>
          <th scope="col">Tue</th>
          <th scope="col">Wed</th>
          <th scope="col">Thu</th>
          <th scope="col">Fri</th>
          <th scope="col">Sat</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="null"><a href="#">30</a></td>
          <td class="null"><a href="#">31</a></td>
          <td><a href="#">1</a></td>
          <td><a href="#">2</a></td>
          <td><a href="#">3</a></td>
          <td><a href="#">4</a></td>
          <td><a href="#">5</a></td>
        </tr>
        <tr>
          <td><a href="#">6</a></td>
          <td><a href="#">7</a></td>
          <td><a href="#">8</a></td>
          <td><a href="#">9</a></td>
          <td><a href="#">10</a></td>
          <td><a href="#">11</a></td>
          <td class="selected"><a href="#">12</a></td>
        </tr>
        <tr>
          <td><a href="#">13</a></td>
          <td><a href="#">14</a></td>
          <td><a href="#">15</a></td>
          <td><a href="#">16</a></td>
          <td><a href="#">17</a></td>
          <td><a href="#">18</a></td>
          <td><a href="#">19</a></td>
        </tr>
        <tr>
          <td><a href="#">20</a></td>
          <td><a href="#">21</a></td>
          <td><a href="#">22</a></td>
          <td><a href="#">23</a></td>
          <td><a href="#">24</a></td>
          <td><a href="#">25</a></td>
          <td><a href="#">26</a></td>
        </tr>
        <tr>
          <td><a href="#">27</a></td>
          <td><a href="#">28</a></td>
          <td><a href="#">29</a></td>
          <td><a href="#">30</a></td>
          <td><a href="#">31</a></td>
          <td><a href="#">1</a></td>
          <td><a href="#">2</a></td>
        </tr>
      </tbody>
    </table>
  </body>
</html>
```

## 二、CSS部分

详见代码：

```css
/*边盒模型*/
table.cal {
  margin: 0 auto;
  border-collapse: separate;
  border-spacing: 0;
  text-align: center;
  color: #333;
}
/*表格文本居中*/
.cal th,
.cal td {
  margin: 0;
  padding: 0;
}
/*处理标题，增加空间*/
.cal caption {
  font-size: 1.25em;
  padding-top: 0.6em;
  padding-bottom: 0.6em;
  background-color: #d4dde6;
}
/*左右切换部分*/
.cal caption [rel="prev"] {
  float: left;
  margin-left: 0.2em;
}
.cal caption [rel="next"] {
  float: right;
  margin-right: 0.2em;
}
.cal caption a:link,
.cal caption a:visited {
  text-decoration: none;
  color: #333;
  padding: 0 0.2em;
}
.cal caption a:hover,
.cal caption a:active,
.cal caption a:focus {
  background-color: #6d8ab7;
}
/*区分标题表格和其他表格*/
.cal thead th {
  background-color: #d4dde6;
  border-bottom: 1px solid #a9babc;
}
/*表格文本阴影*/
.cal tbody {
  color: #a4a4a4;
  border-bottom: 1px solid white;
  background-color: #d0d9e2;
}
/*斜面效果：顶部和左边颜色浅
          底部和右边颜色深*/
.cal tbody td {
  border-top: 1px solid #e0e0e1;
  border-right: 1px solid #9f9fa1;
  border-bottom: 1px solid #acacad;
  border-left: 1px solid #dfdfe0;
}
.cal tbody a {
  display: block;
  text-decoration: none;
  color: #333;
  background-color: #c0c8d2;
  font-weight: bold;
  padding: 0.38em 0.69em 0.3em 0.6em;
}
/*鼠标悬停状态*/
.cal tbody a:hover,
.cal tbody a:focus,
.cal tbody a:active,
.cal tbody .selected a:link,
.cal tbody .selected a:visited,
.cal tbody .selected a:hover,
.cal tbody .selected a:focus,
.cal tbody .selected a:active {
  background-color: #6d8ab7;
  color: white;
  text-shadow: 1px 1px 2px #22456b;
}
/*针对IE6的悬停状态：实现依然是斜面需要增加边框*/
.cal tbody td:hover,
.cal tbody td.selected {
  border-top: 1px solid #2a3647;
  border-right: 1px solid #465977;
  border-bottom: 1px solid #576e92;
  border-left: 1px solid #466080;
}
```
