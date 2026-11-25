import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <Link className="footer-brand" href="/">OnlyDucks</Link>
      <span>Learning, with a next step in mind.</span>
      <span>Early preview</span>
    </footer>
  );
}
