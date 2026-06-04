import { useEffect, useState } from "react";
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Users, Search, Clock, TrendingUp, MapPin, Activity, BarChart3 } from "lucide-react";
import { fetchHourlyHeatmap, fetchTopSearches, fetchTelemetry } from "../lib/stats";
import { fetchTransitIntelligence } from "../lib/intelligence";
import { api } from "../lib/api";
import KpiCard from "../components/KpiCard";
import SectionCard from "../components/SectionCard";

const HOUR_LABELS = ["12a","1","2","3","4","5","6","7","8","9","10","11","12p","1","2","3","4","5","6","7","8","9","10","11"];
const TT = { contentStyle: { background: "#fff", border: "1px solid #E6E3DF", borderRadius: 8, fontSize: 11 }, itemStyle: { color: "#1A1523" } };

export default function Analytics() {
  const [hourly, setHourly] = useState<any[]>([]);
  const [searches, setSearches] = useState<any[]>([]);
  const [telemetry, setTelemetry] = useState<any[]>([]);
  const [summary, setSummary] = useState<any[]>([]);
  const [intel, setIntel] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      fetchHourlyHeatmap(), fetchTopSearches(), fetchTelemetry(14),
      api.get("/api/analytics/summary/").then(r => r.data), fetchTransitIntelligence(),
    ]).then(([h, s, t, sum, i]) => {
      if (h.status === "fulfilled") setHourly(h.value);
      if (s.status === "fulfilled") setSearches(s.value);
      if (t.status === "fulfilled") setTelemetry(t.value);
      if (sum.status === "fulfilled") setSummary(sum.value ?? []);
      if (i.status === "fulfilled") setIntel(i.value);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64 gap-3 text-muted">
      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      Loading analytics…
    </div>
  );

  const latest = summary[0];
  const totalEvents = summary.reduce((a: number, r: any) => a + (r.total_events || 0), 0);
  const totalDevices = summary.reduce((a: number, r: any) => a + (r.unique_devices || 0), 0);
  const totalSearches = summary.reduce((a: number, r: any) => a + (r.fare_searches || 0), 0);

  return (
    <div className="p-4 md:p-6 space-y-5 animate-fade-in min-h-full">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-rose-100 border border-rose-200 flex items-center justify-center">
          <BarChart3 className="w-4 h-4 text-rose" />
        </div>
        <div>
          <h1 className="page-title">Passenger Analytics</h1>
          <p className="page-subtitle">Last 30 days · App behavior and usage patterns</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard label="Total events" value={totalEvents.toLocaleString()} icon={<Activity className="w-4 h-4" />} accent="rose" />
        <KpiCard label="Unique devices" value={totalDevices.toLocaleString()} icon={<Users className="w-4 h-4" />} accent="blue" />
        <KpiCard label="Fare searches" value={totalSearches.toLocaleString()} icon={<Search className="w-4 h-4" />} accent="green" />
        <KpiCard label="Peak hour" value={latest?.peak_hour != null ? `${HOUR_LABELS[latest.peak_hour]}:00` : "—"} icon={<Clock className="w-4 h-4" />} accent="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SectionCard title="Activity by Hour of Day" icon={<Clock className="w-4 h-4" />} subtitle="When passengers use the app (30-day avg)">
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={hourly} margin={{ left: -20 }}>
              <XAxis dataKey="hour" tickFormatter={h => HOUR_LABELS[h]} tick={{ fontSize: 9, fill: "#7C6B7A" }} tickLine={false} axisLine={false} interval={3} />
              <YAxis tick={{ fontSize: 9, fill: "#7C6B7A" }} tickLine={false} axisLine={false} />
              <Tooltip {...TT} labelFormatter={h => `${HOUR_LABELS[Number(h)]}:00`} />
              <Bar dataKey="events" name="Events" radius={[3, 3, 0, 0]}>
                {hourly.map((h, i) => {
                  const max = Math.max(...hourly.map(x => x.events), 1);
                  return <Cell key={i} fill={h.events === max ? "#B10E6B" : "#FBE9F4"} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Fleet Distance — 14 Days" icon={<TrendingUp className="w-4 h-4" />} subtitle="Total km driven per day across all drivers">
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={telemetry} margin={{ left: -20 }}>
              <defs><linearGradient id="ag" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#B10E6B" stopOpacity={0.3} /><stop offset="95%" stopColor="#B10E6B" stopOpacity={0} /></linearGradient></defs>
              <XAxis dataKey="service_date" tickFormatter={d => d?.slice(5) ?? ""} tick={{ fontSize: 9, fill: "#7C6B7A" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 9, fill: "#7C6B7A" }} tickLine={false} axisLine={false} />
              <Tooltip {...TT} />
              <Area type="monotone" dataKey="distance_km" stroke="#B10E6B" strokeWidth={2} fill="url(#ag)" name="km" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SectionCard title="Most Searched Routes" icon={<Search className="w-4 h-4" />} subtitle="Passenger origin → destination pairs">
          {searches.length === 0 ? <p className="text-sm text-muted text-center py-6">No search data yet</p> : (
            <div className="space-y-2.5">
              {searches.slice(0, 8).map((s, i) => {
                const max = searches[0]?.search_count ?? 1;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-2xs text-muted w-5 text-right flex-shrink-0 font-bold">{i+1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between mb-1">
                        <span className="text-xs font-medium text-ink truncate">{s.origin_name} → {s.dest_name}</span>
                        <span className="text-xs font-bold text-rose ml-2 flex-shrink-0">{s.search_count}×</span>
                      </div>
                      <div className="h-1.5 bg-subtle rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-rose to-rose-300" style={{ width: `${Math.round(s.search_count / max * 100)}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Station Activity" icon={<MapPin className="w-4 h-4" />} subtitle="Most visited by drivers (7-day)">
          {(!intel?.top_driver_stations || intel.top_driver_stations.length === 0) ? (
            <p className="text-sm text-muted text-center py-6">No station data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={intel.top_driver_stations.slice(0, 8)} layout="vertical" margin={{ left: -10 }}>
                <XAxis type="number" tick={{ fontSize: 9, fill: "#7C6B7A" }} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="station__name" tick={{ fontSize: 9, fill: "#7C6B7A" }} tickLine={false} axisLine={false} width={90} />
                <Tooltip {...TT} />
                <Bar dataKey="visit_count" name="Driver visits" radius={[0, 3, 3, 0]}>
                  {intel.top_driver_stations.slice(0, 8).map((_: any, i: number) => (<Cell key={i} fill={i === 0 ? "#B10E6B" : "#FBE9F4"} />))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </SectionCard>
      </div>

      {summary.length > 0 && (
        <SectionCard title="Daily App Summary" icon={<Activity className="w-4 h-4" />} subtitle={`Last ${summary.length} days of platform activity`}>
          <div className="overflow-x-auto -mx-5 -mb-5">
            <table className="w-full text-xs min-w-[600px]">
              <thead><tr className="bg-subtle/50 border-b border-border text-muted">
                {["Date","Devices","Fare searches","Journeys","AI queries","Peak hour"].map(h => (<th key={h} className="px-5 py-2.5 text-left table-head">{h}</th>))}
              </tr></thead>
              <tbody className="divide-y divide-border/50">
                {summary.slice(0, 14).map((r: any, i: number) => (
                  <tr key={i} className="table-row">
                    <td className="px-5 py-2.5 font-medium text-ink">{r.date}</td>
                    <td className="px-5 py-2.5 text-muted tabular-nums">{(r.unique_devices ?? 0).toLocaleString()}</td>
                    <td className="px-5 py-2.5 text-muted tabular-nums">{(r.fare_searches ?? 0).toLocaleString()}</td>
                    <td className="px-5 py-2.5 text-muted tabular-nums">{(r.journeys_started ?? 0).toLocaleString()}</td>
                    <td className="px-5 py-2.5 text-muted tabular-nums">{(r.ai_queries ?? 0).toLocaleString()}</td>
                    <td className="px-5 py-2.5 text-muted">{r.peak_hour != null ? `${HOUR_LABELS[r.peak_hour]}:00` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}
    </div>
  );
}
