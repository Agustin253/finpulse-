import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../supabase'

const X = {
  bg: "#080c14", bg2: "#0c1220", brd: "#1a2540", inp: "#0e1525",
  t1: "#e8ecf4", t2: "#8494b2", t3: "#4a5c7a",
  acc: "#f59e0b", grn: "#10b981", red: "#ef4444"
}

export const SECTORS = [
  'Acciones', 'Bonos', 'Crypto', 'FX / Divisas', 'Commodities',
  'Real Estate', 'Startups', 'ETFs', 'Energía', 'Tecnología',
  'Salud', 'Macro / Economía',
]

const INVEST_RANGES = [
  { value: 'lt1k',     label: 'Menos de USD 1,000' },
  { value: '1k-10k',  label: 'USD 1,000 – 10,000' },
  { value: '10k-50k', label: 'USD 10,000 – 50,000' },
  { value: '50k-200k',label: 'USD 50,000 – 200,000' },
  { value: 'gt200k',  label: 'Más de USD 200,000' },
]

const STEP_LABELS = ['Tu perfil', 'Inversiones', 'Confirmar']

export default function Onboarding() {
  const navigate = useNavigate()
  const { user, profile, setProfile, setInvestorProfile } = useAuth()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    location: '',
    bio: '',
    invest_range: '',
    interests: [],
  })

  const upd = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))

  function toggleInterest(sector) {
    setForm(p => ({
      ...p,
      interests: p.interests.includes(sector)
        ? p.interests.filter(s => s !== sector)
        : [...p.interests, sector],
    }))
  }

  function handleNext() {
    setError('')
    if (step === 1) {
      if (!form.full_name.trim()) { setError('El nombre completo es requerido.'); return }
      if (!form.location.trim()) { setError('La ubicación es requerida.'); return }
    }
    if (step === 2) {
      if (!form.invest_range) { setError('Seleccioná un rango de inversión.'); return }
      if (form.interests.length === 0) { setError('Seleccioná al menos un sector de interés.'); return }
    }
    setStep(s => s + 1)
  }

  async function handleSubmit() {
    setSaving(true)
    setError('')
    try {
      const { error: insErr } = await supabase.from('investor_profiles').insert({
        id: user.id,
        user_id: user.id,
        full_name: form.full_name.trim(),
        location: form.location.trim(),
        bio: form.bio.trim() || null,
        invest_range: form.invest_range,
        interests: form.interests,
      })
      if (insErr) throw insErr

      const { error: profErr } = await supabase.from('profiles').update({ full_name: form.full_name.trim() }).eq('id', user.id)
      if (profErr) throw profErr
      setProfile(p => ({ ...p, full_name: form.full_name.trim() }))
      setInvestorProfile({ user_id: user.id, ...form })
      navigate('/app', { replace: true })
    } catch (err) {
      setError(err.message || 'Ocurrió un error. Intentá de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  const rangeLabel = INVEST_RANGES.find(r => r.value === form.invest_range)?.label || '—'

  return (
    <div style={{ background: X.bg, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "'Outfit',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .ob-input:focus { border-color: ${X.acc} !important; outline: none; }
        .ob-input::placeholder { color: ${X.t3}; }
        .ob-select { appearance: none; -webkit-appearance: none; }
        .ob-select:focus { border-color: ${X.acc} !important; outline: none; }
        .ob-pill:hover { border-color: ${X.acc}88 !important; }
        .ob-btn:hover:not(:disabled) { opacity: 0.9; }
        .ob-back:hover { border-color: ${X.t3} !important; color: ${X.t1} !important; }
      `}</style>

      <div style={{ width: "100%", maxWidth: 480 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <Link to="/" style={{ textDecoration: "none" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: 7, background: "linear-gradient(135deg,#f59e0b,#f97316)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 17, color: "#000" }}>F</div>
              <span style={{ fontWeight: 800, fontSize: 20, color: X.t1, letterSpacing: "-0.02em" }}>Fin<span style={{ color: X.acc }}>Pulse</span></span>
            </div>
          </Link>
        </div>

        {/* Step indicator */}
        <div style={{ display: "flex", alignItems: "flex-start", marginBottom: 24 }}>
          {STEP_LABELS.map((label, i) => {
            const n = i + 1
            const done = step > n
            const active = step === n
            return (
              <div key={n} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ width: "100%", display: "flex", alignItems: "center" }}>
                  {i > 0 && <div style={{ flex: 1, height: 2, background: step > i ? X.acc : X.brd, transition: "background 0.3s" }} />}
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                    background: done ? X.grn : active ? "linear-gradient(135deg,#f59e0b,#f97316)" : X.bg2,
                    border: `2px solid ${done ? X.grn : active ? X.acc : X.brd}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 700, color: done ? "#fff" : active ? "#000" : X.t3,
                    transition: "all 0.3s",
                  }}>
                    {done ? '✓' : n}
                  </div>
                  {i < 2 && <div style={{ flex: 1, height: 2, background: step > n ? X.acc : X.brd, transition: "background 0.3s" }} />}
                </div>
                <span style={{ fontSize: 10, color: active ? X.acc : X.t3, fontWeight: active ? 600 : 400, marginTop: 5, transition: "color 0.2s" }}>
                  {label}
                </span>
              </div>
            )
          })}
        </div>

        {/* Card */}
        <div style={{ background: X.bg2, border: "1px solid " + X.brd, borderRadius: 18, padding: 28 }}>

          {/* Step 1 */}
          {step === 1 && (
            <>
              <h2 style={{ fontWeight: 800, fontSize: 20, color: X.t1, marginBottom: 4 }}>Completá tu perfil</h2>
              <p style={{ fontSize: 13, color: X.t2, marginBottom: 22 }}>Esto nos ayuda a personalizar tu experiencia.</p>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: X.t2, marginBottom: 5 }}>Nombre completo *</label>
                <input className="ob-input" type="text" value={form.full_name} onChange={upd('full_name')} placeholder="Tu nombre completo"
                  style={{ width: "100%", padding: "11px 13px", borderRadius: 8, border: "1px solid " + X.brd, background: X.inp, color: X.t1, fontSize: 13, fontFamily: "'Outfit',sans-serif", transition: "border-color 0.15s" }} />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: X.t2, marginBottom: 5 }}>Ubicación *</label>
                <input className="ob-input" type="text" value={form.location} onChange={upd('location')} placeholder="Buenos Aires, Argentina"
                  style={{ width: "100%", padding: "11px 13px", borderRadius: 8, border: "1px solid " + X.brd, background: X.inp, color: X.t1, fontSize: 13, fontFamily: "'Outfit',sans-serif", transition: "border-color 0.15s" }} />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: X.t2, marginBottom: 5 }}>
                  Bio <span style={{ color: X.t3, fontWeight: 400 }}>(opcional)</span>
                </label>
                <textarea className="ob-input" value={form.bio} onChange={upd('bio')} placeholder="Contanos sobre vos como inversor..." rows={3}
                  style={{ width: "100%", padding: "11px 13px", borderRadius: 8, border: "1px solid " + X.brd, background: X.inp, color: X.t1, fontSize: 13, fontFamily: "'Outfit',sans-serif", transition: "border-color 0.15s", resize: "vertical" }} />
              </div>
            </>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <>
              <h2 style={{ fontWeight: 800, fontSize: 20, color: X.t1, marginBottom: 4 }}>Tu perfil inversor</h2>
              <p style={{ fontSize: 13, color: X.t2, marginBottom: 22 }}>Personalizamos el contenido según tus preferencias.</p>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: X.t2, marginBottom: 5 }}>Capital de inversión *</label>
                <div style={{ position: "relative" }}>
                  <select className="ob-select" value={form.invest_range} onChange={upd('invest_range')}
                    style={{ width: "100%", padding: "11px 36px 11px 13px", borderRadius: 8, border: "1px solid " + X.brd, background: X.inp, color: form.invest_range ? X.t1 : X.t3, fontSize: 13, fontFamily: "'Outfit',sans-serif", transition: "border-color 0.15s", cursor: "pointer" }}>
                    <option value="" disabled>Seleccioná un rango...</option>
                    {INVEST_RANGES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                  <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: X.t3, pointerEvents: "none", fontSize: 10 }}>▼</span>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: X.t2, marginBottom: 8 }}>
                  Sectores de interés *{' '}
                  <span style={{ color: X.t3, fontWeight: 400 }}>({form.interests.length} seleccionados)</span>
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {SECTORS.map(sector => {
                    const active = form.interests.includes(sector)
                    return (
                      <button key={sector} className="ob-pill" onClick={() => toggleInterest(sector)} type="button"
                        style={{ padding: "7px 14px", borderRadius: 20, border: `1px solid ${active ? X.acc : X.brd}`, background: active ? X.acc + "1a" : "transparent", color: active ? X.acc : X.t2, fontSize: 12, fontWeight: active ? 600 : 400, cursor: "pointer", fontFamily: "'Outfit',sans-serif", transition: "all 0.15s" }}>
                        {sector}
                      </button>
                    )
                  })}
                </div>
              </div>
            </>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <>
              <h2 style={{ fontWeight: 800, fontSize: 20, color: X.t1, marginBottom: 4 }}>¡Todo listo!</h2>
              <p style={{ fontSize: 13, color: X.t2, marginBottom: 22 }}>Revisá tu información antes de continuar.</p>

              <div style={{ background: X.bg, borderRadius: 12, border: "1px solid " + X.brd, padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  ['Nombre', form.full_name],
                  ['Ubicación', form.location],
                  ['Bio', form.bio || '—'],
                  ['Capital de inversión', rangeLabel],
                ].map(([label, value]) => (
                  <div key={label}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: X.t3, marginBottom: 3, letterSpacing: "0.06em" }}>{label.toUpperCase()}</div>
                    <div style={{ fontSize: 13, color: X.t1 }}>{value}</div>
                  </div>
                ))}
                <div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: X.t3, marginBottom: 8, letterSpacing: "0.06em" }}>SECTORES DE INTERÉS</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {form.interests.map(s => (
                      <span key={s} style={{ padding: "4px 10px", borderRadius: 12, background: X.acc + "1a", border: "1px solid " + X.acc + "44", color: X.acc, fontSize: 11, fontWeight: 600 }}>{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Error */}
          {error && (
            <div style={{ background: X.red + "18", border: "1px solid " + X.red + "44", borderRadius: 8, padding: "10px 14px", marginTop: 16, fontSize: 12, color: X.red }}>
              {error}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
            {step > 1 && (
              <button className="ob-back" onClick={() => { setStep(s => s - 1); setError('') }} type="button"
                style={{ flex: 1, padding: "12px", borderRadius: 10, border: "1px solid " + X.brd, background: "transparent", color: X.t2, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit',sans-serif", transition: "all 0.15s" }}>
                ← Atrás
              </button>
            )}
            {step < 3 ? (
              <button className="ob-btn" onClick={handleNext} type="button"
                style={{ flex: step > 1 ? 2 : 1, padding: "12px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#f59e0b,#f97316)", color: "#000", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "'Outfit',sans-serif", transition: "opacity 0.2s" }}>
                Siguiente →
              </button>
            ) : (
              <button className="ob-btn" onClick={handleSubmit} disabled={saving} type="button"
                style={{ flex: 2, padding: "12px", borderRadius: 10, border: "none", background: saving ? X.brd : "linear-gradient(135deg,#f59e0b,#f97316)", color: saving ? X.t3 : "#000", fontSize: 14, fontWeight: 800, cursor: saving ? "not-allowed" : "pointer", fontFamily: "'Outfit',sans-serif", transition: "opacity 0.2s" }}>
                {saving ? 'Guardando...' : 'Ir al dashboard →'}
              </button>
            )}
          </div>
        </div>

        <p style={{ textAlign: "center", fontSize: 11, color: X.t3, marginTop: 14 }}>
          Paso {step} de 3
        </p>
      </div>
    </div>
  )
}
