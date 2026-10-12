---
slug: "legacy-prevent-default"
title: "阻止控件的默认行为"
description: "记录链接和表单控件默认行为的阻止方法。"
publishedAt: "2016-06-20T20:02:53+08:00"
category: "engineering"
tags: ["frontend"]
---

在HTML中，很多标签都是具有默认事件的，比如`a`标签，点击后就会跳转到href属性指定的链接，还有就是form表单，当表单中出现`input[type=submit]`和未指定 type 或 type="submit" 的 `button` 标签时，都会默认去提交表单，今天来说说这两个事情。

对于a标签，想要阻止它的默认事件，一开始我们使用的方法是`href="#"`,虽然不会跳转到其他页面，但可能滚动到页面顶部，但浏览器URL里面会出现一个`#`符号，这显然是我们不喜欢的，再后来我们学会了另一种写法`href="javascript:;"`或者是`href="javascript:void(0);"`,今天介绍一种新写法

```html
<a href="http://www.baidu.com" onclick="change(this);return false">
  默认行为已被屏蔽，只执行change函数
</a>
```

这种写法保留了href属性中的链接，这种写法也常用在我们需要这个`href`属性值的情况下。关于这种写法，你需要了解JS的事件处理机制。这里的 return false 适用于内联或 DOM0 事件处理；使用 addEventListener 时，应调用 event.preventDefault() 阻止默认行为。

事件处理的工作机制：在给某个元素添加了事件处理函数后，一旦事件发生，相应的事件处理函数就会得到执行。被调用的`javascript`代码可以返回一个值，这个值将被传递给那个事件处理函数。利用这个机制，可以让元素只执行`javascript`行为，而不执行默认行为。

再来说说form表单的默认事件，就像开篇说的那样，遇到内部的`input[type=submit]`和未指定 type 或 type="submit" 的 `button` 标签点击时就会去提交表单，我曾尝试通过不写 `action` 属性阻止提交，但这并不能取消提交，因为那样的话，在点击过后，浏览器会将页面重新加载一次，事件处理函数仍可能执行，但随后导航会影响页面状态。

实现点击按钮阻止表单去提交，而去执行绑定在按钮上的事件，可以这样写，给`form`绑定这个

```html
<form action="" id="" onsubmit="return false;"></form>
```

如果想要实现既能执行绑定在按钮上的事件，又能提交表单，可以通过`ajax`提交表单，把提交事件绑定在按钮的`click`事件上。
