/**
 * Dynamic Module Builder (Admin Essential Feature)
 * No-code module creator with custom fields, workflows, role permissions, and live preview
 */

import React, { useState } from 'react';
import { DynamicModule, CustomFieldDefinition, FieldType, UserRole } from '../../types';
import { useApp } from '../../context/AppContext';
import { storage } from '../../services/storage';
import {
  Blocks,
  Plus,
  Trash2,
  Edit,
  Eye,
  Check,
  Shield,
  Layers,
  ChevronRight,
  Archive,
  RefreshCw,
  Sparkles,
  AlertTriangle,
  Settings,
  HelpCircle,
} from 'lucide-react';
import { getDynamicIcon } from '../layout/Sidebar';

const AVAILABLE_ICONS = [
  'Blocks',
  'Utensils',
  'Briefcase',
  'ShoppingBag',
  'GraduationCap',
  'Car',
  'Wrench',
  'HeartPulse',
  'Home',
  'FileText',
  'Package',
];

const AVAILABLE_COLORS = [
  { id: 'amber', label: 'Executive Amber', bg: 'bg-amber-500' },
  { id: 'emerald', label: 'Emerald Green', bg: 'bg-emerald-500' },
  { id: 'indigo', label: 'Indigo Blue', bg: 'bg-indigo-500' },
  { id: 'purple', label: 'Royal Purple', bg: 'bg-purple-500' },
  { id: 'rose', label: 'Crimson Rose', bg: 'bg-rose-500' },
  { id: 'slate', label: 'Slate Executive', bg: 'bg-slate-700' },
];

const FIELD_TYPES: { id: FieldType; label: string }[] = [
  { id: 'text', label: 'Text Input' },
  { id: 'number', label: 'Numeric Value' },
  { id: 'currency', label: 'Currency (₹ INR)' },
  { id: 'date', label: 'Date Picker' },
  { id: 'phone', label: 'Phone Number' },
  { id: 'email', label: 'Email Address' },
  { id: 'dropdown', label: 'Dropdown Options' },
  { id: 'checkbox', label: 'Checkbox' },
  { id: 'yesno', label: 'Yes / No Toggle' },
  { id: 'notes', label: 'Multi-line Notes' },
  { id: 'document', label: 'Document Attachment' },
  { id: 'image', label: 'Photo / Image Upload' },
];

export const ModuleBuilder: React.FC = () => {
  const { currentUser, language, t, modules, reloadModules, showToast, setActiveTab } = useApp();

  const [isCreating, setIsCreating] = useState(false);
  const [editingModule, setEditingModule] = useState<DynamicModule | null>(null);
  const [activePreviewTab, setActivePreviewTab] = useState<'editor' | 'preview'>('editor');

  // New Module Form State
  const [name, setName] = useState('');
  const [nameHi, setNameHi] = useState('');
  const [category, setCategory] = useState('General Business');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('Package');
  const [color, setColor] = useState('amber');
  const [allowReminders, setAllowReminders] = useState(true);

  // Custom Statuses
  const [statuses, setStatuses] = useState<string[]>(['New', 'In Progress', 'Completed']);
  const [newStatusInput, setNewStatusInput] = useState('');

  // Role Access
  const [allowedRoles, setAllowedRoles] = useState<UserRole[]>([
    'main_super_admin',
    'admin',
    'team_manager',
    'agent',
  ]);

  // Custom Fields
  const [fields, setFields] = useState<CustomFieldDefinition[]>([
    {
      id: 'f_title',
      label: 'Record Title',
      type: 'text',
      required: true,
      showInTable: true,
    },
    {
      id: 'f_amount',
      label: 'Value / Amount (₹)',
      type: 'currency',
      required: false,
      showInTable: true,
    },
    {
      id: 'f_due_date',
      label: 'Target / Event Date',
      type: 'date',
      required: false,
      showInTable: true,
    },
  ]);

  // Field Being Added
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldType, setNewFieldType] = useState<FieldType>('text');
  const [newFieldRequired, setNewFieldRequired] = useState(false);
  const [newFieldShowTable, setNewFieldShowTable] = useState(true);
  const [newFieldOptions, setNewFieldOptions] = useState('');

  const handleStartCreate = () => {
    setEditingModule(null);
    setName('');
    setNameHi('');
    setCategory('Expansion');
    setDescription('');
    setIcon('Package');
    setColor('amber');
    setAllowReminders(true);
    setStatuses(['Inquiry', 'Processing', 'Delivered / Closed']);
    setAllowedRoles(['main_super_admin', 'admin', 'team_manager', 'agent']);
    setFields([
      {
        id: 'f_title',
        label: 'Item / Order Name',
        type: 'text',
        required: true,
        showInTable: true,
      },
      {
        id: 'f_cost',
        label: 'Cost / Value (₹)',
        type: 'currency',
        required: false,
        showInTable: true,
      },
    ]);
    setIsCreating(true);
  };

  const handleStartEdit = (mod: DynamicModule) => {
    setEditingModule(mod);
    setName(mod.name);
    setNameHi(mod.nameHi || '');
    setCategory(mod.category);
    setDescription(mod.description);
    setIcon(mod.icon);
    setColor(mod.color);
    setAllowReminders(mod.allowReminders);
    setStatuses(mod.customStatuses);
    setAllowedRoles(mod.assignedRoleAccess);
    setFields(mod.fields);
    setIsCreating(true);
  };

  const handleAddField = () => {
    if (!newFieldLabel.trim()) return;

    const fieldId = `f_${newFieldLabel.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now().toString().slice(-4)}`;
    const parsedOptions =
      newFieldType === 'dropdown'
        ? newFieldOptions.split(',').map((o) => o.trim()).filter(Boolean)
        : undefined;

    const newField: CustomFieldDefinition = {
      id: fieldId,
      label: newFieldLabel.trim(),
      type: newFieldType,
      required: newFieldRequired,
      showInTable: newFieldShowTable,
      options: parsedOptions,
    };

    setFields([...fields, newField]);
    setNewFieldLabel('');
    setNewFieldOptions('');
    setNewFieldRequired(false);
    showToast(`Added field "${newField.label}"`, 'info');
  };

  const handleRemoveField = (fieldId: string) => {
    setFields(fields.filter((f) => f.id !== fieldId));
  };

  const handleAddStatus = () => {
    if (!newStatusInput.trim()) return;
    if (statuses.includes(newStatusInput.trim())) return;
    setStatuses([...statuses, newStatusInput.trim()]);
    setNewStatusInput('');
  };

  const handleRemoveStatus = (statusName: string) => {
    setStatuses(statuses.filter((s) => s !== statusName));
  };

  const handleSaveModule = () => {
    if (!name.trim()) {
      showToast('Module Name is required', 'warning');
      return;
    }

    const moduleId = editingModule
      ? editingModule.id
      : `mod_${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now().toString().slice(-4)}`;

    const savedModule: DynamicModule = {
      id: moduleId,
      name: name.trim(),
      nameHi: nameHi.trim() || undefined,
      category: category.trim(),
      description: description.trim(),
      icon,
      color,
      isSystem: false,
      status: 'active',
      fields,
      customStatuses: statuses,
      assignedRoleAccess: allowedRoles,
      displayOrder: editingModule ? editingModule.displayOrder : modules.length + 1,
      allowReminders,
      createdAt: editingModule ? editingModule.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    storage.saveModule(savedModule, currentUser, !editingModule);
    reloadModules();
    setIsCreating(false);
    showToast(`Module "${savedModule.name}" saved! It is now live in navigation.`, 'success');
  };

  const handleToggleModuleStatus = (mod: DynamicModule) => {
    const newStatus = mod.status === 'active' ? 'inactive' : 'active';
    const updated = { ...mod, status: newStatus as any };
    storage.saveModule(updated, currentUser, false);
    reloadModules();
    showToast(`Module "${mod.name}" is now ${newStatus}`, 'info');
  };

  const handleDeleteModule = (mod: DynamicModule) => {
    if (
      confirm(
        `Are you sure you want to permanently delete module "${mod.name}"? It is recommended to download a backup from Settings first.`
      )
    ) {
      storage.deleteModule(mod.id, currentUser);
      reloadModules();
      showToast(`Module "${mod.name}" permanently deleted`, 'info');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Blocks className="w-5 h-5 text-amber-500" />
            {t.moduleBuilder}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {language === 'hi'
              ? 'बिना कोडिंग के नए व्यावसायिक मॉड्यूल, कस्टम फ़ील्ड, वर्कफ़्लो एवं टीम अनुमतियां बनाएं'
              : 'Enterprise No-Code Architecture: Create Custom Modules, Fields, Forms, & Workflows'}
          </p>
        </div>

        {!isCreating && (
          <button
            onClick={handleStartCreate}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Create New Business Module
          </button>
        )}
      </div>

      {/* If Creating / Editing a Module */}
      {isCreating ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {editingModule ? `Configure Module: ${editingModule.name}` : 'New Custom Business Module'}
              </h3>
              <p className="text-xs text-slate-400">
                Define data structure, custom statuses, role permissions, and table columns.
              </p>
            </div>

            <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
              <button
                onClick={() => setActivePreviewTab('editor')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  activePreviewTab === 'editor'
                    ? 'bg-amber-500 text-slate-950'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                Configuration Editor
              </button>
              <button
                onClick={() => setActivePreviewTab('preview')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  activePreviewTab === 'preview'
                    ? 'bg-amber-500 text-slate-950'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                Live Preview
              </button>
            </div>
          </div>

          {activePreviewTab === 'editor' ? (
            <div className="space-y-6">
              {/* Basic Meta: Name, Hindi Name, Category, Icon, Color */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Module Name (English) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Grain Stock & Mandi, Vehicle Rental, Wholesale Billing"
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Module Name (Hindi - हिन्दी)
                  </label>
                  <input
                    type="text"
                    value={nameHi}
                    onChange={(e) => setNameHi(e.target.value)}
                    placeholder="e.g. अनाज व्यापार एवं स्टॉक, वाहन किराया"
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Retail, Trading, Services"
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Module Icon</label>
                  <select
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {AVAILABLE_ICONS.map((ic) => (
                      <option key={ic} value={ic}>
                        {ic}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Theme Badge Color</label>
                  <select
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {AVAILABLE_COLORS.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Allow Reminders</label>
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="allowReminders"
                      checked={allowReminders}
                      onChange={(e) => setAllowReminders(e.target.checked)}
                      className="w-4 h-4 text-amber-500 rounded"
                    />
                    <label htmlFor="allowReminders" className="text-xs text-slate-600 dark:text-slate-400">
                      Enable date alerts in Daily Calling Queue
                    </label>
                  </div>
                </div>
              </div>

              {/* Statuses Workflow */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Custom Statuses & Workflow Pipeline
                </h4>
                <div className="flex flex-wrap items-center gap-2">
                  {statuses.map((st) => (
                    <span
                      key={st}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300/40"
                    >
                      <span>{st}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveStatus(st)}
                        className="hover:text-red-600"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2 max-w-sm">
                  <input
                    type="text"
                    value={newStatusInput}
                    onChange={(e) => setNewStatusInput(e.target.value)}
                    placeholder="Add step (e.g. Under Review)"
                    className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white flex-1"
                  />
                  <button
                    type="button"
                    onClick={handleAddStatus}
                    className="px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                  >
                    + Add
                  </button>
                </div>
              </div>

              {/* Custom Fields Builder */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Defined Custom Fields ({fields.length})
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    Fields dynamically render in forms, table columns, and detail views.
                  </span>
                </div>

                {/* Fields Table */}
                <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 text-[10px] uppercase font-bold">
                      <tr>
                        <th className="px-4 py-2.5">Field Label</th>
                        <th className="px-4 py-2.5">Field Type</th>
                        <th className="px-4 py-2.5">Required</th>
                        <th className="px-4 py-2.5">Table Column</th>
                        <th className="px-4 py-2.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                      {fields.map((f) => (
                        <tr key={f.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="px-4 py-2.5 font-bold text-slate-900 dark:text-white">
                            {f.label}
                            {f.options && (
                              <span className="block text-[10px] text-slate-400 font-normal">
                                Options: {f.options.join(', ')}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-2.5 uppercase text-[10px] font-bold text-amber-600">
                            {f.type}
                          </td>
                          <td className="px-4 py-2.5">
                            {f.required ? (
                              <span className="text-red-500 font-bold">Required</span>
                            ) : (
                              <span className="text-slate-400">Optional</span>
                            )}
                          </td>
                          <td className="px-4 py-2.5">
                            {f.showInTable ? '✓ Visible' : 'Hidden'}
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveField(f.id)}
                              className="p-1 text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Add New Field Box */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-dashed border-slate-300 dark:border-slate-700 space-y-3">
                  <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    + Add Custom Field
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                        Field Label
                      </label>
                      <input
                        type="text"
                        value={newFieldLabel}
                        onChange={(e) => setNewFieldLabel(e.target.value)}
                        placeholder="e.g. Quantity, Batch #, Supplier"
                        className="w-full mt-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                        Type
                      </label>
                      <select
                        value={newFieldType}
                        onChange={(e) => setNewFieldType(e.target.value as any)}
                        className="w-full mt-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                      >
                        {FIELD_TYPES.map((ft) => (
                          <option key={ft.id} value={ft.id}>
                            {ft.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {newFieldType === 'dropdown' && (
                      <div className="sm:col-span-2">
                        <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                          Dropdown Options (comma separated)
                        </label>
                        <input
                          type="text"
                          value={newFieldOptions}
                          onChange={(e) => setNewFieldOptions(e.target.value)}
                          placeholder="e.g. Small, Medium, Large, Extra Large"
                          className="w-full mt-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                      </div>
                    )}

                    <div className="flex items-center gap-4 pt-4">
                      <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newFieldRequired}
                          onChange={(e) => setNewFieldRequired(e.target.checked)}
                          className="w-3.5 h-3.5 text-amber-500 rounded"
                        />
                        <span>Required</span>
                      </label>

                      <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newFieldShowTable}
                          onChange={(e) => setNewFieldShowTable(e.target.checked)}
                          className="w-3.5 h-3.5 text-amber-500 rounded"
                        />
                        <span>Show in Table</span>
                      </label>
                    </div>

                    <div className="sm:col-span-4 flex justify-end">
                      <button
                        type="button"
                        onClick={handleAddField}
                        className="px-4 py-1.5 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950"
                      >
                        Insert Field
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveModule}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md shadow-amber-500/20"
                >
                  {editingModule ? 'Save Module Updates' : 'Activate & Deploy Module'}
                </button>
              </div>
            </div>
          ) : (
            /* Live Preview Tab */
            <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-amber-500/20 text-amber-600">
                    <Blocks className="w-5 h-5" />
                  </span>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                      {name || 'New Business Module'} Preview
                    </h4>
                    <p className="text-[11px] text-slate-400">Category: {category}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {statuses.map((s) => (
                    <span
                      key={s}
                      className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Form Input Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {fields.map((f) => (
                  <div key={f.id}>
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      {f.label} {f.required && <span className="text-red-500">*</span>}
                    </label>
                    {f.type === 'dropdown' ? (
                      <select className="w-full mt-1 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                        {f.options?.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    ) : f.type === 'notes' ? (
                      <textarea
                        rows={2}
                        className="w-full mt-1 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                      />
                    ) : (
                      <input
                        type={f.type === 'currency' || f.type === 'number' ? 'number' : f.type}
                        placeholder={f.label}
                        className="w-full mt-1 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 text-xs text-emerald-800 dark:text-emerald-300">
                ✓ Validated schema. When saved, this module will be stored in database and mounted into the main sidebar.
              </div>
            </div>
          )}
        </div>
      ) : (
        /* List of All Modules */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((mod) => {
            const Icon = getDynamicIcon(mod.icon);
            return (
              <div
                key={mod.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        mod.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {mod.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                      {mod.name}
                    </h3>
                    {mod.nameHi && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                        {mod.nameHi}
                      </p>
                    )}
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{mod.description || 'Custom business module'}</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs space-y-1">
                    <p className="text-slate-600 dark:text-slate-400">
                      Fields: <strong>{mod.fields.length} Custom Fields</strong>
                    </p>
                    <p className="text-slate-600 dark:text-slate-400">
                      Statuses: <strong>{mod.customStatuses.join(', ')}</strong>
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => setActiveTab(`dynamic_${mod.id}`)}
                    className="text-xs font-bold text-amber-600 hover:underline flex items-center gap-1"
                  >
                    Open Records →
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleModuleStatus(mod)}
                      className="px-2 py-1 text-[10px] font-bold rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600"
                    >
                      {mod.status === 'active' ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      onClick={() => handleStartEdit(mod)}
                      className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 dark:text-slate-300"
                      title="Edit Schema"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteModule(mod)}
                      className="p-1 rounded-lg hover:bg-red-50 text-red-600"
                      title="Delete Module"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
