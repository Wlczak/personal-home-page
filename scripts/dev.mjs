import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

mkdirSync('dist', { recursive: true });
const temporary = mkdtempSync(join(tmpdir(), 'portfolio-dev-'));
const build = spawn('go', ['build', '-o', join(temporary, 'server'), '.'], { stdio: 'inherit' });
let children = [build];
let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) child.kill('SIGTERM');
  Promise.all(children.map(child => !child.pid || child.exitCode !== null || child.signalCode !== null
    ? Promise.resolve() : new Promise(resolve => child.once('close', resolve))))
    .then(() => { rmSync(temporary, { recursive: true, force: true }); process.exit(code); });
}
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => stop());
build.on('error', error => { console.error(error); stop(1); });
build.on('exit', code => {
  if (stopping) return;
  if (code !== 0) return stop(code ?? 1);
  children = [
    spawn(join(temporary, 'server'), [], { stdio: 'inherit', env: { ...process.env, PORT: '8080' } }),
    // Explicit foreground execution also works in agent-run environments.
    spawn(process.execPath, ['node_modules/astro/bin/astro.mjs', 'dev', '--ignore-lock'], { stdio: 'inherit' }),
  ];
  for (const child of children) {
    child.on('error', error => { console.error(error); stop(1); });
    child.on('exit', code => { if (!stopping) stop(code ?? 1); });
  }
});
