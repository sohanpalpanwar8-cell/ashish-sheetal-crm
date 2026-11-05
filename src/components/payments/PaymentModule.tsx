/**
 * Payment & Multi-Account Financial Hub (पेमेंट्स एवं खाता लेखा-जोखा)
 * - 6 Dedicated QR & Bank Accounts for Ashish & Sheetal (Property, Insurance, General)
 * - Graphic visual analytics: Account-by-Account breakdown, Annual Month-by-Month trend, Owner split
 * - Date-wise & Day-wise filtering (Today's collection, Yesterday, This Week, Month, Full Year 2026, Lifetime)
 * - Detailed Transaction Inspector: Check customer, account, source, and amount in full detail
 * - Official receipts, WhatsApp payment confirmation, and 1-Click QR Barcodes
 */

import React, { useState, useMemo } from 'react';
import { PaymentRecord, QRCodeConfig } from '../../types';
import { useApp } from '../../context/AppContext';
import { storage } from '../../services/storage';
import {
  Receipt,
  Plus,
  Search,
  Filter,
  Download,
  CheckCircle2,
  AlertCircle,
  Clock,
  Printer,
  CreditCard,
  FileCheck,
  Building,
  Trash2,
  QrCode,
  Calendar,
  TrendingUp,
  BarChart2,
  Wallet,
  ExternalLink,
  ShieldCheck,
  Briefcase,
  ArrowUpRight,
  Share2,
  Eye,
  Check,
  Copy,
  Sparkles,
  ChevronRight,
  X,
  FileSpreadsheet,
  Edit2,
  Save,
  Upload,
  RotateCcw,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { formatCurrency, formatDate } from '../../utils/date';
import { generateWhatsAppUrl } from '../../utils/whatsapp';
import { PaymentQRModal } from './PaymentQRModal';
import { EditAccountModal } from './EditAccountModal';

export const PaymentModule: React.FC = () => {
  const { currentUser, language, t, showToast, triggerRefresh } = useApp();

  // Multi-Account configurations (6 accounts: 2 Property, 2 Insurance, 2 General for Ashish & Sheetal)
  const qrConfigs = storage.getQRConfigs();
  const allPayments = storage.getPayments();
  const customers = storage.getCustomers(currentUser);

  // Filter States
  const [datePreset, setDatePreset] = useState<
    'all' | 'today' | 'yesterday' | 'this_week' | 'this_month' | 'year_2026' | 'custom'
  >('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeQRModalPayment, setActiveQRModalPayment] = useState<PaymentRecord | null>(null);
  const [inspectedPayment, setInspectedPayment] = useState<PaymentRecord | null>(null);
  const [printingPayment, setPrintingPayment] = useState<PaymentRecord | null>(null);
  const [deleteConfirmPayment, setDeleteConfirmPayment] = useState<PaymentRecord | null>(null);
  const [editingAccountConfig, setEditingAccountConfig] = useState<QRCodeConfig | null>(null);

  const canDelete =
    currentUser.role === 'main_super_admin' ||
    currentUser.role === 'admin' ||
    currentUser.permissions?.canDeleteRecords;

  const canManageAccounts =
    currentUser.role === 'main_super_admin' ||
    currentUser.role === 'admin' ||
    currentUser.role === 'team_manager' ||
    currentUser.permissions?.canManageSettings;

  // Today & Month references (local time 2026-11-04)
  const todayStr = new Date().toISOString().split('T')[0];
  const currentYear = new Date().getFullYear().toString();
  const currentMonthStr = todayStr.slice(0, 7); // e.g. "2026-11"

  // Yesterday string helper
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = yesterdayDate.toISOString().split('T')[0];

  // 1. Calculate Analytics & Metrics
  const metrics = useMemo(() => {
    let todayTotal = 0;
    let todayCount = 0;
    let monthTotal = 0;
    let monthCount = 0;
    let yearTotal = 0;
    let yearCount = 0;
    let lifetimeTotal = 0;
    let lifetimeCount = 0;

    // Account-wise totals map
    const accountTotals: Record<string, { total: number; today: number; count: number }> = {};
    qrConfigs.forEach((cfg) => {
      accountTotals[cfg.id] = { total: 0, today: 0, count: 0 };
    });

    // Owner totals
    let ashishTotal = 0;
    let sheetalTotal = 0;

    // Category totals
    let propertyTotal = 0;
    let insuranceTotal = 0;
    let generalTotal = 0;

    // Monthly totals for 2026 (12 months: Jan - Dec)
    const monthlyTrend: { monthName: string; monthIndex: number; total: number; count: number }[] = [
      { monthName: 'Jan', monthIndex: 1, total: 0, count: 0 },
      { monthName: 'Feb', monthIndex: 2, total: 0, count: 0 },
      { monthName: 'Mar', monthIndex: 3, total: 0, count: 0 },
      { monthName: 'Apr', monthIndex: 4, total: 0, count: 0 },
      { monthName: 'May', monthIndex: 5, total: 0, count: 0 },
      { monthName: 'Jun', monthIndex: 6, total: 0, count: 0 },
      { monthName: 'Jul', monthIndex: 7, total: 0, count: 0 },
      { monthName: 'Aug', monthIndex: 8, total: 0, count: 0 },
      { monthName: 'Sep', monthIndex: 9, total: 0, count: 0 },
      { monthName: 'Oct', monthIndex: 10, total: 0, count: 0 },
      { monthName: 'Nov', monthIndex: 11, total: 0, count: 0 },
      { monthName: 'Dec', monthIndex: 12, total: 0, count: 0 },
    ];

    allPayments.forEach((p) => {
      if (p.status === 'paid') {
        const amt = Number(p.amount) || 0;
        lifetimeTotal += amt;
        lifetimeCount += 1;

        const pDate = p.paymentDate || p.dueDate;

        // Today check
        if (pDate === todayStr) {
          todayTotal += amt;
          todayCount += 1;
        }

        // Month check
        if (pDate.startsWith(currentMonthStr)) {
          monthTotal += amt;
          monthCount += 1;
        }

        // Year check
        if (pDate.startsWith(currentYear)) {
          yearTotal += amt;
          yearCount += 1;

          // Fill monthly trend
          const m = parseInt(pDate.split('-')[1], 10);
          if (m >= 1 && m <= 12) {
            monthlyTrend[m - 1].total += amt;
            monthlyTrend[m - 1].count += 1;
          }
        }

        // Account attribution
        const accId = p.accountId || (p.relatedEntity === 'property' ? 'qr_ashish_property' : p.relatedEntity === 'policy' ? 'qr_sheetal_insurance' : 'qr_ashish_general');
        if (accountTotals[accId]) {
          accountTotals[accId].total += amt;
          accountTotals[accId].count += 1;
          if (pDate === todayStr) {
            accountTotals[accId].today += amt;
          }
        }

        // Owner attribution
        if (p.accountOwner === 'Sheetal Panwar' || accId.includes('sheetal')) {
          sheetalTotal += amt;
        } else {
          ashishTotal += amt;
        }

        // Category attribution
        if (p.relatedEntity === 'property') propertyTotal += amt;
        else if (p.relatedEntity === 'policy') insuranceTotal += amt;
        else generalTotal += amt;
      }
    });

    const maxMonthlyTotal = Math.max(...monthlyTrend.map((m) => m.total), 1);

    return {
      todayTotal,
      todayCount,
      monthTotal,
      monthCount,
      yearTotal,
      yearCount,
      lifetimeTotal,
      lifetimeCount,
      accountTotals,
      ashishTotal,
      sheetalTotal,
      propertyTotal,
      insuranceTotal,
      generalTotal,
      monthlyTrend,
      maxMonthlyTotal,
    };
  }, [allPayments, qrConfigs, todayStr, currentMonthStr, currentYear]);

  // 2. Filtered Payments List
  const filteredPayments = useMemo(() => {
    return allPayments.filter((p) => {
      const pDate = p.paymentDate || p.dueDate;

      // Date Presets
      if (datePreset === 'today') {
        if (pDate !== todayStr) return false;
      } else if (datePreset === 'yesterday') {
        if (pDate !== yesterdayStr) return false;
      } else if (datePreset === 'this_month') {
        if (!pDate.startsWith(currentMonthStr)) return false;
      } else if (datePreset === 'year_2026') {
        if (!pDate.startsWith(currentYear)) return false;
      } else if (datePreset === 'this_week') {
        const d = new Date(pDate);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - d.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays > 7) return false;
      } else if (datePreset === 'custom') {
        if (fromDate && pDate < fromDate) return false;
        if (toDate && pDate > toDate) return false;
      }

      // Account filter
      if (selectedAccountId !== 'all') {
        const accId = p.accountId || (p.relatedEntity === 'property' ? 'qr_ashish_property' : p.relatedEntity === 'policy' ? 'qr_sheetal_insurance' : 'qr_ashish_general');
        if (accId !== selectedAccountId) return false;
      }

      // Category filter
      if (categoryFilter !== 'all') {
        if (p.relatedEntity !== categoryFilter) return false;
      }

      // Status filter
      if (statusFilter !== 'all') {
        if (p.status !== statusFilter) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          p.customerName.toLowerCase().includes(q) ||
          (p.customerPhone && p.customerPhone.includes(q)) ||
          (p.entityTitle && p.entityTitle.toLowerCase().includes(q)) ||
          (p.referenceNumber && p.referenceNumber.toLowerCase().includes(q)) ||
          (p.receiptNumber && p.receiptNumber.toLowerCase().includes(q)) ||
          (p.accountTitle && p.accountTitle.toLowerCase().includes(q)) ||
          (p.accountOwner && p.accountOwner.toLowerCase().includes(q));
        if (!match) return false;
      }

      return true;
    });
  }, [
    allPayments,
    datePreset,
    fromDate,
    toDate,
    selectedAccountId,
    categoryFilter,
    statusFilter,
    searchQuery,
    todayStr,
    yesterdayStr,
    currentMonthStr,
    currentYear,
  ]);

  // Form State for Adding New Payment
  const [formData, setFormData] = useState<Partial<PaymentRecord>>({
    customerId: '',
    customerName: '',
    customerPhone: '',
    relatedEntity: 'policy',
    entityTitle: '',
    amount: 25000,
    dueDate: todayStr,
    paymentDate: todayStr,
    status: 'paid',
    paymentMode: 'upi',
    referenceNumber: '',
    receiptNumber: `RCPT-${currentYear}-${Math.floor(1000 + Math.random() * 9000)}`,
    isVerified: true,
    accountId: 'qr_ashish_property',
    accountTitle: 'Ashish Property (ICICI Escrow)',
    accountOwner: 'Ashish Panwar',
    notes: '',
  });

  const handleOpenAdd = () => {
    const defaultCust = customers[0];
    const defaultAcc = qrConfigs[0];
    setFormData({
      customerId: defaultCust?.id || '',
      customerName: defaultCust?.name || '',
      customerPhone: defaultCust?.mobile || '',
      relatedEntity: 'property',
      entityTitle: 'Property Deal Advance / Token',
      amount: 50000,
      dueDate: todayStr,
      paymentDate: todayStr,
      status: 'paid',
      paymentMode: 'upi',
      referenceNumber: `UPI-${Date.now().toString().slice(-6)}`,
      receiptNumber: `RCPT-${currentYear}-${Math.floor(1000 + Math.random() * 9000)}`,
      isVerified: true,
      accountId: defaultAcc?.id || 'qr_ashish_property',
      accountTitle: defaultAcc ? `${defaultAcc.ownerName} (${defaultAcc.shortLabel})` : 'Ashish Property (ICICI Escrow)',
      accountOwner: defaultAcc?.ownerName || 'Ashish Panwar',
      notes: '',
    });
    setShowAddModal(true);
  };

  const handleCustomerChange = (custId: string) => {
    const cust = customers.find((c) => c.id === custId);
    if (cust) {
      setFormData((prev) => ({
        ...prev,
        customerId: cust.id,
        customerName: cust.name,
        customerPhone: cust.mobile,
      }));
    }
  };

  const handleAccountChange = (accId: string) => {
    const acc = qrConfigs.find((q) => q.id === accId);
    if (acc) {
      setFormData((prev) => ({
        ...prev,
        accountId: acc.id,
        accountTitle: `${acc.ownerName} (${acc.shortLabel})`,
        accountOwner: acc.ownerName,
        relatedEntity: acc.category === 'property' ? 'property' : acc.category === 'insurance' ? 'policy' : 'general',
      }));
    }
  };

  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName || !formData.amount) {
      showToast(language === 'hi' ? 'ग्राहक और राशि आवश्यक हैं!' : 'Customer and Amount are required', 'warning');
      return;
    }

    const selectedAcc = qrConfigs.find((q) => q.id === formData.accountId) || qrConfigs[0];

    const newPay: PaymentRecord = {
      id: `pay_${Date.now()}`,
      customerId: formData.customerId || '',
      customerName: formData.customerName,
      customerPhone: formData.customerPhone,
      relatedEntity: formData.relatedEntity || 'policy',
      entityTitle: formData.entityTitle || 'Payment Item',
      amount: Number(formData.amount) || 0,
      dueDate: formData.dueDate || todayStr,
      paymentDate: formData.status === 'paid' ? formData.paymentDate || todayStr : undefined,
      status: (formData.status as any) || 'paid',
      paymentMode: formData.paymentMode || 'upi',
      referenceNumber: formData.referenceNumber,
      receiptNumber: formData.receiptNumber,
      isVerified: formData.isVerified ?? true,
      accountId: selectedAcc.id,
      accountTitle: `${selectedAcc.ownerName} - ${selectedAcc.shortLabel} (${selectedAcc.bankName})`,
      accountOwner: selectedAcc.ownerName,
      notes: formData.notes,
      createdAt: new Date().toISOString(),
    };

    storage.savePayment(newPay, currentUser, true);
    setShowAddModal(false);
    showToast(
      language === 'hi'
        ? `₹${newPay.amount} की पेमेंट प्रविष्टि खाता "${selectedAcc.shortLabel}" में दर्ज हुई`
        : `Payment entry of ₹${newPay.amount} logged in account "${selectedAcc.shortLabel}"`,
      'success'
    );
    triggerRefresh();
  };

  const handleMarkAsPaid = (pay: PaymentRecord) => {
    const defaultAcc = qrConfigs.find((q) => q.id === pay.accountId) || qrConfigs[0];
    const updated: PaymentRecord = {
      ...pay,
      status: 'paid',
      paymentDate: todayStr,
      isVerified: true,
      accountId: pay.accountId || defaultAcc.id,
      accountTitle: pay.accountTitle || `${defaultAcc.ownerName} - ${defaultAcc.shortLabel} (${defaultAcc.bankName})`,
      accountOwner: pay.accountOwner || defaultAcc.ownerName,
    };
    storage.savePayment(updated, currentUser, false);
    showToast(`Payment of ₹${pay.amount} marked as Paid & Verified`, 'success');
    triggerRefresh();
  };

  const handlePrintReceipt = (pay: PaymentRecord) => {
    setPrintingPayment(pay);
    setTimeout(() => {
      window.print();
    }, 250);
  };

  const handleConfirmDeletePayment = () => {
    if (!deleteConfirmPayment) return;
    storage.deletePayment(deleteConfirmPayment.id, currentUser);
    showToast(
      language === 'hi'
        ? `पेमेंट रिकॉर्ड (${deleteConfirmPayment.customerName}) हटा दिया गया`
        : `Payment record (${deleteConfirmPayment.customerName}) deleted`,
      'info'
    );
    setDeleteConfirmPayment(null);
    if (inspectedPayment?.id === deleteConfirmPayment.id) {
      setInspectedPayment(null);
    }
    triggerRefresh();
  };

  // Save Account Customizations
  const handleSaveAccountConfig = (updatedConfig: QRCodeConfig) => {
    if (!updatedConfig.shortLabel?.trim() || !updatedConfig.accountName?.trim() || !updatedConfig.upiId?.trim()) {
      showToast(
        language === 'hi' ? 'खाते का नाम, फर्म का नाम और UPI ID अनिवार्य हैं!' : 'Account Name, Firm Name, and UPI ID are required!',
        'warning'
      );
      return;
    }
    const list = storage.getQRConfigs();
    const updated = list.map((q) => (q.id === updatedConfig.id ? updatedConfig : q));
    storage.saveQRConfigs(updated, currentUser);
    showToast(
      language === 'hi'
        ? `✓ खाता "${updatedConfig.shortLabel}" का नाम एवं सेटिंग्स सफलतापूर्वक सुरक्षित हुईं!`
        : `✓ Account "${updatedConfig.shortLabel}" settings saved successfully!`,
      'success'
    );
    setEditingAccountConfig(null);
    triggerRefresh();
  };

  // Reset Account to System Default
  const handleResetSingleAccount = (accountId: string) => {
    if (window.confirm(language === 'hi' ? 'क्या आप इस खाते की सेटिंग्स को मूल डिफ़ॉल्ट पर रीसेट करना चाहते हैं?' : 'Reset this account to default settings?')) {
      const updated = storage.resetQRConfigToDefault(accountId, currentUser);
      const restored = updated.find((q) => q.id === accountId);
      if (restored) setEditingAccountConfig(restored);
      showToast(
        language === 'hi' ? 'खाता मूल डिफ़ॉल्ट पर रीसेट हो गया' : 'Account reset to original default',
        'info'
      );
      triggerRefresh();
    }
  };

  // Export Filtered Statement to CSV
  const handleExportCSV = () => {
    const headers = [
      'Receipt #',
      'Payment Date',
      'Customer Name',
      'Phone',
      'Receiving Account',
      'Account Owner',
      'Category',
      'Service/Deal Description',
      'Amount (INR)',
      'Payment Mode',
      'Reference/UTR No',
      'Status',
      'Verified',
      'Notes',
    ];

    const rows = filteredPayments.map((p) => [
      `"${p.receiptNumber || ''}"`,
      `"${p.paymentDate || p.dueDate}"`,
      `"${p.customerName}"`,
      `"${p.customerPhone || ''}"`,
      `"${p.accountTitle || ''}"`,
      `"${p.accountOwner || ''}"`,
      `"${p.relatedEntity}"`,
      `"${(p.entityTitle || '').replace(/"/g, '""')}"`,
      p.amount,
      `"${p.paymentMode || ''}"`,
      `"${p.referenceNumber || ''}"`,
      `"${p.status}"`,
      p.isVerified ? 'Yes' : 'No',
      `"${(p.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Payments_Ledger_Statement_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(
      language === 'hi'
        ? '✓ वित्तीय विवरण (Statement) CSV फ़ाइल में डाउनलोड हुआ'
        : 'Payment statement exported successfully as CSV',
      'success'
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. Page Title & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Wallet className="w-5 h-5 text-amber-500" />
            <span>{language === 'hi' ? 'पेमेंट्स एवं खाता लेखा-जोखा (Payment Accounting)' : 'Payments & Accounts Hub'}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {language === 'hi'
              ? 'आशीष व शीतल के 6 खातों में प्राप्त कुल भुगतान, आज का कलेक्शन, वार्षिक ग्राफ एवं विस्तृत लेन-देन ऑडिट'
              : 'Multi-account financial collections for Ashish & Sheetal, today\'s cash flow, yearly trend & audit'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Quick Payment QR Button */}
          {filteredPayments.length > 0 && (
            <button
              onClick={() => setActiveQRModalPayment(filteredPayments[0])}
              className="px-3.5 py-2 text-xs font-bold rounded-xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              title={language === 'hi' ? 'पेमेंट QR कोड / बारकोड खोलें' : 'Open Payment QR / Barcode'}
            >
              <QrCode className="w-4 h-4 text-amber-500" />
              <span>{language === 'hi' ? 'पेमेंट QR बारकोड' : 'Payment QR'}</span>
            </button>
          )}

          {/* Export Statement CSV */}
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-all cursor-pointer"
            title="Download CSV Statement"
          >
            <Download className="w-4 h-4 text-blue-500" />
            <span>{language === 'hi' ? 'स्टेटमेंट डाउनलोड' : 'Export CSV'}</span>
          </button>

          {/* Record Payment Button */}
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'hi' ? 'नया भुगतान दर्ज करें' : 'Record Payment'}</span>
          </button>
        </div>
      </div>

      {/* 2. Hero KPI Cards: TODAY'S COLLECTION, Month, Year & Lifetime */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* TODAY'S COLLECTION - User specific requirement */}
        <div
          onClick={() => setDatePreset('today')}
          className={`p-4 rounded-3xl border transition-all cursor-pointer relative overflow-hidden shadow-sm ${
            datePreset === 'today'
              ? 'bg-amber-500 text-slate-950 border-amber-400 ring-2 ring-amber-400 shadow-amber-500/20 shadow-lg'
              : 'bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border-amber-500/30 hover:border-amber-500/60 text-slate-900 dark:text-white'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 opacity-90">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{language === 'hi' ? '🌟 आज का पेमेंट (Today)' : "🌟 Today's Collection"}</span>
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              datePreset === 'today' ? 'bg-slate-950 text-amber-400' : 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
            }`}>
              {formatDate(todayStr)}
            </span>
          </div>

          <div className="text-2xl font-black tracking-tight mt-1">
            {formatCurrency(metrics.todayTotal)}
          </div>

          <div className="flex items-center justify-between text-xs mt-2 opacity-80">
            <span>{metrics.todayCount} {language === 'hi' ? 'लेन-देन आज प्राप्त' : 'receipts today'}</span>
            <span className="text-[10px] underline font-bold">
              {datePreset === 'today' ? (language === 'hi' ? '✓ फ़िल्टर चालू' : 'Active') : (language === 'hi' ? 'क्लिक कर देखें →' : 'Click to view →')}
            </span>
          </div>
        </div>

        {/* THIS MONTH'S COLLECTION */}
        <div
          onClick={() => setDatePreset('this_month')}
          className={`p-4 rounded-3xl border transition-all cursor-pointer shadow-sm ${
            datePreset === 'this_month'
              ? 'bg-emerald-600 text-white border-emerald-500 ring-2 ring-emerald-400 shadow-emerald-500/20 shadow-lg'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 text-slate-900 dark:text-white'
          }`}
        >
          <div className="flex items-center justify-between mb-1 text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-500" />
              <span>{language === 'hi' ? 'इस महीने (This Month)' : 'This Month'}</span>
            </span>
            <span className="text-[10px] font-bold">Nov 2026</span>
          </div>

          <div className="text-2xl font-black tracking-tight mt-1 text-emerald-600 dark:text-emerald-400">
            {formatCurrency(metrics.monthTotal)}
          </div>

          <div className="flex items-center justify-between text-xs mt-2 text-slate-500 dark:text-slate-400">
            <span>{metrics.monthCount} {language === 'hi' ? 'भुगतान दर्ज' : 'transactions'}</span>
            <span className="text-[10px] underline font-bold">
              {datePreset === 'this_month' ? '✓ Filtered' : (language === 'hi' ? 'महीने का देखें →' : 'View month →')}
            </span>
          </div>
        </div>

        {/* FULL YEAR 2026 COLLECTION */}
        <div
          onClick={() => setDatePreset('year_2026')}
          className={`p-4 rounded-3xl border transition-all cursor-pointer shadow-sm ${
            datePreset === 'year_2026'
              ? 'bg-blue-600 text-white border-blue-500 ring-2 ring-blue-400 shadow-blue-500/20 shadow-lg'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-500/50 text-slate-900 dark:text-white'
          }`}
        >
          <div className="flex items-center justify-between mb-1 text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1.5">
              <BarChart2 className="w-3.5 h-3.5 text-blue-500" />
              <span>{language === 'hi' ? 'पूरे साल का रिकॉर्ड (2026)' : 'Full Year (2026)'}</span>
            </span>
            <span className="text-[10px] font-bold">12 Months</span>
          </div>

          <div className="text-2xl font-black tracking-tight mt-1 text-blue-600 dark:text-blue-400">
            {formatCurrency(metrics.yearTotal)}
          </div>

          <div className="flex items-center justify-between text-xs mt-2 text-slate-500 dark:text-slate-400">
            <span>{metrics.yearCount} {language === 'hi' ? 'कुल वार्षिक रसीदें' : 'total year receipts'}</span>
            <span className="text-[10px] underline font-bold">
              {datePreset === 'year_2026' ? '✓ Filtered' : (language === 'hi' ? 'साल का देखें →' : 'View year →')}
            </span>
          </div>
        </div>

        {/* LIFETIME TOTAL COLLECTION */}
        <div
          onClick={() => setDatePreset('all')}
          className={`p-4 rounded-3xl border transition-all cursor-pointer shadow-sm ${
            datePreset === 'all' && selectedAccountId === 'all'
              ? 'bg-purple-600 text-white border-purple-500 ring-2 ring-purple-400 shadow-purple-500/20 shadow-lg'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-purple-500/50 text-slate-900 dark:text-white'
          }`}
        >
          <div className="flex items-center justify-between mb-1 text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-purple-500" />
              <span>{language === 'hi' ? 'लाइफटाइम रिकॉर्ड (All Time)' : 'Lifetime Record'}</span>
            </span>
            <span className="text-[10px] font-bold">All Accounts</span>
          </div>

          <div className="text-2xl font-black tracking-tight mt-1 text-purple-600 dark:text-purple-400">
            {formatCurrency(metrics.lifetimeTotal)}
          </div>

          <div className="flex items-center justify-between text-xs mt-2 text-slate-500 dark:text-slate-400">
            <span>{metrics.lifetimeCount} {language === 'hi' ? 'संपूर्ण रसीदें' : 'lifetime entries'}</span>
            <span className="text-[10px] underline font-bold">
              {language === 'hi' ? 'सभी देखें →' : 'View all →'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Graphic Visual Breakdown: All 6 Accounts for Ashish & Sheetal */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-amber-500" />
              <span>
                {language === 'hi'
                  ? '📊 खातावार ग्राफिक विवरण (सभी 6 अलग-अलग खाते - आशीष व शीतल)'
                  : '📊 Account-wise Inflow Breakdown (All 6 Accounts - Ashish & Sheetal)'}
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {language === 'hi'
                ? 'किसी भी खाते पर क्लिक करके फ़िल्टर करें या "खाता नाम व सेटिंग्स बदलें" से नाम, बैंक व QR अपडेट करें।'
                : 'Click on any account card to filter, or edit names, bank details, and QR codes.'}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {canManageAccounts && (
              <button
                type="button"
                onClick={() => setEditingAccountConfig(qrConfigs.find((q) => q.id === selectedAccountId) || qrConfigs[0])}
                className="px-3 py-1.5 text-xs font-bold rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                title={language === 'hi' ? 'खाता नाम, बैंक विवरण एवं QR कोड बदलें' : 'Edit Account Names, Bank Details & QR'}
              >
                <Edit2 className="w-3.5 h-3.5 text-amber-600" />
                <span>{language === 'hi' ? '✏️ खाता नाम व सेटिंग्स बदलें' : '✏️ Edit Account Names'}</span>
              </button>
            )}

            {selectedAccountId !== 'all' && (
              <button
                onClick={() => setSelectedAccountId('all')}
                className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 self-start sm:self-auto cursor-pointer"
              >
                <span>✕ {language === 'hi' ? 'खाता फ़िल्टर हटाएं (Reset Account)' : 'Clear Account Filter'}</span>
              </button>
            )}
          </div>
        </div>

        {/* 6 Account Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {qrConfigs.map((cfg) => {
            const accData = metrics.accountTotals[cfg.id] || { total: 0, today: 0, count: 0 };
            const isSelected = selectedAccountId === cfg.id;
            const percentage = metrics.lifetimeTotal > 0 ? ((accData.total / metrics.lifetimeTotal) * 100).toFixed(1) : '0';

            return (
              <div
                key={cfg.id}
                onClick={() => setSelectedAccountId(isSelected ? 'all' : cfg.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer relative space-y-3 ${
                  isSelected
                    ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500 shadow-md'
                    : 'bg-slate-50/70 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/80 hover:border-amber-500/50'
                }`}
              >
                {/* Account Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      {cfg.ownerName}
                    </span>
                    <h4 className="font-extrabold text-xs text-slate-900 dark:text-white mt-1 truncate">
                      {cfg.shortLabel}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[190px]">
                      {cfg.bankName}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="font-mono text-[10px] text-slate-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                      {percentage}%
                    </span>
                    {canManageAccounts && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingAccountConfig(cfg);
                        }}
                        className="p-1.5 rounded-lg bg-white dark:bg-slate-900 hover:bg-amber-100 dark:hover:bg-amber-950 text-slate-500 hover:text-amber-600 border border-slate-200 dark:border-slate-700 transition-colors shadow-xs"
                        title={language === 'hi' ? `"${cfg.shortLabel}" का नाम व सेटिंग्स बदलें` : `Edit ${cfg.shortLabel}`}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Amount Totals */}
                <div className="flex items-baseline justify-between pt-1">
                  <div>
                    <div className="text-xs text-slate-500">कुल जमा (Total Inflow)</div>
                    <div className="text-lg font-black text-slate-900 dark:text-white">
                      {formatCurrency(accData.total)}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[10px] text-amber-600 font-bold">
                      {language === 'hi' ? 'आज प्राप्त:' : 'Today:'} {formatCurrency(accData.today)}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {accData.count} {language === 'hi' ? 'रसीदें' : 'receipts'}
                    </div>
                  </div>
                </div>

                {/* Progress bar showing % of total business */}
                <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      cfg.ownerKey === 'ashish' ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(2, Number(percentage)))}%` }}
                  />
                </div>

                {/* UPI Tag */}
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-0.5">
                  <span className="truncate">{cfg.upiId}</span>
                  {isSelected && (
                    <span className="text-amber-600 font-bold">✓ Selected</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 4. Graphical Visual Charts: Annual 2026 Month-by-Month Trend & Owner Share */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
          {/* Month-by-Month Annual Trend Bar Chart (Jan - Dec 2026) */}
          <div className="lg:col-span-2 p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <BarChart2 className="w-3.5 h-3.5 text-blue-500" />
                <span>{language === 'hi' ? '📅 2026 माह-दर-माह कलेक्शन ट्रेंड (Jan - Dec)' : '📅 2026 Monthly Trend (Jan - Dec)'}</span>
              </span>
              <span className="text-[10px] font-bold text-slate-500">
                {language === 'hi' ? 'वार्षिक कुल:' : 'Yearly Total:'} {formatCurrency(metrics.yearTotal)}
              </span>
            </div>

            {/* Vertical Bar Chart */}
            <div className="grid grid-cols-12 gap-1.5 h-32 items-end pt-4 pb-2 border-b border-slate-200 dark:border-slate-700">
              {metrics.monthlyTrend.map((m) => {
                const heightPercent = m.total > 0 ? Math.max(8, (m.total / metrics.maxMonthlyTotal) * 100) : 0;
                const isCurrentMonth = m.monthIndex === 11; // Nov
                return (
                  <div
                    key={m.monthIndex}
                    title={`${m.monthName} 2026: ${formatCurrency(m.total)} (${m.count} receipts)`}
                    className="flex flex-col items-center h-full justify-end group cursor-pointer"
                  >
                    <div
                      className={`w-full rounded-t-md transition-all group-hover:opacity-80 ${
                        isCurrentMonth
                          ? 'bg-amber-500 shadow-xs'
                          : m.total > 0
                          ? 'bg-blue-500/80 dark:bg-blue-600/80'
                          : 'bg-slate-200 dark:bg-slate-700/40'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                    <span className={`text-[9px] mt-1 font-bold ${isCurrentMonth ? 'text-amber-500' : 'text-slate-400'}`}>
                      {m.monthName}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="text-[10px] text-slate-400 text-center">
              {language === 'hi'
                ? '* पीला बार मौजूदा चालू माह (नवंबर 2026) का कलेक्शन दर्शाता है।'
                : '* Yellow bar represents the current active month (Nov 2026).'}
            </p>
          </div>

          {/* Owner & Category Graphic Ratio Split */}
          <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-4">
            <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-purple-500" />
              <span>{language === 'hi' ? 'आशीष vs शीतल विभाजन' : 'Ashish vs Sheetal Split'}</span>
            </span>

            {/* Ashish & Sheetal Comparison */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between font-bold">
                <span className="text-amber-700 dark:text-amber-300">Ashish Panwar Accounts:</span>
                <span>{formatCurrency(metrics.ashishTotal)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-emerald-700 dark:text-emerald-300">Sheetal Panwar Accounts:</span>
                <span>{formatCurrency(metrics.sheetalTotal)}</span>
              </div>

              {/* Proportional Segment Bar */}
              <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-700 flex overflow-hidden">
                <div
                  className="bg-amber-500 h-full"
                  style={{
                    width: `${metrics.lifetimeTotal > 0 ? (metrics.ashishTotal / metrics.lifetimeTotal) * 100 : 50}%`,
                  }}
                  title={`Ashish: ${formatCurrency(metrics.ashishTotal)}`}
                />
                <div
                  className="bg-emerald-500 h-full"
                  style={{
                    width: `${metrics.lifetimeTotal > 0 ? (metrics.sheetalTotal / metrics.lifetimeTotal) * 100 : 50}%`,
                  }}
                  title={`Sheetal: ${formatCurrency(metrics.sheetalTotal)}`}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 pt-0.5">
                <span>Ashish: {metrics.lifetimeTotal > 0 ? ((metrics.ashishTotal / metrics.lifetimeTotal) * 100).toFixed(0) : 50}%</span>
                <span>Sheetal: {metrics.lifetimeTotal > 0 ? ((metrics.sheetalTotal / metrics.lifetimeTotal) * 100).toFixed(0) : 50}%</span>
              </div>
            </div>

            {/* Business Category Split */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">🏢 प्रॉपर्टी सौदे:</span>
                <span className="font-bold">{formatCurrency(metrics.propertyTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">🛡️ बीमा प्रीमियम:</span>
                <span className="font-bold">{formatCurrency(metrics.insuranceTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">💼 सामान्य/ऑफिस:</span>
                <span className="font-bold">{formatCurrency(metrics.generalTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Date-wise & Day-wise Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-3">
        {/* Date Presets Row */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-slate-500 mr-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-amber-500" />
            <span>{language === 'hi' ? 'समय अवधि फ़िल्टर:' : 'Filter Time:'}</span>
          </span>

          {[
            { id: 'all', label: language === 'hi' ? 'सभी रिकॉर्ड (All Time)' : 'All Time' },
            { id: 'today', label: language === 'hi' ? '🌟 आज का पेमेंट' : "🌟 Today's" },
            { id: 'yesterday', label: language === 'hi' ? 'कल का पेमेंट' : "Yesterday's" },
            { id: 'this_week', label: language === 'hi' ? 'इस सप्ताह (7 Days)' : 'This Week' },
            { id: 'this_month', label: language === 'hi' ? 'इस महीने (Nov)' : 'This Month' },
            { id: 'year_2026', label: language === 'hi' ? 'पूरा साल 2026' : 'Full Year 2026' },
            { id: 'custom', label: language === 'hi' ? '📅 कस्टम तारीख रेंज' : 'Custom Range' },
          ].map((preset) => (
            <button
              key={preset.id}
              onClick={() => setDatePreset(preset.id as any)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                datePreset === preset.id
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Custom Date Pickers (Shown if Custom picked) */}
        {datePreset === 'custom' && (
          <div className="p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {language === 'hi' ? 'आरंभ तारीख (From):' : 'From Date:'}
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {language === 'hi' ? 'अंतिम तारीख (To):' : 'To Date:'}
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {(fromDate || toDate) && (
              <button
                onClick={() => {
                  setFromDate('');
                  setToDate('');
                }}
                className="text-xs font-bold text-red-600 hover:underline cursor-pointer"
              >
                {language === 'hi' ? 'तारीख साफ़ करें' : 'Clear dates'}
              </button>
            )}
          </div>
        )}

        {/* Search & Dropdown Filters Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={language === 'hi' ? 'ग्राहक, फोन, UTR या रसीद # खोजें...' : 'Search customer, phone, UTR or receipt #...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Account Filter */}
          <div>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">{language === 'hi' ? 'सभी 6 खाते (All 6 Accounts)' : 'All 6 Accounts'}</option>
              {qrConfigs.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.ownerName} • {q.shortLabel} ({q.bankName})
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">{language === 'hi' ? 'सभी श्रेणियां (All Categories)' : 'All Categories'}</option>
              <option value="property">🏢 प्रॉपर्टी सौदे (Property Deals)</option>
              <option value="policy">🛡️ बीमा प्रीमियम (Insurance Policies)</option>
              <option value="general">💼 सामान्य/ऑफिस (General Services)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">{language === 'hi' ? 'सभी स्थिति (All Status)' : 'All Status'}</option>
              <option value="paid">✓ Paid & Settled</option>
              <option value="pending">⏳ Pending & Due</option>
              <option value="overdue">⚠️ Overdue Alerts</option>
            </select>
          </div>
        </div>
      </div>

      {/* 6. Payments Ledger & Transactions Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-amber-500" />
            <h3 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
              {language === 'hi' ? 'लेन-देन विवरण (Transactions Ledger)' : 'Transactions Ledger'}
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {filteredPayments.length} {language === 'hi' ? 'प्रविष्टियां' : 'records'}
            </span>
          </div>

          <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {language === 'hi' ? 'फ़िल्टर कुल राशि:' : 'Filtered Sum:'}{' '}
            <span className="text-amber-600 dark:text-amber-400 text-sm font-black">
              {formatCurrency(filteredPayments.reduce((s, p) => s + (p.status === 'paid' ? p.amount : 0), 0))}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">रसीद / तारीख</th>
                <th className="px-4 py-3">ग्राहक (Customer)</th>
                <th className="px-4 py-3">खाता (Received In Account)</th>
                <th className="px-4 py-3">विवरण / सेवा</th>
                <th className="px-4 py-3">राशि (Amount)</th>
                <th className="px-4 py-3">माध्यम / UTR</th>
                <th className="px-4 py-3">स्थिति</th>
                <th className="px-4 py-3 text-right">कार्य (Actions)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-3">
                      <Receipt className="w-6 h-6" />
                    </div>
                    <p className="font-extrabold text-sm text-slate-800 dark:text-slate-200">
                      {language === 'hi' ? 'सभी डेमो पेमेंट हटा दिए गए हैं (0 रिकॉर्ड)' : 'All demo payments cleared (0 records)'}
                    </p>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      {language === 'hi'
                        ? 'अब आपका पेमेंट लेज़र बिल्कुल साफ़ है। अपने वास्तविक ग्राहकों का पहला भुगतान दर्ज करने के लिए नीचे क्लिक करें।'
                        : 'Your ledger is now completely clean. Click below to record your first real payment.'}
                    </p>
                    <button
                      onClick={handleOpenAdd}
                      className="mt-4 px-4 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 inline-flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{language === 'hi' ? 'नया वास्तविक भुगतान दर्ज करें' : 'Record New Payment'}</span>
                    </button>
                  </td>
                </tr>
              ) : (
                filteredPayments.map((pay) => {
                  const isToday = (pay.paymentDate || pay.dueDate) === todayStr;
                  return (
                    <tr
                      key={pay.id}
                      onClick={() => setInspectedPayment(pay)}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer ${
                        isToday ? 'bg-amber-500/5' : ''
                      }`}
                    >
                      {/* Receipt & Date */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {isToday && (
                            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" title="Today's Payment" />
                          )}
                          <span className="font-mono text-[11px] font-bold text-slate-900 dark:text-white">
                            {pay.receiptNumber || 'RCPT-N/A'}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {formatDate(pay.paymentDate || pay.dueDate)}
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="px-4 py-3">
                        <span className="font-semibold block text-slate-900 dark:text-white">{pay.customerName}</span>
                        <span className="font-mono text-[11px] text-slate-500">{pay.customerPhone}</span>
                      </td>

                      {/* Receiving Account */}
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-md ${
                          pay.accountOwner === 'Sheetal Panwar'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                        }`}>
                          {pay.accountTitle || (pay.relatedEntity === 'property' ? 'Ashish - Property' : 'Sheetal - Insurance')}
                        </span>
                      </td>

                      {/* Service / Entity Description */}
                      <td className="px-4 py-3">
                        <span className="font-medium text-slate-800 dark:text-slate-200 block truncate max-w-[200px]">
                          {pay.entityTitle}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase font-bold">
                          {pay.relatedEntity}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="px-4 py-3 font-black text-slate-900 dark:text-white text-sm">
                        {formatCurrency(pay.amount)}
                      </td>

                      {/* Mode & UTR */}
                      <td className="px-4 py-3">
                        <span className="uppercase text-[10px] font-extrabold text-slate-700 dark:text-slate-300 block">
                          {pay.paymentMode || 'UPI'}
                        </span>
                        {pay.referenceNumber && (
                          <span className="font-mono text-[10px] text-slate-400 block truncate max-w-[120px]">
                            {pay.referenceNumber}
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            pay.status === 'paid'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : pay.status === 'overdue'
                              ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 animate-pulse'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          {pay.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Inspect Detail Button */}
                          <button
                            onClick={() => setInspectedPayment(pay)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                            title={language === 'hi' ? 'विवरण खोलें (Inspect)' : 'Inspect Details'}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* QR Barcode Button */}
                          <button
                            onClick={() => setActiveQRModalPayment(pay)}
                            className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 flex items-center gap-1 shadow-xs transition-all cursor-pointer"
                            title={language === 'hi' ? 'पेमेंट QR कोड / बारकोड एवं व्हाट्सएप' : 'Payment QR Barcode & WhatsApp'}
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            <span>QR</span>
                          </button>

                          {pay.status !== 'paid' && (
                            <button
                              onClick={() => handleMarkAsPaid(pay)}
                              className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                            >
                              Mark Paid
                            </button>
                          )}

                          <button
                            onClick={() => handlePrintReceipt(pay)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                            title="Print Receipt"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          {canDelete && (
                            <button
                              onClick={() => setDeleteConfirmPayment(pay)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 hover:text-red-700 transition-colors"
                              title={language === 'hi' ? 'पेमेंट हटाएं' : 'Delete Payment'}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 7. TRANSACTION INSPECTION MODAL (User Requirement: खोल के देखें तो उसमें ट्रांजेक्शन, कस्टमर का नाम वगैरह, कहां से आया है, कितना पेमेंट किसने किया) */}
      {inspectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 my-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {language === 'hi' ? 'लेन-देन संपूर्ण विवरण (Payment Audit)' : 'Payment Inspection & Audit'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {inspectedPayment.receiptNumber || 'RCPT-N/A'} • {formatDate(inspectedPayment.paymentDate || inspectedPayment.dueDate)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectedPayment(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Amount Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300 dark:border-amber-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase">
                  {language === 'hi' ? 'कुल प्राप्त राशि' : 'Received Amount'}
                </span>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {formatCurrency(inspectedPayment.amount)}
                </div>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase ${
                  inspectedPayment.status === 'paid'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {inspectedPayment.status === 'paid' ? '✓ Paid & Settled' : inspectedPayment.status}
              </span>
            </div>

            {/* Details Grid */}
            <div className="space-y-3 text-xs">
              {/* Customer Box */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  {language === 'hi' ? 'किसने किया (Paid By / Customer)' : 'Customer Details'}
                </span>
                <div className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {inspectedPayment.customerName}
                </div>
                <div className="text-slate-500 font-mono">
                  {inspectedPayment.customerPhone || 'Phone Not Available'}
                </div>
              </div>

              {/* Receiving Account Box */}
              <div className="p-3 bg-amber-50/60 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-900/40 space-y-1">
                <span className="text-[10px] font-bold text-amber-800 dark:text-amber-400 uppercase">
                  {language === 'hi' ? 'किस खाते में आया (Received In Account)' : 'Credited Into Account'}
                </span>
                <div className="font-extrabold text-xs text-amber-950 dark:text-amber-200">
                  {inspectedPayment.accountTitle || (inspectedPayment.relatedEntity === 'property' ? 'Ashish - Property (ICICI Escrow)' : 'Sheetal - Insurance (ICICI Health/Motor)')}
                </div>
                <div className="text-[11px] text-amber-700 dark:text-amber-300">
                  खाताधारक: <strong>{inspectedPayment.accountOwner || 'Ashish / Sheetal Panwar'}</strong>
                </div>
              </div>

              {/* Deal / Purpose Details */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  {language === 'hi' ? 'सेवा / सौदे का उद्देश्य (Service / Deal Description)' : 'Purpose / Deal'}
                </span>
                <div className="font-bold text-slate-800 dark:text-slate-200">
                  {inspectedPayment.entityTitle}
                </div>
                <div className="text-[11px] text-slate-500 uppercase">
                  श्रेणी: <strong>{inspectedPayment.relatedEntity}</strong>
                </div>
              </div>

              {/* Transaction & Reference Numbers */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                  <span className="text-[10px] text-slate-400 block">भुगतान माध्यम (Mode)</span>
                  <span className="font-bold uppercase">{inspectedPayment.paymentMode || 'UPI'}</span>
                </div>

                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                  <span className="text-[10px] text-slate-400 block">UTR / Ref Number</span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300 truncate block">
                    {inspectedPayment.referenceNumber || 'N/A'}
                  </span>
                </div>
              </div>

              {inspectedPayment.notes && (
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-slate-600 dark:text-slate-300">
                  <span className="text-[10px] text-slate-400 block">नोट्स (Notes):</span>
                  {inspectedPayment.notes}
                </div>
              )}
            </div>

            {/* Action Buttons in Inspection Modal */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 flex-wrap gap-2">
              <div className="flex gap-2">
                {canDelete && (
                  <button
                    onClick={() => setDeleteConfirmPayment(inspectedPayment)}
                    className="p-2 text-xs font-bold rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                    title={language === 'hi' ? 'पेमेंट हटाएं' : 'Delete'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={() => {
                    const pay = inspectedPayment;
                    setInspectedPayment(null);
                    setActiveQRModalPayment(pay);
                  }}
                  className="px-3 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>{language === 'hi' ? 'पेमेंट QR' : 'Payment QR'}</span>
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const pay = inspectedPayment;
                    setInspectedPayment(null);
                    handlePrintReceipt(pay);
                  }}
                  className="px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{language === 'hi' ? 'रसीद प्रिंट' : 'Print Receipt'}</span>
                </button>

                <button
                  onClick={() => setInspectedPayment(null)}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. Printable Receipt Modal */}
      {printingPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white text-slate-900 border border-slate-300 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-black text-lg tracking-tight uppercase">{t.appName}</h3>
                <p className="text-[11px] text-slate-500">Official Payment Receipt & Confirmation Voucher</p>
              </div>
              <button onClick={() => setPrintingPayment(null)} className="text-slate-400 no-print">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span>Receipt Number: <strong>{printingPayment.receiptNumber || 'RCPT-N/A'}</strong></span>
                <span>Date: <strong>{formatDate(printingPayment.paymentDate || printingPayment.dueDate)}</strong></span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <p>Received From: <strong>{printingPayment.customerName}</strong></p>
                <p>Phone: <strong>{printingPayment.customerPhone || 'N/A'}</strong></p>
                <p>Receiving Account: <strong>{printingPayment.accountTitle || 'Ashish & Sheetal Enterprise'}</strong></p>
                <p>Description: <strong>{printingPayment.entityTitle}</strong></p>
                <p>Payment Mode: <strong className="uppercase">{printingPayment.paymentMode || 'UPI / Bank'}</strong></p>
                {printingPayment.referenceNumber && (
                  <p>Transaction Ref / UTR: <strong>{printingPayment.referenceNumber}</strong></p>
                )}
              </div>

              <div className="flex items-center justify-between p-3 border-t text-sm font-bold">
                <span>Total Amount Received:</span>
                <span className="text-emerald-700 text-base">{formatCurrency(printingPayment.amount)}</span>
              </div>

              <div className="pt-4 border-t text-[10px] text-slate-500 text-center">
                This is an official computer-generated receipt from the {t.appName} Platform.
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 no-print">
              {canDelete ? (
                <button
                  onClick={() => setDeleteConfirmPayment(printingPayment)}
                  className="px-3 py-1.5 text-xs font-bold rounded-xl bg-red-50 hover:bg-red-100 text-red-600 flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {language === 'hi' ? 'पेमेंट हटाएं' : 'Delete'}
                </button>
              ) : <div />}

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const p = printingPayment;
                    setPrintingPayment(null);
                    setActiveQRModalPayment(p);
                  }}
                  className="px-3 py-1.5 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>{language === 'hi' ? 'पेमेंट QR कोड' : 'Payment QR'}</span>
                </button>
                <button
                  onClick={() => setPrintingPayment(null)}
                  className="px-4 py-1.5 text-xs font-bold rounded-xl border border-slate-300 text-slate-700"
                >
                  Close
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-1.5 text-xs font-bold rounded-xl bg-slate-900 text-white"
                >
                  Print / Save PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 9. Record Payment Modal (Includes 6 Accounts Selection) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 my-auto max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-500" />
                <span>{language === 'hi' ? 'नया भुगतान प्रविष्टि करें' : 'Record New Payment Entry'}</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePayment} className="space-y-3">
              {/* Select Customer */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {language === 'hi' ? 'ग्राहक चुनें *' : 'Select Customer *'}
                </label>
                <select
                  value={formData.customerId || ''}
                  onChange={(e) => handleCustomerChange(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.mobile})
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Receiving Account (6 Accounts) */}
              <div>
                <label className="text-xs font-bold text-amber-900 dark:text-amber-300 block mb-1">
                  {language === 'hi' ? 'किस खाते में प्राप्त हुआ (Receiving Account) *' : 'Receiving Account *'}
                </label>
                <select
                  value={formData.accountId || ''}
                  onChange={(e) => handleAccountChange(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/30 text-slate-900 dark:text-white"
                >
                  <optgroup label="🏢 Property Accounts (Property Escrow)">
                    {qrConfigs.filter((q) => q.category === 'property').map((q) => (
                      <option key={q.id} value={q.id}>
                        {q.ownerName} • {q.shortLabel} ({q.bankName})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="🛡️ Insurance Accounts (Insurance Premium)">
                    {qrConfigs.filter((q) => q.category === 'insurance').map((q) => (
                      <option key={q.id} value={q.id}>
                        {q.ownerName} • {q.shortLabel} ({q.bankName})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="💼 General Accounts (Commercial & Agency)">
                    {qrConfigs.filter((q) => q.category === 'general').map((q) => (
                      <option key={q.id} value={q.id}>
                        {q.ownerName} • {q.shortLabel} ({q.bankName})
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* Entity Title / Description */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {language === 'hi' ? 'भुगतान विवरण / सौदा *' : 'Payment Purpose / Deal Title *'}
                </label>
                <input
                  type="text"
                  required
                  value={formData.entityTitle || ''}
                  onChange={(e) => setFormData({ ...formData, entityTitle: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  placeholder="e.g. Sector 32 Plot Token / LIC Annual Premium"
                />
              </div>

              {/* Amount & Mode */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {language === 'hi' ? 'राशि (Amount ₹) *' : 'Amount (INR) *'}
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.amount || ''}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs font-black rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {language === 'hi' ? 'माध्यम (Payment Mode)' : 'Mode'}
                  </label>
                  <select
                    value={formData.paymentMode || 'upi'}
                    onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="upi">UPI (GPay / PhonePe / QR)</option>
                    <option value="bank_transfer">Bank Transfer (NEFT / IMPS / RTGS)</option>
                    <option value="cheque">Cheque</option>
                    <option value="cash">Cash</option>
                  </select>
                </div>
              </div>

              {/* Payment Date & Reference */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {language === 'hi' ? 'भुगतान तारीख' : 'Payment Date'}
                  </label>
                  <input
                    type="date"
                    value={formData.paymentDate || todayStr}
                    onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {language === 'hi' ? 'UTR / Ref No' : 'Ref / UTR No'}
                  </label>
                  <input
                    type="text"
                    value={formData.referenceNumber || ''}
                    onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    placeholder="e.g. UPI-9928172"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {language === 'hi' ? 'टिप्पणी / नोट्स (Notes)' : 'Notes'}
                </label>
                <input
                  type="text"
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  placeholder="Optional notes or staff remarks"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 cursor-pointer"
                >
                  {language === 'hi' ? 'प्रविष्टि सुरक्षित करें' : 'Save Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 10. Delete Confirmation Modal */}
      {deleteConfirmPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {language === 'hi' ? 'पेमेंट रिकॉर्ड हटाएं?' : 'Delete Payment Record?'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'hi'
                  ? `क्या आप वाकई ग्राहक "${deleteConfirmPayment.customerName}" (₹${deleteConfirmPayment.amount}) की यह पेमेंट एंट्री हटाना चाहते हैं?`
                  : `Are you sure you want to permanently delete payment record for ${deleteConfirmPayment.customerName}?`}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmPayment(null)}
                className="py-2.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {language === 'hi' ? 'रद्द करें (Cancel)' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleConfirmDeletePayment}
                className="py-2.5 text-xs font-bold rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/20 transition-all cursor-pointer"
              >
                {language === 'hi' ? 'हाँ, हटाएं (Delete)' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 11. Payment QR Modal with Smart Dropdown Override & 1-Click WhatsApp */}
      {activeQRModalPayment && (
        <PaymentQRModal
          payment={activeQRModalPayment}
          onClose={() => setActiveQRModalPayment(null)}
          onMarkPaid={(pay, ref, selectedAccount) => {
            const acc = selectedAccount || qrConfigs.find((q) => q.id === pay.accountId) || qrConfigs[0];
            const updated: PaymentRecord = {
              ...pay,
              status: 'paid',
              paymentDate: todayStr,
              referenceNumber: ref || `UPI-${Date.now().toString().slice(-6)}`,
              isVerified: true,
              accountId: acc.id,
              accountTitle: `${acc.ownerName} - ${acc.shortLabel} (${acc.bankName})`,
              accountOwner: acc.ownerName,
            };
            storage.savePayment(updated, currentUser, false);
            showToast(
              language === 'hi'
                ? `पेमेंट ₹${pay.amount} मार्क पेड एवं सत्यापित हुआ (${acc.shortLabel})`
                : `Payment ₹${pay.amount} marked as Paid & Verified (${acc.shortLabel})`,
              'success'
            );
            triggerRefresh();
            setActiveQRModalPayment(null);
          }}
        />
      )}

      {/* 12. Modal: Edit Account Names & Settings */}
      {editingAccountConfig && (
        <EditAccountModal
          config={editingAccountConfig}
          allConfigs={qrConfigs}
          language={language}
          onSelectAccount={(acc) => setEditingAccountConfig(acc)}
          onClose={() => setEditingAccountConfig(null)}
          onSave={handleSaveAccountConfig}
          onReset={handleResetSingleAccount}
        />
      )}
    </div>
  );
};
