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
  UserCheck 
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

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        addToast(`Welcome back, ${res.user.name}!`, 'success', 'Authenticated');
        navigate(from, { replace: true });
      }
    } catch (err) {
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
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 bg-radial-vignette">
      <div className="relative w-full max-w-md">
        
        {/* Glow halo behind login box */}
        <div className="absolute -top-10 -left-10 w-48 h-48 bg-maroon-700/25 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-gold-500/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Login Card */}
        <div className="relative rounded-3xl glass-card p-8 border-gold-500/30 shadow-2xl space-y-6">
          
          {/* Top Logo & Title */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-maroon-700 to-gold-600 p-0.5 shadow-glow-maroon">
              <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center text-2xl font-black text-gold-300">
                ⚡
              </div>
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Sign In to <span className="bg-gradient-to-r from-gold-300 to-amber-200 bg-clip-text text-transparent">Synapse</span>
            </h2>
            <p className="text-xs text-slate-400">
              Department of Computer Science & Engineering
            </p>
          </div>

          {/* Quick 1-Click Evaluator Demo Sign-In */}
          <div className="p-3.5 rounded-2xl bg-zinc-950/90 border border-gold-500/30 space-y-2 text-xs">
            <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-gold-400">
              <span className="flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>1-Click Evaluator Sign-In:</span>
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleQuickDemo('student')}
                className="py-1.5 px-2 rounded-lg bg-zinc-900 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-950 text-[11px] font-bold transition-all text-center"
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('staff')}
                className="py-1.5 px-2 rounded-lg bg-zinc-900 border border-amber-500/40 text-amber-300 hover:bg-amber-950 text-[11px] font-bold transition-all text-center"
              >
                Assistant
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('admin')}
                className="py-1.5 px-2 rounded-lg bg-zinc-900 border border-maroon-600/50 text-rose-300 hover:bg-maroon-950 text-[11px] font-bold transition-all text-center shadow-glow-maroon"
              >
                Admin
              </button>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                University Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  placeholder="student@synapse.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900/90 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-gold-400 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
              <span>{loading ? 'Authenticating...' : 'Sign In to Lab Console'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Registration link */}
          <div className="text-center text-xs text-slate-400">
            <span>New department member? </span>
            <Link to="/register" className="text-gold-400 hover:text-gold-300 font-semibold underline underline-offset-4">
              Register Student / Staff Account
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
