'use client';

import { useEffect, useState } from 'react';
import { useOnlyDucksTheme } from '../components/theme-provider';
import Link from 'next/link';
import { FirstVisitTour } from '../components/first-visit-tour';

const navigation = [
  { icon: '⌂', label: 'Inicio', href: '/', active: true },
  { icon: '➜', label: 'Empieza aquí', href: '/welcome' },
  { icon: '◎', label: 'Mentores', href: '/mentors' },
  { icon: '✦', label: 'Agente', href: '/agent' },
  { icon: '▣', label: 'Sandbox', href: '/sandbox' },
  { icon: '▤', label: 'Roadmap', href: '/roadmap' },
  { icon: '◉', label: 'Perfil', href: '/profile' },
  { icon: '⌕', label: 'Oportunidades', href: '/feed' },
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
  const [searchQuery, setSearchQuery] = useState('');
  const normalizedQuery = searchQuery.trim().toLocaleLowerCase('es');
  const visibleTrends = trends.filter((item) => `${item.category} ${item.tag} ${item.count}`.toLocaleLowerCase('es').includes(normalizedQuery));
  const visibleJobs = jobs.filter((item) => `${item.title} ${item.detail}`.toLocaleLowerCase('es').includes(normalizedQuery));

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
          <Link className="active" href="/">Inicio</Link><Link href="/welcome">Empieza aquí</Link><Link href="/mentors">Mentores</Link><Link href="/agent">Agente</Link><Link href="/sandbox">Sandbox</Link><Link href="/roadmap">Roadmap</Link><Link href="/profile">Perfil</Link><Link href="/feed">Oportunidades</Link>
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
      <section className="od-home-intro" aria-labelledby="home-intro-title">
        <p className="od-home-eyebrow">TU SIGUIENTE PASO EMPIEZA AQUÍ</p>
        <h1 id="home-intro-title">Aprende, practica y <span>avanza</span> en tu carrera.</h1>
        <p>OnlyDucks conecta orientación de expertos, aprendizaje práctico y oportunidades profesionales para ayudarte a convertir tus objetivos en pasos concretos.</p>
        <div className="od-home-actions"><Link className="od-home-primary" href="/welcome">Descubre cómo funciona <span aria-hidden="true">→</span></Link><FirstVisitTour /></div>
        <div className="od-home-pillars"><article><strong>01 · Aprende</strong><span>Encuentra el enfoque y la orientación que necesitas.</span></article><article><strong>02 · Practica</strong><span>Organiza objetivos y convierte ideas en proyectos.</span></article><article><strong>03 · Conecta</strong><span>Explora recursos y oportunidades para tu siguiente paso.</span></article></div>
      </section>
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
          <section className="od-composer" aria-label="Crear publicación — vista previa">
            <div className="od-composer-top"><span className="od-avatar">TU</span><div className="od-composer-prompt">Comparte una idea o pregunta a la comunidad…</div></div>
            <div className="od-composer-actions"><span>▧ Publicación</span><span>▶ Recurso</span><span>✦ Preguntar a la IA</span></div><p className="od-demo-note">Compositor de vista previa · La publicación aún no está conectada</p>
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
          <input className="od-search" type="search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="⌕ Buscar temas u oportunidades" aria-label="Buscar temas u oportunidades" />
          <section className="od-panel"><h2>♨ Trending ahora</h2>{visibleTrends.length ? visibleTrends.map((trend) => <div className="od-trend" key={trend.tag}><small>{trend.category}</small><strong>{trend.tag}</strong><span>{trend.count}</span></div>) : <p className="od-empty-result">No hay temas que coincidan.</p>}<Link className="od-panel-link" href="/feed">Explorar tendencias →</Link></section>
          <section className="od-panel"><h2>▣ Radar de empleo</h2>{visibleJobs.length ? visibleJobs.map((job) => <div className="od-job" key={job.title}><strong>{job.title}</strong><span>{job.detail}</span></div>) : <p className="od-empty-result">No hay oportunidades que coincidan.</p>}<Link className="od-panel-link" href="/feed">Ver radar completo →</Link></section>
          <section className="od-panel"><h2>✦ Sigue aprendiendo</h2><div className="od-trend"><strong>Tu próxima ruta</strong><span>Organiza objetivos y progreso en tu espacio de aprendizaje.</span></div><Link className="od-panel-link" href="/roadmap">Abrir mi roadmap →</Link></section>
        </aside>
      </div>

      <nav className="od-bottom-nav" aria-label="Navegación móvil"><Link href="/"><span>⌂</span>Inicio</Link><Link href="/welcome"><span>➜</span>Empezar</Link><Link href="/mentors"><span>◎</span>Mentores</Link><Link href="/roadmap"><span>▤</span>Roadmap</Link><Link href="/profile"><span>◉</span>Perfil</Link></nav>
      <footer className="od-site-footer"><Link href="/" className="od-footer-brand">OnlyDucks</Link><span>Aprende · Practica · Conecta</span><Link href="/welcome">Cómo funciona →</Link></footer>
    </main>
  );
}
