import React from 'react';
import Link from 'next/link';
import { FileQuestion, ArrowRight, Home, Printer } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16 bg-slate-50">
      <div className="max-w-lg w-full bg-white rounded-3xl border border-slate-200/90 shadow-sm p-8 sm:p-12 text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-[#8B1E2D]">
          <FileQuestion className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#8B1E2D]">
            404 — Page Not Found
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1D3557]">
            Looking for a Document Service?
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
            The requested page does not exist or has been moved to a new canonical address. Choose a service below or return to the portal homepage.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            href="/"
            variant="primary"
            size="md"
            icon={<Home className="w-4 h-4" />}
            className="w-full sm:w-auto"
          >
            Portal Home
          </Button>
          <Button
            href="/services"
            variant="outline"
            size="md"
            icon={<Printer className="w-4 h-4" />}
            className="w-full sm:w-auto"
          >
            All Document Services
          </Button>
        </div>

        <div className="pt-6 border-t border-slate-100 grid grid-cols-2 gap-2 text-left text-xs">
          <Link
            href="/ration-card-printing-for-csc"
            className="p-2.5 rounded-xl hover:bg-slate-50 transition-colors text-slate-700 hover:text-[#1D3557] font-medium"
          >
            Ration Card for CSC →
          </Link>
          <Link
            href="/farmer-id-printing-for-csc"
            className="p-2.5 rounded-xl hover:bg-slate-50 transition-colors text-slate-700 hover:text-[#1D3557] font-medium"
          >
            Farmer ID for CSC →
          </Link>
          <Link
            href="/services/pan-card-printing"
            className="p-2.5 rounded-xl hover:bg-slate-50 transition-colors text-slate-700 hover:text-[#1D3557] font-medium"
          >
            PAN Card Print →
          </Link>
          <Link
            href="/services/aadhaar-document-management"
            className="p-2.5 rounded-xl hover:bg-slate-50 transition-colors text-slate-700 hover:text-[#1D3557] font-medium"
          >
            Aadhaar PVC Card →
          </Link>
        </div>
      </div>
    </div>
  );
}
