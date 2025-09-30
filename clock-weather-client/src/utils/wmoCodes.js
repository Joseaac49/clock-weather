export function describeWMO(code) {
  const map = {
    0: ['Despejado', '☀️'],
    1: ['Mayormente despejado', '🌤️'],
    2: ['Parcialmente nublado', '⛅'],
    3: ['Nublado', '☁️'],
    45: ['Niebla', '🌫️'],
    48: ['Niebla con escarcha', '🌫️'],
    51: ['Llovizna débil', '🌦️'],
    53: ['Llovizna', '🌦️'],
    55: ['Llovizna intensa', '🌧️'],
    61: ['Lluvia débil', '🌦️'],
    63: ['Lluvia', '🌧️'],
    65: ['Lluvia intensa', '🌧️'],
    66: ['Lluvia helada ligera', '🌧️❄️'],
    67: ['Lluvia helada', '🌧️❄️'],
    71: ['Nieve débil', '🌨️'],
    73: ['Nieve', '🌨️'],
    75: ['Nieve intensa', '❄️'],
    77: ['Granizo fino', '❄️'],
    80: ['Chubascos débiles', '🌦️'],
    81: ['Chubascos', '🌦️'],
    82: ['Chubascos fuertes', '🌧️'],
    85: ['Chubascos de nieve', '🌨️'],
    86: ['Chubascos de nieve fuertes', '❄️'],
    95: ['Tormenta', '⛈️'],
    96: ['Tormenta con granizo', '⛈️'],
    99: ['Tormenta fuerte con granizo', '⛈️']
  };
  return map[code] ?? ['Sin datos', '❓'];
}
