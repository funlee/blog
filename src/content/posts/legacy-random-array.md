---
slug: "legacy-random-array"
title: "获取一个动态随机数组"
description: "记录从数组中随机抽取若干项的尝试和实现。"
publishedAt: "2016-01-26T22:25:19+08:00"
category: "engineering"
tags: ["frontend"]
---

记录一个今天工作中遇到的问题，最开始的情况是要求实现这样的功能：每次刷新网页，都将页面上某个元素的颜色改变，当然我们做的是随机改变，下面是第一次尝试：

```javascript
var colors = [
  "blue",
  "green",
  "yellow",
  "purple",
  "lime",
  "orange",
  "pink",
  "aqua",
  "teal",
  "silver"
];
var myColors = [];
var num;
for (var i = 0; i < colors.length; i++) {
  var num = parseInt(Math.random() * 10);
  myColors[i] = colors[num];
}
console.log(myColors);
```

上面的做法是每次刷新,myColors数组里面的值随机生成，相当于每次刷新，打乱了colors里面排序，但会出现新数组里面颜色值重复的情况，

所以在将mycolors数组拿去使用的时候，效果不尽人意，毕竟是在十次循环里面随机0到9十个数字，重复的概率相当大，像下面这种去降低概率的做法肯定是不行的，太不严谨了：

```javascript
var colors = [
  "blue",
  "green",
  "yellow",
  "purple",
  "lime",
  "orange",
  "pink",
  "aqua",
  "teal",
  "silver"
];
var myColors = [];
var num;
for (var i = 0; i < colors.length; i++) {
  var num1 = parseInt(Math.random() * 5);
  var num2 = parseInt(Math.random() * 5);
  num = num1 + num2;
  myColors[i] = colors[num];
}
console.log(myColors);
```

为了避免数据重复，想到了先获取值，再赋值，如果有重复的，那么后一次的赋值就会替换覆盖前一次的值，这样有了下面的尝试：

```javascript
var colors = [
  "blue",
  "green",
  "yellow",
  "purple",
  "lime",
  "orange",
  "pink",
  "aqua",
  "teal",
  "silver"
];
var myColors = [];
var num;
for (var i = 0; i < colors.length; i++) {
  var num = parseInt(Math.random() * 9);
  myColors[num] = colors[i];
}
console.log(myColors);
```

这种做法可以说是完全错误的，虽然解决了重复的问题，但是会造成新数组里面颜色值丢失，丢失过后还会造成序列号跟着丢失。由此得知我们的主要目的是：实现新数组随机生成，生成的是原始数组里面的十个颜色，不重复不丢失。那么正确的做法是每次拿到随机数之后，把对应的颜色放入新的数组中，原来的colors数组中剔除这个颜色，就有了下面的做法：

```javascript
var colors = [
  "blue",
  "green",
  "yellow",
  "purple",
  "lime",
  "orange",
  "pink",
  "aqua",
  "teal",
  "silver"
];
var myColors = [];
var num = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
var n = 10;
for (var i = 0; i < colors.length; i++) {
  var temp = parseInt(Math.random() * n);
  var r = num[temp];
  myColors[i] = colors[r];
  num[temp] = num[n - 1];
  n = n - 1;
}
```

完美解决!!
扩展：从一个给定的数组arr中,随机返回num个不重复抽取的项（原数组本身无重复值时，结果也无重复值），如下：

```javascript
function creatArray(arr, num) {
  var temp = arr.slice();
  var myArray = new Array();
  for (var i = 0; i < num; i++) {
    //判断如果数组还有可以取出的元素,以防下标越界
    if (temp.length > 0) {
      var arrIndex = Math.floor(Math.random() * temp.length);
      //将此随机索引的对应的数组元素值复制出来
      myArray[i] = temp[arrIndex];
      //然后删掉此索引的数组元素,这时候temp变为新的数组
      temp.splice(arrIndex, 1);
    } else {
      //数组中数据项取完后,退出循环,比如数组本来只有10项,但要求取出20项.
      break;
    }
  }
  return myArray;
}
//测试
var testArray = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z"
];
console.log(creatArray(testArray, 12));
```
