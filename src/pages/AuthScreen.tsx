import React, { useState } from 'react';
import {
  Mail,
  Lock,
  User,
  GraduationCap,
  Building,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  ShieldCheck,
  Wallet,
  Sparkles,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import { EngineeringProgram, YearLevel, UserProfile } from '../types';
import {
  signInWithGooglePopup,
  signUpWithEmail,
  signInWithEmail,
  sendPasswordReset,
  triggerEmailVerification
} from '../lib/firebase';
import { api } from '../lib/api';
import { ShearItLogo } from '../components/ShearItLogo';

interface AuthScreenProps {
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

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSuccess, allUsers }) => {
  const [tab, setTab] = useState<'login' | 'register' | 'forgot'>('login');

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [program, setProgram] = useState<EngineeringProgram>('Civil Engineering');
  const [yearLevel, setYearLevel] = useState<YearLevel>('3rd Year');
  const [university, setUniversity] = useState('University of the Philippines Diliman');
  const [paymongoAccountId, setPaymongoAccountId] = useState('');

  // Status feedback
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      const user = await signInWithGooglePopup();
      setSuccessMsg(`Welcome, ${user.name}! Redirecting to marketplace...`);
      setTimeout(() => {
        onSuccess(user);
      }, 500);
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      setErrorMsg(err.message || 'Google Sign-In failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email.trim()) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    if (tab === 'forgot') {
      setLoading(true);
      try {
        await sendPasswordReset(email.trim());
        setSuccessMsg(`Password reset instructions have been dispatched to ${email.trim()}. Please inspect your inbox.`);
      } catch (err: any) {
        setErrorMsg(err.message || 'Failed to dispatch reset email. Please ensure the email is correct.');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    if (tab === 'register') {
      if (!name.trim()) {
        setErrorMsg('Please enter your full name.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match. Please verify your password confirmation.');
        return;
      }
      if (password.length < 6) {
        setErrorMsg('Password must contain at least 6 characters.');
        return;
      }
    }

    setLoading(true);
    try {
      if (tab === 'register') {
        let user: UserProfile;
        try {
          user = await signUpWithEmail(
            email.trim(),
            password,
            name.trim(),
            program,
            yearLevel,
            university.trim(),
            paymongoAccountId.trim()
          );
        } catch (fbErr: any) {
          console.warn('Firebase Auth signup notice, falling back to backend auth API:', fbErr);
          const res = await api.register({
            name: name.trim(),
            email: email.trim(),
            password,
            phone: '',
            program,
            yearLevel,
            university: university.trim(),
          });
          user = res.user;
        }

        setVerificationSent(true);
        setSuccessMsg(`Account created successfully! Welcome to Shear It, ${user.name}. Redirecting...`);
        setTimeout(() => {
          onSuccess(user);
        }, 700);
      } else {
        let user: UserProfile;
        try {
          user = await signInWithEmail(email.trim(), password);
        } catch (fbErr: any) {
          console.warn('Firebase Auth signin notice, falling back to backend auth API:', fbErr);
          const res = await api.login(email.trim());
          user = res.user;
        }

        setSuccessMsg(`Welcome back, ${user.name}! Entering marketplace...`);
        setTimeout(() => {
          onSuccess(user);
        }, 500);
      }
    } catch (err: any) {
      console.error('Authentication Error:', err);
      let msg = err.message || 'Authentication error. Please check your credentials.';
      if (
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/invalid-credential'
      ) {
        msg = 'Invalid email or password. Please verify your credentials or register a free account.';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'This email is already registered. Please sign in or use Forgot Password.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Password is too weak. Please use at least 6 characters.';
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDemoPersona = (u: UserProfile) => {
    onSuccess(u);
  };

  const handleResendVerification = async () => {
    try {
      await triggerEmailVerification();
      alert('Verification email re-sent! Please inspect your email inbox.');
    } catch (e: any) {
      alert(e.message || 'Failed to resend verification email.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2D000B] via-[#4A0012] to-[#1F0008] text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Brand Bar */}
      <div className="max-w-6xl mx-auto w-full flex items-center justify-between py-2">
        <ShearItLogo variant="compact" theme="light" size="lg" />
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline text-xs text-[#E8A5A9] font-medium">
            Philippine Engineering Education Network
          </span>
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-white/10 text-white font-bold border border-white/20">
            Secure Portal
          </span>
        </div>
      </div>

      {/* Main Split Authentication Stage */}
      <div className="max-w-5xl mx-auto w-full my-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Platform Mission & Value Proposition (5 Cols) */}
        <div className="lg:col-span-5 space-y-6 text-white order-2 lg:order-1">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-mono font-bold border border-amber-400/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Verified Student Reviewers & Requests</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              Shear It Notes Marketplace
            </h1>
            <p className="text-sm text-[#F0D5DA] leading-relaxed">
              Access peer-inspected engineering reviewers, handwritten problem sets, and formula sheets across civil, mechanical, electrical, electronics, and chemical engineering.
            </p>
          </div>

          {/* Key Value Cards */}
          <div className="space-y-3">
            <div className="p-3.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 border border-amber-400/30">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-white">RA 10173 & Quality Peer Inspected</div>
                <div className="text-[#E8A5A9] text-[11px] mt-0.5 leading-relaxed">
                  Materials are audited for syllabus accuracy, legibility, and zero student PII before publication.
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-400/30">
                <Wallet className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-white">Direct PayMongo Payouts & Requests</div>
                <div className="text-[#E8A5A9] text-[11px] mt-0.5 leading-relaxed">
                  Post requests for hard-to-find study materials or earn direct payouts via GCash and Maya when uploading original notes.
                </div>
              </div>
            </div>
          </div>

          {/* Quick Demo Switcher for Evaluation */}
          <div className="p-4 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between text-xs text-[#E8A5A9]">
              <span className="font-bold uppercase tracking-wider text-[10px]">Instant Demo Personas</span>
              <span className="text-[10px] font-mono">1-Click Sign-In</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {allUsers.slice(0, 4).map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleSelectDemoPersona(u)}
                  className="px-2.5 py-2 text-left bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-xs transition-colors cursor-pointer group"
                >
                  <div className="font-bold text-white truncate text-[11px] group-hover:text-amber-300">
                    {u.name}
                  </div>
                  <div className="text-[10px] text-[#E8A5A9] truncate font-mono">
                    {u.role.toUpperCase()} · {(u.program || 'Engineering').slice(0, 10)}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Authentication Card (7 Cols) */}
        <div className="lg:col-span-7 order-1 lg:order-2">
          <div className="bg-white rounded-3xl shadow-2xl border border-[#F8EDEF] overflow-hidden text-slate-800">
            {/* Header Tabs */}
            <div className="p-6 bg-gradient-to-r from-[#800000] via-[#570018] to-[#400010] text-white">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] uppercase font-mono tracking-wider px-2.5 py-0.5 rounded-full bg-white/20 font-bold">
                  {tab === 'login' ? 'Welcome Back' : tab === 'register' ? 'Free Registration' : 'Password Recovery'}
                </span>
                <span className="text-xs text-amber-200 font-medium">
                  {tab === 'login' ? 'Sign in to access notes' : 'Join fellow engineers'}
                </span>
              </div>

              <h2 className="text-2xl font-black tracking-tight">
                {tab === 'login' && 'Sign In to Your Account'}
                {tab === 'register' && 'Create Your Free Account'}
                {tab === 'forgot' && 'Reset Your Password'}
              </h2>
              <p className="text-xs text-[#E8A5A9] mt-1">
                {tab === 'login' && 'Enter your credentials to access verified engineering reviewers and requests.'}
                {tab === 'register' && 'Create an account to browse, purchase, and submit note requests.'}
                {tab === 'forgot' && 'Enter your registered email and we will send you secure recovery instructions.'}
              </p>

              {/* Tab Navigation */}
              <div className="grid grid-cols-2 p-1 bg-black/30 rounded-xl mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setTab('login');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    tab === 'login'
                      ? 'bg-white text-[#800000] shadow-md'
                      : 'text-white/80 hover:text-white'
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
                  className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    tab === 'register'
                      ? 'bg-white text-[#800000] shadow-md'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  Create Free Account
                </button>
              </div>
            </div>

            {/* Form Stage */}
            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
              {/* Alert Messages */}
              {errorMsg && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                  <span className="leading-relaxed">{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                  <span className="leading-relaxed">{successMsg}</span>
                </div>
              )}

              {verificationSent && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-xs flex items-center justify-between gap-2">
                  <span>Verification email sent! Inspect your inbox to confirm your email.</span>
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    className="text-[11px] font-bold text-[#800000] hover:underline shrink-0"
                  >
                    Resend
                  </button>
                </div>
              )}

              {/* Form Input Fields */}
              {tab === 'register' && (
                <div>
                  <label className="block text-xs font-bold text-[#292329] mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#746B70] absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Engr. Juan Dela Cruz"
                      className="w-full pl-10 pr-4 py-2.5 text-xs bg-[#FAF9F9] border border-[#E8A5A9]/70 rounded-xl focus:border-[#800000] focus:ring-1 focus:ring-[#800000] focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#292329] mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#746B70] absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@university.edu.ph"
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-[#FAF9F9] border border-[#E8A5A9]/70 rounded-xl focus:border-[#800000] focus:ring-1 focus:ring-[#800000] focus:outline-none"
                  />
                </div>
              </div>

              {tab !== 'forgot' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-[#292329]">
                      Password *
                    </label>
                    {tab === 'login' && (
                      <button
                        type="button"
                        onClick={() => {
                          setTab('forgot');
                          setErrorMsg('');
                          setSuccessMsg('');
                        }}
                        className="text-[11px] font-semibold text-[#800000] hover:underline cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#746B70] absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 text-xs bg-[#FAF9F9] border border-[#E8A5A9]/70 rounded-xl focus:border-[#800000] focus:ring-1 focus:ring-[#800000] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-[#746B70] hover:text-[#292329]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {tab === 'register' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-[#292329] mb-1">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-[#746B70] absolute left-3.5 top-3" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-2.5 text-xs bg-[#FAF9F9] border border-[#E8A5A9]/70 rounded-xl focus:border-[#800000] focus:ring-1 focus:ring-[#800000] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#292329] mb-1">
                        Engineering Program *
                      </label>
                      <select
                        value={program}
                        onChange={(e) => setProgram(e.target.value as EngineeringProgram)}
                        className="w-full px-3 py-2 text-xs bg-[#FAF9F9] border border-[#E8A5A9]/70 rounded-xl focus:border-[#800000] focus:outline-none"
                      >
                        {PROGRAMS.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#292329] mb-1">
                        Year Level *
                      </label>
                      <select
                        value={yearLevel}
                        onChange={(e) => setYearLevel(e.target.value as YearLevel)}
                        className="w-full px-3 py-2 text-xs bg-[#FAF9F9] border border-[#E8A5A9]/70 rounded-xl focus:border-[#800000] focus:outline-none"
                      >
                        {YEAR_LEVELS.map((y) => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#292329] mb-1">
                      School / University (Optional)
                    </label>
                    <div className="relative">
                      <Building className="w-4 h-4 text-[#746B70] absolute left-3.5 top-3" />
                      <input
                        type="text"
                        value={university}
                        onChange={(e) => setUniversity(e.target.value)}
                        placeholder="e.g. Mapúa University, UP Diliman, UST"
                        className="w-full pl-10 pr-4 py-2.5 text-xs bg-[#FAF9F9] border border-[#E8A5A9]/70 rounded-xl focus:border-[#800000] focus:ring-1 focus:ring-[#800000] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#292329] mb-1">
                      PayMongo Account / GCash Payout ID (Optional)
                    </label>
                    <div className="relative">
                      <Wallet className="w-4 h-4 text-[#746B70] absolute left-3.5 top-3" />
                      <input
                        type="text"
                        value={paymongoAccountId}
                        onChange={(e) => setPaymongoAccountId(e.target.value)}
                        placeholder="e.g. acct_paymongo_student_0917"
                        className="w-full pl-10 pr-4 py-2.5 text-xs bg-[#FAF9F9] border border-[#E8A5A9]/70 rounded-xl focus:border-[#800000] focus:ring-1 focus:ring-[#800000] focus:outline-none font-mono"
                      />
                    </div>
                    <p className="text-[10px] text-[#746B70] mt-1">
                      Optional: You can provide this later in your profile when uploading reviewers for sale.
                    </p>
                  </div>
                </>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-[#800000] via-[#A01A33] to-[#C02636] hover:from-[#6B1E35] hover:to-[#A01A33] text-white font-bold text-sm rounded-xl transition-all shadow-md hover:shadow-lg hover:shadow-[#800000]/30 flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50 ring-1 ring-amber-400/30"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing Secure Authentication...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {tab === 'login' && 'Sign In & Enter Marketplace'}
                      {tab === 'register' && 'Complete Free Registration'}
                      {tab === 'forgot' && 'Send Password Reset Email'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {tab === 'forgot' && (
                <button
                  type="button"
                  onClick={() => {
                    setTab('login');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className="w-full py-2 text-xs font-semibold text-[#800000] hover:underline"
                >
                  Return to Sign In
                </button>
              )}

              {/* Google Sign In Divider */}
              {tab !== 'forgot' && (
                <>
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-[#F8EDEF]" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="px-3 bg-white text-[#746B70] uppercase font-mono text-[10px]">
                        Or Continue With
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="w-full py-2.5 px-4 border border-[#E8A5A9] rounded-xl hover:bg-slate-50 text-xs font-bold text-[#292329] flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs"
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
                    <span>Google Sign-In (Firebase Auth)</span>
                  </button>
                </>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Footer Disclaimer */}
      <div className="max-w-6xl mx-auto w-full text-center text-xs text-[#E8A5A9]/80 py-2 border-t border-white/10">
        Shear It Philippine Academic Notes Marketplace · RA 10173 Compliant · Direct PayMongo Payout Integration
      </div>
    </div>
  );
};
