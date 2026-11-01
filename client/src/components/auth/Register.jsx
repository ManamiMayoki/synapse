import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { 
  User, 
  Mail, 
  Lock, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  GraduationCap,
  Wrench,
  ShieldCheck,
  Eye,
  EyeOff,
  LogIn,
  UserPlus
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
      description: 'Access course labs, borrow hardware & submit workstation tickets',
      icon: GraduationCap,
      color: 'border-slate-200 bg-white text-slate-700 hover:border-slate-300',
      activeColor: 'border-maroon-700 bg-maroon-50 text-maroon-900 shadow-xs ring-1 ring-maroon-600',
    },
    {
      id: 'staff',
      title: 'Staff / Lab Assistant',
      description: 'Triage workstation repairs, manage inventory & QR checkouts',
      icon: Wrench,
      color: 'border-slate-200 bg-white text-slate-700 hover:border-slate-300',
      activeColor: 'border-amber-600 bg-amber-50 text-amber-900 shadow-xs ring-1 ring-amber-500',
    },
    {
      id: 'admin',
      title: 'Administrator',
      description: 'Infrastructure governance, predictive AI & user role permissions',
      icon: ShieldCheck,
      color: 'border-slate-200 bg-white text-slate-700 hover:border-slate-300',
      activeColor: 'border-slate-800 bg-slate-100 text-slate-900 shadow-xs ring-1 ring-slate-700',
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
        
        // Route to dashboard
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
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 lg:p-8 bg-slate-50">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white p-6 sm:p-10 border border-slate-200 shadow-xl space-y-6">
        
        {/* Segmented Sign In / Register Tab Switcher */}
        <div className="flex items-center p-1 rounded-2xl bg-slate-100 border border-slate-200">
          <Link
            to="/login"
            className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-center text-slate-600 hover:text-slate-900 transition-colors flex items-center justify-center space-x-2"
          >
            <LogIn className="w-4 h-4 text-slate-500" />
            <span>Sign In</span>
          </Link>
          <Link
            to="/register"
            className="flex-1 py-2.5 rounded-xl font-bold text-sm text-center bg-white text-maroon-800 shadow-sm border border-slate-200/80 flex items-center justify-center space-x-2"
          >
            <UserPlus className="w-4 h-4 text-maroon-700" />
            <span>Register</span>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-maroon-700 to-maroon-800 p-0.5 shadow-sm">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-xl font-black text-maroon-700">
              ⚡
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Create Department Account
          </h2>
          <p className="text-sm text-slate-600">
            University CSE Department Lab & Asset Management System
          </p>
        </div>

        {/* Validation Error Banner */}
        {validationError && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center space-x-2 animate-in fade-in">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
            <span>{validationError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Explicit Role Selection (Cards) */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">
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
                        : opt.color
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Icon className="w-5 h-5 text-slate-700" />
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-maroon-700" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-900">{opt.title}</p>
                      <p className="text-xs text-slate-500 mt-1 leading-snug">{opt.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* User Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Maya Lin"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (validationError) setValidationError('');
                  }}
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-maroon-600 focus:ring-2 focus:ring-maroon-100 transition-colors font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                University Email
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  placeholder="name@synapse.edu"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (validationError) setValidationError('');
                  }}
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-maroon-600 focus:ring-2 focus:ring-maroon-100 transition-colors font-medium"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                {role === 'student' ? 'Student ID Number' : 'Staff / Employee ID'}
              </label>
              <input
                type="text"
                placeholder={role === 'student' ? 'CSE-2024-xxx' : 'STAFF-LAB-xx'}
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-maroon-600 focus:ring-2 focus:ring-maroon-100 font-mono transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (validationError) setValidationError('');
                  }}
                  className="w-full pl-11 pr-11 py-2.5 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-maroon-600 focus:ring-2 focus:ring-maroon-100 transition-colors"
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
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-maroon-700 hover:bg-maroon-800 text-white font-bold text-sm tracking-wide transition-all shadow-sm flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <span>{loading ? 'Registering Department Account...' : 'Complete Registration & Enter Console'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 text-center text-sm text-slate-600 border-t border-slate-200">
          <span>Already registered in the CSE Department directory? </span>
          <Link to="/login" className="text-maroon-700 hover:text-maroon-800 font-bold underline underline-offset-4">
            Sign In
          </Link>
        </div>

      </div>
    </div>
  );
}
