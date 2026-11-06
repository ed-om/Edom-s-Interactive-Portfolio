import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import avatarUrl from '../assets/edom-avatar.webp';
import { CHAPTERS } from '../data/story';
import type { Project } from '../data/story';
import { ChapterPanel, ChapterRail } from './ChapterPanel';
import { GardenArt, PaperTexture } from './GardenArt';
import { OpeningSequence, playOpening } from './OpeningSequence';
import { ParallaxLayer, SceneOverlay } from './SceneOverlay';
import { ProjectDialog } from './ProjectDialog';
import { SiteHeader } from './SiteHeader';

gsap.registerPlugin(ScrollTrigger, useGSAP);

type CameraFrame = {
  x: number; y: number; scale: number;
  targetX: number; targetY: number;
  ringWidth: number; ringHeight: number;
};

/**
 * One place decides how the stage is composed, so CSS and camera maths can never disagree:
 *  mobile - phone widths; copy sits in a bottom sheet under the figure
 *  stack  - narrow or tall desktop windows; one centred card under the figure
 *  side   - landscape desktop windows; the figure and the card share the stage, alternating sides
 */
export type Layout = 'mobile' | 'stack' | 'side';
export const layoutFor = (width: number, height: number): Layout => (width <= 800 ? 'mobile' : width >= 1000 && width / height >= 1.3 ? 'side' : 'stack');
/** Scales card typography and spacing with the window, so short laptop screens are fitted rather than clipped. */
export const uiScale = (width: number, height: number) => Math.max(0.9, Math.min(1.12, Math.min(width / 1440, height / 840)));

function cameraFrames(width: number, height: number, viewportWidth: number, viewportHeight: number, layout: Layout): CameraFrame[] {
  const ringSizes = [[235, 170], [185, 205], [210, 235], [190, 130], [205, 225], [250, 125]];
  return CHAPTERS.map((chapter, index) => {
    const scale = chapter.scale * (layout === 'mobile' ? 0.94 : layout === 'stack' ? 0.9 : 1);
    const targetX = layout === 'side' ? (chapter.panelSide === 'left' ? 0.69 : 0.31) : 0.5;
    const targetY = layout === 'mobile' ? 0.31 : layout === 'stack' ? 0.29 : chapter.targetY;
    const ringFactor = layout === 'mobile' ? 0.68 : layout === 'stack' ? Math.min(0.78, viewportWidth / 1500) : Math.min(1, viewportWidth / 1280, viewportHeight / 760);
    return {
      scale,
      x: (targetX - 0.5) * viewportWidth - (chapter.focus.x - 0.5) * width * scale,
      y: (targetY - 0.5) * viewportHeight - (chapter.focus.y - 0.5) * height * scale,
      targetX: targetX * viewportWidth,
      targetY: targetY * viewportHeight,
      ringWidth: ringSizes[index][0] * ringFactor,
      ringHeight: ringSizes[index][1] * ringFactor,
    };
  });
}

/** Full-figure framing used by the title shot; the scroll prologue pulls in from here to the cap. */
function wideFrame(cameraHeight: number, viewportWidth: number, viewportHeight: number, layout: Layout): CameraFrame {
  const scale = (viewportHeight * (layout === 'mobile' ? 0.56 : layout === 'stack' ? 0.56 : 0.8)) / Math.max(1, cameraHeight);
  const targetX = layout === 'side' ? 0.66 : 0.5;
  const targetY = layout === 'mobile' ? 0.62 : layout === 'stack' ? 0.63 : 0.52;
  return { scale, x: (targetX - 0.5) * viewportWidth, y: (targetY - 0.5) * viewportHeight, targetX: targetX * viewportWidth, targetY: targetY * viewportHeight, ringWidth: 0, ringHeight: 0 };
}

/** Scroll units before chapter 1: the pull-in from the title shot to the mushroom cap. */
const PROLOGUE = 1;
/** Extra scroll after the last arrival, used for the footprint trail and the final camera drift. */
const END_HOLD = 0.6;
const TOTAL = PROLOGUE + CHAPTERS.length - 1 + END_HOLD;

export function StoryExperience({ onEnd }: { onEnd: () => void }) {
  const storyRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<HTMLDivElement>(null);
  const focusRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<Array<HTMLElement | null>>([]);
  const progressRef = useRef<HTMLDivElement>(null);
  const skipIntroRef = useRef<(() => void) | null>(null);
  const [activeChapter, setActiveChapter] = useState(0);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const closeProject = useCallback(() => setSelectedProject(null), []);
  const skipOpeningFromButton = useCallback(() => { skipIntroRef.current?.(); }, []);

  // Keep the layout mode and UI scale in sync with the window before paint (CSS reads data-layout and --ui).
  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const apply = () => {
      stage.dataset.layout = layoutFor(window.innerWidth, window.innerHeight);
      stage.style.setProperty('--ui', uiScale(window.innerWidth, window.innerHeight).toFixed(3));
    };
    apply();
    window.addEventListener('resize', apply);
    window.addEventListener('orientationchange', apply);
    return () => { window.removeEventListener('resize', apply); window.removeEventListener('orientationchange', apply); };
  }, []);

  useEffect(() => {
    let fired = false;
    const checkEnd = () => {
      const remaining = document.documentElement.scrollHeight - (window.scrollY + window.innerHeight);
      if (remaining > 420) fired = false; // scrolling back up re-arms the ending after the visitor chose to stay
      if (fired) return;
      if (remaining < 28 && window.scrollY > window.innerHeight) { fired = true; onEnd(); }
    };
    window.addEventListener('scroll', checkEnd, { passive: true });
    return () => window.removeEventListener('scroll', checkEnd);
  }, [onEnd]);

  const goToChapter = useCallback((index: number) => {
    const section = storyRef.current;
    if (!section) return;
    const distance = Math.max(0, section.offsetHeight - window.innerHeight);
    const target = section.getBoundingClientRect().top + window.scrollY + distance * ((index + 1) / TOTAL);
    window.scrollTo({ top: target, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }, []);
  const goHome = useCallback(() => {
    const section = storyRef.current;
    if (!section) return;
    window.scrollTo({ top: section.getBoundingClientRect().top + window.scrollY, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }, []);

  useGSAP(() => {
    const section = storyRef.current;
    const stage = stageRef.current;
    const camera = cameraRef.current;
    const focus = focusRef.current;
    if (!section || !stage || !camera || !focus) return;

    const media = gsap.matchMedia();
    // matchMedia only runs this callback when at least one condition matches, so the conditions must
    // cover every case (phone, desktop, reduced motion). With only "mobile" and "reduce", a normal
    // desktop matched nothing and no animation, opening or camera was ever created.
    media.add({
      mobile: '(max-width: 800px) and (prefers-reduced-motion: no-preference)',
      desktop: '(min-width: 801px) and (prefers-reduced-motion: no-preference)',
      reduce: '(prefers-reduced-motion: reduce)',
    }, (context) => {
      const conditions = context.conditions as { mobile: boolean; desktop: boolean; reduce: boolean };
      const reduced = conditions.reduce;
      const mobile = conditions.mobile || (reduced && window.innerWidth <= 800);
      const cameraBox = () => {
        const width = camera.offsetWidth || Math.min(window.innerWidth * (mobile ? 0.88 : 0.4), mobile ? 420 : 680);
        const height = camera.offsetHeight || width * (1771 / 1204);
        return { width, height };
      };
      const getFrames = () => {
        const box = cameraBox();
        return cameraFrames(box.width, box.height, window.innerWidth, window.innerHeight, layoutFor(window.innerWidth, window.innerHeight));
      };
      const getWide = () => {
        const box = cameraBox();
        return wideFrame(box.height, window.innerWidth, window.innerHeight, layoutFor(window.innerWidth, window.innerHeight));
      };
      const panels = panelRefs.current.filter((panel): panel is HTMLElement => Boolean(panel));

      if (reduced) {
        // In reduced-motion mode, show the whole character and present chapters as a readable
        // document below it. Never stack side-positioned cards over one another.
        gsap.set(camera, { xPercent: -50, yPercent: -50, x: 0, y: 0, scale: 1, rotation: 0, clearProps: 'transform' });
        gsap.set(focus, { autoAlpha: 0 });
        gsap.set(panels, { autoAlpha: 1, y: 0, rotation: 0, clearProps: 'transform' });
        gsap.set('.opening, .opening-title, .scroll-prompt', { autoAlpha: 0, pointerEvents: 'none' });
        if (headerRef.current) gsap.set(headerRef.current, { autoAlpha: 1, y: 0, pointerEvents: 'auto' });
        return () => undefined;
      }

      stage.dataset.motion = 'on';
      stage.dataset.intro = 'playing';
      stage.dataset.phase = 'title';
      // Curiosity light: a soft glow that follows the pointer (skipped on touch devices by CSS).
      gsap.set('.stage-light', { x: window.innerWidth * 0.6, y: window.innerHeight * 0.4 });
      const lightX = gsap.quickTo('.stage-light', 'x', { duration: 0.9, ease: 'power3.out' });
      const lightY = gsap.quickTo('.stage-light', 'y', { duration: 0.9, ease: 'power3.out' });
      const onPointer = (event: PointerEvent) => { lightX(event.clientX); lightY(event.clientY); };
      window.addEventListener('pointermove', onPointer, { passive: true });

      const initial = getFrames()[0];
      gsap.set(camera, { xPercent: -50, yPercent: -50, x: initial.x, y: initial.y, scale: initial.scale, rotation: 0, transformOrigin: '50% 50%' });
      gsap.set(focus, { xPercent: -50, yPercent: -50, x: initial.targetX, y: initial.targetY, width: initial.ringWidth, height: initial.ringHeight, autoAlpha: 0, rotation: -12, transformOrigin: '50% 50%' });
      gsap.set('.scroll-prompt', { autoAlpha: 0 });
      const opening = playOpening(camera, initial, getWide(), headerRef.current);
      if (progressRef.current) gsap.set(progressRef.current, { scaleX: 0, transformOrigin: 'left center' });

      // Micro-movements: the figure breathes, blinks now and then, and spores lean with scroll velocity.
      const sporeX = gsap.quickTo('.spore-field', 'x', { duration: 0.7, ease: 'power3.out' });
      gsap.to('.avatar-image', { scaleY: 1.006, transformOrigin: '50% 100%', duration: 3.2, yoyo: true, repeat: -1, ease: 'sine.inOut' });
      gsap.timeline({ repeat: -1, repeatDelay: 3.4 }).to('.blink', { autoAlpha: 1, duration: 0.05 }).to('.blink', { autoAlpha: 0, duration: 0.07 }, '+=0.09');
      // Parallax: far layers travel a fraction of the camera's distance, the near foliage a little more than it.
      const LAYERS: Array<[string, number]> = [['.parallax--far', 0.1], ['.parallax--mid', 0.22], ['.parallax--near', 1.12]];
      LAYERS.forEach(([selector, k]) => gsap.set(selector, { x: getWide().x * k, y: getWide().y * k }));

      const timeline = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1.05,
          invalidateOnRefresh: true,
          onScrubComplete: () => sporeX(0),
          onUpdate: (self) => {
            sporeX(gsap.utils.clamp(-46, 46, self.getVelocity() / -70));
            // The chapter card stays away until the camera is nearly on the cap, so it never collides with the title shot.
            stage.dataset.phase = self.progress * TOTAL < 0.7 ? 'title' : 'story';
            const next = Math.max(0, Math.min(CHAPTERS.length - 1, Math.round(self.progress * TOTAL - 1)));
            setActiveChapter((current) => current === next ? current : next);
          },
        },
      });

      // The timed opening and the scroll timeline must never compete for the same camera.
      // Suspend the scroll trigger, reset the camera to the cap close-up, then hand off at the wide shot.
      timeline.scrollTrigger?.disable(false);
      gsap.set(camera, { xPercent: -50, yPercent: -50, x: initial.x, y: initial.y, scale: initial.scale, rotation: 0, transformOrigin: '50% 50%' });

      // Prologue: the camera leaves the title shot and moves into the cap; opening props fall away.
      timeline.fromTo(camera,
        { x: () => getWide().x, y: () => getWide().y, scale: () => getWide().scale },
        { x: () => getFrames()[0].x, y: () => getFrames()[0].y, scale: () => getFrames()[0].scale, duration: PROLOGUE, ease: 'power2.inOut', immediateRender: false }, 0);
      timeline.to('.opening-title, .opening__spore, .scroll-prompt', { autoAlpha: 0, duration: 0.38, ease: 'power1.in' }, 0.12);
      timeline.to(focus, { autoAlpha: 0.72, duration: 0.3 }, 0.7);

      LAYERS.forEach(([selector, k]) => {
        timeline.fromTo(selector, { x: () => getWide().x * k, y: () => getWide().y * k }, { x: () => getFrames()[0].x * k, y: () => getFrames()[0].y * k, duration: PROLOGUE, ease: 'power2.inOut', immediateRender: false }, 0);
        CHAPTERS.forEach((_, i) => {
          if (i > 0) timeline.to(selector, { x: () => getFrames()[i].x * k, y: () => getFrames()[i].y * k, duration: 1, ease: 'back.inOut(0.5)' }, i - 1 + PROLOGUE);
        });
      });

      // Scene overlays, each revealed as the camera arrives and put away as it leaves.
      const hideAt = (selector: string, position: number) => timeline.to(selector, { autoAlpha: 0, duration: 0.2, ease: 'power1.in' }, position);
      timeline.fromTo('.annot-line', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.5, stagger: 0.1, ease: 'power1.out', immediateRender: false }, 3.85);
      timeline.fromTo('.annot', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, stagger: 0.1, immediateRender: false }, 3.9);
      hideAt('.annot', 4.79);
      timeline.fromTo('.stitch-reveal', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.8, ease: 'none', immediateRender: false }, 4.85);
      timeline.fromTo('.milestone', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25, stagger: 0.22, immediateRender: false }, 4.95);
      hideAt('.stitch', 5.79);
      timeline.fromTo('.print', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.15, stagger: 0.08, immediateRender: false }, 5.75);
      timeline.fromTo('.print-note', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25, immediateRender: false }, 6.35);
      timeline.to(camera, { x: () => getFrames()[CHAPTERS.length - 1].x - window.innerWidth * (mobile ? 0.12 : 0.22), duration: END_HOLD, ease: 'power1.inOut' }, PROLOGUE + CHAPTERS.length - 1);

      CHAPTERS.forEach((chapter, index) => {
        const frameAt = () => getFrames()[index];
        if (index > 0) {
          timeline.to(camera, {
            x: () => frameAt().x,
            y: () => frameAt().y,
            scale: () => frameAt().scale,
            duration: 1,
            rotation: index % 2 === 0 ? 0.18 : -0.18,
            ease: 'back.inOut(0.5)',
          }, index - 1 + PROLOGUE);
          timeline.to(focus, {
            x: () => frameAt().targetX,
            y: () => frameAt().targetY,
            width: () => frameAt().ringWidth,
            height: () => frameAt().ringHeight,
            rotation: index % 2 === 0 ? 7 : -9,
            autoAlpha: 0.65,
            duration: 1,
            ease: 'power1.inOut',
          }, index - 1 + PROLOGUE);
          timeline.to(stage, { backgroundColor: chapter.tone, duration: 0.86, ease: 'none' }, index - 1 + PROLOGUE);
          timeline.to('.color-wash--one', { rotate: index % 2 ? -13 : 12, scale: index % 2 ? 1.08 : 0.92, duration: 1 }, index - 1 + PROLOGUE);
          timeline.to('.color-wash--two', { xPercent: index % 2 ? 8 : -9, yPercent: index % 2 ? -5 : 6, duration: 1 }, index - 1 + PROLOGUE);
        }
      });

      timeline.to('.draw-line', { strokeDashoffset: 0, duration: 0.6, stagger: 0.035, ease: 'power1.out' }, 0.06);
      timeline.to('.spore-field', { y: -22, rotate: 11, duration: TOTAL, ease: 'none' }, 0);
      if (progressRef.current) timeline.to(progressRef.current, { scaleX: 1, duration: TOTAL, ease: 'none' }, 0);
      gsap.to('.spore-field i', { y: -7, rotate: 13, duration: 2.4, yoyo: true, repeat: -1, ease: 'sine.inOut', stagger: 0.18 });

      // Release the scroll choreography only after the full animation timeline exists. This
      // prevents the opening movie and the scroll camera from writing different poses at once.
      let introResolved = false;
      const finishOpening = () => {
        if (introResolved) return;
        introResolved = true;
        opening.pause();
        opening.progress(1);
        stage.dataset.intro = 'done';
        const wide = getWide();
        gsap.set(camera, { xPercent: -50, yPercent: -50, x: wide.x, y: wide.y, scale: wide.scale, rotation: 0, transformOrigin: '50% 50%' });
        gsap.set('.opening__veil', { autoAlpha: 0 });
        gsap.set('.opening-title', { autoAlpha: 1 });
        gsap.set('.opening-frame, .opening-credit', { autoAlpha: 0 });
        gsap.set('.opening-skip', { autoAlpha: 0, y: -6, pointerEvents: 'none' });
        gsap.set('.scroll-prompt', { autoAlpha: 1 });
        if (headerRef.current) {
          gsap.set(headerRef.current, { autoAlpha: 1, y: 0, pointerEvents: 'auto' });
          if (document.activeElement instanceof HTMLElement && document.activeElement.classList.contains('opening-skip')) {
            headerRef.current.querySelector<HTMLAnchorElement>('.wordmark')?.focus({ preventScroll: true });
          }
        }
        timeline.scrollTrigger?.enable(false);
        timeline.scrollTrigger?.update();
      };
      const skipOpening = () => finishOpening();
      skipIntroRef.current = skipOpening;
      const skipOnKey = (event: KeyboardEvent) => {
        if (!introResolved && ['ArrowDown', 'PageDown', 'End', ' ', 'Escape'].includes(event.key)) finishOpening();
      };
      opening.eventCallback('onComplete', finishOpening);
      // Never leave the paper veil up if something stalls the opening.
      const watchdog = window.setTimeout(finishOpening, 12000);
      window.addEventListener('wheel', skipOpening, { once: true, passive: true });
      window.addEventListener('touchstart', skipOpening, { once: true, passive: true });
      window.addEventListener('scroll', skipOpening, { once: true, passive: true });
      window.addEventListener('pointerdown', skipOpening, { once: true });
      window.addEventListener('keydown', skipOnKey);
      if (window.scrollY > 8) finishOpening();

      return () => {
        window.removeEventListener('wheel', skipOpening);
        window.removeEventListener('touchstart', skipOpening);
        window.removeEventListener('scroll', skipOpening);
        window.removeEventListener('pointerdown', skipOpening);
        window.removeEventListener('keydown', skipOnKey);
        window.removeEventListener('pointermove', onPointer);
        window.clearTimeout(watchdog);
        delete stage.dataset.motion;
        delete stage.dataset.intro;
        delete stage.dataset.phase;
        if (skipIntroRef.current === skipOpening) skipIntroRef.current = null;
        opening.kill();
        timeline.scrollTrigger?.kill();
        timeline.kill();
      };
    });
    return () => media.revert();
  }, { scope: storyRef });

  return (
    <>
      <SiteHeader headerRef={headerRef} onNavigate={goToChapter} onHome={goHome} activeChapter={activeChapter} />
      <section className="story-track" id="top" ref={storyRef} aria-label="Edom's story, told through her avatar">
        <div className="story-stage" ref={stageRef}>
          <PaperTexture />
          <GardenArt />
          <div className="stage-glow stage-glow--rose" aria-hidden="true" />
          <div className="stage-glow stage-glow--lilac" aria-hidden="true" />
          <div className="stage-light" aria-hidden="true" />


          <ParallaxLayer depth="far" />
          <ParallaxLayer depth="mid" />
          <div className="avatar-viewport" aria-hidden="true">
            <div className="avatar-shadow" />
            <div className="avatar-camera" ref={cameraRef}>
              <img className="avatar-image" src={avatarUrl} alt="" width="1204" height="1771" fetchPriority="high" />
              <SceneOverlay />
            </div>
            <div className="focus-ring" ref={focusRef}><i/><i/></div>
          </div>

          <ParallaxLayer depth="near" />
          <OpeningSequence onSkip={skipOpeningFromButton} />

          <div className="chapter-panel-layer">
            {CHAPTERS.map((chapter, index) => (
              <ChapterPanel key={chapter.id} chapter={chapter} index={index} isActive={activeChapter === index} onOpenProject={setSelectedProject} cardRef={(node) => { panelRefs.current[index] = node; }} />
            ))}
          </div>

          <ChapterRail active={activeChapter} onNavigate={goToChapter} />
          <div className="stage-progress" aria-hidden="true"><div ref={progressRef} /></div>
          <div className="scroll-prompt" aria-hidden="true"><span>SCROLL TO EXPLORE</span><i><b /></i></div>
        </div>
      </section>

      <footer className="site-footer">
        <div className="footer-flower" aria-hidden="true">✿</div>
        <div><strong>EDOM<span>.</span></strong><p>Built with curiosity. Still becoming.</p></div>
        <div className="footer-links"><a href="https://github.com/ed-om" target="_blank" rel="noreferrer">GitHub ↗</a><a href="https://www.linkedin.com/in/edom-anteneh-alemu/" target="_blank" rel="noreferrer">LinkedIn ↗</a><a href="mailto:blessededom1@gmail.com">Email ↗</a><a href="#top">Back to the start ↑</a></div>
        <span className="footer-copyright">© {new Date().getFullYear()} · PORTFOLIO</span>
      </footer>

      <ProjectDialog project={selectedProject} onClose={closeProject} />
    </>
  );
}
