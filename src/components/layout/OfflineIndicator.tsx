/**
 * Offline Status Indicator & Connectivity Monitor
 */

import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [showReconnectedBanner, setShowReconnectedBanner] = useState(false);
  const { language } = useApp();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnectedBanner(true);
      setTimeout(() => {
        setShowReconnectedBanner(false);
      }, 3500);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOnline) {
    return (
      <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 text-amber-400 border border-amber-500/50 shadow-2xl text-xs font-bold animate-pulse backdrop-blur-md">
        <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
        <span>
          {language === 'hi'
            ? 'ऑफ़लाइन मोड: स्थानीय डेटा सुरक्षित है, आप बिना इंटरनेट भी काम कर सकते हैं।'
            : 'Offline Mode: Local database active. You can search, view and edit records.'}
        </span>
      </div>
    );
  }

  if (showReconnectedBanner) {
    return (
      <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-emerald-950 text-emerald-300 border border-emerald-600/50 shadow-2xl text-xs font-bold animate-in fade-in duration-300">
        <Wifi className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>
          {language === 'hi'
            ? 'इंटरनेट पुनः कनेक्ट हो गया! क्लाउड सिंक तैयार।'
            : 'Internet Connection Restored! Cloud Ready.'}
        </span>
      </div>
    );
  }

  return null;
};
