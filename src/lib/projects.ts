import { getCollection } from 'astro:content';
import { url, type Locale } from './i18n';

export async function allProjects() {
  return (await getCollection('projects')).sort((a, b) => a.data.order - b.data.order);
}
export async function projectCards(locale: Locale) {
  return (await allProjects()).map(({ id, data }) => ({
    id, name: data.name, description: data.description[locale], category: data.category,
    technologies: data.technologies, featured: data.featured,
    href: url(locale, `projects/${id}`), unavailable: data.unavailable,
  }));
}
export type ProjectCardData = Awaited<ReturnType<typeof projectCards>>[number];
