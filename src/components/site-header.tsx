import Link from 'next/link';

const links = [
  { href: '/', label: 'Inicio' },
  { href: '/welcome', label: 'Empieza aquí' },
  { href: '/mentors', label: 'Mentores' },
  { href: '/agent', label: 'Agente' },
  { href: '/sandbox', label: 'Sandbox' },
  { href: '/roadmap', label: 'Roadmap' },
  { href: '/profile', label: 'Perfil' },
  { href: '/feed', label: 'Oportunidades' },
];

export function SiteHeader({ active, status = 'Preview' }: { active?: string; status?: string }) {
  return (
    <header className="topbar">
      <Link className="brand" href="/" aria-label="OnlyDucks home"><span className="brand-mark">o</span>OnlyDucks</Link>
      <nav className="main-nav" aria-label="Main navigation">
        {links.map((item) => <Link key={item.href} className={active === item.href ? 'nav-link nav-link-active' : 'nav-link'} href={item.href} aria-current={active === item.href ? 'page' : undefined}>{item.label}</Link>)}
      </nav>
      <span className="environment-pill"><span className="status-dot" />{status}</span>
    </header>
  );
}
