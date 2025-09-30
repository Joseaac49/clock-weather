const API_BASE = import.meta.env.VITE_API_BASE;

async function http(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Error ${res.status}`);
  return res.json();
}

export async function getWeatherByCity(city) {
  if (!API_BASE) throw new Error('Falta VITE_API_BASE');
  const url = new URL('/api/weather', API_BASE);
  url.searchParams.set('city', city.trim());
  return http(url);
}

export async function getWeatherByCoords(lat, lon) {
  if (!API_BASE) throw new Error('Falta VITE_API_BASE');
  const url = new URL('/api/weather', API_BASE);
  url.searchParams.set('lat', lat);
  url.searchParams.set('lon', lon);
  return http(url);
}
