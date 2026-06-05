import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { MapPin, Search } from "lucide-react";
import { fetchStationsList, fetchTopSearches, type AdminStation } from "../lib/stats";
import SectionCard from "../components/SectionCard";

const TOOLTIP = { contentStyle: { background: "#FFFFFF", border: "1px solid #E6E3DF", borderRadius: 8, fontSize: 11 }, itemStyle: { color: "#1A1523" } };

export default function Network() {
  const [stations, setStations] = useState<AdminStation[]>([]);
  const [searches, setSearches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"busyness" | "name">("busyness");

  useEffect(() => {
    Promise.all([fetchStationsList(), fetchTopSearches()])
      .then(([s, sr]) => { setStations(s); setSearches(sr); }).finally(() => setLoading(false));
  }, []);

  const filtered = stations
    .filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.city?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sortBy === "busyness" ? (b.busyness_score - a.busyness_score) : a.name.localeCompare(b.name));

  const busynessColor = (score: number) => score >= 0.7 ? "#DC2626" : score >= 0.4 ? "#B10E6B" : score > 0 ? "#16A34A" : "#7C6B7A";

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-muted">
      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-4 md:p-6 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-rose-100 border border-rose-200 flex items-center justify-center">
            <MapPin className="w-4 h-4 text-rose" />
          </div>
          <div>
            <h1 className="page-title">Network & Stations</h1>
            <p className="page-subtitle">{stations.length} approved stations across Ghana</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-border-strong" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search stations…" className="input-field pl-10 w-44 md:w-48" />
          </div>
          <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} className="input-field w-auto">
            <option value="busyness">Sort: Busyness</option>
            <option value="name">Sort: Name</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 card overflow-hidden !p-0">
          <div className="flex items-center gap-2 px-4 py-3.5 border-b border-border bg-subtle/20">
            <MapPin className="w-4 h-4 text-rose" />
            <h3 className="text-sm font-semibold text-ink">Bus Stations</h3>
            <span className="text-2xs text-muted ml-auto">{filtered.length} stations</span>
          </div>
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full text-xs min-w-[500px]">
              <thead className="sticky top-0 bg-subtle">
                <tr className="border-b border-border text-muted">
                  <th className="px-4 py-2.5 text-left table-head">Station</th>
                  <th className="px-4 py-2.5 text-left table-head">Type</th>
                  <th className="px-4 py-2.5 text-left table-head">City</th>
                  <th className="px-4 py-2.5 text-right table-head">Busyness</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filtered.map(s => (
                  <tr key={s.id} className="table-row">
                    <td className="px-4 py-2.5 font-medium text-ink">{s.name}</td>
                    <td className="px-4 py-2.5 text-muted capitalize">{s.station_type?.replace(/_/g, " ") ?? "—"}</td>
                    <td className="px-4 py-2.5 text-muted capitalize">{s.city ?? "—"}</td>
                    <td className="px-4 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 bg-subtle rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${Math.round(s.busyness_score * 100)}%`, backgroundColor: busynessColor(s.busyness_score) }} />
                        </div>
                        <span style={{ color: busynessColor(s.busyness_score) }} className="font-bold text-xs w-8 text-right">{Math.round(s.busyness_score * 100)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <SectionCard title="Passenger Searches" icon={<Search className="w-4 h-4" />}>
          {searches.length === 0 ? (
            <p className="text-xs text-muted text-center py-8">No search data yet</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={searches.slice(0, 8)} layout="vertical" margin={{ left: -10 }}>
                  <XAxis type="number" tick={{ fontSize: 9, fill: "#7C6B7A" }} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="dest_name" tick={{ fontSize: 9, fill: "#7C6B7A" }} tickLine={false} axisLine={false} width={80} />
                  <Tooltip {...TOOLTIP} />
                  <Bar dataKey="search_count" name="searches" radius={[0, 3, 3, 0]}>
                    {searches.slice(0, 8).map((_, i) => (<Cell key={i} fill="#B10E6B" fillOpacity={1 - i * 0.1} />))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-3">
                {searches.slice(0, 6).map((s, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="text-muted truncate flex-1">{s.origin_name} → {s.dest_name}</span>
                    <span className="text-rose font-bold ml-2 flex-shrink-0">{s.search_count}×</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
