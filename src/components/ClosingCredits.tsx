import avatarUrl from '../assets/edom-avatar.webp';

export function ClosingCredits({ onContinue }: { onContinue: () => void }) {
  return (
    <section className="closing-credits" aria-label="End credits">
      <div className="closing-grain" aria-hidden="true" />
      <div className="closing-orbit closing-orbit--one" aria-hidden="true" />
      <div className="closing-orbit closing-orbit--two" aria-hidden="true" />
      <span className="closing-kicker">AN EDOM PORTFOLIO · ISSUE 001</span>
      <div className="closing-avatar-wrap"><img src={avatarUrl} alt="Edom's mushroom avatar" /></div>
      <div className="closing-title-block">
        <p className="closing-overline">THE END OF THIS CHAPTER</p>
        <h1>Still <em>becoming.</em></h1>
        <p className="closing-subtitle">Curiosity goes on after the credits.</p>
      </div>
      <div className="closing-credit-roll" aria-hidden="true"><span>WRITTEN IN QUESTIONS</span><i>✳</i><span>BUILT ONE ATTEMPT AT A TIME</span><i>✳</i><span>THE NEXT CHAPTER IS UNKNOWN</span></div>
      <button type="button" className="closing-continue" onClick={onContinue}>RETURN TO TERMINAL <span>↘</span></button>
      <span className="closing-bottom-note">THANK YOU FOR SPENDING A LITTLE TIME HERE</span>
    </section>
  );
}
