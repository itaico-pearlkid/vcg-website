'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

type BriefPath = 'x' | 'y' | 'z' | null;

export default function VCGPage() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [clockTime, setClockTime] = useState('');
  const [briefOpen, setBriefOpen] = useState(false);
  const [briefPath, setBriefPath] = useState<BriefPath>(null);
  const [inquireOpen, setInquireOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [bnwOpen, setBnwOpen] = useState(false);
  const [zineSubmitted, setZineSubmitted] = useState(false);
  const [briefSubmitted, setBriefSubmitted] = useState(false);
  const [inquireSubmitted, setInquireSubmitted] = useState(false);
  const [scanStep, setScanStep] = useState(1);
  const [scanUrl, setScanUrl] = useState('');
  const [scanName, setScanName] = useState('');
  const [scanEmail, setScanEmail] = useState('');
  const [scanPhone, setScanPhone] = useState('');
  const [scanCompany, setScanCompany] = useState('');

  const beliefRef = useRef<HTMLElement>(null);
  const metalRowRef = useRef<HTMLDivElement>(null);
  const workSectionRef = useRef<HTMLElement>(null);

  // Clock
  useEffect(() => {
    function update() {
      const n = new Date();
      const h = n.getHours().toString().padStart(2, '0');
      const m = n.getMinutes().toString().padStart(2, '0');
      setClockTime(`${h}:${m}`);
    }
    update();
    const id = setInterval(update, 30000);
    return () => clearInterval(id);
  }, []);

  // Close menus on outside click
  useEffect(() => {
    function onDoc() { setOpenMenu(null); }
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  // Belief scroll-driven animation
  useEffect(() => {
    const sec = beliefRef.current;
    if (!sec) return;
    const panels = Array.from(sec.querySelectorAll<HTMLElement>('.bf-panel'));
    const tiles = panels.map(p => Array.from(p.querySelectorAll<HTMLElement>('.bf-tile')));
    const ttlEl = sec.querySelector<HTMLElement>('#bf-ttl');
    const TITLES = ['VCG_Creative.WIN', 'VCG_Capital.WIN', 'VCG_Campaign.WIN'];
    const BUILD = 0.55;
    let raf = 0;
    const el = sec;

    function clamp(v: number, a: number, b: number) { return v < a ? a : v > b ? b : v; }
    function ease(t: number) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

    function update() {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 800;
      const total = el.offsetHeight - vh;
      const scrolled = -rect.top;
      const p = clamp(scrolled / Math.max(1, total), 0, 1);

      const seg = 1 / panels.length;
      const idx = Math.min(panels.length - 1, Math.floor(p / seg));
      const local = (p - idx * seg) / seg;

      if (ttlEl) ttlEl.textContent = TITLES[idx] || TITLES[0];

      panels.forEach((panel, i) => {
        let x: number;
        if (i < idx) { x = -110; }
        else if (i > idx) { x = 110; }
        else {
          if (local <= BUILD) { x = 0; }
          else {
            const s = (local - BUILD) / (1 - BUILD);
            x = -110 * ease(s);
          }
        }
        if (i === idx + 1 && local > BUILD) {
          const s2 = (local - BUILD) / (1 - BUILD);
          x = 110 - 110 * ease(s2);
        }
        panel.style.transform = `translate3d(${x}%, 0, 0)`;
      });

      panels.forEach((_, i) => {
        const ts = tiles[i];
        let revealCount: number;
        if (i < idx) { revealCount = ts.length; }
        else if (i > idx) { revealCount = 0; }
        else {
          const buildP = clamp(local / BUILD, 0, 1);
          revealCount = Math.round(buildP * ts.length);
        }
        ts.forEach((tile, j) => tile.classList.toggle('is-on', j < revealCount));
      });
    }

    function onScroll() { if (!raf) raf = requestAnimationFrame(update); }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  // Metal card 3D parallax
  useEffect(() => {
    const row = metalRowRef.current;
    if (!row) return;
    const cards = Array.from(row.querySelectorAll<HTMLElement>('.metal-card'));

    function onMove(e: MouseEvent) {
      cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) / (rect.width / 2);
        const dy = (e.clientY - cy) / (rect.height / 2);
        const rx = -dy * 14;
        const ry = dx * 14;
        const mx = ((e.clientX - rect.left) / rect.width * 100).toFixed(1);
        const my = ((e.clientY - rect.top) / rect.height * 100).toFixed(1);
        const angle = (Math.atan2(dy, dx) * 180 / Math.PI + 360) % 360;
        card.style.setProperty('--rx', `${rx}deg`);
        card.style.setProperty('--ry', `${ry}deg`);
        card.style.setProperty('--mx', `${mx}%`);
        card.style.setProperty('--my', `${my}%`);
        card.style.setProperty('--shine-x', `${mx}%`);
        card.style.setProperty('--shine-y', `${my}%`);
        card.style.setProperty('--shine-angle', `${angle}deg`);
        card.classList.add('tracking');
      });
    }

    function onLeave() {
      cards.forEach(card => {
        card.classList.remove('tracking');
        card.style.removeProperty('--rx');
        card.style.removeProperty('--ry');
      });
    }

    row.addEventListener('mousemove', onMove);
    row.addEventListener('mouseleave', onLeave);
    return () => {
      row.removeEventListener('mousemove', onMove);
      row.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  // Work popups scroll-driven
  useEffect(() => {
    const section = workSectionRef.current;
    if (!section) return;
    const workEl = section;
    const pops = Array.from(workEl.querySelectorAll<HTMLElement>('.work-pop'));
    let raf = 0;

    function update() {
      raf = 0;
      const rect = workEl.getBoundingClientRect();
      const vh = window.innerHeight || 800;
      const total = workEl.offsetHeight;
      const scrolled = vh - rect.top;
      const p = scrolled / (total + vh);

      pops.forEach(pop => {
        const enter = parseFloat(pop.dataset.enter || '0');
        const exit = parseFloat(pop.dataset.exit || '1');
        pop.classList.toggle('is-open', p >= enter && p <= exit);
      });
    }

    function onScroll() { if (!raf) raf = requestAnimationFrame(update); }
    window.addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Smooth scroll for anchor links
  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.pageYOffset - 48;
    window.scrollTo({ top, behavior: 'smooth' });
  }, []);

  function openBrief(path: BriefPath) {
    setBriefPath(path);
    setBriefSubmitted(false);
    setBriefOpen(true);
  }

  return (
    <>
      <div id="nav-fade" aria-hidden="true" />

      {/* ===== MENUBAR ===== */}
      <nav className="mbar" id="mbar">
        <div className="l">
          <span className="brand-vcg brand-vcg-left">VCG<span className="blink-cursor">_</span></span>

          <span className={`menu-item${openMenu === 'file' ? ' open' : ''}`}
            onClick={e => { e.stopPropagation(); setOpenMenu(openMenu === 'file' ? null : 'file'); }}>
            FILE
            <div className="menu-dropdown">
              <button className="menu-action" type="button">New Window<span className="shortcut">⌘N</span></button>
              <button className="menu-action" type="button" onClick={() => scrollTo('paths')}>Apply<span className="shortcut">⌘A</span></button>
              <button className="menu-action" type="button" onClick={() => scrollTo('path-y')}>Send the deck<span className="shortcut">⌘D</span></button>
              <div className="menu-sep" />
              <button className="menu-action" type="button" onClick={() => setBnwOpen(true)}>Subscribe — Brand New World</button>
              <div className="menu-sep" />
              <button className="menu-action" type="button">Close Window<span className="shortcut">⌘W</span></button>
            </div>
          </span>

          <span className={`menu-item${openMenu === 'edit' ? ' open' : ''}`}
            onClick={e => { e.stopPropagation(); setOpenMenu(openMenu === 'edit' ? null : 'edit'); }}>
            EDIT
            <div className="menu-dropdown">
              <button className="menu-action" type="button" disabled>Undo<span className="shortcut">⌘Z</span></button>
              <button className="menu-action" type="button" disabled>Redo<span className="shortcut">⇧⌘Z</span></button>
              <div className="menu-sep" />
              <button className="menu-action" type="button" disabled>Cut<span className="shortcut">⌘X</span></button>
              <button className="menu-action" type="button" disabled>Copy<span className="shortcut">⌘C</span></button>
              <button className="menu-action" type="button" disabled>Paste<span className="shortcut">⌘V</span></button>
              <div className="menu-sep" />
              <button className="menu-action" type="button" onClick={() => setScannerOpen(true)}>Run Brand Scanner<span className="shortcut">⌘R</span></button>
            </div>
          </span>

          <span className={`menu-item${openMenu === 'view' ? ' open' : ''}`}
            onClick={e => { e.stopPropagation(); setOpenMenu(openMenu === 'view' ? null : 'view'); }}>
            VIEW
            <div className="menu-dropdown">
              {['hero','belief','theory','paths','work','proof','book','zine','atelier'].map(s => (
                <button key={s} className="menu-action" type="button" onClick={() => scrollTo(s)}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </span>

          <span className={`menu-item${openMenu === 'tools' ? ' open' : ''}`}
            onClick={e => { e.stopPropagation(); setOpenMenu(openMenu === 'tools' ? null : 'tools'); }}>
            TOOLS
            <div className="menu-dropdown">
              <button className="menu-action" type="button" onClick={() => setScannerOpen(true)}>Brand Scanner.exe<span className="shortcut">⌘B</span></button>
              <div className="menu-sep" />
              <button className="menu-action" type="button">Window Snake<span className="shortcut">⌘S</span></button>
            </div>
          </span>
        </div>
        <div className="r">
          <span className="mbar-clock">{clockTime}</span>
          <button className="founder-login" type="button" onClick={() => setBnwOpen(true)}>FOUNDER_MEMBER_LOGIN</button>
        </div>
      </nav>

      {/* ===== DESKTOP (OS Mode) ===== */}
      <div id="vcg-desktop" aria-hidden="true" />
      <div id="desktop-icons" role="navigation" aria-label="VCG Desktop">
        {[
          { cls: 's-1', target: 'hero', label: 'VCG_', body: <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M5 8 L16 24 L27 8" strokeLinecap="square" strokeLinejoin="miter"/></svg> },
          { cls: 's-2', target: 'belief', label: 'Belief.app', body: <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M2 16 Q16 6 30 16 Q16 26 2 16 Z"/><circle cx="16" cy="16" r="4"/><circle cx="16" cy="16" r="1.2" fill="currentColor"/></svg> },
          { cls: 's-3', target: 'theory', label: 'Theory.calc', body: <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2"><path d="M24 6 L8 6 L17 16 L8 26 L24 26" strokeLinejoin="miter" strokeLinecap="square"/></svg> },
          { cls: 's-4', target: 'paths', label: 'Paths', folder: true },
          { cls: 's-5', target: 'path-x', label: 'Path_X', text: 'X' },
          { cls: 's-6', target: 'path-y', label: 'Path_Y', text: 'Y', lt: true },
          { cls: 's-7', target: 'path-z', label: 'Path_Z', text: 'Z' },
          { cls: 's-8', target: 'work', label: 'Work', folder: true, dark: true },
          { cls: 's-9', target: 'proof', label: 'Proof', body: <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 9 L9 17 L13 17 L11 22 M19 9 L19 17 L23 17 L21 22" strokeLinecap="round" strokeLinejoin="miter"/></svg> },
          { cls: 's-10', target: 'book', label: 'Book.epub', lt: true, body: <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="16" cy="16" r="11"/><line x1="5" y1="16" x2="27" y2="16"/><ellipse cx="16" cy="16" rx="5" ry="11"/><line x1="16" y1="5" x2="16" y2="27"/></svg> },
          { cls: 's-11', target: 'zine', label: 'Zine', body: <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="6" y="5" width="20" height="22"/><line x1="10" y1="11" x2="22" y2="11"/><line x1="10" y1="15" x2="22" y2="15"/><line x1="10" y1="19" x2="22" y2="19"/><line x1="10" y1="23" x2="18" y2="23"/></svg> },
          { cls: 's-12', target: 'atelier', label: 'Atelier', lt: true, body: <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="9" width="26" height="17" rx="1"/><path d="M11 9 L13 6 L19 6 L21 9"/><circle cx="16" cy="17" r="5"/><circle cx="16" cy="17" r="2"/></svg> },
        ].map(({ cls, target, label, body, folder, text, lt, dark }) => (
          <button key={cls} className={`di ${cls}`} data-target={target} type="button"
            aria-label={`Open ${label}`} onClick={() => scrollTo(target)}>
            <div className={`di-thumb${lt ? ' lt' : ''}${folder ? ' folder' : ''}`}>
              {!folder && <div className="di-tbar" />}
              <div className="di-body di-svg">
                {body || (text && <span>{text}</span>)}
              </div>
            </div>
            <div className="di-label">{label}</div>
          </button>
        ))}
        <button className="di always sys-reload" type="button" aria-label="Reload" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="di-thumb"><div className="di-tbar" /><div className="di-body di-svg">
            <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
              <path d="M26 16 A10 10 0 1 1 22.5 8.4"/><path d="M26 4 L26 9 L21 9"/>
            </svg>
          </div></div>
          <div className="di-label">Reload</div>
        </button>
        <button className="di always sys-mail" type="button" aria-label="VCG.MAIL" onClick={() => setInquireOpen(true)}>
          <div className="di-thumb"><div className="di-tbar" /><div className="di-body di-svg">
            <svg viewBox="0 0 32 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <rect x="2" y="3" width="28" height="18" rx="1"/><path d="M2 4 L16 14 L30 4"/>
            </svg>
          </div></div>
          <div className="di-label">VCG.MAIL</div>
        </button>
        <button className="di always f-trash" type="button" aria-label="Trash">
          <div className="di-thumb"><div className="di-tbar" /><div className="di-body di-svg">
            <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="square">
              <path d="M6 9 L26 9"/><path d="M13 6 L19 6"/><path d="M9 9 L11 26 L21 26 L23 9"/>
              <line x1="13" y1="13" x2="13" y2="22"/><line x1="16" y1="13" x2="16" y2="22"/><line x1="19" y1="13" x2="19" y2="22"/>
            </svg>
          </div></div>
          <div className="di-label">Trash</div>
        </button>
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <main className="page">

        {/* ===== SECTION 1 — HERO ===== */}
        <section className="card" id="hero">
          <div className="tbar">
            <div className="tdots">
              <button className="tdot" type="button" aria-label="Close">×</button>
              <button className="tdot" type="button" aria-label="Minimize">−</button>
              <button className="tdot" type="button" aria-label="Fullscreen">↗</button>
            </div>
            <div className="ttl">INTRO_WINDOW_001.VCG</div>
            <div className="spacer" />
          </div>
          <div className="cbody" style={{ textAlign: 'center', paddingTop: 'clamp(96px, 13vw, 176px)', paddingBottom: 'clamp(72px, 10vw, 140px)' }}>
            <div className="eyebrow hero-eyebrow" style={{ textAlign: 'center', fontFamily: 'var(--serif)', fontSize: 'clamp(22px, 2.6vw, 38px)', letterSpacing: '-0.03em', lineHeight: '0.86', color: '#fff', textTransform: 'none', position: 'relative', display: 'inline-block' }}>
              THE&nbsp;VENTURE<span className="reg-mark" style={{ fontFamily: 'var(--serif)', fontSize: '0.5em', marginLeft: '0.4em', letterSpacing: '0', display: 'inline-block', position: 'relative', top: '-0.9em', lineHeight: '1' }}>®</span><br />
              CREATIVE&nbsp;GROUP
            </div>
            <h1 className="h-hero hero-stack" style={{ margin: '56px auto 0', fontFamily: 'var(--serif)', fontWeight: 400, lineHeight: '0.88', letterSpacing: '-0.025em', fontSize: 'clamp(56px, 11vw, 168px)', maxWidth: '11ch' }}>
              The Best Companies Scale Belief. Build It For The Brand New World.
            </h1>
            <p className="lede hero-subline" style={{ margin: '48px auto 0', textAlign: 'center', maxWidth: '62ch', fontSize: 'clamp(15px, 1.27vw, 18.4px)', lineHeight: '1.4', color: '#e6e6e6' }}>
              Apple turned computing creative and put tools as an app on a phone with no buttons. Headspace made an app for a new world now distracted by their phones to get us to be still. Plenty took hardware and software and combined it with biology to solve for nature vrs nuture, biology, robotics and food.
            </p>
            <p className="lede hero-subline" style={{ margin: '20px auto 0', textAlign: 'center', maxWidth: '62ch', fontSize: 'clamp(15px, 1.27vw, 18.4px)', lineHeight: '1.4', color: '#e6e6e6' }}>
              None of these existed as ideas before they existed as products. Brydon Gerus spent a career helping to shape these belief systems and those of the modern world. His team at VCG takes a handful of clients a year.
            </p>
            <div className="cta-row" style={{ justifyContent: 'center', marginTop: 'clamp(56px, 8vw, 112px)' }}>
              <button type="button" className="btn btn-scroll" onClick={() => scrollTo('paths')}>VCG_SCROLL TO BEGIN</button>
            </div>
          </div>
          <span className="tbl" /><span className="tbr" />
        </section>

        {/* ===== SECTION 2 — BELIEF ===== */}
        <section className="card lt bf-mode" id="belief" ref={beliefRef}>
          <div className="tbar">
            <div className="tdots"><button className="tdot" type="button">×</button><button className="tdot" type="button">−</button><button className="tdot" type="button">↗</button></div>
            <div className="ttl" id="bf-ttl">VCG_Creative.WIN</div>
            <div className="spacer" />
          </div>
          <div className="cbody">
            {/* Panel 0 — VCG_Creative */}
            <div className="bf-panel" data-idx="0">
              <div className="bf-tiles" data-tiles="0">
                <div className="bf-tile t-nasa" style={{ left: '8%', top: '14%', width: '170px', height: '170px', ['--rot' as string]: '-6deg' }}>NASA</div>
                <div className="bf-tile t-headspace" style={{ left: '22%', top: '8%', width: '200px', height: '160px', ['--rot' as string]: '4deg' }}>Headspace</div>
                <div className="bf-tile t-apple" style={{ left: '18%', top: '48%', width: '160px', height: '200px', ['--rot' as string]: '-3deg' }} />
                <div className="bf-tile t-time" style={{ right: '24%', top: '10%', width: '170px', height: '200px', ['--rot' as string]: '5deg' }}>TIME</div>
                <div className="bf-tile t-plenty" style={{ right: '8%', top: '18%', width: '200px', height: '140px', ['--rot' as string]: '-4deg' }}>PLENTY</div>
                <div className="bf-tile t-sundance" style={{ right: '14%', top: '52%', width: '180px', height: '180px', ['--rot' as string]: '3deg' }}>SUNDANCE</div>
                <div className="bf-tile t-onebio" style={{ left: '38%', top: '62%', width: '170px', height: '160px', ['--rot' as string]: '-2deg' }}>one.bio</div>
                <div className="bf-tile t-risk" style={{ right: '34%', top: '60%', width: '160px', height: '200px', ['--rot' as string]: '6deg' }}>RISK</div>
              </div>
              <div className="bf-panel-inner">
                <div className="bn" style={{ fontFamily: 'var(--ocr)', fontSize: '22px', letterSpacing: '-0.09em', color: '#000', margin: '0 0 clamp(48px, 8vw, 120px)' }}>01</div>
                <h2 className="belief-head" style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 'clamp(56px, 11vw, 145px)', lineHeight: '0.88', letterSpacing: '-0.03em', color: '#000', margin: 0 }}>VCG_Creative</h2>
                <p className="belief-lede" style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 'clamp(24px, 2.6vw, 38px)', lineHeight: '1.0', letterSpacing: '-0.03em', color: '#000', textTransform: 'uppercase', margin: 'clamp(48px, 6vw, 88px) auto 0' }}>BRANDING<br />REBRANDING &amp;<br />COMPANY BUILDING</p>
                <p className="belief-body" style={{ fontFamily: 'var(--body)', fontSize: 'clamp(15px, 1.6vw, 23px)', lineHeight: '1.17', letterSpacing: '-0.03em', color: '#000', maxWidth: '54ch', margin: 'clamp(36px, 4vw, 64px) auto 0' }}>Not as decoration, but as the core belief system of your company. The thing investors understand, teams align around, and the market can&rsquo;t ignore.</p>
                <button type="button" className="btn-popup" style={{ marginTop: 'clamp(36px, 4vw, 64px)' }} onClick={() => scrollTo('path-y')}>→ BEGIN YOUR BRAND</button>
              </div>
            </div>

            {/* Panel 1 — VCG_Capital */}
            <div className="bf-panel" data-idx="1">
              <div className="bf-tiles" data-tiles="1">
                <div className="bf-tile t-cap1" style={{ left: '10%', top: '16%', width: '200px', height: '160px', ['--rot' as string]: '-5deg' }}>DECK_001</div>
                <div className="bf-tile t-cap2" style={{ left: '24%', top: '48%', width: '180px', height: '200px', ['--rot' as string]: '4deg' }}>PITCH</div>
                <div className="bf-tile t-cap3" style={{ right: '22%', top: '12%', width: '170px', height: '220px', ['--rot' as string]: '-3deg' }}>$50M</div>
                <div className="bf-tile t-cap4" style={{ right: '10%', top: '50%', width: '200px', height: '180px', ['--rot' as string]: '5deg' }}>Series&nbsp;A</div>
                <div className="bf-tile t-nasa" style={{ left: '42%', top: '8%', width: '150px', height: '150px', ['--rot' as string]: '6deg' }}>CAP</div>
                <div className="bf-tile t-time" style={{ left: '40%', top: '62%', width: '160px', height: '160px', ['--rot' as string]: '-4deg' }}>RAISE</div>
              </div>
              <div className="bf-panel-inner">
                <div className="bn" style={{ fontFamily: 'var(--ocr)', fontSize: '22px', letterSpacing: '-0.09em', color: '#000', margin: '0 0 clamp(48px, 8vw, 120px)' }}>02</div>
                <h2 className="belief-head" style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 'clamp(56px, 11vw, 145px)', lineHeight: '0.88', letterSpacing: '-0.03em', color: '#000', margin: 0 }}>VCG_Capital</h2>
                <p className="belief-lede" style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 'clamp(24px, 2.6vw, 38px)', lineHeight: '1.0', letterSpacing: '-0.03em', color: '#000', textTransform: 'uppercase', margin: 'clamp(48px, 6vw, 88px) auto 0' }}>INVESTING<br />BELIEF<br />IN BUSINESS</p>
                <p className="belief-body" style={{ fontFamily: 'var(--body)', fontSize: 'clamp(15px, 1.6vw, 23px)', lineHeight: '1.17', letterSpacing: '-0.03em', color: '#000', maxWidth: '54ch', margin: 'clamp(36px, 4vw, 64px) auto 0' }}>Through positioning, narrative, and investor-ready materials, we make your company fundable and hard to pass on.</p>
                <button type="button" className="btn-popup" style={{ marginTop: 'clamp(36px, 4vw, 64px)' }} onClick={() => scrollTo('path-x')}>→ PREPARE FOR CAPITAL</button>
              </div>
            </div>

            {/* Panel 2 — VCG_Campaign */}
            <div className="bf-panel" data-idx="2">
              <div className="bf-tiles" data-tiles="2">
                <div className="bf-tile t-cmp1" style={{ left: '10%', top: '14%', width: '200px', height: '180px', ['--rot' as string]: '-5deg' }}>LAUNCH</div>
                <div className="bf-tile t-cmp2" style={{ left: '22%', top: '54%', width: '180px', height: '170px', ['--rot' as string]: '4deg' }}>FILM</div>
                <div className="bf-tile t-cmp3" style={{ right: '22%', top: '10%', width: '170px', height: '200px', ['--rot' as string]: '-3deg' }}>OOH</div>
                <div className="bf-tile t-cmp4" style={{ right: '10%', top: '48%', width: '200px', height: '170px', ['--rot' as string]: '5deg' }}>SOCIAL</div>
                <div className="bf-tile t-headspace" style={{ left: '42%', top: '6%', width: '150px', height: '140px', ['--rot' as string]: '6deg' }}>CAMPAIGN</div>
                <div className="bf-tile t-plenty" style={{ left: '40%', top: '64%', width: '160px', height: '160px', ['--rot' as string]: '-4deg' }}>PRODUCT</div>
              </div>
              <div className="bf-panel-inner">
                <div className="bn" style={{ fontFamily: 'var(--ocr)', fontSize: '22px', letterSpacing: '-0.09em', color: '#000', margin: '0 0 clamp(48px, 8vw, 120px)' }}>03</div>
                <h2 className="belief-head" style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 'clamp(56px, 11vw, 145px)', lineHeight: '0.88', letterSpacing: '-0.03em', color: '#000', margin: 0 }}>VCG_Campaign</h2>
                <p className="belief-lede" style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 'clamp(24px, 2.6vw, 38px)', lineHeight: '1.0', letterSpacing: '-0.03em', color: '#000', textTransform: 'uppercase', margin: 'clamp(48px, 6vw, 88px) auto 0' }}>TWO ALL OUT TO<br />PRESENT<br />THE WORLD</p>
                <p className="belief-body" style={{ fontFamily: 'var(--body)', fontSize: 'clamp(15px, 1.6vw, 23px)', lineHeight: '1.17', letterSpacing: '-0.03em', color: '#000', maxWidth: '54ch', margin: 'clamp(36px, 4vw, 64px) auto 0' }}>Through campaigns, product thinking, and the latest technology, we turn your brand into growth, momentum, and cultural relevance.</p>
                <button type="button" className="btn-popup" style={{ marginTop: 'clamp(36px, 4vw, 64px)' }} onClick={() => scrollTo('path-z')}>→ LAUNCH TO WORLD</button>
              </div>
            </div>
          </div>
          <span className="tbl" /><span className="tbr" />
        </section>

        {/* ===== SECTION 3 — THEORY ===== */}
        <section className="card" id="theory">
          <div className="tbar">
            <div className="tdots"><button className="tdot" type="button">×</button><button className="tdot" type="button">−</button><button className="tdot" type="button">↗</button></div>
            <div className="ttl">Theory_of_Designed_Relativity.calc</div>
            <div className="spacer" />
          </div>
          <div className="cbody">
            <div className="eyebrow">E = MC²(t)</div>
            <h2 className="h-section">Innovation as <span className="it">Equation.</span></h2>
            <p className="lede">Run the scan. See where your brand sits on the curve from Noise to Cult.</p>
            <div className="theory-grid">
              <div>
                <p className="body-copy">
                  An extension of Einstein&rsquo;s general relativity — not a replacement, not a debunk, not a challenge. A homage to Einstein through the lens of Leonardo da Vinci. The algebra is reworked to define <em>Matter</em> as <em>what Matters</em> — a function of cultural output and consistency, compounded over time. Where E was energy, here it is the energy a brand releases into culture; where M was mass, here it is cultural mass — the gravitational pull of what a company stands for.
                </p>
                <div className="cta-row" style={{ marginTop: '40px' }}>
                  <button type="button" className="btn solid" onClick={() => setScannerOpen(true)}>Begin scan <span className="gl">→</span></button>
                </div>
              </div>
              <figure className="einstein-frame" aria-label="Albert Einstein, 1951">
                <div className="einstein-chrome">
                  <div className="ec-dots"><span className="sw-dot">×</span><span className="sw-dot">−</span><span className="sw-dot">↗</span></div>
                  <div className="ec-ttl">EINSTEIN_1951.JPG</div>
                </div>
                <div style={{ background: '#1a1a1a', aspectRatio: '3/4', display: 'flex', alignItems: 'center', justifyContent: 'center', filter: 'grayscale(1) contrast(1.05)' }}>
                  <span style={{ fontFamily: 'var(--serif)', fontSize: '48px', color: '#888', fontStyle: 'italic' }}>E=MC²(t)</span>
                </div>
                <figcaption>
                  <span className="ec-cap-num">FIG. 01 — PATRON SAINT</span>
                  <span className="ec-cap-text">A homage. The equation, reworked.</span>
                </figcaption>
              </figure>
            </div>
          </div>
          <span className="tbl" /><span className="tbr" />
        </section>

        {/* ===== SECTION 4 — PATHS ===== */}
        <section className="card lt" id="paths">
          <div className="tbar">
            <div className="tdots"><button className="tdot" type="button">×</button><button className="tdot" type="button">−</button><button className="tdot" type="button">↗</button></div>
            <div className="ttl">Pick_Your_Path</div>
            <div className="spacer" />
          </div>
          <div className="cbody">
            <blockquote className="quote-ocr">
              &ldquo;I don&rsquo;t know where I&rsquo;m going. But I know it won&rsquo;t be boring.&rdquo;
              <span className="attr">— David Bowie</span>
            </blockquote>
            <h2 className="h-section">Three ways in.</h2>
            <p className="lede">Three paths. One studio. Each membership ships with a metal VCG_ card, pre-loaded with <strong style={{ fontWeight: 400 }}>Belief Credits</strong>.</p>
            <div className="metal-row" id="metal-row" ref={metalRowRef}>
              <button type="button" className="metal-card silver" aria-label="VCG_X · Titanium · Early Stage" onClick={() => scrollTo('path-x')}>
                <div className="mc-surface" /><div className="mc-shine" /><div className="mc-spec" />
                <div className="mc-tbar"><div className="mc-dots"><span className="mc-dot" /><span className="mc-dot" /><span className="mc-dot" /></div></div>
                <div className="mc-body">
                  <div className="mc-credits">$5K Credits</div>
                  <div className="mc-chip" />
                  <div className="mc-vcg">VCG<span style={{ opacity: 0.6 }}>_</span></div>
                  <div className="mc-tier">VCG_X</div>
                </div>
              </button>
              <button type="button" className="metal-card black" aria-label="VCG_Y · Anodized · Mid Stage" onClick={() => scrollTo('path-y')}>
                <div className="mc-surface" /><div className="mc-shine" /><div className="mc-spec" />
                <div className="mc-tbar"><div className="mc-dots"><span className="mc-dot" /><span className="mc-dot" /><span className="mc-dot" /></div></div>
                <div className="mc-body">
                  <div className="mc-credits">$5K Credits</div>
                  <div className="mc-chip" />
                  <div className="mc-vcg">VCG<span style={{ opacity: 0.6 }}>_</span></div>
                  <div className="mc-tier">VCG_Y</div>
                </div>
              </button>
              <button type="button" className="metal-card bone" aria-label="VCG_Z · Champagne · Late Stage" onClick={() => scrollTo('path-z')}>
                <div className="mc-surface" /><div className="mc-shine" /><div className="mc-spec" />
                <div className="mc-tbar"><div className="mc-dots"><span className="mc-dot" /><span className="mc-dot" /><span className="mc-dot" /></div></div>
                <div className="mc-body">
                  <div className="mc-credits">By Engagement</div>
                  <div className="mc-chip" />
                  <div className="mc-vcg">VCG<span style={{ opacity: 0.6 }}>_</span></div>
                  <div className="mc-tier">VCG_Z</div>
                </div>
              </button>
            </div>
          </div>
          <span className="tbl" /><span className="tbr" />
        </section>

        {/* ===== SECTION 5 — PATH_X ===== */}
        <section className="card" id="path-x">
          <div className="tbar">
            <div className="tdots"><button className="tdot" type="button">×</button><button className="tdot" type="button">−</button><button className="tdot" type="button">↗</button></div>
            <div className="ttl">Path_X · Early_Stage</div>
            <div className="spacer" />
          </div>
          <div className="cbody">
            <div className="eyebrow">FOUNDERS.</div>
            <h2 className="h-section"><span className="it">Building Belief in a Brand New World.</span></h2>
            <p className="lede" style={{ color: '#fff' }}>Begin belief.</p>
            <p className="lede">Five founders. Five weeks. Ten thousand dollars per seat. One container per quarter.</p>
            <div className="container-row">
              {[
                { num: '001', date: '03.01.26', full: true },
                { num: '002', date: '06.01.26', full: true },
                { num: '003', date: '09.01.26', full: false },
                { num: '004', date: '12.01.26', full: false },
              ].map(({ num, date, full }) => (
                <div key={num} className="subwin container-cell">
                  <div className="sw-tbar"><div className="sw-dots"><span className="sw-dot">×</span><span className="sw-dot">−</span><span className="sw-dot">↗</span></div><div className="sw-ttl">CONTAINER_{num}</div></div>
                  <div className="sw-body">
                    <div className="container-date">{date}</div>
                    <div className="container-headline">Building Belief in a Brand New World</div>
                    <div className="container-spec">5 SPOTS · 5 WEEKS<br />5 VISIONARIES<br />$10K / SEAT</div>
                    {full
                      ? <button className="container-status full" type="button" disabled>FULL</button>
                      : <button className="container-status" type="button" onClick={() => openBrief('x')}>APPLY →</button>
                    }
                  </div>
                </div>
              ))}
            </div>
            <div className="subwin pitch-panel" style={{ marginTop: '36px' }}>
              <div className="sw-tbar"><div className="sw-dots"><span className="sw-dot">×</span><span className="sw-dot">−</span><span className="sw-dot">↗</span></div><div className="sw-ttl">VCG_INVESTMENT · PITCH</div></div>
              <div className="sw-body">
                <div className="pp-text">
                  <p>VCG occasionally makes brand investments in ideas, innovations, and technologies we believe in building belief for. Brydon reviews each pitch personally — patience is required. If your worldview is worth scaling, we want to see it.</p>
                </div>
                <button type="button" className="btn" onClick={() => openBrief('x')}>Pitch us <span className="gl">→</span></button>
              </div>
            </div>
          </div>
          <span className="tbl" /><span className="tbr" />
        </section>

        {/* ===== SECTION 6 — PATH_Y ===== */}
        <section className="card lt" id="path-y">
          <div className="tbar">
            <div className="tdots"><button className="tdot" type="button">×</button><button className="tdot" type="button">−</button><button className="tdot" type="button">↗</button></div>
            <div className="ttl">Path_Y · Mid_Stage</div>
            <div className="spacer" />
          </div>
          <div className="cbody">
            <div className="eyebrow">CEOs.</div>
            <h2 className="h-section">Branding &amp; Re-Branding <span className="it">with Belief.</span></h2>
            <p className="lede" style={{ color: '#000' }}>Build the brand.</p>
            <p className="lede" style={{ color: '#333' }}>Three months. Concrete foundations. Brand-new worlds.</p>
            <div className="month-stack">
              {[
                { num: '01', title: 'Foundation', subtitle: 'As solid as', subtitleIt: 'concrete.', tag: '+ Investor Deck · Weekly Office Hours',
                  desc: 'A brand foundation as solid as concrete. An investor deck designed to raise the round. Weekly creative concierge office hours with Brydon.',
                  items: ['VCG_Y Card — physical, $5K studio credit, top-up anytime','Brand Assessment Artifact','Product Assessment Artifact','Business Assessment Artifact','In-Person Workshop (required)','Investment Narrative','Investment Design','Brand Architecture Artifact'] },
                { num: '02', title: 'Worlds', subtitle: 'A world,', subtitleIt: 'made visible.', tag: '+ VCG_LAB Brand Testing',
                  desc: null,
                  items: ['Brand World Development','3 VCG Brand Worlds','VCG_LAB / Brand Testing'] },
                { num: '03', title: 'Launch', subtitle: 'Belief,', subtitleIt: 'in public.', tag: '+ Strategy · Positioning · Branding',
                  desc: null,
                  items: ['Brand Guidelines','Brand Launch page (3 pages)','60s Brand Manifesto Launch Film','60s Brand Product Launch Film','Strategy / Positioning / Branding / Re-Branding'] },
              ].map(({ num, title, subtitle, subtitleIt, tag, desc, items }) => (
                <div key={num} className="subwin month-cell">
                  <div className="sw-tbar"><div className="sw-dots"><span className="sw-dot">×</span><span className="sw-dot">−</span><span className="sw-dot">↗</span></div><div className="sw-ttl">MONTH_{num} · {title.toUpperCase()}</div></div>
                  <div className="sw-body">
                    <div className="month-head">
                      <div>
                        <div className="month-num">{num} — {title}</div>
                        <div className="month-title">{subtitle} <span style={{ fontStyle: 'italic' }}>{subtitleIt}</span></div>
                      </div>
                      <div style={{ fontFamily: 'var(--ocr)', fontSize: '11px', letterSpacing: '0.22em', color: '#666', textTransform: 'uppercase' }}>{tag}</div>
                    </div>
                    {desc && <p style={{ fontFamily: 'var(--sans)', fontSize: '12px', lineHeight: '1.7', color: '#333', marginBottom: '18px', maxWidth: '60ch' }}>{desc}</p>}
                    <ul className="month-deliverables">
                      {items.map(item => <li key={item}>{item}</li>)}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
            <div className="path-pricing" style={{ marginTop: '36px' }}>3 MONTHS · MINIMUM ENGAGEMENT · $250–300K</div>
            <div className="cta-row">
              <button type="button" className="btn lt solid" onClick={() => openBrief('y')}>Send the deck <span className="gl">→</span></button>
              <button type="button" className="btn lt" onClick={() => openBrief('y')}>Inquire <span className="gl">→</span></button>
            </div>
            <p className="body-copy" style={{ color: '#444', marginTop: '24px' }}>VCG occasionally invests into technologies, founders, and ideas we believe in. Submit your pitch deck above — we read every one.</p>
          </div>
          <span className="tbl" /><span className="tbr" />
        </section>

        {/* ===== SECTION 7 — PATH_Z ===== */}
        <section className="card" id="path-z">
          <div className="tbar">
            <div className="tdots"><button className="tdot" type="button">×</button><button className="tdot" type="button">−</button><button className="tdot" type="button">↗</button></div>
            <div className="ttl">Path_Z · Late_Stage_+_Public</div>
            <div className="spacer" />
          </div>
          <div className="cbody">
            <div className="eyebrow">OPERATORS.</div>
            <h2 className="h-section">For the moment that <span className="it">changes everything.</span></h2>
            <p className="lede" style={{ color: '#fff' }}>Make the move.</p>
            <p className="body-copy" style={{ fontSize: '15px', maxWidth: '64ch', marginTop: '24px' }}>
              You are about to sell, IPO, or have a liquidity event. Work with VCG in complete stealth — when you can&rsquo;t use your internal team and can&rsquo;t trust an external one. We have done this for world-class founders, companies, and investment firms. You wouldn&rsquo;t even know it. That&rsquo;s the point. Your NDA is safe with us.
            </p>
            <div style={{ marginTop: '32px', padding: '22px 26px', border: '1px solid #fff', display: 'inline-block' }}>
              <div style={{ fontFamily: 'var(--ocr)', fontSize: '10px', letterSpacing: '0.32em', color: '#888', textTransform: 'uppercase', marginBottom: '8px' }}>Investment</div>
              <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: '32px', color: '#fff', lineHeight: '1' }}>À la carte. Starts at $250K.</div>
            </div>
            <div className="cta-row">
              <button type="button" className="btn solid" onClick={() => openBrief('z')}>Open a file <span className="gl">→</span></button>
            </div>
          </div>
          <span className="tbl" /><span className="tbr" />
        </section>

        {/* ===== SECTION 8 — WORK ===== */}
        <section className="card lt" id="work" ref={workSectionRef}>
          <div className="tbar">
            <div className="tdots"><button className="tdot" type="button">×</button><button className="tdot" type="button">−</button><button className="tdot" type="button">↗</button></div>
            <div className="ttl">Our_Work</div>
            <div className="spacer" />
          </div>
          <div className="work-pops" aria-hidden="true">
            <div className="work-pop" data-enter="0.08" data-exit="0.92" style={{ ['--x' as string]: '8%', ['--y' as string]: '6%', ['--w' as string]: '200px', ['--h' as string]: '140px', ['--rot' as string]: '-3deg' }}>
              <div className="wp-tbar"><span className="wp-dots">×−↗</span><span className="wp-ttl">NASA.GIF</span></div>
              <div className="wp-body"><div className="wp-nasa"><span>NASA</span></div></div>
            </div>
            <div className="work-pop" data-enter="0.14" data-exit="0.88" style={{ ['--x' as string]: '62%', ['--y' as string]: '10%', ['--w' as string]: '240px', ['--h' as string]: '160px', ['--rot' as string]: '2deg' }}>
              <div className="wp-tbar"><span className="wp-dots">×−↗</span><span className="wp-ttl">HEADSPACE.GIF</span></div>
              <div className="wp-body wp-headspace"><div className="hs-dot" /></div>
            </div>
            <div className="work-pop" data-enter="0.22" data-exit="0.84" style={{ ['--x' as string]: '30%', ['--y' as string]: '22%', ['--w' as string]: '220px', ['--h' as string]: '150px', ['--rot' as string]: '-1deg' }}>
              <div className="wp-tbar"><span className="wp-dots">×−↗</span><span className="wp-ttl">APPLE.PNG</span></div>
              <div className="wp-body wp-apple" />
            </div>
            <div className="work-pop" data-enter="0.30" data-exit="0.80" style={{ ['--x' as string]: '74%', ['--y' as string]: '32%', ['--w' as string]: '180px', ['--h' as string]: '120px', ['--rot' as string]: '3deg' }}>
              <div className="wp-tbar"><span className="wp-dots">×−↗</span><span className="wp-ttl">TIME.JPG</span></div>
              <div className="wp-body wp-time"><span>TIME</span></div>
            </div>
            <div className="work-pop" data-enter="0.38" data-exit="0.78" style={{ ['--x' as string]: '6%', ['--y' as string]: '42%', ['--w' as string]: '210px', ['--h' as string]: '150px', ['--rot' as string]: '-2deg' }}>
              <div className="wp-tbar"><span className="wp-dots">×−↗</span><span className="wp-ttl">PLENTY.MP4</span></div>
              <div className="wp-body wp-plenty"><span>PLENTY</span></div>
            </div>
            <div className="work-pop" data-enter="0.46" data-exit="0.74" style={{ ['--x' as string]: '46%', ['--y' as string]: '52%', ['--w' as string]: '230px', ['--h' as string]: '160px', ['--rot' as string]: '1deg' }}>
              <div className="wp-tbar"><span className="wp-dots">×−↗</span><span className="wp-ttl">SUNDANCE.PNG</span></div>
              <div className="wp-body wp-sundance"><span>SUNDANCE<br />FILM<br />FESTIVAL</span></div>
            </div>
            <div className="work-pop" data-enter="0.54" data-exit="0.70" style={{ ['--x' as string]: '78%', ['--y' as string]: '62%', ['--w' as string]: '200px', ['--h' as string]: '140px', ['--rot' as string]: '-2deg' }}>
              <div className="wp-tbar"><span className="wp-dots">×−↗</span><span className="wp-ttl">ONE_BIO.PNG</span></div>
              <div className="wp-body wp-onebio"><span>one bio</span></div>
            </div>
            <div className="work-pop" data-enter="0.60" data-exit="0.68" style={{ ['--x' as string]: '14%', ['--y' as string]: '72%', ['--w' as string]: '220px', ['--h' as string]: '150px', ['--rot' as string]: '2deg' }}>
              <div className="wp-tbar"><span className="wp-dots">×−↗</span><span className="wp-ttl">RISK.JPG</span></div>
              <div className="wp-body wp-risk"><span>RISK</span></div>
            </div>
          </div>
          <div className="cbody">
            <div className="eyebrow">SHORT HISTORY</div>
            <h2 className="h-section">A short history of <span className="it">building belief.</span></h2>
            <p className="work-stanza" style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 'clamp(24px, 3.2vw, 38px)', lineHeight: '1.3', color: '#000', maxWidth: '38ch', marginTop: '36px', textAlign: 'left' }}>
              We helped launch iPhone.<br />
              We wrote Siri&rsquo;s first words.<br />
              We made meditation a category.<br />
              We raised a billion to grow lettuce indoors.<br />
              We&rsquo;re just getting started.
            </p>
            <div className="work-paragraphs">
              <div className="work-para">
                <div className="work-name">Apple / Media Arts Lab</div>
                <p>Under Steve Jobs, on the team that launched iPod, iPhone, iPad, and Apple Watch. With his prior creative partner, wrote the first words Siri spoke in an Apple ad — humanizing the world&rsquo;s first speaking computer.</p>
              </div>
              <div className="work-para">
                <div className="work-name">Headspace</div>
                <p>Built belief and brand for the 3,000-year-old technology of meditation. Cultivated a new wellness category. Pushed &ldquo;mindfulness&rdquo; into the collective consciousness — where it had been absent.</p>
              </div>
              <div className="work-para">
                <div className="work-name">Plenty</div>
                <p>Raised over a billion dollars alongside engineers from SpaceX and Tesla to build a vertical-farming gigafactory. Belief in technology that replaces the sun, uses 99% less land and water, and an AI plant Rosetta Stone that can talk to kale.</p>
              </div>
            </div>
            <p className="lede" style={{ marginTop: '48px', color: '#222' }}>
              VCG works exclusively with founders, thinkers, technologists, scientists, and artists to create <em>A Brand New World.</em>
            </p>
            <div style={{ marginTop: '56px' }}>
              <div className="eyebrow" style={{ color: '#555' }}>BRAND NEW WORLDS · CURRENT PORTFOLIO</div>
              <div className="worlds-list">
                {[
                  { num: '01', name: 'Nocturnal', desc: 'Sleep technology out of MIT that puts to bed the struggle to fall asleep.' },
                  { num: '02', name: 'one.bio', desc: 'An organic chemistry breakthrough turning trees into liquid, and liquid into longevity.' },
                  { num: '03', name: 'CardiaCare', desc: 'Radical health technology connecting life-saving drugs to software and biology.' },
                  { num: '04', name: 'GridBlox', desc: 'Frontline energy innovation giving power to the people in Ukraine.' },
                  { num: '05', name: 'Augur', desc: 'Anti-terrorism technology altering the future of security in the western world.' },
                  { num: '06', name: 'Neurophysm', desc: 'Anti-AI AI that moves the mind from the unconscious to the conscious — brain-mapping neuropsychology to detect patterns and diagnose patients in real time.' },
                ].map(({ num, name, desc }) => (
                  <div key={num} className="subwin world-cell">
                    <div className="sw-tbar"><div className="sw-dots"><span className="sw-dot">×</span><span className="sw-dot">−</span><span className="sw-dot">↗</span></div><div className="sw-ttl">WORLD_{num}</div></div>
                    <div className="sw-body">
                      <div className="world-name">{name}</div>
                      <div className="world-desc">{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <p className="work-disclaimer">
              Because of the classified nature of our work, case studies may only be shared live. Sign the NDA and book a Zoom with Brydon to see specifics.
            </p>
            <div className="cta-row">
              <a href="mailto:studio@vcg.xyz?subject=NDA%20Request" className="btn lt solid">NDA <span className="gl">→</span></a>
              <a href="mailto:studio@vcg.xyz?subject=Zoom%20Booking" className="btn lt">Book Brydon <span className="gl">→</span></a>
            </div>
          </div>
          <span className="tbl" /><span className="tbr" />
        </section>

        {/* ===== SECTION 9 — PROOF ===== */}
        <section className="card" id="proof">
          <div className="tbar">
            <div className="tdots"><button className="tdot" type="button">×</button><button className="tdot" type="button">−</button><button className="tdot" type="button">↗</button></div>
            <div className="ttl">Proof · What_Founders_Say</div>
            <div className="spacer" />
          </div>
          <div className="cbody">
            <div className="eyebrow">PROOF · TRANSCRIPT</div>
            <h2 className="h-section">What founders <span className="it">say after.</span></h2>
            <div className="quote-grid">
              {[
                { idx: 'Q_001', quote: 'Brydon is brilliant.', attr: 'Founder · Headspace' },
                { idx: 'Q_002', quote: 'VCG built the brand world we couldn\'t even articulate.', attr: 'CEO · one.bio' },
                { idx: 'Q_003', quote: 'They moved a $1B raise with a deck.', attr: 'Investor · Plenty' },
              ].map(({ idx, quote, attr }) => (
                <figure key={idx} className="quote-cell">
                  <div className="quote-idx">{idx}</div>
                  <blockquote className="quote-body"><span className="qmark">&ldquo;</span>{quote}</blockquote>
                  <figcaption className="quote-attr">{attr}</figcaption>
                </figure>
              ))}
            </div>
          </div>
          <span className="tbl" /><span className="tbr" />
        </section>

        {/* ===== SECTION 10 — BOOK ===== */}
        <section className="card lt" id="book">
          <div className="tbar">
            <div className="tdots"><button className="tdot" type="button">×</button><button className="tdot" type="button">−</button><button className="tdot" type="button">↗</button></div>
            <div className="ttl">VCG_Press · Brand_New_World</div>
            <div className="spacer" />
          </div>
          <div className="cbody">
            <div className="eyebrow">VCG PRESS · 2026</div>
            <h2 className="h-section">A field guide to <span className="it">belief.</span></h2>
            <div className="book-wrap">
              <div className="book-visual">
                <div className="book-cover" aria-label="Book cover: Brand New World">
                  <div>
                    <div className="kicker">VCG Press · 2026</div>
                    <div className="t1">Brand<br />New<br /><span className="it">World.</span></div>
                  </div>
                  <div>
                    <div className="byline">by Brydon Gerus</div>
                    <div className="publisher">VCG_</div>
                  </div>
                </div>
              </div>
              <div>
                <h3 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: '36px', lineHeight: '1.05', letterSpacing: '-0.02em', color: '#000' }}>
                  <em>Brand New World</em><br />by Brydon Gerus.
                </h3>
                <p className="lede" style={{ color: '#333' }}>A founder&rsquo;s manual on belief as technology — from the man who scaled it inside Apple, Headspace, Plenty, and a generation of brand-new worlds.</p>
                <div className="cta-row">
                  <button type="button" className="btn lt solid" onClick={() => setInquireOpen(true)}>Pre-order <span className="gl">→</span></button>
                </div>
              </div>
            </div>
          </div>
          <span className="tbl" /><span className="tbr" />
        </section>

        {/* ===== SECTION 11 — ZINE ===== */}
        <section className="card" id="zine">
          <div className="tbar">
            <div className="tdots"><button className="tdot" type="button">×</button><button className="tdot" type="button">−</button><button className="tdot" type="button">↗</button></div>
            <div className="ttl">Brand_New_World_Monthly</div>
            <div className="spacer" />
          </div>
          <div className="cbody">
            <div className="eyebrow">SUBSCRIBE · MONTHLY ZINE</div>
            <h2 className="h-section">Brand New World <span className="it">Monthly.</span></h2>
            <p className="lede">A monthly zine on belief, brand, technology, and humanity. Written by Brydon. Delivered first of the month.</p>
            {!zineSubmitted ? (
              <form className="zine-form" noValidate onSubmit={e => { e.preventDefault(); setZineSubmitted(true); }}>
                <input type="email" required className="zine-input" placeholder="founder@company.com" aria-label="Email address" />
                <button type="submit" className="zine-submit">Subscribe →</button>
              </form>
            ) : (
              <div style={{ marginTop: '18px', fontFamily: 'var(--ocr)', fontSize: '12px', letterSpacing: '0.22em', color: '#fff' }}>
                ✓ &nbsp; YOU&rsquo;RE ON THE LIST.
              </div>
            )}
          </div>
          <span className="tbl" /><span className="tbr" />
        </section>

        {/* ===== SECTION 12 — ATELIER ===== */}
        <section className="card lt" id="atelier">
          <div className="tbar">
            <div className="tdots"><button className="tdot" type="button">×</button><button className="tdot" type="button">−</button><button className="tdot" type="button">↗</button></div>
            <div className="ttl">VCG_Atelier</div>
            <div className="spacer" />
          </div>
          <div className="cbody">
            <blockquote className="quote-ocr">
              &ldquo;Sweatpants are a sign of defeat. You lost control of your life, so you bought some sweatpants.&rdquo;
              <span className="attr">— Karl Lagerfeld</span>
            </blockquote>
            <div className="eyebrow">VCG_ATELIER · IN-HOUSE PRODUCTION</div>
            <h2 className="h-section">Design is direction. <span className="it">Not decoration.</span></h2>
            <p className="lede" style={{ color: '#333' }}>Brydon shoots on iPhone. So does the campaign.</p>
            <p className="body-copy" style={{ color: '#333', fontSize: '14px', maxWidth: '64ch', marginTop: '22px' }}>
              Brydon got his start in 1990s Milan fashion and continues an artistic and photographic practice. With Sharleen Gerus, he created a one-off sustainable fashion line — a two-year experiment in temporality as commentary on fast-fashion waste. At Media Arts Lab, he helped build belief that anyone could be a photographer, leading to &ldquo;Shot on iPhone&rdquo; — a campaign that turned the city into a gallery.
            </p>
            <p className="body-copy" style={{ color: '#333', fontSize: '14px', maxWidth: '64ch', marginTop: '18px' }}>
              Brydon still shoots on iPhone. He offers a select production package for your brand: concept, models, photography, film — one package.
            </p>
            <div className="atelier-pricing">
              <span className="price">$50K</span> · ONE PACKAGE<br />
              CONCEPT, CASTING, PHOTOGRAPHY, FILM · SHOT ON iPHONE
            </div>
            <div className="cta-row">
              <button type="button" className="btn lt solid" onClick={() => setInquireOpen(true)}>Inquire <span className="gl">→</span></button>
            </div>
          </div>
          <span className="tbl" /><span className="tbr" />
        </section>

        <div className="desktop-spacer" aria-hidden="true" />
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="site-footer">
        <div>
          <div className="vcg-footer-mark">VCG<span className="blink-cursor">_</span></div>
          <div style={{ marginTop: '8px' }}>The Venture Creative Group</div>
        </div>
        <div className="center" style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', letterSpacing: '0', textTransform: 'none', fontSize: '13px', color: '#aaa' }}>
          Belief, designed.
        </div>
        <div className="right">
          <a href="mailto:studio@vcg.xyz?subject=NDA">NDA</a> &nbsp;·&nbsp;
          <button type="button" style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', padding: 0, fontFamily: 'inherit', fontSize: 'inherit', letterSpacing: 'inherit', textTransform: 'inherit' }} onClick={() => setBnwOpen(true)}>Subscribe</button> &nbsp;·&nbsp;
          <a href="mailto:studio@vcg.xyz">Contact</a><br />
          <span style={{ opacity: 0.6, marginTop: '6px', display: 'inline-block' }}>© 2026 VCG_</span>
        </div>
      </footer>

      {/* ===== INQUIRE MODAL ===== */}
      {inquireOpen && (
        <div className={`inq-overlay show`} role="dialog" aria-modal="true" onClick={e => { if (e.target === e.currentTarget) setInquireOpen(false); }}>
          <div className="inq-modal">
            <div className="inq-tbar">
              <div className="ttl">VCG_INQUIRE</div>
              <button type="button" className="inq-close" aria-label="Close" onClick={() => setInquireOpen(false)}>×</button>
            </div>
            <div className="inq-body">
              {!inquireSubmitted ? (
                <form className="inq-form" noValidate onSubmit={e => { e.preventDefault(); setInquireSubmitted(true); }}>
                  <div className="inq-eyebrow">Request · Private</div>
                  <h3 className="inq-headline">Inquire.</h3>
                  <p className="inq-lede">Enter your email. We respond within 24 hours.</p>
                  <div className="inq-field">
                    <label className="inq-label" htmlFor="inq-name">Name</label>
                    <input type="text" className="inq-input" id="inq-name" name="name" autoComplete="name" placeholder="Your name" />
                  </div>
                  <div className="inq-field">
                    <label className="inq-label" htmlFor="inq-email">Email</label>
                    <input type="email" required className="inq-input" id="inq-email" name="email" placeholder="founder@company.com" autoComplete="email" />
                  </div>
                  <div className="inq-field">
                    <label className="inq-label" htmlFor="inq-company">Company</label>
                    <input type="text" className="inq-input" id="inq-company" name="company" placeholder="Company" />
                  </div>
                  <button type="submit" className="inq-submit">Send →</button>
                </form>
              ) : (
                <div className="inq-thanks show">
                  <div className="inq-glyph">✓</div>
                  <h3 className="inq-headline" style={{ marginBottom: '8px' }}>Received.</h3>
                  <p className="inq-lede">Brydon reads every note. Reply within 24 hours.</p>
                  <button type="button" className="inq-submit" style={{ marginTop: '14px' }} onClick={() => setInquireOpen(false)}>Close</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== BRIEF MODAL ===== */}
      {briefOpen && (
        <div className="inq-overlay show" role="dialog" aria-modal="true" onClick={e => { if (e.target === e.currentTarget) setBriefOpen(false); }}>
          <div className="inq-modal">
            <div className="inq-tbar">
              <div className="ttl">VCG_BRIEF</div>
              <button type="button" className="inq-close" aria-label="Close" onClick={() => setBriefOpen(false)}>×</button>
            </div>
            <div className="inq-body">
              {!briefSubmitted ? (
                <form className="inq-form" noValidate onSubmit={e => { e.preventDefault(); setBriefSubmitted(true); }}>
                  <div className="inq-eyebrow">VCG_BRIEF</div>
                  <h3 className="inq-headline">Brief us.</h3>
                  <p className="inq-lede">Tell us where you are. We respond within 24 hours.</p>
                  <div className="inq-field">
                    <label className="inq-label">Path</label>
                    <div className="inq-radios">
                      {(['x', 'y', 'z'] as BriefPath[]).map(p => (
                        <label key={p} className="inq-radio">
                          <input type="radio" name="path" value={p || ''} defaultChecked={briefPath === p} /> Path_{p?.toUpperCase()} · {p === 'x' ? '$10K' : p === 'y' ? '$250–300K' : '$250K+'}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="inq-field">
                    <label className="inq-label" htmlFor="brief-name">Name</label>
                    <input type="text" className="inq-input" id="brief-name" name="name" autoComplete="name" placeholder="Your name" />
                  </div>
                  <div className="inq-field">
                    <label className="inq-label" htmlFor="brief-email">Email</label>
                    <input type="email" required className="inq-input" id="brief-email" name="email" autoComplete="email" placeholder="founder@company.com" />
                  </div>
                  <div className="inq-field">
                    <label className="inq-label" htmlFor="brief-company">Company</label>
                    <input type="text" className="inq-input" id="brief-company" name="company" placeholder="Company name" />
                  </div>
                  <div className="inq-field">
                    <label className="inq-label" htmlFor="brief-message">Message</label>
                    <textarea className="inq-textarea" id="brief-message" name="message" placeholder="Where you are. What you need. Three lines is enough." />
                  </div>
                  <button type="submit" className="inq-submit">Submit →</button>
                </form>
              ) : (
                <div className="inq-thanks show">
                  <div className="inq-glyph">✓</div>
                  <h3 className="inq-headline" style={{ marginBottom: '8px' }}>Brief received.</h3>
                  <p className="inq-lede">Brydon reads every brief personally. Reply within 24 hours.</p>
                  <button type="button" className="inq-submit" style={{ marginTop: '14px' }} onClick={() => setBriefOpen(false)}>Close</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== BRAND SCANNER MODAL ===== */}
      {scannerOpen && (
        <div className="scan-overlay show" role="dialog" aria-modal="true" onClick={e => { if (e.target === e.currentTarget) { setScannerOpen(false); setScanStep(1); } }}>
          <div className="scan-modal">
            <div className="scan-tbar">
              <div className="tdots">
                <button className="tdot" type="button" onClick={() => { setScannerOpen(false); setScanStep(1); }}>×</button>
                <button className="tdot" type="button">−</button>
                <button className="tdot" type="button">↗</button>
              </div>
              <div className="ttl" id="scan-ttl">Brand_Scanner.exe — STEP {scanStep} OF 4</div>
            </div>
            <div className="scan-body">
              {scanStep === 1 && (
                <div className="scan-step show">
                  <p className="scan-prompt">Paste your brand URL.</p>
                  <input type="url" className="scan-input" placeholder="https://yourbrand.com" value={scanUrl} onChange={e => setScanUrl(e.target.value)} autoComplete="url" />
                  <div className="scan-actions">
                    <button type="button" className="bnw-btn primary" disabled={!scanUrl} onClick={() => setScanStep(2)}>Continue →</button>
                  </div>
                </div>
              )}
              {scanStep === 2 && (
                <div className="scan-step show">
                  <p className="scan-prompt">To unlock your scan, create a VCG account.</p>
                  <div className="scan-grid2">
                    <div className="scan-field"><label className="scan-label" htmlFor="scan-name">Name *</label><input type="text" className="scan-input" id="scan-name" value={scanName} onChange={e => setScanName(e.target.value)} autoComplete="name" /></div>
                    <div className="scan-field"><label className="scan-label" htmlFor="scan-email">Email *</label><input type="email" className="scan-input" id="scan-email" value={scanEmail} onChange={e => setScanEmail(e.target.value)} autoComplete="email" /></div>
                    <div className="scan-field"><label className="scan-label" htmlFor="scan-phone">Phone *</label><input type="tel" className="scan-input" id="scan-phone" value={scanPhone} onChange={e => setScanPhone(e.target.value)} autoComplete="tel" /></div>
                    <div className="scan-field"><label className="scan-label" htmlFor="scan-company">Company *</label><input type="text" className="scan-input" id="scan-company" value={scanCompany} onChange={e => setScanCompany(e.target.value)} autoComplete="organization" /></div>
                  </div>
                  <div className="scan-actions">
                    <button type="button" className="bnw-btn primary" disabled={!scanName || !scanEmail} onClick={() => setScanStep(3)}>Run scan →</button>
                  </div>
                </div>
              )}
              {scanStep === 3 && (
                <ScanProgress onDone={() => setScanStep(4)} />
              )}
              {scanStep === 4 && (
                <div className="scan-step show">
                  <div className="scan-result-label">BRAND SCORE</div>
                  <div className="scan-result-score">72</div>
                  <span className="scan-verdict">SIGNAL · BUILDING</span>
                  <div className="scan-subgrid">
                    <div className="scan-sub"><div className="scan-sub-label">Mass</div><div className="scan-sub-val">6.8</div></div>
                    <div className="scan-sub"><div className="scan-sub-label">Cultural Energy</div><div className="scan-sub-val">7.4</div></div>
                    <div className="scan-sub"><div className="scan-sub-label">Consistency²</div><div className="scan-sub-val">6.1</div></div>
                    <div className="scan-sub"><div className="scan-sub-label">Time</div><div className="scan-sub-val">5.9</div></div>
                  </div>
                  <div className="scan-recs-head">RECOMMENDATIONS</div>
                  <div className="scan-recs">
                    <div className="scan-rec"><b>01</b> Define your core belief statement before the next campaign.</div>
                    <div className="scan-rec"><b>02</b> Cultural mass is building — consistency will compound it.</div>
                    <div className="scan-rec"><b>03</b> Ready for a VCG_Y engagement. Book a conversation.</div>
                  </div>
                  <div className="scan-actions" style={{ justifyContent: 'space-between', marginTop: '28px' }}>
                    <button type="button" className="bnw-btn primary" onClick={() => { setScannerOpen(false); setScanStep(1); setInquireOpen(true); }}>Talk to Brydon →</button>
                    <button type="button" className="bnw-btn" onClick={() => { setScannerOpen(false); setScanStep(1); }}>Close</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== BRAND NEW WORLD ALERT ===== */}
      {bnwOpen && (
        <div className="bnw-overlay show" role="dialog" aria-modal="true" onClick={e => { if (e.target === e.currentTarget) setBnwOpen(false); }}>
          <div className="bnw-modal">
            <div className="bnw-tbar">
              <div className="tdots">
                <button className="tdot" type="button" onClick={() => setBnwOpen(false)}>×</button>
                <button className="tdot" type="button">−</button>
                <button className="tdot" type="button">↗</button>
              </div>
              <div className="ttl">A_Brand_New_World.alert</div>
            </div>
            <div className="bnw-body">
              <div className="bnw-icon" aria-hidden="true">i</div>
              <h3 className="bnw-headline">A Brand New World.</h3>
              <p className="bnw-text">Enter your email to hear from A Brand New World.</p>
              <input type="email" className="bnw-input" placeholder="founder@company.com" autoComplete="email" />
              <div className="bnw-actions">
                <button type="button" className="bnw-btn" onClick={() => setBnwOpen(false)}>Not Now</button>
                <button type="button" className="bnw-btn primary" onClick={() => setBnwOpen(false)}>Subscribe</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ScanProgress({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);
  const [lines, setLines] = useState<string[]>([]);
  const LOG_LINES = [
    'Connecting to brand endpoint…',
    'Analysing visual identity…',
    'Measuring cultural mass…',
    'Calculating consistency index…',
    'Running belief equation…',
    'Generating score…',
  ];

  useEffect(() => {
    let p = 0;
    const id = setInterval(() => {
      p += 100 / (9 * 10);
      setProgress(Math.min(p, 100));
      const lineIdx = Math.floor((p / 100) * LOG_LINES.length);
      setLines(LOG_LINES.slice(0, Math.min(lineIdx + 1, LOG_LINES.length)));
      if (p >= 100) { clearInterval(id); setTimeout(onDone, 400); }
    }, 100);
    return () => clearInterval(id);
  }, [onDone]);

  return (
    <div className="scan-step show">
      <p className="scan-prompt" style={{ textAlign: 'center' }}>Scanning…</p>
      <div className="scan-progress-wrap"><div className="scan-progress" style={{ width: `${progress}%`, transition: 'none' }} /></div>
      <div className="scan-log">
        {lines.map((line, i) => <div key={i} className="line show">{line}</div>)}
      </div>
    </div>
  );
}
