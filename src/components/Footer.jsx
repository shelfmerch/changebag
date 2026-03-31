import { Link } from 'react-router-dom'
import styles from './Footer.module.css'
import { Mail, Clock } from 'lucide-react'

const NAV = {
  Platform: [
    { to: '/brands', label: 'For Brands' },
    { to: '/ngos', label: 'For NGOs' },
    // { to: '/brands#government', label: 'For Government' },
    { to: '/impact', label: 'Impact' },
    { to: '/pricing', label: 'Pricing' },
  ],
  'Quick Links': [
    { to: '/about', label: 'About us' },
    // { to: '/impact', label: 'Impact report' },
    { to: '/help-center', label: 'Help Center' },
    { to: '/privacy-policy', label: 'Privacy Policy' },
    { to: '/terms-of-service', label: 'Terms of Service' },
    { to: '/cookie-policy', label: 'Cookie Policy' },
  ],
  Contact: [
    { 
      icon: <Mail className={styles.contactIcon} size={18} />, 
      label: 'support@changebag.org', 
      subtext: 'We typically respond within 24 hours',
      href: 'mailto:support@changebag.org'
    },
    { 
      icon: <Clock className={styles.contactIcon} size={18} />, 
      label: 'Mon-Fri: 9AM-6PM EST', 
      subtext: 'Weekend support available'
    }
  ],
}

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.brand}>
            <Link to="/" className={styles.logo}>ChangeBag</Link>
            <p>India's purpose-media platform. Sponsor branded tote bags. Drive real impressions. Measurable ESG impact.</p>
          </div>

          {Object.entries(NAV).map(([heading, links]) => (
            <div key={heading} className={styles.col}>
              <h5>{heading}</h5>
              <ul>
                {links.map((link) => (
                  <li key={link.label}>
                    {link.icon ? (
                      <div className={styles.contactItem}>
                        {link.icon}
                        <div className={styles.contactInfo}>
                          {link.href ? (
                            <a href={link.href} className={styles.contactMain}>{link.label}</a>
                          ) : (
                            <span className={styles.contactText}>{link.label}</span>
                          )}
                          <span className={styles.contactSub}>{link.subtext}</span>
                        </div>
                      </div>
                    ) : (
                      link.to
                        ? <Link to={link.to}>{link.label}</Link>
                        : <a href={link.href}>{link.label}</a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className={styles.bottom}>
          <p>© 2025 ChangeBag. All rights reserved.</p>
          <p>Made with purpose in India 🇮🇳</p>
        </div>
      </div>
    </footer>
  )
}
