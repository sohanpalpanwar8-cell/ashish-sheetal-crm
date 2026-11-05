/**
 * Secure Login & Portal Lock Screen
 * Role-Based Access Gatekeeper with 4-Digit Secret PIN & Direct Agent Deep Links
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Lock,
  Unlock,
  KeyRound,
  Shield,
  Sparkles,
  UserCheck,
  Eye,
  EyeOff,
  Globe,
  Sun,
  Moon,
  Info,
} from 'lucide-react';

export const LoginPortal: React.FC = () => {
  const { users, currentUser, login, language, setLanguage, theme, toggleTheme, t } = useApp();

  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const urlPortal = searchParams.get('portal') || searchParams.get('role');
  const hasAdminParam = searchParams.has('admin') || urlPortal === 'admin';
  const hasCrmParam = searchParams.has('crm') || urlPortal === 'crm';
  const hasAgentParam = searchParams.has('agent') || urlPortal === 'agent';

  // Active portal mode: 'admin' | 'crm' | 'agent'
  const [currentPortal, setCurrentPortal] = useState<'admin' | 'crm' | 'agent'>(() => {
    if (hasCrmParam) return 'crm';
    if (hasAgentParam) return 'agent';
    if (hasAdminParam) return 'admin';
    return 'admin';
  });

  // Filter accounts strictly by portal
  const portalUsers = users.filter((u) => {
    if (currentPortal === 'admin') return u.role === 'main_super_admin' || u.role === 'admin';
    if (currentPortal === 'crm') return u.role === 'crm_executive';
    if (currentPortal === 'agent') return u.role === 'agent' || u.role === 'team_manager';
    return true;
  });

  const [selectedUserId, setSelectedUserId] = useState<string>(() => {
    const directAgent = searchParams.get('agent') || searchParams.get('user');
    if (directAgent && users.some((u) => u.id === directAgent)) {
      return directAgent;
    }
    return portalUsers[0]?.id || users[0].id;
  });

  // Keep selected user synchronized with portal changes
  useEffect(() => {
    if (!portalUsers.some((u) => u.id === selectedUserId)) {
      if (portalUsers[0]) setSelectedUserId(portalUsers[0].id);
    }
  }, [currentPortal, portalUsers]);

  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPinGuide, setShowPinGuide] = useState(false);

  const selectedUser = users.find((u) => u.id === selectedUserId) || portalUsers[0] || users[0];

  const handlePortalSwitch = (p: 'admin' | 'crm' | 'agent') => {
    setCurrentPortal(p);
    setPin('');
    setErrorMessage('');
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('portal', p);
      url.searchParams.delete('role');
      url.searchParams.delete('crm');
      url.searchParams.delete('agent');
      window.history.replaceState({}, '', url.toString());
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!pin.trim()) {
      setErrorMessage(language === 'hi' ? 'कृपया 8-अंकीय पिन दर्ज करें' : 'Please enter your 8-digit PIN');
      return;
    }

    if (pin.trim().length !== 8) {
      setErrorMessage(
        language === 'hi'
          ? 'सुरक्षा पिन पूरे 8 अंकों का होना आवश्यक है!'
          : 'Security PIN must be exactly 8 digits!'
      );
      return;
    }

    const res = login(selectedUserId, pin.trim());
    if (!res.success) {
      setErrorMessage(res.message);
    }
  };

  const isAgent = selectedUser.role === 'agent';
  const isCrm = selectedUser.role === 'crm_executive';
  const isAdmin = selectedUser.role === 'main_super_admin' || selectedUser.role === 'admin';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex flex-col items-center justify-center p-4 selection:bg-amber-500 selection:text-white">
      {/* Top right language & theme */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <button
          onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-900/80 border border-slate-700 text-slate-200 hover:bg-slate-800 transition-colors"
        >
          <Globe className="w-3.5 h-3.5 text-amber-400" />
          <span>{language === 'en' ? 'हिन्दी' : 'English'}</span>
        </button>

        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors"
          title="Toggle Light / Dark"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/60 space-y-5">
        {/* Brand Header */}
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-400 flex items-center justify-center text-white font-black text-lg shadow-xl shadow-amber-500/20">
            {(t.appName || 'AS').split(' ').filter(Boolean).map((w: string) => w[0]).slice(0, 2).join('').toUpperCase() || 'AS'}
          </div>
          <h1 className="text-lg sm:text-xl font-black text-white tracking-tight">
            {t.appName}
          </h1>
          <p className="text-[11px] font-semibold text-amber-400/90 uppercase tracking-wider">
            {language === 'hi' ? '🔒 8-अंकीय सुरक्षित वर्कस्पेस लॉक' : '🔒 8-Digit Secure Workspace Lock'}
          </p>
        </div>

        {/* 3 Portal Tabs Switcher */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950 rounded-2xl border border-slate-800 text-[11px] font-bold">
          <button
            type="button"
            onClick={() => handlePortalSwitch('admin')}
            className={`py-2 rounded-xl transition-all flex flex-col items-center gap-0.5 cursor-pointer ${
              currentPortal === 'admin'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>👑 Admin</span>
            <span className="text-[9px] opacity-80">(मालिक)</span>
          </button>

          <button
            type="button"
            onClick={() => handlePortalSwitch('crm')}
            className={`py-2 rounded-xl transition-all flex flex-col items-center gap-0.5 cursor-pointer ${
              currentPortal === 'crm'
                ? 'bg-purple-600 text-white font-black shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>📞 CRM</span>
            <span className="text-[9px] opacity-80">(कॉलिंग)</span>
          </button>

          <button
            type="button"
            onClick={() => handlePortalSwitch('agent')}
            className={`py-2 rounded-xl transition-all flex flex-col items-center gap-0.5 cursor-pointer ${
              currentPortal === 'agent'
                ? 'bg-blue-600 text-white font-black shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🔒 Agent</span>
            <span className="text-[9px] opacity-80">(फील्ड स्टाफ)</span>
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">
              {currentPortal === 'admin'
                ? (language === 'hi' ? '👑 एडमिन खाता (Owner Account)' : 'Admin Account')
                : currentPortal === 'crm'
                ? (language === 'hi' ? '📞 CRM टेलीकॉलर खाता' : 'CRM Telecaller Account')
                : (language === 'hi' ? '🔒 फील्ड एजेंट चुनें (Select Field Agent)' : 'Select Field Agent')}
            </label>
            <select
              value={selectedUserId}
              onChange={(e) => {
                setSelectedUserId(e.target.value);
                setErrorMessage('');
              }}
              className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border border-slate-700 bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
            >
              {portalUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} — ({u.relationship || u.role})
                </option>
              ))}
            </select>
          </div>

          {/* Role & Workspace Scope Badge */}
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">Workspace Mode</span>
              <span className="font-bold text-slate-200">
                {isCrm
                  ? '📞 CRM Telecaller & Follow-up Queue'
                  : isAgent
                  ? '🔒 Private Agent Workspace'
                  : isAdmin
                  ? '👑 Master Super Admin Control'
                  : '📋 Team Manager Workspace'}
              </span>
            </div>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold uppercase ${
                isCrm
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : isAdmin
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
              }`}
            >
              {selectedUser.role.replace(/_/g, ' ')}
            </span>
          </div>

          {/* 8 Digit Security PIN */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">
              {language === 'hi'
                ? '8-अंकीय सीक्रेट पिन (8-Digit Security PIN) *'
                : '8-Digit Security Password / PIN *'}
            </label>
            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                maxLength={8}
                autoFocus
                required
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setErrorMessage('');
                }}
                placeholder="8 अंकों का पिन दर्ज करें (उदा. 12345678)"
                className="w-full px-4 py-2.5 text-center text-lg tracking-widest font-mono rounded-xl border border-slate-700 bg-slate-800 text-white placeholder-slate-500 placeholder:text-xs placeholder:font-sans focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-2.5 rounded-xl bg-red-950/60 border border-red-700 text-red-300 text-xs font-semibold text-center animate-shake">
              {errorMessage}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Unlock className="w-4 h-4" />
            {language === 'hi' ? 'वर्कस्पेस में प्रवेश करें' : 'Unlock Workspace'}
          </button>
        </form>

        {/* Demo PINs Helper Card */}
        <div className="pt-2 border-t border-slate-800">
          <button
            onClick={() => setShowPinGuide(!showPinGuide)}
            className="w-full text-center text-[11px] font-semibold text-slate-400 hover:text-amber-400 flex items-center justify-center gap-1 transition-colors"
          >
            <Info className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'सीक्रेट 8-अंकीय पिन गाइड देखें' : 'View Default 8-Digit PIN Reference'}</span>
          </button>

          {showPinGuide && (
            <div className="mt-2 p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-[11px] text-slate-300 space-y-1">
              <p>👑 <strong>Ashish / Sheetal (मालिक Admin):</strong> PIN <code className="bg-slate-950 px-1.5 py-0.5 rounded text-amber-400 font-bold font-mono">12345678</code></p>
              <p>📞 <strong>{(users.find((u) => u.role === 'crm_executive')?.name || 'CRM Telecaller').replace(/\s*\([^)]*\)/g, '').trim()} (CRM टेलीकॉलर):</strong> PIN <code className="bg-slate-950 px-1.5 py-0.5 rounded text-purple-400 font-bold font-mono">{users.find((u) => u.role === 'crm_executive')?.pin || '77777777'}</code></p>
              <p>🔒 <strong>Priya (फील्ड एजेंट):</strong> PIN <code className="bg-slate-950 px-1.5 py-0.5 rounded text-blue-400 font-bold font-mono">44444444</code></p>
              <p>🔒 <strong>Rahul (फील्ड एजेंट):</strong> PIN <code className="bg-slate-950 px-1.5 py-0.5 rounded text-blue-400 font-bold font-mono">55555555</code></p>
              <p>💼 <strong>Vikram (मैनेजर):</strong> PIN <code className="bg-slate-950 px-1.5 py-0.5 rounded text-emerald-400 font-bold font-mono">33333333</code></p>
              <p>👩‍💼 <strong>Sunita (ऑपरेशन्स):</strong> PIN <code className="bg-slate-950 px-1.5 py-0.5 rounded text-indigo-400 font-bold font-mono">22222222</code></p>
              <p className="text-[10px] text-slate-500 pt-1 italic">
                *एडमिन टीम मैनेजमेंट सेक्शन में जाकर किसी भी एजेंट या CRM का पिन कभी भी बदल सकता है।
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
