'use client';

import { useState, useEffect } from 'react';
import { User, BookOpen, Quote, Code2, Mail, Menu, X } from 'lucide-react';
import { getLenis } from '../hooks/useLenis';
import { useActiveSection } from '../hooks/useActiveSection';

const navItems = [
  { id: 'hero', label: 'About', Icon: User },
  { id: 'writing', label: 'Writing', Icon: BookOpen },
  { id: 'quotes', label: 'Quotes', Icon: Quote },
  { id: 'projects', label: 'Projects', Icon: Code2 },
  { id: 'contact', label: 'Contact', Icon: Mail },
];

export function NavigationRail() {
  const activeSection = useActiveSection();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  function scrollToSection(id: string) {
    const lenis = getLenis();
    if (lenis) {
      lenis.scrollTo(`#${id}`, { offset: -40 });
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileOpen(false);
  }

  return (
    <>
      <nav className={`fixed left-0 top-0 h-full z-50 hidden lg:flex flex-col items-center justify-center transition-all duration-600 ease-out ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-5'}`} style={{ width: 80 }}>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-[60%] bg-border-subtle" />
        <div className="flex flex-col items-center gap-3 relative">
          {navItems.map(({ id, label, Icon }) => {
            const isActive = activeSection === id;
            return (
              <button key={id} onClick={() => scrollToSection(id)} className={`group relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 border ${isActive ? 'bg-bg-surface border-accent-amber text-accent-amber shadow-[0_0_16px_rgba(212,165,116,0.2)]' : 'bg-transparent border-border-subtle text-text-muted hover:bg-bg-surface hover:border-border-hover hover:text-text-secondary hover:shadow-sm'}`} aria-label={label}>
                <Icon size={20} strokeWidth={1.5} />
                {isActive && <span className="absolute -right-1 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-accent-amber animate-nav-pulse" />}
                <span className="absolute left-full ml-3 px-3 py-1.5 rounded-lg bg-bg-surface border border-border-subtle text-xs font-medium text-text-secondary whitespace-nowrap opacity-0 translate-x-[-8px] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 pointer-events-none">{label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <button onClick={() => setMobileOpen(!mobileOpen)} className={`fixed top-4 right-4 z-50 lg:hidden w-12 h-12 rounded-full border flex items-center justify-center transition-all duration-300 ${mobileOpen ? 'border-accent-amber text-accent-amber bg-bg-surface' : 'border-border-subtle text-text-primary bg-bg-primary/80 backdrop-blur-sm'}`} aria-label="Toggle menu">
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden bg-bg-primary flex flex-col items-center justify-center gap-8">
          {navItems.map(({ id, label, Icon }) => {
            const isActive = activeSection === id;
            return (
              <button key={id} onClick={() => scrollToSection(id)} className={`flex items-center gap-4 text-3xl font-display transition-colors duration-300 ${isActive ? 'text-accent-amber' : 'text-text-primary hover:text-accent-amber'}`}>
                <Icon size={28} strokeWidth={1.5} />{label}
              </button>
            );
          })}
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden h-16 bg-bg-primary/85 backdrop-blur-xl border-t border-border-subtle flex items-center justify-around">
        {navItems.map(({ id, Icon }) => {
          const isActive = activeSection === id;
          return (
            <button key={id} onClick={() => scrollToSection(id)} className={`relative flex flex-col items-center justify-center w-12 h-12 transition-colors duration-300 ${isActive ? 'text-accent-amber' : 'text-text-muted'}`} aria-label={id}>
              <Icon size={20} strokeWidth={1.5} />
              {isActive && <span className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-accent-amber" />}
            </button>
          );
        })}
      </nav>
    </>
  );
}
