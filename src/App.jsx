import React from "react";

export default function App() {
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
      <footer className="maintenance-footer">
        <span>CHEATCODE™ — CHEAT WITHOUT REGRET.</span>
        <a href="https://www.instagram.com/houseofcheatcode/" target="_blank" rel="noreferrer">@HOUSEOFCHEATCODE ↗</a>
      </footer>
    </main>
  );
}
