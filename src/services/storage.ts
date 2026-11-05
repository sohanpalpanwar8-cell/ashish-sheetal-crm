/**
 * Ashish Sheetal All-In-One Enterprise Database & Persistence Service
 * Features LocalStorage persistence, role-based filtering, audit logging,
 * automatic reminder calculation, and full backup/restore capabilities.
 */

import {
  User,
  Customer,
  InsurancePolicy,
  PropertyListing,
  PropertyLead,
  Lead,
  PaymentRecord,
  DynamicModule,
  DynamicRecord,
  AuditLog,
  ReminderConfig,
  DailyWorkItem,
  UserRole,
  QRCodeConfig,
  QRCategory,
} from '../types';

const STORAGE_KEYS = {
  USERS: 'as_users_v1',
  CUSTOMERS: 'as_customers_v1',
  POLICIES: 'as_policies_v1',
  PROPERTIES: 'as_properties_v1',
  PROPERTY_LEADS: 'as_property_leads_v1',
  LEADS: 'as_leads_v1',
  PAYMENTS: 'as_payments_v1',
  MODULES: 'as_modules_v1',
  DYNAMIC_RECORDS: 'as_dynamic_records_v1',
  AUDIT_LOGS: 'as_audit_logs_v1',
  REMINDERS_CFG: 'as_reminders_cfg_v1',
  QR_CONFIGS: 'as_qr_configs_v1',
  CURRENT_USER_ID: 'as_current_user_id_v1',
  CUSTOM_TASKS: 'as_custom_tasks_v1',
};

// Default initial users with 8-digit secure PINs
const SEED_USERS: User[] = [
  {
    id: 'user_ashish',
    name: 'Ashish Panwar',
    email: 'ashish@ashishsheetal.com',
    phone: '+91 98960 12345',
    role: 'main_super_admin',
    relationship: 'Owner / Main Super Admin',
    pin: '12345678',
    active: true,
    lastLogin: new Date().toISOString(),
    permissions: {
      canManageModules: true,
      canManageTeam: true,
      canViewAllData: true,
      canDeleteRecords: true,
      canExportData: true,
      canManageSettings: true,
      canEditCustomer: true,
      canViewAuditLogs: true,
    },
  },
  {
    id: 'user_sheetal',
    name: 'Sheetal Panwar',
    email: 'sheetal@ashishsheetal.com',
    phone: '+91 98960 54321',
    role: 'main_super_admin',
    relationship: 'Wife / Co-Owner & Main Admin',
    pin: '12345678',
    active: true,
    lastLogin: new Date().toISOString(),
    permissions: {
      canManageModules: true,
      canManageTeam: true,
      canViewAllData: true,
      canDeleteRecords: true,
      canExportData: true,
      canManageSettings: true,
      canEditCustomer: true,
      canViewAuditLogs: true,
    },
  },
  {
    id: 'user_sister',
    name: 'Sunita Sharma (Sister)',
    email: 'sister@ashishsheetal.com',
    phone: '+91 98120 11223',
    role: 'admin',
    relationship: 'Sister / Operations Head',
    pin: '22222222',
    active: true,
    lastLogin: new Date(Date.now() - 3600000).toISOString(),
    permissions: {
      canManageModules: true,
      canManageTeam: false,
      canViewAllData: true,
      canDeleteRecords: false,
      canExportData: true,
      canManageSettings: false,
      canEditCustomer: true,
      canViewAuditLogs: true,
    },
  },
  {
    id: 'user_vikram',
    name: 'Vikram Sharma',
    email: 'vikram@ashishsheetal.com',
    phone: '+91 94160 33445',
    role: 'team_manager',
    relationship: 'Senior Property & Insurance Manager',
    pin: '33333333',
    active: true,
    lastLogin: new Date(Date.now() - 7200000).toISOString(),
    permissions: {
      canManageModules: false,
      canManageTeam: false,
      canViewAllData: true,
      canDeleteRecords: false,
      canExportData: true,
      canManageSettings: false,
      canEditCustomer: true,
      canViewAuditLogs: false,
    },
  },
  {
    id: 'user_priya',
    name: 'Priya Verma',
    email: 'priya@ashishsheetal.com',
    phone: '+91 98130 99887',
    role: 'agent',
    relationship: 'Life & Health Insurance Specialist',
    pin: '44444444',
    active: true,
    lastLogin: new Date(Date.now() - 14400000).toISOString(),
    permissions: {
      canManageModules: false,
      canManageTeam: false,
      canViewAllData: false, // Team member workspace isolation!
      canDeleteRecords: false,
      canExportData: false,
      canManageSettings: false,
      canEditCustomer: true,
      canViewAuditLogs: false,
    },
  },
  {
    id: 'user_rahul',
    name: 'Rahul Mehta',
    email: 'rahul@ashishsheetal.com',
    phone: '+91 98965 77665',
    role: 'agent',
    relationship: 'Real Estate Field Agent',
    pin: '55555555',
    active: true,
    lastLogin: new Date(Date.now() - 28800000).toISOString(),
    permissions: {
      canManageModules: false,
      canManageTeam: false,
      canViewAllData: false, // Isolated
      canDeleteRecords: false,
      canExportData: false,
      canManageSettings: false,
      canEditCustomer: true,
      canViewAuditLogs: false,
    },
  },
  {
    id: 'user_neha',
    name: 'Neha Sharma (CRM Telecaller)',
    email: 'crm@ashishsheetal.com',
    phone: '+91 98765 43210',
    role: 'crm_executive',
    relationship: 'CRM Telecaller & Calling Specialist',
    pin: '77777777',
    active: true,
    lastLogin: new Date(Date.now() - 1800000).toISOString(),
    permissions: {
      canManageModules: false,
      canManageTeam: false,
      canViewAllData: true, // Needs all data to call customers across all agents
      canDeleteRecords: false, // Protected: strictly no deletions
      canExportData: false,
      canManageSettings: false,
      canEditCustomer: true,
      canViewAuditLogs: false,
    },
  },
  {
    id: 'user_readonly',
    name: 'External Auditor',
    email: 'auditor@ashishsheetal.com',
    phone: '+91 99999 00000',
    role: 'readonly',
    relationship: 'Compliance Reviewer',
    pin: '99999999',
    active: true,
    lastLogin: new Date(Date.now() - 86400000).toISOString(),
    permissions: {
      canManageModules: false,
      canManageTeam: false,
      canViewAllData: true,
      canDeleteRecords: false,
      canExportData: false,
      canManageSettings: false,
      canEditCustomer: false,
      canViewAuditLogs: true,
    },
  },
];

// Seed Dynamic Modules to prove the Dynamic Module Builder functionality!
const SEED_MODULES: DynamicModule[] = [
  {
    id: 'mod_food_tiffin',
    name: 'Food & Catering Orders',
    nameHi: 'खान-पान एवं कैटरिंग ऑर्डर्स',
    description: 'Track catering events, meal subscriptions, menu selection, and dietary preferences.',
    icon: 'Utensils',
    color: 'emerald',
    category: 'Hospitality',
    isSystem: false,
    status: 'active',
    displayOrder: 1,
    allowReminders: true,
    assignedRoleAccess: ['main_super_admin', 'admin', 'team_manager', 'agent'],
    customStatuses: ['Inquiry', 'Confirmed', 'Preparation', 'Delivered', 'Payment Pending', 'Completed'],
    fields: [
      {
        id: 'f_event_name',
        label: 'Event / Party Name',
        labelHi: 'कार्यक्रम / पार्टी का नाम',
        type: 'text',
        required: true,
        showInTable: true,
      },
      {
        id: 'f_event_date',
        label: 'Event Date',
        labelHi: 'आयोजन तिथि',
        type: 'date',
        required: true,
        showInTable: true,
      },
      {
        id: 'f_guest_count',
        label: 'Expected Guest Count',
        labelHi: 'अतिथियों की संख्या',
        type: 'number',
        required: true,
        showInTable: true,
      },
      {
        id: 'f_meal_type',
        label: 'Meal Package',
        labelHi: 'भोजन पैकेज',
        type: 'dropdown',
        required: true,
        options: ['Standard Thali', 'Premium Buffet', 'Snacks & High Tea', 'South Indian Special', 'Royal Wedding Feast'],
        showInTable: true,
      },
      {
        id: 'f_budget',
        label: 'Total Bill Amount',
        labelHi: 'कुल बिल राशि',
        type: 'currency',
        required: true,
        showInTable: true,
      },
      {
        id: 'f_venue',
        label: 'Venue Address',
        labelHi: 'स्थान / पता',
        type: 'text',
        required: false,
        showInTable: false,
      },
      {
        id: 'f_dietary_notes',
        label: 'Dietary Preferences & Jain/Vegan Options',
        labelHi: 'विशेष खान-पान निर्देश (जैन/शाकाहारी)',
        type: 'notes',
        required: false,
        showInTable: false,
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mod_lending_finance',
    name: 'Business Loans & Finance',
    nameHi: 'व्यावसायिक ऋण एवं वित्त',
    description: 'Manage MSME business loans, personal credit assistance, and loan disbursement tracking.',
    icon: 'Briefcase',
    color: 'amber',
    category: 'Finance',
    isSystem: false,
    status: 'active',
    displayOrder: 2,
    allowReminders: true,
    assignedRoleAccess: ['main_super_admin', 'admin', 'team_manager'],
    customStatuses: ['Lead', 'Docs Collected', 'Bank Login', 'Sanctioned', 'Disbursed', 'Rejected'],
    fields: [
      {
        id: 'f_business_name',
        label: 'Business / Firm Name',
        type: 'text',
        required: true,
        showInTable: true,
      },
      {
        id: 'f_loan_type',
        label: 'Loan Category',
        type: 'dropdown',
        required: true,
        options: ['Business Loan (Unsecured)', 'Loan Against Property (LAP)', 'Home Loan', 'Overdraft / CC Limit', 'Machinery Loan'],
        showInTable: true,
      },
      {
        id: 'f_req_amount',
        label: 'Requested Amount',
        type: 'currency',
        required: true,
        showInTable: true,
      },
      {
        id: 'f_bank_name',
        label: 'Preferred / Target Bank',
        type: 'text',
        required: false,
        showInTable: true,
      },
      {
        id: 'f_turnover',
        label: 'Annual ITR Turnover',
        type: 'currency',
        required: false,
        showInTable: false,
      },
      {
        id: 'f_sanction_date',
        label: 'Expected Sanction Date',
        type: 'date',
        required: false,
        showInTable: true,
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Seed Customers
const SEED_CUSTOMERS: Customer[] = [
  {
    id: 'cust_1',
    name: 'Ramesh Chandra Sharma',
    mobile: '9812045678',
    alternatePhone: '9416012345',
    whatsapp: '9812045678',
    email: 'rc.sharma@gmail.com',
    address: 'House #42, Model Town, Phase 1',
    city: 'Karnal',
    dob: '1975-08-15',
    anniversary: '2001-11-20',
    occupation: 'Textile Business Owner',
    panNumber: 'ABCPS1234F',
    aadhaarNumber: '4455-6677-8899',
    assignedTo: 'user_ashish',
    tags: ['VIP', 'High Net Worth', 'Life + Property'],
    notes: [
      {
        id: 'n_1',
        text: 'Met at office. Looking for both high-sum LIC coverage and commercial shop investment.',
        authorId: 'user_ashish',
        authorName: 'Ashish Panwar',
        createdAt: '2026-10-12T10:30:00Z',
      },
    ],
    archived: false,
    createdAt: '2026-09-01T09:00:00Z',
    updatedAt: '2026-10-25T11:00:00Z',
  },
  {
    id: 'cust_2',
    name: 'Dr. Rajesh Malhotra',
    mobile: '9896088990',
    alternatePhone: '9813077665',
    whatsapp: '9896088990',
    email: 'dr.malhotra@yahoo.com',
    address: 'Flat 402, Royal Residency, Sector 13',
    city: 'Panipat',
    dob: '1982-11-01', // Birthday today!
    anniversary: '2010-02-14',
    occupation: 'Senior Orthopedic Surgeon',
    panNumber: 'BPQPM5678K',
    aadhaarNumber: '7788-9900-1122',
    assignedTo: 'user_priya',
    tags: ['Doctor', 'Health Insurance', 'Creta Car'],
    notes: [
      {
        id: 'n_2',
        text: 'Renewed Creta policy. Also discussed Super Top-up Health policy of 50 Lakhs.',
        authorId: 'user_priya',
        authorName: 'Priya Verma',
        createdAt: '2026-10-20T14:15:00Z',
      },
    ],
    archived: false,
    createdAt: '2026-08-10T11:00:00Z',
    updatedAt: '2026-10-28T16:00:00Z',
  },
  {
    id: 'cust_3',
    name: 'Sunita Agarwal',
    mobile: '9466122334',
    alternatePhone: '9896344556',
    whatsapp: '9466122334',
    email: 'sunita.agarwal90@gmail.com',
    address: 'Kothi #15, Urban Estate',
    city: 'Kurukshetra',
    dob: '1988-04-12',
    anniversary: '2012-05-18',
    occupation: 'School Principal & Investor',
    panNumber: 'DFGPA9988C',
    aadhaarNumber: '3344-5566-7788',
    assignedTo: 'user_sheetal',
    tags: ['Property Buyer', 'Term Plan'],
    notes: [
      {
        id: 'n_3',
        text: 'Inspected residential plot in Omaxe. Liked the 200 Gaj corner plot.',
        authorId: 'user_sheetal',
        authorName: 'Sheetal Panwar',
        createdAt: '2026-10-18T16:45:00Z',
      },
    ],
    archived: false,
    createdAt: '2026-07-15T10:00:00Z',
    updatedAt: '2026-10-29T12:00:00Z',
  },
  {
    id: 'cust_4',
    name: 'Vikramjit Singh Sandhu',
    mobile: '9812499112',
    alternatePhone: '9416588223',
    whatsapp: '9812499112',
    email: 'sandhu.farms@gmail.com',
    address: 'Village Nilokheri, GT Road',
    city: 'Karnal',
    dob: '1970-12-05',
    anniversary: '1995-10-22',
    occupation: 'Progressive Farmer & Landowner',
    panNumber: 'EIKPS7766M',
    aadhaarNumber: '1122-3344-5566',
    assignedTo: 'user_rahul',
    tags: ['Agricultural Land', 'Tractor & Car', 'LIC Kanyadan'],
    notes: [
      {
        id: 'n_4',
        text: 'Wants to lease 4 Bigha highway-facing agricultural land for warehouse development.',
        authorId: 'user_rahul',
        authorName: 'Rahul Mehta',
        createdAt: '2026-10-22T09:20:00Z',
      },
    ],
    archived: false,
    createdAt: '2026-06-20T14:00:00Z',
    updatedAt: '2026-10-26T17:30:00Z',
  },
  {
    id: 'cust_5',
    name: 'Amit Kapoor',
    mobile: '9896733221',
    alternatePhone: '9416155443',
    whatsapp: '9896733221',
    email: 'amit.kapoor@techcorp.in',
    address: 'Tower B, Flat 804, Signature Greens',
    city: 'Gurugram',
    dob: '1993-06-25',
    anniversary: '2021-12-10',
    occupation: 'Software Engineering Director',
    panNumber: 'CHRPK3456N',
    aadhaarNumber: '8899-0011-2233',
    assignedTo: 'user_priya',
    tags: ['Term Plan', 'Health 1 Cr', 'Traveler'],
    notes: [
      {
        id: 'n_5',
        text: 'Purchased 2 Cr Term plan with critical illness rider.',
        authorId: 'user_priya',
        authorName: 'Priya Verma',
        createdAt: '2026-10-15T11:00:00Z',
      },
    ],
    archived: false,
    createdAt: '2026-08-01T10:00:00Z',
    updatedAt: '2026-10-20T15:00:00Z',
  },
  {
    id: 'cust_6',
    name: 'Pooja Gujral',
    mobile: '9812233445',
    whatsapp: '9812233445',
    email: 'pooja.fashion@gmail.com',
    address: 'Shop #12, Kunjpura Road Market',
    city: 'Karnal',
    dob: '1985-03-30',
    anniversary: '2008-04-15',
    occupation: 'Boutique & Retailer',
    panNumber: 'AJYPG7788P',
    assignedTo: 'user_vikram',
    tags: ['Shop Insurance', 'Commercial Tenant'],
    notes: [],
    archived: false,
    createdAt: '2026-09-10T12:00:00Z',
    updatedAt: '2026-10-10T12:00:00Z',
  },
];

// Helper to generate dynamic dates relative to current date (Nov 1, 2026)
const getRelativeDate = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

// Seed Insurance Policies covering all requested types
const SEED_POLICIES: InsurancePolicy[] = [
  // 1. LIC / Traditional Life (PPT, Policy term, maturity date)
  {
    id: 'pol_lic_1',
    policyNumber: '178492048',
    customerId: 'cust_1',
    customerName: 'Ramesh Chandra Sharma',
    customerPhone: '9812045678',
    insuranceType: 'lic_traditional',
    insurerName: 'Life Insurance Corporation of India (LIC)',
    planName: 'Jeevan Labh (Table 936)',
    sumAssured: 2500000,
    premiumAmount: 114500,
    paymentFrequency: 'yearly',
    startDate: '2020-11-05',
    renewalDate: getRelativeDate(4), // Due in 4 days! (Matches 5-day alert)
    maturityDate: '2041-11-05',
    status: 'active',
    nomineeName: 'Pushpa Sharma',
    nomineeRelation: 'Spouse',
    pptYears: 16,
    policyTermYears: 21,
    assignedTo: 'user_ashish',
    notes: [
      {
        id: 'pn_1',
        text: 'Policy premium due in early November. Reminded customer on call.',
        authorId: 'user_ashish',
        authorName: 'Ashish Panwar',
        createdAt: '2026-10-28T10:00:00Z',
      },
    ],
    archived: false,
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-10-28T10:00:00Z',
  },
  // 2. Term Insurance (Sum assured, medical exam, status, premium end date)
  {
    id: 'pol_term_1',
    policyNumber: 'HD-TERM-90231',
    customerId: 'cust_5',
    customerName: 'Amit Kapoor',
    customerPhone: '9896733221',
    insuranceType: 'term',
    insurerName: 'HDFC Life Insurance',
    planName: 'Click 2 Protect Super (Life & Critical Illness)',
    sumAssured: 20000000, // 2 Crores
    premiumAmount: 38200,
    paymentFrequency: 'yearly',
    startDate: '2022-11-01',
    renewalDate: getRelativeDate(0), // Due TODAY!
    maturityDate: '2062-11-01',
    status: 'active',
    nomineeName: 'Neetu Kapoor',
    nomineeRelation: 'Spouse',
    medicalExamDone: true,
    applicationNumber: 'APP-99881023',
    issuanceStatus: 'issued',
    premiumPaymentEndDate: '2052-11-01',
    assignedTo: 'user_priya',
    notes: [],
    archived: false,
    createdAt: '2026-02-15T11:00:00Z',
    updatedAt: '2026-10-30T11:00:00Z',
  },
  // 3. Bike Insurance
  {
    id: 'pol_bike_1',
    policyNumber: 'BAJAJ-2W-774411',
    customerId: 'cust_1',
    customerName: 'Ramesh Chandra Sharma',
    customerPhone: '9812045678',
    insuranceType: 'bike',
    insurerName: 'Bajaj Allianz General Insurance',
    planName: 'Two-Wheeler Comprehensive Package',
    sumAssured: 95000,
    premiumAmount: 2450,
    paymentFrequency: 'yearly',
    startDate: '2025-11-15',
    renewalDate: getRelativeDate(14), // Expiry in 14 days (15-day alert)
    status: 'active',
    vehicleNumber: 'HR-05-AW-4589',
    vehicleMake: 'Royal Enfield',
    vehicleModel: 'Classic 350 Gunmetal Grey',
    vehicleRegistrationYear: 2021,
    ncbPercentage: 35,
    idvValue: 135000,
    assignedTo: 'user_ashish',
    notes: [],
    archived: false,
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-10-25T10:00:00Z',
  },
  // 4. Car Insurance
  {
    id: 'pol_car_1',
    policyNumber: 'TATA-4W-889922',
    customerId: 'cust_2',
    customerName: 'Dr. Rajesh Malhotra',
    customerPhone: '9896088990',
    insuranceType: 'car',
    insurerName: 'Tata AIG General Insurance',
    planName: 'AutoSecure Private Car Zero Depreciation Package',
    sumAssured: 1450000,
    premiumAmount: 26800,
    paymentFrequency: 'yearly',
    startDate: '2025-11-08',
    renewalDate: getRelativeDate(7), // Expiry in 7 days (7-day alert)
    status: 'active',
    vehicleNumber: 'HR-06-BM-7001',
    vehicleMake: 'Hyundai',
    vehicleModel: 'Creta SX (O) Turbo Petrol',
    vehicleRegistrationYear: 2023,
    ncbPercentage: 25,
    idvValue: 1420000,
    assignedTo: 'user_priya',
    notes: [],
    archived: false,
    createdAt: '2026-04-10T12:00:00Z',
    updatedAt: '2026-10-24T12:00:00Z',
  },
  // 5. Health Insurance
  {
    id: 'pol_health_1',
    policyNumber: 'STAR-HLT-443322',
    customerId: 'cust_2',
    customerName: 'Dr. Rajesh Malhotra',
    customerPhone: '9896088990',
    insuranceType: 'health',
    insurerName: 'Star Health and Allied Insurance',
    planName: 'Family Health Optima Comprehensive',
    sumAssured: 2500000, // 25 Lakhs
    premiumAmount: 42500,
    paymentFrequency: 'yearly',
    startDate: '2025-11-28',
    renewalDate: getRelativeDate(27), // Renewal in 27 days
    status: 'active',
    coveredMembers: ['Dr. Rajesh (44)', 'Dr. Meenakshi (42)', 'Aarav (14)', 'Ananya (10)'],
    tpaName: 'In-House Star Health TPA',
    cashlessCardNumber: 'STAR-CARD-992019',
    assignedTo: 'user_priya',
    notes: [],
    archived: false,
    createdAt: '2026-05-12T10:00:00Z',
    updatedAt: '2026-10-20T10:00:00Z',
  },
  // 6. Travel Insurance
  {
    id: 'pol_travel_1',
    policyNumber: 'ICICI-TRV-556677',
    customerId: 'cust_5',
    customerName: 'Amit Kapoor',
    customerPhone: '9896733221',
    insuranceType: 'travel',
    insurerName: 'ICICI Lombard General Insurance',
    planName: 'International Travel Elite Plan ($500,000 Cover)',
    sumAssured: 40000000,
    premiumAmount: 6400,
    paymentFrequency: 'single',
    startDate: '2026-11-10',
    renewalDate: '2026-11-25',
    status: 'active',
    travelDestination: 'Dubai & Abu Dhabi, UAE',
    travelStartDate: '2026-11-10',
    travelEndDate: '2026-11-24',
    coveredMembers: ['Amit Kapoor (33)', 'Neetu Kapoor (31)'],
    assignedTo: 'user_priya',
    notes: [],
    archived: false,
    createdAt: '2026-10-25T14:00:00Z',
    updatedAt: '2026-10-25T14:00:00Z',
  },
  // 7. Overdue LIC policy to demonstrate Overdue Premium alert
  {
    id: 'pol_lic_overdue',
    policyNumber: '189901452',
    customerId: 'cust_4',
    customerName: 'Vikramjit Singh Sandhu',
    customerPhone: '9812499112',
    insuranceType: 'lic_traditional',
    insurerName: 'Life Insurance Corporation of India (LIC)',
    planName: 'Jeevan Umang (Whole Life with 8% guaranteed return)',
    sumAssured: 5000000,
    premiumAmount: 185000,
    paymentFrequency: 'yearly',
    startDate: '2019-10-15',
    renewalDate: getRelativeDate(-17), // Overdue by 17 days!
    maturityDate: '2119-10-15',
    status: 'grace_period',
    nomineeName: 'Harpreet Kaur',
    nomineeRelation: 'Spouse',
    pptYears: 15,
    policyTermYears: 100,
    assignedTo: 'user_rahul',
    notes: [
      {
        id: 'pn_overdue',
        text: 'Grace period ends in 13 days. Urgent reminder needed.',
        authorId: 'user_rahul',
        authorName: 'Rahul Mehta',
        createdAt: '2026-10-31T09:00:00Z',
      },
    ],
    archived: false,
    createdAt: '2026-01-05T10:00:00Z',
    updatedAt: '2026-10-31T09:00:00Z',
  },
  // 8. Upcoming renewal for Rahul's customer (Due in 3 days)
  {
    id: 'pol_lic_rahul_due',
    policyNumber: '194002811',
    customerId: 'cust_4',
    customerName: 'Vikramjit Singh Sandhu',
    customerPhone: '9812499112',
    insuranceType: 'lic_traditional',
    insurerName: 'Life Insurance Corporation of India (LIC)',
    planName: 'New Jeevan Anand (Table 915)',
    sumAssured: 3000000,
    premiumAmount: 68500,
    paymentFrequency: 'yearly',
    startDate: '2021-11-04',
    renewalDate: getRelativeDate(3), // Due in 3 days!
    maturityDate: '2046-11-04',
    status: 'active',
    nomineeName: 'Harpreet Kaur',
    nomineeRelation: 'Spouse',
    pptYears: 25,
    policyTermYears: 25,
    assignedTo: 'user_rahul',
    notes: [
      {
        id: 'pn_rahul_1',
        text: 'Customer requested reminder call 3 days before due date.',
        authorId: 'user_rahul',
        authorName: 'Rahul Mehta',
        createdAt: '2026-10-28T10:00:00Z',
      },
    ],
    archived: false,
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-10-28T10:00:00Z',
  },
];

// Seed Property Listings covering Plots, Houses, Commercial, Agricultural
const SEED_PROPERTIES: PropertyListing[] = [
  {
    id: 'prop_1',
    title: 'Corner Residential Plot in Omaxe City',
    propertyType: 'residential_plot',
    dealType: 'sell',
    location: 'Sector 33, Omaxe City',
    city: 'Karnal',
    fullAddress: 'Plot #C-142, North-East Corner, 45-foot Wide Road, Omaxe City',
    areaSize: 250,
    areaUnit: 'gaj',
    askingPrice: 7500000, // 75 Lakhs
    minPrice: 7200000,
    ownerName: 'Kuldeep Rana',
    ownerPhone: '9812033441',
    status: 'available',
    assignedTo: 'user_vikram',
    commissionExpected: 150000, // 2%
    notes: [
      {
        id: 'prop_n1',
        text: 'Clean registry, mutation done, immediate possession. High buyer interest.',
        authorId: 'user_vikram',
        authorName: 'Vikram Sharma',
        createdAt: '2026-10-15T11:00:00Z',
      },
    ],
    archived: false,
    createdAt: '2026-09-01T10:00:00Z',
    updatedAt: '2026-10-25T11:00:00Z',
  },
  {
    id: 'prop_2',
    title: '3 BHK Ultra-Luxury Apartment with Servant Room',
    propertyType: 'flat',
    dealType: 'sell',
    location: 'CHD City, Sector 45',
    city: 'Karnal',
    fullAddress: 'Flat #602, Tower 4, Royal Palms, CHD City',
    areaSize: 1950,
    areaUnit: 'sq_ft',
    askingPrice: 11500000, // 1.15 Cr
    minPrice: 11000000,
    ownerName: 'Rajinder Gupta',
    ownerPhone: '9416055667',
    status: 'under_negotiation',
    advanceTokenReceived: 200000,
    balancePending: 10800000,
    commissionExpected: 110000,
    assignedTo: 'user_rahul',
    notes: [
      {
        id: 'prop_n2',
        text: 'Token given by Dr. Malhotra. Registry scheduled for end of November.',
        authorId: 'user_rahul',
        authorName: 'Rahul Mehta',
        createdAt: '2026-10-27T16:00:00Z',
      },
    ],
    archived: false,
    createdAt: '2026-08-15T10:00:00Z',
    updatedAt: '2026-10-27T16:00:00Z',
  },
  {
    id: 'prop_3',
    title: 'Prime Main Market Commercial Shop (Double Story)',
    propertyType: 'shop',
    dealType: 'rent',
    location: 'Kunjpura Road Commercial Hub',
    city: 'Karnal',
    fullAddress: 'Shop #28, Ground + Mezzanine, Main Kunjpura Road',
    areaSize: 450,
    areaUnit: 'sq_ft',
    askingPrice: 65000, // Rent per month
    ownerName: 'Mahesh Bansal',
    ownerPhone: '9896022119',
    status: 'available',
    assignedTo: 'user_vikram',
    commissionExpected: 65000, // 1 month rent
    notes: [],
    archived: false,
    createdAt: '2026-09-20T10:00:00Z',
    updatedAt: '2026-10-18T10:00:00Z',
  },
  {
    id: 'prop_4',
    title: 'Highway-Facing Fertile Agricultural Land',
    propertyType: 'agricultural',
    dealType: 'sell',
    location: 'GT Road Highway Mile 114',
    city: 'Taraori / Nilokheri',
    fullAddress: 'Khasra #214/12, NH-44 GT Road frontage, Near Food Plaza',
    areaSize: 6,
    areaUnit: 'bigha',
    askingPrice: 24000000, // 2.4 Cr
    minPrice: 22500000,
    ownerName: 'Vikramjit Singh Sandhu',
    ownerPhone: '9812499112',
    status: 'available',
    assignedTo: 'user_ashish',
    commissionExpected: 480000, // 2%
    notes: [],
    archived: false,
    createdAt: '2026-07-10T10:00:00Z',
    updatedAt: '2026-10-10T10:00:00Z',
  },
];

// Seed Property Leads & Site Visits
const SEED_PROPERTY_LEADS: PropertyLead[] = [
  {
    id: 'pled_1',
    clientName: 'Sanjay Chawla',
    phone: '9812077889',
    leadType: 'buyer',
    preferredType: 'residential_plot',
    dealType: 'buy',
    preferredLocation: 'Omaxe City or Sector 32',
    budgetMin: 6000000,
    budgetMax: 8000000,
    areaRequirement: '200 to 250 Gaj',
    status: 'site_visit_scheduled',
    assignedTo: 'user_vikram',
    siteVisits: [
      {
        id: 'sv_1',
        propertyId: 'prop_1',
        propertyTitle: 'Corner Residential Plot in Omaxe City',
        clientName: 'Sanjay Chawla',
        phone: '9812077889',
        scheduledAt: `${getRelativeDate(0)}T15:30:00`, // TODAY at 3:30 PM!
        status: 'scheduled',
        conductedBy: 'Vikram Sharma',
      },
    ],
    notes: [
      {
        id: 'pln_1',
        text: 'Ready with white funds, bank loan approved from SBI.',
        authorId: 'user_vikram',
        authorName: 'Vikram Sharma',
        createdAt: '2026-10-29T11:00:00Z',
      },
    ],
    createdAt: '2026-10-20T10:00:00Z',
    updatedAt: '2026-10-29T11:00:00Z',
  },
  {
    id: 'pled_2',
    clientName: 'Pooja Gujral',
    phone: '9812233445',
    leadType: 'tenant',
    preferredType: 'shop',
    dealType: 'rent',
    preferredLocation: 'Kunjpura Road or Railway Road',
    budgetMin: 40000,
    budgetMax: 70000,
    areaRequirement: '350 - 500 Sq Ft',
    status: 'negotiation',
    assignedTo: 'user_vikram',
    notes: [],
    createdAt: '2026-10-22T12:00:00Z',
    updatedAt: '2026-10-28T14:00:00Z',
  },
];

// Seed Leads
const SEED_LEADS: Lead[] = [
  {
    id: 'led_1',
    name: 'Naveen Singla',
    phone: '9812099881',
    alternatePhone: '9416088771',
    email: 'singla.traders@gmail.com',
    category: 'insurance',
    source: 'referral',
    status: 'follow_up',
    estimatedValue: 75000,
    assignedTo: 'user_ashish',
    followUpDate: getRelativeDate(0), // Follow up TODAY!
    followUpNote: 'Discuss LIC Jeevan Labh vs Term plan for his brother.',
    notes: [
      {
        id: 'ln_1',
        text: 'Referred by Ramesh Chandra. Very interested in tax saving 80C + 10(10D).',
        authorId: 'user_ashish',
        authorName: 'Ashish Panwar',
        createdAt: '2026-10-26T11:00:00Z',
      },
    ],
    archived: false,
    createdAt: '2026-10-26T11:00:00Z',
    updatedAt: '2026-10-30T10:00:00Z',
  },
  {
    id: 'led_2',
    name: 'Harish Juneja',
    phone: '9466011445',
    category: 'property',
    source: 'walk_in',
    status: 'contact_pending',
    estimatedValue: 120000,
    assignedTo: 'user_rahul',
    followUpDate: getRelativeDate(1),
    followUpNote: 'Call back to show videos of CHD City apartments.',
    notes: [],
    archived: false,
    createdAt: '2026-10-30T14:00:00Z',
    updatedAt: '2026-10-30T14:00:00Z',
  },
  {
    id: 'led_3',
    name: 'Meenakshi Batra',
    phone: '9896177223',
    email: 'meenakshi.b@outlook.com',
    category: 'both',
    source: 'social_media',
    status: 'interested',
    estimatedValue: 250000,
    assignedTo: 'user_priya',
    followUpDate: getRelativeDate(2),
    followUpNote: 'Needs family health policy 1 Cr and inquiring about commercial shops.',
    notes: [],
    archived: false,
    createdAt: '2026-10-28T09:00:00Z',
    updatedAt: '2026-10-28T09:00:00Z',
  },
];

// Seed Payments - Empty by default (All demo payments removed as requested)
const SEED_PAYMENTS: PaymentRecord[] = [];

// Seed Reminder Configurations
const SEED_REMINDER_CONFIGS: ReminderConfig[] = [
  { id: 'rem_prem_10', type: 'premium', daysBefore: 10, enabled: true, title: 'Insurance Premium 10 Days Prior' },
  { id: 'rem_prem_5', type: 'premium', daysBefore: 5, enabled: true, title: 'Insurance Premium 5 Days Prior' },
  { id: 'rem_prem_0', type: 'premium', daysBefore: 0, enabled: true, title: 'Insurance Premium Due Date Today' },
  { id: 'rem_renew_30', type: 'renewal', daysBefore: 30, enabled: true, title: 'Vehicle/Health Renewal 30 Days Advance' },
  { id: 'rem_renew_15', type: 'renewal', daysBefore: 15, enabled: true, title: 'Vehicle/Health Renewal 15 Days Advance' },
  { id: 'rem_renew_7', type: 'renewal', daysBefore: 7, enabled: true, title: 'Vehicle/Health Renewal 7 Days Critical' },
  { id: 'rem_mat_30', type: 'maturity', daysBefore: 30, enabled: true, title: 'LIC Policy Maturity 1 Month Advance' },
  { id: 'rem_bday_0', type: 'birthday', daysBefore: 0, enabled: true, title: 'Customer Birthday Morning Greeting' },
  { id: 'rem_visit_0', type: 'site_visit', daysBefore: 0, enabled: true, title: 'Property Site Visit Today Alert' },
];

// Seed Payment Barcode / QR Code Configurations (All 6 Accounts in Clean English)
export const SEED_QR_CONFIGS: QRCodeConfig[] = [
  // 1. Ashish Property
  {
    id: 'qr_ashish_property',
    category: 'property',
    ownerKey: 'ashish',
    ownerName: 'Ashish Panwar',
    shortLabel: 'Ashish - Property',
    title: 'Ashish Real Estate & Token Escrow',
    titleHi: 'Ashish Panwar - Property Deals & Escrow',
    upiId: 'ashish.property@icici',
    accountName: 'Ashish Real Estate & Builders',
    bankName: 'ICICI Bank Ltd (Property Escrow)',
    accountNumber: '50200088991122',
    ifscCode: 'ICIC0001234',
    colorTheme: 'amber',
    defaultMessageTemplate: `नमस्ते {clientName} जी,\n\nAshish Real Estate (Ashish Panwar) की ओर से आपकी प्रॉपर्टी डील ({entityTitle}) के टोकन/पेमेंट हेतु क्यूआर कोड:\n\n💰 राशि: ₹{amount}\n🏦 खाता नाम: Ashish Real Estate & Builders\n🏦 बैंक: ICICI Bank Ltd\n📲 UPI ID: {upiId}\n\nभुगतान के बाद स्क्रीनशॉट या UPI Ref No अवश्य शेयर करें।\n\nधन्यवाद,\nAshish Panwar | 9812033441\nAshish Real Estate, Karnal`,
    active: true,
  },
  // 2. Sheetal Property
  {
    id: 'qr_sheetal_property',
    category: 'property',
    ownerKey: 'sheetal',
    ownerName: 'Sheetal Panwar',
    shortLabel: 'Sheetal - Property',
    title: 'Sheetal Prime Properties & Registry Escrow',
    titleHi: 'Sheetal Panwar - Property & Registry Escrow',
    upiId: 'sheetal.property@hdfcbank',
    accountName: 'Sheetal Prime Properties & Realcon',
    bankName: 'HDFC Bank Ltd (Registry & Commercial)',
    accountNumber: '50100077884433',
    ifscCode: 'HDFC0002468',
    colorTheme: 'rose',
    defaultMessageTemplate: `नमस्ते {clientName} जी,\n\nSheetal Prime Properties (Sheetal Panwar) की ओर से आपकी प्रॉपर्टी डील ({entityTitle}) के भुगतान हेतु क्यूआर कोड:\n\n💰 देय राशि: ₹{amount}\n🏦 खाता नाम: Sheetal Prime Properties & Realcon\n🏦 बैंक: HDFC Bank Ltd\n📲 UPI ID: {upiId}\n\nभुगतान पश्चात कृपया UTR / Ref No भेजें।\n\nधन्यवाद,\nSheetal Panwar | 9812033442\nSheetal Properties, Karnal`,
    active: true,
  },
  // 3. Ashish Insurance
  {
    id: 'qr_ashish_insurance',
    category: 'insurance',
    ownerKey: 'ashish',
    ownerName: 'Ashish Panwar',
    shortLabel: 'Ashish - Insurance',
    title: 'Ashish Life Insurance & LIC Premium',
    titleHi: 'Ashish Panwar - Life Insurance & LIC',
    upiId: 'ashish.insurance@sbi',
    accountName: 'Ashish Insurance Consultancy',
    bankName: 'State Bank of India (LIC Agency)',
    accountNumber: '309988776655',
    ifscCode: 'SBIN0004321',
    colorTheme: 'blue',
    defaultMessageTemplate: `नमस्ते {clientName} जी,\n\nAshish Insurance Consultancy (LIC & Life Cover) की ओर से पॉलिसी ({entityTitle}) के प्रीमियम भुगतान हेतु क्यूआर कोड:\n\n💰 प्रीमियम राशि: ₹{amount}\n📅 अंतिम देय तिथि: {dueDate}\n🏦 खाता नाम: Ashish Insurance Consultancy\n🏦 बैंक: State Bank of India\n📲 UPI ID: {upiId}\n\nभुगतान करके UTR No साझा करें।\n\nधन्यवाद,\nAshish Panwar | 9812033441\nAshish Insurance, Karnal`,
    active: true,
  },
  // 4. Sheetal Insurance
  {
    id: 'qr_sheetal_insurance',
    category: 'insurance',
    ownerKey: 'sheetal',
    ownerName: 'Sheetal Panwar',
    shortLabel: 'Sheetal - Insurance',
    title: 'Sheetal Health & Motor Insurance',
    titleHi: 'Sheetal Panwar - Health & Motor Insurance',
    upiId: 'sheetal.insurance@icici',
    accountName: 'Sheetal Financial & Insurance Services',
    bankName: 'ICICI Bank Ltd (General & Health Collection)',
    accountNumber: '50100099887766',
    ifscCode: 'ICIC0005678',
    colorTheme: 'emerald',
    defaultMessageTemplate: `नमस्ते {clientName} जी,\n\nSheetal Insurance Services की ओर से आपकी पॉलिसी ({entityTitle}) के प्रीमियम भुगतान हेतु विवरण:\n\n💰 देय प्रीमियम: ₹{amount}\n📅 अंतिम तिथि: {dueDate}\n🏦 खाता नाम: Sheetal Financial & Insurance Services\n🏦 बैंक: ICICI Bank Ltd\n📲 UPI ID: {upiId}\n\nकृपया भुगतान के बाद स्क्रीनशॉट भेजें।\n\nधन्यवाद,\nSheetal Panwar | 9812033442\nSheetal Financial & Insurance Services, Karnal`,
    active: true,
  },
  // 5. Ashish General
  {
    id: 'qr_ashish_general',
    category: 'general',
    ownerKey: 'ashish',
    ownerName: 'Ashish Panwar',
    shortLabel: 'Ashish - General',
    title: 'Ashish Panwar Commercial & Trading',
    titleHi: 'Ashish Panwar - Commercial & Office Account',
    upiId: 'ashish.business@okaxis',
    accountName: 'Ashish Panwar Enterprise',
    bankName: 'Axis Bank Ltd (Current Account)',
    accountNumber: '918020033445566',
    ifscCode: 'UTIB0001234',
    colorTheme: 'purple',
    defaultMessageTemplate: `नमस्ते {clientName} जी,\n\nAshish Panwar Enterprise की ओर से सेवा शुल्क / भुगतान ({entityTitle}) हेतु विवरण:\n\n💰 कुल राशि: ₹{amount}\n🏦 खाता नाम: Ashish Panwar Enterprise\n🏦 बैंक: Axis Bank Ltd\n📲 UPI ID: {upiId}\n\nभुगतान उपरांत संदर्भ संख्या (Ref No) शेयर करें।\n\nधन्यवाद,\nAshish Panwar`,
    active: true,
  },
  // 6. Sheetal General
  {
    id: 'qr_sheetal_general',
    category: 'general',
    ownerKey: 'sheetal',
    ownerName: 'Sheetal Panwar',
    shortLabel: 'Sheetal - General',
    title: 'Sheetal Multi-Services & Agency',
    titleHi: 'Sheetal Panwar - Multi-Services & Agency',
    upiId: 'sheetal.agency@kotak',
    accountName: 'Sheetal Multi-Services Agency',
    bankName: 'Kotak Mahindra Bank',
    accountNumber: '661122334455',
    ifscCode: 'KKBK0009876',
    colorTheme: 'indigo',
    defaultMessageTemplate: `नमस्ते {clientName} जी,\n\nSheetal Multi-Services Agency की ओर से सेवा भुगतान ({entityTitle}) हेतु विवरण:\n\n💰 कुल राशि: ₹{amount}\n🏦 खाता नाम: Sheetal Multi-Services Agency\n🏦 बैंक: Kotak Mahindra Bank\n📲 UPI ID: {upiId}\n\nभुगतान उपरांत स्क्रीनशॉट या UPI संदर्भ संख्या शेयर करें।\n\nधन्यवाद,\nSheetal Panwar`,
    active: true,
  },
];

// Seed Audit Logs
const SEED_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud_1',
    timestamp: '2026-10-31T09:00:00Z',
    userId: 'user_ashish',
    userName: 'Ashish Panwar',
    userRole: 'main_super_admin',
    action: 'LOGIN',
    entityType: 'UserSession',
    details: 'Main Super Admin authenticated from secure workstation.',
  },
  {
    id: 'aud_2',
    timestamp: '2026-10-30T14:20:00Z',
    userId: 'user_sheetal',
    userName: 'Sheetal Panwar',
    userRole: 'main_super_admin',
    action: 'MODULE_CREATE',
    entityType: 'DynamicModule',
    entityId: 'mod_food_tiffin',
    entityTitle: 'Food & Catering Orders',
    details: 'Created custom business module for food catering and meal subscriptions with 7 custom fields.',
  },
];

class StorageService {
  private getItem<T>(key: string, fallback: T): T {
    try {
      const data = localStorage.getItem(key);
      if (!data) return fallback;
      return JSON.parse(data) as T;
    } catch {
      return fallback;
    }
  }

  private setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('Storage quota exceeded or private mode error:', e);
    }
  }

  // Initialize all storage on startup if empty
  public initialize(): void {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      this.setItem(STORAGE_KEYS.USERS, SEED_USERS);
    } else {
      const current = this.getItem<User[]>(STORAGE_KEYS.USERS, SEED_USERS);
      let updated = false;
      current.forEach((u) => {
        const seedMatch = SEED_USERS.find((su) => su.id === u.id);
        if (!u.pin || u.pin.length < 8) {
          u.pin = seedMatch?.pin || (u.pin ? u.pin.padEnd(8, '0') : '12345678');
          updated = true;
        }
      });
      // CRITICAL: Automatically merge any missing seed users (e.g. user_neha / CRM Executive)
      SEED_USERS.forEach((su) => {
        if (!current.some((cu) => cu.id === su.id)) {
          current.push(su);
          updated = true;
        }
      });
      if (updated) this.setItem(STORAGE_KEYS.USERS, current);
    }

    if (!localStorage.getItem(STORAGE_KEYS.MODULES)) {
      this.setItem(STORAGE_KEYS.MODULES, SEED_MODULES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CUSTOMERS)) {
      this.setItem(STORAGE_KEYS.CUSTOMERS, SEED_CUSTOMERS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.POLICIES)) {
      this.setItem(STORAGE_KEYS.POLICIES, SEED_POLICIES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.PROPERTIES)) {
      this.setItem(STORAGE_KEYS.PROPERTIES, SEED_PROPERTIES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.PROPERTY_LEADS)) {
      this.setItem(STORAGE_KEYS.PROPERTY_LEADS, SEED_PROPERTY_LEADS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.LEADS)) {
      this.setItem(STORAGE_KEYS.LEADS, SEED_LEADS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.PAYMENTS)) {
      this.setItem(STORAGE_KEYS.PAYMENTS, SEED_PAYMENTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.REMINDERS_CFG)) {
      this.setItem(STORAGE_KEYS.REMINDERS_CFG, SEED_REMINDER_CONFIGS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
      this.setItem(STORAGE_KEYS.AUDIT_LOGS, SEED_AUDIT_LOGS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID)) {
      this.setItem(STORAGE_KEYS.CURRENT_USER_ID, 'user_ashish');
    }
  }

  // Audit Log recording
  public logAudit(
    currentUser: User,
    action: AuditLog['action'],
    entityType: string,
    details: string,
    entityId?: string,
    entityTitle?: string
  ): void {
    const logs = this.getItem<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, []);
    const newLog: AuditLog = {
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action,
      entityType,
      entityId,
      entityTitle,
      details,
    };
    logs.unshift(newLog);
    // Keep max 500 logs
    if (logs.length > 500) logs.pop();
    this.setItem(STORAGE_KEYS.AUDIT_LOGS, logs);
  }

  public getAuditLogs(): AuditLog[] {
    return this.getItem<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, []);
  }

  // --- USERS & AUTH ---
  public getUsers(): User[] {
    const list = this.getItem<User[]>(STORAGE_KEYS.USERS, SEED_USERS);
    let updated = false;
    list.forEach((u) => {
      const seedMatch = SEED_USERS.find((su) => su.id === u.id);
      if (!u.pin || u.pin.length < 8) {
        u.pin = seedMatch?.pin || (u.pin ? u.pin.padEnd(8, '0') : '12345678');
        updated = true;
      }
    });
    SEED_USERS.forEach((su) => {
      if (!list.some((u) => u.id === su.id)) {
        list.push(su);
        updated = true;
      }
    });
    if (updated) {
      this.setItem(STORAGE_KEYS.USERS, list);
    }
    return list;
  }

  public getCurrentUserId(): string {
    return this.getItem<string>(STORAGE_KEYS.CURRENT_USER_ID, 'user_ashish');
  }

  public setCurrentUserId(id: string): void {
    this.setItem(STORAGE_KEYS.CURRENT_USER_ID, id);
    const users = this.getUsers();
    const user = users.find((u) => u.id === id);
    if (user) {
      this.logAudit(user, 'LOGIN', 'UserSession', `Switched active session to ${user.name} (${user.role})`);
    }
  }

  public updateUser(user: User, currentUser: User): void {
    const users = this.getUsers();
    const idx = users.findIndex((u) => u.id === user.id);
    if (idx !== -1) {
      users[idx] = user;
      this.setItem(STORAGE_KEYS.USERS, users);
      this.logAudit(
        currentUser,
        'UPDATE',
        'User',
        `Updated user account: ${user.name} (${user.role}, active: ${user.active})`,
        user.id,
        user.name
      );
    }
  }

  public addUser(user: User, currentUser: User): void {
    const users = this.getUsers();
    users.push(user);
    this.setItem(STORAGE_KEYS.USERS, users);
    this.logAudit(
      currentUser,
      'CREATE',
      'User',
      `Created new team account: ${user.name} with role ${user.role}`,
      user.id,
      user.name
    );
  }

  // --- DYNAMIC MODULES ---
  public getModules(): DynamicModule[] {
    return this.getItem<DynamicModule[]>(STORAGE_KEYS.MODULES, SEED_MODULES);
  }

  public saveModule(module: DynamicModule, currentUser: User, isNew = false): void {
    const modules = this.getModules();
    if (isNew) {
      modules.push(module);
      this.setItem(STORAGE_KEYS.MODULES, modules);
      this.logAudit(
        currentUser,
        'MODULE_CREATE',
        'DynamicModule',
        `Created module "${module.name}" with ${module.fields.length} custom fields`,
        module.id,
        module.name
      );
    } else {
      const idx = modules.findIndex((m) => m.id === module.id);
      if (idx !== -1) {
        modules[idx] = { ...module, updatedAt: new Date().toISOString() };
        this.setItem(STORAGE_KEYS.MODULES, modules);
        this.logAudit(
          currentUser,
          'MODULE_UPDATE',
          'DynamicModule',
          `Updated module "${module.name}" schema and settings`,
          module.id,
          module.name
        );
      }
    }
  }

  public deleteModule(moduleId: string, currentUser: User): void {
    let modules = this.getModules();
    const target = modules.find((m) => m.id === moduleId);
    if (target) {
      modules = modules.filter((m) => m.id !== moduleId);
      this.setItem(STORAGE_KEYS.MODULES, modules);
      this.logAudit(
        currentUser,
        'MODULE_DELETE',
        'DynamicModule',
        `Permanently deleted dynamic module "${target.name}" and removed all related configurations`,
        moduleId,
        target.name
      );
    }
  }

  // --- DYNAMIC RECORDS ---
  public getDynamicRecords(moduleId?: string): DynamicRecord[] {
    const records = this.getItem<DynamicRecord[]>(STORAGE_KEYS.DYNAMIC_RECORDS, []);
    if (moduleId) {
      return records.filter((r) => r.moduleId === moduleId);
    }
    return records;
  }

  public saveDynamicRecord(record: DynamicRecord, currentUser: User, isNew = false): void {
    const records = this.getItem<DynamicRecord[]>(STORAGE_KEYS.DYNAMIC_RECORDS, []);
    if (isNew) {
      records.unshift(record);
      this.setItem(STORAGE_KEYS.DYNAMIC_RECORDS, records);
      this.logAudit(
        currentUser,
        'CREATE',
        `DynamicRecord:${record.moduleId}`,
        `Created record "${record.title}"`,
        record.id,
        record.title
      );
    } else {
      const idx = records.findIndex((r) => r.id === record.id);
      if (idx !== -1) {
        records[idx] = { ...record, updatedAt: new Date().toISOString() };
        this.setItem(STORAGE_KEYS.DYNAMIC_RECORDS, records);
        this.logAudit(
          currentUser,
          'UPDATE',
          `DynamicRecord:${record.moduleId}`,
          `Updated record "${record.title}"`,
          record.id,
          record.title
        );
      }
    }
  }

  public deleteDynamicRecord(recordId: string, currentUser: User): void {
    let records = this.getItem<DynamicRecord[]>(STORAGE_KEYS.DYNAMIC_RECORDS, []);
    const target = records.find((r) => r.id === recordId);
    if (target) {
      records = records.filter((r) => r.id !== recordId);
      this.setItem(STORAGE_KEYS.DYNAMIC_RECORDS, records);
      this.logAudit(
        currentUser,
        'DELETE',
        `DynamicRecord:${target.moduleId}`,
        `Permanently deleted record "${target.title}"`,
        recordId,
        target.title
      );
    }
  }

  // --- CUSTOMERS ---
  public getCustomers(currentUser?: User): Customer[] {
    const customers = this.getItem<Customer[]>(STORAGE_KEYS.CUSTOMERS, SEED_CUSTOMERS);
    // If user lacks permission to view all, filter by assignedTo
    if (currentUser && currentUser.permissions && !currentUser.permissions.canViewAllData) {
      return customers.filter((c) => c.assignedTo === currentUser.id);
    }
    return customers;
  }

  public saveCustomer(customer: Customer, currentUser: User, isNew = false): void {
    const list = this.getItem<Customer[]>(STORAGE_KEYS.CUSTOMERS, SEED_CUSTOMERS);
    if (isNew) {
      list.unshift(customer);
      this.setItem(STORAGE_KEYS.CUSTOMERS, list);
      this.logAudit(
        currentUser,
        'CREATE',
        'Customer',
        `Added new customer profile: ${customer.name} (${customer.mobile})`,
        customer.id,
        customer.name
      );
    } else {
      const idx = list.findIndex((c) => c.id === customer.id);
      if (idx !== -1) {
        list[idx] = { ...customer, updatedAt: new Date().toISOString() };
        this.setItem(STORAGE_KEYS.CUSTOMERS, list);
        this.logAudit(
          currentUser,
          'UPDATE',
          'Customer',
          `Updated customer details for: ${customer.name}`,
          customer.id,
          customer.name
        );
      }
    }
  }

  public deleteCustomer(customerId: string, currentUser: User): void {
    let list = this.getItem<Customer[]>(STORAGE_KEYS.CUSTOMERS, SEED_CUSTOMERS);
    const target = list.find((c) => c.id === customerId);
    if (target) {
      list = list.filter((c) => c.id !== customerId);
      this.setItem(STORAGE_KEYS.CUSTOMERS, list);
      this.logAudit(
        currentUser,
        'DELETE',
        'Customer',
        `Permanently deleted customer ${target.name} and removed profile records`,
        customerId,
        target.name
      );
    }
  }

  // --- POLICIES ---
  public getPolicies(currentUser?: User): InsurancePolicy[] {
    const policies = this.getItem<InsurancePolicy[]>(STORAGE_KEYS.POLICIES, SEED_POLICIES);
    if (currentUser && currentUser.permissions && !currentUser.permissions.canViewAllData) {
      return policies.filter((p) => p.assignedTo === currentUser.id);
    }
    return policies;
  }

  public savePolicy(policy: InsurancePolicy, currentUser: User, isNew = false): void {
    const list = this.getItem<InsurancePolicy[]>(STORAGE_KEYS.POLICIES, SEED_POLICIES);
    if (isNew) {
      list.unshift(policy);
      this.setItem(STORAGE_KEYS.POLICIES, list);
      this.logAudit(
        currentUser,
        'CREATE',
        'InsurancePolicy',
        `Created policy #${policy.policyNumber} (${policy.insurerName} - ${policy.insuranceType}) for ${policy.customerName}`,
        policy.id,
        policy.policyNumber
      );
    } else {
      const idx = list.findIndex((p) => p.id === policy.id);
      if (idx !== -1) {
        list[idx] = { ...policy, updatedAt: new Date().toISOString() };
        this.setItem(STORAGE_KEYS.POLICIES, list);
        this.logAudit(
          currentUser,
          'UPDATE',
          'InsurancePolicy',
          `Updated policy #${policy.policyNumber}`,
          policy.id,
          policy.policyNumber
        );
      }
    }
  }

  public deletePolicy(policyId: string, currentUser: User): void {
    let list = this.getItem<InsurancePolicy[]>(STORAGE_KEYS.POLICIES, SEED_POLICIES);
    const target = list.find((p) => p.id === policyId);
    if (target) {
      list = list.filter((p) => p.id !== policyId);
      this.setItem(STORAGE_KEYS.POLICIES, list);
      this.logAudit(
        currentUser,
        'DELETE',
        'InsurancePolicy',
        `Permanently deleted policy #${target.policyNumber} (${target.planName})`,
        policyId,
        target.policyNumber
      );
    }
  }

  // --- PROPERTIES ---
  public getProperties(currentUser?: User): PropertyListing[] {
    const properties = this.getItem<PropertyListing[]>(STORAGE_KEYS.PROPERTIES, SEED_PROPERTIES);
    if (currentUser && currentUser.permissions && !currentUser.permissions.canViewAllData) {
      return properties.filter((p) => p.assignedTo === currentUser.id);
    }
    return properties;
  }

  public saveProperty(property: PropertyListing, currentUser: User, isNew = false): void {
    const list = this.getItem<PropertyListing[]>(STORAGE_KEYS.PROPERTIES, SEED_PROPERTIES);
    if (isNew) {
      list.unshift(property);
      this.setItem(STORAGE_KEYS.PROPERTIES, list);
      this.logAudit(
        currentUser,
        'CREATE',
        'PropertyListing',
        `Added property listing "${property.title}" in ${property.location}`,
        property.id,
        property.title
      );
    } else {
      const idx = list.findIndex((p) => p.id === property.id);
      if (idx !== -1) {
        list[idx] = { ...property, updatedAt: new Date().toISOString() };
        this.setItem(STORAGE_KEYS.PROPERTIES, list);
        this.logAudit(
          currentUser,
          'UPDATE',
          'PropertyListing',
          `Updated property listing "${property.title}"`,
          property.id,
          property.title
        );
      }
    }
  }

  public deleteProperty(propertyId: string, currentUser: User): void {
    let list = this.getItem<PropertyListing[]>(STORAGE_KEYS.PROPERTIES, SEED_PROPERTIES);
    const target = list.find((p) => p.id === propertyId);
    if (target) {
      list = list.filter((p) => p.id !== propertyId);
      this.setItem(STORAGE_KEYS.PROPERTIES, list);
      this.logAudit(
        currentUser,
        'DELETE',
        'PropertyListing',
        `Permanently deleted property "${target.title}"`,
        propertyId,
        target.title
      );
    }
  }

  // --- PROPERTY LEADS ---
  public getPropertyLeads(currentUser?: User): PropertyLead[] {
    const leads = this.getItem<PropertyLead[]>(STORAGE_KEYS.PROPERTY_LEADS, SEED_PROPERTY_LEADS);
    if (currentUser && currentUser.permissions && !currentUser.permissions.canViewAllData) {
      return leads.filter((l) => l.assignedTo === currentUser.id);
    }
    return leads;
  }

  public savePropertyLead(lead: PropertyLead, currentUser: User, isNew = false): void {
    const list = this.getItem<PropertyLead[]>(STORAGE_KEYS.PROPERTY_LEADS, SEED_PROPERTY_LEADS);
    if (isNew) {
      list.unshift(lead);
      this.setItem(STORAGE_KEYS.PROPERTY_LEADS, list);
      this.logAudit(
        currentUser,
        'CREATE',
        'PropertyLead',
        `Created property lead for ${lead.clientName} (${lead.leadType})`,
        lead.id,
        lead.clientName
      );
    } else {
      const idx = list.findIndex((l) => l.id === lead.id);
      if (idx !== -1) {
        list[idx] = { ...lead, updatedAt: new Date().toISOString() };
        this.setItem(STORAGE_KEYS.PROPERTY_LEADS, list);
        this.logAudit(
          currentUser,
          'UPDATE',
          'PropertyLead',
          `Updated property lead for ${lead.clientName}`,
          lead.id,
          lead.clientName
        );
      }
    }
  }

  public deletePropertyLead(leadId: string, currentUser: User): void {
    let list = this.getItem<PropertyLead[]>(STORAGE_KEYS.PROPERTY_LEADS, SEED_PROPERTY_LEADS);
    const target = list.find((l) => l.id === leadId);
    if (target) {
      list = list.filter((l) => l.id !== leadId);
      this.setItem(STORAGE_KEYS.PROPERTY_LEADS, list);
      this.logAudit(
        currentUser,
        'DELETE',
        'PropertyLead',
        `Deleted property lead for ${target.clientName}`,
        leadId,
        target.clientName
      );
    }
  }

  public clearSampleData(currentUser: User): {
    customers: number;
    policies: number;
    properties: number;
    propertyLeads: number;
  } {
    const seedCustIds = new Set(SEED_CUSTOMERS.map((c) => c.id));
    const seedPolIds = new Set(SEED_POLICIES.map((p) => p.id));
    const seedPropIds = new Set(SEED_PROPERTIES.map((pr) => pr.id));
    const seedPledIds = new Set(SEED_PROPERTY_LEADS.map((pl) => pl.id));
    const seedLedIds = new Set(SEED_LEADS.map((l) => l.id));
    const seedPayIds = new Set(SEED_PAYMENTS.map((pa) => pa.id));

    let customers = this.getItem<Customer[]>(STORAGE_KEYS.CUSTOMERS, SEED_CUSTOMERS);
    const origCust = customers.length;
    customers = customers.filter((c) => !seedCustIds.has(c.id));
    this.setItem(STORAGE_KEYS.CUSTOMERS, customers);

    let policies = this.getItem<InsurancePolicy[]>(STORAGE_KEYS.POLICIES, SEED_POLICIES);
    const origPol = policies.length;
    policies = policies.filter((p) => !seedPolIds.has(p.id));
    this.setItem(STORAGE_KEYS.POLICIES, policies);

    let properties = this.getItem<PropertyListing[]>(STORAGE_KEYS.PROPERTIES, SEED_PROPERTIES);
    const origProp = properties.length;
    properties = properties.filter((pr) => !seedPropIds.has(pr.id));
    this.setItem(STORAGE_KEYS.PROPERTIES, properties);

    let propertyLeads = this.getItem<PropertyLead[]>(STORAGE_KEYS.PROPERTY_LEADS, SEED_PROPERTY_LEADS);
    const origPled = propertyLeads.length;
    propertyLeads = propertyLeads.filter((pl) => !seedPledIds.has(pl.id));
    this.setItem(STORAGE_KEYS.PROPERTY_LEADS, propertyLeads);

    let leads = this.getItem<Lead[]>(STORAGE_KEYS.LEADS, SEED_LEADS);
    leads = leads.filter((l) => !seedLedIds.has(l.id));
    this.setItem(STORAGE_KEYS.LEADS, leads);

    this.clearAllDemoPayments(currentUser);

    this.logAudit(
      currentUser,
      'DELETE',
      'System',
      'Cleared all pre-loaded sample/demo data from the system'
    );

    return {
      customers: origCust - customers.length,
      policies: origPol - policies.length,
      properties: origProp - properties.length,
      propertyLeads: origPled - propertyLeads.length,
    };
  }

  // --- LEADS ---
  public getLeads(currentUser?: User): Lead[] {
    const leads = this.getItem<Lead[]>(STORAGE_KEYS.LEADS, SEED_LEADS);
    if (currentUser && currentUser.permissions && !currentUser.permissions.canViewAllData) {
      return leads.filter((l) => l.assignedTo === currentUser.id);
    }
    return leads;
  }

  public saveLead(lead: Lead, currentUser: User, isNew = false): void {
    const list = this.getItem<Lead[]>(STORAGE_KEYS.LEADS, SEED_LEADS);
    if (isNew) {
      list.unshift(lead);
      this.setItem(STORAGE_KEYS.LEADS, list);
      this.logAudit(
        currentUser,
        'CREATE',
        'Lead',
        `Added new business lead: ${lead.name} (${lead.category})`,
        lead.id,
        lead.name
      );
    } else {
      const idx = list.findIndex((l) => l.id === lead.id);
      if (idx !== -1) {
        list[idx] = { ...lead, updatedAt: new Date().toISOString() };
        this.setItem(STORAGE_KEYS.LEADS, list);
        this.logAudit(
          currentUser,
          'UPDATE',
          'Lead',
          `Updated lead: ${lead.name} (Status: ${lead.status})`,
          lead.id,
          lead.name
        );
      }
    }
  }

  public convertLeadToCustomer(leadId: string, currentUser: User): Customer | null {
    const leads = this.getLeads();
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return null;

    // Create new customer preserving history
    const newCustomer: Customer = {
      id: `cust_${Date.now()}`,
      name: lead.name,
      mobile: lead.phone,
      alternatePhone: lead.alternatePhone,
      email: lead.email,
      address: 'Address pending completion',
      city: 'Karnal',
      assignedTo: lead.assignedTo || currentUser.id,
      tags: ['Converted Lead', lead.category],
      notes: [
        ...(lead.notes || []),
        {
          id: `cn_${Date.now()}`,
          text: `Converted from lead on ${new Date().toLocaleDateString('en-IN')}. Lead source: ${lead.source}.`,
          authorId: currentUser.id,
          authorName: currentUser.name,
          createdAt: new Date().toISOString(),
        },
      ],
      archived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.saveCustomer(newCustomer, currentUser, true);

    // Mark lead as converted
    lead.status = 'converted';
    lead.convertedCustomerId = newCustomer.id;
    this.saveLead(lead, currentUser, false);

    this.logAudit(
      currentUser,
      'UPDATE',
      'Lead',
      `Converted lead "${lead.name}" to official Customer profile (ID: ${newCustomer.id})`,
      lead.id,
      lead.name
    );

    return newCustomer;
  }

  public deleteLead(leadId: string, currentUser: User): void {
    let list = this.getItem<Lead[]>(STORAGE_KEYS.LEADS, SEED_LEADS);
    const target = list.find((l) => l.id === leadId);
    if (target) {
      list = list.filter((l) => l.id !== leadId);
      this.setItem(STORAGE_KEYS.LEADS, list);
      this.logAudit(
        currentUser,
        'DELETE',
        'Lead',
        `Permanently deleted lead ${target.name}`,
        leadId,
        target.name
      );
    }
  }

  // --- PAYMENTS ---
  public getPayments(): PaymentRecord[] {
    const list = this.getItem<PaymentRecord[]>(STORAGE_KEYS.PAYMENTS, []);
    const DEMO_PAYMENT_PREFIXES = [
      'pay_today_',
      'pay_yest_',
      'pay_oct_',
      'pay_sep_',
      'pay_aug_',
      'pay_jul_',
      'pay_jun_',
      'pay_may_',
      'pay_mar_',
      'pay_feb_',
      'pay_jan_',
      'pay_pend_',
      'pay_overdue_',
      'pay_1',
      'pay_2',
      'pay_3',
      'pay_4',
    ];
    // Filter out all demo payments that are not real
    const cleaned = list.filter(
      (p) =>
        !DEMO_PAYMENT_PREFIXES.some(
          (prefix) => p.id === prefix || p.id.startsWith(prefix)
        )
    );
    if (cleaned.length !== list.length) {
      this.setItem(STORAGE_KEYS.PAYMENTS, cleaned);
    }
    return cleaned;
  }

  public clearAllDemoPayments(currentUser?: User): number {
    const list = this.getItem<PaymentRecord[]>(STORAGE_KEYS.PAYMENTS, []);
    const DEMO_PAYMENT_PREFIXES = [
      'pay_today_',
      'pay_yest_',
      'pay_oct_',
      'pay_sep_',
      'pay_aug_',
      'pay_jul_',
      'pay_jun_',
      'pay_may_',
      'pay_mar_',
      'pay_feb_',
      'pay_jan_',
      'pay_pend_',
      'pay_overdue_',
      'pay_1',
      'pay_2',
      'pay_3',
      'pay_4',
    ];
    const cleaned = list.filter(
      (p) =>
        !DEMO_PAYMENT_PREFIXES.some(
          (prefix) => p.id === prefix || p.id.startsWith(prefix)
        )
    );
    const count = list.length - cleaned.length;
    this.setItem(STORAGE_KEYS.PAYMENTS, cleaned);
    if (currentUser) {
      this.logAudit(
        currentUser,
        'DELETE',
        'PaymentRecord',
        `Cleared all ${count} demo/sample payment records`
      );
    }
    return count;
  }

  public savePayment(payment: PaymentRecord, currentUser: User, isNew = false): void {
    const list = this.getPayments();
    if (isNew) {
      list.unshift(payment);
      this.setItem(STORAGE_KEYS.PAYMENTS, list);
      this.logAudit(
        currentUser,
        'CREATE',
        'PaymentRecord',
        `Logged payment record of ₹${payment.amount} for ${payment.customerName}`,
        payment.id,
        payment.entityTitle
      );
    } else {
      const idx = list.findIndex((p) => p.id === payment.id);
      if (idx !== -1) {
        list[idx] = payment;
        this.setItem(STORAGE_KEYS.PAYMENTS, list);
        this.logAudit(
          currentUser,
          'UPDATE',
          'PaymentRecord',
          `Updated payment of ₹${payment.amount} (Status: ${payment.status}, Ref: ${payment.referenceNumber || 'N/A'})`,
          payment.id,
          payment.entityTitle
        );
      }
    }
  }

  public deletePayment(paymentId: string, currentUser: User): void {
    let list = this.getPayments();
    const target = list.find((p) => p.id === paymentId);
    if (target) {
      list = list.filter((p) => p.id !== paymentId);
      this.setItem(STORAGE_KEYS.PAYMENTS, list);
      this.logAudit(
        currentUser,
        'DELETE',
        'PaymentRecord',
        `Deleted payment record for ${target.customerName} (₹${target.amount})`,
        paymentId,
        target.entityTitle
      );
    }
  }

  // --- REMINDERS CONFIG ---
  public getReminderConfigs(): ReminderConfig[] {
    return this.getItem<ReminderConfig[]>(STORAGE_KEYS.REMINDERS_CFG, SEED_REMINDER_CONFIGS);
  }

  public updateReminderConfigs(configs: ReminderConfig[], currentUser: User): void {
    this.setItem(STORAGE_KEYS.REMINDERS_CFG, configs);
    this.logAudit(currentUser, 'UPDATE', 'ReminderConfig', 'Updated system reminder alert intervals');
  }

  // --- QR CODE & BARCODE MANAGER ---
  public getQRConfigs(): QRCodeConfig[] {
    const isMigrated = this.getItem<boolean>('as_qr_configs_migrated_v2', false);
    const list = this.getItem<QRCodeConfig[]>(STORAGE_KEYS.QR_CONFIGS, null as any);

    if (!isMigrated || !list || list.length < 6 || !list.some((q) => q.id === 'qr_sheetal_property')) {
      const hasOldHindi = list && list.some(
        (q: QRCodeConfig) =>
          (q.shortLabel && (q.shortLabel.includes('आशीष') || q.shortLabel.includes('शीतल') || q.shortLabel.includes('खाता'))) ||
          (q.titleHi && (q.titleHi.includes('खाता') || q.titleHi.includes('आशीष -') || q.titleHi.includes('शीतल -')))
      );
      if (!list || list.length < 6 || hasOldHindi) {
        this.setItem(STORAGE_KEYS.QR_CONFIGS, SEED_QR_CONFIGS);
        this.setItem('as_qr_configs_migrated_v2', true);
        return SEED_QR_CONFIGS;
      }
      this.setItem('as_qr_configs_migrated_v2', true);
    }
    return list;
  }

  public saveQRConfigs(configs: QRCodeConfig[], currentUser: User): void {
    this.setItem(STORAGE_KEYS.QR_CONFIGS, configs);
    this.setItem('as_qr_configs_migrated_v2', true);
    this.logAudit(
      currentUser,
      'UPDATE',
      'QRCodeConfig',
      `Updated ${configs.length} payment QR codes and custom account labels`
    );
  }

  public resetQRConfigToDefault(accountId: string, currentUser: User): QRCodeConfig[] {
    const list = this.getQRConfigs();
    const seed = SEED_QR_CONFIGS.find((q) => q.id === accountId);
    if (!seed) return list;
    const updated = list.map((q) => (q.id === accountId ? { ...seed } : q));
    this.saveQRConfigs(updated, currentUser);
    return updated;
  }

  public resetAllQRConfigs(currentUser: User): QRCodeConfig[] {
    this.saveQRConfigs(SEED_QR_CONFIGS, currentUser);
    return SEED_QR_CONFIGS;
  }

  // --- DAILY WORK & CALLING QUEUE DYNAMIC GENERATOR ---
  public getDailyWorkQueue(currentUser?: User): DailyWorkItem[] {
    const items: DailyWorkItem[] = [];
    const todayStr = new Date().toISOString().split('T')[0];

    const customers = this.getCustomers(currentUser);
    const policies = this.getPolicies(currentUser);
    const propertyLeads = this.getPropertyLeads(currentUser);
    const leads = this.getLeads(currentUser);

    // 1. Customer Birthdays Today!
    customers.forEach((cust) => {
      if (cust.dob) {
        const d = new Date(cust.dob);
        const now = new Date();
        if (d.getDate() === now.getDate() && d.getMonth() === now.getMonth()) {
          items.push({
            id: `work_bday_${cust.id}`,
            title: `🎂 Birthday Today: ${cust.name}`,
            type: 'birthday',
            clientName: cust.name,
            phone: cust.mobile,
            dueDate: todayStr,
            status: 'pending',
            priority: 'medium',
            assignedTo: cust.assignedTo,
            relatedId: cust.id,
            relatedType: 'Customer',
            metadata: {
              dob: cust.dob,
              whatsapp: cust.whatsapp || cust.mobile,
            },
          });
        }
      }
    });

    const allUsers = this.getUsers();

    // 2. Overdue Policies & Premiums Due Today or soon
    policies.forEach((pol) => {
      if (pol.status === 'lapsed' || pol.status === 'matured' || pol.status === 'claim_settled') return;
      const targetDate = new Date(pol.renewalDate);
      const now = new Date();
      targetDate.setHours(0, 0, 0, 0);
      now.setHours(0, 0, 0, 0);
      const diffDays = Math.round((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const agentUser = allUsers.find((u) => u.id === pol.assignedTo);
      const agentName = agentUser ? agentUser.name : 'Office Admin';

      if (diffDays < 0) {
        // Overdue!
        items.push({
          id: `work_overdue_${pol.id}`,
          title: `⚠️ Overdue Premium: ${pol.planName} (#${pol.policyNumber})`,
          type: 'premium_due',
          clientName: pol.customerName,
          phone: pol.customerPhone,
          dueDate: pol.renewalDate,
          status: 'pending',
          priority: 'high',
          assignedTo: pol.assignedTo,
          relatedId: pol.id,
          relatedType: 'InsurancePolicy',
          metadata: {
            policyNumber: pol.policyNumber,
            planName: pol.planName,
            insurer: pol.insurerName,
            amount: pol.premiumAmount,
            lastDate: pol.renewalDate,
            diffDays: diffDays,
            overdueDays: Math.abs(diffDays),
            assignedAgentName: agentName,
          },
        });
      } else if (diffDays <= 5) {
        // Due today or in 5 days
        items.push({
          id: `work_due_${pol.id}`,
          title: `🔔 Premium Due (${diffDays === 0 ? 'TODAY' : `in ${diffDays} days`}): ${pol.planName}`,
          type: 'premium_due',
          clientName: pol.customerName,
          phone: pol.customerPhone,
          dueDate: pol.renewalDate,
          status: 'pending',
          priority: diffDays === 0 ? 'high' : 'medium',
          assignedTo: pol.assignedTo,
          relatedId: pol.id,
          relatedType: 'InsurancePolicy',
          metadata: {
            policyNumber: pol.policyNumber,
            planName: pol.planName,
            insurer: pol.insurerName,
            amount: pol.premiumAmount,
            lastDate: pol.renewalDate,
            daysLeft: diffDays,
            diffDays: diffDays,
            assignedAgentName: agentName,
          },
        });
      } else if (pol.insuranceType === 'bike' || pol.insuranceType === 'car' || pol.insuranceType === 'health') {
        if (diffDays <= 15) {
          items.push({
            id: `work_renew_${pol.id}`,
            title: `🛡️ Renewal in ${diffDays} days: ${pol.planName} (${pol.vehicleNumber || 'Policy'})`,
            type: 'renewal',
            clientName: pol.customerName,
            phone: pol.customerPhone,
            dueDate: pol.renewalDate,
            status: 'pending',
            priority: diffDays <= 7 ? 'high' : 'medium',
            assignedTo: pol.assignedTo,
            relatedId: pol.id,
            relatedType: 'InsurancePolicy',
            metadata: {
              policyNumber: pol.policyNumber,
              planName: pol.planName,
              insurer: pol.insurerName,
              vehicleNumber: pol.vehicleNumber,
              amount: pol.premiumAmount,
              lastDate: pol.renewalDate,
              daysLeft: diffDays,
              diffDays: diffDays,
              assignedAgentName: agentName,
            },
          });
        }
      }
    });

    // 3. Property Site Visits Scheduled Today
    propertyLeads.forEach((pl) => {
      if (pl.siteVisits) {
        pl.siteVisits.forEach((sv) => {
          if (sv.scheduledAt && sv.scheduledAt.startsWith(todayStr) && sv.status === 'scheduled') {
            items.push({
              id: `work_visit_${sv.id}`,
              title: `📍 Site Visit: ${sv.propertyTitle || 'Property'} with ${sv.clientName}`,
              type: 'site_visit',
              clientName: sv.clientName,
              phone: sv.phone,
              dueDate: sv.scheduledAt,
              status: 'pending',
              priority: 'high',
              assignedTo: pl.assignedTo,
              relatedId: pl.id,
              relatedType: 'PropertyLead',
              metadata: {
                propertyTitle: sv.propertyTitle,
                conductedBy: sv.conductedBy,
              },
            });
          }
        });
      }
    });

    // 4. Lead Follow-ups Scheduled Today
    leads.forEach((l) => {
      if (l.followUpDate && (l.followUpDate === todayStr || l.followUpDate < todayStr) && l.status !== 'converted' && l.status !== 'not_interested') {
        items.push({
          id: `work_lead_${l.id}`,
          title: `📞 Follow-up Call: ${l.name} (${l.category.toUpperCase()})`,
          type: 'lead_followup',
          clientName: l.name,
          phone: l.phone,
          dueDate: l.followUpDate,
          status: 'pending',
          priority: 'high',
          assignedTo: l.assignedTo,
          relatedId: l.id,
          relatedType: 'Lead',
          notes: l.followUpNote,
        });
      }
    });

    return items;
  }

  // --- BACKUP & RESTORE ---
  public exportFullDatabase(fromDate?: string, toDate?: string): string {
    const isWithinRange = (dateStr?: string) => {
      if (!fromDate && !toDate) return true;
      if (!dateStr) return true;
      const d = dateStr.slice(0, 10);
      if (fromDate && d < fromDate) return false;
      if (toDate && d > toDate) return false;
      return true;
    };

    const customers = this.getCustomers().filter((c) => isWithinRange(c.createdAt));
    const policies = this.getPolicies().filter((p) => isWithinRange(p.createdAt || p.startDate));
    const properties = this.getProperties().filter((p) => isWithinRange(p.createdAt));
    const propertyLeads = this.getPropertyLeads().filter((pl) => isWithinRange(pl.createdAt));
    const leads = this.getLeads().filter((l) => isWithinRange(l.createdAt));
    const payments = this.getPayments().filter((pay) => isWithinRange(pay.createdAt || pay.paymentDate || pay.dueDate));
    const dynamicRecords = this.getDynamicRecords().filter((dr) => isWithinRange(dr.createdAt));
    const auditLogs = this.getAuditLogs().filter((al) => isWithinRange(al.timestamp));

    const backupData = {
      exportTimestamp: new Date().toISOString(),
      platform: 'ASHISH SHEETAL ALL-IN-ONE',
      version: '1.0.0',
      dateFilter: {
        fromDate: fromDate || 'ALL_TIME',
        toDate: toDate || 'ALL_TIME',
      },
      summary: {
        customers: customers.length,
        policies: policies.length,
        properties: properties.length,
        propertyLeads: propertyLeads.length,
        leads: leads.length,
        payments: payments.length,
        dynamicRecords: dynamicRecords.length,
        auditLogs: auditLogs.length,
      },
      users: this.getUsers(),
      modules: this.getModules(),
      dynamicRecords,
      customers,
      policies,
      properties,
      propertyLeads,
      leads,
      payments,
      remindersCfg: this.getReminderConfigs(),
      auditLogs,
    };
    return JSON.stringify(backupData, null, 2);
  }

  public restoreFullDatabase(jsonString: string, currentUser: User): { success: boolean; message: string } {
    try {
      const data = JSON.parse(jsonString);
      if (!data.platform || !data.version) {
        return { success: false, message: 'Invalid backup file format. Platform signature missing.' };
      }

      if (data.users) this.setItem(STORAGE_KEYS.USERS, data.users);
      if (data.modules) this.setItem(STORAGE_KEYS.MODULES, data.modules);
      if (data.dynamicRecords) this.setItem(STORAGE_KEYS.DYNAMIC_RECORDS, data.dynamicRecords);
      if (data.customers) this.setItem(STORAGE_KEYS.CUSTOMERS, data.customers);
      if (data.policies) this.setItem(STORAGE_KEYS.POLICIES, data.policies);
      if (data.properties) this.setItem(STORAGE_KEYS.PROPERTIES, data.properties);
      if (data.propertyLeads) this.setItem(STORAGE_KEYS.PROPERTY_LEADS, data.propertyLeads);
      if (data.leads) this.setItem(STORAGE_KEYS.LEADS, data.leads);
      if (data.payments) this.setItem(STORAGE_KEYS.PAYMENTS, data.payments);
      if (data.remindersCfg) this.setItem(STORAGE_KEYS.REMINDERS_CFG, data.remindersCfg);
      if (data.auditLogs) this.setItem(STORAGE_KEYS.AUDIT_LOGS, data.auditLogs);

      this.logAudit(
        currentUser,
        'RESTORE_BACKUP',
        'DatabaseBackup',
        `Successfully restored full database backup from file created on ${data.exportTimestamp || 'unknown date'}`
      );

      return { success: true, message: 'Database restored successfully! All records, modules, and logs updated.' };
    } catch (e: any) {
      return { success: false, message: `Restore failed: ${e.message || 'Corrupted JSON data'}` };
    }
  }

  public resetToFactoryDefaults(currentUser: User): void {
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.MODULES);
    localStorage.removeItem(STORAGE_KEYS.DYNAMIC_RECORDS);
    localStorage.removeItem(STORAGE_KEYS.CUSTOMERS);
    localStorage.removeItem(STORAGE_KEYS.POLICIES);
    localStorage.removeItem(STORAGE_KEYS.PROPERTIES);
    localStorage.removeItem(STORAGE_KEYS.PROPERTY_LEADS);
    localStorage.removeItem(STORAGE_KEYS.LEADS);
    localStorage.removeItem(STORAGE_KEYS.PAYMENTS);
    localStorage.removeItem(STORAGE_KEYS.REMINDERS_CFG);
    localStorage.removeItem(STORAGE_KEYS.AUDIT_LOGS);
    this.initialize();
    this.logAudit(currentUser, 'UPDATE', 'System', 'Reset application database to initial factory state.');
  }
}

export const storage = new StorageService();
// Initialize immediately on module load
storage.initialize();
