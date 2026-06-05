import { api } from "./api";

export interface TransitIntelligence {
  generated_at:        string;
  top_driver_stations: DriverStation[];
  travel_pairs:        TravelPair[];
  travel_comparison:   TravelComparison[];
  station_heatmap:     HeatmapRow[];
  fleet_ranked:        DriverRank[];
  route_corridors:     Corridor[];
  uncovered_routes:    { id: string; short_name: string; long_name: string }[];
  passenger_search_locs: SearchLoc[];
  hourly_pings:        HourlyPing[];
}

export interface DriverStation {
  station__id:          string;
  station__name:        string;
  station__station_type:string;
  visit_count:          number;
  unique_drivers:       number;
  avg_dwell_seconds:    number | null;
}

export interface TravelPair {
  from_id:      string;
  from_name:    string;
  to_id:        string;
  to_name:      string;
  observations: number;
  avg_minutes:  number | null;
  min_minutes:  number | null;
  max_minutes:  number | null;
  avg_km:       number | null;
}

export interface TravelComparison extends TravelPair {
  today_avg:     number | null;
  yesterday_avg: number | null;
  delta_minutes: number | null;
  trend:         "faster" | "slower" | "same";
}

export interface HeatmapRow {
  station__name: string;
  hour:          number;
  count:         number;
}

export interface DriverRank {
  rank:                number;
  driver_id:           string;
  name:                string;
  route:               string | null;
  distance_today:      number;
  distance_yesterday:  number;
  delta_km:            number;
  moving_hours:        number;
  stops:               number;
  avg_speed:           number | null;
  max_speed:           number | null;
}

export interface Corridor {
  from:         string;
  to:           string;
  route:        string | null;
  observations: number;
  avg_minutes:  number | null;
  confidence:   number;
  avg_km:       number | null;
}

export interface SearchLoc {
  lat:   number;
  lng:   number;
  city:  string;
  count: number;
}

export interface HourlyPing {
  hour:    number;
  pings:   number;
  drivers: number;
}

export async function fetchTransitIntelligence(): Promise<TransitIntelligence> {
  const res = await api.get<TransitIntelligence | { data: TransitIntelligence }>("/api/v2/analytics/intelligence/");
  const payload = res.data as any;
  return payload?.data ?? payload;
}

export async function fetchTravelTimeDetail(fromId: string, toId: string, days = 30) {
  const res = await api.get(`/api/v2/analytics/routes/?route_id=${fromId}&to_id=${toId}&days=${days}`);
  return (res.data as any)?.data ?? res.data;
}
