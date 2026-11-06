import { CHAPTERS, LINKS } from '../data/story';
import type { RefObject } from 'react';

export function SiteHeader({ onNavigate, onHome, activeChapter, headerRef }: { onNavigate: (index: number) => void; onHome: () => void; activeChapter: number; headerRef: RefObject<HTMLElement | null> }) {
  const chapter = CHAPTERS[activeChapter] ?? CHAPTERS[0];
  return (
    <header ref={headerRef} className="site-header">
      <a className="wordmark" href="#top" onClick={(event) => { event.preventDefault(); onHome(); }} aria-label="Edom, return to the opening frame">
        <span className="wordmark-flower" aria-hidden="true">✿</span>
        <span>EDOM<span className="wordmark-dot">.</span></span>
      </a>
      <div className="header-center">
        <span className="header-kicker">SOFTWARE ENGINEERING</span>
        <span className="header-divider" />
        <span className="header-current" aria-live="polite">{chapter.ordinal} / 06 · {chapter.name.toUpperCase()}</span>
      </div>
      <nav className="header-actions" aria-label="Main navigation">
        <button type="button" onClick={() => onNavigate(2)}>WORK <span>↘</span></button>
        <a href={LINKS.linkedin} target="_blank" rel="noreferrer">LINKEDIN <span>↗</span></a>
        <a className="header-contact" href={LINKS.email}>SAY HELLO <span>↗</span></a>
      </nav>
    </header>
  );
}
