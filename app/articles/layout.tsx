import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog | Akhil Philip',
  description: 'Read, Code, Love - Blog articles on various topics by Akhil Philip.',
};

export default function ArticlesLayout({
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