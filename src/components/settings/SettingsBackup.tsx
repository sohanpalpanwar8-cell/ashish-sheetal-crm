/**
 * System Settings, Backup & Restore, and Data Security
 * Full JSON snapshot backup export, restore with schema validation, and factory reset
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { storage } from '../../services/storage';
import {
  Settings,
  Download,
  Upload,
  RefreshCw,
  ShieldAlert,
  Database,
  Lock,
  FileCheck,
  CheckCircle2,
  HardDrive,
  Key,
  Building,
  Save,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { QRCodeManager } from './QRCodeManager';

export const SettingsBackup: React.FC = () => {
  const { currentUser, language, t, showToast, triggerRefresh, appName, appSubtitle, updateBrandInfo } = useApp();

  const [brandNameInput, setBrandNameInput] = useState(appName);
  const [brandSubtitleInput, setBrandSubtitleInput] = useState(appSubtitle);

  // Date range filter for selective backup export
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const [restoreJson, setRestoreJson] = useState('');
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showClearDemoModal, setShowClearDemoModal] = useState(false);
  const [confirmResetText, setConfirmResetText] = useState('');

  const handleClearDemoData = () => {
    const res = storage.clearSampleData(currentUser);
    showToast(
      language === 'hi'
        ? `सभी उदाहरण/डेमो रिकॉर्ड साफ़ कर दिए गए (${res.properties} प्रॉपर्टी, ${res.policies} पॉलिसी, ${res.customers} ग्राहक)`
        : `Cleared demo records: ${res.properties} properties, ${res.policies} policies, ${res.customers} customers`,
      'success'
    );
    setShowClearDemoModal(false);
    triggerRefresh();
  };

  const handleSaveBranding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandNameInput.trim()) {
      showToast(language === 'hi' ? 'ऐप का नाम खाली नहीं हो सकता!' : 'App name cannot be empty', 'warning');
      return;
    }
    updateBrandInfo(brandNameInput.trim(), brandSubtitleInput.trim());
    showToast(
      language === 'hi'
        ? `ऐप का नाम बदलकर "${brandNameInput.trim()}" कर दिया गया!`
        : `Brand name updated to "${brandNameInput.trim()}"!`,
      'success'
    );
    triggerRefresh();
  };

  const handleDownloadBackup = () => {
    const backupStr = storage.exportFullDatabase(fromDate, toDate);
    const blob = new Blob([backupStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateLabel = fromDate || toDate ? `_${fromDate || 'start'}_to_${toDate || 'today'}` : '';
    link.download = `ashish_sheetal_backup${dateLabel}_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    storage.logAudit(
      currentUser,
      'EXPORT',
      'DatabaseBackup',
      `Downloaded system snapshot backup file (From: ${fromDate || 'All'}, To: ${toDate || 'All'})`
    );
    showToast(
      language === 'hi'
        ? `डेटा बैकअप डाउनलोड हो गया ${fromDate || toDate ? `(${fromDate || 'आरंभ'} से ${toDate || 'आज तक'})` : '(संपूर्ण डेटाबेस)'}`
        : 'Full system backup downloaded successfully',
      'success'
    );
  };

  const handleRestoreBackup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restoreJson.trim()) {
      showToast('Please paste valid JSON backup content', 'warning');
      return;
    }

    const res = storage.restoreFullDatabase(restoreJson, currentUser);
    if (res.success) {
      showToast(res.message, 'success');
      setShowRestoreModal(false);
      setRestoreJson('');
      triggerRefresh();
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleFactoryReset = () => {
    if (confirmResetText.trim().toUpperCase() !== 'RESET') {
      showToast('Please type RESET to confirm factory reload', 'warning');
      return;
    }

    storage.resetToFactoryDefaults(currentUser);
    setShowResetModal(false);
    setConfirmResetText('');
    showToast('Application reset to default factory state with sample records', 'info');
    triggerRefresh();
  };

  // Strictly restrict settings & backup to Main Super Admin (Admin URL only)
  if (currentUser.role !== 'main_super_admin') {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-red-200 dark:border-red-900/40 shadow-sm space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
          {language === 'hi' ? 'प्रतिबंधित क्षेत्र: सिर्फ एडमिन एक्सेस (Admin Only)' : 'Access Restricted: Master Admin Only'}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
          {language === 'hi'
            ? 'सिस्टम सेटिंग्स, ब्रांड नाम, तथा फ्रॉम-टू डेट बैकअप डाउनलोड करने का अधिकार केवल मुख्य एडमिन (Owner URL) के पास सुरक्षित है।'
            : 'System configuration, brand editing, and database backup exports are strictly restricted to the Main Admin.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-amber-500" />
          {t.settings}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {language === 'hi'
            ? 'बिज़नेस नाम व ब्रांडिंग, सिस्टम बैकअप, डेटा रीस्टोर एवं सुरक्षा नीतियां'
            : 'Brand & App Name, System Snapshot Backup & Restore, Security Hardening'}
        </p>
      </div>

      {/* Business Branding & App Name Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-amber-500/30 dark:border-amber-500/20 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{language === 'hi' ? '🏢 बिज़नेस ब्रांडिंग एवं ऐप का नाम' : '🏢 Business Branding & App Name'}</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full font-bold">
                  मालिक (Owner) कंट्रोल
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'hi'
                  ? 'यहाँ अपनी फर्म या कंपनी का नाम बदलें। यह नया नाम हेडर, रसीदों (Receipts) और लॉगिन स्क्रीन पर तुरंत लागू हो जाएगा।'
                  : 'Customize your company name and tagline across headers, login portals, and print receipts.'}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSaveBranding} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                {language === 'hi' ? 'फर्म / ऐप का नाम (App / Brand Name) *' : 'App / Brand Name *'}
              </label>
              <input
                type="text"
                required
                value={brandNameInput}
                onChange={(e) => setBrandNameInput(e.target.value)}
                placeholder="उदा. ASHISH SHEETAL ALL-IN-ONE या Panwar Associates"
                className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                {language === 'hi' ? 'टैगलाइन / उप-शीर्षक (Tagline / Subtitle)' : 'Tagline / Subtitle'}
              </label>
              <input
                type="text"
                value={brandSubtitleInput}
                onChange={(e) => setBrandSubtitleInput(e.target.value)}
                placeholder="उदा. Personal & Business Management Platform"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Live Preview Box */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-400 flex items-center justify-center text-white font-extrabold text-[11px] shadow-sm">
                {(brandNameInput || 'AS').split(' ').filter(Boolean).map((w) => w[0]).slice(0, 2).join('').toUpperCase() || 'AS'}
              </div>
              <div>
                <p className="text-xs font-extrabold text-slate-900 dark:text-white leading-tight">
                  {brandNameInput || 'Your Business Name'}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  {brandSubtitleInput || 'Your Business Tagline'}
                </p>
              </div>
            </div>

            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{language === 'hi' ? '💾 नया नाम सहेजें (Save Name)' : 'Save Brand Name'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Backup & Disaster Recovery Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Complete System Backup & Snapshot
            </h3>
            <p className="text-xs text-slate-500">
              Download an offline JSON archive containing all customers, policies, properties, leads, payments, dynamic modules, and audit history.
            </p>
          </div>
        </div>

        {/* Date Range Selector Box */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-2.5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <span>📅</span>
              <span>{language === 'hi' ? 'तारीख फ़िल्टर (Date Range Filter)' : 'Date Range Filter'}</span>
            </span>
            {(fromDate || toDate) && (
              <button
                type="button"
                onClick={() => {
                  setFromDate('');
                  setToDate('');
                }}
                className="text-[11px] text-amber-600 dark:text-amber-400 hover:underline font-bold cursor-pointer"
              >
                {language === 'hi' ? 'फ़िल्टर हटाएं (Clear Filter / All Time)' : 'Clear Filter (All Time)'}
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                {language === 'hi' ? 'प्रारंभिक तारीख (From Date)' : 'From Date'}
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                {language === 'hi' ? 'अंतिम तारीख (To Date)' : 'To Date'}
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <p className="text-[10px] text-slate-500">
            {fromDate || toDate
              ? (language === 'hi'
                  ? `* केवल ${fromDate || 'आरंभ'} से लेकर ${toDate || 'आज तक'} की ग्राहक प्रविष्टियां और पॉलिसियां डाउनलोड होंगी।`
                  : `* Exporting records created between ${fromDate || 'the beginning'} and ${toDate || 'today'}.`)
              : (language === 'hi'
                  ? '* अगर तारीख खाली रखेंगे, तो आपका संपूर्ण डेटाबेस (All Time) बिना किसी फ़िल्टर के डाउनलोड होगा।'
                  : '* Leave blank to export all-time full database records without any filter.')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleDownloadBackup}
            className="px-5 py-2.5 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 flex items-center gap-2 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>
              {fromDate || toDate
                ? (language === 'hi' ? 'तारीख अनुसार JSON बैकअप डाउनलोड करें' : 'Download Filtered JSON Backup')
                : (language === 'hi' ? 'संपूर्ण JSON बैकअप डाउनलोड करें' : 'Download Full JSON Backup')}
            </span>
          </button>

          {currentUser.role === 'main_super_admin' && (
            <button
              onClick={() => setShowRestoreModal(true)}
              className="px-4 py-2.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center gap-2 transition-colors"
            >
              <Upload className="w-4 h-4 text-blue-500" />
              Restore Database from Backup
            </button>
          )}
        </div>
      </div>

      {/* QR Code & Payment Barcode Manager (Requirement 4) */}
      {currentUser.role === 'main_super_admin' && (
        <QRCodeManager />
      )}

      {/* Security Architecture Overview */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <Lock className="w-4 h-4 text-emerald-500" />
          Security, Privacy & Architecture Safeguards
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-1">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Workspace Isolation (RBAC)
            </h4>
            <p className="text-slate-500">
              Field agents are restricted from browsing fellow team members' private clients and leads without explicit admin authorization.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-1">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Two-Step Deletion Protection
            </h4>
            <p className="text-slate-500">
              Permanent record deletion requires administrative clearance and typing the safety confirmation word "DELETE".
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-1">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Offline PWA Resilience
            </h4>
            <p className="text-slate-500">
              Full application code and operational data are cached locally to provide uninterrupted responsiveness even in patchy network zones.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-1">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Zero External AI Data Sharing
            </h4>
            <p className="text-slate-500">
              Customer identification numbers, policies, and private financial records are never transferred to external machine-learning models.
            </p>
          </div>
        </div>
      </div>

      {/* Clear Demo Data Card */}
      {currentUser.role === 'main_super_admin' && (
        <div className="bg-amber-50 dark:bg-amber-950/20 rounded-2xl border border-amber-300 dark:border-amber-900/50 p-6 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-sm font-extrabold text-amber-900 dark:text-amber-300 uppercase tracking-wider flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-amber-600" />
                {language === 'hi' ? '🧹 उदाहरण / डेमो डेटा एक क्लिक में हटाएं' : '🧹 Clear Pre-loaded Sample/Demo Records'}
              </h3>
              <p className="text-xs text-amber-800 dark:text-amber-400 mt-1">
                {language === 'hi'
                  ? 'ऐप के साथ जो शुरुआती उदाहरण (जैसे रमेश, सुनीता, डेमो प्रॉपर्टीज और डेमो पॉलिसी) आए थे, उन्हें एक साथ हटाकर अपना नया फ्रेश डेटा रखें।'
                  : 'Remove all initial template examples (demo customers, demo insurance policies, demo properties) while keeping your custom work safe.'}
              </p>
            </div>
            <button
              onClick={() => setShowClearDemoModal(true)}
              className="px-4 py-2.5 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all"
            >
              <Trash2 className="w-4 h-4" />
              {language === 'hi' ? 'सभी डेमो डेटा साफ़ करें' : 'Clear All Demo Data'}
            </button>
          </div>
        </div>
      )}

      {/* Danger Zone: Factory Reset */}
      {currentUser.role === 'main_super_admin' && (
        <div className="bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-200 dark:border-red-900/40 p-6 space-y-3">
          <h3 className="text-sm font-extrabold text-red-700 dark:text-red-400 uppercase tracking-wider flex items-center gap-2">
            <ShieldAlert className="w-4 h-4" /> Danger Zone: Factory Reset
          </h3>
          <p className="text-xs text-red-600 dark:text-red-300">
            Reset all databases, dynamic modules, customers, and records back to initial default seed state.
          </p>
          <button
            onClick={() => setShowResetModal(true)}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-sm"
          >
            Reset to Factory Defaults
          </button>
        </div>
      )}

      {/* Restore Modal */}
      {showRestoreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Restore Database from JSON Snapshot
            </h3>
            <p className="text-xs text-slate-500">
              Paste the contents of a previously downloaded Ashish Sheetal backup JSON file below.
            </p>

            <form onSubmit={handleRestoreBackup} className="space-y-3">
              <textarea
                rows={8}
                required
                value={restoreJson}
                onChange={(e) => setRestoreJson(e.target.value)}
                placeholder="Paste backup JSON string here..."
                className="w-full p-3 font-mono text-[11px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRestoreModal(false)}
                  className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950"
                >
                  Verify & Restore
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-slate-900 border border-red-300 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h4 className="text-base font-extrabold text-red-600">Confirm System Reset</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              This will erase all custom entries and restore the initial sample dataset. Type <strong>RESET</strong> below to confirm:
            </p>
            <input
              type="text"
              placeholder="RESET"
              value={confirmResetText}
              onChange={(e) => setConfirmResetText(e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold uppercase rounded-xl border border-red-300 bg-white dark:bg-slate-900"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleFactoryReset}
                disabled={confirmResetText.trim().toUpperCase() !== 'RESET'}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-red-600 hover:bg-red-700 text-white disabled:opacity-40"
              >
                Confirm Factory Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Demo Data Confirmation Modal */}
      {showClearDemoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {language === 'hi' ? 'सभी नमूना / डेमो रिकॉर्ड हटाएं?' : 'Clear Sample Demo Data?'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'hi'
                  ? 'यह ऐप में दिए गए पहले से मौजूद उदाहरण (Demo Customers, Demo Policies, Demo Properties) को डेटाबेस से हमेशा के लिए हटा देगा। आपकी खुद की बनाई चीजें सुरक्षित रहेंगी।'
                  : 'This will permanently remove the pre-loaded template demo records from the database.'}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowClearDemoModal(false)}
                className="py-2.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {language === 'hi' ? 'रद्द करें (Cancel)' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleClearDemoData}
                className="py-2.5 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold shadow-md shadow-amber-500/20 transition-all"
              >
                {language === 'hi' ? 'हाँ, साफ़ करें' : 'Yes, Clear All'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

