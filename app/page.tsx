'use client';

import { NavigationRail } from './components/NavigationRail';
import { HeroSection } from './sections/HeroSection';
import { WritingSection } from './sections/WritingSection';
import { QuotesSection } from './sections/QuotesSection';
import { ProjectsSection } from './sections/ProjectsSection';
import { ContactFooter } from './sections/ContactFooter';
import { useLenis } from './hooks/useLenis';

export default function Home() {
  useLenis();

  return (
    <div className="relative">
      <NavigationRail />
      <main className="lg:ml-20">
        <HeroSection />
        <WritingSection />
        <QuotesSection />
        <ProjectsSection />
        <ContactFooter />
      </main>
    </div>
  );
}
