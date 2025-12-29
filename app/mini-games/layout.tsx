import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Games',
  description: 'Fun shall not be denied',
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