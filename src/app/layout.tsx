import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'OnlyDucks',
  description: 'AI mentoring and developer opportunities.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
