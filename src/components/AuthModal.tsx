import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, ArrowRight, UserCheck, ShieldCheck, Mail, Lock, User, Wallet } from 'lucide-react';
import { EngineeringProgram, YearLevel, UserProfile } from '../types';
import { signInWithGooglePopup, signUpWithEmail, signInWithEmail } from '../lib/firebase';
import { setAuthToken } from '../lib/api';
import { ShearItLogo } from './ShearItLogo';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
  allUsers: UserProfile[];
}

const PROGRAMS: EngineeringProgram[] = [
  'Civil Engineering',
  'Mechanical Engineering',
  'Electrical Engineering',
  'Electronics Engineering',
  'Computer Engineering',
  'Chemical Engineering',
  'Industrial Engineering',
  'Mining Engineering',
  'Geological Engineering',
  'Sanitary Engineering',
  'Environmental Engineering',
  'Agricultural and Biosystems Engineering',
  'Other Engineering Programs',
];

const YEAR_LEVELS: YearLevel[] = [
  '1st Year',
  '2nd Year',
  '3rd Year',
  '4th Year',
  '5th Year',
  'Irregular Student',
  'Graduate Student',
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  allUsers,
}) => {
  const [tab, setTab] = useState<'register' | 'login'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [paymongoAccountId, setPaymongoAccountId] = useState('');
  const [program, setProgram] = useState<EngineeringProgram>('Civil Engineering');
  const [yearLevel, setYearLevel] = useState<YearLevel>('3rd Year');
  const [university, setUniversity] = useState('University of the Philippines Diliman');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      const user = await signInWithGooglePopup();
      setAuthToken(user.id || user.uid);
      setSuccessMsg(`Welcome, ${user.name}! Connected via Firebase Authentication.`);
      setTimeout(() => {
        onSuccess(user);
        onClose();
      }, 600);
    } catch (err: any) {
      setErrorMsg(err.message || 'Google Sign-In failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter your email and password.');
      return;
    }

    setLoading(true);
    try {
      if (tab === 'register') {
        if (!name.trim()) {
          setErrorMsg('Please enter your full name.');
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setErrorMsg('Passwords do not match.');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setErrorMsg('Password must be at least 6 characters.');
          setLoading(false);
          return;
        }

        const user = await signUpWithEmail(
          email.trim(),
          password,
          name.trim(),
          paymongoAccountId.trim()
        );
        setAuthToken(user.id || user.uid);
        setSuccessMsg(`Account created! Welcome to Shear It, ${user.name}.`);
        setTimeout(() => {
          onSuccess(user);
          onClose();
        }, 700);
      } else {
        const user = await signInWithEmail(email.trim(), password);
        setAuthToken(user.id || user.uid);
        setSuccessMsg(`Welcome back, ${user.name}!`);
        setTimeout(() => {
          onSuccess(user);
          onClose();
        }, 600);
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      let msg = err.message || 'Authentication error. Please check your credentials.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        msg = 'Invalid email or password. Please verify or register a new account.';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'This email is already registered. Please sign in instead.';
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDemoPersona = (u: UserProfile) => {
    setAuthToken(u.id || u.uid);
    onSuccess(u);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-[#F8EDEF] overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 bg-gradient-to-br from-[#800000] via-[#570018] to-[#400010] text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 mb-2">
            <ShearItLogo variant="compact" theme="light" size="sm" />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight">
            {tab === 'register' ? 'Join the Notes Marketplace' : 'Sign In to Shear It'}
          </h2>
          <p className="text-xs text-[#E5D6DA] mt-1">
            {tab === 'register'
              ? 'Share verified engineering reviewers and receive direct PayMongo payouts.'
              : 'Access your purchased notes and verified engineering materials.'}
          </p>

          {/* Tab Selector */}
          <div className="flex p-1 bg-black/25 rounded-xl mt-4">
            <button
              type="button"
              onClick={() => {
                setTab('login');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                tab === 'login' ? 'bg-white text-[#800000] shadow-sm' : 'text-white/80 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('register');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                tab === 'register' ? 'bg-white text-[#800000] shadow-sm' : 'text-white/80 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {/* Quick Google Sign-In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-2.5 px-4 bg-white border border-[#E8A5A9] hover:bg-[#F8EDEF]/50 text-[#292329] font-bold text-xs rounded-xl transition-all shadow-2xs hover:shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google Sign-In</span>
          </button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-[#F8EDEF] w-full" />
            <span className="bg-white px-3 text-[10px] uppercase font-mono text-[#746B70] tracking-wider absolute">
              or with Email & Password
            </span>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {tab === 'register' && (
              <>
                <div>
                  <label className="block text-[11px] font-bold text-[#292329] mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 w-4 h-4 text-[#800000]" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Juan dela Cruz"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF9F9] border border-[#E8A5A9]/70 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800000]/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#292329] mb-1">
                    PayMongo Payout ID / Banking Details
                  </label>
                  <div className="relative">
                    <Wallet className="absolute left-3 top-2.5 w-4 h-4 text-[#800000]" />
                    <input
                      type="text"
                      value={paymongoAccountId}
                      onChange={(e) => setPaymongoAccountId(e.target.value)}
                      placeholder="acct_paymongo_123 or GCash: 0917-000-0000"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF9F9] border border-[#E8A5A9]/70 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800000]/20 font-mono"
                    />
                  </div>
                  <p className="text-[10px] text-[#746B70] mt-0.5">
                    Your destination credentials where buyer PayMongo payments route directly.
                  </p>
                </div>
              </>
            )}

            <div>
              <label className="block text-[11px] font-bold text-[#292329] mb-1">
                Student Email <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-[#800000]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@university.edu.ph"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF9F9] border border-[#E8A5A9]/70 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800000]/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#292329] mb-1">
                Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-[#800000]" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF9F9] border border-[#E8A5A9]/70 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800000]/20"
                />
              </div>
            </div>

            {tab === 'register' && (
              <div>
                <label className="block text-[11px] font-bold text-[#292329] mb-1">
                  Confirm Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-[#800000]" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF9F9] border border-[#E8A5A9]/70 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800000]/20"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 bg-gradient-to-r from-[#800000] via-[#A01A33] to-[#C02636] hover:from-[#6B1E35] hover:to-[#A01A33] text-white font-bold text-xs rounded-xl transition-all shadow-sm hover:shadow-md hover:shadow-[#800000]/25 cursor-pointer disabled:opacity-50"
            >
              {loading
                ? 'Processing...'
                : tab === 'register'
                ? 'Create Marketplace Account'
                : 'Sign In to Account'}
            </button>
          </form>

          {/* Quick Demo Switcher */}
          <div className="pt-3 border-t border-[#F8EDEF]">
            <p className="text-[10px] font-mono text-[#746B70] uppercase tracking-wider mb-1.5 text-center">
              Quick Test Personas
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {allUsers.map((u) => (
                <button
                  key={u.id || u.uid}
                  type="button"
                  onClick={() => handleSelectDemoPersona(u)}
                  className="p-1.5 text-left text-[11px] bg-[#FAF9F9] hover:bg-[#F8EDEF] border border-[#F8EDEF] rounded-lg transition-colors cursor-pointer"
                >
                  <p className="font-bold text-[#292329] truncate">{u.name}</p>
                  <p className="text-[9px] text-[#800000] font-mono uppercase">{u.role}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
