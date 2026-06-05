import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, ShieldCheck, Zap } from "lucide-react";
import { login } from "../lib/auth";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch {
      setError("Invalid credentials or insufficient permissions.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen bg-white text-[#121212] lg:grid-cols-[1.05fr_.95fr]">
      <section className="relative hidden overflow-hidden bg-[#121212] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#ff4fa3]/35 blur-3xl" />
        <div className="relative inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-white/60">
          <span className="h-2 w-2 rounded-full bg-[#00c853]" /> Staff console
        </div>
        <div className="relative max-w-2xl">
          <h1 className="text-7xl font-black leading-[0.9] tracking-tight">Operate the Ghana mobility brain.</h1>
          <p className="mt-6 text-xl font-semibold leading-9 text-white/55">Monitor live movement, station coverage, driver GPS, passenger demand and fare quality from one secure control room.</p>
        </div>
        <div className="relative grid grid-cols-3 gap-4">
          {["Real-time GPS", "Stations graph", "Fare intelligence"].map((label) => (
            <div key={label} className="rounded-[1.7rem] border border-white/10 bg-white/10 p-5 text-sm font-black text-white/80">{label}</div>
          ))}
        </div>
      </section>

      <section className="flex items-center justify-center bg-[#f7f7f8] p-5">
        <div className="w-full max-w-xl rounded-[2rem] border border-black/10 bg-white p-6 shadow-xl shadow-pink-900/5 md:p-8">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#ff4fa3] text-white shadow-xl shadow-pink-500/20"><Zap className="h-7 w-7" /></span>
            <div><p className="text-2xl font-black">TrotroLive</p><p className="text-[10px] font-black uppercase tracking-[0.24em] text-black/35">Super Admin</p></div>
          </div>
          <h2 className="mt-8 text-5xl font-black tracking-tight">Welcome back</h2>
          <p className="mt-3 text-base font-semibold text-black/50">Email/password is reserved for super admins and station masters. Drivers and passengers use phone OTP.</p>

          <form onSubmit={submit} className="mt-8 space-y-5">
            <label className="block">
              <span className="text-[10px] font-black uppercase tracking-[0.24em] text-black/35">Email</span>
              <input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 h-14 w-full rounded-[1.15rem] border border-black/10 bg-[#f5f5f7] px-4 text-base font-bold outline-none focus:border-[#ff4fa3] focus:ring-4 focus:ring-pink-500/10" />
            </label>
            <label className="block">
              <span className="text-[10px] font-black uppercase tracking-[0.24em] text-black/35">Password</span>
              <div className="relative mt-2">
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="h-14 w-full rounded-[1.15rem] border border-black/10 bg-[#f5f5f7] px-4 pr-12 text-base font-bold outline-none focus:border-[#ff4fa3] focus:ring-4 focus:ring-pink-500/10" />
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-black/35">{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button>
              </div>
            </label>
            {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{error}</div>}
            <button disabled={loading} className="h-14 w-full rounded-[1.15rem] bg-[#ff4fa3] text-base font-black text-white shadow-xl shadow-pink-500/25 disabled:opacity-50">{loading ? "Signing in..." : "Sign in"}</button>
          </form>
          <div className="mt-5 flex items-start gap-3 rounded-[1.25rem] border border-black/10 bg-[#f5f5f7] p-4"><ShieldCheck className="mt-0.5 h-5 w-5 text-[#ff4fa3]" /><p className="text-sm font-semibold leading-6 text-black/55"><b className="text-black">Staff access only.</b> This console controls sensitive fleet, station and passenger analytics.</p></div>
        </div>
      </section>
    </main>
  );
}
