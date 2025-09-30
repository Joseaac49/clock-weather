import { useEffect, useState } from 'react';

export default function Clock() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const fecha = new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'full'
  }).format(now);

  const hora = new Intl.DateTimeFormat('es-AR', {
    timeStyle: 'medium'
  }).format(now);

  return (
    <div className="clock">
      <div className="clock-time">{hora}</div>
      <div className="clock-date">{fecha}</div>
    </div>
  );
}
