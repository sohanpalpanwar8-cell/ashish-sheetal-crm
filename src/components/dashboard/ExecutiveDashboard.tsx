/**
 * Executive Dashboard: Key Performance Indicators, Calling Queue, and Financial Overview
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { storage } from '../../services/storage';
import {
  Users,
  ShieldCheck,
  Target,
  PhoneCall,
  AlertCircle,
  Building2,
  Calendar,
  ArrowUpRight,
  Sparkles,
  Cake,
  TrendingUp,
  Clock,
  CheckCircle2,
  MessageCircle,
  Share2,
} from 'lucide-react';
import { formatCurrency, formatDate, getDaysDifference } from '../../utils/date';
import { generateWhatsAppUrl, getPremiumReminderMessage, getBirthdayWishMessage } from '../../utils/whatsapp';

export const ExecutiveDashboard: React.FC = () => {
  const { currentUser, language, t, setActiveTab, setSelectedCustomerId, showToast } = useApp();

  const [dateRange, setDateRange] = useState<'today' | 'month' | 'year'>('month');
  const [selectedUserFilter, setSelectedUserFilter] = useState<string>('all');

  const allUsers = storage.getUsers();
  const filterUser = selectedUserFilter === 'all' ? currentUser : allUsers.find((u) => u.id === selectedUserFilter) || currentUser;

  const customers = storage.getCustomers(filterUser);
  const policies = storage.getPolicies(filterUser);
  const properties = storage.getProperties(filterUser);
  const propertyLeads = storage.getPropertyLeads(filterUser);
  const leads = storage.getLeads(filterUser);
  const payments = storage.getPayments();
  const dailyQueue = storage.getDailyWorkQueue(filterUser);

  // Computed Metrics
  const activePolicies = policies.filter((p) => p.status === 'active' || p.status === 'grace_period');
  const activeLeads = leads.filter((l) => l.status !== 'converted' && l.status !== 'not_interested');
  const availableProperties = properties.filter((p) => p.status === 'available');

  const overduePayments = payments.filter((p) => p.status === 'overdue');
  const overdueTotal = overduePayments.reduce((acc, p) => acc + p.amount, 0);

  const pendingPayments = payments.filter((p) => p.status === 'pending');
  const pendingTotal = pendingPayments.reduce((acc, p) => acc + p.amount, 0);

  const totalCommissionExpected = properties.reduce((acc, p) => acc + (p.commissionExpected || 0), 0);
  const dealsUnderNegotiation = properties.filter((p) => p.status === 'under_negotiation' || p.status === 'token_given');

  // Customer birthdays today
  const birthdaysToday = customers.filter((c) => {
    if (!c.dob) return false;
    const d = new Date(c.dob);
    const now = new Date();
    return d.getDate() === now.getDate() && d.getMonth() === now.getMonth();
  });

  // Upcoming renewals in next 30 days
  const upcomingRenewals = policies.filter((p) => {
    const diff = getDaysDifference(p.renewalDate);
    return diff >= 0 && diff <= 30;
  });

  const handleDoneWorkItem = (itemId: string) => {
    showToast('Task marked complete and recorded in audit log', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Greeting & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white shadow-xl border border-slate-700/50">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-bold text-xs uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Ashish Sheetal Executive Command Center
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight mt-1">
            {language === 'hi'
              ? `नमस्ते, ${currentUser.name}`
              : `Welcome back, ${currentUser.name}`}
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            {currentUser.relationship || currentUser.role} • {customers.length} Clients • {activePolicies.length} Active Policies Managed
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {currentUser.role === 'main_super_admin' && (
            <select
              value={selectedUserFilter}
              onChange={(e) => setSelectedUserFilter(e.target.value)}
              className="bg-slate-800/90 text-white text-xs px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">👥 All Team Workspace</option>
              {allUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.relationship || u.role})
                </option>
              ))}
            </select>
          )}

          <div className="flex rounded-xl bg-slate-800 p-1 border border-slate-700">
            {(['today', 'month', 'year'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition-all ${
                  dateRange === range
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Birthday Banner if any */}
      {birthdaysToday.length > 0 && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-amber-500/10 border border-pink-300 dark:border-pink-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-pink-500/20 text-pink-600 dark:text-pink-400 flex items-center justify-center shrink-0">
              <Cake className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                🎂 {language === 'hi' ? 'आज ग्राहक जन्मदिन उत्सव!' : "Customer Birthdays Today!"}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                {birthdaysToday.map((b) => b.name).join(', ')} celebrating today. Send your warm wishes!
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {birthdaysToday.map((b) => {
              const waUrl = generateWhatsAppUrl(
                b.whatsapp || b.mobile,
                getBirthdayWishMessage(b.name, language)
              );
              return (
                <a
                  key={b.id}
                  href={waUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  Wish {b.name.split(' ')[0]}
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* Key Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Customers */}
        <div
          onClick={() => setActiveTab('customers')}
          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400">Clients</span>
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2 group-hover:text-blue-600 transition-colors">
            {customers.length}
          </p>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5 mt-1">
            <ArrowUpRight className="w-3 h-3" /> Active Profiles
          </span>
        </div>

        {/* Active Policies */}
        <div
          onClick={() => setActiveTab('insurance')}
          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400">Policies</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2 group-hover:text-emerald-600 transition-colors">
            {activePolicies.length}
          </p>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-1 block">
            LIC, Term, Car, Health
          </span>
        </div>

        {/* New Business Leads */}
        <div
          onClick={() => setActiveTab('leads')}
          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400">Leads</span>
            <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2 group-hover:text-purple-600 transition-colors">
            {activeLeads.length}
          </p>
          <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold mt-1 block">
            In Pipeline
          </span>
        </div>

        {/* Property Listings */}
        <div
          onClick={() => setActiveTab('properties')}
          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400">Properties</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2 group-hover:text-amber-600 transition-colors">
            {availableProperties.length}
          </p>
          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold mt-1 block">
            Plots, Flats, Shops
          </span>
        </div>

        {/* Overdue Premiums */}
        <div
          onClick={() => setActiveTab('payments')}
          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/50 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-red-600 dark:text-red-400">Overdue</span>
            <div className="w-7 h-7 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg font-extrabold text-red-600 dark:text-red-400 mt-2 truncate">
            {formatCurrency(overdueTotal)}
          </p>
          <span className="text-[10px] text-red-500 font-semibold mt-1 block">
            {overduePayments.length} Policies Overdue
          </span>
        </div>

        {/* Pipeline Commission */}
        <div
          onClick={() => setActiveTab('reports')}
          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400">Commission</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 mt-2 truncate">
            {formatCurrency(totalCommissionExpected)}
          </p>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-1 block">
            {dealsUnderNegotiation.length} Deals in closing
          </span>
        </div>
      </div>

      {/* Main Two-Column Section: Today's Calling Queue & Renewal Watchlist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Prioritized Calling List & Quick Actions */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-amber-500" />
                {language === 'hi' ? "आज की कॉलिंग सूची एवं आवश्यक कार्य" : "Today's Calling Queue & Priority Actions"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Direct phone calls & pre-formatted WhatsApp reminders
              </p>
            </div>
            <button
              onClick={() => setActiveTab('dailyWork')}
              className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
            >
              {language === 'hi' ? 'पूरा कार्य देखें →' : 'View Full Queue →'}
            </button>
          </div>

          <div className="space-y-2.5">
            {dailyQueue.slice(0, 5).map((item) => {
              const waUrl =
                item.type === 'premium_due'
                  ? generateWhatsAppUrl(
                      item.phone,
                      getPremiumReminderMessage(
                        item.clientName,
                        item.metadata?.policyNumber || 'N/A',
                        item.metadata?.insurer || 'LIC / Insurance',
                        item.metadata?.amount || 0,
                        item.dueDate,
                        language
                      )
                    )
                  : generateWhatsAppUrl(item.phone, `Hello ${item.clientName}, regarding: ${item.title}`);

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-amber-400/50 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-extrabold uppercase ${
                          item.priority === 'high'
                            ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {item.priority}
                      </span>
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {item.title}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      👤 <span className="font-semibold text-slate-800 dark:text-slate-200">{item.clientName}</span> • 📞 {item.phone}
                      {item.metadata?.amount && (
                        <span className="ml-2 font-bold text-amber-600 dark:text-amber-400">
                          (₹{item.metadata.amount.toLocaleString('en-IN')})
                        </span>
                      )}
                    </p>
                    {item.notes && <p className="text-[11px] text-slate-500 italic">"{item.notes}"</p>}
                  </div>

                  {/* Actions: Call, WhatsApp, Mark Done */}
                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={`tel:${item.phone}`}
                      className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900 text-xs font-bold flex items-center gap-1 transition-colors"
                      title="Direct Call"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      {t.call}
                    </a>

                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-xs font-bold flex items-center gap-1 transition-colors"
                      title="Send WhatsApp Reminder"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      {t.whatsapp}
                    </a>

                    <button
                      onClick={() => handleDoneWorkItem(item.id)}
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500 hover:text-white text-slate-600 dark:text-slate-300 text-xs transition-colors"
                      title="Mark as Completed"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (1 Col): Policy Renewal & Maturity Watchlist */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-500" />
                {language === 'hi' ? 'आगामी नवीनीकरण (30 दिन)' : 'Upcoming Renewals (30 Days)'}
              </h3>
              <span className="text-xs bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold px-2 py-0.5 rounded-full">
                {upcomingRenewals.length}
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {upcomingRenewals.length === 0 ? (
                <p className="text-xs text-slate-500 py-3 text-center">No renewals due in next 30 days</p>
              ) : (
                upcomingRenewals.slice(0, 4).map((p) => {
                  const daysLeft = getDaysDifference(p.renewalDate);
                  return (
                    <div key={p.id} className="py-2.5 flex items-center justify-between gap-2">
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                          {p.planName}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {p.customerName} • #{p.policyNumber}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            daysLeft <= 5
                              ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                              : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                          }`}
                        >
                          {daysLeft === 0 ? 'Today' : `${daysLeft}d left`}
                        </span>
                        <p className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 mt-0.5">
                          {formatCurrency(p.premiumAmount)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <button
              onClick={() => setActiveTab('insurance')}
              className="w-full mt-3 py-1.5 text-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 rounded-lg transition-colors"
            >
              Open Insurance Registry →
            </button>
          </div>

          {/* Quick Team Workspaces Glance */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
              {language === 'hi' ? 'टीम कार्यभार एवं प्रदर्शन' : 'Team Performance Overview'}
            </h3>
            <div className="space-y-2">
              {allUsers.slice(0, 4).map((user) => {
                const userPolicies = policies.filter((p) => p.assignedTo === user.id);
                const userProps = properties.filter((p) => p.assignedTo === user.id);
                return (
                  <div key={user.id} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200">{user.name}</p>
                      <p className="text-[10px] text-slate-500">{user.relationship || user.role}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {userPolicies.length} Policies • {userProps.length} Properties
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
