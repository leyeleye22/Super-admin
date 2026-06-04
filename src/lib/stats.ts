import { api } from "./api";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface DashboardData {
  generated_at: string;
  fleet: {
    total_drivers:    number;
    active_sessions:  number;
    active_rate_pct:  number;
    sessions_today:   number;
    pings_today:      number;
    pings_24h:        number;
  };
  users: {
    total:         number;
    new_today:     number;
    new_this_week: number;
  };
  network: {
    stations_approved: number;
    stations_pending:  number;
    routes:            number;
    fares_approved:    number;
    fares_pending:     number;
  };
  telemetry_today: {
    total_distance_km: number;
    avg_speed_kph:     number;
    total_stops:       number;
    active_drivers:    number;
  };
  telemetry_yesterday: {
    total_distance_km: number;
    active_drivers:    number;
  };
  live_sessions: LiveSession[];
  events_today:  { event_type: string; count: number }[];
  analytics: {
    date?:           string;
    unique_devices?: number;
    fare_searches?:  number;
    ai_queries?:     number;
    peak_hour?:      number;
    top_city?:       string;
  };
}

export interface LiveSession {
  id:                string;
  driver__email:     string;
  driver__first_name:string;
  current_lat:       number | null;
  current_lng:       number | null;
  current_speed:     number | null;
  last_ping_at:      string;
  route__short_name: string | null;
}

export interface TelemetryDay {
  service_date:  string;
  distance_km:   number;
  drivers:       number;
  avg_speed:     number;
  stops:         number;
}

export interface AdminDriver {
  id:          number;
  email:       string;
  first_name:  string;
  last_name:   string;
  phone:       string;
  date_joined: string;
  is_active:   boolean;
}

export interface AdminStation {
  id:               string;
  name:             string;
  station_type:     string;
  station_latitude: string;
  station_longitude:string;
  busyness_score:   number;
  city:             string;
}

// ── API calls ─────────────────────────────────────────────────────────────────

/** Single endpoint — all dashboard data (Super Admin). */
export async function fetchDashboard(): Promise<DashboardData> {
  const res = await api.get<DashboardData>("/api/admin/dashboard/");
  return res.data;
}

export async function fetchDriversList(): Promise<AdminDriver[]> {
  const res = await api.get<AdminDriver[]>("/api/admin/drivers/");
  return res.data ?? [];
}

export async function fetchStationsList(): Promise<AdminStation[]> {
  const res = await api.get<AdminStation[]>("/api/admin/stations-list/");
  return res.data ?? [];
}

export async function fetchTelemetry(days = 7): Promise<TelemetryDay[]> {
  const res = await api.get<{ daily: TelemetryDay[] }>(`/api/admin/telemetry/?days=${days}`);
  return res.data?.daily ?? [];
}

export async function fetchHourlyHeatmap() {
  const res = await api.get("/api/analytics/heatmap/");
  const byHour: Record<number, number> = {};
  for (const row of res.data ?? []) {
    byHour[row.hour_of_day] = (byHour[row.hour_of_day] ?? 0) + (row.count ?? 0);
  }
  return Array.from({ length: 24 }, (_, h) => ({
    hour:   h,
    events: byHour[h] ?? 0,
  }));
}

export async function fetchTopSearches() {
  const res = await api.get("/api/analytics/searches/?limit=10");
  return res.data ?? [];
}
