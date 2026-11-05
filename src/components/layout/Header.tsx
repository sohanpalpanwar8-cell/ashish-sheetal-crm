/**
 * Header Component with Search, Account Switcher, Language Toggle, and Notification Center
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bell,
  Sun,
  Moon,
  Search,
  UserCheck,
  ShieldAlert,
  Globe,
  Sparkles,
  ChevronDown,
  CheckCircle2,
  Calendar,
  Download,
  Smartphone,
  LogOut,
  Lock,
  KeyRound,
  PhoneCall,
  Copy,
  MessageSquare,
  ExternalLink,
  Eye,
  RefreshCw,
  X,
  Edit2,
} from 'lucide-react';
import { storage } from '../../services/storage';
import { usePWAInstall } from '../../utils/usePWAInstall';
import { generateWhatsAppUrl } from '../../utils/whatsapp';

export const Header: React.FC<{ onOpenMobileMenu?: () => void }> = ({ onOpenMobileMenu }) => {
  const {
    currentUser,
    users,
    switchUser,
    logout,
    showToast,
    triggerRefresh,
    language,
    setLanguage,
    t,
    theme,
    toggleTheme,
    setActiveTab,
    setSelectedCustomerId,
  } = useApp();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showCrmModal, setShowCrmModal] = useState(false);
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{
    type: string;
    id: string;
    title: string;
    sub: string;
  }[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [isEditingCrmUser, setIsEditingCrmUser] = useState(false);
  const [editCrmName, setEditCrmName] = useState('');
  const [editCrmPin, setEditCrmPin] = useState('');

  const crmUser = users.find((u) => u.role === 'crm_executive') || users.find((u) => u.id === 'user_neha');
  const crmDisplayName = (crmUser?.name || (language === 'hi' ? 'CRM टेलीकॉलर' : 'CRM Telecaller')).replace(/\s*\([^)]*\)/g, '').trim();
  const crmShortName = crmDisplayName.split(' ')[0] || crmDisplayName;

  const handleSaveCrmUser = () => {
    if (!editCrmName.trim()) {
      showToast(language === 'hi' ? 'कृपया नाम दर्ज करें!' : 'Please enter a name!', 'warning');
      return;
    }
    if (editCrmPin.trim().length < 4 || editCrmPin.trim().length > 8) {
      showToast(language === 'hi' ? 'पिन 4 से 8 अंकों का होना चाहिए!' : 'PIN must be 4 to 8 digits!', 'warning');
      return;
    }
    const target = crmUser || {
      id: 'user_neha',
      role: 'crm_executive' as const,
      email: 'crm@ashishsheetal.com',
      phone: '',
      relationship: 'CRM Telecaller & Calling Specialist',
      active: true,
      lastLogin: new Date().toISOString(),
      permissions: {
        canManageModules: false,
        canManageTeam: false,
        canViewAllData: true,
        canDeleteRecords: false,
        canExportData: false,
        canManageSettings: false,
        canEditCustomer: true,
        canViewAuditLogs: false,
      },
    };
    const updatedUser = {
      ...target,
      name: editCrmName.trim(),
      pin: editCrmPin.trim(),
    };
    storage.updateUser(updatedUser, currentUser);
    triggerRefresh();
    setIsEditingCrmUser(false);
    showToast(
      language === 'hi'
        ? `CRM ऑपरेटर का नाम बदलकर "${editCrmName.trim()}" कर दिया गया!`
        : `Updated CRM Caller to "${editCrmName.trim()}"!`,
      'success'
    );
  };

  const handleCopyCrmLink = () => {
    const appBaseUrl = typeof window !== 'undefined' && window.location.origin
      ? window.location.origin
      : 'https://ashish-sheetal-crm.vercel.app';
    const crmPin = crmUser?.pin || '77777777';
    const link = `${appBaseUrl}?portal=crm`;
    const textToCopy = `नमस्ते ${crmShortName} जी,\n\nआशीष शीतल ऑल-इन-वन मैनेजमेंट प्लेटफॉर्म पर आपका CRM टेलीकॉलर वर्कस्पेस तैयार है।\n\n🔗 लॉगिन लिंक: ${link}\n🔑 आपका सीक्रेट 8-अंकीय लॉगिन पिन: ${crmPin}\n\nकृपया इस लिंक को Chrome ब्राउज़र में खोलकर अपना गुप्त पिन दर्ज करें और सभी एजेंटों के ग्राहकों की कॉलिंग लिस्ट, रिन्यूअल अलर्ट एवं फॉलो-अप देखें।\n\nसादर,\nआशीष Panwar (मालिक)`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
    }
    showToast(language === 'hi' ? 'CRM लिंक एवं गुप्त पिन कॉपी हो गया!' : 'CRM link & PIN copied!', 'success');
  };

  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  // Derive daily queue count
  const dailyQueue = storage.getDailyWorkQueue(currentUser);
  const urgentCount = dailyQueue.filter((i) => i.status === 'pending').length;

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    const q = query.toLowerCase();
    const results: { type: string; id: string; title: string; sub: string }[] = [];

    // Search Customers
    storage.getCustomers(currentUser).forEach((c) => {
      if (
        c.name.toLowerCase().includes(q) ||
        c.mobile.includes(q) ||
        c.city.toLowerCase().includes(q)
      ) {
        results.push({
          type: 'customer',
          id: c.id,
          title: c.name,
          sub: `Customer • ${c.mobile} • ${c.city}`,
        });
      }
    });

    // Search Policies
    storage.getPolicies(currentUser).forEach((p) => {
      if (
        p.policyNumber.toLowerCase().includes(q) ||
        p.customerName.toLowerCase().includes(q) ||
        p.planName.toLowerCase().includes(q) ||
        (p.vehicleNumber && p.vehicleNumber.toLowerCase().includes(q))
      ) {
        results.push({
          type: 'policy',
          id: p.id,
          title: `${p.planName} (#${p.policyNumber})`,
          sub: `Insurance • ${p.customerName} • ${p.insurerName}`,
        });
      }
    });

    // Search Properties
    storage.getProperties(currentUser).forEach((prop) => {
      if (
        prop.title.toLowerCase().includes(q) ||
        prop.location.toLowerCase().includes(q) ||
        prop.ownerName.toLowerCase().includes(q)
      ) {
        results.push({
          type: 'property',
          id: prop.id,
          title: prop.title,
          sub: `Property • ${prop.location} • ₹${prop.askingPrice.toLocaleString('en-IN')}`,
        });
      }
    });

    // Search Leads
    storage.getLeads(currentUser).forEach((l) => {
      if (l.name.toLowerCase().includes(q) || l.phone.includes(q)) {
        results.push({
          type: 'lead',
          id: l.id,
          title: l.name,
          sub: `Lead • ${l.phone} • Status: ${l.status}`,
        });
      }
    });

    setSearchResults(results.slice(0, 8));
  };

  const handleSelectSearchResult = (result: { type: string; id: string }) => {
    setSearchQuery('');
    setSearchResults([]);
    setIsSearching(false);

    if (result.type === 'customer') {
      setSelectedCustomerId(result.id);
      setActiveTab('customers');
    } else if (result.type === 'policy') {
      setActiveTab('insurance');
    } else if (result.type === 'property') {
      setActiveTab('properties');
    } else if (result.type === 'lead') {
      setActiveTab('leads');
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    const expectedCurrent = currentUser.pin || '1234';
    if (currentPinInput.trim() !== expectedCurrent.trim()) {
      setPasswordError(language === 'hi' ? 'वर्तमान पिन सही नहीं है!' : 'Current PIN does not match!');
      return;
    }

    if (newPinInput.length < 4 || newPinInput.length > 8) {
      setPasswordError(
        language === 'hi'
          ? 'नया पासवर्ड 4 से 8 अंकों का होना चाहिए!'
          : 'New password must be between 4 and 8 digits!'
      );
      return;
    }

    if (newPinInput !== confirmPinInput) {
      setPasswordError(
        language === 'hi' ? 'दोनों नए पासवर्ड मेल नहीं खा रहे!' : 'New passwords do not match!'
      );
      return;
    }

    const updatedUser = { ...currentUser, pin: newPinInput.trim() };
    storage.updateUser(updatedUser, currentUser);
    triggerRefresh();
    showToast(
      language === 'hi' ? 'पासवर्ड सफलतापूर्वक बदल गया!' : 'Password updated successfully!',
      'success'
    );
    setShowChangePasswordModal(false);
    setCurrentPinInput('');
    setNewPinInput('');
    setConfirmPinInput('');
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="flex items-center justify-between px-4 sm:px-6 py-2.5">
        {/* Left: Mobile hamburger & Brand Title */}
        <div className="flex items-center gap-3">
          {onOpenMobileMenu && (
            <button
              onClick={onOpenMobileMenu}
              className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Toggle menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}

          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-400 flex items-center justify-center shadow-md shadow-amber-500/20 text-white font-extrabold text-xs tracking-wider">
              {(t.appName || 'AS').split(' ').filter(Boolean).map((w: string) => w[0]).slice(0, 2).join('').toUpperCase() || 'AS'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                  {t.appName}
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300/50">
                  <Sparkles className="w-2.5 h-2.5" /> PRO
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-tight">
                {t.appSubtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Middle: Universal Quick Search */}
        <div className="hidden lg:block relative w-80 xl:w-96">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={language === 'hi' ? 'ग्राहक, पॉलिसी, प्लॉट, लीड खोजें...' : 'Search customers, policies, plots, leads...'}
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
            />
          </div>

          {/* Search Dropdown Results */}
          {isSearching && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl overflow-hidden z-50">
              <div className="p-1.5 divide-y divide-slate-100 dark:divide-slate-700/50">
                {searchResults.map((item) => (
                  <button
                    key={`${item.type}_${item.id}`}
                    onClick={() => handleSelectSearchResult(item)}
                    className="w-full text-left px-3 py-2 rounded hover:bg-amber-50 dark:hover:bg-slate-700/60 transition-colors flex flex-col"
                  >
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                      {item.title}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      {item.sub}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Action Icons: Language, Dark Mode, Reminders Bell, User Dropdown */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick CRM Access Button for Owner/Admins */}
          {currentUser.role !== 'crm_executive' && (
            <button
              onClick={() => {
                setIsEditingCrmUser(false);
                setEditCrmName(crmDisplayName);
                setEditCrmPin(crmUser?.pin || '77777777');
                setShowCrmModal(true);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg bg-purple-600 hover:bg-purple-700 text-white shadow-sm shadow-purple-600/30 transition-all cursor-pointer"
              title={`CRM Telecaller Access & PIN (${crmDisplayName})`}
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>{`📞 CRM (${crmShortName})`}</span>
              <span className="hidden md:inline text-[10px] bg-purple-900/80 px-1.5 py-0.2 rounded font-mono font-bold">
                {crmUser?.pin || '77777777'}
              </span>
            </button>
          )}

          {/* In-App Install Button for Mobile & Laptop */}
          {!isInstalled && (
            <button
              onClick={() => {
                if (isInstallable) {
                  install();
                } else {
                  setShowInstallGuide(true);
                }
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-sm transition-all cursor-pointer"
              title="Install on Mobile / Laptop"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="inline">
                {language === 'hi' ? 'ऐप इंस्टॉल करें' : 'Install App'}
              </span>
            </button>
          )}

          {/* Language Toggle */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
            title="Toggle English / हिन्दी"
          >
            <Globe className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span className="font-semibold">{language === 'en' ? 'हिन्दी' : 'English'}</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
            title="Toggle Light / Dark Mode"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Notification / Daily Work Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
              title="Daily Calling & Alerts Queue"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {urgentCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white shadow animate-pulse">
                  {urgentCount}
                </span>
              )}
            </button>

            {/* Notification popup */}
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {language === 'hi' ? "आज के कार्य एवं रिमाइंडर" : "Today's Work & Reminders"}
                    </span>
                  </div>
                  <span className="text-[10px] bg-amber-500/20 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full font-bold">
                    {urgentCount} pending
                  </span>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 p-2">
                  {dailyQueue.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-500">
                      {language === 'hi' ? 'आज कोई लंबित कार्य नहीं है!' : 'No urgent alerts for today!'}
                    </div>
                  ) : (
                    dailyQueue.slice(0, 6).map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          setShowNotifications(false);
                          setActiveTab('dailyWork');
                        }}
                        className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg cursor-pointer transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                            {item.title}
                          </p>
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                              item.priority === 'high'
                                ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                            }`}
                          >
                            {item.priority}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {item.clientName} • {item.phone}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-2 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 text-center">
                  <button
                    onClick={() => {
                      setShowNotifications(false);
                      setActiveTab('dailyWork');
                    }}
                    className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline"
                  >
                    {language === 'hi' ? 'सभी कॉल्स एवं कार्य देखें →' : 'View Full Calling List & Actions →'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Account Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                {currentUser.name.charAt(0)}
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-none">
                  {currentUser.name}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">
                  {t[currentUser.role] || currentUser.role}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* User Dropdown List */}
            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-50 p-2">
                {currentUser.role === 'agent' || currentUser.role === 'crm_executive' ? (
                  /* Agent & CRM Isolated View */
                  <div className="space-y-3 p-1">
                    <div className={`p-2.5 rounded-lg border ${
                      currentUser.role === 'crm_executive'
                        ? 'bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-900/60'
                        : 'bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-900/60'
                    }`}>
                      <div className={`flex items-center gap-1.5 font-bold text-xs ${
                        currentUser.role === 'crm_executive'
                          ? 'text-purple-700 dark:text-purple-300'
                          : 'text-blue-700 dark:text-blue-300'
                      }`}>
                        <Lock className="w-3.5 h-3.5" />
                        <span>
                          {currentUser.role === 'crm_executive'
                            ? (language === 'hi' ? '📞 CRM टेलीकॉलर वर्कस्पेस' : '📞 CRM Telecaller Calling Workspace')
                            : (language === 'hi' ? 'निजी एजेंट वर्कस्पेस' : 'Private Agent Workspace')}
                        </span>
                      </div>
                      <p className={`text-[11px] mt-1 leading-snug ${
                        currentUser.role === 'crm_executive'
                          ? 'text-purple-600/80 dark:text-purple-300/70'
                          : 'text-blue-600/80 dark:text-blue-300/70'
                      }`}>
                        {currentUser.role === 'crm_executive'
                          ? (language === 'hi'
                              ? 'आपको सभी एजेंटों के ग्राहकों की कॉलिंग लिस्ट, प्रीमियम रिन्यूअल एवं फॉलो-अप का एक्सेस है। एडमिन व वित्तीय डेटा लॉक है।'
                              : 'You have full access to daily calling queues, renewal alerts, and customer follow-ups across all agents.')
                          : (language === 'hi'
                              ? 'सुरक्षा नियमों के तहत आपको केवल आपको सौंपे गए ग्राहकों और लीड्स का ही एक्सेस है। मालिक का डेटा पूरी तरह लॉक है।'
                              : 'You only have access to clients and leads assigned to you. Master owner data is strictly protected.')}
                      </p>
                    </div>

                    <div className="px-2 text-xs text-slate-600 dark:text-slate-300">
                      <p className="font-semibold">{currentUser.name}</p>
                      <p className="text-[10px] text-slate-400">{currentUser.email}</p>
                      <p className="text-[10px] text-amber-500 font-bold mt-1">
                        PIN: {currentUser.pin || '••••'}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        setShowChangePasswordModal(true);
                        setPasswordError('');
                      }}
                      className="w-full py-1.5 px-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 border border-amber-500/30 transition-all cursor-pointer"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>{language === 'hi' ? '🔑 पासवर्ड / पिन बदलें' : 'Change My Password'}</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                      }}
                      className="w-full py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 font-bold text-xs flex items-center justify-center gap-2 border border-red-500/30 transition-all cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{language === 'hi' ? 'लॉगआउट एवं ऐप लॉक करें' : 'Logout & Lock'}</span>
                    </button>
                  </div>
                ) : (
                  /* Admin & Manager View with Switcher */
                  <>
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        {language === 'hi' ? 'सक्रिय कार्यक्षेत्र बदलें' : 'Switch Active Workspace User'}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                        Role-Based Access Control Active
                      </p>
                    </div>

                    <div className="space-y-1 max-h-56 overflow-y-auto">
                      {users.map((u) => {
                        const isSelected = u.id === currentUser.id;
                        return (
                          <button
                            key={u.id}
                            onClick={() => {
                              switchUser(u.id);
                              setShowUserMenu(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between text-xs transition-colors ${
                              isSelected
                                ? 'bg-amber-500/10 text-amber-900 dark:text-amber-200 font-bold border border-amber-500/30'
                                : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white ${
                                  u.role === 'main_super_admin'
                                    ? 'bg-amber-600'
                                    : u.role === 'admin'
                                    ? 'bg-indigo-600'
                                    : u.role === 'team_manager'
                                    ? 'bg-emerald-600'
                                    : u.role === 'crm_executive'
                                    ? 'bg-purple-600'
                                    : 'bg-slate-600'
                                }`}
                              >
                                {u.name.charAt(0)}
                              </div>
                              <div>
                                <div className="leading-tight flex items-center gap-1.5">
                                  <span>{u.name}</span>
                                  {u.role === 'crm_executive' && (
                                    <span className="text-[9px] bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30 px-1 py-0.2 rounded font-bold uppercase">
                                      CRM
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-slate-400 font-normal">
                                  {u.relationship || u.role} • PIN: {u.pin || '••••'}
                                </div>
                              </div>
                            </div>
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-500" />}
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          setShowChangePasswordModal(true);
                          setPasswordError('');
                        }}
                        className="w-full py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 border border-amber-500/30 transition-all cursor-pointer"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>{language === 'hi' ? '🔑 अपना पासवर्ड / पिन बदलें' : 'Change Master Password'}</span>
                      </button>

                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          logout();
                        }}
                        className="w-full py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 font-bold text-xs flex items-center justify-center gap-2 border border-red-500/30 transition-all cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>{language === 'hi' ? 'लॉगआउट / लॉक करें' : 'Logout & Lock Portal'}</span>
                      </button>

                      {/* Real-time Storage & Cloud Status Indicator */}
                      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span>{language === 'hi' ? 'सिंक: लोकल + क्लाउड' : 'Sync: Local + Cloud'}</span>
                        </div>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded-md">
                          ● {language === 'hi' ? 'सक्रिय' : 'Active'}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Standalone Quick Logout Button */}
          <button
            onClick={logout}
            className="p-1.5 rounded-lg border border-red-200 dark:border-red-900/40 bg-red-50/60 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
            title={language === 'hi' ? 'लॉगआउट / वर्कस्पेस लॉक' : 'Logout / Lock Workspace'}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Change Password / PIN Modal */}
      {showChangePasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-500 flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {language === 'hi' ? 'पासवर्ड / पिन बदलें (Change Password)' : 'Change Security Password / PIN'}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {currentUser.name} • {currentUser.relationship || currentUser.role}
                </p>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  {language === 'hi' ? 'वर्तमान पासवर्ड / पिन (Current PIN)' : 'Current PIN'}
                </label>
                <input
                  type="password"
                  maxLength={8}
                  required
                  value={currentPinInput}
                  onChange={(e) => setCurrentPinInput(e.target.value)}
                  placeholder="••••"
                  className="w-full px-3 py-2 text-xs font-mono font-bold tracking-widest rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  {language === 'hi' ? 'नया पासवर्ड (4 से 8 अंक)' : 'New Password / PIN (4 to 8 digits)'}
                </label>
                <input
                  type="password"
                  maxLength={8}
                  required
                  value={newPinInput}
                  onChange={(e) => setNewPinInput(e.target.value)}
                  placeholder="नया पासवर्ड दर्ज करें (4-8 अंक)"
                  className="w-full px-3 py-2 text-xs font-mono font-bold tracking-widest rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  {language === 'hi' ? 'नया पासवर्ड दोबारा लिखें (Confirm)' : 'Confirm New Password'}
                </label>
                <input
                  type="password"
                  maxLength={8}
                  required
                  value={confirmPinInput}
                  onChange={(e) => setConfirmPinInput(e.target.value)}
                  placeholder="दोबारा पुष्टि करें"
                  className="w-full px-3 py-2 text-xs font-mono font-bold tracking-widest rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              {passwordError && (
                <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-300 dark:border-red-800 text-red-600 dark:text-red-300 text-xs font-semibold text-center">
                  {passwordError}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowChangePasswordModal(false)}
                  className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                >
                  {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 cursor-pointer shadow-md"
                >
                  {language === 'hi' ? 'सहेजें (Save Password)' : 'Save Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Unified App Install Guide Modal for Android Chrome & iOS Safari */}
      {showInstallGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-amber-500/50 p-6 shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white">
                    {language === 'hi' ? 'मोबाइल में ऐप इंस्टॉल करें' : 'Install App on Phone'}
                  </h3>
                  <span className="text-[10px] text-amber-400 font-semibold">
                    Ashish Sheetal All-In-One CRM
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowInstallGuide(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="font-bold text-amber-400 flex items-center gap-1.5 text-xs">
                  <Smartphone className="w-4 h-4 text-amber-400" />
                  {language === 'hi' ? 'Android / Chrome में इंस्टॉल कैसे करें:' : 'How to Install on Android Chrome:'}
                </span>
                <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-slate-300 leading-relaxed">
                  <li>Chrome के ऊपर दाएं कोने में <strong>3 बिन्दुओं (⋮)</strong> पर टैप करें।</li>
                  <li>मेनू में <strong>"Install app" (ऐप इंस्टॉल करें)</strong> या <strong>"Add to Home screen" (होम स्क्रीन पर जोड़ें)</strong> पर दबाएं।</li>
                  <li>स्क्रीन पर <strong>"Install"</strong> बटन दबाएं — यह सीधे आपके मोबाइल में असली ऐप की तरह इंस्टॉल हो जाएगी!</li>
                </ol>
              </div>

              {isIOS && (
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <span className="font-bold text-blue-400 text-xs">
                    iPhone / iPad (Safari):
                  </span>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Safari में नीचे स्थित <strong>Share (शेयर)</strong> बटन दबाएं और <strong>"Add to Home Screen"</strong> चुनें।
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowInstallGuide(false)}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs cursor-pointer shadow"
            >
              {language === 'hi' ? 'समझ गए (बंद करें)' : 'Got it (Close)'}
            </button>
          </div>
        </div>
      )}

      {/* CRM Telecaller Quick Access & Link Modal */}
      {showCrmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-purple-700/60 p-6 shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between border-b border-purple-900/60 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-600 flex items-center justify-center text-white font-black text-base shadow-lg shadow-purple-600/30">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <span>{crmUser?.name || 'CRM Telecaller'}</span>
                  </h3>
                  <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-bold uppercase">
                    CRM Telecaller
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsEditingCrmUser(!isEditingCrmUser)}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg bg-purple-800 hover:bg-purple-700 text-purple-200 border border-purple-600/50 flex items-center gap-1 cursor-pointer"
                  title="नाम व पिन बदलें"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>{isEditingCrmUser ? (language === 'hi' ? 'रद्द' : 'Cancel') : (language === 'hi' ? 'नाम बदलें' : 'Edit')}</span>
                </button>
                <button
                  onClick={() => setShowCrmModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Inline Editor for CRM Caller Name and PIN */}
            {isEditingCrmUser ? (
              <div className="p-3.5 rounded-2xl bg-purple-950/80 border border-purple-500/50 space-y-3">
                <h4 className="text-xs font-bold text-purple-200 flex items-center gap-1.5">
                  <Edit2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>{language === 'hi' ? 'कॉलर का नाम व लॉगिन पिन बदलें' : 'Edit Caller Name & Secret PIN'}</span>
                </h4>
                <div className="space-y-2">
                  <div>
                    <label className="text-[10px] text-purple-300 block mb-1 font-semibold">
                      {language === 'hi' ? 'कॉलर का नाम (Caller Name):' : 'Caller Name:'}
                    </label>
                    <input
                      type="text"
                      value={editCrmName}
                      onChange={(e) => setEditCrmName(e.target.value)}
                      placeholder="उदा. Anita, Pooja, आदि"
                      className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-purple-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-purple-300 block mb-1 font-semibold">
                      {language === 'hi' ? 'सीक्रेट 8-अंकीय लॉगिन पिन (PIN):' : 'Secret Security PIN:'}
                    </label>
                    <input
                      type="text"
                      value={editCrmPin}
                      onChange={(e) => setEditCrmPin(e.target.value)}
                      placeholder="77777777"
                      maxLength={8}
                      className="w-full px-3 py-1.5 text-xs font-mono font-bold tracking-widest bg-slate-900 border border-purple-700 rounded-xl text-amber-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={handleSaveCrmUser}
                      className="flex-1 py-1.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs cursor-pointer shadow"
                    >
                      {language === 'hi' ? 'सुरक्षित करें (Save Name)' : 'Save Changes'}
                    </button>
                    <button
                      onClick={() => setIsEditingCrmUser(false)}
                      className="py-1.5 px-3 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs cursor-pointer"
                    >
                      {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Description */}
                <p className="text-xs text-purple-200/90 leading-relaxed">
                  {language === 'hi'
                    ? 'यह आपके कॉलिंग ऑपरेटर का सुरक्षित वर्कस्पेस है। वह सभी एजेंटों के ग्राहकों की कॉलिंग लिस्ट, प्रीमियम रिन्यूअल और फॉलो-अप कॉल कर सकती हैं।'
                    : 'Isolated workspace for CRM Telecaller. Has full access to calling queues across all agents without delete or admin rights.'}
                </p>

                {/* Secret PIN Box */}
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">
                      {language === 'hi' ? 'सीक्रेट लॉगिन पिन (Secret PIN):' : 'Secret Security PIN:'}
                    </span>
                    <span className="font-mono text-xs text-purple-300">
                      {language === 'hi' ? 'यह कोड CRM को लॉगिन करने के लिए चाहिए' : 'Required to unlock workspace'}
                    </span>
                  </div>
                  <span className="font-mono font-black text-purple-300 bg-purple-500/20 border border-purple-500/30 px-3 py-1 rounded-xl text-base tracking-widest">
                    {crmUser?.pin || '77777777'}
                  </span>
                </div>

                {/* Direct Link Box */}
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1.5">
                  <span className="text-[10px] text-slate-400 block font-semibold">
                    {language === 'hi' ? 'सीधा CRM लॉगिन लिंक (Direct Link):' : 'Direct CRM Login Link:'}
                  </span>
                  <p className="text-xs font-mono text-purple-200/80 break-all select-all bg-slate-900 p-2 rounded-xl border border-slate-800">
                    {`${typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'https://ashish-sheetal-crm.vercel.app'}?portal=crm`}
                  </p>
                </div>
              </>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={handleCopyCrmLink}
                className="py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/25 transition-all cursor-pointer"
              >
                <Copy className="w-4 h-4" />
                <span>{language === 'hi' ? 'लिंक कॉपी करें' : 'Copy Link'}</span>
              </button>

              <a
                href={generateWhatsAppUrl(
                  crmUser?.phone || '',
                  `नमस्ते ${crmShortName} जी,\n\nआशीष शीतल ऑल-इन-वन मैनेजमेंट प्लेटफॉर्म पर आपका CRM टेलीकॉलर वर्कस्पेस तैयार है।\n\n🔗 लॉगिन लिंक: ${typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'https://ashish-sheetal-crm.vercel.app'}?portal=crm\n🔑 आपका सीक्रेट 8-अंकीय लॉगिन पिन: ${crmUser?.pin || '77777777'}\n\nकृपया इस लिंक को Chrome ब्राउज़र में खोलें और अपना पिन दर्ज करके कॉलिंग लिस्ट और फॉलो-अप शुरू करें।\n\nसादर,\nआशीष Panwar (मालिक)`
                )}
                target="_blank"
                rel="noreferrer"
                className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/25 transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp</span>
              </a>
            </div>

            {/* Switch & Manage Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => {
                  setShowCrmModal(false);
                  if (crmUser) {
                    switchUser(crmUser.id);
                  }
                }}
                className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 font-bold text-xs flex items-center justify-center gap-1.5 border border-purple-500/30 transition-all cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? `CRM (${crmShortName}) देखें` : `Open ${crmShortName}'s View`}</span>
              </button>

              <button
                onClick={() => {
                  setShowCrmModal(false);
                  setActiveTab('team');
                }}
                className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-all cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'टीम व CRM केंद्र' : 'Team & CRM Hub'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
