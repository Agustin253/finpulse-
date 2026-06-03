import { useNavigate } from 'react-router-dom'

const X = {
  bg: "#080c14", bg2: "#0c1220", bg3: "#111828", bgH: "#151d30",
  brd: "#1a2540", t1: "#e8ecf4", t2: "#8494b2", t3: "#4a5c7a",
  acc: "#f59e0b", grn: "#10b981", blu: "#3b82f6", pur: "#8b5cf6", cyn: "#06b6d4"
}

const FEATURES = [
  {
    icon: "📊",
    title: "Mercados en Tiempo Real",
    desc: "Forex, índices bursátiles, commodities y crypto actualizados en vivo. Datos de CoinGecko API integrados.",
    color: X.grn
  },
  {
    icon: "₿",
    title: "Crypto Live",
    desc: "Bitcoin, Ethereum, Solana y más. Precios reales con variación de 24 horas desde CoinGecko.",
    color: X.pur
  },
  {
    icon: "⬡",
    title: "FinMatch",
    desc: "Conectá con inversores afines según tu perfil de riesgo, sectores de interés y rango de inversión.",
    color: X.acc
  },
  {
    icon: "💬",
    title: "Chat de Inversores",
    desc: "8 salas temáticas: Crypto, Forex, Acciones, Merval, Macro y más. Comunidad activa en tiempo real.",
    color: X.blu
  },
  {
    icon: "📰",
    title: "Feed de Noticias",
    desc: "Noticias financieras filtradas por categoría. Análisis premium de FinPulse Research.",
    color: X.cyn
  },
  {
    icon: "▸",
    title: "Terminal CLI",
    desc: "Terminal financiero estilo Bloomberg. Comandos QUOTE, CRYPTO, NEWS y más directamente desde el dashboard.",
    color: X.grn
  }
]

const STATS = [
  { value: "8+", label: "Salas de chat" },
  { value: "16+", label: "Pares monitoreados" },
  { value: "30", label: "Días de prueba gratis" },
  { value: "2s", label: "Actualización de precios" }
]

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div style={{ background: X.bg, minHeight: "100vh", color: X.t1, fontFamily: "'Outfit',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px } ::-webkit-scrollbar-track { background: #080c14 } ::-webkit-scrollbar-thumb { background: #1a2540; border-radius: 2px }
        @keyframes float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-8px) } }
        @keyframes glow { 0%,100% { opacity: 0.4 } 50% { opacity: 0.8 } }
        @keyframes tk { 0% { transform: translateX(0) } 100% { transform: translateX(-50%) } }
        .lp-btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }
        .lp-btn-secondary:hover { border-color: ${X.acc}; color: ${X.acc}; }
        .feature-card:hover { border-color: var(--card-color) !important; background: ${X.bgH} !important; transform: translateY(-2px); }
        .feature-card { transition: all 0.2s !important; }
      `}</style>

      {/* Nav */}
      <nav style={{ padding: "16px 24px", borderBottom: "1px solid " + X.brd, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: X.bg + "ee", backdropFilter: "blur(12px)", zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 30, height: 30, borderRadius: 7, background: "linear-gradient(135deg," + X.acc + ",#f97316)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 16, color: "#000" }}>F</div>
          <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: "-0.02em" }}>Fin<span style={{ color: X.acc }}>Pulse</span></span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button className="lp-btn-secondary" onClick={() => navigate('/login')} style={{ padding: "8px 18px", borderRadius: 8, border: "1px solid " + X.brd, background: "transparent", color: X.t2, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit',sans-serif", transition: "all 0.2s" }}>
            Iniciar sesión
          </button>
          <button className="lp-btn-primary" onClick={() => navigate('/signup')} style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: "linear-gradient(135deg," + X.acc + ",#f97316)", color: "#000", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit',sans-serif", transition: "all 0.2s" }}>
            Empezar gratis
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding: "80px 24px 60px", textAlign: "center", maxWidth: 900, margin: "0 auto", position: "relative" }}>
        <div style={{ position: "absolute", top: 60, left: "50%", transform: "translateX(-50%)", width: 600, height: 300, background: "radial-gradient(" + X.acc + "18, transparent 70%)", borderRadius: "50%", pointerEvents: "none", animation: "glow 4s ease-in-out infinite" }} />

        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 14px", borderRadius: 20, border: "1px solid " + X.acc + "44", background: X.acc + "10", marginBottom: 24 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: X.grn, animation: "glow 1.5s ease-in-out infinite" }} />
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: X.acc, fontWeight: 600 }}>30 días gratis · Sin tarjeta de crédito</span>
        </div>

        <h1 style={{ fontWeight: 900, fontSize: "clamp(36px,6vw,64px)", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 20, position: "relative" }}>
          Tu terminal financiero<br />
          <span style={{ background: "linear-gradient(135deg," + X.acc + ",#f97316)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            para Latinoamérica
          </span>
        </h1>

        <p style={{ fontSize: 18, color: X.t2, lineHeight: 1.7, marginBottom: 36, maxWidth: 600, margin: "0 auto 36px" }}>
          Mercados en tiempo real, red de inversores y análisis premium. Todo lo que necesitás para tomar mejores decisiones financieras.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button className="lp-btn-primary" onClick={() => navigate('/signup')} style={{ padding: "14px 32px", borderRadius: 10, border: "none", background: "linear-gradient(135deg," + X.acc + ",#f97316)", color: "#000", fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: "'Outfit',sans-serif", transition: "all 0.2s" }}>
            Empezar prueba gratis →
          </button>
          <button className="lp-btn-secondary" onClick={() => navigate('/login')} style={{ padding: "14px 28px", borderRadius: 10, border: "1px solid " + X.brd, background: "transparent", color: X.t2, fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit',sans-serif", transition: "all 0.2s" }}>
            Ya tengo cuenta
          </button>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: "0 24px 60px", maxWidth: 800, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 12 }}>
          {STATS.map((s) => (
            <div key={s.label} style={{ background: X.bg2, border: "1px solid " + X.brd, borderRadius: 12, padding: "20px 16px", textAlign: "center" }}>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 28, fontWeight: 800, color: X.acc, marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 12, color: X.t3 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Live ticker preview */}
      <section style={{ padding: "0 0 60px", overflow: "hidden" }}>
        <div style={{ background: X.bg2, borderTop: "1px solid " + X.brd, borderBottom: "1px solid " + X.brd, padding: "10px 0", height: 40, display: "flex", alignItems: "center", overflow: "hidden" }}>
          <div style={{ display: "flex", gap: 32, animation: "tk 30s linear infinite", whiteSpace: "nowrap", paddingLeft: 24 }}>
            {[0, 1].map((rep) => (
              <div key={rep} style={{ display: "flex", gap: 32 }}>
                {[
                  { sym: "EUR/USD", v: "1.0847", c: "+0.12%", pos: true },
                  { sym: "BTC/USD", v: "$68,420", c: "+2.34%", pos: true },
                  { sym: "S&P 500", v: "5,432.1", c: "+0.58%", pos: true },
                  { sym: "GOLD", v: "2,345.6", c: "-0.21%", pos: false },
                  { sym: "MERVAL", v: "1,456,789", c: "+1.87%", pos: true },
                  { sym: "ETH/USD", v: "$3,845", c: "+1.02%", pos: true },
                  { sym: "USD/ARS", v: "1,052.5", c: "-0.08%", pos: false },
                  { sym: "OIL WTI", v: "78.34", c: "+0.44%", pos: true }
                ].map((item) => (
                  <span key={item.sym + rep} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "'JetBrains Mono',monospace", fontSize: 11 }}>
                    <span style={{ color: X.t3, fontWeight: 600 }}>{item.sym}</span>
                    <span style={{ color: X.t1 }}>{item.v}</span>
                    <span style={{ color: item.pos ? X.grn : "#ef4444", padding: "1px 5px", borderRadius: 3, background: item.pos ? X.grn + "18" : "#ef444418", fontSize: 10 }}>{item.pos ? "▲" : "▼"} {item.c}</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section style={{ padding: "0 24px 80px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ fontWeight: 800, fontSize: "clamp(24px,4vw,40px)", letterSpacing: "-0.02em", marginBottom: 12, color: X.t1 }}>Todo lo que necesitás en un solo lugar</h2>
          <p style={{ color: X.t2, fontSize: 15 }}>Acceso completo durante 30 días. Luego USD 15/mes.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 14 }}>
          {FEATURES.map((f) => (
            <div key={f.title} className="feature-card" style={{ "--card-color": f.color, background: X.bg2, border: "1px solid " + X.brd, borderRadius: 14, padding: 24 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: f.color + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 14 }}>{f.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: X.t1, marginBottom: 8 }}>{f.title}</div>
              <div style={{ fontSize: 13, color: X.t2, lineHeight: 1.7 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section style={{ padding: "0 24px 80px", maxWidth: 500, margin: "0 auto", textAlign: "center" }}>
        <div style={{ background: X.bg2, border: "1px solid " + X.brd, borderRadius: 20, padding: 36, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg," + X.acc + ",#f97316)" }} />
          <div style={{ fontWeight: 700, fontSize: 12, color: X.acc, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>FinPulse Pro</div>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 4, marginBottom: 8 }}>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 48, fontWeight: 800, color: X.t1 }}>USD 15</span>
            <span style={{ fontSize: 16, color: X.t3 }}>/mes</span>
          </div>
          <div style={{ fontSize: 13, color: X.grn, marginBottom: 28, fontWeight: 600 }}>30 días gratis incluidos</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28, textAlign: "left" }}>
            {["Todos los mercados en tiempo real", "Chat con inversores (8 salas)", "FinMatch — red de inversores", "Feed premium de noticias", "Análisis y recomendaciones PRO", "Terminal financiero CLI"].map((item) => (
              <div key={item} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: X.t2 }}>
                <span style={{ color: X.grn, fontWeight: 700 }}>✓</span>{item}
              </div>
            ))}
          </div>
          <button className="lp-btn-primary" onClick={() => navigate('/signup')} style={{ width: "100%", padding: "14px", borderRadius: 10, border: "none", background: "linear-gradient(135deg," + X.acc + ",#f97316)", color: "#000", fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: "'Outfit',sans-serif", transition: "all 0.2s" }}>
            Empezar prueba gratis
          </button>
          <div style={{ fontSize: 11, color: X.t3, marginTop: 12 }}>Sin tarjeta de crédito · Cancelá cuando quieras</div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid " + X.brd, padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <span style={{ fontWeight: 800, fontSize: 13 }}>Fin<span style={{ color: X.acc }}>Pulse</span> <span style={{ fontWeight: 400, fontSize: 10, color: X.t3 }}>© 2026</span></span>
        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: X.t3 }}>Crypto: CoinGecko API · Forex/Índices: Simulados</div>
      </footer>
    </div>
  )
}
