/**
 * Customer Management / CRM List
 * Search, Filter, Add/Edit Customer, CSV Export, and 360-View Launcher
 */

import React, { useState } from 'react';
import { Customer } from '../../types';
import { useApp } from '../../context/AppContext';
import { storage } from '../../services/storage';
import { CustomerDetail } from './CustomerDetail';
import {
  Users,
  Plus,
  Search,
  Filter,
  Download,
  Trash2,
  Edit,
  Phone,
  MessageSquare,
  Cake,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { formatDate } from '../../utils/date';
import { generateWhatsAppUrl } from '../../utils/whatsapp';

export const CustomerList: React.FC = () => {
  const {
    currentUser,
    language,
    t,
    selectedCustomerId,
    setSelectedCustomerId,
    showToast,
    triggerRefresh,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('all');
  const [agentFilter, setAgentFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deleteConfirmCust, setDeleteConfirmCust] = useState<Customer | null>(null);
  const [confirmDeleteInput, setConfirmDeleteInput] = useState('');

  // Form State
  const [formData, setFormData] = useState<Partial<Customer>>({
    name: '',
    mobile: '',
    alternatePhone: '',
    whatsapp: '',
    email: '',
    address: '',
    city: 'Karnal',
    dob: '',
    anniversary: '',
    occupation: '',
    panNumber: '',
    aadhaarNumber: '',
    tags: [],
    assignedTo: currentUser.id,
  });

  const allCustomers = storage.getCustomers(currentUser);
  const allUsers = storage.getUsers();

  // Distinct cities for filter
  const cities = Array.from(new Set(allCustomers.map((c) => c.city).filter(Boolean)));

  const filteredCustomers = allCustomers.filter((c) => {
    const q = searchQuery.toLowerCase();
    const matchQuery =
      c.name.toLowerCase().includes(q) ||
      c.mobile.includes(q) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.occupation && c.occupation.toLowerCase().includes(q)) ||
      (c.tags && c.tags.some((t) => t.toLowerCase().includes(q)));

    const matchCity = cityFilter === 'all' || c.city === cityFilter;
    const matchAgent = agentFilter === 'all' || c.assignedTo === agentFilter;
    return matchQuery && matchCity && matchAgent;
  });

  // If a customer is currently selected, render CustomerDetail
  const activeDetailCustomer = allCustomers.find((c) => c.id === selectedCustomerId);
  if (activeDetailCustomer) {
    return (
      <CustomerDetail
        customer={activeDetailCustomer}
        onBack={() => setSelectedCustomerId(null)}
        onEdit={() => {
          setEditingCustomer(activeDetailCustomer);
          setFormData(activeDetailCustomer);
          setShowAddModal(true);
        }}
      />
    );
  }

  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setFormData({
      name: '',
      mobile: '',
      alternatePhone: '',
      whatsapp: '',
      email: '',
      address: '',
      city: 'Karnal',
      dob: '',
      anniversary: '',
      occupation: '',
      panNumber: '',
      aadhaarNumber: '',
      tags: ['Client'],
      assignedTo: currentUser.id,
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (cust: Customer, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCustomer(cust);
    setFormData(cust);
    setShowAddModal(true);
  };

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim() || !formData.mobile?.trim()) {
      showToast('Name and Mobile number are required', 'warning');
      return;
    }

    if (editingCustomer) {
      const updated: Customer = {
        ...editingCustomer,
        ...formData,
        name: formData.name.trim(),
        mobile: formData.mobile.trim(),
        updatedAt: new Date().toISOString(),
      } as Customer;
      storage.saveCustomer(updated, currentUser, false);
      showToast(`Customer profile for ${updated.name} updated`, 'success');
    } else {
      const newCust: Customer = {
        id: `cust_${Date.now()}`,
        name: formData.name.trim(),
        mobile: formData.mobile.trim(),
        alternatePhone: formData.alternatePhone || '',
        whatsapp: formData.whatsapp || formData.mobile.trim(),
        email: formData.email || '',
        address: formData.address || '',
        city: formData.city || 'Karnal',
        dob: formData.dob || '',
        anniversary: formData.anniversary || '',
        occupation: formData.occupation || '',
        panNumber: formData.panNumber || '',
        aadhaarNumber: formData.aadhaarNumber || '',
        tags: formData.tags || ['Client'],
        assignedTo: formData.assignedTo || currentUser.id,
        notes: [],
        documents: [],
        archived: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      storage.saveCustomer(newCust, currentUser, true);
      showToast(`New customer ${newCust.name} successfully registered`, 'success');
    }

    setShowAddModal(false);
    triggerRefresh();
  };

  const handlePermanentDelete = () => {
    if (!deleteConfirmCust) return;
    storage.deleteCustomer(deleteConfirmCust.id, currentUser);
    showToast(language === 'hi' ? `कस्टमर "${deleteConfirmCust.name}" का रिकॉर्ड हटा दिया गया` : `Permanently deleted customer ${deleteConfirmCust.name}`, 'info');
    setDeleteConfirmCust(null);
    setConfirmDeleteInput('');
    triggerRefresh();
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'Mobile', 'Alt Phone', 'Email', 'City', 'Address', 'DOB', 'Occupation', 'PAN'];
    const rows = filteredCustomers.map((c) => [
      c.id,
      `"${c.name}"`,
      c.mobile,
      c.alternatePhone || '',
      c.email || '',
      `"${c.city}"`,
      `"${c.address.replace(/"/g, '""')}"`,
      c.dob || '',
      `"${c.occupation || ''}"`,
      c.panNumber || '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `customers_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Customer directory exported to CSV', 'success');
  };

  const canDelete = currentUser.role === 'main_super_admin' || currentUser.permissions?.canDeleteRecords;

  return (
    <div className="space-y-5">
      {/* Page Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-500" />
            {t.customers}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {language === 'hi'
              ? 'व्यापक 360° ग्राहक प्रोफ़ाइल, नीतियां, संपत्तियां एवं कॉल इतिहास'
              : 'Enterprise CRM: Client 360° Profiles, Linked Policies, Properties & Notes'}
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
            {language === 'hi' ? 'नया ग्राहक जोड़ें' : 'Add Customer'}
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={language === 'hi' ? 'नाम, मोबाइल, शहर या व्यवसाय से खोजें...' : 'Search by name, phone, city, or tags...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="text-xs bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none"
          >
            <option value="all">All Cities ({allCustomers.length})</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
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

      {/* Customer Table / List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">Customer Name</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Location & Occupation</th>
                <th className="px-4 py-3">DOB / Key Date</th>
                <th className="px-4 py-3">Assigned Rep</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    No customer profiles match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => {
                  const assignedUser = allUsers.find((u) => u.id === cust.assignedTo);
                  const isBdayToday =
                    cust.dob &&
                    new Date(cust.dob).getDate() === new Date().getDate() &&
                    new Date(cust.dob).getMonth() === new Date().getMonth();

                  return (
                    <tr
                      key={cust.id}
                      onClick={() => setSelectedCustomerId(cust.id)}
                      className="hover:bg-amber-50/40 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                    >
                      {/* Name & Tags */}
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold flex items-center justify-center shrink-0">
                            {cust.name.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span>{cust.name}</span>
                              {isBdayToday && (
                                <span title="Birthday Today!" className="text-pink-500">
                                  🎂
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 mt-0.5">
                              {cust.tags?.map((t) => (
                                <span
                                  key={t}
                                  className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500"
                                >
                                  {t}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-4 py-3">
                        <div className="space-y-0.5">
                          <span className="font-mono text-slate-800 dark:text-slate-200 block">
                            {cust.mobile}
                          </span>
                          {cust.email && <span className="text-[10px] text-slate-400 block">{cust.email}</span>}
                        </div>
                      </td>

                      {/* Location & Occupation */}
                      <td className="px-4 py-3">
                        <span className="font-medium text-slate-800 dark:text-slate-200 block">
                          {cust.city}
                        </span>
                        <span className="text-[10px] text-slate-400 block">{cust.occupation || '—'}</span>
                      </td>

                      {/* DOB */}
                      <td className="px-4 py-3">
                        <span className="text-slate-600 dark:text-slate-400 block">
                          {formatDate(cust.dob)}
                        </span>
                      </td>

                      {/* Assigned Rep */}
                      <td className="px-4 py-3">
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                          {assignedUser?.name || 'Unassigned'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={`tel:${cust.mobile}`}
                            className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                            title="Call Customer"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>

                          <a
                            href={generateWhatsAppUrl(cust.whatsapp || cust.mobile, `Hello ${cust.name}, greetings from Ashish Sheetal.`)}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-600 transition-colors"
                            title="WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </a>

                          <button
                            onClick={(e) => handleOpenEdit(cust, e)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 dark:text-slate-300 transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {canDelete && (
                            <button
                              onClick={() => {
                                setDeleteConfirmCust(cust);
                                setConfirmDeleteInput('');
                              }}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                              title="Permanent Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => setSelectedCustomerId(cust.id)}
                            className="p-1.5 rounded-lg hover:bg-amber-100 text-amber-600 transition-colors"
                            title="View 360 Profile"
                          >
                            <ChevronRight className="w-4 h-4" />
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

      {/* Add / Edit Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh] space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              {editingCustomer ? `Edit Customer: ${editingCustomer.name}` : 'Register New Customer Profile'}
            </h3>

            <form onSubmit={handleSaveCustomer} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="e.g. Ramesh Chandra Sharma"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Primary Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.mobile || ''}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="e.g. 9812045678"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    value={formData.whatsapp || ''}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Leave blank to use primary mobile"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Alternate Contact / Landline
                  </label>
                  <input
                    type="tel"
                    value={formData.alternatePhone || ''}
                    onChange={(e) => setFormData({ ...formData, alternatePhone: e.target.value })}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="e.g. 0184-225566"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {language === 'hi' ? 'ईमेल आईडी (Optional / ऐच्छिक)' : 'Email Address (Optional)'}
                  </label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="e.g. client@example.com (खाली छोड़ सकते हैं)"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    City / Town
                  </label>
                  <input
                    type="text"
                    value={formData.city || ''}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="e.g. Karnal, Panipat, Kurukshetra"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={formData.dob || ''}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {language === 'hi' ? 'शादी की सालगिरह (Anniversary - Optional / ऐच्छिक)' : 'Anniversary Date (Optional)'}
                  </label>
                  <input
                    type="date"
                    value={formData.anniversary || ''}
                    onChange={(e) => setFormData({ ...formData, anniversary: e.target.value })}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Occupation / Business Type
                  </label>
                  <input
                    type="text"
                    value={formData.occupation || ''}
                    onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="e.g. Doctor, Textile Business, Real Estate Investor"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Assigned Team Representative
                  </label>
                  <select
                    value={formData.assignedTo || currentUser.id}
                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {allUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.relationship || u.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    PAN Card Number
                  </label>
                  <input
                    type="text"
                    value={formData.panNumber || ''}
                    onChange={(e) => setFormData({ ...formData, panNumber: e.target.value.toUpperCase() })}
                    className="w-full mt-1 px-3 py-2 text-xs font-mono uppercase rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="e.g. ABCDE1234F"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Aadhaar Number
                  </label>
                  <input
                    type="text"
                    value={formData.aadhaarNumber || ''}
                    onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })}
                    className="w-full mt-1 px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="e.g. 1234-5678-9012"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Full Residential / Office Address
                </label>
                <textarea
                  rows={2}
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Plot/Flat number, Colony, Road, Landmark..."
                />
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
                  {editingCustomer ? 'Save Updates' : 'Create Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Two-Step Permanent Delete Confirmation Modal */}
      {deleteConfirmCust && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-slate-900 border border-red-300 dark:border-red-900/60 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-600">
              <ShieldAlert className="w-6 h-6 shrink-0" />
              <h4 className="text-base font-extrabold">Confirm Permanent Customer Deletion</h4>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              Are you sure you want to permanently delete{' '}
              <strong className="text-slate-900 dark:text-white">{deleteConfirmCust.name}</strong>? This action
              cannot be undone. All linked documents, notes, and activity history will be deleted.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmCust(null)}
                className="py-2.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
              >
                {language === 'hi' ? 'रद्द करें (Cancel)' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handlePermanentDelete}
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
