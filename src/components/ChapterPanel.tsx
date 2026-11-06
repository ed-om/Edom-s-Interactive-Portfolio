import type { CSSProperties } from 'react';
import { useState } from 'react';
import type { Chapter, Project } from '../data/story';
import { CHAPTERS, LINKS, PROJECTS, SKILL_GROUPS } from '../data/story';
import { HandArrow, TinyStamp } from './GardenArt';

function ProjectSpecimens({ onOpen }: { onOpen: (project: Project) => void }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const open = PROJECTS.find((project) => project.id === openId) ?? null;
  const tint = (project: Project) => ({ '--specimen-color': project.color }) as CSSProperties & { '--specimen-color': string };
  return (
    <div className={`specimen-wrap${open ? ' has-open' : ''}`}>
      <div className="specimen-grid" role="group" aria-label="Projects">
        {PROJECTS.map((project) => (
          <button className="specimen-card" key={project.id} type="button" aria-expanded={openId === project.id} aria-controls="case-file" onClick={() => setOpenId(openId === project.id ? null : project.id)} style={tint(project)}>
            <span className="specimen-number">{project.number} <i>{openId === project.id ? '–' : '+'}</i></span>
            <strong>{project.name}</strong>
            <small>{project.kind}</small>
            <span className="specimen-underline" />
          </button>
        ))}
      </div>
      <div id="case-file" className="case-file-slot" aria-live="polite">
      {open && (
        <section className="case-file" key={open.id} aria-label={`${open.name} case file`} style={tint(open)}>
          <p className="case-label">case file {open.number} · {open.status}</p>
          <div className="case-fold">
            <div className="case-cols">
              <article><span>THE QUESTION</span><p>{open.problem}</p></article>
              <article><span>THE APPROACH</span><p>{open.approach}</p></article>
            </div>
            <ol className="case-diagram" aria-label="Technology stack">{open.stack.map((item) => <li key={item}>{item}</li>)}</ol>
            <p className="case-lesson"><span>what it taught me</span>{open.takeaway}</p>
            <div className="case-actions">
              <button type="button" onClick={() => onOpen(open)}>open the full file</button>
              <button type="button" onClick={() => setOpenId(null)}>fold away</button>
            </div>
          </div>
        </section>
      )}
      </div>
    </div>
  );
}

function SkillGarden() {
  return (
    <div className="skill-garden">
      {SKILL_GROUPS.map((group, index) => (
        <div className="skill-row" key={group.name}>
          <span className={`skill-seed skill-seed--${index + 1}`} aria-hidden="true">{['✳', '⌘', '↗', '⌁', '◌'][index]}</span>
          <div className="skill-row-content">
            <b>{group.name}</b>
            <p>{group.items.map((item) => <span key={item}>{item}</span>)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function JourneyNotes() {
  return (
    <div className="journey-notes">
      <article className="journey-note">
        <span className="journey-year">01 / FOUNDATIONS</span>
        <b>AASTU</b>
        <p>Software engineering, core concepts, and the discipline of learning to reason about systems.</p>
        <i className="note-sprig" aria-hidden="true">✿</i>
      </article>
      <article className="journey-note journey-note--lavender">
        <span className="journey-year">02 / EXPOSURE</span>
        <b>INSA Summer Camp</b>
        <p>Software development experience with a closer look at networking and deeper technical work.</p>
        <i className="note-sprig" aria-hidden="true">✳</i>
      </article>
      <article className="journey-note journey-note--yellow">
        <span className="journey-year">03 / COMMUNITY</span>
        <b>GDG'S DSA track</b>
        <p>Learning in public, solving problems, and thinking about how people learn at different paces.</p>
        <i className="note-sprig" aria-hidden="true">⌁</i>
      </article>
      <article className="journey-note journey-note--cloud">
        <span className="journey-year">04 / CURRENTLY ENROLLED</span>
        <b>AWS SBG · AASTU</b>
        <p>Cloud and DevOps track — building my understanding of cloud infrastructure, deployment, and the systems behind shipping software.</p>
        <i className="note-sprig" aria-hidden="true">☁</i>
      </article>
    </div>
  );
}

function ConnectPanel() {
  return (
    <>
    <div className="next-topics" role="group" aria-label="Topics I am exploring"><span>DEV TOOLS</span><span>SYSTEMS</span><span>AI / ML</span><span>GO / CLOUD</span><span>HOW THINGS WORK</span></div>
    <div className="connect-grid">
      <a href={LINKS.github} target="_blank" rel="noreferrer"><span className="connect-icon">⌘</span><span><b>GitHub</b><small>Code & experiments</small></span><i>↗</i></a>
      <a href={LINKS.linkedin} target="_blank" rel="noreferrer"><span className="connect-icon">in</span><span><b>LinkedIn</b><small>Professional profile</small></span><i>↗</i></a>
      <a href={LINKS.email}><span className="connect-icon">✉</span><span><b>Email</b><small>{LINKS.emailText}</small></span><i>↗</i></a>
    </div>
    </>
  );
}

export function ChapterPanel({ chapter, index, isActive, onOpenProject, cardRef }: { chapter: Chapter; index: number; isActive: boolean; onOpenProject: (project: Project) => void; cardRef?: (node: HTMLElement | null) => void }) {
  const accentByChapter: Record<Chapter['id'], string> = { cap: '#b65870', person: '#9d7caf', build: '#c49a49', tools: '#718c75', journey: '#9682b3', next: '#b65870' };
  return (
    <article ref={cardRef} className={`chapter-card chapter-card--${chapter.panelSide} chapter-card--${chapter.id}${isActive ? ' is-active' : ''}`} data-panel={index} aria-label={`Chapter ${chapter.ordinal}: ${chapter.name}`} style={{ '--card-accent': accentByChapter[chapter.id] } as CSSProperties & { '--card-accent': string }}>
      <span className="card-tape card-tape--one" aria-hidden="true" />
      <span className="card-tape card-tape--two" aria-hidden="true" />
      <div className="chapter-card-inner">
        <div className="panel-topline">
          <span className="panel-number">{chapter.ordinal}<i>/06</i></span>
          <span className="panel-type">{chapter.bodyPart}</span>
          <span className="panel-glyph" aria-hidden="true">{['✳', '✿', '◈', '⌁', '✧', '↗'][index]}</span>
        </div>
        <div className="chapter-heading-group">
          <p className="chapter-eyebrow">PORTFOLIO {chapter.ordinal} <span>—</span> {chapter.name}</p>
          {index === 0 && <span className="scribble-label scribble-label--cap">the first question</span>}
          <h2 className="chapter-heading"><span>{chapter.title}</span><em>{chapter.accent}</em></h2>
        </div>
        <p className="chapter-paragraph">{chapter.paragraph}</p>

        {chapter.id === 'cap' && (
          <div className="starter-note">
            <span className="starter-icon">?</span>
            <div><b>Current method</b><p>Understand the idea. Then build from it.</p></div>
          </div>
        )}
        {chapter.id === 'person' && (
          <div className="trait-stamps"><TinyStamp>CURIOUS</TinyStamp><TinyStamp>OBSERVANT</TinyStamp><TinyStamp>STILL LEARNING</TinyStamp></div>
        )}
        {chapter.id === 'build' && <ProjectSpecimens onOpen={onOpenProject} />}
        {chapter.id === 'tools' && <SkillGarden />}
        {chapter.id === 'journey' && <JourneyNotes />}
        {chapter.id === 'next' && <ConnectPanel />}

        <div className="panel-footnote">
          <HandArrow className="panel-arrow" />
          <p>{chapter.marginNote}</p>
        </div>
        <div className="panel-registration" aria-hidden="true"><span>✳</span><span>✳</span><span>✳</span></div>
      </div>
    </article>
  );
}

export function ChapterRail({ active, onNavigate }: { active: number; onNavigate: (index: number) => void }) {
  return (
    <nav className="chapter-rail" aria-label="Story chapters">
      <div className="rail-caption">SCROLL TO GROW</div>
      <div className="rail-track"><span className="rail-progress" style={{ transform: `scaleY(${active / Math.max(1, CHAPTERS.length - 1)})` }} /></div>
      <div className="rail-items">
        {CHAPTERS.map((chapter, index) => (
          <button key={chapter.id} className={active === index ? 'is-active' : ''} onClick={() => onNavigate(index)} type="button" aria-label={`Go to ${chapter.name}`} aria-current={active === index ? 'step' : undefined}>
            <span className="rail-number">{chapter.ordinal}</span><span className="rail-name">{chapter.name}</span><i />
          </button>
        ))}
      </div>
      <div className="rail-bottom">EDOM’S<br/>PORTFOLIO</div>
    </nav>
  );
}
