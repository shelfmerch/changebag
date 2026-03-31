import { useEffect } from 'react'

/**
 * useScrollReveal
 * Observes all .reveal elements inside the page and adds .visible when in view.
 * Call once at the top of each page component.
 *
 * Usage:
 *   import useScrollReveal from '../hooks/useScrollReveal'
 *   export default function MyPage() {
 *     useScrollReveal()
 *     return <div><div className="reveal">...</div></div>
 *   }
 */
export default function useScrollReveal(threshold = 0.1) {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold }
    )

    // Small delay so DOM is painted before we query
    const timer = setTimeout(() => {
      document.querySelectorAll('.reveal').forEach((el) => observer.observe(el))
    }, 50)

    return () => {
      clearTimeout(timer)
      observer.disconnect()
    }
  }, [threshold])
}
