// Site configuration
export const SITE = {
  title: '老潘在路上',
  description: '探索技术与生活的交汇点',
  author: 'Ficor',
  language: 'zh-CN',
  keywords: ['博客', '技术', '生活'],
  foundedDate: '2008-10-08',
};

// Social links
export const SOCIAL = {
  github: 'https://github.com/ficorcc',
  twitter: 'https://x.com/ficorcc',
  email: 'mailto:ficor@qq.com',
  rss: true,
  weibo: '',
  zhihu: '',
  bilibili: '',
  mastodon: 'https://mastodon.social/@ficor',
};

// Footer links (customizable)
export const FOOTER_LINKS = [
  { name: 'BLOGS·CN', url: 'https://blogscn.fun/random.html', icon: 'blogscn', showIcon: true, ariaLabel: '本站已加入BLOGS·CN' },
  { name: 'BlogsClub', url: 'https://blogs.quest', icon: 'blogsclub', showIcon: true, ariaLabel: '空间穿梭' },
  { name: '虫洞', url: 'https://www.foreverblog.cn/go.html', icon: 'foreverblog', showIcon: true, ariaLabel: '虫洞' },
  { name: '开往', url: 'https://www.travellings.cn/go.html', icon: 'travellings', showIcon: true, ariaLabel: '开往' },
];

// Ten-year commitment
export const TEN_YEAR_PACT = {
  enabled: true,
  startDate: '2025-08-20',
  endDate: '2035-08-20',
};

// Navigation menu
export const MENU = [
  { name: '首页', url: '/' },
  { name: '动态', url: '/activity/' },
  { name: '归档', url: '/archive/' },
  { name: '友链', url: '/friends/', hasDropdown: true },
  { name: '关于', url: '/about/' },
];

// Friends dropdown links
export const FRIENDS_LINKS = [
  { name: '朋友圈', url: '/moments/' },
];

// More dropdown links
export const MORE_LINKS = [
  { name: 'BLOGS·CN', url: 'https://blogscn.fun/random.html' },
  { name: 'BlogsClub', url: 'https://blogs.quest' },
  { name: '虫洞', url: 'https://www.foreverblog.cn/go.html' },
  { name: '开往', url: 'https://www.travellings.cn/go.html' },
];

// Posts per page
export const POSTS_PER_PAGE = 7;

// Comment system configuration
export type CommentSystem = 'artalk' | 'waline' | 'none';

export const COMMENT = {
  enabled: true,
  system: 'none' as CommentSystem,
  artalk: {
    server: '',
    site: '',
  },
  waline: {
    serverURL: '',
    pageview: true,
    comment: true,
  },
};
