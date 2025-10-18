---
title: "我如何搭建博客工作流？"
author: "mob_dolloge"
date: "2025-10-18"
status: "编辑中"
---

## 当前环境 & 工具

### 操作系统环境

- [Arch Linux x86_64](https://archlinux.org/) 
内核版本 6.17.1-arch1-1

### 工具
- [pandoc](https://pandoc.org) 版本 3.8.2

- [jq](https://jqlang.org/) 版本 1.8.1

- [git](https://git-scm.com/) 版本 2.51.0

> Note:\
以上工具都通过命令`sudo pacman -S <software_name>`下载。

### 搭建网页的原材料

- HTML
- JS
- CSS

不涉及任何前端框架，纯原生。

## 步骤

### 博客样式构建

新建一个文件夹build，文件夹内容：
> build:\
├── font\
├── template1.css\
├── template1.html\
└── template1.js

> font:\
├── fontello.woff\
└── fontello.woff2

其中`template1.html`为博客模板文件，在其中引用了`template1.css`和`template1.js`。

#### 博客模板写法一二

关于`template1.html`以及所有可以做pandoc模板的HTML文档的写法可参考[这里](https://www.koudingke.cn/docs/zh-Hans/pandoc-docs/latest/User-Guide/Templates#template-syntax)。

可以把形如`$var$`的变量写入HTML文档中，比如可以这样写：

```html
<title>$title$</title>
```

上面的代码相当于把其他文档或者传递给pandoc的变量写入到该HTML文档中。请看后面小节获取进一步信息。

#### 自制小图标字体

`font`文件夹下是小图标字体文件，可在[fontello](https://fontello.com/)网站摘取，总共摘取三个。

摘取后下载可获得一个压缩包，解压并找到其中的woff和woff2文件一般就可以了。这里我把两个文件都放在了`build`文件夹下的`font`文件夹。

想要引入这个小图标字体，这里可以做一个参考：

```css
@font-face {
    font-family:"myicons";
    src:
    url(font/fontello.woff2)format("woff2"),
    url(font/fontello.woff)
    format("woff");font-weight:400;font-style:normal
}

[class*=" fa-"],[class^=fa-] {
    font-family: "myicons";
    font-style: normal;
    font-weight: 400;
    speak: none;
    display: inline-block;
    text-decoration: inherit
}

.fa-home::before {
    content: "/e800"
}

.fa-top::before {
    content: "/e801"
}

.fa-adjust::before {
    content: "/e802"
}
/* 如何知道是/e800还是什么呢？可以参考解压包中的几个css文件，找到类似的带有::before的写法 */
```

### 博客首页搭建

新建了几个文件，像这样：

> .\
├── build\
├── index.html\
├── index.json\
└── metadata.pandoc-tpl

文件`metadata.pandocc-tpl`就是辅助用的，它的内容只有`$meta-json$`；`index.json`是当前所有文章信息的json格式。请看后面小节获取进一步信息。

### 仓库构建

使用git进行仓库初始化，并提交所有的内容，最后推送到远程仓库中。
```bash
git init
git add .
git commit -m "init blog"
git branch -M main # 确保主分支是 main
git remote add origin <远程仓库URL>
git push origin main
```
建立远程github仓库的时候，将其命名为`<你的用户名>.github.io`，这样子github可以构建出一个静态网站出来。可以通过`https://<你的用户名>.github.io/`访问到博客。

### 建立一个草稿分支

（待续）