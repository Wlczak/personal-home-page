import profiles from '../content/profiles.json';
import projects from '../content/projects.json';
import type { Locale } from './i18n';

const home = '/home/adam';
type Node = { type: 'directory' } | { type: 'file'; content: string };
export interface CommandResult { output: string; clear?: boolean }

// A portfolio filesystem in memory: commands never access the host machine.
export function createTerminal(locale: Locale = 'en') {
  const profile = profiles.find(profile => profile.id === locale)!;
  const files = new Map<string, Node>([
    ['/', { type: 'directory' }],
    ['/home', { type: 'directory' }],
    [home, { type: 'directory' }],
    [`${home}/projects`, { type: 'directory' }],
    [`${home}/.profile`, { type: 'file', content: 'USER=adam\nHOME=/home/adam' }],
    [`${home}/README.txt`, { type: 'file', content: 'Welcome to Adam’s portfolio terminal.\nTry ls, cat about.txt, or cd projects.\nType help for available commands. This filesystem is read-only.' }],
    [`${home}/about.txt`, { type: 'file', content: `${profile.bio}\n\n${profile.learning}` }],
    [`${home}/interests.txt`, { type: 'file', content: 'backend / games / hardware' }],
  ]);
  for (const project of projects) {
    files.set(`${home}/projects/${project.id}.txt`, { type: 'file', content: `${project.name}\n${project.description[locale]}\nTechnologies: ${project.technologies.join(', ')}\nSource: ${project.source}` });
  }
  let cwd = home;
  let previous = home;
  const history: string[] = [];

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
  function execute(line: string): CommandResult {
    if (!line.trim()) return { output: '' };
    history.push(line);
    let command = 'shell';
    try {
      const words = tokenize(line);
      command = words.shift()!;
      const args = words;
      const noArgs = () => { if (args.length) throw new Error('too many arguments'); };
      switch (command) {
        case 'help':
          return { output: 'ls [-al] [path]   List files\ncd [path]         Change directory; ~, .., and - supported\npwd               Print working directory\ncat [-n] file...  Read files\necho [-n] text    Print text (quotes supported)\nwhoami            Print current user\nhostname          Print hostname\nuname [-a]        Print simulated system information\ndate              Print current date and time\nhistory           Show submitted commands\nclear             Clear the screen\nhelp              Show this help\n\nThis is a simulated, read-only portfolio shell. Pipes, redirects, and command chaining are not supported.' };
        case 'pwd': noArgs(); return { output: cwd };
        case 'whoami': noArgs(); return { output: 'adam' };
        case 'hostname': noArgs(); return { output: 'localhost' };
        case 'date': noArgs(); return { output: new Date().toString() };
        case 'uname':
          if (args.length > 1 || (args.length && args[0] !== '-a')) throw new Error('usage: uname [-a]');
          return { output: args.length ? 'Linux localhost 6.0.0 portfolio browser (simulated)' : 'Linux' };
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
        case 'ls': {
          let all = false, long = false, options = true;
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
              return long ? `${value.type === 'directory' ? 'dr-xr-xr-x' : '-r--r--r--'}  adam  ${label}` : label;
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
  return { execute };
}
