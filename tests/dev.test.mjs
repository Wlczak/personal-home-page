import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { setTimeout as delay } from 'node:timers/promises';

test('combined dev server proxies Go and closes both ports', { timeout: 45000 }, async () => {
  const urls = ['http://127.0.0.1:4321/api/health','http://127.0.0.1:8080/api/health'];
  for (const url of urls) {
    const occupied = await fetch(url).then(()=>true,()=>false);
    assert.equal(occupied,false,`Stop the existing server on ${url} before testing`);
  }
  const child = spawn(process.execPath,['scripts/dev.mjs'], { env: {...process.env, ASTRO_TELEMETRY_DISABLED:'1'} });
  let output = '';
  child.stdout.on('data',chunk=>output+=chunk);
  child.stderr.on('data',chunk=>output+=chunk);
  const exited = once(child,'exit');
  try {
    let ready = false;
    for (let attempt=0;attempt<300;attempt++) {
      if (child.exitCode!==null) throw new Error(output);
      ready = await Promise.all(urls.map(url=>fetch(url).then(response=>response.ok,()=>false))).then(results=>results.every(Boolean));
      if (ready) break;
      await delay(100);
    }
    assert.ok(ready,`Servers did not become ready: ${output}`);
    for (const url of urls) assert.deepEqual(await (await fetch(url)).json(),{status:'ok'});
    const page = await fetch('http://127.0.0.1:4321/cs/projects/lylink/');
    assert.equal(page.status,200);
    assert.match(await page.text(),/<html lang="cs"/);
  } finally {
    child.kill('SIGTERM');
    const deadline = setTimeout(()=>child.kill('SIGKILL'),5000);
    const [code] = await exited;
    clearTimeout(deadline);
    assert.equal(code,0,output);
  }
  for (const url of urls) assert.equal(await fetch(url).then(()=>true,()=>false),false,`Server remained on ${url}`);
});
