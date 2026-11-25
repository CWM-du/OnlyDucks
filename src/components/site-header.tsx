import Link from 'next/link';

const links = [
  { href: '/', label: 'Overview' },
  { href: '/welcome', label: 'Start here' },
  { href: '/mentors', label: 'Mentors' },
  { href: '/agent', label: 'Agent' },
  { href: '/sandbox', label: 'Sandbox' },
  { href: '/roadmap', label: 'Roadmap' },
  { href: '/profile', label: 'Profile' },
  { href: '/feed', label: 'Opportunities' },
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
