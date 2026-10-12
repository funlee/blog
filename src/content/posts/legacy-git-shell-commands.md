---
slug: "legacy-git-shell-commands"
title: "git shell命令大全"
description: "日常提交、分支管理与远程仓库操作的 Git Shell 命令笔记。"
publishedAt: "2016-03-16T21:53:10+08:00"
category: "engineering"
tags: ["tools"]
---

当github客户端无法提交文件的时候，不妨试试Git Shell，以下是命令大全，方便用的时候参考！

- `git branch`：查看本地所有分支

- `git status`：查看当前状态

- `git commit`：提交

- `git branch -a`：查看所有的分支

- `git branch -r`：查看远程所有分支

- `git commit -am "init"`：暂存并提交已跟踪文件的修改和删除，并添加说明

- `git remote add origin git@192.168.1.119:ndshow`

- `git push origin master`：将文件给推到服务器上

- `git remote show origin`：显示远程库origin里的资源

- `git push origin master:develop`

- `git push origin master:hb-dev`：将本地master推送到远程hb-dev分支

- `git checkout --track origin/dev`：切换到远程dev分支

- `git branch -D develop`：强制删除本地分支develop

- `git checkout -b dev`：建立一个新的本地分支dev

- `git merge origin/dev`：将分支dev与当前分支进行合并

- `git checkout dev`：切换到本地dev分支

- `git remote show`：查看远程库

- `git rm`：文件名(包括路径) 从git中删除指定文件

- `git clone git://github.com/schacon/grit.git`：从服务器上将代码给拉下来

- `git config --list`：查看所有配置

- `git ls-files`：查看索引中的受跟踪文件（包括已暂存的新文件）

- `git rm [file name]`：删除一个文件

- `git commit -a`：暂存并提交已跟踪文件的修改和删除，不包含未跟踪文件

- `git add [file name]`：添加一个文件到git index

- `git commit -v`：当你用－v参数的时候可以看commit的差异

- `git commit -m "This is the message describing the commit"`：添加commit信息

- `git commit -a -a会自动暂存已跟踪文件的修改和删除，然后提交，不包含未跟踪文件`

- `git commit -a -v`：一般提交命令

- `git log`：看你commit的日志

- `git diff`：查看尚未暂存的更新

- `git rm a.a`：移除文件(从暂存区和工作区中删除)

- `git rm --cached a.a`：移除文件(只从暂存区中删除)

- `git commit -m "remove"`：提交已暂存的删除操作

- `git rm -f a.a`：强行移除修改后文件(从暂存区和工作区中删除)

- `git diff --cached`：或 $ git diff --staged 查看尚未提交的更新

- `git stash push`：将文件给push到一个临时空间中

- `git stash pop`：将文件从临时空间pop下来
