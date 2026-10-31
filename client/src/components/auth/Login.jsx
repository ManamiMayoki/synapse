import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth, DEMO_ACCOUNTS } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Sparkles, 
  UserCheck,
  Building2,
  Box,
  Cpu,
  Layers,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function Login() {
  const { login, switchDemoRole } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('student@synapse.edu');
  const [password, setPassword] = useState('synapse2026');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState('');

  const from = location.state?.from?.pathname || '/dashboard';

  // Automatic role detection hint based on email entered
  const detectedRole = React.useMemo(() => {
    const lower = email.toLowerCase().trim();
    if (lower.includes('admin') || lower === 'admin@synapse.edu') {
      return { role: 'admin', label: 'Administrator', color: 'text-rose-300 border-rose-500/50 bg-maroon-950/60' };
    }
    if (lower.includes('staff') || lower.includes('assistant') || lower === 'staff@synapse.edu') {
      return { role: 'staff', label: 'Lab Assistant (Staff)', color: 'text-amber-300 border-amber-500/50 bg-amber-950/60' };
    }
    if (lower.includes('student') || lower.includes('@') || lower === 'student@synapse.edu') {
      return { role: 'student', label: 'Student Member', color: 'text-cyan-300 border-cyan-500/50 bg-cyan-950/60' };
    }
    return null;
  }, [email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (!email || !email.includes('@')) {
      setValidationError('Please enter a valid university email address.');
      return;
    }
    if (!password || password.length < 4) {
      setValidationError('Password must be at least 4 characters.');
      return;
    }

    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        addToast(`Welcome back, ${res.user.name}!`, 'success', 'Authenticated');
        navigate(from, { replace: true });
      }
    } catch (err) {
      setValidationError(err.message || 'Authentication failed. Please verify credentials.');
      addToast(err.message || 'Login failed. Please verify credentials.', 'error', 'Authentication Error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (roleKey) => {
    switchDemoRole(roleKey);
    const demo = DEMO_ACCOUNTS[roleKey];
    addToast(`Signed in as ${demo.name} (${demo.role.toUpperCase()})`, 'success', 'Demo Login');
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 lg:p-8 bg-radial-vignette">
      <div className="relative w-full max-w-5xl rounded-3xl glass-card border border-gold-500/30 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[620px]">
        
        {/* LEFT PANEL: Department Showcase & 3D Twin Highlights (5 cols) */}
        <div className="lg:col-span-5 relative bg-gradient-to-br from-maroon-950 via-zinc-950 to-zinc-975 p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-gold-500/20 overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute -top-16 -left-16 w-64 h-64 bg-maroon-700/25 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-gold-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Top Brand Identity */}
          <div className="relative z-10 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-maroon-700 to-gold-600 p-0.5 shadow-glow-maroon">
                <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center text-2xl font-black text-gold-300">
                  ⚡
                </div>
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-white tracking-wider flex items-center space-x-2">
                  <span className="bg-gradient-to-r from-gold-300 via-amber-200 to-gold-400 bg-clip-text text-transparent">SYNAPSE</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-maroon-700/40 text-gold-300 border border-gold-500/30 font-bold">CSE 3D</span>
                </h1>
                <p className="text-[11px] text-slate-400">Department Lab & Asset Management</p>
              </div>
            </div>

            <div className="pt-2">
              <h2 className="text-xl font-bold text-white tracking-tight leading-snug">
                University CSE Department Digital Twin & Infrastructure
              </h2>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Empowering real-time 3D lab monitoring, predictive hardware maintenance, and rapid asset checkouts for Computer Science students and faculty.
              </p>
            </div>
          </div>

          {/* Department Labs Feature List */}
          <div className="relative z-10 py-6 space-y-3">
            <div className="p-3 rounded-2xl bg-zinc-900/60 border border-white/5 space-y-2 text-xs">
              <div className="flex items-center space-x-2 text-gold-400 font-bold text-[11px] uppercase tracking-wider">
                <Building2 className="w-3.5 h-3.5" />
                <span>Departmental Labs (2 Columns × 4 PCs):</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 font-medium">
                <span className="flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <span>Lab 201 (CP Lab)</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  <span>Lab 203 (General CSE)</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                  <span>Lab 302 (HPC & Thesis)</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>EC Lab (1st Floor)</span>
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-xs text-slate-400 pt-1">
              <span className="flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Live 3D Twin</span>
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero-Downtime Triage</span>
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>QR Checkouts</span>
              </span>
            </div>
          </div>

          {/* Bottom Security Note */}
          <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>SECURE JWT AUTH</span>
            <span>PORTAL v2.4</span>
          </div>
        </div>

        {/* RIGHT PANEL: Sign-In Form (7 cols) */}
        <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-center space-y-6 bg-zinc-950/80">
          
          <div className="space-y-1">
            <h3 className="text-2xl font-extrabold text-white tracking-tight">
              Sign In to Your Account
            </h3>
            <p className="text-xs text-slate-400">
              Access your department role console and 3D lab digital twin.
            </p>
          </div>

          {/* 1-Click Evaluator Sign-In Bar */}
          <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-gold-500/30 space-y-2.5">
            <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-gold-400">
              <span className="flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>1-Click Evaluator Sign-In:</span>
              </span>
              <span className="text-[10px] text-slate-400 lowercase">instant role switch</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('student')}
                className="py-2 px-2.5 rounded-xl bg-zinc-950 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-950/60 text-xs font-bold transition-all text-center flex flex-col items-center space-y-0.5"
              >
                <span>Student</span>
                <span className="text-[9px] font-normal text-slate-400">Alex Vance</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('staff')}
                className="py-2 px-2.5 rounded-xl bg-zinc-950 border border-amber-500/40 text-amber-300 hover:bg-amber-950/60 text-xs font-bold transition-all text-center flex flex-col items-center space-y-0.5"
              >
                <span>Lab Assistant</span>
                <span className="text-[9px] font-normal text-slate-400">Marcus H.</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('admin')}
                className="py-2 px-2.5 rounded-xl bg-zinc-950 border border-maroon-600/50 text-rose-300 hover:bg-maroon-950/60 text-xs font-bold transition-all text-center shadow-glow-maroon flex flex-col items-center space-y-0.5"
              >
                <span>Administrator</span>
                <span className="text-[9px] font-normal text-slate-400">Dr. E. Reed</span>
              </button>
            </div>
          </div>

          {/* Validation Error Feedback */}
          {validationError && (
            <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/50 text-rose-300 text-xs flex items-center space-x-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  University Email
                </label>
                {/* Dynamic Role Detection Hint */}
                {detectedRole && (
                  <span className={`px-2 py-0.5 rounded-md border text-[10px] font-mono font-semibold flex items-center space-x-1 ${detectedRole.color}`}>
                    <Sparkles className="w-3 h-3" />
                    <span>Detected: {detectedRole.label}</span>
                  </span>
                )}
              </div>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  placeholder="student@synapse.edu"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (validationError) setValidationError('');
                  }}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900/90 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-gold-400 transition-colors font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Password
                </label>
                <span className="text-[11px] text-slate-400 font-mono">Demo: synapse2026</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (validationError) setValidationError('');
                  }}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-zinc-900/90 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-gold-400 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-slate-500 hover:text-white absolute right-3 top-2.5 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-maroon-700 via-maroon-800 to-gold-600 hover:from-maroon-600 hover:to-gold-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-glow-maroon flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating Credentials...' : 'Sign In to Lab Console'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Registration link */}
          <div className="pt-2 text-center text-xs text-slate-400 border-t border-white/10">
            <span>Need departmental credentials? </span>
            <Link to="/register" className="text-gold-400 hover:text-gold-300 font-semibold underline underline-offset-4">
              Register Student / Staff Account
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
