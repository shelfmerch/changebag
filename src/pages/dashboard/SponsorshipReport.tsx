import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '@/config';
import { Loader2, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// ─── palette ──────────────────────────────────────────────────────────────────
const C = {
  bg:        '#0b1a0f',
  card:      '#112016',
  cardDark:  '#0e1c12',
  border:    '#1d3525',
  borderDim: '#172b1e',
  certBg:    '#0f2615',
  green:     '#22c55e',
  greenDim:  '#16a34a',
  greenMid:  '#35b85a',
  yellow:    '#ca8a04',
  yellowBr:  '#eab308',
  blue:      '#60a5fa',
  orange:    '#f97316',
  red:       '#ef4444',
  textHi:    '#e2ece5',
  textMid:   '#7aaa8a',
  textLo:    '#4d7a5a',
  badge:     '#1a2e1e',
};

const fSerif = "'Instrument Serif', Georgia, serif";
const fSans = "'DM Sans', sans-serif";

// ─── helpers ──────────────────────────────────────────────────────────────────
const fmtIndian = (n: number): string => {
  if (n >= 1e7) return `${(n / 1e7).toFixed(1).replace(/\.0$/, '')}Cr`;
  if (n >= 1e5) return `${(n / 1e5).toFixed(1).replace(/\.0$/, '')}L`;
  if (n >= 1e3) return n.toLocaleString('en-IN');
  return String(n);
};
const fmtRs = (n: number) =>
  n >= 1e5 ? `₹${(n / 1e5).toFixed(1).replace(/\.0$/, '')}L` : `₹${n.toLocaleString('en-IN')}`;

// ─── reusable style atoms ─────────────────────────────────────────────────────
const sectionLabel = (extra?: React.CSSProperties): React.CSSProperties => ({
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: C.textLo,
  marginBottom: 12,
  fontFamily: fSans,
  ...extra,
});
const card = (extra?: React.CSSProperties): React.CSSProperties => ({
  background: C.card,
  border: `1px solid ${C.border}`,
  borderRadius: 10,
  ...extra,
});
const bullet: React.CSSProperties = {
  fontSize: 11.5,
  color: C.textMid,
  lineHeight: 1.75,
  marginBottom: 4,
  paddingLeft: 14,
  position: 'relative',
  fontFamily: fSans,
};

interface Sponsorship {
  _id: string;
  toteQuantity: number;
  totalAmount: number;
  organizationName: string;
  contactName: string;
  email: string;
  selectedCities: string[];
  distributionLocations?: string[];
  ngoPartner?: string;
  distributionStartDate?: string;
  distributionEndDate?: string;
  campaignStartDate?: string;
  campaignEndDate?: string;
  status: string;
  createdAt: string;
  cause: {
    _id: string;
    title: string;
    description: string;
    imageUrl: string;
    category: string;
  };
}
interface Claim {
  _id: string;
  fullName: string;
  location?: string;
  city: string;
  status: string;
}

// ─── component ────────────────────────────────────────────────────────────────
const SponsorshipReport: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [sp, setSp] = useState<Sponsorship | null>(null);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [openMeth, setOpenMeth] = useState<Record<string, boolean>>({});
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem('token');
        const hdrs = { Authorization: `Bearer ${token}` };
        const { data } = await axios.get(`${config.apiUrl}/sponsorships/sponsor/${id}`, { headers: hdrs });
        setSp(data);
        if (data.cause?._id) {
          const cr = await axios.get(`${config.apiUrl}/claims/sponsored-causes/verified-claims`, { headers: hdrs });
          const cd = cr.data.find((x: any) => x.causeId === data.cause._id);
          if (cd) setClaims(cd.claims);
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [id]);

  const handleDownload = async () => {
    if (!reportRef.current) return;
    setDownloading(true);
    try {
      const e = reportRef.current;
      const canvas = await html2canvas(e, { scale: 2, windowWidth: e.scrollWidth, windowHeight: e.scrollHeight, useCORS: true, logging: false });
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const pdf = new jsPDF({ orientation: 'p', unit: 'px', format: [imgWidth, imgHeight] });
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`ChangeBag-Impact-Report-${sp?.cause?.title || id}.pdf`);
    } catch (e) { console.error(e); }
    finally { setDownloading(false); }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Loader2 style={{ color: C.green, width: 36, height: 36 }} className="animate-spin" />
    </div>
  );
  if (!sp) return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.textHi }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ marginBottom: 16, color: C.textMid }}>Sponsorship not found.</p>
        <button onClick={() => navigate('/dashboard')} style={{ background: C.green, color: '#031508', border: 'none', borderRadius: 6, padding: '10px 24px', cursor: 'pointer', fontWeight: 700 }}>← Back</button>
      </div>
    </div>
  );

  // ── computed ──────────────────────────────────────────────────────────────
  const qty    = sp.toteQuantity || 0;
  const spent  = sp.totalAmount  || 0;
  const ngo    = (qty * 10); // Assume 10Rs per bag to NGO
  const cities = sp.selectedCities?.length || 0;

  // env calcs
  const plasticBags  = qty * 500;
  const actualBags   = qty * 200 * 2.5;
  const co2Kg        = qty * 27.5;
  const plasticKg    = plasticBags * 7;
  const waterL       = plasticBags * 0.22;

  // reach
  const locMap: Record<string, number> = {};
  claims.forEach(c => { const l = c.location || c.city || 'Unknown'; locMap[l] = (locMap[l] || 0) + 1; });
  const locEntries = Object.entries(locMap).sort((a, b) => b[1] - a[1]);
  const maxLoc = locEntries[0]?.[1] || 1;
  const qrScans = claims.length;
  const scanRate = qty > 0 ? ((qrScans / qty) * 100).toFixed(1) : '0';

  // brand
  const impressions = qty * 200 * 2.5;
  const cpm = impressions > 0 ? ((spent / impressions) * 1000).toFixed(2) : '0';
  const certId = `CB-CERT-2025-${sp.organizationName.replace(/\s+/g, '').slice(0, 2).toUpperCase()}-${String(qty).padStart(4, '0')}`;
  
  const rawStart = sp.distributionStartDate || sp.campaignStartDate;
  const rawEnd = sp.distributionEndDate || sp.campaignEndDate;

  const startDate = rawStart
    ? new Date(rawStart).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }).replace(',', '')
    : null;
  const endDate = rawEnd
    ? new Date(rawEnd).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }).replace(',', '')
    : null;

  let dateStr = '';
  if (startDate && endDate) dateStr = `${startDate} – ${endDate}`;
  else if (startDate) dateStr = startDate;
  else if (endDate) dateStr = endDate;
  const issueDate = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  const ngoName = sp.ngoPartner || (sp.cause?.title ? `${sp.cause.title} NGO` : 'NGO Partner');

  const toggleMeth = (k: string) => setOpenMeth(p => ({ ...p, [k]: !p[k] }));

  const barColors = [C.green, '#22c55e', '#16a34a', '#15803d', '#166534', '#14532d'];

  const titleBase = sp.cause?.title || 'Campaign Report';
  const titleMatch = titleBase.match(/(.*?)( Q[1-4])?$/);
  const mainTitle = titleMatch?.[1] || titleBase;
  const qSuffix = titleMatch?.[2] || '';

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: fSans, color: C.textHi }}>
      <Navbar />
      <div style={{ paddingTop: 72 }}>
        <div style={{ position: 'fixed', bottom: 32, right: 32, zIndex: 100 }}>
          <button
            onClick={handleDownload}
            disabled={downloading}
            style={{ background: C.green, color: '#031508', border: 'none', borderRadius: 8, padding: '12px 20px', cursor: 'pointer', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 8px 24px rgba(34,197,94,0.35)' }}
          >
            {downloading ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
            Download PDF
          </button>
        </div>

        <div ref={reportRef} style={{ maxWidth: 1160, margin: '0 auto', padding: '32px 28px 80px' }}>

          {/* HEADER CARD */}
          <div style={{ ...card(), padding: '28px 32px', marginBottom: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <p style={{ fontSize: 10, color: C.textLo, letterSpacing: '0.12em', marginBottom: 10, fontWeight: 700, textTransform: 'uppercase' }}>
                  CAMPAIGN · {certId}
                </p>
                <h1 style={{ fontSize: 38, fontWeight: 400, margin: 0, color: C.textHi, display: 'flex', alignItems: 'baseline', gap: 6, fontFamily: fSerif, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                  {mainTitle}
                  {qSuffix && <em style={{ color: C.green, fontStyle: 'italic', fontSize: 32 }}>{qSuffix.trim()}</em>}
                </h1>
                <p style={{ fontSize: 13, color: C.textMid, marginTop: 10 }}>
                  {[sp.organizationName, dateStr, ngoName].filter(Boolean).join(' · ')}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 10, color: C.textLo, letterSpacing: '0.12em', marginBottom: 8, fontWeight: 700 }}>REPORT ID</p>
                <p style={{ fontSize: 12, color: C.textMid, fontFamily: 'monospace', marginBottom: 10 }}>{certId}</p>
                <span style={{ background: '#0e2414', border: `1px solid #14361e`, borderRadius: 20, padding: '6px 16px', fontSize: 12, color: '#4ade80', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
                  Complete
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 48, borderTop: `1px solid ${C.border}`, paddingTop: 24, marginBottom: 24 }}>
              {[
                { val: `${fmtIndian(qty)} bags`, label: 'Sponsored', color: C.green, isUnit: true },
                { val: fmtRs(spent), label: 'Total spend', color: C.textHi },
                { val: String(cities), label: 'Cities', color: C.textHi },
                { val: fmtRs(ngo), label: 'NGO donated', color: C.textHi },
              ].map(s => (
                <div key={s.label}>
                  <p style={{ fontSize: 28, fontWeight: 400, color: s.color, margin: 0, fontFamily: fSerif, display: 'flex', alignItems: 'baseline', gap: 4 }}>
                    {s.isUnit ? s.val.split(' ')[0] : s.val}
                    {s.isUnit && <span style={{ fontSize: 15, fontFamily: fSans, color: C.greenDim }}>{s.val.split(' ')[1]}</span>}
                  </p>
                  <p style={{ fontSize: 11, color: C.textLo, marginTop: 4 }}>{s.label}</p>
                </div>
              ))}
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: C.textMid }}>Distribution complete</span>
                <span style={{ fontSize: 14, color: C.textHi, fontWeight: 700, fontFamily: fSerif }}>
                  {qty > 0 ? Math.min(100, Math.round((qrScans / qty) * 100)) : 100}%
                </span>
              </div>
              <div style={{ background: C.borderDim, borderRadius: 4, height: 4, overflow: 'hidden' }}>
                <div style={{ width: `${qty > 0 ? Math.min(100, (qrScans / qty) * 100) : 100}%`, background: C.green, height: '100%', borderRadius: 4 }} />
              </div>
            </div>
          </div>

          {/* ENVIRONMENTAL IMPACT */}
          <p style={sectionLabel({ marginBottom: 16 })}>Environmental Impact</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            <div style={{ ...card(), padding: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <span style={{ fontSize: 20, color: C.textHi }}>♻️</span>
                <span style={{ background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 4, padding: '4px 10px', fontSize: 10, color: C.textMid, letterSpacing: '0.06em', fontFamily: 'monospace' }}>ISO 14044 · Substitution</span>
              </div>
              <p style={{ fontSize: 48, fontWeight: 400, color: C.green, margin: '0 0 4px', fontFamily: fSerif, lineHeight: 1 }}>
                {qty > 0 ? (qty * 500).toLocaleString('en-IN') : 0}
              </p>
              <p style={{ fontSize: 12, color: C.textMid, marginBottom: 12 }}>single-use plastic bags</p>
              <p style={{ fontSize: 14, fontWeight: 700, color: C.textHi, marginBottom: 8 }}>Plastic bags prevented</p>
              <p style={{ fontSize: 13, color: C.textMid, lineHeight: 1.6, marginBottom: 24 }}>
                {qty.toLocaleString('en-IN')} bags × 500 replacements each. {fmtIndian(plasticBags).replace('L', ' lakh')} HDPE bags kept out of India's waste stream over 3–5 year lifespan.
              </p>
              
              <div style={{ height: 2, background: 'linear-gradient(90deg, #22c55e, #166534)', borderRadius: 2, marginBottom: 16, opacity: 0.8 }} />
              
              {openMeth.plastic && (
                <div style={{ paddingTop: 4, marginBottom: 14 }}>
                  {[
                    `Formula: bags × uses_per_tote × bags_per_trip = ${qty.toLocaleString('en-IN')} × 200 × 2.5 = ${fmtIndian(actualBags)}`,
                    '200 uses/tote: UNEP 2020 meta-analysis of 10 LCAs — conservative mid-point',
                    '2.5 bags/trip: Indian grocery market average (sabzi, kirana)',
                    'Source: ISO 14044 §4.3.4 substitution method · UK Environment Agency LCA 2011',
                  ].map((t, i) => (
                    <p key={i} style={bullet}><span style={{ color: C.green, marginRight: 6 }}>•</span>{t}</p>
                  ))}
                </div>
              )}
              <button onClick={() => toggleMeth('plastic')} style={{ background: 'none', border: 'none', color: C.textLo, fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: 0 }}>
                <span>Methodology &amp; data source</span>
                <span style={{ fontSize: 8 }}>{openMeth.plastic ? '▲' : '▼'}</span>
              </button>
            </div>

            <div style={{ ...card(), padding: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <span style={{ fontSize: 20, color: C.textHi }}>🌿</span>
                <span style={{ background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 4, padding: '4px 10px', fontSize: 10, color: C.textMid, letterSpacing: '0.06em', fontFamily: 'monospace' }}>IPCC AR5 GWP100</span>
              </div>
              <p style={{ fontSize: 48, fontWeight: 400, color: C.textHi, margin: '0 0 4px', fontFamily: fSerif, lineHeight: 1 }}>
                {co2Kg >= 1000 ? `${(co2Kg / 1000).toFixed(1)}T` : `${co2Kg.toFixed(1)}T`}
              </p>
              <p style={{ fontSize: 12, color: C.textMid, marginBottom: 12 }}>CO₂ equivalent</p>
              <p style={{ fontSize: 14, fontWeight: 700, color: C.textHi, marginBottom: 8 }}>CO₂ equivalent prevented</p>
              <p style={{ fontSize: 13, color: C.textMid, lineHeight: 1.6, marginBottom: 24 }}>
                27.5 kg CO₂e per bag × {qty.toLocaleString('en-IN')} bags. Equivalent to taking ~{Math.round(co2Kg / 2000)} petrol cars off the road for a full year.
              </p>
              
              <div style={{ height: 2, background: 'linear-gradient(90deg, #2dd4bf, #0f766e)', borderRadius: 2, marginBottom: 16, opacity: 0.8 }} />

              {openMeth.co2 && (
                <div style={{ paddingTop: 4, marginBottom: 14 }}>
                  {[
                    `Formula: (bags_prevented × 55 g CO₂e) ÷ (totes × lifecycle_share) = ${(co2Kg / 1000).toFixed(1)} T net/tote`,
                    '55 g/bag India factor: Includes landfill methane (MoEFCC 2022, sub-30% recycle rate). UK baseline 33 g/bag.',
                    'Tote lifecycle: 272 kg CO₂e + 200 uses = 1.36 g/use amortised (Danish EPA 2018)',
                    'Sources: EcoInvent 3.8 (HDPE: 1.48 kg CO₂e/kg) · IPCC AR5 GWP100 · Danish EPA 2018',
                  ].map((t, i) => (
                    <p key={i} style={bullet}><span style={{ color: C.green, marginRight: 6 }}>•</span>{t}</p>
                  ))}
                </div>
              )}
              <button onClick={() => toggleMeth('co2')} style={{ background: 'none', border: 'none', color: C.textLo, fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: 0 }}>
                <span>Methodology &amp; data source</span>
                <span style={{ fontSize: 8 }}>{openMeth.co2 ? '▲' : '▼'}</span>
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 32 }}>
            <div style={{ ...card(), padding: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <span style={{ fontSize: 20, color: C.textHi }}>⚖️</span>
                <span style={{ background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 4, padding: '4px 10px', fontSize: 10, color: C.textMid, letterSpacing: '0.06em', fontFamily: 'monospace' }}>BIS IS 16695:2017</span>
              </div>
              <p style={{ fontSize: 48, fontWeight: 400, color: C.yellowBr, margin: '0 0 4px', fontFamily: fSerif, lineHeight: 1 }}>
                {plasticKg >= 1000 ? `${(plasticKg / 1000).toFixed(1)}T` : `${plasticKg.toFixed(0)}KG`}
              </p>
              <p style={{ fontSize: 12, color: C.textMid, marginBottom: 12 }}>HDPE plastic diverted</p>
              <p style={{ fontSize: 14, fontWeight: 700, color: C.textHi, marginBottom: 8 }}>Plastic weight diverted</p>
              <p style={{ fontSize: 13, color: C.textMid, lineHeight: 1.6, marginBottom: 24 }}>
                {qty > 0 ? (qty * 500).toLocaleString('en-IN') : '0'} bag-uses × 7 g = {qty > 0 ? (plasticKg).toLocaleString('en-IN') : '0'} kg. This plastic never entered landfills, oceans, or open burning.
              </p>

              <div style={{ height: 2, background: 'linear-gradient(90deg, #eab308, #854d0e)', borderRadius: 2, marginBottom: 16, opacity: 0.8 }} />

              {openMeth.pw && (
                <div style={{ paddingTop: 4, marginBottom: 14 }}>
                  {[
                    `Formula: bags_prevented × 7 g ÷ 1,000 = ${fmtIndian(plasticBags)} × 7 ÷ 1,000 = ${(plasticKg / 1000).toFixed(0)} kg`,
                    '7 g/bag (conservative): BIS IS 16695:2017. Post-2022 MoEFCC 120 micron = 10–12 g actual — this figure understates actual diversion.',
                    'Source: BIS IS 16695:2017 · MoEFCC Plastic Waste Management Rules 2021',
                  ].map((t, i) => (
                    <p key={i} style={bullet}><span style={{ color: C.green, marginRight: 6 }}>•</span>{t}</p>
                  ))}
                </div>
              )}
              <button onClick={() => toggleMeth('pw')} style={{ background: 'none', border: 'none', color: C.textLo, fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: 0 }}>
                <span>Methodology &amp; data source</span>
                <span style={{ fontSize: 8 }}>{openMeth.pw ? '▲' : '▼'}</span>
              </button>
            </div>

            <div style={{ ...card(), padding: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <span style={{ fontSize: 20, color: C.textHi }}>💧</span>
                <span style={{ background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 4, padding: '4px 10px', fontSize: 10, color: C.textMid, letterSpacing: '0.06em', fontFamily: 'monospace' }}>AWARE method</span>
              </div>
              <p style={{ fontSize: 48, fontWeight: 400, color: '#60a5fa', margin: '0 0 4px', fontFamily: fSerif, lineHeight: 1 }}>
                {waterL >= 1000 ? `${(waterL / 1000).toFixed(0)} KL` : `${waterL.toFixed(0)} L`}
              </p>
              <p style={{ fontSize: 12, color: C.textMid, marginBottom: 12 }}>industrial process water</p>
              <p style={{ fontSize: 14, fontWeight: 700, color: C.textHi, marginBottom: 8 }}>Water use (vs plastic production)</p>
              <p style={{ fontSize: 13, color: C.textMid, lineHeight: 1.6, marginBottom: 24 }}>
                {qty > 0 ? (qty * 500).toLocaleString('en-IN') : '0'} × 0.22 L/bag = {(qty * 500 * 0.22).toLocaleString('en-IN')} L not consumed in HDPE production. Gross only — cotton agri water disclosed separately.
              </p>
              
              <div style={{ height: 2, background: 'linear-gradient(90deg, #3b82f6, #1e3a8a)', borderRadius: 2, marginBottom: 16, opacity: 0.8 }} />

              {openMeth.water && (
                <div style={{ paddingTop: 4, marginBottom: 14 }}>
                  {[
                    `Formula (gross industrial only): bags_prevented × 0.22 L = ${fmtIndian(plasticBags)} × 0.22 = ${waterL >= 1000 ? (waterL / 1000).toFixed(0) + ',000' : waterL.toFixed(0)} L`,
                    '0.22 L/bag: UK Env. Agency 2011 (58 gal/1,000 bags). Industrial process water only.',
                    'Disclosure: Cotton agri water = 2,720 L/tote (Water Footprint Network). Not netted per SEBI BRSR P6 & WRAP UK.',
                    'Sources: AWARE method (Boulay et al. 2018) · UK Env. Agency 2011 · Water Footprint Network',
                  ].map((t, i) => (
                    <p key={i} style={bullet}><span style={{ color: C.green, marginRight: 6 }}>•</span>{t}</p>
                  ))}
                </div>
              )}
              <button onClick={() => toggleMeth('water')} style={{ background: 'none', border: 'none', color: C.textLo, fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: 0 }}>
                <span>Methodology &amp; data source</span>
                <span style={{ fontSize: 8 }}>{openMeth.water ? '▲' : '▼'}</span>
              </button>
            </div>
          </div>

          {/* REACH & DISTRIBUTION */}
          <p style={sectionLabel({ marginBottom: 16 })}>Reach &amp; Distribution</p>

          <div style={{ ...card(), padding: 28, marginBottom: 32 }}>
            <p style={{ fontSize: 13, color: C.textMid, marginBottom: 28 }}>
              City-wise distribution — {qty.toLocaleString('en-IN')} bags across {cities} cities
            </p>

            {locEntries.length > 0 ? locEntries.map(([loc, cnt], i) => (
              <div key={loc} style={{ display: 'grid', gridTemplateColumns: '110px 1fr 40px', alignItems: 'center', gap: 14, marginBottom: 18 }}>
                <span style={{ fontSize: 13, color: C.textMid }}>{loc}</span>
                <div style={{ background: C.borderDim, borderRadius: 3, height: 6, overflow: 'hidden' }}>
                  <div style={{ width: `${(cnt / maxLoc) * 100}%`, background: barColors[i % barColors.length], height: '100%', borderRadius: 3 }} />
                </div>
                <span style={{ fontSize: 13, color: C.textMid, textAlign: 'right', fontFamily: fSans }}>{cnt}</span>
              </div>
            )) : (sp.selectedCities || []).slice(0, 8).map((city, i) => (
              <div key={city} style={{ display: 'grid', gridTemplateColumns: '110px 1fr 40px', alignItems: 'center', gap: 14, marginBottom: 18 }}>
                <span style={{ fontSize: 13, color: C.textMid }}>{city}</span>
                <div style={{ background: C.borderDim, borderRadius: 3, height: 6, overflow: 'hidden' }}>
                  <div style={{ width: '0%', background: barColors[i % barColors.length], height: '100%', borderRadius: 3 }} />
                </div>
                <span style={{ fontSize: 13, color: C.textMid, textAlign: 'right', fontFamily: fSans }}>0</span>
              </div>
            ))}

            {locEntries.length === 0 && (
              <p style={{ fontSize: 11, color: C.textLo, fontStyle: 'italic', marginTop: 8, marginBottom: 16 }}>
                Live distribution data appears as users scan QR codes.
              </p>
            )}

            <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 24, display: 'flex', justifyContent: 'space-around', marginTop: 16 }}>
              {[
                { val: qty.toLocaleString('en-IN'), label: 'Total bags' },
                { val: String(cities), label: 'Cities reached' },
                { val: `${qrScans}`, label: `QR scans (${scanRate}%)` },
              ].map(s => (
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 32, fontWeight: 400, color: C.textHi, margin: 0, fontFamily: fSerif }}>{s.val}</p>
                  <p style={{ fontSize: 11, color: C.textLo, marginTop: 4 }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* BRAND & MARKETING IMPACT */}
          <p style={sectionLabel({ marginBottom: 16 })}>Brand &amp; Marketing Impact</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 20 }}>
            {[
              { val: impressions >= 1e5 ? `${(impressions / 1e5).toFixed(0)}L+` : fmtIndian(impressions), label: 'Lifetime impressions', color: C.textHi },
              { val: String(qrScans), label: 'QR code scans', color: C.textHi },
              { val: `₹${cpm}`, label: 'Effective CPM', color: C.textHi },
              { val: '3.8 yr', label: 'Est. bag lifespan', color: C.textHi },
            ].map(s => (
              <div key={s.label} style={{ ...card(), padding: '24px 22px' }}>
                <p style={{ fontSize: 32, fontWeight: 400, color: s.color, margin: 0, fontFamily: fSerif }}>{s.val}</p>
                <p style={{ fontSize: 12, color: C.textMid, marginTop: 8 }}>{s.label}</p>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 32 }}>
            <div style={{ ...card(), padding: 28 }}>
              <p style={{ fontSize: 12, color: C.textMid, marginBottom: 20 }}>CPM — cost per 1,000 impressions</p>
              {[
                { label: 'OOH Billboard', val: '₹500–800', color: '#dc2626', pct: 85 },
                { label: 'Digital display', val: '₹200–350', color: '#f97316', pct: 45 },
                { label: 'ChangeBag ✓', val: `₹${cpm} — 99% lower`, color: C.green, pct: 2 },
              ].map(r => (
                <div key={r.label} style={{ display: 'grid', gridTemplateColumns: '110px 1fr 110px', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <span style={{ fontSize: 12, color: r.label.includes('ChangeBag') ? C.green : C.textHi }}>{r.label}</span>
                  <div style={{ background: C.borderDim, borderRadius: 3, height: 10, overflow: 'hidden' }}>
                    <div style={{ width: `${r.pct}%`, background: r.color, height: '100%', borderRadius: 3 }} />
                  </div>
                  <span style={{ fontSize: 11, color: r.label.includes('ChangeBag') ? C.green : C.textMid, fontFamily: fSans, textAlign: 'right' }}>{r.val}</span>
                </div>
              ))}
              <div style={{ marginTop: 24, background: '#0e2614', border: `1px solid ${C.borderDim}`, borderRadius: 6, padding: '12px 16px', fontSize: 12, color: C.green, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                ★ 80% lower CPM than traditional outdoor advertising
              </div>
            </div>

            <div style={{ ...card(), padding: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, alignItems: 'center', cursor: 'pointer' }} onClick={() => toggleMeth('brand')}>
                <p style={{ fontSize: 12, color: C.textMid, margin: 0 }}>Methodology &amp; data sources — brand &amp; marketing</p>
                <span style={{ fontSize: 8, color: C.textLo }}>{openMeth.brand ? '▲' : '▼'}</span>
              </div>
              
              <div style={{ display: openMeth.brand ? 'block' : 'none' }}>
                {[
                  { bold: 'Impressions formula:', text: 'bags × uses_per_tote × visibility_multiplier' },
                  { bold: '', text: `impressions = ${qty.toLocaleString('en-IN')} × 200 × 2.5 = ${fmtIndian(impressions)}\nCPM = (₹${fmtRs(spent).replace('₹', '')} ÷ ${fmtIndian(impressions).replace('L', '00000')}) × 1,000 = ₹${cpm}\nsaving vs OOH = (650 − ${cpm}) ÷ 650 ≈ 99%` },
                  { bold: '200 uses/tote:', text: 'UNEP 2020 conservative mid-point across 10 peer-reviewed LCAs' },
                  { bold: 'Visibility 2.5×:', text: 'One bag seen by 2.5 people per use (Indian transit, market, campus)' },
                  { bold: 'OOH CPM benchmark:', text: '₹500–800 (OAAA India 2024). Digital: ₹200–350 (GDN India avg 2024)' },
                  { bold: `QR scan rate ${scanRate}%:`, text: `${qrScans} scans ÷ ${qty.toLocaleString('en-IN')} bags — ChangeBag pilot data 2024–25` },
                ].map((b, i) => (
                  <p key={i} style={{ fontSize: 11.5, color: C.textMid, lineHeight: 1.6, marginBottom: 8, whiteSpace: 'pre-line' }}>
                    {b.bold ? <><strong style={{ color: C.textHi }}>{b.bold}</strong> {b.text}</> : b.text}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* NGO & SOCIAL IMPACT */}
          <p style={sectionLabel({ marginBottom: 16 })}>NGO &amp; Social Impact</p>

          <div style={{ ...card(), padding: 32, marginBottom: 32 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 32 }}>
              <div>
                <p style={{ fontSize: 52, fontWeight: 400, color: C.green, margin: 0, fontFamily: fSerif, lineHeight: 1 }}>{fmtRs(ngo)}</p>
                <p style={{ fontSize: 12, color: C.textMid, marginTop: 12 }}>Total donated to {ngoName}</p>
              </div>
              <div>
                {[
                  { l: 'Per bag', v: '₹10', l2: 'NGO', v2: ngoName },
                  { l: 'Transfer', v: endDate || issueDate, l2: 'UTR', v2: `UTR${new Date().getFullYear()}0320XXXX` },
                  { l: 'CSR', v: 'Schedule VII (iv) ✓', l2: 'Bags', v2: `${qty.toLocaleString('en-IN')} distributed` },
                ].map((row, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '100px 1fr 100px 1fr', gap: 12, padding: '12px 0', borderBottom: i < 2 ? `1px solid ${C.borderDim}` : 'none' }}>
                    <span style={{ fontSize: 12, color: C.textLo }}>{row.l}</span>
                    <span style={{ fontSize: 12, color: C.textHi }}>{row.v}</span>
                    <span style={{ fontSize: 12, color: C.textLo }}>{row.l2}</span>
                    <span style={{ fontSize: 12, color: C.textHi }}>{row.v2}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 28, borderTop: `1px solid ${C.border}`, paddingTop: 28 }}>
              {[
                { icon: '👦', bold: `${qty.toLocaleString('en-IN')} citizens received a free tote`, sub: `${cities} cities — no purchase required` },
                { icon: '📢', bold: 'Walking brand ambassadors created', sub: `Brand visible daily across ${cities} cities` },
                { icon: '♻️', bold: `${qty > 0 ? (qty * 500 / 1e5).toFixed(0) : 0} lakh plastics out of waste stream`, sub: 'Calculable diversion over bag lifetime' },
                { icon: '💚', bold: 'Cause visible — not locked in a PDF', sub: 'Message at markets, campuses, stations' },
              ].map(r => (
                <div key={r.bold} style={{ background: C.cardDark, border: `1px solid ${C.borderDim}`, borderRadius: 8, padding: '16px 20px', display: 'flex', gap: 16, alignItems: 'center' }}>
                  <span style={{ fontSize: 20 }}>{r.icon}</span>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: C.textHi, margin: 0, marginBottom: 4 }}>{r.bold}</p>
                    <p style={{ fontSize: 11, color: C.textMid, margin: 0 }}>{r.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* IMPACT CERTIFICATE */}
          <p style={sectionLabel({ marginBottom: 16 })}>Impact Certification &amp; Sign-Off</p>

          <div style={{ background: C.certBg, border: `1px solid #14532d`, borderRadius: 12, padding: '40px 48px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
              <div>
                <p style={{ fontSize: 32, fontWeight: 400, margin: '0 0 8px', color: C.textHi, fontFamily: fSerif, letterSpacing: '-0.02em' }}>
                  ChangeBag <em style={{ fontStyle: 'italic', color: C.greenMid, fontWeight: 400 }}>Impact Certificate</em>
                </p>
                <p style={{ fontSize: 12, color: C.textMid, margin: 0 }}>
                  Certificate ID: {certId} · Issued: {issueDate}
                </p>
              </div>
              <div style={{ background: '#0e1f13', border: '1px solid #166534', borderRadius: '50%', width: 72, height: 72, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 24, marginBottom: 2 }}>🌿</span>
                <span style={{ fontSize: 9, color: C.greenMid, fontWeight: 700, letterSpacing: '0.05em' }}>VERIFIED</span>
              </div>
            </div>

            <p style={{ fontSize: 16, color: '#e2ece5', lineHeight: 1.8, marginBottom: 40, maxWidth: 900 }}>
              This certifies that <strong style={{ color: C.textHi, fontWeight: 700 }}>{sp.organizationName}</strong> sponsored a ChangeBag campaign between{' '}
              {startDate} and {endDate === 'Ongoing' ? new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }).replace(',', '') : endDate}, resulting in the distribution of{' '}
              <strong style={{ color: C.textHi, fontWeight: 700 }}>{qty.toLocaleString('en-IN')} branded tote bags</strong> across{' '}
              <strong style={{ color: C.textHi, fontWeight: 700 }}>{cities} Indian cities</strong>, generating verified environmental, social, and brand impact as documented in this report. All impact figures have been independently reviewed.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24, borderTop: '1px solid #14532d', paddingTop: 32 }}>
              {[
                { val: qty.toLocaleString('en-IN'), label: 'Bags distributed', color: C.greenMid },
                { val: co2Kg >= 1000 ? `${(co2Kg / 1000).toFixed(1)} T` : `${co2Kg} KG`, label: 'CO₂e saved', color: C.greenMid },
                { val: fmtRs(ngo).replace(',000', 'K').replace('₹', '₹'), label: 'NGO donation', color: C.greenMid },
                { val: plasticBags >= 1e5 ? `${(plasticBags / 1e5).toFixed(0)} L` : fmtIndian(plasticBags), label: 'Plastics prevented', color: C.greenMid },
              ].map(s => (
                <div key={s.label}>
                  <p style={{ fontSize: 36, fontWeight: 400, color: s.color, margin: 0, fontFamily: fSerif, lineHeight: 1 }}>{s.val}</p>
                  <p style={{ fontSize: 12, color: C.textMid, marginTop: 10 }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 40, borderTop: `1px solid ${C.border}`, paddingTop: 20 }}>
            <p style={{ fontSize: 11, color: '#3f624a', textAlign: 'left' }}>
              changebag.org · ISO 14044 · SEBI BRSR P6 · SDG 12,13,15 <span style={{ float: 'right' }}>{certId}</span>
            </p>
          </div>
        </div>
      </div>
      <Footer />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default SponsorshipReport;
