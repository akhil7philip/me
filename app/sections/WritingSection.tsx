'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { SectionHeader } from '../components/SectionHeader';
import { ArticleCard } from '../components/ArticleCard';
import { AmberButton } from '../components/AmberButton';

gsap.registerPlugin(ScrollTrigger);

const articles = [
  { title: "Coders' Code", excerpt: 'On the poetry hidden in clean code and the minds that craft it.', date: 'Dec 26, 2025', readTime: '2 min read', category: 'Reflection', categories: ['Reflection'], featured: false, image: '/images/articles/coders-code.png', href: '/articles/coders-code' },
  { title: 'Existentialist Engineer', excerpt: 'Navigating the tension between building systems and questioning existence.', date: 'Dec 26, 2025', readTime: '3 min read', category: 'Reflection', categories: ['Reflection'], featured: true, image: '/images/articles/existentialist.png', href: '/articles/existentialist-engineer' },
  { title: 'The Art of Debugging', excerpt: 'A methodical approach to finding and fixing bugs in complex systems.', date: 'Dec 20, 2025', readTime: '5 min read', category: 'Tutorial', categories: ['Tutorial'], featured: false, image: '/images/articles/debugging.jpg', href: '/articles' },
  { title: 'On Simplicity', excerpt: 'Why the best solutions are often the simplest ones, and how to find them.', date: 'Dec 15, 2025', readTime: '4 min read', category: 'Opinion', categories: ['Opinion'], featured: false, image: '/images/articles/simplicity.jpg', href: '/articles' },
];

export function WritingSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    if (!sectionRef.current) return;
    const cards = sectionRef.current.querySelectorAll('.article-card');
    gsap.from(cards, { opacity: 0, y: 40, duration: 0.8, stagger: 0.15, ease: 'power3.out', scrollTrigger: { trigger: sectionRef.current.querySelector('.articles-grid'), start: 'top 85%' } });
    const cta = sectionRef.current.querySelector('.section-cta');
    if (cta) gsap.from(cta, { opacity: 0, y: 20, duration: 0.6, ease: 'power3.out', scrollTrigger: { trigger: cta, start: 'top 90%' } });
  }, { scope: sectionRef });

  return (
    <section id="writing" ref={sectionRef} className="py-24 md:py-32 lg:py-40">
      <div className="max-w-content mx-auto px-6 md:px-8 lg:px-12">
        <SectionHeader eyebrow="02 — Writing" title="Paras" italicWord="Paras" subtitle="A collection of thoughts on technology, creativity, and the art of building things. Short essays, reflections, and tutorials — finding clarity through writing." />
        <div className="articles-grid grid grid-cols-1 md:grid-cols-2 gap-6">
          {articles.map((article) => <div key={article.title} className="article-card"><ArticleCard {...article} /></div>)}
        </div>
        <div className="section-cta mt-12 flex justify-center">
          <AmberButton href="/articles" variant="ghost">View All Articles →</AmberButton>
        </div>
      </div>
    </section>
  );
}
