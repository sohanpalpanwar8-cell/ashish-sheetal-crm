/**
 * Comprehensive 360-Degree Customer Detail View
 * Shows Personal Details, Policies, Properties, Payments, Documents, Notes, Calls, Tasks, and History
 */

import React, { useState } from 'react';
import { Customer, InsurancePolicy, PropertyListing, PaymentRecord, NoteItem, DocumentAttachment } from '../../types';
import { useApp } from '../../context/AppContext';
import { storage } from '../../services/storage';
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Briefcase,
  Shield,
  Home,
  CreditCard,
  FileText,
  MessageSquare,
  Clock,
  Plus,
  Trash2,
  Edit,
  ExternalLink,
  Cake,
  Heart,
  Upload,
  CheckCircle,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/date';
import { generateWhatsAppUrl } from '../../utils/whatsapp';

interface CustomerDetailProps {
  customer: Customer;
  onBack: () => void;
  onEdit: () => void;
}

export const CustomerDetail: React.FC<CustomerDetailProps> = ({ customer, onBack, onEdit }) => {
  const { currentUser, language, showToast, triggerRefresh } = useApp();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'policies' | 'properties' | 'payments' | 'documents' | 'notes' | 'history'
  >('overview');

  const [newNoteText, setNewNoteText] = useState('');
  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState<DocumentAttachment['tag']>('policy');
  const [showAddDocModal, setShowAddDocModal] = useState(false);

  // Fetch linked entities
  const policies = storage.getPolicies().filter((p) => p.customerId === customer.id);
  const payments = storage.getPayments().filter((p) => p.customerId === customer.id);
  // Properties where customer is owner or linked in notes
  const properties = storage.getProperties().filter((p) => p.ownerName === customer.name || p.ownerPhone === customer.mobile);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    const newNote: NoteItem = {
      id: `note_${Date.now()}`,
      text: newNoteText.trim(),
      authorId: currentUser.id,
      authorName: currentUser.name,
      createdAt: new Date().toISOString(),
    };

    const updatedNotes = [newNote, ...(customer.notes || [])];
    const updatedCustomer: Customer = {
      ...customer,
      notes: updatedNotes,
      updatedAt: new Date().toISOString(),
    };

    storage.saveCustomer(updatedCustomer, currentUser, false);
    setNewNoteText('');
    showToast('Note added to client timeline', 'success');
    triggerRefresh();
  };

  const handleAddDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName.trim()) return;

    const newDoc: DocumentAttachment = {
      id: `doc_${Date.now()}`,
      name: docName.trim(),
      fileType: 'application/pdf',
      fileSize: Math.floor(Math.random() * 800000) + 120000,
      uploadedAt: new Date().toISOString(),
      uploadedBy: currentUser.name,
      tag: docType,
      dataUrl: '#', // Secure simulated storage link
    };

    const updatedDocs = [newDoc, ...(customer.documents || [])];
    const updatedCustomer: Customer = {
      ...customer,
      documents: updatedDocs,
      updatedAt: new Date().toISOString(),
    };

    storage.saveCustomer(updatedCustomer, currentUser, false);
    setDocName('');
    setShowAddDocModal(false);
    showToast('Document securely uploaded and linked to client profile', 'success');
    triggerRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
              {customer.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {customer.name}
                </h2>
                {customer.tags &&
                  customer.tags.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300"
                    >
                      {t}
                    </span>
                  ))}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {customer.mobile}
                </span>
                {customer.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {customer.email}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {customer.city}
                </span>
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <a
              href={`tel:${customer.mobile}`}
              className="px-3.5 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 hover:bg-blue-100 font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              Call
            </a>
            <a
              href={generateWhatsAppUrl(customer.whatsapp || customer.mobile, `Hello ${customer.name}, greeting from Ashish Sheetal Office.`)}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              WhatsApp
            </a>
            <button
              onClick={onEdit}
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <Edit className="w-3.5 h-3.5" />
              Edit Profile
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 mt-6 pt-2 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview & Personal', icon: FileText, count: null },
            { id: 'policies', label: 'Linked Policies', icon: Shield, count: policies.length },
            { id: 'properties', label: 'Properties', icon: Home, count: properties.length },
            { id: 'payments', label: 'Payments', icon: CreditCard, count: payments.length },
            { id: 'documents', label: 'Documents', icon: FileText, count: customer.documents?.length || 0 },
            { id: 'notes', label: 'Notes & Calls', icon: MessageSquare, count: customer.notes?.length || 0 },
            { id: 'history', label: 'Audit History', icon: Clock, count: null },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
                  isSelected
                    ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.count !== null && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      isSelected
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Contents */}
      {/* 1. Overview & Personal Details */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Personal & Identification
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block">Primary Mobile</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{customer.mobile}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Alternate Phone</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {customer.alternatePhone || '—'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Email Address</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{customer.email || '—'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Occupation / Business</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {customer.occupation || '—'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block flex items-center gap-1">
                  <Cake className="w-3 h-3 text-pink-500" /> Date of Birth
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {formatDate(customer.dob)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block flex items-center gap-1">
                  <Heart className="w-3 h-3 text-red-500" /> Anniversary
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {formatDate(customer.anniversary)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">PAN Number</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                  {customer.panNumber || '—'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Aadhaar Number</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                  {customer.aadhaarNumber || '—'}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <span className="text-slate-400 block">Complete Address</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {customer.address}, {customer.city}
              </span>
            </div>
          </div>

          {/* Quick Portfolio Summary */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Client Portfolio Summary
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Total Policies</span>
                <p className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-1">{policies.length}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Annual Premium</span>
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  {formatCurrency(policies.reduce((a, b) => a + b.premiumAmount, 0))}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Total Sum Assured</span>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                  {formatCurrency(policies.reduce((a, b) => a + b.sumAssured, 0))}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Documents on File</span>
                <p className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                  {customer.documents?.length || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Policies Tab */}
      {activeTab === 'policies' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Insurance Policies ({policies.length})
            </h3>
          </div>

          {policies.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">No active policies found for this customer.</p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {policies.map((p) => (
                <div key={p.id} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {p.planName}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        #{p.policyNumber}
                      </span>
                      <span className="text-[10px] font-bold text-amber-600 uppercase">
                        {p.insuranceType.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {p.insurerName} • Sum Assured: {formatCurrency(p.sumAssured)} • Renewal: {formatDate(p.renewalDate)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-extrabold text-slate-900 dark:text-slate-100">
                      {formatCurrency(p.premiumAmount)} / {p.paymentFrequency}
                    </span>
                    <span className="block text-[10px] text-emerald-600 font-semibold uppercase mt-0.5">
                      {p.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. Properties Tab */}
      {activeTab === 'properties' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Property Holdings & Inquiries ({properties.length})
          </h3>
          {properties.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">No properties registered under this customer.</p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {properties.map((prop) => (
                <div key={prop.id} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{prop.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {prop.location} • {prop.areaSize} {prop.areaUnit} • Status: {prop.status}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(prop.askingPrice)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. Payments Tab */}
      {activeTab === 'payments' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Payment History & Receipts ({payments.length})
          </h3>
          {payments.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">No payment entries found.</p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {payments.map((pay) => (
                <div key={pay.id} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{pay.entityTitle}</p>
                    <p className="text-[11px] text-slate-500">
                      Due: {formatDate(pay.dueDate)} {pay.paymentDate && `• Paid on ${formatDate(pay.paymentDate)}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                      {formatCurrency(pay.amount)}
                    </span>
                    <span
                      className={`block text-[10px] font-bold uppercase mt-0.5 ${
                        pay.status === 'paid'
                          ? 'text-emerald-600'
                          : pay.status === 'overdue'
                          ? 'text-red-600'
                          : 'text-amber-600'
                      }`}
                    >
                      {pay.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. Documents Tab */}
      {activeTab === 'documents' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Uploaded Documents & KYC ({customer.documents?.length || 0})
            </h3>
            <button
              onClick={() => setShowAddDocModal(true)}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1"
            >
              <Upload className="w-3.5 h-3.5" />
              Upload Document
            </button>
          </div>

          {(!customer.documents || customer.documents.length === 0) ? (
            <p className="text-xs text-slate-400 py-4 text-center">No documents uploaded yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {customer.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-5 h-5 text-amber-500 shrink-0" />
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{doc.name}</p>
                      <p className="text-[10px] text-slate-400 uppercase">{doc.tag} • {formatDate(doc.uploadedAt)}</p>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
                    Stored
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Add Doc Modal */}
          {showAddDocModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Upload Client Document</h4>
                <form onSubmit={handleAddDocument} className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Document Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Policy Schedule PDF, PAN Card, RC Book"
                      value={docName}
                      onChange={(e) => setDocName(e.target.value)}
                      className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Tag / Category</label>
                    <select
                      value={docType}
                      onChange={(e) => setDocType(e.target.value as any)}
                      className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      <option value="policy">Policy Schedule</option>
                      <option value="pan">PAN Card</option>
                      <option value="aadhaar">Aadhaar Card</option>
                      <option value="rc">Vehicle RC Copy</option>
                      <option value="receipt">Payment Receipt</option>
                      <option value="property">Property Registry / Sale Deed</option>
                      <option value="other">Other Attachment</option>
                    </select>
                  </div>

                  <div className="p-3 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-center bg-slate-50 dark:bg-slate-800/40">
                    <p className="text-xs text-slate-500">Encrypted in-app secure storage simulation</p>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddDocModal(false)}
                      className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950"
                    >
                      Save Document
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 6. Notes & Calls Timeline */}
      {activeTab === 'notes' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Client Interactions & Notes History
          </h3>

          {/* Add Note Form */}
          <form onSubmit={handleAddNote} className="space-y-2">
            <textarea
              rows={2}
              placeholder="Record call summary, client meeting notes, or follow-up details..."
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs"
              >
                Add Note
              </button>
            </div>
          </form>

          {/* Notes List */}
          <div className="space-y-3 pt-3">
            {(!customer.notes || customer.notes.length === 0) ? (
              <p className="text-xs text-slate-400 text-center py-3">No notes logged yet.</p>
            ) : (
              customer.notes.map((note) => (
                <div
                  key={note.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1"
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-bold text-slate-700 dark:text-slate-300">{note.authorName}</span>
                    <span>{formatDate(note.createdAt)}</span>
                  </div>
                  <p className="text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap">{note.text}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 7. History */}
      {activeTab === 'history' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Audit Trail for Customer ID: {customer.id}
          </h3>
          <div className="text-xs text-slate-500 space-y-1">
            <p>• Created Profile: {formatDate(customer.createdAt)}</p>
            <p>• Last Updated: {formatDate(customer.updatedAt)}</p>
            <p>• Assigned Representative ID: {customer.assignedTo}</p>
          </div>
        </div>
      )}
    </div>
  );
};
