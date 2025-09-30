import { useEffect, useRef, useState } from 'react';
import useDebounce from '../hooks/useDebounce';

export default function CityAutocomplete({
  value, onChange, onPick, placeholder = 'Ciudad…'
}) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [highlight, setHighlight] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const debounced = useDebounce(value, 350);
  const wrapRef = useRef(null);

  // Cerrar al click fuera
  useEffect(() => {
    const h = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // Buscar sugerencias (Open-Meteo Geocoding)
  useEffect(() => {
    const q = debounced?.trim();
    if (!q || q.length < 2) { setItems([]); setErr(''); return; }
    setLoading(true); setErr('');
    fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=6&language=es&format=json`)
      .then(r => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))
      .then(data => {
        const list = (data.results || []).map(r => ({
          key: `${r.id}-${r.latitude}-${r.longitude}`,
          label: [r.name, r.admin1, r.country_code].filter(Boolean).join(', '),
          lat: r.latitude, lon: r.longitude
        }));
        setItems(list); setOpen(true); setHighlight(-1);
      })
      .catch(e => setErr(e.message || 'No se pudieron cargar sugerencias'))
      .finally(() => setLoading(false));
  }, [debounced]);

  function pick(item) {
    onChange(item.label);
    setOpen(false);
    onPick?.(item);   // {label, lat, lon}
  }

  function onKeyDown(e) {
    if (!open || !items.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlight(h => Math.min(h + 1, items.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setHighlight(h => Math.max(h - 1, 0)); }
    if (e.key === 'Enter' && highlight >= 0) { e.preventDefault(); pick(items[highlight]); }
    if (e.key === 'Escape') setOpen(false);
  }

  return (
    <div className="ac-wrap" ref={wrapRef}>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => items.length && setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
      />
      {open && (
        <div className="ac-list" role="listbox" aria-label="Sugerencias">
          {loading && <div className="ac-item muted">Buscando…</div>}
          {!loading && err && <div className="ac-item error">{err}</div>}
          {!loading && !err && items.map((it, idx) => (
            <button
              key={it.key}
              className={`ac-item ${idx === highlight ? 'active' : ''}`}
              onMouseEnter={() => setHighlight(idx)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => pick(it)}
              role="option"
              aria-selected={idx === highlight}
            >
              {it.label}
            </button>
          ))}
          {!loading && !err && items.length === 0 && debounced?.length >= 2 &&
            <div className="ac-item muted">Sin resultados</div>}
        </div>
      )}
    </div>
  );
}
