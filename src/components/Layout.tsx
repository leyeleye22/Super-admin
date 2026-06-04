import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Bus, Map, BarChart3,
  FileText, Settings, LogOut, Menu, X, ChevronLeft,
  Zap, Radio,
} from "lucide-react";
import { logout } from "../lib/auth";

const NAV = [
  { to: "/",          label: "Overview",   icon: LayoutDashboard },
  { to: "/transit",   label: "Transit",    icon: Radio },
  { to: "/fleet",     label: "Fleet",      icon: Bus },
  { to: "/network",   label: "Network",    icon: Map },
  { to: "/analytics", label: "Analytics",  icon: BarChart3 },
  { to: "/reports",   label: "Reports",    icon: FileText },
  { to: "/settings",  label: "Settings",   icon: Settings },
];

function NavItem({ to, label, icon: Icon, collapsed, onNav }: {
  to: string; label: string; icon: React.ComponentType<{ className?: string }>;
  collapsed: boolean; onNav: () => void;
}) {
  return (
    <NavLink
      to={to} end={to === "/"} onClick={onNav}
      className={({ isActive }) => `
        flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all
        ${collapsed ? "justify-center px-2" : ""}
        ${isActive
          ? "bg-rose-100 text-rose border border-rose-200 font-medium"
          : "text-muted hover:text-ink hover:bg-subtle"}
      `}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      {!collapsed && <span>{label}</span>}
    </NavLink>
  );
}

export default function Layout() {
  const nav = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const handleLogout = () => { logout(); nav("/login"); };

  return (
    <div className="flex h-screen overflow-hidden bg-base">
      {/* Sidebar */}
      <aside className={`hidden md:flex flex-col h-full bg-surface border-r border-border transition-all duration-200 flex-shrink-0 ${collapsed ? "w-[60px]" : "w-56"}`}>
        <div className={`flex items-center h-14 border-b border-border px-4 flex-shrink-0 ${collapsed ? "justify-center" : "gap-3"}`}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose to-rose-light flex items-center justify-center flex-shrink-0 shadow-card-rose">
            <Zap className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-bold text-ink leading-tight">TrotroLive</p>
              <p className="text-[10px] text-muted">Super Admin</p>
            </div>
          )}
        </div>

        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {NAV.map(item => <NavItem key={item.to} {...item} collapsed={collapsed} onNav={() => {}} />)}
        </nav>

        <div className="px-2 py-3 border-t border-border">
          <button onClick={handleLogout}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted hover:text-danger hover:bg-danger-bg w-full transition-all ${collapsed ? "justify-center" : ""}`}>
            <LogOut className="w-4 h-4" />
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>

        <button onClick={() => setCollapsed(c => !c)}
          className="absolute -right-3 top-14 w-6 h-6 rounded-full bg-surface border border-border flex items-center justify-center shadow-sm hover:bg-base transition-colors z-10">
          <ChevronLeft className={`w-3 h-3 text-muted transition-transform ${collapsed ? "rotate-180" : ""}`} />
        </button>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 bg-black/20 z-40 md:hidden" onClick={() => setMobileOpen(false)} />
          <aside className="fixed left-0 top-0 h-full w-64 z-50 md:hidden bg-surface border-r border-border shadow-xl">
            <div className="flex items-center justify-between h-14 border-b border-border px-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose to-rose-light flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-ink">TrotroLive</p>
                  <p className="text-[10px] text-muted">Super Admin</p>
                </div>
              </div>
              <button onClick={() => setMobileOpen(false)} className="text-muted hover:text-ink"><X className="w-5 h-5" /></button>
            </div>
            <nav className="px-2 py-3 space-y-0.5">
              {NAV.map(item => <NavItem key={item.to} {...item} collapsed={false} onNav={() => setMobileOpen(false)} />)}
            </nav>
            <div className="px-2 py-3 border-t border-border absolute bottom-0 w-full">
              <button onClick={handleLogout} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted hover:text-danger hover:bg-danger-bg w-full transition-all">
                <LogOut className="w-4 h-4" /> Sign out
              </button>
            </div>
          </aside>
        </>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex items-center justify-between h-14 px-4 md:px-6 bg-surface border-b border-border flex-shrink-0">
          <button onClick={() => setMobileOpen(true)} className="md:hidden text-muted hover:text-ink">
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4 ml-auto">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-success-bg border border-success/20">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-dot" />
              <span className="text-xs font-medium text-success hidden sm:inline">System online</span>
            </div>
            <span className="text-xs text-muted">{new Date().toLocaleDateString("en-GH", { weekday: "short", day: "numeric", month: "short" })}</span>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose to-rose-light flex items-center justify-center shadow-sm">
              <span className="text-xs font-bold text-white">SA</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-base">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
