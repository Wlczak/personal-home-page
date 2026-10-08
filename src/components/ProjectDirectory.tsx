import { useEffect, useState } from 'react';
import { messages, type Locale } from '../lib/i18n';
import type { ProjectCardData } from '../lib/projects';
import ProjectCard from './ProjectCard';

export default function ProjectDirectory({ projects, locale }: { projects: ProjectCardData[]; locale: Locale }) {
  const t = messages[locale];
  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  useEffect(() => setReady(true), []);
  const visible = projects.filter(p => (category==='all' || p.category===category) &&
    `${p.name} ${p.description} ${p.technologies.join(' ')}`.toLocaleLowerCase(locale).includes(query.trim().toLocaleLowerCase(locale)));
  return <>
    <div className="directory-controls" hidden={!ready}>
      <label className="search-label">{t.search}<input type="search" placeholder={t.searchPlaceholder} value={query} onChange={e=>setQuery(e.target.value)} /></label>
      <fieldset className="filter-group"><legend>{t.filter}</legend>
        {(['all','web','games','hardware'] as const).map(key=><button key={key} type="button" aria-pressed={category===key} onClick={()=>setCategory(key)}>{t[key]}</button>)}
      </fieldset>
    </div>
    <noscript><p>{t.nojs}</p></noscript>
    <p className="result-count mono" role="status">{visible.length} / {projects.length} {t.results}</p>
    <div className="project-grid">{visible.map(project=><ProjectCard key={project.id} project={project} locale={locale}/>)}</div>
    {visible.length===0 && <div className="empty-state"><p>{t.empty}</p><button type="button" className="button" onClick={()=>{setQuery('');setCategory('all');}}>{t.reset}</button></div>}
  </>;
}
