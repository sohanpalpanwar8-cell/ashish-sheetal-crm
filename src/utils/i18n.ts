/**
 * Bilingual Support: English and Hindi
 */

export type Language = 'en' | 'hi';

export const translations = {
  en: {
    appName: 'ASHISH SHEETAL ALL-IN-ONE',
    appSubtitle: 'Personal & Business Management Platform',
    dashboard: 'Executive Dashboard',
    insurance: 'Insurance Management',
    properties: 'Property Management',
    customers: 'Customer CRM',
    leads: 'Lead Management',
    dailyWork: "Today's Work & Calling",
    payments: 'Payments & Receipts',
    moduleBuilder: 'Dynamic Module Builder',
    teamManagement: 'Team & CRM Access Hub',
    reports: 'Reports & Analytics',
    reminders: 'Reminders & Alerts',
    settings: 'Settings & Backups',
    auditLogs: 'Audit Trail',

    // Common actions
    add: 'Add New',
    edit: 'Edit',
    delete: 'Delete',
    archive: 'Archive',
    restore: 'Restore',
    search: 'Search...',
    filter: 'Filter',
    export: 'Export CSV',
    save: 'Save Changes',
    cancel: 'Cancel',
    confirm: 'Confirm',
    call: 'Call',
    whatsapp: 'WhatsApp',
    done: 'Done',
    reschedule: 'Reschedule',
    addNote: 'Add Note',
    viewDetails: 'View Details',
    totalRecords: 'Total Records',
    status: 'Status',
    actions: 'Actions',

    // Role names
    main_super_admin: 'Main Super Admin',
    admin: 'Admin',
    team_manager: 'Team Manager',
    agent: 'Field Agent',
    crm_executive: 'CRM Executive & Telecaller',
    readonly: 'Read Only',

    // Insurance tabs
    lic_traditional: 'LIC & Traditional Life',
    term: 'Term Insurance',
    bike: 'Two-Wheeler / Bike',
    car: 'Four-Wheeler / Car',
    health: 'Health & Mediclaim',
    travel: 'Travel Insurance',
    other_insurance: 'General / Other',

    // Property tabs
    allProperties: 'All Properties',
    plots: 'Plots & Land',
    residential: 'Houses & Flats',
    commercial: 'Commercial & Shops',
    propertyLeads: 'Buyer/Seller Leads',
    siteVisits: 'Site Visits',

    // Work filters
    allTasks: 'All Items',
    premiumsDue: 'Premiums Due',
    expiringPolicies: 'Policy Renewals',
    leadsToday: 'Lead Follow-ups',
    birthdaysToday: 'Birthdays Today',

    // Notice & Safety
    permanentDeleteWarning: 'This action is permanent and cannot be undone. Please confirm by typing the confirmation keyword.',
    confirmDelete: 'Permanent Delete',
    backupNotice: 'It is recommended to take a backup before permanent deletions.',
    unverifiedPaymentNote: 'Payment status is marked as recorded. Official insurer/bank verification requires statement reconciliation.',
  },
  hi: {
    appName: 'आशीष शीतल ऑल-इन-वन',
    appSubtitle: 'पर्सनल एवं बिजनेस मैनेजमेंट प्लेटफॉर्म',
    dashboard: 'मुख्य डैशबोर्ड',
    insurance: 'बीमा प्रबंधन (Insurance)',
    properties: 'प्रॉपर्टी प्रबंधन (Real Estate)',
    customers: 'ग्राहक सूची (CRM)',
    leads: 'लीड्स प्रबंधन (Leads)',
    dailyWork: 'दैनिक कॉलिंग एवं कार्य',
    payments: 'भुगतान एवं रसीदें',
    moduleBuilder: 'नया मॉड्यूल बिल्डर',
    teamManagement: 'टीम व CRM एक्सेस केंद्र (Team & CRM)',
    reports: 'रिपोर्ट्स एवं विश्लेषण',
    reminders: 'रिमाइंडर एवं अलर्ट',
    settings: 'सेटिंग्स एवं बैकअप',
    auditLogs: 'ऑडिट लॉग (Audit Trail)',

    // Common actions
    add: 'नया जोड़ें',
    edit: 'संपादित करें',
    delete: 'हटाएं',
    archive: 'पुरालेख (Archive)',
    restore: 'पुनर्स्थापित करें',
    search: 'खोजें...',
    filter: 'फ़िल्टर',
    export: 'CSV डाउनलोड करें',
    save: 'सहेजें',
    cancel: 'रद्द करें',
    confirm: 'पुष्टि करें',
    call: 'कॉल करें',
    whatsapp: 'व्हाट्सएप',
    done: 'पूर्ण हुआ',
    reschedule: 'समय बदलें',
    addNote: 'नोट जोड़ें',
    viewDetails: 'विवरण देखें',
    totalRecords: 'कुल रिकॉर्ड्स',
    status: 'स्थिति',
    actions: 'क्रियाएं',

    // Role names
    main_super_admin: 'मुख्य सुपर एडमिन (मालिक)',
    admin: 'व्यवस्थापक (Admin)',
    team_manager: 'टीम मैनेजर',
    agent: 'फील्ड एजेंट',
    crm_executive: 'सीआरएम टेलीकॉलर (CRM Executive)',
    readonly: 'केवल पढ़ने योग्य',

    // Insurance tabs
    lic_traditional: 'LIC एवं पारम्परिक जीवन बीमा',
    term: 'टर्म इंश्योरेंस (Term Plan)',
    bike: 'बाइक / दोपहिया बीमा',
    car: 'कार / चौपहिया बीमा',
    health: 'स्वास्थ्य एवं मेडिक्लेम',
    travel: 'यात्रा बीमा (Travel)',
    other_insurance: 'सामान्य एवं अन्य',

    // Property tabs
    allProperties: 'सभी संपत्तियां',
    plots: 'प्लॉट एवं ज़मीन',
    residential: 'मकान एवं फ्लैट',
    commercial: 'दुकान एवं व्यावसायिक',
    propertyLeads: 'खरीदार/विक्रेता ग्राहक',
    siteVisits: 'साइट विजिट्स',

    // Work filters
    allTasks: 'सभी कार्य',
    premiumsDue: 'प्रीमियम बकाया',
    expiringPolicies: 'पॉलिसी नवीनीकरण',
    leadsToday: 'आज के फॉलो-अप',
    birthdaysToday: 'आज के जन्मदिन',

    // Notice & Safety
    permanentDeleteWarning: 'यह क्रिया स्थायी है और इसे वापस नहीं लिया जा सकता। पुष्टि हेतु शब्द दर्ज करें।',
    confirmDelete: 'स्थायी रूप से हटाएं',
    backupNotice: 'स्थायी विलोपन से पहले सिस्टम बैकअप लेने की सलाह दी जाती है।',
    unverifiedPaymentNote: 'भुगतान दर्ज किया गया है। बैंक या बीमा कंपनी के वास्तविक समाधान तक यह रिकॉर्ड आंतरिक है।',
  },
};
