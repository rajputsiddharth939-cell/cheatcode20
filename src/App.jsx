import React, { useRef, useState } from "react";

export default function App() {
  const [gameState, setGameState] = useState("idle");
  const [elapsed, setElapsed] = useState(0);
  const startedAt = useRef(0);
  const timer = useRef(null);
  const startGame = () => { startedAt.current = performance.now(); setElapsed(0); setGameState("running"); timer.current = window.setInterval(() => setElapsed((performance.now() - startedAt.current) / 1000), 20); };
  const stopGame = () => { if (timer.current) window.clearInterval(timer.current); const result = (performance.now() - startedAt.current) / 1000; setElapsed(result); setGameState("done"); };
  const resetGame = () => { if (timer.current) window.clearInterval(timer.current); setElapsed(0); setGameState("idle"); };
  const score = Math.abs(elapsed - 11);
  return (
    <main className="maintenance-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=DM+Mono:wght@400;500&family=Inter:wght@400;500;600;700;800&display=swap');
        *{box-sizing:border-box}
        html,body,#root{margin:0;min-height:100%;width:100%;background:#f5f2ed}
        body{font-family:Inter,Arial,sans-serif}
        .maintenance-page{min-height:100svh;background:#f5f2ed;color:#101010;display:flex;flex-direction:column;overflow:hidden}
        .maintenance-header{height:82px;padding:0 clamp(22px,5vw,76px);display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #d9d5cf}
        .maintenance-logo{font-family:Anton,Impact,sans-serif;font-size:clamp(24px,3vw,34px);letter-spacing:-.025em;line-height:1}
        .maintenance-logo span{color:#f10b0b}
        .maintenance-status{font:500 10px 'DM Mono',monospace;letter-spacing:.14em;text-transform:uppercase;display:flex;align-items:center;gap:10px}
        .maintenance-dot{width:8px;height:8px;border-radius:50%;background:#f10b0b;box-shadow:0 0 0 4px #f10b0b1c}
        .maintenance-main{flex:1;display:grid;grid-template-columns:1fr;align-content:center;width:min(1100px,100%);margin:0 auto;padding:clamp(52px,9vh,100px) clamp(22px,7vw,90px) clamp(64px,10vh,110px);position:relative}
        .maintenance-kicker{font:500 11px 'DM Mono',monospace;letter-spacing:.18em;text-transform:uppercase;display:flex;align-items:center;gap:12px;margin-bottom:24px}
        .maintenance-kicker:before{content:'';display:block;width:30px;height:2px;background:#f10b0b}
        .maintenance-title{font-family:Anton,Impact,sans-serif;font-size:clamp(66px,12.2vw,158px);line-height:.86;letter-spacing:-.035em;text-transform:uppercase;margin:0;max-width:1000px}
        .maintenance-title .out-of-stock-line{color:#101010 !important;background:transparent !important;display:block;position:relative;z-index:1;box-shadow:none !important}
        .maintenance-bottom{display:flex;justify-content:space-between;align-items:flex-end;gap:32px;margin-top:clamp(36px,6vh,62px);padding-top:25px;border-top:1px solid #d9d5cf}
        .maintenance-copy{max-width:440px}
        .maintenance-copy h2{font-size:clamp(18px,2vw,24px);line-height:1.25;margin:0 0 10px;font-weight:800;letter-spacing:-.04em}
        .maintenance-copy p{font-size:14px;line-height:1.7;color:#66615c;margin:0;max-width:410px}
        .maintenance-stamp{width:112px;height:112px;flex:0 0 112px;border-radius:50%;background:#f10b0b;color:#fff;display:flex;align-items:center;justify-content:center;text-align:center;font-family:Anton,Impact,sans-serif;font-size:18px;line-height:1.05;transform:rotate(-10deg);box-shadow:5px 5px 0 #101010}
        .maintenance-footer{padding:20px clamp(22px,5vw,76px);border-top:1px solid #d9d5cf;display:flex;justify-content:space-between;align-items:center;gap:16px;font:500 9px 'DM Mono',monospace;letter-spacing:.12em;text-transform:uppercase;color:#77716b}
        .maintenance-footer a{color:#101010;text-decoration:none}
        .maintenance-footer a:hover{color:#f10b0b}
        @media(max-width:600px){
          .maintenance-header{height:68px;padding:0 20px}.maintenance-status{font-size:8px;letter-spacing:.08em;gap:7px}
          .maintenance-main{padding:72px 22px 76px}.maintenance-title{font-size:clamp(62px,15.4vw,100px);line-height:.89}
          .maintenance-bottom{align-items:flex-start;margin-top:42px;gap:18px}.maintenance-copy p{font-size:13px}
          .maintenance-stamp{width:76px;height:76px;flex-basis:76px;font-size:13px;box-shadow:3px 3px 0 #101010}
          .maintenance-footer{padding:18px 20px;align-items:flex-start;flex-direction:column;gap:8px;font-size:8px}
        }

        .maintenance-game{width:min(100%,720px);margin:0 auto 70px;padding:26px;border:1px solid #d9d5cf;background:#fff;box-shadow:7px 7px 0 #101010}
        .game-eyebrow{font:500 10px 'DM Mono',monospace;letter-spacing:.16em;text-transform:uppercase;color:#f10b0b}
        .maintenance-game h2{font:clamp(32px,6vw,58px)/.95 Anton,Impact,sans-serif;text-transform:uppercase;margin:12px 0}
        .maintenance-game p{font-size:14px;line-height:1.6;color:#66615c;margin:0 0 20px}
        .game-clock{font:clamp(44px,9vw,76px)/1 Anton,Impact,sans-serif;letter-spacing:-.03em;margin:22px 0}
        .game-actions{display:flex;gap:10px;flex-wrap:wrap}
        .game-button{border:2px solid #101010;background:#101010;color:white;padding:15px 22px;font:18px Anton,Impact,sans-serif;text-transform:uppercase;cursor:pointer;min-height:52px}
        .game-button.secondary{background:white;color:#101010}
        .game-result{margin-top:16px;font-weight:800;font-size:14px}
        .maintenance-footer{flex-wrap:wrap}
        .footer-contact{display:flex;flex-direction:column;gap:9px;letter-spacing:.04em;font-size:10px}
        .footer-contact a{color:#f5f2ed!important;text-transform:none;letter-spacing:0;font:500 12px Inter,Arial,sans-serif}
        .whatsapp-float{position:fixed;right:18px;bottom:20px;z-index:999;background:#25D366;color:#062b14;border:2px solid #101010;border-radius:999px;padding:14px 18px;display:flex;align-items:center;gap:9px;text-decoration:none;font:800 12px Inter,Arial,sans-serif;box-shadow:4px 4px 0 #101010}
        .whatsapp-float svg{width:20px;height:20px;fill:currentColor}
        @media(max-width:600px){.maintenance-game{margin:0 22px 54px;width:auto;padding:20px}.game-button{flex:1}.maintenance-footer{padding-bottom:86px}.footer-contact a{font-size:12px}.whatsapp-float{right:14px;bottom:14px;padding:12px 15px}}
        @media(prefers-reduced-motion:no-preference){.maintenance-main{animation:arrive .7s ease-out both}@keyframes arrive{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}}

      `}</style>
      <header className="maintenance-header">
        <div className="maintenance-logo">CHEAT<span>CODE</span>™</div>
        <div className="maintenance-status"><i className="maintenance-dot" /> TEMPORARILY OFFLINE</div>
      </header>
      <section className="maintenance-main" aria-labelledby="maintenance-heading">
        <div className="maintenance-kicker">A little pause. A big comeback.</div>
        <h1 className="maintenance-title" id="maintenance-heading">
          ALL STOCKS
          <span className="out-of-stock-line">ARE OUT.</span>
          BACK SOON.
        </h1>
        <div className="maintenance-bottom">
          <div className="maintenance-copy">
            <h2>WE’RE UNDER MAINTENANCE.</h2>
            <p>Every good thing deserves a reset. We’re working behind the scenes to make your next CHEATCODE experience even better. Something new is coming. Stay close.</p>
          </div>
          <div className="maintenance-stamp" aria-label="Something new is coming">SOMETHING<br/>NEW<br/>IS COMING</div>
        </div>
      </section>
      <section className="maintenance-game" aria-label="Stop at eleven game">
        <div className="game-eyebrow">01 / The comeback challenge</div>
        <h2>STOP AT 11.00</h2>
        <p>Think you’ve got perfect timing? Start the clock, then stop it at exactly <strong>11.00 seconds</strong>. No prizes, just bragging rights. Screenshot your score and tag us.</p>
        <div className="game-clock" aria-live="polite">{elapsed.toFixed(2)}<span style={{fontSize:".38em",marginLeft:8}}>SEC</span></div>
        <div className="game-actions">
          {gameState === "running" ? <button className="game-button" onClick={stopGame}>STOP THE CLOCK</button> : <button className="game-button" onClick={startGame}>{gameState === "done" ? "TRY AGAIN" : "START THE GAME"}</button>}
          {gameState !== "idle" && <button className="game-button secondary" onClick={resetGame}>RESET</button>}
        </div>
        {gameState === "done" && <div className="game-result">{score < 0.05 ? "INSANE. YOU NAILED IT. 11.00!" : score < 0.25 ? `SO CLOSE! You missed by ${score.toFixed(2)} seconds.` : `You missed by ${score.toFixed(2)} seconds. Run it back?`}</div>}
      </section>
      <footer className="maintenance-footer">
        <span>CHEATCODE™ — CHEAT WITHOUT REGRET.</span>
        <div className="footer-contact"><strong>CONTACT US</strong><a href="mailto:hello@houseofcheatcode.com">hello@houseofcheatcode.com</a><a href="https://wa.me/917984492735?text=Hey%20CHEATCODE%2C%20I%20want%20to%20know%20what%E2%80%99s%20coming%20next!" target="_blank" rel="noreferrer">WhatsApp: +91 79844 92735 ↗</a></div>
        <a href="https://www.instagram.com/houseofcheatcode/" target="_blank" rel="noreferrer">@HOUSEOFCHEATCODE ↗</a>
      </footer>
      <a className="whatsapp-float" href="https://wa.me/917984492735?text=Hey%20CHEATCODE%2C%20I%20want%20to%20know%20what%E2%80%99s%20coming%20next!" target="_blank" rel="noreferrer" aria-label="Chat with CHEATCODE on WhatsApp"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.52 3.48A11.82 11.82 0 0 0 12.08 0C5.5 0 .15 5.35.15 11.93c0 2.1.55 4.15 1.6 5.96L0 24l6.27-1.64a11.9 11.9 0 0 0 5.8 1.48h.01c6.58 0 11.93-5.35 11.93-11.93 0-3.19-1.24-6.19-3.49-8.43ZM12.08 21.8a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.72.98.99-3.63-.24-.37a9.85 9.85 0 1 1 8.36 4.61Zm5.41-7.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.05-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.09 4.49.71.31 1.27.5 1.7.64.71.23 1.36.2 1.87.12.57-.08 1.75-.72 2-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35Z"/></svg>CHAT WITH US</a>
    </main>
  );
}
