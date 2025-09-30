# Clock Weather ⏰🌦️

App de clima + reloj en vivo. Frontend en **React + Vite** y backend en **Express**.
- **Frontend:** GitHub Pages  
- **Backend:** Azure App Service (Linux, Node 20)  
- **Geocoding & Weather:** Open-Meteo (sin API key)  
- **CI/CD:** GitHub Actions (Pages + Deploy a Azure)

[![Pages](https://github.com/Joseaac49/clock-weather/actions/workflows/pages.yml/badge.svg)](../../actions/workflows/pages.yml)
[![Deploy API](https://github.com/Joseaac49/clock-weather/actions/workflows/deploy-api.yml/badge.svg)](../../actions/workflows/deploy-api.yml)

### 🚀 Demo
- Front: **https://joseaac49.github.io/clock-weather/**
- API health: **https://clock-weather-jose-ene8g0fgdjcdbyc4.canadacentral-01.azurewebsites.net/api/health**

---

## ✨ Features
- Reloj en vivo (Intl `es-AR`)
- **Autocomplete de ciudades** (Open-Meteo Geocoding) con teclado ↑/↓/Enter
- Consulta por **coords** o **nombre de ciudad**
- UI responsive (layout centrado + “glass” card)
- Mapeo de **códigos WMO** → descripción + emoji

---

## 🧱 Stack
- **Frontend:** React 18, Vite 5
- **Backend:** Node 20, Express
- **Infra:** Azure App Service (Linux)
- **CI/CD:** GitHub Actions (Pages + WebApp Deploy)
- **APIs:** Open-Meteo (geocoding & weather)
 ---

---

## 🧪 Dev local

```bash
# Backend
cd server
npm ci
npm run dev   # http://localhost:3000

# Frontend
cd ../clock-weather-client
cp .env.example .env   # VITE_API_BASE=http://localhost:3000
npm ci
npm run dev   # http://localhost:5173


