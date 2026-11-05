/**
 * Universal Dynamic Module View
 * Automatically renders any module created by the Module Builder with custom fields, statuses, CRUD, and exports
 */

import React, { useState } from 'react';
import { DynamicModule, DynamicRecord, CustomFieldDefinition } from '../../types';
import { useApp } from '../../context/AppContext';
import { storage } from '../../services/storage';
import {
  Plus,
  Search,
  Filter,
  Download,
  Trash2,
  Edit,
  Layers,
  ChevronRight,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { getDynamicIcon } from '../layout/Sidebar';
import { formatCurrency, formatDate } from '../../utils/date';

interface DynamicModuleViewProps {
  module: DynamicModule;
}

export const DynamicModuleView: React.FC<DynamicModuleViewProps> = ({ module }) => {
  const { currentUser, language, t, showToast, triggerRefresh } = useApp();

  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<DynamicRecord | null>(null);

  // Form record state (title + status + field values)
  const [recordTitle, setRecordTitle] = useState('');
  const [recordStatus, setRecordStatus] = useState(module.customStatuses[0] || 'New');
  const [fieldValues, setFieldValues] = useState<Record<string, any>>({});

  const records = storage.getDynamicRecords(module.id);
  const IconComp = getDynamicIcon(module.icon);

  const filteredRecords = records.filter((r) => {
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchSearch =
      r.title.toLowerCase().includes(q) ||
      Object.values(r.data || {}).some((val) => String(val).toLowerCase().includes(q));

    return matchStatus && matchSearch;
  });

  const handleOpenAdd = () => {
    setEditingRecord(null);
    setRecordTitle('');
    setRecordStatus(module.customStatuses[0] || 'New');
    const initialVals: Record<string, any> = {};
    module.fields.forEach((f) => {
      initialVals[f.id] = f.defaultValue || '';
    });
    setFieldValues(initialVals);
    setShowAddModal(true);
  };

  const handleOpenEdit = (rec: DynamicRecord) => {
    setEditingRecord(rec);
    setRecordTitle(rec.title);
    setRecordStatus(rec.status);
    setFieldValues(rec.data || {});
    setShowAddModal(true);
  };

  const handleSaveRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recordTitle.trim()) {
      showToast('Title is required', 'warning');
      return;
    }

    if (editingRecord) {
      const updated: DynamicRecord = {
        ...editingRecord,
        title: recordTitle.trim(),
        status: recordStatus,
        data: fieldValues,
        updatedAt: new Date().toISOString(),
      };
      storage.saveDynamicRecord(updated, currentUser, false);
      showToast(`Record "${updated.title}" updated`, 'success');
    } else {
      const newRec: DynamicRecord = {
        id: `rec_${Date.now()}`,
        moduleId: module.id,
        title: recordTitle.trim(),
        status: recordStatus,
        data: fieldValues,
        assignedTo: currentUser.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: currentUser.name,
      };
      storage.saveDynamicRecord(newRec, currentUser, true);
      showToast(`Record "${newRec.title}" saved`, 'success');
    }

    setShowAddModal(false);
    triggerRefresh();
  };

  const handleDeleteRecord = (recId: string, title: string) => {
    if (confirm(`Permanently delete record "${title}"?`)) {
      storage.deleteDynamicRecord(recId, currentUser);
      showToast(`Record "${title}" deleted`, 'info');
      triggerRefresh();
    }
  };

  const handleExportCSV = () => {
    const tableFields = module.fields.filter((f) => f.showInTable);
    const headers = ['Title', 'Status', ...tableFields.map((f) => f.label), 'Created At'];

    const rows = filteredRecords.map((r) => [
      `"${r.title}"`,
      `"${r.status}"`,
      ...tableFields.map((f) => `"${r.data?.[f.id] ?? ''}"`),
      r.createdAt,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${module.id}_records_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Module records exported to CSV', 'success');
  };

  const visibleFields = module.fields.filter((f) => f.showInTable);

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <IconComp className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                {language === 'hi' && module.nameHi ? module.nameHi : module.name}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {module.description || 'Custom Module'} • {records.length} records in database
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center gap-1.5 hover:bg-slate-50 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            {t.export}
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Entry
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search records..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none"
          >
            <option value="all">All Statuses ({records.length})</option>
            {module.customStatuses.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Dynamic Records Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">Title / Subject</th>
                <th className="px-4 py-3">Status</th>
                {visibleFields.map((f) => (
                  <th key={f.id} className="px-4 py-3">
                    {f.label}
                  </th>
                ))}
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td
                    colSpan={visibleFields.length + 4}
                    className="px-4 py-8 text-center text-slate-400"
                  >
                    No records entered in {module.name} yet. Click "Add Entry" to create the first record.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                      {rec.title}
                    </td>

                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                        {rec.status}
                      </span>
                    </td>

                    {/* Render each dynamic visible field */}
                    {visibleFields.map((f) => {
                      const val = rec.data?.[f.id];
                      return (
                        <td key={f.id} className="px-4 py-3">
                          {f.type === 'currency' ? (
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {formatCurrency(Number(val) || 0)}
                            </span>
                          ) : f.type === 'date' ? (
                            formatDate(val)
                          ) : (
                            String(val ?? '—')
                          )}
                        </td>
                      );
                    })}

                    <td className="px-4 py-3 text-slate-500">{formatDate(rec.createdAt)}</td>

                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(rec)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 dark:text-slate-300"
                          title="Edit"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteRecord(rec.id, rec.title)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Record Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh] space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              {editingRecord ? `Edit Entry: ${editingRecord.title}` : `New ${module.name} Entry`}
            </h3>

            <form onSubmit={handleSaveRecord} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Title / Name / Reference <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={recordTitle}
                  onChange={(e) => setRecordTitle(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  placeholder="Record summary title"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Workflow Status
                </label>
                <select
                  value={recordStatus}
                  onChange={(e) => setRecordStatus(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  {module.customStatuses.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              {/* Render dynamic inputs for all custom fields defined in module */}
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                {module.fields.map((f) => (
                  <div key={f.id}>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {f.label} {f.required && <span className="text-red-500">*</span>}
                    </label>

                    {f.type === 'dropdown' ? (
                      <select
                        value={fieldValues[f.id] || ''}
                        onChange={(e) =>
                          setFieldValues({ ...fieldValues, [f.id]: e.target.value })
                        }
                        required={f.required}
                        className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                      >
                        <option value="">Select an option...</option>
                        {f.options?.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    ) : f.type === 'notes' ? (
                      <textarea
                        rows={3}
                        value={fieldValues[f.id] || ''}
                        onChange={(e) =>
                          setFieldValues({ ...fieldValues, [f.id]: e.target.value })
                        }
                        required={f.required}
                        className="w-full mt-1 p-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    ) : f.type === 'yesno' ? (
                      <select
                        value={fieldValues[f.id] ? 'true' : 'false'}
                        onChange={(e) =>
                          setFieldValues({ ...fieldValues, [f.id]: e.target.value === 'true' })
                        }
                        className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                      >
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    ) : (
                      <input
                        type={f.type === 'currency' || f.type === 'number' ? 'number' : f.type}
                        value={fieldValues[f.id] || ''}
                        onChange={(e) =>
                          setFieldValues({ ...fieldValues, [f.id]: e.target.value })
                        }
                        required={f.required}
                        className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                        placeholder={f.label}
                      />
                    )}
                  </div>
                ))}
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
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
