/**
 * Multi-Lingual Voter ID (e-EPIC) Configuration & Regional Dictionaries
 * Source: Election Commission of India & voter_capc-advance.php template
 */

export type VoterLanguageCode =
  | 'HI'
  | 'PA'
  | 'GU'
  | 'MR'
  | 'TA'
  | 'KN'
  | 'BN'
  | 'TE'
  | 'OR'
  | 'SD';

export interface VoterLanguageConfig {
  code: VoterLanguageCode;
  name: string;
  nativeName: string;
  sheetAsset: string;
  cardFrontAsset: string;
  cardBackAsset: string;
  labels: {
    name: string;
    fatherName: string;
    husbandName: string;
    gender: string;
    dob: string;
    address: string;
    electoralOfficer: string;
    male: string;
    female: string;
    other: string;
  };
}

export const VOTER_LANGUAGES: Record<VoterLanguageCode, VoterLanguageConfig> = {
  HI: {
    code: 'HI',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    sheetAsset: '/assets/voter/baap/hindi.jpg',
    cardFrontAsset: '/assets/voter/cards/hi_front.jpg',
    cardBackAsset: '/assets/voter/cards/hi_back.jpg',
    labels: {
      name: 'नाम',
      fatherName: 'पिता का नाम',
      husbandName: 'पति का नाम',
      gender: 'लिंग',
      dob: 'जन्म तिथि / आयु',
      address: 'पता',
      electoralOfficer: 'निर्वाचक रजिस्ट्रीकरण अधिकारी',
      male: 'पुरुष',
      female: 'महिला',
      other: 'अन्य',
    },
  },
  PA: {
    code: 'PA',
    name: 'Punjabi',
    nativeName: 'ਪੰਜਾਬੀ',
    sheetAsset: '/assets/voter/baap/pu.jpg',
    cardFrontAsset: '/assets/voter/cards/pa_front.jpg',
    cardBackAsset: '/assets/voter/cards/pa_back.jpg',
    labels: {
      name: 'ਨਾਮ',
      fatherName: 'ਪਿਤਾ ਦਾ ਨਾਮ',
      husbandName: 'ਪਤੀ ਦਾ ਨਾਮ',
      gender: 'ਲਿੰਗ',
      dob: 'ਜਨਮ ਮਿਤੀ / ਉਮਰ',
      address: 'ਪਤਾ',
      electoralOfficer: 'ਚੋਣਕਾਰ ਰਜਿਸਟਰੇਸ਼ਨ ਅਫ਼ਸਰ',
      male: 'ਪੁਰਸ਼',
      female: 'ਮਹਿਲਾ',
      other: 'ਹੋਰ',
    },
  },
  GU: {
    code: 'GU',
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    sheetAsset: '/assets/voter/baap/gujarat.jpg',
    cardFrontAsset: '/assets/voter/cards/gu_front.jpg',
    cardBackAsset: '/assets/voter/cards/gu_back.jpg',
    labels: {
      name: 'નામ',
      fatherName: 'પિતાનું નામ',
      husbandName: 'પતિનું નામ',
      gender: 'જાતિ',
      dob: 'જન્મ તારીખ / ઉંમર',
      address: 'સરનામું',
      electoralOfficer: 'મતદાર નોંધણી અધિકારી',
      male: 'પુરુષ',
      female: 'સ્ત્રી',
      other: 'અન્ય',
    },
  },
  MR: {
    code: 'MR',
    name: 'Marathi',
    nativeName: 'मराठी',
    sheetAsset: '/assets/voter/baap/marathi.jpg',
    cardFrontAsset: '/assets/voter/cards/mr_front.jpg',
    cardBackAsset: '/assets/voter/cards/mr_back.jpg',
    labels: {
      name: 'नाव',
      fatherName: 'वडिलांचे नाव',
      husbandName: 'पतीचे नाव',
      gender: 'लिंग',
      dob: 'जन्म तारीख / वय',
      address: 'पत्ता',
      electoralOfficer: 'मतदार नोंदणी अधिकारी',
      male: 'पुरुष',
      female: 'स्त्री',
      other: 'इतर',
    },
  },
  TA: {
    code: 'TA',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    sheetAsset: '/assets/voter/baap/tamil.jpg',
    cardFrontAsset: '/assets/voter/cards/ta_front.jpg',
    cardBackAsset: '/assets/voter/cards/ta_back.jpg',
    labels: {
      name: 'பெயர்',
      fatherName: 'தந்தை பெயர்',
      husbandName: 'கணவர் பெயர்',
      gender: 'பாலினம்',
      dob: 'பிறந்த தேதி / வயது',
      address: 'முகவரி',
      electoralOfficer: 'வாக்காளர் பதிவு அதிகாரி',
      male: 'ஆண்',
      female: 'பெண்',
      other: 'மற்றவை',
    },
  },
  KN: {
    code: 'KN',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    sheetAsset: '/assets/voter/baap/kannada.jpg',
    cardFrontAsset: '/assets/voter/cards/kn_front.jpg',
    cardBackAsset: '/assets/voter/cards/kn_back.jpg',
    labels: {
      name: 'ಹೆಸರು',
      fatherName: 'ತಂದೆಯ ಹೆಸರು',
      husbandName: 'ಗಂಡನ ಹೆಸರು',
      gender: 'ಲಿಂಗ',
      dob: 'ಹುಟ್ಟಿದ ದಿನಾಂಕ / ವಯಸ್ಸು',
      address: 'ವಿಳಾಸ',
      electoralOfficer: 'ಮತದಾರರ ನೋಂದಣಿ ಅಧಿಕಾರಿ',
      male: 'ಪುರುಷ',
      female: 'ಮಹಿಳೆ',
      other: 'ಇತರ',
    },
  },
  BN: {
    code: 'BN',
    name: 'Bengali',
    nativeName: 'বাংলা',
    sheetAsset: '/assets/voter/baap/bangla.jpg',
    cardFrontAsset: '/assets/voter/cards/bn_front.jpg',
    cardBackAsset: '/assets/voter/cards/bn_back.jpg',
    labels: {
      name: 'নাম',
      fatherName: 'পিতার নাম',
      husbandName: 'স্বামীর নাম',
      gender: 'লিঙ্গ',
      dob: 'জন্ম তারিখ / বয়স',
      address: 'ঠিকানা',
      electoralOfficer: 'নির্বাচনী নিবন্ধন আধিকারিক',
      male: 'পুরুষ',
      female: 'মহিলা',
      other: 'অন্যান্য',
    },
  },
  TE: {
    code: 'TE',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    sheetAsset: '/assets/voter/baap/telegu.jpg',
    cardFrontAsset: '/assets/voter/cards/te_front.jpg',
    cardBackAsset: '/assets/voter/cards/te_back.jpg',
    labels: {
      name: 'పేరు',
      fatherName: 'తండ్రి పేరు',
      husbandName: 'భర్త పేరు',
      gender: 'లింగం',
      dob: 'పుట్టిన తేదీ / వయస్సు',
      address: 'చిరునామా',
      electoralOfficer: 'ఎలక్టోరల్ రిజిస్ట్రేషన్ అధికారి',
      male: 'పురుషుడు',
      female: 'స్త్రీ',
      other: 'ఇతర',
    },
  },
  OR: {
    code: 'OR',
    name: 'Odia',
    nativeName: 'ଓଡ଼ିଆ',
    sheetAsset: '/assets/voter/baap/odia.jpg',
    cardFrontAsset: '/assets/voter/cards/or_front.jpg',
    cardBackAsset: '/assets/voter/cards/or_back.jpg',
    labels: {
      name: 'ନାମ',
      fatherName: 'ପିତାଙ୍କ ନାମ',
      husbandName: 'ସ୍ୱାମୀଙ୍କ ନାମ',
      gender: 'ଲିଙ୍ଗ',
      dob: 'ଜନ୍ମ ତାରିଖ / ବୟସ',
      address: 'ଠିକଣା',
      electoralOfficer: 'ନିର୍ବାଚନ ପଞ୍ଜୀକରଣ ଅଧିକାରୀ',
      male: 'ପୁରୁଷ',
      female: 'ମହିଳା',
      other: 'ଅନ୍ୟ',
    },
  },
  SD: {
    code: 'SD',
    name: 'Sindhi',
    nativeName: 'سنڌي / सिंधी',
    sheetAsset: '/assets/voter/baap/sindhi.jpg',
    cardFrontAsset: '/assets/voter/cards/sd_front.jpg',
    cardBackAsset: '/assets/voter/cards/sd_back.jpg',
    labels: {
      name: 'نالو / नाम',
      fatherName: 'پيءُ جو نالو / पिता का नाम',
      husbandName: 'مڙس جو نالو / पति का नाम',
      gender: 'جنس / लिंग',
      dob: 'ڄم جي تاريخ / जन्म तिथि',
      address: 'پتو / पता',
      electoralOfficer: 'اليڪٽورਲ رجسٽريشن آفيسਰ',
      male: 'مرد',
      female: 'عورت',
      other: 'ٻيو',
    },
  },
};

/**
 * Translate text via Google Translate GTX API (from voter_capc-advance.php)
 */
export async function translateVoterText(text: string, targetLang: string): Promise<string> {
  if (!text || !text.trim() || !targetLang) return text;

  try {
    const res = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=EN&tl=${targetLang.toLowerCase()}&dt=t&q=${encodeURIComponent(text.trim())}`
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
    console.error('Voter translate error:', err);
    return text;
  }
}

