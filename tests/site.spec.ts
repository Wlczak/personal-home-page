import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import projects from '../src/content/projects.json' with { type: 'json' };

test('localized pages have stable SEO and working language links', async ({ page, request }) => {
  for (const [locale, prefix] of [['en',''],['cs','/cs'],['ja','/ja']]) {
    for (const route of ['/', '/about/', '/projects/', ...projects.map(project=>`/projects/${project.id}/`)]) {
      await page.goto(`${prefix}${route}`);
      await expect(page.locator('html')).toHaveAttribute('lang',locale);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href',`https://wlczak.net${prefix}${route}`);
      await expect(page.locator('link[hreflang]')).toHaveCount(4);
      expect(await page.locator('meta[name=description]').getAttribute('content')).toBeTruthy();
    }
  }
  await page.goto('/cs/projects/lylink/');
  await page.getByRole('link',{name:'日本語',exact:true}).click();
  await expect(page).toHaveURL(/\/ja\/projects\/lylink\/$/);
  const sitemap = await request.get('/sitemap.xml');
  expect((await sitemap.text()).match(/<loc>/g)?.length).toBe(36);
  for (const prefix of ['', '/cs','/ja']) {
    const response = await page.goto(`${prefix}/missing-page`);
    expect(response?.status()).toBe(404);
    await expect(page.locator('meta[name=robots]')).toHaveAttribute('content','noindex, follow');
  }
  expect((await request.get('/missing.js')).status()).toBe(404);
  expect(await (await request.get('/api/health')).json()).toEqual({status:'ok'});
});

test('directory filters, searches and resets', async ({ page }) => {
  await page.goto('/projects/');
  await expect(page.locator('.directory-controls')).toBeVisible();
  await expect(page.locator('.project-card')).toHaveCount(9);
  await page.getByRole('button',{name:'Hardware',exact:true}).click();
  await expect(page.locator('.project-card')).toHaveCount(1);
  await expect(page.locator('.project-card h3')).toHaveText('Menu ↗');
  await page.getByRole('searchbox').fill('nothing matches');
  await expect(page.locator('.project-card')).toHaveCount(0);
  await page.getByRole('button',{name:'Reset filters'}).click();
  await page.getByRole('searchbox').fill('WebSockets');
  await expect(page.locator('.project-card')).toHaveCount(3);
});

test('command palette supports keyboard, focus restoration and theme persistence', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.command-trigger')).toBeVisible();
  await page.locator('.command-trigger').focus();
  await page.keyboard.press('Control+k');
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('dialog').getByRole('searchbox')).toBeFocused();
  await page.getByRole('dialog').getByRole('searchbox').fill('LyLink');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.locator('.command-trigger')).toBeFocused();
  await page.getByRole('button',{name:'Toggle color theme'}).click();
  const theme = await page.locator('html').getAttribute('data-theme');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme',theme!);
  await page.locator('.command-trigger').click();
  const scan = await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  expect(scan.violations).toEqual([]);
});

test('content and navigation work without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({javaScriptEnabled:false});
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:8080/projects/');
  await expect(page.locator('.project-card')).toHaveCount(9);
  await expect(page.locator('.directory-controls')).toBeHidden();
  await page.getByRole('link',{name:'LyLink',exact:true}).click();
  await expect(page.locator('h1')).toHaveText('LyLink');
  await context.close();
});

test('mobile, dark theme and reduced motion remain accessible', async ({ page }) => {
  await page.setViewportSize({width:390,height:844});
  await page.emulateMedia({reducedMotion:'reduce'});
  for (const colorScheme of ['light','dark'] as const) {
    await page.emulateMedia({colorScheme});
    for (const route of ['/','/about/','/projects/','/projects/menu/','/ja/']) {
      await page.goto(route);
      await expect(page.locator('.command-trigger')).toBeVisible();
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
      const scan = await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
      expect(scan.violations).toEqual([]);
    }
  }
});
