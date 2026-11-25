import type { Metadata } from 'next';
import './globals.css';
import './feed-layout.css';
import { ThemeProvider } from '../components/theme-provider';

export const metadata: Metadata = {
  title: { default: 'OnlyDucks | Tu red profesional', template: '%s | OnlyDucks' },
  description: 'OnlyDucks conecta orientación de expertos, aprendizaje práctico y oportunidades profesionales para ayudarte a avanzar en tu carrera.',
  icons: { icon: '/favicon.svg' }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" data-theme="light" data-build-commit={process.env.VERCEL_GIT_COMMIT_SHA ?? "local"} suppressHydrationWarning>
      <body><ThemeProvider>{children}</ThemeProvider></body>
    </html>
  );
}
