// server/index.js
const express = require("express");
const cors = require("cors");
const path = require("path");
// Si tu Node es < 18, descomentá la línea de abajo y quitá el fetch global:
// const { fetch } = require("undici");

const app = express();

/* ================================
   CORS
   - Si definís ALLOWED_ORIGIN="http://localhost:5173,https://joseaac49.github.io"
     entonces solo permite esos orígenes. Si no está, deja CORS abierto.
================================ */
const allowed = process.env.ALLOWED_ORIGIN
  ? process.env.ALLOWED_ORIGIN.split(",").map(s => s.trim())
  : null;

app.use(
  cors(
    allowed
      ? {
          origin: function (origin, cb) {
            // requests sin origin (curl/health) se aceptan
            if (!origin) return cb(null, true);
            cb(null, allowed.includes(origin));
          },
          credentials: false,
        }
      : undefined
  )
);

app.use(express.json());

/* ================================
   UTILS
================================ */
async function geocodeCity(q) {
  const url =
    `https://geocoding-api.open-meteo.com/v1/search?` +
    `name=${encodeURIComponent(q)}&count=7&language=es&format=json`;

  const r = await fetch(url);
  if (!r.ok) throw new Error(`Geocoding ${r.status}`);
  const j = await r.json();

  const results = (j.results || []).map((it) => ({
    name: it.name,
    admin1: it.admin1,
    country: it.country,
    lat: it.latitude,
    lon: it.longitude,
    label: [it.name, it.admin1, it.country].filter(Boolean).join(", "),
  }));

  return results;
}

/* ================================
   RUTAS API
================================ */

// Ping
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "clock-weather-backend" });
});

// Hora (ejemplo)
app.get("/api/time", (_req, res) => {
  const now = new Date();
  res.json({
    iso: now.toISOString(),
    locale: now.toLocaleString("es-AR", {
      dateStyle: "full",
      timeStyle: "medium",
    }),
  });
});

// Autocomplete de ciudades (para el front)
app.get("/api/geocode", async (req, res) => {
  try {
    const q = String(req.query.q || "").trim();
    if (!q) return res.status(400).json({ error: "Falta parámetro q" });

    const results = await geocodeCity(q);
    res.json({ results });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "No se pudo geocodificar" });
  }
});

// Clima (acepta city O lat/lon)
app.get("/api/weather", async (req, res) => {
  try {
    let lat = req.query.lat ? parseFloat(req.query.lat) : null;
    let lon = req.query.lon ? parseFloat(req.query.lon) : null;

    // Si vino city, geocodificamos y usamos el primer resultado
    const city = req.query.city ? String(req.query.city).trim() : "";
    if ((!lat || !lon) && city) {
      const results = await geocodeCity(city);
      if (!results.length)
        return res.status(404).json({ error: "No se encontró la ciudad" });
      lat = results[0].lat;
      lon = results[0].lon;
    }

    if (Number.isNaN(lat) || Number.isNaN(lon) || lat === null || lon === null) {
      return res
        .status(400)
        .json({ error: "Parámetros inválidos: usar ?city= o ?lat=&lon=" });
    }

    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&current=temperature_2m,weather_code,wind_speed_10m&timezone=auto`;

    const r = await fetch(url);
    if (!r.ok) throw new Error(`Open-Meteo ${r.status}`);
    const data = await r.json();

    res.json({
      timezone: data?.timezone,
      temperature: data?.current?.temperature_2m,
      wind: data?.current?.wind_speed_10m,
      weatherCode: data?.current?.weather_code,
      lat,
      lon,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "No se pudo obtener el clima" });
  }
});

/* ================================
   SERVIR FRONTEND (opcional)
   - Si el front vive en GitHub Pages, esto no se usa en producción,
     pero no molesta para correr local.
================================ */
const clientDist = path.join(__dirname, "..", "clock-weather-client", "dist");
app.use(express.static(clientDist));
app.get(/^\/(?!api).*/, (_req, res) => {
  res.sendFile(path.join(clientDist, "index.html"));
});

/* ================================
   START
================================ */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API escuchando en http://localhost:${PORT}`);
});
