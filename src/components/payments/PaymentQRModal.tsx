/**
 * Payment Barcode & QR Code Sharing Modal
 * Smart Auto-Selection with Manual Dropdown Override
 * Dynamic WhatsApp Message Template, Live Editing & 1-Click Dispatch
 */

import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { PaymentRecord, QRCodeConfig } from '../../types';
import { useApp } from '../../context/AppContext';
import { storage } from '../../services/storage';
import {
  QrCode,
  Share2,
  Copy,
  Check,
  Send,
  Building,
  ShieldCheck,
  Briefcase,
  ChevronDown,
  ExternalLink,
  Download,
  CheckCircle2,
  AlertCircle,
  X,
  CreditCard,
  Edit3,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/date';
import { generateWhatsAppUrl } from '../../utils/whatsapp';

interface PaymentQRModalProps {
  payment: PaymentRecord;
  onClose: () => void;
  onMarkPaid?: (payment: PaymentRecord, referenceNumber: string, selectedAccount?: QRCodeConfig) => void;
}

export const PaymentQRModal: React.FC<PaymentQRModalProps> = ({
  payment,
  onClose,
  onMarkPaid,
}) => {
  const { currentUser, language, showToast, triggerRefresh } = useApp();
  const qrConfigs = storage.getQRConfigs();

  // 1. Smart Initial Selection based on payment entity or pre-assigned account
  const getInitialQRId = (): string => {
    if (payment.accountId && qrConfigs.some((q) => q.id === payment.accountId)) {
      return payment.accountId;
    }
    if (payment.relatedEntity === 'property') {
      const propQR = qrConfigs.find((q) => q.category === 'property' && q.active);
      if (propQR) return propQR.id;
    }
    if (payment.relatedEntity === 'policy') {
      const insQR = qrConfigs.find((q) => q.category === 'insurance' && q.active);
      if (insQR) return insQR.id;
    }
    const genQR = qrConfigs.find((q) => q.category === 'general' && q.active);
    return genQR?.id || qrConfigs[0]?.id || 'qr_ashish_property';
  };

  // Selected QR code ID (manual dropdown override enabled)
  const [selectedQRId, setSelectedQRId] = useState<string>(getInitialQRId);
  const selectedQR = qrConfigs.find((q) => q.id === selectedQRId) || qrConfigs[0];

  // Helper to construct dynamic message
  const buildDynamicMessage = (qr: QRCodeConfig): string => {
    let msg = qr.defaultMessageTemplate;
    msg = msg.replace(/{clientName}/g, payment.customerName || 'ग्राहक');
    msg = msg.replace(/{entityTitle}/g, payment.entityTitle || 'सेवा');
    msg = msg.replace(/{amount}/g, payment.amount.toLocaleString('en-IN'));
    msg = msg.replace(/{dueDate}/g, formatDate(payment.dueDate));
    msg = msg.replace(/{upiId}/g, qr.upiId);
    msg = msg.replace(/{accountName}/g, qr.accountName);
    return msg;
  };

  // 2. Editable Message State (Auto-updates dynamically when QR dropdown changes)
  const [editableMessage, setEditableMessage] = useState<string>(() =>
    buildDynamicMessage(selectedQR)
  );

  // 3. Dynamic Message Update upon QR dropdown change
  useEffect(() => {
    if (selectedQR) {
      setEditableMessage(buildDynamicMessage(selectedQR));
    }
  }, [selectedQRId]);

  // Verification & Mark Paid field
  const [upiRefNumber, setUpiRefNumber] = useState(payment.referenceNumber || '');
  const [copiedUPI, setCopiedUPI] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);

  // Generate UPI pay deep-link string
  const upiPayString = `upi://pay?pa=${encodeURIComponent(selectedQR.upiId)}&pn=${encodeURIComponent(
    selectedQR.accountName
  )}&am=${payment.amount}&cu=INR&tn=${encodeURIComponent(payment.entityTitle || 'Payment')}`;

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(selectedQR.upiId);
    setCopiedUPI(true);
    showToast(language === 'hi' ? 'UPI ID कॉपी हो गई' : 'UPI ID copied to clipboard', 'success');
    setTimeout(() => setCopiedUPI(false), 2000);
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(editableMessage);
    setCopiedMessage(true);
    showToast(language === 'hi' ? 'व्हाट्सएप संदेश कॉपी हो गया' : 'WhatsApp message copied', 'success');
    setTimeout(() => setCopiedMessage(false), 2000);
  };

  const handleSendWhatsApp = () => {
    const phone = payment.customerPhone || '';
    const cleanPhone = phone.replace(/\D/g, '');
    const waUrl = generateWhatsAppUrl(cleanPhone, editableMessage);
    window.open(waUrl, '_blank');
  };

  const handleConfirmPaid = () => {
    if (onMarkPaid) {
      onMarkPaid(payment, upiRefNumber.trim(), selectedQR);
    } else {
      const updated: PaymentRecord = {
        ...payment,
        status: 'paid',
        paymentDate: new Date().toISOString().split('T')[0],
        referenceNumber: upiRefNumber.trim() || `UPI-${Date.now().toString().slice(-6)}`,
        isVerified: true,
        accountId: selectedQR.id,
        accountTitle: `${selectedQR.ownerName} - ${selectedQR.shortLabel} (${selectedQR.bankName})`,
        accountOwner: selectedQR.ownerName,
      };
      storage.savePayment(updated, currentUser, false);
      showToast(
        language === 'hi'
          ? `पेमेंट ₹${payment.amount} सत्यापित व Paid मार्क किया गया (${selectedQR.shortLabel})`
          : `Payment ₹${payment.amount} marked as Paid & Verified (${selectedQR.shortLabel})`,
        'success'
      );
      triggerRefresh();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 my-auto max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{language === 'hi' ? 'पेमेंट क्यूआर कोड एवं बारकोड' : 'Payment QR Code & Barcode'}</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full font-bold">
                  {payment.customerName}
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'hi'
                  ? 'आशीष व शीतल के 6 खातों में से किसी में भी प्राप्त करें'
                  : 'Receive payment into any of Ashish & Sheetal accounts'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Smart Dropdown Override (User's Requirement #1) */}
        <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-1">
            <label className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5 text-amber-600" />
              <span>
                {language === 'hi'
                  ? 'खाता व बारकोड चुनें (आशीष व शीतल के 6 खाते):'
                  : 'Select QR & Receiving Account (Ashish & Sheetal 6 Accounts):'}
              </span>
            </label>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-full shadow-xs">
              ✓ {selectedQR.ownerName}: {selectedQR.shortLabel}
            </span>
          </div>

          <div className="relative">
            <select
              value={selectedQRId}
              onChange={(e) => setSelectedQRId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border border-amber-300 dark:border-amber-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
            >
              <optgroup label="🏢 Property Accounts (Escrow)">
                {qrConfigs
                  .filter((q) => q.category === 'property')
                  .map((q) => (
                    <option key={q.id} value={q.id}>
                      {q.ownerName} • {q.shortLabel} ({q.bankName}) - {q.upiId}
                    </option>
                  ))}
              </optgroup>
              <optgroup label="🛡️ Insurance Accounts (Premium)">
                {qrConfigs
                  .filter((q) => q.category === 'insurance')
                  .map((q) => (
                    <option key={q.id} value={q.id}>
                      {q.ownerName} • {q.shortLabel} ({q.bankName}) - {q.upiId}
                    </option>
                  ))}
              </optgroup>
              <optgroup label="💼 General & Office Accounts (Multi-Services)">
                {qrConfigs
                  .filter((q) => q.category === 'general')
                  .map((q) => (
                    <option key={q.id} value={q.id}>
                      {q.ownerName} • {q.shortLabel} ({q.bankName}) - {q.upiId}
                    </option>
                  ))}
              </optgroup>
            </select>
          </div>
        </div>

        {/* QR Code Presentation Box & Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Left: Dynamic QR Code Render */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center space-y-3">
            <div className="bg-white p-3 rounded-2xl shadow-md border border-slate-200 inline-block">
              {selectedQR.qrImageUrl ? (
                <img
                  src={selectedQR.qrImageUrl}
                  alt="Custom Barcode"
                  className="w-40 h-40 object-contain rounded-lg"
                />
              ) : (
                <QRCodeSVG
                  value={upiPayString}
                  size={160}
                  level="H"
                  includeMargin={true}
                />
              )}
            </div>

            <div className="space-y-1">
              <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 block">
                {selectedQR.accountName}
              </span>
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 block">
                {selectedQR.bankName}
              </span>
              <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 block pt-1">
                {formatCurrency(payment.amount)}
              </span>
            </div>

            <div className="flex items-center gap-1.5 w-full">
              <button
                type="button"
                onClick={handleCopyUPI}
                className="flex-1 py-1.5 px-2 text-[11px] font-bold rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1 transition-colors"
              >
                {copiedUPI ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedUPI ? 'Copied' : selectedQR.upiId}</span>
              </button>
            </div>
          </div>

          {/* Right: Payment Snapshot & Verification */}
          <div className="space-y-3 flex flex-col justify-between">
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-1 border border-slate-200 dark:border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-400">ग्राहक का नाम:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{payment.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">मोबाइल / WhatsApp:</span>
                  <span className="font-mono font-semibold">{payment.customerPhone || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">पेमेंट मद (Title):</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[150px]">
                    {payment.entityTitle || 'Payment'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">अंतिम देय तिथि:</span>
                  <span className="font-semibold">{formatDate(payment.dueDate)}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 font-bold">कुल देय राशि:</span>
                  <span className="font-extrabold text-emerald-600 text-sm">{formatCurrency(payment.amount)}</span>
                </div>
              </div>

              {/* 4. Verification Field: UPI Ref / UTR / Cheque (Requirement #4) */}
              <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 space-y-1.5">
                <label className="text-[11px] font-bold text-blue-900 dark:text-blue-300 flex items-center justify-between">
                  <span>UPI Ref No / UTR / चेक संख्या दर्ज करें:</span>
                  <span className="text-[10px] text-blue-600 font-normal">(वेरिफिकेशन)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 431289012345 / CHQ-10992"
                  value={upiRefNumber}
                  onChange={(e) => setUpiRefNumber(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs font-mono font-bold rounded-lg border border-blue-300 dark:border-blue-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white uppercase focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Quick Action: Mark Paid */}
            <button
              type="button"
              onClick={handleConfirmPaid}
              className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{language === 'hi' ? '✅ पेमेंट प्राप्त हुआ (Mark Paid & Verify)' : 'Mark Paid & Verify'}</span>
            </button>
          </div>
        </div>

        {/* 2 & 3. Dynamic Editable Message Box & 1-Click WhatsApp Send (Requirements #2 & #3) */}
        <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <span>{language === 'hi' ? '💬 व्हाट्सएप संदेश (एडिट करें या सीधा भेजें):' : '💬 WhatsApp Message (Editable):'}</span>
            </label>
            <button
              type="button"
              onClick={handleCopyMessage}
              className="text-[11px] font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1"
            >
              {copiedMessage ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedMessage ? 'कॉपी हुआ' : 'मैसेज कॉपी करें'}</span>
            </button>
          </div>

          <textarea
            rows={5}
            value={editableMessage}
            onChange={(e) => setEditableMessage(e.target.value)}
            className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-500 font-sans"
            placeholder="Write message to send client on WhatsApp..."
          />
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            {language === 'hi' ? 'बंद करें (Close)' : 'Close'}
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleSendWhatsApp}
              className="flex-1 sm:flex-none px-5 py-2.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{language === 'hi' ? '📲 1-क्लिक व्हाट्सएप पर भेजें' : 'Send 1-Click WhatsApp'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
