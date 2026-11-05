/**
 * Insurance Management Module
 * Comprehensive LIC Life, Term Insurance, Motor (Bike & Car), Health, and Travel Insurance
 */

import React, { useState } from 'react';
import { InsurancePolicy, InsuranceType, Customer } from '../../types';
import { useApp } from '../../context/AppContext';
import { storage } from '../../services/storage';
import {
  ShieldCheck,
  Plus,
  Search,
  Filter,
  Download,
  Trash2,
  Edit,
  Phone,
  MessageSquare,
  Clock,
  Car,
  HeartPulse,
  Plane,
  Shield,
  FileText,
  AlertTriangle,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { formatCurrency, formatDate, getDaysDifference } from '../../utils/date';
import { generateWhatsAppUrl, getPremiumReminderMessage, getRenewalReminderMessage } from '../../utils/whatsapp';

export const InsuranceModule: React.FC = () => {
  const { currentUser, language, t, showToast, triggerRefresh } = useApp();

  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [agentFilter, setAgentFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<InsurancePolicy | null>(null);
  const [viewingPolicy, setViewingPolicy] = useState<InsurancePolicy | null>(null);
  const [deleteConfirmPolicy, setDeleteConfirmPolicy] = useState<InsurancePolicy | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<InsurancePolicy>>({
    customerId: '',
    customerName: '',
    customerPhone: '',
    insuranceType: 'lic_traditional',
    insurerName: 'Life Insurance Corporation of India (LIC)',
    planName: '',
    policyNumber: '',
    sumAssured: 1000000,
    premiumAmount: 25000,
    paymentFrequency: 'yearly',
    startDate: new Date().toISOString().split('T')[0],
    renewalDate: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().split('T')[0],
    maturityDate: '',
    status: 'active',
    nomineeName: '',
    nomineeRelation: '',
    pptYears: 15,
    policyTermYears: 20,
    medicalExamDone: false,
    applicationNumber: '',
    issuanceStatus: 'issued',
    premiumPaymentEndDate: '',
    vehicleNumber: '',
    vehicleMake: '',
    vehicleModel: '',
    vehicleRegistrationYear: 2023,
    ncbPercentage: 20,
    idvValue: 500000,
    coveredMembers: [],
    travelDestination: '',
    travelStartDate: '',
    travelEndDate: '',
    assignedTo: currentUser.id,
  });

  const allPolicies = storage.getPolicies(currentUser);
  const allCustomers = storage.getCustomers(currentUser);
  const allUsers = storage.getUsers();

  const filteredPolicies = allPolicies.filter((p) => {
    const matchType = selectedType === 'all' || p.insuranceType === selectedType;
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchAgent = agentFilter === 'all' || p.assignedTo === agentFilter;
    const q = searchQuery.toLowerCase();
    const matchSearch =
      p.policyNumber.toLowerCase().includes(q) ||
      p.customerName.toLowerCase().includes(q) ||
      p.planName.toLowerCase().includes(q) ||
      p.insurerName.toLowerCase().includes(q) ||
      (p.vehicleNumber && p.vehicleNumber.toLowerCase().includes(q));

    return matchType && matchStatus && matchAgent && matchSearch;
  });

  const handleOpenAdd = () => {
    setEditingPolicy(null);
    setFormData({
      customerId: allCustomers[0]?.id || '',
      customerName: allCustomers[0]?.name || '',
      customerPhone: allCustomers[0]?.mobile || '',
      insuranceType: 'lic_traditional',
      insurerName: 'Life Insurance Corporation of India (LIC)',
      planName: 'LIC Jeevan Labh',
      policyNumber: `POL-${Math.floor(100000000 + Math.random() * 900000000)}`,
      sumAssured: 1000000,
      premiumAmount: 45000,
      paymentFrequency: 'yearly',
      startDate: new Date().toISOString().split('T')[0],
      renewalDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
      maturityDate: '2042-11-01',
      status: 'active',
      nomineeName: 'Spouse',
      nomineeRelation: 'Wife',
      pptYears: 16,
      policyTermYears: 21,
      medicalExamDone: true,
      applicationNumber: '',
      issuanceStatus: 'issued',
      assignedTo: currentUser.id,
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (p: InsurancePolicy, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingPolicy(p);
    setFormData(p);
    setShowAddModal(true);
  };

  const handleCustomerSelectChange = (custId: string) => {
    const cust = allCustomers.find((c) => c.id === custId);
    if (cust) {
      setFormData((prev) => ({
        ...prev,
        customerId: cust.id,
        customerName: cust.name,
        customerPhone: cust.mobile,
      }));
    }
  };

  const handleSavePolicy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.policyNumber?.trim() || !formData.customerName?.trim()) {
      showToast('Policy Number and Customer are required', 'warning');
      return;
    }

    if (editingPolicy) {
      const updated: InsurancePolicy = {
        ...editingPolicy,
        ...formData,
        updatedAt: new Date().toISOString(),
      } as InsurancePolicy;
      storage.savePolicy(updated, currentUser, false);
      showToast(`Policy #${updated.policyNumber} updated`, 'success');
    } else {
      const newPolicy: InsurancePolicy = {
        id: `pol_${Date.now()}`,
        policyNumber: formData.policyNumber.trim(),
        customerId: formData.customerId || '',
        customerName: formData.customerName.trim(),
        customerPhone: formData.customerPhone || '',
        insuranceType: formData.insuranceType as InsuranceType,
        insurerName: formData.insurerName || 'LIC',
        planName: formData.planName || '',
        sumAssured: Number(formData.sumAssured) || 0,
        premiumAmount: Number(formData.premiumAmount) || 0,
        paymentFrequency: formData.paymentFrequency || 'yearly',
        startDate: formData.startDate || new Date().toISOString().split('T')[0],
        renewalDate: formData.renewalDate || new Date().toISOString().split('T')[0],
        maturityDate: formData.maturityDate,
        status: formData.status || 'active',
        nomineeName: formData.nomineeName,
        nomineeRelation: formData.nomineeRelation,
        pptYears: Number(formData.pptYears),
        policyTermYears: Number(formData.policyTermYears),
        medicalExamDone: formData.medicalExamDone,
        applicationNumber: formData.applicationNumber,
        issuanceStatus: formData.issuanceStatus,
        premiumPaymentEndDate: formData.premiumPaymentEndDate,
        vehicleNumber: formData.vehicleNumber,
        vehicleMake: formData.vehicleMake,
        vehicleModel: formData.vehicleModel,
        vehicleRegistrationYear: Number(formData.vehicleRegistrationYear),
        ncbPercentage: Number(formData.ncbPercentage),
        idvValue: Number(formData.idvValue),
        coveredMembers: formData.coveredMembers,
        travelDestination: formData.travelDestination,
        travelStartDate: formData.travelStartDate,
        travelEndDate: formData.travelEndDate,
        assignedTo: formData.assignedTo || currentUser.id,
        notes: [],
        documents: [],
        archived: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      storage.savePolicy(newPolicy, currentUser, true);
      showToast(`Policy #${newPolicy.policyNumber} saved successfully`, 'success');
    }

    setShowAddModal(false);
    triggerRefresh();
  };

  const handleDeletePolicy = (policy: InsurancePolicy, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirmPolicy(policy);
  };

  const handleConfirmDeletePolicy = () => {
    if (!deleteConfirmPolicy) return;
    storage.deletePolicy(deleteConfirmPolicy.id, currentUser);
    showToast(language === 'hi' ? `पॉलिसी #${deleteConfirmPolicy.policyNumber} हटा दी गई` : `Policy #${deleteConfirmPolicy.policyNumber} deleted`, 'info');
    if (viewingPolicy?.id === deleteConfirmPolicy.id) {
      setViewingPolicy(null);
    }
    setDeleteConfirmPolicy(null);
    triggerRefresh();
  };

  const handleExportCSV = () => {
    const headers = [
      'Policy Number',
      'Customer',
      'Phone',
      'Type',
      'Insurer',
      'Plan',
      'Sum Assured',
      'Premium',
      'Frequency',
      'Renewal Date',
      'Status',
    ];
    const rows = filteredPolicies.map((p) => [
      p.policyNumber,
      `"${p.customerName}"`,
      p.customerPhone,
      p.insuranceType,
      `"${p.insurerName}"`,
      `"${p.planName}"`,
      p.sumAssured,
      p.premiumAmount,
      p.paymentFrequency,
      p.renewalDate,
      p.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `insurance_policies_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Policies exported to CSV', 'success');
  };

  const canDelete = currentUser.role === 'main_super_admin' || currentUser.permissions?.canDeleteRecords;

  return (
    <div className="space-y-5">
      {/* Page Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-500" />
            {t.insurance}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {language === 'hi'
              ? 'LIC/पारंपरिक, टर्म, बाइक, कार, स्वास्थ्य एवं यात्रा बीमा प्रबंधन'
              : 'Complete Portfolio: LIC Traditional, Term Life, Motor, Health & Travel'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            {t.export}
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            {language === 'hi' ? 'नई पॉलिसी जोड़ें' : 'Issue / Add Policy'}
          </button>
        </div>
      </div>

      {/* Category Tabs: LIC, Term, Bike, Car, Health, Travel, All */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all', label: 'All Policies', icon: Shield, count: allPolicies.length },
          {
            id: 'lic_traditional',
            label: 'LIC / Traditional Life',
            icon: ShieldCheck,
            count: allPolicies.filter((p) => p.insuranceType === 'lic_traditional').length,
          },
          {
            id: 'term',
            label: 'Term Insurance',
            icon: Sparkles,
            count: allPolicies.filter((p) => p.insuranceType === 'term').length,
          },
          {
            id: 'bike',
            label: 'Two-Wheeler / Bike',
            icon: Car,
            count: allPolicies.filter((p) => p.insuranceType === 'bike').length,
          },
          {
            id: 'car',
            label: 'Four-Wheeler / Car',
            icon: Car,
            count: allPolicies.filter((p) => p.insuranceType === 'car').length,
          },
          {
            id: 'health',
            label: 'Health / Mediclaim',
            icon: HeartPulse,
            count: allPolicies.filter((p) => p.insuranceType === 'health').length,
          },
          {
            id: 'travel',
            label: 'Travel Insurance',
            icon: Plane,
            count: allPolicies.filter((p) => p.insuranceType === 'travel').length,
          },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = selectedType === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedType(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-slate-900 text-amber-400 dark:bg-amber-500 dark:text-slate-950 shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
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

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by policy #, customer, plan, vehicle number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="grace_period">Grace Period</option>
            <option value="lapsed">Lapsed</option>
            <option value="matured">Matured</option>
            <option value="claim_settled">Claim Settled</option>
          </select>

          {currentUser.permissions?.canViewAllData && (
            <select
              value={agentFilter}
              onChange={(e) => setAgentFilter(e.target.value)}
              className="text-xs bg-amber-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-xl border border-amber-300 dark:border-slate-700 focus:outline-none font-semibold"
            >
              <option value="all">👥 {language === 'hi' ? 'सभी एजेंट (All Team)' : 'All Agents'}</option>
              {allUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.relationship || u.role})
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Policies Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">Plan & Policy #</th>
                <th className="px-4 py-3">Customer Contact</th>
                {currentUser.permissions?.canViewAllData && <th className="px-4 py-3">Agent</th>}
                <th className="px-4 py-3">Sum Assured / Coverage</th>
                <th className="px-4 py-3">Premium & Term</th>
                <th className="px-4 py-3">Next Due / Renewal</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filteredPolicies.length === 0 ? (
                <tr>
                  <td colSpan={currentUser.permissions?.canViewAllData ? 8 : 7} className="px-4 py-8 text-center text-slate-400">
                    No insurance policies found.
                  </td>
                </tr>
              ) : (
                filteredPolicies.map((pol) => {
                  const daysLeft = getDaysDifference(pol.renewalDate);
                  const isOverdue = daysLeft < 0;

                  const waUrl = generateWhatsAppUrl(
                    pol.customerPhone,
                    getPremiumReminderMessage(
                      pol.customerName,
                      pol.policyNumber,
                      pol.insurerName,
                      pol.premiumAmount,
                      pol.renewalDate,
                      language
                    )
                  );

                  return (
                    <tr
                      key={pol.id}
                      onClick={() => setViewingPolicy(pol)}
                      className="hover:bg-amber-50/40 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                    >
                      {/* Plan & Policy Number */}
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span>{pol.planName}</span>
                            <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold">
                              {pol.insuranceType.replace('_', ' ')}
                            </span>
                          </div>
                          <span className="font-mono text-[11px] text-slate-500 block">
                            #{pol.policyNumber} • {pol.insurerName}
                          </span>
                          {pol.vehicleNumber && (
                            <span className="text-[10px] font-mono bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-1.5 py-0.2 rounded">
                              {pol.vehicleNumber}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Customer Contact */}
                      <td className="px-4 py-3">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                          {pol.customerName}
                        </span>
                        <span className="font-mono text-[11px] text-slate-500">{pol.customerPhone}</span>
                      </td>

                      {/* Assigned Agent for Owner / Admin */}
                      {currentUser.permissions?.canViewAllData && (
                        <td className="px-4 py-3">
                          <span className="font-bold text-slate-800 dark:text-slate-200 block text-[11px]">
                            {allUsers.find((u) => u.id === pol.assignedTo)?.name || 'Office'}
                          </span>
                          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                            {allUsers.find((u) => u.id === pol.assignedTo)?.relationship || 'Agent'}
                          </span>
                        </td>
                      )}

                      {/* Sum Assured */}
                      <td className="px-4 py-3">
                        <span className="font-bold text-slate-900 dark:text-slate-100 block">
                          {formatCurrency(pol.sumAssured)}
                        </span>
                        {pol.nomineeName && (
                          <span className="text-[10px] text-slate-400 block">
                            Nominee: {pol.nomineeName} ({pol.nomineeRelation})
                          </span>
                        )}
                      </td>

                      {/* Premium & Frequency */}
                      <td className="px-4 py-3">
                        <span className="font-bold text-amber-600 dark:text-amber-400 block">
                          {formatCurrency(pol.premiumAmount)}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase block">
                          {pol.paymentFrequency}
                          {pol.pptYears ? ` • PPT: ${pol.pptYears}y` : ''}
                        </span>
                      </td>

                      {/* Next Due Date */}
                      <td className="px-4 py-3">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                          {formatDate(pol.renewalDate)}
                        </span>
                        <span
                          className={`text-[10px] font-bold ${
                            isOverdue
                              ? 'text-red-600 dark:text-red-400'
                              : daysLeft <= 5
                              ? 'text-amber-600'
                              : 'text-slate-400'
                          }`}
                        >
                          {isOverdue ? `Overdue by ${Math.abs(daysLeft)} days` : `${daysLeft} days remaining`}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            pol.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : pol.status === 'grace_period'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                          }`}
                        >
                          {pol.status.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={`tel:${pol.customerPhone}`}
                            className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                            title="Call"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>

                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-600 transition-colors"
                            title="WhatsApp Premium Alert"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </a>

                          <button
                            onClick={(e) => handleOpenEdit(pol, e)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 dark:text-slate-300 transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {canDelete && (
                            <button
                              onClick={(e) => handleDeletePolicy(pol, e)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                              title={language === 'hi' ? 'हटाएं' : 'Delete'}
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

      {/* Policy Details Drawer Modal */}
      {viewingPolicy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-amber-500" />
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {viewingPolicy.planName}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Policy #{viewingPolicy.policyNumber} • {viewingPolicy.insurerName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingPolicy(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-400 block">Customer</span>
                <span className="font-bold text-slate-900 dark:text-white mt-1 block">
                  {viewingPolicy.customerName}
                </span>
                <span className="text-[10px] text-slate-500">{viewingPolicy.customerPhone}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-400 block">Sum Assured</span>
                <span className="font-bold text-blue-600 dark:text-blue-400 mt-1 block text-sm">
                  {formatCurrency(viewingPolicy.sumAssured)}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-400 block">Premium Due</span>
                <span className="font-bold text-amber-600 dark:text-amber-400 mt-1 block text-sm">
                  {formatCurrency(viewingPolicy.premiumAmount)}
                </span>
                <span className="text-[10px] text-slate-400 uppercase">{viewingPolicy.paymentFrequency}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-400 block">Start Date</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 mt-1 block">
                  {formatDate(viewingPolicy.startDate)}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-400 block">Next Renewal / Due</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 mt-1 block">
                  {formatDate(viewingPolicy.renewalDate)}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-400 block">Maturity Date</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 mt-1 block">
                  {formatDate(viewingPolicy.maturityDate) || 'N/A'}
                </span>
              </div>

              {/* LIC Specific details */}
              {viewingPolicy.insuranceType === 'lic_traditional' && (
                <>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                    <span className="text-slate-400 block">Premium Paying Term (PPT)</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 mt-1 block">
                      {viewingPolicy.pptYears} Years
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                    <span className="text-slate-400 block">Policy Term</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 mt-1 block">
                      {viewingPolicy.policyTermYears} Years
                    </span>
                  </div>
                </>
              )}

              {/* Term specific */}
              {viewingPolicy.insuranceType === 'term' && (
                <>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                    <span className="text-slate-400 block">Medical Examination</span>
                    <span className="font-bold text-emerald-600 mt-1 block">
                      {viewingPolicy.medicalExamDone ? '✓ Completed' : 'Pending'}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                    <span className="text-slate-400 block">Application Status</span>
                    <span className="font-bold uppercase text-slate-800 dark:text-slate-200 mt-1 block">
                      {viewingPolicy.issuanceStatus || 'Issued'}
                    </span>
                  </div>
                </>
              )}

              {/* Motor specific */}
              {(viewingPolicy.insuranceType === 'bike' || viewingPolicy.insuranceType === 'car') && (
                <>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                    <span className="text-slate-400 block">Vehicle Number</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white mt-1 block">
                      {viewingPolicy.vehicleNumber}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                    <span className="text-slate-400 block">Make & Model</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 mt-1 block">
                      {viewingPolicy.vehicleMake} {viewingPolicy.vehicleModel}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                    <span className="text-slate-400 block">NCB Bonus</span>
                    <span className="font-bold text-emerald-600 mt-1 block">
                      {viewingPolicy.ncbPercentage}%
                    </span>
                  </div>
                </>
              )}

              {/* Health / Travel */}
              {viewingPolicy.insuranceType === 'travel' && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 col-span-2">
                  <span className="text-slate-400 block">Travel Destination & Dates</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 mt-1 block">
                    {viewingPolicy.travelDestination} ({formatDate(viewingPolicy.travelStartDate)} to{' '}
                    {formatDate(viewingPolicy.travelEndDate)})
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              {canDelete ? (
                <button
                  onClick={() => setDeleteConfirmPolicy(viewingPolicy)}
                  className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-red-50 dark:bg-red-950/50 hover:bg-red-100 text-red-600 dark:text-red-400 flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {language === 'hi' ? 'पॉलिसी हटाएं (Delete)' : 'Delete Policy'}
                </button>
              ) : <div />}
              <button
                onClick={() => setViewingPolicy(null)}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Policy Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh] space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              {editingPolicy ? `Edit Policy #${editingPolicy.policyNumber}` : 'Issue / Record Insurance Policy'}
            </h3>

            <form onSubmit={handleSavePolicy} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Select Customer */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Select Customer <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.customerId || ''}
                    onChange={(e) => handleCustomerSelectChange(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {allCustomers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.mobile})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Insurance Type */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Insurance Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.insuranceType || 'lic_traditional'}
                    onChange={(e) => setFormData({ ...formData, insuranceType: e.target.value as any })}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="lic_traditional">LIC / Traditional Life</option>
                    <option value="term">Term Insurance</option>
                    <option value="bike">Two-Wheeler / Bike</option>
                    <option value="car">Four-Wheeler / Car</option>
                    <option value="health">Health & Mediclaim</option>
                    <option value="travel">Travel Insurance</option>
                    <option value="other">General / Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Insurer / Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.insurerName || ''}
                    onChange={(e) => setFormData({ ...formData, insurerName: e.target.value })}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    placeholder="e.g. LIC of India, HDFC Life, Tata AIG, Star Health"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Plan / Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.planName || ''}
                    onChange={(e) => setFormData({ ...formData, planName: e.target.value })}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    placeholder="e.g. Jeevan Labh, Click 2 Protect, AutoSecure"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Policy Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.policyNumber || ''}
                    onChange={(e) => setFormData({ ...formData, policyNumber: e.target.value })}
                    className="w-full mt-1 px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    placeholder="e.g. 178940291"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Sum Assured / IDV (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.sumAssured || ''}
                    onChange={(e) => setFormData({ ...formData, sumAssured: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    placeholder="e.g. 2500000"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Premium Amount (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.premiumAmount || ''}
                    onChange={(e) => setFormData({ ...formData, premiumAmount: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    placeholder="e.g. 45000"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Payment Frequency
                  </label>
                  <select
                    value={formData.paymentFrequency || 'yearly'}
                    onChange={(e) => setFormData({ ...formData, paymentFrequency: e.target.value as any })}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="yearly">Yearly</option>
                    <option value="half_yearly">Half-Yearly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="monthly">Monthly</option>
                    <option value="single">Single Premium</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.startDate || ''}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Next Due / Renewal Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.renewalDate || ''}
                    onChange={(e) => setFormData({ ...formData, renewalDate: e.target.value })}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                {/* Conditional Fields: LIC */}
                {formData.insuranceType === 'lic_traditional' && (
                  <>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Premium Paying Term (PPT Years)
                      </label>
                      <input
                        type="number"
                        value={formData.pptYears || 15}
                        onChange={(e) => setFormData({ ...formData, pptYears: Number(e.target.value) })}
                        className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Policy Term (Years)
                      </label>
                      <input
                        type="number"
                        value={formData.policyTermYears || 21}
                        onChange={(e) => setFormData({ ...formData, policyTermYears: Number(e.target.value) })}
                        className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Maturity Date
                      </label>
                      <input
                        type="date"
                        value={formData.maturityDate || ''}
                        onChange={(e) => setFormData({ ...formData, maturityDate: e.target.value })}
                        className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>
                  </>
                )}

                {/* Motor Fields */}
                {(formData.insuranceType === 'bike' || formData.insuranceType === 'car') && (
                  <>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Vehicle Registration Number
                      </label>
                      <input
                        type="text"
                        value={formData.vehicleNumber || ''}
                        onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value.toUpperCase() })}
                        className="w-full mt-1 px-3 py-2 text-xs font-mono uppercase rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                        placeholder="e.g. HR-05-AW-1234"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Vehicle Make & Model
                      </label>
                      <input
                        type="text"
                        value={formData.vehicleModel || ''}
                        onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
                        className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                        placeholder="e.g. Hyundai Creta SX (O) / RE Classic 350"
                      />
                    </div>
                  </>
                )}

                {/* Nominee */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Nominee Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.nomineeName || ''}
                    onChange={(e) => setFormData({ ...formData, nomineeName: e.target.value })}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    placeholder="e.g. Spouse / Son / Daughter name"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Nominee Relationship
                  </label>
                  <input
                    type="text"
                    value={formData.nomineeRelation || ''}
                    onChange={(e) => setFormData({ ...formData, nomineeRelation: e.target.value })}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    placeholder="e.g. Spouse, Father, Mother, Son"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md shadow-amber-500/20"
                >
                  {editingPolicy ? 'Update Policy' : 'Save Policy'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {deleteConfirmPolicy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {language === 'hi' ? 'पॉलिसी स्थायी रूप से हटाएं?' : 'Delete Policy Record?'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'hi'
                  ? `क्या आप वाकई पॉलिसी #${deleteConfirmPolicy.policyNumber} (${deleteConfirmPolicy.customerName}) को हटाना चाहते हैं?`
                  : `Are you sure you want to permanently delete policy #${deleteConfirmPolicy.policyNumber}?`}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmPolicy(null)}
                className="py-2.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {language === 'hi' ? 'रद्द करें (Cancel)' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleConfirmDeletePolicy}
                className="py-2.5 text-xs font-bold rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/20 transition-all"
              >
                {language === 'hi' ? 'हाँ, हटाएं (Delete)' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

