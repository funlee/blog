---
slug: "legacy-detect-scroll-direction"
title: "JS判断向上/向下滑动"
description: "通过滚动位置判断滑动方向，并实现顶部导航的过渡效果。"
publishedAt: "2016-06-20T19:38:42+08:00"
category: "engineering"
tags: ["frontend"]
---

今天做了一个仿[京东](http://so.m.jd.com/ware/search.action?sid=f196fe3eb342ba48e477b6080bddbd87&keyword=%E7%A9%BA%E8%B0%83&catelogyList=)商品详情页的顶部导航效果，遇到了两个问题，在解决之后，特来做一个总结。

第一个问题就是解决上下滑动的判断，通过jquery的`scrollTop`,获取滚动条距离顶部的值，再通过`$(window).scroll(handler)` 监听滚动事件，比较两次的scrollTop值，就能判断是向上滑动还是向下滑动(猜想：自我感觉解决这个问题应该有相应的插件封装有向上滑动和向下滑动的方法，但不想引入过多的JS插件，毕竟这个写出来代码也不多；)。

```javascript
//向上滑动和向下滑动判断
scroll();
function scroll(fn) {
  var $window = $(window),
    beforeScrollTop = $window.scrollTop(),
    fn = fn || function () {};

  $window.scroll(function () {
    var afterScrollTop = $window.scrollTop(),
      delta = afterScrollTop - beforeScrollTop;
    if (delta === 0) {
      return false;
    } else if (delta > 0) {
      console.log("down");
    } else if (delta < 0) {
      console.log("up");
    }
    beforeScrollTop = afterScrollTop;
  });
}
```

第二个问题是顶部导航栏的滑动效果：向下滑动实现搜索栏隐藏，导航栏固定；向上滑动实现搜索栏和导航栏都固定，且搜索栏的出现是有慢动作的。对于这个慢动作一开始我还不知道怎么解决，看了[京东](http://so.m.jd.com/ware/search.action?sid=f196fe3eb342ba48e477b6080bddbd87&keyword=%E7%A9%BA%E8%B0%83&catelogyList=)上面的源码，才知道是通过css3的`transform`属性来控制的。

```css
/* 通过改变 translateY 的值实现搜索框的缓慢出现 */
display: block;
transform: translateY(-135px);
transition: all 0.5s ease 0s;
position: fixed;
```

多看源码，多琢磨一些常见的效果，工作中用起来才得心应手，这就是多造轮子的好处。
