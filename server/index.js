const express = require("express");
const cors = require("cors");
const path = require("path");
// Si tu Node es < 18, descomentá estas dos líneas:
// const { fetch } = require("undici");

const app = express();

// En desarrollo podés dejar CORS abierto.
// Si servís el front desde este mismo server, podrías quitarlo.
app.use(cors());
app.use(express.json());

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
    locale: now.toLocaleString("es-AR", { dateStyle: "full", timeStyle: "medium" }),
  });
});

// Clima (Open-Meteo, sin API key)
app.get("/api/weather", async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lon = parseFloat(req.query.lon);
    if (Number.isNaN(lat) || Number.isNaN(lon)) {
      return res.status(400).json({ error: "Parámetros inválidos: usar ?lat=&lon=" });
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
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "No se pudo obtener el clima" });
  }
});

/* ================================
   SERVIR FRONTEND (Vite build)
   - Requiere haber corrido: npm run build en clock-weather-client
================================ */
const clientDist = path.join(__dirname, "..", "clock-weather-client", "dist");

// Archivos estáticos del frontend
app.use(express.static(clientDist));

// Fallback SPA: cualquier ruta que no sea /api sirve index.html
app.get(/^\/(?!api).*/, (_req, res) => {
  res.sendFile(path.join(clientDist, "index.html"));
});

/* ================================
   START
================================ */
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API + Front escuchando en http://localhost:${PORT}`);
});

