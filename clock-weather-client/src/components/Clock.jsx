import { useEffect, useState } from "react";

export default function Clock({ timezone }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const tz = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

  const time = new Intl.DateTimeFormat("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: tz
  }).format(now);

  const date = new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: tz
  }).format(now);

  return (
    <div className="clock">
      <div className="time">{time}</div>
      <div className="date">{date}</div>
    </div>
  );
}
