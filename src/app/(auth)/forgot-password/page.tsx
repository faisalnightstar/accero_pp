'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { KeyRound, AlertCircle, ArrowRight, ArrowLeft, CheckCircle2, ExternalLink } from 'lucide-react';

function ForgotPasswordForm() {
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setDevResetUrl(null);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send reset instructions');
      }

      setSuccess(true);
      setSuccessMessage(
        data.message ||
        'If an account exists with this email or mobile number, reset instructions have been sent.'
      );
      if (data.devResetUrl) {
        setDevResetUrl(data.devResetUrl);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-2xl border border-slate-200 shadow-card">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#8B1E2D] to-[#E63946] flex items-center justify-center text-white mx-auto shadow-md">
          <KeyRound className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-[#1D3557]">Forgot Password?</h2>
        <p className="text-sm text-slate-500">
          Enter your registered email address or 10-digit mobile number to receive password reset instructions.
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Success State */}
      {success ? (
        <div className="space-y-6">
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-emerald-800 font-semibold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Reset Instructions Dispatched</span>
            </div>
            <p className="text-xs text-emerald-700 leading-relaxed">
              {successMessage}
            </p>
            <p className="text-xs text-slate-500">
              Please check your spam or promotions folder if you don't see the email within a couple of minutes. The link is valid for 1 hour.
            </p>
          </div>

          {devResetUrl && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs space-y-2">
              <span className="font-semibold text-amber-900 block">Development Quick Link:</span>
              <a
                href={devResetUrl}
                className="inline-flex items-center gap-1.5 text-[#8B1E2D] hover:underline break-all font-mono"
              >
                <span>Open Reset Password Link</span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              </a>
            </div>
          )}

          <div className="flex flex-col gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setSuccess(false);
                setIdentifier('');
                setDevResetUrl(null);
              }}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 text-center py-2"
            >
              Try another email or phone number
            </button>

            <Link
              href="/login"
              className="w-full py-2.5 px-4 rounded-xl font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Login</span>
            </Link>
          </div>
        </div>
      ) : (
        /* Request Form */
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Email or 10-Digit Mobile
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="operator@printportal.com or 9876543210"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#457B9D] focus:border-transparent transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-[#8B1E2D] to-[#E63946] hover:shadow-btn-hover transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <span>Sending Instructions...</span>
            ) : (
              <>
                <span>Send Reset Link</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}

      {/* Footer */}
      {!success && (
        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100 flex items-center justify-center gap-1">
          <span>Remember your password?</span>
          <Link href="/login" className="font-semibold text-[#8B1E2D] hover:underline inline-flex items-center gap-1">
            <ArrowLeft className="w-3 h-3" />
            <span>Back to Login</span>
          </Link>
        </div>
      )}
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <Suspense
        fallback={
          <div className="max-w-md w-full p-8 text-center text-slate-500">
            Loading reset portal...
          </div>
        }
      >
        <ForgotPasswordForm />
      </Suspense>
    </div>
  );
}

