import { gsap } from 'gsap';

export type CameraPose = { x: number; y: number; scale: number };

/** [left %, top %, size px] for each drifting spore. */
const SPORES: ReadonlyArray<readonly [number, number, number]> = [
  [12, 64, 7], [23, 42, 5], [36, 74, 6], [47, 31, 4], [58, 68, 7], [66, 45, 5], [77, 72, 6], [86, 37, 4], [92, 60, 5],
];

/**
 * Markup for the opening shots: a paper veil with a sketch line, a highlight sheen,
 * drifting spores, film-frame marks, a skippable title sequence, and the film title.
 * The intro is intentionally skippable so the animation never traps a visitor.
 */
export function OpeningSequence({ onSkip }: { onSkip: () => void }) {
  return (
    <>
      <div className="opening" aria-label="Opening sequence">
        <div className="opening-frame" aria-hidden="true">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" fill="none">
            <path pathLength={1} d="M2 16V2H16 M84 2H98V16 M2 84V98H16 M84 98H98V84" />
            <path pathLength={1} className="opening-frame__ticks" d="M50 2V6 M2 50H6 M94 50H98 M50 94V98" />
          </svg>
        </div>
        <div className="opening-credit" aria-hidden="true"><span>EDOM / PORTFOLIO</span><i>STUDY NO. 001</i></div>
        <div className="opening__veil" aria-hidden="true">
          <svg className="opening__sketch" viewBox="0 0 640 400" fill="none">
            <path d="M70 290 C92 150 250 62 372 82 C500 104 566 196 584 290" pathLength={1} />
            <path d="M52 300 C220 268 430 262 600 304 C540 336 360 338 210 330 C130 326 78 318 52 300 Z" pathLength={1} />
          </svg>
        </div>
        <div className="opening__sheen" aria-hidden="true"><i /></div>
        <div className="opening__flare" aria-hidden="true" />
        {SPORES.map(([left, top, size], index) => (
          <i key={index} className="opening__spore" aria-hidden="true" style={{ left: `${left}%`, top: `${top}%`, width: size, height: size }} />
        ))}
        <button className="opening-skip" type="button" onClick={onSkip} aria-label="Skip the opening sequence and enter the story">SKIP INTRO <span>↗</span></button>
      </div>
      <h1 className="opening-title">
        <span className="opening-title__eyebrow">A SMALL STORY ABOUT BECOMING</span>
        <span className="ot-mask"><span>A curious mind,</span></span>
        <span className="ot-mask"><span>still becoming.</span></span>
        <svg className="opening-title__rule" viewBox="0 0 420 24" fill="none" aria-hidden="true">
          <path d="M4 16 C80 4 150 22 230 11 S370 8 416 14" pathLength={1} />
        </svg>
      </h1>
    </>
  );
}

/**
 * Time-based opening (about 7 seconds). Beats, in order:
 *  0.1  quiet paper, an outline is drawn, spores drift in
 *  2.0  the veil lifts on the cap close-up and a highlight crosses it
 *  3.4  anticipation: a tiny push-in
 *  4.1  the pull-back to the full figure, with overshoot and settle
 *  5.5  the title is revealed line by line, then underlined
 *  6.7  the scroll cue appears and the skip control leaves
 * It ends on the "wide" pose, which is exactly where the scroll-scrubbed prologue starts.
 * The opening is skippable by pointer, touch, or scroll. Call progress(1) to finish it.
 */
export function playOpening(camera: HTMLElement, start: CameraPose, wide: CameraPose, header?: HTMLElement | null): gsap.core.Timeline {
  return gsap.timeline({ defaults: { ease: 'power2.out' } })
    .set('.opening-title', { autoAlpha: 1 }, 0)
    .fromTo('.opening-frame path', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.25, ease: 'power2.inOut', stagger: 0.08 }, 0.02)
    .fromTo('.opening-credit', { autoAlpha: 0, y: -7 }, { autoAlpha: 0.9, y: 0, duration: 0.55, ease: 'power2.out' }, 0.55)
    .fromTo('.opening-skip', { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: 'power2.out' }, 0.75)
    .fromTo('.opening__sketch path', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut', stagger: 0.35 }, 0.1)
    .fromTo('.opening__spore', { autoAlpha: 0, y: 26 }, { autoAlpha: 0.85, y: -16, duration: 2.6, stagger: 0.14, ease: 'sine.out' }, 0.5)
    .to('.opening__veil', { autoAlpha: 0, duration: 1.1, ease: 'power1.inOut' }, 2)
    .fromTo('.opening__sheen i', { xPercent: -150 }, { xPercent: 450, duration: 1.4, ease: 'power2.inOut' }, 2.2)
    .to('.opening__spore', { y: '-=40', x: '+=18', duration: 3, stagger: 0.1, ease: 'sine.inOut' }, 2.4)
    .to(camera, { scale: start.scale * 1.045, rotation: 0.34, duration: 0.7, ease: 'power2.in' }, 3.4)
    .to(camera, { x: wide.x, y: wide.y, scale: wide.scale, rotation: 0, duration: 2.1, ease: 'back.out(0.9)' }, 4.1)
    .fromTo('.opening__flare', { autoAlpha: 0, scale: 0.92 }, { autoAlpha: 0.4, scale: 1.08, duration: 0.55, yoyo: true, repeat: 1, ease: 'sine.inOut' }, 2.55)
    .fromTo('.opening-title__eyebrow', { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.45, ease: 'power2.out' }, 5.25)
    .fromTo('.ot-mask > span', { yPercent: 115 }, { yPercent: 0, duration: 0.9, stagger: 0.2, ease: 'power3.out' }, 5.5)
    .fromTo('.opening-title__rule path', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.9, ease: 'power2.inOut' }, 6.1)
    .to('.scroll-prompt', { autoAlpha: 1, duration: 0.6 }, 6.7)
    .to('.opening-skip', { autoAlpha: 0, y: -6, duration: 0.3, ease: 'power1.in' }, 6.65)
    .fromTo(header ?? '.site-header', { autoAlpha: 0, y: -14, pointerEvents: 'none' }, { autoAlpha: 1, y: 0, pointerEvents: 'auto', duration: 0.7, ease: 'power3.out', immediateRender: true }, 6.05)
    .to('.opening-frame, .opening-credit', { autoAlpha: 0, duration: 0.55, ease: 'power1.out' }, 6.0);
}
