/**
 * Category-Wise QR Code & Payment Barcode Manager
 * Allows Admin to configure custom UPI IDs, Account Names, Banks,
 * Upload custom QR image files, and edit default WhatsApp templates per business category.
 */

import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QRCodeConfig, QRCategory } from '../../types';
import { useApp } from '../../context/AppContext';
import { storage } from '../../services/storage';
import {
  QrCode,
  Building,
  ShieldCheck,
  Briefcase,
  Upload,
  Trash2,
  Save,
  CheckCircle2,
  Copy,
  ExternalLink,
  Edit,
  Eye,
  RefreshCw,
} from 'lucide-react';

export const QRCodeManager: React.FC = () => {
  const { currentUser, language, showToast, triggerRefresh } = useApp();
  const [configs, setConfigs] = useState<QRCodeConfig[]>(() => storage.getQRConfigs());
  const [selectedAccountId, setSelectedAccountId] = useState<string>('qr_ashish_property');

  const currentConfig = configs.find((c) => c.id === selectedAccountId) || configs[0];

  const handleFieldChange = (field: keyof QRCodeConfig, value: any) => {
    setConfigs((prev) =>
      prev.map((c) => (c.id === selectedAccountId ? { ...c, [field]: value } : c))
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast(
        language === 'hi'
          ? 'इमेज साइज 2MB से कम होना चाहिए'
          : 'Image size must be less than 2MB',
        'warning'
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      handleFieldChange('qrImageUrl', base64);
      showToast(
        language === 'hi'
          ? 'कस्टम बारकोड इमेज सफलतापूर्वक अपलोड हुई'
          : 'Custom barcode image uploaded successfully',
        'success'
      );
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    handleFieldChange('qrImageUrl', '');
    showToast(
      language === 'hi'
        ? 'कस्टम इमेज हटाई गई (डायनेमिक UPI QR चालू)'
        : 'Custom image removed (Dynamic UPI QR active)',
      'info'
    );
  };

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentConfig.upiId.trim() || !currentConfig.accountName.trim()) {
      showToast(
        language === 'hi' ? 'UPI ID और खाता नाम आवश्यक हैं!' : 'UPI ID and Account Name are required',
        'warning'
      );
      return;
    }

    storage.saveQRConfigs(configs, currentUser);
    showToast(
      language === 'hi'
        ? '✓ क्यूआर कोड एवं बारकोड सेटिंग्स सफलतापूर्वक सुरक्षित की गईं'
        : 'QR code & barcode settings saved successfully',
      'success'
    );
    triggerRefresh();
  };

  const handleResetCurrent = () => {
    if (window.confirm(language === 'hi' ? 'क्या आप इस खाते की सेटिंग्स को मूल डिफ़ॉल्ट पर रीसेट करना चाहते हैं?' : 'Reset this account to default settings?')) {
      const updated = storage.resetQRConfigToDefault(selectedAccountId, currentUser);
      setConfigs(updated);
      showToast(
        language === 'hi'
          ? `खाता "${currentConfig.shortLabel}" मूल डिफ़ॉल्ट पर रीसेट किया गया`
          : 'Account settings reset to original defaults',
        'info'
      );
      triggerRefresh();
    }
  };

  const sampleUPIString = `upi://pay?pa=${encodeURIComponent(currentConfig.upiId)}&pn=${encodeURIComponent(
    currentConfig.accountName
  )}&cu=INR`;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-amber-500/30 dark:border-amber-500/20 p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <span>
                {language === 'hi'
                  ? '📱 कैटेगरी-वाइज क्यूआर कोड एवं बारकोड मैनेजर'
                  : '📱 Category-wise Payment Barcode & QR Manager'}
              </span>
              <span className="text-[10px] bg-amber-500/20 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full font-bold">
                एडमिन कंट्रोल
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {language === 'hi'
                ? 'खाते का नाम, ओनर, फर्म का नाम, बैंक, UPI ID व बारकोड इमेज यहाँ से बदलें।'
                : 'Configure custom account names, owner, firm name, bank, UPI ID, and QR code.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetCurrent}
            className="px-3 py-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-all cursor-pointer"
            title={language === 'hi' ? 'मूल डिफ़ॉल्ट पर रीसेट करें' : 'Reset to original defaults'}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'डिफ़ॉल्ट रीसेट' : 'Reset Default'}</span>
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{language === 'hi' ? 'सेव करें (Save Changes)' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Account Tabs (2 Property, 2 Insurance, 2 General for Ashish & Sheetal) */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto">
        {configs.map((cfg) => {
          const isSelected = selectedAccountId === cfg.id;
          return (
            <button
              key={cfg.id}
              type="button"
              onClick={() => setSelectedAccountId(cfg.id)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <span>{cfg.shortLabel}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                isSelected ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
              }`}>
                {cfg.ownerName.split(' ')[0]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Form Details (2 Cols on lg) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 1. Account Display Name / Short Label */}
            <div>
              <label className="text-xs font-bold text-amber-900 dark:text-amber-300 block mb-1">
                {language === 'hi'
                  ? '✏️ खाते का नाम / शॉर्ट लेबल (Display Name) *'
                  : '✏️ Account Name / Short Label (Display Name) *'}
              </label>
              <input
                type="text"
                required
                value={currentConfig.shortLabel || ''}
                onChange={(e) => handleFieldChange('shortLabel', e.target.value)}
                placeholder="e.g. Ashish - Property, Sheetal - Insurance"
                className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/30 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <span className="text-[10px] text-slate-400">
                {language === 'hi' ? 'यह नाम पेमेंट कार्ड्स व ड्रॉपडाउन में दिखेगा।' : 'Displayed on cards and payment dropdowns.'}
              </span>
            </div>

            {/* 2. Account Owner Name */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                {language === 'hi' ? '👤 खाता स्वामी / ओनर का नाम *' : '👤 Account Owner Name *'}
              </label>
              <input
                type="text"
                required
                value={currentConfig.ownerName || ''}
                onChange={(e) => handleFieldChange('ownerName', e.target.value)}
                placeholder="e.g. Ashish Panwar, Sheetal Panwar"
                className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* 3. Account Purpose / Full Title */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                {language === 'hi' ? '🏢 खाते का पूरा शीर्षक / उद्देश्य' : '🏢 Account Title / Purpose'}
              </label>
              <input
                type="text"
                value={currentConfig.title || ''}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                placeholder="e.g. Ashish Real Estate & Token Escrow"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* 4. Account / Beneficiary Firm Name */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                {language === 'hi' ? '🏛️ बैंक खाताधारक / फर्म का नाम *' : '🏛️ Account / Beneficiary Name *'}
              </label>
              <input
                type="text"
                required
                value={currentConfig.accountName}
                onChange={(e) => handleFieldChange('accountName', e.target.value)}
                placeholder="e.g. Ashish Real Estate & Builders"
                className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* 5. UPI ID */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                {language === 'hi' ? '📲 UPI ID (Google Pay / PhonePe / Paytm) *' : '📲 UPI ID *'}
              </label>
              <input
                type="text"
                required
                value={currentConfig.upiId}
                onChange={(e) => handleFieldChange('upiId', e.target.value)}
                placeholder="e.g. ashish.property@icici"
                className="w-full px-3.5 py-2 text-xs font-mono font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* 6. Bank Name */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                {language === 'hi' ? '🏦 बैंक का नाम (Bank Name)' : '🏦 Bank Name'}
              </label>
              <input
                type="text"
                value={currentConfig.bankName}
                onChange={(e) => handleFieldChange('bankName', e.target.value)}
                placeholder="e.g. ICICI Bank Ltd / HDFC Bank"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* 7. Bank Account Number */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                {language === 'hi' ? '🔢 बैंक खाता संख्या (Account No. ऐच्छिक)' : '🔢 Account Number (Optional)'}
              </label>
              <input
                type="text"
                value={currentConfig.accountNumber || ''}
                onChange={(e) => handleFieldChange('accountNumber', e.target.value)}
                placeholder="e.g. 50200088991122"
                className="w-full px-3.5 py-2 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* 8. IFSC Code */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                {language === 'hi' ? '🔤 IFSC कोड (IFSC Code ऐच्छिक)' : '🔤 IFSC Code (Optional)'}
              </label>
              <input
                type="text"
                value={currentConfig.ifscCode || ''}
                onChange={(e) => handleFieldChange('ifscCode', e.target.value)}
                placeholder="e.g. ICIC0001234"
                className="w-full px-3.5 py-2 text-xs font-mono uppercase rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Custom QR Image Upload Field */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  {language === 'hi' ? '🖼️ आधिकारिक बारकोड / QR कोड फोटो अपलोड करें' : '🖼️ Upload Custom QR / Barcode Image'}
                </span>
                <span className="text-[11px] text-slate-500">
                  {language === 'hi'
                    ? 'यदि आप बैंक या गूगल पे का असली बारकोड फोटो लगाना चाहते हैं, तो यहाँ अपलोड करें।'
                    : 'Upload your official bank QR sticker image (PNG/JPEG) or keep dynamic QR.'}
                </span>
              </div>

              {currentConfig.qrImageUrl && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-red-100 hover:bg-red-200 text-red-700 flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{language === 'hi' ? 'फोटो हटाएं' : 'Remove Image'}</span>
                </button>
              )}
            </div>

            <div className="pt-1">
              <label className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 cursor-pointer shadow-xs">
                <Upload className="w-4 h-4 text-amber-500" />
                <span>{language === 'hi' ? 'नई QR फोटो चुनें...' : 'Select QR Image File...'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Default Message Template */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                {language === 'hi'
                  ? 'डिफ़ॉल्ट व्हाट्सएप मैसेज टेम्पलेट (इस कैटेगरी के लिए):'
                  : 'Default WhatsApp Message Template:'}
              </label>
              <span className="text-[10px] text-slate-400">
                टैग: {'{clientName}'}, {'{entityTitle}'}, {'{amount}'}, {'{dueDate}'}, {'{upiId}'}
              </span>
            </div>
            <textarea
              rows={4}
              value={currentConfig.defaultMessageTemplate}
              onChange={(e) => handleFieldChange('defaultMessageTemplate', e.target.value)}
              className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-500 font-sans"
            />
          </div>
        </div>

        {/* Right Column: Live QR Preview Box */}
        <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center space-y-3">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
            {language === 'hi' ? 'लाइव बारकोड पूर्वावलोकन' : 'Live Barcode Preview'}
          </span>

          <div className="bg-white p-3 rounded-2xl shadow-md border border-slate-200 inline-block">
            {currentConfig.qrImageUrl ? (
              <img
                src={currentConfig.qrImageUrl}
                alt="Uploaded Barcode"
                className="w-40 h-40 object-contain rounded-lg"
              />
            ) : (
              <QRCodeSVG
                value={sampleUPIString}
                size={160}
                level="H"
                includeMargin={true}
              />
            )}
          </div>

          <div className="space-y-0.5">
            <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 block">
              {currentConfig.accountName}
            </span>
            <span className="text-[11px] font-mono text-slate-500 block">
              {currentConfig.upiId}
            </span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full inline-block mt-1">
              ✓ {currentConfig.qrImageUrl ? 'कस्टम इमेज सक्रिय' : 'डायनेमिक UPI एक्टिव'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
