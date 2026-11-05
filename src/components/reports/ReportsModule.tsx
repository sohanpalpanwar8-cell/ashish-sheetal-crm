/**
 * Reports & Business Intelligence Module
 * Breakdown by Insurance Insurers, Property Types, Team Productivity, Pipeline, and CSV Exports
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { storage } from '../../services/storage';
import {
  BarChart3,
  Download,
  Printer,
  TrendingUp,
  ShieldCheck,
  Building2,
  Users,
  Target,
  Calendar,
  Filter,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/date';

export const ReportsModule: React.FC = () => {
  const { currentUser, language, t, showToast } = useApp();

  const [dateFilter, setDateFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState('all');

  const allUsers = storage.getUsers();
  const filterUser = selectedUser === 'all' ? currentUser : allUsers.find((u) => u.id === selectedUser) || currentUser;

  const customers = storage.getCustomers(filterUser);
  const policies = storage.getPolicies(filterUser);
  const properties = storage.getProperties(filterUser);
  const propertyLeads = storage.getPropertyLeads(filterUser);
  const leads = storage.getLeads(filterUser);
  const payments = storage.getPayments();

  // Aggregate Metrics
  const totalPremiumAnnual = policies.reduce((a, b) => a + b.premiumAmount, 0);
  const totalSumAssured = policies.reduce((a, b) => a + b.sumAssured, 0);
  const totalCommission = properties.reduce((a, b) => a + (b.commissionExpected || 0), 0);
  const totalPropertyInventoryValue = properties.reduce((a, b) => a + b.askingPrice, 0);

  // Insurer Distribution
  const insurerMap: Record<string, { count: number; premium: number }> = {};
  policies.forEach((p) => {
    if (!insurerMap[p.insurerName]) {
      insurerMap[p.insurerName] = { count: 0, premium: 0 };
    }
    insurerMap[p.insurerName].count += 1;
    insurerMap[p.insurerName].premium += p.premiumAmount;
  });

  // Property Type Distribution
  const propertyTypeMap: Record<string, number> = {};
  properties.forEach((p) => {
    propertyTypeMap[p.propertyType] = (propertyTypeMap[p.propertyType] || 0) + 1;
  });

  // Lead Conversion Stats
  const convertedCount = leads.filter((l) => l.status === 'converted').length;
  const conversionRate = leads.length > 0 ? Math.round((convertedCount / leads.length) * 100) : 0;

  const handleExportConsolidatedCSV = () => {
    const summaryData = [
      ['Metric', 'Value'],
      ['Total Client Profiles', customers.length],
      ['Total Active Policies', policies.length],
      ['Total Sum Assured Covered', totalSumAssured],
      ['Annual Premium Turnover', totalPremiumAnnual],
      ['Total Property Inventory Value', totalPropertyInventoryValue],
      ['Pipeline Commission Expected', totalCommission],
      ['Total Business Leads', leads.length],
      ['Converted Clients Ratio', `${conversionRate}%`],
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + summaryData.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `executive_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Consolidated Executive Report exported to CSV', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-500" />
            {t.reports}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {language === 'hi'
              ? 'व्यापार प्रदर्शन, पोर्टफोलियो विश्लेषण, टीम उत्पादकता एवं राजस्व रिपोर्ट'
              : 'Business Intelligence: Insurance Turnover, Property Pipeline, & Team Metrics'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {currentUser.role === 'main_super_admin' && (
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700"
            >
              <option value="all">Consolidated (All Team)</option>
              {allUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={handleExportConsolidatedCSV}
            className="px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export Summary
          </button>

          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 text-xs font-bold rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Report
          </button>
        </div>
      </div>

      {/* Top 4 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase">Total Insurance Premium</span>
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {formatCurrency(totalPremiumAnnual)}
          </p>
          <span className="text-[11px] text-slate-500 block">Across {policies.length} policies</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase">Sum Assured Cover</span>
            <TrendingUp className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400">
            {formatCurrency(totalSumAssured)}
          </p>
          <span className="text-[11px] text-slate-500 block">Total life & asset protection</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase">Property Inventory</span>
            <Building2 className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400">
            {formatCurrency(totalPropertyInventoryValue)}
          </p>
          <span className="text-[11px] text-slate-500 block">{properties.length} listings listed</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase">Lead Conversion</span>
            <Target className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-2xl font-black text-purple-600 dark:text-purple-400">
            {conversionRate}%
          </p>
          <span className="text-[11px] text-slate-500 block">
            {convertedCount} converted of {leads.length} leads
          </span>
        </div>
      </div>

      {/* Two Column Detailed Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Insurance Insurer Portfolio Distribution */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
            Insurance Turnover by Insurer
          </h3>
          <div className="space-y-3">
            {Object.entries(insurerMap).map(([insurer, data]) => (
              <div key={insurer} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-800 dark:text-slate-200 truncate">{insurer}</span>
                  <span className="text-emerald-600 font-extrabold">{formatCurrency(data.premium)}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>{data.count} Policies Managed</span>
                  <span>
                    {totalPremiumAnnual > 0
                      ? `${Math.round((data.premium / totalPremiumAnnual) * 100)}% share`
                      : '0%'}
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{
                      width: `${totalPremiumAnnual > 0 ? (data.premium / totalPremiumAnnual) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Real Estate Categories Distribution */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
            Property Holdings Distribution
          </h3>
          <div className="space-y-3">
            {Object.entries(propertyTypeMap).map(([type, count]) => (
              <div key={type} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-800 dark:text-slate-200 capitalize">
                    {type.replace('_', ' ')}
                  </span>
                  <span className="text-amber-600 font-extrabold">{count} Properties</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full"
                    style={{
                      width: `${properties.length > 0 ? (count / properties.length) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
