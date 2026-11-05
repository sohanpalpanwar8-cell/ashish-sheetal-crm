/**
 * Property Management Module
 * Residential Plots, Flats, Houses, Shops, Commercial, and Agricultural Land
 * Supports Listings (Buy/Sell/Rent), Client Leads, Site Visits, and Deals Pipeline
 */

import React, { useState } from 'react';
import { PropertyListing, PropertyLead, PropertyType, PropertyDealType, SiteVisit } from '../../types';
import { useApp } from '../../context/AppContext';
import { storage } from '../../services/storage';
import {
  Building2,
  Plus,
  Search,
  Filter,
  Download,
  Trash2,
  Edit,
  Phone,
  MessageSquare,
  Home,
  MapPin,
  Calendar,
  Layers,
  ChevronRight,
  Sparkles,
  CheckCircle,
  Eye,
  Share2,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/date';
import { generateWhatsAppUrl, getPropertyShareMessage } from '../../utils/whatsapp';

export const PropertyModule: React.FC = () => {
  const { currentUser, language, t, showToast, triggerRefresh } = useApp();

  const [activeTab, setActiveTab] = useState<'listings' | 'leads' | 'site_visits'>('listings');
  const [selectedPropertyType, setSelectedPropertyType] = useState<string>('all');
  const [dealTypeFilter, setDealTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showAddPropertyModal, setShowAddPropertyModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState<PropertyListing | null>(null);
  const [viewingProperty, setViewingProperty] = useState<PropertyListing | null>(null);

  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [showAddVisitModal, setShowAddVisitModal] = useState(false);
  const [deleteConfirmProperty, setDeleteConfirmProperty] = useState<PropertyListing | null>(null);
  const [deleteConfirmLead, setDeleteConfirmLead] = useState<PropertyLead | null>(null);

  const canDelete = currentUser.role === 'main_super_admin' || currentUser.role === 'admin' || currentUser.permissions?.canDeleteRecords;

  // Form State for Property Listing
  const [propertyFormData, setPropertyFormData] = useState<Partial<PropertyListing>>({
    title: '',
    propertyType: 'residential_plot',
    dealType: 'sell',
    location: '',
    city: 'Karnal',
    fullAddress: '',
    areaSize: 200,
    areaUnit: 'gaj',
    askingPrice: 5000000,
    minPrice: 4800000,
    ownerName: '',
    ownerPhone: '',
    status: 'available',
    commissionExpected: 100000,
    assignedTo: currentUser.id,
  });

  // Form State for Property Lead
  const [leadFormData, setLeadFormData] = useState<Partial<PropertyLead>>({
    clientName: '',
    phone: '',
    leadType: 'buyer',
    preferredType: 'residential_plot',
    dealType: 'buy',
    preferredLocation: 'Omaxe City / Sector 32',
    budgetMin: 4000000,
    budgetMax: 7000000,
    areaRequirement: '200 to 250 Gaj',
    status: 'new',
    assignedTo: currentUser.id,
  });

  // Form State for Site Visit
  const [visitFormData, setVisitFormData] = useState<Partial<SiteVisit>>({
    propertyId: '',
    propertyTitle: '',
    clientName: '',
    phone: '',
    scheduledAt: `${new Date().toISOString().split('T')[0]}T16:00:00`,
    status: 'scheduled',
    conductedBy: currentUser.name,
  });

  const properties = storage.getProperties(currentUser);
  const propertyLeads = storage.getPropertyLeads(currentUser);
  const allUsers = storage.getUsers();

  // Filter listings
  const filteredProperties = properties.filter((p) => {
    const matchType = selectedPropertyType === 'all' || p.propertyType === selectedPropertyType;
    const matchDeal = dealTypeFilter === 'all' || p.dealType === dealTypeFilter;
    const q = searchQuery.toLowerCase();
    const matchSearch =
      p.title.toLowerCase().includes(q) ||
      p.location.toLowerCase().includes(q) ||
      p.ownerName.toLowerCase().includes(q) ||
      p.ownerPhone.includes(q);

    return matchType && matchDeal && matchSearch;
  });

  // Extract all site visits
  const allSiteVisits: (SiteVisit & { leadClient?: string })[] = [];
  propertyLeads.forEach((pl) => {
    if (pl.siteVisits) {
      pl.siteVisits.forEach((sv) => {
        allSiteVisits.push({ ...sv, leadClient: pl.clientName });
      });
    }
  });

  const handleOpenAddProperty = () => {
    setEditingProperty(null);
    setPropertyFormData({
      title: '',
      propertyType: 'residential_plot',
      dealType: 'sell',
      location: '',
      city: 'Karnal',
      fullAddress: '',
      areaSize: 200,
      areaUnit: 'gaj',
      askingPrice: 5000000,
      minPrice: 4800000,
      ownerName: '',
      ownerPhone: '',
      status: 'available',
      commissionExpected: 100000,
      assignedTo: currentUser.id,
    });
    setShowAddPropertyModal(true);
  };

  const handleSaveProperty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!propertyFormData.title?.trim() || !propertyFormData.ownerName?.trim()) {
      showToast('Title and Owner Name are required', 'warning');
      return;
    }

    if (editingProperty) {
      const updated: PropertyListing = {
        ...editingProperty,
        ...propertyFormData,
        updatedAt: new Date().toISOString(),
      } as PropertyListing;
      storage.saveProperty(updated, currentUser, false);
      showToast(`Property "${updated.title}" updated`, 'success');
    } else {
      const newProp: PropertyListing = {
        id: `prop_${Date.now()}`,
        title: propertyFormData.title.trim(),
        propertyType: (propertyFormData.propertyType as PropertyType) || 'residential_plot',
        dealType: (propertyFormData.dealType as PropertyDealType) || 'sell',
        location: propertyFormData.location || '',
        city: propertyFormData.city || 'Karnal',
        fullAddress: propertyFormData.fullAddress || '',
        areaSize: Number(propertyFormData.areaSize) || 0,
        areaUnit: (propertyFormData.areaUnit as any) || 'gaj',
        askingPrice: Number(propertyFormData.askingPrice) || 0,
        minPrice: Number(propertyFormData.minPrice) || 0,
        ownerName: propertyFormData.ownerName.trim(),
        ownerPhone: propertyFormData.ownerPhone || '',
        status: (propertyFormData.status as any) || 'available',
        commissionExpected: Number(propertyFormData.commissionExpected) || 0,
        assignedTo: propertyFormData.assignedTo || currentUser.id,
        notes: [],
        documents: [],
        archived: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      storage.saveProperty(newProp, currentUser, true);
      showToast(`Property "${newProp.title}" listed successfully`, 'success');
    }

    setShowAddPropertyModal(false);
    triggerRefresh();
  };

  const handleSaveLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadFormData.clientName?.trim() || !leadFormData.phone?.trim()) {
      showToast('Client Name and Phone are required', 'warning');
      return;
    }

    const newLead: PropertyLead = {
      id: `pled_${Date.now()}`,
      clientName: leadFormData.clientName.trim(),
      phone: leadFormData.phone.trim(),
      leadType: (leadFormData.leadType as any) || 'buyer',
      preferredType: (leadFormData.preferredType as PropertyType) || 'residential_plot',
      dealType: (leadFormData.dealType as PropertyDealType) || 'buy',
      preferredLocation: leadFormData.preferredLocation || '',
      budgetMin: Number(leadFormData.budgetMin) || 0,
      budgetMax: Number(leadFormData.budgetMax) || 0,
      areaRequirement: leadFormData.areaRequirement,
      status: (leadFormData.status as any) || 'new',
      assignedTo: leadFormData.assignedTo || currentUser.id,
      notes: [],
      siteVisits: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    storage.savePropertyLead(newLead, currentUser, true);
    setShowAddLeadModal(false);
    showToast(`Property lead for ${newLead.clientName} created`, 'success');
    triggerRefresh();
  };

  const handleSaveVisit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitFormData.clientName?.trim() || !visitFormData.phone?.trim()) {
      showToast('Client Name and Phone are required', 'warning');
      return;
    }

    // Find lead or create lead visit
    const leads = storage.getPropertyLeads();
    let lead = leads.find((l) => l.clientName.toLowerCase() === visitFormData.clientName?.toLowerCase());

    const newVisit: SiteVisit = {
      id: `sv_${Date.now()}`,
      propertyId: visitFormData.propertyId,
      propertyTitle: visitFormData.propertyTitle,
      clientName: visitFormData.clientName.trim(),
      phone: visitFormData.phone.trim(),
      scheduledAt: visitFormData.scheduledAt || new Date().toISOString(),
      status: 'scheduled',
      conductedBy: visitFormData.conductedBy || currentUser.name,
    };

    if (lead) {
      lead.siteVisits = [newVisit, ...(lead.siteVisits || [])];
      storage.savePropertyLead(lead, currentUser, false);
    } else {
      // Create new lead with this visit
      const createdLead: PropertyLead = {
        id: `pled_${Date.now()}`,
        clientName: visitFormData.clientName.trim(),
        phone: visitFormData.phone.trim(),
        leadType: 'buyer',
        preferredType: 'residential_plot',
        dealType: 'buy',
        preferredLocation: 'Karnal',
        budgetMin: 5000000,
        budgetMax: 8000000,
        status: 'site_visit_scheduled',
        assignedTo: currentUser.id,
        siteVisits: [newVisit],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      storage.savePropertyLead(createdLead, currentUser, true);
    }

    setShowAddVisitModal(false);
    showToast('Site visit scheduled and added to today\'s calling queue', 'success');
    triggerRefresh();
  };

  const handleConfirmDeleteProperty = () => {
    if (!deleteConfirmProperty) return;
    storage.deleteProperty(deleteConfirmProperty.id, currentUser);
    showToast(language === 'hi' ? `प्रॉपर्टी "${deleteConfirmProperty.title}" हटा दी गई` : `Property "${deleteConfirmProperty.title}" deleted`, 'info');
    if (viewingProperty?.id === deleteConfirmProperty.id) {
      setViewingProperty(null);
    }
    setDeleteConfirmProperty(null);
    triggerRefresh();
  };

  const handleConfirmDeleteLead = () => {
    if (!deleteConfirmLead) return;
    storage.deletePropertyLead(deleteConfirmLead.id, currentUser);
    showToast(language === 'hi' ? `प्रॉपर्टी ग्राहक "${deleteConfirmLead.clientName}" हटा दिया गया` : `Property lead for "${deleteConfirmLead.clientName}" deleted`, 'info');
    setDeleteConfirmLead(null);
    triggerRefresh();
  };

  return (
    <div className="space-y-5">
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-500" />
            {t.properties}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {language === 'hi'
              ? 'प्लॉट, मकान, फ्लैट, दुकानें, कृषि भूमि, साइट विजिट एवं डील प्रबंधन'
              : 'Plots, Houses, Apartments, Commercial Shops, Farmland, Deals & Site Visits'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'listings' && (
            <button
              onClick={handleOpenAddProperty}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              {language === 'hi' ? 'नई प्रॉपर्टी जोड़ें' : 'Add Property'}
            </button>
          )}

          {activeTab === 'leads' && (
            <button
              onClick={() => setShowAddLeadModal(true)}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              {language === 'hi' ? 'नया प्रॉपर्टी ग्राहक' : 'Add Property Lead'}
            </button>
          )}

          {activeTab === 'site_visits' && (
            <button
              onClick={() => setShowAddVisitModal(true)}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              {language === 'hi' ? 'साइट विजिट तय करें' : 'Schedule Site Visit'}
            </button>
          )}
        </div>
      </div>

      {/* Main Tabs: Property Listings, Buyer/Seller Leads, Site Visits */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        {[
          { id: 'listings', label: t.allProperties, count: properties.length },
          { id: 'leads', label: t.propertyLeads, count: propertyLeads.length },
          { id: 'site_visits', label: t.siteVisits, count: allSiteVisits.length },
        ].map((tab) => {
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                isSelected
                  ? 'bg-slate-900 text-amber-400 dark:bg-amber-500 dark:text-slate-950 shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isSelected ? 'bg-amber-400/20 text-amber-300 dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Listings */}
      {activeTab === 'listings' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by title, location, colony, owner..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedPropertyType}
                onChange={(e) => setSelectedPropertyType(e.target.value)}
                className="text-xs bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none"
              >
                <option value="all">All Types</option>
                <option value="residential_plot">Plots / Land</option>
                <option value="flat">Flats / Apartments</option>
                <option value="house">Houses / Villas</option>
                <option value="shop">Commercial Shops</option>
                <option value="commercial">Commercial Space</option>
                <option value="agricultural">Agricultural Land</option>
              </select>

              <select
                value={dealTypeFilter}
                onChange={(e) => setDealTypeFilter(e.target.value)}
                className="text-xs bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none uppercase font-bold"
              >
                <option value="all">Buy / Sell / Rent</option>
                <option value="sell">For Sale</option>
                <option value="rent">For Rent</option>
                <option value="buy">Looking to Buy</option>
              </select>
            </div>
          </div>

          {/* Property Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProperties.length === 0 ? (
              <div className="col-span-full p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400">
                No property listings match your filters.
              </div>
            ) : (
              filteredProperties.map((prop) => {
                const waUrl = generateWhatsAppUrl(
                  prop.ownerPhone,
                  getPropertyShareMessage(
                    'Client',
                    prop.title,
                    prop.propertyType,
                    prop.location,
                    prop.askingPrice,
                    `${prop.areaSize} ${prop.areaUnit}`,
                    language
                  )
                );

                return (
                  <div
                    key={prop.id}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group"
                  >
                    <div className="p-5 space-y-3">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-extrabold uppercase ${
                            prop.dealType === 'sell'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          }`}
                        >
                          {prop.dealType === 'sell' ? 'FOR SALE' : 'FOR RENT'}
                        </span>

                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            prop.status === 'available'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                          }`}
                        >
                          {prop.status.replace('_', ' ')}
                        </span>
                      </div>

                      {/* Title & Location */}
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-amber-600 transition-colors">
                          {prop.title}
                        </h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{prop.location}, {prop.city}</span>
                        </p>
                      </div>

                      {/* Area & Price */}
                      <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-semibold uppercase">Area Size</span>
                          <span className="font-extrabold text-slate-800 dark:text-slate-200">
                            {prop.areaSize} {prop.areaUnit.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block font-semibold uppercase">Asking Price</span>
                          <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(prop.askingPrice)}
                          </span>
                        </div>
                      </div>

                      {/* Owner details */}
                      <div className="text-[11px] text-slate-500 pt-1">
                        <span>Owner: <strong className="text-slate-700 dark:text-slate-300">{prop.ownerName}</strong></span>
                        <span className="block font-mono">{prop.ownerPhone}</span>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <a
                          href={`tel:${prop.ownerPhone}`}
                          className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                          title="Call Owner"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                          title="Share on WhatsApp"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </a>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingProperty(prop);
                            setPropertyFormData(prop);
                            setShowAddPropertyModal(true);
                          }}
                          className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setViewingProperty(prop)}
                          className="px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 transition-colors"
                        >
                          Details
                        </button>
                        {canDelete && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirmProperty(prop);
                            }}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 hover:text-red-700 transition-colors"
                            title={language === 'hi' ? 'हटाएं' : 'Delete'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Property Buyer / Seller Leads */}
      {activeTab === 'leads' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">Client Contact</th>
                  <th className="px-4 py-3">Requirement & Location</th>
                  <th className="px-4 py-3">Budget Range</th>
                  <th className="px-4 py-3">Site Visits</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {propertyLeads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                      No property inquiries or leads recorded.
                    </td>
                  </tr>
                ) : (
                  propertyLeads.map((pl) => (
                    <tr key={pl.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                        <span className="block">{pl.clientName}</span>
                        <span className="text-[10px] font-mono text-slate-500">{pl.phone}</span>
                        <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 font-bold">
                          {pl.leadType}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <span className="font-semibold block">{pl.preferredLocation}</span>
                        <span className="text-[10px] text-slate-400 capitalize">
                          {pl.preferredType.replace('_', ' ')} • {pl.areaRequirement || 'Any Size'}
                        </span>
                      </td>

                      <td className="px-4 py-3 font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(pl.budgetMin)} - {formatCurrency(pl.budgetMax)}
                      </td>

                      <td className="px-4 py-3">
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                          {pl.siteVisits?.length || 0} Visits
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800">
                          {pl.status.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={`tel:${pl.phone}`}
                            className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600"
                            title="Call"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                          <a
                            href={generateWhatsAppUrl(pl.phone, `Hello ${pl.clientName}, regarding your property requirement.`)}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-600"
                            title="WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </a>
                          {canDelete && (
                            <button
                              onClick={() => setDeleteConfirmLead(pl)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 hover:text-red-700 transition-colors"
                              title={language === 'hi' ? 'ग्राहक हटाएं' : 'Delete Lead'}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Site Visits */}
      {activeTab === 'site_visits' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
              Scheduled Client Site Inspections & Visits ({allSiteVisits.length})
            </h3>
            <button
              onClick={() => setShowAddVisitModal(true)}
              className="px-3 py-1 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950"
            >
              + Schedule Visit
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {allSiteVisits.length === 0 ? (
              <div className="p-8 text-center text-slate-400">No site visits scheduled.</div>
            ) : (
              allSiteVisits.map((sv) => (
                <div key={sv.id} className="p-4 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                      {sv.propertyTitle || 'General Property Visit'}
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400">
                      Client: <strong className="text-slate-800 dark:text-slate-200">{sv.clientName}</strong> (📞 {sv.phone})
                    </p>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-amber-500" />
                      Scheduled: {formatDate(sv.scheduledAt)} • Conducted By: {sv.conductedBy}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${sv.phone}`}
                      className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 font-bold text-xs flex items-center gap-1"
                    >
                      <Phone className="w-3.5 h-3.5" /> Call
                    </a>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 uppercase">
                      {sv.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Add / Edit Property Modal */}
      {showAddPropertyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh] space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              {editingProperty ? `Edit Property: ${editingProperty.title}` : 'Add New Property Listing'}
            </h3>

            <form onSubmit={handleSaveProperty} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Property Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={propertyFormData.title || ''}
                    onChange={(e) => setPropertyFormData({ ...propertyFormData, title: e.target.value })}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    placeholder="e.g. Corner Residential Plot in Omaxe City / 3 BHK Luxury Flat"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Property Category
                  </label>
                  <select
                    value={propertyFormData.propertyType || 'residential_plot'}
                    onChange={(e) => setPropertyFormData({ ...propertyFormData, propertyType: e.target.value as any })}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="residential_plot">Residential Plot</option>
                    <option value="house">House / Villa</option>
                    <option value="flat">Flat / Apartment</option>
                    <option value="shop">Commercial Shop</option>
                    <option value="commercial">Commercial Space / Office</option>
                    <option value="agricultural">Agricultural Land</option>
                    <option value="other">Other Property</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Deal Type
                  </label>
                  <select
                    value={propertyFormData.dealType || 'sell'}
                    onChange={(e) => setPropertyFormData({ ...propertyFormData, dealType: e.target.value as any })}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="sell">For Sale</option>
                    <option value="rent">For Rent / Lease</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Location / Sector / Colony
                  </label>
                  <input
                    type="text"
                    required
                    value={propertyFormData.location || ''}
                    onChange={(e) => setPropertyFormData({ ...propertyFormData, location: e.target.value })}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    placeholder="e.g. Sector 33, Omaxe City / Main Market"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    City
                  </label>
                  <input
                    type="text"
                    value={propertyFormData.city || 'Karnal'}
                    onChange={(e) => setPropertyFormData({ ...propertyFormData, city: e.target.value })}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Area Size
                  </label>
                  <input
                    type="number"
                    required
                    value={propertyFormData.areaSize || ''}
                    onChange={(e) => setPropertyFormData({ ...propertyFormData, areaSize: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    placeholder="e.g. 200"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Area Unit
                  </label>
                  <select
                    value={propertyFormData.areaUnit || 'gaj'}
                    onChange={(e) => setPropertyFormData({ ...propertyFormData, areaUnit: e.target.value as any })}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="gaj">Gaj (Square Yards)</option>
                    <option value="sq_ft">Sq Feet</option>
                    <option value="bigha">Bigha</option>
                    <option value="acre">Acre</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Asking Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={propertyFormData.askingPrice || ''}
                    onChange={(e) => setPropertyFormData({ ...propertyFormData, askingPrice: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    placeholder="e.g. 7500000"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Expected Commission (₹)
                  </label>
                  <input
                    type="number"
                    value={propertyFormData.commissionExpected || ''}
                    onChange={(e) => setPropertyFormData({ ...propertyFormData, commissionExpected: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    placeholder="e.g. 150000"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Owner Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={propertyFormData.ownerName || ''}
                    onChange={(e) => setPropertyFormData({ ...propertyFormData, ownerName: e.target.value })}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    placeholder="Owner / Landlord name"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Owner Phone Number
                  </label>
                  <input
                    type="tel"
                    value={propertyFormData.ownerPhone || ''}
                    onChange={(e) => setPropertyFormData({ ...propertyFormData, ownerPhone: e.target.value })}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    placeholder="e.g. 9812033441"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Listing Status
                  </label>
                  <select
                    value={propertyFormData.status || 'available'}
                    onChange={(e) => setPropertyFormData({ ...propertyFormData, status: e.target.value as any })}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="available">Available</option>
                    <option value="under_negotiation">Under Negotiation</option>
                    <option value="token_given">Token / Advance Given</option>
                    <option value="sold">Sold</option>
                    <option value="rented">Rented Out</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Assigned Team Member
                  </label>
                  <select
                    value={propertyFormData.assignedTo || currentUser.id}
                    onChange={(e) => setPropertyFormData({ ...propertyFormData, assignedTo: e.target.value })}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {allUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddPropertyModal(false)}
                  className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md shadow-amber-500/20"
                >
                  {editingProperty ? 'Update Property' : 'Publish Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Property Details Modal */}
      {viewingProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {viewingProperty.title}
              </h3>
              <button
                onClick={() => setViewingProperty(null)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <span className="text-slate-400 block font-semibold">Asking Price</span>
                  <span className="text-base font-extrabold text-emerald-600 mt-1 block">
                    {formatCurrency(viewingProperty.askingPrice)}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <span className="text-slate-400 block font-semibold">Dimensions</span>
                  <span className="text-base font-extrabold text-slate-800 dark:text-slate-200 mt-1 block">
                    {viewingProperty.areaSize} {viewingProperty.areaUnit.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-1">
                <p>📍 Location: <strong>{viewingProperty.location}, {viewingProperty.city}</strong></p>
                <p>👤 Owner Contact: <strong>{viewingProperty.ownerName}</strong> (📞 {viewingProperty.ownerPhone})</p>
                <p>💼 Status: <strong className="uppercase">{viewingProperty.status}</strong></p>
                {viewingProperty.commissionExpected && (
                  <p>💰 Commission Expected: <strong>{formatCurrency(viewingProperty.commissionExpected)}</strong></p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              {canDelete ? (
                <button
                  onClick={() => setDeleteConfirmProperty(viewingProperty)}
                  className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-red-50 dark:bg-red-950/50 hover:bg-red-100 text-red-600 dark:text-red-400 flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {language === 'hi' ? 'प्रॉपर्टी हटाएं (Delete)' : 'Delete Property'}
                </button>
              ) : <div />}
              <button
                onClick={() => setViewingProperty(null)}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Lead Modal */}
      {showAddLeadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">New Property Buyer / Tenant Lead</h3>
            <form onSubmit={handleSaveLead} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Client Name *</label>
                <input
                  type="text"
                  required
                  value={leadFormData.clientName || ''}
                  onChange={(e) => setLeadFormData({ ...leadFormData, clientName: e.target.value })}
                  className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={leadFormData.phone || ''}
                  onChange={(e) => setLeadFormData({ ...leadFormData, phone: e.target.value })}
                  className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Budget Min (₹)</label>
                  <input
                    type="number"
                    value={leadFormData.budgetMin || ''}
                    onChange={(e) => setLeadFormData({ ...leadFormData, budgetMin: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Budget Max (₹)</label>
                  <input
                    type="number"
                    value={leadFormData.budgetMax || ''}
                    onChange={(e) => setLeadFormData({ ...leadFormData, budgetMax: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Preferred Location & Area</label>
                <input
                  type="text"
                  value={leadFormData.preferredLocation || ''}
                  onChange={(e) => setLeadFormData({ ...leadFormData, preferredLocation: e.target.value })}
                  className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  placeholder="e.g. Omaxe City / 200 Gaj"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddLeadModal(false)}
                  className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950"
                >
                  Save Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Visit Modal */}
      {showAddVisitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Schedule Site Visit</h3>
            <form onSubmit={handleSaveVisit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Property</label>
                <select
                  value={visitFormData.propertyId || ''}
                  onChange={(e) => {
                    const prop = properties.find((p) => p.id === e.target.value);
                    setVisitFormData({
                      ...visitFormData,
                      propertyId: e.target.value,
                      propertyTitle: prop?.title || '',
                    });
                  }}
                  className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="">Select Property...</option>
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.location})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Client Name *</label>
                <input
                  type="text"
                  required
                  value={visitFormData.clientName || ''}
                  onChange={(e) => setVisitFormData({ ...visitFormData, clientName: e.target.value })}
                  className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Client Phone *</label>
                <input
                  type="tel"
                  required
                  value={visitFormData.phone || ''}
                  onChange={(e) => setVisitFormData({ ...visitFormData, phone: e.target.value })}
                  className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Visit Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={visitFormData.scheduledAt || ''}
                  onChange={(e) => setVisitFormData({ ...visitFormData, scheduledAt: e.target.value })}
                  className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddVisitModal(false)}
                  className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950"
                >
                  Schedule Visit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Property Confirmation Modal */}
      {deleteConfirmProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {language === 'hi' ? 'प्रॉपर्टी स्थायी रूप से हटाएं?' : 'Delete Property Listing?'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'hi'
                  ? `क्या आप वाकई "${deleteConfirmProperty.title}" को हटाना चाहते हैं? यह रिकॉर्ड हमेशा के लिए हटा दिया जाएगा।`
                  : `Are you sure you want to permanently delete "${deleteConfirmProperty.title}"? This cannot be undone.`}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmProperty(null)}
                className="py-2.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {language === 'hi' ? 'रद्द करें (Cancel)' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteProperty}
                className="py-2.5 text-xs font-bold rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/20 transition-all"
              >
                {language === 'hi' ? 'हाँ, हटाएं (Delete)' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Property Lead Confirmation Modal */}
      {deleteConfirmLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {language === 'hi' ? 'प्रॉपर्टी ग्राहक हटाएं?' : 'Delete Property Lead?'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'hi'
                  ? `क्या आप ग्राहक "${deleteConfirmLead.clientName}" को हटाना चाहते हैं?`
                  : `Are you sure you want to remove lead for "${deleteConfirmLead.clientName}"?`}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmLead(null)}
                className="py-2.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {language === 'hi' ? 'रद्द करें (Cancel)' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteLead}
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

