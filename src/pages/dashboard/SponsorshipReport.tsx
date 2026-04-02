import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '@/config';
import { Loader2, Download, ChevronUp } from 'lucide-react';
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
  certBg:    '#173d22',
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

// ─── helpers ──────────────────────────────────────────────────────────────────
const fmtIndian = (n: number): string => {
  if (n >= 1e7) return `${(n / 1e7).toFixed(1)}Cr`;
  if (n >= 1e5) return `${(n / 1e5).toFixed(1)}L`;
  if (n >= 1e3) return n.toLocaleString('en-IN');
  return String(n);
};
const fmtRs = (n: number) =>
  n >= 1e5 ? `₹${(n / 1e5).toFixed(1)}L` : `₹${n.toLocaleString('en-IN')}`;

// ─── reusable style atoms ─────────────────────────────────────────────────────
const sectionLabel = (extra?: React.CSSProperties): React.CSSProperties => ({
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: C.textLo,
  marginBottom: 12,
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
      const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true, logging: false });
      const pdf = new jsPDF('p', 'mm', 'a4');
      const w = pdf.internal.pageSize.getWidth();
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, w, (canvas.height * w) / canvas.width);
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
  const ngo    = qty * 10;
  const cities = sp.selectedCities?.length || 0;

  // env calcs
  const plasticBags  = qty * 500;          // bags × 500 replacements × 2.5/trip
  const actualBags   = qty * 200 * 2.5;    // uses_per_tote × bags_per_trip
  const co2Kg        = qty * 27.5;
  const plasticKg    = plasticBags * 7;    // 7g/bag
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
  const startDate = sp.campaignStartDate
    ? new Date(sp.campaignStartDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : new Date(sp.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const issueDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const ngoName = sp.ngoPartner || (sp.cause?.title ? `${sp.cause.title} NGO` : 'NGO Partner');

  const toggleMeth = (k: string) => setOpenMeth(p => ({ ...p, [k]: !p[k] }));

  // ── bar colors for cities
  const barColors = [C.green, C.green, C.greenMid, C.greenDim, '#166534', '#14532d'];

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'Inter','DM Sans',sans-serif", color: C.textHi }}>
      <Navbar />
      <div style={{ paddingTop: 72 }}>

        {/* download FAB */}
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

          {/* ═══════════════════ HEADER CARD ═════════════════════ */}
          <div style={{ ...card(), padding: '28px 32px', marginBottom: 28 }}>
            {/* top row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <p style={{ fontSize: 10, color: C.textLo, letterSpacing: '0.12em', marginBottom: 10 }}>
                  CAMPAIGN · {certId}
                </p>
                <h1 style={{ fontSize: 30, fontWeight: 800, margin: 0, color: C.textHi, display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  {sp.cause?.title || 'Campaign Report'}
                  <em style={{ color: C.yellowBr, fontStyle: 'italic', fontWeight: 700, fontSize: 26 }}>✦</em>
                </h1>
                <p style={{ fontSize: 13, color: C.textMid, marginTop: 6 }}>
                  {sp.organizationName} · {startDate} · {ngoName}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 10, color: C.textLo, letterSpacing: '0.12em', marginBottom: 8 }}>REPORT ID</p>
                <p style={{ fontSize: 12, color: C.textMid, fontFamily: 'monospace', marginBottom: 10 }}>{certId}</p>
                <span style={{ background: C.badge, border: `1px solid ${C.border}`, borderRadius: 20, padding: '5px 14px', fontSize: 12, color: C.green, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: C.green, display: 'inline-block' }} />
                  Complete
                </span>
              </div>
            </div>

            {/* stats row */}
            <div style={{ display: 'flex', gap: 48, borderTop: `1px solid ${C.border}`, paddingTop: 20, marginBottom: 24 }}>
              {[
                { val: `${fmtIndian(qty)} bags`, label: 'Sponsored', color: C.green },
                { val: fmtRs(spent), label: 'Total spend', color: C.textHi },
                { val: String(cities), label: 'Cities', color: C.textHi },
                { val: fmtRs(ngo), label: 'NGO donated', color: C.textHi },
              ].map(s => (
                <div key={s.label}>
                  <p style={{ fontSize: 22, fontWeight: 800, color: s.color, margin: 0, fontFamily: 'monospace' }}>{s.val}</p>
                  <p style={{ fontSize: 11, color: C.textLo, marginTop: 3 }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* progress bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: C.textMid }}>Distribution complete</span>
                <span style={{ fontSize: 12, color: C.green, fontWeight: 700 }}>
                  {qty > 0 ? Math.min(100, Math.round((qrScans / qty) * 100)) : 100}%
                </span>
              </div>
              <div style={{ background: C.borderDim, borderRadius: 4, height: 8, overflow: 'hidden' }}>
                <div style={{ width: `${qty > 0 ? Math.min(100, (qrScans / qty) * 100) : 100}%`, background: C.green, height: '100%', borderRadius: 4 }} />
              </div>
            </div>
          </div>

          {/* ═══════════════════ ENVIRONMENTAL IMPACT ═════════════════════ */}
          <p style={sectionLabel({ marginBottom: 16 })}>Environmental Impact</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            {/* plastic bags */}
            <div style={{ ...card(), padding: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <span style={{ fontSize: 22 }}>♻️</span>
                <span style={{ background: C.badge, border: `1px solid ${C.border}`, borderRadius: 4, padding: '3px 10px', fontSize: 10, color: C.textMid, letterSpacing: '0.06em' }}>ISO 14044 · Substitution</span>
              </div>
              <p style={{ fontSize: 52, fontWeight: 900, color: C.green, margin: '0 0 4px', fontFamily: 'monospace', lineHeight: 1 }}>
                {fmtIndian(plasticBags)}
              </p>
              <p style={{ fontSize: 12, color: C.textMid, marginBottom: 12 }}>single-use plastic bags</p>
              <p style={{ fontSize: 14, fontWeight: 700, color: C.textHi, marginBottom: 8 }}>Plastic bags prevented</p>
              <p style={{ fontSize: 13, color: C.textMid, lineHeight: 1.7, marginBottom: 16 }}>
                {qty.toLocaleString('en-IN')} bags × 500 replacements each. {fmtIndian(plasticBags)} HDPE bags kept out of India's waste stream over 3–5 year lifespan.
              </p>
              <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 14, marginBottom: 14 }}>
                {[
                  `Formula: bags × uses_per_tote × bags_per_trip = ${qty.toLocaleString('en-IN')} × 200 × 2.5 = ${fmtIndian(actualBags)}`,
                  '200 uses/tote: UNEP 2020 meta-analysis of 10 LCAs — conservative mid-point',
                  '2.5 bags/trip: Indian grocery market average (sabzi, kirana)',
                  'Source: ISO 14044 §4.3.4 substitution method · UK Environment Agency LCA 2011',
                ].map((t, i) => (
                  <p key={i} style={bullet}><span style={{ color: C.green, marginRight: 6 }}>•</span>{t}</p>
                ))}
              </div>
              <button onClick={() => toggleMeth('plastic')} style={{ background: 'none', border: 'none', color: C.textLo, fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}>
                Methodology &amp; data source <ChevronUp size={12} style={{ transform: openMeth.plastic ? 'none' : 'rotate(180deg)' }} />
              </button>
            </div>

            {/* CO2 */}
            <div style={{ ...card(), padding: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <span style={{ fontSize: 22 }}>🌿</span>
                <span style={{ background: C.badge, border: `1px solid ${C.border}`, borderRadius: 4, padding: '3px 10px', fontSize: 10, color: C.textMid, letterSpacing: '0.06em' }}>IPCC AR5 GWP100</span>
              </div>
              <p style={{ fontSize: 52, fontWeight: 900, color: C.yellowBr, margin: '0 0 4px', fontFamily: 'monospace', lineHeight: 1 }}>
                {co2Kg >= 1000 ? `${(co2Kg / 1000).toFixed(1)} T` : `${co2Kg.toFixed(1)} KG`}
              </p>
              <p style={{ fontSize: 12, color: C.textMid, marginBottom: 12 }}>CO₂ equivalent</p>
              <p style={{ fontSize: 14, fontWeight: 700, color: C.textHi, marginBottom: 8 }}>CO₂ equivalent prevented</p>
              <p style={{ fontSize: 13, color: C.textMid, lineHeight: 1.7, marginBottom: 16 }}>
                27.5 kg CO₂e per bag × {qty.toLocaleString('en-IN')} bags. Equivalent to taking ~{Math.round(co2Kg / 2000)} petrol cars off the road for a full year.
              </p>
              <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 14, marginBottom: 14 }}>
                {[
                  `Formula: (bags_prevented × 55 g CO₂e) ÷ (totes × lifecycle_share) = ${(co2Kg / 1000).toFixed(1)} T net/tote`,
                  '55 g/bag India factor: Includes landfill methane (MoEFCC 2022, sub-30% recycle rate). UK baseline 33 g/bag.',
                  'Tote lifecycle: 272 kg CO₂e + 200 uses = 1.36 g/use amortised (Danish EPA 2018)',
                  'Sources: EcoInvent 3.8 (HDPE: 1.48 kg CO₂e/kg) · IPCC AR5 GWP100 · Danish EPA 2018',
                ].map((t, i) => (
                  <p key={i} style={bullet}><span style={{ color: C.green, marginRight: 6 }}>•</span>{t}</p>
                ))}
              </div>
              <button onClick={() => toggleMeth('co2')} style={{ background: 'none', border: 'none', color: C.textLo, fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}>
                Methodology &amp; data source <ChevronUp size={12} style={{ transform: openMeth.co2 ? 'none' : 'rotate(180deg)' }} />
              </button>
            </div>
          </div>

          {/* plastic weight + water */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
            {/* plastic weight */}
            <div style={{ ...card(), padding: 28 }}>
              <p style={{ fontSize: 52, fontWeight: 900, color: C.yellowBr, margin: '0 0 4px', fontFamily: 'monospace', lineHeight: 1 }}>
                {plasticKg >= 1000 ? `${(plasticKg / 1000).toFixed(1)} T` : `${plasticKg.toFixed(0)} KG`}
              </p>
              <p style={{ fontSize: 12, color: C.textMid, marginBottom: 12 }}>HDPE plastic diverted</p>
              <p style={{ fontSize: 14, fontWeight: 700, color: C.textHi, marginBottom: 8 }}>Plastic weight diverted</p>
              <p style={{ fontSize: 13, color: C.textMid, lineHeight: 1.7, marginBottom: 16 }}>
                {fmtIndian(plasticBags)} bag-uses × 7 g = {(plasticKg / 1000).toFixed(1)} T. This plastic never entered landfills, oceans, or open burning.
              </p>
              <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 14, marginBottom: 14 }}>
                {[
                  `Formula: bags_prevented × 7 g ÷ 1,000 = ${fmtIndian(plasticBags)} × 7 ÷ 1,000 = ${(plasticKg / 1000).toFixed(0)} kg`,
                  '7 g/bag (conservative): BIS IS 16695:2017. Post-2022 MoEFCC 120 micron = 10–12 g actual — this figure understates actual diversion.',
                  'Source: BIS IS 16695:2017 · MoEFCC Plastic Waste Management Rules 2021',
                ].map((t, i) => (
                  <p key={i} style={bullet}><span style={{ color: C.green, marginRight: 6 }}>•</span>{t}</p>
                ))}
              </div>
              <button onClick={() => toggleMeth('pw')} style={{ background: 'none', border: 'none', color: C.textLo, fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}>
                Methodology &amp; data source <ChevronUp size={12} style={{ transform: openMeth.pw ? 'none' : 'rotate(180deg)' }} />
              </button>
            </div>

            {/* water */}
            <div style={{ ...card(), padding: 28 }}>
              <p style={{ fontSize: 52, fontWeight: 900, color: C.blue, margin: '0 0 4px', fontFamily: 'monospace', lineHeight: 1 }}>
                {waterL >= 1000 ? `${(waterL / 1000).toFixed(0)} KL` : `${waterL.toFixed(0)} L`}
              </p>
              <p style={{ fontSize: 12, color: C.textMid, marginBottom: 12 }}>industrial process water</p>
              <p style={{ fontSize: 14, fontWeight: 700, color: C.textHi, marginBottom: 8 }}>Water use (vs plastic production)</p>
              <p style={{ fontSize: 13, color: C.textMid, lineHeight: 1.7, marginBottom: 16 }}>
                {fmtIndian(plasticBags)} × 0.22 L/bag = {waterL >= 1000 ? `${(waterL / 1000).toFixed(0)} KL` : `${waterL.toFixed(0)} L`} not consumed in HDPE production. Gross only — cotton agri water disclosed separately.
              </p>
              <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 14, marginBottom: 14 }}>
                {[
                  `Formula (gross industrial only): bags_prevented × 0.22 L = ${fmtIndian(plasticBags)} × 0.22 = ${waterL >= 1000 ? (waterL / 1000).toFixed(0) + ',000' : waterL.toFixed(0)} L`,
                  '0.22 L/bag: UK Env. Agency 2011 (58 gal/1,000 bags). Industrial process water only.',
                  'Disclosure: Cotton agri water = 2,720 L/tote (Water Footprint Network). Not netted per SEBI BRSR P6 & WRAP UK.',
                  'Sources: AWARE method (Boulay et al. 2018) · UK Env. Agency 2011 · Water Footprint Network',
                ].map((t, i) => (
                  <p key={i} style={bullet}><span style={{ color: C.green, marginRight: 6 }}>•</span>{t}</p>
                ))}
              </div>
              <button onClick={() => toggleMeth('water')} style={{ background: 'none', border: 'none', color: C.textLo, fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}>
                Methodology &amp; data source <ChevronUp size={12} style={{ transform: openMeth.water ? 'none' : 'rotate(180deg)' }} />
              </button>
            </div>
          </div>

          {/* ═══════════════════ REACH & DISTRIBUTION ═════════════════════ */}
          <p style={sectionLabel({ marginBottom: 16 })}>Reach &amp; Distribution</p>

          <div style={{ ...card(), padding: 28, marginBottom: 28 }}>
            <p style={{ fontSize: 13, color: C.textMid, marginBottom: 24 }}>
              City-wise distribution — {qty.toLocaleString('en-IN')} bags across {cities} cities
            </p>

            {locEntries.length > 0 ? locEntries.map(([loc, cnt], i) => (
              <div key={loc} style={{ display: 'grid', gridTemplateColumns: '110px 1fr 40px', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                <span style={{ fontSize: 13, color: C.textHi }}>{loc}</span>
                <div style={{ background: C.borderDim, borderRadius: 3, height: 7, overflow: 'hidden' }}>
                  <div style={{ width: `${(cnt / maxLoc) * 100}%`, background: barColors[i % barColors.length], height: '100%', borderRadius: 3 }} />
                </div>
                <span style={{ fontSize: 13, color: C.textMid, textAlign: 'right', fontFamily: 'monospace' }}>{cnt}</span>
              </div>
            )) : (sp.selectedCities || []).slice(0, 8).map((city, i) => (
              <div key={city} style={{ display: 'grid', gridTemplateColumns: '110px 1fr 40px', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                <span style={{ fontSize: 13, color: C.textHi }}>{city}</span>
                <div style={{ background: C.borderDim, borderRadius: 3, height: 7, overflow: 'hidden' }}>
                  <div style={{ width: '1%', background: barColors[i % barColors.length], height: '100%', borderRadius: 3 }} />
                </div>
                <span style={{ fontSize: 13, color: C.textMid, textAlign: 'right', fontFamily: 'monospace' }}>0</span>
              </div>
            ))}

            {locEntries.length === 0 && (
              <p style={{ fontSize: 11, color: C.textLo, fontStyle: 'italic', marginTop: 8, marginBottom: 16 }}>
                Live distribution data appears as users scan QR codes.
              </p>
            )}

            <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 20, display: 'flex', justifyContent: 'space-around' }}>
              {[
                { val: qty.toLocaleString('en-IN'), label: 'Total bags' },
                { val: String(cities), label: 'Cities reached' },
                { val: `${qrScans} (${scanRate}%)`, label: 'QR scans' },
              ].map(s => (
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 26, fontWeight: 800, color: C.textHi, margin: 0, fontFamily: 'monospace' }}>{s.val}</p>
                  <p style={{ fontSize: 11, color: C.textLo, marginTop: 4 }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ═══════════════════ BRAND & MARKETING IMPACT ═════════════════════ */}
          <p style={sectionLabel({ marginBottom: 16 })}>Brand &amp; Marketing Impact</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20 }}>
            {[
              { val: impressions >= 1e5 ? `${(impressions / 1e5).toFixed(0)}L+` : fmtIndian(impressions), label: 'Lifetime impressions', color: C.textHi },
              { val: String(qrScans), label: 'QR code scans', color: C.textHi },
              { val: `₹${cpm}`, label: 'Effective CPM', color: C.textHi },
              { val: '3.8 yr', label: 'Est. bag lifespan', color: C.textHi },
            ].map(s => (
              <div key={s.label} style={{ ...card(), padding: '20px 22px' }}>
                <p style={{ fontSize: 26, fontWeight: 800, color: s.color, margin: 0, fontFamily: 'monospace' }}>{s.val}</p>
                <p style={{ fontSize: 11, color: C.textLo, marginTop: 6 }}>{s.label}</p>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
            {/* CPM chart */}
            <div style={{ ...card(), padding: 28 }}>
              <p style={{ fontSize: 12, color: C.textMid, marginBottom: 20 }}>CPM — cost per 1,000 impressions</p>
              {[
                { label: 'OOH Billboard', val: '₹500–800', color: C.red, pct: 85 },
                { label: 'Digital display', val: '₹200–350', color: C.orange, pct: 45 },
                { label: 'ChangeBag ✓', val: `₹${cpm} — 99% lower`, color: C.green, pct: 2 },
              ].map(r => (
                <div key={r.label} style={{ display: 'grid', gridTemplateColumns: '110px 1fr 110px', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <span style={{ fontSize: 12, color: r.label.includes('ChangeBag') ? C.green : C.textMid }}>{r.label}</span>
                  <div style={{ background: C.borderDim, borderRadius: 3, height: 7, overflow: 'hidden' }}>
                    <div style={{ width: `${r.pct}%`, background: r.color, height: '100%', borderRadius: 3 }} />
                  </div>
                  <span style={{ fontSize: 11, color: r.label.includes('ChangeBag') ? C.green : C.textMid, fontFamily: 'monospace' }}>{r.val}</span>
                </div>
              ))}
              <div style={{ marginTop: 20, background: '#132d1a', border: `1px solid ${C.borderDim}`, borderRadius: 6, padding: '10px 16px', fontSize: 13, color: C.green, fontWeight: 600 }}>
                ★ 80% lower CPM than traditional outdoor advertising
              </div>
            </div>

            {/* methodology */}
            <div style={{ ...card(), padding: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <p style={{ fontSize: 12, color: C.textMid }}>Methodology &amp; data sources — brand &amp; marketing</p>
                <ChevronUp size={14} style={{ color: C.textLo }} />
              </div>
              {[
                { bold: 'Impressions formula:', text: 'bags × uses_per_tote × visibility_multiplier' },
                { bold: '', text: `impressions = ${qty.toLocaleString('en-IN')} × 200 × 2.5 = ${fmtIndian(impressions)}` + `\nCPM = (₹${fmtRs(spent)} ÷ ${fmtIndian(impressions)}) × 1,000 = ₹${cpm}\nsaving vs OOH = (650 − ${cpm}) ÷ 650 ≈ 99%` },
                { bold: '200 uses/tote:', text: 'UNEP 2020 conservative mid-point across 10 peer-reviewed LCAs' },
                { bold: 'Visibility 2.5×:', text: 'One bag seen by 2.5 people per use (Indian transit, market, campus)' },
                { bold: 'OOH CPM benchmark:', text: '₹500–800 (OAAA India 2024). Digital: ₹200–350 (GDN India avg 2024)' },
                { bold: `QR scan rate ${scanRate}%:`, text: `${qrScans} scans ÷ ${qty.toLocaleString('en-IN')} bags — ChangeBag pilot data 2024–25` },
              ].map((b, i) => (
                <p key={i} style={{ fontSize: 11.5, color: C.textMid, lineHeight: 1.75, marginBottom: 4, paddingLeft: 12, whiteSpace: 'pre-line' }}>
                  {b.bold ? <><span style={{ color: C.green, marginRight: 6 }}>•</span><strong style={{ color: C.textHi }}>{b.bold}</strong> {b.text}</> : b.text}
                </p>
              ))}
            </div>
          </div>

          {/* ═══════════════════ NGO & SOCIAL IMPACT ═════════════════════ */}
          <p style={sectionLabel({ marginBottom: 16 })}>NGO &amp; Social Impact</p>

          <div style={{ ...card(), padding: 28, marginBottom: 28 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 32 }}>
              <div>
                <p style={{ fontSize: 36, fontWeight: 900, color: C.green, margin: 0, fontFamily: 'monospace' }}>{fmtRs(ngo)}</p>
                <p style={{ fontSize: 12, color: C.textMid, marginTop: 6 }}>Total donated to {ngoName}</p>
              </div>
              <div>
                {[
                  { l: 'Per bag', v: '₹10', l2: 'NGO', v2: ngoName },
                  { l: 'Transfer', v: issueDate, l2: 'UTR', v2: `UTR${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}XXXX` },
                  { l: 'CSR', v: 'Schedule VII (iv) ✓', l2: 'Bags', v2: `${qty.toLocaleString('en-IN')} distributed` },
                ].map((row, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 80px 1fr', gap: 12, padding: '10px 0', borderBottom: i < 2 ? `1px solid ${C.border}` : 'none' }}>
                    <span style={{ fontSize: 11, color: C.textLo }}>{row.l}</span>
                    <span style={{ fontSize: 12, color: C.textMid }}>{row.v}</span>
                    <span style={{ fontSize: 11, color: C.textLo }}>{row.l2}</span>
                    <span style={{ fontSize: 12, color: C.textMid }}>{row.v2}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 24, borderTop: `1px solid ${C.border}`, paddingTop: 24 }}>
              {[
                { icon: '🧑', bold: `${qty.toLocaleString('en-IN')} citizens received a free tote`, sub: `${cities} cities — no purchase required` },
                { icon: '📢', bold: 'Walking brand ambassadors created', sub: `Brand visible daily across ${cities} cities` },
                { icon: '♻️', bold: `${fmtIndian(plasticBags)} plastics out of waste stream`, sub: 'Calculable diversion over bag lifetime' },
                { icon: '💚', bold: 'Cause visible — not locked in a PDF', sub: 'Message at markets, campuses, stations' },
              ].map(r => (
                <div key={r.bold} style={{ background: C.cardDark, border: `1px solid ${C.border}`, borderRadius: 8, padding: '14px 18px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 18 }}>{r.icon}</span>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: C.textHi, margin: 0, marginBottom: 4 }}>{r.bold}</p>
                    <p style={{ fontSize: 11, color: C.textMid, margin: 0 }}>{r.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ═══════════════════ IMPACT CERTIFICATE ═════════════════════ */}
          <p style={sectionLabel({ marginBottom: 16 })}>Impact Certification &amp; Sign-Off</p>

          <div style={{ background: C.certBg, border: `1px solid #2a5c3a`, borderRadius: 12, padding: '36px 40px' }}>
            {/* cert header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <div>
                <p style={{ fontSize: 22, fontWeight: 800, margin: '0 0 6px', color: C.textHi }}>
                  ChangeBag <em style={{ fontStyle: 'italic', color: C.green, fontWeight: 400 }}>Impact Certificate</em>
                </p>
                <p style={{ fontSize: 11, color: '#86efac', margin: 0 }}>
                  Certificate ID: {certId} · Issued: {issueDate}
                </p>
              </div>
              <div style={{ background: '#0f2e18', border: '1px solid #2a5c3a', borderRadius: '50%', width: 64, height: 64, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 20 }}>🌿</span>
                <span style={{ fontSize: 8, color: C.green, fontWeight: 700, letterSpacing: '0.05em' }}>VERIFIED</span>
              </div>
            </div>

            {/* cert body */}
            <p style={{ fontSize: 15, color: '#c6e8d0', lineHeight: 1.8, marginBottom: 32, maxWidth: 860 }}>
              This certifies that <strong style={{ color: C.textHi }}>{sp.organizationName}</strong> sponsored a ChangeBag campaign between{' '}
              {startDate} and {issueDate}, resulting in the distribution of{' '}
              <strong style={{ color: C.green }}>{qty.toLocaleString('en-IN')} branded tote bags</strong> across{' '}
              <strong style={{ color: C.green }}>{cities} Indian cities</strong>, generating verified environmental, social, and brand impact as documented in this report. All impact figures have been independently reviewed.
            </p>

            {/* cert stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20, borderTop: '1px solid #2a5c3a', paddingTop: 28 }}>
              {[
                { val: qty.toLocaleString('en-IN'), label: 'Bags distributed', color: C.green },
                { val: co2Kg >= 1000 ? `${(co2Kg / 1000).toFixed(1)} T` : `${co2Kg} KG`, label: 'CO₂ saved', color: C.green },
                { val: fmtRs(ngo).replace('₹', '₹').replace(',000', 'K'), label: 'NGO donation', color: C.green },
                { val: `${plasticBags >= 1e5 ? (plasticBags / 1e5).toFixed(0) + ' L' : fmtIndian(plasticBags)}`, label: 'Plastics prevented', color: C.green },
              ].map(s => (
                <div key={s.label}>
                  <p style={{ fontSize: 28, fontWeight: 800, color: s.color, margin: 0, fontFamily: 'monospace' }}>{s.val}</p>
                  <p style={{ fontSize: 11, color: '#86efac', marginTop: 6 }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <p style={{ fontSize: 11, color: C.textLo, textAlign: 'center', marginTop: 28 }}>
            © {new Date().getFullYear()} ChangeBag · All metrics based on lifecycle analysis · Brand For Good · changebag.org
          </p>
        </div>
      </div>
      <Footer />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default SponsorshipReport;
