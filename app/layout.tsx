import type { Metadata } from 'next';
import { Playfair_Display, Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['400', '700'],
  style: ['normal', 'italic'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
  weight: ['400', '500', '600'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['400'],
});

export const metadata: Metadata = {
  title: 'Akhil Philip — Read, Code, Love',
  description:
    "A curious mind exploring the intersection of technology and creativity. Welcome to my little corner of the internet!",
  keywords: ['Akhil Philip', 'Developer', 'Writer', 'Portfolio', 'Blog'],
  authors: [{ name: 'Akhil Philip' }],
  openGraph: {
    title: 'Akhil Philip — Read, Code, Love',
    description:
      'A curious mind exploring the intersection of technology and creativity.',
    type: 'website',
    url: 'https://akhilphilip.com',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen bg-bg-primary text-text-primary">
        {children}
      </body>
    </html>
  );
}
