/**
 * Reminders & Automated Alert Dispatcher
 * Configurable reminder rules: Premium (10d, 5d, 0d, Overdue), Renewals (30d, 15d, 7d), Maturity, Birthdays, Site visits
 * Web Notification API test & trigger dispatch
 */

import React, { useState } from 'react';
import { ReminderConfig } from '../../types';
import { useApp } from '../../context/AppContext';
import { storage } from '../../services/storage';
import {
  BellRing,
  CheckCircle2,
  Clock,
  Cake,
  ShieldCheck,
  Building2,
  Calendar,
  AlertCircle,
  Bell,
  Volume2,
  Smartphone,
  Save,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/date';

export const RemindersModule: React.FC = () => {
  const { currentUser, language, t, showToast } = useApp();

  const [configs, setConfigs] = useState<ReminderConfig[]>(() => storage.getReminderConfigs());
  const [notificationPermission, setNotificationPermission] = useState<string>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported'
  );

  const dailyItems = storage.getDailyWorkQueue(currentUser);

  const handleToggleConfig = (id: string) => {
    const updated = configs.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c));
    setConfigs(updated);
    storage.updateReminderConfigs(updated, currentUser);
    showToast('Reminder rule preference updated', 'info');
  };

  const handleRequestNotificationPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      showToast('Push Notifications are not supported in this browser.', 'warning');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission === 'granted') {
        new Notification('ASHISH SHEETAL ALL-IN-ONE', {
          body: 'System notifications are successfully activated! You will receive daily alerts.',
          icon: '/favicon.ico',
        });
        showToast('Notification permission granted!', 'success');
      } else {
        showToast('Notifications were denied by the browser.', 'warning');
      }
    } catch (e: any) {
      showToast(`Notification error: ${e.message}`, 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <BellRing className="w-5 h-5 text-amber-500" />
            {t.reminders}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {language === 'hi'
              ? 'स्वचालित देय अलर्ट, बीमा नवीनीकरण चेतावनी, जन्मदिन एवं साइट विजिट रिमाइंडर नियम'
              : 'Configurable Auto-Alerts: Premium Intervals, 30/15/7 Day Renewals, Maturity & Birthdays'}
          </p>
        </div>

        {/* Platform Notification Test Button */}
        <button
          onClick={handleRequestNotificationPermission}
          className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center gap-2 shadow-sm transition-all"
        >
          <Smartphone className="w-4 h-4 text-amber-400" />
          <span>Browser Alert Status: {notificationPermission}</span>
        </button>
      </div>

      {/* Reminder Config Rules Matrix */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
            Automated Alert Interval Rules
          </h3>
          <span className="text-[11px] text-slate-400">Rules calculate dynamically each morning</span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          {configs.map((cfg) => (
            <div key={cfg.id} className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    cfg.type === 'premium'
                      ? 'bg-amber-500/10 text-amber-600'
                      : cfg.type === 'birthday'
                      ? 'bg-pink-500/10 text-pink-600'
                      : 'bg-blue-500/10 text-blue-600'
                  }`}
                >
                  {cfg.type === 'birthday' ? (
                    <Cake className="w-4 h-4" />
                  ) : cfg.type === 'premium' ? (
                    <ShieldCheck className="w-4 h-4" />
                  ) : (
                    <Clock className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">{cfg.title}</h4>
                  <p className="text-[11px] text-slate-500">
                    Triggers {cfg.daysBefore === 0 ? 'on Due Date' : `${cfg.daysBefore} days in advance`} in the Daily Calling Queue & notifications
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cfg.enabled}
                    onChange={() => handleToggleConfig(cfg.id)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-amber-500"></div>
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Triggered Reminders History */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Active Alerts Generated Today ({dailyItems.length})
          </h3>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          {dailyItems.map((item) => (
            <div key={item.id} className="py-3 flex items-center justify-between gap-4">
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200">{item.title}</p>
                <p className="text-[11px] text-slate-500">
                  Target: {item.clientName} (📞 {item.phone}) • Due Date: {formatDate(item.dueDate)}
                </p>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                  item.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                }`}
              >
                {item.priority} Priority
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
