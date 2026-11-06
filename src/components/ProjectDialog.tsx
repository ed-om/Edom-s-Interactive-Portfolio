import { useEffect, useRef } from 'react';
import type { Project } from '../data/story';
import { LINKS } from '../data/story';

export function ProjectDialog({ project, onClose }: { project: Project | null; onClose: () => void }) {
  const dialogRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!project) return;

    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.classList.add('dialog-open');
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !dialogRef.current) return;

      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not(:disabled), [tabindex]:not([tabindex="-1"])',
      )).filter((element) => element.getAttribute('aria-hidden') !== 'true');
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.classList.remove('dialog-open');
      if (previouslyFocused?.isConnected) previouslyFocused.focus();
    };
  }, [project, onClose]);

  if (!project) return null;
  return (
    <div className="dialog-scrim" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section ref={dialogRef} className="project-dialog" role="dialog" aria-modal="true" aria-labelledby="project-dialog-title" aria-describedby="project-dialog-summary" tabIndex={-1}>
        <div className="dialog-topline"><span>PORTFOLIO / {project.number}</span><button ref={closeRef} type="button" className="dialog-close" onClick={onClose} aria-label="Close project details">×</button></div>
        <div className="dialog-stamp" style={{ backgroundColor: project.color }}>{project.number}</div>
        <p className="dialog-kind">{project.kind}</p>
        <h2 id="project-dialog-title">{project.name}<span>.</span></h2>
        <p id="project-dialog-summary" className="dialog-lede">{project.summary}</p>
        <div className="dialog-details">
          <article><span>THE QUESTION</span><p>{project.problem}</p></article>
          <article><span>THE APPROACH</span><p>{project.approach}</p></article>
          <article><span>WHAT IT TAUGHT ME</span><p>{project.takeaway}</p></article>
        </div>
        <div className="dialog-stack"><span>TOOLS IN THE SOIL</span><div>{project.stack.map((item) => <b key={item}>{item}</b>)}</div></div>
        <div className="dialog-bottom"><span className="status-dot" />{project.status}<a href={LINKS.github} target="_blank" rel="noreferrer">MY GITHUB ↗</a></div>
      </section>
    </div>
  );
}
