'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Smartphone,
  CheckCircle2,
  Layers,
  Clock,
} from 'lucide-react';
import {
  rechargeWallet,
  createPaytmOrderAction,
  verifyPaytmOrderAction,
} from '@/actions/wallet';
import { trackEvent, ANALYTICS_EVENTS } from '@/lib/analytics/events';

interface RechargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newBalance: number) => void;
  suggestedAmount?: number;
}

const PRESET_AMOUNTS = [100, 250, 500, 1000];

export default function RechargeModal({
  isOpen,
  onClose,
  onSuccess,
  suggestedAmount = 100,
}: RechargeModalProps) {
  const [amount, setAmount] = useState<number>(suggestedAmount);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'paytm' | 'sandbox' | 'utr'>('paytm');
  
  // Paytm Dynamic Order State
  const [selectedAccountIndex, setSelectedAccountIndex] = useState<number | undefined>(undefined);
  const [currentOrder, setCurrentOrder] = useState<{
    orderId: string;
    amount: number;
    upiId: string;
    mid: string;
    accountIndex: number;
    upiUrl: string;
    qrDataUrl: string;
  } | null>(null);
  const [isGeneratingOrder, setIsGeneratingOrder] = useState<boolean>(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState<boolean>(false);
  const [pollCount, setPollCount] = useState<number>(0);

  // Manual UTR Fallback State
  const [utrNumber, setUtrNumber] = useState<string>('');
  const [copiedVpa, setCopiedVpa] = useState<boolean>(false);
  const [copiedOrderId, setCopiedOrderId] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Success State
  const [successInfo, setSuccessInfo] = useState<{
    newBalance: number;
    amount: number;
    method: string;
    bankTxnId?: string;
    orderId?: string;
  } | null>(null);

  // Pending Manual Submission State
  const [pendingSubmission, setPendingSubmission] = useState<{
    utr: string;
    amount: number;
    message: string;
  } | null>(null);

  const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isComponentMounted = useRef<boolean>(true);

  // Keep suggested amount synced
  useEffect(() => {
    if (suggestedAmount && suggestedAmount >= 10) {
      setAmount(suggestedAmount);
    }
  }, [suggestedAmount]);

  const effectiveAmount = customAmount ? parseFloat(customAmount) || 0 : amount;

  // Stop polling helper
  const stopPolling = useCallback(() => {
    if (pollingTimerRef.current) {
      clearInterval(pollingTimerRef.current);
      pollingTimerRef.current = null;
    }
  }, []);

  // Generate Paytm Dynamic Order
  const generatePaytmOrder = useCallback(
    async (orderAmt: number, accountIdx?: number) => {
      if (orderAmt < 10) return;
      stopPolling();
      setIsGeneratingOrder(true);
      setErrorMessage(null);

      try {
        const res = await createPaytmOrderAction(orderAmt, accountIdx);
        if (res.success && res.orderId && res.qrDataUrl && res.upiUrl) {
          trackEvent(ANALYTICS_EVENTS.RECHARGE_STARTED, { paymentMethod: 'GATEWAY', rechargeAmount: res.amount || orderAmt });
          setCurrentOrder({
            orderId: res.orderId,
            amount: res.amount || orderAmt,
            upiId: res.upiId || 'paytm@upi',
            mid: res.mid || '',
            accountIndex: res.accountIndex || 1,
            upiUrl: res.upiUrl,
            qrDataUrl: res.qrDataUrl,
          });
          setPollCount(0);
        } else {
          setErrorMessage(res.error || 'Failed to generate Paytm dynamic payment QR.');
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'Error creating Paytm payment order');
      } finally {
        setIsGeneratingOrder(false);
      }
    },
    [stopPolling]
  );

  // Handle successful payment completion
  const handlePaymentSuccess = useCallback(
    (newBalance: number, creditAmt: number, methodDesc: string, bankTxnId?: string, orderId?: string) => {
      stopPolling();
      setSuccessInfo({
        newBalance,
        amount: creditAmt,
        method: methodDesc,
        bankTxnId,
        orderId,
      });

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('wallet-updated', { detail: newBalance }));
      }
      trackEvent(ANALYTICS_EVENTS.RECHARGE_COMPLETED, {
        paymentMethod: methodDesc || 'GATEWAY',
        rechargeAmount: creditAmt,
      });
      onSuccess?.(newBalance);
    },
    [onSuccess, stopPolling]
  );

  // Verify Paytm Order Status
  const checkPaytmStatus = useCallback(
    async (orderId: string, isManualCheck = false) => {
      if (!orderId) return;
      if (isManualCheck) setIsCheckingStatus(true);

      try {
        const res = await verifyPaytmOrderAction(orderId);
        if (res.status === 'paid' && res.newBalance !== undefined) {
          handlePaymentSuccess(
            res.newBalance,
            res.amount || effectiveAmount,
            `Paytm UPI Auto-Verify (${currentOrder?.upiId || 'Merchant'})`,
            res.bankTxnId,
            orderId
          );
        } else if (isManualCheck && res.message) {
          setErrorMessage(res.message);
        }
      } catch (err: any) {
        if (isManualCheck) {
          setErrorMessage(err.message || 'Unable to check status right now.');
        }
      } finally {
        if (isManualCheck) setIsCheckingStatus(false);
      }
    },
    [currentOrder?.upiId, effectiveAmount, handlePaymentSuccess]
  );

  // Auto-generate order when opening modal or changing amount / tab
  useEffect(() => {
    isComponentMounted.current = true;
    if (isOpen && activeTab === 'paytm' && !successInfo) {
      if (effectiveAmount >= 10) {
        generatePaytmOrder(effectiveAmount, selectedAccountIndex);
      }
    } else {
      stopPolling();
    }

    return () => {
      stopPolling();
    };
  }, [isOpen, activeTab, selectedAccountIndex, stopPolling]);

  // Handle amount change debouncing for Paytm QR
  useEffect(() => {
    if (!isOpen || activeTab !== 'paytm' || successInfo) return;
    if (effectiveAmount < 10) return;

    const timer = setTimeout(() => {
      generatePaytmOrder(effectiveAmount, selectedAccountIndex);
    }, 600);

    return () => clearTimeout(timer);
  }, [effectiveAmount]);

  // Auto-polling interval: checks every 3 seconds while order is pending
  useEffect(() => {
    if (!isOpen || activeTab !== 'paytm' || !currentOrder?.orderId || successInfo) {
      stopPolling();
      return;
    }

    stopPolling();

    // Poll every 3 seconds for up to 10 minutes (200 attempts)
    pollingTimerRef.current = setInterval(() => {
      setPollCount((prev) => {
        if (prev >= 200) {
          stopPolling();
          return prev;
        }
        checkPaytmStatus(currentOrder.orderId, false);
        return prev + 1;
      });
    }, 3000);

    return () => {
      stopPolling();
    };
  }, [isOpen, activeTab, currentOrder?.orderId, successInfo, checkPaytmStatus, stopPolling]);

  if (!isOpen) return null;

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

  const copyVpa = (vpaText: string) => {
    navigator.clipboard.writeText(vpaText);
    setCopiedVpa(true);
    setTimeout(() => setCopiedVpa(false), 2000);
  };

  const copyOrderId = (idText: string) => {
    navigator.clipboard.writeText(idText);
    setCopiedOrderId(true);
    setTimeout(() => setCopiedOrderId(false), 2000);
  };

  const handleSandboxRecharge = async () => {
    if (effectiveAmount < 10) {
      setErrorMessage('Minimum recharge amount is ₹10.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await rechargeWallet(effectiveAmount, 'SANDBOX');
      if (res.success) {
        handlePaymentSuccess(
          res.newBalance,
          effectiveAmount,
          'Sandbox Instant Test Credit'
        );
      } else {
        setErrorMessage(res.error || 'Failed to simulate top-up');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error executing sandbox recharge');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUtrSubmit = async () => {
    if (effectiveAmount < 10) {
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
      const res = await rechargeWallet(effectiveAmount, 'UPI_QR', cleanUtr);
      if (res.success) {
        if (res.pending) {
          setPendingSubmission({
            utr: cleanUtr,
            amount: effectiveAmount,
            message: res.message || 'Payment reference submitted for administrator verification.',
          });
        } else {
          handlePaymentSuccess(
            res.newBalance,
            effectiveAmount,
            `Manual UPI Reference (UTR: ${cleanUtr})`
          );
        }
      } else {
        setErrorMessage(res.error || 'Failed to submit UPI reference');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error processing UPI reference');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAndClose = () => {
    stopPolling();
    setSuccessInfo(null);
    setPendingSubmission(null);
    setErrorMessage(null);
    setUtrNumber('');
    setCurrentOrder(null);
    onClose();
  };

  return (
    <div className="no-print fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#002e6e] to-[#00baF2] p-0.5 flex items-center justify-center shadow-lg shadow-sky-500/10">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Wallet className="w-5 h-5 text-[#00baF2]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-wide">
                  Top-up Wallet Credits
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-sky-500/20 text-[#00baF2] border border-sky-500/30">
                  Instant
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Official Document Verification & PVC Print Balance
              </p>
            </div>
          </div>
          <button
            onClick={resetAndClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {pendingSubmission ? (
            /* Pending Manual Verification State */
            <div className="py-6 text-center space-y-4">
              <div className="w-20 h-20 mx-auto rounded-full bg-amber-500/20 border-2 border-amber-500/40 flex items-center justify-center text-amber-400 shadow-xl shadow-amber-500/10 animate-in zoom-in-50 duration-300">
                <Clock className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white tracking-tight">
                  Verification Pending
                </h3>
                <p className="text-sm text-slate-300 mt-1">
                  UTR Reference <span className="font-mono font-bold text-amber-400">{pendingSubmission.utr}</span> submitted.
                </p>
                <p className="text-xs text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
                  Your manual recharge of ₹{pendingSubmission.amount.toFixed(2)} is pending administrator review. Your wallet balance will be credited as soon as the transaction is confirmed.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-left">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Status:</span>
                  <span className="font-bold text-amber-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Awaiting Admin Approval
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Amount:</span>
                  <span className="font-mono text-slate-200 font-bold">₹{pendingSubmission.amount.toFixed(2)}</span>
                </div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={resetAndClose}
                  className="w-full py-3.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-all"
                >
                  Close &amp; Return
                </button>
              </div>
            </div>
          ) : successInfo ? (
            /* Success State */
            <div className="py-6 text-center space-y-4">
              <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/10 animate-in zoom-in-50 duration-300">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white tracking-tight">
                  Recharge Successful!
                </h3>
                <p className="text-sm text-slate-300 mt-1">
                  ₹{successInfo.amount.toFixed(2)} credited to your wallet instantly.
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {successInfo.method}
                </p>
              </div>

              {/* Transaction ID & New Balance Details */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-left">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Transaction Status:</span>
                  <span className="font-bold text-emerald-400 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Confirmed
                  </span>
                </div>
                {successInfo.bankTxnId && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Bank Ref / Txn ID:</span>
                    <span className="font-mono text-slate-200 font-bold">{successInfo.bankTxnId}</span>
                  </div>
                )}
                {successInfo.orderId && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Order Reference:</span>
                    <span className="font-mono text-slate-300">{successInfo.orderId}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                  <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                    New Balance
                  </span>
                  <span className="text-2xl font-black text-[#F4D35E]">
                    ₹{successInfo.newBalance.toFixed(2)}
                  </span>
                </div>
              </div>

              <div>
                <button
                  onClick={resetAndClose}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold hover:opacity-95 shadow-lg shadow-emerald-900/30 transition-all"
                >
                  Continue to Printing
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Amount Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Select Recharge Amount
                </label>
                <div className="grid grid-cols-4 gap-2 mb-2.5">
                  {PRESET_AMOUNTS.map((val) => {
                    const isSelected = !customAmount && amount === val;
                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() => handleSelectPreset(val)}
                        className={`py-2 px-2 sm:px-3 rounded-xl font-bold text-sm border transition-all ${
                          isSelected
                            ? 'bg-[#00baF2]/20 border-[#00baF2] text-[#00baF2] shadow-sm'
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
                    placeholder="Custom amount (min ₹10, max ₹50,000)"
                    value={customAmount}
                    onChange={handleCustomChange}
                    className="w-full pl-8 pr-4 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#00baF2] text-sm font-semibold"
                  />
                </div>
              </div>

              {/* Mode Switch Tabs */}
              <div>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('paytm');
                      setErrorMessage(null);
                    }}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg font-bold transition-all ${
                      activeTab === 'paytm'
                        ? 'bg-[#002e6e] text-white shadow border border-sky-400/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <QrCode className="w-3.5 h-3.5 text-[#00baF2]" />
                    <span>Paytm UPI</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse hidden sm:inline-block" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('sandbox');
                      setErrorMessage(null);
                    }}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg font-bold transition-all ${
                      activeTab === 'sandbox'
                        ? 'bg-[#8B1E2D] text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5 text-[#F4D35E]" />
                    <span>Sandbox</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('utr');
                      setErrorMessage(null);
                    }}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg font-bold transition-all ${
                      activeTab === 'utr'
                        ? 'bg-slate-800 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5 text-slate-300" />
                    <span>Manual UTR</span>
                  </button>
                </div>
              </div>

              {/* Tab 1: Paytm Dynamic UPI QR (Default) */}
              {activeTab === 'paytm' && (
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-4">
                  {/* Account Selector Pill (MID1 vs MID2 round-robin) */}
                  <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-800/80">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                      Active Gateway:
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setSelectedAccountIndex(1)}
                        className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${
                          currentOrder?.accountIndex === 1
                            ? 'bg-sky-500/20 text-[#00baF2] border border-sky-500/40'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        MID 1
                      </button>
                      <span className="text-slate-600">|</span>
                      <button
                        type="button"
                        onClick={() => setSelectedAccountIndex(2)}
                        className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${
                          currentOrder?.accountIndex === 2
                            ? 'bg-sky-500/20 text-[#00baF2] border border-sky-500/40'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        MID 2
                      </button>
                    </div>
                  </div>

                  {/* QR Presentation with Live Status Radar */}
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="relative p-3 bg-white rounded-2xl shadow-2xl border-2 border-sky-500/30">
                      {isGeneratingOrder ? (
                        <div className="w-48 h-48 flex flex-col items-center justify-center text-slate-500 gap-2">
                          <Loader2 className="w-8 h-8 animate-spin text-[#002e6e]" />
                          <span className="text-xs font-semibold">Generating QR...</span>
                        </div>
                      ) : currentOrder?.qrDataUrl ? (
                        <div className="relative">
                          <img
                            src={currentOrder.qrDataUrl}
                            alt="Paytm Dynamic UPI QR"
                            className="w-48 h-48 object-contain"
                          />
                          <div className="absolute inset-x-0 -bottom-1 flex justify-center">
                            <span className="bg-[#002e6e] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded shadow">
                              Scan &amp; Pay ₹{effectiveAmount.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="w-48 h-48 flex flex-col items-center justify-center text-rose-500 gap-2 p-2 text-center text-xs">
                          <AlertCircle className="w-6 h-6" />
                          <span>Enter an amount &ge; ₹10 to generate QR</span>
                        </div>
                      )}
                    </div>

                    {/* Auto-Polling Radar Indicator */}
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                      </span>
                      <span className="text-slate-300 text-[11px]">
                        Auto-listening for payment confirmation...
                      </span>
                    </div>
                  </div>

                  {/* UPI Details Box */}
                  {currentOrder && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
                        <div className="truncate mr-2">
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">
                            Merchant UPI VPA ({currentOrder.mid.slice(0, 6)}...)
                          </span>
                          <span className="font-mono text-white font-bold truncate">
                            {currentOrder.upiId}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyVpa(currentOrder.upiId)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white flex items-center gap-1.5 shrink-0 transition-colors"
                        >
                          {copiedVpa ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400 text-xs">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span className="text-xs">Copy</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-950/40 text-[11px] text-slate-400 font-mono">
                        <span>Ref: {currentOrder.orderId}</span>
                        <button
                          type="button"
                          onClick={() => copyOrderId(currentOrder.orderId)}
                          className="text-slate-400 hover:text-white flex items-center gap-1"
                        >
                          {copiedOrderId ? 'Copied' : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons: Mobile Deep Link & Manual Check */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {/* Pay via UPI App deep link */}
                    <a
                      href={currentOrder?.upiUrl || '#'}
                      className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-gradient-to-r from-[#002e6e] to-[#00baF2] text-white font-bold text-xs shadow-md transition-all text-center ${
                        !currentOrder ? 'opacity-50 pointer-events-none' : 'hover:opacity-95'
                      }`}
                    >
                      <Smartphone className="w-4 h-4 shrink-0" />
                      <span>Pay via App</span>
                    </a>

                    {/* Manual Check Status button */}
                    <button
                      type="button"
                      disabled={isCheckingStatus || !currentOrder}
                      onClick={() => currentOrder && checkPaytmStatus(currentOrder.orderId, true)}
                      className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all disabled:opacity-50"
                    >
                      {isCheckingStatus ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-[#00baF2]" />
                          <span>Verifying...</span>
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4 text-emerald-400" />
                          <span>I Have Paid</span>
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-400 text-center">
                    Compatible with Google Pay, PhonePe, Paytm, BHIM, CRED, Amazon Pay, and all Indian banking apps.
                  </p>
                </div>
              )}

              {/* Tab 2: Instant Sandbox Simulation */}
              {activeTab === 'sandbox' && (
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-[#F4D35E] mt-0.5 shrink-0" />
                    <div>
                      <h4 className="text-sm font-semibold text-white">
                        Instant Sandbox Credit
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                        Instantly credits ₹{effectiveAmount.toFixed(2)} for testing and staging
                        without requiring a physical UPI transaction.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isSubmitting || effectiveAmount < 10}
                    onClick={handleSandboxRecharge}
                    className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#8B1E2D] to-[#E63946] text-white font-bold flex items-center justify-center gap-2 shadow-lg hover:opacity-95 transition-opacity disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Crediting ₹{effectiveAmount.toFixed(2)}...
                      </>
                    ) : (
                      <>
                        Credit ₹{effectiveAmount.toFixed(2)} Now
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Tab 3: Manual UTR Submission Fallback */}
              {activeTab === 'utr' && (
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-4">
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
                      Found in your bank receipt or UPI app under &quot;UPI Ref No.&quot; or &quot;UTR&quot;.
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={isSubmitting || effectiveAmount < 10 || !utrNumber.trim()}
                    onClick={handleUtrSubmit}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#8B1E2D] to-[#E63946] text-white font-bold flex items-center justify-center gap-2 shadow-lg hover:opacity-95 transition-opacity disabled:opacity-50 text-sm"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Verifying Reference...
                      </>
                    ) : (
                      <>
                        Submit UTR &amp; Top-up ₹{effectiveAmount.toFixed(2)}
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
