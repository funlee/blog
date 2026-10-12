---
slug: "legacy-restore-hexo"
title: "关于重装系统过后恢复hexo使用"
description: "记录重装系统或更换电脑后恢复 Hexo 博客环境的过程。"
publishedAt: "2016-02-28T13:36:31+08:00"
category: "engineering"
tags: ["tools"]
---

刚刚经历了重装系统，现在hexo恢复使用，琢磨着以后肯定还会经历重装系统或者是更换电脑，关于经历这些过后hexo如何继续使用的问题，在这里记录下自己的解决办法！

在重装系统过后，之前的hexo文件是还在本地的，恢复之前的使用需要经历如下步骤：

- [安装nodejs](https://nodejs.org/en/)
- [安装git](http://git-scm.com/download/)
- 执行`$ npm install hexo -g` 下载hexo
- 重新生成SSH密钥，部署到[github](https://github.com/)上

生成SSH密钥过程：

设置Git的user name和email：

```bash
$ git config --global user.name "leeYiChen"
$ git config --global user.email "i@funlee.cn"
```

查看是否已经有了ssh密钥：

```bash
cd ~/.ssh
```

先检查此文件夹中是否已有可复用的密钥；如果已有，先备份，避免重新生成时覆盖。

生成密钥：

```bash
$ ssh-keygen -t rsa -C "i@funlee.cn"
```

如果需要设置密码为空则敲击三次回车，值得一提的是**此处输入密码不会显示，但实际上是输入了的！**

最后在指定路径下得到了两个文件：id_rsa和id_rsa.pub。

添加密钥到ssh：ssh-add 文件名：

在github上添加ssh密钥，这要添加的是“id_rsa.pub”里面的公钥。

测试：

```bash
ssh -T git@github.com
```

至此hexo已经恢复正常使用了。如果是更换电脑，记得拷贝整个hexo文件到新电脑，然后执行本文的步骤，依旧可以恢复使用hexo！
