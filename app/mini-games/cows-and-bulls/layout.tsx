import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cows and Bulls | Mini-Games',
  description: 'A multiplayer number guessing game where players take turns to guess a secret number.',
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