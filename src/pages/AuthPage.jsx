import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const X = {
  bg: "#080c14", bg2: "#0c1220", brd: "#1a2540", inp: "#0e1525",
  t1: "#e8ecf4", t2: "#8494b2", t3: "#4a5c7a",
  acc: "#f59e0b", grn: "#10b981", red: "#ef4444"
}

export default function AuthPage({ mode }) {
  const navigate = useNavigate()
  const { signIn, signUp } = useAuth()
  const isLogin = mode === 'login'

  const [form, setForm] = useState({ email: '', password: '', fullName: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const upd = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (isLogin) {
        await signIn(form.email, form.password)
        navigate('/app')
      } else {
        if (!form.fullName.trim()) { setError('El nombre es requerido'); setLoading(false); return }
        if (form.password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); setLoading(false); return }
        await signUp(form.email, form.password, form.fullName.trim())
        navigate('/onboarding')
      }
    } catch (err) {
      setError(err.message || 'Ocurrió un error. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ background: X.bg, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "'Outfit',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Outfit:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .auth-input:focus { border-color: ${X.acc} !important; outline: none; }
        .auth-input::placeholder { color: ${X.t3}; }
        .auth-btn:hover:not(:disabled) { opacity: 0.9; }
      `}</style>

      <div style={{ width: "100%", maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Link to="/" style={{ textDecoration: "none" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: "linear-gradient(135deg," + X.acc + ",#f97316)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 18, color: "#000" }}>F</div>
              <span style={{ fontWeight: 800, fontSize: 22, color: X.t1, letterSpacing: "-0.02em" }}>Fin<span style={{ color: X.acc }}>Pulse</span></span>
            </div>
          </Link>
        </div>

        {/* Card */}
        <div style={{ background: X.bg2, border: "1px solid " + X.brd, borderRadius: 18, padding: 32 }}>
          <h1 style={{ fontWeight: 800, fontSize: 22, color: X.t1, marginBottom: 4 }}>
            {isLogin ? 'Bienvenido de vuelta' : 'Crear tu cuenta'}
          </h1>
          <p style={{ fontSize: 13, color: X.t2, marginBottom: 24 }}>
            {isLogin ? 'Ingresá para acceder a tu dashboard.' : '7 días de acceso completo gratis.'}
          </p>

          {/* Tab switcher */}
          <div style={{ display: "flex", background: X.bg, borderRadius: 8, padding: 3, marginBottom: 24, border: "1px solid " + X.brd }}>
            {[['login', 'Iniciar sesión'], ['signup', 'Crear cuenta']].map(([m, label]) => (
              <Link key={m} to={m === 'login' ? '/login' : '/signup'} replace style={{ flex: 1, textAlign: "center", padding: "8px", borderRadius: 6, background: mode === m ? X.bg2 : "transparent", color: mode === m ? X.t1 : X.t3, fontSize: 12, fontWeight: 600, textDecoration: "none", transition: "all 0.15s", border: mode === m ? "1px solid " + X.brd : "1px solid transparent" }}>
                {label}
              </Link>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: X.t2, marginBottom: 5 }}>Nombre completo *</label>
                <input className="auth-input" type="text" required placeholder="Tu nombre completo" value={form.fullName} onChange={upd('fullName')}
                  style={{ width: "100%", padding: "11px 13px", borderRadius: 8, border: "1px solid " + X.brd, background: X.inp, color: X.t1, fontSize: 13, fontFamily: "'Outfit',sans-serif", transition: "border-color 0.15s" }} />
              </div>
            )}

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: X.t2, marginBottom: 5 }}>Email *</label>
              <input className="auth-input" type="email" required placeholder="tu@email.com" value={form.email} onChange={upd('email')}
                style={{ width: "100%", padding: "11px 13px", borderRadius: 8, border: "1px solid " + X.brd, background: X.inp, color: X.t1, fontSize: 13, fontFamily: "'Outfit',sans-serif", transition: "border-color 0.15s" }} />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: X.t2, marginBottom: 5 }}>Contraseña *</label>
              <input className="auth-input" type="password" required placeholder={isLogin ? "Tu contraseña" : "Mínimo 6 caracteres"} value={form.password} onChange={upd('password')}
                style={{ width: "100%", padding: "11px 13px", borderRadius: 8, border: "1px solid " + X.brd, background: X.inp, color: X.t1, fontSize: 13, fontFamily: "'Outfit',sans-serif", transition: "border-color 0.15s" }} />
            </div>

            {error && (
              <div style={{ background: X.red + "18", border: "1px solid " + X.red + "44", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 12, color: X.red }}>
                {error}
              </div>
            )}

            <button className="auth-btn" type="submit" disabled={loading}
              style={{ width: "100%", padding: "13px", borderRadius: 10, border: "none", background: loading ? X.brd : "linear-gradient(135deg," + X.acc + ",#f97316)", color: loading ? X.t3 : "#000", fontSize: 14, fontWeight: 800, cursor: loading ? "not-allowed" : "pointer", fontFamily: "'Outfit',sans-serif", transition: "opacity 0.2s" }}>
              {loading ? "Cargando..." : isLogin ? "Entrar al dashboard →" : "Crear cuenta y empezar →"}
            </button>
          </form>

          {!isLogin && (
            <p style={{ fontSize: 11, color: X.t3, textAlign: "center", marginTop: 14, lineHeight: 1.6 }}>
              Al registrarte aceptás los términos de uso.<br />
              <span style={{ color: X.grn, fontWeight: 600 }}>7 días gratis · Luego USD 15/mes</span>
            </p>
          )}
        </div>

        <p style={{ textAlign: "center", fontSize: 12, color: X.t3, marginTop: 20 }}>
          {isLogin ? '¿No tenés cuenta? ' : '¿Ya tenés cuenta? '}
          <Link to={isLogin ? '/signup' : '/login'} style={{ color: X.acc, fontWeight: 600, textDecoration: "none" }}>
            {isLogin ? 'Registrarse gratis' : 'Iniciar sesión'}
          </Link>
        </p>
      </div>
    </div>
  )
}
