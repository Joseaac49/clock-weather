import { useEffect, useRef, useState } from 'react';
import Clock from './components/Clock';
import WeatherCard from './components/WeatherCard';
import './App.css';

const API_BASE = import.meta.env.VITE_API_BASE;

/* -------- util -------- */
async function fetchJSON(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

/* -------- hook: debounce -------- */
function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

/* -------- Autocomplete inline -------- */
function CityAutocomplete({ value, onChange, onPick }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [highlight, setHighlight] = useState(-1);
  const debounced = useDebounce(value, 300);
  const boxRef = useRef(null);

  // buscar sugerencias
  useEffect(() => {
    const q = debounced.trim();
    if (!q) { setItems([]); setOpen(false); return; }

    const ctrl = new AbortController();
    const url = new URL('/api/geocode', API_BASE);
    url.searchParams.set('q', q);

    fetch(url, { signal: ctrl.signal })
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(j => { setItems(j.results || []); setOpen(true); setHighlight(-1); })
      .catch(() => {});
    return () => ctrl.abort();
  }, [debounced]);

  // cerrar al click afuera
  useEffect(() => {
    function onDoc(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  function choose(ix) {
    const it = items[ix];
    if (!it) return;
    onChange(it.label);
    setOpen(false);
    onPick({ lat: it.lat, lon: it.lon, label: it.label });
  }

  function onKey(e) {
    if (!open || items.length === 0) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlight(h => Math.min(h + 1, items.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setHighlight(h => Math.max(h - 1, 0)); }
    if (e.key === 'Enter')     { e.preventDefault(); if (highlight >= 0) choose(highlight); }
    if (e.key === 'Escape')    { setOpen(false); }
  }

  return (
    <div className="autocomplete" ref={boxRef}>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => items.length && setOpen(true)}
        onKeyDown={onKey}
        placeholder="Ciudad…"
        aria-autocomplete="list"
        aria-expanded={open}
      />
      {open && items.length > 0 && (
        <ul className="autocomplete-list" role="listbox">
          {items.map((it, ix) => (
            <li
              key={`${it.lat},${it.lon}`}
              role="option"
              aria-selected={ix === highlight}
              className={'autocomplete-item' + (ix === highlight ? ' active' : '')}
              onMouseEnter={() => setHighlight(ix)}
              onMouseDown={(e) => { e.preventDefault(); choose(ix); }}  // evita blur del input
            >
              {it.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* -------- App -------- */
export default function App() {
  const [city, setCity] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function fetchWeatherByCoords(lat, lon) {
    setLoading(true); setError(''); setData(null);
    try {
      const u = new URL('/api/weather', API_BASE);
      u.searchParams.set('lat', lat);
      u.searchParams.set('lon', lon);
      const d = await fetchJSON(u);
      setData(d);
    } catch (e) {
      setError(e.message || 'No se pudo obtener el clima.');
    } finally {
      setLoading(false);
    }
  }

  async function searchByCityManual() {
    const q = city.trim();
    if (!q) return;
    setLoading(true); setError(''); setData(null);
    try {
      const u = new URL('/api/weather', API_BASE);
      u.searchParams.set('city', q);
      const d = await fetchJSON(u);
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
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => fetchWeatherByCoords(coords.latitude, coords.longitude),
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
          onPick={({ lat, lon }) => fetchWeatherByCoords(lat, lon)}
        />
        <button className="btn btn-primary" onClick={searchByCityManual}>Buscar</button>
        <button className="btn btn-ghost" onClick={searchByGeo}>Usar mi ubicación</button>
      </div>

      {loading && <p className="muted">Cargando…</p>}
      {error && <p className="error">{error}</p>}
      <WeatherCard data={data} />
    </div>
  );
}
