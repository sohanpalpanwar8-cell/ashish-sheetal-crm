/**
 * Core Type Definitions for Ashish Sheetal All-In-One Platform
 */

export type UserRole = 'main_super_admin' | 'admin' | 'team_manager' | 'agent' | 'crm_executive' | 'readonly';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  pin?: string; // 4-digit secret security PIN for login
  avatar?: string;
  relationship?: string; // e.g. "Owner / Self", "Wife / Co-Owner", "Sister / Manager", "Senior Agent"
  active: boolean;
  assignedBranches?: string[];
  lastLogin?: string;
  permissions?: RolePermissions;
}


export interface RolePermissions {
  canManageModules: boolean;
  canManageTeam: boolean;
  canViewAllData: boolean; // if false, only view assigned items
  canDeleteRecords: boolean;
  canExportData: boolean;
  canManageSettings: boolean;
  canEditCustomer: boolean;
  canViewAuditLogs: boolean;
}

export type FieldType =
  | 'text'
  | 'number'
  | 'date'
  | 'phone'
  | 'email'
  | 'currency'
  | 'dropdown'
  | 'checkbox'
  | 'yesno'
  | 'notes'
  | 'image'
  | 'document';

export interface CustomFieldDefinition {
  id: string;
  label: string;
  labelHi?: string;
  type: FieldType;
  required: boolean;
  options?: string[]; // For dropdown
  defaultValue?: string | number | boolean;
  placeholder?: string;
  helpText?: string;
  showInTable?: boolean;
}

export interface DynamicModule {
  id: string;
  name: string;
  nameHi?: string;
  description: string;
  icon: string; // Lucide icon name
  color: string; // Tailwind color class (e.g., 'blue', 'amber', 'emerald', 'indigo', 'rose', 'purple')
  category: string;
  isSystem: boolean; // built-in vs dynamic
  status: 'active' | 'inactive' | 'archived';
  fields: CustomFieldDefinition[];
  customStatuses: string[];
  assignedRoleAccess: UserRole[];
  displayOrder: number;
  allowReminders: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DynamicRecord {
  id: string;
  moduleId: string;
  title: string;
  status: string;
  data: Record<string, any>;
  assignedTo?: string; // User ID
  customerId?: string; // Linked customer
  notes?: NoteItem[];
  documents?: DocumentAttachment[];
  archived?: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export type InsuranceType =
  | 'lic_traditional'
  | 'term'
  | 'bike'
  | 'car'
  | 'health'
  | 'travel'
  | 'other';

export interface InsurancePolicy {
  id: string;
  policyNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  insuranceType: InsuranceType;
  insurerName: string; // LIC, HDFC Life, Tata AIG, ICICI Lombard, Star Health, etc.
  planName: string;
  sumAssured: number;
  premiumAmount: number;
  paymentFrequency: 'monthly' | 'quarterly' | 'half_yearly' | 'yearly' | 'single';
  startDate: string;
  endDate?: string;
  renewalDate: string;
  maturityDate?: string;
  status: 'active' | 'grace_period' | 'lapsed' | 'matured' | 'surrendered' | 'claim_settled';
  nomineeName?: string;
  nomineeRelation?: string;
  
  // LIC Specific
  pptYears?: number; // Premium Paying Term
  policyTermYears?: number; // Total Policy Term
  
  // Term Specific
  medicalExamDone?: boolean;
  applicationNumber?: string;
  issuanceStatus?: 'applied' | 'medical_pending' | 'underwriting' | 'issued' | 'rejected';
  premiumPaymentEndDate?: string;
  
  // Motor Specific (Bike / Car)
  vehicleNumber?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleRegistrationYear?: number;
  ncbPercentage?: number; // No Claim Bonus
  idvValue?: number; // Insured Declared Value

  // Health & Travel Specific
  coveredMembers?: string[]; // e.g. ["Ashish (38)", "Sheetal (36)", "Child 1 (10)"]
  tpaName?: string;
  cashlessCardNumber?: string;
  travelDestination?: string;
  travelStartDate?: string;
  travelEndDate?: string;
  
  assignedTo: string; // User ID
  notes?: NoteItem[];
  documents?: DocumentAttachment[];
  archived?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type PropertyType =
  | 'residential_plot'
  | 'house'
  | 'flat'
  | 'shop'
  | 'commercial'
  | 'agricultural'
  | 'other';

export type PropertyDealType = 'buy' | 'sell' | 'rent' | 'lease';

export interface PropertyListing {
  id: string;
  title: string;
  propertyType: PropertyType;
  dealType: PropertyDealType;
  location: string;
  city: string;
  fullAddress: string;
  areaSize: number;
  areaUnit: 'sq_ft' | 'sq_yards' | 'gaj' | 'bigha' | 'acre';
  askingPrice: number;
  minPrice?: number;
  ownerName: string;
  ownerPhone: string;
  status: 'available' | 'under_negotiation' | 'token_given' | 'sold' | 'rented';
  assignedTo: string;
  photos?: string[];
  videoUrl?: string;
  documents?: DocumentAttachment[];
  notes?: NoteItem[];
  advanceTokenReceived?: number;
  balancePending?: number;
  commissionExpected?: number;
  commissionReceived?: number;
  registrationDate?: string;
  archived?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PropertyLead {
  id: string;
  clientName: string;
  phone: string;
  leadType: 'buyer' | 'seller' | 'tenant' | 'landlord';
  preferredType: PropertyType;
  dealType: PropertyDealType;
  preferredLocation: string;
  budgetMin: number;
  budgetMax: number;
  areaRequirement?: string;
  status: 'new' | 'contacted' | 'site_visit_scheduled' | 'negotiation' | 'deal_closed' | 'dropped';
  assignedTo: string;
  siteVisits?: SiteVisit[];
  notes?: NoteItem[];
  createdAt: string;
  updatedAt: string;
}

export interface SiteVisit {
  id: string;
  propertyId?: string;
  propertyTitle?: string;
  leadId?: string;
  clientName: string;
  phone: string;
  scheduledAt: string; // ISO date/time
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  feedback?: string;
  conductedBy: string;
}

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  alternatePhone?: string;
  whatsapp?: string;
  email?: string;
  address: string;
  city: string;
  dob?: string;
  anniversary?: string;
  occupation?: string;
  panNumber?: string;
  aadhaarNumber?: string;
  customFields?: Record<string, any>;
  assignedTo: string;
  tags?: string[];
  notes?: NoteItem[];
  documents?: DocumentAttachment[];
  archived?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type LeadStatus =
  | 'new'
  | 'contact_pending'
  | 'contacted'
  | 'interested'
  | 'follow_up'
  | 'converted'
  | 'not_interested'
  | 'later'
  | 'archived';

export interface Lead {
  id: string;
  name: string;
  phone: string;
  alternatePhone?: string;
  email?: string;
  category: 'insurance' | 'property' | 'both' | 'general' | string;
  source: 'referral' | 'walk_in' | 'phone_call' | 'whatsapp' | 'social_media' | 'advertisement' | 'other';
  status: LeadStatus;
  estimatedValue?: number;
  assignedTo: string;
  followUpDate?: string;
  followUpNote?: string;
  notes?: NoteItem[];
  convertedCustomerId?: string;
  archived?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRecord {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  relatedEntity: 'policy' | 'property' | 'general';
  entityId?: string; // Policy ID or Property ID
  entityTitle?: string;
  amount: number;
  installmentNumber?: number;
  totalInstallments?: number;
  dueDate: string;
  paymentDate?: string;
  status: 'paid' | 'pending' | 'overdue' | 'cancelled';
  paymentMode?: 'upi' | 'bank_transfer' | 'cheque' | 'cash' | 'net_banking' | 'card';
  referenceNumber?: string;
  receiptNumber?: string;
  receiptUrl?: string;
  isVerified: boolean;
  notes?: string;
  archived?: boolean;
  createdAt: string;

  // Multi-Account Tracking (Ashish & Sheetal 6 Accounts)
  accountId?: string; // e.g. 'qr_ashish_property', 'qr_sheetal_insurance'
  accountTitle?: string; // e.g. 'Ashish Property (ICICI Escrow)'
  accountOwner?: 'Ashish Panwar' | 'Sheetal Panwar' | string;
  receivedBy?: string;
}

export interface NoteItem {
  id: string;
  text: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt?: string;
}

export interface DocumentAttachment {
  id: string;
  name: string;
  fileType: string;
  fileSize: number; // in bytes
  uploadedAt: string;
  uploadedBy: string;
  dataUrl: string; // base64 or stored object URL
  tag?: 'policy' | 'receipt' | 'aadhaar' | 'pan' | 'rc' | 'property' | 'agreement' | 'other';
}

export interface DailyWorkItem {
  id: string;
  title: string;
  type: 'premium_due' | 'renewal' | 'property_call' | 'lead_followup' | 'site_visit' | 'birthday' | 'custom_task';
  clientName: string;
  phone: string;
  dueDate: string;
  dueTime?: string;
  status: 'pending' | 'done' | 'rescheduled' | 'cancelled';
  priority: 'high' | 'medium' | 'low';
  assignedTo: string;
  relatedId?: string;
  relatedType?: string;
  metadata?: Record<string, any>;
  notes?: string;
}

export interface ReminderConfig {
  id: string;
  type: 'premium' | 'renewal' | 'maturity' | 'birthday' | 'site_visit' | 'custom';
  daysBefore: number;
  enabled: boolean;
  title: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'ARCHIVE' | 'RESTORE' | 'ROLE_CHANGE' | 'LOGIN' | 'EXPORT' | 'RESTORE_BACKUP' | 'MODULE_CREATE' | 'MODULE_UPDATE' | 'MODULE_DELETE';
  entityType: string;
  entityId?: string;
  entityTitle?: string;
  details: string;
}

export type QRCategory = 'property' | 'insurance' | 'general';
export type AccountOwnerKey = 'ashish' | 'sheetal';

export interface QRCodeConfig {
  id: string;
  category: QRCategory;
  ownerKey: AccountOwnerKey;
  ownerName: string; // 'Ashish Panwar' | 'Sheetal Panwar'
  shortLabel: string; // e.g. 'Ashish Property', 'Sheetal Insurance'
  title: string;
  titleHi: string;
  upiId: string;
  accountName: string;
  bankName: string;
  accountNumber?: string;
  ifscCode?: string;
  qrImageUrl?: string; // Uploaded custom QR code/barcode image (base64 or URL)
  defaultMessageTemplate: string;
  active: boolean;
  colorTheme?: string;
}
