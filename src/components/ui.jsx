import { waLink } from '../data.js'

export function WhatsAppButton({ text, label = 'וואטסאפ', className = '' }) {
  return (
    <a className={`btn ${className}`} href={waLink(text)} target="_blank" rel="noopener">
      <WaIcon /> {label}<span className="visually-hidden"> (נפתח בחלון חדש)</span>
    </a>
  )
}

export function WaIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2c.2-.6.2-1.1.1-1.2l-.5-.3Z" />
    </svg>
  )
}

export function Spinner() {
  return <span className="spin" aria-hidden="true" />
}

// A fact the owner has not given yet: shown as a dashed slot, never invented.
export function Fill({ children }) {
  return <span className="fill">{children}</span>
}

export function Head({ id, title, lead }) {
  return (
    <div className="head">
      <h2 id={id}>{title}</h2>
      {lead && <p>{lead}</p>}
    </div>
  )
}
