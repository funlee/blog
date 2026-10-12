---
slug: "legacy-bootstrap-responsive-practice"
title: "基于Bootstrap的响应式练习"
description: "使用 Bootstrap 3 进行响应式页面练习的笔记。"
publishedAt: "2016-02-05T11:04:18+08:00"
category: "engineering"
tags: ["frontend"]
---

> 本文示例基于 Bootstrap 3。

## 一、关于响应式

优点:

- 面对不同分辨率设备灵活性强
- 能够快捷解决多设备显示适应问题

缺点:

- 兼容各种设备工作量大，效率低下
- 代码累赘，会出现隐藏无用的元素，加载时间加长
- 这是一种折中性质的设计解决方案，多方面因素影响而达不到最佳效果
- 一定程度上改变了网站原有的布局结构，会出现用户混淆的情况

## 二、案例总结

响应式布局设计的前端框架很多，本次练习是基于bootstrap框架，运用了其中的导航条、下拉菜单、轮播图等组件，把本次案例中涉及的组件要点归纳如下：

**导航条navbar：**

1. 导航条依赖JavaScript，响应式导航条还依赖折叠插件--collapse（引入全部min.js或者导入单个部件）

2. 添加.navbar-fixed-top类可以让导航条固定在顶部。但是固定的导航条会遮住页面上的其他内容，需要给`<body>`元素设置padding；其中，导航条默认高度是50px，可以设置 `body{padding-top:70px;}`，当遇到图片又需要贴紧时，可设置图片margin值为负值。

3. 包含一个.container或.container-fluid容器，实现导航条居中或者自适应显示。

4. 添加.navbar-inverse类可以改变导航条的外观，变成黑底显示。

**下拉菜单:**

1. 仅仅通过data属性API就能使用所有的bootstrap插件，这是bootstrap中的一等API，首选方式

**布局：**

1. 行(row)必须包含在.container(固定宽度)或.container-fluid(100%宽度)中。

2. 使用.col-md-\*栅格，在手机和平板设备上一开始堆叠在一起，桌面（≥992px）屏幕设备上变为水平排列

**标签页：**

1. 只需要为页面元素指定data-toggle="tab"

2. 为ul添加nav和nav-tabs类.

**弹出框:**

给弹出框设置ID="demo"，在点击的元素上用data-toggle="modal" data-target="#demo"
