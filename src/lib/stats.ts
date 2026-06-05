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
  id:          string;
  first_name:  string;
  last_name:   string;
  phone:       string;
  email?:      string;
  status:      string;
  is_online:   boolean;
  is_active?:  boolean;
  created_at:  string;
  date_joined?: string;
}

export interface AdminStation {
  id:               string;
  name:             string;
  station_type:     string;
  latitude:         string;
  longitude:        string;
  busyness_score:   number;
  city:             string;
}

// ── API calls ─────────────────────────────────────────────────────────────────

export async function fetchDashboard(): Promise<DashboardData> {
  const res = await api.get<DashboardData>("/api/v2/analytics/admin-dashboard/");
  return res.data;
}

export async function fetchDriversList(): Promise<AdminDriver[]> {
  const res = await api.get<{ results?: AdminDriver[]; data?: AdminDriver[] } | AdminDriver[]>("/api/v2/fleet/drivers/");
  const data = res.data as any;
  return data?.results ?? data?.data ?? (Array.isArray(data) ? data : []);
}

export async function fetchStationsList(): Promise<AdminStation[]> {
  const res = await api.get<{ results?: AdminStation[]; data?: AdminStation[] } | AdminStation[]>("/api/v2/infrastructure/stations/");
  const data = res.data as any;
  return data?.results ?? data?.data ?? (Array.isArray(data) ? data : []);
}

export async function fetchTelemetry(days = 7): Promise<TelemetryDay[]> {
  const res = await api.get<{ data?: TelemetryDay[] } | TelemetryDay[]>(`/api/v2/analytics/metrics/?days=${days}`);
  const data = res.data as any;
  return data?.data ?? (Array.isArray(data) ? data : []);
}

export async function fetchHourlyHeatmap() {
  const res = await api.get<{ data?: { hour_of_day: number; count: number }[] } | { hour_of_day: number; count: number }[]>("/api/v2/analytics/heatmap/hourly/");
  const raw: { hour_of_day: number; count: number }[] = (res.data as any)?.data ?? (Array.isArray(res.data) ? res.data : []);
  const byHour: Record<number, number> = {};
  for (const row of raw) {
    byHour[row.hour_of_day] = (byHour[row.hour_of_day] ?? 0) + (row.count ?? 0);
  }
  return Array.from({ length: 24 }, (_, h) => ({ hour: h, events: byHour[h] ?? 0 }));
}

export async function fetchTopSearches() {
  const res = await api.get("/api/v2/analytics/searches/top/?limit=10");
  const data = res.data as any;
  return data?.data ?? (Array.isArray(data) ? data : []);
}
