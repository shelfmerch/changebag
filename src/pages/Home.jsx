import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Ticker from '../components/Ticker'
import Footer from '../components/Footer'
import useScrollReveal from '../hooks/useScrollReveal'
import s from './Home.module.css'

/* ── small sub-components ── */
function HeroStat({ num, accent, label }) {
  return (
    <div className={s.heroStat}>
      <div className={s.heroStatNum}>{num}<span>{accent}</span></div>
      <div className={s.heroStatLabel}>{label}</div>
    </div>
  )
}

function IntroStatCard({ big, label }) {
  return (
    <div className={s.introStatCard}>
      <div className={s.introStatBig}>{big}</div>
      <div className={s.introStatLabel}>{label}</div>
    </div>
  )
}

function Step({ num, title, body, delay }) {
  return (
    <div className={`${s.step} reveal`} style={{ transitionDelay: delay }}>
      <div className={s.stepNum}>{num}</div>
      <div className={s.stepTitle}>{title}</div>
      <p className={s.stepBody}>{body}</p>
    </div>
  )
}

function CompareRow({ icon, text, highlight }) {
  return (
    <div className={`${s.compareRow} ${highlight ? s.hl : ''}`}>
      <span className={s.compareIcon}>{icon}</span>
      <span>{text}</span>
    </div>
  )
}

function PriceCard({ tier, name, bags, amount, features, featured, onCta, ctaLabel }) {
  return (
    <div className={`${s.priceCard} ${featured ? s.featuredCard : ''}`}>
      {featured && <div className={s.popularBadge}>Most popular</div>}
      <div className={s.priceTier}>{tier}</div>
      <div className={s.priceName}>{name}</div>
      <div className={s.priceBags}>{bags}</div>
      <div className={s.priceAmount}>{amount}</div>
      <ul className={s.priceFeatures}>
        {features.map((f) => <li key={f}><span className={s.priceCheck}>✓</span>{f}</li>)}
      </ul>
      <button
        className={`${s.priceBtn} ${featured ? s.priceBtnSolid : s.priceBtnOutline}`}
        onClick={onCta}
      >
        {ctaLabel}
      </button>
    </div>
  )
}

/* ── page ── */
export default function Home() {
  useScrollReveal()
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <>
      <Navbar />

      {/* HERO */}
      <section className={s.hero}>
        <div className={s.heroNoise} />
        <div className={s.heroGrid} />
        <div className={s.heroGlow} />
        <div className={s.heroGlow2} />
        <div className={`${s.heroInner} ${s.container}`}>
          <div className={s.heroLayout}>
            <div className={s.heroContent}>
              <div className={`${s.heroEyebrow} fade-up`}>
                <div className={s.eyebrowDot} />
                <span>India's purpose-media platform</span>
              </div>
              <h1 className={`${s.heroH1} fade-up`} style={{ animationDelay: '0.1s' }}>
                Your brand on<br /><em>a million hands.</em>
              </h1>
              <span className={`${s.heroH1Line2} fade-up`} style={{ animationDelay: '0.2s' }}>
                With a cause.
              </span>
              <p className={`${s.heroSub} fade-up`} style={{ animationDelay: '0.3s' }}>
                Sponsor branded tote bags distributed <strong>free to citizens</strong> across India.
                Real impressions. Real communities. An ESG impact report included -
                at <strong>80% lower cost</strong> than traditional outdoor advertising.
              </p>
              <div className={`${s.heroCtas} fade-up`} style={{ animationDelay: '0.44s' }}>
                <button className={s.btnHeroPrimary} onClick={() => scrollTo('contact')}>
                  Sponsor a campaign
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button className={s.btnHeroGhost} onClick={() => scrollTo('how')}>
                  See how it works
                </button>
              </div>
              <div className={`${s.heroStats} fade-up`} style={{ animationDelay: '0.6s' }}>
                <HeroStat num="1.2M" accent="+" label="Bags distributed" />
                <HeroStat num="800" accent="+" label="Cities reached" />
                <HeroStat num="₹65M" accent="+" label="Ad value created" />
                <HeroStat num="50K" accent="+" label="Brand ambassadors" />
              </div>
            </div>
            <div className={`${s.heroVisualWrap} fade-up`} style={{ animationDelay: '0.35s' }}>
              <div className={s.heroVisualCard} aria-label="Tote bag preview">
                <div className={s.heroVisualInner}>
                  <img
                    className={`${s.heroVisualFace} ${s.heroVisualFront}`}
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
              <p className={s.heroVisualHint}>Hover to flip and view the back design.</p>
            </div>
          </div>
        </div>
      
      </section>

      <Ticker />

      {/* THE PROBLEM */}
      <section className={s.intro}>
        <div className={s.container}>
          <div className={s.introGrid}>
            <div className="reveal">
              <p className={s.sectionLabel}>The problem we solve</p>
              <h2 className={s.sectionHeading}>India spends ₹1,000+ crores on ads <em>nobody keeps.</em></h2>
              <p className={s.bodyText}>Traditional advertising disappears the moment the campaign ends. Billboards come down. Digital ads scroll past. TV spots are skipped.</p>
              <p className={s.bodyText} style={{ marginTop: 16 }}>Meanwhile, India generates 14 million tons of plastic waste a year — and CSR impact sits invisible in PDF reports nobody reads.</p>
              <div className={s.introStatsGrid}>
                <IntroStatCard big="14M" label="Tons plastic waste annually" />
                <IntroStatCard big="<30%" label="Actually gets recycled" />
                <IntroStatCard big="₹26K" label="Crores mandatory CSR spend" />
                <IntroStatCard big="0" label="Measurable impressions from most CSR" />
              </div>
            </div>
            <div className={`${s.problemQuote} reveal`} style={{ transitionDelay: '0.15s' }}>
              <p>"The world doesn't need more ads — it needs visible impact that people actually carry home."</p>
              <footer>— The ChangeBag principle</footer>
              <div className={s.problemPillars}>
                {[
                  ['📦', 'Free for citizens', 'No purchase required'],
                  ['📊', 'Dashboard tracked', 'Real-time QR data'],
                  ['🌱', 'ESG reportable', 'Impact cert. included'],
                  ['🤝', 'NGO funding', '₹10 donated per bag'],
                ].map(([icon, title, sub]) => (
                  <div key={title} className={s.problemPillar}>
                    <span>{icon}</span>
                    <div className={s.pillarTitle}>{title}</div>
                    <div className={s.pillarSub}>{sub}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className={s.how} id="how">
        <div className={s.container}>
          <div className={`${s.howHeader} reveal`}>
            <p className={s.sectionLabel}>The process</p>
            <h2 className={s.sectionHeading}>Up and running in <em>48 hours.</em></h2>
            <p className={s.sectionSub}>From brief to bags in the hands of citizens — completely handled by us.</p>
          </div>
          <div className={s.stepsGrid}>
            <Step num="1" title="Choose your cause" body="Register, pick a social cause that aligns with your brand — environment, education, health, national service." delay="0s" />
            <Step num="2" title="Set your campaign" body="Select quantity, target geography, timeline. Upload your logo. Get a live price instantly." delay="0.1s" />
            <Step num="3" title="We handle everything" body="Design, production, logistics, and hyperlocal distribution to markets, campuses, communities — end to end." delay="0.2s" />
            <Step num="4" title="Track live impact" body="Your real-time dashboard shows QR scans, impressions, geographic spread, and the ESG impact report." delay="0.3s" />
          </div>
        </div>
      </section>

      {/* COMPARISON */}
      <section className={s.compare}>
        <div className={s.container}>
          <div className="reveal">
            <p className={s.sectionLabel}>The business case</p>
            <h2 className={s.sectionHeading}>Not just a bag. <em>A better ad buy.</em></h2>
          </div>
          <div className={`${s.compareGrid} reveal`} style={{ transitionDelay: '0.1s' }}>
            <div className={`${s.compareCol} ${s.traditional}`}>
              <div className={s.compareColHeader}>Traditional Advertising</div>
              <div className={s.compareColBody}>
                <CompareRow icon="✕" text="Impressions last seconds, then gone" />
                <CompareRow icon="✕" text="₹3–8 cost per impression (OOH)" />
                <CompareRow icon="✕" text="No emotional connection to cause" />
                <CompareRow icon="✕" text="Unmeasurable real-world results" />
                <CompareRow icon="✕" text="Zero environmental benefit" />
                <CompareRow icon="✕" text="Does not qualify for CSR reporting" />
              </div>
            </div>
            <div className={`${s.compareCol} ${s.changebag}`}>
              <div className={s.compareColHeader}>ChangeBag Sponsorship</div>
              <div className={s.compareColBody}>
                <CompareRow icon="✓" text="200+ uses per bag = 50,000+ lifetime impressions" highlight />
                <CompareRow icon="✓" text="₹0.04–0.08 cost per impression" highlight />
                <CompareRow icon="✓" text="Carried by believers of your cause" />
                <CompareRow icon="✓" text="Real-time dashboard: scans, reach, geography" />
                <CompareRow icon="✓" text="500+ plastic bags replaced per tote" />
                <CompareRow icon="✓" text="ESG impact report for board & SEBI filing" highlight />
              </div>
            </div>
          </div>
          <div className={`${s.cpmCallout} reveal`} style={{ transitionDelay: '0.2s' }}>
            <div className={s.cpmBig}>80%</div>
            <div>
              <h3>Lower cost per impression than any other outdoor medium in India.</h3>
              <p>At ₹0.04–0.08 per impression vs ₹3–8 for OOH billboards, ChangeBag delivers the same brand visibility — with an ESG report your sustainability team can use.</p>
            </div>
          </div>
        </div>
      </section>

      {/* IMPACT COUNTERS */}
      <section className={s.impact} id="impact">
        <div className={s.container}>
          <div className={`${s.impactHeader} reveal`}>
            <p className={`${s.sectionLabel} ${s.light}`}>Cumulative impact</p>
            <h2 className={`${s.sectionHeading} ${s.light}`}>Numbers that <em>keep growing.</em></h2>
          </div>
          <div className={`${s.impactGrid} reveal`} style={{ transitionDelay: '0.15s' }}>
            {[
              ['1.2M', '+', 'Bags distributed nationwide'],
              ['600M', '+', 'Plastic bags prevented'],
              ['10.4K', ' T', 'CO₂ equivalent saved'],
              ['800', '+', 'Cities reached'],
              ['₹1.2', 'Cr', 'Donated to NGOs'],
              ['200K', '+', 'Citizens engaged'],
            ].map(([num, accent, label]) => (
              <div key={label} className={s.impactItem}>
                <div className={s.impactNum}>{num}<span>{accent}</span></div>
                <div className={s.impactLabel}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className={s.pricing} id="pricing">
        <div className={s.container}>
          <div className="reveal" style={{ textAlign: 'center' }}>
            <p className={s.sectionLabel}>Transparent pricing</p>
            <h2 className={s.sectionHeading}>Start small. <em>Scale fast.</em></h2>
            <p className={s.sectionSub} style={{ margin: '0 auto' }}>No hidden fees. Every plan includes the impact dashboard and ESG report.</p>
          </div>
          <div className={s.pricingGrid}>
            <PriceCard
              tier="Starter" name="Spark" bags="500 branded tote bags" amount="₹75K"
              features={['500 bags, 1 city', 'Your logo + cause message', 'Basic impact dashboard', 'QR code tracking', 'NGO donation: ₹5,000']}
              onCta={() => scrollTo('contact')} ctaLabel="Get started"
            />
            <PriceCard
              tier="Growth" name="Impact" bags="2,000 bags · up to 3 cities" amount="₹2.5L"
              featured
              features={['2,000 bags, up to 3 cities', 'Custom design + brand story', 'Full real-time dashboard', 'City-wise reach analytics', 'NGO donation: ₹20,000', 'ESG impact certificate']}
              onCta={() => scrollTo('contact')} ctaLabel="Start this campaign"
            />
            <PriceCard
              tier="Enterprise" name="Movement" bags="10,000+ bags · National" amount="Custom"
              features={['10K–1M bags, all India', 'Multi-campaign strategy', 'SEBI ESG disclosure report', 'PR & media amplification', 'White-glove account team']}
              onCta={() => scrollTo('contact')} ctaLabel="Talk to us"
            />
          </div>
        </div>
      </section>

      {/* MEDIA */}
      <section className={s.media}>
        <div className={s.container}>
          <p className={s.mediaLabel}>Featured in</p>
          <div className={s.mediaLogos}>
            {['NDTV', 'Times of India', 'Hindustan Times', 'Outlook', 'Economic Times', 'Business Standard'].map((m) => (
              <div key={m} className={s.mediaLogo}>{m}</div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className={s.finalCta} id="contact">
        <div className={s.container}>
          <h2>Ready to carry<br /><em>change?</em></h2>
          <p>Tell us your brand and we'll send a personalised campaign proposal within 24 hours.</p>
          <div className={s.finalForm}>
            <input type="text" placeholder="Your name, company & phone number" />
            <button>Get a proposal →</button>
          </div>
          <p className={s.finalNote}>
            Or WhatsApp us directly &nbsp;·&nbsp;
            <a href="#">Book a 15-min call</a> &nbsp;·&nbsp;
            <a href="#">Download the deck</a>
          </p>
        </div>
      </section>

      <Footer />
    </>
  )
}
