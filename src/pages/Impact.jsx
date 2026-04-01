import Navbar from '../components/Navbar'
// import Ticker from '../components/Ticker'
import Footer from '../components/Footer'
import useScrollReveal from '../hooks/useScrollReveal'
import { useNavigate } from 'react-router-dom'
import s from './Impact.module.css'

const CITIES = [
  ['Hyderabad', 142000, 95], ['Mumbai', 128500, 85], ['Delhi NCR', 119200, 79],
  ['Bengaluru', 108000, 72], ['Chennai', 84400, 56], ['Pune', 72100, 48],
  ['Kolkata', 68800, 46], ['Ahmedabad', 56300, 37], ['Jaipur', 42000, 28],
  ['Lucknow', 38400, 26], ['Surat', 31200, 21], ['800+ more cities', null, 100],
]

const CASE_STUDIES = [
  {
    logo: 'IO', brand: 'A leading oil & gas enterprise', cause: ' Green Mission India',
    tag: 'PSU · Sustainability', tagBg: '#e8f5ee', tagColor: '#1a6b3a',
    title: 'Clean Energy, Clean India — National Campaign',
    stats: [['50K','Bags out'],['25M+','Impressions'],['240+','Cities']],
    quote: '"The campaign gave us a visible, physical presence in communities w\'d never reached through digital or OOH."',
    cite: '— CSR Head ',
  },
  {
    logo: 'IA', brand: 'A national defense organization', cause: ' Recruitment Drive',
    tag: 'Government · National pride', tagBg: '#f0ebff', tagColor: '#5a3db0',
    title: 'Join the Indian Army — Grassroots Awareness',
    stats: [['30K','Bags out'],['120M+','Social reach'],['50K+','Ambassadors']],
    quote: '"We saw recruitment enquiry spikes in cities 3 weeks after bag distribution. A direct, measurable connection."',
    cite: '— Campaign Director',
  },
  {
    logo: 'DA', brand: 'A prominent eye care provider', cause: ' Digital Detox',
    tag: 'Healthcare · Awareness', tagBg: '#fff3cd', tagColor: '#856404',
    title: 'Digital Detox: Better Eye & Mental Health',
    stats: [['8K','Bags out'],['18.4K','QR scans'],['23%','Appt uptick']],
    quote: '"Conversion from bag QR scan to clinic appointment became our most efficient acquisition channel."',
    cite: '— Marketing Head',
  },
]

const TIMELINE = [
  { date: '2022 · Launch', title: 'First 500 bags, one city', body: 'ChangeBag launches in Hyderabad with a pilot campaign for a local brand and one NGO partner.', badge: '🌱 Proof of concept achieved' },
  { date: '2023 · Scale', title: '10,000 bags · 5 cities · IndianOil partnership', body: 'First major PSU partnership. Expand to Mumbai, Delhi, Bengaluru, Chennai. Dashboard goes live.', badge: '📊 Dashboard launched' },
  { date: '2023 · Recognition', title: 'Featured in NDTV, Outlook, Economic Times', body: 'National media coverage follows the Indian Army campaign. Inbound brand enquiries begin.', badge: '📰 National press coverage' },
  { date: '2024 · Growth', title: '1M bags milestone · 800+ cities', body: 'Crossed 1 million bags. ₹1 crore donated to NGO partners. 10 active NGO partnerships across 6 cause categories.', badge: '🏆 1M bags milestone' },
  { date: '2025 · Now', title: 'Self-serve brand portal · SEBI ESG alignment', body: 'Launching self-serve brand onboarding, SEBI ESG-aligned certificates, and enterprise government campaigns.', badge: '🚀 Enterprise platform launch' },
]

const MEDIA = [
  { pub: 'NDTV', headline: '"The tote bag startup fighting India\'s plastic crisis one sponsorship at a time"', date: 'March 2024' },
  { pub: 'Outlook', headline: '"ChangeBag: Where CSR meets advertising in a bag you\'ll actually use"', date: 'January 2024' },
  { pub: 'Economic Times', headline: '"The new ESG play: purpose-media and the future of brand sponsorship"', date: 'November 2023' },
  { pub: 'Hindustan Times', headline: '"How ChangeBag turned the humble tote into a national movement"', date: 'September 2023' },
]

export default function Impact() {
  useScrollReveal()
  const navigate = useNavigate()

  return (
    <>
      <Navbar />

      {/* HERO */}
      <section className={s.hero}>
        <div className={s.heroNoise} /><div className={s.heroGrid} /><div className={s.heroGlow} />
        <div className={`${s.heroInner} ${s.container}`}>
          <div style={{ width: '100%' }}>
            <div className={`${s.heroTag} fade-up`}><div className={s.tagDot} /><span>Cumulative impact · Updated Q1 2025</span></div>
            <h1 className={`${s.heroH1} fade-up`} style={{ animationDelay: '0.1s' }}>
              Numbers that prove<br /><em>change is happening.</em>
            </h1>
            <p className={`${s.heroSub} fade-up`} style={{ animationDelay: '0.22s' }}>
              Every bag distributed leaves a trail of data — plastics replaced, CO₂ saved, causes funded, communities reached.
            </p>
            <div className={`${s.heroCounters} fade-up`} style={{ animationDelay: '0.36s' }}>
              {[['1.2M+','Bags distributed nationwide'],['₹65M+','Total ad value created'],['10.4K T','CO₂ equivalent saved']].map(([n,l])=>(
                <div key={l} className={s.hc}><div className={s.hcNum}>{n}</div><div className={s.hcLabel}>{l}</div></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* <Ticker /> */}

      {/* METRICS */}
      <section className={s.section} style={{ background: 'var(--cream)' }}>
        <div className={s.container}>
          <div className="reveal">
            <span className={s.label}>The full scorecard</span>
            <h2 className={s.heading}>Every metric. <em>Every campaign.</em></h2>
          </div>
          <div className={s.metricsGrid}>
            <div className={`${s.mCard} ${s.mGreen} reveal`}><div className={s.mNum}>1.2M<span>+</span></div><div className={s.mLabel}>Total bags distributed</div><div className={s.mSub}>Across 800+ cities in India</div><span className={`${s.mTrend} ${s.tUp}`}>↑ 65% vs last year</span></div>
            <div className={`${s.mCard} ${s.mWhite} reveal`} style={{ transitionDelay: '.08s' }}><div className={s.mNum}>600M<span>+</span></div><div className={s.mLabel}>Plastic bags prevented</div><div className={s.mSub}>At 500 replacements per tote</div><span className={`${s.mTrend} ${s.tUp}`}>↑ Growing with each campaign</span></div>
            <div className={`${s.mCard} ${s.mGold} reveal`} style={{ transitionDelay: '.16s' }}><div className={s.mNum}>₹65M<span>+</span></div><div className={s.mLabel}>Ad value for brands</div><div className={s.mSub}>Equivalent outdoor ad spend</div><span className={`${s.mTrend} ${s.tGold}`}>↑ 3× industry average ROI</span></div>
            <div className={`${s.mCard} ${s.mCream} reveal`}><div className={s.mNum}>10,400</div><div className={s.mLabel}>KG CO₂ equivalent saved</div><div className={s.mSub}>At 27.5 kg per sponsored bag</div></div>
            <div className={`${s.mCard} ${s.mWhite} reveal`} style={{ transitionDelay: '.08s' }}><div className={s.mNum}>₹1.2Cr</div><div className={s.mLabel}>Donated to NGO causes</div><div className={s.mSub}>₹10 per bag, every campaign</div></div>
            <div className={`${s.mCard} ${s.mCream} reveal`} style={{ transitionDelay: '.16s' }}><div className={s.mNum}>200K<span>+</span></div><div className={s.mLabel}>Citizens engaged</div><div className={s.mSub}>Unique QR scans and interactions</div></div>
          </div>
        </div>
      </section>

      {/* CITY REACH */}
      <section className={s.section} style={{ background: 'var(--cream-dark)', borderTop: '1px solid rgba(26,26,20,0.05)' }}>
        <div className={s.container}>
          <div className="reveal">
            <span className={s.label}>Geographic reach</span>
            <h2 className={s.heading}>800+ cities. <em>Every corner of India.</em></h2>
            <p className={s.sub} style={{ marginTop: 8 }}>From Metro to Tier 3 — ChangeBag reaches communities traditional outdoor advertising doesn't touch.</p>
          </div>
          <div className={s.cityGrid}>
            {CITIES.map(([city, bags, pct], i) => (
              <div key={city} className={`${s.cityCard} reveal`} style={{ transitionDelay: `${(i % 4) * 0.04}s` }}>
                <div className={s.cityName}>{city}</div>
                <div className={s.cityBags}>{bags ? `${bags.toLocaleString('en-IN')} bags` : 'Tier 2 & 3 India'}</div>
                <div className={s.cityBar}><div className={s.cityFill} style={{ width: `${pct}%`, background: city === '800+ more cities' ? 'var(--green-light)' : undefined }} /></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ENVIRONMENTAL (Already green deep) */}
      <section className={s.envSec}>
        <div className={s.container}>
          <div className="reveal" style={{ position: 'relative', zIndex: 1 }}>
            <span className={`${s.label} ${s.lightLabel}`}>Environmental impact</span>
            <h2 className={`${s.heading} ${s.lightHeading}`}>The planet <em>is keeping score.</em></h2>
          </div>
          <div className={s.envGrid}>
            {[
              { cls: s.eOutlined, icon: '♻️', title: '600 million plastic bags prevented', body: 'Each ChangeBag replaces 500 single-use plastic bags — removing 2.5 crore plastics per 50,000 bags sponsored.', big: '600M+' },
              { cls: s.eSolid, icon: '🌿', title: '10,400 tonnes of CO₂ saved', body: 'At 27.5 kg CO₂e saved per bag. Equivalent to taking 300 petrol cars off the road for a full year.', big: '10.4K T' },
              { cls: s.eOutlined, icon: '🏭', title: 'Plastic weight diverted', body: '62.5 tonnes of LDPE plastic never entered landfills, oceans, or incineration across all campaigns so far.', big: '62.5 T' },
              { cls: s.eOutlined, icon: '🎯', title: 'Net Zero 2070 alignment', body: 'Every campaign generates a verified carbon offset certificate aligned with India\'s Net Zero 2070 national commitments.', big: '2070' },
            ].map(({ cls, icon, title, body, big }) => (
              <div key={title} className={`${s.envCard} ${cls} reveal`} style={{ transitionDelay: '0.08s' }}>
                <span className={s.envIcon}>{icon}</span>
                <h3>{title}</h3>
                <p>{body}</p>
                <span className={s.envBig}>{big}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CASE STUDIES */}
      <section className={s.section} style={{ background: 'var(--cream)', borderTop: '1px solid rgba(26,26,20,0.05)' }}>
        <div className={s.container}>
          <div className="reveal" style={{ textAlign: 'center', maxWidth: 540, margin: '0 auto 48px' }}>
            <span className={s.label}>Campaign case studies</span>
            <h2 className={s.heading}>Real brands.<br /><em>Real results.</em></h2>
          </div>
          <div className={s.casesGrid}>
            {CASE_STUDIES.map((c, i) => (
              <div key={c.brand} className={`${s.caseCard} reveal`} style={{ transitionDelay: `${i * 0.1}s` }}>
                <div className={s.caseHeader}>
                  <div className={s.caseBrandRow}>
                    {/* <div className={s.caseLogo}>{c.logo}</div> */}
                    <div><div className={s.caseBrand}>{c.brand}</div><div className={s.caseCause}>{c.cause}</div></div>
                  </div>
                  <span className={s.caseTag} style={{ background: c.tagBg, color: c.tagColor }}>{c.tag}</span>
                  <h3>{c.title}</h3>
                </div>
                <div className={s.caseBody}>
                  <div className={s.caseStats}>
                    {c.stats.map(([n, l]) => (
                      <div key={l} className={s.caseStat}>
                        <div className={s.csNum}>{n}</div>
                        <div className={s.csLabel}>{l}</div>
                      </div>
                    ))}
                  </div>
                  <div className={s.caseQuote}>
                    {c.quote}<cite>{c.cite}</cite>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TIMELINE */}
      {/* <section className={s.section} style={{ background: 'var(--cream-dark)', borderTop: '1px solid rgba(26,26,20,0.05)' }}>
        <div className={s.container}>
          <div className="reveal">
            <span className={s.label}>Our journey</span>
            <h2 className={s.heading}>From one bag to <em>a movement.</em></h2>
          </div>
          <div className={`${s.timeline} reveal`} style={{ transitionDelay: '0.1s' }}>
            {TIMELINE.map((t) => (
              <div key={t.date} className={s.tlItem}>
                <div className={s.tlDot} />
                <div>
                  <div className={s.tlDate}>{t.date}</div>
                  <div className={s.tlTitle}>{t.title}</div>
                  <div className={s.tlBody}>{t.body}</div>
                  <div className={s.tlBadge}>{t.badge}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* MEDIA */}
      {/* <section style={{ background: 'var(--cream)', padding: '64px 0', borderTop: '1px solid rgba(26,26,20,0.05)' }}>
        <div className={s.container}>
          <p className={s.mediaLabel}>As seen in</p>
          <div className={s.mediaGrid}>
            {MEDIA.map((m) => (
              <div key={m.pub} className={s.mediaCard}>
                <div className={s.mediaPub}>{m.pub}</div>
                <div className={s.mediaHeadline}>{m.headline}</div>
                <div className={s.mediaDate}>{m.date}</div>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* CTA */}
      <section className={s.ctaStrip}>
        <div className={s.container}>
          <h2>Add your brand to<br />the <em>impact story.</em></h2>
          <p>Join 100+ brands creating measurable change across India.</p>
          <div className={s.ctaBtns}>
            <button className={s.btnPrimary} onClick={() => navigate('/causes')}>Start a campaign →</button>
            {/* <a href="/pricing" className={s.btnOutlineLight}>View pricing</a> */}
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}

