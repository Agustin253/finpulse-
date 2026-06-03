export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: "Missing url param" });
  }

  res.setHeader("Access-Control-Allow-Origin", "*");

  try {
    const upstream = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; FinPulse/1.0)" }
    });
    if (!upstream.ok) {
      return res.status(upstream.status).send("Upstream fetch failed");
    }
    const xml = await upstream.text();
    res.setHeader("Content-Type", "application/xml");
    res.status(200).send(xml);
  } catch (err) {
    res.status(500).send("Fetch error: " + err.message);
  }
}
