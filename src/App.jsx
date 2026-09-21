import React, { useEffect, useState } from "react";

const API =
  "https://script.google.com/macros/s/AKfycbzX2i0JOw5HED9JnEOEs3gwDKZgEfpvRHN1b2VS6VYlFDJVBZDrlCwCBjTEKD8EuCVipg/exec";

const flavours = [
  { name: "VANILLA", sub: "CRUNCH", image: "/images/vanilla-crunch.webp" },
  { name: "GUAVA", sub: "CHILLI", image: "/images/guava-chilli.webp" },
  { name: "BELGIAN", sub: "CHOCOLATE", image: "/images/belgian-chocolate.webp" },
  { name: "BLUEBERRY", sub: "CHEESECAKE", image: "/images/blueberry-cheesecake.webp" },
  { name: "MIDNIGHT", sub: "COOKIES", image: "/images/midnight-cookies.webp" },
];

function Count() {
  const [time, setTime] = useState(0);

  useEffect(() => {
    const tick = () =>
      setTime(Math.max(0, new Date("2026-10-11T00:00:00+05:30") - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const values = [
    Math.floor(time / 864e5),
    Math.floor(time / 36e5) % 24,
    Math.floor(time / 6e4) % 60,
    Math.floor(time / 1e3) % 60,
  ];

  return (
    <div className="count" aria-label="Countdown to launch">
      {values.map((value, index) => (
        <div key={["days", "hours", "minutes", "seconds"][index]}>
          <b>{String(value).padStart(2, "0")}</b>
          <small>{["DAYS", "HOURS", "MIN", "SEC"][index]}</small>
        </div>
      ))}
    </div>
  );
}

function HeroProduct() {
  const [index, setIndex] = useState(0);

  // Infinite autoplay — keeps cycling through every flavour continuously.
  useEffect(() => {
    let timer;
    const advance = () => {
      setIndex((current) => (current + 1) % flavours.length);
      timer = setTimeout(advance, 5000);
    };

    timer = setTimeout(advance, 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="hero-slider" aria-label="CHEATCODE flavour showcase">
      {flavours.map((flavour, i) => (
        <div className={`hero-slide ${i === index ? "active" : ""}`} key={flavour.name + flavour.sub}>
          <Product src={flavour.image} />
          <div className="hero-flavour-label">{flavour.name} {flavour.sub}</div>
        </div>
      ))}
      <button className="hero-prev" onClick={() => setIndex((current) => (current - 1 + flavours.length) % flavours.length)} aria-label="Previous flavour">‹</button>
      <button className="hero-next" onClick={() => setIndex((current) => (current + 1) % flavours.length)} aria-label="Next flavour">›</button>
      <div className="hero-dots" aria-hidden="true">
        {flavours.map((flavour, i) => <span className={i === index ? "active" : ""} key={flavour.name} />)}
      </div>
    </div>
  );
}

function Product({ src }) {
  return (
    <div className="product" aria-hidden="true">
      <div className="glow" />
      <img className="pack" src={src} alt="" loading="eager" decoding="async" fetchPriority="high" />
      <div className="floor" />
    </div>
  );
}

function Signup() {
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    const data = Object.fromEntries(new FormData(event.currentTarget));

    try {
      await fetch(API, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(data),
      });
      setDone(true);
    } catch {
      setBusy(false);
    }
  }

  return (
    <section className="black signup" id="signup">
      <div className="wrap signup-grid">
        <div>
          <span className="eyebrow">06 / GET IN EARLY</span>
          <h2>
            DON’T MISS
            <br />
            THE DROP.
          </h2>
          <p className="muted">
            Get launch-day news, first access and the occasional CHEATCODE
            surprise.
          </p>
        </div>

        {done ? (
          <div className="success">
            ✓ YOU’RE ON THE LIST.
            <br />
            <span>SEE YOU ON LAUNCH DAY.</span>
          </div>
        ) : (
          <form onSubmit={submit}>
            <input name="name" placeholder="YOUR NAME" required />
            <input name="email" type="email" placeholder="EMAIL ADDRESS" required />
            <input name="phone" placeholder="PHONE NUMBER" required />
            <button disabled={busy}>
              {busy ? "JOINING…" : "GET NOTIFIED →"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

export default function App() {
  return (
    <div className="site">
      <header>
        <a href="#" className="brand-mark">
          CHEATCODE™
        </a>

        <nav aria-label="Primary navigation">
          <a href="#flavours">FLAVOURS</a>
          <a href="#story">OUR STORY</a>
          <a href="#launch">LAUNCH</a>
        </nav>

        <a className="header-btn" href="#signup">
          GET NOTIFIED ↗
        </a>
      </header>

      <div className="ticker" aria-label="CHEATCODE highlights">
        <div className="ticker-track">
          <span>YOU CAN CHEAT WITHOUT REGRET · 10g PROTEIN · 0 ADDED SUGAR · HIGH FIBRE · LOW CARB · LAUNCHING 11.10.26 ·</span>
          <span aria-hidden="true">YOU CAN CHEAT WITHOUT REGRET · 10g PROTEIN · 0 ADDED SUGAR · HIGH FIBRE · LOW CARB · LAUNCHING 11.10.26 ·</span>
        </div>
      </div>

      <main>
        <section className="hero red">
          <div className="wrap hero-grid">
            <div className="hero-copy">
              <span className="eyebrow">01 / PREMIUM HIGH-PROTEIN ICE CREAM</span>

              <h1>
                CHEAT
                <br />
                WITHOUT
                <br />
                REGRET.
              </h1>

              <p className="hero-tag">
                Same pleasure.
                <br />
                Better choices.
              </p>

              <a className="pill" href="#flavours">
                DISCOVER CHEATCODE <b>↗</b>
              </a>

              <div className="stats">
                <span>
                  <b>10g</b>PROTEIN
                </span>
                <span>
                  <b>0</b>ADDED SUGAR
                </span>
                <span>
                  <b>HIGH</b>FIBRE
                </span>
                <span>
                  <b>LOW</b>CARB
                </span>
              </div>
            </div>

            <div className="hero-product">
              <HeroProduct />
            </div>
          </div>
        </section>

        <section className="black flavours-sec" id="flavours">
          <div className="wrap">
            <div className="center">
              <span className="eyebrow redtext">02 / THE LINE-UP</span>
              <h2>5 WAYS TO CHEAT.</h2>
              <p className="muted">Different moods. Same CHEATCODE.</p>
            </div>

            <div className="flavour-row">
              {flavours.map((flavour, index) => (
                <article key={flavour.name + "-" + flavour.sub}>
                  <img
                    className="mini-pack"
                    src={flavour.image}
                    alt={flavour.name + " " + flavour.sub + " CHEATCODE ice cream"}
                    loading="lazy"
                    decoding="async"
                  />
                  <span>0{index + 1}</span>
                  <h3>
                    {flavour.name}
                    <br />
                    {flavour.sub}
                  </h3>
                </article>
              ))}
            </div>

            <div className="benefits">
              {[
                ["10g", "Protein"],
                ["0", "Added Sugar"],
                ["High", "Fibre"],
                ["Low", "Carb"],
              ].map(([title, label]) => (
                <div key={label}>
                  <i>◉</i>
                  <b>{title}</b>
                  <small>{label}</small>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="black split">
          <div className="image-panel">
            <img
              className="section3-image"
              src="/images/Cheatcode Section 3.JPG"
              alt="CHEATCODE ice cream brand visual"
              loading="lazy"
              decoding="async"
            />
          </div>

          <div className="copy-panel">
            <span className="eyebrow redtext">03 / THE BETTER INDULGENCE</span>
            <h2>
              DESSERT
              <br />
              THAT WORKS
              <br />
              FOR YOU.
            </h2>
            <p>
              Creamy texture. Bold flavours. Thought-through nutrition. Built
              for the moments when you want dessert and still want to feel good
              about the choice.
            </p>
            <a className="outline" href="#story">
              READ OUR STORY ↗
            </a>
          </div>
        </section>

        <section className="white story" id="story">
          <div className="wrap story-grid">
            <div>
              <span className="eyebrow">04 / THE CHEATCODE</span>
              <h2>
                WE DIDN’T
                <br />
                WANT TO MAKE
                <br />
                ANOTHER
                <br />
                <span>“HEALTHY”</span>
                <br />
                ICE CREAM.
              </h2>
            </div>

            <div>
              <p className="big">We wanted the kind of ice cream you’d actually crave.</p>
              <p>
                So we built CHEATCODE for the moments when you want to indulge
                without feeling like you abandoned your goals.
              </p>
              <strong>THAT’S THE CHEAT.</strong>
            </div>
          </div>
        </section>

        <section className="red launch" id="launch">
          <div className="wrap">
            <span className="eyebrow">05 / LAUNCHING ON</span>
            <h2>11.10.26</h2>
            <Count />
            <p className="launch-note">
              THE WAIT IS ALMOST OVER.
              <br />
              SEE YOU ON LAUNCH DAY.
            </p>
          </div>

          <div className="launch-product">
            <HeroProduct />
          </div>
        </section>

        <section className="black order-start">
          <div className="wrap order-start-inner">
            <span className="eyebrow redtext">06 / ORDERS START FROM 11TH OCTOBER.</span>
            <h2>YOUR CHEATCODE<br />IS JUST ONE CLICK AWAY.</h2>
            <p>
              Order directly from our website and get your favourite flavour
              delivered across Ahmedabad in just half an hour.
            </p>
            <a className="pill order-cta" href="#launch">
              BE READY TO ORDER <b>→</b>
            </a>
          </div>
        </section>

        <Signup />

        <section className="black follow">
          <div className="wrap">
            <span className="eyebrow redtext">07 / FOLLOW THE BUILD</span>
            <h2>@HOUSEOFCHEATCODE</h2>
            <p className="muted">
              Flavour testing. Packaging. First batches. Launch preparation.
              The real build, before the first scoop.
            </p>
            <a
              className="outline"
              href="https://www.instagram.com/houseofcheatcode/"
              target="_blank"
              rel="noreferrer"
            >
              FOLLOW ON INSTAGRAM ↗
            </a>
          </div>
        </section>

        <section className="red final">
          <div className="wrap">
            <span className="eyebrow">08 / CHEATCODE™</span>
            <h2>
              YOUR NEXT
              <br />
              CHEAT IS
              <br />
              ALMOST HERE.
            </h2>
            <p>11.10.26</p>
          </div>
        </section>
      </main>

      <footer>
        <b>CHEATCODE™</b>
        <span>You Can Cheat Without Regret.</span>
        <a href="mailto:hello@houseofcheatcode.com">
          HELLO@HOUSEOFCHEATCODE.COM
        </a>
      </footer>
    </div>
  );
}