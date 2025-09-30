const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// CORS por allowlist (GitHub Pages + localhost)
app.use(cors({
  origin: (origin, cb) => {
    const allowed = (process.env.ALLOWED_ORIGIN || "http://localhost:5173,https://joseaac49.github.io")
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);
    if (!origin || allowed.includes("*") || allowed.includes(origin)) return cb(null, true);
    return cb(new Error("CORS: origin no permitido"));
  }
}));
app.use(express.json());

/* ================================
   RUTAS API
================================ */

// Health
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "clock-weather-backend" });
});

// Hora (ejemplo)
app.get("/api/time", (_req, res) => {
  const now = new Date();
  res.json({
    iso: now.toISOString(),
    locale: now.toLocaleString("es-AR", { dateStyle: "full", timeStyle: "medium" }),
  });
});

// Clima:
// - Si viene ?lat=&lon= usa esas coords.
// - Si viene ?city= geocodifica con Open-Meteo y luego consulta el clima.
// (sin API key)
app.get("/api/weather", async (req, res) => {
  try {
    let { lat, lon, city } = req.query;

    if ((lat === undefined || lon === undefined) && city) {
      // Geocoding por ciudad (sin key)
      const gUrl = new URL("https://geocoding-api.open-meteo.com/v1/search");
      gUrl.searchParams.set("name", String(city));
      gUrl.searchParams.set("count", "1");
      gUrl.searchParams.set("language", "es");
      const gRes = await fetch(gUrl);
      if (!gRes.ok) throw new Error(`Geocoding ${gRes.status}`);
      const g = await gRes.json();
      if (!g.results?.length) return res.status(404).json({ error: "Ciudad no encontrada" });
      lat = g.results[0].latitude;
      lon = g.results[0].longitude;
    }

    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);
    if (Number.isNaN(latNum) || Number.isNaN(lonNum)) {
      return res.status(400).json({ error: "Parámetros inválidos: usar ?city= o ?lat=&lon=" });
    }

    const wUrl = new URL("https://api.open-meteo.com/v1/forecast");
    wUrl.searchParams.set("latitude", latNum);
    wUrl.searchParams.set("longitude", lonNum);
    wUrl.searchParams.set("current", "temperature_2m,weather_code,wind_speed_10m");
    wUrl.searchParams.set("timezone", "auto");

    const r = await fetch(wUrl);
    if (!r.ok) throw new Error(`Open-Meteo ${r.status}`);
    const data = await r.json();

    res.json({
      timezone: data?.timezone,
      temperature: data?.current?.temperature_2m,
      wind: data?.current?.wind_speed_10m,
      weatherCode: data?.current?.weather_code,
      lat: latNum,
      lon: lonNum,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "No se pudo obtener el clima" });
  }
});

// Health simple para Azure
app.get("/", (_req, res) => res.send("OK"));

/* ================================
   START
================================ */
app.listen(PORT, () => {
  console.log(`API escuchando en :${PORT}`);
});
