import React, { useEffect, useRef, useState } from "react";

const BEST_KEY = "cc_stop_at_six_best_ms";
const readBest = () => {
  try {
    const value = localStorage.getItem(BEST_KEY);
    return value === null ? null : Number(value);
  } catch {
    return null;
  }
};
const saveBest = (value) => {
  try { localStorage.setItem(BEST_KEY, String(value)); } catch {}
};

export default function App() {
  const [mode, setMode] = useState("ready");
  const [elapsed, setElapsed] = useState(0);
  const [result, setResult] = useState(null);
  const [best, setBest] = useState(readBest);
  const startedAt = useRef(0);
  const frame = useRef(0);

  const stopFrame = () => {
    if (frame.current) cancelAnimationFrame(frame.current);
    frame.current = 0;
  };

  useEffect(() => () => stopFrame(), []);

  const start = () => {
    stopFrame();
    startedAt.current = performance.now();
    setElapsed(0);
    setResult(null);
    setMode("running");
    const tick = (now) => {
      const seconds = (now - startedAt.current) / 1000;
      setElapsed(Math.min(seconds, 6));
      if (seconds < 6) frame.current = requestAnimationFrame(tick);
      else frame.current = 0;
    };
    frame.current = requestAnimationFrame(tick);
  };

  const stop = () => {
    if (mode !== "running") return;
    const seconds = (performance.now() - startedAt.current) / 1000;
    const difference = Math.round(Math.abs(seconds - 6) * 1000);
    stopFrame();
    setElapsed(seconds);
    setResult({ seconds, difference });
    setMode("result");
    setBest((previous) => {
      const next = previous === null || difference < previous ? difference : previous;
      saveBest(next);
      return next;
    });
  };

  const shareScore = async () => {
    const text = result
      ? `I stopped the CHEATCODE timer ${result.difference} ms away from 6.000 seconds. Can you beat me? https://houseofcheatcode.com/`
      : "Try the CHEATCODE 6-second challenge: https://houseofcheatcode.com/";
    try {
      if (navigator.share) await navigator.share({ title: "CHEATCODE — Stop at 6", text });
      else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        window.alert("Score copied. Go challenge your friends.");
      } else window.prompt("Copy your score:", text);
    } catch (error) {
      if (error?.name !== "AbortError") window.prompt("Copy your score:", text);
    }
  };

  const message = result
    ? result.difference === 0 ? "THAT WAS DISGUSTINGLY PRECISE." :
      result.difference <= 30 ? "OKAY, YOU'RE BUILT DIFFERENT." :
      result.difference <= 100 ? "CLOSE. PAINFULLY CLOSE." :
      result.difference <= 300 ? "NOT BAD. NOT SIX." : "SKILL ISSUE. RUN IT BACK."
    : "";

  return (
    <main className="cc-six">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=DM+Mono:wght@400;500&family=Inter:wght@400;500;600;700;800;900&display=swap');
        .cc-six{--ink:#111;--paper:#fff;--acid:#ff0000;min-height:100svh;background:var(--paper);color:var(--ink);font-family:Inter,Arial,sans-serif}
        .cc-six *{box-sizing:border-box}
        .cc-six button,.cc-six a{-webkit-tap-highlight-color:transparent}
        .cc-six button{font:inherit}
        .cc-top{height:78px;padding:0 clamp(20px,6vw,82px);display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #e8e8e8}
        .cc-wordmark{font:32px/.9 Anton,Impact,sans-serif;letter-spacing:-.04em}.cc-wordmark span{background:var(--acid);color:#fff;padding:0 5px;margin-left:3px}
        .cc-live{font:10px 'DM Mono',monospace;letter-spacing:.1em;text-transform:uppercase;display:flex;align-items:center;gap:9px}.cc-live:before{content:"";width:7px;height:7px;border-radius:50%;background:#ff0000}
        .cc-main{width:min(1060px,100%);margin:0 auto;padding:clamp(42px,6vw,76px) clamp(20px,5vw,56px) 42px}
        .cc-kicker{font:11px 'DM Mono',monospace;letter-spacing:.16em;text-transform:uppercase;display:flex;align-items:center;gap:12px}.cc-kicker:before{content:"";width:25px;height:2px;background:var(--ink)}
        .cc-hero{display:grid;grid-template-columns:minmax(0,1fr) 190px;gap:24px;align-items:end;margin-top:20px}
        .cc-hero h1{font:clamp(66px,10vw,124px)/.86 Anton,Impact,sans-serif;letter-spacing:-.045em;margin:0;text-transform:uppercase}
        .cc-hero h1 span{display:block;color:var(--acid)}
        .cc-side{border-left:2px solid var(--ink);padding:4px 0 4px 17px;margin-bottom:7px}.cc-side strong{font:25px/.95 Anton,Impact,sans-serif;display:block}.cc-side p{font:10px/1.7 'DM Mono',monospace;text-transform:uppercase;margin:12px 0 0;color:#555}
        .cc-intro{max-width:510px;font-size:15px;line-height:1.8;color:#555;margin:20px 0 27px}
        .cc-game{border:1.5px solid var(--ink);box-shadow:7px 7px 0 var(--ink);display:grid;grid-template-columns:1fr 1.12fr;min-height:300px}
        .cc-game-copy{padding:clamp(22px,3vw,34px);display:flex;flex-direction:column;align-items:flex-start}
        .cc-game-tag{font:10px 'DM Mono',monospace;letter-spacing:.12em;text-transform:uppercase;background:var(--acid);color:#fff;padding:7px 9px}
        .cc-game h2{font:clamp(38px,5vw,58px)/.9 Anton,Impact,sans-serif;letter-spacing:-.02em;margin:22px 0 13px;text-transform:uppercase}
        .cc-game-copy p{font-size:12px;line-height:1.8;color:#666;margin:0;max-width:290px}
        .cc-best{font:10px 'DM Mono',monospace;text-transform:uppercase;margin-top:auto;padding-top:25px;color:#555}.cc-best b{color:#111}
        .cc-play{background:#fff7f7;border-left:1px solid var(--ink);padding:clamp(22px,4vw,38px);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;min-width:0}
        .cc-clock-label{font:10px 'DM Mono',monospace;letter-spacing:.13em;text-transform:uppercase;color:#777}
        .cc-clock{font:clamp(64px,10vw,104px)/1 Anton,Impact,sans-serif;letter-spacing:-.04em;margin:17px 0 18px;font-variant-numeric:tabular-nums;white-space:nowrap}
        .cc-clock small{font:11px 'DM Mono',monospace;letter-spacing:.06em;margin-left:7px}
        .cc-button{border:1.5px solid var(--ink);background:var(--ink);color:white;min-height:49px;padding:13px 22px;display:inline-flex;align-items:center;justify-content:center;text-decoration:none;text-transform:uppercase;font:18px/1 Anton,Impact,sans-serif;cursor:pointer;transition:transform .15s,background .15s,color .15s;width:100%;max-width:270px}
        .cc-button:hover{transform:translateY(-2px);background:var(--acid);color:#fff}
        .cc-button.secondary{background:transparent;color:var(--ink)}.cc-button.secondary:hover{background:var(--acid)}
        .cc-button:focus-visible,.cc-six a:focus-visible{outline:3px solid #ff0000;outline-offset:4px}
        .cc-hint{font:10px/1.6 'DM Mono',monospace;color:#777;margin-top:13px}
        .cc-result{margin:13px 0 0;font:12px/1.6 'DM Mono',monospace;text-transform:uppercase}.cc-result strong{display:block;font:clamp(26px,4vw,38px)/1 Anton,Impact,sans-serif;margin:8px 0}
        .cc-result-actions{display:flex;gap:8px;width:100%;justify-content:center;flex-wrap:wrap;margin-top:15px}.cc-result-actions .cc-button{width:auto;flex:1;min-width:120px;font-size:16px;padding:12px}
        .cc-bottom{margin-top:30px;padding-top:16px;border-top:1px solid #e8e8e8;display:flex;justify-content:space-between;align-items:center;gap:20px}
        .cc-bottom p{font:10px/1.7 'DM Mono',monospace;letter-spacing:.04em;color:#777;margin:0;text-transform:uppercase}
        .cc-social{display:flex;gap:18px;flex-wrap:wrap}.cc-social a{font-size:11px;font-weight:700;text-decoration:none;border-bottom:1px solid #aaa;padding-bottom:3px}.cc-social a:hover{border-color:#111}
        @media(max-width:700px){.cc-top{height:66px;padding:0 20px}.cc-wordmark{font-size:28px}.cc-live{font-size:8px;letter-spacing:.04em}.cc-main{padding-top:38px;padding-bottom:28px}.cc-hero{grid-template-columns:1fr;gap:18px;margin-top:18px}.cc-hero h1{font-size:clamp(61px,14vw,94px)}.cc-side{max-width:250px}.cc-intro{margin:18px 0 22px;font-size:14px}.cc-game{grid-template-columns:1fr;box-shadow:5px 5px 0 var(--ink)}.cc-game-copy{padding:23px 22px 17px}.cc-game h2{font-size:45px;margin:18px 0 10px}.cc-best{padding-top:20px}.cc-play{border-left:0;border-top:1px solid var(--ink);padding:23px 18px}.cc-clock{font-size:clamp(65px,17vw,90px);margin:15px 0 17px}.cc-bottom{align-items:flex-start;flex-direction:column;margin-top:25px}.cc-result-actions{flex-direction:column}.cc-result-actions .cc-button{width:100%;max-width:none;flex:auto}.cc-hint{max-width:240px}}
        @media(prefers-reduced-motion:reduce){.cc-six *{transition:none!important;animation:none!important}}
      `}</style>

      <header className="cc-top">
        <div className="cc-wordmark">CHEAT<span>CODE</span>™</div>
        <div className="cc-live">Something's in the works</div>
      </header>

      <section className="cc-main">
        <div className="cc-kicker">A LITTLE PAUSE. A LITTLE CHALLENGE.</div>
        <div className="cc-hero">
          <h1>THE SCOOP<br/>IS ON PAUSE.<span>YOU'RE NOT.</span></h1>
          <aside className="cc-side"><strong>6 SECONDS.<br/>NO EXCUSES.</strong><p>One tiny game while we cook up the good stuff.</p></aside>
        </div>
        <p className="cc-intro">The next CHEATCODE chapter is cooking. Till then, test your timing. Stop the clock at exactly 6.000 seconds. Sounds easy. It isn't.</p>

        <section className="cc-game" aria-label="Stop at six seconds game">
          <div className="cc-game-copy">
            <span className="cc-game-tag">THE 6-SECOND CHALLENGE / 001</span>
            <h2>STOP AT<br/>6.000 SEC.</h2>
            <p>Hit start. Count in your head. Stop as close to 6 seconds as you can. No cheating. Obviously.</p>
            <div className="cc-best">PERSONAL BEST: <b>{best === null ? "NOT SET YET" : best === 0 ? "PERFECT · 0 MS OFF" : best + " MS OFF"}</b></div>
          </div>
          <div className="cc-play">
            <div className="cc-clock-label">{mode === "running" ? "STOP IT. STOP IT NOW." : mode === "result" ? "YOUR FINAL TIME" : "TARGET TIME"}</div>
            <div className="cc-clock">{elapsed.toFixed(3)}<small>SEC</small></div>
            {mode === "ready" && <><button className="cc-button" onClick={start}>START THE CLOCK ↗</button><div className="cc-hint">THE CLOCK STOPS ONLY WHEN YOU SAY SO.</div></>}
            {mode === "running" && <><button className="cc-button" onClick={stop}>STOP AT SIX ✳</button><div className="cc-hint">DON'T BLINK. DON'T PANIC.</div></>}
            {mode === "result" && result && <div className="cc-result"><strong>{result.difference === 0 ? "PERFECT." : result.difference + " MS OFF"}</strong>{message}<div className="cc-result-actions"><button className="cc-button" onClick={start}>RUN IT BACK ↻</button><button className="cc-button secondary" onClick={shareScore}>SHARE SCORE ↗</button></div></div>}
          </div>
        </section>

        <footer className="cc-bottom">
          <p>CHEATCODE™ · CHEAT WITHOUT REGRET.<br/>GOOD THINGS TAKE TIME. GREAT ICE CREAM TAKES A LITTLE MORE.</p>
          <nav className="cc-social" aria-label="Contact links">
            <a href="mailto:hello@houseofcheatcode.com">EMAIL ↗</a>
            <a href="https://wa.me/917984492735?text=Hey%20CHEATCODE!" target="_blank" rel="noopener noreferrer">WHATSAPP ↗</a>
            <a href="https://www.instagram.com/houseofcheatcode/" target="_blank" rel="noopener noreferrer">INSTAGRAM ↗</a>
          </nav>
        </footer>
      </section>
    </main>
  );
}
