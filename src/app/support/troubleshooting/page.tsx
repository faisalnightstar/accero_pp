'use client';

import React, { useState } from 'react';
import {
  Wrench,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Printer,
  Copy,
  ChevronRight,
  ShieldCheck,
  BookOpen,
  Sparkles,
} from 'lucide-react';

interface ErrorEntry {
  code: string;
  category: string;
  name: string;
  description: string;
  remedy: string;
  agentReplyTemplate: string;
}

const ERROR_CATALOG: ErrorEntry[] = [
  {
    code: 'E001',
    category: 'API & Integration',
    name: 'Government Portal Endpoint Timeout',
    description: 'Third-party upstream verification API (NeoAPI / UIDAI / NSDL) did not respond within the 10,000ms SLA.',
    remedy: 'Advise operator to retry in 2 minutes. If the issue persists, direct them to use Manual Studio Entry mode to format and print without waiting for government lookup.',
    agentReplyTemplate: 'Dear Operator, the upstream government database is currently experiencing intermittent latency. You can either retry your lookup in 2-3 minutes or switch to "Manual Studio Entry" mode to enter details and print your card immediately.',
  },
  {
    code: 'E002',
    category: 'Validation',
    name: 'Invalid Document Number or Checksum Failure',
    description: 'Document identifier does not match standard government regex (e.g. 10-char PAN [A-Z]{5}[0-9]{4}[A-Z], 12-digit Aadhaar Verhoeff checksum, or state-prefixed EPIC/DL).',
    remedy: 'Inspect the identifier format with the operator. Ensure no spaces, hyphens, or mistaken letters (such as letter O instead of number 0).',
    agentReplyTemplate: 'Please verify the document number. Ensure there are no spaces or special characters. For PAN cards, the 5th character is a letter; for Aadhaar, all 12 characters must be numbers.',
  },
  {
    code: 'E003',
    category: 'Billing',
    name: 'Insufficient Wallet Balance',
    description: 'Operator wallet balance is lower than the required service fee for document first-time verification.',
    remedy: 'Direct the operator to the Wallet Recharge Modal (minimum ₹249 with ₹50 launch bonus). Note: Reprints of already verified documents are ₹0 and never require balance.',
    agentReplyTemplate: 'Your current wallet balance is insufficient to process a new document verification. Please recharge your wallet via UPI to continue. Remember that any re-prints of previously processed cards are 100% free (₹0).',
  },
  {
    code: 'E004',
    category: 'Payment Gateway',
    name: 'Payment Pending or Gateway Webhook Delay',
    description: 'Payment was deducted by user bank but gateway notification has not yet posted to the wallet ledger.',
    remedy: 'Request the 12-digit bank UTR reference. Look up the payment in Support > Operators or escalate to Finance for manual approval.',
    agentReplyTemplate: 'Please provide your 12-digit Bank UTR reference number from your UPI payment app statement. Our team will verify the bank reconciliation record and credit your wallet immediately.',
  },
  {
    code: 'E005',
    category: 'Cache & Storage',
    name: '72-Hour Cache Expired / Document Record Missing',
    description: 'Cached document record has aged beyond 72 hours and requires fresh verification or manual review.',
    remedy: 'Explain the 72-hour fresh lookup cycle. Operator can re-lookup or open Document History to re-print previously saved SVG/HTML templates.',
    agentReplyTemplate: 'Document lookups are cached securely in your workspace for 72 hours. You can still access and reprint your previously generated cards at ₹0 from your Document History page.',
  },
  {
    code: 'E006',
    category: 'Printing Hardware',
    name: 'Physical Card Tray Alignment & Margin Shift',
    description: 'Printed PVC card has borders clipped or text shifted off-center in the physical card tray.',
    remedy: 'Ensure browser print scaling is set to "100%" or "Actual Size" (never "Fit to Page") and margins are set to "None" so CSS @page zero-margins control the print tray.',
    agentReplyTemplate: 'To fix tray alignment on Epson L805 or Canon G-series printers: In the browser print dialog, select "More Settings", set Margins to "None", and set Scale to "Actual Size" (100%). Never select "Fit to Printable Area".',
  },
  {
    code: 'E007',
    category: 'Document Studio',
    name: 'Portrait Photo / Signature Asset Render Failure',
    description: 'Image upload was rejected due to unsupported format, excessive file size (>5MB), or corrupted payload.',
    remedy: 'Advise operator to upload JPEG/PNG formats under 5MB. In Manual Mode, user can crop or re-upload portrait directly in the studio.',
    agentReplyTemplate: 'Please ensure your uploaded photograph or signature is in JPEG or PNG format and under 5MB in size. You can use the drag-and-drop studio box to upload a fresh photo.',
  },
  {
    code: 'E008',
    category: 'Security',
    name: 'Duplicate UTR Submission Detected',
    description: 'An operator attempted to submit a Bank UTR that has already been credited or is under review for another transaction.',
    remedy: 'Check UTR in Admin > Payments. If already approved, notify operator of the existing credit. If fraudulent, flag account for review.',
    agentReplyTemplate: 'The Bank UTR reference number submitted is already associated with an earlier completed wallet recharge. Please verify your transaction history in the wallet section.',
  },
  {
    code: 'E009',
    category: 'Authentication',
    name: 'Session Token Expired',
    description: 'Operator JWT session has expired or was revoked.',
    remedy: 'Advise operator to log out and log back in to refresh their secure session.',
    agentReplyTemplate: 'Your session has timed out for security reasons. Please log out and sign back in to continue.',
  },
  {
    code: 'E010',
    category: 'System',
    name: 'Database Concurrency Lock Retry Exhausted',
    description: 'High concurrent wallet operations caused an optimistic lock conflict during transaction commit.',
    remedy: 'Automatic retry usually resolves this. If operator experienced a deduction without print, escalate to Admin for refund check.',
    agentReplyTemplate: 'A momentary server concurrency conflict occurred. Your wallet balance has been verified and remains secure. Please try submitting your print request again.',
  },
];

export default function SupportTroubleshootingPage() {
  const [search, setSearch] = useState('');
  const [selectedError, setSelectedError] = useState<ErrorEntry>(ERROR_CATALOG[0]);
  const [copied, setCopied] = useState(false);

  const filteredErrors = ERROR_CATALOG.filter(
    (e) =>
      e.code.toLowerCase().includes(search.toLowerCase()) ||
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.category.toLowerCase().includes(search.toLowerCase()) ||
      e.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Wrench className="w-6 h-6 text-amber-400" />
            Technical Troubleshooting & Error Catalog
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Standardized issue diagnosis, root-cause remedies, and copyable customer response scripts.
          </p>
        </div>
      </div>

      {/* Hardware Print Tray Cheatsheet Banner */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-semibold">
              <Printer className="w-3.5 h-3.5" />
              Hardware Printing Cheatsheet (Epson L805 & Canon G-Series)
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">CR80 PVC Card Precision Specs (85.60 mm × 53.98 mm)</h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              PrintPortal canvases are engineered to standard ISO/IEC 7810 ID-1 card tray specifications. Operators experiencing misaligned tray prints must ensure:
            </p>
            <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
              <li><strong>Print Scale:</strong> Must be set to <strong>100% (Actual Size)</strong>. Never select "Fit to Page".</li>
              <li><strong>Margins:</strong> Set Margins to <strong>None</strong> (Zero-margin CSS handles physical card positioning).</li>
              <li><strong>Media Type:</strong> Select <strong>PVC Card / CD/DVD Tray</strong> in the printer driver settings.</li>
            </ul>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shrink-0 space-y-2 text-center text-xs">
            <p className="text-[10px] uppercase font-mono text-slate-400">Standard Card Standard</p>
            <p className="text-base font-bold text-white font-mono">CR80 (ID-1)</p>
            <p className="text-[11px] font-mono text-emerald-400">3.375" × 2.125"</p>
          </div>
        </div>
      </div>

      {/* Interactive Error Code Reference */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Error Code List */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search E001-E010, symptoms, category..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="space-y-1.5 max-h-[540px] overflow-y-auto pr-1">
            {filteredErrors.map((err) => (
              <button
                key={err.code}
                onClick={() => setSelectedError(err)}
                className={`w-full p-3 rounded-xl border text-left transition-colors flex items-center justify-between ${
                  selectedError.code === err.code
                    ? 'bg-amber-500/10 border-amber-500/40 text-white'
                    : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800 text-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-amber-400">{err.code}</span>
                    <span className="text-[10px] font-mono text-slate-500 uppercase">{err.category}</span>
                  </div>
                  <p className="text-xs font-semibold mt-0.5 line-clamp-1">{err.name}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Detailed Remedy & Copyable Response */}
        <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 font-mono font-bold text-sm">
                  {selectedError.code}
                </span>
                <span className="text-xs font-mono uppercase text-slate-400">
                  {selectedError.category}
                </span>
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight mt-2">{selectedError.name}</h3>
            </div>
          </div>

          {/* Root Cause Description */}
          <div className="space-y-2">
            <h4 className="text-xs uppercase font-mono font-bold text-slate-400 tracking-wider">
              Underlying Cause
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 border border-slate-800 rounded-xl p-4">
              {selectedError.description}
            </p>
          </div>

          {/* Actionable Staff Remedy */}
          <div className="space-y-2">
            <h4 className="text-xs uppercase font-mono font-bold text-emerald-400 tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Staff Resolution Workflow
            </h4>
            <p className="text-xs text-slate-200 leading-relaxed bg-emerald-950/20 border border-emerald-800/40 rounded-xl p-4">
              {selectedError.remedy}
            </p>
          </div>

          {/* Copyable Customer Reply Template */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs uppercase font-mono font-bold text-cyan-400 tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                Standard Customer Response Template
              </h4>
              <button
                onClick={() => handleCopy(selectedError.agentReplyTemplate)}
                className="flex items-center gap-1 px-2.5 py-1 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 rounded-lg text-xs font-semibold transition-colors"
              >
                <Copy className="w-3 h-3" />
                {copied ? 'Copied to Clipboard!' : 'Copy Template'}
              </button>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs font-mono text-cyan-200/90 leading-relaxed whitespace-pre-wrap">
              {selectedError.agentReplyTemplate}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
