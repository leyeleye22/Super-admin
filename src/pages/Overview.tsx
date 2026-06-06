import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowDown,
  ArrowUp,
  Brain,
  BusFront,
  Calendar,
  Minus,
  RefreshCw,
  Route,
  Search,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { fetchDashboard, type DashboardData } from "../lib/stats";
import { fetchTransitIntelligence, type TransitIntelligence } from "../lib/intelligence";

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmt(v?: number | null) {
  return Number(v ?? 0).toLocaleString();
}

function pct(num?: number | null, den?: number | null) {
  if (!den) return 0;
  return Math.round((Number(num ?? 0) / den) * 100);
}

function delta(now?: number | null, prev?: number | null): number | null {
  if (!prev || prev === 0) return null;
  return Math.round(((Number(now ?? 0) - prev) / prev) * 100);
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function DeltaBadge({ value }: { value: number | null }) {
  if (value === null)
    return <span className="text-xs font-bold text-brand-muted">vs yesterday: —</span>;
  const Icon = value === 0 ? Minus : value > 0 ? ArrowUp : ArrowDown;
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-black ${
        value >= 0 ? "text-emerald-500" : "text-rose-500"
      }`}
    >
      <Icon className="h-3 w-3" />
      {Math.abs(value)}% vs yesterday
    </span>
  );
}

function Tile({
  icon: Icon,
  label,
  value,
  sub,
  d,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub: string;
  d: number | null;
}) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-rose">
          <Icon className="h-4 w-4" />
        </span>
        <DeltaBadge value={d} />
      </div>
      <p className="mt-4 kpi-value">{value}</p>
      <p className="mt-1 kpi-label">{label}</p>
      <p className="mt-1.5 text-xs font-semibold text-brand-muted leading-relaxed">{sub}</p>
    </div>
  );
}

function FunnelStep({
  step,
  label,
  count,
  base,
  note,
}: {
  step: number;
  label: string;
  count: number;
  base: number;
  note?: string;
}) {
  const width = base > 0 ? Math.min(Math.round((count / base) * 100), 100) : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-sm font-black text-brand-ink">
          {step}. {label}
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-sm font-black text-brand-rose">{fmt(count)}</span>
          <span className="text-xs font-bold text-brand-muted">{width}%</span>
        </div>
      </div>
      <div className="stat-bar mt-1.5">
        <div className="stat-bar-fill" style={{ width: `${width}%` }} />
      </div>
      {note && <p className="mt-0.5 text-[11px] font-semibold text-brand-muted">{note}</p>}
    </div>
  );
}

function SnapshotRow({
  label,
  today,
  yesterday,
}: {
  label: string;
  today: number;
  yesterday: number;
}) {
  const d = delta(today, yesterday);
  return (
    <tr className="border-b border-brand-soft last:border-0">
      <td className="py-2.5 pr-3 text-sm font-bold text-brand-ink">{label}</td>
      <td className="py-2.5 px-2 text-right text-sm font-black text-brand-ink tabular-nums">
        {fmt(today)}
      </td>
      <td className="py-2.5 px-2 text-right text-sm font-semibold text-brand-muted tabular-nums">
        {yesterday > 0 ? fmt(yesterday) : "—"}
      </td>
      <td className="py-2.5 pl-2 text-right">
        {d !== null ? (
          <span
            className={`text-xs font-black ${d >= 0 ? "text-emerald-500" : "text-rose-500"}`}
          >
            {d >= 0 ? "+" : ""}
            {d}%
          </span>
        ) : (
          <span className="text-xs font-semibold text-brand-muted">—</span>
        )}
      </td>
    </tr>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function Overview() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [intel, setIntel] = useState<TransitIntelligence | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [dash, intelligence] = await Promise.allSettled([
        fetchDashboard(),
        fetchTransitIntelligence(),
      ]);
      if (dash.status === "fulfilled") setDashboard(dash.value);
      if (intelligence.status === "fulfilled") setIntel(intelligence.value);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const hubs = useMemo(() => (intel?.top_driver_stations ?? []).slice(0, 3), [intel]);
  const events = dashboard?.events_today ?? [];

  // ── North Star ───────────────────────────────────────────────────────────────
  // # GPS driver sessions today — if this goes up, the platform is healthier
  const ns = dashboard?.fleet.sessions_today ?? 0;
  const nsDelta = delta(
    dashboard?.telemetry_today.active_drivers,
    dashboard?.telemetry_yesterday.active_drivers
  );

  // ── Derived values ────────────────────────────────────────────────────────────
  const totalDrivers = dashboard?.fleet.total_drivers ?? 0;
  const activeToday  = dashboard?.telemetry_today.active_drivers ?? 0;
  const activeYest   = dashboard?.telemetry_yesterday.active_drivers ?? 0;
  const actPct      = pct(activeToday, totalDrivers);
  const actPctYest  = pct(activeYest, totalDrivers);
  const actDelta    = delta(actPct, actPctYest);

  return (
    <main className="min-h-full bg-brand-canvas p-4 md:p-6 xl:p-8 text-brand-ink">

      {/* ══ NORTH STAR ══════════════════════════════════════════════════════════ */}
      <section className="card-dark overflow-hidden">
        <div className="relative grid gap-6 p-6 lg:grid-cols-[1fr_auto] lg:items-center lg:p-7">
          <div className="pointer-events-none absolute -right-16 -top-16 h-60 w-60 rounded-full bg-brand-rose/10 blur-3xl" />

          <div className="relative">
            <div className="flex flex-wrap items-center gap-3">
              <p className="badge-rose inline-flex items-center gap-2">
                <Brain className="h-4 w-4" /> North Star
              </p>
              <span className="badge-live gap-2 text-[10px]">
                <span className="live-dot" /> live
              </span>
            </div>

            <p className="mt-5 text-7xl font-black tabular-nums tracking-tight lg:text-8xl">
              {fmt(ns)}
            </p>
            <p className="mt-2 text-lg font-black text-white/70">GPS driver sessions today</p>
            <p className="mt-1 text-xs font-semibold text-white/40">
              A session = 1 driver opened TrotroDriver and sent ≥1 GPS ping
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-4">
              <DeltaBadge value={nsDelta} />
              <span className="text-sm font-bold text-white/30">·</span>
              <span className="text-sm font-black text-white/60">
                {fmt(dashboard?.fleet.active_sessions)} live right now
              </span>
              <span className="text-sm font-bold text-white/30">·</span>
              <span className="text-sm font-black text-white/60">
                {fmt(dashboard?.fleet.pings_24h)} GPS pings 24h
              </span>
            </div>
          </div>

          <div className="relative flex flex-col items-start gap-3 lg:items-end">
            <button onClick={load} className="btn-rose">
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
            </button>
            <span className="flex items-center gap-2 text-xs font-bold text-white/40">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Staff access only
            </span>
          </div>
        </div>
      </section>

      {/* ══ SUPPORTING TILES ════════════════════════════════════════════════════ */}
      <section className="mt-5 grid gap-4 md:grid-cols-3">
        <Tile
          icon={BusFront}
          label="Activation rate"
          value={`${actPct}%`}
          sub={`${fmt(activeToday)} of ${fmt(totalDrivers)} registered drivers active today`}
          d={actDelta}
        />
        <Tile
          icon={Route}
          label="Network coverage"
          value={fmt(dashboard?.network.routes)}
          sub={`approved routes · ${fmt(dashboard?.network.stations_approved)} stations · ${fmt(dashboard?.network.fares_approved)} fares`}
          d={null}
        />
        <Tile
          icon={Search}
          label="Passenger demand"
          value={fmt(dashboard?.analytics.fare_searches)}
          sub={`fare searches · ${fmt(dashboard?.analytics.unique_devices)} unique devices on the platform`}
          d={null}
        />
      </section>

      {/* ══ FUNNEL · SNAPSHOT · EVENT BUS ═══════════════════════════════════════ */}
      <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_1fr_0.65fr]">

        {/* ── Driver funnel ── */}
        <div className="card p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="kpi-label">Driver activation funnel</p>
              <h2 className="text-2xl font-black text-brand-ink leading-tight">
                Where drivers drop off
              </h2>
            </div>
            <Activity className="h-5 w-5 shrink-0 text-brand-rose" />
          </div>
          <p className="mt-1 text-[11px] font-semibold text-brand-muted">
            Cohort: all registered drivers · 7-day window
          </p>

          <div className="mt-5 space-y-4">
            <FunnelStep
              step={1}
              label="Registered"
              count={totalDrivers}
              base={totalDrivers}
              note="Total drivers in the system (baseline)"
            />
            <FunnelStep
              step={2}
              label="Active today"
              count={activeToday}
              base={totalDrivers}
              note="Sent ≥1 GPS ping today"
            />
            <FunnelStep
              step={3}
              label="Session launched"
              count={ns}
              base={totalDrivers}
              note="Opened driver app and started tracking"
            />
            <FunnelStep
              step={4}
              label="Live right now"
              count={dashboard?.fleet.active_sessions ?? 0}
              base={totalDrivers}
              note="Currently broadcasting GPS position"
            />
          </div>

          {hubs.length > 0 && (
            <div className="mt-5">
              <p className="kpi-label">Top hubs today</p>
              <div className="mt-2 space-y-2">
                {hubs.map((h, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-xl bg-brand-canvas px-4 py-2.5"
                  >
                    <span className="truncate mr-2 text-sm font-black text-brand-ink">
                      {h.station__name}
                    </span>
                    <span className="shrink-0 text-sm font-black text-brand-rose">
                      {fmt(h.visit_count)} visits
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Weekly snapshot ── */}
        <div className="card p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="kpi-label">Weekly snapshot</p>
              <h2 className="text-2xl font-black text-brand-ink leading-tight">
                Today vs yesterday
              </h2>
            </div>
            <Calendar className="h-5 w-5 shrink-0 text-brand-rose" />
          </div>
          <p className="mt-1 text-[11px] font-semibold text-brand-muted">
            Every number has a comparison. A metric with no delta is just wallpaper.
          </p>

          <table className="mt-4 w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-brand-soft">
                <th className="pb-2 text-left text-[10px] font-black uppercase tracking-widest text-brand-muted">Metric</th>
                <th className="pb-2 text-right text-[10px] font-black uppercase tracking-widest text-brand-muted">Today</th>
                <th className="pb-2 text-right text-[10px] font-black uppercase tracking-widest text-brand-muted">Yesterday</th>
                <th className="pb-2 text-right text-[10px] font-black uppercase tracking-widest text-brand-muted">Δ</th>
              </tr>
            </thead>
            <tbody>
              <SnapshotRow
                label="Active drivers"
                today={activeToday}
                yesterday={activeYest}
              />
              <SnapshotRow
                label="Distance (km)"
                today={Math.round(dashboard?.telemetry_today.total_distance_km ?? 0)}
                yesterday={Math.round(dashboard?.telemetry_yesterday.total_distance_km ?? 0)}
              />
              <SnapshotRow
                label="GPS sessions"
                today={dashboard?.fleet.sessions_today ?? 0}
                yesterday={0}
              />
              <SnapshotRow
                label="Fare searches"
                today={dashboard?.analytics.fare_searches ?? 0}
                yesterday={0}
              />
              <SnapshotRow
                label="New drivers"
                today={dashboard?.users.new_today ?? 0}
                yesterday={0}
              />
            </tbody>
          </table>

          <div className="mt-5">
            <p className="kpi-label">GPS signal quality</p>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-brand-canvas p-3.5">
                <p className="text-2xl font-black tabular-nums">{fmt(dashboard?.fleet.pings_today)}</p>
                <p className="mt-0.5 text-[11px] font-semibold text-brand-muted">pings today</p>
              </div>
              <div className="rounded-xl bg-brand-canvas p-3.5">
                <p className="text-2xl font-black tabular-nums">
                  {dashboard?.telemetry_today.avg_speed_kph
                    ? `${Math.round(dashboard.telemetry_today.avg_speed_kph)}`
                    : "—"}
                  <span className="text-base font-black text-brand-muted"> km/h</span>
                </p>
                <p className="mt-0.5 text-[11px] font-semibold text-brand-muted">avg speed</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Event bus ── */}
        <div className="card p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="kpi-label">Event bus</p>
              <h2 className="text-2xl font-black text-brand-ink leading-tight">
                What changed
              </h2>
            </div>
            <Zap className="h-5 w-5 shrink-0 text-brand-rose" />
          </div>
          <p className="mt-1 text-[11px] font-semibold text-brand-muted">
            Annotate big moves. A spike with no story is just noise.
          </p>

          <div className="mt-4 space-y-2">
            {(events.length
              ? events
              : [
                  { event_type: "gps_lost", count: 0 },
                  { event_type: "fare_spike_detected", count: 0 },
                  { event_type: "station_offline", count: 0 },
                ]
            ).map((e) => (
              <div
                key={e.event_type}
                className="flex items-center justify-between rounded-xl bg-brand-canvas px-4 py-3"
              >
                <span className="text-sm font-black capitalize text-brand-ink">
                  {e.event_type.replaceAll("_", " ")}
                </span>
                <span
                  className={`font-black tabular-nums ${
                    e.count > 0 ? "text-brand-rose" : "text-brand-muted"
                  }`}
                >
                  {fmt(e.count)}
                </span>
              </div>
            ))}
          </div>

          {/* Pending actions = decisions, not facts */}
          <div className="mt-5">
            <p className="kpi-label">Pending decisions</p>
            <div className="mt-2 space-y-2">
              <div className="flex items-center justify-between rounded-xl bg-brand-canvas px-4 py-2.5">
                <span className="text-sm font-semibold text-brand-ink">Stations pending</span>
                <span
                  className={`font-black tabular-nums ${
                    (dashboard?.network.stations_pending ?? 0) > 0
                      ? "text-brand-rose"
                      : "text-brand-muted"
                  }`}
                >
                  {fmt(dashboard?.network.stations_pending)}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-brand-canvas px-4 py-2.5">
                <span className="text-sm font-semibold text-brand-ink">Fares pending</span>
                <span
                  className={`font-black tabular-nums ${
                    (dashboard?.network.fares_pending ?? 0) > 0
                      ? "text-brand-rose"
                      : "text-brand-muted"
                  }`}
                >
                  {fmt(dashboard?.network.fares_pending)}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-brand-canvas px-4 py-2.5">
                <span className="text-sm font-semibold text-brand-ink">New this week</span>
                <span className="font-black tabular-nums text-brand-ink">
                  {fmt(dashboard?.users.new_this_week)} drivers
                </span>
              </div>
            </div>
          </div>
        </div>

      </section>
    </main>
  );
}
