import { useEffect, useState } from "react";
import { Download, TrendingUp, Bus, Users, MapPin, FileText } from "lucide-react";
import { fetchTelemetry, fetchDashboard, type DashboardData } from "../lib/stats";
import { api } from "../lib/api";
import KpiCard from "../components/KpiCard";
import SectionCard from "../components/SectionCard";

function downloadCSV(filename: string, rows: any[]) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]).join(",");
  const csv = [headers, ...rows.map(r => Object.values(r).map(v => `"${v ?? ""}"`).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function Reports() {
  const [telemetry, setTelemetry] = useState<any[]>([]);
  const [summary, setSummary] = useState<any[]>([]);
  const [dash, setDash] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([fetchTelemetry(30), api.get("/api/analytics/summary/").then(r => r.data), fetchDashboard()])
      .then(([t, s, d]) => {
        if (t.status === "fulfilled") setTelemetry(t.value);
        if (s.status === "fulfilled") setSummary(s.value ?? []);
        if (d.status === "fulfilled") setDash(d.value);
      }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64 gap-3 text-muted">
      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      Loading reports…
    </div>
  );

  const totalKm = telemetry.reduce((a, r) => a + (r.distance_km || 0), 0);
  const totalDriverDays = telemetry.reduce((a, r) => a + (r.drivers || 0), 0);
  const avgSpeed = telemetry.length ? Math.round(telemetry.reduce((a, r) => a + (r.avg_speed || 0), 0) / telemetry.length) : 0;

  return (
    <div className="p-4 md:p-6 space-y-5 animate-fade-in min-h-full">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-rose-100 border border-rose-200 flex items-center justify-center">
          <FileText className="w-4 h-4 text-rose" />
        </div>
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="page-subtitle">Operational summaries · Last 30 days</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard label="Total km (30d)" value={`${totalKm.toFixed(0)} km`} icon={<TrendingUp className="w-4 h-4" />} accent="rose" />
        <KpiCard label="Driver-days" value={totalDriverDays} icon={<Bus className="w-4 h-4" />} accent="blue" />
        <KpiCard label="Avg fleet speed" value={`${avgSpeed} km/h`} icon={<TrendingUp className="w-4 h-4" />} accent="green" />
        <KpiCard label="Total passengers" value={(dash?.users.total ?? 0).toLocaleString()} icon={<Users className="w-4 h-4" />} accent="gray" />
      </div>

      <SectionCard title="Fleet Performance Report — 30 Days" icon={<Bus className="w-4 h-4" />}
        action={<button onClick={() => downloadCSV("fleet_report_30d.csv", telemetry)} className="btn-rose-subtle"><Download className="w-3 h-3" /> Export CSV</button>}>
        <div className="overflow-x-auto -mx-5 -mb-5">
          <table className="w-full text-xs min-w-[500px]">
            <thead className="sticky top-0 bg-subtle/80 backdrop-blur-sm">
              <tr className="border-b border-border text-muted">
                {["Date","Distance km","Active drivers","Avg speed","Stops"].map(h => (<th key={h} className="px-5 py-2.5 text-left table-head">{h}</th>))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {telemetry.map((r, i) => (
                <tr key={i} className="table-row">
                  <td className="px-5 py-2.5 font-medium text-ink">{r.service_date}</td>
                  <td className="px-5 py-2.5 text-muted tabular-nums">{(r.distance_km ?? 0).toFixed(1)}</td>
                  <td className="px-5 py-2.5 text-muted tabular-nums">{r.drivers ?? 0}</td>
                  <td className="px-5 py-2.5 text-muted tabular-nums">{(r.avg_speed ?? 0).toFixed(0)}</td>
                  <td className="px-5 py-2.5 text-muted tabular-nums">{r.stops ?? 0}</td>
                </tr>
              ))}
              {telemetry.length === 0 && <tr><td colSpan={5} className="px-5 py-8 text-center text-muted text-sm">No fleet data available yet</td></tr>}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <SectionCard title="Passenger App Report — 30 Days" icon={<Users className="w-4 h-4" />}
        action={<button onClick={() => downloadCSV("passenger_report_30d.csv", summary)} className="btn-rose-subtle"><Download className="w-3 h-3" /> Export CSV</button>}>
        <div className="overflow-x-auto -mx-5 -mb-5">
          <table className="w-full text-xs min-w-[700px]">
            <thead className="sticky top-0 bg-subtle/80 backdrop-blur-sm">
              <tr className="border-b border-border text-muted">
                {["Date","Devices","Fare searches","Journeys","AI queries","Peak hour","Top city"].map(h => (<th key={h} className="px-5 py-2.5 text-left table-head">{h}</th>))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {summary.map((r: any, i) => (
                <tr key={i} className="table-row">
                  <td className="px-5 py-2.5 font-medium text-ink">{r.date}</td>
                  <td className="px-5 py-2.5 tabular-nums text-muted">{(r.unique_devices ?? 0).toLocaleString()}</td>
                  <td className="px-5 py-2.5 tabular-nums text-muted">{(r.fare_searches ?? 0).toLocaleString()}</td>
                  <td className="px-5 py-2.5 tabular-nums text-muted">{(r.journeys_started ?? 0).toLocaleString()}</td>
                  <td className="px-5 py-2.5 tabular-nums text-muted">{(r.ai_queries ?? 0).toLocaleString()}</td>
                  <td className="px-5 py-2.5 text-muted">{r.peak_hour != null ? `${r.peak_hour}:00` : "—"}</td>
                  <td className="px-5 py-2.5 text-muted capitalize">{r.top_city || "—"}</td>
                </tr>
              ))}
              {summary.length === 0 && <tr><td colSpan={7} className="px-5 py-8 text-center text-muted text-sm">No analytics data yet</td></tr>}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <SectionCard title="Network Snapshot" icon={<MapPin className="w-4 h-4" />}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Approved stations", value: dash?.network.stations_approved ?? 0 },
            { label: "Pending stations", value: dash?.network.stations_pending ?? 0 },
            { label: "GTFS routes", value: dash?.network.routes ?? 0 },
            { label: "Approved fares", value: dash?.network.fares_approved ?? 0 },
          ].map((s, i) => (
            <div key={i} className="bg-subtle/50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-ink">{s.value.toLocaleString()}</p>
              <p className="text-xs text-muted mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
