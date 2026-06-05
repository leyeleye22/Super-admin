import { useEffect, useState } from "react";
import { Database, Wifi, User, Shield, CheckCircle, XCircle, RefreshCw, Key, Settings as SettingsIcon } from "lucide-react";
import { api, API_BASE } from "../lib/api";
import SectionCard from "../components/SectionCard";

function SettingRow({ label, value, badge }: { label: string; value: string; badge?: { text: string; ok: boolean } }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border/50 last:border-0 gap-4">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-ink">{label}</p>
        <p className="text-xs text-muted mt-0.5 font-mono truncate">{value}</p>
      </div>
      {badge && (
        <span className={`flex items-center gap-1.5 text-2xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${badge.ok ? "bg-success-bg text-success" : "bg-danger-bg text-danger"}`}>
          {badge.ok ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
          {badge.text}
        </span>
      )}
    </div>
  );
}

export default function Settings() {
  const [apiOk, setApiOk] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);
  const [, setHealth] = useState<any>(null);
  const [version, setVersion] = useState("—");

  const checkApi = async () => {
    setChecking(true);
    try {
      const [h, v] = await Promise.allSettled([api.get("/health/"), api.get("/api/v2/analytics/admin-dashboard/")]);
      setApiOk(h.status === "fulfilled");
      if (h.status === "fulfilled") setHealth(h.value.data);
      if (v.status === "fulfilled") setVersion("Connected · Django REST");
    } catch { setApiOk(false); }
    finally { setChecking(false); }
  };

  useEffect(() => { checkApi(); }, []);

  const token = localStorage.getItem("sa_token");
  const tokenShort = token ? `${token.slice(0, 24)}…` : "Not authenticated";

  return (
    <div className="p-4 md:p-6 space-y-5 animate-fade-in min-h-full max-w-[900px]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-rose-100 border border-rose-200 flex items-center justify-center">
            <SettingsIcon className="w-4 h-4 text-rose" />
          </div>
          <div>
            <h1 className="page-title">Settings</h1>
            <p className="page-subtitle">System configuration and connection status</p>
          </div>
        </div>
        <button onClick={checkApi} disabled={checking} className="btn-ghost disabled:opacity-50">
          <RefreshCw className={`w-3.5 h-3.5 ${checking ? "animate-spin" : ""}`} />
          {checking ? "Checking…" : "Test connection"}
        </button>
      </div>

      <SectionCard title="Backend Connection" icon={<Wifi className="w-4 h-4" />}>
        <SettingRow label="API Base URL" value={API_BASE} badge={apiOk === null ? undefined : { text: apiOk ? "Connected" : "Unreachable", ok: apiOk }} />
        <SettingRow label="API Status" value={apiOk === null ? "Checking…" : apiOk ? "Healthy" : "Error — check if Django is running"} />
        <SettingRow label="API Version" value={version} />
        <SettingRow label="Auth endpoint" value={`${API_BASE}/accounts/api/auth/backoffice-login/`} />
        <SettingRow label="Admin endpoint" value={`${API_BASE}/api/v2/analytics/admin-dashboard/`} />
      </SectionCard>

      <SectionCard title="Authentication" icon={<Key className="w-4 h-4" />}>
        <SettingRow label="Token (JWT)" value={tokenShort} badge={{ text: token ? "Valid session" : "Not authenticated", ok: !!token }} />
        <SettingRow label="Login endpoint" value={`${API_BASE}/accounts/api/auth/backoffice-login/`} />
        <SettingRow label="Permission required" value="is_staff = True (Django admin staff)" />
        <div className="py-4">
          <button onClick={() => { localStorage.removeItem("sa_token"); window.location.href = "/login"; }}
            className="text-xs text-danger hover:text-danger/80 border border-danger/20 bg-danger-bg rounded-lg px-3 py-1.5 transition-colors">
            Sign out
          </button>
        </div>
      </SectionCard>

      <SectionCard title="Super Admin Account" icon={<User className="w-4 h-4" />}>
        <SettingRow label="Permissions" value="is_staff=True · is_superuser=True · is_active=True" />
        <div className="py-3 text-xs text-muted">
          Admin account created via Django <code className="bg-subtle px-2 py-1 rounded font-mono text-muted inline-block text-2xs">createsuperuser</code>
        </div>
      </SectionCard>

      <SectionCard title="System Information" icon={<Database className="w-4 h-4" />}>
        <SettingRow label="Frontend" value="React 19 + Vite 8 + TypeScript" />
        <SettingRow label="UI" value="Tailwind CSS v3 + Recharts + React-Leaflet" />
        <SettingRow label="Backend" value="Django 5.0 + DRF 3.15 + PostgreSQL + PostGIS" />
        <SettingRow label="Async tasks" value="Celery + Redis — analytics nightly" />
        <SettingRow label="Maps" value="CartoDB Positron (no API key)" />
        <SettingRow label="Architecture" value="N-tier: Client → API → Business → Data" />
        <div className="py-3">
          <a href={`${API_BASE}/dashboard/`} target="_blank" rel="noreferrer" className="btn-rose-subtle inline-flex">
            Open Django Admin ↗
          </a>
        </div>
      </SectionCard>

      <SectionCard title="Security" icon={<Shield className="w-4 h-4" />}>
        <SettingRow label="Auth method" value="JWT (SimpleJWT) — 30 min access" badge={{ text: "Active", ok: true }} />
        <SettingRow label="Password hashing" value="Argon2 + BCrypt fallback" badge={{ text: "Secure", ok: true }} />
        <SettingRow label="Rate limiting" value="120/min burst, 600/h anon" badge={{ text: "Enabled", ok: true }} />
        <SettingRow label="CORS" value="Whitelist only — no wildcard" badge={{ text: "Strict", ok: true }} />
        <SettingRow label="Attack detection" value="155+ blocked patterns" badge={{ text: "Active", ok: true }} />
      </SectionCard>
    </div>
  );
}
