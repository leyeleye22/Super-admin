interface SectionCardProps {
  title:    string;
  subtitle?: string;
  icon?:     React.ReactNode;
  action?:   React.ReactNode;
  children:  React.ReactNode;
  noPadding?: boolean;
}

export default function SectionCard({ title, subtitle, icon, action, children, noPadding }: SectionCardProps) {
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
        <div className="flex items-center gap-2.5 min-w-0">
          {icon && <span className="text-muted flex-shrink-0">{icon}</span>}
          <div>
            <h3 className="text-sm font-semibold text-ink">{title}</h3>
            {subtitle && <p className="text-2xs text-muted mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
      {noPadding ? children : <div className="p-5">{children}</div>}
    </div>
  );
}
