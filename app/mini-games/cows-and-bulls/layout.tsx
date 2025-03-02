import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cows and Bulls | Mini-Games',
  description: 'A multiplayer number guessing game where players take turns to guess a secret number.',
  openGraph: {
    title: 'Cows and Bulls | Mini-Games',
    description: 'A multiplayer number guessing game where players take turns to guess a secret number.',
    images: [
      {
        url: 'https://akhilphilip.com/images/og/cows-and-bulls.png',
        width: 1200,
        height: 630,
        alt: 'Cows and Bulls Game',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cows and Bulls | Mini-Games',
    description: 'A multiplayer number guessing game where players take turns to guess a secret number.',
    images: ['https://akhilphilip.com/images/og/cows-and-bulls.png'],
  }
};

export default function CowsAndBullsLayout({
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