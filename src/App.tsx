import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { ClosingCredits } from './components/ClosingCredits';
import { StoryExperience } from './components/StoryExperience';
import { TerminalScene } from './components/TerminalScene';

export default function App() {
  const [started, setStarted] = useState(false);
  const [ending, setEnding] = useState(false);
  const [showEndingTerminal, setShowEndingTerminal] = useState(false);

  // Always begin at the workstation. Browsers can restore an old scroll position on reload;
  // the opening is a deliberate scene, not a section the visitor should accidentally skip.
  useLayoutEffect(() => {
    const html = document.documentElement;
    const previous = html.style.scrollBehavior;
    html.style.scrollBehavior = 'auto';
    window.scrollTo(0, 0);
    const resetOnShow = () => window.scrollTo(0, 0);
    window.addEventListener('pageshow', resetOnShow);
    return () => { html.style.scrollBehavior = previous; window.removeEventListener('pageshow', resetOnShow); };
  }, []);
  const enterStory = useCallback(() => {
    setStarted(true);
    window.scrollTo(0, 0);
  }, []);
  const finishStory = useCallback(() => { setEnding(true); setShowEndingTerminal(false); }, []);
  useEffect(() => {
    if (!ending || showEndingTerminal) return;
    const timer = window.setTimeout(() => setShowEndingTerminal(true), 4200);
    return () => window.clearTimeout(timer);
  }, [ending, showEndingTerminal]);
  const stay = useCallback(() => {
    setEnding(false);
    setShowEndingTerminal(false);
    window.scrollTo({ top: Math.max(0, document.documentElement.scrollHeight - window.innerHeight - 260), behavior: 'auto' });
  }, []);
  const replay = useCallback(() => {
    setEnding(false);
    setShowEndingTerminal(false);
    setStarted(false);
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="site-shell">
      {started && <StoryExperience onEnd={finishStory} />}
      {!started && <TerminalScene mode="boot" onOpen={enterStory} />}
      {ending && !showEndingTerminal && <ClosingCredits onContinue={() => setShowEndingTerminal(true)} />}
      {ending && showEndingTerminal && <TerminalScene mode="ending" onReplay={replay} onStay={stay} />}
    </main>
  );
}
