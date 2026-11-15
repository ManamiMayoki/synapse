import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth, DEMO_ACCOUNTS } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Sparkles, 
  Building2,
  CheckCircle2,
  AlertCircle,
  LogIn,
  UserPlus
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
      return { role: 'admin', label: 'Administrator', color: 'text-rose-800 border-rose-200 bg-rose-50' };
    }
    if (lower.includes('staff') || lower.includes('assistant') || lower === 'staff@synapse.edu') {
      return { role: 'staff', label: 'Lab Assistant (Staff)', color: 'text-amber-800 border-amber-200 bg-amber-50' };
    }
    if (lower.includes('student') || lower.includes('@') || lower === 'student@synapse.edu') {
      return { role: 'student', label: 'Student Member', color: 'text-cyan-800 border-cyan-200 bg-cyan-50' };
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
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 lg:p-8 bg-slate-50">
      <div className="relative w-full max-w-5xl rounded-3xl bg-white border border-slate-200 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[620px]">
        
        {/* LEFT PANEL: Department Showcase & 3D Twin Highlights (5 cols) */}
        <div className="lg:col-span-5 relative bg-gradient-to-br from-maroon-50 via-slate-50 to-white p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-200">
          
          {/* Top Brand Identity */}
          <div className="relative z-10 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-maroon-700 to-maroon-800 p-0.5 shadow-sm">
                <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-2xl font-black text-maroon-700">
                  ⚡
                </div>
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
                  <span>SYNAPSE</span>
                  <span className="px-2 py-0.5 rounded text-xs font-mono uppercase bg-maroon-100 text-maroon-800 border border-maroon-200 font-bold">CSE 3D</span>
                </h1>
                <p className="text-xs text-slate-500 font-medium">Department Lab & Asset Management</p>
              </div>
            </div>

            <div className="pt-2">
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
                Department Digital Twin & Lab Infrastructure
              </h2>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Empowering real-time 3D lab monitoring, hardware maintenance ticketing, and rapid inventory checkouts for CSE students and faculty.
              </p>
            </div>
          </div>

          {/* Department Labs Feature List */}
          <div className="relative z-10 py-6 space-y-3">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2.5">
              <div className="flex items-center space-x-2 text-maroon-800 font-bold text-xs uppercase tracking-wider">
                <Building2 className="w-4 h-4 text-maroon-700" />
                <span>Departmental Laboratories:</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 font-medium">
                <span className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-500" />
                  <span>Lab 201 (CP Lab)</span>
                </span>
                <span className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  <span>Lab 203 (General CSE)</span>
                </span>
                <span className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>Lab 302 (HPC Lab)</span>
                </span>
                <span className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>EC Lab (1st Floor)</span>
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-xs text-slate-600 font-medium pt-1">
              <span className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Live 3D Twin</span>
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Incident Triage</span>
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>QR Checkouts</span>
              </span>
            </div>
          </div>

          {/* Bottom Security Note */}
          <div className="relative z-10 pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-mono">
            <span>SECURE ACADEMIC PORTAL</span>
            <span>v2.4.0</span>
          </div>
        </div>

        {/* RIGHT PANEL: Sign-In Form (7 cols) */}
        <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-center space-y-6 bg-white">
          
          {/* Sign In / Register Segmented Tab Switcher */}
          <div className="flex items-center p-1 rounded-2xl bg-slate-100 border border-slate-200">
            <Link
              to="/login"
              className="flex-1 py-2.5 rounded-xl font-bold text-sm text-center bg-white text-maroon-800 shadow-sm border border-slate-200/80 flex items-center justify-center space-x-2"
            >
              <LogIn className="w-4 h-4 text-maroon-700" />
              <span>Sign In</span>
            </Link>
            <Link
              to="/register"
              className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-center text-slate-600 hover:text-slate-900 transition-colors flex items-center justify-center space-x-2"
            >
              <UserPlus className="w-4 h-4 text-slate-500" />
              <span>Register</span>
            </Link>
          </div>

          <div className="space-y-1">
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Sign In to Your Account
            </h3>
            <p className="text-sm text-slate-600">
              Access your department role console and 3D lab digital twin.
            </p>
          </div>

          {/* 1-Click Evaluator Sign-In Bar */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-700">
              <span className="flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>1-Click Evaluator Sign-In:</span>
              </span>
              <span className="text-xs text-slate-500 font-normal lowercase">instant role switch</span>
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => handleQuickDemo('student')}
                className="py-2.5 px-3 rounded-xl bg-white border border-cyan-200 text-cyan-900 hover:bg-cyan-50 text-xs font-bold transition-all text-center flex flex-col items-center space-y-0.5 shadow-xs"
              >
                <span>Student</span>
                <span className="text-xs font-medium text-slate-500">Alex Vance</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('staff')}
                className="py-2.5 px-3 rounded-xl bg-white border border-amber-200 text-amber-900 hover:bg-amber-50 text-xs font-bold transition-all text-center flex flex-col items-center space-y-0.5 shadow-xs"
              >
                <span>Lab Assistant</span>
                <span className="text-xs font-medium text-slate-500">Marcus H.</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('admin')}
                className="py-2.5 px-3 rounded-xl bg-white border border-maroon-200 text-maroon-900 hover:bg-maroon-50 text-xs font-bold transition-all text-center flex flex-col items-center space-y-0.5 shadow-xs"
              >
                <span>Administrator</span>
                <span className="text-xs font-medium text-slate-500">Dr. E. Reed</span>
              </button>
            </div>
          </div>

          {/* Validation Error Feedback */}
          {validationError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center space-x-2 animate-in fade-in">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-semibold text-slate-700">
                  University Email
                </label>
                {/* Dynamic Role Detection Hint */}
                {detectedRole && (
                  <span className={`px-2 py-0.5 rounded-md border text-xs font-mono font-semibold flex items-center space-x-1 ${detectedRole.color}`}>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Role: {detectedRole.label}</span>
                  </span>
                )}
              </div>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  placeholder="student@synapse.edu"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (validationError) setValidationError('');
                  }}
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-maroon-600 focus:ring-2 focus:ring-maroon-100 transition-colors font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-semibold text-slate-700">
                  Password
                </label>
                <span className="text-xs text-slate-500 font-mono">Demo: synapse2026</span>
              </div>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (validationError) setValidationError('');
                  }}
                  className="w-full pl-11 pr-11 py-2.5 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-maroon-600 focus:ring-2 focus:ring-maroon-100 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 absolute right-3 top-2.5 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-maroon-700 hover:bg-maroon-800 text-white font-bold text-sm tracking-wide transition-all shadow-sm flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating Credentials...' : 'Sign In to Lab Console'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Registration link */}
          <div className="pt-2 text-center text-sm text-slate-600 border-t border-slate-200">
            <span>Need departmental credentials? </span>
            <Link to="/register" className="text-maroon-700 hover:text-maroon-800 font-bold underline underline-offset-4">
              Register Student / Staff Account
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
