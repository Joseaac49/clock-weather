import { useState } from 'react';
import { getWeatherByCity, getWeatherByCoords } from './services/weatherApi';

export default function App() {
  const [city, setCity] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function searchByCity() {
    setLoading(true); setError(''); setData(null);
    try {
      const d = await getWeatherByCity(city);
      setData(d);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  function searchByGeo() {
    setError(''); setData(null);
    if (!navigator.geolocation) return setError('Geolocalización no soportada');
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      setLoading(true);
      try {
        const d = await getWeatherByCoords(coords.latitude, coords.longitude);
        setData(d);
      } catch (e) { setError(e.message); }
      finally { setLoading(false); }
    }, () => setError('No se pudo obtener tu ubicación'));
  }

  return (
    <div style={{ maxWidth: 480, margin: '2rem auto', fontFamily: 'system-ui' }}>
      <h1>Clock Weather</h1>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={city}
          onChange={e => setCity(e.target.value)}
          placeholder="Ciudad…"
          style={{ flex: 1, padding: 8 }}
        />
        <button onClick={searchByCity}>Buscar</button>
        <button onClick={searchByGeo}>Usar mi ubicación</button>
      </div>

      {loading && <p>Cargando…</p>}
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
      {data && (
        <div style={{ marginTop: 16, padding: 12, border: '1px solid #ddd', borderRadius: 8 }}>
          <p><b>Timezone:</b> {data.timezone}</p>
          <p><b>Temp:</b> {data.temperature} °C</p>
          <p><b>Viento:</b> {data.wind} km/h</p>
          <p><b>Código clima:</b> {data.weatherCode}</p>
          <small>lat:{data.lat} lon:{data.lon}</small>
        </div>
      )}
    </div>
  );
}
