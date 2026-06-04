import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../supabase";

/* ═══ DATA ═══ */
const CURRENCIES = [
  { symbol: "EUR/USD", base: 1.0847, name: "Euro / US Dollar" },
  { symbol: "GBP/USD", base: 1.2634, name: "British Pound / USD" },
  { symbol: "USD/JPY", base: 157.42, name: "US Dollar / Yen" },
  { symbol: "USD/ARS", base: 1052.5, name: "US Dollar / Peso AR" },
  { symbol: "USD/BRL", base: 5.67, name: "US Dollar / Real" },
  { symbol: "USD/CLP", base: 948.3, name: "US Dollar / Peso CL" }
];

const INDICES = [
  { symbol: "S&P 500", base: 5432.1, name: "S&P 500 Index" },
  { symbol: "NASDAQ", base: 17123.4, name: "NASDAQ Composite" },
  { symbol: "DOW", base: 39876.5, name: "Dow Jones" },
  { symbol: "MERVAL", base: 1456789, name: "S&P Merval" },
  { symbol: "BOVESPA", base: 128456, name: "Bovespa Index" },
  { symbol: "FTSE 100", base: 8234.5, name: "FTSE 100" }
];

const COMMODITIES = [
  { symbol: "GOLD", base: 2345.6, name: "Gold Spot" },
  { symbol: "SILVER", base: 29.45, name: "Silver Spot" },
  { symbol: "OIL WTI", base: 78.34, name: "Crude Oil WTI" },
  { symbol: "SOYBEAN", base: 1167.5, name: "Soybean Futures" }
];

const CRYPTO_IDS = ["bitcoin", "ethereum", "solana", "cardano", "polkadot", "ripple", "dogecoin", "avalanche-2"];

const CRYPTO_MAP = {
  bitcoin: { symbol: "BTC", name: "Bitcoin" },
  ethereum: { symbol: "ETH", name: "Ethereum" },
  solana: { symbol: "SOL", name: "Solana" },
  cardano: { symbol: "ADA", name: "Cardano" },
  polkadot: { symbol: "DOT", name: "Polkadot" },
  ripple: { symbol: "XRP", name: "Ripple" },
  dogecoin: { symbol: "DOGE", name: "Dogecoin" },
  "avalanche-2": { symbol: "AVAX", name: "Avalanche" }
};

const RSS_SOURCES = [
  { url: "https://www.ambito.com/rss/pages/economia.xml", cat: "Argentina", src: "Ámbito" },
  { url: "https://www.coindesk.com/arc/outboundfeeds/rss/", cat: "Crypto", src: "CoinDesk" },
  { url: "https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/section/economia/portada", cat: "Macro", src: "El País" },
  { url: "https://www.lanacion.com.ar/arc/outboundfeeds/rss/category/economia/", cat: "Mercados", src: "La Nación" },
  { url: "https://www.clarin.com/rss/economia/", cat: "Mercados", src: "Clarín" },
  { url: "https://www.fxstreet.com/rss/news", cat: "FX", src: "FXStreet" },
  { url: "https://techcrunch.com/feed/", cat: "Startups", src: "TechCrunch" },
  { url: "https://venturebeat.com/feed/", cat: "Startups", src: "VentureBeat" },
  { url: "https://www.wired.com/feed/rss", cat: "Startups", src: "Wired" },
  { url: "https://www.realestate.com.au/news/feed/", cat: "Real Estate", src: "RealEstate.com" },
  { url: "https://www.biznews.com/feed", cat: "Real Estate", src: "BizNews" }
];

function relativeTime(ms) {
  const diff = Math.floor((Date.now() - ms) / 60000);
  if (diff < 1) return "ahora";
  if (diff < 60) return diff + " min";
  return Math.floor(diff / 60) + " h";
}

async function fetchNewsFeed() {
  const results = await Promise.all(
    RSS_SOURCES.map(async (source) => {
      try {
        const proxyUrl = "https://api.rss2json.com/v1/api.json?rss_url=" + encodeURIComponent(source.url);
        const res = await fetch(proxyUrl);
        if (!res.ok) return [];
        const json = await res.json();
        if (json.status !== "ok") return [];
        return json.items.map((item) => {
          return {
            cat: source.cat,
            title: item.title || "",
            premium: false,
            src: source.src,
            url: item.link || "",
            pubDate: new Date(item.pubDate).getTime() || 0
          };
        });
      } catch {
        return [];
      }
    })
  );
  return results
    .flat()
    .filter((item) => item.title)
    .sort((a, b) => b.pubDate - a.pubDate)
    .slice(0, 40)
    .map((item, i) => ({ ...item, id: i + 1, time: relativeTime(item.pubDate) }));
}

const INVESTOR_PROFILES = [
  { id: 1, name: "Martín Rodríguez", av: "MR", loc: "Buenos Aires, AR", interests: ["Crypto", "Startups"], bio: "Inversor ángel, 8 años exp. Busco co-inversores para rondas seed.", range: "USD 50K-200K", verified: true, compat: 92 },
  { id: 2, name: "Lucía Fernández", av: "LF", loc: "Montevideo, UY", interests: ["Bonos", "FX"], bio: "Portfolio manager. Diversificación regional.", range: "USD 200K-1M", verified: true, compat: 87 },
  { id: 3, name: "Carlos Méndez", av: "CM", loc: "Santiago, CL", interests: ["Mining", "Energía"], bio: "Empresario minero, proyectos de litio.", range: "USD 500K-5M", verified: true, compat: 78 },
  { id: 4, name: "Ana Beltrán", av: "AB", loc: "CDMX, MX", interests: ["Proptech", "AI"], bio: "CTO startup proptech. Busco inversores Serie A.", range: "USD 1M-10M", verified: false, compat: 85 },
  { id: 5, name: "Diego Morales", av: "DM", loc: "Bogotá, CO", interests: ["Agro", "DeFi"], bio: "Fundador plataforma DeFi agro.", range: "USD 100K-500K", verified: true, compat: 71 }
];

const CHAT_ROOMS = [
  { id: "crypto", name: "Crypto & DeFi", icon: "₿", desc: "Bitcoin, altcoins, DeFi", users: 234, color: "#8b5cf6" },
  { id: "forex", name: "Forex & Divisas", icon: "💱", desc: "Pares de divisas, carry trade", users: 156, color: "#3b82f6" },
  { id: "acciones", name: "Acciones & Bolsa", icon: "📈", desc: "Renta variable, IPOs, earnings", users: 189, color: "#10b981" },
  { id: "commodities", name: "Commodities", icon: "🛢️", desc: "Oro, petróleo, soja, energía", users: 98, color: "#f59e0b" },
  { id: "realestate", name: "Real Estate", icon: "🏗️", desc: "Inmobiliario, REITs", users: 112, color: "#06b6d4" },
  { id: "startups", name: "Startups & VC", icon: "🚀", desc: "Venture capital, rondas", users: 145, color: "#ec4899" },
  { id: "argentina", name: "Mercado Argentino", icon: "🇦🇷", desc: "Merval, bonos, cedears, dólar", users: 321, color: "#6ee7b7" },
  { id: "macro", name: "Macro & Economía", icon: "🌐", desc: "Política monetaria, inflación", users: 167, color: "#a78bfa" }
];


const RECOMMENDATIONS = [
  { id: 1, type: "buy", asset: "YPF (YPFD)", reason: "Sector energético argentino en expansión. Resultados Q1 +23%. Target: +35% a 12 meses.", risk: "Moderado", sector: "Energía", timeframe: "12 meses", potential: "+35%", color: "#10b981" },
  { id: 2, type: "buy", asset: "Ethereum (ETH)", reason: "Staking yield ~4.5%. ETFs spot aprobados. Soporte fuerte en $3,500.", risk: "Alto", sector: "Crypto", timeframe: "6-12 meses", potential: "+45%", color: "#8b5cf6" },
  { id: 3, type: "hold", asset: "Oro (XAU/USD)", reason: "Refugio de valor. Bancos centrales acumulando. Consolidación en $2,300-$2,400.", risk: "Bajo", sector: "Commodities", timeframe: "12 meses", potential: "+12%", color: "#f59e0b" },
  { id: 4, type: "buy", asset: "Bonos GD30", reason: "Riesgo país en descenso. Yield del 15%. Normalización FMI positiva.", risk: "Alto", sector: "Renta Fija", timeframe: "12-24 meses", potential: "+25%", color: "#3b82f6" },
  { id: 5, type: "watch", asset: "Solana (SOL)", reason: "Ecosistema DeFi creciendo. Esperar pullback a $150 para entrada.", risk: "Muy Alto", sector: "Crypto", timeframe: "6 meses", potential: "+60%", color: "#06b6d4" }
];

/* ═══ STYLE CONSTANTS ═══ */
const X = {
  bg: "#080c14", bg2: "#0c1220", bg3: "#111828", bgH: "#151d30",
  brd: "#1a2540", brdH: "#f59e0b", inp: "#0e1525",
  t1: "#e8ecf4", t2: "#8494b2", t3: "#4a5c7a",
  acc: "#f59e0b", acc2: "#d97706", grn: "#10b981", grnB: "rgba(16,185,129,0.12)",
  red: "#ef4444", redB: "rgba(239,68,68,0.12)", blu: "#3b82f6",
  pur: "#8b5cf6", cyn: "#06b6d4", pnk: "#ec4899"
};

/* ═══ MICRO COMPONENTS ═══ */
function Chg({ v, d = 2 }) {
  const pos = v >= 0;
  return (
    <span style={{ color: pos ? X.grn : X.red, fontFamily: "'JetBrains Mono',monospace", fontSize: 11, fontWeight: 500, padding: "2px 6px", borderRadius: 4, background: pos ? X.grnB : X.redB }}>
      {pos ? "▲" : "▼"} {Math.abs(v).toFixed(d)}%
    </span>
  );
}

function Bdg({ children, color = X.acc }) {
  return (
    <span style={{ display: "inline-block", padding: "2px 7px", borderRadius: 4, fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", background: color + "22", color, fontFamily: "'Outfit',sans-serif" }}>
      {children}
    </span>
  );
}

function PillBtn({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{ padding: "5px 12px", borderRadius: 18, border: "1px solid " + (active ? X.acc : X.brd), background: active ? X.acc + "22" : "transparent", color: active ? X.acc : X.t2, fontSize: 11, fontWeight: 500, cursor: "pointer", fontFamily: "'Outfit',sans-serif", transition: "all 0.2s" }}>
      {children}
    </button>
  );
}

function ActionBtn({ children, primary, full, ...props }) {
  return (
    <button
      {...props}
      style={{
        padding: "11px 22px", borderRadius: 10,
        border: primary ? "none" : "1px solid " + X.brd,
        background: primary ? "linear-gradient(135deg," + X.acc + ",#f97316)" : "transparent",
        color: primary ? "#000" : X.t2,
        fontSize: 13, fontWeight: primary ? 700 : 600, cursor: "pointer",
        fontFamily: "'Outfit',sans-serif", width: full ? "100%" : "auto",
        transition: "all 0.2s", ...(props.style || {})
      }}
    >
      {children}
    </button>
  );
}

function MiniChart({ data, color }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const r = max - min || 1;
  const w = 68;
  const h = 22;
  const pts = data.map((v, i) => {
    return ((i / (data.length - 1)) * w) + "," + (h - ((v - min) / r) * h);
  }).join(" ");
  return (
    <svg width={w} height={h}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function MarketRow({ item, price }) {
  const p = price || { current: item.base, change: 0, history: [] };
  const decimals = item.base > 1000 ? 0 : item.base > 10 ? 2 : 4;
  return (
    <div
      style={{ display: "grid", gridTemplateColumns: "1fr auto auto auto", alignItems: "center", gap: 8, padding: "8px 14px", cursor: "pointer", transition: "background 0.15s" }}
      onMouseEnter={(e) => { e.currentTarget.style.background = X.bgH; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
    >
      <div>
        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, fontWeight: 600, color: X.t1 }}>{item.symbol}</div>
        <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 9, color: X.t3 }}>{item.name}</div>
      </div>
      <MiniChart data={p.history} color={p.change >= 0 ? X.grn : X.red} />
      <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: X.t1, textAlign: "right", minWidth: 60 }}>
        {p.current.toFixed(decimals)}
      </div>
      <Chg v={p.change} />
    </div>
  );
}

/* ═══ NOTIFICATION HOOK ═══ */
function useNotifications(prices) {
  const [notifications, setNotifications] = useState([
    { id: 1, type: "opportunity", title: "YPF supera resistencia clave", body: "YPFD rompió los $38.500 con volumen.", time: Date.now() - 120000, read: false },
    { id: 2, type: "alert", title: "BTC superó USD 68.000", body: "Bitcoin nuevo máximo mensual. +5.2% en 24hs.", time: Date.now() - 300000, read: false },
    { id: 3, type: "recommendation", title: "Oportunidad en ETH", body: "Ethereum corrigió a soporte $3,800.", time: Date.now() - 600000, read: false }
  ]);
  const lastAlert = useRef(Date.now());

  useEffect(() => {
    const iv = setInterval(() => {
      if (Date.now() - lastAlert.current < 15000) return;
      const alerts = [
        { type: "alert", title: "Movimiento en USD/ARS", body: "Dólar blue en movimiento. Cotización: $" + Math.round(prices["USD/ARS"]?.current || 1052) },
        { type: "opportunity", title: "Volumen inusual en MERVAL", body: "Índice Merval con volumen 40% superior al promedio." },
        { type: "recommendation", title: "Señal técnica en Oro", body: "XAU/USD formó doble piso en $2,320. Posible long." },
        { type: "alert", title: "Crypto en movimiento", body: "SOL sube " + (Math.random() * 5 + 2).toFixed(1) + "% en la última hora." },
        { type: "opportunity", title: "Bono GD30 en zona de compra", body: "Yield del 15.2%. Riesgo país en descenso." }
      ];
      const a = alerts[Math.floor(Math.random() * alerts.length)];
      setNotifications((p) => [{ id: Date.now(), time: Date.now(), read: false, ...a }, ...p].slice(0, 20));
      lastAlert.current = Date.now();
    }, 18000);
    return () => clearInterval(iv);
  }, [prices]);

  const markRead = (id) => setNotifications((p) => p.map((n) => n.id === id ? { ...n, read: true } : n));
  const markAllRead = () => setNotifications((p) => p.map((n) => ({ ...n, read: true })));
  const unreadCount = notifications.filter((n) => !n.read).length;
  return { notifications, unreadCount, markRead, markAllRead };
}

/* ═══ NOTIFICATION PANEL ═══ */
function NotifPanel({ notifications, onRead, onReadAll }) {
  const icons = { alert: "🔔", opportunity: "💡", recommendation: "📊" };
  const colors = { alert: X.acc, opportunity: X.grn, recommendation: X.blu };
  return (
    <div style={{ position: "absolute", top: "100%", right: 0, marginTop: 8, width: 360, maxHeight: 440, background: X.bg, border: "1px solid " + X.brd, borderRadius: 14, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.6)", zIndex: 200 }}>
      <div style={{ padding: "14px 16px", borderBottom: "1px solid " + X.brd, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 14, color: X.t1 }}>Notificaciones</span>
        <button onClick={onReadAll} style={{ background: "none", border: "none", color: X.acc, fontSize: 11, cursor: "pointer", fontFamily: "'Outfit',sans-serif", fontWeight: 600 }}>Marcar todo leído</button>
      </div>
      <div style={{ overflowY: "auto", maxHeight: 380 }}>
        {notifications.length === 0 && <div style={{ padding: 30, textAlign: "center", color: X.t3, fontSize: 13 }}>Sin notificaciones</div>}
        {notifications.map((n) => (
          <div key={n.id} onClick={() => onRead(n.id)}
            style={{ padding: "12px 16px", borderBottom: "1px solid " + X.brd + "08", cursor: "pointer", background: n.read ? "transparent" : (colors[n.type] || X.acc) + "08", transition: "background 0.15s" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = X.bgH; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = n.read ? "transparent" : (colors[n.type] || X.acc) + "08"; }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 14 }}>{icons[n.type]}</span>
              <span style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 600, fontSize: 12, color: X.t1, flex: 1 }}>{n.title}</span>
              {!n.read && <div style={{ width: 7, height: 7, borderRadius: "50%", background: X.acc }} />}
            </div>
            <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 11, color: X.t2, lineHeight: 1.5, marginLeft: 22 }}>{n.body}</div>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: X.t3, marginLeft: 22, marginTop: 4 }}>
              {Math.floor((Date.now() - n.time) / 60000)} min atrás
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const INVEST_RANGE_LABELS = {
  lt1k: "Menos de USD 1,000",
  "1k-10k": "USD 1,000 – 10,000",
  "10k-50k": "USD 10,000 – 50,000",
  "50k-200k": "USD 50,000 – 200,000",
  gt200k: "Más de USD 200,000",
};

/* ═══ PROFILE PAGE ═══ */
function ProfilePage({ userEmail, trialDaysLeft, isSubscribed }) {
  const { profile, investorProfile } = useAuth();
  const userName = profile?.full_name || userEmail?.split("@")[0] || "";

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <div style={{ background: X.bg2, borderRadius: 16, border: "1px solid " + X.brd, overflow: "hidden", marginBottom: 20 }}>
        <div style={{ height: 100, background: "linear-gradient(135deg," + X.acc + "33," + X.pur + "33," + X.cyn + "22)", position: "relative" }}>
          <div style={{ position: "absolute", bottom: -32, left: 28 }}>
            <div style={{ width: 68, height: 68, borderRadius: "50%", background: "linear-gradient(135deg," + X.acc + "," + X.pur + ")", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 26, color: "#000", border: "3px solid " + X.bg2 }}>
              {(userName || "U").charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
        <div style={{ padding: "40px 28px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
            <div>
              <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: 22, color: X.t1 }}>{userName}</div>
              {investorProfile?.location && (
                <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 12, color: X.t3, marginTop: 2 }}>📍 {investorProfile.location}</div>
              )}
              <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 13, color: X.t2, marginTop: 2 }}>{userEmail}</div>
            </div>
            <Bdg color={X.grn}>★ PRO</Bdg>
          </div>
          {investorProfile?.bio && (
            <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 13, color: X.t2, lineHeight: 1.6, marginTop: 16, paddingTop: 16, borderTop: "1px solid " + X.brd }}>
              {investorProfile.bio}
            </div>
          )}
          {investorProfile?.interests?.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 10, fontWeight: 600, color: X.t3, letterSpacing: "0.06em", marginBottom: 8 }}>SECTORES DE INTERÉS</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {investorProfile.interests.map((s) => (
                  <Bdg key={s} color={X.cyn}>{s}</Bdg>
                ))}
              </div>
            </div>
          )}
          {investorProfile?.invest_range && (
            <div style={{ marginTop: 14, display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 7, background: X.acc + "11", border: "1px solid " + X.acc + "33" }}>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 600, color: X.acc }}>
                💰 {INVEST_RANGE_LABELS[investorProfile.invest_range] || investorProfile.invest_range}
              </span>
            </div>
          )}
          {!investorProfile && (
            <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 12, color: X.t3, marginTop: 16 }}>
              Completá tu perfil inversor para ver tu información aquí.
            </div>
          )}
        </div>
      </div>
      <div style={{ background: X.bg2, borderRadius: 14, border: "1px solid " + X.grn + "33", padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 14, color: X.t1 }}>★ FinPulse Pro</div>
            <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 12, color: isSubscribed ? X.grn : X.acc, marginTop: 2 }}>
              {isSubscribed ? "Suscripción activa" : trialDaysLeft + " días de prueba restantes"}
            </div>
          </div>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 18, fontWeight: 700, color: X.acc }}>
            USD 15<span style={{ fontSize: 11, color: X.t3 }}>/mes</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══ CHAT VIEW ═══ */
function ChatView() {
  const { user, profile } = useAuth();
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEnd = useRef(null);
  const channelRef = useRef(null);

  const username = profile?.full_name || user?.email?.split("@")[0] || "Anonymous";

  useEffect(() => {
    if (!activeRoom) {
      setMessages([]);
      return;
    }

    let channel;

    async function loadAndSubscribe() {
      setLoading(true);
      setMessages([]);

      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("room_id", activeRoom)
        .order("created_at", { ascending: true })
        .limit(50);

      if (data) setMessages(data);
      setLoading(false);

      channel = supabase
        .channel("room:" + activeRoom)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "messages", filter: `room_id=eq.${activeRoom}` },
          (payload) => { setMessages((prev) => [...prev, payload.new]); }
        )
        .subscribe();

      channelRef.current = channel;
    }

    loadAndSubscribe();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [activeRoom]);

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const sendMsg = async () => {
    if (!input.trim() || !activeRoom || !user) return;
    const text = input.trim();
    setInput("");
    await supabase.from("messages").insert({
      room_id: activeRoom,
      user_id: user.id,
      username,
      content: text,
    });
  };

  const activeRoomData = CHAT_ROOMS.find((r) => r.id === activeRoom);

  return (
    <div style={{ display: "grid", gridTemplateColumns: activeRoom ? "260px 1fr" : "1fr", gap: 0, background: X.bg2, borderRadius: 14, border: "1px solid " + X.brd, overflow: "hidden", height: "calc(100vh - 230px)", minHeight: 480 }}>
      <div style={{ borderRight: activeRoom ? "1px solid " + X.brd : "none", overflow: "auto" }}>
        <div style={{ padding: "14px 16px", borderBottom: "1px solid " + X.brd, position: "sticky", top: 0, background: X.bg2, zIndex: 1 }}>
          <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 14, color: X.t1 }}>💬 Salas</div>
        </div>
        <div style={{ display: activeRoom ? "block" : "grid", gridTemplateColumns: activeRoom ? undefined : "repeat(auto-fill,minmax(260px,1fr))", gap: activeRoom ? 0 : 8, padding: activeRoom ? 0 : 10 }}>
          {CHAT_ROOMS.map((room) => (
            <button key={room.id} onClick={() => setActiveRoom(room.id)}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: activeRoom ? "12px 16px" : "14px 16px", border: activeRoom ? "none" : "1px solid " + X.brd, borderRadius: activeRoom ? 0 : 10, borderBottom: activeRoom ? "1px solid " + X.brd + "08" : undefined, background: activeRoom === room.id ? X.bgH : "transparent", cursor: "pointer", width: "100%", textAlign: "left", transition: "all 0.15s" }}
              onMouseEnter={(e) => { if (activeRoom !== room.id) e.currentTarget.style.background = X.bgH; }}
              onMouseLeave={(e) => { if (activeRoom !== room.id) e.currentTarget.style.background = "transparent"; }}>
              <div style={{ fontSize: activeRoom ? 18 : 24, width: activeRoom ? 28 : 38, height: activeRoom ? 28 : 38, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, background: room.color + "18" }}>{room.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 600, fontSize: activeRoom ? 12 : 14, color: X.t1 }}>{room.name}</div>
                <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: activeRoom ? 9 : 10, color: X.t3 }}>{room.desc}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: X.grn }} />
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: X.t3 }}>{room.users}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
      {activeRoom && (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "10px 16px", borderBottom: "1px solid " + X.brd, display: "flex", alignItems: "center", gap: 8, background: X.bg2 }}>
            <button onClick={() => setActiveRoom(null)} style={{ background: "none", border: "none", color: X.t3, fontSize: 16, cursor: "pointer" }}>←</button>
            <span style={{ fontSize: 16 }}>{activeRoomData?.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 13, color: X.t1 }}>{activeRoomData?.name}</div>
              <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 9, color: X.grn }}>{activeRoomData?.users} online</div>
            </div>
          </div>
          <div style={{ flex: 1, overflow: "auto", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
            {loading && <div style={{ textAlign: "center", color: X.t3, fontSize: 12, padding: 20 }}>Cargando mensajes...</div>}
            {!loading && messages.length === 0 && <div style={{ textAlign: "center", color: X.t3, fontSize: 12, padding: 20 }}>Sé el primero en escribir en esta sala.</div>}
            {messages.map((m) => {
              const isMe = m.user_id === user?.id;
              const av = (m.username || "??").substring(0, 2).toUpperCase();
              const timeStr = new Date(m.created_at).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
              return (
                <div key={m.id} style={{ display: "flex", gap: 8, alignItems: "flex-start", flexDirection: isMe ? "row-reverse" : "row" }}>
                  <div style={{ width: 30, height: 30, borderRadius: "50%", background: isMe ? "linear-gradient(135deg," + X.acc + ",#f97316)" : "linear-gradient(135deg," + X.pur + "," + X.cyn + ")", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Outfit',sans-serif", fontSize: 10, fontWeight: 700, color: isMe ? "#000" : "#fff", flexShrink: 0 }}>
                    {av}
                  </div>
                  <div style={{ maxWidth: "70%" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2, flexDirection: isMe ? "row-reverse" : "row" }}>
                      <span style={{ fontFamily: "'Outfit',sans-serif", fontSize: 10, fontWeight: 600, color: isMe ? X.acc : X.t2 }}>{m.username}</span>
                      <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, color: X.t3 }}>{timeStr}</span>
                    </div>
                    <div style={{ padding: "8px 12px", borderRadius: 10, background: isMe ? X.acc + "22" : X.bg3, fontFamily: "'Outfit',sans-serif", fontSize: 12, color: X.t1, lineHeight: 1.5, borderTopRightRadius: isMe ? 3 : 10, borderTopLeftRadius: isMe ? 10 : 3 }}>{m.content}</div>
                  </div>
                </div>
              );
            })}
            <div ref={chatEnd} />
          </div>
          <div style={{ padding: "10px 14px", borderTop: "1px solid " + X.brd, display: "flex", gap: 8 }}>
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") sendMsg(); }} placeholder="Escribí tu mensaje..."
              style={{ flex: 1, padding: "9px 12px", borderRadius: 8, border: "1px solid " + X.brd, background: X.inp, color: X.t1, fontSize: 12, fontFamily: "'Outfit',sans-serif", outline: "none" }}
              onFocus={(e) => { e.target.style.borderColor = X.acc; }} onBlur={(e) => { e.target.style.borderColor = X.brd; }} />
            <ActionBtn primary onClick={sendMsg} style={{ padding: "9px 16px", fontSize: 12 }}>Enviar</ActionBtn>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══ RECOMMENDATIONS ═══ */
function RecommendationsPanel() {
  const typeLabels = { buy: "🟢 COMPRAR", hold: "🟡 MANTENER", watch: "👁️ OBSERVAR" };
  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: 18, color: X.t1 }}>📊 Inversiones Recomendadas</div>
          <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 11, color: X.t3, marginTop: 2 }}>Análisis FinPulse Research · Actualizado hoy</div>
        </div>
        <Bdg color={X.acc}>★ PRO</Bdg>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 12 }}>
        {RECOMMENDATIONS.map((r) => (
          <div key={r.id}
            style={{ background: X.bg2, borderRadius: 14, border: "1px solid " + X.brd, padding: 18, transition: "all 0.2s", cursor: "pointer" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = r.color; e.currentTarget.style.background = X.bgH; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = X.brd; e.currentTarget.style.background = X.bg2; }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <Bdg color={r.color}>{typeLabels[r.type]}</Bdg>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 16, fontWeight: 700, color: r.color }}>{r.potential}</span>
            </div>
            <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 16, color: X.t1, marginBottom: 6 }}>{r.asset}</div>
            <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 12, color: X.t2, lineHeight: 1.6, marginBottom: 12 }}>{r.reason}</div>
            <div style={{ display: "flex", gap: 12, fontFamily: "'Outfit',sans-serif", fontSize: 10, color: X.t3 }}>
              <span>⏱ {r.timeframe}</span><span>⚡ {r.risk}</span><span>📁 {r.sector}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══ FINMATCH VIEW ═══ */
function calcCompat(userInterests, investorInterests) {
  const uInterests = userInterests || [];
  const iInterests = investorInterests || [];
  if (!uInterests.length || !iInterests.length) {
    return 50 + (iInterests.length * 11 % 42);
  }
  const shared = uInterests.filter((i) => iInterests.includes(i)).length;
  const total = new Set([...uInterests, ...iInterests]).size;
  return Math.round((shared / total) * 100);
}

function FinMatchView() {
  const { user, profile } = useAuth();
  const [investorProfiles, setInvestorProfiles] = useState([]);
  const [dbMatches, setDbMatches] = useState([]);
  const [curInv, setCurInv] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function load() {
      setLoading(true);

      let { data: profiles } = await supabase.from("investor_profiles").select("*");

      if (!profiles || profiles.length === 0) {
        const seedData = INVESTOR_PROFILES.map(({ compat, id, ...p }) => p);
        const { data: seeded } = await supabase.from("investor_profiles").insert(seedData).select();
        profiles = seeded || [];
      }

      const { data: matchRows } = await supabase
        .from("matches")
        .select("matched_user_id")
        .eq("user_id", user.id);

      const matchedIds = new Set((matchRows || []).map((m) => m.matched_user_id));
      const userInterests = profile?.interests || [];
      const all = profiles || [];

      setInvestorProfiles(
        all
          .filter((p) => !matchedIds.has(p.id))
          .map((p) => ({ ...p, compat: calcCompat(userInterests, p.interests) }))
      );
      setDbMatches(
        all
          .filter((p) => matchedIds.has(p.id))
          .map((p) => ({ ...p, compat: calcCompat(userInterests, p.interests) }))
      );
      setCurInv(0);
      setLoading(false);
    }
    load();
  }, [user, profile]);

  const handleConnect = async (p) => {
    if (!user) return;
    await supabase.from("matches").insert({ user_id: user.id, matched_user_id: p.id });
    setDbMatches((prev) => [...prev, p]);
    setCurInv((c) => c + 1);
  };

  const currentProfile = investorProfiles[curInv];

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 0", gap: 14 }}>
        <div style={{ width: 30, height: 30, border: "2px solid " + X.brd, borderTopColor: X.acc, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <span style={{ fontFamily: "'Outfit',sans-serif", fontSize: 12, color: X.t3 }}>Cargando perfiles...</span>
      </div>
    );
  }

  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <h1 style={{ fontWeight: 800, fontSize: 24, marginBottom: 4 }}>Fin<span style={{ color: X.acc }}>Match</span></h1>
        <p style={{ color: X.t2, fontSize: 12 }}>Conectá con inversores afines</p>
      </div>
      {currentProfile ? (
        <div style={{ background: X.bg2, borderRadius: 14, border: "1px solid " + X.brd, padding: 22, maxWidth: 360, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg," + X.acc + "," + X.pur + ")", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 16, color: "#000" }}>
              {currentProfile.av || (currentProfile.name || "?").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ fontWeight: 700, fontSize: 16 }}>{currentProfile.name}</span>
                {currentProfile.verified && <span style={{ fontSize: 12, color: X.grn }}>✓</span>}
              </div>
              <div style={{ fontSize: 11, color: X.t2 }}>{currentProfile.loc}</div>
            </div>
            <div style={{ marginLeft: "auto", fontFamily: "'JetBrains Mono',monospace", fontSize: 18, fontWeight: 700, color: currentProfile.compat >= 85 ? X.grn : X.acc }}>{currentProfile.compat}%</div>
          </div>
          <div style={{ fontSize: 12, color: X.t2, lineHeight: 1.6, marginBottom: 12 }}>{currentProfile.bio}</div>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 8 }}>
            {(currentProfile.interests || []).map((interest) => <Bdg key={interest} color={X.cyn}>{interest}</Bdg>)}
          </div>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: X.acc, marginBottom: 16, padding: "6px 8px", background: X.acc + "11", borderRadius: 6 }}>💰 {currentProfile.range}</div>
          <div style={{ display: "flex", gap: 8 }}>
            <ActionBtn onClick={() => setCurInv((c) => c + 1)} style={{ flex: 1 }}>✕ Pasar</ActionBtn>
            <ActionBtn primary onClick={() => handleConnect(currentProfile)} style={{ flex: 1 }}>★ Conectar</ActionBtn>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: 30, color: X.t2 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>✨</div>
          <p>Revisaste todos los perfiles.</p>
          <ActionBtn onClick={() => setCurInv(0)} style={{ marginTop: 12 }}>Volver a ver</ActionBtn>
        </div>
      )}
      {dbMatches.length > 0 && (
        <div style={{ marginTop: 30, maxWidth: 560, margin: "30px auto 0" }}>
          <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}><span style={{ color: X.grn }}>★</span> Matches ({dbMatches.length})</h3>
          {dbMatches.map((m) => (
            <div key={m.id} style={{ background: X.bg2, borderRadius: 10, border: "1px solid " + X.grn + "33", padding: 12, display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg," + X.grn + "," + X.cyn + ")", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, color: "#000" }}>
                {m.av || (m.name || "?").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 12 }}>{m.name}</div><div style={{ fontSize: 9, color: X.t3 }}>{m.loc}</div></div>
              <ActionBtn style={{ padding: "4px 10px", fontSize: 10 }}>💬 Chat</ActionBtn>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══ PAYMENT MODAL ═══ */
function PaymentModal({ onClose, onSuccess }) {
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);

  const processPayment = () => {
    setProcessing(true);
    setTimeout(() => { setProcessing(false); setDone(true); setTimeout(onSuccess, 1500); }, 2500);
  };

  if (done) {
    return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
        <div style={{ background: X.bg, border: "1px solid " + X.grn + "44", borderRadius: 20, padding: 44, textAlign: "center", maxWidth: 380 }}>
          <div style={{ width: 60, height: 60, borderRadius: "50%", background: X.grn + "22", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 30 }}>✓</div>
          <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: 22, color: X.t1, marginBottom: 6 }}>¡Pago exitoso!</div>
          <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 13, color: X.t2 }}>Tu suscripción Pro está activa</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 14 }} onClick={onClose}>
      <div style={{ background: X.bg, border: "1px solid " + X.brd, borderRadius: 18, maxWidth: 420, width: "100%", padding: 28 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: 20, color: X.t1 }}>Suscripción Pro</div>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: X.acc, marginTop: 3 }}>USD 15/mes</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: X.t3, fontSize: 20, cursor: "pointer" }}>✕</button>
        </div>
        <ActionBtn primary full onClick={processPayment} style={{ padding: "13px 22px" }}>{processing ? "Procesando..." : "💳 Pagar USD 15/mes"}</ActionBtn>
        <div style={{ marginTop: 10, textAlign: "center", fontSize: 10, color: X.t3 }}>🔒 Pago seguro · SSL 256-bit</div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════ */
/* ═══ DASHBOARD ═══ */
/* ═══════════════════════════════════════════════════════════════════════ */
export default function Dashboard() {
  const navigate = useNavigate();
  const { user, profile, signOut, trialDaysLeft } = useAuth();

  const userName = profile?.full_name || user?.email?.split('@')[0] || '';
  const daysLeft = trialDaysLeft();
  const isSubscribed = profile?.is_subscribed || false;

  const [view, setView] = useState("dashboard");
  const [prices, setPrices] = useState({});
  const [cryptoPrices, setCryptoPrices] = useState({});
  const [cryptoLoading, setCryptoLoading] = useState(true);
  const [newsFeed, setNewsFeed] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [feedFilter, setFeedFilter] = useState("Todos");
  const [showPay, setShowPay] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [showTerm, setShowTerm] = useState(false);
  const [termIn, setTermIn] = useState("");
  const [termH, setTermH] = useState([
    { type: "sys", text: "FinPulse Terminal v3.0" },
    { type: "sys", text: "HELP | QUOTE <TICKER> | CRYPTO | NEWS | CLEAR" }
  ]);
  const termRef = useRef(null);

  const { notifications, unreadCount, markRead, markAllRead } = useNotifications(prices);

  const fetchCrypto = useCallback(async () => {
    try {
      setCryptoLoading(true);
      const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=" + CRYPTO_IDS.join(",") + "&vs_currencies=usd&include_24hr_change=true");
      if (res.ok) { const data = await res.json(); setCryptoPrices(data); }
    } catch (e) {
      const fb = {};
      CRYPTO_IDS.forEach((id) => {
        const bases = { bitcoin: 68420, ethereum: 3845, solana: 172, cardano: 0.46, polkadot: 7.2, ripple: 0.52, dogecoin: 0.12, "avalanche-2": 38 };
        fb[id] = { usd: (bases[id] || 100) * (0.98 + Math.random() * 0.04), usd_24h_change: (Math.random() - 0.5) * 8 };
      });
      setCryptoPrices(fb);
    } finally { setCryptoLoading(false); }
  }, []);

  useEffect(() => { fetchCrypto(); const iv = setInterval(fetchCrypto, 60000); return () => clearInterval(iv); }, [fetchCrypto]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setNewsLoading(true);
      const items = await fetchNewsFeed();
      if (!cancelled) { setNewsFeed(items); setNewsLoading(false); }
    };
    load();
    const iv = setInterval(load, 300000);
    return () => { cancelled = true; clearInterval(iv); };
  }, []);

  useEffect(() => {
    const all = [...CURRENCIES, ...INDICES, ...COMMODITIES];
    const gen = (b) => b + ((Math.random() - 0.5) * 2 * b * 0.0003);
    const update = () => {
      setPrices((prev) => {
        const next = {};
        all.forEach((item) => {
          const prevP = prev[item.symbol]?.current || item.base;
          const newP = gen(prevP);
          const ch = ((newP - item.base) / item.base) * 100;
          const history = [...(prev[item.symbol]?.history || []).slice(-19), newP];
          next[item.symbol] = { current: newP, change: ch, history };
        });
        return next;
      });
    };
    update(); const iv = setInterval(update, 2000); return () => clearInterval(iv);
  }, []);

  useEffect(() => { if (termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight; }, [termH]);

  const termCmd = (cmd) => {
    const u = cmd.toUpperCase().trim(); let r;
    if (u === "HELP") r = "QUOTE <TICKER> — Cotización\nNEWS — Noticias\nCRYPTO — Crypto live\nCLEAR — Limpiar";
    else if (u === "CRYPTO") {
      const lines = Object.entries(cryptoPrices).map(([id, d]) => { const m = CRYPTO_MAP[id]; if (!m) return ""; return m.symbol + "  $" + (d.usd || 0).toLocaleString(undefined, { maximumFractionDigits: 2 }) + "  " + ((d.usd_24h_change || 0) >= 0 ? "+" : "") + (d.usd_24h_change || 0).toFixed(2) + "%"; }).filter(Boolean);
      r = "[CoinGecko API]\n" + lines.join("\n");
    } else if (u === "NEWS") r = newsFeed.slice(0, 5).map((n) => "[" + n.cat + "] " + n.title).join("\n") || "Sin noticias cargadas aún.";
    else if (u === "CLEAR") { setTermH([{ type: "sys", text: "Terminal limpiada." }]); return; }
    else if (u.startsWith("QUOTE")) {
      const tk = u.replace("QUOTE", "").trim();
      const all = [...CURRENCIES, ...INDICES, ...COMMODITIES];
      const found = all.find((i) => i.symbol.includes(tk));
      if (found) { const p = prices[found.symbol]; r = found.name + "\n  " + (p?.current.toFixed(found.base > 1000 ? 0 : 4) || "N/A") + " (" + (p?.change || 0).toFixed(3) + "%)"; }
      else r = '"' + tk + '" no encontrado';
    } else r = 'Desconocido: "' + cmd + '". Escribí HELP.';
    setTermH((p) => [...p, { type: "usr", text: cmd }, { type: "res", text: r }]);
  };

  const handlePaySuccess = async () => {
    setShowPay(false);
  };

  const filteredNews = feedFilter === "Todos" ? newsFeed : newsFeed.filter((n) => n.cat === feedFilter);

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "◈" },
    { id: "feed", label: "Feed", icon: "◉" },
    { id: "finmatch", label: "FinMatch", icon: "⬡" },
    { id: "chat", label: "Chat", icon: "💬" },
    { id: "profile", label: "Mi Perfil", icon: "👤" }
  ];

  const quickStats = [
    { l: "S&P 500", s: "S&P 500", i: "📊", tp: "sim" },
    { l: "Merval", s: "MERVAL", i: "🇦🇷", tp: "sim" },
    { l: "USD/ARS", s: "USD/ARS", i: "💵", tp: "sim" },
    { l: "EUR/USD", s: "EUR/USD", i: "💱", tp: "sim" },
    { l: "Oro", s: "GOLD", i: "🥇", tp: "sim" },
    { l: "Bitcoin", s: "bitcoin", i: "₿", tp: "c" }
  ];

  const tickerItems = CURRENCIES.slice(0, 4);
  const cryptoTickerItems = Object.entries(cryptoPrices).slice(0, 4);

  return (
    <div style={{ background: X.bg, minHeight: "100vh", color: X.t1, fontFamily: "'Outfit',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px } ::-webkit-scrollbar-track { background: #080c14 } ::-webkit-scrollbar-thumb { background: #1a2540; border-radius: 2px }
        input::placeholder, textarea::placeholder { color: #4a5c7a } select { color-scheme: dark }
        @keyframes tk { 0% { transform: translateX(0) } 100% { transform: translateX(-50%) } }
        @keyframes pls { 0%,100% { opacity: 1 } 50% { opacity: .3 } }
        @keyframes spin { to { transform: rotate(360deg) } }
        @media (max-width: 767px) {
          .fp-nav-btn { font-size: 9px !important; padding: 4px 7px !important; }
          .fp-header-actions { flex-direction: column !important; align-items: flex-end !important; }
          .fp-terminal-btn { display: none !important; }
          .fp-terminal { display: none !important; }
        }
      `}</style>

      {/* Ticker */}
      <div style={{ background: "#060a10", borderBottom: "1px solid " + X.brd, overflow: "hidden", height: 32, display: "flex", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 24, animation: "tk 50s linear infinite", whiteSpace: "nowrap", paddingLeft: 14 }}>
          {[0, 1].map((rep) => (
            <div key={rep} style={{ display: "flex", gap: 24 }}>
              {tickerItems.map((item, i) => { const p = prices[item.symbol] || { current: item.base, change: 0 }; return (<span key={"s" + rep + i} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: "'JetBrains Mono',monospace", fontSize: 10 }}><span style={{ color: X.t3, fontWeight: 600 }}>{item.symbol}</span><span style={{ color: X.t1 }}>{p.current.toFixed(4)}</span><Chg v={p.change} /></span>); })}
              {cryptoTickerItems.map(([id, d], i) => { const m = CRYPTO_MAP[id]; if (!m) return null; return (<span key={"c" + rep + i} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: "'JetBrains Mono',monospace", fontSize: 10 }}><span style={{ color: X.t3, fontWeight: 600 }}>{m.symbol}</span><span style={{ color: X.t1 }}>${(d.usd || 0).toLocaleString(undefined, { maximumFractionDigits: d.usd > 100 ? 0 : 2 })}</span><Chg v={d.usd_24h_change || 0} /></span>); })}
            </div>
          ))}
        </div>
      </div>

      {/* Header */}
      <header style={{ padding: "12px 18px", borderBottom: "1px solid " + X.brd, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: X.bg, zIndex: 100, flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }} onClick={() => setView("dashboard")}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: "linear-gradient(135deg," + X.acc + ",#f97316)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 15, color: "#000" }}>F</div>
            <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: "-0.02em" }}>Fin<span style={{ color: X.acc }}>Pulse</span></span>
          </div>
          <nav style={{ display: "flex", gap: 2 }}>
            {navItems.map((it) => (
              <button key={it.id} onClick={() => setView(it.id)} className="fp-nav-btn" style={{ padding: "6px 12px", borderRadius: 7, border: "none", background: view === it.id ? X.acc + "22" : "transparent", color: view === it.id ? X.acc : X.t2, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit',sans-serif", display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: 12 }}>{it.icon}</span>{it.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="fp-header-actions" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={() => setShowTerm(!showTerm)} className="fp-terminal-btn" style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid " + X.brd, background: showTerm ? X.grn + "22" : "transparent", color: showTerm ? X.grn : X.t2, fontSize: 10, fontWeight: 600, cursor: "pointer", fontFamily: "'JetBrains Mono',monospace" }}>▸ Terminal</button>

          {/* Trial badge */}
          {!isSubscribed && (
            <div onClick={() => setShowPay(true)} style={{ padding: "5px 10px", borderRadius: 6, background: X.acc + "15", border: "1px solid " + X.acc + "33", cursor: "pointer" }}>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: X.acc, fontWeight: 600 }}>{daysLeft}d trial</span>
            </div>
          )}

          {/* Notifications */}
          <div style={{ position: "relative" }}>
            <button onClick={() => setShowNotif(!showNotif)} style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid " + X.brd, background: showNotif ? X.acc + "22" : "transparent", color: showNotif ? X.acc : X.t2, fontSize: 14, cursor: "pointer", position: "relative" }}>
              🔔
              {unreadCount > 0 && <div style={{ position: "absolute", top: -4, right: -4, width: 16, height: 16, borderRadius: "50%", background: X.red, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'JetBrains Mono',monospace", fontSize: 8, fontWeight: 700, color: "#fff" }}>{unreadCount}</div>}
            </button>
            {showNotif && <NotifPanel notifications={notifications} onRead={markRead} onReadAll={markAllRead} />}
          </div>

          {/* User avatar + sign out */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 11px", borderRadius: 7, background: X.grn + "15", border: "1px solid " + X.grn + "33", cursor: "pointer" }} onClick={() => setView("profile")}>
            <div style={{ width: 24, height: 24, borderRadius: "50%", background: "linear-gradient(135deg," + X.acc + "," + X.pur + ")", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#000" }}>{userName.charAt(0).toUpperCase()}</div>
            <div><div style={{ fontSize: 11, fontWeight: 600 }}>{userName.split(" ")[0]}</div><div style={{ fontSize: 8, color: X.grn }}>★ {isSubscribed ? "PRO" : "TRIAL"}</div></div>
          </div>

          <button onClick={signOut} style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid " + X.brd, background: "transparent", color: X.t3, fontSize: 10, cursor: "pointer", fontFamily: "'Outfit',sans-serif", fontWeight: 600 }}>
            Salir
          </button>
        </div>
      </header>

      {/* Terminal */}
      {showTerm && (
        <div className="fp-terminal" style={{ background: "#000", borderBottom: "1px solid " + X.grn + "33", padding: "8px 18px", maxHeight: 200 }}>
          <div ref={termRef} style={{ height: 150, overflowY: "auto", fontFamily: "'JetBrains Mono',monospace", fontSize: 11 }}>
            {termH.map((entry, i) => (
              <div key={i} style={{ color: entry.type === "sys" ? X.grn : entry.type === "usr" ? X.acc : X.t1, marginBottom: 2, whiteSpace: "pre-wrap" }}>
                {entry.type === "usr" ? "▸ " + entry.text : entry.type === "sys" ? "[SYS] " + entry.text : entry.text}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ color: X.grn, fontFamily: "'JetBrains Mono',monospace", fontSize: 11 }}>▸</span>
            <input value={termIn} onChange={(e) => setTermIn(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && termIn.trim()) { termCmd(termIn); setTermIn(""); } }} placeholder="Comando..."
              style={{ flex: 1, background: "transparent", border: "none", color: X.grn, fontFamily: "'JetBrains Mono',monospace", fontSize: 11, outline: "none" }} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <main style={{ padding: 18, maxWidth: 1400, margin: "0 auto" }}>

        {/* DASHBOARD */}
        {view === "dashboard" && (
          <div>
            <div style={{ marginBottom: 18 }}>
              <h1 style={{ fontWeight: 800, fontSize: 24, letterSpacing: "-0.02em", marginBottom: 3 }}>
                Hola, {userName.split(" ")[0]}
              </h1>
              <p style={{ color: X.t2, fontSize: 12 }}>
                {new Date().toLocaleDateString("es-AR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })} · Crypto: CoinGecko API · Forex/Índices: c/2s
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 10, marginBottom: 18 }}>
              {quickStats.map((st) => {
                let price = 0, change = 0;
                if (st.tp === "c") { const d = cryptoPrices[st.s]; price = d?.usd || 0; change = d?.usd_24h_change || 0; }
                else { const allItems = [...CURRENCIES, ...INDICES, ...COMMODITIES]; const item = allItems.find((x) => x.symbol === st.s); const p = prices[st.s] || { current: item?.base || 0, change: 0 }; price = p.current; change = p.change; }
                const decimals = price > 1000 ? 0 : price > 10 ? 2 : 4;
                return (
                  <div key={st.s} style={{ background: X.bg2, borderRadius: 10, border: "1px solid " + X.brd, padding: "12px 14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                      <span style={{ fontSize: 10, color: X.t2, fontWeight: 600 }}>{st.i} {st.l}</span>
                      <Chg v={change} />
                    </div>
                    <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 18, fontWeight: 700 }}>
                      {st.tp === "c" ? "$" : ""}{price ? price.toLocaleString(undefined, { maximumFractionDigits: decimals }) : "..."}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 12, marginBottom: 14 }}>
              <div style={{ background: X.bg2, borderRadius: 10, border: "1px solid " + X.brd, overflow: "hidden" }}>
                <div style={{ padding: "10px 14px", borderBottom: "1px solid " + X.brd, display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 13 }}>💱</span><span style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 12, color: X.t1 }}>Divisas (Forex)</span>
                </div>
                {CURRENCIES.map((item) => <MarketRow key={item.symbol} item={item} price={prices[item.symbol]} />)}
              </div>
              <div style={{ background: X.bg2, borderRadius: 10, border: "1px solid " + X.brd, overflow: "hidden" }}>
                <div style={{ padding: "10px 14px", borderBottom: "1px solid " + X.brd, display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 13 }}>📈</span><span style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 12, color: X.t1 }}>Índices Bursátiles</span>
                </div>
                {INDICES.map((item) => <MarketRow key={item.symbol} item={item} price={prices[item.symbol]} />)}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 12 }}>
              <div style={{ background: X.bg2, borderRadius: 10, border: "1px solid " + X.brd, overflow: "hidden" }}>
                <div style={{ padding: "10px 14px", borderBottom: "1px solid " + X.brd, display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 13 }}>🛢️</span><span style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 12, color: X.t1 }}>Commodities</span>
                </div>
                {COMMODITIES.map((item) => <MarketRow key={item.symbol} item={item} price={prices[item.symbol]} />)}
              </div>
              <div style={{ background: X.bg2, borderRadius: 10, border: "1px solid " + X.brd, overflow: "hidden" }}>
                <div style={{ padding: "10px 14px", borderBottom: "1px solid " + X.brd, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ fontSize: 13 }}>₿</span><span style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 12, color: X.t1 }}>Crypto</span></div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <div style={{ width: 5, height: 5, borderRadius: "50%", background: cryptoLoading ? X.acc : X.grn, animation: cryptoLoading ? "pls 1s infinite" : "none" }} />
                    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: X.t3 }}>CoinGecko</span>
                  </div>
                </div>
                {Object.entries(cryptoPrices).map(([id, d]) => {
                  const m = CRYPTO_MAP[id]; if (!m) return null;
                  return (
                    <div key={id} style={{ display: "grid", gridTemplateColumns: "1fr auto auto", alignItems: "center", gap: 8, padding: "8px 14px", cursor: "pointer" }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = X.bgH; }} onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
                      <div><div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, fontWeight: 600, color: X.t1 }}>{m.symbol}</div><div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 9, color: X.t3 }}>{m.name}</div></div>
                      <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: X.t1, textAlign: "right" }}>${(d.usd || 0).toLocaleString(undefined, { maximumFractionDigits: d.usd > 100 ? 0 : 2 })}</div>
                      <Chg v={d.usd_24h_change || 0} />
                    </div>
                  );
                })}
              </div>
            </div>
            <RecommendationsPanel />
          </div>
        )}

        {/* FEED */}
        {view === "feed" && (
          <div>
            <div style={{ marginBottom: 18 }}>
              <h1 style={{ fontWeight: 800, fontSize: 24, marginBottom: 8 }}>Tu Feed</h1>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                {["Todos", "Mercados", "Crypto", "Argentina", "Análisis", "Commodities", "FX", "Oportunidades", "Macro", "Real Estate", "Startups"].map((c) => (
                  <PillBtn key={c} active={feedFilter === c} onClick={() => setFeedFilter(c)}>{c}</PillBtn>
                ))}
              </div>
            </div>
            {newsLoading ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 0", gap: 14 }}>
                <div style={{ width: 30, height: 30, border: "2px solid " + X.brd, borderTopColor: X.acc, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                <span style={{ fontFamily: "'Outfit',sans-serif", fontSize: 12, color: X.t3 }}>Cargando noticias...</span>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 10 }}>
                {filteredNews.length === 0 ? (
                  <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 13, color: X.t3, padding: "40px 0" }}>No hay noticias en esta categoría.</div>
                ) : filteredNews.map((item) => {
                  const catColors = { Mercados: X.blu, Crypto: X.pur, Argentina: X.cyn, Análisis: X.acc, Commodities: X.grn, FX: X.acc, Oportunidades: X.grn, Macro: X.blu, "Real Estate": X.cyn, Startups: X.pur };
                  return (
                    <a key={item.id} href={item.url || "#"} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", display: "block" }}>
                      <div style={{ background: X.bg2, borderRadius: 10, border: "1px solid " + X.brd, padding: 14, position: "relative", overflow: "hidden", cursor: "pointer", transition: "all 0.2s" }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = X.brdH; e.currentTarget.style.background = X.bgH; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = X.brd; e.currentTarget.style.background = X.bg2; }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 7 }}>
                          <Bdg color={catColors[item.cat] || X.acc}>{item.cat}</Bdg>
                          {item.premium && <Bdg color={X.acc}>★ PRO</Bdg>}
                          <span style={{ marginLeft: "auto", fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: X.t3 }}>Hace {item.time}</span>
                        </div>
                        <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 13, fontWeight: 600, color: X.t1, lineHeight: 1.4 }}>{item.title}</div>
                        <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 9, color: X.t3, marginTop: 6 }}>Fuente: {item.src}</div>
                      </div>
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* FINMATCH */}
        {view === "finmatch" && <FinMatchView />}

        {/* CHAT */}
        {view === "chat" && <ChatView />}

        {/* PROFILE */}
        {view === "profile" && (
          <ProfilePage
            userEmail={user?.email}
            trialDaysLeft={daysLeft}
            isSubscribed={isSubscribed}
          />
        )}
      </main>

      {showPay && <PaymentModal onClose={() => setShowPay(false)} onSuccess={handlePaySuccess} />}

      <footer style={{ borderTop: "1px solid " + X.brd, padding: "14px 18px", marginTop: 28, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontWeight: 800, fontSize: 12 }}>Fin<span style={{ color: X.acc }}>Pulse</span></span>
          <span style={{ fontSize: 9, color: X.t3 }}>© 2026</span>
        </div>
        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: X.t3 }}>Crypto: CoinGecko API · Forex/Índices: Simulados</div>
      </footer>
    </div>
  );
}
