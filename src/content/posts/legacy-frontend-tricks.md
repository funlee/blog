---
slug: "legacy-frontend-tricks"
title: "教你如何玩坏前端"
description: "收集前端开发中遇到的小技巧与有趣用法。"
publishedAt: "2016-06-26T23:49:07+08:00"
category: "engineering"
tags: ["frontend"]
---

今天来盘点一些前端的冷门知识，纯粹带着一种"玩"的心态。不是冷冰冰的理论知识讲解，而是前所未闻的奇技淫巧，打开你的浏览器和编辑器，玩起来把。

## 浏览器地址栏运行HTML代码

在非IE内核的浏览器地址栏中，可以直接运行HTML代码！比如在地址栏中直接输入：

```text
data:text/html,<h1>Hello, world!</h1>
```

## 浏览器当编辑器使用

基于H5新加的contenteditable属性，当元素指定了该属性后，元素的内容成为可编辑状态。初级玩法是将以下代码贴到浏览器地址栏后，浏览器就变成了一个原始而简单的编辑器，与Windows自带的notepad一样。

```html
data:text/html,
<html contenteditable></html>
```

高级玩法：将以下代码放到console执行后，整个页面所有元素将变得可编辑，去随意践踏页面吧~

```javascript
document.body.contentEditable = "true";
```

## 实时编辑CSS

通过设置`style`标签的`display:block`样式可以让页面的`style`标签显示出来，并且加上`contentEditable`属性后可以让样式成为可编辑状态，更改后的样式效果也是实时更新呈现的。此技巧在IE下无效。拥有此技能者，逆天也！

```html
<html>
  <body>
    <style style="display:block" contenteditable>
      body {
        color: blue;
      }
    </style>
  </body>
</html>
```

## css的恶作剧

相信你看完以下代码后能够预料到会出现什么效果，随便找个页面试试吧

```css
* {
  cursor: none !important;
}
```

## 简单的文字模糊效果

以下两行简单的CSS3代码可达到将文字模糊化处理的目的，出来的效果有点像使用PS的滤镜，so cool!

```css
p {
  color: transparent;
  text-shadow: #111 0 0 5px;
}
```

## 加载CDN文件时，可以省掉HTTP标识

现在很流行的CDN即从专门的服务器加载一些通用的JS和CSS文件，出于安全考虑有的CDN服务器使用HTTPS方式连接，而有的是传统的HTTP，其实我们在使用时可以忽略掉这个，将它从URL中省去。

```html
<script src="//domain.com/path/to/script.js"></script>
```

## 垂直居中

我们知道CSS中天然有水平居中的样式`text-align:center`，而垂直居中需要根据元素和布局方式选择对应做法。

当然你可以将容器设置为`display:table`，然后将子元素也就是要垂直居中显示的元素设置为`display:table-cell`，然后加上`vertical-align:middle`来实现，但此种实现往往会因为`display：table`而破坏整体布局，那还不如直接用`table`标签了呢。

下面这个样式利用了`translate`来巧妙实现了垂直居中样式，需IE9+。

```css
.center-vertical {
  position: relative;
  top: 50%;
  transform: translateY(-50%);
}
```

## 多重边框

利用重复指定`box-shadow`来达到多个边框的效果

```css
div {
  box-shadow:
    0 0 0 6px rgba(0, 0, 0, 0.2),
    0 0 0 12px rgba(0, 0, 0, 0.2),
    0 0 0 18px rgba(0, 0, 0, 0.2),
    0 0 0 24px rgba(0, 0, 0, 0.2);
  height: 200px;
  margin: 50px auto;
  width: 400px;
}
```

## 建长宽比固定的元素

通过设置父级窗口的`padding-bottom`可以达到让容器保持一定的长度比的目的，这在响应式页面设计中比较有用，能够保持元素不变形。

```html
<div style="width: 100%; position: relative; padding-bottom: 20%;">
  <div
    style="position: absolute; left: 0; top: 0; right: 0; bottom: 0;background-color:yellow;"
  >
    this content will have a constant aspect ratio that varies based on the
    width.
  </div>
</div>
```

## CSS中也可以做简单运算

通过CSS中的`calc`方法可以进行一些简单的运算，从而达到动态指定元素样式的目的。

```css
.container {
  background-position: calc(100% - 50px) calc(100% - 20px);
}
```

## JS生成随机字符串

利用`Math.random`和`toString`生成随机字符串，这里的技巧是利用了`toString`方法可以接收一个基数作为参数的原理，这个基数从2到36封顶。如果不指定，默认基数是10进制。略屌！

```javascript
function generateRandomAlphaNum(len) {
  var rdmString = "";
  for (
    ;
    rdmString.length < len;
    rdmString += Math.random().toString(36).substr(2)
  );
  return rdmString.substr(0, len);
}
```

## JS整数的操作

JavaScript 的 Number 类型同时表示整数和浮点数，也可以利用位运算进行特定范围内的整数转换。

`|0`和`~~`是很好的一个例子，对 Number 使用这两者会转换为 32 位有符号整数，小数部分向零截断，超出范围则会溢出；它们并不等同于 Math.round，性能也不能一概而论。在处理像素及动画位移等效果的时候会很有用。

```javascript
var foo = (12.4 / 4.13) | 0; //结果为3
var bar = ~~(12.4 / 4.13); //结果为3
```

顺便说句，`!!`将一个值方便快速转化为布尔值` !!window===true` 。

## 关于console的恶作剧

Chrome的`console.log`是支持对文字添加样式的，甚至log图片都可以。下面展示的是重写掉默认的log方法，把将要log的文字应用到CSS的模糊效果，这样当有人试图调用`console.log()`的时候，出来的是模糊不清的文字。

```html
<script type="text/javascript">
  var _log = console.log;
  console.log = function () {
    _log.call(
      console,
      "%c" + [].slice.call(arguments).join(" "),
      "color:transparent;text-shadow:0 0 2px rgba(0,0,0,.5);"
    );
  };
  console.log("hello world");
</script>
```

## 不声明第三个变量的值交换

我们都知道交换两个变量值的常规做法，那就是声明一个中间变量来暂存。但鲜有人去挑战不声明中间变量的情况，下面的代码给出了这种实现。蛮有创意 的。

```javascript
var a = 1,
  b = 2;
a = [b, (b = a)][0];
console.log("a:" + a + ",b:" + b);
```

## console.table 表格输出

可以将`JavaScript`关联数组以表格形式输出到浏览器`console`，效果很惊赞，界面很美观。

```javascript
var data = [
  { 品名: "雪碧", 数量: 4 },
  { 品名: "芬达", 数量: 3 }
];
console.table(data);
```
