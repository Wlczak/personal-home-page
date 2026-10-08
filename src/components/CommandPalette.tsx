import { useEffect, useRef, useState } from 'react';
import { messages, type Locale } from '../lib/i18n';

export default function CommandPalette({ locale, links }: { locale: Locale; links: { name: string; href: string }[] }) {
  const t = messages[locale];
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState('');
  function open() { setQuery(''); dialog.current?.showModal(); input.current?.focus(); }
  useEffect(() => {
    setReady(true);
    const listener = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase()==='k') {
        event.preventDefault();
        if (dialog.current?.open) dialog.current.close(); else open();
      }
    };
    document.addEventListener('keydown', listener);
    return () => document.removeEventListener('keydown', listener);
  }, []);
  const results = links.filter(link=>link.name.toLocaleLowerCase(locale).includes(query.toLocaleLowerCase(locale)));
  return <>
    <button ref={trigger} type="button" className="command-trigger" hidden={!ready} onClick={open} aria-label={t.commands}><span aria-hidden="true">⌕</span><kbd>Ctrl K</kbd></button>
    <dialog ref={dialog} className="command-dialog" aria-labelledby="command-title" onClose={()=>trigger.current?.focus()} onKeyDown={event=>{if(event.key==='Escape'){event.preventDefault();dialog.current?.close();}}} onClick={event=>{if(event.target===dialog.current) dialog.current?.close();}}>
      <div className="window-bar"><h2 id="command-title">{t.commands}</h2><button type="button" onClick={()=>dialog.current?.close()} aria-label={t.close}>×</button></div>
      <div className="palette-body"><label>{t.paletteHint}<input ref={input} type="search" value={query} onChange={event=>setQuery(event.target.value)} onKeyDown={event=>{if(event.key==='Enter' && results[0]) window.location.assign(results[0].href);}} /></label>
        <ul>{results.map(link=><li key={link.href}><a href={link.href}>{link.name}<span aria-hidden="true">↵</span></a></li>)}</ul>
        {results.length===0 && <p role="status">{t.paletteEmpty}</p>}
      </div>
    </dialog>
  </>;
}
