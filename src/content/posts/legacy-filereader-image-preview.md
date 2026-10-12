---
slug: "legacy-filereader-image-preview"
title: "使用H5 FileReader"
description: "使用 FileReader 读取本地图片并预览的示例。"
publishedAt: "2016-06-07T22:33:04+08:00"
category: "engineering"
tags: ["frontend"]
---

利用H5的FileReader接口，我们可以对本地上传的文件（图片）进行本地预览。在以前，要想在页面上显示本地图片，我们通常的做法是将选择的图片文件上传至后端服务器，后端对其进行存储，再将图片的URL返回到前端，前端通过这个URL来显示图片。但是现在，你可以实现本地预览了！

下面是一个简单的栗子：

HTML:

```html
<p>
  <label>请选择一个图片文件： <input type="file" id="file_input" /></label>
</p>
<div id="result"></div>
```

JS:

```html
<script type="text/javascript">
  var result = document.getElementById("result");
  var input = document.getElementById("file_input");
  //进行检测判断
  if (typeof FileReader == "undefined") {
    result.innerHTML = "抱歉，你的浏览器不支持 FileReader";
    input.setAttribute("disabled", "disabled");
  } else {
    input.addEventListener("change", readFile, false);
  }

  function readFile() {
    var file = this.files[0];
    if (!file) return;
    //文件类型判断
    if (!/image\/\w+/.test(file.type)) {
      alert("文件必须为图片！");
      return false;
    }
    var reader = new FileReader(); //实例化FileReader
    reader.readAsDataURL(file);
    reader.onload = function (e) {
      result.innerHTML = '<img src="' + this.result + '" alt="" />';
    };
  }
</script>
```

通过以上代码可知，实现本地预览的大致流程是：实例化FileReader后，调用readAsDataURL接口，将启动异步加载文件内容，然后给reader监听一个onload事件，将数据加载完毕后，在onload事件处理中，通过reader的result属性获取文件内容。

扩展研究：

**实现一次上传多张并进行本地预览**

**实现上传文本并（不仅限txt）进行本地预览**

**实现大文件上传，利用进度条展示上传进度**
