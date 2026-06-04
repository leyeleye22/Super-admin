import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../lib/auth";
import { Eye, EyeOff, Radio, ShieldCheck, MapPinned, Activity } from "lucide-react";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      nav("/");
    } catch {
      setError("Invalid credentials or insufficient permissions.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base px-4 py-6 md:p-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/80 bg-white/55 shadow-card backdrop-blur-xl lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative hidden overflow-hidden bg-ink p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 opacity-80">
            <div className="absolute -left-28 -top-24 h-72 w-72 rounded-full bg-rose blur-3xl" />
            <div className="absolute bottom-10 right-0 h-96 w-96 rounded-full bg-rose-light/30 blur-3xl" />
          </div>

          <div className="relative">
            <h1 className="max-w-xl text-5xl font-black leading-[0.96] tracking-tight">
              Operate the trotro network with live confidence.
            </h1>
            <p className="mt-5 max-w-lg text-base text-white/70">
              Monitor fleet movement, station coverage, passenger demand and fare quality from one calm operations dashboard.
            </p>
          </div>

          <div className="relative grid grid-cols-3 gap-3">
            {[
              { icon: Activity, label: "Live fleet", value: "Real-time" },
              { icon: MapPinned, label: "Coverage", value: "Stations" },
              { icon: ShieldCheck, label: "Access", value: "Staff only" },
            ].map((item) => (
              <div key={item.label} className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                <item.icon className="h-5 w-5 text-rose-300" />
                <p className="mt-4 text-lg font-black">{item.value}</p>
                <p className="text-xs text-white/60">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center p-6 py-10 md:p-12">
          <div className="w-full max-w-md animate-fade-in">
            <div className="mb-8">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-rose to-rose-light shadow-card-rose">
                  <Radio className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-black tracking-tight text-ink">TrotroLive</p>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-muted">Super Admin</p>
                </div>
              </div>
              <h2 className="mt-8 text-3xl font-black tracking-tight text-ink">Welcome back</h2>
              <p className="mt-2 text-sm text-muted">Sign in to manage live transit operations.</p>
            </div>

            <form onSubmit={submit} className="space-y-5">
              <div>
                <label className="kpi-label mb-1.5 block">Email</label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="admin@trotrolive.com"
                    className="input-field"
                    autoComplete="email"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="kpi-label mb-1.5 block">Password</label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    placeholder="Enter password"
                    className="input-field pr-10"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(s => !s)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-border-strong hover:text-muted"
                  >
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-2xl border border-danger/20 bg-danger-bg px-4 py-3 text-xs text-danger">
                  <div className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-danger" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-gradient-to-r from-rose to-rose-deep py-3.5 text-sm font-bold text-white shadow-card-rose transition-all hover:from-rose-deep hover:to-rose-deep hover:shadow-lg active:scale-95 disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Signing in...
                  </span>
                ) : "Sign in"}
              </button>
            </form>

            <div className="mt-6 rounded-3xl border border-border bg-white/70 p-4">
              <div className="flex gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 text-rose" />
                <div>
                  <p className="text-sm font-bold text-ink">Staff access only</p>
                  <p className="mt-1 text-xs text-muted">This console controls sensitive driver, route and passenger analytics.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
