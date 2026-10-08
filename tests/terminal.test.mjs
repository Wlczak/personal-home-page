import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';

// Load the actual TypeScript implementation using the project's compiler.
const sourceURL = new URL('../src/lib/terminal.ts', import.meta.url);
const source = await readFile(sourceURL, 'utf8');
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
});
const javascript = outputText.replace(/from (['"])(\.\.\/content\/[^'"]+\.json)\1/g,
  (_, _quote, path) => `from '${new URL(path, sourceURL).href}' with { type: 'json' }`);
const { createTerminal } = await import('data:text/javascript;base64,' + Buffer.from(javascript).toString('base64'));

test('create, copy, move, edit, and remove virtual files and directories', () => {
  const shell = createTerminal();
  assert.equal(shell.execute('mkdir -p work/nested').output, '');
  assert.equal(shell.execute('mkdir work').output, 'mkdir: work: File exists');
  assert.equal(shell.execute('touch work/nested/a.txt').output, '');
  shell.saveFile('work/nested/a.txt', 'hello\n');
  shell.execute('touch work/nested/a.txt');
  assert.equal(shell.execute('cat work/nested/a.txt').output, 'hello\n');
  assert.equal(shell.execute('cp -r work backup').output, '');
  assert.equal(shell.execute('cat backup/nested/a.txt').output, 'hello\n');
  shell.saveFile('work/nested/a.txt', 'changed');
  assert.equal(shell.execute('cat backup/nested/a.txt').output, 'hello\n');
  assert.equal(shell.execute('mv backup/nested/a.txt backup/renamed.txt').output, '');
  assert.match(shell.execute('cat backup/nested/a.txt').output, /No such file/);
  assert.equal(shell.execute('rmdir backup/nested').output, '');
  assert.match(shell.execute('rmdir backup').output, /not empty/);
  assert.match(shell.execute('rm backup').output, /Is a directory/);
  assert.equal(shell.execute('rm -r backup').output, '');
  assert.equal(shell.execute('rm -f absent').output, '');
  assert.match(shell.execute('ls backup').output, /No such file/);
  assert.match(shell.execute('cp -r work work/nested').output, /into itself/);
  assert.match(shell.execute('mv work work/nested').output, /into itself/);
  assert.match(shell.execute('rm -rf .').output, /in use/);
  assert.match(shell.execute('rm -rf /').output, /in use/);
  assert.equal(shell.execute('pwd').output, '/home/adam');
});

test('mutation errors preserve existing files and directory structure', () => {
  const shell = createTerminal();
  shell.execute('mkdir sample');
  shell.saveFile('sample/a', 'one');
  shell.saveFile('sample/b', 'two');
  assert.match(shell.execute('cp sample/a missing/b').output, /No such file/);
  assert.match(shell.execute('cp sample/a sample/a').output, /same/);
  assert.match(shell.execute('mv sample/a sample/a').output, /same/);
  assert.match(shell.execute('cp sample sample-copy').output, /use -r/);
  assert.match(shell.execute('cp sample/a new/').output, /No such directory/);
  assert.match(shell.execute('mkdir -p sample/a/child').output, /Not a directory/);
  assert.match(shell.execute('touch sample/a/child').output, /Not a directory/);
  assert.equal(shell.execute('cat sample/a').output, 'one');
  assert.equal(shell.execute('cat sample/b').output, 'two');
  shell.execute('mkdir target');
  assert.equal(shell.execute('cp sample/a target').output, '');
  assert.equal(shell.execute('cat target/a').output, 'one');
  shell.saveFile('quote"test.txt', 'double');
  shell.saveFile("quote'test.txt", 'single');
  for (const option of shell.complete('cat "quote')) assert.equal(shell.execute(option.value).output, option.label.includes('"') ? 'double' : 'single');
  for (const option of shell.complete("cat 'quote")) assert.equal(shell.execute(option.value).output, option.label.includes('"') ? 'double' : 'single');
  assert.match(shell.execute('rm sample/a; rm sample/b').output, /not supported/);
  assert.equal(shell.execute('cat sample/a').output, 'one');
});

test('text utilities handle line endings, counts, UTF-8, and regex errors', () => {
  const shell = createTerminal();
  shell.saveFile('text.txt', 'Alpha\nbeta\nbeta\nžluť\n');
  shell.saveFile('numbers.txt', '10\n2\n1\n');
  assert.equal(shell.execute('head -n 2 text.txt').output, 'Alpha\nbeta');
  assert.equal(shell.execute('tail -n 2 text.txt').output, 'beta\nžluť');
  assert.equal(shell.execute('tail -n 0 text.txt').output, '');
  assert.equal(shell.execute('grep -in ALPHA text.txt').output, '1:Alpha');
  assert.equal(shell.execute('grep -v beta text.txt').output, 'Alpha\nžluť');
  assert.equal(shell.execute('grep -F "[" text.txt').output, '');
  assert.match(shell.execute('grep "[" text.txt').output, /grep:/);
  assert.equal(shell.execute('wc -lw text.txt').output, '4 4 text.txt');
  assert.equal(shell.execute('wc -c text.txt').output, `${Buffer.byteLength('Alpha\nbeta\nbeta\nžluť\n')} text.txt`);
  assert.equal(shell.execute('sort -n numbers.txt').output, '1\n2\n10');
  assert.equal(shell.execute('sort -rn numbers.txt').output, '10\n2\n1');
  assert.equal(shell.execute('uniq -c text.txt').output, '1 Alpha\n2 beta\n1 žluť');
  assert.equal(shell.execute('diff text.txt text.txt').output, '');
  assert.match(shell.execute('diff text.txt numbers.txt').output, /--- text.txt\n\+\+\+ numbers.txt/);
  shell.saveFile('empty', '');
  assert.equal(shell.execute('head empty').output, '');
  assert.equal(shell.execute('wc empty').output, '0 0 0 empty');
});

test('find, tree, metadata, environment, and sequence utilities', () => {
  const shell = createTerminal();
  shell.execute('mkdir -p notes/nested');
  shell.saveFile('notes/first.txt', 'abc');
  shell.saveFile('notes/nested/second.txt', 'dé');
  shell.saveFile('notes/.hidden', 'secret');
  assert.equal(shell.execute('find notes -name "*.txt" -type f').output, 'notes/first.txt\nnotes/nested/second.txt');
  assert.equal(shell.execute('find notes -type d').output, 'notes\nnotes/nested');
  assert.equal(shell.execute('find / -name first.txt').output, '/home/adam/notes/first.txt');
  assert.match(shell.execute('tree notes').output, /└── nested\/\n    └── second.txt/);
  assert.doesNotMatch(shell.execute('tree notes').output, /hidden/);
  assert.match(shell.execute('tree -a notes').output, /\.hidden/);
  assert.match(shell.execute('du notes').output, /12\t\/home\/adam\/notes$/);
  assert.match(shell.execute('stat notes/first.txt').output, /Size: 3 bytes/);
  assert.equal(shell.execute('file notes/first.txt').output, 'notes/first.txt: UTF-8 text');
  assert.equal(shell.execute('basename /home/adam/').output, 'adam');
  assert.equal(shell.execute('dirname interests.txt').output, '.');
  shell.execute('cd notes');
  assert.equal(shell.execute('printenv PWD').output, '/home/adam/notes');
  assert.match(shell.execute('env').output, /HOME=\/home\/adam/);
  assert.equal(shell.execute('seq 3').output, '1\n2\n3');
  assert.equal(shell.execute('seq 3 -1 1').output, '3\n2\n1');
  assert.match(shell.execute('seq 1 0 3').output, /zero/);
  assert.match(shell.execute('seq 10001').output, /10000/);
});

test('Nano and completion see mutations, while sessions remain isolated', () => {
  const shell = createTerminal();
  const file = shell.execute('nano new.txt').edit;
  assert.equal(file.content, '');
  shell.saveFile(file.path, 'saved');
  assert.equal(shell.complete('cat new')[0].value, 'cat new.txt');
  assert.equal(shell.complete('nano new')[0].value, 'nano new.txt');
  assert.equal(shell.complete('man mk')[0].value, 'man mkdir');
  shell.execute('mv new.txt renamed.txt');
  assert.deepEqual(shell.complete('cat new'), []);
  assert.equal(shell.complete('cp ren')[0].value, 'cp renamed.txt');
  shell.execute('rm renamed.txt');
  assert.deepEqual(shell.complete('cat ren'), []);
  assert.match(createTerminal().execute('cat new.txt').output, /No such file/);
});

test('custom commands participate in help, history, and completion', () => {
  const shell = createTerminal('en', {
    secret: { description: 'A hidden greeting', run: (args, context) => ({ output: `${args.join(' ')} from ${context.cwd}` }) },
  });
  assert.equal(shell.complete('sec')[0].value, 'secret');
  assert.equal(shell.execute('secret hello').output, 'hello from /home/adam');
  assert.match(shell.execute('help').output, /secret  A hidden greeting/);
  assert.equal(shell.execute('man secret').output, 'secret: A hidden greeting');
  assert.equal(shell.execute('which secret').output, '/bin/secret');
  assert.equal(shell.suggest('secret h'), 'secret hello');
});

test('virtual mounts preserve disk files, discard tmpfs files, and report state', () => {
  const shell = createTerminal();
  assert.match(shell.execute('mount').output, /\/dev\/vda1 on \/ type virtualfs/);
  assert.match(shell.execute('mount /dev/missing /mnt').output, /No such file/);
  assert.equal(shell.execute('mount /dev/vdb1 /mnt').output, '');
  assert.match(shell.execute('cat /mnt/README.txt').output, /virtual data disk/);
  assert.match(shell.execute('mount').output, /\/dev\/vdb1 on \/mnt type ext4/);
  assert.match(shell.execute('lsblk').output, /vdb1.*\/mnt/);
  assert.match(shell.execute('df -h /mnt').output, /\/dev\/vdb1.*16.0M.*\/mnt/);
  assert.match(shell.execute('cat /proc/mounts').output, /\/dev\/vdb1 \/mnt ext4/);
  assert.equal(shell.complete('umount /m')[0].value, 'umount /mnt');
  shell.saveFile('/mnt/saved.txt', 'saved on virtual disk');
  assert.match(shell.execute('rm -rf /mnt').output, /busy/);
  assert.match(shell.execute('mv /mnt /media').output, /busy/);
  shell.execute('cd /mnt');
  assert.match(shell.execute('umount /mnt').output, /busy/);
  shell.execute('cd ~');
  assert.equal(shell.execute('umount /dev/vdb1').output, '');
  assert.equal(shell.execute('ls /mnt').output, '');
  assert.equal(shell.execute('mount -t ext4 /dev/vdb1 /media').output, '');
  assert.equal(shell.execute('cat /media/saved.txt').output, 'saved on virtual disk');
  assert.match(shell.execute('mount /dev/vdb1 /mnt').output, /Already mounted/);
  assert.equal(shell.execute('mount -t tmpfs scratch /mnt').output, '');
  shell.saveFile('/mnt/temporary.txt', 'temporary');
  assert.equal(shell.execute('umount /mnt').output, '');
  assert.equal(shell.execute('mount -t tmpfs scratch /mnt').output, '');
  assert.match(shell.execute('cat /mnt/temporary.txt').output, /No such file/);
  assert.match(shell.execute('umount /').output, /System mount/);
  assert.match(shell.execute('mount -t unsupported scratch /opt').output, /unsupported filesystem/);
  shell.saveFile('/opt/nonempty', 'x');
  assert.match(shell.execute('mount -t tmpfs scratch /opt').output, /must be empty/);
});

test('nested mounts and simulated process/service transitions stay consistent', () => {
  const shell = createTerminal();
  shell.execute('mount -t tmpfs scratch /mnt');
  shell.execute('mkdir /mnt/child');
  shell.execute('mount -t tmpfs child /mnt/child');
  assert.match(shell.execute('umount /mnt').output, /busy/);
  assert.match(shell.execute('rm -rf /mnt/child').output, /busy/);
  assert.equal(shell.execute('umount /mnt/child').output, '');
  assert.equal(shell.execute('umount /mnt').output, '');
  assert.match(shell.execute('ps aux').output, /3  adam  portfolio/);
  assert.match(shell.execute('systemctl status portfolio').output, /active \(running\)/);
  shell.execute('systemctl stop portfolio');
  assert.doesNotMatch(shell.execute('ps').output, /portfolio/);
  assert.match(shell.execute('systemctl status portfolio').output, /inactive \(dead\)/);
  shell.execute('systemctl restart portfolio');
  assert.match(shell.execute('ps').output, /portfolio/);
  assert.equal(shell.execute('kill -9 3').output, '');
  assert.match(shell.execute('systemctl status portfolio').output, /inactive \(dead\)/);
  assert.match(shell.execute('kill 1').output, /in use/);
  assert.match(shell.execute('kill 999').output, /No such process/);
  assert.match(shell.execute('systemctl start missing').output, /Unit not found/);
  assert.equal(shell.complete('systemctl st').length, 3);
  assert.equal(shell.complete('systemctl status po')[0].value, 'systemctl status portfolio.service');
  assert.match(shell.execute('free -h').output, /128.0M/);
  assert.match(shell.execute('top').output, /Snapshot \(simulated\)/);
  assert.match(shell.execute('uptime').output, /up \d+h/);
  assert.equal(shell.execute('tty').output, '/dev/pts/0');
});
