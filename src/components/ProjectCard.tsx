import ProjectArt from './ProjectArt';
import { messages, type Locale } from '../lib/i18n';
import type { ProjectCardData } from '../lib/projects';

export default function ProjectCard({ project, locale }: { project: ProjectCardData; locale: Locale }) {
  const t = messages[locale];
  return <article className="project-card">
    <a href={project.href} className="art-link" tabIndex={-1} aria-hidden="true"><ProjectArt id={project.id} /></a>
    <div className="card-body">
      <div className="card-meta"><span>{t[project.category]}</span><span className="mono">{project.id.toUpperCase()}</span></div>
      <h3><a href={project.href}>{project.name}<span aria-hidden="true"> ↗</span></a></h3>
      <p>{project.description}</p>
      <ul className="tags" aria-label={t.technologies}>{project.technologies.map(tech => <li key={tech}>{tech}</li>)}</ul>
      {project.unavailable && <p className="release-note">{t.unavailable}</p>}
    </div>
  </article>;
}
