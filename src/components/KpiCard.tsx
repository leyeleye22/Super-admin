interface KpiCardProps {
  label:     string;
  value:     string | number;
  sub?:      string;
  accent?:   "rose" | "green" | "amber" | "red" | "blue" | "gray";
  trend?:    "up" | "down" | "flat";
  trendVal?: string;
  icon:      React.ReactNode;
  children?: React.ReactNode;
}

const ACCENTS: Record<string, { text: string; iconBg: string; iconText: string; trendBg: string }> = {
  rose:  { text: "text-rose",      iconBg: "bg-rose-50",   iconText: "text-rose",      trendBg: "bg-rose-50 text-rose" },
  green: { text: "text-rose-deep", iconBg: "bg-rose-100",  iconText: "text-rose-deep", trendBg: "bg-rose-100 text-rose-deep" },
  amber: { text: "text-body",      iconBg: "bg-subtle",    iconText: "text-body",      trendBg: "bg-subtle text-body" },
  red:   { text: "text-danger",    iconBg: "bg-danger-bg", iconText: "text-danger",    trendBg: "bg-danger-bg text-danger" },
  blue:  { text: "text-body",      iconBg: "bg-subtle",    iconText: "text-muted",     trendBg: "bg-subtle text-muted" },
  gray:  { text: "text-muted",     iconBg: "bg-subtle",    iconText: "text-muted",     trendBg: "bg-subtle text-muted" },
};

export default function KpiCard({ label, value, sub, accent = "gray", trend, trendVal, icon, children }: KpiCardProps) {
  const a = ACCENTS[accent] ?? ACCENTS.gray;
  return (
    <div className="card p-5 flex flex-col gap-4 hover:shadow-card-hover group">
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${a.iconBg} ${a.iconText} transition-transform group-hover:scale-110`}>
          {icon}
        </div>
        {trendVal && (
          <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full ${a.trendBg}`}>
            {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"} {trendVal}
          </span>
        )}
      </div>
      <div>
        <p className="kpi-value">{value}</p>
        <p className="kpi-label mt-2">{label}</p>
        {sub && <p className="text-[11px] text-muted mt-1">{sub}</p>}
      </div>
      {children}
    </div>
  );
}
