import styles from './Ticker.module.css'

const ITEMS = [
  { num: '500+', text: 'bags replaced per tote' },
  { num: '₹65M+', text: 'ad value generated' },
  { num: '200K+', text: 'citizens engaged' },
  { num: '1.2M+', text: 'bags distributed' },
  { num: 'Featured in', text: 'NDTV · Outlook · HT · ET' },
  { num: '10,400 KG', text: 'CO₂ reduced' },
  { num: 'Trusted by', text: 'Indian Army · IndianOil · Dr. Agarwals' },
]

export default function Ticker() {
  // Duplicate for seamless loop
  const doubled = [...ITEMS, ...ITEMS]

  return (
    <div className={styles.ticker}>
      <div className={styles.track}>
        {doubled.map((item, i) => (
          <span key={i} className={styles.item}>
            <span className={styles.num}>{item.num}</span>
            {item.text}
            <span className={styles.dot} />
          </span>
        ))}
      </div>
    </div>
  )
}
