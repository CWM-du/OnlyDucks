import type { Metadata } from 'next';
import './globals.css';
import './feed-layout.css';

export const metadata: Metadata = {
  title: { default: 'OnlyDucks | Tu red profesional', template: '%s | OnlyDucks' },
  description: 'Aprende siguiendo a expertos, descubre recursos profesionales y encuentra nuevas oportunidades.'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
