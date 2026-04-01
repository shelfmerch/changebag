import { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
// import Ticker from '../components/Ticker'
import Footer from '../components/Footer'
import useScrollReveal from '../hooks/useScrollReveal'
import s from './Pricing.module.css'

/* ── Data ── */
const PLANS = [
  {
    tier: 'Starter', name: 'Spark', bags: '500 branded tote bags · 1 city',
    amount: '₹75K', per: 'one-time · ₹150 per bag',
    featured: false,
    features: [
      '500 cotton tote bags, custom printed',
      'Distribution in 1 city of your choice',
      'Your logo + cause message design',
      'QR code tracking',
      'Basic impact dashboard (30 days)',
      'NGO donation: ₹5,000 included',
      'Delivery in 10–14 business days',
      'Digital ESG summary report',
    ],
    cta: 'Get started',
  },
  {
    tier: 'Growth', name: 'Impact', bags: '2,000 bags · up to 3 cities',
    amount: '₹2.5L', per: 'one-time · ₹125 per bag',
    featured: true,
    features: [
      '2,000 bags, up to 3 cities',
      'Custom design + brand story panel',
      'Full real-time impact dashboard',
      'City-wise reach analytics',
      'QR → campaign landing page link',
      'NGO donation: ₹20,000 included',
      'Certified ESG impact report (PDF)',
      'Dedicated campaign manager',
      'Co-branded social media assets',
    ],
    cta: 'Start this campaign',
  },
  {
    tier: 'Enterprise', name: 'Movement', bags: '10,000+ bags · National',
    amount: 'Custom', per: 'volume pricing · best per-bag rate',
    featured: false,
    features: [
      '10,000–1M bags, all India',
      'Multi-campaign annual strategy',
      'Co-branded NGO partnership',
      'SEBI ESG disclosure-ready report',
      'PR & media amplification pack',
      'Annual CSR compliance certificate',
      'White-glove account team',
      'Custom distribution strategy by state',
      'Govt. & PSU procurement support',
    ],
    cta: 'Talk to us',
  },
]

const INCLUDED = [
  { icon: '🎨', title: 'Design service', sub: 'Professional bag design with your branding. Proof within 24 hours.' },
  { icon: '🚚', title: 'Production & logistics', sub: 'Factory QC, packaging, and delivery to distribution points. Fully managed.' },
  { icon: '📊', title: 'Impact dashboard', sub: 'Real-time QR scan tracking, city-wise reach, and engagement metrics.' },
  { icon: '📄', title: 'ESG impact report', sub: 'PDF report with CO₂ saved, plastic prevented, and NGO donation confirmation.' },
]

const TABLE_ROWS = [
  { category: true, label: 'Campaign scale' },
  { label: 'Bags included', vals: ['500', '2,000', '10,000+'] },
  { label: 'Cities', vals: ['1', 'Up to 3', 'All India'] },
  { label: 'Est. impressions', vals: ['100K+', '400K+', '2M+'] },
  { label: 'NGO donation', vals: ['₹5,000', '₹20,000', 'Custom'] },
  { category: true, label: 'Design & production' },
  { label: 'Bag design service', vals: ['✓', '✓', '✓'] },
  { label: 'Brand story panel', vals: ['—', '✓', '✓'] },
  { label: 'Custom distribution plan', vals: ['—', '—', '✓'] },
  { category: true, label: 'Tracking & reporting' },
  { label: 'QR tracking', vals: ['✓', '✓', '✓'] },
  { label: 'Impact dashboard', vals: ['Basic (30d)', 'Full (90d)', 'Unlimited'] },
  { label: 'City analytics', vals: ['—', '✓', '✓'] },
  { label: 'ESG impact report', vals: ['Digital summary', 'Certified PDF', 'SEBI-aligned'] },
  { label: 'Annual CSR certificate', vals: ['—', '—', '✓'] },
  { category: true, label: 'Support & extras' },
  { label: 'Campaign manager', vals: ['Email support', 'Dedicated', 'White-glove team'] },
  { label: 'Social media assets', vals: ['—', '✓', '✓'] },
  { label: 'PR & media amplification', vals: ['—', '—', '✓'] },
  { label: 'Govt. procurement support', vals: ['—', '—', '★'] },
]

const FAQS = [
  { q: 'How quickly can my campaign go live?', a: 'From receipt of your logo and approval of the bag proof, we can have bags in production within 48 hours. Distribution typically begins within 10–14 days for Spark and 14–21 days for larger campaigns.' },
  { q: 'Can I choose which cause or NGO my campaign supports?', a: 'Yes. You can choose from our verified NGO partners, or suggest a cause. We vet all NGO partners for FCRA / 80G registration and impact credentials.' },
  { q: 'How does the impact dashboard work?', a: 'Every bag carries a QR code linked to your campaign. When scanned, it records the event, city, and any clicks. Your dashboard shows cumulative scans, city heatmap, and engagement funnel — updated in real time.' },
  { q: 'Is the ESG report accepted for SEBI or CSR filings?', a: 'Our certified reports are aligned with SEBI\'s BRSR framework. Most brands have used them directly in annual reports. We recommend sharing with your CFO or compliance team.' },
  { q: 'Can I run multiple campaigns in the same year?', a: 'Absolutely. Many brands run 4 campaigns per year — one per quarter — with different causes. Our Movement plan is built for this with annual strategy, consolidated reporting, and volume pricing.' },
  { q: 'What if I want to target a specific city or demographic?', a: 'We work with distribution partners — market associations, RWAs, colleges, employer campuses — across 800+ cities. Tell us your target audience and we\'ll design the plan to match.' },
  { q: 'What material are the bags made from?', a: 'All ChangeBags are 100% natural cotton canvas, printed with eco-friendly water-based inks. GOTS organic certification in progress for Q3 2025. No synthetic fabrics, no chemical dyes.' },
  { q: 'Is there a minimum order for government / PSU campaigns?', a: 'Government campaigns typically start at 5,000 bags. We provide full procurement documentation and GeM portal support.' },
]

/* ── Sub-components ── */
function PlanCard({ plan, onCta }) {
  return (
    <div className={`${s.planCard} ${plan.featured ? s.featured : ''}`}>
      {plan.featured && <div className={s.popularBadge}>Most popular</div>}
      <div className={s.planTier}>{plan.tier}</div>
      <div className={s.planName}>{plan.name}</div>
      <div className={s.planBags}>{plan.bags}</div>
      <div className={s.planAmount}>{plan.amount}</div>
      <div className={s.planPer}>{plan.per}</div>
      <div className={s.planDivider} />
      <ul className={s.planFeatures}>
        {plan.features.map((f) => (
          <li key={f}>
            <span className={s.check}>✓</span>
            {f}
          </li>
        ))}
      </ul>
      <button
        className={`${s.planBtn} ${plan.featured ? s.planBtnSolid : s.planBtnOutline}`}
        onClick={() => onCta(plan.name)}
      >
        {plan.cta}
      </button>
    </div>
  )
}

function FAQ({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`${s.faqItem} ${open ? s.faqOpen : ''}`} onClick={() => setOpen((o) => !o)}>
      <div className={s.faqQ}>
        <span>{q}</span>
        <span className={s.faqToggle}>{open ? '−' : '+'}</span>
      </div>
      {open && <div className={s.faqA}>{a}</div>}
    </div>
  )
}

function ContactForm({ defaultPlan }) {
  const [form, setForm] = useState({
    name: '', company: '', email: '', phone: '',
    plan: defaultPlan || '', cause: '', notes: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.phone) {
      alert('Please fill in name, email, and phone.')
      return
    }
    // TODO: replace with your Express API endpoint
    // await fetch('/api/leads', { method: 'POST', body: JSON.stringify(form), headers: { 'Content-Type': 'application/json' } })
    console.log('Lead form submitted:', form)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className={s.successBox}>
        <div className={s.successIcon}>🎉</div>
        <h3>Proposal request sent!</h3>
        <p>We'll send your personalised campaign proposal within 24 hours. Check your email at <strong>{form.email}</strong></p>
      </div>
    )
  }

  return (
    <div className={s.contactForm}>
      <h3>Get a campaign proposal</h3>
      <p>We'll respond within 24 hours with a personalised proposal.</p>
      <div className={s.formRow}>
        <div className={s.field}><label>Your name</label><input value={form.name} onChange={set('name')} placeholder="Full name" /></div>
        <div className={s.field}><label>Company</label><input value={form.company} onChange={set('company')} placeholder="Brand / company name" /></div>
      </div>
      <div className={s.formRow}>
        <div className={s.field}><label>Email</label><input type="email" value={form.email} onChange={set('email')} placeholder="you@company.com" /></div>
        <div className={s.field}><label>Phone</label><input type="tel" value={form.phone} onChange={set('phone')} placeholder="+91 98765 43210" /></div>
      </div>
      <div className={s.formRow}>
        <div className={s.field}>
          <label>Plan interested in</label>
          <select value={form.plan} onChange={set('plan')}>
            <option value="">Select a plan</option>
            <option value="spark">Spark — ₹75K (500 bags)</option>
            <option value="impact">Impact — ₹2.5L (2,000 bags)</option>
            <option value="movement">Movement — Custom (10,000+ bags)</option>
            <option value="unsure">Not sure yet — advise me</option>
          </select>
        </div>
        <div className={s.field}>
          <label>Cause preference</label>
          <select value={form.cause} onChange={set('cause')}>
            <option value="">Any cause is fine</option>
            <option>Environment / Sustainability</option>
            <option>Education</option>
            <option>Health & Wellbeing</option>
            <option>Women Empowerment</option>
            <option>National Service</option>
            <option>Other</option>
          </select>
        </div>
      </div>
      <div className={s.field} style={{ marginBottom: 14 }}>
        <label>Anything else? (optional)</label>
        <textarea value={form.notes} onChange={set('notes')} rows={3} placeholder="Target cities, timeline, or specific requirements" />
      </div>
      <button className={s.submitBtn} onClick={handleSubmit}>
        Send proposal request →
      </button>
      <p className={s.formNote}>No commitment. Personalised proposal within 24 hours.</p>
    </div>
  )
}

/* ── Page ── */
export default function Pricing() {
  useScrollReveal()
  const [activeFaq, setActiveFaq] = useState(null)

  const scrollToContact = (planName) => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <Navbar />

      {/* HERO */}
      <div className={s.hero}>
        <div className={s.heroInner}>
          <div className={`${s.heroTag} fade-up`}><div className={s.tagDot} /><span>Transparent pricing</span></div>
          <h1 className={`${s.heroH1} fade-up`} style={{ animationDelay: '0.1s' }}>
            Simple pricing.<br /><em>Serious impact.</em>
          </h1>
          <p className={`${s.heroSub} fade-up`} style={{ animationDelay: '0.22s' }}>
            No agency markups. No hidden fees. Every plan includes production, distribution,
            real-time dashboard, and an ESG impact report — ready for your board.
          </p>
          <div className={`${s.guaranteeRow} fade-up`} style={{ animationDelay: '0.36s' }}>
            {['No setup fees','ESG report in every plan','Dashboard included','End-to-end managed','48-hour campaign start'].map((g) => (
              <div key={g} className={s.guaranteeItem}>
                <div className={s.guaranteeCheck}>✓</div>
                {g}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* <Ticker /> */}

      {/* PLANS */}
      <section className={s.section} style={{ background: 'var(--cream)' }}>
        <div className={s.container}>
          <div className="reveal" style={{ textAlign: 'center', maxWidth: 540, margin: '0 auto' }}>
            <span className={s.label}>Campaign plans</span>
            <h2 className={s.heading}>Start small. <em>Scale fast.</em></h2>
          </div>
          <div className={s.plansGrid}>
            {PLANS.map((plan) => (
              <div key={plan.name} className="reveal" style={{ transitionDelay: plan.featured ? '0.1s' : '0s' }}>
                <PlanCard plan={plan} onCta={scrollToContact} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INCLUDED */}
      <section className={s.section} style={{ background: 'var(--cream-dark)', borderTop: '1px solid rgba(26,26,20,0.05)' }}>
        <div className={s.container}>
          <div className="reveal" style={{ textAlign: 'center', maxWidth: 540, margin: '0 auto 48px' }}>
            <span className={s.label}>Always included</span>
            <h2 className={s.heading}>Every plan. <em>No exceptions.</em></h2>
          </div>
          <div className={s.includedGrid}>
            {INCLUDED.map((item, i) => (
              <div key={item.title} className={`${s.incItem} reveal`} style={{ transitionDelay: `${i * 0.06}s` }}>
                <span className={s.incIcon}>{item.icon}</span>
                <div className={s.incTitle}>{item.title}</div>
                <div className={s.incSub}>{item.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPARE TABLE */}
      <section className={s.section} style={{ background: 'var(--cream)', borderTop: '1px solid rgba(26,26,20,0.05)' }}>
        <div className={s.container}>
          <div className="reveal" style={{ textAlign: 'center', maxWidth: 540, margin: '0 auto 48px' }}>
            <span className={s.label}>Plan comparison</span>
            <h2 className={s.heading}>Find the right <em>campaign size.</em></h2>
          </div>
          <div className={`${s.tableWrap} reveal`} style={{ transitionDelay: '0.1s' }}>
            <table className={s.table}>
              <thead>
                <tr>
                  <th className={s.thFeature}>Feature</th>
                  <th>Spark<br /><span>₹75K</span></th>
                  <th className={s.thFeatured}>Impact ⭐<br /><span>₹2.5L</span></th>
                  <th>Movement<br /><span>Custom</span></th>
                </tr>
              </thead>
              <tbody>
                {TABLE_ROWS.map((row) =>
                  row.category ? (
                    <tr key={row.label} className={s.categoryRow}>
                      <td colSpan={4}>{row.label}</td>
                    </tr>
                  ) : (
                    <tr key={row.label}>
                      <td className={s.tdFeature}>{row.label}</td>
                      {row.vals.map((v, vi) => (
                        <td key={vi} className={`${vi === 1 ? s.tdFeatured : ''} ${v === '✓' ? s.tdYes : ''} ${v === '—' ? s.tdNo : ''} ${v === '★' ? s.tdStar : ''}`}>
                          {v}
                        </td>
                      ))}
                    </tr>
                  )
                )}
                <tr className={s.tableCtaRow}>
                  <td><strong>Get started</strong></td>
                  <td><button className={s.tableCtaBtn} onClick={() => scrollToContact('spark')}>Start →</button></td>
                  <td className={s.tdFeatured}><button className={s.tableCtaBtn} onClick={() => scrollToContact('impact')}>Most popular →</button></td>
                  <td><button className={s.tableCtaBtn} onClick={() => scrollToContact('movement')}>Talk to us →</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className={s.section} style={{ background: 'var(--cream-dark)', borderTop: '1px solid rgba(26,26,20,0.05)' }}>
        <div className={s.container}>
          <div className="reveal" style={{ textAlign: 'center', maxWidth: 540, margin: '0 auto 48px' }}>
            <span className={s.label}>Questions answered</span>
            <h2 className={s.heading}>Everything you <em>need to know.</em></h2>
          </div>
          <div className={s.faqGrid}>
            {FAQS.map((faq) => (
              <div key={faq.q} className="reveal">
                <FAQ q={faq.q} a={faq.a} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section className={s.contactSec} id="contact">
        <div className={s.container}>
          <div className={s.contactGrid}>
            <div className="reveal">
              <h2>Ready to carry <em>change?</em></h2>
              <p>Tell us about your brand and we'll send a personalised campaign proposal within 24 hours — no commitment required.</p>
              <div className={s.contactPoints}>
                {[
                  ['⚡','24-hour proposal turnaround','Custom campaign brief with bag mock-up, cost, and impact projection.'],
                  ['📞','15-minute strategy call','Talk directly with our campaign team. No sales pitch — just strategy.'],
                  ['🤝','Pilot-friendly pricing','First-time brands get a 10% discount on the Spark plan. Ask us.'],
                ].map(([icon, title, sub]) => (
                  <div key={title} className={s.contactPoint}>
                    <div className={s.cpIcon}>{icon}</div>
                    <div><div className={s.cpTitle}>{title}</div><div className={s.cpSub}>{sub}</div></div>
                  </div>
                ))}
              </div>
              <div className={s.altContact}>
                <a href="https://wa.me/91XXXXXXXXXX" className={s.altBtn}>💬 WhatsApp us</a>
                <a href="#" className={s.altBtn}>📅 Book a call</a>
                <a href="#" className={s.altBtn}>📥 Download deck</a>
              </div>
            </div>
            <div className="reveal" style={{ transitionDelay: '0.12s' }}>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
