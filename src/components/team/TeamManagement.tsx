/**
 * Team Management & Role-Based Access Control (RBAC)
 * Supports Main Admin (Ashish), Wife (Sheetal), Sister, Managers, Agents & Read-only
 * Custom Permissions Matrix + Workspace Isolation
 */

import React, { useState } from 'react';
import { User, UserRole, RolePermissions } from '../../types';
import { useApp } from '../../context/AppContext';
import { storage } from '../../services/storage';
import {
  UserCog,
  Plus,
  Shield,
  CheckCircle2,
  Lock,
  Unlock,
  Edit,
  Eye,
  Key,
  KeyRound,
  Users,
  AlertTriangle,
  MessageSquare,
  Share2,
  Copy,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { generateWhatsAppUrl } from '../../utils/whatsapp';
import { formatCurrency, formatDate } from '../../utils/date';


const ROLES: { id: UserRole; title: string; desc: string; badge: string }[] = [
  {
    id: 'main_super_admin',
    title: 'Main Super Admin (Owner)',
    desc: 'Unrestricted master control over modules, fields, workflows, finances, team, and deletions.',
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  },
  {
    id: 'admin',
    title: 'Administrator',
    desc: 'Full operational control over clients, policies, properties, module schemas, and reports.',
    badge: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300',
  },
  {
    id: 'team_manager',
    title: 'Team Manager',
    desc: 'Can oversee all team members, assign leads, view consolidated reports, without schema edit rights.',
    badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  },
  {
    id: 'agent',
    title: 'Field Agent',
    desc: 'Workspace isolated: Can only view and edit their own assigned clients, leads, and policies.',
    badge: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
  },
  {
    id: 'crm_executive',
    title: 'CRM Executive & Telecaller',
    desc: 'Full calling queue & customer follow-up access to call for all agents, without deletion or owner admin rights.',
    badge: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
  },
  {
    id: 'readonly',
    title: 'Read Only Auditor',
    desc: 'Read-only audit view for accounting, compliance reviews, and record checks.',
    badge: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
  },
];

export const TeamManagement: React.FC = () => {
  const { currentUser, language, t, showToast, triggerRefresh } = useApp();

  const [users, setUsers] = useState<User[]>(() => storage.getUsers());
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewingAgentPortfolio, setViewingAgentPortfolio] = useState<User | null>(null);

  // New User Form State
  const [formData, setFormData] = useState<Partial<User>>({
    name: '',
    email: '',
    phone: '',
    role: 'agent',
    relationship: 'Field Agent',
    pin: '1234',
    active: true,
  });

  const handleCopyAgentDetails = (u: User) => {
    const appBaseUrl = typeof window !== 'undefined' && window.location.origin
      ? window.location.origin
      : 'https://ais-pre-ck444risua2bw7pwfahpex-434697837812.asia-northeast1.run.app';
    const isCrm = u.role === 'crm_executive';
    const link = `${appBaseUrl}?${isCrm ? 'crm' : 'agent'}=${u.id}`;
    const textToCopy = isCrm
      ? `नमस्ते ${u.name} जी,\n\nआशीष शीतल ऑल-इन-वन मैनेजमेंट प्लेटफॉर्म पर आपका CRM टेलीकॉलर वर्कस्पेस तैयार है।\n\n🔗 लॉगिन लिंक: ${link}\n🔑 आपका सीक्रेट लॉगिन पिन: ${u.pin || '1234'}\n\nकृपया इस लिंक को Chrome ब्राउज़र में खोलें और अपना पिन दर्ज करके सभी एजेंटों के ग्राहकों की कॉलिंग लिस्ट, रिन्यूअल अलर्ट एवं फॉलो-अप देखें।\n\nसादर,\nआशीष Panwar (मालिक)`
      : `नमस्ते ${u.name} जी,\n\nआशीष शीतल ऑल-इन-वन मैनेजमेंट प्लेटफॉर्म पर आपका निजी वर्कस्पेस तैयार है।\n\n🔗 लॉगिन लिंक: ${link}\n🔑 आपका सीक्रेट 4-अंकीय पिन: ${u.pin || '1234'}\n\nकृपया इस लिंक को Chrome ब्राउज़र में खोलें और अपना पिन दर्ज करके कॉलिंग लिस्ट और ग्राहक देखें।\n\nसादर,\nआशीष Panwar (मालिक)`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
    }
    showToast(`${u.name} का लॉगिन लिंक एवं गुप्त पिन कॉपी हो गया!`, 'success');
  };

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'agent',
      relationship: 'Field Agent',
      pin: Math.floor(1000 + Math.random() * 9000).toString(),
      active: true,
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (u: User) => {
    setEditingUser(u);
    setFormData({ ...u, pin: u.pin || '1234' });
    setShowAddModal(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      showToast(language === 'hi' ? 'नाम भरना अनिवार्य है' : 'Name is required', 'warning');
      return;
    }

    const role = (formData.role as UserRole) || 'agent';
    const fallbackEmail = `${formData.name.trim().toLowerCase().replace(/[^a-z0-9]/g, '') || 'staff'}@agency.local`;
    const cleanEmail = formData.email?.trim() || fallbackEmail;

    // Default permissions based on role
    const permissions: RolePermissions = {
      canManageModules: role === 'main_super_admin' || role === 'admin',
      canManageTeam: role === 'main_super_admin',
      canViewAllData: role !== 'agent', // CRM Executive gets canViewAllData: true to view calling queue across agents
      canDeleteRecords: role === 'main_super_admin', // Protected: CRM cannot delete records
      canExportData: role !== 'readonly' && role !== 'crm_executive',
      canManageSettings: role === 'main_super_admin',
      canEditCustomer: role !== 'readonly',
      canViewAuditLogs: role === 'main_super_admin' || role === 'admin' || role === 'readonly',
    };

    if (editingUser) {
      const updated: User = {
        ...editingUser,
        name: formData.name.trim(),
        email: cleanEmail,
        phone: formData.phone || '',
        role,
        relationship: formData.relationship || '',
        pin: formData.pin?.trim() || editingUser.pin || '12345678',
        active: formData.active ?? true,
        permissions: editingUser.permissions || permissions,
      };
      storage.updateUser(updated, currentUser);
      showToast(`User account ${updated.name} updated`, 'success');
    } else {
      const newUser: User = {
        id: `user_${Date.now()}`,
        name: formData.name.trim(),
        email: cleanEmail,
        phone: formData.phone || '',
        role,
        relationship: formData.relationship || 'Team Member',
        pin: formData.pin?.trim() || Math.floor(10000000 + Math.random() * 90000000).toString(),
        active: true,
        permissions,
        lastLogin: new Date().toISOString(),
      };
      storage.addUser(newUser, currentUser);
      showToast(`New team account for ${newUser.name} created`, 'success');
    }


    setUsers(storage.getUsers());
    setShowAddModal(false);
    triggerRefresh();
  };

  const handleTogglePermission = (user: User, permKey: keyof RolePermissions) => {
    if (user.role === 'main_super_admin') {
      showToast('Owner permissions cannot be revoked', 'warning');
      return;
    }

    const currentPerms = user.permissions || {
      canManageModules: false,
      canManageTeam: false,
      canViewAllData: false,
      canDeleteRecords: false,
      canExportData: false,
      canManageSettings: false,
      canEditCustomer: true,
      canViewAuditLogs: false,
    };

    const updatedUser: User = {
      ...user,
      permissions: {
        ...currentPerms,
        [permKey]: !currentPerms[permKey],
      },
    };

    storage.updateUser(updatedUser, currentUser);
    setUsers(storage.getUsers());
    showToast(`Updated permission [${permKey}] for ${user.name}`, 'info');
    triggerRefresh();
  };

  const handleToggleActive = (user: User) => {
    if (user.role === 'main_super_admin') {
      showToast('Cannot deactivate main owner account', 'warning');
      return;
    }

    const updatedUser: User = {
      ...user,
      active: !user.active,
    };

    storage.updateUser(updatedUser, currentUser);
    setUsers(storage.getUsers());
    showToast(`User ${user.name} is now ${updatedUser.active ? 'Active' : 'Deactivated'}`, 'info');
    triggerRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <UserCog className="w-5 h-5 text-amber-500" />
            {t.teamManagement}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {language === 'hi'
              ? 'टीम सदस्य, भूमिकाएं, निजी कार्यक्षेत्र (Workspace Isolation) एवं अधिकार मैट्रिक्स'
              : 'Enterprise Team Accounts, Granular RBAC Permissions & Workspace Privacy'}
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Team Member
        </button>
      </div>

      {/* 3 Dedicated Live URLs Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-700/50 rounded-2xl p-4 sm:p-5 text-white shadow-xl space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              🌐
            </div>
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <span>{language === 'hi' ? 'आपके 3 अलग-अलग लाइव लिंक (3 Separate URLs)' : '3 Separate Role-Based Live URLs'}</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                  8-अंकीय लॉक सक्रिय
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                {language === 'hi'
                  ? 'तीनों लिंक पूरी तरह अलग हैं। इनमें केवल संबंधित रोल का खाता और 8-अंकीय पासवर्ड काम करेगा।'
                  : 'Isolated access portals. Each role has its dedicated URL and 8-digit PIN gatekeeper.'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Admin URL Box */}
          <div className="p-3 bg-slate-950/80 rounded-xl border border-amber-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-amber-400 flex items-center gap-1.5">
                <span>👑</span>
                <span>Admin URL (सिर्फ आपके लिए)</span>
              </span>
              <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono font-bold">
                PIN: 12345678
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono break-all line-clamp-1 bg-slate-900 p-1.5 rounded border border-slate-800">
              {`${typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'https://ais-pre-ck444risua2bw7pwfahpex-434697837812.asia-northeast1.run.app'}?portal=admin`}
            </p>
            <button
              onClick={() => {
                const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'https://ais-pre-ck444risua2bw7pwfahpex-434697837812.asia-northeast1.run.app';
                const link = `${origin}?portal=admin`;
                navigator.clipboard?.writeText(link);
                showToast('👑 Admin URL कॉपी हो गया!', 'success');
              }}
              className="w-full py-1.5 px-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'Admin लिंक कॉपी करें' : 'Copy Admin Link'}</span>
            </button>
          </div>

          {/* CRM URL Box */}
          <div className="p-3 bg-slate-950/80 rounded-xl border border-purple-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-purple-400 flex items-center gap-1.5">
                <span>📞</span>
                <span>CRM URL (ऑफिस कॉलिंग)</span>
              </span>
              <span className="text-[9px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded font-mono font-bold">
                PIN: 77777777
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono break-all line-clamp-1 bg-slate-900 p-1.5 rounded border border-slate-800">
              {`${typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'https://ais-pre-ck444risua2bw7pwfahpex-434697837812.asia-northeast1.run.app'}?portal=crm`}
            </p>
            <button
              onClick={() => {
                const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'https://ais-pre-ck444risua2bw7pwfahpex-434697837812.asia-northeast1.run.app';
                const link = `${origin}?portal=crm`;
                navigator.clipboard?.writeText(link);
                showToast('📞 CRM URL कॉपी हो गया!', 'success');
              }}
              className="w-full py-1.5 px-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer shadow-md shadow-purple-600/30"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'CRM लिंक कॉपी करें' : 'Copy CRM Link'}</span>
            </button>
          </div>

          {/* Agent URL Box */}
          <div className="p-3 bg-slate-950/80 rounded-xl border border-blue-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-blue-400 flex items-center gap-1.5">
                <span>🔒</span>
                <span>Agent URL (फील्ड स्टाफ)</span>
              </span>
              <span className="text-[9px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded font-mono font-bold">
                8-अंकीय PIN
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono break-all line-clamp-1 bg-slate-900 p-1.5 rounded border border-slate-800">
              {`${typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'https://ais-pre-ck444risua2bw7pwfahpex-434697837812.asia-northeast1.run.app'}?portal=agent`}
            </p>
            <button
              onClick={() => {
                const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'https://ais-pre-ck444risua2bw7pwfahpex-434697837812.asia-northeast1.run.app';
                const link = `${origin}?portal=agent`;
                navigator.clipboard?.writeText(link);
                showToast('🔒 Agent URL कॉपी हो गया!', 'success');
              }}
              className="w-full py-1.5 px-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer shadow-md shadow-blue-600/30"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'Agent लिंक कॉपी करें' : 'Copy Agent Link'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Role Descriptions Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {ROLES.slice(0, 3).map((r) => (
          <div
            key={r.id}
            className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1"
          >
            <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${r.badge}`}>
              {r.title}
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{r.desc}</p>
          </div>
        ))}
      </div>

      {/* Dedicated Agent Invite, Private Links & PIN Sharing Hub */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-800/40 rounded-3xl p-5 sm:p-6 shadow-xl text-white space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-900/60 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold tracking-tight text-white flex items-center gap-2">
                <span>{language === 'hi' ? 'एजेंट एवं CRM एक्सेस व लिंक शेयरिंग केंद्र' : 'Agent & CRM Access & Link Sharing Hub'}</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                  Workspace Isolated
                </span>
              </h3>
              <p className="text-xs text-indigo-200/80">
                {language === 'hi'
                  ? 'यहाँ से अपने फील्ड एजेंटों एवं CRM टेलीकॉलर को उनका सीधा लिंक और सीक्रेट 4 से 8 अंकीय कोड वॉट्सऐप पर भेजें'
                  : 'Distribute direct individual agent & CRM telecaller links and secret PINs safely via WhatsApp'}
              </p>
            </div>
          </div>

          <div className="text-[11px] bg-indigo-950/80 border border-indigo-700/50 px-3 py-1.5 rounded-xl text-indigo-300 flex items-center gap-1.5 self-start sm:self-auto">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{language === 'hi' ? 'मालिक का डेटा पूरी तरह लॉक रहेगा' : 'Owner Data Strictly Protected'}</span>
          </div>
        </div>

        {/* Individual Staff Cards Grid (Agents, Managers & CRM Telecaller) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {users
            .filter((u) => u.role === 'agent' || u.role === 'team_manager' || u.role === 'crm_executive')
            .map((agent) => {
              const isCrm = agent.role === 'crm_executive';
              const appBaseUrl = typeof window !== 'undefined' && window.location.origin
                ? window.location.origin
                : 'https://ais-pre-ck444risua2bw7pwfahpex-434697837812.asia-northeast1.run.app';
              const agentLink = `${appBaseUrl}?${isCrm ? 'crm' : 'agent'}=${agent.id}`;
              const waText = isCrm
                ? `नमस्ते ${agent.name} जी,\n\nआशीष शीतल ऑल-इन-वन प्लेटफॉर्म पर आपका CRM टेलीकॉलर वर्कस्पेस तैयार है।\n\n🔗 लॉगिन लिंक: ${agentLink}\n🔑 आपका सीक्रेट लॉगिन पिन: ${agent.pin || '1234'}\n\nकृपया इस लिंक को Chrome ब्राउज़र में खोलें और अपना पिन दर्ज करें। आप सभी एजेंटों के ग्राहकों की कॉलिंग लिस्ट, रिन्यूअल अलर्ट एवं फॉलो-अप देख व कॉल कर पाएंगे।\n\nसादर,\nआशीष Panwar`
                : `नमस्ते ${agent.name} जी,\n\nआशीष शीतल ऑल-इन-वन प्लेटफॉर्म पर आपका वर्कस्पेस तैयार है।\n\n🔗 लॉगिन लिंक: ${agentLink}\n🔑 आपका सीक्रेट लॉगिन पिन: ${agent.pin || '1234'}\n\nयह आपका निजी लिंक और कोड है, इसे Chrome ब्राउज़र में खोलकर पिन दर्ज करें। आप सिर्फ अपनी कॉलिंग लिस्ट और पॉलिसी देख पाएंगे।\n\nसादर,\nआशीष Panwar`;
              const waUrl = generateWhatsAppUrl(agent.phone || '', waText);

              return (
                <div
                  key={agent.id}
                  className={`border rounded-2xl p-4 flex flex-col justify-between gap-3 transition-all shadow-md ${
                    isCrm
                      ? 'bg-gradient-to-b from-purple-950/60 to-slate-900/90 border-purple-800/60 hover:border-purple-400/70'
                      : 'bg-slate-900/90 border-slate-800 hover:border-amber-500/50'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full text-white font-bold text-xs flex items-center justify-center ${
                          isCrm ? 'bg-purple-600' : 'bg-blue-600'
                        }`}>
                          {agent.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white leading-tight">{agent.name}</p>
                          <span className={`text-[10px] font-semibold ${isCrm ? 'text-purple-300' : 'text-amber-400'}`}>
                            {isCrm ? '📞 CRM Telecaller' : (agent.relationship || agent.role)}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded-full border border-slate-700">
                        {agent.phone || 'No Phone'}
                      </span>
                    </div>

                    {/* Secret PIN Box */}
                    <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-400 text-[11px] flex items-center gap-1 font-sans">
                        <Lock className={`w-3.5 h-3.5 ${isCrm ? 'text-purple-400' : 'text-amber-400'}`} />
                        <span>{language === 'hi' ? 'सीक्रेट पिन:' : 'Secret PIN:'}</span>
                      </span>
                      <span className={`font-extrabold px-2 py-0.5 rounded border text-sm ${
                        isCrm
                          ? 'text-purple-300 bg-purple-500/10 border-purple-500/20'
                          : 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                      }`}>
                        {agent.pin || '1234'}
                      </span>
                    </div>

                    <div className="text-[10px] text-slate-400 line-clamp-1 font-mono bg-slate-950/40 p-1.5 rounded border border-slate-800/80">
                      {agentLink}
                    </div>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleCopyAgentDetails(agent)}
                        className="py-1.5 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Copy className={`w-3.5 h-3.5 ${isCrm ? 'text-purple-400' : 'text-amber-400'}`} />
                        <span>{language === 'hi' ? 'लिंक कॉपी करें' : 'Copy Link'}</span>
                      </button>

                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="py-1.5 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>
                    </div>

                    <button
                      onClick={() => setViewingAgentPortfolio(agent)}
                      className={`w-full py-1.5 px-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                        isCrm
                          ? 'bg-purple-950/80 hover:bg-purple-900 border-purple-700/60 text-purple-200'
                          : 'bg-indigo-950/80 hover:bg-indigo-900 border-indigo-700/60 text-indigo-200'
                      }`}
                    >
                      <Eye className={`w-3.5 h-3.5 ${isCrm ? 'text-purple-400' : 'text-indigo-400'}`} />
                      <span>
                        {language === 'hi'
                          ? (isCrm ? '👁️ इस CRM का काम व रिकॉर्ड देखें' : '👁️ इस एजेंट का काम व रिकॉर्ड देखें')
                          : (isCrm ? 'View CRM Work & Records' : 'View Agent Work & Records')}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Team Members List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
            Active Accounts & Roles ({users.length})
          </h3>
          <span className="text-[11px] text-slate-500">
            Current Operator: <strong className="text-slate-800 dark:text-slate-200">{currentUser.name}</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">Member & Relationship</th>
                <th className="px-4 py-3">Assigned Role</th>
                <th className="px-4 py-3">Workspace Scope</th>
                <th className="px-4 py-3">Permissions Matrix</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {users.map((u) => {
                const roleObj = ROLES.find((r) => r.id === u.role) || ROLES[3];
                const canViewAll = u.permissions?.canViewAllData;

                return (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <span>{u.name}</span>
                          <span className="block text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                            {u.relationship}
                          </span>
                          <span className="block text-[10px] text-slate-400 font-mono">{u.email}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${roleObj.badge}`}>
                        {roleObj.title}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      {canViewAll ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                          <Unlock className="w-3.5 h-3.5" /> All Team Data
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold text-[11px]">
                          <Lock className="w-3.5 h-3.5" /> Private Workspace
                        </span>
                      )}
                    </td>

                    {/* Quick Permissions Switches */}
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                        <button
                          onClick={() => handleTogglePermission(u, 'canManageModules')}
                          className={`px-1.5 py-0.5 rounded font-bold transition-all ${
                            u.permissions?.canManageModules
                              ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                          }`}
                          title="Can create & modify dynamic business modules"
                        >
                          Modules
                        </button>

                        <button
                          onClick={() => handleTogglePermission(u, 'canDeleteRecords')}
                          className={`px-1.5 py-0.5 rounded font-bold transition-all ${
                            u.permissions?.canDeleteRecords
                              ? 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                          }`}
                          title="Can permanently delete records"
                        >
                          Delete
                        </button>

                        <button
                          onClick={() => handleTogglePermission(u, 'canExportData')}
                          className={`px-1.5 py-0.5 rounded font-bold transition-all ${
                            u.permissions?.canExportData
                              ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                          }`}
                          title="Can export CSV databases"
                        >
                          Export
                        </button>

                        <button
                          onClick={() => handleTogglePermission(u, 'canViewAllData')}
                          className={`px-1.5 py-0.5 rounded font-bold transition-all ${
                            u.permissions?.canViewAllData
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                          }`}
                          title="Can view all team records"
                        >
                          View All
                        </button>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase block w-fit ${
                            u.active
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {u.active ? 'Active' : 'Inactive'}
                        </span>
                        <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-amber-600 font-bold flex items-center gap-1 w-fit">
                          <KeyRound className="w-3 h-3" /> PIN: {u.pin || '1234'}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* WhatsApp Invite link */}
                        <a
                          href={generateWhatsAppUrl(
                            u.phone,
                            `नमस्ते ${u.name} जी,\n\nआशीष शीतल ऑल-इन-वन प्लेटफॉर्म पर आपका वर्कस्पेस तैयार है।\n\n🔗 लॉगिन लिंक: https://ais-pre-ck444risua2bw7pwfahpex-434697837812.asia-northeast1.run.app?agent=${u.id}\n🔑 आपका सीक्रेट लॉगिन पिन: ${u.pin || '1234'}\n\nयह आपका निजी लिंक और कोड है, इसे अपने फोन में खोलकर पिन दर्ज करें।`
                          )}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-600 dark:text-emerald-400 transition-colors"
                          title="Share WhatsApp Invite Link & PIN"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </a>

                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 dark:text-slate-300"
                          title="Edit"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        {u.role !== 'main_super_admin' && (
                          <button
                            onClick={() => handleToggleActive(u)}
                            className="px-2 py-1 text-[10px] font-bold rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-600"
                          >
                            {u.active ? 'Deactivate' : 'Activate'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              {editingUser ? `Edit Account: ${editingUser.name}` : 'Provision Team Member Account'}
            </h3>

            <form onSubmit={handleSaveUser} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {language === 'hi' ? 'ईमेल आईडी (Optional / ऐच्छिक)' : 'Email Address (Optional)'}
                </label>
                <input
                  type="email"
                  value={formData.email || ''}
                  placeholder="e.g. agent@example.com (खाली छोड़ सकते हैं)"
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Phone</label>
                <input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Role / Security Clearance
                </label>
                <select
                  value={formData.role || 'agent'}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  {ROLES.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Family / Organization Relationship
                </label>
                <input
                  type="text"
                  value={formData.relationship || ''}
                  onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                  placeholder="e.g. Sister, Senior Agent, Property Executive"
                  className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Secret Login PIN / Password (4 to 8 digits) <span className="text-red-500">*</span></span>
                  <span className="text-[10px] text-amber-500 font-bold">Confidential</span>
                </label>
                <input
                  type="text"
                  maxLength={8}
                  required
                  value={formData.pin || ''}
                  onChange={(e) => setFormData({ ...formData, pin: e.target.value })}
                  placeholder="4 से 8 अंकों का पासवर्ड (जैसे 5555 या 98765432)"
                  className="w-full mt-1 px-3 py-2 text-xs font-mono font-bold tracking-widest rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-amber-500"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  इस एजेंट के लिए 4 से 8 अंकों का गुप्त पासवर्ड। एजेंट इसे खुद भी बदल सकता है, और आप (मालिक) यहाँ से भी देख व बदल सकते हैं।
                </p>
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
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950"
                >
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Agent Work & Portfolio Master Supervisory Modal */}
      {viewingAgentPortfolio && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white border-b border-indigo-900/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black text-lg">
                  {viewingAgentPortfolio.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-white">
                      {viewingAgentPortfolio.name}
                    </h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${
                      viewingAgentPortfolio.role === 'crm_executive'
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                        : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                    }`}>
                      {viewingAgentPortfolio.role === 'crm_executive' ? 'CRM Telecaller' : viewingAgentPortfolio.role}
                    </span>
                  </div>
                  <p className="text-xs text-indigo-200">
                    {language === 'hi'
                      ? (viewingAgentPortfolio.role === 'crm_executive'
                          ? 'मालिक दृश्य: CRM ऑपरेटर का कॉलिंग कार्यक्षेत्र, एक्टिव कॉलिंग क्यू एवं सीक्रेट पासवर्ड'
                          : 'मालिक दृश्य: इस एजेंट का संपूर्ण कार्य, पॉलिसियां, कॉलिंग लिस्ट एवं पासवर्ड')
                      : 'Master Admin View: Full Portfolio, Policies, Customers & Activities'}
                  </p>
                </div>
              </div>

              {/* Master PIN Badge */}
              <div className="text-right bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-semibold">
                  {language === 'hi' ? 'सीक्रेट पासवर्ड / पिन:' : 'Active PIN:'}
                </span>
                <span className="font-mono font-black text-amber-400 text-sm tracking-wider">
                  {viewingAgentPortfolio.pin || '••••'}
                </span>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-6">
              {(() => {
                const isCrmUser = viewingAgentPortfolio.role === 'crm_executive';
                const agentPolicies = storage
                  .getPolicies()
                  .filter((p) => p.assignedTo === viewingAgentPortfolio.id);
                const agentCustomers = storage
                  .getCustomers()
                  .filter((c) => c.assignedTo === viewingAgentPortfolio.id);
                const agentQueue = isCrmUser
                  ? storage.getDailyWorkQueue()
                  : storage
                      .getDailyWorkQueue()
                      .filter((i) => i.assignedTo === viewingAgentPortfolio.id);
                const totalPremium = agentPolicies.reduce(
                  (sum, p) => sum + (p.premiumAmount || 0),
                  0
                );

                return (
                  <>
                    {/* Performance Metrics Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                        <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase">
                          {language === 'hi' ? 'कुल पॉलिसियां' : 'Policies Sold'}
                        </span>
                        <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                          {agentPolicies.length}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                          {language === 'hi' ? 'कुल प्रीमियम' : 'Total Premium'}
                        </span>
                        <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                          {formatCurrency(totalPremium)}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase">
                          {language === 'hi' ? 'ग्राहक' : 'Clients Managed'}
                        </span>
                        <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                          {agentCustomers.length}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                          {language === 'hi' ? 'कॉलिंग टास्क' : 'Calling Tasks'}
                        </span>
                        <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                          {agentQueue.length}
                        </p>
                      </div>
                    </div>

                    {/* Section 1: Policies Managed By This Agent */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                        <Shield className="w-4 h-4 text-amber-500" />
                        <span>
                          {language === 'hi'
                            ? `इस एजेंट द्वारा की गई पॉलिसियां (${agentPolicies.length})`
                            : `Policies Handled by ${viewingAgentPortfolio.name} (${agentPolicies.length})`}
                        </span>
                      </h4>

                      {agentPolicies.length === 0 ? (
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-400 text-center">
                          {language === 'hi' ? 'इस एजेंट के नाम पर कोई पॉलिसी दर्ज नहीं है।' : 'No policies assigned to this agent yet.'}
                        </div>
                      ) : (
                        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 text-[10px] uppercase font-bold">
                              <tr>
                                <th className="p-2.5">Policy & Insurer</th>
                                <th className="p-2.5">Client Name</th>
                                <th className="p-2.5">Premium</th>
                                <th className="p-2.5">Next Due</th>
                                <th className="p-2.5">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                              {agentPolicies.map((p) => (
                                <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                  <td className="p-2.5 font-bold text-slate-900 dark:text-white">
                                    <div>{p.planName}</div>
                                    <div className="text-[10px] text-slate-400 font-mono">#{p.policyNumber} • {p.insurerName}</div>
                                  </td>
                                  <td className="p-2.5 text-slate-700 dark:text-slate-300">
                                    {p.customerName}
                                  </td>
                                  <td className="p-2.5 font-extrabold text-amber-600 dark:text-amber-400">
                                    {formatCurrency(p.premiumAmount)}
                                  </td>
                                  <td className="p-2.5 text-slate-600 dark:text-slate-400">
                                    {formatDate(p.renewalDate)}
                                  </td>
                                  <td className="p-2.5">
                                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                      p.status === 'active'
                                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                    }`}>
                                      {p.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    {/* Section 2: Calling Queue for This Agent */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-blue-500" />
                        <span>
                          {language === 'hi'
                            ? `इस एजेंट के कॉलिंग टास्क (${agentQueue.length})`
                            : `Calling Tasks Assigned to ${viewingAgentPortfolio.name} (${agentQueue.length})`}
                        </span>
                      </h4>

                      {agentQueue.length === 0 ? (
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-400 text-center">
                          {language === 'hi' ? 'आज कोई लंबित कॉलिंग टास्क नहीं है।' : 'No pending calls for today.'}
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          {agentQueue.map((item) => (
                            <div
                              key={item.id}
                              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between text-xs"
                            >
                              <div>
                                <span className="font-bold text-slate-900 dark:text-white block">{item.title}</span>
                                <span className="text-[11px] text-slate-500">{item.clientName} • 📞 {item.phone}</span>
                              </div>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 uppercase">
                                {item.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                {language === 'hi' ? '🛡️ मालिक को सभी एजेंटों का पूरा एक्सेस है।' : 'Full owner visibility active.'}
              </span>
              <button
                onClick={() => setViewingAgentPortfolio(null)}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-amber-500 hover:text-slate-950 cursor-pointer transition-all"
              >
                {language === 'hi' ? 'बंद करें (Close)' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
