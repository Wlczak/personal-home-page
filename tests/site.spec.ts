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
  expect((await sitemap.text()).match(/<loc>/g)?.length).toBe((projects.length + 3) * 3);
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
  await expect(page.locator('.project-card')).toHaveCount(projects.length);
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

test('content and navigation work without JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({javaScriptEnabled:false,baseURL});
  const page = await context.newPage();
  await page.goto('/projects/');
  await expect(page.locator('.project-card')).toHaveCount(projects.length);
  await expect(page.locator('.directory-controls')).toBeHidden();
  await page.getByRole('link',{name:'LyLink',exact:true}).click();
  await expect(page.locator('h1')).toHaveText('LyLink');
  await context.close();
});

test('computer opens a fullscreen CLI, accepts typing and restores the page on exit', async ({ page }) => {
  for (const mobile of [false, true]) {
    await page.setViewportSize(mobile ? {width:390,height:844} : {width:1280,height:900});
    await page.emulateMedia({reducedMotion:mobile ? 'reduce' : 'no-preference'});
    await page.goto('/');
    const activate = page.getByRole('button',{name:'Click to type into the computer'});
    await expect(activate).toBeVisible();
    const originalHardware = await page.locator('[data-computer] .keyboard').boundingBox();
    const originalScrollY = await page.evaluate(()=>window.scrollY);
    if (mobile) {
      await activate.focus();
      await page.keyboard.press('Enter');
    } else {
      await activate.click();
    }
    const dialog = page.getByRole('dialog',{name:'Computer terminal'});
    await expect(dialog).toBeVisible();
    const computer = dialog.locator('[data-computer]');
    expect(await computer.evaluate(element => element.getAnimations().length > 0)).toBe(!mobile);
    if (!mobile) {
      const geometry = await page.evaluate(() => {
        const dialog = document.querySelector<HTMLDialogElement>('.computer-dialog')!;
        const animations = dialog.getAnimations({subtree:true});
        animations.forEach(animation => { animation.pause(); animation.currentTime = 0; });
        const placeholder = document.querySelector('.desktop-art > .computer')!;
        const computer = dialog.querySelector('[data-computer]')!;
        const differences = ['.screen'].map(selector => {
          const original = placeholder.querySelector(selector)!.getBoundingClientRect();
          const animated = computer.querySelector(selector)!.getBoundingClientRect();
          return Math.max(...(['x','y','width','height'] as const).map(key => Math.abs(original[key] - animated[key])));
        });
        animations.forEach(animation => animation.play());
        return differences;
      });
      geometry.forEach(difference => expect(difference).toBeLessThan(3));
    }
    const bounds = await dialog.boundingBox();
    expect(bounds?.x).toBe(0);
    expect(bounds?.y).toBe(0);
    expect(bounds?.width).toBe(mobile ? 390 : 1280);
    expect(bounds?.height).toBe(mobile ? 844 : 900);
    await expect(dialog.locator('.terminal-history')).toContainText('whoami');
    await expect(dialog.locator('.terminal-history')).toContainText('cat interests.txt');
    await expect(dialog.locator('.terminal-entry .terminal-prompt')).toHaveText('$');
    const editor = page.getByRole('textbox',{name:'Terminal input'});
    await expect(editor).toBeFocused();
    await expect.poll(()=>computer.evaluate(element=>getComputedStyle(element).transform)).toBe('matrix(1, 0, 0, 1, 0, 0)');
    await expect(dialog.locator('.keyboard')).toBeHidden();
    await expect(dialog.locator('.monitor-neck')).toBeHidden();
    await expect(dialog.locator('.monitor-base')).toBeHidden();
    const backgroundComputer = page.locator('.desktop-art > .computer');
    await expect(backgroundComputer).toHaveAttribute('inert','');
    const backgroundHardware = await backgroundComputer.locator('.keyboard').boundingBox();
    expect(backgroundHardware?.width).toBe(originalHardware?.width);
    expect(backgroundHardware?.height).toBe(originalHardware?.height);
    expect(backgroundHardware?.x).toBe(originalHardware?.x);
    expect(backgroundHardware!.y + await page.evaluate(()=>window.scrollY)).toBeCloseTo(originalHardware!.y + originalScrollY, 1);
    expect(await backgroundComputer.evaluate(element=>getComputedStyle(element).visibility)).toBe('visible');
    await editor.pressSequentially('hello');
    await editor.press('Enter');
    await expect(editor).toHaveValue('');
    await expect(dialog.locator('.terminal-line')).toHaveText('$hello');
    await editor.press('Backspace');
    await expect(dialog.locator('.terminal-line')).toHaveText('$hello');
    await editor.pressSequentially('echo world');
    await expect(editor).toHaveValue('echo world');
    await editor.press('ArrowUp');
    await expect(editor).toHaveValue('hello');
    await editor.press('ArrowDown');
    await expect(editor).toHaveValue('echo world');
    await editor.click();
    await expect(editor).toHaveValue('echo world');
    await editor.press('Shift+Enter');
    await expect(editor).toHaveValue('');
    await expect(dialog.locator('.terminal-line')).toHaveText(['$hello', '$echo world']);
    // Mobile submission and pasted line breaks must not create editable history.
    await editor.fill('draft');
    await editor.evaluate(element=>element.dispatchEvent(new InputEvent('beforeinput',{bubbles:true,cancelable:true,inputType:'insertLineBreak'})));
    await expect(editor).toHaveValue('');
    await expect(dialog.locator('.terminal-line')).toHaveText(['$hello', '$echo world', '$draft']);
    await editor.fill('one\ntwo');
    await expect(editor).toHaveValue('one two');
    await expect(dialog.locator('.terminal-line textarea, .terminal-line input, .terminal-line [contenteditable]')).toHaveCount(0);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
    const scan = await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
    expect(scan.violations).toEqual([]);
    if (mobile) await dialog.getByRole('button',{name:'Close',exact:true}).click();
    else await editor.press('Escape');
    await expect(dialog).not.toBeVisible();
    await expect(activate).toBeFocused();
    expect(await page.evaluate(()=>document.documentElement.style.overflow)).not.toBe('hidden');
    await activate.click();
    await expect(editor).toHaveValue('one two');
    await expect(dialog.locator('.terminal-line')).toHaveText(['$hello', '$echo world', '$draft']);
    await editor.press('Escape');
    await expect(dialog).not.toBeVisible();
    await expect(page.locator('.desktop-art > .computer')).toHaveCount(1);
  }
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
