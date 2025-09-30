import { useState } from 'react';
import Clock from './components/Clock';
import WeatherCard from './components/WeatherCard';
import './App.css';

const API_BASE = import.meta.env.VITE_API_BASE;

async function fetchJSON(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

export default function App() {
  const [city, setCity] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function searchByCity() {
    if (!city.trim()) return;
    setLoading(true); setError(''); setData(null);
    try {
      const url = new URL('/api/weather', API_BASE);
      url.searchParams.set('city', city.trim());
      const d = await fetchJSON(url);
      setData(d);
    } catch (e) {
      setError(e.message || 'No se pudo obtener el clima.');
    } finally {
      setLoading(false);
    }
  }

  function searchByGeo() {
    setError(''); setData(null);
    if (!navigator.geolocation) return setError('Geolocalización no soportada');
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      setLoading(true);
      try {
        const url = new URL('/api/weather', API_BASE);
        url.searchParams.set('lat', coords.latitude);
        url.searchParams.set('lon', coords.longitude);
        const d = await fetchJSON(url);
        setData(d);
      } catch (e) {
        setError(e.message || 'No se pudo obtener el clima por ubicación.');
      } finally {
        setLoading(false);
      }
    }, () => setError('Permiso de ubicación denegado'));
  }

  return (
    <div className="page">
      <Clock />

      <h1 className="title">Clock Weather</h1>

      <div className="actions">
        <input
          value={city}
          onChange={e => setCity(e.target.value)}
          placeholder="Ciudad…"
          onKeyDown={e => e.key === 'Enter' && searchByCity()}
        />
        <button onClick={searchByCity}>Buscar</button>
        <button className="secondary" onClick={searchByGeo}>Usar mi ubicación</button>
      </div>

      {loading && <p className="muted">Cargando…</p>}
      {error && <p className="error">{error}</p>}
      <WeatherCard data={data} />
    </div>
  );
}
