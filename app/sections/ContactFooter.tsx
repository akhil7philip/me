'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { AmberButton } from '../components/AmberButton';
import { Github, Twitter, Linkedin } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const socialLinks = [
  { name: 'GitHub', href: 'https://github.com/akhil7philip', Icon: Github },
  { name: 'X', href: 'https://x.com/akhil7philip', Icon: Twitter },
  { name: 'LinkedIn', href: 'https://linkedin.com/in/akhilphilip/', Icon: Linkedin },
];

const footerLinks = [
  { name: 'Home', href: '#hero' },
  { name: 'Writing', href: '/articles' },
  { name: 'Source', href: 'https://github.com/akhil7philip/me' },
];

export function ContactFooter() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    if (!sectionRef.current) return;
    const elements = sectionRef.current.querySelectorAll('.animate-in');
    gsap.from(elements, { opacity: 0, y: 30, duration: 0.8, stagger: 0.15, ease: 'power3.out', scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' } });
    const footer = sectionRef.current.querySelector('.footer-bar');
    if (footer) gsap.from(footer, { opacity: 0, duration: 0.6, ease: 'power3.out', scrollTrigger: { trigger: footer, start: 'top 95%' } });
  }, { scope: sectionRef });

  return (
    <section id="contact" ref={sectionRef} className="pt-24 md:pt-32 lg:pt-40 pb-8">
      <div className="max-w-content mx-auto px-6 md:px-8 lg:px-12">
        <div className="h-px mb-24 md:mb-32" style={{ background: 'linear-gradient(to right, transparent, #1E1C1A, transparent)' }} />
      </div>
      <div className="max-w-content mx-auto px-6 md:px-8 lg:px-12 text-center">
        <h2 className="animate-in font-display text-[clamp(2rem,4vw,3rem)] font-normal text-text-primary leading-[1.2]">Let&apos;s build something <span className="italic">together.</span></h2>
        <p className="animate-in text-lg text-text-secondary mt-6 max-w-[500px] mx-auto leading-relaxed">Whether it&apos;s a collaboration, a conversation, or just saying hello — my inbox is always open.</p>
        <div className="animate-in mt-10"><AmberButton href="mailto:akhil7philip@gmail.com">Say Hello →</AmberButton></div>
        <div className="animate-in flex items-center justify-center gap-8 mt-10">
          {socialLinks.map(({ name, href, Icon }) => (
            <a key={name} href={href} target="_blank" rel="noopener noreferrer" className="text-sm text-text-secondary hover:text-accent-amber transition-colors duration-300 relative group">
              <span className="flex items-center gap-2"><Icon size={16} />{name}</span>
              <span className="absolute left-0 -bottom-0.5 w-0 h-px bg-accent-amber group-hover:w-full transition-all duration-300" />
            </a>
          ))}
        </div>
      </div>
      <div className="footer-bar max-w-content mx-auto px-6 md:px-8 lg:px-12 mt-24 pt-8 border-t border-border-subtle flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-xs font-medium uppercase tracking-[0.08em] text-text-muted">© {new Date().getFullYear()} Akhil Philip. Built with curiosity.</p>
        <div className="flex items-center gap-8">
          {footerLinks.map(({ name, href }) => href.startsWith('http') ? (
            <a key={name} href={href} target="_blank" rel="noopener noreferrer" className="text-xs font-medium uppercase tracking-[0.08em] text-text-muted hover:text-accent-amber transition-colors duration-300">{name}</a>
          ) : (
            <a key={name} href={href} className="text-xs font-medium uppercase tracking-[0.08em] text-text-muted hover:text-accent-amber transition-colors duration-300">{name}</a>
          ))}
        </div>
      </div>
    </section>
  );
}
