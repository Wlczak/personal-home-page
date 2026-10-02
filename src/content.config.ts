import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { file } from 'astro/loaders';

const translated = z.object({ en: z.string().min(1), cs: z.string().min(1), ja: z.string().min(1) });
const projects = defineCollection({
  loader: file('src/content/projects.json'),
  schema: z.object({
    name: z.string(), order: z.number(), category: z.enum(['web', 'games', 'hardware']),
    featured: z.boolean().default(false), technologies: z.array(z.string()),
    description: translated, purpose: translated, approach: translated,
    demo: z.url().optional(), source: z.url().optional(),
    action: z.enum(['visit', 'download', 'play']).default('visit'),
    unavailable: z.boolean().default(false),
  }),
});
const profiles = defineCollection({
  loader: file('src/content/profiles.json'),
  schema: z.object({ intro: z.string(), bio: z.string(), learning: z.string() }),
});
export const collections = { projects, profiles };
