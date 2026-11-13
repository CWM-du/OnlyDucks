import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'OnlyDucks | Learn, demonstrate, discover', template: '%s | OnlyDucks' },
  description: 'A connected developer learning journey: explore mentoring approaches, build practical skills, and discover your next opportunity.'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
