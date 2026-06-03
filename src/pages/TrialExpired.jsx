import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

const X = {
  bg: "#080c14", bg2: "#0c1220", brd: "#1a2540",
  t1: "#e8ecf4", t2: "#8494b2", t3: "#4a5c7a",
  acc: "#f59e0b", grn: "#10b981"
}

export default function TrialExpired() {
  const { user, profile, subscribe, signOut } = useAuth()
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubscribe() {
    setLoading(true)
    await new Promise((r) => setTimeout(r, 2000))
    await subscribe()
    setDone(true)
    setLoading(false)
  }

  if (done) {
    return (
      <div style={{ background: X.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Outfit',sans-serif" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&display=swap'); * { box-sizing: border-box; margin: 0; padding: 0; }`}</style>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 70, height: 70, borderRadius: "50%", background: X.grn + "22", border: "2px solid " + X.grn + "44", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 34 }}>✓</div>
          <div style={{ fontWeight: 800, fontSize: 24, color: X.t1, marginBottom: 8 }}>¡Suscripción activada!</div>
          <div style={{ color: X.t2, fontSize: 14 }}>Recargando tu dashboard...</div>
        </div>
      </div>
    )
  }

  const trialEndDate = profile?.trial_start ? new Date(new Date(profile.trial_start).setDate(new Date(profile.trial_start).getDate() + 30)) : new Date()

  return (
    <div style={{ background: X.bg, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "'Outfit',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Outfit:wght@400;500;600;700;800&display=swap'); * { box-sizing: border-box; margin: 0; padding: 0; }`}</style>

      <div style={{ width: "100%", maxWidth: 480 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 7, background: "linear-gradient(135deg," + X.acc + ",#f97316)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 17, color: "#000" }}>F</div>
            <span style={{ fontWeight: 800, fontSize: 20, color: X.t1, letterSpacing: "-0.02em" }}>Fin<span style={{ color: X.acc }}>Pulse</span></span>
          </div>
        </div>

        <div style={{ background: X.bg2, border: "1px solid " + X.brd, borderRadius: 20, padding: 36, textAlign: "center" }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>⏳</div>
          <h1 style={{ fontWeight: 800, fontSize: 24, color: X.t1, marginBottom: 8 }}>Tu prueba gratuita terminó</h1>
          <p style={{ color: X.t2, fontSize: 14, lineHeight: 1.7, marginBottom: 6 }}>
            Tu período de 30 días venció el <span style={{ color: X.t1, fontWeight: 600 }}>{trialEndDate.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>.
          </p>
          <p style={{ color: X.t2, fontSize: 13, marginBottom: 28 }}>
            Suscribite para seguir accediendo a todos los mercados, chat y más.
          </p>

          <div style={{ background: X.bg, border: "1px solid " + X.brd, borderRadius: 12, padding: "20px", marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <span style={{ fontWeight: 700, fontSize: 15, color: X.t1 }}>FinPulse Pro</span>
              <div>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 22, fontWeight: 800, color: X.acc }}>USD 15</span>
                <span style={{ fontSize: 12, color: X.t3 }}>/mes</span>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7, textAlign: "left" }}>
              {["Mercados en tiempo real", "Chat con inversores", "FinMatch networking", "Análisis PRO y recomendaciones"].map((item) => (
                <div key={item} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: X.t2 }}>
                  <span style={{ color: X.grn, fontWeight: 700 }}>✓</span>{item}
                </div>
              ))}
            </div>
          </div>

          <button onClick={handleSubscribe} disabled={loading}
            style={{ width: "100%", padding: "14px", borderRadius: 10, border: "none", background: loading ? X.brd : "linear-gradient(135deg," + X.acc + ",#f97316)", color: loading ? X.t3 : "#000", fontSize: 15, fontWeight: 800, cursor: loading ? "not-allowed" : "pointer", fontFamily: "'Outfit',sans-serif", marginBottom: 12 }}>
            {loading ? "Procesando..." : "💳 Suscribirme — USD 15/mes"}
          </button>

          <button onClick={signOut} style={{ background: "none", border: "none", color: X.t3, fontSize: 12, cursor: "pointer", fontFamily: "'Outfit',sans-serif", textDecoration: "underline" }}>
            Cerrar sesión ({user?.email})
          </button>
        </div>
      </div>
    </div>
  )
}
