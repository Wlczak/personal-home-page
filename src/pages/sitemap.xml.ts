import type { APIRoute } from 'astro';
import { allProjects } from '../lib/projects';
import { locales, url } from '../lib/i18n';
export const GET: APIRoute = async () => {
  const pages = ['', 'about', 'projects', ...(await allProjects()).map(p=>`projects/${p.id}`)];
  const body = pages.flatMap(page=>locales.map(locale=>`<url><loc>https://wlczak.net${url(locale,page)}</loc>${locales.map(lang=>`<xhtml:link rel="alternate" hreflang="${lang}" href="https://wlczak.net${url(lang,page)}"/>`).join('')}<xhtml:link rel="alternate" hreflang="x-default" href="https://wlczak.net${url('en',page)}"/></url>`)).join('');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${body}</urlset>`, {headers:{'Content-Type':'application/xml'}});
};
