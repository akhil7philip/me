'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { GradientMesh } from '../components/GradientMesh';
import { SocialLinks } from '../components/SocialLinks';
import { ChevronDown } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!sectionRef.current) return;
    const tl = gsap.timeline({ delay: 0.4 });
    tl.from('.hero-name', { opacity: 0, y: 30, duration: 1, ease: 'power3.out' })
      .from('.hero-tagline', { opacity: 0, y: 20, duration: 0.8, ease: 'power3.out' }, '-=0.7')
      .from('.hero-bio', { opacity: 0, y: 20, duration: 0.8, ease: 'power3.out' }, '-=0.55')
      .from('.hero-socials a', { opacity: 0, y: 20, duration: 0.6, stagger: 0.1, ease: 'power3.out' }, '-=0.4')
      .from('.hero-photo', { opacity: 0, scale: 0.9, duration: 1.2, ease: 'power3.out' }, '-=1.2');

    gsap.from(scrollIndicatorRef.current, { opacity: 0, delay: 1.5, duration: 0.6 });

    ScrollTrigger.create({
      trigger: sectionRef.current, start: '10% top',
      onEnter: () => gsap.to(scrollIndicatorRef.current, { opacity: 0, duration: 0.3 }),
      onLeaveBack: () => gsap.to(scrollIndicatorRef.current, { opacity: 1, duration: 0.3 }),
    });
  }, { scope: sectionRef });

  return (
    <section id="hero" ref={sectionRef} className="relative min-h-screen flex items-center overflow-hidden">
      <GradientMesh />
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 40%, transparent 0%, #0A0908 100%)', zIndex: 1 }} />
      <div className="relative z-10 w-full max-w-content mx-auto px-6 md:px-8 lg:px-12 py-20">
        <div className="flex flex-col-reverse md:flex-row items-center gap-12 md:gap-16">
          <div className="flex-1 text-center md:text-left">
            <h1 className="hero-name font-display text-[clamp(3rem,8vw,6rem)] font-normal leading-[1.05] tracking-[-0.02em] text-text-primary">
              Akhil <span className="italic">Philip</span>
            </h1>
            <div className="hero-tagline mt-6 flex flex-col items-center md:items-start">
              <span className="block w-10 h-px bg-accent-amber mb-4" />
              <p className="text-lg tracking-[0.1em] uppercase text-accent-amber font-body">Read, Code, Love</p>
            </div>
            <div className="hero-bio mt-8 max-w-[520px] mx-auto md:mx-0">
              <p className="text-lg text-text-secondary leading-relaxed">
                Hey there! I&apos;m a curious mind who loves exploring the intersection of technology and creativity. When I&apos;m not coding or writing, you&apos;ll find me experimenting with new ideas or enjoying a good book, that is if I&apos;m not helplessly binging on a new show or movie. <span className="text-text-primary">Welcome to my little corner of the internet!</span>
              </p>
            </div>
            <div className="hero-socials mt-10 flex justify-center md:justify-start">
              <SocialLinks />
            </div>
          </div>
          <div className="hero-photo flex-shrink-0">
            <div className="w-[200px] h-[200px] md:w-[240px] md:h-[240px] lg:w-[280px] lg:h-[280px] rounded-full overflow-hidden animate-border-pulse" style={{ border: '2px solid rgba(212, 165, 116, 0.2)', boxShadow: '0 0 40px rgba(212, 165, 116, 0.15)' }}>
              <img src="/images/profile/profile.jpg" alt="Akhil Philip" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </div>
      <div ref={scrollIndicatorRef} className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 hidden md:block">
        <ChevronDown size={24} className="text-text-muted animate-bounce-gentle" />
      </div>
    </section>
  );
}
