/**
 * Multi-Lingual Farmer ID Card (AgriStack / State Farmer Registries) Configuration
 * Supports national languages for state-specific Farmer Registries across India.
 */

export type FarmerLanguageCode =
  | 'HI'
  | 'EN'
  | 'PA'
  | 'GU'
  | 'MR'
  | 'TA'
  | 'KN'
  | 'BN'
  | 'TE'
  | 'OR'
  | 'ML'
  | 'AS';

export interface FarmerLanguageConfig {
  code: FarmerLanguageCode;
  name: string;
  nativeName: string;
  headerTitle: {
    regional: string;
    english: string;
  };
  ministryTitle: {
    regional: string;
    english: string;
  };
  defaultRegistryTitle: string;
  labels: {
    name: string;
    nameEnglish: string;
    gender: string;
    dob: string;
    caste: string;
    area: string;
    aadhaar: string;
    farmerId: string;
    approvalDate: string;
    downloadDate: string;
    address: string;
    khata: string;
    khasra: string;
    areaParcel: string;
    helpline: string;
    website: string;
    photo: string;
    noLandRecords: string;
    male: string;
    female: string;
    other: string;
    rural: string;
    urban: string;
  };
}

export const FARMER_LANGUAGES: Record<FarmerLanguageCode, FarmerLanguageConfig> = {
  HI: {
    code: 'HI',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    headerTitle: {
      regional: 'भारत सरकार',
      english: 'Government of India',
    },
    ministryTitle: {
      regional: 'कृषि एवं किसान कल्याण मंत्रालय',
      english: 'Ministry of Agri & Farmers Welfare',
    },
    defaultRegistryTitle: 'राजस्थान किसान रजिस्ट्री',
    labels: {
      name: 'नाम',
      nameEnglish: 'Name',
      gender: 'Gender',
      dob: 'DOB',
      caste: 'Caste',
      area: 'Area',
      aadhaar: 'Aadhaar',
      farmerId: 'Farmer ID',
      approvalDate: 'Approval Date',
      downloadDate: 'Download Date',
      address: 'Address',
      khata: 'Khata',
      khasra: 'Khasra',
      areaParcel: 'Area',
      helpline: 'हेल्पलाइन',
      website: 'पोर्टल',
      photo: 'PHOTO',
      noLandRecords: 'कोई भूमि रिकॉर्ड दर्ज नहीं है',
      male: 'पुरुष',
      female: 'महिला',
      other: 'अन्य',
      rural: 'Rural',
      urban: 'Urban',
    },
  },

  EN: {
    code: 'EN',
    name: 'English',
    nativeName: 'English',
    headerTitle: {
      regional: 'GOVERNMENT OF INDIA',
      english: 'Government of India',
    },
    ministryTitle: {
      regional: 'Ministry of Agri & Farmers Welfare',
      english: 'Ministry of Agri & Farmers Welfare',
    },
    defaultRegistryTitle: 'Farmer Registry',
    labels: {
      name: 'Name (Reg.)',
      nameEnglish: 'Name',
      gender: 'Gender',
      dob: 'DOB',
      caste: 'Caste',
      area: 'Area',
      aadhaar: 'Aadhaar',
      farmerId: 'Farmer ID',
      approvalDate: 'Approval Date',
      downloadDate: 'Download Date',
      address: 'Address',
      khata: 'Khata',
      khasra: 'Khasra',
      areaParcel: 'Area',
      helpline: 'Helpline',
      website: 'Website',
      photo: 'PHOTO',
      noLandRecords: 'No landholding records recorded',
      male: 'Male',
      female: 'Female',
      other: 'Other',
      rural: 'Rural',
      urban: 'Urban',
    },
  },

  PA: {
    code: 'PA',
    name: 'Punjabi',
    nativeName: 'ਪੰਜਾਬੀ',
    headerTitle: {
      regional: 'ਭਾਰਤ ਸਰਕਾਰ',
      english: 'Government of India',
    },
    ministryTitle: {
      regional: 'ਖੇਤੀਬਾੜੀ ਅਤੇ ਕਿਸਾਨ ਭਲਾਈ ਮੰਤਰਾਲਾ',
      english: 'Ministry of Agri & Farmers Welfare',
    },
    defaultRegistryTitle: 'ਪੰਜਾਬ ਕਿਸਾਨ ਰਜਿਸਟਰੀ',
    labels: {
      name: 'ਨਾਮ',
      nameEnglish: 'Name',
      gender: 'Gender',
      dob: 'DOB',
      caste: 'Caste',
      area: 'Area',
      aadhaar: 'Aadhaar',
      farmerId: 'Farmer ID',
      approvalDate: 'Approval Date',
      downloadDate: 'Download Date',
      address: 'Address',
      khata: 'Khata',
      khasra: 'Khasra',
      areaParcel: 'Area',
      helpline: 'ਹੈਲਪਲਾਈਨ',
      website: 'ਪੋਰਟਲ',
      photo: 'PHOTO',
      noLandRecords: 'ਕੋਈ ਜ਼ਮੀਨੀ ਰਿਕਾਰਡ ਦਰਜ ਨਹੀਂ',
      male: 'ਪੁਰਸ਼',
      female: 'ਮਹਿਲਾ',
      other: 'ਹੋਰ',
      rural: 'Rural',
      urban: 'Urban',
    },
  },

  GU: {
    code: 'GU',
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    headerTitle: {
      regional: 'ભારત સરકાર',
      english: 'Government of India',
    },
    ministryTitle: {
      regional: 'કૃષિ અને ખેડૂત કલ્યાણ મંત્રાલય',
      english: 'Ministry of Agri & Farmers Welfare',
    },
    defaultRegistryTitle: 'ગુજરાત ખેડૂત રજિસ્ટ્રી',
    labels: {
      name: 'નામ',
      nameEnglish: 'Name',
      gender: 'Gender',
      dob: 'DOB',
      caste: 'Caste',
      area: 'Area',
      aadhaar: 'Aadhaar',
      farmerId: 'Farmer ID',
      approvalDate: 'Approval Date',
      downloadDate: 'Download Date',
      address: 'Address',
      khata: 'Khata',
      khasra: 'Khasra',
      areaParcel: 'Area',
      helpline: 'હેલ્પલાઇન',
      website: 'પોર્ટલ',
      photo: 'PHOTO',
      noLandRecords: 'કોઈ જમીન રેકોર્ડ નોંધાયેલ નથી',
      male: 'પુરુષ',
      female: 'મહિલા',
      other: 'અન્ય',
      rural: 'Rural',
      urban: 'Urban',
    },
  },

  MR: {
    code: 'MR',
    name: 'Marathi',
    nativeName: 'मराठी',
    headerTitle: {
      regional: 'भारत सरकार',
      english: 'Government of India',
    },
    ministryTitle: {
      regional: 'कृषी आणि शेतकरी कल्याण मंत्रालय',
      english: 'Ministry of Agri & Farmers Welfare',
    },
    defaultRegistryTitle: 'महाराष्ट्र शेतकरी नोंदणी',
    labels: {
      name: 'नाव',
      nameEnglish: 'Name',
      gender: 'Gender',
      dob: 'DOB',
      caste: 'Caste',
      area: 'Area',
      aadhaar: 'Aadhaar',
      farmerId: 'Farmer ID',
      approvalDate: 'Approval Date',
      downloadDate: 'Download Date',
      address: 'Address',
      khata: 'Khata',
      khasra: 'Khasra',
      areaParcel: 'Area',
      helpline: 'हेल्पलाइन',
      website: 'पोर्टल',
      photo: 'PHOTO',
      noLandRecords: 'कोणतीही जमीन नोंद उपलब्ध नाही',
      male: 'पुरुष',
      female: 'महिला',
      other: 'इतर',
      rural: 'Rural',
      urban: 'Urban',
    },
  },

  TA: {
    code: 'TA',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    headerTitle: {
      regional: 'இந்திய அரசு',
      english: 'Government of India',
    },
    ministryTitle: {
      regional: 'வேளாண்மை மற்றும் உழவர் நல அமைச்சகம்',
      english: 'Ministry of Agri & Farmers Welfare',
    },
    defaultRegistryTitle: 'தமிழ்நாடு உழவர் பதிவேடு',
    labels: {
      name: 'பெயர்',
      nameEnglish: 'Name',
      gender: 'Gender',
      dob: 'DOB',
      caste: 'Caste',
      area: 'Area',
      aadhaar: 'Aadhaar',
      farmerId: 'Farmer ID',
      approvalDate: 'Approval Date',
      downloadDate: 'Download Date',
      address: 'Address',
      khata: 'Khata',
      khasra: 'Khasra',
      areaParcel: 'Area',
      helpline: 'உதவி எண்',
      website: 'வலைத்தளம்',
      photo: 'PHOTO',
      noLandRecords: 'நில ஆவணங்கள் ஏதுமில்லை',
      male: 'ஆண்',
      female: 'பெண்',
      other: 'மற்றவை',
      rural: 'Rural',
      urban: 'Urban',
    },
  },

  TE: {
    code: 'TE',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    headerTitle: {
      regional: 'భారత ప్రభుత్వం',
      english: 'Government of India',
    },
    ministryTitle: {
      regional: 'వ్యవసాయం మరియు రైతుల సంక్షేమ మంత్రిత్వ శాఖ',
      english: 'Ministry of Agri & Farmers Welfare',
    },
    defaultRegistryTitle: 'రైతు రిజిస్ట్రీ',
    labels: {
      name: 'పేరు',
      nameEnglish: 'Name',
      gender: 'Gender',
      dob: 'DOB',
      caste: 'Caste',
      area: 'Area',
      aadhaar: 'Aadhaar',
      farmerId: 'Farmer ID',
      approvalDate: 'Approval Date',
      downloadDate: 'Download Date',
      address: 'Address',
      khata: 'Khata',
      khasra: 'Khasra',
      areaParcel: 'Area',
      helpline: 'హెల్ప్‌లైన్',
      website: 'పోర్టల్',
      photo: 'PHOTO',
      noLandRecords: 'ఎటువంటి భూమి రికార్డులు నమోదు కాలేదు',
      male: 'పురుషుడు',
      female: 'స్త్రీ',
      other: 'ఇతర',
      rural: 'Rural',
      urban: 'Urban',
    },
  },

  KN: {
    code: 'KN',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    headerTitle: {
      regional: 'ಭಾರತ ಸರ್ಕಾರ',
      english: 'Government of India',
    },
    ministryTitle: {
      regional: 'ಕೃಷಿ ಮತ್ತು ರೈತರ ಕಲ್ಯಾಣ ಸಚಿವಾಲಯ',
      english: 'Ministry of Agri & Farmers Welfare',
    },
    defaultRegistryTitle: 'ಕರ್ನಾಟಕ ರೈತ ನೋಂದಣಿ (FRUITS)',
    labels: {
      name: 'ಹೆಸರು',
      nameEnglish: 'Name',
      gender: 'Gender',
      dob: 'DOB',
      caste: 'Caste',
      area: 'Area',
      aadhaar: 'Aadhaar',
      farmerId: 'Farmer ID',
      approvalDate: 'Approval Date',
      downloadDate: 'Download Date',
      address: 'Address',
      khata: 'Khata',
      khasra: 'Khasra',
      areaParcel: 'Area',
      helpline: 'ಸಹಾಯವಾಣಿ',
      website: 'ಪೋರ್ಟಲ್',
      photo: 'PHOTO',
      noLandRecords: 'ಯಾವುದೇ ಭೂ ದಾಖಲೆಗಳು ದಾಖಲಾಗಿಲ್ಲ',
      male: 'ಪುರುಷ',
      female: 'ಮಹಿಳೆ',
      other: 'ಇತರ',
      rural: 'Rural',
      urban: 'Urban',
    },
  },

  BN: {
    code: 'BN',
    name: 'Bengali',
    nativeName: 'বাংলা',
    headerTitle: {
      regional: 'ভারত সরকার',
      english: 'Government of India',
    },
    ministryTitle: {
      regional: 'কৃষি ও কৃষক কল্যাণ মন্ত্রক',
      english: 'Ministry of Agri & Farmers Welfare',
    },
    defaultRegistryTitle: 'কৃষক রেজিস্ট্রি',
    labels: {
      name: 'নাম',
      nameEnglish: 'Name',
      gender: 'Gender',
      dob: 'DOB',
      caste: 'Caste',
      area: 'Area',
      aadhaar: 'Aadhaar',
      farmerId: 'Farmer ID',
      approvalDate: 'Approval Date',
      downloadDate: 'Download Date',
      address: 'Address',
      khata: 'Khata',
      khasra: 'Khasra',
      areaParcel: 'Area',
      helpline: 'হেল্পলাইন',
      website: 'পোর্টাল',
      photo: 'PHOTO',
      noLandRecords: 'কোনো জমির রেকর্ড নথিভুক্ত নেই',
      male: 'পুরুষ',
      female: 'মহিলা',
      other: 'অন্যান্য',
      rural: 'Rural',
      urban: 'Urban',
    },
  },

  OR: {
    code: 'OR',
    name: 'Odia',
    nativeName: 'ଓଡ଼ିଆ',
    headerTitle: {
      regional: 'ଭାରତ ସରକାର',
      english: 'Government of India',
    },
    ministryTitle: {
      regional: 'କୃଷି ଏବଂ କୃଷକ କଲ୍ୟାଣ ମନ୍ତ୍ରଣାଳୟ',
      english: 'Ministry of Agri & Farmers Welfare',
    },
    defaultRegistryTitle: 'ଓଡ଼ିଶା କୃଷକ ରେଜିଷ୍ଟ୍ରି',
    labels: {
      name: 'ନାମ',
      nameEnglish: 'Name',
      gender: 'Gender',
      dob: 'DOB',
      caste: 'Caste',
      area: 'Area',
      aadhaar: 'Aadhaar',
      farmerId: 'Farmer ID',
      approvalDate: 'Approval Date',
      downloadDate: 'Download Date',
      address: 'Address',
      khata: 'Khata',
      khasra: 'Khasra',
      areaParcel: 'Area',
      helpline: 'ହେଲ୍ପଲାଇନ',
      website: 'ପୋର୍ଟାଲ',
      photo: 'PHOTO',
      noLandRecords: 'କୌଣସି ଜମି ରେକର୍ଡ ପଞ୍ଜୀକୃତ ହୋଇନାହିଁ',
      male: 'ପୁରୁଷ',
      female: 'ମହିଳା',
      other: 'ଅନ୍ୟାନ୍ୟ',
      rural: 'Rural',
      urban: 'Urban',
    },
  },

  ML: {
    code: 'ML',
    name: 'Malayalam',
    nativeName: 'മലയാളം',
    headerTitle: {
      regional: 'ഭാരത സർക്കാർ',
      english: 'Government of India',
    },
    ministryTitle: {
      regional: 'കൃഷി, കർഷകക്ഷേമ മന്ത്രാലയം',
      english: 'Ministry of Agri & Farmers Welfare',
    },
    defaultRegistryTitle: 'കർഷക രജിസ്ട്രി',
    labels: {
      name: 'പേര്',
      nameEnglish: 'Name',
      gender: 'Gender',
      dob: 'DOB',
      caste: 'Caste',
      area: 'Area',
      aadhaar: 'Aadhaar',
      farmerId: 'Farmer ID',
      approvalDate: 'Approval Date',
      downloadDate: 'Download Date',
      address: 'Address',
      khata: 'Khata',
      khasra: 'Khasra',
      areaParcel: 'Area',
      helpline: 'ഹെൽപ്പ്‌ലൈൻ',
      website: 'പോർട്ടൽ',
      photo: 'PHOTO',
      noLandRecords: 'ഭൂമി വിവരങ്ങൾ ലഭ്യമല്ല',
      male: 'പുരുഷൻ',
      female: 'സ്ത്രീ',
      other: 'മറ്റുള്ളവ',
      rural: 'Rural',
      urban: 'Urban',
    },
  },

  AS: {
    code: 'AS',
    name: 'Assamese',
    nativeName: 'অসমীয়া',
    headerTitle: {
      regional: 'ভাৰত চৰকাৰ',
      english: 'Government of India',
    },
    ministryTitle: {
      regional: 'কৃষি আৰু কৃষক কল্যাণ মন্ত্ৰালয়',
      english: 'Ministry of Agri & Farmers Welfare',
    },
    defaultRegistryTitle: 'অসম কৃষক পঞ্জীয়ন',
    labels: {
      name: 'নাম',
      nameEnglish: 'Name',
      gender: 'Gender',
      dob: 'DOB',
      caste: 'Caste',
      area: 'Area',
      aadhaar: 'Aadhaar',
      farmerId: 'Farmer ID',
      approvalDate: 'Approval Date',
      downloadDate: 'Download Date',
      address: 'Address',
      khata: 'Khata',
      khasra: 'Khasra',
      areaParcel: 'Area',
      helpline: 'হেল্পলাইন',
      website: 'প’ৰ্টেল',
      photo: 'PHOTO',
      noLandRecords: 'কোনো ভূমিৰ তথ্য লিপিবদ্ধ হোৱা নাই',
      male: 'পুৰুষ',
      female: 'মহিলা',
      other: 'অন্যান্য',
      rural: 'Rural',
      urban: 'Urban',
    },
  },
};

export const FARMER_LANGUAGE_OPTIONS = Object.values(FARMER_LANGUAGES).map((l) => ({
  code: l.code,
  name: l.name,
  nativeName: l.nativeName,
}));

/**
 * Resolves a FarmerLanguageConfig safely with Hindi fallback
 */
export function getFarmerLanguageConfig(lang?: string): FarmerLanguageConfig {
  if (!lang) return FARMER_LANGUAGES.HI;
  const upper = lang.toUpperCase().trim() as FarmerLanguageCode;
  return FARMER_LANGUAGES[upper] || FARMER_LANGUAGES.HI;
}

/**
 * Translates dynamic farmer text (e.g. name, father/spouse, department titles) into target regional script
 * via Google Translate single client (GTX).
 */
export async function translateFarmerText(text: string, targetLang: string): Promise<string> {
  if (!text || !text.trim() || !targetLang) return text;
  if (targetLang.toUpperCase() === 'EN') return text;

  try {
    const res = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang.toLowerCase()}&dt=t&q=${encodeURIComponent(text.trim())}`
    );
    if (!res.ok) return text;
    const data = await res.json();
    let out = '';
    if (Array.isArray(data) && Array.isArray(data[0])) {
      data[0].forEach((item: any) => {
        if (item && item[0]) out += item[0];
      });
    }
    return out || text;
  } catch (err) {
    console.error('Farmer translate error:', err);
    return text;
  }
}

