# Ficor

一个简洁优雅的 Astro 博客主题，专为个人博客设计。
【预览】：https://demo7.ficor.cc
![69db58567b3ab.webp](https://img.ficor.net/uploads/2026/04/69db58567b3ab.webp)

## ✨ 特点

- 🎨 **简洁优雅的设计** - 清爽的视觉风格，专注内容阅读体验
- 🌓 **支持暗黑模式** - 自动检测系统偏好 + 手动切换按钮
- 📱 **完全响应式设计** - 完美适配桌面、平板和手机设备
- ⚡ **基于 Astro 5.x** - 性能极佳，加载速度快
- 🔍 **SEO 友好** - 内置 sitemap 和 RSS 订阅
- 📄 **支持 Markdown** - 轻松编写博客文章
- 🏷️ **标签和分类** - 完善的内容组织系统
- 📑 **文章大纲** - 侧边浮动目录，快速导航
- 📊 **阅读统计** - 显示文章阅读量和评论数
- 🔗 **社交链接** - 支持 GitHub、Twitter、微博等社交平台

## 🚀 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 启动开发服务器

```bash
pnpm dev
```

访问 http://localhost:4321 查看效果。

### 3. 构建生产版本

```bash
pnpm build
```

### 4. 预览生产版本

```bash
pnpm preview
```

## 📁 项目结构

```
Ficor/
├── src/
│   ├── components/          # Astro 组件
│   │   ├── Header.astro      # 顶部导航栏
│   │   ├── Footer.astro      # 页脚
│   │   ├── PostCard.astro    # 文章卡片
│   │   ├── Pagination.astro  # 分页组件
│   │   ├── RecentActivity.astro # 最近动态
│   │   └── ThemeScript.astro # 主题切换脚本
│   ├── content/             # 内容集合
│   │   ├── blog/            # 博客文章
│   │   ├── about/            # 关于页面内容
│   │   └── activity/         # 动态/活动记录
│   ├── layouts/             # 页面布局
│   │   └── Layout.astro      # 主布局
│   ├── pages/               # 页面路由
│   │   ├── index.astro       # 首页
│   │   ├── about/            # 关于页
│   │   ├── archive/          # 归档页
│   │   ├── blog/             # 文章详情页
│   │   ├── categories/       # 分类页
│   │   ├── tags/             # 标签页
│   │   ├── friends/          # 友链页
│   │   ├── activity/         # 动态页
│   │   ├── page/             # 分页页
│   │   └── rss.xml.ts        # RSS 订阅
│   ├── styles/              # 样式文件
│   │   ├── vars.css          # CSS 变量
│   │   ├── global.css        # 全局样式
│   │   ├── header.css        # 头部样式
│   │   ├── footer.css        # 页脚样式
│   │   ├── main.css          # 主布局样式
│   │   ├── hero.css          # 首页英雄区样式
│   │   ├── post-card.css     # 文章卡片样式
│   │   ├── post.css          # 文章详情样式
│   │   ├── pagination.css    # 分页样式
│   │   └── activity.css      # 动态样式
│   ├── config/              # 配置文件
│   │   ├── friends.ts        # 友链配置
│   │   └── index.ts          # 站点配置
│   └── config.ts            # 站点主配置
├── public/                  # 静态资源
├── package.json
├── astro.config.mjs         # Astro 配置
├── tsconfig.json            # TypeScript 配置
└── README.md               # 项目说明
```

## ⚙️ 配置

### 站点配置

编辑 `src/config.ts` 修改站点配置：

```typescript
export const SITE = {
  title: 'Ficor',
  description: '个人博客',
  author: 'Ficor',
  language: 'zh-CN',
  keywords: ['博客', '技术', '生活'],
};

export const POSTS_PER_PAGE = 10;

export const SOCIAL = {
  github: 'https://github.com/yourusername',
  twitter: 'https://twitter.com/yourusername',
  email: 'your@email.com',
  weibo: 'https://weibo.com/yourusername',
  zhihu: 'https://zhihu.com/people/yourusername',
  bilibili: 'https://space.bilibili.com/yourid',
  mastodon: 'https://mastodon.social/@yourusername',
  rss: true,
};
```

### Astro 配置

编辑 `astro.config.mjs` 修改站点 URL：

```javascript
export default defineConfig({
  site: 'https://yourdomain.com',
  // ...
});
```

## 📝 创建内容

### 博客文章

在 `src/content/blog/` 目录下创建 `.md` 文件：

```markdown
---
title: '我的第一篇文章'
date: 2024-01-01T12:00:00+08:00
draft: false
category: '技术'
tags: ['astro', 'blog']
---

文章内容...
```

**Frontmatter 字段说明：**

| 字段 | 类型 | 说明 |
|------|------|------|
| title | string | 文章标题 |
| date | string | 发布日期（ISO 格式） |
| draft | boolean | 是否草稿 |
| category | string | 分类 |
| tags | array | 标签列表 |

### 关于页面

在 `src/content/about/index.md` 中编辑关于页面内容。

### 友链配置

编辑 `src/config/friends.ts` 添加友情链接：

```typescript
export const friends = [
  {
    name: '朋友名称',
    url: 'https://example.com',
    description: '朋友博客描述',
  },
];
```

## 🎨 自定义样式

主题使用 CSS 变量，易于自定义。编辑 `src/styles/vars.css`：

```css
:root {
  /* 颜色变量 */
  --color-bg: #fafafa;
  --color-surface: #ffffff;
  --color-text: #333333;
  --color-accent: #2c3e50;
  --color-link: #3498db;
  
  /* 字体变量 */
  --font-serif: 'Noto Serif SC', Georgia, serif;
  --font-sans: 'Noto Sans SC', sans-serif;
  
  /* 布局变量 */
  --header-height: 60px;
  --container-max-width: 800px;
}
```

### 深色模式

主题自动支持深色模式，CSS 变量会根据 `data-theme` 属性自动切换：

```css
[data-theme="dark"] {
  --color-bg: #1a1a1a;
  --color-surface: #2d2d2d;
  --color-text: #e0e0e0;
  --color-accent: #ecf0f1;
}
```

## 🚀 部署

### 部署到 Cloudflare Pages

1. 推送到 GitHub 仓库
2. 在 Cloudflare Dashboard 创建 Pages 项目
3. 连接 Git 仓库
4. 设置构建命令：
   - Build command: `pnpm build`
   - Build output directory: `dist`
5. 添加环境变量：
   - `NODE_VERSION`: `20`

### 部署到 Vercel

1. 安装 Vercel CLI：`npm install -g vercel`
2. 运行：`vercel`
3. 按照提示完成部署

### 部署到 Netlify

1. 连接 GitHub 仓库
2. 设置构建命令：`pnpm build`
3. 设置输出目录：`dist`

## 📊 功能特性

### 文章大纲

文章页面右侧显示浮动大纲目录，自动提取 `h2` 和 `h3` 标题，点击可快速跳转到对应位置。

### 浮动按钮

页面右下角显示两个浮动按钮：
- 🔼 回到顶部
- 💬 跳转到评论区（文章页）/ 页面底部（其他页面）

### 分页导航

支持分页浏览博客文章，首页显示最新文章。

### 标签和分类

文章支持标签和分类，可按分类或标签筛选文章。

### 归档页面

按年份归档显示所有文章，最新年份在最上方。

## 🛠️ 技术栈

- **框架**: Astro 5.x
- **语言**: TypeScript
- **样式**: CSS Modules
- **图标**: SVG
- **构建工具**: Vite

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📧 联系

如有问题或建议，欢迎通过以下方式联系：

- Email: ficor@ficor.cc
- GitHub: https://github.com/ficorcc
