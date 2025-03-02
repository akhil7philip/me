import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hindi Speed Reading | Mini-Games',
  description: 'Test and improve your Hindi reading speed with engaging paragraphs and stories.',
};

export default function HindiReadingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
    </>
  );
} 