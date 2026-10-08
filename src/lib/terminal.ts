import profiles from '../content/profiles.json';
import projects from '../content/projects.json';
import type { Locale } from './i18n';

const home = '/home/adam';
type Node = { type: 'directory' } | { type: 'file'; content: string };
export interface CommandResult { output: string; clear?: boolean; edit?: { path: string; content: string } }
export interface Completion { label: string; value: string }
const commandHelp: Record<string, string> = {
  basename: 'basename path              Print the final path component',
  cat: 'cat [-n] file...            Read files',
  cd: 'cd [path]                  Change directory (~, .., and - supported)',
  clear: 'clear                      Clear the screen',
  cp: 'cp [-r] source destination  Copy a file or directory',
  date: 'date                       Print current date and time',
  df: 'df [-h] [path...]          Show virtual filesystem space',
  dmesg: 'dmesg                      Show simulated boot messages',
  diff: 'diff file1 file2           Compare two files',
  dirname: 'dirname path               Print the parent path',
  du: 'du [-a] [path]             Show virtual file sizes in bytes',
  echo: 'echo [-n] text             Print text',
  env: 'env                        Print session environment',
  file: 'file path...               Describe files',
  find: 'find [path] [-name pattern] [-type f|d]  Find files (* and ? supported)',
  free: 'free [-h]                  Show simulated memory usage',
  groups: 'groups                     Print user groups',
  grep: 'grep [-invF] pattern file...  Search lines (JavaScript regex, or -F literal)',
  head: 'head [-n count] file...    Print first lines (default: 10)',
  help: 'help                       List commands and shortcuts',
  history: 'history                    Show submitted commands',
  hostname: 'hostname                   Print hostname',
  hostnamectl: 'hostnamectl                Show VC Linux system identity',
  id: 'id                         Print simulated user identity',
  kill: 'kill [-9|-15] pid...       Stop simulated background processes',
  la: 'la [path...]               Alias for ls -la',
  ls: 'ls [-al] [path...]         List files',
  lsblk: 'lsblk                      List virtual block devices',
  lscpu: 'lscpu                      Describe the simulated CPU',
  man: 'man command                Show supported command usage',
  mkdir: 'mkdir [-p] directory...    Create directories',
  mount: 'mount [-t tmpfs|ext4] source directory  Mount a virtual disk or tmpfs (empty target)',
  mv: 'mv source destination      Move or rename a file or directory',
  nano: 'nano [file]                Edit a file (Ctrl+O save, Ctrl+X exit)',
  printenv: 'printenv [name...]         Print environment values',
  ps: 'ps [aux|-ef]               List simulated processes',
  pwd: 'pwd                        Print working directory',
  rm: 'rm [-rf] path...           Remove files (-r for directories)',
  rmdir: 'rmdir directory...         Remove empty directories',
  seq: 'seq [start [step]] end     Print a numeric sequence',
  sort: 'sort [-rn] file...         Sort lines (reverse/numeric)',
  stat: 'stat path...               Show file information',
  systemctl: 'systemctl [list-units|status|start|stop|restart] [service]  Manage virtual services',
  tail: 'tail [-n count] file...    Print last lines (default: 10)',
  touch: 'touch file...              Create empty files, preserving existing content',
  top: 'top                        Show a snapshot of simulated processes',
  tree: 'tree [-a] [path]           Show a directory tree',
  type: 'type command...            Describe shell commands',
  tty: 'tty                        Print virtual terminal name',
  umount: 'umount directory|device    Unmount a virtual filesystem',
  uname: 'uname [-a]                 Print simulated system information',
  uniq: 'uniq [-c] file             Remove adjacent duplicate lines',
  uptime: 'uptime                     Show time since this shell session started',
  wc: 'wc [-lwc] file...          Count newlines, words, and UTF-8 bytes',
  which: 'which command...           Locate virtual commands',
  whoami: 'whoami                     Print current user',
  who: 'who                        Show the current virtual login',
  w: 'w                          Show virtual login and uptime',
};
export interface TerminalCommand {
  description: string;
  run: (args: string[], context: { cwd: string; readFile: (path: string) => string; saveFile: (path: string, content: string) => void }) => CommandResult;
}

// A portfolio filesystem in memory: commands never access the host machine.
export function createTerminal(locale: Locale = 'en', extraCommands: Record<string, TerminalCommand> = {}) {
  const commands = Array.from(new Set([...Object.keys(commandHelp), ...Object.keys(extraCommands)])).sort();
  const profile = profiles.find(profile => profile.id === locale)!;
  const files = new Map<string, Node>([
    ['/', { type: 'directory' }],
    ['/home', { type: 'directory' }],
    [home, { type: 'directory' }],
    [`${home}/projects`, { type: 'directory' }],
    [`${home}/.profile`, { type: 'file', content: 'USER=adam\nHOME=/home/adam' }],
    [`${home}/README.txt`, { type: 'file', content: 'Welcome to Adam’s portfolio terminal.\nTry ls, cat about.txt, or cd projects.\nType help for available commands. Edit files with nano; saves last until the page reloads.' }],
    [`${home}/about.txt`, { type: 'file', content: `${profile.bio}\n\n${profile.learning}` }],
    [`${home}/interests.txt`, { type: 'file', content: 'backend / games / hardware' }],
  ]);
  for (const directory of [
    '/bin', '/boot', '/dev', '/etc', '/etc/fish', '/lib', '/lib64',
    '/media', '/mnt', '/opt', '/proc', '/root', '/run', '/sbin', '/srv',
    '/sys', '/tmp', '/usr', '/usr/bin', '/usr/sbin', '/usr/lib',
    '/usr/local', '/usr/local/bin', '/usr/local/share', '/usr/share',
    '/usr/share/doc', '/var', '/var/cache', '/var/lib', '/var/log', '/var/tmp',
  ]) files.set(directory, { type: 'directory' });
  const systemFiles: Record<string, string> = {
    '/etc/os-release': 'NAME="VC Linux"\nPRETTY_NAME="VC Linux 6.0 (Portfolio Edition)"\nID=vc-linux\nVERSION_ID="6.0"\n',
    '/etc/hostname': 'localhost\n',
    '/etc/hosts': '127.0.0.1 localhost\n::1 localhost\n',
    '/etc/passwd': 'root:x:0:0:root:/root:/bin/fish\nadam:x:1000:1000:Adam Vlček:/home/adam:/bin/fish\n',
    '/etc/group': 'root:x:0:\nadam:x:1000:adam\n',
    '/etc/motd': 'Welcome to VC Linux.\nA small world inside a portfolio. Explore with ls, cd, cat, and tree.\n',
    '/etc/fish/config.fish': '# VC Linux portfolio shell\nset -gx USER adam\nset -gx HOME /home/adam\n',
    '/proc/version': 'VC Linux version 6.0.0 (portfolio browser simulation)\n',
    '/dev/vda1': 'VC Linux virtual root device\n',
    '/dev/vdb1': 'VC Linux virtual data device (mountable)\n',
    '/etc/fstab': '/dev/vda1 / virtualfs defaults 0 0\nproc /proc proc defaults 0 0\nsysfs /sys sysfs defaults 0 0\ndevtmpfs /dev devtmpfs defaults 0 0\ntmpfs /tmp tmpfs defaults 0 0\n',
    '/usr/share/doc/vc-linux.txt': 'VC Linux is an in-browser virtual filesystem and shell.\nChanges last until page reload. Type help to discover commands.\n',
    '/var/log/boot.log': '[OK] Virtual filesystem ready\n[OK] Portfolio shell ready\n',
  };
  for (const [path, content] of Object.entries(systemFiles)) files.set(path, { type: 'file', content });
  for (const command of commands) {
    files.set(`/bin/${command}`, { type: 'file', content: `# VC Linux virtual command: ${command}\n${Object.hasOwn(extraCommands, command) ? extraCommands[command].description : commandHelp[command]}\n` });
  }
  for (const project of projects) {
    files.set(`${home}/projects/${project.id}.txt`, { type: 'file', content: `${project.name}\n${project.description[locale]}\nTechnologies: ${project.technologies.join(', ')}\nSource: ${project.source}` });
  }
  let cwd = home;
  let previous = home;
  const history: string[] = [];
  const started = Date.now();
  const MiB = 1024 * 1024;
  type Mount = { source: string; target: string; type: string; capacity: number; system: boolean };
  const mounts: Mount[] = [
    { source: '/dev/vda1', target: '/', type: 'virtualfs', capacity: 64 * MiB, system: true },
    { source: 'proc', target: '/proc', type: 'proc', capacity: 0, system: true },
    { source: 'sysfs', target: '/sys', type: 'sysfs', capacity: 0, system: true },
    { source: 'devtmpfs', target: '/dev', type: 'devtmpfs', capacity: MiB, system: true },
    { source: 'tmpfs', target: '/tmp', type: 'tmpfs', capacity: 16 * MiB, system: true },
  ];
  const volumes = new Map<string, [string, Node][]>([
    ['/dev/vdb1', [['/README.txt', { type: 'file', content: 'VC Linux virtual data disk.\nFiles on this disk survive unmounting within this page session.\n' }]]],
  ]);
  const processes = new Map<number, string>([[1, 'init'], [2, 'fish'], [3, 'portfolio']]);
  const services = new Map<string, { pid: number; active: boolean }>([
    ['portfolio.service', { pid: 3, active: true }],
  ]);

  function resolve(path: string) {
    if (path === '~' || path.startsWith('~/')) path = home + path.slice(1);
    const parts: string[] = [];
    for (const part of (path.startsWith('/') ? path : `${cwd}/${path}`).split('/')) {
      if (part === '..') parts.pop();
      else if (part && part !== '.') parts.push(part);
    }
    return '/' + parts.join('/');
  }
  function lookup(path: string): Node {
    const absolute = resolve(path);
    // Validate parents as well, so a file cannot be traversed as a directory.
    const parts = absolute.split('/').filter(Boolean);
    for (let i = 1; i < parts.length; i++) {
      const parent = files.get('/' + parts.slice(0, i).join('/'));
      if (!parent) throw new Error(`${path}: No such file or directory`);
      if (parent.type !== 'directory') throw new Error(`${path}: Not a directory`);
    }
    const node = files.get(absolute);
    if (!node) throw new Error(`${path}: No such file or directory`);
    if (path.endsWith('/') && node.type !== 'directory') throw new Error(`${path}: Not a directory`);
    return node;
  }
  function tokenize(line: string) {
    const words: string[] = [];
    let word = '', quote = '', started = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '\\' && quote !== "'") {
        if (++i === line.length) throw new Error('unfinished escape');
        word += line[i]; started = true;
      } else if (quote) {
        if (char === quote) quote = '';
        else word += char;
      } else if (char === '"' || char === "'") {
        quote = char; started = true;
      } else if ('|><;&'.includes(char)) {
        throw new Error('pipes, redirects, and command chaining are not supported');
      } else if (/\s/.test(char)) {
        if (started) words.push(word);
        word = ''; started = false;
      } else {
        word += char; started = true;
      }
    }
    if (quote) throw new Error('unclosed quote');
    if (started) words.push(word);
    return words;
  }
  function readFile(path: string) {
    const node = lookup(path);
    if (node.type !== 'file') throw new Error(`${path}: Is a directory`);
    return node.content;
  }
  function children(path: string) {
    const prefix = path === '/' ? '/' : path + '/';
    return Array.from(files.keys()).filter(key => key !== path && key.startsWith(prefix));
  }
  function parseOptions(args: string[], allowed: string) {
    const flags = new Set<string>();
    const operands: string[] = [];
    let options = true;
    for (const arg of args) {
      if (options && arg === '--') { options = false; continue; }
      if (options && arg.startsWith('-') && arg !== '-') {
        for (const flag of arg.slice(1)) {
          if (!allowed.includes(flag)) throw new Error(`unsupported option: ${arg}`);
          flags.add(flag);
        }
      } else operands.push(arg);
    }
    return { flags, operands };
  }
  function requireArgs(args: string[], min: number, max = Infinity) {
    if (args.length < min || args.length > max) throw new Error('incorrect arguments; try man for command usage');
  }
  function writableParent(path: string) {
    const parent = path.slice(0, path.lastIndexOf('/')) || '/';
    if (lookup(parent).type !== 'directory') throw new Error(`${parent}: Not a directory`);
  }
  function removable(path: string) {
    if (path === '/' || path === cwd || cwd.startsWith(path + '/')) throw new Error(`${path}: Directory is in use`);
    if (mounts.some(mount => mount.target === path || mount.target.startsWith(path + '/'))) throw new Error(`${path}: Device or resource busy`);
  }
  function lines(content: string) {
    if (!content) return [];
    const result = content.split('\n');
    if (result.at(-1) === '') result.pop();
    return result;
  }
  const byteSize = (content: string) => new TextEncoder().encode(content).length;
  function sizeOf(path: string): number {
    const node = files.get(path)!;
    if (node.type === 'file') return byteSize(node.content);
    return children(path).reduce((total, child) => {
      const value = files.get(child)!;
      return total + (value.type === 'file' ? byteSize(value.content) : 0);
    }, 0);
  }
  const environment = () => ({ USER: 'adam', HOME: home, PWD: cwd, SHELL: '/bin/fish', LANG: locale, TERM: 'portfolio' });
  function mountFor(path: string) {
    return mounts.filter(mount => mount.target === '/' || path === mount.target || path.startsWith(mount.target + '/'))
      .sort((a, b) => b.target.length - a.target.length)[0];
  }
  function mountUsage(mount: Mount) {
    return Array.from(files.entries()).reduce((used, [path, node]) => used + (node.type === 'file' && mountFor(path) === mount ? byteSize(node.content) : 0), 0);
  }
  function formatBytes(bytes: number, human: boolean) {
    if (!human) return String(bytes);
    if (bytes >= MiB) return `${(bytes / MiB).toFixed(1)}M`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)}K`;
    return `${bytes}B`;
  }
  function uptime() {
    const seconds = Math.floor((Date.now() - started) / 1000);
    return `up ${Math.floor(seconds / 3600)}h ${Math.floor(seconds % 3600 / 60)}m ${seconds % 60}s, 1 user (simulated)`;
  }
  function processList() {
    return 'PID  USER  COMMAND\n' + Array.from(processes, ([pid, name]) => `${pid}  ${pid === 1 ? 'root' : 'adam'}  ${name}`).join('\n');
  }
  function syncMounts() {
    files.set('/proc/mounts', { type: 'file', content: mounts.map(mount => `${mount.source} ${mount.target} ${mount.type} rw 0 0`).join('\n') + '\n' });
  }
  syncMounts();
  function execute(line: string): CommandResult {
    if (!line.trim()) return { output: '' };
    history.push(line);
    let command = 'shell';
    try {
      const words = tokenize(line);
      command = words.shift()!;
      const args = words;
      const noArgs = () => { if (args.length) throw new Error('too many arguments'); };
      if (Object.hasOwn(extraCommands, command)) return extraCommands[command].run(args, { cwd, readFile, saveFile });
      switch (command) {
        case 'mount': {
          if (!args.length) return { output: mounts.map(mount => `${mount.source} on ${mount.target} type ${mount.type} (rw,simulated)`).join('\n') };
          const operands = [...args];
          let type = '';
          if (operands[0] === '-t') { operands.shift(); type = operands.shift() ?? ''; }
          requireArgs(operands, 2, 2);
          if (operands.some(arg => arg.startsWith('-'))) throw new Error('unsupported mount option');
          const source = operands[0], target = resolve(operands[1]);
          if (lookup(target).type !== 'directory') throw new Error(`${target}: Not a directory`);
          if (mounts.some(mount => mount.target === target)) throw new Error(`${target}: Already mounted`);
          if (children(target).length) throw new Error(`${target}: Mount point must be empty`);
          type ||= source === 'tmpfs' ? 'tmpfs' : 'ext4';
          if (!['tmpfs', 'ext4'].includes(type)) throw new Error(`unsupported filesystem type: ${type}`);
          let entries: [string, Node][] = [];
          if (type === 'ext4') {
            lookup(source);
            const volume = volumes.get(resolve(source));
            if (!volume) throw new Error(`${source}: Not a mountable virtual device`);
            if (mounts.some(mount => mount.source === resolve(source))) throw new Error(`${source}: Already mounted`);
            entries = volume;
          }
          for (const [relative, node] of entries) files.set(target + relative, { ...node });
          mounts.push({ source: type === 'ext4' ? resolve(source) : source, target, type, capacity: 16 * MiB, system: false });
          syncMounts();
          return { output: '' };
        }
        case 'umount': {
          requireArgs(args, 1, 1);
          const path = resolve(args[0]);
          const mount = mounts.find(mount => mount.target === path || mount.source === path);
          if (!mount) throw new Error(`${args[0]}: Not mounted`);
          if (mount.system) throw new Error(`${args[0]}: System mount is in use`);
          if (cwd === mount.target || cwd.startsWith(mount.target + '/') || mounts.some(other => other !== mount && other.target.startsWith(mount.target + '/'))) throw new Error(`${args[0]}: Target is busy`);
          const entries = children(mount.target).map(path => [path.slice(mount.target.length), { ...files.get(path)! }] as [string, Node]);
          if (mount.type === 'ext4') volumes.set(mount.source, entries);
          for (const path of children(mount.target)) files.delete(path);
          mounts.splice(mounts.indexOf(mount), 1);
          syncMounts();
          return { output: '' };
        }
        case 'df': {
          const { flags, operands } = parseOptions(args, 'h');
          const selected = operands.length ? Array.from(new Set(operands.map(path => { lookup(path); return mountFor(resolve(path)); }))) : mounts;
          const human = flags.has('h');
          return { output: `Filesystem  Size${human ? '' : '(bytes)'}  Used  Available  Use%  Mounted on (simulated)\n` + selected.map(mount => {
            const used = mountUsage(mount), capacity = Math.max(mount.capacity, used);
            return `${mount.source}  ${formatBytes(capacity, human)}  ${formatBytes(used, human)}  ${formatBytes(capacity - used, human)}  ${capacity ? Math.ceil(used / capacity * 100) : 0}%  ${mount.target}`;
          }).join('\n') };
        }
        case 'lsblk':
          noArgs();
          return { output: 'NAME  SIZE  TYPE  MOUNTPOINT (simulated)\nvda  64M  disk\n└─vda1  64M  part  /\nvdb  16M  disk\n└─vdb1  16M  part  ' + (mounts.find(mount => mount.source === '/dev/vdb1')?.target ?? '') };
        case 'free': {
          const { flags, operands } = parseOptions(args, 'h'); requireArgs(operands, 0, 0);
          const used = Math.min(128 * MiB, sizeOf('/') + Array.from(volumes.values()).flat().reduce((total, [, node]) => total + (node.type === 'file' ? byteSize(node.content) : 0), 0));
          return { output: 'Simulated memory (bytes unless -h)\n       total  used  free\nMem:  ' + [128 * MiB, used, 128 * MiB - used].map(value => formatBytes(value, flags.has('h'))).join('  ') + '\nSwap:  0  0  0' };
        }
        case 'ps':
          if (args.length > 1 || (args.length && !['aux', '-ef'].includes(args[0]))) throw new Error('usage: ps [aux|-ef]');
          return { output: 'Simulated processes\n' + processList() };
        case 'top': noArgs(); return { output: `VC Linux — ${uptime()}\nSnapshot (simulated)\n${processList()}` };
        case 'kill': {
          const operands = [...args];
          if (['-9', '-15'].includes(operands[0])) operands.shift();
          requireArgs(operands, 1);
          for (const value of operands) {
            if (!/^\d+$/.test(value) || !processes.has(Number(value))) throw new Error(`${value}: No such process`);
            const pid = Number(value);
            if (pid <= 2) throw new Error(`${value}: Core shell process is in use`);
            processes.delete(pid);
            for (const service of services.values()) if (service.pid === pid) service.active = false;
          }
          return { output: '' };
        }
        case 'systemctl': {
          const action = args[0] ?? 'list-units';
          if (action === 'list-units') { requireArgs(args, 0, 1); return { output: 'Virtual services\n' + Array.from(services, ([name, service]) => `${name}  ${service.active ? 'active (running)' : 'inactive (dead)'}`).join('\n') }; }
          requireArgs(args, 2, 2);
          if (!['status', 'start', 'stop', 'restart'].includes(action)) throw new Error(`unsupported action: ${action}`);
          const name = args[1].endsWith('.service') ? args[1] : args[1] + '.service';
          const service = services.get(name);
          if (!service) throw new Error(`${name}: Unit not found`);
          if (action !== 'status') {
            service.active = action !== 'stop';
            if (service.active) processes.set(service.pid, name.replace(/\.service$/, ''));
            else processes.delete(service.pid);
          }
          return { output: `${name} — simulated service\nActive: ${service.active ? 'active (running)' : 'inactive (dead)'}` };
        }
        case 'uptime': noArgs(); return { output: uptime() };
        case 'who': case 'w': noArgs(); return { output: (command === 'w' ? uptime() + '\n' : '') + `adam  pts/0  ${new Date(started).toISOString()} (virtual)` };
        case 'tty': noArgs(); return { output: '/dev/pts/0' };
        case 'groups': noArgs(); return { output: 'adam' };
        case 'dmesg': noArgs(); return { output: '[Simulated boot messages]\n' + readFile('/var/log/boot.log') };
        case 'lscpu': noArgs(); return { output: 'Architecture: browser virtual machine\nCPU(s): 1 (simulated)\nModel name: VC Virtual CPU' };
        case 'hostnamectl': noArgs(); return { output: 'Static hostname: localhost\nOperating System: VC Linux\nKernel: VC Linux 6.0.0\nVirtualization: browser simulation' };
        case 'nano': {
          if (args[0] === '--') args.shift();
          if (args.length > 1) throw new Error('usage: nano [file]');
          const path = editablePath(args[0] ?? 'untitled.txt');
          const node = files.get(path);
          return { output: '', edit: { path, content: node?.type === 'file' ? node.content : '' } };
        }
        case 'help':
          noArgs();
          return { output: commands.map(name => Object.hasOwn(extraCommands, name) ? `${name}  ${extraCommands[name].description}` : commandHelp[name]).join('\n') + '\n\nTab / arrows: completion · Right Arrow: suggestion · Ctrl+C: cancel\nThis is a simulated portfolio shell. Changes last until page reload.\nPipes, redirects, glob expansion, and command chaining are not supported.' };
        case 'man': {
          requireArgs(args, 1, 1);
          const name = args[0];
          if (!commands.includes(name)) throw new Error(`No manual entry for ${name}`);
          return { output: Object.hasOwn(extraCommands, name) ? `${name}: ${extraCommands[name].description}` : commandHelp[name] };
        }
        case 'type': case 'which':
          requireArgs(args, 1);
          return { output: args.map(name => commands.includes(name) ? command === 'which' ? `/bin/${name}` : `${name} is a virtual shell command` : `${name}: not found`).join('\n') };
        case 'id': noArgs(); return { output: 'uid=1000(adam) gid=1000(adam) groups=1000(adam) (simulated)' };
        case 'env': noArgs(); return { output: Object.entries(environment()).map(([key, value]) => `${key}=${value}`).join('\n') };
        case 'printenv': {
          const variables: Record<string, string> = environment();
          return { output: args.length ? args.filter(key => Object.hasOwn(variables, key)).map(key => variables[key]).join('\n') : Object.entries(variables).map(([key, value]) => `${key}=${value}`).join('\n') };
        }
        case 'basename': case 'dirname': {
          requireArgs(args, 1, 1);
          const path = args[0].replace(/\/+$/, '') || '/';
          const slash = path.lastIndexOf('/');
          return { output: command === 'basename' ? path.slice(slash + 1) || '/' : slash < 0 ? '.' : path.slice(0, slash).replace(/\/+$/, '') || '/' };
        }
        case 'touch': {
          const { operands } = parseOptions(args, '');
          requireArgs(operands, 1);
          for (const path of operands) {
            if (files.has(resolve(path))) { lookup(path); continue; }
            saveFile(path, '');
          }
          return { output: '' };
        }
        case 'mkdir': {
          const { flags, operands } = parseOptions(args, 'p');
          requireArgs(operands, 1);
          for (const operand of operands) {
            const path = resolve(operand);
            const existing = files.get(path);
            if (existing) {
              if (flags.has('p') && existing.type === 'directory') continue;
              throw new Error(`${operand}: File exists`);
            }
            const paths = flags.has('p') ? path.split('/').filter(Boolean).map((_, i, parts) => '/' + parts.slice(0, i + 1).join('/')) : [path];
            for (const directory of paths) {
              if (files.has(directory)) {
                if (files.get(directory)!.type !== 'directory') throw new Error(`${directory}: Not a directory`);
              } else { writableParent(directory); files.set(directory, { type: 'directory' }); }
            }
          }
          return { output: '' };
        }
        case 'rm': case 'rmdir': {
          const { flags, operands } = parseOptions(args, command === 'rm' ? 'rfR' : '');
          if (!flags.has('f')) requireArgs(operands, 1);
          for (const operand of operands) {
            const path = resolve(operand);
            if (!files.has(path) && flags.has('f')) continue;
            const node = lookup(operand);
            removable(path);
            const descendants = children(path);
            if (command === 'rmdir' && node.type !== 'directory') throw new Error(`${operand}: Not a directory`);
            if (node.type === 'directory') {
              if (command === 'rm' && !flags.has('r') && !flags.has('R')) throw new Error(`${operand}: Is a directory`);
              if (command === 'rmdir' && descendants.length) throw new Error(`${operand}: Directory not empty`);
            }
            for (const key of descendants) files.delete(key);
            files.delete(path);
          }
          return { output: '' };
        }
        case 'cp': case 'mv': {
          const { flags, operands } = parseOptions(args, command === 'cp' ? 'rR' : '');
          requireArgs(operands, 2, 2);
          const [sourceArg, targetArg] = operands;
          const source = resolve(sourceArg), node = lookup(sourceArg);
          let target = resolve(targetArg);
          if (files.get(target)?.type === 'directory') target = `${target === '/' ? '' : target}/${source.split('/').at(-1)}`;
          if (source === target) throw new Error('source and destination are the same');
          if (node.type === 'directory' && target.startsWith(source === '/' ? '/' : source + '/')) throw new Error('cannot copy or move a directory into itself');
          if (command === 'mv') removable(source);
          if (node.type === 'directory' && command === 'cp' && !flags.has('r') && !flags.has('R')) throw new Error(`${sourceArg}: Is a directory (use -r)`);
          writableParent(target);
          if (targetArg.endsWith('/') && !files.has(resolve(targetArg))) throw new Error(`${targetArg}: No such directory`);
          const targetNode = files.get(target);
          if (targetNode && (targetNode.type !== node.type || targetNode.type === 'directory')) throw new Error(`${targetArg}: Destination exists or has incompatible type`);
          const entries = [source, ...children(source)].map(key => [key, files.get(key)!] as const);
          for (const [key, value] of entries) files.set(target + key.slice(source.length), { ...value });
          if (command === 'mv') for (const [key] of entries) files.delete(key);
          return { output: '' };
        }
        case 'head': case 'tail': {
          let count = 10;
          const operands = [...args];
          if (operands[0] === '-n') {
            operands.shift();
            const value = operands.shift();
            if (!value || !/^\d+$/.test(value)) throw new Error('usage: head/tail [-n count] file...');
            count = Number(value);
          }
          if (operands[0] === '--') operands.shift();
          requireArgs(operands, 1);
          return { output: operands.map(path => {
            const content = lines(readFile(path));
            const selected = command === 'head' ? content.slice(0, count) : count ? content.slice(-count) : [];
            return (operands.length > 1 ? `==> ${path} <==\n` : '') + selected.join('\n');
          }).join('\n\n') };
        }
        case 'grep': {
          const { flags, operands } = parseOptions(args, 'invF');
          requireArgs(operands, 2);
          const [pattern, ...paths] = operands;
          const regex = flags.has('F') ? null : new RegExp(pattern, flags.has('i') ? 'i' : '');
          return { output: paths.flatMap(path => lines(readFile(path)).flatMap((line, i) => {
            const match = regex ? regex.test(line) : flags.has('i') ? line.toLowerCase().includes(pattern.toLowerCase()) : line.includes(pattern);
            if (match === flags.has('v')) return [];
            return [(paths.length > 1 ? `${path}:` : '') + (flags.has('n') ? `${i + 1}:` : '') + line];
          })).join('\n') };
        }
        case 'wc': {
          const { flags, operands } = parseOptions(args, 'lwc');
          requireArgs(operands, 1);
          const totals = [0, 0, 0];
          const counts = (values: number[]) => values.filter((_, i) => !flags.size || flags.has(['l', 'w', 'c'][i])).join(' ');
          const output = operands.map(path => {
            const content = readFile(path);
            const values = [(content.match(/\n/g) ?? []).length, (content.match(/\S+/g) ?? []).length, byteSize(content)];
            values.forEach((value, i) => totals[i] += value);
            return `${counts(values)} ${path}`;
          });
          if (operands.length > 1) output.push(`${counts(totals)} total`);
          return { output: output.join('\n') };
        }
        case 'sort': {
          const { flags, operands } = parseOptions(args, 'rn');
          requireArgs(operands, 1);
          const content = operands.flatMap(path => lines(readFile(path)));
          content.sort((a, b) => flags.has('n') ? (parseFloat(a) || 0) - (parseFloat(b) || 0) : a < b ? -1 : a > b ? 1 : 0);
          if (flags.has('r')) content.reverse();
          return { output: content.join('\n') };
        }
        case 'uniq': {
          const { flags, operands } = parseOptions(args, 'c');
          requireArgs(operands, 1, 1);
          const groups: { line: string; count: number }[] = [];
          for (const line of lines(readFile(operands[0]))) {
            const last = groups.at(-1);
            if (last && last.line === line) last.count++;
            else groups.push({ line, count: 1 });
          }
          return { output: groups.map(group => (flags.has('c') ? `${group.count} ` : '') + group.line).join('\n') };
        }
        case 'diff': {
          requireArgs(args, 2, 2);
          const left = readFile(args[0]), right = readFile(args[1]);
          if (left === right) return { output: '' };
          return { output: `--- ${args[0]}\n+++ ${args[1]}\n` + lines(left).map(line => `- ${line}`).concat(lines(right).map(line => `+ ${line}`)).join('\n') };
        }
        case 'find': {
          const operands = [...args];
          const root = operands.length && !operands[0].startsWith('-') ? operands.shift()! : '.';
          let pattern: RegExp | null = null, type = '';
          while (operands.length) {
            const flag = operands.shift(), value = operands.shift();
            if (!value) throw new Error('missing predicate value');
            if (flag === '-name') pattern = new RegExp('^' + value.split('').map(char => char === '*' ? '.*' : char === '?' ? '.' : char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('') + '$');
            else if (flag === '-type' && ['f', 'd'].includes(value)) type = value;
            else throw new Error(`unsupported predicate: ${flag}`);
          }
          lookup(root);
          const absolute = resolve(root);
          const displayRoot = root.replace(/\/+$/, '') || '/';
          return { output: [absolute, ...children(absolute).sort()].filter(path => (!pattern || pattern.test(path.split('/').at(-1) || '/')) && (!type || files.get(path)!.type === (type === 'd' ? 'directory' : 'file')))
            .map(path => path === absolute ? root : (displayRoot === '/' ? '' : displayRoot) + (absolute === '/' ? path : path.slice(absolute.length))).join('\n') };
        }
        case 'tree': {
          const { flags, operands } = parseOptions(args, 'a');
          requireArgs(operands, 0, 1);
          const root = resolve(operands[0] ?? '.');
          if (lookup(root).type !== 'directory') throw new Error('Not a directory');
          const output = [operands[0] ?? '.'];
          const walk = (directory: string, indent: string) => {
            const entries = children(directory).filter(path => !(path.slice(directory === '/' ? 1 : directory.length + 1).includes('/')) && (flags.has('a') || !path.split('/').at(-1)!.startsWith('.'))).sort();
            entries.forEach((path, i) => {
              const last = i === entries.length - 1, node = files.get(path)!;
              output.push(indent + (last ? '└── ' : '├── ') + path.split('/').at(-1) + (node.type === 'directory' ? '/' : ''));
              if (node.type === 'directory') walk(path, indent + (last ? '    ' : '│   '));
            });
          };
          walk(root, '');
          return { output: output.join('\n') };
        }
        case 'file': case 'stat': case 'du': {
          const { flags, operands } = parseOptions(args, command === 'du' ? 'a' : '');
          if (command !== 'du') requireArgs(operands, 1);
          const output = (operands.length ? operands : ['.']).flatMap(path => {
            const node = lookup(path), absolute = resolve(path);
            if (command === 'file') return [`${path}: ${node.type === 'directory' ? 'directory' : node.content ? 'UTF-8 text' : 'empty'}`];
            if (command === 'stat') return [`File: ${path}\nType: ${node.type}\nSize: ${sizeOf(absolute)} bytes\nOwner: adam (virtual filesystem)`];
            const entries = [...children(absolute).filter(key => flags.has('a') || files.get(key)!.type === 'directory').sort(), absolute];
            return entries.map(key => `${sizeOf(key)}\t${key}`);
          });
          return { output: output.join('\n') };
        }
        case 'seq': {
          requireArgs(args, 1, 3);
          const numbers = args.map(Number);
          if (numbers.some(value => !Number.isFinite(value))) throw new Error('expected finite numbers');
          const start = args.length === 1 ? 1 : numbers[0], step = args.length === 3 ? numbers[1] : 1, end = numbers.at(-1)!;
          if (!step) throw new Error('step cannot be zero');
          const count = Math.max(0, Math.floor((end - start) / step) + 1);
          if (count > 10000) throw new Error('sequence exceeds 10000 entries');
          return { output: Array.from({ length: count }, (_, i) => String(Number((start + i * step).toPrecision(12)))).join('\n') };
        }
        case 'pwd': noArgs(); return { output: cwd };
        case 'whoami': noArgs(); return { output: 'adam' };
        case 'hostname': noArgs(); return { output: 'localhost' };
        case 'date': noArgs(); return { output: new Date().toString() };
        case 'uname':
          if (args.length > 1 || (args.length && args[0] !== '-a')) throw new Error('usage: uname [-a]');
          return { output: args.length ? 'VC Linux localhost 6.0.0 portfolio browser (simulated)' : 'VC Linux' };
        case 'history': noArgs(); return { output: history.map((entry, i) => `${i + 1}  ${entry}`).join('\n') };
        case 'clear': noArgs(); return { output: '', clear: true };
        case 'echo': return { output: (args[0] === '-n' ? args.slice(1) : args).join(' ') };
        case 'cd': {
          if (args.length > 1) throw new Error('too many arguments');
          const path = args[0] === '-' ? previous : args[0] ?? home;
          if (lookup(path).type !== 'directory') throw new Error(`${path}: Not a directory`);
          previous = cwd;
          cwd = resolve(path);
          return { output: args[0] === '-' ? cwd : '' };
        }
        case 'la': case 'ls': {
          let all = command === 'la', long = command === 'la', options = true;
          const paths: string[] = [];
          for (const arg of args) {
            if (options && arg === '--') { options = false; continue; }
            if (options && arg.startsWith('-')) {
              if (!/^-[al]+$/.test(arg)) throw new Error(`unsupported option: ${arg}`);
              all ||= arg.includes('a'); long ||= arg.includes('l');
            } else paths.push(arg);
          }
          const output = (paths.length ? paths : ['.']).map(path => {
            const node = lookup(path), absolute = resolve(path);
            const prefix = absolute === '/' ? '/' : absolute + '/';
            const entries: [string, Node][] = node.type === 'file' ? [[path, node]] : Array.from(files.entries())
              .filter(([key]) => key.startsWith(prefix) && !key.slice(prefix.length).includes('/'))
              .map(([key, value]) => [key.slice(prefix.length), value]);
            if (all && node.type === 'directory') entries.push(['.', node], ['..', { type: 'directory' }]);
            const listing = entries.filter(([name]) => all || !name.startsWith('.')).sort(([a], [b]) => a.localeCompare(b)).map(([name, value]) => {
              const label = name + (value.type === 'directory' ? '/' : '');
              return long ? `${value.type === 'directory' ? 'drwxr-xr-x' : '-rw-r--r--'}  adam  ${label}` : label;
            }).join(long ? '\n' : '  ');
            return paths.length > 1 ? `${path}:\n${listing}` : listing;
          }).join('\n\n');
          return { output };
        }
        case 'cat': {
          let numbered = false;
          if (args[0] === '-n') { numbered = true; args.shift(); }
          if (args[0] === '--') args.shift();
          if (!args.length) throw new Error('usage: cat [-n] file...');
          let number = 0;
          return { output: args.map(path => {
            try {
              const node = lookup(path);
              if (node.type === 'directory') throw new Error(`${path}: Is a directory`);
              return numbered ? node.content.split('\n').map(line => `${++number}  ${line}`).join('\n') : node.content;
            } catch (error) { return `cat: ${(error as Error).message}`; }
          }).join('\n') };
        }
        default: return { output: `${command}: command not found. Type help for available commands.` };
      }
    } catch (error) {
      return { output: `${command}: ${(error as Error).message}` };
    }
  }
  function complete(line: string): Completion[] {
    // Parse unfinished input without requiring a closing quote.
    const words: string[] = [];
    let word = '', quote = '', start = 0, active = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (!active && !/\s/.test(char)) { start = i; active = true; }
      if (char === '\\' && quote !== "'") {
        if (i + 1 < line.length) word += line[++i];
      } else if (quote) {
        if (char === quote) quote = '';
        else word += char;
      } else if (char === '"' || char === "'") quote = char;
      else if (/\s/.test(char)) {
        if (active) words.push(word);
        word = ''; active = false; start = i + 1;
      } else word += char;
    }
    const prefix = line.slice(0, start);
    const openingQuote = /^["']/.exec(line.slice(start))?.[0];
    const encode = (value: string) => {
      if (!openingQuote) return value.replace(/[\s\\"'|><;&]/g, '\\$&');
      const escaped = openingQuote === "'" ? value.replace(/'/g, "'\\''") : value.replace(/[\\"]/g, '\\$&');
      return openingQuote + escaped + (value.endsWith('/') ? '' : openingQuote);
    };
    if (!words.length) return commands.filter(command => command.startsWith(word))
      .map(command => ({ label: command, value: prefix + encode(command) }));
    if (['man', 'type', 'which'].includes(words[0])) return commands.filter(command => command.startsWith(word))
      .map(command => ({ label: command, value: prefix + encode(command) }));
    let choices: string[] | null = null;
    if (words[0] === 'umount') choices = mounts.filter(mount => !mount.system).map(mount => mount.target);
    if (words[0] === 'mount' && words.at(-1) === '-t') choices = ['ext4', 'tmpfs'];
    if (words[0] === 'kill') choices = Array.from(processes.keys(), String);
    if (words[0] === 'printenv') choices = Object.keys(environment());
    if (words[0] === 'systemctl') choices = words.length === 1 ? ['list-units', 'status', 'start', 'stop', 'restart'] : Array.from(services.keys());
    if (choices) return choices.filter(choice => choice.startsWith(word)).map(choice => ({ label: choice, value: prefix + encode(choice) }));
    if (!['cat', 'cd', 'la', 'ls', 'nano', 'touch', 'mkdir', 'rmdir', 'rm', 'cp', 'mv', 'head', 'tail', 'grep', 'wc', 'sort', 'uniq', 'diff', 'find', 'tree', 'file', 'stat', 'du', 'df', 'mount'].includes(words[0]) || word.startsWith('-')) return [];
    if (['head', 'tail'].includes(words[0]) && words.at(-1) === '-n') return [];
    if (words[0] === 'grep' && words.filter(value => !value.startsWith('-')).length < 2) return [];
    if (words[0] === 'find' && ['-name', '-type'].includes(words.at(-1)!)) return [];
    const slash = word.lastIndexOf('/');
    const parent = word.slice(0, slash + 1);
    const basename = word.slice(slash + 1);
    const directory = resolve(parent || '.');
    if (files.get(directory)?.type !== 'directory') return [];
    const directoryPrefix = directory === '/' ? '/' : directory + '/';
    return Array.from(files.entries()).flatMap(([path, node]) => {
      if (!path.startsWith(directoryPrefix)) return [];
      const name = path.slice(directoryPrefix.length);
      if (!name || name.includes('/') || !name.startsWith(basename)) return [];
      if (name.startsWith('.') && !basename.startsWith('.')) return [];
      if (['cd', 'mkdir', 'rmdir'].includes(words[0]) && node.type !== 'directory') return [];
      const label = parent + name + (node.type === 'directory' ? '/' : '');
      return [{ label, value: prefix + encode(label) }];
    }).sort((a, b) => a.label.localeCompare(b.label));
  }
  function suggest(line: string) {
    if (!line.trim()) return '';
    const match = history.findLast(entry => entry.startsWith(line) && entry !== line);
    if (match) return match;
    return complete(line).find(option => option.value.startsWith(line) && option.value !== line)?.value ?? '';
  }
  function editablePath(path: string) {
    const absolute = resolve(path);
    const parent = absolute.slice(0, absolute.lastIndexOf('/')) || '/';
    if (lookup(parent).type !== 'directory') throw new Error(`${path}: Not a directory`);
    if (files.get(absolute)?.type === 'directory' || path.endsWith('/')) throw new Error(`${path}: Is a directory`);
    if (files.has(absolute)) lookup(path);
    return absolute;
  }
  function saveFile(path: string, content: string) {
    files.set(editablePath(path), { type: 'file', content });
  }
  return { execute, complete, suggest, saveFile };
}
