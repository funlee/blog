---
slug: "legacy-javascript-string-methods"
title: "JS字符串操作集锦"
description: "整理 JavaScript 字符串的常用属性、方法和示例。"
publishedAt: "2016-06-21T22:56:09+08:00"
category: "engineering"
tags: ["frontend"]
---

都是一些基础知识，每次学习呢，总是走马观花过一遍，总以为用得少，即使遇到了呢，还可以查一查。近来频频遇到，使用很生疏，每次都要查，效率很低，索性来个集锦总结一下，一来省了下次到处找，二来强迫自己总结记住，争取再也不查了。

## length

它的功能是获取字符串的长度,需要注意的是，JavaScript 的 length 统计 UTF-16 码元数。下面的“汉字”各占一个码元；部分生僻字和 emoji 则会占两个码元。

```javascript
var str1 = "test string";
var str2 = "汉字";
console.log(str2.length); //2
for (var i = 0; i < str1.length; i++) {
  console.log(str1[i]);
}
```

## prototype

`prototype`在面向对象编程中会经常用到，用来给对象添加属性或方法，并且添加的方法或属性在所有的实例上共享。因此也常用来扩展js内置对象，如下面的代码给字符串添加了一个去除两边空格的方法：

```javascript
var str1 = " test string ";
String.prototype.trim = function () {
  return this.replace(/^\s*|\s*$/g, "");
};
var str2 = str1.trim();
console.log(str1.length); //13
console.log(str2.length); //11
```

## charAt()

`stringObject.charAt(index)`方法可用来获取指定位置的字符串，index为字符串索引值，从0开始到`string.length – 1`，若不在这个范围将返回一个空字符串。

```javascript
var str = "test string";
console.log(str.charAt(0)); //t
console.log(str.charAt(20)); //返回空字符串
console.log(str.charAt(str.length - 1)); //g
```

## charCodeAt()

`stringObject.charCodeAt(index)`方法可返回指定位置的 UTF-16 码元值。

```javascript
var str = "test string";
console.log(str.charCodeAt(0)); //116
console.log(str.charCodeAt(20)); //NaN
console.log(str.charCodeAt(str.length - 1)); //103
```

## fromCharCode()

`String.fromCharCode(numX,numX,…,numX)`可接受一个或多个 UTF-16 码元值，然后返回一个字符串。另外该方法是`String`的静态方法，超出基本多文种平面的字符需要一对代理码元，不能只传入一个完整码点。

```javascript
var str = String.fromCharCode(97, 98, 99, 100, 101);
console.log(str); //abcde
```

## indexOf()

`stringObject.indexOf(searchvalue,fromindex)`用来检索指定的字符串值在字符串中首次出现的位置。它可以接收两个参数，searchvalue表示要查找的子字符串，fromindex表示查找的开始位置，省略的话则从开始位置进行检索；如果不存在，返回-1。

```javascript
var str1 = String.fromCharCode(97, 98, 99, 100, 101); //abcde
var str2 = "thisisateststring";
console.log(str1.indexOf("d")); //3
console.log(str1.indexOf("d", 2)); //还是3
console.log(str2.indexOf("string")); //10
console.log(str2.indexOf("funlee")); //-1
```

## lastIndexOf()

`lastIndexOf()`语法与`indexOf()`类似，它返回的是一个指定的子字符串值最后出现的位置，其检索顺序是从后向前。

```javascript
var str1 = String.fromCharCode(97, 98, 99, 100, 101); //abcde
var str2 = "thisisateststring";
console.log(str1.lastIndexOf("d")); //3
console.log(str1.lastIndexOf("d", 1)); //-1
console.log(str1.lastIndexOf("d", 5)); //3
console.log(str2.lastIndexOf("string")); //10
console.log(str2.lastIndexOf("funlee")); //-1
```

## match()

`match()`方法可在字符串内检索指定的值，或找到一个或多个正则表达式的匹配。如果参数中传入的是子字符串或是没有进行全局匹配的正则表达式，那么match()方法会从开始位置执行一次匹配，如果没有匹配到结果，则返回null。否则则会返回一个数组，该数组的第0个元素存放的是匹配文本，除此之外，返回的数组还含有两个对象属性`index` 和 `input`，分别表示匹配文本的起始字符索引和原字符串值。

```javascript
var str = "thisisateststring";
var strMatch = str.match("test");

console.log(str.match("funlee")); //null
console.log(strMatch); //Array["test"]
console.log(strMatch[0]); //test
console.log(strMatch.index); //6
console.log(strMatch.input); //thisisateststring
console.log(strMatch[1]); //undefined
```

如果参数传入的是具有全局匹配的**正则表达式**，那么match()从开始位置进行多次匹配，直到最后。如果没有匹配到结果，则返回null。否则则会返回一个数组，数组中存放所有符合要求的子字符串，**并且没有index和input属性。**

```javascript
var str = "1a2b3c4d5e";
console.log(str.match(/h/g)); //返回null
console.log(str.match(/\d/g)); //返回["1", "2", "3", "4", "5"]
```

## substring()

`stringObject.substring(start,end)`是最常用到的字符串截取方法，它可以接收两个参数(负值按 0 处理)，分别是要截取的开始位置和结束位置，它将返回一个新的字符串，其内容是从`start`处到`end-1`处的所有字符。若结束参数(end)省略，则表示从start位置一直截取到最后。

```javascript
var str = "thisisateststring";
console.log(str.substring(6, 10)); //test
console.log(str.substring(6)); //teststring
console.log(str.substring(-2)); //thisisateststring,传入负值时会视为0
```

## slice()

`slice()`方法与`substring()`方法非常类似，它传入的两个参数也分别对应着开始位置和结束位置。而区别在于，`slice()`中的参数可以为负值，如果参数是负数，则该参数规定的是从字符串的尾部开始算起的位置。也就是说，**-1 指字符串的最后一个字符**。

```javascript
var str = "abcdefg";
console.log(str.slice(1, 4)); //返回bcd
console.log(str.slice(-3, -1)); //返回ef
console.log(str.slice(1, -1)); //返回bcdef
console.log(str.slice(-1, -3)); //返回空字符串，若传入的参数有问题，则返回空
```

## substr()

`stringObject.substr(start,length)`方法可在字符串中抽取从`start`下标开始的指定数目的字符。其返回值为一个字符串，包含从 stringObject的start（包括start所指的字符）处开始的length个字符。如果没有指定 length，那么返回的字符串包含从start到stringObject的结尾的字符。另外如果start为负数，则表示从字符串尾部开始算起。

```javascript
var str = "abcdefg";
console.log(str.substr(1, 3)); //返回bcd
console.log(str.substr(2)); //返回cdefg
console.log(str.substr(-2, 4)); //返回fg，目标长度较大的话，以实际截取的长度为准
```

## replace()

`stringObject.replace(regexp/substr,replacement)`方法用来进行字符串替换操作，它可以接收两个参数，前者为被替换的子字符串（可以是正则），后者为用来替换的文本。

如果第一个参数传入的是子字符串或是没有进行全局匹配的正则表达式，那么replace()方法将只进行一次替换（即替换最前面的），返回经过一次替换后的结果字符串。

```javascript
var str = "abcdeabcde";
console.log(str.replace("a", "A")); //Abcdeabcde
console.log(str.replace(/a/, "A")); //Abcdeabcde
```

如果第一个参数传入的全局匹配的正则表达式，那么replace()将会对符合条件的子字符串进行多次替换，最后返回经过多次替换的结果字符串。

```javascript
var str = "abcdeabcdeABCDE";
console.log(str.replace(/a/g, "A")); //AbcdeAbcdeABCDE
console.log(str.replace(/a/gi, "$")); //$bcde$bcde$BCDE
```

## split()

`stringObject.split(separator,howmany)`方法用于把一个字符串分割成字符串数组。第一个参数separator表示分割位置(参考符)，第二个参数howmany表示返回数组的允许最大长度(一般情况下不设置)。

```javascript
var str = "a|b|c|d|e";
console.log(str.split("|")); //["a", "b", "c", "d", "e"]
console.log(str.split("|", 3)); //["a", "b", "c"]
console.log(str.split("")); //["a", "|", "b", "|", "c", "|", "d", "|", "e"]
```

也可以用正则来进行分割

```javascript
var str = "a1b2c3d4e";
console.log(str.split(/\d/)); //["a", "b", "c", "d", "e"]
```

## toLowerCase()和toUpperCase()

`toLowerCase()`方法可以把字符串中的大写字母转换为小写，`toUpperCase()`方法可以把字符串中的小写字母转换为大写。

```javascript
var str = "JavaScript";
console.log(str.toLowerCase()); //javascript
console.log(str.toUpperCase()); //JAVASCRIPT
```

夜已经深了！
