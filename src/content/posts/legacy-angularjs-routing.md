---
slug: "legacy-angularjs-routing"
title: "AngularJS路由机制"
description: "AngularJS 中 ngRoute 与 UI-Router 的基础用法和路由示例。"
publishedAt: "2016-02-02T17:36:53+08:00"
category: "engineering"
tags: ["frontend"]
---

> 本文记录的是 AngularJS 1.x 的路由用法。

## 一、ngRoute

1. ngRoute从1.2版本开始已经成为独立的模块，使用之前需要引用。

2. 使用ng-view指令，精确指定当前所对应的模版在DOM中的渲染位置，ng-view是一个优先级为1000的终极指令，在HTML中给$route对应的视图内容占位。

```html
<div ng-view></div>
```

3. 使用详解：

**$routeProvider**

配置路由的时候使用。

**when(path,route);**

在$route服务里添加一个新的路由。

path：该路由的路径。

route：路由映射信息。

controller：字符串或函数，指定控制器。

controllerAs：一个用于控制器的标识符名称。

template：字符串或函数，html模板。

templateUrl：字符串或函数，html模板的地址。

resolve：对象，一个应该注入控制器的可选的映射依赖关系。如果任何一个依赖关系是承诺，则路由会等待所有承诺成功解决后才实例化控制器；若有承诺被拒绝，则触发 $routeChangeError。

redirectTo：字符串或者函数，URL重定向。

otherwise(params);设置在没有其他路由定义被匹配时，将使用的默认路由。

**ngView**

路由配置的页面在HTML的view里的显示的视图区域。

**$route**

用于在js里对路由的操作。

**依赖：$location $routeProvider**

方法：

**reload();**

使路由服务重新加载当前路由，即使路由没有改变。

**updateParams(newParams);**

操作路由服务更新当前的URL，使用newParams里指定的路由参数指定当前路由参数。

**newParams：**将URL参数名称映射到value。

**事件：**

$routeChangeStart：URL路由开始变化（未跳转成功）的时候触发的事件。

event:合成的事件对象。

next：将跳转的route信息。

current：当前route信息。

$routeChangeSuccess：URL路由变化成功的时候触发的事件。

event:合成的事件对象。

current：当前route信息。

previous：上一个route信息。

$routeChangeError：URL路由变化失败的时候触发的事件。

event:合成的事件对象。

current：当前route信息。

previous：上一个route信息。

rejection：拒绝承诺，通常是失败承诺的错误。

$routeUpdate：当 URL 变化但路由被复用时广播，例如设置 reloadOnSearch 为 false 后只改变查询参数。

event:合成的事件对象。

current：当前route信息。

$routeParams：$routeParams服务允许检索当前路由的参数集。

附上一个demo：

HTML页面：

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>ngRoute</title>
    <script src="js/angular.js"></script>
    <script src="js/angular-route.min.js"></script>
    <script src="js/app.js"></script>
    <script src="js/controller.js"></script>
  </head>
  <body ng-app="routeApp">
    <h3>this is a ngRoute demo</h3>
    <a href="#/hello">hello页面</a>
    <a href="#/list">list页面</a>
    <div ng-view></div>
  </body>
</html>
```

app.js:

```javascript
var routeApp = angular.module("routeApp", ["ngRoute", "routeCtrl"]);

routeApp.config(function ($routeProvider) {
  $routeProvider
    .when("/hello", {
      //$routeProvider是angular自身提供的路由机制
      templateUrl: "tpls/hello.html"
      //controller:'helloCtrl'
    })
    .when("/list", {
      templateUrl: "tpls/list.html",
      controller: function ($scope) {
        $scope.books = [
          { title: "《高中语文》", author: "人民教育出版社" },
          { title: "《初中数学》", author: "四川科学出版社" },
          { title: "《高级化学》", author: "重庆日报出版社" }
        ];
      }
    });
});
```

HTML模版：

```html
<!--hello.html-->
<div ng-controller="helloCtrl">
  <h1>{{helloText.text}}</h1>
</div>

<!--list.html-->
<div>
  <ul ng-repeat="book in books">
    <li>书名：{{book.title}},出版社：{{book.author}}</li>
    <!--错误：这里写的是book.title，不是写的title-->
  </ul>
</div>
```

## 二、UI-Router

1. 用于解决深层次嵌套。

2. 常用参数和方法介绍：

**otherwise(rule);**

定义一个当请求的路径是无效路径时跳转的路径。

**$state**

$state服务负责代表状态及提供状态之间的转换。它还提供你当前的状态及上一个状态。

**ui-sref**

一种将链接（`<a>`标签）绑定到一个状态的指令。点击该链接将触发一个可以带有可选参数的状态转换。

**$stateProvider**

处理路由状态的服务，路由的状态反映了该项在应用程序中的位置，描述了在当前状态下UI是应该怎么样的，并且该做什么。
