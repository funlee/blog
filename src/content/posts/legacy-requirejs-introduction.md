---
slug: "legacy-requirejs-introduction"
title: "初探RequireJS"
description: "从简单示例开始学习 RequireJS、AMD 模块与路径配置。"
publishedAt: "2016-01-27T22:17:16+08:00"
category: "engineering"
tags: ["frontend"]
---

最近这几天，关于JavaScript的模块化编程频繁进入我的视角，据说是现在的网页开发项目越来越庞大，模块化编程正是适应这个节奏，反正对于我这个入行不久的weber来说，这就是一个比较潮流的东西，那就去了解去学习呗。这不，今天就折腾了一下午捣鼓RequireJS，晚上回到住处写写笔记，总结一下。

## 模块化编程：

关于模块：模块，大致就是把需要用到的功能方法给封装起来，我们就可以想要什么功能，就加载什么模块，是不是很方便呢！

关于规范：模块那么好用，当然不能随便编写拉，没有规范，那不同的小伙伴写出来的都没有统一的格式，我们怎么去调用呢！

AMD：目前通行的规范共有两种（少点就是好，不纠结）：CommonJS和AMD,标志着JavaScript模块化编程诞生的node js就是参照CommonJS规范实现的，那我们来说说另一个AMD规范把，AMD是"Asynchronous Module Definition"的缩写，意思就是"异步模块定义"，它采用异步方式加载模块，模块的加载不影响它后面语句的运行。

## 使用RequireJS：

1. 基本知识介绍：

- RequireJS能解决JS阻塞浏览器渲染；
- RequireJS常用有三个方法：requirejs.config、requirejs、define;
- requirejs.config：帮模块指定别名,方便引入；
- requirejs：将写好的模块进行引入，根据模块编写主代码；
- define：编写模块，然后在相应的地方进行引用
- 其中require === requirejs，一般使用require更简短

2. 第一个例子，在同一个文件下有如下文件：index.html、RequireJS.js(官网下载)、main.js（主入口）、demo.js(创建模块)：

index.html代码:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Document</title>
  </head>
  <body>
    <h1>this is the first demo!!</h1>
    <script data-main="main" src="RequireJS.js"></script>
    <!--data-main表示主入口，main.js省略后缀名，不用在加载其他
    js文件了，不把script标签放在底部可加defer async="true"属性-->
  </body>
</html>
```

main.js代码：

```javascript
requirejs(["demo"], function (demoName) {
  demoName.hello();
});
//requirejs()函数接受两个参数。第一个参数是一个数组，表示所依赖的模块，
//第二个参数是一个回调函数，当前面指定的模块都加载成功后，它将被调用。
```

demo.js代码：

```javascript
define([], function () {
  return {
    hello: function () {
      alert("为什么我取名叫module就不行了？？");
    }
  };
});
//require.js加载的模块，采用AMD规范,所以模块必须按照AMD的规定来写。
//模块必须采用特定的define()函数来定义。
//如果一个模块不依赖其他模块，那么可以直接定义在define()函数之中,因此上面的数组符号[]可以省略。
```

3. 一个复杂的例子，配置上requirejs.config方法，在一个文件下包含index.html、main.js(JS主入口)、RequireJS.js、一个包含test1.js和test2.js名字叫做lib的文件夹、一个包含test3.js名字叫做others的文件夹：

index.html代码：

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Document</title>
  </head>
  <body>
    <h1>This is a test for RequireJS</h1>
    <script data-main="main" src="RequireJS.js"></script>
  </body>
</html>
```

main.js代码：

```javascript
require.config({
  paths: {
    //配置路径，相对于 baseUrl（本例默认是 main.js 所在目录）
    test1: "lib/test1",
    test2: "lib/test2",
    test3: "others/test3"
  }
});

require(["test1", "test2", "test3"], function (test1, test2, test3) {
  //注入依赖模块，并以参数传入
  test1.hello();
  test2.hello();
  test3.hello();
});
```

test1.js代码：

```javascript
define(function () {
  return {
    hello: function () {
      alert("this is test1");
    }
  };
});
```

test2.js和test3.js的代码仅仅只有alert()内容不一样。

4. 一个综合例子：

- 我们知道jQuery从1.7后开始支持AMD规范，即如果jQuery作为一个AMD模块运行时，它的模块名是“jquery”，只要将jQuery文件名改为“jquery.js”就不必配置paths参数了；注意“jquery”是固定的，不能写“jQuery”或其它；
- JS模块文件路径默认与main.js在同一个目录，除了像第二个例子那样配置外，还可以直接改变基目录（baseUrl）；
- 对于没有按照AMD规范来书写的模块，我们需要利用require.config()的另一个属性shim来专门配置不兼容的模块。

下面是最后一个例子：

文件情况如下：在一个文件下包含index.html、main.js(JS主入口)、RequireJS.js、jquery.js、一个包含test1.js和test2.js名字叫做lib的文件夹、一个包含test3.js名字叫做others的文件夹：

index.html代码：

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Document</title>
  </head>
  <body>
    <h1 id="title">This is a test for RequireJS</h1>
    <button id="btn">开始执行</button>
    <script data-main="main" src="RequireJS.js"></script>
  </body>
</html>
```

main.js代码：

```javascript
require.config({
  baseUrl: "lib", //直接改变基目录
  paths: {
    //配置路径，以lib为起点
    jquery: "../jquery",
    test1: "test1",
    test2: "test2",
    test3: "../others/test3"
  }
});

require(["jquery", "test1", "test2", "test3"], function (
  $,
  newT1,
  newT2,
  newT3
) {
  $("#btn").click(function () {
    newT1.hello();
    newT2.say("Requirejs", "easy");
    newT3.change();
  });
});
```

test1.js代码：

```javascript
define(["jquery"], function ($) {
  return {
    hello: function () {
      $("body").css("background", "green");
      alert("test1:jquery已经注入");
    }
  };
});
```

test2.js代码：

```javascript
define(function () {
  return {
    say: function (name, attr) {
      alert("test2：" + name + " is " + attr);
    }
  };
});
```

test3.js代码：

```javascript
define(["jquery"], function ($) {
  return {
    change: function () {
      alert("结束");
      $("#title").text("这是最后一个例子(完)！！");
      $("#btn").text("已经结束");
    }
  };
});
```

### （完）
