/**
 * Lead Management Module
 * Stages: New, Contact Pending, Contacted, Interested, Follow-up, Converted, Not Interested, Later, Archived
 * Supports conversion to Customer preserving all notes and call history
 */

import React, { useState } from 'react';
import { Lead, LeadStatus } from '../../types';
import { useApp } from '../../context/AppContext';
import { storage } from '../../services/storage';
import {
  Target,
  Plus,
  Search,
  Filter,
  Download,
  Phone,
  MessageSquare,
  UserCheck,
  Calendar,
  Clock,
  ArrowRight,
  Edit,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import { formatDate, formatCurrency } from '../../utils/date';
import { generateWhatsAppUrl, getLeadFollowUpMessage } from '../../utils/whatsapp';

const LEAD_STATUSES: { id: LeadStatus; label: string; color: string }[] = [
  { id: 'new', label: 'New Lead', color: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' },
  { id: 'contact_pending', label: 'Contact Pending', color: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' },
  { id: 'contacted', label: 'Contacted', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300' },
  { id: 'interested', label: 'Interested', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' },
  { id: 'follow_up', label: 'Follow-up Scheduled', color: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' },
  { id: 'converted', label: 'Converted to Client', color: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300' },
  { id: 'later', label: 'Decide Later', color: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300' },
  { id: 'not_interested', label: 'Not Interested', color: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' },
];

export const LeadModule: React.FC = () => {
  const { currentUser, language, t, showToast, triggerRefresh, setSelectedCustomerId, setActiveTab } = useApp();

  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Lead>>({
    name: '',
    phone: '',
    alternatePhone: '',
    email: '',
    category: 'insurance',
    source: 'referral',
    status: 'new',
    estimatedValue: 50000,
    followUpDate: new Date().toISOString().split('T')[0],
    followUpNote: '',
    assignedTo: currentUser.id,
  });

  const leads = storage.getLeads(currentUser);
  const allUsers = storage.getUsers();

  const filteredLeads = leads.filter((l) => {
    const matchStatus = selectedStatus === 'all' || l.status === selectedStatus;
    const matchCat = categoryFilter === 'all' || l.category === categoryFilter;
    const q = searchQuery.toLowerCase();
    const matchSearch =
      l.name.toLowerCase().includes(q) ||
      l.phone.includes(q) ||
      (l.email && l.email.toLowerCase().includes(q)) ||
      (l.followUpNote && l.followUpNote.toLowerCase().includes(q));

    return matchStatus && matchCat && matchSearch;
  });

  const handleOpenAdd = () => {
    setEditingLead(null);
    setFormData({
      name: '',
      phone: '',
      alternatePhone: '',
      email: '',
      category: 'insurance',
      source: 'referral',
      status: 'new',
      estimatedValue: 50000,
      followUpDate: new Date().toISOString().split('T')[0],
      followUpNote: '',
      assignedTo: currentUser.id,
    });
    setShowAddModal(true);
  };

  const handleSaveLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim() || !formData.phone?.trim()) {
      showToast('Name and Phone are required', 'warning');
      return;
    }

    if (editingLead) {
      const updated: Lead = {
        ...editingLead,
        ...formData,
        updatedAt: new Date().toISOString(),
      } as Lead;
      storage.saveLead(updated, currentUser, false);
      showToast(`Lead "${updated.name}" updated`, 'success');
    } else {
      const newLead: Lead = {
        id: `led_${Date.now()}`,
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        alternatePhone: formData.alternatePhone || '',
        email: formData.email || '',
        category: formData.category || 'insurance',
        source: formData.source || 'referral',
        status: (formData.status as LeadStatus) || 'new',
        estimatedValue: Number(formData.estimatedValue) || 0,
        assignedTo: formData.assignedTo || currentUser.id,
        followUpDate: formData.followUpDate,
        followUpNote: formData.followUpNote,
        notes: [],
        archived: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      storage.saveLead(newLead, currentUser, true);
      showToast(`New lead for ${newLead.name} registered`, 'success');
    }

    setShowAddModal(false);
    triggerRefresh();
  };

  const handleConvertToCustomer = (leadId: string, leadName: string) => {
    if (confirm(`Convert lead "${leadName}" into an official Customer profile? All notes and contact history will be transferred.`)) {
      const newCustomer = storage.convertLeadToCustomer(leadId, currentUser);
      if (newCustomer) {
        showToast(`Successfully converted "${leadName}" to Customer Profile!`, 'success');
        triggerRefresh();
        setSelectedCustomerId(newCustomer.id);
        setActiveTab('customers');
      }
    }
  };

  const handleDeleteLead = (leadId: string, leadName: string) => {
    if (confirm(`Permanently delete lead "${leadName}"?`)) {
      storage.deleteLead(leadId, currentUser);
      showToast(`Lead "${leadName}" deleted`, 'info');
      triggerRefresh();
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-amber-500" />
            {t.leads}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {language === 'hi'
              ? 'व्यापार लीड्स, स्थिति ट्रैकिंग, फॉलो-अप एवं ग्राहक में रूपांतरण'
              : 'Pipeline Tracking, Multi-Stage Follow-ups & One-Click Customer Conversion'}
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          {language === 'hi' ? 'नई लीड जोड़ें' : 'Capture New Lead'}
        </button>
      </div>

      {/* Stage Status Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedStatus('all')}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
            selectedStatus === 'all'
              ? 'bg-slate-900 text-amber-400 dark:bg-amber-500 dark:text-slate-950'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
          }`}
        >
          All Stages ({leads.length})
        </button>

        {LEAD_STATUSES.map((st) => {
          const count = leads.filter((l) => l.status === st.id).length;
          const isSelected = selectedStatus === st.id;
          return (
            <button
              key={st.id}
              onClick={() => setSelectedStatus(st.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-slate-900 text-amber-400 dark:bg-amber-500 dark:text-slate-950'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <span>{st.label}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 font-mono">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search leads by name, phone, notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="insurance">Insurance</option>
            <option value="property">Property</option>
            <option value="both">Both (Cross-Sell)</option>
            <option value="general">General / Other</option>
          </select>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">Lead Contact</th>
                <th className="px-4 py-3">Category & Source</th>
                <th className="px-4 py-3">Stage / Status</th>
                <th className="px-4 py-3">Next Follow-Up & Notes</th>
                <th className="px-4 py-3">Assigned Rep</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    No leads matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => {
                  const statusObj = LEAD_STATUSES.find((s) => s.id === lead.status) || LEAD_STATUSES[0];
                  const assigned = allUsers.find((u) => u.id === lead.assignedTo);

                  const waUrl = generateWhatsAppUrl(
                    lead.phone,
                    getLeadFollowUpMessage(lead.name, `${lead.category} requirement`, language)
                  );

                  return (
                    <tr key={lead.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      {/* Name & Phone */}
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                        <span className="block">{lead.name}</span>
                        <span className="font-mono text-[11px] text-slate-500">{lead.phone}</span>
                        {lead.estimatedValue && (
                          <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">
                            Est. {formatCurrency(lead.estimatedValue)}
                          </span>
                        )}
                      </td>

                      {/* Category & Source */}
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                          {lead.category}
                        </span>
                        <span className="block text-[10px] text-slate-400 capitalize mt-1">
                          Source: {lead.source.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${statusObj.color}`}>
                          {statusObj.label}
                        </span>
                      </td>

                      {/* Follow-up */}
                      <td className="px-4 py-3">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                          {formatDate(lead.followUpDate)}
                        </span>
                        {lead.followUpNote && (
                          <p className="text-[11px] text-slate-500 line-clamp-1 italic mt-0.5">
                            "{lead.followUpNote}"
                          </p>
                        )}
                      </td>

                      {/* Rep */}
                      <td className="px-4 py-3">
                        <span className="text-slate-700 dark:text-slate-300 font-medium">
                          {assigned?.name || 'Unassigned'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={`tel:${lead.phone}`}
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
                            title="WhatsApp Follow-up"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </a>

                          {lead.status !== 'converted' && (
                            <button
                              onClick={() => handleConvertToCustomer(lead.id, lead.name)}
                              className="px-2 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 text-teal-700 dark:text-teal-300 text-[10px] font-bold flex items-center gap-1 transition-colors"
                              title="Convert to Customer"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              Convert
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setEditingLead(lead);
                              setFormData(lead);
                              setShowAddModal(true);
                            }}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteLead(lead.id, lead.name)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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

      {/* Add / Edit Lead Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              {editingLead ? `Edit Lead: ${editingLead.name}` : 'Record New Business Lead'}
            </h3>

            <form onSubmit={handleSaveLead} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Lead / Client Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  placeholder="e.g. Naveen Singla"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Mobile Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    placeholder="e.g. 9812045678"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Category
                  </label>
                  <select
                    value={formData.category || 'insurance'}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="insurance">Insurance</option>
                    <option value="property">Property</option>
                    <option value="both">Both</option>
                    <option value="general">General</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Lead Stage Status
                  </label>
                  <select
                    value={formData.status || 'new'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {LEAD_STATUSES.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Lead Source
                  </label>
                  <select
                    value={formData.source || 'referral'}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value as any })}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="referral">Referral / Word of Mouth</option>
                    <option value="walk_in">Office Walk-in</option>
                    <option value="whatsapp">WhatsApp / Social Media</option>
                    <option value="phone_call">Cold Call / Database</option>
                    <option value="advertisement">Signboard / Ad</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Next Follow-Up Date
                </label>
                <input
                  type="date"
                  value={formData.followUpDate || ''}
                  onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                  className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Follow-up Notes / Discussion Summary
                </label>
                <textarea
                  rows={2}
                  value={formData.followUpNote || ''}
                  onChange={(e) => setFormData({ ...formData, followUpNote: e.target.value })}
                  className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  placeholder="Record requirement details..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950"
                >
                  Save Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
