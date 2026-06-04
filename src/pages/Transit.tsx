import { useEffect, useState, useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Minus, Clock, MapPin, Bus, AlertTriangle, ArrowRight, Activity, Route } from "lucide-react";
import { fetchTransitIntelligence, type TransitIntelligence, type TravelComparison, type DriverRank } from "../lib/intelligence";
import SectionCard from "../components/SectionCard";

const TOOLTIP = {
  contentStyle: { background: "#FFFFFF", border: "1px solid #E6E3DF", borderRadius: 8, fontSize: 11 },
  itemStyle: { color: "#1A1523" },
};
const HOUR_LABELS = ["12a","1","2","3","4","5","6","7","8","9","10","11","12p","1","2","3","4","5","6","7","8","9","10","11"];

function TrendIcon({ trend }: { trend: string }) {
  if (trend === "faster") return <TrendingDown className="w-3.5 h-3.5 text-success" />;
  if (trend === "slower") return <TrendingUp className="w-3.5 h-3.5 text-danger" />;
  return <Minus className="w-3.5 h-3.5 text-muted" />;
}

function DeltaBadge({ delta }: { delta: number | null }) {
  if (delta === null) return <span className="text-muted">—</span>;
  return <span className={`font-bold text-xs ${delta < -1 ? "text-success" : delta > 1 ? "text-danger" : "text-muted"}`}>
    {delta > 0 ? "+" : ""}{delta} min
  </span>;
}

export default function Transit() {
  const [data, setData] = useState<TransitIntelligence | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<TravelComparison | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const load = useCallback(async () => {
    try {
      const d = await fetchTransitIntelligence();
      setData(d); setLastUpdate(new Date()); setError("");
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? e?.message ?? "Failed to load");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); const t = setInterval(load, 30_000); return () => clearInterval(t); }, [load]);

  if (loading) return (
    <div className="flex items-center justify-center h-64 gap-3 text-muted">
      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      Loading transit intelligence…
    </div>
  );

  return (
    <div className="p-4 md:p-6 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-rose-100 border border-rose-200 flex items-center justify-center">
            <Route className="w-4 h-4 text-rose" />
          </div>
          <div>
            <h1 className="page-title">Transit Intelligence</h1>
            <p className="page-subtitle">
              Corridor analytics · Travel times · Fleet ranking
              {lastUpdate && ` · ${lastUpdate.toLocaleTimeString()}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {error && <span className="badge-warning rounded-lg px-3 py-1.5"><AlertTriangle className="w-3 h-3" />{error}</span>}
          {(data?.uncovered_routes?.length ?? 0) > 0 && <span className="badge-danger rounded-lg px-3 py-1.5">{data!.uncovered_routes.length} uncovered</span>}
          <button onClick={load} className="btn-ghost">Refresh</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* A→B Travel Times */}
        <div className="lg:col-span-7 card overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border bg-subtle/20">
            <Clock className="w-4 h-4 text-rose" />
            <h3 className="text-sm font-semibold text-ink">A→B Travel Times</h3>
            <span className="text-2xs text-muted ml-auto">Today vs yesterday · Click row for detail</span>
          </div>
          <div className="p-4">
            {(data?.travel_comparison?.length ?? 0) === 0 ? (
              <div className="text-center py-12 text-muted"><Clock className="w-8 h-8 mx-auto mb-3 opacity-30" /><p className="text-sm">No travel time observations yet.</p></div>
            ) : (
              <div className="space-y-1">
                <div className="grid grid-cols-12 text-2xs text-muted uppercase tracking-wider pb-2 border-b border-border font-semibold">
                  <div className="col-span-4">Corridor</div>
                  <div className="col-span-2 text-right">Avg</div>
                  <div className="col-span-2 text-right">Today</div>
                  <div className="col-span-2 text-right">Yesterday</div>
                  <div className="col-span-2 text-right">Δ</div>
                </div>
                {(data?.travel_comparison ?? []).map((pair, i) => (
                  <button key={i} onClick={() => setSelected(selected?.from_id === pair.from_id && selected?.to_id === pair.to_id ? null : pair)}
                    className={`w-full grid grid-cols-12 items-center py-2.5 px-2 rounded-lg text-left transition-all text-xs ${
                      selected?.from_id === pair.from_id && selected?.to_id === pair.to_id
                        ? "bg-rose-50 border border-rose-200" : "hover:bg-subtle/50"}`}
                  >
                    <div className="col-span-4 flex items-center gap-1.5 min-w-0">
                      <TrendIcon trend={pair.trend} />
                      <span className="truncate font-medium text-ink">{pair.from_name}<ArrowRight className="w-2.5 h-2.5 inline mx-1 text-muted" />{pair.to_name}</span>
                    </div>
                    <div className="col-span-2 text-right text-muted">{pair.avg_minutes ?? "—"} min</div>
                    <div className="col-span-2 text-right font-bold text-ink">{pair.today_avg ?? "—"} min</div>
                    <div className="col-span-2 text-right text-muted">{pair.yesterday_avg ?? "—"} min</div>
                    <div className="col-span-2 text-right"><DeltaBadge delta={pair.delta_minutes} /></div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right stack */}
        <div className="lg:col-span-5 space-y-4">
          <SectionCard title="Top Stations (Drivers)" icon={<MapPin className="w-4 h-4 text-rose" />}>
            {(data?.top_driver_stations?.length ?? 0) === 0 ? (
              <p className="text-xs text-muted text-center py-4">No station visits recorded</p>
            ) : (
              <div className="space-y-2">
                {(data?.top_driver_stations ?? []).slice(0, 8).map((s, i) => {
                  const max = data?.top_driver_stations?.[0]?.visit_count ?? 1;
                  return (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-2xs text-muted w-4 text-right flex-shrink-0">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-ink truncate">{s.station__name}</p>
                        <div className="h-1.5 bg-subtle rounded-full mt-1 overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-rose to-rose-300" style={{ width: `${Math.round(s.visit_count / max * 100)}%` }} />
                        </div>
                      </div>
                      <span className="text-xs font-bold text-ink">{s.visit_count}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>

          {(data?.uncovered_routes?.length ?? 0) > 0 && (
            <div className="card border border-danger/30 bg-danger-bg/30">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-danger/10">
                <AlertTriangle className="w-4 h-4 text-danger" />
                <h3 className="text-sm font-semibold text-danger">Uncovered routes</h3>
              </div>
              <div className="p-4 space-y-1.5 max-h-36 overflow-y-auto">
                {(data?.uncovered_routes ?? []).slice(0, 10).map((r, i) => (
                  <div key={i} className="flex items-center gap-2"><Bus className="w-3 h-3 text-danger flex-shrink-0" /><span className="text-xs text-ink truncate">{r.short_name || r.long_name}</span></div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fleet Ranking */}
      <SectionCard title="Fleet Ranking — Today vs Yesterday" icon={<Bus className="w-4 h-4 text-rose" />}
        action={<span className="text-2xs text-muted">By distance driven today</span>}>
        {(data?.fleet_ranked?.length ?? 0) === 0 ? (
          <div className="text-center py-8 text-muted"><Bus className="w-8 h-8 mx-auto mb-3 opacity-30" /><p className="text-sm">No telemetry for today yet.</p></div>
        ) : (
          <div className="overflow-x-auto -mx-5 -mb-5">
            <table className="w-full text-xs min-w-[700px]">
              <thead><tr className="border-b border-border text-muted">
                {["#","Driver","Route","Today km","Yesterday","Δ","Hours","Stops","Speed"].map(h => (
                  <th key={h} className="px-5 py-2.5 text-left table-head">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-border/50">
                {(data?.fleet_ranked ?? []).map((d: DriverRank) => (
                  <tr key={d.driver_id} className="table-row">
                    <td className="px-5 py-2.5 text-muted">{d.rank}</td>
                    <td className="px-5 py-2.5 font-medium text-ink">{d.name}</td>
                    <td className="px-5 py-2.5 text-muted">{d.route ?? "—"}</td>
                    <td className="px-5 py-2.5 text-right font-bold text-rose">{d.distance_today} km</td>
                    <td className="px-5 py-2.5 text-right text-muted">{d.distance_yesterday} km</td>
                    <td className="px-5 py-2.5 text-right font-semibold">
                      <span className={d.delta_km > 0 ? "text-success" : d.delta_km < 0 ? "text-danger" : "text-muted"}>{d.delta_km > 0 ? "+" : ""}{d.delta_km}</span>
                    </td>
                    <td className="px-5 py-2.5 text-right text-muted">{d.moving_hours}h</td>
                    <td className="px-5 py-2.5 text-right text-muted">{d.stops}</td>
                    <td className="px-5 py-2.5 text-right text-muted">{d.avg_speed ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {/* Bottom charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="GPS Activity Today" icon={<Activity className="w-4 h-4 text-rose" />}>
          {(data?.hourly_pings?.length ?? 0) === 0 ? (
            <p className="text-xs text-muted text-center py-8">No pings recorded today</p>
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={data?.hourly_pings ?? []} margin={{ left: -20 }}>
                <XAxis dataKey="hour" tickFormatter={h => HOUR_LABELS[h]} tick={{ fontSize: 9, fill: "#7C6B7A" }} tickLine={false} axisLine={false} interval={3} />
                <YAxis tick={{ fontSize: 9, fill: "#7C6B7A" }} tickLine={false} axisLine={false} />
                <Tooltip {...TOOLTIP} labelFormatter={h => `${HOUR_LABELS[Number(h)]}:00`} />
                <Bar dataKey="pings" name="GPS pings" fill="#B10E6B" fillOpacity={0.8} radius={[2,2,0,0]} />
                <Bar dataKey="drivers" name="Active drivers" fill="#B10E6B" fillOpacity={0.4} radius={[2,2,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </SectionCard>

        <SectionCard title="Route Corridors" icon={<Route className="w-4 h-4 text-rose" />}>
          {(data?.route_corridors?.length ?? 0) === 0 ? (
            <p className="text-xs text-muted text-center py-8">No corridor data yet</p>
          ) : (
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {(data?.route_corridors ?? []).map((c, i) => (
                <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl hover:bg-subtle/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-ink font-medium truncate">{c.from} → {c.to}</p>
                    <p className="text-2xs text-muted">{c.route ?? "Unknown"} · {c.observations} obs</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-rose">{c.avg_minutes ?? "—"} min</p>
                    <span className={`text-2xs ${c.confidence >= 60 ? "text-success" : "text-warning"}`}>{c.confidence}% conf.</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
