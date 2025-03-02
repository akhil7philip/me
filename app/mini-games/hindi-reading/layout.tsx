import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hindi Speed Reading | Mini-Games',
  description: 'Test and improve your Hindi reading speed with engaging paragraphs and stories.',
  openGraph: {
    title: 'Hindi Speed Reading | Mini-Games',
    description: 'Test and improve your Hindi reading speed with engaging paragraphs and stories.',
    images: [
      {
        url: 'https://akhilphilip.com/images/og/hindi-reading.png',
        width: 1200,
        height: 630,
        alt: 'Hindi Speed Reading Game',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hindi Speed Reading | Mini-Games',
    description: 'Test and improve your Hindi reading speed with engaging paragraphs and stories.',
    images: ['https://akhilphilip.com/images/og/hindi-reading.png'],
  }
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