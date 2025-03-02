import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mini-Games | Akhil Philip',
  description: 'Fun learning activities and games',
};

export default function MiniGamesLayout({
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