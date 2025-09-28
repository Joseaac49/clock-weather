const WMO = [
  { codes: [0], text: "Despejado" },
  { codes: [1, 2, 3], text: "Parcialmente nublado" },
  { codes: [45, 48], text: "Niebla" },
  { codes: [51, 53, 55, 56, 57], text: "Llovizna" },
  { codes: [61, 63, 65, 66, 67], text: "Lluvia" },
  { codes: [71, 73, 75, 77], text: "Nieve" },
  { codes: [80, 81, 82], text: "Chaparrones" },
  { codes: [85, 86], text: "Chaparrones de nieve" },
  { codes: [95, 96, 99], text: "Tormenta" }
];

function describe(code) {
  const m = WMO.find((g) => g.codes.includes(code));
  return m?.text || "—";
}

export default function WeatherCard({ weather, status }) {
  if (status === "loading") return <div className="panel">Cargando clima…</div>;
  if (status === "error") return <div className="panel error">No se pudo obtener el clima</div>;
  if (!weather) return <div className="panel">Sin datos de clima.</div>;

  return (
    <div className="panel">
      <div className="wx-row">
        <div className="temp">
          {Math.round(weather.temperature)}
          <span className="unit">°C</span>
        </div>
        <div className="details">
          <div className="line">{describe(weather.weatherCode)}</div>
          <div className="line">Viento: {Math.round(weather.wind)} km/h</div>
          <div className="line small">Zona horaria: {weather.timezone || "auto"}</div>
        </div>
      </div>
    </div>
  );
}
