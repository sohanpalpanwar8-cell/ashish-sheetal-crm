/**
 * ASHISH SHEETAL ALL-IN-ONE
 * Personal & Business Management Platform
 * Main Application Orchestrator
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { ExecutiveDashboard } from './components/dashboard/ExecutiveDashboard';
import { CustomerList } from './components/crm/CustomerList';
import { InsuranceModule } from './components/insurance/InsuranceModule';
import { PropertyModule } from './components/property/PropertyModule';
import { LeadModule } from './components/leads/LeadModule';
import { DailyWorkModule } from './components/daily/DailyWorkModule';
import { PaymentModule } from './components/payments/PaymentModule';
import { ModuleBuilder } from './components/builder/ModuleBuilder';
import { DynamicModuleView } from './components/builder/DynamicModuleView';
import { TeamManagement } from './components/team/TeamManagement';
import { ReportsModule } from './components/reports/ReportsModule';
import { RemindersModule } from './components/reminders/RemindersModule';
import { AuditTrailModule } from './components/audit/AuditTrailModule';
import { SettingsBackup } from './components/settings/SettingsBackup';
import { OfflineIndicator } from './components/layout/OfflineIndicator';
import { LoginPortal } from './components/auth/LoginPortal';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { activeTab, modules, toasts, removeToast, isAuthenticated } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If not authenticated, lock app and render LoginPortal gatekeeper
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen">
        <LoginPortal />
        {/* Toast Notification Container */}
        {toasts.length > 0 && (
          <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
            {toasts.map((toast) => (
              <div
                key={toast.id}
                className="p-3.5 rounded-xl shadow-xl border pointer-events-auto flex items-center justify-between gap-3 text-xs font-semibold bg-slate-900 border-slate-700 text-white"
              >
                <span>{toast.message}</span>
                <button onClick={() => removeToast(toast.id)} className="text-slate-400 hover:text-white">✕</button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Check if current tab is a dynamic module
  let dynamicModuleMatch = null;
  if (activeTab.startsWith('dynamic_')) {
    const modId = activeTab.replace('dynamic_', '');
    dynamicModuleMatch = modules.find((m) => m.id === modId);
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Application Header */}
      <Header onOpenMobileMenu={() => setMobileMenuOpen(true)} />

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden md:block shrink-0">
          <Sidebar />
        </div>

        {/* Mobile Sidebar Overlay Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-slate-900 shadow-2xl z-10">
              <div className="p-3 flex justify-end">
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <Sidebar onCloseMobile={() => setMobileMenuOpen(false)} />
            </div>
          </div>
        )}

        {/* Dynamic Main Workspace Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && <ExecutiveDashboard />}
            {activeTab === 'customers' && <CustomerList />}
            {activeTab === 'insurance' && <InsuranceModule />}
            {activeTab === 'properties' && <PropertyModule />}
            {activeTab === 'leads' && <LeadModule />}
            {activeTab === 'dailyWork' && <DailyWorkModule />}
            {activeTab === 'payments' && <PaymentModule />}
            {activeTab === 'moduleBuilder' && <ModuleBuilder />}
            {activeTab === 'team' && <TeamManagement />}
            {activeTab === 'reports' && <ReportsModule />}
            {activeTab === 'reminders' && <RemindersModule />}
            {activeTab === 'auditLogs' && <AuditTrailModule />}
            {activeTab === 'settings' && <SettingsBackup />}

            {/* Dynamic Module Renderer */}
            {dynamicModuleMatch && <DynamicModuleView module={dynamicModuleMatch} />}
          </div>
        </main>
      </div>

      {/* Offline Status Connectivity Banner */}
      <OfflineIndicator />

      {/* Toast Notification Container */}
      {toasts.length > 0 && (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`p-3.5 rounded-xl shadow-xl border pointer-events-auto flex items-center justify-between gap-3 text-xs font-semibold backdrop-blur-md transition-all animate-in slide-in-from-bottom-2 ${
                toast.type === 'success'
                  ? 'bg-emerald-950/90 border-emerald-700/60 text-emerald-200'
                  : toast.type === 'error'
                  ? 'bg-red-950/90 border-red-700/60 text-red-200'
                  : toast.type === 'warning'
                  ? 'bg-amber-950/90 border-amber-700/60 text-amber-200'
                  : 'bg-slate-900/95 border-slate-700 text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                {toast.type === 'success' ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : toast.type === 'warning' ? (
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                ) : (
                  <Info className="w-4 h-4 text-blue-400 shrink-0" />
                )}
                <span>{toast.message}</span>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-white shrink-0"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
