<h1>astro-theme-warmpaper</h1>
<p><em>「八千年前的陶工与今天的 AI，不约而同画出了同一个图形——有些直觉，比文明更古老。」</em></p>
<p>一个温暖的 Astro 博客主题，灵感来自 Claude 的配色方案。<br>米色背景搭配淡橙色方格草稿纸纹理，营造沉浸式阅读体验。</p>


[![GitHub License](https://img.shields.io/github/license/finch-xu/astro-theme-warmpaper?color=DA7756)](LICENSE)
[![Astro Version](https://img.shields.io/badge/astro-%3E%3D5.0.0-DA7756)](https://astro.build)
[![Node Version](https://img.shields.io/badge/node-%3E%3D20-DA7756)](https://nodejs.org)
[![GitHub Stars](https://img.shields.io/github/stars/finch-xu/astro-theme-warmpaper?style=flat&color=DA7756)](https://github.com/finch-xu/astro-theme-warmpaper)

**在线预览**: [pidan.dev](https://pidan.dev)

<table>
  <tr>
    <td><img src="screenshots/home.png" alt="首页"></td>
    <td><img src="screenshots/post.png" alt="文章页"></td>
  </tr>
</table>

---

## 特性

- Claude 风格配色（温暖米色 + 橙色强调）
- 淡橙色方格草稿纸背景
- 文章页单栏布局 + 右侧 TOC 目录（sticky 定位，滚动高亮）
- 首页卡片式文章列表
- 响应式设计（移动端自动隐藏 TOC）
- 霞鹜文楷 GB 字体（CDN 分片加载）
- 支持亮色、暗色主题，自适应切换，并支持手动切换
- Content Collections 管理博客内容
- TypeScript 支持

## 快速开始

### 安装

```bash
# 创建一个新的 Astro 项目
npm create astro@latest my-blog
cd my-blog

# 克隆或复制这个主题的内容到你的项目
```

### 配置主题

编辑 `src/config.ts` 来自定义主题配置：

```typescript
export const DEFAULT_CONFIG: ThemeConfig = {
  site: {
    title: 'Warmpaper',
    description: 'A warm, Claude-inspired blog theme for Astro',
    author: 'Your Name',
    language: 'en',
  },
  menu: [
    { name: 'Home', path: '/' },
    { name: 'Archives', path: '/archives' },
    { name: 'Tags', path: '/tags' },
    { name: 'Categories', path: '/categories' },
    { name: 'About', path: '/about' },
  ],
  toc: {
    enable: true,
    maxDepth: 3,
    minDepth: 2,
    listNumber: false,
  },
  profile: {
    avatar: '/logo.svg',
    description: 'A warm, Claude-inspired blog theme for Astro',
    links: [
      { name: 'GitHub', url: 'https://github.com/finch-xu/', icon: 'github' },
    ],
  },
};
```

### 添加文章

在 `src/content/posts/` 目录下创建 Markdown 文件：

```markdown
---
title: '文章标题'
date: 2026-05-31
tags: ['标签1', '标签2']
category: '分类'
excerpt: '文章摘要'
---

文章内容...
```

### 开发

```bash
npm run dev
```

### 构建

```bash
npm run build
```

### 预览

```bash
npm run preview
```

## 字体引用

本主题使用以下外部字体资源：

### 霞鹜文楷 GB (LXGW WenKai GB)

用于全站排版的开源楷体字体（正文、导航栏、TOC 等均统一使用），基于 FONTWORKS Klee One 衍生，符合大陆 G 源字形标准。

- **字体原仓库**: https://github.com/lxgw/LxgwWenkaiGB
- **Webfont 分片包**: https://github.com/CMBill/lxgw-wenkai-gb-web
- **CDN (Regular)**: https://cdn.jsdelivr.net/npm/lxgw-wenkai-gb-web@latest/lxgwwenkaigb-regular/result.css
- **CDN (Medium)**: https://cdn.jsdelivr.net/npm/lxgw-wenkai-gb-web@latest/lxgwwenkaigb-medium/result.css
- **字体许可证**: [SIL Open Font License 1.1](https://openfontlicense.org/)

## 许可证

主题代码基于 [MIT License](LICENSE) 发布。

引用的字体资源遵循 [SIL Open Font License 1.1](https://openfontlicense.org/) 许可证。

# WarmPaper
