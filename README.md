# Clock Weather

App simple de clima + reloj (React + Vite) con backend Express.
- **Frontend**: GitHub Pages  
- **Backend**: Azure App Service (Linux, Node 20)

### URLs
- Front: https://joseaac49.github.io/clock-weather/
- API health: https://clock-weather-jose-ene8g0fgdjcdbyc4.canadacentral-01.azurewebsites.net/api/health

## Dev local
```bash
# terminal 1: backend
cd server
npm ci
npm run dev   # http://localhost:3000

# terminal 2: frontend
cd clock-weather-client
cp .env.example .env   # y poner VITE_API_BASE=http://localhost:3000
npm ci
npm run dev  # http://localhost:5173
