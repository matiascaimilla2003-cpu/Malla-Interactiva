import { useState } from 'react'
import { RAMOS } from '../data/malla'

export default function ShareModal({ onClose, user, progreso }) {
  const [copied, setCopied] = useState(false)

  const count = RAMOS.filter(r => {
    const st = progreso[r.code]
    return st === 'aprobado' || st === 'convalidado'
  }).length

  const handle = (user?.email?.split('@')[0] ?? 'student')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
  const link = `https://malla.ic/u/${handle}-${count}r`

  function handleCopy() {
    try { navigator.clipboard.writeText(link) } catch {}
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="mini-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close mini-modal-close" onClick={onClose}>✕</button>
        <h3 className="mini-modal-title">Compartir mi malla</h3>
        <p className="mini-modal-sub">Tu compañero ve tu avance sin registrarse.</p>

        <div className="share-link-row">
          <code className="share-link-code">{link}</code>
          <button className="btn btn-sm" onClick={handleCopy}>
            {copied ? '✓ Copiado' : 'Copiar'}
          </button>
        </div>

        <p className="mini-modal-note">
          Ramos completados: <b>{count}</b>. Las notas no se comparten.
        </p>
      </div>
    </div>
  )
}
