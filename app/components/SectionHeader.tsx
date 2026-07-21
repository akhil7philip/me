'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  italicWord?: string;
  subtitle?: string;
}

export function SectionHeader({ eyebrow, title, italicWord, subtitle }: SectionHeaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!containerRef.current) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 80%',
      },
    });

    tl.from(containerRef.current.querySelector('.eyebrow'), {
      opacity: 0, y: 20, duration: 0.6, ease: 'power3.out',
    })
    .from(containerRef.current.querySelector('.title'), {
      opacity: 0, y: 20, duration: 0.8, ease: 'power3.out',
    }, '-=0.45')
    .from(containerRef.current.querySelector('.line'), {
      scaleX: 0, duration: 0.6, ease: 'power3.out',
    }, '-=0.5');

    if (subtitle) {
      tl.from(containerRef.current.querySelector('.subtitle'), {
        opacity: 0, y: 15, duration: 0.6, ease: 'power3.out',
      }, '-=0.3');
    }
  }, { scope: containerRef });

  const renderTitle = () => {
    if (italicWord && title.includes(italicWord)) {
      const parts = title.split(italicWord);
      return (<>{parts[0]}<span className="italic font-display">{italicWord}</span>{parts[1] || ''}</>);
    }
    return title;
  };

  return (
    <div ref={containerRef} className="mb-12">
      <p className="eyebrow text-xs font-medium uppercase tracking-[0.08em] text-accent-amber mb-4">{eyebrow}</p>
      <h2 className="title font-display text-[clamp(2.5rem,5vw,4rem)] font-normal leading-[1.1] tracking-[-0.01em] text-text-primary">
        {renderTitle()}
      </h2>
      <div className="line w-[60px] h-[2px] bg-accent-amber mt-6 origin-left" style={{ opacity: 0.6 }} />
      {subtitle && (
        <p className="subtitle text-lg text-text-secondary mt-4 max-w-[600px] leading-relaxed">{subtitle}</p>
      )}
    </div>
  );
}
