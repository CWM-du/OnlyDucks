'use client';

import { useEffect, useState } from 'react';
import { useOnlyDucksTheme } from '../components/theme-provider';
import Link from 'next/link';

const navigation = [
  { icon: '⌂', label: 'Para ti', href: '/', active: true },
  { icon: '♨', label: 'Tendencias', href: '/feed' },
  { icon: '▱', label: 'Guardados', href: '/profile' },
  { icon: '▣', label: 'Empleo', href: '/feed' },
  { icon: '✦', label: 'Rutas de aprendizaje', href: '/roadmap' },
  { icon: '◎', label: 'Expertos', href: '/mentors' },
  { icon: '◈', label: 'Agente IA', href: '/agent' },
];

const trends = [
  { category: 'DESARROLLO', tag: '#Django', count: '1,2K publicaciones' },
  { category: 'IA & DATA', tag: '#MachineLearning', count: '846 publicaciones' },
  { category: 'DEVOPS', tag: '#Docker', count: '623 publicaciones' },
];

const jobs = [
  { title: 'Junior Python Developer', detail: 'Barcelona · Híbrido' },
  { title: 'Backend Developer', detail: 'Remoto · España' },
];

export default function HomePage() {
  const { theme, toggleTheme } = useOnlyDucksTheme();
  const [profileName, setProfileName] = useState('Tu perfil');
  const [profileAvatar, setProfileAvatar] = useState('');

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem('onlyducks:developer-profile:v1');
      if (!saved) return;
      const profile = JSON.parse(saved) as { displayName?: unknown; avatarDataUrl?: unknown };
      if (typeof profile.displayName === 'string' && profile.displayName.trim()) setProfileName(profile.displayName.trim());
      if (typeof profile.avatarDataUrl === 'string' && profile.avatarDataUrl.startsWith('data:image/')) setProfileAvatar(profile.avatarDataUrl);
    } catch {
      // Keep the default profile placeholder when local data is unavailable.
    }
  }, []);

  return (
    <main className={`od-social ${theme === 'dark' ? 'od-theme-dark' : 'od-theme-light'}`}>
      <header className="od-topbar">
        <Link className="od-brand" href="/" aria-label="OnlyDucks inicio">
          <span className="od-brand-mark">o</span><span>Only<em>Ducks</em></span>
        </Link>
        <nav className="od-topnav" aria-label="Navegación principal">
          <Link className="active" href="/">Inicio</Link>
          <Link href="/feed">Explorar</Link>
          <Link href="/roadmap">Aprender</Link>
        </nav>
        <div className="od-top-actions">
          <button className="od-theme-toggle" type="button" onClick={toggleTheme} aria-label={theme === 'light' ? 'Cambiar al tema oscuro' : 'Cambiar al tema claro'}>
            <span aria-hidden="true">{theme === 'light' ? '☾' : '☀'}</span>
            {theme === 'light' ? 'Modo oscuro' : 'Modo claro'}
          </button>
          <Link className="od-login" href="/profile">Entrar</Link>
          <Link className="od-join" href="/welcome">Crear cuenta</Link>
        </div>
      </header>

      <div className="od-layout">
        <aside className="od-left" aria-label="Menú lateral">
          <section className="od-sidebar-card od-intro-card">
            <p className="od-kicker">Tu feed profesional</p>
            <h2>Aprende siguiendo a expertos que sí hablan tu idioma.</h2>
            <p>Contenido, herramientas y consultas especializadas en un solo lugar.</p>
          </section>
          <nav className="od-sidebar-card od-menu" aria-label="Secciones">
            {navigation.map((item) => (
              <Link key={item.label} className={item.active ? 'active' : ''} href={item.href}>
                <span className="od-menu-icon" aria-hidden="true">{item.icon}</span>{item.label}
              </Link>
            ))}
          </nav>
          <section className="od-sidebar-card od-profile-card" aria-label="Mi perfil">
            <span className="od-profile-avatar" aria-label="Avatar de usuario">{profileAvatar ? <img src={profileAvatar} alt="" /> : profileName.slice(0, 2).toUpperCase()}</span>
            <div className="od-profile-meta"><strong>{profileName}</strong><span>Personaliza tu espacio</span></div>
            <Link className="od-profile-link" href="/profile" aria-label="Abrir mi perfil">Ver →</Link>
          </section>
          <section className="od-sidebar-card od-pro-card">
            <strong>OnlyDucks Pro</strong>
            <p>Más consultas IA, rutas avanzadas y herramientas para impulsar tu carrera.</p>
            <Link href="/welcome">Descubrir ventajas →</Link>
          </section>
        </aside>

        <section className="od-main" aria-labelledby="feed-title">
          <div className="od-feed-heading">
            <div><h1 id="feed-title">Tu feed profesional</h1><p>Ideas, conocimiento y oportunidades seleccionadas para ti.</p></div>
            <span className="od-filter">Para ti⌄</span>
          </div>
          <section className="od-composer" aria-label="Crear publicación">
            <div className="od-composer-top"><span className="od-avatar">TU</span><div className="od-composer-prompt">Comparte una idea o pregunta a la comunidad…</div></div>
            <div className="od-composer-actions"><span>▧ Publicación</span><span>▶ Recurso</span><span>✦ Preguntar a la IA</span></div>
          </section>
          <article className="od-post">
            <header className="od-post-head"><span className="od-avatar">DD</span><div className="od-post-author"><strong>DuckDev · Equipo editorial</strong><span>Contenido destacado · Ejemplo de preview</span></div><span className="od-post-more" aria-hidden="true">•••</span></header>
            <p className="od-post-copy">Aprender una tecnología nueva funciona mejor cuando conectas teoría, práctica y feedback. Explora una ruta, plantea tus dudas y convierte cada avance en un proyecto real.</p>
            <div className="od-post-visual" role="img" aria-label="Gráfico abstracto de aprendizaje y tecnología"><div className="od-visual-orbit">LEARN<br/>BUILD<br/>GROW</div></div>
            <div className="od-post-stats"><span>Contenido de muestra para la preview</span><span>Lectura · 3 min</span></div>
            <div className="od-post-actions"><span>♡ Me interesa</span><span>◯ Comentar</span><span>↗ Compartir</span></div>
          </article>
          <article className="od-post">
            <header className="od-post-head"><span className="od-avatar">AI</span><div className="od-post-author"><strong>Aprendizaje práctico</strong><span>Ruta recomendada · Ejemplo de preview</span></div><span className="od-post-more" aria-hidden="true">•••</span></header>
            <p className="od-post-copy">¿Trabajas con Python? Una buena siguiente etapa puede ser construir una API pequeña, añadir tests y documentar el despliegue. Puedes organizar los pasos en tu roadmap.</p>
            <div className="od-post-actions"><span>♡ Me interesa</span><span>◯ Comentar</span><Link href="/roadmap">Ver ruta →</Link></div>
          </article>
        </section>

        <aside className="od-right" aria-label="Información complementaria">
          <input className="od-search" type="search" placeholder="⌕ Buscar expertos o temas" aria-label="Buscar expertos o temas" />
          <section className="od-panel"><h2>♨ Trending ahora</h2>{trends.map((trend) => <div className="od-trend" key={trend.tag}><small>{trend.category}</small><strong>{trend.tag}</strong><span>{trend.count}</span></div>)}<Link className="od-panel-link" href="/feed">Explorar tendencias →</Link></section>
          <section className="od-panel"><h2>▣ Radar de empleo</h2>{jobs.map((job) => <div className="od-job" key={job.title}><strong>{job.title}</strong><span>{job.detail}</span></div>)}<Link className="od-panel-link" href="/feed">Ver radar completo →</Link></section>
          <section className="od-panel"><h2>✦ Sigue aprendiendo</h2><div className="od-trend"><strong>Tu próxima ruta</strong><span>Organiza objetivos y progreso en tu espacio de aprendizaje.</span></div><Link className="od-panel-link" href="/roadmap">Abrir mi roadmap →</Link></section>
        </aside>
      </div>

      <nav className="od-bottom-nav" aria-label="Navegación móvil">
        <Link href="/"><span>⌂</span>Inicio</Link><Link href="/feed"><span>⌕</span>Explorar</Link><Link href="/agent"><span>✦</span>Agente</Link><Link href="/roadmap"><span>▤</span>Aprender</Link><Link href="/profile"><span>◉</span>Perfil</Link>
      </nav>
    </main>
  );
}
