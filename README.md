# TrotroLive Super Admin

Global operations dashboard for the TrotroLive network.

The Super Admin app is the cortex of the system: it monitors the full transit organism across drivers, stations, fares, live sessions, station coverage and analytics.

## Product Scope

Super Admin users can:

- monitor global fleet and live driver sessions;
- inspect station and corridor coverage;
- review fare and passenger analytics;
- manage station master accounts;
- audit network health and data quality;
- access system settings and backend connection status.

This app is not for passengers, drivers or station-level operators.

## Authentication

Super Admin uses trusted backoffice login:

- email/password;
- endpoint: `/accounts/api/auth/backoffice-login/`;
- required role: `is_staff` or `is_superuser`.

Phone OTP is for passengers and drivers, not this app.

## Stack

- Vite
- React 19
- TypeScript
- Tailwind CSS
- Axios
- Recharts
- React Leaflet

## Environment

Create `.env` or `.env.local`:

```bash
VITE_API_URL=http://localhost:8000
```

## Local Development

```bash
npm install
npm run dev -- --host 0.0.0.0 --port 3000 --strictPort
```

Official local URL:

```txt
http://localhost:3000
```

## System Contract

See:

- `C:\Users\Mr LEYE\Documents\404 Solutions\SYSTEM_MAP.md`
- `C:\Users\Mr LEYE\Documents\404 Solutions\API_CONTRACT.md`
