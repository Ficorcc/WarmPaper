import { defineCollection } from 'astro:content';

export const collections = {
  blog: defineCollection({ type: 'content' }),
  activity: defineCollection({ type: 'content' }),
  about: defineCollection({ type: 'content' }),
};
