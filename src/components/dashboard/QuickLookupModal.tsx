'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  X,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Car,
  Sparkles,
  ArrowRight,
  FilePlus,
} from 'lucide-react';
import { DocumentType } from '@/types/cards';
import { validateEpicNumber } from '@/lib/verify/validators';

interface QuickLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: DocumentType;
}

const docTypesList: Array<{
  id: DocumentType;
  label: string;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
  example: string;
  fee: number;
}> = [
    { id: 'pan', label: 'PAN Card', hint: '10-character PAN number', icon: CreditCard, example: 'ABCDE1234F', fee: 50 },
    { id: 'rc', label: 'Vehicle RC', hint: 'Vehicle registration certificate number', icon: Car, example: 'UP05LD1234', fee: 35 },
    { id: 'dl', label: 'Driving License', hint: 'State transport license number', icon: CreditCard, example: 'DL-0420110123456', fee: 30 },
    { id: 'aadhaar', label: 'Aadhaar Card', hint: '12-digit UIDAI number', icon: ShieldCheck, example: '5749 0326 7673', fee: 25 },
    { id: 'voter', label: 'Voter ID', hint: 'Election Commission EPIC number', icon: CheckCircle2, example: 'ABC0123456', fee: 20 },
  ];

export function QuickLookupModal({
  isOpen,
  onClose,
  initialType = 'pan',
}: QuickLookupModalProps) {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<DocumentType>(initialType);
  const [idNumber, setIdNumber] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const activeMeta = docTypesList.find((d) => d.id === selectedType) || docTypesList[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sanitized = idNumber.trim().toUpperCase();

    if (!sanitized) {
      setError('Please enter a valid document number.');
      return;
    }

    if (selectedType === 'voter') {
      const epicCheck = validateEpicNumber(sanitized);
      if (!epicCheck.valid) {
        setError(epicCheck.errorMessage || 'Please enter a valid Voter EPIC number.');
        return;
      }
    }

    onClose();
    router.push(`/studio?type=${selectedType}&lookup=${encodeURIComponent(sanitized)}`);
  };

  const handleOpenBlank = () => {
    onClose();
    router.push(`/studio?type=${selectedType}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#8B1E2D]/20 border border-[#8B1E2D]/40 text-[#E63946] rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                Quick Document Lookup
              </h2>
              <p className="text-xs text-slate-400">
                1-Click verification & instant Studio pre-fill
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Document Type Selector */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Select Document Category
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {docTypesList.map((doc) => {
              const Icon = doc.icon;
              const isSelected = selectedType === doc.id;
              return (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => {
                    setSelectedType(doc.id);
                    setError(null);
                  }}
                  className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${isSelected
                    ? 'bg-[#8B1E2D]/20 border-[#E63946] text-white shadow-xs'
                    : 'bg-slate-800/60 border-slate-700/70 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-[#E63946]' : 'text-slate-500'}`} />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-semibold block truncate">{doc.label}</span>
                    <span className="text-[10px] text-[#F4D35E] font-bold">Fee: ₹{doc.fee}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form Query */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
          toolname="dashboard_quick_lookup"
          tooldescription="Lookup document record by identification number from dashboard"
          toolautosubmit="true"
        >
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="quick-lookup-id" className="text-xs font-semibold text-slate-300">
                {activeMeta.label} Identifier
              </label>
              <span className="text-[11px] text-slate-500 font-mono">
                Ex: {activeMeta.example}
              </span>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                id="quick-lookup-id"
                name="documentIdNumber"
                type="text"
                toolparamdescription="Alphanumeric document identification number (e.g. PAN, Aadhaar, Voter EPIC, DL, RC)"
                value={idNumber}
                onChange={(e) => {
                  setIdNumber(e.target.value.toUpperCase());
                  setError(null);
                }}
                placeholder={activeMeta.hint}
                autoFocus
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#E63946] font-mono tracking-wider"
              />
            </div>

            {error && (
              <p className="text-xs text-red-400 animate-in fade-in duration-100">
                {error}
              </p>
            )}
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleOpenBlank}
              className="px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors border border-slate-700 flex items-center gap-1.5"
            >
              <FilePlus className="w-4 h-4 text-slate-400" />
              <span>Open Blank Form</span>
            </button>

            <button
              type="submit"
              className="flex-1 py-2.5 px-4 bg-[#8B1E2D] hover:bg-[#A82537] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 group"
            >
              <span>Fetch & Open in Studio</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
