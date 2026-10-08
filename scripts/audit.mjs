import { chromium } from '@playwright/test';
import lighthouse from 'lighthouse';
import { mkdirSync, writeFileSync } from 'node:fs';

// Start the production Go server first: make run (in another terminal).
const base = process.env.AUDIT_URL || 'http://127.0.0.1:8080';
const browser = await chromium.launch({ args: ['--remote-debugging-port=9222'] });
mkdirSync('reports', { recursive: true });
try {
  for (const [name, route] of [['home','/'],['projects','/projects/'],['detail','/projects/lylink/']]) {
    const result = await lighthouse(`${base}${route}`, {
      port: 9222, output: 'json', logLevel: 'error',
      onlyCategories: ['performance','accessibility','best-practices','seo'],
    });
    if (!result) throw new Error('Lighthouse did not produce a report');
    writeFileSync(`reports/${name}.json`, result.report);
    const scores = Object.fromEntries(Object.entries(result.lhr.categories).map(([key,value])=>[key,Math.round((value.score ?? 0)*100)]));
    console.log(name, scores);
    if (Object.values(scores).some(score=>score<90)) process.exitCode=1;
  }
} finally { await browser.close(); }
