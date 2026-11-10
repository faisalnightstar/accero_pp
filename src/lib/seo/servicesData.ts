import { DocumentType } from '@/types/cards';

export interface ServiceFaq {
  question: string;
  answer: string;
}

export interface ServiceHowToStep {
  name: string;
  text: string;
}

export interface ServiceSpec {
  label: string;
  value: string;
}

export interface ServiceConfig {
  slug: string;
  docType: DocumentType;
  title: string;
  shortTitle: string;
  subtitle: string;
  metaTitle: string;
  metaDescription: string;
  fee: number;
  lookupPlaceholder: string;
  exampleId: string;
  aeoQuickAnswer: string;
  heroHeadline: string;
  heroSubheadline: string;
  features: string[];
  specs: ServiceSpec[];
  howToSteps: ServiceHowToStep[];
  faqs: ServiceFaq[];
  sampleData: Record<string, any>;
}

export const SERVICES_CONFIG: Record<string, ServiceConfig> = {
  'pan-card-printing': {
    slug: 'pan-card-printing',
    docType: 'pan',
    title: 'PVC PAN Card Printing Service',
    shortTitle: 'PAN Card',
    subtitle: 'NSDL & UTI Standard Preformatted Layouts with Instant Verification',
    metaTitle: 'PVC PAN Card Printing Online | Official ISO CR80 Smart Format',
    metaDescription:
      'Print official-standard PVC PAN cards online with pixel-perfect ISO 7810 ID-1 dimensions (85.60 mm × 53.98 mm). Instant number lookup, photo upload, and print-ready PDF export.',
    fee: 20,
    lookupPlaceholder: 'Enter 10-digit PAN (e.g. ABCDE1234F)',
    exampleId: 'ABCDE1234F',
    aeoQuickAnswer:
      'To print an official PVC PAN card online, enter your 10-digit PAN number into the Accero PrintPortal search bar to auto-retrieve demographic records, or fill in your name, father name, and DOB manually. Preview the ISO 7810 CR80 card layout in real time, upload candidate photo and signature, and export an instant high-resolution print-ready PDF for local PVC printer trays.',
    heroHeadline: 'Official Standard PVC PAN Card Printing & Formatting',
    heroSubheadline:
      'Instant 10-character PAN number lookup, high-DPI vector canvas formatting, and seamless PVC card printer tray output.',
    features: [
      'Official ISO/IEC 7810 CR80 Dimensions (85.60 mm × 53.98 mm)',
      'Instant Alphanumeric Verification via Multi-Provider Cascade',
      'Dynamic QR Code Generator with Embedded Demographic Payload',
      'Drag-and-Drop Photo & Signature Uploader with 0ms Preview',
      'Zero Margin-Drift CSS @page Print Engine for Thermal & Inkjet Trays',
    ],
    specs: [
      { label: 'Card Standard', value: 'ISO/IEC 7810 ID-1 (CR80 standard)' },
      { label: 'Physical Dimensions', value: '85.60 mm × 53.98 mm (3.370 in × 2.125 in)' },
      { label: 'Resolution Density', value: '300+ DPI crisp vector reproduction' },
      { label: 'Compatible Printers', value: 'Epson L805/L850, Canon G-series, Zebra, Evolis, Fargo PVC trays' },
      { label: 'Service Fee', value: '₹20 per verified lookup (100% Free Re-printing)' },
    ],
    howToSteps: [
      {
        name: 'Lookup or Enter PAN Number',
        text: 'Enter your 10-digit alphanumeric PAN number in the search bar or choose blank manual entry.',
      },
      {
        name: 'Verify & Fill Incomplete Fields',
        text: 'The interactive studio automatically flags missing fields with amber indicators so you can complete father name, DOB, or photo.',
      },
      {
        name: 'Preview Front & Back Layout',
        text: 'Examine the live 300+ DPI preformatted canvas with dynamic QR code and typography.',
      },
      {
        name: 'Download PDF or Print Directly',
        text: '1-Click download of a print-ready vector PDF formatted exactly for standard PVC card tray alignment.',
      },
    ],
    faqs: [
      {
        question: 'What are the exact dimensions of the printed PVC PAN Card?',
        answer:
          'Accero PrintPortal formats all cards strictly to the ISO/IEC 7810 ID-1 standard: exactly 85.60 mm in width by 53.98 mm in height with 3.18 mm corner radii, ensuring zero margin drift in physical card trays.',
      },
      {
        question: 'Does Accero PrintPortal store my government credentials?',
        answer:
          'No. All verification queries run server-side via third-party secure APIs with zero credential exposure. Once generated, card snapshots are encrypted and saved solely for your operator reprint access.',
      },
      {
        question: 'Can I print a PAN card if the external API is offline?',
        answer:
          'Yes! Accero PrintPortal features a full manual entry mode allowing you to input cardholder details, candidate photo, and signature directly onto the preformatted canvas.',
      },
      {
        question: 'Are re-prints charged from my wallet balance?',
        answer:
          'No. Once a document has been generated and saved to your account, all subsequent views, edits, and PDF/PNG re-prints are 100% free of charge (₹0).',
      },
      {
        question: 'What PVC card printers are compatible with the output PDF?',
        answer:
          'Output PDFs lock to CSS @page print margins compatible with all standard ID card trays on Epson (L805, L850), Canon (G-series ID trays), Zebra, Evolis, and Magicard direct-to-card printers.',
      },
    ],
    sampleData: {
      panNumber: 'ABCDE1234F',
      fullName: 'ROHIT KHATRI',
      fatherName: 'SUBHASH KHATRI',
      dateOfBirth: '15/08/1990',
      gender: 'MALE',
      photoUrl: '',
      signatureUrl: '',
      category: 'Individual',
      templateVariant: 'nsdl',
      layoutFormat: 'cr80',
    },
  },

  'aadhaar-document-management': {
    slug: 'aadhaar-document-management',
    docType: 'aadhaar',
    title: 'Aadhaar PVC Card Management & Layout Service',
    shortTitle: 'Aadhaar Card',
    subtitle: 'Bilingual Regional Layout with High-Density Secure QR Code',
    metaTitle: 'Aadhaar PVC Card Print Online | Standard CR80 Format with QR',
    metaDescription:
      'Format and print official-standard Aadhaar PVC cards online with Devanagari regional typography, secure QR code, and exact ISO 7810 dimensions. Instant PDF export.',
    fee: 25,
    lookupPlaceholder: 'Enter 12-digit Aadhaar Number (e.g. 5749 0326 7673)',
    exampleId: '574903267673',
    aeoQuickAnswer:
      'To format an official-standard Aadhaar PVC card layout online, enter your 12-digit Aadhaar number or input your bilingual demographic details manually. Accero PrintPortal formats the card with Devanagari typography, emblem borders, and high-density QR code conforming to standard CR80 tray dimensions for immediate print or PDF export.',
    heroHeadline: 'Standard Aadhaar PVC Card Formatting & High-DPI Printing',
    heroSubheadline:
      'Bilingual regional typography, dynamic high-density QR code embedding, and exact ISO CR80 physical tray alignment.',
    features: [
      'Bilingual Devanagari & English Regional Typography Support',
      'Dynamic High-Density Demographic QR Code Generator',
      'Front and Back Smart Card Tray Layout Alignment',
      'Interactive Missing Field Detection & Image Uploads',
      'Free Re-printing on All Saved Document Records',
    ],
    specs: [
      { label: 'Card Standard', value: 'ISO/IEC 7810 ID-1 standard' },
      { label: 'Physical Dimensions', value: '85.60 mm × 53.98 mm' },
      { label: 'Typography Engine', value: 'Google Fonts Hind (Devanagari) & Roboto' },
      { label: 'Barcode/QR', value: 'High-density Level-M 2D QR Code' },
      { label: 'Service Fee', value: '₹25 per lookup (100% Free Re-printing)' },
    ],
    howToSteps: [
      {
        name: 'Enter Aadhaar Number or Manual Data',
        text: 'Input your 12-digit UID or enter demographic details manually in the interactive editor.',
      },
      {
        name: 'Review Bilingual Details',
        text: 'Ensure English and Devanagari names and addresses are accurately synchronized across front and back canvases.',
      },
      {
        name: 'Upload Candidate Portrait',
        text: 'Drag and drop candidate photo for instant client-side preview without server latency.',
      },
      {
        name: 'Print on PVC Card Tray',
        text: 'Click Print to trigger print-ready vector rendering aligned precisely for physical PVC trays.',
      },
    ],
    faqs: [
      {
        question: 'Does this service impersonate UIDAI or issue government IDs?',
        answer:
          'No. Accero PrintPortal is strictly an independent digital formatting and layout utility for local card tray printing. We do not generate government identities, provide Aadhaar enrollment, or impersonate state authorities.',
      },
      {
        question: 'How does the bilingual regional language layout work?',
        answer:
          'The canvas renders both English and regional Hindi text using Google Fonts Hind with proper conjuncts and diacritics, matching standard PVC card aesthetics.',
      },
      {
        question: 'Can I print multiple copies without paying again?',
        answer:
          'Yes. All saved cards have permanent records in your account, allowing unlimited free re-prints at zero extra charge.',
      },
      {
        question: 'What is the fee for formatting an Aadhaar card?',
        answer:
          'Verified API lookup and formatting is ₹25, while manually drafted cards require only ₹5.',
      },
      {
        question: 'Does the generated QR code work when scanned?',
        answer:
          'Yes. The QR code encodes standard demographic string payloads formatted for camera and handheld 2D barcode scanner verification.',
      },
    ],
    sampleData: {
      aadhaarNumber: '5749 0326 7673',
      fullName: 'ANIL KUMAR MISHRA',
      fullNameHindi: 'अनिल कुमार मिश्रा',
      gender: 'Male / पुरुष',
      dateOfBirth: '12/04/1985',
      address: 'H.No 42, Sector 15, Vasundhara, Ghaziabad, Uttar Pradesh - 201012',
      addressHindi: 'मकान नं 42, सेक्टर 15, वसुंधरा, गाजियाबाद, उत्तर प्रदेश - 201012',
      photoUrl: '',
      qrPayload: 'https://uidai.gov.in/verify?uid=574903267673',
    },
  },

  'voter-id-printing': {
    slug: 'voter-id-printing',
    docType: 'voter',
    title: 'PVC Voter ID (EPIC) Card Printing Service',
    shortTitle: 'Voter ID',
    subtitle: 'National Electoral Standard EPIC Layout with Assembly Details',
    metaTitle: 'PVC Voter ID Card Print Online | Official Standard EPIC Format',
    metaDescription:
      'Format and print official-standard Voter ID (EPIC) cards on durable PVC layouts. Instant EPIC number lookup, assembly constituency details, and high-DPI PDF export.',
    fee: 20,
    lookupPlaceholder: 'Enter EPIC Voter ID (e.g. ABC0123456)',
    exampleId: 'ABC0123456',
    aeoQuickAnswer:
      'To print an official PVC Voter ID card online, enter your EPIC number to fetch voter demographic records via secure gateways, or enter details manually. The dual-pane studio renders the official election card layout with constituency, polling part, and bilingual text formatted for instant PVC card tray printing.',
    heroHeadline: 'Official PVC Voter ID (EPIC) Card Formatting',
    heroSubheadline:
      'Instant EPIC number lookup, assembly constituency mapping, and official CR80 smart card layout formatting.',
    features: [
      'Direct EPIC Lookup with Automated Silent Cascade',
      'Assembly Constituency & Polling Part String Formatting',
      'Bilingual Voter Name & Relative Name Typography',
      'Standard Front Portrait & Reverse Security Strip Layout',
      '1-Click High-Resolution PDF Download for Physical Printing',
    ],
    specs: [
      { label: 'Card Standard', value: 'ISO 7810 CR80 Standard' },
      { label: 'Physical Dimensions', value: '85.60 mm × 53.98 mm' },
      { label: 'Data Source', value: 'National Electoral Search & Direct EPIC lookup' },
      { label: 'Service Fee', value: '₹20 per verified lookup (100% Free Re-printing)' },
      { label: 'Output Format', value: 'Print-ready vector PDF & High-DPI PNG' },
    ],
    howToSteps: [
      {
        name: 'Lookup EPIC Number',
        text: 'Enter your 10-character Voter EPIC number to automatically pull registered electoral records.',
      },
      {
        name: 'Review Assembly & Part Details',
        text: 'Confirm your constituency name, assembly number, and polling station part number.',
      },
      {
        name: 'Upload Voter Photo',
        text: 'Upload a clear passport portrait to replace low-resolution electoral roll scans.',
      },
      {
        name: 'Print on Card Tray',
        text: 'Generate and print the card directly to your card printer tray with zero edge cutoff.',
      },
    ],
    faqs: [
      {
        question: 'What information is included on the PVC Voter ID card?',
        answer:
          'The front features EPIC number, voter photo, and bilingual voter/father names. The reverse contains date of birth, gender, address, assembly constituency, and part number.',
      },
      {
        question: 'What happens if my EPIC lookup fails or times out?',
        answer:
          'Accero PrintPortal automatically cascades to a backup provider. If all fail, zero fee is charged (₹0), and you are seamlessly routed into the Studio for manual entry.',
      },
      {
        question: 'What is the fee for Voter ID card printing?',
        answer:
          'Voter ID lookups are ₹20 per successful verification. Manual entry is ₹5. Re-prints are completely free.',
      },
      {
        question: 'Can I edit incorrect spelling in the electoral record?',
        answer:
          'Yes! The interactive split-screen studio allows you to correct spelling errors and update missing fields with live reactive preview before printing.',
      },
      {
        question: 'Is the card formatted for both front and back printing?',
        answer:
          'Yes, both front and back canvases are rendered side-by-side with toggle modes for single-sided or dual-pass card trays.',
      },
    ],
    sampleData: {
      epicNumber: 'ABC0123456',
      fullName: 'VIKRAM SINGH',
      fullNameHindi: 'विक्रम सिंह',
      relationName: 'MAHENDER SINGH',
      relationNameHindi: 'महेंद्र सिंह',
      gender: 'MALE / पुरुष',
      dateOfBirth: '20/07/1992',
      assemblyConstituency: '175 - Lucknow Cantt',
      partNumber: '142 - Nagar Nigam School',
      photoUrl: '',
      qrPayload: 'https://electoralsearch.eci.gov.in?epic=ABC0123456',
    },
  },

  'driving-licence-printing': {
    slug: 'driving-licence-printing',
    docType: 'dl',
    title: 'PVC Driving Licence Card Printing Service',
    shortTitle: 'Driving Licence',
    subtitle: 'Smart Card Chip Layout with Vehicle Classes & Validity Dates',
    metaTitle: 'PVC Driving Licence Print Online | Smart Card Chip Layout',
    metaDescription:
      'Print official-standard PVC Driving Licence smart cards online. Smart chip layout, vehicle class authorizations, RTO details, and instant PVC tray PDF download.',
    fee: 30,
    lookupPlaceholder: 'Enter Driving Licence No (e.g. DL-0420110123456)',
    exampleId: 'DL0420110123456',
    aeoQuickAnswer:
      'To print an official PVC Driving Licence online, enter your DL number to fetch state transport department details, or input your licence specs manually. Accero PrintPortal formats the smart card chip graphics, vehicle class authorizations (MCWG, LMV), validity dates, and RTO authority on standard CR80 PVC dimensions.',
    heroHeadline: 'Official PVC Driving Licence (DL) Smart Card Formatting',
    heroSubheadline:
      'Instant DL number verification, vehicle class mapping, gold smart chip graphic, and exact PVC tray alignment.',
    features: [
      'Smart Card Microchip Graphic & Gold Contact Pad Overlay',
      'Vehicle Authorization Class Mapping (MCWG, LMV, TRANS, HGMV)',
      'Issue, Expiry, and Non-Transport Validity Tracking',
      'State Transport RTO Authority & Hologram Graphics',
      'High-Resolution Print-Ready PDF with Exact CR80 Tray Scaling',
    ],
    specs: [
      { label: 'Card Standard', value: 'ISO/IEC 7810 ID-1 Smart Card Standard' },
      { label: 'Physical Dimensions', value: '85.60 mm × 53.98 mm' },
      { label: 'Chip Specification', value: 'Standard Contact IC Graphic Overlay' },
      { label: 'Service Fee', value: '₹30 per verified lookup (100% Free Re-printing)' },
      { label: 'Printer Tray Support', value: 'All 2-card and 4-card ID trays' },
    ],
    howToSteps: [
      {
        name: 'Lookup Driving Licence Number',
        text: 'Enter your state DL number to retrieve demographic and vehicle class authorization records.',
      },
      {
        name: 'Check Vehicle Class Authorizations',
        text: 'Verify vehicle classes (e.g. MCWG for motorcycle, LMV for car) and validity dates.',
      },
      {
        name: 'Upload Photo & Signature',
        text: 'Upload candidate portrait and signature for high-resolution vector rendering.',
      },
      {
        name: 'Download & Print',
        text: 'Export a 300+ DPI vector PDF and feed standard PVC card blanks into your printer tray.',
      },
    ],
    faqs: [
      {
        question: 'Does this replace my physical government driving licence?',
        answer:
          'No. Accero PrintPortal provides document reproduction and formatting services for cardholder archival and physical card tray printing based on verified public records.',
      },
      {
        question: 'Which vehicle classes are supported on the card layout?',
        answer:
          'The layout dynamically supports MCWG (Motorcycle with Gear), MCWOG, LMV (Light Motor Vehicle), LMV-NT, TRANS (Transport), and Heavy Motor Vehicle authorizations.',
      },
      {
        question: 'What is the service fee for DL card printing?',
        answer:
          'Verified API lookup is ₹30 per generation. Subsequent views, edits, and re-prints are 100% free (₹0).',
      },
      {
        question: 'Can I print a Driving Licence without an active API lookup?',
        answer:
          'Yes. You can launch the studio in manual entry mode to format your driving licence directly with photo and signature uploads for only ₹5.',
      },
      {
        question: 'How does the CSS @page print engine prevent margin drift?',
        answer:
          'The CSS print stylesheet sets @page { size: 85.6mm 53.98mm; margin: 0; } preventing browser margin injection and ensuring 1:1 scale on PVC printer trays.',
      },
    ],
    sampleData: {
      dlNumber: 'DL-0420110123456',
      holderName: 'SUMIT VERMA',
      fatherOrHusbandName: 'RAMESH VERMA',
      dateOfBirth: '08/11/1990',
      bloodGroup: 'B+',
      address: 'WZ-45, GALI NO. 3, JANAKPURI, NEW DELHI - 110058',
      issueDate: '15/06/2015',
      validityNonTransport: '07/11/2030',
      validityTransport: '07/11/2028',
      vehicleClasses: [
        { code: 'MCWG', desc: 'Motor Cycle With Gear', issueDate: '15/06/2015' },
        { code: 'LMV', desc: 'Light Motor Vehicle', issueDate: '15/06/2015' },
      ],
      issuingAuthority: 'RTO JANAKPURI, DELHI (DL-04)',
      photoUrl: '',
      signatureUrl: '',
      qrPayload: 'https://parivahan.gov.in/dl?id=DL-0420110123456',
    },
  },

  'vehicle-rc-printing': {
    slug: 'vehicle-rc-printing',
    docType: 'rc',
    title: 'PVC Vehicle RC Smart Card Printing Service',
    shortTitle: 'Vehicle RC',
    subtitle: 'Vahan Smart Card Layout with Chassis, Engine & Specs',
    metaTitle: 'PVC Vehicle RC Card Print Online | Vahan Smart Card Format',
    metaDescription:
      'Format and print official-standard Vehicle Registration Certificate (RC) smart cards online. Chassis, engine, maker/model specs, and instant PVC card tray PDF export.',
    fee: 35,
    lookupPlaceholder: 'Enter Vehicle RC Reg No (e.g. UP05LD1234)',
    exampleId: 'UP05LD1234',
    aeoQuickAnswer:
      'To print an official PVC Vehicle RC smart card online, enter your vehicle registration number to fetch transport database specs, or input details manually. Accero PrintPortal formats owner details, maker/model, fuel type, chassis number, engine number, and fitness validity on standard CR80 PVC dimensions.',
    heroHeadline: 'Official PVC Vehicle RC Smart Card Formatting',
    heroSubheadline:
      'Instant Vahan vehicle registration lookup, chassis & engine number mapping, and official CR80 smart card layout.',
    features: [
      'Transport Registry Vehicle Details Extraction',
      'Chassis Number, Engine Number, and Fuel Type Specification',
      'Fitness, Tax, and Insurance Validity Tracking',
      'Standard Smart Card Layout Aligned for PVC Printer Trays',
      '1-Click High-DPI Vector PDF Export for Digital & Physical Archival',
    ],
    specs: [
      { label: 'Card Standard', value: 'ISO 7810 CR80 PVC Smart Card' },
      { label: 'Physical Dimensions', value: '85.60 mm × 53.98 mm' },
      { label: 'Database Provider', value: 'Transport Registry via Secure Cascade' },
      { label: 'Service Fee', value: '₹35 per verified lookup (100% Free Re-printing)' },
      { label: 'Print Compatibility', value: 'Epson, Canon, Zebra, Evolis card printers' },
    ],
    howToSteps: [
      {
        name: 'Enter Vehicle Registration Number',
        text: 'Input vehicle registration number (e.g. UP05LD1234) to pull transport registry specs.',
      },
      {
        name: 'Verify Vehicle Specifications',
        text: 'Confirm owner name, vehicle class, chassis number, engine number, and fuel type.',
      },
      {
        name: 'Inspect Live Smart Card Canvas',
        text: 'Review the live vector preview of the smart card layout with front and back alignment.',
      },
      {
        name: 'Export & Print PVC Card',
        text: 'Download a pixel-perfect print-ready PDF and print directly using your card printer tray.',
      },
    ],
    faqs: [
      {
        question: 'What details are printed on the Vehicle RC card?',
        answer:
          'The card includes registration number, owner name, maker and model, vehicle class, chassis number, engine number, fuel type, registration date, and fitness validity.',
      },
      {
        question: 'Does Accero PrintPortal verify commercial and private vehicles?',
        answer:
          'Yes, both private vehicles (two-wheelers, cars) and commercial transport vehicles registered under transport registries are supported.',
      },
      {
        question: 'What is the fee for printing a Vehicle RC?',
        answer:
          'Verified API lookup is ₹35. Manual entry creation is ₹5. All re-prints of saved cards are 100% free.',
      },
      {
        question: 'What happens if the chassis or engine number is partial?',
        answer:
          'Accero PrintPortal automatically highlights partial or masked fields with amber warning badges in Studio, allowing you to fill in the full digits before printing.',
      },
      {
        question: 'Can I print on standard CR80 PVC plastic cards?',
        answer:
          'Yes. Output PDFs lock to exact ISO 7810 ID-1 standard dimensions (85.60 mm × 53.98 mm) for seamless physical card tray printing.',
      },
    ],
    sampleData: {
      registrationNumber: 'UP05LD1234',
      registrationDate: '22-Oct-2022',
      regnValidity: '22-Oct-2037',
      ownerSerial: 1,
      stateCode: 'UP',
      stateIssued: 'Issued by Government of Uttar Pradesh',
      transportType: 'NT',
      chassisNumber: 'MR123RK21N5K12345',
      engineNumber: 'AR1CH1234567',
      ownerName: 'ROHIT KHATRI',
      sonWifeDaughterOf: 'SUBHASH KHATRI',
      address: 'D-74, BETA 1 , GREATER NOIDA, Gautam Buddha Nagar -201308',
      vehicleClass: 'M-CYCLE/SCOOTER',
      maker: 'TVS MOTOR COMPANY LTD',
      model: 'TVSNTORQ125-SUPER SQUADEDITION',
      color: 'BLACK',
      bodyType: '2 WHEELER',
      fuelType: 'PETROL',
      emissionNorm: 'BHARAT STAGE VI',
      seatingCapacity: '0',
      unladenWeight: '0',
      cubicCapacity: '124.8',
      horsePower: '0',
      wheelBase: '0',
      monthYearOfMfg: '9/2022',
      noOfCylinders: '0',
      financier: 'BANDHAN BANK LTD',
      registeringAuthority: 'Noida, Uttar Pradesh',
      cardIssueDate: '30-08-2026',
      qrPayload: 'https://vahan.parivahan.gov.in/rc?reg=UP05LD1234',
    },
  },

  'ration-card-management': {
    slug: 'ration-card-management',
    docType: 'ration',
    title: 'PVC Ration Card Management & Printing Service',
    shortTitle: 'Ration Card',
    subtitle: 'NFSA Food Security Standard Layout with Family Member Records',
    metaTitle: 'PVC Ration Card Print Online | NFSA Smart Card Format',
    metaDescription:
      'Format and print official-standard Ration Cards on CR80 PVC layouts. Family member details, FPS dealer info, and instant print-ready PDF export.',
    fee: 25,
    lookupPlaceholder: 'Enter 12-digit Ration Card No (e.g. RC1234567890)',
    exampleId: 'RC1234567890',
    aeoQuickAnswer:
      'To format and print an official-standard PVC Ration Card online, enter your Ration Card number or fill in the head of family, member count, FPS dealer, and address details manually. Accero PrintPortal arranges the card into standard ISO 7810 CR80 dimensions with family member tables and bilingual text ready for PVC card tray printing.',
    heroHeadline: 'Official PVC Ration Card Formatting & Printing',
    heroSubheadline:
      'Bilingual family member records, FPS dealer code mapping, and exact ISO CR80 physical card tray alignment.',
    features: [
      'NFSA National Food Security Standard Demographic Layout',
      'Family Member Roster Table with Age and Relation Mapping',
      'Fair Price Shop (FPS) Code and Licensee Tracking',
      'Bilingual Head of Family and Residential Address Typography',
      'High-Resolution Print-Ready Vector PDF for PVC Card Trays',
    ],
    specs: [
      { label: 'Card Standard', value: 'ISO 7810 CR80 / CR100 ID Card Standard' },
      { label: 'Physical Dimensions', value: '85.60 mm × 53.98 mm' },
      { label: 'Category Codes', value: 'AAY (Antyodaya), PHH (Priority), BPL, APL' },
      { label: 'Service Fee', value: '₹25 per lookup (100% Free Re-printing)' },
      { label: 'Printer Tray Support', value: 'Standard 2-card and 4-card PVC trays' },
    ],
    howToSteps: [
      {
        name: 'Enter Ration Card Number',
        text: 'Input your 12-digit Ration Card number or initiate blank manual entry in the studio.',
      },
      {
        name: 'Review Family Member Records',
        text: 'Verify the head of family, listed family members, relation, and age details.',
      },
      {
        name: 'Check FPS & Scheme Category',
        text: 'Ensure the Fair Price Shop code and subsidy scheme (AAY, PHH, BPL) are correctly displayed.',
      },
      {
        name: 'Download PDF or Direct Print',
        text: 'Generate an instant high-DPI vector PDF ready for feeding PVC card blanks into your printer.',
      },
    ],
    faqs: [
      {
        question: 'Does Accero PrintPortal issue official government ration cards?',
        answer:
          'No. Accero PrintPortal is an independent document layout formatting utility. It does not issue official food cards, enroll beneficiaries, or distribute food grains.',
      },
      {
        question: 'Which card categories are supported on the ration card layout?',
        answer:
          'The layout dynamically accommodates Antyodaya Anna Yojana (AAY), Priority Household (PHH), Below Poverty Line (BPL), and Above Poverty Line (APL) categories.',
      },
      {
        question: 'What is the service fee for formatting a Ration Card?',
        answer:
          'Verified API lookup is ₹25 per card generation. Manual creation is ₹5. All subsequent re-prints are 100% free (₹0).',
      },
      {
        question: 'Can I print all family members on a single CR80 card?',
        answer:
          'Yes, the reverse side of the CR80 card features a compact, high-legibility family roster table detailing member names, ages, and relationships.',
      },
      {
        question: 'Is regional language text supported on the ration card?',
        answer:
          'Yes, head of family names and address lines can be entered and rendered in regional scripts (Hindi/Devanagari) alongside standard English.',
      },
    ],
    sampleData: {
      rationCardNumber: 'RC1234567890',
      headOfFamily: 'RAMESHWAR PRASAD',
      headOfFamilyRegional: 'रामेश्वर प्रसाद',
      fatherOrSpouseName: 'LATE BHOLA RAM',
      category: 'PHH',
      fpsName: 'GUPTA RATION STORE',
      fpsCode: 'FPS-4091',
      memberCount: 4,
      familyMembers: [
        { name: 'Kanti Devi', relation: 'Wife', gender: 'Female', age: 48, uidLinked: true },
        { name: 'Rahul Prasad', relation: 'Son', gender: 'Male', age: 24, uidLinked: true },
        { name: 'Pooja Kumari', relation: 'Daughter', gender: 'Female', age: 21, uidLinked: true },
      ],
      address: 'Village Rampur, Post Barabanki, Uttar Pradesh - 225001',
      status: 'ACTIVE',
      layoutFormat: 'cr80',
    },
  },
};

/**
 * Get service configuration by slug or document type.
 * Supports canonical slugs, legacy slugs, and short aliases.
 */
export function getServiceConfig(slugOrType: string): ServiceConfig | null {
  const clean = slugOrType.toLowerCase().trim();
  if (SERVICES_CONFIG[clean]) return SERVICES_CONFIG[clean];

  // Try matching docType
  for (const config of Object.values(SERVICES_CONFIG)) {
    if (config.docType.toLowerCase() === clean) return config;
  }

  // Handle common aliases & legacy routes
  if (clean === 'pan' || clean === 'pan-card' || clean === 'pan-card-management') {
    return SERVICES_CONFIG['pan-card-printing'];
  }
  if (
    clean === 'aadhaar' ||
    clean === 'aadhaar-card' ||
    clean === 'uid' ||
    clean === 'aadhaar-card-printing' ||
    clean === 'aadhaar-document-processing'
  ) {
    return SERVICES_CONFIG['aadhaar-document-management'];
  }
  if (
    clean === 'voter' ||
    clean === 'voter-id' ||
    clean === 'epic' ||
    clean === 'voter-id-card-printing' ||
    clean === 'voter-id-card-management'
  ) {
    return SERVICES_CONFIG['voter-id-printing'];
  }
  if (
    clean === 'dl' ||
    clean === 'driving-license' ||
    clean === 'driving-licence' ||
    clean === 'driving-license-printing' ||
    clean === 'driving-licence-management'
  ) {
    return SERVICES_CONFIG['driving-licence-printing'];
  }
  if (clean === 'rc' || clean === 'vehicle-rc' || clean === 'vehicle-rc-management') {
    return SERVICES_CONFIG['vehicle-rc-printing'];
  }
  if (
    clean === 'ration' ||
    clean === 'ration-card' ||
    clean === 'ration-card-printing'
  ) {
    return SERVICES_CONFIG['ration-card-management'];
  }

  return null;
}

/**
 * Returns all canonical service configs as an array
 */
export function getAllServices(): ServiceConfig[] {
  return Object.values(SERVICES_CONFIG);
}
