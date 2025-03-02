import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog | Akhil Philip',
  description: 'Read, Code, Love - Blog articles on various topics by Akhil Philip.',
  openGraph: {
    title: 'Blog | Akhil Philip',
    description: 'Read, Code, Love - Blog articles on various topics by Akhil Philip.',
    images: [
      {
        url: 'https://akhilphilip.com/images/og/blog-cover.png',
        width: 1200,
        height: 630,
        alt: 'Akhil Philip Blog',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog | Akhil Philip',
    description: 'Read, Code, Love - Blog articles on various topics by Akhil Philip.',
    images: ['https://akhilphilip.com/images/og/blog-cover.png'],
  }
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