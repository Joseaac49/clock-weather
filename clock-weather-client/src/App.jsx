import { useEffect, useState } from "react";
import Clock from "./components/Clock";
import WeatherCard from "./components/WeatherCard";

const GEO_BASE = "https://geocoding-api.open-meteo.com/v1";

export default function App() {
  const [query, setQuery] = useState("");
  const [weather, setWeather] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | loading | error
  const [place, setPlace] = useState(null);

  async function fetchWx(lat, lon, meta = {}) {
    setStatus("loading");
    try {
      const r = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
      if (!r.ok) throw new Error("Bad status");
      const data = await r.json();
      setWeather(data);
      setPlace({
        name: meta.name || "Mi ubicación",
        country: meta.country,
        lat,
        lon,
        timezone: data.timezone
      });
      setStatus("idle");
    } catch (e) {
      console.error(e);
      setStatus("error");
    }
  }

  // Primer render: geolocalización -> clima
  useEffect(() => {
    if (!navigator.geolocation) {
      fetchWx(-34.6037, -58.3816, { name: "Buenos Aires", country: "Argentina" });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => fetchWx(coords.latitude, coords.longitude),
      () => fetchWx(-34.6037, -58.3816, { name: "Buenos Aires", country: "Argentina" }),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  // Buscar ciudad por nombre -> usar la primera coincidencia
  async function handleSearch(e) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    try {
      const resp = await fetch(
        `${GEO_BASE}/search?name=${encodeURIComponent(q)}&count=1&language=es&format=json`
      );
      const data = await resp.json();
      const r0 = data?.results?.[0];
      if (!r0) {
        alert("No encontré esa ciudad");
        return;
      }
      await fetchWx(r0.latitude, r0.longitude, { name: r0.name, country: r0.country });
      setQuery("");
    } catch (e) {
      console.error(e);
      alert("Error buscando la ciudad");
    }
  }

  return (
    <div className="page">
      <div className="card">
        <h1 className="title">Hora & Clima</h1>

        <div className="clock-row">
          <Clock timezone={place?.timezone} />
        </div>

        <form className="search" onSubmit={handleSearch}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar ciudad (ej: Santiago, CL)"
            aria-label="Buscar ciudad"
          />
          <button className="btn">Buscar</button>
        </form>

        <div className="meta">
          <span className="place">
            {place ? `${place.name}${place.country ? ", " + place.country : ""}` : "—"}
          </span>
          <span className="tz">{place?.timezone ?? ""}</span>
        </div>

        <WeatherCard weather={weather} status={status} />
      </div>

      <footer className="foot">
        <span>Datos: Open-Meteo • Sin API key</span>
      </footer>
    </div>
  );
}
