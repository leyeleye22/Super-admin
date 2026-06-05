import { useEffect, useMemo, useState } from "react";
import { BarChart3, Brain, BusFront, CircleDot, MapPin, RefreshCw, Route, Search, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { fetchDashboard, type DashboardData } from "../lib/stats";
import { fetchTransitIntelligence, type TransitIntelligence } from "../lib/intelligence";

const REGIONS = [
  { name: "Greater Accra", cities: "Accra · Tema · Madina", activity: 92 },
  { name: "Ashanti", cities: "Kumasi · Suame · Ejisu", activity: 58 },
  { name: "Central", cities: "Kasoa · Cape Coast", activity: 33 },
  { name: "Northern", cities: "Tamale · Savelugu", activity: 18 },
];

function fmt(value?: number | null) {
  return Number(value ?? 0).toLocaleString();
}

function km(value?: number | null) {
  return `${Number(value ?? 0).toLocaleString(undefined, { maximumFractionDigits: 1 })} km`;
}

function minute(value?: number | null) {
  if (value == null) return "learning";
  return `${Math.round(value)} min`;
}

function Kpi({ icon: Icon, label, value, hint }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; hint: string }) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="kpi-label">{label}</p>
          <p className="mt-2 kpi-value">{value}</p>
          <p className="mt-2 text-sm font-semibold text-brand-muted">{hint}</p>
        </div>
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-brand-rose">
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </div>
  );
}

export default function Overview() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [intel, setIntel] = useState<TransitIntelligence | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [dash, intelligence] = await Promise.allSettled([fetchDashboard(), fetchTransitIntelligence()]);
      if (dash.status === "fulfilled") setDashboard(dash.value);
      if (intelligence.status === "fulfilled") setIntel(intelligence.value);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const hubs = useMemo(() => (intel?.top_driver_stations?.length ? intel.top_driver_stations : []).slice(0, 5), [intel]);
  const corridors = useMemo(() => (intel?.route_corridors?.length ? intel.route_corridors : []).slice(0, 5), [intel]);
  const events = dashboard?.events_today ?? [];

  return (
    <main className="min-h-full bg-brand-canvas p-4 md:p-6 xl:p-8 text-brand-ink">
      <section className="card-hero overflow-hidden">
        <div className="relative grid gap-8 p-6 lg:grid-cols-[1.1fr_.9fr] lg:p-8">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-brand-rose/10 blur-3xl" />
          <div className="relative">
            <p className="badge-rose inline-flex items-center gap-2">
              <Brain className="h-4 w-4" /> National mobility brain
            </p>
            <h1 className="mt-5 max-w-3xl text-5xl font-black leading-[0.92] tracking-tight md:text-7xl">
              Ghana movement ecosystem.
            </h1>
            <p className="mt-5 max-w-2xl text-lg font-semibold leading-8 text-brand-muted">
              Super Admin monitors the full nervous system: regions, cities, master stations, fixed stations, drivers, live GPS, passenger demand, fares, and data quality.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={load} className="btn-rose">
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh live data
              </button>
              <span className="badge-live gap-2 text-xs">
                <ShieldCheck className="h-3.5 w-3.5" /> Backend API v2 aligned
              </span>
            </div>
          </div>

          <div className="card-dark p-5">
            <div className="flex items-center justify-between">
              <p className="kpi-label text-white/45">Live system pulse</p>
              <span className="badge-live text-[10px]">
                <span className="live-dot" /> online
              </span>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white/10 p-4"><p className="text-4xl font-black">{fmt(dashboard?.fleet.active_sessions)}</p><p className="text-xs font-bold text-white/45">active drivers</p></div>
              <div className="rounded-xl bg-white/10 p-4"><p className="text-4xl font-black">{fmt(dashboard?.fleet.pings_24h)}</p><p className="text-xs font-bold text-white/45">GPS pings 24h</p></div>
              <div className="rounded-xl bg-white/10 p-4"><p className="text-4xl font-black">{fmt(dashboard?.network.stations_approved)}</p><p className="text-xs font-bold text-white/45">approved stations</p></div>
              <div className="rounded-xl bg-white/10 p-4"><p className="text-4xl font-black">{fmt(dashboard?.analytics.fare_searches)}</p><p className="text-xs font-bold text-white/45">fare searches</p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-5 card p-5 xl:grid xl:grid-cols-[.8fr_1.2fr] xl:gap-4">
        <div>
          <p className="kpi-label">Monday learning review</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight">One screen answer: are we okay this week?</h2>
          <p className="mt-3 text-sm font-semibold leading-6 text-brand-muted">
            The national dashboard should not be a chart wall. It must show one North Star, the weekly drift, and the next decision.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {[
            ["North Star", "GPS-covered passenger movement"],
            ["Funnel", "driver assigned → GO LIVE → fresh ping → station covered"],
            ["Decision", "ship, kill, or test one operational change"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl bg-brand-canvas p-4">
              <p className="kpi-label text-brand-rose">{label}</p>
              <p className="mt-3 text-lg font-black leading-tight">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Kpi icon={BusFront} label="Fleet signal" value={fmt(dashboard?.fleet.total_drivers)} hint={`${fmt(dashboard?.fleet.active_sessions)} broadcasting now`} />
        <Kpi icon={Route} label="Movement today" value={km(dashboard?.telemetry_today.total_distance_km)} hint={`${fmt(dashboard?.telemetry_today.total_stops)} detected stops`} />
        <Kpi icon={Search} label="Demand graph" value={fmt(dashboard?.analytics.unique_devices)} hint="unique passenger devices" />
        <Kpi icon={BarChart3} label="Network coverage" value={fmt(dashboard?.network.routes)} hint={`${fmt(dashboard?.network.fares_approved)} approved fares`} />
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
        <div className="card p-5">
          <div className="flex items-center justify-between gap-4">
            <div><p className="kpi-label">National graph</p><h2 className="text-3xl font-black text-brand-ink">Regions, hubs and corridors</h2></div>
            <Sparkles className="h-6 w-6 text-brand-rose" />
          </div>
          <div className="mt-5 grid gap-3 lg:grid-cols-[.85fr_1.15fr]">
            <div className="space-y-3">
              {REGIONS.map((region) => (
                <div key={region.name} className="rounded-xl bg-brand-canvas p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-black text-brand-ink">{region.name}</p>
                    <p className="font-black text-brand-rose">{region.activity}%</p>
                  </div>
                  <p className="mt-1 text-xs font-semibold text-brand-muted">{region.cities}</p>
                  <div className="stat-bar mt-3"><div className="stat-bar-fill" style={{ width: `${region.activity}%` }} /></div>
                </div>
              ))}
            </div>
            <div className="relative min-h-[420px] overflow-hidden rounded-xl bg-brand-soft p-5">
              <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,79,163,.2) 1px, transparent 0)", backgroundSize: "28px 28px" }} />
              {corridors.map((corridor, i) => (
                <div key={`${corridor.from}-${corridor.to}-${i}`} className="relative z-10 mb-3 rounded-xl bg-white/90 p-4 shadow-sm border border-white">
                  <div className="flex items-center gap-3">
                    <CircleDot className="h-4 w-4 text-brand-rose" />
                    <p className="min-w-0 flex-1 truncate font-black text-brand-ink">{corridor.from}</p>
                    <Zap className="h-4 w-4 text-brand-rose" />
                    <p className="min-w-0 flex-1 truncate text-right font-black text-brand-ink">{corridor.to}</p>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs font-black text-brand-muted">
                    <span>{fmt(corridor.observations)} signals</span>
                    <span>{minute(corridor.avg_minutes)}</span>
                    <span>{corridor.confidence}% trust</span>
                  </div>
                </div>
              ))}
              {!corridors.length && <div className="relative z-10 rounded-xl bg-white p-5 text-sm font-bold text-brand-muted">Waiting for route intelligence signals.</div>}
            </div>
          </div>
        </div>

        <div className="grid gap-5">
          <div className="card p-5">
            <p className="kpi-label">Master stations</p>
            <h2 className="text-3xl font-black text-brand-ink">Top hubs</h2>
            <div className="mt-4 space-y-3">
              {(hubs.length ? hubs : [{ station__name: "Circle", visit_count: 0, unique_drivers: 0, avg_dwell_seconds: null }]).map((hub, i) => (
                <div key={`${hub.station__name}-${i}`} className="flex items-center gap-3 rounded-xl bg-brand-canvas p-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-brand-rose"><MapPin className="h-4 w-4" /></span>
                  <div className="min-w-0 flex-1"><p className="truncate font-black text-brand-ink">{hub.station__name}</p><p className="text-xs font-semibold text-brand-muted">{fmt(hub.visit_count)} visits · {fmt(hub.unique_drivers)} drivers</p></div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <p className="kpi-label">Event bus</p>
            <h2 className="text-3xl font-black text-brand-ink">Today</h2>
            <div className="mt-4 space-y-2">
              {(events.length ? events : [{ event_type: "gps_lost", count: 0 }, { event_type: "fare_spike_detected", count: 0 }]).map((event) => (
                <div key={event.event_type} className="flex items-center justify-between rounded-xl bg-brand-canvas px-4 py-3">
                  <span className="text-sm font-black text-brand-ink">{event.event_type.replaceAll("_", " ")}</span>
                  <span className="font-black text-brand-rose">{fmt(event.count)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
