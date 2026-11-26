import { Fragment, useEffect, useRef, useState } from 'react'

// The word-highlight moment (taste-skill): the sentence turns from half ink to ink, word by word, as it rises through
// the screen, and runs back on the way up. No pin, so it costs no extra scroll. Reduced motion: all ink, no listener.
export default function Statement({ text, id, accent = /^למדוד/ }) {
  const words = text.split(' ').map(w => [w, accent.test(w)])
  const ref = useRef(null)
  const [on, setOn] = useState(words.length)
  const [still] = useState(() => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches)
  useEffect(() => {
    if (still) return
    let raf = 0
    const tick = () => {
      raf = 0
      // starts when the sentence's top reaches 85% of the screen, complete by the time its bottom reaches 45%
      const r = ref.current.getBoundingClientRect(), start = innerHeight * 0.85, end = innerHeight * 0.45
      const p = Math.min(1, Math.max(0, (start - r.top) / Math.max(1, start - end + r.height)))
      setOn(Math.round(p * words.length))
    }
    const ask = () => { if (!raf) raf = requestAnimationFrame(tick) }
    tick()
    addEventListener('scroll', ask, { passive: true }); addEventListener('resize', ask)
    return () => { removeEventListener('scroll', ask); removeEventListener('resize', ask); cancelAnimationFrame(raf) }
  }, [still, words.length])
  return (
    <p ref={ref} id={id} className="statement__text">
      {words.map(([w, strong], i) => {
        const span = <span className={i < on ? 'w is-on' : 'w'}>{w}</span>
        return <Fragment key={i}>{strong ? <strong>{span}</strong> : span}{i < words.length - 1 ? ' ' : ''}</Fragment>
      })}
    </p>
  )
}
