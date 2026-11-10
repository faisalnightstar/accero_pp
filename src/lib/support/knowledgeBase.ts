export interface KnowledgeBaseArticle {
  id: string;
  category: string;
  title: string;
  summary: string;
  content: string;
  keywords: string[];
}

export const SUPPORT_KNOWLEDGE_BASE: KnowledgeBaseArticle[] = [
  {
    id: 'kb-001',
    category: 'Wallet & Billing',
    title: 'UPI Payment Pending & Reconciliation Workflow',
    summary: 'Standard steps for investigating payments that are pending in bank gateway.',
    content:
      'When an operator reports a wallet recharge deduction without wallet balance update: 1. Ask for the bank UTR reference number (12 digits). 2. Search UTR in Admin > Payments or Finance > Manual UTR. 3. If verified on bank statement, approve the manual UTR. Wallet will be credited atomically with instant ledger transaction.',
    keywords: ['utr', 'pending', 'recharge', 'paytm', 'upi', 'deduction'],
  },
  {
    id: 'kb-002',
    category: 'Printing & Hardware',
    title: 'CR80 Card Specifications & Tray Alignment (Epson L805 & Canon G-Series)',
    summary: 'Standard physical dimensions and tray printer margins for high-resolution PVC printing.',
    content:
      'CR80 Standard Dimensions: 85.60 mm × 53.98 mm (approx 3.375" × 2.125"). In print dialog, ensure: 1. Scale is set to "Actual Size" or 100% (NEVER "Fit to Page"). 2. Margins set to "None" (Zero-margin @page layout handles physical tray alignment). 3. Source set to "CD/DVD Tray" or "PVC Card Tray".',
    keywords: ['epson', 'canon', 'l805', 'tray', 'cr80', 'dimensions', 'alignment', 'margins'],
  },
  {
    id: 'kb-003',
    category: 'Billing Policy',
    title: 'Free Lifetime Reprint Policy (₹0)',
    summary: 'Rules governing re-printing previously verified documents without balance deductions.',
    content:
      'Under Accero PrintPortal commercial policy, operators are charged ONLY once when verifying or formatting a document. All subsequent re-prints of the same card record are 100% free (₹0). If an operator was charged twice for the same document identifier within 72 hours, create a financial escalation ticket for an admin refund.',
    keywords: ['reprint', 'free', 'zero', 'duplicate', 'policy', 'refund'],
  },
  {
    id: 'kb-004',
    category: 'Document Studio',
    title: 'Missing Fields & Amber Warning Indicators in Live Editor',
    summary: 'How operators can complete partial API responses in the split-screen studio.',
    content:
      'Government databases often return partial records (e.g. missing father name or date of birth). In Accero PrintPortal, missing fields are highlighted in amber. Operators can type in the missing values directly in the left pane, upload a portrait photo, and the live SVG/canvas will update in real-time before printing.',
    keywords: ['missing', 'amber', 'father name', 'dob', 'split-screen', 'studio', 'canvas'],
  },
  {
    id: 'kb-005',
    category: 'Promotional Campaigns',
    title: 'Accero Launch Offer Bonus Slabs (₹249 + ₹50 Bonus)',
    summary: 'Rules for promotional credits and redemption limits.',
    content:
      'Eligible recharges receive ₹50 bonus per ₹249 slab: ₹249 recharge = ₹299 wallet credit, ₹498 recharge = ₹598 wallet credit. Promotional credits appear as separate ledger entries (PROMOTIONAL_BONUS) and cannot be cashed out. Maximum bonus cap is ₹1,000 per operator.',
    keywords: ['bonus', 'launch offer', '249', '50', 'promotional', 'slab'],
  },
  {
    id: 'kb-006',
    category: 'Troubleshooting',
    title: 'Error Code Reference (E001 - E010)',
    summary: 'Standardized error codes and quick resolution paths.',
    content:
      'E001: Third-party API timeout (Advise retry after 2 minutes or use manual entry mode). E002: Invalid document format (Check regex format for 10-char PAN or 12-digit Aadhaar). E003: Insufficient wallet balance (Direct operator to recharge wallet). E004: Payment gateway communication failure (Advise retry with alternative UPI app).',
    keywords: ['error', 'codes', 'timeout', 'e001', 'e002', 'e003'],
  },
];
