import { FormEvent, useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

type Mode = 'boot' | 'ending';
type Props = { mode: Mode; onOpen?: () => void; onExit?: () => void; onReplay?: () => void; onStay?: () => void };

const bootHelp = [
  'help                 show available commands',
  'ls                   list the archive',
  'cat about.txt        read a note from Edom',
  './open.sh            enter the story',
];
const endHelp = ['help                 show available commands', 'stay                 keep exploring the portfolio', 'exit                 zoom out and return to the desktop'];

export function TerminalScene({ mode, onOpen, onExit, onReplay, onStay }: Props) {
  const rootRef = useRef<HTMLElement>(null);
  const monitorRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [command, setCommand] = useState('');
  const [zoomed, setZoomed] = useState(mode === 'ending');
  const [desktop, setDesktop] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<string[]>(mode === 'boot'
    ? ['edom@portfolio:~$ welcome. this machine belongs to Edom.', 'scroll into the screen, then type `./open.sh`.']
    : ['edom@portfolio:~$ story complete.', 'type `stay` to keep exploring, or `exit` to close the session.']);

  useEffect(() => {
    setCommand('');
    setError('');
    setDesktop(false);
    setZoomed(mode === 'ending');
    setHistory(mode === 'boot'
      ? ['edom@portfolio:~$ welcome. this machine belongs to Edom.', 'scroll into the screen, then type `./open.sh`.']
      : ['edom@portfolio:~$ story complete.', 'type `stay` to keep exploring, or `exit` to close the session.']);
  }, [mode]);

  useGSAP(() => {
    const root = rootRef.current;
    const monitor = monitorRef.current;
    if (!root || !monitor) return;

    const getZoomPose = () => {
      const screen = monitor.querySelector<HTMLElement>('.monitor-screen');
      const screenRect = screen?.getBoundingClientRect();
      const monitorRect = monitor.getBoundingClientRect();
      const screenWidth = Math.max(1, screen?.clientWidth ?? monitor.clientWidth);
      const screenHeight = Math.max(1, screen?.clientHeight ?? monitor.clientHeight);
      // Make the display fill the viewport, not the entire monitor/stand. Use the current
      // transform to recover the unscaled layout coordinates, so resize/refresh is stable
      // even if the visitor is halfway through the scroll animation.
      const currentScale = Math.max(0.001, Number(gsap.getProperty(monitor, 'scale')) || 1);
      const currentX = Number(gsap.getProperty(monitor, 'x')) || 0;
      const currentY = Number(gsap.getProperty(monitor, 'y')) || 0;
      const fitWidth = (window.innerWidth * 0.94) / screenWidth;
      const fitHeight = (window.innerHeight * 0.94) / screenHeight;
      const screenAspect = screenWidth / screenHeight;
      const viewportAspect = window.innerWidth / window.innerHeight;
      // On desktop, the monitor is close to the browser viewport's aspect ratio, so a cover
      // zoom feels natural. On tall phones those ratios differ dramatically: using cover would
      // crop the terminal prompt off the sides. Switch to a contain zoom there instead.
      const aspectMismatch = Math.abs(Math.log(screenAspect / viewportAspect));
      const scale = aspectMismatch > 0.22 ? Math.min(fitWidth, fitHeight) : Math.max(fitWidth, fitHeight);
      const originX = monitor.clientWidth * 0.5;
      const originY = monitor.clientHeight * 0.47;
      const layoutLeft = monitorRect.left - currentX - originX * (1 - currentScale);
      const layoutTop = monitorRect.top - currentY - originY * (1 - currentScale);
      const screenX = screenRect ? (screenRect.left - monitorRect.left) / currentScale + screenWidth * 0.5 : originX;
      const screenY = screenRect ? (screenRect.top - monitorRect.top) / currentScale + screenHeight * 0.5 : originY;
      const x = window.innerWidth * 0.5 - (layoutLeft + originX) - (screenX - originX) * scale;
      const y = window.innerHeight * 0.5 - (layoutTop + originY) - (screenY - originY) * scale;
      return { scale, x, y };
    };

    // The terminal is normally sized inside the monitor. During the final part of the zoom,
    // expand its layout box beyond the screen's original bounds (the screen clipping is lifted)
    // so the terminal becomes a readable full-viewport scene even on a tall phone.
    const getTerminalFrame = () => {
      const screen = monitor.querySelector<HTMLElement>('.monitor-screen');
      if (!screen) return { left: 0, top: 0, width: monitor.clientWidth, height: monitor.clientHeight };
      const zoom = getZoomPose();
      const width = screen.clientWidth * 0.96;
      const height = (window.innerHeight * 0.92) / Math.max(1, zoom.scale);
      return {
        left: (screen.clientWidth - width) / 2,
        top: (screen.clientHeight - height) / 2,
        width,
        height,
      };
    };

    if (mode === 'boot') {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.set(monitor, { scale: 1, y: 0, rotationX: 0, transformOrigin: '50% 47%' });
        gsap.set('.monitor-desktop', { autoAlpha: 1 });
        gsap.set('.terminal-window', { autoAlpha: 0, scale: 0.985, transformOrigin: '50% 50%' });
        gsap.set('.desktop-caption, .terminal-footnote', { autoAlpha: 1 });
        gsap.set('.desk-props', { autoAlpha: 1 });
        const timeline = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: root,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.8,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const next = self.progress >= 0.6;
              setZoomed((current) => current === next ? current : next);
            },
          },
        });
        timeline.fromTo(monitor,
          { scale: 1, x: 0, y: 0, rotationX: 0 },
          { scale: () => getZoomPose().scale, x: () => getZoomPose().x, y: () => getZoomPose().y, rotationX: 0, duration: 1 }, 0);
        timeline.to('.monitor-desktop', { autoAlpha: 0, duration: 0.11 }, 0.43);
        timeline.fromTo('.terminal-window', { autoAlpha: 0, scale: 0.985 }, { autoAlpha: 1, scale: 1, duration: 0.13, ease: 'power2.out' }, 0.44);
        // The terminal panel grows out of the monitor's display and becomes the scene itself.
        // Because its height is calculated in local monitor coordinates, the same choreography
        // works for a widescreen desktop and a narrow portrait viewport without cropping text.
        timeline.to('.terminal-window', {
          left: () => getTerminalFrame().left,
          top: () => getTerminalFrame().top,
          width: () => getTerminalFrame().width,
          height: () => getTerminalFrame().height,
          right: 'auto', bottom: 'auto', borderRadius: 4,
          duration: 0.14, ease: 'power2.inOut',
        }, 0.61);
        timeline.to('.desktop-caption, .terminal-footnote, .workstation-scroll-cue', { autoAlpha: 0, duration: 0.12 }, 0.64);
        timeline.to('.desk-props', { autoAlpha: 0.15, duration: 0.18 }, 0.7);
        return () => { timeline.scrollTrigger?.kill(); timeline.kill(); };
      });
      mm.add('(prefers-reduced-motion: reduce)', () => {
        // Keep the workstation visible, but expose the terminal immediately for users
        // who have asked the browser to minimize motion.
        gsap.set(monitor, { clearProps: 'transform' });
        gsap.set('.monitor-desktop', { autoAlpha: 0 });
        gsap.set('.terminal-window', { autoAlpha: 1, scale: 1 });
        setZoomed(false);
      });
      return () => mm.revert();
    }

    // The ending starts inside the terminal. Typing `exit` animates the exact
    // same monitor back out until the whole computer and desk are visible again.
    const zoom = getZoomPose();
    const terminalFrame = getTerminalFrame();
    gsap.set(monitor, { scale: zoom.scale, x: zoom.x, y: zoom.y, rotationX: 0, transformOrigin: '50% 47%' });
    gsap.set('.monitor-desktop', { autoAlpha: 0 });
    gsap.set('.terminal-window', { ...terminalFrame, right: 'auto', bottom: 'auto', autoAlpha: 1, scale: 1, borderRadius: 4 });
    // The end-terminal is fixed to the viewport, so keep its camera framing correct if the
    // window is resized or the device rotates after the closing scene has appeared.
    const syncEndingFrame = () => {
      const nextZoom = getZoomPose();
      const nextFrame = getTerminalFrame();
      gsap.set(monitor, { scale: nextZoom.scale, x: nextZoom.x, y: nextZoom.y, rotationX: 0, transformOrigin: '50% 47%' });
      gsap.set('.terminal-window', { ...nextFrame, right: 'auto', bottom: 'auto', autoAlpha: 1, scale: 1, borderRadius: 4 });
    };
    window.addEventListener('resize', syncEndingFrame);
    return () => window.removeEventListener('resize', syncEndingFrame);
  }, { scope: rootRef, dependencies: [mode], revertOnUpdate: true });

  function submit(event: FormEvent) {
    event.preventDefault();
    run(command);
  }

  function run(raw: string) {
    const value = raw.trim();
    if (!value) return;
    setCommand('');
    setError('');
    const next = [...history, `edom@portfolio:~$ ${value}`];
    const normalized = value.toLowerCase();
    if (normalized === 'help') {
      setHistory([...next, ...(mode === 'boot' ? bootHelp : endHelp)]);
    } else if (mode === 'boot' && normalized === 'ls') {
      setHistory([...next, 'about.txt   projects/   curiosity/   open.sh']);
    } else if (mode === 'boot' && normalized === 'cat about.txt') {
      setHistory([...next, 'A software engineering student.', 'A curious mind, still becoming.', 'No map. Just questions worth following.']);
    } else if (mode === 'boot' && (normalized === './open.sh' || normalized === 'open')) {
      setHistory([...next, 'starting portfolio...', 'handing control to the story.']);
      window.setTimeout(() => onOpen?.(), 420);
    } else if (mode === 'ending' && normalized === 'exit') {
      setHistory([...next, 'session closed. returning to the workstation...']);
      const monitor = monitorRef.current;
      if (!monitor) {
        setDesktop(true);
        onExit?.();
        return;
      }
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.set('.terminal-window', { autoAlpha: 0, clearProps: 'left,top,width,height,right,bottom' });
        gsap.set('.monitor-desktop', { autoAlpha: 1 });
        gsap.set(monitor, { scale: 1, x: 0, y: 0, rotationX: 0, clearProps: 'transform' });
        setDesktop(true);
        setZoomed(false);
        onExit?.();
        return;
      }
      const exitTimeline = gsap.timeline({
        defaults: { ease: 'power3.inOut' },
        onComplete: () => {
          setDesktop(true);
          setZoomed(false);
          onExit?.();
        },
      });
      // Reverse the whole transition, not just the camera: the terminal recedes while the
      // familiar desktop wallpaper returns inside the monitor, before the full workstation lands.
      exitTimeline.to('.terminal-window', {
        autoAlpha: 0, left: '7%', top: '5.5%', width: '86%', height: '89%', right: 'auto', bottom: 'auto',
        duration: 0.36, ease: 'power2.inOut',
      }, 0);
      exitTimeline.to('.monitor-desktop', { autoAlpha: 1, duration: 0.35, ease: 'power1.out' }, 0.48);
      exitTimeline.to(monitor, { scale: 1, x: 0, y: 0, rotationX: 0, duration: 1.38 }, 0);
    } else if (mode === 'ending' && (normalized === 'stay' || normalized === 'stay here')) {
      setHistory([...next, 'staying. the portfolio is still open.', 'taking you back to the page...']);
      window.setTimeout(() => onStay?.(), 650);
    } else if (mode === 'ending' && normalized === 'reopen') {
      onReplay?.();
    } else {
      setHistory([...next, `command not found: ${value}`, 'type `help` for available commands.']);
      setError('Command not found');
    }
  }

  return (
    <section ref={rootRef} className={`terminal-scene terminal-scene--${mode}${zoomed ? ' is-zoomed' : ''}${desktop ? ' is-desktop' : ''}`} aria-label={mode === 'boot' ? 'Portfolio opening workstation' : 'Portfolio closing workstation'}>
      <div className="terminal-viewport">
        <div className="terminal-ambient" aria-hidden="true"><span/><span/><span/><i className="terminal-star terminal-star--one">✳</i><i className="terminal-star terminal-star--two">✦</i></div>
        <div className="desktop-caption"><span>EDOM'S WORKSTATION</span><span>PERSONAL ARCHIVE / 001</span></div>
        <div className="workstation-scroll-cue"><span>SCROLL TO ENTER</span><i><b/></i></div>
        <div className="monitor-scene" ref={monitorRef}>
          <div className="monitor-shell">
            <div className="monitor-camera" />
            <div className="monitor-screen">
              <div className="monitor-desktop" aria-hidden="true">
                <div className="desktop-wallpaper-orbit desktop-wallpaper-orbit--one"/><div className="desktop-wallpaper-orbit desktop-wallpaper-orbit--two"/>
                <div className="desktop-badge">✿</div>
                <div className="desktop-wallpaper-title"><span>EDOM'S PORTFOLIO</span><b>A curious mind,<br/>still becoming.</b><small>SCROLL TO OPEN THE ARCHIVE</small></div>
                <div className="desktop-icon desktop-icon--one"><i>✿</i><span>portfolio</span></div><div className="desktop-icon desktop-icon--two"><i>⌘</i><span>projects</span></div><div className="desktop-dock"><i>◉</i><i>⌘</i><i>✳</i><i>▤</i><i>⚙</i></div>
              </div>
              {desktop ? <div className="desktop-finish"><div className="desktop-folder">✿</div><p>SESSION CLOSED</p><h1>See you out there.</h1><span>THE STORY IS STILL GROWING.</span><button onClick={onReplay}>REOPEN THE STORY ↗</button></div> : <div className="terminal-window">
                <div className="terminal-titlebar"><span className="terminal-lights"><i/><i/><i/></span><span>terminal — zsh</span><span className="terminal-title-right">⌁</span></div>
                <div className="terminal-body" aria-live="polite">
                  <div className="terminal-motd"><span className="terminal-ascii">╭─╮</span><div><b>PORTFOLIO OS</b><small>{mode === 'boot' ? 'curiosity is a good place to start.' : 'you made it to the end. for now.'}</small></div></div>
                  <div className="terminal-history">{history.map((line, index) => <p key={`${index}-${line}`} className={line.startsWith('edom@') ? 'terminal-history-prompt' : line.startsWith('command not found') ? 'terminal-history-error' : ''}>{line}</p>)}</div>
                  <form className="terminal-input-row" onSubmit={submit}>
                    <label htmlFor={`terminal-command-${mode}`}><span>edom</span><i>@</i>portfolio<span className="terminal-path">:~</span><b>$</b></label>
                    <input ref={inputRef} id={`terminal-command-${mode}`} value={command} onChange={(event) => setCommand(event.target.value)} autoComplete="off" autoCapitalize="none" spellCheck={false} aria-label="Enter a terminal command" placeholder={mode === 'boot' ? 'type ./open.sh to begin…' : 'type stay or exit…'} />
                    <button type="submit" aria-label="Run command">↵</button>
                  </form>
                  {mode === 'ending' && <div className="terminal-quick" role="group" aria-label="Quick commands"><button type="button" onClick={() => run('stay')}>stay</button><button type="button" onClick={() => run('exit')}>exit</button></div>}
                  {error && <span className="terminal-error-hint">{error}</span>}
                  <div className="terminal-bottomline"><span>UTF-8</span><span>100% PERSONAL / 0% TEMPLATE</span><span>● ONLINE</span></div>
                </div>
              </div>}
            </div>
          </div>
          <div className="monitor-neck"/><div className="monitor-base"/>
          <div className="monitor-keyboard" aria-hidden="true"><i/><i/><i/><i/><i/><i/><i/></div>
        </div>
        <div className="desk-props" aria-hidden="true"><div className="desk-notebook"><i/><i/><i/><i/></div><div className="desk-mug"><span>✿</span></div><div className="desk-plant"><i/><i/><i/><b/></div></div>
        <div className="terminal-footnote">{mode === 'boot' ? 'A LITTLE TERMINAL. A MUCH BIGGER WORLD.' : desktop ? 'SESSION CLOSED · THE STORY CAN BEGIN AGAIN' : 'END OF TRANSMISSION · THANK YOU FOR VISITING'}</div>
        {mode === 'boot' && <button className="terminal-skip" type="button" onClick={onOpen}>SKIP TO THE STORY <span>↗</span></button>}
      </div>
    </section>
  );
}
