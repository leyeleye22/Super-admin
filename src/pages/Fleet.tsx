import { useEffect, useState } from "react";
import { User, Clock, TrendingUp, Search, Bus, Phone, Mail, Circle } from "lucide-react";
import { fetchDriversList, fetchDashboard, type AdminDriver, type DashboardData } from "../lib/stats";
import KpiCard from "../components/KpiCard";

function StatusDot({ active }: { active: boolean }) {
  return <span className={`w-2 h-2 rounded-full ${active ? "bg-success animate-pulse-dot" : "bg-muted"}`} />;
}

export default function Fleet() {
  const [drivers, setDrivers] = useState<AdminDriver[]>([]);
  const [dash, setDash] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    Promise.all([fetchDriversList(), fetchDashboard()])
      .then(([d, dash]) => { setDrivers(d); setDash(dash); })
      .finally(() => setLoading(false));
  }, []);

  const liveIds = new Set(dash?.live_sessions.map(s => s.driver__email) ?? []);
  const filtered = drivers.filter(d =>
    !search || [d.first_name, d.last_name, d.email, d.phone].join(" ").toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="flex items-center justify-center h-64 gap-3 text-muted">
      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-4 md:p-6 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-rose-100 border border-rose-200 flex items-center justify-center">
            <Bus className="w-4 h-4 text-rose" />
          </div>
          <div>
            <h1 className="page-title">Fleet Management</h1>
            <p className="page-subtitle">{drivers.length} registered · {dash?.fleet.active_sessions ?? 0} currently live</p>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-border-strong" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search drivers…" className="input-field pl-10 w-56 md:w-64" />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard label="Total drivers" value={drivers.length} icon={<User className="w-4 h-4" />} accent="gray" />
        <KpiCard label="Live now" value={dash?.fleet.active_sessions ?? 0} icon={<Circle className="w-4 h-4" />} accent="green" />
        <KpiCard label="Sessions today" value={dash?.fleet.sessions_today ?? 0} icon={<Clock className="w-4 h-4" />} accent="rose" />
        <KpiCard label="Pings today" value={(dash?.fleet.pings_today ?? 0).toLocaleString()} icon={<TrendingUp className="w-4 h-4" />} accent="blue" />
      </div>

      {filtered.length === 0 ? (
        <div className="card p-12 text-center text-muted">
          <Search className="w-8 h-8 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No drivers match your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(d => {
            const isLive = liveIds.has(d.email);
            return (
              <div key={d.id} className={`card p-4 flex flex-col gap-3 hover:shadow-card-hover transition-all ${isLive ? "ring-1 ring-success/20" : ""}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${
                      isLive ? "bg-success-bg text-success" : "bg-subtle text-muted"
                    }`}>
                      {d.first_name?.[0]?.toUpperCase() || d.last_name?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-ink leading-tight">
                        {[d.first_name, d.last_name].filter(Boolean).join(" ") || "—"}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <StatusDot active={isLive} />
                        <span className={`text-2xs font-semibold ${isLive ? "text-success" : "text-muted"}`}>
                          {isLive ? "Live" : "Offline"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className={`px-2 py-0.5 rounded-full text-2xs font-bold ${
                    d.is_active ? "bg-success-bg text-success" : "bg-danger-bg text-danger"
                  }`}>{d.is_active ? "Active" : "Disabled"}</div>
                </div>

                <div className="space-y-1.5 text-xs text-muted">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{d.email}</span>
                  </div>
                  {d.phone && <div className="flex items-center gap-2"><Phone className="w-3 h-3 flex-shrink-0" /><span>{d.phone}</span></div>}
                </div>

                <div className="text-2xs text-muted border-t border-border/50 pt-2">
                  Joined {new Date(d.date_joined).toLocaleDateString()}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
