/**
 * WhatsApp Quick-Action Generator
 * Generates formatted WhatsApp web/mobile links with friendly bilingual messages
 */

export function cleanPhoneNumber(phone: string): string {
  // Strip non-digits
  const digits = phone.replace(/\D/g, '');
  // If Indian number without country code (10 digits), prepend 91
  if (digits.length === 10) {
    return `91${digits}`;
  }
  return digits;
}

export function generateWhatsAppUrl(phone: string, message: string): string {
  const cleaned = cleanPhoneNumber(phone);
  const encoded = encodeURIComponent(message.trim());
  return `https://wa.me/${cleaned}?text=${encoded}`;
}

export function getPremiumReminderMessage(
  customerName: string,
  policyNumber: string,
  insurer: string,
  amount: number,
  dueDate: string,
  lang: 'en' | 'hi' = 'en'
): string {
  const formattedAmount = `₹${amount.toLocaleString('en-IN')}`;
  
  if (lang === 'hi') {
    return `नमस्ते ${customerName} जी,\n\nयह आपके ${insurer} पॉलिसी (नंबर: ${policyNumber}) के प्रीमियम भुगतान का स्मरण पत्र है।\n\n📌 प्रीमियम राशि: ${formattedAmount}\n📅 देय तिथि: ${dueDate}\n\nसमय पर प्रीमियम जमा कराकर अपनी पॉलिसी और वित्तीय सुरक्षा जारी रखें। किसी भी सहायता के लिए संपर्क करें।\n\nसादर,\nआशीष शीतल ऑल-इन-वन ऑफिस`;
  }

  return `Dear ${customerName},\n\nThis is a gentle reminder regarding your upcoming premium payment for ${insurer} Policy #${policyNumber}.\n\n📌 Amount Due: ${formattedAmount}\n📅 Due Date: ${dueDate}\n\nPlease ensure timely payment to keep your coverage and benefits active uninterrupted.\n\nWarm regards,\nAshish Sheetal Management Office`;
}

export function getRenewalReminderMessage(
  customerName: string,
  policyType: string,
  policyNumber: string,
  expiryDate: string,
  lang: 'en' | 'hi' = 'en'
): string {
  if (lang === 'hi') {
    return `नमस्ते ${customerName} जी,\n\nआपकी ${policyType} पॉलिसी (नंबर: ${policyNumber}) दिनांक ${expiryDate} को समाप्त हो रही है।\n\nसमय पर नवीनीकरण कराएं ताकि नो-क्लेम बोनस (NCB) या निरंतरता लाभ में कोई व्यवधान न आए।\n\nसादर,\nआशीष शीतल टीम`;
  }

  return `Dear ${customerName},\n\nThis is an advance notice that your ${policyType} policy #${policyNumber} is scheduled for renewal on ${expiryDate}.\n\nKindly contact us to review discounts, NCB benefits, and seamlessly renew your coverage.\n\nBest regards,\nAshish Sheetal Team`;
}

export function getBirthdayWishMessage(
  customerName: string,
  lang: 'en' | 'hi' = 'en'
): string {
  if (lang === 'hi') {
    return `प्रिय ${customerName} जी,\n\nआपको जन्मदिन की हार्दिक शुभकामनाएं! 🎂🎉\nईश्वर से आपके उत्तम स्वास्थ्य, दीर्घायु एवं अपार समृद्धि की मंगल कामना करते हैं।\n\nसस्नेह,\nआशीष व शीतल एवं समस्त परिवार`;
  }

  return `Dear ${customerName},\n\nWishing you a very Happy Birthday! 🎂🎉\nMay your year ahead be blessed with excellent health, great joy, and prosperous achievements.\n\nWarmest wishes,\nAshish & Sheetal Family`;
}

export function getPropertyShareMessage(
  clientName: string,
  propertyTitle: string,
  propertyType: string,
  location: string,
  price: number,
  area: string,
  lang: 'en' | 'hi' = 'en'
): string {
  const priceFormatted = `₹${price.toLocaleString('en-IN')}`;
  
  if (lang === 'hi') {
    return `नमस्ते ${clientName} जी,\n\nआपकी पसंद के अनुसार यह उत्कृष्ट प्रॉपर्टी विवरण साझा कर रहे हैं:\n\n🏡 शीर्षक: ${propertyTitle}\n📍 स्थान: ${location}\n📐 क्षेत्रफल: ${area}\n💰 मांग मूल्य: ${priceFormatted}\n\nसाइट विजिट या अतिरिक्त विवरण के लिए संपर्क करें।\n\nसादर,\nआशीष शीतल रियल एस्टेट`;
  }

  return `Hello ${clientName},\n\nSharing details of a prime property matching your preferences:\n\n🏡 Title: ${propertyTitle}\n📍 Location: ${location}\n📐 Area: ${area}\n💰 Asking Price: ${priceFormatted}\n\nPlease let us know if you would like to schedule a site visit.\n\nBest regards,\nAshish Sheetal Real Estate`;
}

export function getLeadFollowUpMessage(
  leadName: string,
  topic: string,
  lang: 'en' | 'hi' = 'en'
): string {
  if (lang === 'hi') {
    return `नमस्ते ${leadName} जी,\n\nहमारे बीच ${topic} के संबंध में हुई चर्चा के संदर्भ में संपर्क किया है। क्या इस पर आगे बात करने के लिए आज का कोई समय उपयुक्त रहेगा?\n\nसादर,\nआशीष शीतल ऑफिस`;
  }

  return `Hello ${leadName},\n\nFollowing up on our recent conversation regarding ${topic}. Please let me know what time works best for a brief discussion today.\n\nBest regards,\nAshish Sheetal Office`;
}
