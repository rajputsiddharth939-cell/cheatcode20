import React, { useEffect, useRef, useState } from "react";

export default function App() {
  const [phase, setPhase] = useState("ready");
  const [reaction, setReaction] = useState(null);
  const [best, setBest] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const timeoutRef = useRef(null);
  const startRef = useRef(0);

  useEffect(() => () => window.clearTimeout(timeoutRef.current), []);

  const startGame = () => {
    window.clearTimeout(timeoutRef.current);
    setReaction(null);
    setCountdown(0);
    setPhase("waiting");
    const delay = 1400 + Math.random() * 2600;
    timeoutRef.current = window.setTimeout(() => {
      startRef.current = performance.now();
      setPhase("go");
    }, delay);
  };

  const tapTarget = () => {
    if (phase === "waiting") {
      window.clearTimeout(timeoutRef.current);
      setPhase("early");
      return;
    }
    if (phase === "go") {
      const result = Math.round(performance.now() - startRef.current);
      setReaction(result);
      setBest((previous) => previous === null ? result : Math.min(previous, result));
      setPhase("result");
    }
  };

  const resetGame = () => {
    window.clearTimeout(timeoutRef.current);
    setPhase("ready");
    setReaction(null);
    setCountdown(0);
  };

  return (
    <main className="maintenance-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=DM+Mono:wght@400;500&family=Inter:wght@400;500;600;700;800;900&display=swap');
        *{box-sizing:border-box}
        html,body,#root{margin:0;min-height:100%;width:100%;background:#f4f1eb}
        body{font-family:Inter,Arial,sans-serif}
        a{color:inherit}
        .maintenance-page{min-height:100svh;background:#f4f1eb;color:#101010;display:flex;flex-direction:column;overflow:hidden}
        .maintenance-header{height:84px;padding:0 clamp(24px,6vw,84px);display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #d8d4cd}
        .maintenance-logo{font-family:Anton,Impact,sans-serif;font-size:clamp(25px,3vw,34px);letter-spacing:-.035em;line-height:1}
        .maintenance-logo span{color:#f10b0b}
        .maintenance-status{font:500 10px 'DM Mono',monospace;letter-spacing:.12em;text-transform:uppercase;display:flex;align-items:center;gap:9px}
        .maintenance-dot{width:8px;height:8px;border-radius:50%;background:#f10b0b;box-shadow:0 0 0 4px #f10b0b1a}
        .maintenance-main{width:min(1240px,100%);margin:0 auto;padding:clamp(62px,9vh,104px) clamp(24px,6vw,76px) 76px;flex:1}
        .maintenance-kicker{font:500 10px 'DM Mono',monospace;letter-spacing:.18em;text-transform:uppercase;display:flex;align-items:center;gap:13px;margin-bottom:30px}
        .maintenance-kicker:before{content:'';display:block;width:27px;height:2px;background:#f10b0b}
        .hero-grid{display:grid;grid-template-columns:minmax(0,1fr) 170px;align-items:end;gap:42px}
        .maintenance-title{font:clamp(72px,11.5vw,148px)/.9 Anton,Impact,sans-serif;letter-spacing:-.035em;text-transform:uppercase;margin:0;max-width:920px}
        .maintenance-title .out-of-stock-line{display:block;color:#f10b0b;background:transparent;position:relative;margin:.035em 0}
        .hero-side{padding-bottom:10px;max-width:170px}
        .hero-side-mark{width:112px;height:112px;border:1.5px solid #101010;border-radius:50%;display:flex;align-items:center;justify-content:center;text-align:center;font:18px/.98 Anton,Impact,sans-serif;transform:rotate(8deg);margin-bottom:25px}
        .hero-side p{font:10px/1.6 'DM Mono',monospace;text-transform:uppercase;letter-spacing:.08em;color:#68645e;margin:0}
        .intro-row{display:flex;justify-content:space-between;align-items:flex-start;gap:32px;border-top:1px solid #d8d4cd;margin-top:62px;padding-top:30px}
        .intro-row h2{font-size:clamp(22px,2.8vw,32px);line-height:1.08;letter-spacing:-.055em;margin:0 0 14px;font-weight:900}
        .intro-row p{max-width:590px;font-size:15px;line-height:1.85;color:#65615b;margin:0}
        .game-section{margin-top:72px;display:grid;grid-template-columns:.86fr 1.14fr;background:#101010;color:#fff;min-height:360px;box-shadow:8px 8px 0 #f10b0b}
        .game-info{padding:clamp(30px,4.5vw,52px);display:flex;flex-direction:column;justify-content:space-between;border-right:1px solid #3c3c3c}
        .game-eyebrow{font:500 10px 'DM Mono',monospace;letter-spacing:.16em;text-transform:uppercase;color:#ff3838}
        .game-info h2{font:clamp(42px,5.8vw,72px)/.94 Anton,Impact,sans-serif;text-transform:uppercase;letter-spacing:-.02em;margin:30px 0 18px}
        .game-info p{font-size:14px;line-height:1.8;color:#b8b8b8;margin:0;max-width:330px}
        .game-area{padding:clamp(28px,4.5vw,50px);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;min-height:360px}
        .game-instruction{font:500 10px 'DM Mono',monospace;letter-spacing:.13em;text-transform:uppercase;color:#a7a7a7;margin-bottom:18px}
        .reaction-target{width:min(200px,48vw);height:min(200px,48vw);max-width:200px;max-height:200px;border-radius:50%;border:0;background:#2b2b2b;color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;cursor:pointer;transition:background .15s,transform .15s;box-shadow:inset 0 0 0 1px #484848}
        .reaction-target:active{transform:scale(.97)}
        .reaction-target.waiting{background:#f4b400;color:#101010;box-shadow:0 0 0 8px #f4b40020}
        .reaction-target.go{background:#f10b0b;color:white;box-shadow:0 0 0 10px #f10b0b26,0 0 50px #f10b0b40}
        .reaction-target.early{background:#555}
        .reaction-target strong{font:clamp(24px,4vw,36px)/.95 Anton,Impact,sans-serif;text-transform:uppercase}
        .reaction-target small{font:9px 'DM Mono',monospace;letter-spacing:.08em;text-transform:uppercase}
        .game-result{margin-top:17px;font-weight:800;font-size:14px;line-height:1.5}
        .game-result span{color:#ff3838}
        .game-actions{display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-top:16px}
        .game-button{border:1px solid #fff;background:#fff;color:#101010;padding:12px 18px;font:16px Anton,Impact,sans-serif;text-transform:uppercase;cursor:pointer;min-height:44px}
        .game-button.secondary{background:transparent;color:white}
        .game-record{font:10px 'DM Mono',monospace;letter-spacing:.08em;text-transform:uppercase;color:#888;margin-top:14px}
        .maintenance-footer{padding:30px clamp(24px,6vw,84px);background:#101010;color:#888;display:flex;justify-content:space-between;align-items:center;gap:30px;font:500 9px 'DM Mono',monospace;letter-spacing:.1em;text-transform:uppercase}
        .footer-contact{display:flex;flex-direction:column;gap:8px;letter-spacing:0;text-transform:none}
        .footer-contact strong{color:#fff;font:500 9px 'DM Mono',monospace;letter-spacing:.14em;text-transform:uppercase}
        .footer-contact a{color:#d8d8d8;text-decoration:none;font:12px Inter,Arial,sans-serif}
        .footer-contact a:hover{color:#ff3838}
        .maintenance-footer .social-link{color:#fff;text-decoration:none}
        .whatsapp-float{position:fixed;right:18px;bottom:18px;z-index:999;background:#25D366;color:#062b14;border:1.5px solid #101010;border-radius:999px;padding:13px 17px;display:flex;align-items:center;gap:9px;text-decoration:none;font:800 11px Inter,Arial,sans-serif;box-shadow:3px 3px 0 #101010}
        .whatsapp-float svg{width:19px;height:19px;fill:currentColor}
        @media(max-width:700px){
          .maintenance-header{height:66px;padding:0 18px}.maintenance-status{font-size:8px;letter-spacing:.07em;gap:7px}
          .maintenance-main{padding:58px 20px 54px}.hero-grid{grid-template-columns:1fr;gap:0}.maintenance-title{font-size:clamp(61px,14.7vw,100px);line-height:.92;letter-spacing:-.04em}
          .hero-side{display:flex;align-items:center;gap:18px;padding:0;margin-top:28px;max-width:none}.hero-side-mark{width:70px;height:70px;flex:0 0 70px;font-size:12px;margin:0}.hero-side p{max-width:220px}
          .intro-row{margin-top:38px;display:block;padding-top:24px}.intro-row p{font-size:14px;line-height:1.8}
          .game-section{margin-top:46px;grid-template-columns:1fr;min-height:0;box-shadow:5px 5px 0 #f10b0b}.game-info{border-right:0;border-bottom:1px solid #3c3c3c;padding:26px 24px}.game-info h2{margin:20px 0 14px;font-size:52px}.game-area{padding:30px 18px;min-height:330px}
          .maintenance-footer{padding:28px 20px 92px;align-items:flex-start;flex-direction:column;gap:22px}.footer-contact a{font-size:12px}
          .whatsapp-float{right:12px;bottom:12px;padding:11px 14px}
        }
        @media(prefers-reduced-motion:no-preference){.maintenance-main{animation:arrive .6s ease-out both}@keyframes arrive{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}}
      `}</style>
      <header className="maintenance-header">
        <div className="maintenance-logo">CHEAT<span>CODE</span>™</div>
        <div className="maintenance-status"><i className="maintenance-dot" /> SOMETHING IS BREWING</div>
      </header>
      <section className="maintenance-main" aria-labelledby="maintenance-heading">
        <div className="maintenance-kicker">Not gone. Just getting better.</div>
        <div className="hero-grid">
          <h1 className="maintenance-title" id="maintenance-heading">ALL STOCKS<span className="out-of-stock-line">ARE OUT.</span>BACK SOON.</h1>
          <aside className="hero-side"><div className="hero-side-mark">NO SPOILERS<br/>JUST SURPRISES</div><p>The next scoop is worth the wait. Keep your eyes here.</p></aside>
        </div>
        <div className="intro-row">
          <div><h2>WE’RE COOKING UP SOMETHING NEW.</h2><p>We’ve hit pause while we make the next CHEATCODE experience even better. The freezer’s quiet for now. The ideas aren’t. Stay close.</p></div>
        </div>
        <section className="game-section" aria-label="Catch the Cheat reaction game">
          <div className="game-info">
            <div className="game-eyebrow">01 / The comeback challenge</div>
            <div><h2>CATCH<br/>THE CHEAT.</h2><p>Wait for the circle to turn red. Tap it as fast as you can. Tap too early and you’re out. What’s your reaction time?</p></div>
          </div>
          <div className="game-area">
            <div className="game-instruction">{phase === "ready" ? "Ready when you are" : phase === "waiting" ? "Wait for RED…" : phase === "go" ? "TAP NOW!" : phase === "early" ? "Too early. Patience, boss." : "Nice reflexes."}</div>
            <button className={`reaction-target ${phase}`} onClick={phase === "ready" || phase === "result" || phase === "early" ? startGame : tapTarget} aria-label="Reaction game target">
              <strong>{phase === "ready" ? "READY?" : phase === "waiting" ? "WAIT…" : phase === "go" ? "TAP!" : phase === "early" ? "FALSE START" : `${reaction} MS`}</strong>
              <small>{phase === "ready" ? "Start challenge" : phase === "waiting" ? "Don't tap yet" : phase === "go" ? "Hit it now" : phase === "early" ? "Tap to retry" : "Tap to play again"}</small>
            </button>
            {phase === "result" && <div className="game-result">{reaction < 220 ? "LIGHTNING FAST." : reaction < 320 ? "NICE REFLEXES." : "YOU CAN GO FASTER."} <span>{reaction} ms</span></div>}
            {phase === "early" && <div className="game-result">You jumped the gun. <span>Try again.</span></div>}
            <div className="game-record">{best === null ? "PERSONAL BEST: —" : `PERSONAL BEST: ${best} MS`}</div>
            <div className="game-actions"><button className="game-button" onClick={startGame}>{phase === "ready" ? "START GAME" : "PLAY AGAIN"}</button><button className="game-button secondary" onClick={resetGame}>RESET</button></div>
          </div>
        </section>
      </section>
      <footer className="maintenance-footer">
        <span>CHEATCODE™ — CHEAT WITHOUT REGRET.</span>
        <div className="footer-contact"><strong>CONTACT US</strong><a href="mailto:hello@houseofcheatcode.com">hello@houseofcheatcode.com</a><a href="https://wa.me/917984492735?text=Hey%20CHEATCODE%2C%20I%20want%20to%20know%20what%E2%80%99s%20coming%20next!" target="_blank" rel="noreferrer">WhatsApp: +91 79844 92735 ↗</a></div>
        <a className="social-link" href="https://www.instagram.com/houseofcheatcode/" target="_blank" rel="noreferrer">@HOUSEOFCHEATCODE ↗</a>
      </footer>
      <a className="whatsapp-float" href="https://wa.me/917984492735?text=Hey%20CHEATCODE%2C%20I%20want%20to%20know%20what%E2%80%99s%20coming%20next!" target="_blank" rel="noreferrer" aria-label="Chat with CHEATCODE on WhatsApp"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.52 3.48A11.82 11.82 0 0 0 12.08 0C5.5 0 .15 5.35.15 11.93c0 2.1.55 4.15 1.6 5.96L0 24l6.27-1.64a11.9 11.9 0 0 0 5.8 1.48h.01c6.58 0 11.93-5.35 11.93-11.93 0-3.19-1.24-6.19-3.49-8.43ZM12.08 21.8a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.72.98.99-3.63-.24-.37a9.85 9.85 0 1 1 8.36 4.61Zm5.41-7.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.05-.17-.15-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.09 4.49.71.31 1.27.2 1.87.12.57-.08 1.75-.72 2-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35Z"/></svg>CHAT WITH US</a>
    </main>
  );
}
