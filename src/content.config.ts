import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'zod';

function slugifyPath(entry: string) {
  return entry
    .replace(/\.(md|mdx)$/i, '')
    .split('/')
    .map((part) => part.trim().toLowerCase().replace(/\s+/g, '-'))
    .join('/');
}

const posts = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/content/posts',
    generateId: ({ entry }) => slugifyPath(entry),
  }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    categories: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    image: z.string().optional(),
    commentCount: z.number().optional().default(0),
  }),
});

const pages = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/content/pages',
    generateId: ({ entry }) => slugifyPath(entry),
  }),
  schema: z.object({
    title: z.string(),
  }),
});

export const collections = { posts, pages };
