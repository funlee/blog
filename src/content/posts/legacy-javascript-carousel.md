---
slug: "legacy-javascript-carousel"
title: "原生JS实现轮播图"
description: "使用原生 JavaScript 实现轮播图的练习记录。"
publishedAt: "2016-02-03T16:10:25+08:00"
category: "engineering"
tags: ["frontend"]
---

昨天用jQuery写了一个轮播图案例，今天用原生JS又写了一个轮播图案例，在今天这个案例中，碰到了一个列表项(案例中用的span)分别单击触发相似事件的小问题，就是要实现单击的时候，把自身的索引号给传过去，最后是用如下办法解决的：

```javascript
for (var i = 0; i < lists.length; i++) {
  funlee(i);
}
function funlee(i) {
  lists[i].onclick = function () {
    alert(i);
  };
}
```

完整案例如下：

HTML：

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>轮播图</title>
    <link rel="stylesheet" href="style.css" />
    <script src="change.js"></script>
  </head>
  <body>
    <div class="container">
      <ul>
        <li><img src="1.jpg" alt="picture" id="img" /></li>
      </ul>
      <div class="text">
        <span>1</span>
        <span>2</span>
        <span>3</span>
        <span>4</span>
        <span>5</span>
      </div>
    </div>
  </body>
</html>
```

style.css:

```css
* {
  margin: 0;
  padding: 0;
}
.container {
  position: relative;
  width: 660px;
  height: 375px;
  margin: 0 auto;
  top: 10px;
}
.container ul {
  list-style: none;
}
.container img:hover {
  cursor: pointer;
}
.text {
  position: absolute;
  right: 13%;
  bottom: 10px;
}
.text span {
  border: 1px solid #606060;
  display: inline-block;
  height: 18px;
  width: 18px;
  text-align: center;
}
.text span:hover {
  border: 1px solid #fff;
  background: #c1c1c1;
}
```

change.js:

```javascript
window.onload = function () {
  var imgs = document.getElementById("img");
  var num = 0;
  var lists = document.getElementsByTagName("span");
  var imgSite = new Array();
  imgSite[0] = "1.jpg";
  imgSite[1] = "2.jpg";
  imgSite[2] = "3.jpg";
  imgSite[3] = "4.jpg";
  imgSite[4] = "5.jpg";
  //自动切换
  var timer = setInterval(change, 2000);
  imgs.onmouseover = function () {
    clearInterval(timer);
  };
  imgs.onmouseout = function () {
    timer = setInterval(change, 2000);
  };
  function change() {
    if (num > imgSite.length - 2) {
      num = 0;
    } else {
      num = num + 1;
    }
    imgs.src = imgSite[num];
  }
  //数字切换
  for (var i = 0; i < lists.length; i++) {
    choose(i);
  }
  function choose(i) {
    lists[i].onmouseover = function () {
      num = i;
      imgs.src = imgSite[num];
    };
  }
};
```
