import { Folder, Star, GitBranch, ExternalLink } from 'lucide-react';
import { Tag } from './Tag';

interface ProjectCardProps {
  name: string;
  description: string | null;
  stars: number;
  forks: number;
  language: string | null;
  updatedAt: string;
  url: string;
}

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: '#3178C6', JavaScript: '#F7DF1E', Python: '#3776AB',
  Go: '#00ADD8', Rust: '#DEA584', Java: '#B07219', HTML: '#E34C26',
  CSS: '#563D7C', Shell: '#89E051',
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Updated today';
  if (diffDays === 1) return 'Updated yesterday';
  if (diffDays < 30) return `Updated ${diffDays}d ago`;
  if (diffDays < 365) return `Updated ${Math.floor(diffDays / 30)}mo ago`;
  return `Updated ${Math.floor(diffDays / 365)}y ago`;
}

export function ProjectCard({ name, description, stars, forks, language, updatedAt, url }: ProjectCardProps) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="group block">
      <article className="bg-bg-surface border border-border-subtle rounded-card p-7 shadow-sm transition-all duration-[400ms] hover:border-border-hover hover:shadow-md hover:shadow-glow hover:-translate-y-1 h-full">
        <div className="flex items-center gap-3">
          <Folder size={18} className="text-accent-amber flex-shrink-0" />
          <h3 className="font-body text-lg font-medium text-text-primary group-hover:text-accent-amber transition-colors duration-300 truncate">{name}</h3>
          <ExternalLink size={14} className="text-text-muted group-hover:text-accent-amber transition-colors duration-300 flex-shrink-0 ml-auto" />
        </div>
        {description && <p className="text-sm text-text-secondary mt-3 line-clamp-2 leading-relaxed">{description}</p>}
        {language && (
          <div className="mt-4">
            <Tag><span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: LANGUAGE_COLORS[language] || '#9A9590' }} />{language}</span></Tag>
          </div>
        )}
        <div className="flex items-center gap-5 mt-5 text-xs text-text-muted">
          <span className="flex items-center gap-1.5"><Star size={14} />{stars}</span>
          <span className="flex items-center gap-1.5"><GitBranch size={14} />{forks}</span>
          <span>{formatDate(updatedAt)}</span>
        </div>
      </article>
    </a>
  );
}
