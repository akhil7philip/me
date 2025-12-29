import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Quotes | Akhil Philip',
  description: 'A collection of inspiring quotes that motivate and resonate',
};

export default function QuotesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

