import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { 
  User, 
  Mail, 
  Lock, 
  Shield, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  GraduationCap,
  Wrench,
  ShieldCheck,
  Eye,
  EyeOff
} from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [studentId, setStudentId] = useState('');
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState('');

  const roleOptions = [
    {
      id: 'student',
      title: 'Student',
      description: 'Access course labs, borrow microcontrollers & submit issue tickets',
      icon: GraduationCap,
      color: 'border-cyan-500/50 bg-cyan-950/20 text-cyan-300',
      activeColor: 'border-cyan-400 bg-cyan-950/50 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.3)]',
    },
    {
      id: 'staff',
      title: 'Staff / Lab Assistant',
      description: 'Triage workstation repairs, manage hardware inventory & QR checkouts',
      icon: Wrench,
      color: 'border-amber-500/50 bg-amber-950/20 text-amber-300',
      activeColor: 'border-amber-400 bg-amber-950/50 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.3)]',
    },
    {
      id: 'admin',
      title: 'Administrator',
      description: 'Department infrastructure governance, predictive AI & user role management',
      icon: ShieldCheck,
      color: 'border-maroon-600/50 bg-maroon-950/30 text-rose-300',
      activeColor: 'border-rose-400 bg-maroon-950/60 text-rose-200 shadow-glow-maroon',
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (!name.trim()) {
      setValidationError('Please enter your full name.');
      return;
    }
    if (!email || !email.includes('@')) {
      setValidationError('Please provide a valid university email address.');
      return;
    }
    if (!password || password.length < 6) {
      setValidationError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      const generatedId = studentId.trim() || 
        (role === 'student' ? `CSE-2024-${Math.floor(100 + Math.random() * 900)}` :
         role === 'staff' ? `STAFF-LAB-${Math.floor(10 + Math.random() * 90)}` :
         `ADMIN-DIR-${Math.floor(10 + Math.random() * 90)}`);

      const res = await register({
        name: name.trim(),
        email: email.trim(),
        studentId: generatedId,
        role,
        department: 'Computer Science & Engineering',
      });

      if (res.success) {
        addToast(`Account created! Logged in as ${res.user.name} (${role.toUpperCase()})`, 'success', 'Registration Complete');
        
        // Instantly route to the correct role dashboard
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      setValidationError(err.message || 'Registration failed.');
      addToast(err.message || 'Registration failed.', 'error', 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 lg:p-8 bg-radial-vignette">
      <div className="relative w-full max-w-2xl rounded-3xl glass-card p-6 sm:p-10 border border-gold-500/30 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-maroon-700 to-gold-600 p-0.5 shadow-glow-maroon">
            <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center text-xl font-black text-gold-300">
              ⚡
            </div>
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Create <span className="bg-gradient-to-r from-gold-300 to-amber-200 bg-clip-text text-transparent">Synapse</span> Account
          </h2>
          <p className="text-xs text-slate-400">
            University CSE Department Lab & Asset Management System
          </p>
        </div>

        {/* Validation Error Banner */}
        {validationError && (
          <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs flex items-center space-x-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{validationError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Explicit Role Selection (Cards) */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Select Department Role
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {roleOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = role === opt.id;

                return (
                  <div
                    key={opt.id}
                    onClick={() => setRole(opt.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? opt.activeColor
                        : 'bg-zinc-900/60 border-white/5 hover:border-white/20 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Icon className="w-5 h-5" />
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-gold-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-xs text-white">{opt.title}</p>
                      <p className="text-[10px] text-slate-400 mt-1 leading-snug">{opt.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* User Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Maya Lin"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (validationError) setValidationError('');
                  }}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900/90 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-gold-400 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                University Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  placeholder="name@synapse.edu"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (validationError) setValidationError('');
                  }}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900/90 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-gold-400 transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                {role === 'student' ? 'Student ID Number' : 'Staff / Employee ID'}
              </label>
              <input
                type="text"
                placeholder={role === 'student' ? 'CSE-2024-xxx' : 'STAFF-LAB-xx'}
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900/90 border border-white/10 text-xs text-white focus:outline-none focus:border-gold-400 font-mono transition-colors"
              />
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
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (validationError) setValidationError('');
                  }}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-zinc-900/90 border border-white/10 text-xs text-white focus:outline-none focus:border-gold-400 transition-colors"
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
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-maroon-700 via-maroon-800 to-gold-600 hover:from-maroon-600 hover:to-gold-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-glow-maroon flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <span>{loading ? 'Registering Department Account...' : 'Complete Registration & Enter Console'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-slate-400 border-t border-white/10">
          <span>Already registered in the CSE Department directory? </span>
          <Link to="/login" className="text-gold-400 hover:text-gold-300 font-semibold underline underline-offset-4">
            Sign In
          </Link>
        </div>

      </div>
    </div>
  );
}
