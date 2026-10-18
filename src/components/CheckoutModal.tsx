import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  CreditCard,
  Smartphone,
  Building2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Download,
  Receipt,
  Wallet,
  Sparkles,
  Lock
} from 'lucide-react';
import { NoteListing, UserProfile } from '../types';
import { formatPhp } from '../lib/api';
import {
  createPayMongoCheckoutSession,
  simulatePayMongoPaymentSuccess,
} from '../lib/firebase';

interface CheckoutModalProps {
  note: NoteListing;
  currentUser: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (note: NoteListing) => void;
  onOpenViewer?: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  note,
  currentUser,
  isOpen,
  onClose,
  onSuccess,
  onOpenViewer,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'gcash' | 'paymaya' | 'card'>('gcash');
  const [phoneNumber, setPhoneNumber] = useState('0917 890 1234');
  const [step, setStep] = useState<'select' | 'processing' | 'success' | 'failed'>('select');
  const [errorMsg, setErrorMsg] = useState('');
  const [checkoutSessionId, setCheckoutSessionId] = useState<string>('');
  const [liveCheckoutUrl, setLiveCheckoutUrl] = useState<string>('');

  if (!isOpen) return null;

  const currentPrice = Number(note.price ?? note.pricePhp ?? 0);
  const isFree = currentPrice === 0;

  const handleProcessPayMongo = async () => {
    setErrorMsg('');
    setStep('processing');

    try {
      const buyerUid = currentUser.uid || currentUser.id;

      // Create PayMongo Checkout Session on server
      const sessionRes = await createPayMongoCheckoutSession({
        noteId: note.id,
        buyerUid,
        buyerName: currentUser.name,
        buyerEmail: currentUser.email,
      });

      setCheckoutSessionId(sessionRes.sessionId);

      if (sessionRes.mode === 'live' && sessionRes.checkoutUrl) {
        setLiveCheckoutUrl(sessionRes.checkoutUrl);
        // Open live PayMongo in current or new window
        window.location.href = sessionRes.checkoutUrl;
        return;
      }

      // In Sandbox / Test simulation mode: simulate 1.2s gateway processing dwell
      await new Promise((resolve) => setTimeout(resolve, 1200));

      // Trigger Webhook execution on server (which appends buyerUid to authorizedBuyers in Firestore)
      await simulatePayMongoPaymentSuccess({
        noteId: note.id,
        buyerUid,
        sessionId: sessionRes.sessionId,
      });

      const updatedNote: NoteListing = {
        ...note,
        authorizedBuyers: Array.from(new Set([...(note.authorizedBuyers || []), buyerUid])),
      };

      setStep('success');
      onSuccess(updatedNote);
    } catch (err: any) {
      console.error('PayMongo checkout error:', err);
      setErrorMsg(err.message || 'Payment processing failed. Please try again.');
      setStep('failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#F8EDEF] overflow-hidden flex flex-col my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-br from-[#800000] via-[#570018] to-[#400010] text-white flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 font-bold">
                Direct PayMongo Payment
              </span>
              <span className="text-[10px] font-mono text-amber-300 font-bold">
                PHP (₱)
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-extrabold mt-1">
              {step === 'success' ? 'Payment Verified!' : 'Pay Note Uploader with PayMongo'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#E5D6DA] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {step === 'select' && (
            <>
              {/* Note Summary Card */}
              <div className="p-4 bg-[#FAF9F9] rounded-2xl border border-[#F8EDEF] space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-[#F8EDEF] text-[#800000]">
                      {note.program || 'Engineering'}
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-[#292329] line-clamp-2">
                      {note.title}
                    </h4>
                    <p className="text-[11px] text-[#746B70]">
                      By {note.sellerName || 'Student Creator'} · {note.materialType || 'Reviewer'}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-lg font-black font-mono text-[#800000]">
                      {formatPhp(currentPrice)}
                    </div>
                    <span className="text-[10px] text-[#746B70]">Direct Payout</span>
                  </div>
                </div>

                {/* Direct Payout Destination Route */}
                <div className="pt-2 border-t border-[#F8EDEF] flex items-center justify-between text-[11px]">
                  <span className="text-[#746B70] flex items-center gap-1">
                    <Wallet className="w-3.5 h-3.5 text-[#800000]" />
                    <span>Uploader Payout Route:</span>
                  </span>
                  <span className="font-mono text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {note.sellerPaymongoAccountId || 'acct_paymongo_student_payout'}
                  </span>
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <label className="block text-xs font-bold text-[#292329] mb-2">
                  Select PayMongo Payment Gateway
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('gcash')}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      paymentMethod === 'gcash'
                        ? 'border-sky-500 bg-sky-50/60 ring-2 ring-sky-300'
                        : 'border-[#E8A5A9]/70 hover:bg-[#FAF9F9]'
                    }`}
                  >
                    <Smartphone className="w-5 h-5 mx-auto text-sky-600 mb-1" />
                    <div className="text-xs font-bold text-[#292329]">GCash</div>
                    <span className="text-[10px] text-[#746B70] font-mono">e-Wallet</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('paymaya')}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      paymentMethod === 'paymaya'
                        ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-300'
                        : 'border-[#E8A5A9]/70 hover:bg-[#FAF9F9]'
                    }`}
                  >
                    <Smartphone className="w-5 h-5 mx-auto text-emerald-600 mb-1" />
                    <div className="text-xs font-bold text-[#292329]">Maya</div>
                    <span className="text-[10px] text-[#746B70] font-mono">e-Wallet</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      paymentMethod === 'card'
                        ? 'border-purple-500 bg-purple-50/60 ring-2 ring-purple-300'
                        : 'border-[#E8A5A9]/70 hover:bg-[#FAF9F9]'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 mx-auto text-purple-600 mb-1" />
                    <div className="text-xs font-bold text-[#292329]">Card</div>
                    <span className="text-[10px] text-[#746B70] font-mono">Debit/Credit</span>
                  </button>
                </div>
              </div>

              {/* Simulation Note */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  <strong>Direct Seller Payout:</strong> PayMongo routes the funds directly to the uploader's registered payout credentials. Upon successful checkout, our secure webhook appends your buyer UID to <code className="bg-amber-100 px-1 rounded font-mono">authorizedBuyers</code> in Firestore.
                </p>
              </div>

              {/* Action */}
              <button
                type="button"
                onClick={handleProcessPayMongo}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-[#800000] via-[#A01A33] to-[#C02636] hover:from-[#6B1E35] hover:to-[#A01A33] text-white font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-md hover:shadow-lg hover:shadow-[#800000]/25 flex items-center justify-center gap-2 cursor-pointer active:scale-95 ring-1 ring-amber-300/40"
              >
                <span>Pay {formatPhp(currentPrice)} with PayMongo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}

          {step === 'processing' && (
            <div className="py-12 text-center space-y-4">
              <div className="w-12 h-12 border-4 border-[#800000] border-t-transparent rounded-full animate-spin mx-auto" />
              <div>
                <h4 className="text-sm font-bold text-[#292329]">
                  Connecting to PayMongo Checkout...
                </h4>
                <p className="text-xs text-[#746B70] mt-1">
                  Creating session and listening for <code className="font-mono text-[#800000]">checkout_session.paid</code> webhook...
                </p>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="py-4 text-center space-y-4">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto border border-emerald-200 shadow-sm animate-in zoom-in-50 duration-300">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-base font-extrabold text-[#292329]">
                  Payment Verified! Access Granted.
                </h4>
                <p className="text-xs text-[#746B70] mt-1 max-w-sm mx-auto leading-relaxed">
                  Your buyer UID (<code className="font-mono text-[#800000]">{currentUser.uid || currentUser.id}</code>) has been appended to the note's <code className="font-mono text-emerald-700">authorizedBuyers</code> array in Firestore.
                </p>
              </div>

              {checkoutSessionId && (
                <div className="p-2.5 bg-[#FAF9F9] rounded-xl border border-[#F8EDEF] text-[11px] font-mono text-[#746B70] text-center">
                  Session ID: <span className="font-bold text-[#292329]">{checkoutSessionId}</span>
                </div>
              )}

              <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
                {onOpenViewer && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenViewer();
                    }}
                    className="w-full sm:flex-1 py-3 px-4 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 hover:from-emerald-500 hover:to-teal-700 text-white font-extrabold text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Note Now</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-3 text-xs font-bold text-[#746B70] hover:bg-[#F8EDEF] rounded-xl transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {step === 'failed' && (
            <div className="py-6 text-center space-y-4">
              <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto border border-rose-200">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-[#292329]">Payment Failed</h4>
              <p className="text-xs text-rose-700">{errorMsg || 'Could not complete PayMongo checkout.'}</p>
              <button
                type="button"
                onClick={() => setStep('select')}
                className="px-4 py-2 bg-[#800000] text-white text-xs font-bold rounded-xl"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
