/**
 * Dynamic Collapsible Sidebar
 * Renders built-in enterprise modules + dynamic modules created via the Module Builder
 */

import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  ShieldCheck,
  Building2,
  Users,
  Target,
  PhoneCall,
  Receipt,
  Blocks,
  UserCog,
  BarChart3,
  BellRing,
  Settings,
  History,
  Briefcase,
  Utensils,
  Car,
  ShoppingBag,
  GraduationCap,
  Wrench,
  HeartPulse,
  Home,
  FileText,
  Package,
  Layers,
  ChevronRight,
  Shield,
} from 'lucide-react';
import { storage } from '../../services/storage';

// Icon resolver for dynamic modules
export const getDynamicIcon = (iconName: string) => {
  switch (iconName?.toLowerCase()) {
    case 'utensils':
      return Utensils;
    case 'briefcase':
      return Briefcase;
    case 'car':
      return Car;
    case 'shoppingbag':
    case 'shopping-bag':
      return ShoppingBag;
    case 'graduationcap':
    case 'graduation-cap':
      return GraduationCap;
    case 'wrench':
      return Wrench;
    case 'heartpulse':
    case 'heart-pulse':
      return HeartPulse;
    case 'home':
      return Home;
    case 'filetext':
    case 'file-text':
      return FileText;
    case 'package':
      return Package;
    default:
      return Layers;
  }
};

export const Sidebar: React.FC<{ onCloseMobile?: () => void }> = ({ onCloseMobile }) => {
  const { currentUser, activeTab, setActiveTab, t, language, modules } = useApp();

  const dailyQueue = storage.getDailyWorkQueue(currentUser);
  const pendingDailyCount = dailyQueue.filter((i) => i.status === 'pending').length;

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    if (onCloseMobile) onCloseMobile();
  };

  const isMainAdmin = currentUser.role === 'main_super_admin';
  const canManageModules = isMainAdmin || currentUser.permissions?.canManageModules;
  const canManageTeam = isMainAdmin || currentUser.permissions?.canManageTeam;
  const canViewAudit = isMainAdmin || currentUser.permissions?.canViewAuditLogs;
  const canManageSettings = isMainAdmin;

  const activeModules = modules.filter((m) => m.status === 'active');

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-[calc(100vh-53px)] select-none border-r border-slate-800 transition-all">
      {/* Scrollable Navigation Body */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {/* Core Operations Section */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            {language === 'hi' ? 'दैनिक प्रबंधन' : 'Daily Operations'}
          </div>
          <div className="space-y-1">
            <button
              onClick={() => handleNavClick('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'hover:bg-slate-800 hover:text-white text-slate-300'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              <span>{t.dashboard}</span>
            </button>

            <button
              onClick={() => handleNavClick('dailyWork')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'dailyWork'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'hover:bg-slate-800 hover:text-white text-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <PhoneCall className="w-4 h-4 shrink-0" />
                <span>{t.dailyWork}</span>
              </div>
              {pendingDailyCount > 0 && (
                <span
                  className={`px-1.5 py-0.5 text-[10px] rounded-full font-bold ${
                    activeTab === 'dailyWork' ? 'bg-slate-950 text-amber-400' : 'bg-red-500 text-white'
                  }`}
                >
                  {pendingDailyCount}
                </span>
              )}
            </button>

            <button
              onClick={() => handleNavClick('customers')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'customers'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'hover:bg-slate-800 hover:text-white text-slate-300'
              }`}
            >
              <Users className="w-4 h-4 shrink-0" />
              <span>{t.customers}</span>
            </button>

            <button
              onClick={() => handleNavClick('insurance')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'insurance'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'hover:bg-slate-800 hover:text-white text-slate-300'
              }`}
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>{t.insurance}</span>
            </button>

            <button
              onClick={() => handleNavClick('properties')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'properties'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'hover:bg-slate-800 hover:text-white text-slate-300'
              }`}
            >
              <Building2 className="w-4 h-4 shrink-0" />
              <span>{t.properties}</span>
            </button>

            <button
              onClick={() => handleNavClick('leads')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'leads'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'hover:bg-slate-800 hover:text-white text-slate-300'
              }`}
            >
              <Target className="w-4 h-4 shrink-0" />
              <span>{t.leads}</span>
            </button>

            <button
              onClick={() => handleNavClick('payments')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'payments'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'hover:bg-slate-800 hover:text-white text-slate-300'
              }`}
            >
              <Receipt className="w-4 h-4 shrink-0" />
              <span>{t.payments}</span>
            </button>
          </div>
        </div>

        {/* Dynamic Custom Business Modules Section */}
        <div>
          <div className="flex items-center justify-between px-3 mb-2">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              {language === 'hi' ? 'कस्टम बिज़नेस मॉड्यूल' : 'Dynamic Modules'}
            </span>
            <span className="text-[10px] bg-slate-800 text-amber-400 font-bold px-1.5 py-0.5 rounded">
              {activeModules.length}
            </span>
          </div>

          <div className="space-y-1">
            {activeModules.map((mod) => {
              const IconComp = getDynamicIcon(mod.icon);
              const tabId = `dynamic_${mod.id}`;
              const isSelected = activeTab === tabId;

              return (
                <button
                  key={mod.id}
                  onClick={() => handleNavClick(tabId)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                      : 'hover:bg-slate-800 hover:text-white text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <IconComp className="w-4 h-4 shrink-0 text-amber-400" />
                    <span className="truncate">{language === 'hi' && mod.nameHi ? mod.nameHi : mod.name}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                </button>
              );
            })}

            {canManageModules && (
              <button
                onClick={() => handleNavClick('moduleBuilder')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold border border-dashed transition-all ${
                  activeTab === 'moduleBuilder'
                    ? 'border-amber-400 bg-amber-500/10 text-amber-300'
                    : 'border-slate-700 text-slate-400 hover:border-amber-400 hover:text-amber-300'
                }`}
              >
                <Blocks className="w-4 h-4 shrink-0 text-amber-400" />
                <span>+ {t.moduleBuilder}</span>
              </button>
            )}
          </div>
        </div>

        {/* Administration, Intelligence & Security Section */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            {language === 'hi' ? 'प्रशासन एवं नियंत्रण' : 'Admin & Analytics'}
          </div>
          <div className="space-y-1">
            {canManageTeam && (
              <button
                onClick={() => handleNavClick('team')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'team'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                    : 'hover:bg-slate-800 hover:text-white text-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <UserCog className="w-4 h-4 shrink-0" />
                  <span>{t.teamManagement}</span>
                </div>
                <span className="text-[9px] bg-purple-500/30 text-purple-200 border border-purple-400/40 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                  CRM Hub
                </span>
              </button>
            )}

            <button
              onClick={() => handleNavClick('reports')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'reports'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'hover:bg-slate-800 hover:text-white text-slate-300'
              }`}
            >
              <BarChart3 className="w-4 h-4 shrink-0" />
              <span>{t.reports}</span>
            </button>

            <button
              onClick={() => handleNavClick('reminders')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'reminders'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'hover:bg-slate-800 hover:text-white text-slate-300'
              }`}
            >
              <BellRing className="w-4 h-4 shrink-0" />
              <span>{t.reminders}</span>
            </button>

            {canViewAudit && (
              <button
                onClick={() => handleNavClick('auditLogs')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'auditLogs'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                    : 'hover:bg-slate-800 hover:text-white text-slate-300'
                }`}
              >
                <History className="w-4 h-4 shrink-0" />
                <span>{t.auditLogs}</span>
              </button>
            )}

            {canManageSettings && (
              <button
                onClick={() => handleNavClick('settings')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'settings'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                    : 'hover:bg-slate-800 hover:text-white text-slate-300'
                }`}
              >
                <Settings className="w-4 h-4 shrink-0" />
                <span>{t.settings}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Footer User Workspace Badge */}
      <div className="p-3 bg-slate-950/60 border-t border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xs">
            {currentUser.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-200 truncate">{currentUser.name}</p>
            <p className="text-[10px] text-amber-400/90 truncate font-mono">
              {currentUser.relationship || currentUser.role}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
