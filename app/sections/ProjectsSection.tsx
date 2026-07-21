'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { SectionHeader } from '../components/SectionHeader';
import { ProjectCard } from '../components/ProjectCard';
import { AmberButton } from '../components/AmberButton';
import { useGitHubRepos } from '../hooks/useGitHubRepos';
import { Github } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export function ProjectsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { repos, loading, error } = useGitHubRepos();

  useGSAP(() => {
    if (!sectionRef.current) return;
    const cards = sectionRef.current.querySelectorAll('.project-card');
    if (cards.length > 0) gsap.from(cards, { opacity: 0, y: 40, duration: 0.8, stagger: 0.12, ease: 'power3.out', scrollTrigger: { trigger: sectionRef.current.querySelector('.projects-grid'), start: 'top 85%' } });
    const cta = sectionRef.current.querySelector('.section-cta');
    if (cta) gsap.from(cta, { opacity: 0, y: 20, duration: 0.6, ease: 'power3.out', scrollTrigger: { trigger: cta, start: 'top 90%' } });
  }, { scope: sectionRef, dependencies: [repos] });

  return (
    <section id="projects" ref={sectionRef} className="py-24 md:py-32 lg:py-40">
      <div className="max-w-content mx-auto px-6 md:px-8 lg:px-12">
        <SectionHeader eyebrow="04 — Projects" title="Building in Public" italicWord="Public" subtitle="Open-source work and side projects. A selection of repositories I'm building and maintaining — from developer tools to creative experiments." />
        {loading && <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-accent-amber border-t-transparent rounded-full animate-spin" /></div>}
        {error && (
          <div className="text-center py-16">
            <p className="text-text-secondary mb-4">Unable to load projects right now.</p>
            <a href="https://github.com/akhil7philip?tab=repositories" target="_blank" rel="noopener noreferrer" className="text-accent-amber hover:underline inline-flex items-center gap-2"><Github size={16} />View all repositories on GitHub →</a>
          </div>
        )}
        {repos && repos.length > 0 && (
          <>
            <div className="projects-grid grid grid-cols-1 md:grid-cols-2 gap-6">
              {repos.map((repo) => <div key={repo.id} className="project-card"><ProjectCard name={repo.name} description={repo.description} stars={repo.stargazers_count} forks={repo.forks_count} language={repo.language} updatedAt={repo.updated_at} url={repo.html_url} /></div>)}
            </div>
            <div className="section-cta mt-12 flex justify-center">
              <AmberButton href="https://github.com/akhil7philip?tab=repositories" variant="ghost">View All on GitHub →</AmberButton>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
