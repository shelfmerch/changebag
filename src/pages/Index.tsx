'use client';

import React, {
  useEffect, useRef, useState, useCallback, type FC,
} from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import s from './Index.module.css';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';

// ─────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────
interface BagConfig {
  bag: string; shade: string; dark: string; accent: string;
  l1: string; l2: string; m1: string; m2: string; ngo: string;
}
type BagKey = 'indigo' | 'forest' | 'saffron';

interface CalcState {
  bags: number;
  impressions: string;
  plastic: string;
  co2: string;
  donation: string;
  cities: string;
  cpm: string;
  bagLabel: string;
  impLabel: string;
  plasticLabel: string;
}

// ─────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────
const TICKER_ITEMS = [
  { num: '1.2M+', text: 'bags distributed' },
  { num: 'NDTV · Outlook · HT · ET', text: 'Featured in' },
  { num: '10,400 KG', text: 'CO₂ reduced' },
  { num: 'Indian Army · IndianOil · Dr. Agarwals', text: 'Trusted by' },
  { num: '500', text: 'plastic bags replaced per tote' },
  { num: '₹65M+', text: 'ad value generated' },
  { num: '200K+', text: 'citizens engaged' },
];

const BAGS: Record<BagKey, BagConfig> = {
  indigo: { bag: '#dde5f5', shade: '#b8c8e8', dark: '#8aa0cc', accent: '#1a3c8f', l1: 'AQUA', l2: 'CORP', m1: 'Save Water,', m2: 'Save Life', ngo: 'ChangeBag × Water Aid India' },
  forest: { bag: '#d8ead0', shade: '#aecca0', dark: '#88aa78', accent: '#0d3d22', l1: 'ECO', l2: 'BRAND', m1: 'Plant More', m2: 'Trees Today', ngo: 'ChangeBag × Green Mission India' },
  saffron: { bag: '#fdebd8', shade: '#f5cfa8', dark: '#e0a870', accent: '#c45000', l1: 'VIDYA', l2: 'CO.', m1: 'Every Child', m2: 'Deserves School', ngo: 'ChangeBag × Pratham Foundation' },
};

const CAUSES = [
  {
    _id: '6867ca8e3d40d2af0eb2f3ad',
    img: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&auto=format&fit=crop&q=80',
    alt: 'Forest trees',
    title: 'Plant More Trees',
    cat: 'Environment', catClass: 'catEnv' as const,
    desc: 'India lost over 1.2 million hectares of forest cover from 2001–2020 due to deforestation and urban expansion. With air pollution levels among the worst globally, urban forests are critical for climate resilience, biodiversity, and clean air...',
    buttons: [{ label: 'Claim a Tote', variant: 'black' as const }],
  },
  {
    _id: '6867c9813d40d2af0eb2f3a8',
    img: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80',
    alt: 'Hands and water',
    title: 'Save Water Save Life',
    cat: 'Environment', catClass: 'catEnv' as const,
    desc: 'India is facing a severe water crisis — 600 million people live in areas of high to extreme water stress. 21 major cities, including Delhi, Bengaluru, and Chennai, are projected to run out of groundwater by 2030...',
    buttons: [
      { label: 'Claim a Tote', variant: 'black' as const },
      { label: 'Sponsor This Cause', variant: 'green' as const },
    ],
  },
  {
    _id: '6867c7bd3d40d2af0eb2f326',
    img: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&auto=format&fit=crop&q=80',
    alt: 'Mental health',
    title: 'Mental Health Matters',
    cat: 'Healthcare', catClass: 'catHealth' as const,
    desc: 'India has one of the largest mental health burdens globally — more than 200 million people suffer from depression, anxiety, and other disorders. Yet mental health remains deeply stigmatised, with less than 1 psychiatrist per 100,000 people...',
    buttons: [
      { label: 'Sponsor This Cause', variant: 'green' as const },
      { label: 'Join Waitlist', variant: 'outline' as const },
    ],
  },
];

const TESTIMONIALS = [
  {
    quote: 'The campaign gave us a visible, physical presence in communities we had never reached through digital or OOH. People were carrying our brand into markets and homes for months.',
    name: 'CSR Head', role: 'IndianOil Corporation Ltd.',
    tag: 'Green Mission Campaign', bg: '#1a3c6b', initials: 'IO',
    delay: '0s',
  },
  {
    quote: 'We saw recruitment enquiry spikes in cities 3 weeks after bag distribution. The connection between a physical touchpoint and a digital response was something we had not expected.',
    name: 'Campaign Director', role: 'Indian Army Recruitment',
    tag: 'Join Indian Army Campaign', bg: '#2d2d24', initials: 'IA',
    delay: '0.1s',
  },
  {
    quote: 'Conversion from bag QR scan to clinic appointment was something we did not expect at all. It became our most efficient community acquisition channel in both pilot cities.',
    name: 'Marketing Head', role: 'Dr. Agarwals Eye Care',
    tag: 'Digital Detox Campaign', bg: '#0d3d22', initials: 'DA',
    delay: '0.2s',
  },
];

const NGO_CARDS = [
  { bg: '#e8f5ee', icon: '🎁', title: 'Zero cost, full visibility', body: "No budget required. Your NGO's message and branding appear on every bag distributed under your partnered campaigns." },
  { bg: '#fff8e6', icon: '💰', title: '₹10 per bag — direct to your cause', body: "A portion of every sponsorship is donated directly to your organisation. At 10,000 bags, that's ₹1 lakh with no fundraising effort." },
  { bg: '#e6f0ff', icon: '📣', title: 'Everyday awareness', body: 'Citizens become walking ambassadors for your cause. Every time the bag is used, your message travels somewhere new.' },
  { bg: '#fce8e8', icon: '🤝', title: 'Co-branded campaigns', body: 'Joint storytelling with the sponsoring brand builds credibility and brings your cause to their entire customer audience.' },
];

const COMPARE_TRADITIONAL = [
  'Impressions last seconds, then gone',
  '₹3–8 cost per impression (OOH)',
  'No emotional connection to cause',
  'Unmeasurable real-world results',
  'Zero environmental benefit',
  'Does not qualify for CSR reporting',
  'No brand ambassador creation',
];

const COMPARE_CHANGEBAG = [
  { text: '200+ uses per bag = 50,000+ lifetime impressions', hl: true },
  { text: '₹0.04–0.08 cost per impression', hl: true },
  { text: 'Carried by believers of your cause', hl: false },
  { text: 'Real-time dashboard: scans, reach, geography', hl: false },
  { text: '500+ plastic bags replaced per tote', hl: false },
  { text: 'ESG impact report for board & SEBI filing', hl: true },
  { text: '50K+ organic brand ambassadors nationwide', hl: false },
];

const STEPS = [
  { n: '1', title: 'Choose your cause', body: 'Register on the platform, pick a social cause that aligns with your brand values — environment, education, health, national service.' },
  { n: '2', title: 'Set your campaign', body: 'Select quantity, target geography, and distribution timeline. Upload your logo and brand message. Get a live price instantly.' },
  { n: '3', title: 'We handle everything', body: 'Design, production, logistics, and hyperlocal distribution to markets, campuses, and communities — end to end.' },
  { n: '4', title: 'Track live impact', body: 'Your real-time dashboard shows QR scans, impressions, geographic spread, and the ESG impact report for your board.' },
];

const FEATURES = [
  { icon: '📍', title: 'Mobile billboards in real communities', body: "Your brand travels to vegetable markets, railway stations, college campuses, and housing colonies — places outdoor advertising can't reach." },
  { icon: '📈', title: 'Real-time impact dashboard', body: 'Track QR scans, impressions, city-wise distribution, and citizen engagement as it happens. Export the ESG report in one click.' },
  { icon: '⚡', title: 'Plug-and-play activation', body: 'Upload logo, choose cause, confirm budget. We handle design, production, and national distribution. No agency needed.' },
  { icon: '🎯', title: 'CSR & ESG compliance built-in', body: 'Every campaign generates a certified impact report aligned with SEBI ESG disclosure norms — ready for your annual report and board presentation.' },
];

// ─────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────
function fmtIndian(n: number): string {
  if (n >= 10_000_000) return `${(n / 10_000_000).toFixed(n % 10_000_000 === 0 ? 0 : 1)} Crore+`;
  if (n >= 100_000) return `${(n / 100_000).toFixed(n % 100_000 === 0 ? 0 : 1)} Lakh`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1)}K`;
  return String(n);
}
function fmtMoney(n: number): string {
  if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(1)} Cr`;
  if (n >= 100_000) return `₹${(n / 100_000).toFixed(1)} L`;
  if (n >= 1_000) return `₹${Math.round(n / 1_000)},000`;
  return `₹${n}`;
}
function citiesFromBags(b: number): string {
  if (b <= 500) return '1 city';
  if (b <= 2_000) return '1–2 cities';
  if (b <= 5_000) return '2–4 cities';
  if (b <= 10_000) return '4–8 cities';
  if (b <= 25_000) return '10–20 cities';
  if (b <= 50_000) return '25–50 cities';
  return '100+ cities';
}
function calcCPM(b: number): string {
  if (b >= 50_000) return '₹0.03';
  if (b >= 10_000) return '₹0.05';
  return '₹0.06';
}
function formatBagCount(b: number): string {
  if (b >= 100_000) return '1 Lakh';
  if (b >= 1_000) return `${(b / 1_000).toFixed(b % 1_000 === 0 ? 0 : 1)}000`;
  return String(b);
}
function computeCalc(bags: number): CalcState {
  const imp = bags * 200;
  const pl = bags * 500;
  const co2 = bags * 27.5;
  const don = bags * 10;
  return {
    bags,
    impressions: fmtIndian(imp),
    plastic: fmtIndian(pl),
    co2: co2 >= 1_000 ? `${(co2 / 1_000).toFixed(1)} Tonnes` : `${Math.round(co2)} KG`,
    donation: fmtMoney(don),
    cities: citiesFromBags(bags),
    cpm: calcCPM(bags),
    bagLabel: bags >= 100_000 ? '1 lakh bags' : `${fmtIndian(bags)} bags`,
    impLabel: `${fmtIndian(imp)} people`,
    plasticLabel: `${fmtIndian(pl)} plastic bags`,
  };
}

// Build SVG tote bag string
function buildToteSVG(k: BagKey): string {
  const c = BAGS[k];
  return `<svg width="290" height="370" viewBox="0 0 290 370" fill="none" xmlns="http://www.w3.org/2000/svg">
<defs>
  <linearGradient id="bg${k}" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${c.bag}"/><stop offset="100%" stop-color="${c.shade}"/></linearGradient>
  <linearGradient id="sg${k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${c.dark}"/><stop offset="100%" stop-color="${c.shade}"/></linearGradient>
  <filter id="sh${k}"><feDropShadow dx="0" dy="10" stdDeviation="14" flood-color="rgba(0,0,0,0.18)"/></filter>
  <clipPath id="cl${k}"><path d="M45 96 L245 96 L264 360 L26 360 Z"/></clipPath>
</defs>
<path d="M97 96 C97 96 85 50 99 22 C106 8 119 2 135 4 C151 6 159 20 155 38 C151 56 145 76 145 96" stroke="url(#sg${k})" stroke-width="13" stroke-linecap="round" fill="none"/>
<path d="M149 96 C149 96 161 50 147 22 C140 8 127 2 111 4 C95 6 87 20 91 38 C95 56 101 76 101 96" stroke="url(#sg${k})" stroke-width="13" stroke-linecap="round" fill="none"/>
<path d="M45 96 L245 96 L264 360 L26 360 Z" fill="url(#bg${k})" filter="url(#sh${k})"/>
<path d="M26 360 L45 96 L68 96 L49 360 Z" fill="${c.dark}" opacity="0.22"/>
<path d="M264 360 L245 96 L222 96 L241 360 Z" fill="${c.dark}" opacity="0.18"/>
<rect x="41" y="90" width="208" height="12" rx="3" fill="${c.dark}" opacity="0.38"/>
<g clip-path="url(#cl${k})" opacity="0.16">
  <line x1="26" y1="140" x2="264" y2="140" stroke="${c.dark}" stroke-width="0.6"/>
  <line x1="26" y1="188" x2="264" y2="188" stroke="${c.dark}" stroke-width="0.6"/>
  <line x1="26" y1="236" x2="264" y2="236" stroke="${c.dark}" stroke-width="0.6"/>
  <line x1="26" y1="284" x2="264" y2="284" stroke="${c.dark}" stroke-width="0.6"/>
  <line x1="26" y1="332" x2="264" y2="332" stroke="${c.dark}" stroke-width="0.6"/>
</g>
<g clip-path="url(#cl${k})">
  <rect x="92" y="110" width="106" height="50" rx="7" fill="${c.accent}" opacity="0.1"/>
  <text x="145" y="130" font-family="DM Sans,sans-serif" font-size="12" font-weight="700" fill="${c.accent}" text-anchor="middle" letter-spacing="2.5">${c.l1}</text>
  <text x="145" y="148" font-family="DM Sans,sans-serif" font-size="12" font-weight="700" fill="${c.accent}" text-anchor="middle" letter-spacing="2.5">${c.l2}</text>
  <text x="145" y="109" font-family="DM Sans,sans-serif" font-size="7" font-weight="600" fill="${c.accent}" text-anchor="middle" opacity="0.4" letter-spacing="1">&#x2460; BRAND LOGO</text>
  <line x1="72" y1="175" x2="218" y2="175" stroke="${c.accent}" stroke-width="0.8" opacity="0.2"/>
  <text x="145" y="196" font-family="Instrument Serif,Georgia,serif" font-size="18" fill="${c.accent}" text-anchor="middle" font-style="italic">${c.m1}</text>
  <text x="145" y="218" font-family="Instrument Serif,Georgia,serif" font-size="18" fill="${c.accent}" text-anchor="middle" font-style="italic">${c.m2}</text>
  <text x="145" y="188" font-family="DM Sans,sans-serif" font-size="7" font-weight="600" fill="${c.accent}" text-anchor="middle" opacity="0.38" letter-spacing="1">&#x2461; CAUSE MESSAGE</text>
  <g transform="translate(62,242)">
    <rect width="48" height="48" rx="5" fill="white" opacity="0.88"/>
    <rect x="5" y="5" width="13" height="13" rx="1" fill="${c.accent}" opacity="0.85"/><rect x="7" y="7" width="3" height="3" fill="white"/>
    <rect x="30" y="5" width="13" height="13" rx="1" fill="${c.accent}" opacity="0.85"/><rect x="32" y="7" width="3" height="3" fill="white"/>
    <rect x="5" y="30" width="13" height="13" rx="1" fill="${c.accent}" opacity="0.85"/><rect x="7" y="32" width="3" height="3" fill="white"/>
    <rect x="22" y="22" width="4" height="4" fill="${c.accent}" opacity="0.7"/>
    <rect x="28" y="22" width="4" height="4" fill="${c.accent}" opacity="0.7"/>
    <rect x="34" y="22" width="4" height="4" fill="${c.accent}" opacity="0.7"/>
    <rect x="22" y="28" width="4" height="4" fill="${c.accent}" opacity="0.7"/>
    <rect x="34" y="28" width="4" height="4" fill="${c.accent}" opacity="0.7"/>
    <rect x="28" y="34" width="4" height="4" fill="${c.accent}" opacity="0.7"/>
    <rect x="34" y="34" width="4" height="4" fill="${c.accent}" opacity="0.7"/>
  </g>
  <text x="86" y="241" font-family="DM Sans,sans-serif" font-size="7" font-weight="600" fill="${c.accent}" text-anchor="middle" opacity="0.35" letter-spacing="1">&#x2462; QR</text>
  <text x="120" y="255" font-family="DM Sans,sans-serif" font-size="8" font-weight="500" fill="${c.accent}" opacity="0.38">Scan to learn more</text>
  <text x="120" y="267" font-family="DM Sans,sans-serif" font-size="7" fill="${c.accent}" opacity="0.25">changebag.org/campaign</text>
  <text x="145" y="336" font-family="DM Sans,sans-serif" font-size="7.5" font-weight="500" fill="${c.accent}" text-anchor="middle" opacity="0.48">${c.ngo}</text>
  <text x="145" y="327" font-family="DM Sans,sans-serif" font-size="6.5" font-weight="600" fill="${c.accent}" text-anchor="middle" opacity="0.3" letter-spacing="1">&#x2463; NGO CO-BRAND</text>
</g>
<ellipse cx="145" cy="360" rx="118" ry="6" fill="${c.dark}" opacity="0.25"/>
</svg>`;
}

// ─────────────────────────────────────────────────────────────────────
// Custom hooks
// ─────────────────────────────────────────────────────────────────────

/** Adds `visible` class when element enters viewport (threshold 0.12) */
function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add(s.visible); observer.unobserve(e.target); } }),
      { threshold: 0.12 },
    );
    const timer = setTimeout(() => {
      document.querySelectorAll(`.${s.reveal}`).forEach((el) => observer.observe(el));
    }, 50);
    return () => { clearTimeout(timer); observer.disconnect(); };
  }, []);
}

/** Adds `scrolled` class to nav when scrollY > 10 */
function useNavShadow(navRef: React.RefObject<HTMLElement>) {
  useEffect(() => {
    const fn = () => navRef.current?.classList.toggle(s.scrolled, window.scrollY > 10);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, [navRef]);
}

// ─────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────

const Ticker: FC = () => {
  const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className={s.ticker}>
      <div className={s.tickerTrack}>
        {doubled.map((item, i) => (
          <span key={i} className={s.tickerItem}>
            <span className={s.tickerNum}>{item.num}</span>
            {item.text}
            <span className={s.tickerDot} />
          </span>
        ))}
      </div>
    </div>
  );
};

const TrustedBy: FC = () => (
  <div className={s.trusted}>
    <div className={s.container}>
      <p className={s.trustedLabel}>Trusted by brands &amp; institutions</p>
      <div className={s.trustedLogos}>
        {[
          { name: 'IndianOil', type: 'PSU · Energy' },
          { name: 'Indian Army', type: 'Government' },
          { name: 'Dr. Agarwals', type: 'Healthcare' },
        ].map((b) => (
          <div key={b.name} className={s.trustedLogo}>
            <div className={s.trustedLogoName}>{b.name}</div>
            <div className={s.trustedLogoType}>{b.type}</div>
          </div>
        ))}
        <div className={`${s.trustedLogo} ${s.trustedLogoDashed}`}>
          <div className={s.trustedLogoName} style={{ color: 'var(--ink-soft)' }}>Your Brand</div>
          <div className={s.trustedLogoType}>Could be here</div>
        </div>
      </div>
    </div>
  </div>
);

// Impact calculator component
const ImpactCalculator: FC<{ onContact: () => void }> = ({ onContact }) => {
  const PRESET_VALUES = [500, 5000, 10000, 50000, 100000];
  const [calc, setCalc] = useState<CalcState>(() => computeCalc(5000));

  const handleSlider = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setCalc(computeCalc(parseInt(e.target.value)));
  }, []);
  const handlePreset = useCallback((v: number) => { setCalc(computeCalc(v)); }, []);

  return (
    <section className={`${s.impactCalc} ${s.section}`} id="impact">
      <div className={s.container}>
        <div className={`${s.calcHeader} ${s.reveal}`}>
          <p className={s.sectionLabel} style={{ color: 'rgba(255,255,255,0.45)' }}>Your campaign potential</p>
          <h2 className={s.calcHeading}>See the impact <em>before you spend a rupee.</em></h2>
          <p className={s.calcSub}>Move the slider to your bag count. We'll show you exactly what your campaign will achieve.</p>
        </div>

        <div className={`${s.calcBody} ${s.reveal}`} style={{ transitionDelay: '0.12s' }}>
          {/* Slider */}
          <div className={s.calcSliderPanel}>
            <div className={s.calcSliderTop}>
              <span className={s.calcSliderLabel}>How many bags do you want to sponsor?</span>
              <span className={s.calcCount}>{formatBagCount(calc.bags)}</span>
            </div>
            <div className={s.calcSliderWrap}>
              <input
                type="range" id="calc-slider"
                className={s.calcSlider}
                min="500" max="100000" step="500"
                value={calc.bags}
                onChange={handleSlider}
              />
              <div className={s.calcSliderTicks}>
                {['500', '25K', '50K', '75K', '1L'].map((t) => <span key={t}>{t}</span>)}
              </div>
            </div>
            <div className={s.calcPresets}>
              {PRESET_VALUES.map((v) => (
                <button
                  key={v}
                  className={`${s.calcPreset} ${calc.bags === v ? s.active : ''}`}
                  onClick={() => handlePreset(v)}
                >
                  {v === 100000 ? '1 Lakh bags' : `${v >= 1000 ? `${v / 1000},000` : v} bags`}
                </button>
              ))}
            </div>
          </div>

          {/* Results */}
          <div className={s.calcResults}>
            {[
              { id: 'imp', icon: '👁️', val: calc.impressions, label: 'Total impressions', note: 'Based on 200 average uses per bag over 3–5 years', variant: 'primary' },
              { id: 'plas', icon: '♻️', val: calc.plastic, label: 'Plastic bags replaced', note: '500 single-use plastics eliminated per tote', variant: '' },
              { id: 'co2', icon: '🌿', val: calc.co2, label: 'CO₂ equivalent saved', note: '27.5 kg CO₂e per bag over full lifecycle', variant: '' },
              { id: 'don', icon: '🤝', val: calc.donation, label: 'Donated to NGO partner', note: '₹10 per bag, transferred directly to your chosen cause', variant: 'gold' },
              { id: 'city', icon: '📍', val: calc.cities, label: 'Cities reached', note: 'Hyperlocal distribution to markets, campuses & RWAs', variant: '' },
              { id: 'cpm', icon: '💰', val: calc.cpm, label: 'Cost per impression', note: 'vs ₹3–8 for OOH. 80% more efficient than billboards', variant: '' },
            ].map((card) => (
              <div key={card.id} className={`${s.calcResultCard} ${card.variant === 'primary' ? s.primary : ''} ${card.variant === 'gold' ? s.gold : ''}`}>
                <span className={s.calcResultIcon}>{card.icon}</span>
                <div className={s.calcResultNum}>{card.val}</div>
                <div className={s.calcResultLabel}>{card.label}</div>
                <div className={s.calcResultNote}>{card.note}</div>
              </div>
            ))}
          </div>

          {/* CTA row */}
          <div className={s.calcCtaRow}>
            <div className={s.calcCtaText}>
              <strong>{calc.bagLabel}</strong> could put your brand in front of{' '}
              <strong>{calc.impLabel}</strong> while eliminating{' '}
              <strong>{calc.plasticLabel}</strong>.
            </div>
            <button className={s.calcCtaBtn} onClick={onContact}>
              Start this campaign →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

const ToteShowcase: FC = () => {
  const [activeKey, setActiveKey] = useState<BagKey>('indigo');
  const svgHtml = buildToteSVG(activeKey);

  const pills: { key: BagKey; dotColor: string; label: string }[] = [
    { key: 'indigo', dotColor: '#1a3c8f', label: 'Brand A · Clean Water' },
    { key: 'forest', dotColor: '#0d3d22', label: 'Brand B · Plant Trees' },
    { key: 'saffron', dotColor: '#c45000', label: 'Brand C · Education' },
  ];
  const callouts = [
    { n: '1', title: 'Brand logo — front & centre', sub: 'Your logo in full colour. Seen every time the bag is used, for 3–5 years.' },
    { n: '2', title: 'Social cause message', sub: 'A line connecting your brand to the cause — chosen by you, written by us if needed.' },
    { n: '3', title: 'QR code — live tracking', sub: 'Every scan registers in your real-time dashboard. Links to your campaign page or NGO story.' },
    { n: '4', title: 'ChangeBag × NGO co-brand', sub: 'Small co-branding at the base adds credibility and cause authenticity.' },
  ];

  return (
    <section className={`${s.toteSection} ${s.section}`}>
      <div className={s.container}>
        <div className={s.toteGrid}>
          {/* Left */}
          <div className={s.reveal}>
            <span className={s.sectionLabel}>What the bag looks like</span>
            <h2 className={s.toteHeading}>Your brand. Your cause.<br /><em>One powerful bag.</em></h2>
            <p className={s.toteBody}>Every ChangeBag is a premium 100% cotton canvas tote printed with your brand logo, a cause message, and a QR code — distributed free to citizens and carried to markets, offices, and schools every day.</p>
            <div className={s.toteSwitcher}>
              {pills.map((p) => (
                <button
                  key={p.key}
                  className={`${s.totePill} ${activeKey === p.key ? s.active : ''}`}
                  onClick={() => setActiveKey(p.key)}
                >
                  <span className={s.totePillDot} style={{ background: p.dotColor }} />
                  {p.label}
                </button>
              ))}
            </div>
            <div className={s.toteAnatomy}>
              {callouts.map((c) => (
                <div key={c.n} className={s.toteCallout}>
                  <div className={s.toteCalloutNum}>{c.n}</div>
                  <div>
                    <div className={s.toteCalloutTitle}>{c.title}</div>
                    <div className={s.toteCalloutSub}>{c.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Right — SVG bag */}
          <div className={`${s.toteVisualWrap} ${s.reveal}`} style={{ transitionDelay: '0.15s' }}>
            <div className={`${s.toteBadge} ${s.b1}`}><span className={s.toteBadgeDot} />100% cotton canvas</div>
            <div className={`${s.toteBadge} ${s.b2}`}><span className={s.toteBadgeDot} />QR tracked</div>
            <div className={`${s.toteBadge} ${s.b3}`} style={{ background: 'var(--green-deep)', color: 'var(--white)' }}>
              <span className={s.toteBadgeDot} style={{ background: 'var(--green-light)' }} />
              Replaces 500 plastics
            </div>
            <div
              className={s.toteSvgWrap}
              dangerouslySetInnerHTML={{ __html: svgHtml }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

// Lead capture form (posts to /api/leads)
const ContactForm: FC = () => {
  const [lead, setLead] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async () => {
    if (!lead.trim()) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw: lead }),
      });
      if (!res.ok) throw new Error('Network error');
      setStatus('success');
      setLead('');
    } catch {
      setStatus('error');
    }
  };

  return (
    <section className={s.finalCta} id="contact">
      <div className={s.container}>
        <div className={s.finalCtaInner}>
          <h2 className={s.finalCtaH2}>Ready to carry<br /><em>change?</em></h2>
          <p className={s.finalCtaP}>Tell us your brand and we'll send you a personalised campaign proposal within 24 hours.</p>
          <div className={s.finalForm}>
            <input
              type="text"
              placeholder="Your name, company & phone number"
              value={lead}
              onChange={(e) => setLead(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              disabled={status === 'loading'}
            />
            <button className={s.finalFormBtn} onClick={handleSubmit} disabled={status === 'loading'}>
              {status === 'loading' ? 'Sending…' : status === 'success' ? 'Sent ✓' : 'Get a proposal →'}
            </button>
          </div>
          {status === 'error' && <p style={{ color: '#ff6b6b', fontSize: 13, marginTop: 8 }}>Something went wrong. Please try again.</p>}
          <p className={s.finalCtaNote}>
            Or WhatsApp us directly &nbsp;·&nbsp;
            <a href="#">Book a 15-min call</a> &nbsp;·&nbsp;
            <a href="#">Download the deck</a>
          </p>
        </div>
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────────────────────────────
// Main Page Component
// ─────────────────────────────────────────────────────────────────────
const HomePage: FC = () => {
  useScrollReveal();

  const navigate = useNavigate();
  const scrollTo = (id: string) =>
    document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <>
      <Navbar />

      {/* ── HERO ── */}

      {/* ── HERO ── */}
      <section className={s.hero}>
        <div className={s.heroNoise} />
        <div className={s.heroGrid} />
        <div className={s.heroGlow} />
        <div className={s.heroGlow2} />
        <div className={`${s.heroInner} ${s.container}`}>
          <div className={s.heroLayout}>
            <div className={s.heroContent}>
              <div className={s.heroEyebrow}>
                <div className={s.heroEyebrowDot} />
                <span>India's purpose-media platform</span>
              </div>
              <h1 className={s.heroH1}>Your brand on<br /><em>a million hands.</em></h1>
              <span className={s.heroH1Line2}>With a cause.</span>
              <p className={s.heroSub}>
                The world's <strong>first sustainable purpose media platform</strong> - Sponsoring branded tote bags distributed <strong>free to citizens</strong> across India.
                Real impressions. Real communities. An ESG impact report included -
                at <strong>80% lower cost</strong> than traditional outdoor advertising.
              </p>
              <div className={s.heroCtas}>
                <button className={s.btnHeroPrimary} onClick={() => navigate('/causes')} >
                  Sponsor a campaign
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button className={s.btnHeroGhost} onClick={() => scrollTo('#how')}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.2" />
                    <path d="M8 5v4M8 10.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  See how it works
                </button>
              </div>
              <div className={s.heroStats}>
                {[
                  { num: '1.2M', accent: '+', label: 'Bags distributed' },
                  { num: '800', accent: '+', label: 'Cities reached' },
                  { num: '₹65M', accent: '+', label: 'Ad value created' },
                  { num: '50K', accent: '+', label: 'Brand ambassadors' },
                ].map((stat) => (
                  <div key={stat.label} className={s.heroStat}>
                    <div className={s.heroStatNum}>{stat.num}<span>{stat.accent}</span></div>
                    <div className={s.heroStatLabel}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className={`${s.heroVisualWrap} ${s.reveal}`} style={{ transitionDelay: '0.2s' }}>
              <div className={`${s.heroBadge} ${s.heroBadgeTopRight}`}>
                <span className={s.heroBadgeDot} />
                Your brand on every bag
              </div>
              <div className={`${s.heroBadge} ${s.heroBadgeLeftMid}`}>
                <span className={s.heroBadgeDot} />
                Sustainable fabric
              </div>
              <div className={`${s.heroBadge} ${s.heroBadgeBottomRight}`}>
                <span className={s.heroBadgeDot} />
                Free to citizens · ESG certified
              </div>
              <div className={s.heroVisualCard} aria-label="Tote bag preview">
                <div className={s.heroVisualInner}>
                  <img
                    className={s.heroVisualFace}
                    src="/images/tote-front.webp"
                    alt="ChangeBag tote bag front"
                  />
                  <img
                    className={`${s.heroVisualFace} ${s.heroVisualBack}`}
                    src="/images/tote-back.webp"
                    alt="ChangeBag tote bag back"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Ticker />
      <TrustedBy />

      {/* ── THE PROBLEM ── */}
      <section className={`${s.intro} ${s.section}`}>
        <div className={s.container}>
          <div className={s.introGrid}>
            <div className={s.reveal}>
              <span className={s.sectionLabel}>The problem we solve</span>
              <h2 className={s.introHeading}>India spends ₹1,000+ crores on ads <em>nobody keeps.</em></h2>
              <p className={s.introBody}>Traditional advertising disappears the moment the campaign ends. Billboards come down. Digital ads scroll past. TV spots are skipped. The spend is gone, and so is the impression.</p>
              <p className={s.introBody}>Meanwhile, India generates 14 million tons of plastic waste a year — and CSR impact sits invisible in PDF reports nobody reads.</p>
              <div className={s.introStatsGrid} style={{ marginTop: 32 }}>
                {[
                  { big: '14M', label: 'Tons of plastic waste annually' },
                  { big: '<30%', label: 'Actually gets recycled' },
                  { big: '₹26K', label: 'Crores mandatory CSR spend (FY24)' },
                  { big: '0', label: 'Measurable impressions from most CSR' },
                ].map((st) => (
                  <div key={st.label} className={s.introStatCard}>
                    <div className={s.introStatBig}>{st.big}</div>
                    <div className={s.introStatLabel}>{st.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className={s.reveal} style={{ transitionDelay: '0.15s' }}>
              <div className={s.problemQuote}>
                <p className={s.problemQuoteP}>"The world doesn't need more ads — it needs visible impact that people actually carry home."</p>
                <footer className={s.problemQuoteFooter}>— The ChangeBag principle</footer>
                <div className={s.problemPillars}>
                  {[
                    { icon: '📦', title: 'Free for citizens', sub: 'No purchase required' },
                    { icon: '📊', title: 'Dashboard tracked', sub: 'Real-time QR data' },
                    { icon: '🌱', title: 'ESG reportable', sub: 'Impact cert. included' },
                    { icon: '🤝', title: 'NGO funding', sub: '₹10 donated per bag' },
                  ].map((p) => (
                    <div key={p.title} className={s.problemPillar}>
                      <span className={s.pillarIcon}>{p.icon}</span>
                      <div className={s.pillarTitle}>{p.title}</div>
                      <div className={s.pillarSub}>{p.sub}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className={`${s.how} ${s.section}`} id="how">
        <div className={s.container}>
          <div className={`${s.howHeader} ${s.reveal}`}>
            <span className={s.sectionLabel}>The process</span>
            <h2 className={s.sectionHeading}>Up and running in <em>48 hours.</em></h2>
            <p className={s.sectionSub}>From brief to bags in the hands of citizens — completely handled by us.</p>
          </div>
          <div className={s.stepsGrid}>
            {STEPS.map((step, i) => (
              <div key={step.n} className={`${s.step} ${s.reveal}`} style={{ transitionDelay: `${i * 0.1}s` }}>
                <div className={s.stepNum}>{step.n}</div>
                <div className={s.stepTitle}>{step.title}</div>
                <p className={s.stepBody}>{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ToteShowcase />

      {/* ── COMPARE ── */}
      <section className={`${s.compare} ${s.section}`} id="brands">
        <div className={s.container}>
          <div className={s.reveal}>
            <span className={s.sectionLabel}>The business case</span>
            <h2 className={s.sectionHeading}>Not just a bag. <em>A better ad buy.</em></h2>
          </div>
          <div className={`${s.compareGrid} ${s.reveal}`} style={{ transitionDelay: '0.1s' }}>
            <div className={`${s.compareCol} ${s.traditional}`}>
              <div className={s.compareColHeader}>Traditional Advertising</div>
              <div className={s.compareColBody}>
                {COMPARE_TRADITIONAL.map((text) => (
                  <div key={text} className={s.compareRow}>
                    <span className={`${s.compareIcon} ${s.traditional}`}>✕</span>
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className={`${s.compareCol} ${s.changebag}`}>
              <div className={s.compareColHeader}>ChangeBag Sponsorship</div>
              <div className={s.compareColBody}>
                {COMPARE_CHANGEBAG.map((row) => (
                  <div key={row.text} className={`${s.compareRow} ${row.hl ? s.compareHighlight : ''}`}>
                    <span className={`${s.compareIcon} ${s.changebag}`}>✓</span>
                    <span>{row.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className={`${s.cpmCallout} ${s.reveal}`} style={{ transitionDelay: '0.2s' }}>
            <div className={s.cpmBig}>80%</div>
            <div>
              <div className={s.cpmTextH3}>Lower cost per impression than any other outdoor medium in India.</div>
              <p className={s.cpmTextP}>At ₹0.04–0.08 per impression vs ₹3–8 for OOH billboards, ChangeBag delivers the same brand visibility as a 500-strong billboard network — with the added benefit of an ESG report your sustainability team can actually use.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOR BRANDS / DASHBOARD ── */}
      <section className={`${s.brandsSection} ${s.section}`}>
        <div className={s.container}>
          <div className={s.brandsGrid}>
            <div className={s.reveal}>
              <span className={s.sectionLabel}>For brand teams</span>
              <h2 className={s.sectionHeading}>Marketing ROI.<br /><em>CSR proof.</em><br />One campaign.</h2>
              <div className={s.brandsFeatures}>
                {FEATURES.map((f) => (
                  <div key={f.title} className={s.featureItem}>
                    <div className={s.featureIcon}>{f.icon}</div>
                    <div>
                      <h4>{f.title}</h4>
                      <p>{f.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className={s.reveal} style={{ transitionDelay: '0.15s' }}>
              <div className={s.dashboardCard}>
                <div className={s.dashboardTopbar}>
                  <div className={s.dbDot} style={{ background: '#ff5f57' }} />
                  <div className={s.dbDot} style={{ background: '#febc2e' }} />
                  <div className={s.dbDot} style={{ background: '#28c840' }} />
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginLeft: 'auto' }}>ChangeBag Impact Dashboard</span>
                </div>
                <div className={s.dashboardBody}>
                  <div className={s.dbBrandRow}>
                    <div className={s.dbBrandLogo}>CB</div>
                    <div>
                      <div className={s.dbBrandName}>Your Brand · Q1 Campaign</div>
                      <div className={s.dbBrandSub}>Active · Jan 15 – Mar 15, 2025</div>
                    </div>
                  </div>
                  <div className={s.dbMetrics}>
                    {[['48.2K', 'Impressions'], ['2,400', 'Bags out'], ['66 KG', 'CO₂ saved']].map(([n, l]) => (
                      <div key={l} className={s.dbMetric}>
                        <div className={s.dbMetricNum}>{n}</div>
                        <div className={s.dbMetricLbl}>{l}</div>
                      </div>
                    ))}
                  </div>
                  <div className={s.dbBarLabel}>Top cities</div>
                  {[['Hyderabad', '85%', '1,020'], ['Bengaluru', '62%', '744'], ['Mumbai', '45%', '540'], ['Delhi', '25%', '300']].map(([city, w, val]) => (
                    <div key={city} className={s.dbBarRow}>
                      <span className={s.dbBarCity}>{city}</span>
                      <div className={s.dbBarTrack}><div className={s.dbBarFill} style={{ width: w }} /></div>
                      <span className={s.dbBarVal}>{val}</span>
                    </div>
                  ))}
                  <div className={s.dbExportRow}>
                    <span>📄</span>
                    <span className={s.dbExportTxt}>ESG Impact Report ready to export</span>
                    <span className={s.dbExportDl}>Download →</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ImpactCalculator onContact={() => navigate('/causes')} />

      {/* ── CAUSES ── */}
      <section className={`${s.causes} ${s.section}`}>
        <div className={s.container}>
          <div className={`${s.causesHeader} ${s.reveal}`}>
            <h2 className={s.causesHeading}>Causes that need you <em>right now</em></h2>
            <p className={s.causesSub}>These high-impact causes are looking for brand partners who are ready to make a meaningful difference in the world.</p>
          </div>
          <div className={s.causesGrid}>
            {CAUSES.map((cause, i) => (
              <div key={cause.title} className={`${s.causeCard} ${s.reveal}`} style={{ transitionDelay: `${i * 0.1}s` }}>
                <div className={s.causeImgWrap}>
                  <img src={cause.img} alt={cause.alt} loading="lazy" />
                </div>
                <div className={s.causeBody}>
                  <div className={s.causeTopRow}>
                    <div className={s.causeTitle}>{cause.title}</div>
                    <span className={`${s.causeCat} ${s[cause.catClass]}`}>{cause.cat}</span>
                  </div>
                  <p className={s.causeDesc}>{cause.desc}</p>
                  <div className={s.causeActions}>
                    {cause.buttons.map((btn) => (
                      <button
                        key={btn.label}
                        onClick={() => {
                          if (btn.label === 'Claim a Tote') {
                            navigate(`/claim/${cause._id}`);
                          } else if (btn.label === 'Sponsor This Cause') {
                            navigate(`/sponsor/new?causeId=${cause._id}`);
                          } else if (btn.label === 'Join Waitlist') {
                            navigate(`/waitlist/${cause._id}`);
                          } else {
                            navigate('/causes');
                          }
                        }}
                        className={`${s.causeBtn} ${btn.variant === 'black' ? s.causeBtnBlack :
                          btn.variant === 'green' ? s.causeBtnGreen :
                            s.causeBtnOutline
                          }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className={`${s.causesViewAllWrap} ${s.reveal}`} style={{ transitionDelay: '0.15s' }}>
            <Link to="/causes" className={s.causesViewAll}>
              View All Causes
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className={`${s.testimonials} ${s.section}`}>
        <div className={s.container}>
          <div className={`${s.testimonialsHeader} ${s.reveal}`}>
            <span className={s.sectionLabel}>What our partners say</span>
            <h2 className={s.sectionHeading}>Early campaigns. <em>Real results.</em></h2>
            <p className={s.sectionSub} style={{ margin: '0 auto' }}>We have distributed 5 lakh bags across 2 cities so far. Here is what the brands experienced.</p>
          </div>
          <div className={s.testiGrid}>
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className={`${s.testiCard} ${s.reveal}`} style={{ transitionDelay: t.delay }}>
                <div className={s.testiStars}>{Array(5).fill(null).map((_, i) => <span key={i} className={s.testiStar}>★</span>)}</div>
                <p className={s.testiQuote}>{t.quote}</p>
                <div className={s.testiAuthor}>
                  <div className={s.testiAvatar} style={{ background: t.bg }}>{t.initials}</div>
                  <div>
                    <div className={s.testiName}>{t.name}</div>
                    <div className={s.testiRole}>{t.role}</div>
                    <span className={s.testiBrandTag}>{t.tag}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NGOs ── */}
      <section className={`${s.ngos} ${s.section}`} id="ngos">
        <div className={s.container}>
          <div className={s.ngosGrid}>
            <div className={s.reveal}>
              <span className={s.sectionLabel}>For NGOs &amp; causes</span>
              <h2 className={s.sectionHeading}>Your mission,<br />in a <em>million hands.</em></h2>
              <p className={s.introBody} style={{ marginTop: 16 }}>
                Partner with ChangeBag at zero cost. Your cause gets carried into homes, markets, and public spaces across India — by citizens who believe in it.
              </p>
            </div>
            <div className={`${s.ngoCards} ${s.reveal}`} style={{ transitionDelay: '0.1s' }}>
              {NGO_CARDS.map((card) => (
                <div key={card.title} className={s.ngoCard}>
                  <div className={s.ngoIcon} style={{ background: card.bg }}>{card.icon}</div>
                  <div>
                    <h4>{card.title}</h4>
                    <p>{card.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── MEDIA ── */}
      <section className={s.media}>
        <div className={s.container}>
          <p className={s.mediaLabel}>Featured in</p>
          <div className={s.mediaLogos}>
            {['NDTV', 'Times of India', 'Hindustan Times', 'Outlook', 'Economic Times', 'India Today', 'Business Standard', 'YourStory'].map((m) => (
              <div key={m} className={s.mediaLogo}>{m}</div>
            ))}
          </div>
        </div>
      </section>

      <ContactForm />
      <Footer />
    </>
  );
};

export default HomePage;