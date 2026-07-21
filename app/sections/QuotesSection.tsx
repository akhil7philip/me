'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { SectionHeader } from '../components/SectionHeader';
import { ArrowLeft, ArrowRight, Bookmark } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const quotes = [
  { text: 'He who can go to the fountain does not go to the water-jar.', author: 'Leonardo da Vinci' },
  { text: 'Simplicity is the ultimate sophistication.', author: 'Leonardo da Vinci' },
  { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
  { text: 'We are what we repeatedly do. Excellence, then, is not an act, but a habit.', author: 'Aristotle' },
];

const BOOKMARKS_KEY = 'quote-bookmarks';

export function QuotesSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const quoteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try { const saved = localStorage.getItem(BOOKMARKS_KEY); if (saved) setBookmarks(JSON.parse(saved)); } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    try { localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks)); } catch { /* ignore */ }
  }, [bookmarks]);

  const navigate = useCallback((direction: 'prev' | 'next') => {
    if (isAnimating) return;
    setIsAnimating(true);
    const newIndex = direction === 'next' ? (currentIndex + 1) % quotes.length : (currentIndex - 1 + quotes.length) % quotes.length;
    const el = quoteRef.current;
    if (el) {
      gsap.to(el, { opacity: 0, x: direction === 'next' ? -30 : 30, duration: 0.3, ease: 'power2.in', onComplete: () => {
        setCurrentIndex(newIndex);
        gsap.fromTo(el, { opacity: 0, x: direction === 'next' ? 30 : -30 }, { opacity: 1, x: 0, duration: 0.5, ease: 'power3.out', onComplete: () => setIsAnimating(false) });
      }});
    } else { setCurrentIndex(newIndex); setIsAnimating(false); }
  }, [currentIndex, isAnimating]);

  function toggleBookmark() {
    setBookmarks((prev) => prev.includes(currentIndex) ? prev.filter((i) => i !== currentIndex) : [...prev, currentIndex]);
  }

  useGSAP(() => {
    if (!sectionRef.current) return;
    const card = sectionRef.current.querySelector('.quote-card');
    if (card) gsap.from(card, { opacity: 0, scale: 0.95, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: card, start: 'top 85%' } });
    const controls = sectionRef.current.querySelector('.quote-controls');
    if (controls) gsap.from(controls, { opacity: 0, y: 20, duration: 0.6, ease: 'power3.out', scrollTrigger: { trigger: controls, start: 'top 90%' } });
  }, { scope: sectionRef });

  const isBookmarked = bookmarks.includes(currentIndex);
  const currentQuote = quotes[currentIndex];

  return (
    <section id="quotes" ref={sectionRef} className="py-24 md:py-32 lg:py-40">
      <div className="max-w-[800px] mx-auto px-6 md:px-8 lg:px-12">
        <SectionHeader eyebrow="03 — Quotes" title="Words That Resonate" italicWord="Resonate" />
        <div className="quote-card relative bg-bg-surface border border-border-subtle rounded-3xl p-8 md:p-12 lg:p-16 shadow-sm overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, rgba(212, 165, 116, 0.04) 0%, transparent 70%)' }} />
          <span className="absolute top-4 left-6 font-display text-[8rem] leading-[0.5] text-[rgba(212,165,116,0.08)] select-none pointer-events-none" aria-hidden="true">&ldquo;</span>
          <div ref={quoteRef} className="relative z-10 text-center">
            <blockquote className="font-display text-[clamp(1.5rem,3vw,2.25rem)] italic font-normal text-text-primary leading-[1.5]">&ldquo;{currentQuote.text}&rdquo;</blockquote>
            <cite className="block mt-8 text-base not-italic text-accent-amber font-body">— {currentQuote.author}</cite>
          </div>
        </div>
        <div className="quote-controls flex flex-col items-center mt-8">
          <div className="flex items-center gap-6">
            <button onClick={() => navigate('prev')} className="w-9 h-9 rounded-full border border-border-subtle flex items-center justify-center text-text-secondary transition-all duration-300 hover:border-accent-amber hover:text-accent-amber" aria-label="Previous quote"><ArrowLeft size={16} /></button>
            <button onClick={toggleBookmark} className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all duration-300 ${isBookmarked ? 'border-accent-amber text-accent-amber bg-[rgba(212,165,116,0.1)]' : 'border-border-subtle text-text-secondary hover:border-accent-amber hover:text-accent-amber'}`} aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark quote'}><Bookmark size={16} fill={isBookmarked ? 'currentColor' : 'none'} /></button>
            <button onClick={() => navigate('next')} className="w-9 h-9 rounded-full border border-border-subtle flex items-center justify-center text-text-secondary transition-all duration-300 hover:border-accent-amber hover:text-accent-amber" aria-label="Next quote"><ArrowRight size={16} /></button>
          </div>
          <p className="mt-6 text-xs font-medium uppercase tracking-[0.08em] text-text-muted">{currentIndex + 1} / {quotes.length}</p>
          {bookmarks.length > 0 && <p className="mt-4 text-xs text-text-muted">{bookmarks.length} bookmark{bookmarks.length > 1 ? 's' : ''}</p>}
        </div>
      </div>
    </section>
  );
}
