/**
 * Multi-Lingual Aadhaar Card (UIDAI) Configuration & Regional Dictionaries
 * Source: Unique Identification Authority of India (UIDAI) & aadharmanualnew.php
 */

export type AadhaarLanguageCode =
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

export interface AadhaarLanguageConfig {
  code: AadhaarLanguageCode;
  name: string;
  nativeName: string;
  sheetAsset: string;
  cardFrontAsset: string;
  cardBackAsset: string;
  headerTitle: {
    regional: string;
    english: string;
  };
  backHeaderTitle: {
    regional: string;
    english: string;
  };
  slogan: {
    regional: string;
    highlightWord: string;
  };
  labels: {
    name: string;
    dob: string;
    gender: string;
    address: string;
    careOf: string;
    male: string;
    female: string;
    transgender: string;
  };
}

export const AADHAAR_LANGUAGES: Record<AadhaarLanguageCode, AadhaarLanguageConfig> = {
  HI: {
    code: 'HI',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    sheetAsset: '/assets/aadhar/HI.jpg',
    cardFrontAsset: '/assets/aadhar/cards/hi_front.jpg',
    cardBackAsset: '/assets/aadhar/cards/hi_back.jpg',
    headerTitle: {
      regional: 'भारत सरकार',
      english: 'Government of India',
    },
    backHeaderTitle: {
      regional: 'भारतीय विशिष्ट पहचान प्राधिकरण',
      english: 'Unique Identification Authority of India',
    },
    slogan: {
      regional: 'मेरा आधार, मेरी पहचान',
      highlightWord: 'आधार',
    },
    labels: {
      name: 'नाम',
      dob: 'जन्म तिथि',
      gender: 'लिंग',
      address: 'पता',
      careOf: 'आत्मज / पिता / पति',
      male: 'पुरुष',
      female: 'महिला',
      transgender: 'ट्रांसजेंडर',
    },
  },
  PA: {
    code: 'PA',
    name: 'Punjabi',
    nativeName: 'ਪੰਜਾਬੀ',
    sheetAsset: '/assets/aadhar/PA.jpg',
    cardFrontAsset: '/assets/aadhar/cards/pa_front.jpg',
    cardBackAsset: '/assets/aadhar/cards/pa_back.jpg',
    headerTitle: {
      regional: 'ਭਾਰਤ ਸਰਕਾਰ',
      english: 'Government of India',
    },
    backHeaderTitle: {
      regional: 'ਭਾਰਤੀ ਵਿਲੱਖਣ ਪਛਾਣ ਅਥਾਰਟੀ',
      english: 'Unique Identification Authority of India',
    },
    slogan: {
      regional: 'ਮੇਰਾ ਆਧਾਰ, ਮੇਰੀ ਪਛਾਣ',
      highlightWord: 'ਆਧਾਰ',
    },
    labels: {
      name: 'ਨਾਮ',
      dob: 'ਜਨਮ ਮਿਤੀ',
      gender: 'ਲਿੰਗ',
      address: 'ਪਤਾ',
      careOf: 'ਸਪੁੱਤਰ / ਪਿਤਾ',
      male: 'ਪੁਰਸ਼',
      female: 'ਮਹਿਲਾ',
      transgender: 'ਟਰਾਂਸਜੈਂਡਰ',
    },
  },
  GU: {
    code: 'GU',
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    sheetAsset: '/assets/aadhar/GU.jpg',
    cardFrontAsset: '/assets/aadhar/cards/gu_front.jpg',
    cardBackAsset: '/assets/aadhar/cards/gu_back.jpg',
    headerTitle: {
      regional: 'ભારત સરકાર',
      english: 'Government of India',
    },
    backHeaderTitle: {
      regional: 'ભારતીય વિશિષ્ટ ઓળખ સત્તામંડળ',
      english: 'Unique Identification Authority of India',
    },
    slogan: {
      regional: 'મારો આધાર, મારી ઓળખ',
      highlightWord: 'આધાર',
    },
    labels: {
      name: 'નામ',
      dob: 'જન્મ તારીખ',
      gender: 'જાતિ',
      address: 'સરનામું',
      careOf: 'પુત્ર / પિતા',
      male: 'પુરુષ',
      female: 'સ્ત્રી',
      transgender: 'ટ્રાન્સજેન્ડર',
    },
  },
  MR: {
    code: 'MR',
    name: 'Marathi',
    nativeName: 'मराठी',
    sheetAsset: '/assets/aadhar/MR.jpg',
    cardFrontAsset: '/assets/aadhar/cards/mr_front.jpg',
    cardBackAsset: '/assets/aadhar/cards/mr_back.jpg',
    headerTitle: {
      regional: 'भारत सरकार',
      english: 'Government of India',
    },
    backHeaderTitle: {
      regional: 'भारतीय विशिष्ट ओळख प्राधिकरण',
      english: 'Unique Identification Authority of India',
    },
    slogan: {
      regional: 'माझा आधार, माझी ओळख',
      highlightWord: 'आधार',
    },
    labels: {
      name: 'नाव',
      dob: 'जन्म तारीख',
      gender: 'लिंग',
      address: 'पत्ता',
      careOf: 'पुत्र / वडील',
      male: 'पुरुष',
      female: 'स्त्री',
      transgender: 'तृतीयपंथी',
    },
  },
  TA: {
    code: 'TA',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    sheetAsset: '/assets/aadhar/TA.jpg',
    cardFrontAsset: '/assets/aadhar/cards/ta_front.jpg',
    cardBackAsset: '/assets/aadhar/cards/ta_back.jpg',
    headerTitle: {
      regional: 'இந்திய அரசு',
      english: 'Government of India',
    },
    backHeaderTitle: {
      regional: 'இந்திய தனித்துவ அடையாள ஆணையம்',
      english: 'Unique Identification Authority of India',
    },
    slogan: {
      regional: 'எனது ஆதார், எனது அடையாளம்',
      highlightWord: 'ஆதார்',
    },
    labels: {
      name: 'பெயர்',
      dob: 'பிறந்த தேதி',
      gender: 'பாலினம்',
      address: 'முகவரி',
      careOf: 'மகன் / தந்தை',
      male: 'ஆண்',
      female: 'பெண்',
      transgender: 'திருநங்கை',
    },
  },
  KN: {
    code: 'KN',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    sheetAsset: '/assets/aadhar/KN.jpg',
    cardFrontAsset: '/assets/aadhar/cards/kn_front.jpg',
    cardBackAsset: '/assets/aadhar/cards/kn_back.jpg',
    headerTitle: {
      regional: 'ಭಾರತ ಸರ್ಕಾರ',
      english: 'Government of India',
    },
    backHeaderTitle: {
      regional: 'ಭಾರತೀಯ ವಿಶಿಷ್ಟ ಗುರುತಿನ ಪ್ರಾಧಿಕಾರ',
      english: 'Unique Identification Authority of India',
    },
    slogan: {
      regional: 'ನನ್ನ ಆಧಾರ್, ನನ್ನ ಗುರುತು',
      highlightWord: 'ಆಧಾರ್',
    },
    labels: {
      name: 'ಹೆಸರು',
      dob: 'ಹುಟ್ಟಿದ ದಿನಾಂಕ',
      gender: 'ಲಿಂಗ',
      address: 'ವಿಳಾಸ',
      careOf: 'ಮಗ / ತಂದೆ',
      male: 'ಪುರುಷ',
      female: 'ಮಹಿಳೆ',
      transgender: 'ತೃತೀಯಲಿಂಗಿ',
    },
  },
  BN: {
    code: 'BN',
    name: 'Bengali',
    nativeName: 'বাংলা',
    sheetAsset: '/assets/aadhar/BN.jpg',
    cardFrontAsset: '/assets/aadhar/cards/bn_front.jpg',
    cardBackAsset: '/assets/aadhar/cards/bn_back.jpg',
    headerTitle: {
      regional: 'ভারত সরকার',
      english: 'Government of India',
    },
    backHeaderTitle: {
      regional: 'ভারতীয় বিশিষ্ট সনাক্তকরণ কর্তৃপক্ষ',
      english: 'Unique Identification Authority of India',
    },
    slogan: {
      regional: 'আমার আধার, আমার পরিচয়',
      highlightWord: 'আধার',
    },
    labels: {
      name: 'নাম',
      dob: 'জন্ম তারিখ',
      gender: 'লিঙ্গ',
      address: 'ঠিকানা',
      careOf: 'পুত্র / পিতা',
      male: 'পুরুষ',
      female: 'মহিলা',
      transgender: 'রূপান্তরকামী',
    },
  },
  TE: {
    code: 'TE',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    sheetAsset: '/assets/aadhar/TE.jpg',
    cardFrontAsset: '/assets/aadhar/cards/te_front.jpg',
    cardBackAsset: '/assets/aadhar/cards/te_back.jpg',
    headerTitle: {
      regional: 'భారత ప్రభుత్వం',
      english: 'Government of India',
    },
    backHeaderTitle: {
      regional: 'భారత విశిష్ట గుర్తింపు ప్రాధికార సంస్థ',
      english: 'Unique Identification Authority of India',
    },
    slogan: {
      regional: 'నా ఆధార్, నా గుర్తింపు',
      highlightWord: 'ఆధార్',
    },
    labels: {
      name: 'పేరు',
      dob: 'పుట్టిన తేదీ',
      gender: 'లింగం',
      address: 'చిరునామా',
      careOf: 'కుమారుడు / తండ్రి',
      male: 'పురుషుడు',
      female: 'స్త్రీ',
      transgender: 'ట్రాన్స్‌జెండర్',
    },
  },
  OR: {
    code: 'OR',
    name: 'Odia',
    nativeName: 'ଓଡ଼ିଆ',
    sheetAsset: '/assets/aadhar/OR.jpg',
    cardFrontAsset: '/assets/aadhar/cards/or_front.jpg',
    cardBackAsset: '/assets/aadhar/cards/or_back.jpg',
    headerTitle: {
      regional: 'ଭାରତ ସରକାର',
      english: 'Government of India',
    },
    backHeaderTitle: {
      regional: 'ଭାରତୀୟ ବିଶିଷ୍ଟ ପରିଚୟ ପ୍ରାଧିକରଣ',
      english: 'Unique Identification Authority of India',
    },
    slogan: {
      regional: 'ମୋ ଆଧାର, ମୋ ପରିଚୟ',
      highlightWord: 'ଆଧାର',
    },
    labels: {
      name: 'ନାମ',
      dob: 'ଜନ୍ମ ତାରିଖ',
      gender: 'ଲିଙ୍ଗ',
      address: 'ଠିକଣା',
      careOf: 'ପୁତ୍ର / ପିତା',
      male: 'ପୁରୁଷ',
      female: 'ମହିଳା',
      transgender: 'ତୃତୀୟଲିଙ୍ଗୀ',
    },
  },
  SD: {
    code: 'SD',
    name: 'Sindhi',
    nativeName: 'سنڌي / सिंधी',
    sheetAsset: '/assets/aadhar/HI.jpg',
    cardFrontAsset: '/assets/aadhar/cards/sd_front.jpg',
    cardBackAsset: '/assets/aadhar/cards/sd_back.jpg',
    headerTitle: {
      regional: 'ڀارت سرڪار / भारत सरकार',
      english: 'Government of India',
    },
    backHeaderTitle: {
      regional: 'ڀارتي خصوصي سڃاڻپ اٿارٽي',
      english: 'Unique Identification Authority of India',
    },
    slogan: {
      regional: 'منهنجو آਧਾਰ, منهنجي سڃਾڻپ',
      highlightWord: 'आधार',
    },
    labels: {
      name: 'نالو / नाम',
      dob: 'ڄم جي تاريخ / जन्म तिथि',
      gender: 'جنس / लिंग',
      address: 'پتو / पता',
      careOf: 'پٽ / پيءُ',
      male: 'مرد / पुरुष',
      female: 'عورت / महिला',
      transgender: 'ٽئين جنس',
    },
  },
};

const RELATIONSHIP_PREFIX_MAP: Record<string, { so: string; do: string; wo: string; co: string }> = {
  HI: { so: 'आत्मज', do: 'आत्मजा', wo: 'पत्नी', co: 'केयर ऑफ' },
  BN: { so: 'পুত্র', do: 'কন্যা', wo: 'স্ত্রী', co: 'যত্নে' },
  GU: { so: 'પુત્ર', do: 'પુત્રી', wo: 'પત્ની', co: 'સંભાળ' },
  MR: { so: 'पुत्र', do: 'कन्या', wo: 'पत्नी', co: 'काळजी' },
  TA: { so: 'மகன்', do: 'மகள்', wo: 'மனைவி', co: 'பராமரிப்பு' },
  TE: { so: 'కుమారుడు', do: 'కుమార్తె', wo: 'భార్య', co: 'సంరక్షణ' },
  KN: { so: 'ಮಗ', do: 'ಮಗಳು', wo: 'ಹೆಂಡತಿ', co: 'ಆರೈಕೆ' },
  PA: { so: 'ਸਪੁੱਤਰ', do: 'ਧੀ', wo: 'ਪਤਨੀ', co: 'ਦੇਖਭਾਲ' },
  OR: { so: 'ପୁତ୍ର', do: 'ଝିଅ', wo: 'ସ୍ତ୍ରୀ', co: 'ଯତ୍ନ' },
};

/**
 * Translate text via Google Translate GTX API with smart Indian relationship prefix mapping
 */
export async function translateAadhaarText(text: string, targetLang: string): Promise<string> {
  if (!text || !text.trim() || !targetLang) return text;

  // Check for common care of / relationship prefixes like D/O, S/O, W/O, C/O
  const relMatch = text.match(/^(S\/O|D\/O|W\/O|C\/O|SO|DO|WO|CO)[:\s-]+(.*)$/i);
  if (relMatch) {
    const pRaw = relMatch[1].toUpperCase().replace('/', '');
    const remainder = relMatch[2].trim();
    const langKey = targetLang.toUpperCase();
    const map = RELATIONSHIP_PREFIX_MAP[langKey];
    if (map && remainder) {
      let prefix = '';
      if (pRaw === 'SO') prefix = map.so;
      else if (pRaw === 'DO') prefix = map.do;
      else if (pRaw === 'WO') prefix = map.wo;
      else if (pRaw === 'CO') prefix = map.co;

      if (prefix) {
        const translatedRemainder = await translateAadhaarText(remainder, targetLang);
        return `${prefix} ${translatedRemainder}`;
      }
    }
  }

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
    console.error('Aadhaar translate error:', err);
    return text;
  }
}

