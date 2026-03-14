---
title: 我的第一篇 Astro 博客文章
id: astro-first-post
timestamp: 2026-01-01
series: 技术
tags:
  - Astro
  - 教程
  - 博客
---

# 欢迎来到我的博客！

这是使用 **Astro** 构建的第一篇文章。

## 为什么选择 Astro？

Astro 提供了出色的性能和开发者体验。

### 主要特性：
- ✅ **岛屿架构**：默认输出静态 HTML
- ✅ **框架无关**：支持 React、Vue、Svelte 等
- ✅ **内容驱动**：优秀的 Markdown/MDX 支持
- ✅ **极速构建**：基于 Vite，构建速度超快

### 代码示例
```javascript
// 在 Astro 中使用 React 组件
import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <button onClick={() => setCount(count + 1)}>
      点击次数: {count}
    </button>
  );
}
\```

### 图片展示
![Astro 标志](/images/astro-logo.png)

### 数学公式（需配置）
$$
f(x) = \int_{-\infty}^{\infty} \hat f(\xi) e^{2\pi i \xi x} d\xi
$$