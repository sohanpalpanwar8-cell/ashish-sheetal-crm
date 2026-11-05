/**
 * Edit Account Modal
 * Allows User/Admin to customize account display names (shortLabel),
 * owner names, bank details, UPI IDs, QR image uploads, and WhatsApp templates.
 */

import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QRCodeConfig } from '../../types';
import {
  X,
  Save,
  RotateCcw,
  Upload,
  Trash2,
  CreditCard,
  Building,
  ShieldCheck,
  Briefcase,
  QrCode,
  Check,
} from 'lucide-react';

interface EditAccountModalProps {
  config: QRCodeConfig;
  allConfigs: QRCodeConfig[];
  language: 'hi' | 'en';
  onSelectAccount: (acc: QRCodeConfig) => void;
  onClose: () => void;
  onSave: (updated: QRCodeConfig) => void;
  onReset: (accountId: string) => void;
}

export const EditAccountModal: React.FC<EditAccountModalProps> = ({
  config,
  allConfigs,
  language,
  onSelectAccount,
  onClose,
  onSave,
  onReset,
}) => {
  const [formData, setFormData] = useState<QRCodeConfig>({ ...config });

  useEffect(() => {
    setFormData({ ...config });
  }, [config.id]);

  const handleChange = (field: keyof QRCodeConfig, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert(language === 'hi' ? 'कृपया केवल इमेज फाइल (PNG/JPEG) चुनें' : 'Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setFormData((prev) => ({ ...prev, qrImageUrl: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, qrImageUrl: '' }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const sampleUPIString = `upi://pay?pa=${encodeURIComponent(formData.upiId || 'payment@upi')}&pn=${encodeURIComponent(
    formData.accountName || 'Account'
  )}&cu=INR`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-amber-500/30 dark:border-amber-500/20 max-w-3xl w-full p-5 sm:p-6 shadow-2xl space-y-5 my-8 max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <span>
                  {language === 'hi'
                    ? '✏️ खाता नाम व बैंक विवरण बदलें (Edit Account Names)'
                    : '✏️ Edit Account Names & Bank Details'}
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'hi'
                  ? 'अपनी सुविधानुसार खाते का नाम, ओनर, बैंक व UPI विवरण बदलें। यह नाम पूरे ऐप में तुरंत लागू होगा।'
                  : 'Customize account display labels, owners, bank information, and UPI configurations.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 6 Account Switcher Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0 border-b border-slate-100 dark:border-slate-800">
          {allConfigs.map((cfg) => {
            const isCurrent = cfg.id === formData.id;
            return (
              <button
                key={cfg.id}
                type="button"
                onClick={() => {
                  onSelectAccount(cfg);
                  setFormData({ ...cfg });
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/20'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>{cfg.shortLabel}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                    isCurrent ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                  }`}
                >
                  {cfg.ownerName?.split(' ')[0] || ''}
                </span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto space-y-4 pr-1 flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 1. Account Display Name / Short Label */}
            <div>
              <label className="text-xs font-bold text-amber-900 dark:text-amber-300 block mb-1">
                {language === 'hi'
                  ? '✏️ खाते का नाम / शॉर्ट लेबल (Display Name) *'
                  : '✏️ Account Display Name (Short Label) *'}
              </label>
              <input
                type="text"
                required
                value={formData.shortLabel || ''}
                onChange={(e) => handleChange('shortLabel', e.target.value)}
                placeholder="e.g. Ashish - Property, Sheetal - Insurance"
                className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/30 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <span className="text-[10px] text-slate-400 block mt-0.5">
                {language === 'hi' ? 'यह नाम कार्ड्स, बटन्स व ड्रॉपडाउन में दिखेगा।' : 'Shown on cards, buttons & dropdowns.'}
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
                value={formData.ownerName || ''}
                onChange={(e) => handleChange('ownerName', e.target.value)}
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
                value={formData.title || ''}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="e.g. Ashish Real Estate & Token Escrow"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* 4. Beneficiary / Firm Name */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                {language === 'hi' ? '🏛️ बैंक खाताधारक / फर्म का नाम *' : '🏛️ Account / Beneficiary Name *'}
              </label>
              <input
                type="text"
                required
                value={formData.accountName || ''}
                onChange={(e) => handleChange('accountName', e.target.value)}
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
                value={formData.upiId || ''}
                onChange={(e) => handleChange('upiId', e.target.value)}
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
                value={formData.bankName || ''}
                onChange={(e) => handleChange('bankName', e.target.value)}
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
                value={formData.accountNumber || ''}
                onChange={(e) => handleChange('accountNumber', e.target.value)}
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
                value={formData.ifscCode || ''}
                onChange={(e) => handleChange('ifscCode', e.target.value)}
                placeholder="e.g. ICIC0001234"
                className="w-full px-3.5 py-2 text-xs font-mono uppercase rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* QR Image Upload & Preview */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  {language === 'hi' ? '🖼️ आधिकारिक बारकोड / QR कोड फोटो' : '🖼️ Official Barcode / QR Code Image'}
                </span>
                <span className="text-[11px] text-slate-500">
                  {language === 'hi'
                    ? 'यदि आप बैंक या गूगल पे का असली बारकोड फोटो लगाना चाहते हैं, तो यहाँ अपलोड करें।'
                    : 'Upload official bank QR sticker (PNG/JPEG) or keep dynamic QR.'}
                </span>
              </div>

              {formData.qrImageUrl && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-red-100 hover:bg-red-200 text-red-700 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{language === 'hi' ? 'फोटो हटाएं' : 'Remove Image'}</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              <label className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 cursor-pointer shadow-xs">
                <Upload className="w-4 h-4 text-amber-500" />
                <span>{language === 'hi' ? 'नई QR फोटो चुनें...' : 'Select QR Image File...'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>

              {/* Thumbnail Preview */}
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 bg-white rounded-lg p-1 border border-slate-200 shadow-xs flex items-center justify-center shrink-0">
                  {formData.qrImageUrl ? (
                    <img src={formData.qrImageUrl} alt="QR Thumbnail" className="w-full h-full object-contain rounded" />
                  ) : (
                    <QRCodeSVG value={sampleUPIString} size={40} level="L" />
                  )}
                </div>
                <span className="text-[11px] text-slate-500">
                  {formData.qrImageUrl
                    ? (language === 'hi' ? '✓ कस्टम इमेज सक्रिय' : '✓ Custom image active')
                    : (language === 'hi' ? 'डायनेमिक UPI कोड एक्टिव' : 'Dynamic UPI QR active')}
                </span>
              </div>
            </div>
          </div>

          {/* Default WhatsApp Message Template */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                {language === 'hi'
                  ? '💬 डिफ़ॉल्ट व्हाट्सएप मैसेज टेम्पलेट:'
                  : '💬 Default WhatsApp Message Template:'}
              </label>
              <span className="text-[10px] text-slate-400">
                टैग: {'{clientName}'}, {'{entityTitle}'}, {'{amount}'}, {'{dueDate}'}, {'{upiId}'}
              </span>
            </div>
            <textarea
              rows={3}
              value={formData.defaultMessageTemplate || ''}
              onChange={(e) => handleChange('defaultMessageTemplate', e.target.value)}
              className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-500 font-sans"
            />
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onReset(formData.id)}
              className="px-3 py-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
              title={language === 'hi' ? 'इस खाते को सिस्टम डिफ़ॉल्ट पर रीसेट करें' : 'Reset this account to default'}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'डिफ़ॉल्ट रीसेट' : 'Reset to Default'}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                {language === 'hi' ? 'रद्द करें' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{language === 'hi' ? 'बदलाव सहेजें (Save Changes)' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
