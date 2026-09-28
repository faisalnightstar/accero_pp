'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  X,
  Wallet,
  Zap,
  QrCode,
  Copy,
  Check,
  ArrowRight,
  AlertCircle,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { rechargeWallet } from '@/actions/wallet';

interface RechargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newBalance: number) => void;
  suggestedAmount?: number;
}

const PRESET_AMOUNTS = [100, 250, 500, 1000];
const MERCHANT_VPA = 'accero@upi';
const MERCHANT_NAME = 'PrintPortal Gateway';

export default function RechargeModal({
  isOpen,
  onClose,
  onSuccess,
  suggestedAmount = 100,
}: RechargeModalProps) {
  const [amount, setAmount] = useState<number>(suggestedAmount);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'sandbox' | 'upi'>('sandbox');
  const [utrNumber, setUtrNumber] = useState<string>('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copiedVpa, setCopiedVpa] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{
    newBalance: number;
    amount: number;
    method: string;
  } | null>(null);

  // Sync suggested amount
  useEffect(() => {
    if (suggestedAmount && suggestedAmount >= 10) {
      setAmount(suggestedAmount);
    }
  }, [suggestedAmount]);

  // Generate dynamic UPI QR Code when amount changes
  useEffect(() => {
    if (!isOpen || activeTab !== 'upi') return;

    const currentAmount = customAmount ? parseFloat(customAmount) || amount : amount;
    const upiUri = `upi://pay?pa=${MERCHANT_VPA}&pn=${encodeURIComponent(
      MERCHANT_NAME
    )}&am=${currentAmount.toFixed(2)}&cu=INR&tn=Wallet+Recharge`;

    QRCode.toDataURL(upiUri, {
      width: 400,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((url) => setQrCodeDataUrl(url))
      .catch((err) => console.error('[QR] Failed to generate UPI QR:', err));
  }, [isOpen, activeTab, amount, customAmount]);

  if (!isOpen) return null;

  const currentAmount = customAmount ? parseFloat(customAmount) || 0 : amount;

  const handleSelectPreset = (val: number) => {
    setAmount(val);
    setCustomAmount('');
    setErrorMessage(null);
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomAmount(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      setAmount(num);
    }
    setErrorMessage(null);
  };

  const copyVpa = () => {
    navigator.clipboard.writeText(MERCHANT_VPA);
    setCopiedVpa(true);
    setTimeout(() => setCopiedVpa(false), 2000);
  };

  const handleSandboxRecharge = async () => {
    if (currentAmount < 10) {
      setErrorMessage('Minimum recharge amount is ₹10.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await rechargeWallet(currentAmount, 'SANDBOX');
      if (res.success) {
        setSuccessInfo({
          newBalance: res.newBalance,
          amount: currentAmount,
          method: 'Sandbox Instant Credit',
        });
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('wallet-updated', { detail: res.newBalance }));
        }
        onSuccess?.(res.newBalance);
      } else {
        setErrorMessage(res.error || 'Failed to simulate top-up');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error executing recharge');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpiSubmit = async () => {
    if (currentAmount < 10) {
      setErrorMessage('Minimum recharge amount is ₹10.');
      return;
    }

    const cleanUtr = utrNumber.trim();
    if (!cleanUtr || cleanUtr.length < 8) {
      setErrorMessage('Please enter a valid 12-digit UPI UTR / Transaction Reference number.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await rechargeWallet(currentAmount, 'UPI_QR', cleanUtr);
      if (res.success) {
        setSuccessInfo({
          newBalance: res.newBalance,
          amount: currentAmount,
          method: `UPI QR (UTR: ${cleanUtr})`,
        });
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('wallet-updated', { detail: res.newBalance }));
        }
        onSuccess?.(res.newBalance);
      } else {
        setErrorMessage(res.error || 'Failed to record UPI recharge');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error processing UPI reference');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setSuccessInfo(null);
    setErrorMessage(null);
    setUtrNumber('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#8B1E2D]/20 border border-[#8B1E2D]/40 flex items-center justify-center text-[#F4D35E]">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">
                Top-up Wallet Credits
              </h2>
              <p className="text-xs text-slate-400">
                Official Document Verification & PVC Print Balance
              </p>
            </div>
          </div>
          <button
            onClick={resetAndClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {successInfo ? (
            /* Success State */
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Check className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  Recharge Successful!
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                  ₹{successInfo.amount.toFixed(2)} added via {successInfo.method}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/60 inline-block">
                <span className="text-xs text-slate-400 uppercase tracking-wider block">
                  New Available Balance
                </span>
                <span className="text-2xl font-black text-[#F4D35E] tracking-tight">
                  ₹{successInfo.newBalance.toFixed(2)}
                </span>
              </div>
              <div>
                <button
                  onClick={resetAndClose}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#8B1E2D] to-[#E63946] text-white font-semibold hover:opacity-95 transition-opacity"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Amount Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Select Amount (INR)
                </label>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {PRESET_AMOUNTS.map((val) => {
                    const isSelected = !customAmount && amount === val;
                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() => handleSelectPreset(val)}
                        className={`py-2.5 px-3 rounded-xl font-bold text-sm border transition-all ${
                          isSelected
                            ? 'bg-[#8B1E2D]/20 border-[#F4D35E] text-[#F4D35E] shadow-sm'
                            : 'bg-slate-800/60 border-slate-700/70 text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        ₹{val}
                      </button>
                    );
                  })}
                </div>
                {/* Custom input */}
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="10"
                    placeholder="Enter custom amount (min ₹10)"
                    value={customAmount}
                    onChange={handleCustomChange}
                    className="w-full pl-8 pr-4 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#F4D35E] text-sm"
                  />
                </div>
              </div>

              {/* Mode Switch Tabs */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('sandbox');
                      setErrorMessage(null);
                    }}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                      activeTab === 'sandbox'
                        ? 'bg-[#8B1E2D] text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Zap className="w-4 h-4 text-[#F4D35E]" />
                    Instant Sandbox
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('upi');
                      setErrorMessage(null);
                    }}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                      activeTab === 'upi'
                        ? 'bg-[#8B1E2D] text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <QrCode className="w-4 h-4 text-[#F4D35E]" />
                    UPI QR Code
                  </button>
                </div>
              </div>

              {/* Tab 1: Instant Sandbox Simulation */}
              {activeTab === 'sandbox' && (
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-[#F4D35E] mt-0.5 shrink-0" />
                    <div>
                      <h4 className="text-sm font-semibold text-white">
                        Instant Sandbox Credit
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                        Simulates an immediate ₹{currentAmount.toFixed(2)} recharge to test
                        document lookups and PVC printing without external merchant KYC.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isSubmitting || currentAmount < 10}
                    onClick={handleSandboxRecharge}
                    className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#8B1E2D] to-[#E63946] text-white font-bold flex items-center justify-center gap-2 shadow-lg hover:opacity-95 transition-opacity disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Crediting ₹{currentAmount.toFixed(2)}...
                      </>
                    ) : (
                      <>
                        Credit ₹{currentAmount.toFixed(2)} Now
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Tab 2: UPI QR Code & UTR Submission */}
              {activeTab === 'upi' && (
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-4">
                  {/* QR Presentation */}
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="p-3 bg-white rounded-xl shadow-lg border border-slate-300">
                      {qrCodeDataUrl ? (
                        <img
                          src={qrCodeDataUrl}
                          alt="UPI Payment QR Code"
                          className="w-40 h-40 object-contain"
                        />
                      ) : (
                        <div className="w-40 h-40 flex items-center justify-center text-slate-400">
                          <Loader2 className="w-6 h-6 animate-spin" />
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-slate-400">
                      Scan with Google Pay, PhonePe, Paytm, or BHIM
                    </span>
                  </div>

                  {/* VPA copy box */}
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-700/80 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">
                        UPI ID / VPA
                      </span>
                      <span className="font-mono text-white font-bold">
                        {MERCHANT_VPA}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={copyVpa}
                      className="px-2.5 py-1.5 rounded-md bg-slate-800 text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
                    >
                      {copiedVpa ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* UTR reference input */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Enter 12-digit UPI Reference / UTR Number
                    </label>
                    <input
                      type="text"
                      maxLength={18}
                      placeholder="e.g. 426819284712"
                      value={utrNumber}
                      onChange={(e) => setUtrNumber(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 font-mono text-xs focus:outline-none focus:border-[#F4D35E]"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Found in your UPI app receipt under &quot;UPI Ref No.&quot; or &quot;UTR&quot;.
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={isSubmitting || currentAmount < 10 || !utrNumber.trim()}
                    onClick={handleUpiSubmit}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#8B1E2D] to-[#E63946] text-white font-bold flex items-center justify-center gap-2 shadow-lg hover:opacity-95 transition-opacity disabled:opacity-50 text-sm"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Verifying Reference...
                      </>
                    ) : (
                      <>
                        Submit UTR & Top-up ₹{currentAmount.toFixed(2)}
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Error Alert */}
              {errorMessage && (
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
