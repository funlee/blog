---
slug: "legacy-github-windows-install"
title: "解决github for windows安装失败"
description: "记录当年 GitHub for Windows 客户端安装失败的处理过程。"
publishedAt: "2016-03-14T20:34:53+08:00"
category: "engineering"
tags: ["tools"]
---

> 本文记录的是 2016 年旧版 GitHub for Windows 客户端的安装经历。

每次安装github for windows都遇到这个问题：

_**An error occurred trying to download 'http://github-windows.s3.amazonaws.com/GitHub.application'.**_

解决办法如下：

## 一、IE浏览器中将下面的站点添加进受信任站点

```text
https://github-windows.s3.amazonaws.com/GitHub.application
```

## 二、删除下述路径下的2.0文件

```text
C:\Users\Administrator\AppData\Local\Apps
```

如过上述两个办法还不能解决问题，就通过“命令提示符(管理员)”执行下命令：

```text
%SYSTEMROOT%\SYSTEM32\REGSVR32.EXE %SYSTEMROOT%\SYSTEM32\WUAUENG.DLL
```

祝你成功！！
