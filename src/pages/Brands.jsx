import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
// import Ticker from '../components/Ticker'
import Footer from '../components/Footer'
import useScrollReveal from '../hooks/useScrollReveal'
import s from './Brands.module.css'

const VALUE_CARDS = [
  { icon: '📍', title: 'Mobile billboards in real communities', body: 'Your brand goes where outdoor ads can\'t — vegetable markets, railway stations, college campuses, residential colonies.', metric: '800+', metricLabel: 'Cities reached' },
  { icon: '📊', title: 'Dashboard-tracked impressions', body: 'Every bag has a QR code. Your real-time dashboard tracks scans, geographic spread, and citizen engagement.', metric: '200+', metricLabel: 'Average bag uses per tote' },
  { icon: '📄', title: 'ESG impact report included', body: 'Every campaign generates a certified ESG report aligned with SEBI disclosure norms — ready for your annual report.', metric: '27.5 kg', metricLabel: 'CO₂ saved per sponsored bag' },
  { icon: '⚡', title: 'Plug-and-play in 48 hours', body: 'Upload logo, choose cause, confirm budget. Our team handles design, production, and national distribution.', metric: '48h', metricLabel: 'From brief to campaign live' },
  { icon: '💚', title: 'Purpose builds brand loyalty', body: 'Cause-driven marketing creates 3× stronger recall. Bags are carried by people who actually believe in your cause.', metric: '3×', metricLabel: 'Higher brand recall' },
  { icon: '💰', title: '80% lower cost per impression', body: 'OOH costs ₹3–8 per impression. ChangeBag delivers at ₹0.04–0.08 — same eyeballs, emotional resonance, ESG report included.', metric: '₹0.06', metricLabel: 'Average cost per impression' },
]

const USE_CASES = [
  {
    tag: 'FMCG / Consumer', tagColor: '#e8f5ee', tagText: '#1a6b3a',
    brand: 'Dettol', cause: '× Hygiene Bharat',
    title: 'Hand Hygiene Awareness — School & Hospital Communities',
    body: '10,000 bags near schools and hospitals carrying a hand-hygiene awareness message.',
    results: [['👜','Bags out','10,000'],['👁️','Est. impressions','5M+'],['🌿','Plastics saved','50L+'],['🤝','NGO donation','₹1L']],
  },
  {
    tag: 'Healthcare / Pharma', tagColor: '#e8f0ff', tagText: '#4a3ab0',
    brand: 'Dr. Agarwals', cause: '× Digital Detox',
    title: 'Digital Detox: Better Eye & Mental Health',
    body: '5,000 bags near tech campuses and malls promoting eye care and screen-time awareness.',
    results: [['👜','Bags out','5,000'],['👁️','Est. impressions','2.5M+'],['📱','QR scans','18,400'],['🤝','NGO donation','₹50K']],
  },
  {
    tag: 'PSU / Government', tagColor: '#fff3cd', tagText: '#856404',
    brand: 'IndianOil', cause: '× Green Mission',
    title: 'Clean Energy, Clean India — National Campaign',
    body: '50,000 bags nationwide tied to IndianOil\'s sustainability pledge across petrol communities.',
    results: [['👜','Bags out','50,000'],['👁️','Est. impressions','25M+'],['🏙️','Cities covered','240+'],['🤝','NGO donation','₹5L']],
  },
]

export default function Brands() {
  useScrollReveal()
  const navigate = useNavigate()
  const scrollToContact = () => {
    window.location.href = '/pricing#contact'
  }

  return (
    <>
      <Navbar />

      {/* HERO */}
      <section className={s.hero}>
        <div className={s.heroNoise} /><div className={s.heroGrid} /><div className={s.heroGlow} />
        <div className={`${s.heroInner} ${s.container}`}>
          <div className={s.heroContent}>
            <div className={`${s.heroTag} fade-up`}><div className={s.tagDot} /><span>For brand teams & CMOs</span></div>
            <h1 className={`${s.heroH1} fade-up`} style={{ animationDelay: '0.1s' }}>
              The ad that people <em>keep for years.</em>
            </h1>
            <p className={`${s.heroSub} fade-up`} style={{ animationDelay: '0.22s' }}>
              Stop buying impressions that disappear. ChangeBag puts your brand on a premium cotton tote distributed free to citizens. <strong>Every bag delivers 200+ uses</strong> — 50,000+ impressions per sponsorship. With a CSR impact report included.
            </p>
            <div className={`${s.heroBtns} fade-up`} style={{ animationDelay: '0.36s' }}>
              <button className={s.btnPrimary} onClick={() => navigate('/causes')}>Start a campaign →</button>
              {/* <Link to="/pricing" className={s.btnGhost}>View pricing</Link> */}
            </div>
            <div className={`${s.heroStats} fade-up`} style={{ animationDelay: '0.52s' }}>
              {[['80%','Lower CPM vs OOH'],['50K+','Impressions per bag'],['₹65M+','Ad value generated'],['48h','Campaign live time']].map(([n,l])=>(
                <div key={l} className={s.heroStat}><div className={s.heroStatNum}>{n}</div><div className={s.heroStatLabel}>{l}</div></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* <Ticker /> */}

      {/* VALUE PROPS */}
      <section className={s.section} style={{ background: 'var(--cream)' }}>
        <div className={s.container}>
          <div className="reveal">
            <span className={s.label}>Why brands choose ChangeBag</span>
            <h2 className={s.heading}>Marketing ROI meets <em>ESG compliance.</em></h2>
            <p className={s.sub}>One campaign delivers what normally takes three separate agency briefs.</p>
          </div>
          <div className={s.valueGrid}>
            {VALUE_CARDS.map((c, i) => (
              <div key={c.title} className={`${s.valueCard} reveal`} style={{ transitionDelay: `${(i % 3) * 0.06}s` }}>
                <div className={s.valueIcon}>{c.icon}</div>
                <h3>{c.title}</h3>
                <p>{c.body}</p>
                <div className={s.valueMetric}>
                  <div className={s.metricNum}>{c.metric}</div>
                  <div className={s.metricLabel}>{c.metricLabel}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BETTER AD BUY */}
      <section className={s.section} style={{ background: 'var(--cream-dark)', borderTop: '1px solid rgba(26,26,20,0.05)' }}>
        <div className={s.container}>
          <div className="reveal" style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto' }}>
            <span className={s.label}>Compare the metrics</span>
            <h2 className={s.heading}>A better ad buy — <em>on every metric.</em></h2>
          </div>
          <div className={s.compareRow}>
            <div className={`${s.compareBox} reveal`} style={{ background: '#fcfaf6', border: '1px solid rgba(0,0,0,0.06)' }}>
              <h4 style={{ color: 'var(--ink-soft)' }}>Traditional Advertising</h4>
              <ul className={s.compareList}>
                {[
                  ['❌', 'CPM: ₹3–8 per impression (OOH/Print)'],
                  ['❌', 'Zero attribution or engagement tracking'],
                  ['❌', 'No environmental or social impact'],
                  ['❌', 'Disposable, fleeting impressions'],
                  ['❌', 'No ESG reporting for compliance'],
                ].map(([icon, text]) => (
                  <li key={text} className={s.compareItem}><span>{icon}</span><span style={{ color: 'var(--ink-soft)' }}>{text}</span></li>
                ))}
              </ul>
            </div>
            <div className={`${s.compareBox} reveal`} style={{ background: 'var(--green-deep)', color: 'white', transitionDelay: '0.1s' }}>
              <h4>ChangeBag Sponsorship</h4>
              <ul className={s.compareList}>
                {[
                  ['✅', 'CPM: ₹0.04 (80% lower than traditional)'],
                  ['✅', 'Real-time QR tracking & attribution'],
                  ['✅', 'Direct NGO donation included'],
                  ['✅', 'Bags kept for 200+ uses (2-3 years)'],
                  ['✅', 'Certified ESG impact report'],
                ].map(([icon, text]) => (
                  <li key={text} className={s.compareItem}><span>{icon}</span><span style={{ color: 'rgba(255,255,255,0.8)' }}>{text}</span></li>
                ))}
              </ul>
            </div>
          </div>
          <div className={`${s.compareStatBox} reveal`} style={{ transitionDelay: '0.2s' }}>
            <h3>
              <em>80% LOWER</em>
              COST PER IMPRESSION THAN TRADITIONAL MEDIA IN INDIA
            </h3>
          </div>
        </div>
      </section>

      {/* TRACKING */}
      <section className={s.section} style={{ background: 'var(--cream)' }}>
        <div className={s.container}>
          <div className={s.trackGrid}>
            <div className="reveal">
              <span className={s.label}>Live Analytics</span>
              <h2 className={s.heading}>Track everything. <em>In real time.</em></h2>
              <div className={s.trackPoints}>
                {[
                  { icon: '🗺️', t: 'Geographic spread', p: 'See where your bags are being used across 800+ cities in live heatmap.' },
                  { icon: '🤳', t: 'Real-time scans', p: 'Every scan records city, time, and device — direct attribution.' },
                  { icon: '📊', t: 'CSV Export-ready', p: 'Download all data for your marketing audits and board presentations.' },
                  { icon: '🏆', t: 'ESG Compliance', p: 'Certified data points for your SEBI/BRSR sustainability reports.' },
                ].map((item, i) => (
                  <div key={item.t} className={s.trackPoint} style={{ transitionDelay: `${i*0.08}s` }}>
                    <div className={s.trackIcon}>{item.icon}</div>
                    <div className={s.trackText}><h3>{item.t}</h3><p>{item.p}</p></div>
                  </div>
                ))}
              </div>
            </div>
            <div className={`${s.trackMockup} reveal`} style={{ transitionDelay: '0.15s' }}>
              <div style={{ background: '#f8f9fa', padding: '12px 16px', display: 'flex', gap: '6px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                {['#ff5f57', '#febc2e', '#28c840'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
              </div>
              <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1200" alt="Dashboard Mockup" style={{ width: '100%', display: 'block' }} />
            </div>
          </div>
        </div>
      </section>

      {/* USE CASES */}
      <section className={s.section} style={{ background: 'var(--cream-dark)', borderTop: '1px solid rgba(26,26,20,0.05)' }}>
        <div className={s.container}>
          <div className="reveal" style={{ textAlign: 'center', maxWidth: 580, margin: '0 auto 48px' }}>
            <span className={s.label}>Campaign ideas by industry</span>
            <h2 className={s.heading}>Every brand has <em>a cause to carry.</em></h2>
          </div>
          <div className={s.useCasesGrid}>
            {USE_CASES.map((uc, i) => (
              <div key={uc.brand} className={`${s.ucCard} reveal`} style={{ transitionDelay: `${i * 0.1}s` }}>
                <div className={s.ucHeader}>
                  <span className={s.ucTag} style={{ background: uc.tagColor, color: uc.tagText }}>{uc.tag}</span>
                  <h3>{uc.brand} <small>{uc.cause}</small></h3>
                  <p>{uc.body}</p>
                </div>
                <div className={s.ucBody}>
                  {uc.results.map(([icon, label, val]) => (
                    <div key={label} className={s.ucResult}>
                      <span>{icon}</span>
                      <span className={s.ucResultText}>{label}</span>
                      <span className={s.ucResultNum}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className={s.processSec}>
        <div className={s.container}>
          <div className="reveal" style={{ textAlign: 'center', marginBottom: 64 }}>
            <span className={`${s.label} ${s.lightLabel}`}>The process</span>
            <h2 className={`${s.heading} ${s.lightHeading}`}>From brief to <em>bags in hands</em> in 48 hours.</h2>
          </div>
          <div className={s.processSteps}>
            {[
              ['1','Register & choose cause','Sign up, pick a cause that aligns with your brand, and tell us your target geography.'],
              ['2','Set budget & quantity','Choose bag count and locations. Get an instant price and campaign timeline.'],
              ['3','Upload logo','Share your logo. Our designers handle layout and send a proof within 24 hours.'],
              ['4','We handle everything','Production, QC, logistics, and hyperlocal distribution. Dashboard access from day one.'],
            ].map(([n,t,b],i)=>(
              <div key={n} className={`${s.processStep} reveal`} style={{ transitionDelay: `${i*0.1}s` }}>
                <div className={s.processNum}>{n}</div>
                <h4>{t}</h4>
                <p>{b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GOVERNMENT */}
      <section className={s.section} id="government" style={{ background: 'var(--cream)' }}>
        <div className={s.container}>
          <div className={s.govtGrid}>
            <div className="reveal">
              <span className={s.label}>For government & PSUs</span>
              <h2 className={s.heading}>Carry change,<br /><em>inspire the nation.</em></h2>
              <p className={s.bodyText} style={{ marginTop: 14, marginBottom: 24 }}>Every tote becomes a mobile national message. ChangeBag is the only platform that turns government campaigns into physical objects citizens use every day.</p>
              <div className={s.campaignPills}>
                {['Swachh Bharat','Digital India','Join Indian Army','Cyber Suraksha','Green Mission','Net Zero 2070'].map(p=>(
                  <span key={p} className={s.pill}>{p}</span>
                ))}
              </div>
            </div>
            <div className={`${s.govtCards} reveal`} style={{ transitionDelay: '0.1s' }}>
              {[
                ['🏛️','#e8f5ee','Visible national impact','Each bag is a mobile message in public spaces — markets, trains, schools.'],
                ['🎯','#e8f0ff','Net Zero 2070 & Plastic-Free goals','Every campaign contributes directly to India\'s plastic reduction targets.'],
                ['📊','#fff3cd','Data-driven CSR impact','Track exactly how many citizens received, used, and engaged with your campaign.'],
                ['🤝','#fce8e8','Privately funded, publicly delivered','ChangeBag is funded entirely by brand sponsorship — government campaigns at zero budget cost.'],
              ].map(([icon,bg,t,b])=>(
                <div key={t} className={s.govtCard}>
                  <div className={s.govtIcon} style={{ background: bg }}>{icon}</div>
                  <div><h4>{t}</h4><p>{b}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={s.ctaStrip}>
        <div className={s.container}>
          <h2>Ready to put your brand<br />on <em>a million hands?</em></h2>
          <p>Get a personalised campaign proposal in 24 hours.</p>
          <div className={s.ctaBtns}>
            <button className={s.btnPrimary} onClick={() => navigate('/causes')}>Start a campaign →</button>
            {/* <Link to="/pricing" className={s.btnOutlineLight}>View pricing</Link> */}
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
