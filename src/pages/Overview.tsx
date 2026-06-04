import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  AlertTriangle,
  Bus,
  Clock,
  Layers,
  MapPin,
  Radio,
  RefreshCw,
  Search,
  TrendingUp,
  Users,
} from "lucide-react";
import { fetchDashboard, type DashboardData } from "../lib/stats";
import { fetchTransitIntelligence, type TransitIntelligence } from "../lib/intelligence";
import KpiCard from "../components/KpiCard";

const ACCRA = { lat: 5.6037, lng: -0.187 };
const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

let googleMapsPromise: Promise<void> | null = null;

function loadGoogleMaps() {
  const win = window as typeof window & { google?: { maps?: unknown } };
  if (win.google?.maps) return Promise.resolve();
  if (googleMapsPromise) return googleMapsPromise;

  googleMapsPromise = new Promise((resolve, reject) => {
    if (!GOOGLE_MAPS_KEY) {
      reject(new Error("Missing VITE_GOOGLE_MAPS_API_KEY"));
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>('script[data-trotrolive-google-maps="true"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Google Maps failed to load")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.dataset.trotroliveGoogleMaps = "true";
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_KEY}&language=en&region=GH`;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Google Maps failed to load"));
    document.head.appendChild(script);
  });

  return googleMapsPromise;
}

function dotColor(speed: number | null) {
  if (speed == null) return "#94A3B8";
  if (speed < 3) return "#D97706";
  return "#16A34A";
}

function timeAgo(iso?: string | null) {
  if (!iso) return "no ping";
  const diff = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

function GoogleOperationsMap({
  dash,
  intel,
}: {
  dash: DashboardData | null;
  intel: TransitIntelligence | null;
}) {
  const mapElRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const overlaysRef = useRef<any[]>([]);
  const [mapError, setMapError] = useState("");
  const [mapMode, setMapMode] = useState<"hybrid" | "roadmap">("hybrid");

  const drivers = useMemo(
    () => (dash?.live_sessions ?? []).filter((session) => session.current_lat && session.current_lng),
    [dash?.live_sessions]
  );
  const topStations = intel?.top_driver_stations?.slice(0, 8) ?? [];
  const uncovered = intel?.uncovered_routes?.slice(0, 6) ?? [];

  useEffect(() => {
    let cancelled = false;

    loadGoogleMaps()
      .then(() => {
        if (cancelled || !mapElRef.current) return;
        const maps = (window as any).google.maps;

        if (!mapRef.current) {
          mapRef.current = new maps.Map(mapElRef.current, {
            center: ACCRA,
            zoom: 12,
            mapTypeId: mapMode,
            clickableIcons: true,
            fullscreenControl: true,
            mapTypeControl: false,
            streetViewControl: true,
            zoomControl: true,
            gestureHandling: "greedy",
            tilt: 0,
          });
        }

        mapRef.current.setMapTypeId(mapMode);
        overlaysRef.current.forEach((overlay) => overlay.setMap?.(null));
        overlaysRef.current = [];

        const infoWindow = new maps.InfoWindow();
        const bounds = new maps.LatLngBounds();

        drivers.forEach((driver) => {
          const position = { lat: Number(driver.current_lat), lng: Number(driver.current_lng) };
          bounds.extend(position);
          const marker = new maps.Marker({
            map: mapRef.current,
            position,
            title: driver.driver__first_name || "Driver",
            label: { text: "T", color: "#ffffff", fontWeight: "900" },
            icon: {
              path: maps.SymbolPath.FORWARD_CLOSED_ARROW,
              scale: 6,
              fillColor: dotColor(driver.current_speed),
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 2,
              rotation: 90,
            },
          });
          marker.addListener("click", () => {
            infoWindow.setContent(`
              <strong>${driver.driver__first_name || "Driver"}</strong><br/>
              <span>${driver.route__short_name || "No route label"}</span><br/>
              <span>${driver.current_speed != null ? `${Math.round(driver.current_speed)} km/h` : "GPS live"}</span>
            `);
            infoWindow.open({ anchor: marker, map: mapRef.current });
          });
          overlaysRef.current.push(marker);
        });

        if (drivers.length > 0) {
          mapRef.current.fitBounds(bounds, 84);
        } else {
          mapRef.current.setCenter(ACCRA);
          mapRef.current.setZoom(12);
        }
      })
      .catch((error) => setMapError(error instanceof Error ? error.message : "Google Maps unavailable"));

    return () => {
      cancelled = true;
    };
  }, [drivers, mapMode]);

  return (
    <section className="relative min-h-[660px] overflow-hidden rounded-3xl border border-border shadow-card bg-black">
      <div ref={mapElRef} className="absolute inset-0" />

      <div className="absolute left-4 top-4 z-10 w-[min(440px,calc(100%-32px))] rounded-3xl bg-white/95 shadow-2xl border border-white/70 backdrop-blur">
        <div className="flex items-center gap-3 border-b border-border p-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-100 text-rose">
            <Search className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-black text-ink">Search Google Maps</p>
            <p className="text-xs text-muted truncate">TrotroLive Ghana operations overlay</p>
          </div>
          <button onClick={() => setMapMode((mode) => (mode === "hybrid" ? "roadmap" : "hybrid"))} className="btn-ghost">
            <Layers className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 p-4">
          <div className="rounded-2xl bg-success-bg border border-success/20 p-3">
            <p className="text-2xl font-black text-success">{drivers.length}</p>
            <p className="kpi-label">live cars</p>
          </div>
          <div className="rounded-2xl bg-rose-100 border border-rose-200 p-3">
            <p className="text-2xl font-black text-rose">{dash?.network.stations_approved ?? 0}</p>
            <p className="kpi-label">stations</p>
          </div>
          <div className="rounded-2xl bg-subtle border border-border p-3">
            <p className="text-2xl font-black text-ink">{dash?.fleet.total_drivers ?? 0}</p>
            <p className="kpi-label">drivers</p>
          </div>
        </div>

        <div className="max-h-[390px] overflow-y-auto border-t border-border p-4 space-y-4">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-black uppercase tracking-widest text-muted">Live vehicles</p>
              <Radio className="h-4 w-4 text-success animate-pulse" />
            </div>
            <div className="space-y-2">
              {drivers.length === 0 ? (
                <p className="rounded-2xl bg-subtle p-4 text-sm text-muted">No live trotro right now.</p>
              ) : (
                drivers.slice(0, 6).map((driver) => (
                  <div key={driver.id} className="flex items-center gap-3 rounded-2xl bg-subtle p-3">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: dotColor(driver.current_speed) }} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-ink">{driver.driver__first_name || "Driver"}</p>
                      <p className="truncate text-xs text-muted">{driver.route__short_name || "No route"} · {timeAgo(driver.last_ping_at)}</p>
                    </div>
                    <p className="text-xs font-black text-ink">{driver.current_speed != null ? `${Math.round(driver.current_speed)} km/h` : "GPS"}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-black uppercase tracking-widest text-muted">Coverage alerts</p>
            {uncovered.length === 0 ? (
              <p className="rounded-2xl bg-success-bg p-3 text-sm font-semibold text-success">All priority routes covered.</p>
            ) : (
              uncovered.map((route, index) => (
                <div key={index} className="mb-2 flex items-center gap-2 rounded-2xl bg-red-50 p-3 text-sm text-red-700">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="truncate">{route.short_name || route.long_name || "Unnamed route"}</span>
                </div>
              ))
            )}
          </div>

          <div>
            <p className="mb-2 text-xs font-black uppercase tracking-widest text-muted">Busiest stations</p>
            {topStations.length === 0 ? (
              <p className="rounded-2xl bg-subtle p-3 text-sm text-muted">No station activity yet.</p>
            ) : (
              topStations.map((station, index) => (
                <div key={index} className="mb-2 flex items-center gap-3 rounded-2xl bg-white border border-border p-3">
                  <MapPin className="h-4 w-4 text-rose" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-ink">{station.station__name}</p>
                    <p className="text-xs text-muted">{station.visit_count} driver visits</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="absolute right-4 top-4 z-10 flex max-w-[calc(100%-480px)] flex-wrap gap-2">
        {["Restaurants", "Hotels", "Things to do", "Museums", "Transit"].map((label) => (
          <span key={label} className="rounded-full bg-white/95 px-4 py-2 text-sm font-bold text-ink shadow-card border border-white/70">
            {label}
          </span>
        ))}
      </div>

      <div className="absolute bottom-4 right-4 z-10 rounded-2xl bg-black/70 px-4 py-3 text-white backdrop-blur">
        <p className="text-xs font-bold uppercase tracking-widest text-white/60">Google Maps</p>
        <p className="text-sm font-black">{mapMode === "hybrid" ? "Satellite hybrid" : "Roadmap"} · Accra</p>
      </div>

      {mapError && (
        <div className="absolute bottom-4 left-4 z-10 rounded-2xl border border-amber-200 bg-white/95 p-3 text-xs font-semibold text-amber-700 shadow-card">
          {mapError}
        </div>
      )}
    </section>
  );
}

export default function Overview() {
  const [dash, setDash] = useState<DashboardData | null>(null);
  const [intel, setIntel] = useState<TransitIntelligence | null>(null);
  const [, setLoading] = useState(true);
  const [updated, setUpdated] = useState<Date | null>(null);

  const load = useCallback(async () => {
    try {
      const [dashboardResult, intelligenceResult] = await Promise.allSettled([fetchDashboard(), fetchTransitIntelligence()]);
      if (dashboardResult.status === "fulfilled") setDash(dashboardResult.value);
      if (intelligenceResult.status === "fulfilled") setIntel(intelligenceResult.value);
      setUpdated(new Date());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 30_000);
    return () => clearInterval(t);
  }, [load]);

  const fleet = dash?.fleet;
  const users = dash?.users;
  const telemetry = dash?.telemetry_today;
  const hourlyPings = intel?.hourly_pings ?? [];

  return (
    <div className="p-4 md:p-6 space-y-5 min-h-full animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Operations Center</h1>
          <p className="page-subtitle">
            Ghana Trotro Network
            {updated && ` · Last updated ${updated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
          </p>
        </div>
        <button onClick={load} className="btn-ghost">
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Active Drivers" value={fleet?.active_sessions ?? 0} sub={`of ${fleet?.total_drivers ?? 0} drivers`}
          accent="green" trendVal={`${fleet?.active_rate_pct ?? 0}% active`} icon={<Bus className="w-4 h-4" />} />
        <KpiCard label="Sessions Today" value={(fleet?.sessions_today ?? 0).toLocaleString()} sub={`${(fleet?.pings_today ?? 0).toLocaleString()} GPS pings`}
          accent="rose" icon={<Radio className="w-4 h-4" />} />
        <KpiCard label="Distance Today" value={`${telemetry?.total_distance_km ?? 0} km`} sub={`avg ${telemetry?.avg_speed_kph ?? 0} km/h · ${telemetry?.total_stops ?? 0} stops`}
          accent="blue" icon={<TrendingUp className="w-4 h-4" />} />
        <KpiCard label="Passengers" value={(users?.total ?? 0).toLocaleString()} sub={`+${users?.new_today ?? 0} today`}
          accent="amber" trendVal={`+${users?.new_this_week ?? 0} this week`} icon={<Users className="w-4 h-4" />} />
      </div>

      <GoogleOperationsMap dash={dash} intel={intel} />

      {hourlyPings.length > 0 && (
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-muted" />
              <span className="kpi-label">GPS Activity Today</span>
            </div>
            <span className="text-2xs text-muted">{hourlyPings.reduce((a, h) => a + h.pings, 0).toLocaleString()} pings</span>
          </div>
          <div className="flex items-end gap-px h-10">
            {hourlyPings.map((hour, index) => {
              const max = Math.max(...hourlyPings.map((item) => item.pings), 1);
              const height = Math.max(3, Math.round((hour.pings / max) * 40));
              const currentHour = new Date().getHours();
              return (
                <div
                  key={index}
                  title={`${hour.hour}:00 — ${hour.pings} pings`}
                  className="flex-1 rounded-sm transition-all"
                  style={{ height, backgroundColor: hour.hour === currentHour ? "#B10E6B" : "#E4E2E8" }}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
