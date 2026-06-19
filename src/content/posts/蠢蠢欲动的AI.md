---
title: 蠢蠢欲动的AI
pubDate: 2026-05-26
categories: ['技术']
tags: ['AI', 'Astro', 'Trae', 'CodeX', '博客', '主题']
commentCount: 0
---
Vibe Coding真的是让人上头，容易成瘾啊。基本上只要你有想法有钱有Token，就没有办不成的事。我这一瓶子不满，半瓶子晃荡的水平，也能做到自己解决问题，不用事事麻烦别人。现在的情况，对于我来说已经很满足了。
最近梯子比较稳定之后，我用上了 CodeX + GPT5.5，瞬间觉得这 Trae 一点也不香了。手里的Trae CN换成了Trae SOLO CN，直接从 0 开始，感觉已经上了一个档次了。但是理解能力，编程能力和 CodeX 比起来，只能让贤了。尤其CodeX + GPT5.5的自然语言理解能力和上下文的阅读记忆能力太厉害了。从Trae CN换成CodeX + GPT5.5的惊艳程度，就像我从豆包+Vs code 换到Trae的惊艳程度还要厉害。

##  **1. Astro 后台**

最近看到好多人再整博客后台，静态博客动态化，CMS，博客程序等等，我这又开始动心思了。给自己的 Astro 整了一个工具，暂且就叫后台吧，能有的功能都加上，把博客里不需要的功能该减的减掉。主打一个随心所欲。
我把CodeX和Trae SOLO都打开，同样的要求和语言，都是从 0 开始。给了我两个外观完全不一样的后台。
![Trae SOLO.webp](https://img.ficor.net/uploads/2026/05/7050603cd1ae880776918a616a9f3c98.webp)
![CodeX.webp](https://img.ficor.net/uploads/2026/05/d37ea606d099d45be263a3a4727ebbcc.webp)

>静态博客动态化，想写一个astro 博客的后台，可以实现文章管理，评论管理，友链管理，订阅源管理，修改确定后git上传github，自动部署 。

就是这么简单的一句话，写完了答题框架和主要功能。后期随着使用和测试，继续微调，最终成品。我要的功能，大差不差的倒是基本上都给到我了，满足了我一开始的预期。
现在可以做到新建文章，输入标题后，自动生成 slug，文章输入后，提取摘要和 tags，文章可以删除，存草稿。友链输入网址，自动获取网站名，头像，标题和订阅地址，并添加到订阅源页面。所有改动一键提交 github 并部署到 vercel 或者 cloudflare。基本满足我的需要，后期接入评论系统，可以管理评论。只是现在都是在测试，静态站没有接入评论系统。

![仓库管理.webp](https://img.ficor.net/uploads/2026/05/0710b16a8cf3f1913daf40a77e727ff9.webp)
CodeX的这一个， github 仓库管理比较友好，可以通过github token 绑定多个仓库，也可以说是多个站点，然后一键切换，一键部署，就很方便了。
<div style="display: flex; justify-content: center; gap: 15px;"> 
<img src="https://img.ficor.net/uploads/2026/05/7f9127ecd083068afe7a0d30d5b89112.webp" width="200" /> 
<img src="https://img.ficor.net/uploads/2026/05/f7ca20b74c483475228c757dd5c22002.webp" width="200" /> 
<img src="https://img.ficor.net/uploads/2026/05/c29cd757fee068c5a213326909d304c7.webp" width="200" /> 
<img src="https://img.ficor.net/uploads/2026/05/394d858c87d380846586e108da5f1385.webp" width="200" /> 
</div>

两个软件，两种风格，但是配色都是满满的AI风，不过这颜色倒是都还在审美上，不难看，看着很舒服。

##  **2. [ThoughtLite](https://github.com/tuyuritio/astro-theme-thought-lite)主题**

![Thought Lite.webp](https://img.ficor.net/uploads/2026/05/9618d2c56b3cd0423cf50c4fced153aa.webp)

这个主题可以说心水很久了，作者是五月七日千緒[tuyuritio](https://github.com/tuyuritio)，网站是[記緒漂流](https://ttio.cc)。主题有两个版本，一个是普通版，一个是 CloudFlare版，带评论区只能部署到 Cloudflare。也就是 Github仓库的两个分支。
最早一直在研究普通版，后来看上了这个评论区的样式。自己瞎研究，后来带上AI，带上 Trae 一起研究，一直没有弄好。需要用到 Cloudflare 的 D1 和Cloudflare Turnstile，还有 Github 的很多东西。咱是两眼一抹黑，什么也不会啊。自己修改了好几版，最后放弃了。
最近这不是用上用上了 CodeX + GPT5.5了嘛，想着再试试吧。可能之前这AI确实也是不太会用，这次居然成了，自己给我注册配置 D1 和 Turnstile，包括后续的评论系统用 Github 账号登录等等，反正现在能行了，评论区也能用了，全部在 Cloudflare 上。
![文章页大纲和评论区.webp|626](https://img.ficor.net/uploads/2026/05/4c4a720903a3c9c5d4a79a0fb0318dba.webp)

非常简洁、干净的一个主题，全部弄好以后，CodeX 帮我直接提交推送并部署完成。绑定域名之后就直接上线了。细节部分整理之后，可以算得上是完美了。后续会把之前使用的主题全部部署到 cloudflare pages 上，不启用域名，只是自己收藏。
前几天还复刻了几个主题，这些小项目很上瘾啊，玩的不亦乐乎，基本上填满了最近的休息时间。有时候工作中偶尔摸鱼的时候，手还是痒痒。笔记本上暂时还没有安AI软件。所以，工作时间暂时还不能太嚣张了，哈哈。
<div style="display: flex; justify-content: center; gap: 15px;"> 
<img src="https://img.ficor.net/uploads/2026/05/8433997bf0cf1bd37e44fac9dab458af.webp" width="200" /> 
<img src="https://img.ficor.net/uploads/2026/04/69e8c9850be03.webp" width="200" /> 
<img src="https://img.ficor.net/uploads/2026/05/83cfc4407250c18a38872c03e70480e2.webp" width="200" /> 
</div>

第一个是 Hugo 的Vortisil主题，转成 Astro 的主题之后添加了一些自己需要的东西。第二个是复刻的[方糖](https://fangtang.net)的主题，第三个是完全自己做的主题。之前还看到[東风](https://easte.cc)的上一个两栏主题，复刻了一下，现在还是半成品，没有成品出炉，没有截图。在此还要感谢一下[方糖博客](https://fangtang.net/)和[東风](https://easte.cc)。
就这，收工。