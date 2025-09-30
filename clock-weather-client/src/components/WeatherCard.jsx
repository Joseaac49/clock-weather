import { describeWMO } from '../utils/wmoCodes';

export default function WeatherCard({ data }) {
  if (!data) return null;
  const [desc, icon] = describeWMO(Number(data.weatherCode));

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-emoji">{icon}</span>
        <div>
          <div className="card-title">{desc}</div>
          <div className="card-sub">{data.timezone}</div>
        </div>
      </div>

      <div className="grid">
        <div><b>Temp:</b> {data.temperature} °C</div>
        <div><b>Viento:</b> {data.wind} km/h</div>
      </div>

      <div className="muted">
        lat: {data.lat} &nbsp; lon: {data.lon}
      </div>
    </div>
  );
}
