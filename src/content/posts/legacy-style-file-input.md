---
slug: "legacy-style-file-input"
title: "美化按钮input[type=file]"
description: "通过样式调整文件上传按钮的展示效果。"
publishedAt: "2016-04-06T18:07:59+08:00"
category: "engineering"
tags: ["frontend"]
---

在网页中上传文件，我们首先想到的肯定是利用表单控件`input[type=file]`,但当我们敲下下面这句代码后，头疼的事情就发生了

```html
<input type="file" />
```

在各个浏览器中打开看看，就会发现预设样式各不相同

实际调整就会发现，这个样式非常不好调整，终究调整来不是个理想的按钮，怎么办呢，下面是自己使用过的两种解决办法。

第一种办法是将`input`元素的宽高都设置为0，没有宽高就没法点击上传了，解决办法是另写一个按钮，这个按钮就可以用a标签、p标签、button标签，都行，怎么高兴怎么来，样式还非常容易调整，然后通过一段js代码来把按钮的点击事件绑定到`input`上，就实现了上传功能！

```javascript
$(".test-btn").click(function () {
  $("input[type=file]").click();
});
```

第二种办法是今天学到的，因为今天用第一种解决办法的时候，遇到了一个bug，就是参数传到后台收不到，后台也不管你前端到底怎么弄的，反正就是不行，醉，那就用这种方法把：把`input`的透明度设置为0，然后另写一个按钮，当点击上传的时候依然是点击的`input`，因为新写的按钮上没有绑定有事件，代码如下，感兴趣的可以试试。

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Document</title>
    <style>
      #input-file {
        position: relative;
        width: 120px;
        height: 30px;
        background: #eee;
        border: 1px solid #ccc;
        text-align: center;
        cursor: pointer;
      }
      #text {
        display: inline-block;
        color: #666;
        font-family: "微软雅黑";
        font-size: 18px;
        height: 30px;
        line-height: 30px;
      }
      #file {
        display: block;
        position: absolute;
        top: 0;
        left: 0;
        width: 120px;
        height: 30px;
        opacity: 0;
        -moz-opacity: 0;
        filter: alpha(opacity=0);
      }
    </style>
  </head>
  <body>
    <div id="input-file">
      <span id="text">点击上传</span>
      <input type="file" id="file" />
    </div>
  </body>
</html>
```

注：两种办法都能解决样式的兼容问题。
