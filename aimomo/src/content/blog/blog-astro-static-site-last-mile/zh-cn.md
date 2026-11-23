---
title: "Astro 建站已经走到「最后一公里」：全文搜索、OG 图、RSS 都有人把坑踩完了"
pubDate: 2026-11-23
description: "11 月 19 日一位开发者公开了自己的 Astro 6 + Cloudflare Workers 实测：11 种语言、约 250 篇 MDX、Lighthouse 性能 97、月成本 0 美元。全文搜索靠 Pagefind，客户端只有 15KB；而最容易翻车的地方，是 RSS 端点一旦不是预渲染就直接 500。"
category: "博客"
image: ""
draft: false
slugId: "momo/blog-astro-static-site-last-mile"
---

这几天博客圈在聊两件事：WordPress 的份额继续下滑，以及一批用 Astro 的人开始晒"零成本小站"的实测。

后者更值得看。11 月 19 日，一位开发者把自己搭的多语言 B2B 站点完整写了出来：Astro 6 + Cloudflare Workers，11 种语言、约 250 个 MDX 文件、Lighthouse 性能 97、SEO 100、可访问性 96，首屏小于 0.8 秒，月成本 0 美元。他不是在炫耀配置，而是在讲"哪些地方会翻车"——这部分对写博客的人更有用。

## 静态站的三件"以前做不了"的事

早几年自己搭博客，最烦的是三样东西：站内搜索、社交分享图、订阅源。要么接第三方（Algolia 要钱、百度站内搜索难看），要么自己写后端。

现在这三件基本都被抹平了：

**全文搜索**用 Pagefind，构建时扫一遍输出目录，生成一份二进制索引，客户端 JS 十五 KB 左右，索引懒加载，还能按页面 `lang` 属性自动分语言检索。整个接入就是一条命令，零后端、零月费。它唯一的限制是只索引预渲染出来的静态页——动态路由的内容搜不到，对博客来说问题不大。

**分享用的 OG 图**用 Satori + resvg 在构建期生成 1200×630 的卡片。这里有个特别隐蔽的坑：resvg.wasm 的版本要跟 npm 包对齐，得在 `prebuild` 里从 `node_modules` 复制一份到 `public`，否则哪天升级就突然生成失败。

还有一个坑值得单独记：`librsvg`（很多非浏览器环境用的渲染器）会静默丢掉 SVG 元素的 `stroke`。在浏览器里画得好好的线条，导成图就只剩填充色的圆点，还不报错。所以凡是要在浏览器外渲染的图——favicon、OG 图、服务端生成的 PNG——只用 `fill`，别用 `stroke`。

**RSS** 是最容易出事故的一个。这位作者的做法很简单：整站静态预渲染，只留两个动态端点（询盘表单和 OG 图）。中途他把 RSS 源设成了 `prerender = false`，上线直接 500——因为 `getCollection` 只能在构建期跑，Workers 运行时根本没有内容存储。改回 `prerender = true`，立刻正常。

这条我特别有共鸣。静态框架里所有"读内容"的 API 都活在构建期，一旦你把某个端点放进运行时，它跟内容集合的关系就断了。这不是框架的锅，是很多人对"构建期/运行期"这条边界的直觉不够。

## Astro 自己也在提速

顺带说下底座的变化。Astro 7 这代做了几件挺硬的事：`.astro` 编译器从 Go 重写成 Rust（基于 oxc 和 Lightning CSS），Markdown/MDX 的默认管道换成 Rust 写的 Sätteri，替代原来的 remark/rehype 体系，打包换到 Vite 8 + Rolldown。官方在六个真实站点上的测试是构建快 15% 到 61%，astro.build 自己从约 63 秒降到 24 秒。

副作用也得知道：如果你还在用 remark-gfm、remark-math 这类插件，升级后要单独装 `@astrojs/markdown-remark` 才会继续生效；`astro db` 相关命令被移除了；`Astro.glob()` 和老式 content collections 也早就没了。另外 Astro 7 开始检测到 AI 编码代理时，`astro dev` 会自动转成后台进程，还加了 `dev stop`、`dev status`、`dev logs` 三个子命令——这个细节挺有意思，开发工具的默认行为开始为"另一个 AI 在敲命令"设计了。

主题生态也没闲着。11 月里 Astro Paper（5.2k star）、Firefly（2.5k）、ScrewFast、accessible-astro-starter 都在更新，AstroWind 已经吃到 Astro 7 和 Tailwind 4 的组合。

## 我的判断

我一直觉得，独立博客真正的门槛从来不是技术，而是"折腾成本"——你花在装修上的每一个小时，都是从写作里挪出来的。

现在这个成本的构成变了。搜索、OG 图、RSS、多语言、SEO 元信息，都有成熟做法和一堆现成的踩坑记录；静态站还能借 Cloudflare Workers 挂一两个动态接口，把表单、图床这类以前必须上 VPS 的需求解决掉。剩下真正要花时间的是两件事：选一个你看得下去的主题，然后坚持写。

所以如果你正在犹豫要不要从 WordPress 迁出来，我的建议是：先问自己是想"经营一个站"还是"写点东西"。前者需要后台、插件、评论、会员体系，WordPress 依然省事；后者用 Astro 这类静态框架，两小时能上线，之后每月零成本——只要你别再手贱去改主题。

至于那个 120 秒之后就忘事的 AI 世界模型都开始卖钱了，一个两小时能跑起来的博客，实在没什么理由再拖。
