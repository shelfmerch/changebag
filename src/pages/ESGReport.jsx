import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import s from './ESGReport.module.css'

/* ── Mock data — replace with real API call ── */
const MOCK_REPORT = {
  id: 'CB-2025-IO-0041',
  period: 'Jan 15 – Mar 15, 2025',
  issuedDate: 'March 20, 2025',
  brand: { name: 'IndianOil Corporation Ltd.', short: 'IndianOil', code: 'IO', type: 'MAHARATNA PSU · Ministry of Petroleum & Natural Gas' },
  campaign: { name: 'Clean Energy, Clean India', cause: 'Green Mission India', period: 'Jan 15 – Mar 15, 2025', days: 60, bags: 50000, cities: 240, states: 18, spend: '₹62.5L', qrUrl: 'changebag.org/iocl-green-q1', distribution: 'Petrol stations, markets, RWA events' },
  env: { plasticBags: '2.5Cr', co2Tonnes: 1375, plasticKg: 62500, waterKl: 87.5 },
  brand_impact: { impressions: '25M+', qrScans: 84200, cpm: '₹0.025', bagLifespan: '3.8 yr', scanRate: '4.2%', cities: 240 },
  ngo: { name: 'Green Mission India', reg: 'FCRA Reg. No. 083780224', donation: '₹5,00,000', donationConfirmed: 'March 20, 2025', utr: 'IOCB202503200041', additionalDonations: '₹84,000', newSignups: 2840 },
  cities: [
    { name: 'Delhi NCR', bags: 8200, pct: 100 }, { name: 'Mumbai', bags: 7400, pct: 90 },
    { name: 'Bengaluru', bags: 6100, pct: 74 }, { name: 'Hyderabad', bags: 5300, pct: 65 },
    { name: 'Chennai', bags: 4800, pct: 59 }, { name: 'Pune', bags: 3900, pct: 48 },
    { name: 'Kolkata', bags: 3600, pct: 44 }, { name: 'Ahmedabad', bags: 2900, pct: 35 },
    { name: '232 other cities', bags: 7800, pct: 95 },
  ],
  certFacts: [['50,000','Bags distributed'],['1,375 T','CO₂e saved'],['₹5L','NGO donation'],['2.5Cr','Plastics prevented']],
}

/* ── Donut SVG ── */
function Donut({ data }) {
  const total = data.reduce((s, d) => s + d.value, 0)
  let offset = 0
  const r = 54, circ = 2 * Math.PI * r

  return (
    <svg width="160" height="160" viewBox="0 0 160 160">
      {data.map(({ value, color }, i) => {
        const dash = (value / total) * circ
        const el = (
          <circle key={i} cx="80" cy="80" r={r} fill="none" stroke={color}
            strokeWidth="28" strokeDasharray={`${dash} ${circ - dash}`}
            strokeDashoffset={-offset} transform="rotate(-90 80 80)" />
        )
        offset += dash
        return el
      })}
      <circle cx="80" cy="80" r="40" fill="white" />
      <text x="80" y="77" textAnchor="middle" fontFamily="Instrument Serif,Georgia,serif" fontSize="18" fill="#0d3d22">50K</text>
      <text x="80" y="91" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="9" fill="#9b9b84">bags</text>
    </svg>
  )
}

/* ── Page ── */
export default function ESGReport() {
  const { reportId } = useParams()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true)
      try {
        // ── Connect to your Express backend ──
        // const res = await fetch(`/api/reports/${reportId}`)
        // if (!res.ok) throw new Error('Not found')
        // const data = await res.json()
        // setReport(data)

        // Mock: simulate API delay
        await new Promise((r) => setTimeout(r, 600))
        setReport(MOCK_REPORT)
      } catch (err) {
        setReport(null)
      } finally {
        setLoading(false)
      }
    }
    fetchReport()
  }, [reportId])

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return (
    <div className={s.loadingScreen}>
      <div className={s.loadingDot} />
      <div className={s.loadingDot} style={{ animationDelay: '.15s' }} />
      <div className={s.loadingDot} style={{ animationDelay: '.3s' }} />
      <p>Loading impact report…</p>
    </div>
  )

  if (!report) return (
    <div className={s.errorScreen}>
      <div className={s.errorIcon}>🔍</div>
      <h2>Report not found</h2>
      <p>Report ID <code>{reportId}</code> doesn't exist or you may not have access.</p>
      <Link to="/" className={s.errorBack}>← Back to ChangeBag</Link>
    </div>
  )

  const r = report

  return (
    <div className={s.root}>

      {/* ── ACTION BAR ── */}
      <div className={s.actionBar}>
        <div className={s.abLeft}>
          <Link to="/" className={s.abLogo}>ChangeBag</Link>
          <div className={s.abSep} />
          <span className={s.abLabel}>ESG Impact Report · {r.period}</span>
        </div>
        <div className={s.abRight}>
          <button className={s.abBtnGhost} onClick={copyLink}>
            🔗 {copied ? 'Copied!' : 'Copy link'}
          </button>
          <button className={s.abBtnPrimary} onClick={() => window.print()}>
            🖨️ Download PDF
          </button>
        </div>
      </div>

      <div className={s.reportWrap}>

        {/* ══ COVER ══ */}
        <div className={s.page}>
          <div className={s.cover}>
            <div className={s.coverNoise} />
            <div className={s.coverGrid} />
            <div className={s.coverGlow} />
            <div className={s.coverTop}>
              <div className={s.coverBrandRow}>
                <div className={s.coverLogo}>{r.brand.code}</div>
                <div>
                  <div className={s.coverBrandName}>{r.brand.name}</div>
                  <div className={s.coverBrandType}>{r.brand.type}</div>
                </div>
              </div>
              <div className={s.coverCbLogo}>ChangeBag</div>
            </div>
            <div className={s.coverBody}>
              <div className={s.coverReportType}>Environmental, Social & Governance Report</div>
              <h1 className={s.coverTitle}>{r.campaign.name},<br /><em>Clean India.</em></h1>
              <div className={s.coverCampaign}>{r.campaign.cause} Campaign · Q1 2025</div>
              <div className={s.coverMeta}>
                {[['Report period', r.campaign.period],['Report ID', r.id],['Issued by', 'ChangeBag Platform'],['Framework', 'SEBI BRSR · GRI 301']].map(([k, v]) => (
                  <div key={k} className={s.coverMetaItem}>
                    <div className={s.coverMetaLabel}>{k}</div>
                    <div className={s.coverMetaVal}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className={s.coverCert}>
              <div className={s.certSealIcon}>🌿</div>
              <div className={s.certSealTitle}>Certified Impact</div>
              <div className={s.certSealSub}>Third-party verified</div>
            </div>
          </div>
        </div>

        {/* ══ EXEC SUMMARY ══ */}
        <div className={s.page}>
          <div className={s.sectionHeader}>
            <div className={s.sectionNum}>01</div>
            <div><div className={s.sectionEye}>Overview</div><div className={s.sectionTitle}>Executive Summary</div></div>
          </div>
          <div className={s.sectionBody}>
            <div className={s.execIntro}>
              This report documents the verified environmental, social, and governance impact of <strong>{r.brand.short}'s {r.campaign.name}</strong> campaign executed through the ChangeBag platform between {r.campaign.period}. The campaign sponsored <strong>{r.campaign.bags.toLocaleString('en-IN')} branded tote bags</strong> distributed free to citizens across {r.campaign.cities}+ Indian cities.
            </div>
            <div className={s.kpiGrid}>
              {[['50K','Bags distributed'],[r.brand_impact.impressions,'Brand impressions'],['1,375 T','CO₂ equivalent prevented'],['₹5L','Donated to NGO']].map(([n, l], i) => (
                <div key={l} className={`${s.kpi} ${i === 1 ? s.kpiHighlight : ''}`}>
                  <div className={s.kpiNum}>{n}</div>
                  <div className={s.kpiLabel}>{l}</div>
                </div>
              ))}
            </div>
            <div className={s.tagRow}>
              {[['📋','SEBI BRSR Principle 6 · E disclosure compliant','gold'],['♻️','GRI 301-1 · Materials used by weight','green'],['📊','UN SDG 12, 13, 15 aligned','purple']].map(([icon, label, color]) => (
                <div key={label} className={`${s.complianceTag} ${s[`tag_${color}`]}`}>{icon} {label}</div>
              ))}
            </div>
          </div>
        </div>

        {/* ══ CAMPAIGN OVERVIEW ══ */}
        <div className={s.page}>
          <div className={s.sectionHeader}>
            <div className={s.sectionNum}>02</div>
            <div><div className={s.sectionEye}>Campaign details</div><div className={s.sectionTitle}>Campaign Overview</div></div>
          </div>
          <div className={s.sectionBody}>
            <div className={s.overviewGrid}>
              <div className={s.detailsTable}>
                {[
                  ['Sponsor', r.brand.name], ['Campaign name', r.campaign.name],
                  ['Period', `${r.campaign.period} (${r.campaign.days} days)`],
                  ['Bags sponsored', `${r.campaign.bags.toLocaleString('en-IN')} branded cotton tote bags`],
                  ['Geography', `${r.campaign.cities}+ cities across ${r.campaign.states} states`],
                  ['Cause partner', r.ngo.name],
                  ['Bag material', '100% natural cotton canvas, water-based inks'],
                  ['QR campaign URL', r.campaign.qrUrl],
                  ['Distribution method', r.campaign.distribution],
                  ['Total spend', r.campaign.spend],
                ].map(([k, v]) => (
                  <div key={k} className={s.detailRow}>
                    <span className={s.detailKey}>{k}</span>
                    <span className={s.detailVal}>{v}</span>
                  </div>
                ))}
              </div>
              <div className={s.timelineBox}>
                <div className={s.tlBoxTitle}>Campaign timeline</div>
                {[['Design & approval','Jan 1–14',100],['Production','Jan 14–21',100],['Wave 1 distribution','Jan 15 – Feb 15',100],['Wave 2 distribution','Feb 15 – Mar 15',100],['Impact tracking','Ongoing',65]].map(([label, date, pct]) => (
                  <div key={label} className={s.tlBarWrap}>
                    <div className={s.tlBarLabel}><span>{label}</span><span>{date}</span></div>
                    <div className={s.tlBarTrack}><div className={s.tlBarFill} style={{ width: `${pct}%`, opacity: pct < 100 ? 0.5 : 1 }} /></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ══ ENVIRONMENTAL IMPACT ══ */}
        <div className={s.page}>
          <div className={s.sectionHeader}>
            <div className={s.sectionNum}>03</div>
            <div><div className={s.sectionEye}>E — Environmental</div><div className={s.sectionTitle}>Environmental Impact</div></div>
          </div>
          <div className={s.sectionBody}>
            <div className={s.envGrid}>
              {[
                { cls: 'envGreen', icon: '♻️', title: 'Plastic bags prevented', num: r.env.plasticBags, sub: '50,000 bags × 500 single-use replacements each' },
                { cls: 'envCream', icon: '🌿', title: 'CO₂ equivalent prevented', num: `${r.env.co2Tonnes.toLocaleString()} T`, sub: 'At 27.5 kg CO₂e saved per sponsored bag over its lifecycle' },
                { cls: 'envPale', icon: '🏭', title: 'Plastic weight diverted', num: `${r.env.plasticKg.toLocaleString()} kg`, sub: 'This plastic never entered landfills, oceans, or incineration' },
                { cls: 'envGold', icon: '💧', title: 'Net water saved', num: `${r.env.waterKl} KL`, sub: 'Lifecycle net water vs plastic production amortised over 200+ uses' },
              ].map(({ cls, icon, title, num, sub }) => (
                <div key={title} className={`${s.envCard} ${s[cls]}`}>
                  <span className={s.envIcon}>{icon}</span>
                  <div className={s.envTitle}>{title}</div>
                  <div className={s.envNum}>{num}</div>
                  <div className={s.envSub}>{sub}</div>
                </div>
              ))}
            </div>
            <div className={s.methodology}>
              <strong>Methodology</strong> — Plastic bag replacement factor (500×) based on average bag lifespan surveys across 1,200 ChangeBag users. CO₂ figure uses WRAP UK lifecycle assessment (27.5 kg CO₂e breakeven at 200 uses). Third-party verification by EY India Sustainability Practice. All figures are conservative estimates.
            </div>
          </div>
        </div>

        {/* ══ REACH & DISTRIBUTION ══ */}
        <div className={s.page}>
          <div className={s.sectionHeader}>
            <div className={s.sectionNum}>04</div>
            <div><div className={s.sectionEye}>Distribution data</div><div className={s.sectionTitle}>Reach & Distribution</div></div>
          </div>
          <div className={s.sectionBody}>
            <div className={s.reachGrid}>
              <table className={s.cityTable}>
                <thead>
                  <tr><th>City</th><th>Bags</th><th>Share</th><th style={{ textAlign: 'left' }}>Reach</th></tr>
                </thead>
                <tbody>
                  {r.cities.map(({ name, bags, pct }, i) => (
                    <tr key={name}>
                      <td><span className={`${s.cityRank} ${i < 3 ? s.top3 : ''}`}>{i < 8 ? i + 1 : '—'}</span>{name}</td>
                      <td>{bags ? bags.toLocaleString('en-IN') : '7,800'}</td>
                      <td>{bags ? `${((bags / 50000) * 100).toFixed(1)}%` : '15.6%'}</td>
                      <td><div className={s.miniBar}><div className={s.miniFill} style={{ width: `${pct}%`, background: i === 8 ? 'var(--green-light)' : undefined }} /></div></td>
                    </tr>
                  ))}
                  <tr className={s.totalRow}><td><strong>Total</strong></td><td><strong>50,000</strong></td><td><strong>100%</strong></td><td /></tr>
                </tbody>
              </table>
              <div className={s.donutBox}>
                <div className={s.donutTitle}>Distribution by region</div>
                <Donut data={[
                  { value: 32, color: '#0d3d22' }, { value: 24, color: '#1a6b3a' },
                  { value: 22, color: '#2eb85c' }, { value: 14, color: '#c8f0d4' },
                  { value: 8,  color: '#ede9e0' },
                ]} />
                <div className={s.donutLegend}>
                  {[['#0d3d22','North India','32%'],['#1a6b3a','South India','24%'],['#2eb85c','West India','22%'],['#c8f0d4','East India','14%'],['#ede9e0','Central India','8%']].map(([c, l, p]) => (
                    <div key={l} className={s.legendItem}>
                      <div className={s.legendDot} style={{ background: c }} />
                      <span>{l}</span>
                      <span className={s.legendPct}>{p}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ══ BRAND IMPACT ══ */}
        <div className={s.page}>
          <div className={s.sectionHeader}>
            <div className={s.sectionNum}>05</div>
            <div><div className={s.sectionEye}>G — Governance / Brand ROI</div><div className={s.sectionTitle}>Brand & Marketing Impact</div></div>
          </div>
          <div className={s.sectionBody}>
            <div className={s.brandMetrics}>
              {[[r.brand_impact.impressions,'Total impressions'],[r.brand_impact.qrScans.toLocaleString('en-IN'),'QR code scans'],[r.brand_impact.cpm,'Effective CPM'],[r.brand_impact.bagLifespan,'Est. bag lifespan'],[r.brand_impact.scanRate,'QR scan rate'],[r.campaign.cities+'+','Cities with brand presence']].map(([n, l]) => (
                <div key={l} className={s.bm}><div className={s.bmNum}>{n}</div><div className={s.bmLabel}>{l}</div></div>
              ))}
            </div>
            <div className={s.cpmTable}>
              <div className={s.cpmHeader}><span>Ad medium</span><span>Cost per impression</span><span>Campaign total</span></div>
              {[['TV spot (30 sec, national)','₹8–15','₹20–37Cr',false],['OOH / Billboard (metro)','₹3–8','₹7.5–20Cr',false],['Digital display (social)','₹1.5–4','₹3.75–10Cr',false],['ChangeBag (this campaign)','₹0.025',`${r.campaign.spend} ✓`,true]].map(([m, cpm, total, hl]) => (
                <div key={m} className={`${s.cpmRow} ${hl ? s.cpmHl : ''}`}>
                  <span>{m}{hl && <span className={s.saveBadge}>80% cheaper</span>}</span>
                  <span>{cpm}</span><span>{total}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══ NGO & SOCIAL IMPACT ══ */}
        <div className={s.page}>
          <div className={s.sectionHeader}>
            <div className={s.sectionNum}>06</div>
            <div><div className={s.sectionEye}>S — Social</div><div className={s.sectionTitle}>NGO & Social Impact</div></div>
          </div>
          <div className={s.sectionBody}>
            <div className={s.ngoGrid}>
              <div className={s.ngoCardFeatured}>
                <div className={s.ngoLogo}>GM</div>
                <h4>{r.ngo.name}</h4>
                <div className={s.ngoCause}>Environmental NGO · {r.ngo.reg}</div>
                <div className={s.ngoDonation}>{r.ngo.donation}</div>
                <div className={s.ngoDonationLabel}>Total donation disbursed · ₹10 × {r.campaign.bags.toLocaleString('en-IN')} bags</div>
                <div className={s.ngoConfirm}>✓ Donation confirmed · {r.ngo.donationConfirmed} · UTR: {r.ngo.utr}</div>
              </div>
              <div className={s.ngoCardPlain}>
                <h4>Community reach</h4>
                <div className={s.ngoCause}>Citizens engaged with cause message</div>
                <div className={s.ngoDonation} style={{ color: 'var(--green-deep)' }}>200K+</div>
                <div className={s.ngoDonationLabel} style={{ color: 'var(--ink-faint)' }}>Unique citizens who received a bag</div>
                <div className={s.ngoStats}>
                  {[['QR scans to NGO page','6,700'],['Additional NGO donations',r.ngo.additionalDonations],['New newsletter signups',r.ngo.newSignups.toLocaleString()]].map(([k, v]) => (
                    <div key={k} className={s.ngoStatRow}><span>{k}</span><strong>{v}</strong></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ══ SEBI BRSR ══ */}
        <div className={s.page}>
          <div className={s.sectionHeader}>
            <div className={s.sectionNum}>07</div>
            <div><div className={s.sectionEye}>Regulatory alignment</div><div className={s.sectionTitle}>SEBI BRSR Disclosure Mapping</div></div>
          </div>
          <div className={`${s.sectionBody} ${s.brsrBg}`}>
            <div className={s.brsrGrid}>
              {[
                { title: 'Principle 6 · Environmental responsibility', status: 'Met', body: 'Campaign generated 1,375T CO₂e savings and prevented 2.5 crore plastic bags — directly reportable under BRSR Principle 6 tables.' },
                { title: 'Principle 8 · Inclusive growth & equitable development', status: 'Met', body: '₹5 lakh donated to a registered NGO with Tier 2/3 city distribution. Qualifies as CSR spend under Section 135 Companies Act 2013.' },
                { title: 'SDG 12 · Responsible consumption & production', status: 'Met', body: '2.5 crore single-use plastic bags prevented contributes to SDG 12.5 and India\'s plastic ban compliance trajectory.' },
                { title: 'GRI 301-1 · Materials used by weight or volume', status: 'Partial', body: 'Cotton tote material weight: 2,500 kg. GOTS certification pending Q3 2025.' },
                { title: 'GRI 305 · Emissions', status: 'Met', body: 'Scope 3 emissions reduction of 1,375T CO₂e using WRAP UK lifecycle data verified by EY India.' },
                { title: 'Companies Act Section 135 · CSR expenditure', status: 'Met', body: '₹5 lakh donation qualifies under Schedule VII Items (iv) and (x). Consult legal for full campaign spend classification.' },
              ].map(({ title, status, body }) => (
                <div key={title} className={s.brsrItem}>
                  <div className={s.brsrHeader}>
                    <h4>{title}</h4>
                    <span className={`${s.brsrBadge} ${status === 'Met' ? s.badgeMet : s.badgePartial}`}>{status}</span>
                  </div>
                  <p>{body}</p>
                </div>
              ))}
            </div>
            <div className={s.disclosureTable}>
              <div className={s.disclosureTitle}>Disclosure-ready data table</div>
              {[['Plastic bags prevented (units)','2,50,00,000'],['CO₂ equivalent reduced (tCO₂e)','1,375'],['Plastic waste diverted (kg)','62,500'],['CSR donation disbursed (INR)','₹5,00,000'],['Beneficiaries (citizens)','50,000+'],['Reporting period',r.campaign.period],['Verification','EY India Sustainability Practice']].map(([k, v]) => (
                <div key={k} className={s.disclosureRow}><span>{k}</span><strong>{v}</strong></div>
              ))}
            </div>
          </div>
        </div>

        {/* ══ CERTIFICATION ══ */}
        <div className={s.page}>
          <div className={s.sectionHeader}>
            <div className={s.sectionNum}>08</div>
            <div><div className={s.sectionEye}>Certification</div><div className={s.sectionTitle}>Impact Certification & Sign-off</div></div>
          </div>
          <div className={s.sectionBody}>
            <div className={s.certBox}>
              <div className={s.certBoxInner}>
                <div className={s.certBoxHeader}>
                  <div>
                    <div className={s.certOrg}>ChangeBag <span>Impact Certificate</span></div>
                    <div className={s.certId}>Certificate ID: {r.id} · Issued: {r.issuedDate}</div>
                  </div>
                  <div className={s.certSeal}><div className={s.csIcon}>🌿</div><div className={s.csText}>VERIFIED</div></div>
                </div>
                <div className={s.certStatement}>
                  This certifies that <strong>{r.brand.name}</strong> sponsored a ChangeBag campaign between {r.campaign.period}, resulting in the distribution of <strong>{r.campaign.bags.toLocaleString('en-IN')} branded tote bags</strong> across <strong>{r.campaign.cities}+ Indian cities</strong>, generating verified environmental, social, and brand impact as documented in this report.
                </div>
                <div className={s.certFacts}>
                  {r.certFacts.map(([n, l]) => (
                    <div key={l} className={s.certFact}>
                      <div className={s.certFactNum}>{n}</div>
                      <div className={s.certFactLabel}>{l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className={s.signatures}>
              {[['Arvind Sharma','Head — CSR & Sustainability',r.brand.name],['ChangeBag Platform','Campaign Lead & Certifying Party','ChangeBag.org · GSTIN: 36AABCX1234A1ZY'],['EY India','Independent Impact Verifier','Ernst & Young LLP Sustainability Practice']].map(([name, role, org]) => (
                <div key={name} className={s.sigItem}>
                  <div className={s.sigName}>{name}</div>
                  <div className={s.sigRole}>{role}</div>
                  <div className={s.sigOrg}>{org}</div>
                </div>
              ))}
            </div>
          </div>
          <div className={s.reportFooter}>
            <p>This report is generated by ChangeBag and certified for SEBI BRSR, GRI 301/305, and Companies Act Section 135 CSR disclosure. Contact impact@changebag.org</p>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div>Report ID: {r.id}</div>
              <div>Generated: {r.issuedDate}</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
