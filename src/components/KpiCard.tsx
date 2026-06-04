interface KpiCardProps {
  label:    string;
  value:    string | number;
  sub?:     string;
  accent?:  "rose" | "green" | "amber" | "red" | "blue" | "gray";
  trend?:   "up" | "down" | "flat";
  trendVal?: string;
  icon:     React.ReactNode;
  children?: React.ReactNode;
}

const ACCENTS: Record<string, { head: string; border: string; icon: string; dot: string }> = {
  rose:  { head: "text-rose",     border: "border-l-rose",      icon: "bg-rose-100 text-rose",     dot: "bg-rose" },
  green: { head: "text-success",  border: "border-l-success",   icon: "bg-success-bg text-success", dot: "bg-success" },
  amber: { head: "text-warning",  border: "border-l-warning",   icon: "bg-warning-bg text-warning", dot: "bg-warning" },
  red:   { head: "text-danger",   border: "border-l-danger",    icon: "bg-danger-bg text-danger",   dot: "bg-danger" },
  blue:  { head: "text-info",     border: "border-l-info",      icon: "bg-info-bg text-info",       dot: "bg-info" },
  gray:  { head: "text-muted",    border: "border-l-border-strong", icon: "bg-subtle text-muted",    dot: "bg-border-strong" },
};

export default function KpiCard({ label, value, sub, accent = "gray", trend, trendVal, icon, children }: KpiCardProps) {
  const a = ACCENTS[accent] ?? ACCENTS.gray;
  return (
    <div className={`card border-l-4 ${a.border} p-4 md:p-5 flex flex-col gap-3 hover:shadow-card-hover`}>
      <div className="flex items-center justify-between">
        <span className="kpi-label">{label}</span>
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${a.icon}`}>{icon}</div>
      </div>
      <div>
        <p className="kpi-value">{value}</p>
        {sub && <p className="text-xs text-muted mt-1">{sub}</p>}
      </div>
      {trendVal && (
        <p className={`text-xs font-semibold ${a.head} flex items-center gap-1`}>
          <span className={`w-1.5 h-1.5 rounded-full ${a.dot}`} />
          {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"} {trendVal}
        </p>
      )}
      {children}
    </div>
  );
}
