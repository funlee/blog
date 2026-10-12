---
slug: "legacy-hexo-setup"
title: "hexo折腾记(回忆版)"
description: "回顾搭建、部署和折腾 Hexo 博客的过程。"
publishedAt: "2016-05-05T23:50:07+08:00"
category: "engineering"
tags: ["tools"]
---

## 一、安装git

## 二、安装Node.js

## 三、利用Node.js下载 hexo

```bash
npm install -g hexo
```

## 四、部署本地hexo

创建本地hexo文件夹，如 `E:/hexo`，执行 `hexo init` 在本地建立博客所需的所有文件，接着执行 `npm install` 安装依赖包。

## 五、本地查看

`hexo generate` `hexo server` 默认端口是:4000

## 六、注册github账号

创建仓库名 `username.github.io`

## 七、配置ssh

1. 设置 Git 用户信息：

```bash
$ git config --global user.name "funlee"
$ git config --global user.email "funlee@gmail.com"
```

2. 查看是否已经有了ssh密钥：

```bash
cd ~/.ssh
```

3. 生成密钥：

```bash
$ ssh-keygen -t rsa -C "funlee@gmail.com"
```

4. 将公钥添加到 GitHub 的 SSH keys：

本地密钥文件路径

```text
C:\Documents and Settings\Administrator\.ssh\id_rsa.pub
```

5. 测试ssh

执行 `ssh -T git@github.com`

根据提示输入 yes 验证

## 八、编辑hexo 配置文件，部署到github上面

```yaml
deploy:
  type: git
  repository: git@github.com:username/username.github.io.git
  branch: master
```

执行如下命令完成配置文件修改

```bash
npm install hexo-deployer-git --save
```

再执行如下命令，完成部署

```bash
hexo generate
hexo deploy
```

## 九、浏览器访问

http://username.github.io

## 十、主题折腾、域名绑定、多说评论、网站小图标

勇敢的去折腾把，不折腾，那还搞这个干嘛！！

推荐几个主题:

light主题：

```bash
git clone https://github.com/hexojs/hexo-theme-landscape.git themes/landscape
```

yilia主题：

```bash
git clone https://github.com/litten/hexo-theme-yilia
```

phase主题：

```bash
git clone git://github.com/tommy351/hexo-theme-phase.git themes/phase
```
