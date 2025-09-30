import { useState } from 'react';
import Clock from './components/Clock';
import WeatherCard from './components/WeatherCard';
import CityAutocomplete from './components/CityAutocomplete';
import './App.css';

const API_BASE = import.meta.env.VITE_API_BASE;
async function j(u){ const r = await fetch(u); if(!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }

export default function App(){
  const [city,setCity]=useState('');
  const [data,setData]=useState(null);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');

  async function byCity(){
    if(!city.trim()) return;
    setLoading(true); setError(''); setData(null);
    try{
      const u = new URL('/api/weather', API_BASE);
      u.searchParams.set('city', city.trim());
      setData(await j(u));
    }catch(e){ setError(e.message || 'No se pudo obtener el clima.'); }
    finally{ setLoading(false); }
  }

  async function byCoords(lat, lon){
    setLoading(true); setError(''); setData(null);
    try{
      const u = new URL('/api/weather', API_BASE);
      u.searchParams.set('lat', lat);
      u.searchParams.set('lon', lon);
      setData(await j(u));
    }catch(e){ setError(e.message || 'No se pudo obtener el clima.'); }
    finally{ setLoading(false); }
  }

  function byGeo(){
    setError(''); setData(null);
    if (!navigator.geolocation) return setError('Geolocalización no soportada');
    navigator.geolocation.getCurrentPosition(
      ({coords}) => byCoords(coords.latitude, coords.longitude),
      () => setError('Permiso de ubicación denegado')
    );
  }

  return (
    <div className="page">
      <Clock />
      <h1 className="title">Clock Weather</h1>

      <div className="actions">
        <CityAutocomplete
          value={city}
          onChange={setCity}
          onPick={({lat, lon}) => byCoords(lat, lon)}  // pick inmediato
          placeholder="Ciudad…"
        />
        <button onClick={byCity}>Buscar</button>
        <button className="secondary" onClick={byGeo}>Usar mi ubicación</button>
      </div>

      {loading && <p className="muted">Cargando…</p>}
      {error && <p className="error">{error}</p>}
      <WeatherCard data={data}/>
    </div>
  );
}
