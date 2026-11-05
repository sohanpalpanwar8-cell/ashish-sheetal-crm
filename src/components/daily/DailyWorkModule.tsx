/**
 * Daily Work Management & Calling Queue
 * Aggregates Today's calls, overdue premiums, policy renewals, property leads, and client birthdays
 * Includes direct Call (tel:), pre-formatted WhatsApp reminders, Done, Reschedule, and Notes
 */

import React, { useState } from 'react';
import { DailyWorkItem } from '../../types';
import { useApp } from '../../context/AppContext';
import { storage } from '../../services/storage';
import {
  PhoneCall,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  MessageSquare,
  Clock,
  Cake,
  AlertCircle,
  Plus,
  RefreshCw,
  Edit,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/date';
import { generateWhatsAppUrl, getPremiumReminderMessage, getBirthdayWishMessage } from '../../utils/whatsapp';

export const DailyWorkModule: React.FC = () => {
  const { currentUser, language, t, showToast, triggerRefresh } = useApp();

  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [agentFilter, setAgentFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [completedItems, setCompletedItems] = useState<string[]>([]);
  const [rescheduleModalItem, setRescheduleModalItem] = useState<DailyWorkItem | null>(null);
  const [newDueDate, setNewDueDate] = useState<string>('');
  const [noteModalItem, setNoteModalItem] = useState<DailyWorkItem | null>(null);
  const [quickNote, setQuickNote] = useState<string>('');

  const dailyItems = storage.getDailyWorkQueue(currentUser);
  const allUsers = storage.getUsers();

  const filteredItems = dailyItems.filter((item) => {
    const matchType = typeFilter === 'all' || item.type === typeFilter;
    const matchAgent = agentFilter === 'all' || item.assignedTo === agentFilter;
    const q = searchQuery.toLowerCase();
    const matchSearch =
      item.title.toLowerCase().includes(q) ||
      item.clientName.toLowerCase().includes(q) ||
      item.phone.includes(q);

    return matchType && matchAgent && matchSearch;
  });

  const handleMarkDone = (item: DailyWorkItem) => {
    setCompletedItems((prev) => [...prev, item.id]);
    storage.logAudit(
      currentUser,
      'UPDATE',
      'DailyTask',
      `Completed calling task for ${item.clientName} (${item.title})`
    );
    showToast(`Completed task for ${item.clientName}`, 'success');
  };

  const handleSaveReschedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleModalItem || !newDueDate) return;

    storage.logAudit(
      currentUser,
      'UPDATE',
      'DailyTask',
      `Rescheduled follow-up call with ${rescheduleModalItem.clientName} to ${newDueDate}`
    );

    showToast(`Task rescheduled to ${newDueDate}`, 'info');
    setRescheduleModalItem(null);
    triggerRefresh();
  };

  const handleSaveQuickNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteModalItem || !quickNote.trim()) return;

    storage.logAudit(
      currentUser,
      'UPDATE',
      'DailyTaskNote',
      `Added call note for ${noteModalItem.clientName}: "${quickNote.trim()}"`
    );

    showToast(`Note logged for ${noteModalItem.clientName}`, 'success');
    setNoteModalItem(null);
    setQuickNote('');
  };

  return (
    <div className="space-y-5">
      {/* Page Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-amber-500" />
            {t.dailyWork}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {language === 'hi'
              ? 'आज की प्राथमिक कॉलिंग सूची, बकाया प्रीमियम, नवीनीकरण अलर्ट, एवं जन्मदिन शुभकामनाएं'
              : "Today's Prioritized Calling List, Follow-ups, Renewals, Overdue Premiums & Birthdays"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              triggerRefresh();
              showToast('Calling queue refreshed with latest system data', 'info');
            }}
            className="px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center gap-1.5 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all', label: t.allTasks, count: dailyItems.length },
          {
            id: 'premium_due',
            label: t.premiumsDue,
            count: dailyItems.filter((i) => i.type === 'premium_due').length,
          },
          {
            id: 'renewal',
            label: t.expiringPolicies,
            count: dailyItems.filter((i) => i.type === 'renewal').length,
          },
          {
            id: 'lead_followup',
            label: t.leadsToday,
            count: dailyItems.filter((i) => i.type === 'lead_followup').length,
          },
          {
            id: 'birthday',
            label: t.birthdaysToday,
            count: dailyItems.filter((i) => i.type === 'birthday').length,
          },
        ].map((tab) => {
          const isSelected = typeFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setTypeFilter(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-slate-900 text-amber-400 dark:bg-amber-500 dark:text-slate-950 shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isSelected ? 'bg-amber-400/20 text-amber-300 dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search & Agent Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={language === 'hi' ? 'ग्राहक का नाम या फोन नंबर खोजें...' : 'Search by client name or phone...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {currentUser.permissions?.canViewAllData && (
          <div className="flex items-center gap-2 shrink-0">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={agentFilter}
              onChange={(e) => setAgentFilter(e.target.value)}
              className="text-xs bg-amber-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-xl border border-amber-300 dark:border-slate-700 focus:outline-none font-semibold"
            >
              <option value="all">👥 {language === 'hi' ? 'सभी एजेंटों के कॉल्स (All Team)' : 'All Agents Calls'}</option>
              {allUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.relationship || u.role})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Calling Cards List */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="p-10 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400">
            🎉 All scheduled calls and tasks for today are clear!
          </div>
        ) : (
          filteredItems.map((item) => {
            const isDone = completedItems.includes(item.id);

            // WhatsApp link builder
            let waUrl = '';
            if (item.type === 'birthday') {
              waUrl = generateWhatsAppUrl(item.phone, getBirthdayWishMessage(item.clientName, language));
            } else if (item.type === 'premium_due') {
              waUrl = generateWhatsAppUrl(
                item.phone,
                getPremiumReminderMessage(
                  item.clientName,
                  item.metadata?.policyNumber || '',
                  item.metadata?.insurer || 'Insurance',
                  item.metadata?.amount || 0,
                  item.dueDate,
                  language
                )
              );
            } else {
              waUrl = generateWhatsAppUrl(
                item.phone,
                `Hello ${item.clientName}, greeting from Ashish Sheetal Office regarding: ${item.title}`
              );
            }

            return (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isDone
                    ? 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:border-amber-400/60'
                }`}
              >
                {/* Left Info: Policy details, Agent, Client, Amount & Last Date */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold uppercase ${
                        item.type === 'birthday'
                          ? 'bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300'
                          : item.priority === 'high'
                          ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {item.type.replace('_', ' ')}
                    </span>

                    {/* Assigned Agent Badge */}
                    {item.metadata?.assignedAgentName && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
                        💼 {language === 'hi' ? 'एजेंट:' : 'Agent:'} {item.metadata.assignedAgentName}
                      </span>
                    )}

                    {/* Premium / Last Date Indicator */}
                    {item.metadata?.lastDate && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                          (item.metadata.diffDays ?? 0) < 0
                            ? 'bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 border-red-300'
                            : (item.metadata.diffDays ?? 0) === 0
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-400'
                            : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300'
                        }`}
                      >
                        📅 {language === 'hi' ? 'अंतिम तारीख (Last Date):' : 'Due / Last Date:'} {formatDate(item.metadata.lastDate)}
                        {(item.metadata.diffDays ?? 0) < 0 && ` (⚠️ ${Math.abs(item.metadata.diffDays)} दिन ओवरड्यू)`}
                        {(item.metadata.diffDays ?? 0) === 0 && ` (🚨 आज अंतिम तारीख!)`}
                        {(item.metadata.diffDays ?? 0) > 0 && ` (${item.metadata.diffDays} दिन शेष)`}
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {item.title}
                  </h3>

                  {/* Customer, Policy & Premium Info */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-300">
                    <div>
                      <span className="text-slate-400">👤 {language === 'hi' ? 'ग्राहक:' : 'Client:'}</span>{' '}
                      <strong className="text-slate-800 dark:text-slate-100">{item.clientName}</strong>
                    </div>

                    <div className="font-mono text-slate-500">
                      📞 <a href={`tel:${item.phone}`} className="hover:underline">{item.phone}</a>
                    </div>

                    {item.metadata?.policyNumber && (
                      <div className="text-[11px] font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                        #️⃣ {item.metadata.policyNumber}
                      </div>
                    )}

                    {item.metadata?.amount && (
                      <div className="font-extrabold text-amber-600 dark:text-amber-400 text-xs bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                        💰 {language === 'hi' ? 'प्रीमियम राशि:' : 'Amount:'} {formatCurrency(item.metadata.amount)}
                      </div>
                    )}
                  </div>

                  {item.notes && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                      "{item.notes}"
                    </p>
                  )}
                </div>

                {/* Right Actions: Call, WhatsApp, Mark Done, Reschedule, Add Note */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <a
                    href={`tel:${item.phone}`}
                    className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 hover:bg-blue-100 font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    {t.call}
                  </a>

                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    {t.whatsapp}
                  </a>

                  <button
                    onClick={() => {
                      setNoteModalItem(item);
                      setQuickNote('');
                    }}
                    className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
                    title="Add Call Summary"
                  >
                    + Note
                  </button>

                  <button
                    onClick={() => {
                      setRescheduleModalItem(item);
                      setNewDueDate(item.dueDate);
                    }}
                    className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
                  >
                    {t.reschedule}
                  </button>

                  <button
                    onClick={() => handleMarkDone(item)}
                    disabled={isDone}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors ${
                      isDone
                        ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-default'
                        : 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-amber-500 hover:text-slate-950'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {isDone ? 'Completed' : t.done}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Reschedule Modal */}
      {rescheduleModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Reschedule Task for {rescheduleModalItem.clientName}
            </h4>
            <form onSubmit={handleSaveReschedule} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  New Call / Follow-up Date
                </label>
                <input
                  type="date"
                  required
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRescheduleModalItem(null)}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950"
                >
                  Confirm Reschedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Note Modal */}
      {noteModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Log Call Note for {noteModalItem.clientName}
            </h4>
            <form onSubmit={handleSaveQuickNote} className="space-y-3">
              <textarea
                rows={3}
                required
                placeholder="What was discussed during the call?..."
                value={quickNote}
                onChange={(e) => setQuickNote(e.target.value)}
                className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNoteModalItem(null)}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950"
                >
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
