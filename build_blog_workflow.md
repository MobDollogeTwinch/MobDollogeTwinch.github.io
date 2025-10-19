---
title: "我如何搭建博客工作流？"
author: "mob_dolloge"
date: "2025-10-19"
status: "已完成"
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

## 构建步骤

### 建立仓库

在github上建立远程仓库的时候，将其命名为`<你的github用户名>.github.io`，这样github可以构建出一个静态网站出来。可以通过`https://<你的github用户名>.github.io/`访问到博客。

现在在本地，使用git进行仓库初始化，然后添加远程仓库。

```bash
git init
git branch -M main # 确保主分支是 main
git remote add origin https://github.com/<你的github用户名>/<你的github用户名>.github.io.git
```

### 建立草稿分支

建立一个草稿分支，用来专门存放md文件，这些md文件都是草稿。
```bash
git checkout -b draft
git checkout main # 再切回main分支
# 可以把draft分支推送远程仓库，我这里没有推
```

### 构建博客样式

新建一个文件夹`build`，文件夹内容：

> build:\
├── font\
├── template1.css\
├── template1.html\
└── template1.js

其中`font`是：

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

### 搭建博客首页

新建了几个文件，像这样：

> .\
├── build\
├── index.html\
├── index.json\
└── metadata.pandoc-tpl

文件`metadata.pandocc-tpl`就是辅助用的，它的内容只有`$meta-json$`；`index.json`是当前所有文章信息的json格式。

> 截至文章完成时我这个`index.html`的样式还是白的（

最后把main分支上所有文件都提交推送即可。
```bash
git add .
git commit -m "init main branch"
git push origin main
git checkout draft # 切到draft分支进行下一步
```

### 编写脚本

现在来新建一个自动化脚本build.sh。可以把draft分支下的md文件（草稿）转为main分支下的html文件并推送，这样就可以在`https://<你的github用户名>.github.io/`上看到你新添加/修改的文章了。脚本内容如下：
```bash
git add "$1.md"
git commit -m "update $1.md"

git checkout main
git checkout draft -- "$1.md"

pandoc "$1.md" -o "$1.html" \
  --template "./build/$2.html" \
  --toc --standalone \
  ${3:+--syntax-highlighting="$3"}

pandoc "$1.md" --template=metadata.pandoc-tpl --metadata link="$1.html" \
| sed 's/,$//' \
| jq --argjson new "$(cat)" '[. + [$new] | sort_by(.link) | group_by(.link)[] | max_by(.date)]' index.json \
> index.json.tmp && mv index.json.tmp index.json

jq '[sort_by(.link) | group_by(.link)[] | max_by(.date)]' index.json > index.tmp && mv index.tmp index.json

rm -rf "$1.md"
git restore --staged "$1.md"

git add "$1.html"
git add index.json
git commit -m "update $1.html with index.json"
git push origin main

git checkout draft
```
最后把改动提交即可。
```bash
git add build.sh
git commit -m "init draft branch by add build.sh"
```

## 使用方式

### 编写md草稿文件

关于md文件的语法可参考[这里](https://www.markdownguide.org/)。

要说的是：
1. 不用写h1标签（诸如`# title`这种），从二级标签开始。
2. 要给每个md文件里写YAML元数据。

YAML元数据写在md文件开头，格式为：
```txt
---
title: "我如何搭建博客工作流？" # h1大标签由这个title代替
author: "mob_dolloge"
date: "2025-10-18"
status: "编辑中"
---
```
元数据中的每一项最好都写上，没有的数据pandoc也不会转换。

这个元数据的作用有两个：

#### 把元数据传递给template1.html模板

对应的是build脚本中的这段代码：
```bash
pandoc "$1.md" -o "$1.html" \
  --template "./build/$2.html" \
  --toc --standalone \
  ${3:+--syntax-highlighting="$3"}
```
`template1.html`文件中充斥着`$var$`这样的代码。可截取一段代码来看看：
```html
<header>
    <h1 id="$title$">$title$</h1>
    $if(author)$<p>作者：$author$</p>
    &nbsp;&nbsp;&nbsp;&nbsp;$endif$
    $if(date)$<p>日期：$date$</p>
    &nbsp;&nbsp;&nbsp;&nbsp;$endif$
    $if(status)$<p>文章状态：$status$</p>$endif$
</header>

<main>
    $body$
</main>
```
其中`$author$`、`$date$`差不多和YAML元数据中的元素相当，`$body$`可以参考[这里](https://www.koudingke.cn/docs/zh-Hans/pandoc-docs/latest/User-Guide/Templates#template-syntax)。

#### 把元数据传递给index.json

对应的是这段代码：
```bash
pandoc "$1.md" --template=metadata.pandoc-tpl --metadata link="$1.html" \
| sed 's/,$//' \
| jq --argjson new "$(cat)" '[. + [$new] | sort_by(.link) | group_by(.link)[] | max_by(.date)]' index.json \
> index.json.tmp && mv index.json.tmp index.json
```
就是用pandoc提取md文件中YAML元数据，再补充一个叫link的元数据项（`--metadata link="$1.html"`），把所得元数据交给jq处理成json格式，输出到`index.json`。

### 使用build.sh

通过命令`source build.sh <草稿> <模板> <代码样式>`，即可将转换后的内容推送到远程仓库。其中：

- <草稿>：md草稿文件的名字，记得不用带md后缀。
- <模板>：要使用的模板，所有可用模板都在main分支下的build文件夹下，同样的这里不用带html后缀。目前只写了template1。
- <代码样式>：有时候写md文件时会加代码块进去，转换为html文件时可以指定样式，推荐**zenburn**。