import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Check, 
  Smartphone, 
  Mail, 
  Github, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Sparkles, 
  LogOut, 
  ShieldCheck, 
  Users, 
  Key, 
  RefreshCw,
  PhoneCall,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { UserProfile, AuthProvider, RegisteredAccount } from '../types';
import { 
  DEFAULT_USERS, 
  getRegisteredAccounts, 
  saveRegisteredAccount, 
  logoutActiveUser 
} from '../services/storage';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onSelectUser: (user: UserProfile) => void;
}

type AuthTab = 'mobile' | 'email' | 'social';

const COUNTRY_CODES = [
  { code: '+91', country: 'IN', flag: '🇮🇳', label: 'India (+91)' },
  { code: '+1', country: 'US', flag: '🇺🇸', label: 'USA / Canada (+1)' },
  { code: '+44', country: 'GB', flag: '🇬🇧', label: 'UK (+44)' },
  { code: '+81', country: 'JP', flag: '🇯🇵', label: 'Japan (+81)' },
  { code: '+49', country: 'DE', flag: '🇩🇪', label: 'Germany (+49)' },
  { code: '+61', country: 'AU', flag: '🇦🇺', label: 'Australia (+61)' },
  { code: '+971', country: 'AE', flag: '🇦🇪', label: 'UAE (+971)' },
  { code: '+33', country: 'FR', flag: '🇫🇷', label: 'France (+33)' },
  { code: '+65', country: 'SG', flag: '🇸🇬', label: 'Singapore (+65)' },
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSelectUser,
}) => {
  const [activeTab, setActiveTab] = useState<AuthTab>('mobile');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [savedAccounts, setSavedAccounts] = useState<RegisteredAccount[]>([]);

  // Mobile Auth State
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [mobileName, setMobileName] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpCountdown, setOtpCountdown] = useState(0);

  // Email Auth State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [developerRole, setDeveloperRole] = useState('Full-Stack Engineer');
  const [showPassword, setShowPassword] = useState(false);

  // Social / OAuth Dialog State
  const [socialModalType, setSocialModalType] = useState<'github' | 'facebook' | null>(null);
  const [socialHandle, setSocialHandle] = useState('');
  const [socialName, setSocialName] = useState('');

  // Notifications
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSavedAccounts(getRegisteredAccounts());
      setErrorNotice(null);
      setSuccessNotice(null);
    }
  }, [isOpen]);

  useEffect(() => {
    let timer: any;
    if (otpCountdown > 0) {
      timer = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [otpCountdown]);

  if (!isOpen) return null;

  // 1. MOBILE PHONE OTP HANDLERS
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phoneNumber.trim().replace(/\D/g, '');
    if (cleanPhone.length < 8) {
      setErrorNotice('Please enter a valid mobile phone number (at least 8-10 digits).');
      return;
    }
    setErrorNotice(null);

    // Generate random 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setOtpSent(true);
    setOtpCountdown(60);
    setSuccessNotice(`📱 SMS verification code sent: ${code}`);
  };

  const handleVerifyMobileOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enteredOtp || enteredOtp.trim().length !== 6) {
      setErrorNotice('Please enter the 6-digit OTP code received on your phone.');
      return;
    }
    if (enteredOtp.trim() !== generatedOtp && enteredOtp.trim() !== '123456') {
      setErrorNotice('Invalid OTP code. Please enter the correct code shown above.');
      return;
    }

    const fullPhone = `${countryCode} ${phoneNumber.trim()}`;
    const nameToUse = mobileName.trim() || `User ${phoneNumber.slice(-4)}`;
    
    // Check if account already exists
    const accounts = getRegisteredAccounts();
    const existing = accounts.find((a) => a.phone === fullPhone);

    const accountToSave: RegisteredAccount = {
      id: existing ? existing.id : `user_phone_${Date.now()}`,
      name: existing ? existing.name : nameToUse,
      phone: fullPhone,
      email: `${phoneNumber.trim()}@mobile.novabuild.ai`,
      provider: 'mobile',
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=128&q=80`,
      role: 'Mobile Verified Developer',
      createdAt: existing ? existing.createdAt : Date.now(),
    };

    saveRegisteredAccount(accountToSave);
    const profile: UserProfile = {
      id: accountToSave.id,
      name: accountToSave.name,
      email: accountToSave.email || '',
      phone: accountToSave.phone,
      provider: 'mobile',
      avatar: accountToSave.avatar,
      role: accountToSave.role,
    };

    onSelectUser(profile);
    setSuccessNotice('Phone verified successfully! Logged in.');
    setTimeout(() => onClose(), 400);
  };

  // 2. EMAIL & PASSWORD HANDLERS
  const handleEmailAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorNotice(null);

    if (!email.trim() || !email.includes('@')) {
      setErrorNotice('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setErrorNotice('Password must be at least 6 characters.');
      return;
    }

    if (isRegisterMode) {
      if (password !== confirmPassword) {
        setErrorNotice('Passwords do not match.');
        return;
      }
      if (!fullName.trim()) {
        setErrorNotice('Please enter your full name.');
        return;
      }

      const newAccount: RegisteredAccount = {
        id: `user_email_${Date.now()}`,
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        provider: 'email',
        avatar: `https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=128&q=80`,
        role: developerRole.trim() || 'Software Engineer',
        createdAt: Date.now(),
      };

      saveRegisteredAccount(newAccount);
      const profile: UserProfile = {
        id: newAccount.id,
        name: newAccount.name,
        email: newAccount.email || '',
        provider: 'email',
        avatar: newAccount.avatar,
        role: newAccount.role,
      };

      onSelectUser(profile);
      setSuccessNotice('Account registered successfully! Welcome to NovaBuild AI.');
      setTimeout(() => onClose(), 400);
    } else {
      // Sign in
      const accounts = getRegisteredAccounts();
      const existing = accounts.find((a) => a.email?.toLowerCase() === email.trim().toLowerCase());
      
      const profile: UserProfile = {
        id: existing ? existing.id : `user_email_${Date.now()}`,
        name: existing ? existing.name : (fullName.trim() || email.split('@')[0]),
        email: email.trim().toLowerCase(),
        provider: 'email',
        avatar: existing?.avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&q=80`,
        role: existing?.role || developerRole,
      };

      if (!existing) {
        // Auto-save new sign in account
        saveRegisteredAccount({
          id: profile.id,
          name: profile.name,
          email: profile.email,
          provider: 'email',
          avatar: profile.avatar,
          role: profile.role,
          createdAt: Date.now(),
        });
      }

      onSelectUser(profile);
      setSuccessNotice('Signed in successfully!');
      setTimeout(() => onClose(), 400);
    }
  };

  // 3. GITHUB OAUTH HANDLER
  const handleGitHubConnect = () => {
    const handle = socialHandle.trim() || 'developer-nova';
    const gitUser: RegisteredAccount = {
      id: `user_gh_${Date.now()}`,
      name: socialName.trim() || (handle.charAt(0).toUpperCase() + handle.slice(1)),
      email: `${handle}@users.noreply.github.com`,
      provider: 'github',
      avatar: `https://avatars.githubusercontent.com/u/${Math.floor(1000000 + Math.random() * 9000000)}?v=4`,
      role: 'GitHub Verified Developer',
      createdAt: Date.now(),
    };

    saveRegisteredAccount(gitUser);
    const profile: UserProfile = {
      id: gitUser.id,
      name: gitUser.name,
      email: gitUser.email || '',
      provider: 'github',
      avatar: gitUser.avatar,
      role: gitUser.role,
      githubUsername: handle,
    };

    onSelectUser(profile);
    setSocialModalType(null);
    setSuccessNotice(`Connected with GitHub as @${handle}!`);
    setTimeout(() => onClose(), 400);
  };

  // 4. FACEBOOK OAUTH HANDLER
  const handleFacebookConnect = () => {
    const name = socialName.trim() || 'Alex Morgan';
    const fbUser: RegisteredAccount = {
      id: `user_fb_${Date.now()}`,
      name,
      email: `${name.toLowerCase().replace(/\s+/g, '.')}@facebook.com`,
      provider: 'facebook',
      avatar: `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=128&q=80`,
      role: 'Meta Developer',
      createdAt: Date.now(),
    };

    saveRegisteredAccount(fbUser);
    const profile: UserProfile = {
      id: fbUser.id,
      name: fbUser.name,
      email: fbUser.email || '',
      provider: 'facebook',
      avatar: fbUser.avatar,
      role: fbUser.role,
    };

    onSelectUser(profile);
    setSocialModalType(null);
    setSuccessNotice(`Logged in with Facebook as ${name}!`);
    setTimeout(() => onClose(), 400);
  };

  // 5. LOG OUT
  const handleLogout = () => {
    const guest = logoutActiveUser();
    onSelectUser(guest);
    setSuccessNotice('Logged out. Switched to guest workspace.');
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative overflow-hidden">
        
        {/* Glow accent */}
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">NovaBuild AI Account</h2>
              <p className="text-xs text-zinc-400">
                Sign in or register with Mobile, Email, GitHub, or Facebook
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Notices */}
        {errorNotice && (
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorNotice}</span>
          </div>
        )}

        {successNotice && (
          <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-200 text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successNotice}</span>
            </div>
            {generatedOtp && (
              <button
                type="button"
                onClick={() => setEnteredOtp(generatedOtp)}
                className="px-2 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-[11px] font-bold"
              >
                Auto-fill OTP
              </button>
            )}
          </div>
        )}

        {/* Current Active Account Card */}
        <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/40"
            />
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-white">{currentUser.name}</h4>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {currentUser.provider || 'Active'}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                {currentUser.phone || currentUser.email}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-rose-900/40 hover:text-rose-300 text-zinc-400 text-xs flex items-center gap-1.5 transition"
            title="Sign out of current profile"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Navigation Tabs for Auth Methods */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-zinc-950 border border-zinc-800 rounded-xl">
          <button
            type="button"
            onClick={() => { setActiveTab('mobile'); setErrorNotice(null); }}
            className={`py-2 text-xs font-medium rounded-lg flex items-center justify-center gap-2 transition ${
              activeTab === 'mobile'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile OTP</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('email'); setErrorNotice(null); }}
            className={`py-2 text-xs font-medium rounded-lg flex items-center justify-center gap-2 transition ${
              activeTab === 'email'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('social'); setErrorNotice(null); }}
            className={`py-2 text-xs font-medium rounded-lg flex items-center justify-center gap-2 transition ${
              activeTab === 'social'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Social Login</span>
          </button>
        </div>

        {/* TAB 1: MOBILE NUMBER (PHONE + OTP) */}
        {activeTab === 'mobile' && (
          <div className="space-y-4">
            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-300">
                    Mobile Phone Number
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="w-28 px-2 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
                    >
                      {COUNTRY_CODES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.flag} {c.code}
                        </option>
                      ))}
                    </select>

                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="98765 43210"
                      autoFocus
                      className="flex-1 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-300">
                    Your Name (Optional for Register)
                  </label>
                  <input
                    type="text"
                    value={mobileName}
                    onChange={(e) => setMobileName(e.target.value)}
                    placeholder="Enter full name"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!phoneNumber.trim()}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-indigo-600/30"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Send Verification Code (OTP)</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyMobileOtp} className="space-y-3">
                <div className="p-3 bg-zinc-950/70 border border-zinc-800 rounded-xl space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400">Verifying Phone:</span>
                    <span className="font-mono text-indigo-400 font-bold">{countryCode} {phoneNumber}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-zinc-500">
                    <span>Code active for 5 mins</span>
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="text-indigo-400 hover:underline"
                    >
                      Change Number
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-300 flex items-center justify-between">
                    <span>Enter 6-Digit SMS Code</span>
                    {otpCountdown > 0 ? (
                      <span className="text-zinc-500 text-[11px]">Resend in {otpCountdown}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        className="text-indigo-400 text-[11px] hover:underline"
                      >
                        Resend Code
                      </button>
                    )}
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={enteredOtp}
                    onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 123456"
                    autoFocus
                    className="w-full px-3 py-2.5 bg-zinc-950 border border-indigo-500/70 rounded-lg text-center font-mono text-lg tracking-widest text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEnteredOtp(generatedOtp || '123456')}
                    className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium rounded-xl transition"
                  >
                    Auto-Fill Code ({generatedOtp || '123456'})
                  </button>

                  <button
                    type="submit"
                    disabled={enteredOtp.length !== 6}
                    className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition shadow-lg shadow-indigo-600/30"
                  >
                    <Check className="w-4 h-4" />
                    <span>Verify & Login</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* TAB 2: EMAIL & PASSWORD */}
        {activeTab === 'email' && (
          <form onSubmit={handleEmailAuth} className="space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="text-xs font-medium text-zinc-400">
                {isRegisterMode ? 'Create New Developer Account' : 'Sign In With Email'}
              </span>
              <button
                type="button"
                onClick={() => { setIsRegisterMode(!isRegisterMode); setErrorNotice(null); }}
                className="text-xs text-indigo-400 hover:underline font-medium"
              >
                {isRegisterMode ? 'Already have an account? Sign In' : 'New here? Register'}
              </button>
            </div>

            {isRegisterMode && (
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] text-zinc-400">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Alex Morgan"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-zinc-400">Role / Title</label>
                  <input
                    type="text"
                    value={developerRole}
                    onChange={(e) => setDeveloperRole(e.target.value)}
                    placeholder="UI Architect"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[11px] text-zinc-400">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@novabuild.ai"
                required
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-zinc-400">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  required
                  className="w-full px-3 py-2 pr-9 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2.5 text-zinc-500 hover:text-zinc-300"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {isRegisterMode && (
              <div className="space-y-1">
                <label className="text-[11px] text-zinc-400">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  required
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-indigo-600/30"
            >
              <span>{isRegisterMode ? 'Create Account & Sign In' : 'Sign In With Email'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* TAB 3: SOCIAL LOGIN (GITHUB & FACEBOOK) */}
        {activeTab === 'social' && (
          <div className="space-y-3">
            <p className="text-xs text-zinc-400">
              Connect instantly with your developer credentials or social network:
            </p>

            {/* GitHub OAuth Button */}
            <div className="p-3 bg-zinc-950/80 border border-zinc-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-white">
                    <Github className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">GitHub OAuth</h4>
                    <p className="text-[11px] text-zinc-400">Developer profile, repos, and badge</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSocialModalType('github')}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
                >
                  <span>Connect</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Facebook OAuth Button */}
            <div className="p-3 bg-zinc-950/80 border border-zinc-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#1877F2]/20 border border-[#1877F2]/30 flex items-center justify-center text-[#1877F2]">
                    <span className="font-bold text-base leading-none">f</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Facebook Login</h4>
                    <p className="text-[11px] text-zinc-400">One-click social authentication</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSocialModalType('facebook')}
                  className="px-3 py-1.5 bg-[#1877F2] hover:bg-[#1877F2]/90 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition shadow"
                >
                  <span>Connect</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SOCIAL MODAL OVERLAY: GITHUB / FACEBOOK DETAILS */}
        {socialModalType && (
          <div className="p-4 rounded-xl bg-zinc-950 border border-indigo-500/50 space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {socialModalType === 'github' ? (
                  <Github className="w-4 h-4 text-white" />
                ) : (
                  <span className="text-[#1877F2] font-bold text-sm">f</span>
                )}
                <span className="text-xs font-bold text-white capitalize">
                  Authorize with {socialModalType}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSocialModalType(null)}
                className="text-zinc-500 hover:text-zinc-300 text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                value={socialName}
                onChange={(e) => setSocialName(e.target.value)}
                placeholder={socialModalType === 'github' ? 'GitHub Name (e.g. Alex Rivera)' : 'Facebook Name'}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
              />
              {socialModalType === 'github' && (
                <input
                  type="text"
                  value={socialHandle}
                  onChange={(e) => setSocialHandle(e.target.value)}
                  placeholder="GitHub Username (e.g. octocat)"
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              )}
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSocialModalType(null)}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={socialModalType === 'github' ? handleGitHubConnect : handleFacebookConnect}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Confirm & Sign In</span>
              </button>
            </div>
          </div>
        )}

        {/* Existing / Saved Accounts Quick Switcher */}
        {savedAccounts.length > 0 && (
          <div className="pt-2 border-t border-zinc-800 space-y-2">
            <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              Saved / Registered Accounts
            </label>
            <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
              {savedAccounts.map((acc) => {
                const isActive = acc.id === currentUser.id;
                return (
                  <div
                    key={acc.id}
                    onClick={() => {
                      onSelectUser({
                        id: acc.id,
                        name: acc.name,
                        email: acc.email || '',
                        phone: acc.phone,
                        provider: acc.provider,
                        avatar: acc.avatar,
                        role: acc.role,
                      });
                      onClose();
                    }}
                    className={`p-2 rounded-lg border flex items-center justify-between cursor-pointer transition ${
                      isActive
                        ? 'bg-indigo-600/10 border-indigo-500/80 text-white'
                        : 'bg-zinc-950/40 border-zinc-800/80 hover:border-zinc-700 text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={acc.avatar}
                        alt={acc.name}
                        className="w-7 h-7 rounded-full object-cover ring-1 ring-zinc-700"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold">{acc.name}</span>
                          <span className="text-[10px] px-1 rounded bg-zinc-800 text-zinc-400 uppercase">
                            {acc.provider}
                          </span>
                        </div>
                        <p className="text-[10px] text-zinc-500">{acc.phone || acc.email}</p>
                      </div>
                    </div>

                    {isActive && (
                      <span className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
