import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { BarChart3, Brain, BusFront, FileText, Layers3, LogOut, Map, Radio, Settings, ShieldCheck } from "lucide-react";
import { logout } from "../lib/auth";

const NAV = [
  { to: "/", label: "Ecosystem", icon: Brain },
  { to: "/transit", label: "Live transit", icon: Radio },
  { to: "/fleet", label: "Fleet", icon: BusFront },
  { to: "/network", label: "Network", icon: Map },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/reports", label: "Reports", icon: FileText },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function Layout() {
  const nav = useNavigate();
  const handleLogout = () => { logout(); nav("/login"); };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f7f7f8] text-[#121212]">
      <aside className="hidden w-[260px] shrink-0 border-r border-black/10 bg-white p-4 md:flex md:flex-col">
        <div className="rounded-[1.6rem] bg-[#121212] p-4 text-white">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ff4fa3]"><Layers3 className="h-6 w-6" /></span>
            <div><p className="text-lg font-black leading-none">TrotroLive</p><p className="mt-1 text-[10px] font-black uppercase tracking-[0.22em] text-white/45">Super Admin</p></div>
          </div>
          <div className="mt-4 rounded-2xl bg-white/10 p-3 text-xs font-bold text-white/60">National mobility operating system</div>
        </div>
        <nav className="mt-5 flex-1 space-y-1 overflow-y-auto">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === "/"} className={({ isActive }) => `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-black transition ${isActive ? "bg-[#ff4fa3] text-white shadow-lg shadow-pink-500/20" : "text-black/55 hover:bg-pink-50 hover:text-[#ff4fa3]"}`}>
              <Icon className="h-5 w-5" /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="rounded-[1.4rem] border border-black/10 bg-[#f5f5f7] p-3">
          <div className="flex items-center gap-2 text-xs font-black text-black/60"><ShieldCheck className="h-4 w-4 text-[#00c853]" /> Staff access only</div>
          <button onClick={handleLogout} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-black text-black/55 hover:text-[#ff4fa3]"><LogOut className="h-4 w-4" /> Sign out</button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto"><Outlet /></main>
    </div>
  );
}
