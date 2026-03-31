import { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
// import Ticker from '../components/Ticker'
import useScrollReveal from '../hooks/useScrollReveal'
import s from './NGOs.module.css'
import Footer from '../components/Footer'

const CAUSES = [
  { emoji: '🌍', title: 'Environment', body: 'Climate action, plastic reduction, tree planting, clean water.', eg: 'e.g. WWF India, Greenpeace, Plant for Planet' },
  { emoji: '📚', title: 'Education', body: 'Girl child education, rural learning, digital literacy.', eg: 'e.g. Pratham, Teach for India, CRY' },
  { emoji: '❤️', title: 'Health', body: 'Mental health, nutrition, sanitation, rural healthcare.', eg: 'e.g. iCall, Smile Foundation, Akshaya Patra' },
  { emoji: '👩', title: 'Women Empowerment', body: 'Gender equality, skill building, safety, economic independence.', eg: 'e.g. Goonj, Udayan Care' },
  { emoji: '🇮🇳', title: 'National Service', body: 'Armed forces support, veterans welfare, national pride.', eg: 'e.g. Indian Army welfare, Sainik Seva' },
  { emoji: '🐾', title: 'Animal Welfare', body: 'Street animal care, wildlife conservation, cruelty-free India.', eg: 'e.g. PETA India, Wildlife SOS, Blue Cross' },
]

const PARTNERS = ['CRY India','Goonj','Smile Foundation','Pratham','WWF India','Akshaya Patra','iCall','Teach for India','Wildlife SOS','Plant for Planet']

function Calculator() {
  const [bags, setBags] = useState(5000)
  const fmt = (n) => n >= 10000000 ? `${Math.round(n/10000000)}Cr+` : n >= 100000 ? `${Math.round(n/100000)}L+` : `${Math.round(n/1000)}K+`
  const donation = bags * 10
  const donationFmt = donation >= 100000 ? `₹${(donation/100000).toFixed(1)}L` : `₹${Math.round(donation/1000)}K`
  const co2 = (bags * 27.5 / 1000).toFixed(1)

  return (
    <div className={s.calcBox}>
      <div className={s.calcTitle}>Revenue estimator</div>
      <div className={s.calcSlider}>
        <div className={s.sliderLabels}>
          <span>Bags distributed</span>
          <span className={s.sliderVal}>{bags.toLocaleString('en-IN')}</span>
        </div>
        <input type="range" min={500} max={100000} step={500} value={bags}
          onChange={(e) => setBags(Number(e.target.value))} className={s.range} />
      </div>
      <div className={s.calcResults}>
        <div className={s.calcResult}><div className={s.rNum}>{donationFmt}</div><div className={s.rLabel}>NGO donation</div></div>
        <div className={s.calcResult}><div className={s.rNum}>{fmt(bags * 200)}</div><div className={s.rLabel}>Impressions for cause</div></div>
        <div className={s.calcResult}><div className={s.rNum}>{fmt(bags * 500)}</div><div className={s.rLabel}>Plastics replaced</div></div>
        <div className={s.calcResult}><div className={s.rNum}>{co2} T</div><div className={s.rLabel}>CO₂ saved</div></div>
      </div>
      <p className={s.calcNote}>Estimates based on 200 avg bag uses, ₹10/bag donation, 500 plastic bags replaced per tote.</p>
    </div>
  )
}

function ApplyForm() {
  const [form, setForm] = useState({ org: '', reg: '', name: '', email: '', phone: '', cause: '', about: '' })
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <div className={s.applyForm}>
      <h3>NGO partner application</h3>
      <p>All fields required. We'll respond within 48 hours.</p>
      <div className={s.formRow}>
        <div className={s.field}><label>Organisation name</label><input value={form.org} onChange={set('org')} placeholder="Your NGO name" /></div>
        <div className={s.field}><label>Registration number</label><input value={form.reg} onChange={set('reg')} placeholder="12A / FCRA / 80G reg." /></div>
      </div>
      <div className={s.formRow}>
        <div className={s.field}><label>Contact name</label><input value={form.name} onChange={set('name')} placeholder="Your full name" /></div>
        <div className={s.field}><label>Email</label><input type="email" value={form.email} onChange={set('email')} placeholder="you@ngo.org" /></div>
      </div>
      <div className={s.formRow}>
        <div className={s.field}><label>Phone</label><input type="tel" value={form.phone} onChange={set('phone')} placeholder="+91 98765 43210" /></div>
        <div className={s.field}><label>Primary cause</label>
          <select value={form.cause} onChange={set('cause')}>
            <option value="">Select cause area</option>
            <option>Environment & Sustainability</option>
            <option>Education</option>
            <option>Health & Wellbeing</option>
            <option>Women Empowerment</option>
            <option>National Service</option>
            <option>Animal Welfare</option>
            <option>Other</option>
          </select>
        </div>
      </div>
      <div className={s.field} style={{ marginBottom: 14 }}>
        <label>About your work</label>
        <textarea value={form.about} onChange={set('about')} placeholder="Brief description of your cause and communities you serve (2–3 lines)" rows={3} />
      </div>
      <button className={s.submitBtn} onClick={() => alert('Application submitted! We\'ll respond within 48 hours.')}>
        Submit application →
      </button>
    </div>
  )
}

export default function NGOs() {
  useScrollReveal()

  return (
    <>
      <Navbar />

      {/* HERO */}
      <section className={s.hero}>
        <div className={s.heroNoise} />
        <div className={s.heroGlow} />
        <div className={`${s.heroInner} ${s.container}`}>
          <div style={{ maxWidth: 660 }}>
            <div className={`${s.heroTag} fade-up`}><div className={s.tagDot} /><span>For NGOs & social causes</span></div>
            <h1 className={`${s.heroH1} fade-up`} style={{ animationDelay: '0.1s' }}>Your mission,<br />in a <em>million hands.</em></h1>
            <p className={`${s.heroSub} fade-up`} style={{ animationDelay: '0.22s' }}>
              Partner with ChangeBag at <strong>zero cost</strong>. Your cause gets printed on premium tote bags, distributed free to citizens across India — carried daily by people who believe in what you stand for.
            </p>
            <div className={`${s.heroBtns} fade-up`} style={{ animationDelay: '0.36s' }}>
              <a href="#apply" className={s.btnPrimary}>Apply to partner →</a>
              <a href="#how" className={s.btnGhost}>How it works</a>
            </div>
            <div className={`${s.heroBadges} fade-up`} style={{ animationDelay: '0.52s' }}>
              <div className={s.badge}><span className={s.badgeBig}>₹0</span><div><strong>Zero cost to NGOs</strong><span>Fully funded by brand sponsors</span></div></div>
              <div className={s.badge}><span className={s.badgeBig}>₹10</span><div><strong>Donated per bag</strong><span>Direct to your cause</span></div></div>
            </div>
          </div>
        </div>
      </section>

      {/* <Ticker /> */}

      {/* BENEFITS */}
      <section className={s.section} style={{ background: 'var(--cream)' }}>
        <div className={s.container}>
          <div className="reveal">
            <span className={s.label}>What NGOs get</span>
            <h2 className={s.heading}>Everything. For <em>nothing.</em></h2>
            <p className={s.sub}>You bring the cause. We bring the funding, production, distribution, and an audience of millions.</p>
          </div>
          <div className={s.benefitGrid}>
            <div className={`${s.bCard} ${s.bGreen} reveal`} style={{ transitionDelay: '0.05s' }}>
              <span className={s.bIcon}>🎁</span>
              <h3>Zero cost, full visibility</h3>
              <p>No budget required. Ever. ChangeBag is entirely funded by brand sponsors. Your NGO's message, branding, and cause go on every bag at no cost to you.</p>
              <span className={s.bHighlight}>₹0</span>
            </div>
            <div className={`${s.bCard} ${s.bGold} reveal`} style={{ transitionDelay: '0.1s' }}>
              <span className={s.bIcon}>💰</span>
              <h3>A new revenue stream</h3>
              <p>₹10 per bag is donated directly to your organisation. With 10,000 bags, that's ₹1 lakh — earned without a single fundraising event.</p>
              <span className={s.bHighlight}>₹10 / bag</span>
            </div>
            <div className={`${s.bCard} ${s.bCream} reveal`} style={{ transitionDelay: '0.05s' }}>
              <span className={s.bIcon}>📣</span>
              <h3>Everyday awareness</h3>
              <p>Citizens become walking ambassadors for your cause. Every time the bag is used — at a market, office, or school — your mission travels somewhere new.</p>
              <span className={s.bHighlight}>200+ uses</span>
            </div>
            <div className={`${s.bCard} ${s.bWhite} reveal`} style={{ transitionDelay: '0.1s' }}>
              <span className={s.bIcon}>🤝</span>
              <h3>Co-branded campaigns</h3>
              <p>Joint storytelling with established brand partners builds your NGO's credibility and exposes your cause to millions of new potential supporters.</p>
              <span className={s.bHighlight}>Brand reach</span>
            </div>
          </div>
        </div>
      </section>

      {/* CALCULATOR */}
      <section className={s.section} style={{ background: 'var(--cream-dark)', borderTop: '1px solid rgba(26,26,20,0.05)' }}>
        <div className={s.container}>
          <div className={s.calcGrid}>
            <div className="reveal">
              <span className={s.label}>Estimate your earnings</span>
              <h2 className={s.heading}>Your cause earns while <em>it spreads.</em></h2>
              <p className={s.sub} style={{ marginTop: 12 }}>Every bag distributed adds ₹10 to your organisation. Scale is unlimited.</p>
              <div className={s.howSteps} id="how">
                {[['1','Apply and get approved','Takes 5 minutes. We review within 48 hours.'],
                  ['2','Brands choose your cause','We match you with relevant brand sponsors.'],
                  ['3','Earn as bags go out','Donations deposited monthly. Dashboard shows live data.']
                ].map(([n,t,b])=>(
                  <div key={n} className={s.howStep}><div className={s.howNum}>{n}</div><div><strong>{t}</strong><p>{b}</p></div></div>
                ))}
              </div>
            </div>
            <div className="reveal" style={{ transitionDelay: '0.1s' }}><Calculator /></div>
          </div>
        </div>
      </section>

      {/* CAUSES (Already green deep) */}
      <section className={s.causesSec}>
        <div className={s.container}>
          <div className="reveal" style={{ position: 'relative', zIndex: 1 }}>
            <span className={`${s.label} ${s.lightLabel}`}>Causes we work with</span>
            <h2 className={`${s.heading} ${s.lightHeading}`}>Every good cause <em>has a bag.</em></h2>
          </div>
          <div className={s.causesGrid}>
            {CAUSES.map((c, i) => (
              <div key={c.title} className={`${s.causeCard} reveal`} style={{ transitionDelay: `${(i % 3) * 0.08}s` }}>
                <span className={s.causeEmoji}>{c.emoji}</span>
                <h4>{c.title}</h4>
                <p>{c.body}</p>
                <div className={s.causeEg}>{c.eg}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PARTNERS */}
      <section style={{ background: 'var(--cream)', padding: '60px 0', borderTop: '1px solid rgba(26,26,20,0.05)' }}>
        <div className={s.container}>
          <p className={s.partnersLabel}>NGOs we've worked with</p>
          <div className={s.partnersGrid}>
            {PARTNERS.map(p => <div key={p} className={s.partnerPill}>{p}</div>)}
          </div>
        </div>
      </section>

      {/* APPLY */}
      <section className={s.section} id="apply" style={{ background: 'var(--cream-dark)', borderTop: '1px solid rgba(26,26,20,0.05)' }}>
        <div className={s.container}>
          <div className="reveal" style={{ textAlign: 'center', maxWidth: 540, margin: '0 auto 48px' }}>
            <span className={s.label}>Join the movement</span>
            <h2 className={s.heading}>Apply to become<br />a <em>cause partner.</em></h2>
            <p className={s.sub} style={{ margin: '0 auto' }}>Takes 5 minutes. We review all applications within 48 hours.</p>
          </div>
          <div className={s.applySteps}>
            {[['1','Submit application','Fill in the form with your organisation details.'],
              ['2','We review & approve','Our team verifies your NGO registration within 48 hours.'],
              ['3','Get matched with brands','Campaigns start within 2–4 weeks of approval.']
            ].map(([n,t,b])=>(
              <div key={n} className={`${s.applyStep} reveal`}>
                <div className={s.applyStepNum}>{n}</div>
                <h4>{t}</h4>
                <p>{b}</p>
              </div>
            ))}
          </div>
          <div className="reveal" style={{ transitionDelay: '0.1s' }}>
            <ApplyForm />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={s.section} style={{ background: 'var(--green-deep)', textAlign: 'center', padding: '100px 0', position: 'relative', overflow: 'hidden' }}>
        <div className={s.heroNoise} style={{ opacity: 0.3 }} />
        <div className={s.container} style={{ position: 'relative', zIndex: 1 }}>
          <h2 className={s.lightHeading} style={{ fontSize: 'clamp(32px, 5vw, 56px)', marginBottom: 20 }}>Your cause deserves<br />to be <em>carried.</em></h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 18, marginBottom: 40 }}>Join 100+ mission-driven partners already on the ChangeBag network.</p>
          <div className={s.heroBtns} style={{ justifyContent: 'center' }}>
            <a href="#apply" className={s.btnPrimary}>Apply to partner →</a>
            <Link to="/brands" className={s.btnGhost}>Partner as a brand</Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
