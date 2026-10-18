import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Upload,
  Eye,
  ThumbsUp,
  CreditCard,
  Building,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  FileText,
  AlertCircle,
  RotateCcw,
  ShieldAlert,
  Send,
  HelpCircle,
  FileCheck
} from 'lucide-react';
import { UserProfile, NoteListing } from '../types';
import { api, formatPhp } from '../lib/api';
import { getSellerDashboardFromFirestore, requestPayoutInFirestore } from '../lib/firebase';

interface SellerDashboardProps {
  currentUser: UserProfile;
  onOpenUpload: () => void;
  onSelectNote: (note: NoteListing) => void;
}

export const SellerDashboard: React.FC<SellerDashboardProps> = ({
  currentUser,
  onOpenUpload,
  onSelectNote,
}) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'published' | 'in_review' | 'changes_requested' | 'rejected' | 'draft'>('published');
  
  // Payout state
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('500');
  const [payoutMethod, setPayoutMethod] = useState<'GCash' | 'Maya' | 'Bank Transfer'>('GCash');
  const [accountName, setAccountName] = useState(currentUser.name);
  const [accountNumber, setAccountNumber] = useState(currentUser.phone || '0917 890 1234');
  const [payoutMsg, setPayoutMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submittingPayout, setSubmittingPayout] = useState(false);

  // Appeal modal state
  const [appealNoteId, setAppealNoteId] = useState<string | null>(null);
  const [appealReason, setAppealReason] = useState('');
  const [submittingAppeal, setSubmittingAppeal] = useState(false);
  const [appealMsg, setAppealMsg] = useState('');

  // Resubmit state
  const [resubmittingNoteId, setResubmittingNoteId] = useState<string | null>(null);
  const [resubmitTitle, setResubmitTitle] = useState('');
  const [resubmitDesc, setResubmitDesc] = useState('');

  useEffect(() => {
    loadSellerData();
  }, [currentUser.id]);

  const loadSellerData = async () => {
    setLoading(true);
    try {
      const res = await api.getSellerDashboard();
      try {
        const firestoreData = await getSellerDashboardFromFirestore(currentUser.id);
        if (firestoreData && (firestoreData.sales.length > 0 || firestoreData.listings.length > 0)) {
          const combinedSales = [
            ...firestoreData.sales,
            ...res.sales.filter((s: any) => !firestoreData.sales.some((fs) => fs.id === s.id)),
          ];
          const combinedPayouts = [
            ...firestoreData.payouts,
            ...res.payouts.filter((p: any) => !firestoreData.payouts.some((fp) => fp.id === p.id)),
          ];
          const combinedListings = [
            ...firestoreData.listings,
            ...res.listings.filter((l: any) => !firestoreData.listings.some((fl) => fl.id === l.id)),
          ];

          const totalGrossPhp = combinedSales.reduce((sum, s) => sum + (s.amountPhp || 0), 0);
          const totalNetEarningsPhp = combinedSales.reduce((sum, s) => sum + (s.sellerNetPhp || 0), 0);
          const totalPaidOrPendingPayouts = combinedPayouts
            .filter((p) => p.status === 'approved' || p.status === 'pending')
            .reduce((sum, p) => sum + p.amountPhp, 0);
          const availableBalancePhp = Math.max(0, totalNetEarningsPhp - totalPaidOrPendingPayouts);

          setData({
            ...res,
            metrics: {
              ...res.metrics,
              totalGrossPhp,
              totalNetEarningsPhp,
              availableBalancePhp,
              totalPurchases: combinedSales.length,
            },
            listings: combinedListings,
            sales: combinedSales,
            payouts: combinedPayouts,
          });
          return;
        }
      } catch (fErr) {
        console.warn('Firestore seller data fetch:', fErr);
      }
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setPayoutMsg('');
    setSubmittingPayout(true);

    try {
      const payoutAmountNum = parseFloat(payoutAmount);
      const res = await api.requestPayout({
        amountPhp: payoutAmountNum,
        method: payoutMethod,
        accountName,
        accountNumber,
      });

      try {
        await requestPayoutInFirestore({
          id: `payout_${Date.now()}`,
          sellerId: currentUser.id,
          sellerName: currentUser.name,
          amountPhp: payoutAmountNum,
          method: payoutMethod,
          accountName,
          accountNumber,
          status: 'pending',
          createdAt: new Date().toISOString(),
        });
      } catch (fErr) {
        console.warn('Firestore payout sync:', fErr);
      }

      setPayoutMsg(res.message);
      loadSellerData();
      setTimeout(() => {
        setShowPayoutModal(false);
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Payout request failed.');
    } finally {
      setSubmittingPayout(false);
    }
  };

  const handleAppeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appealNoteId || !appealReason.trim()) return;
    setSubmittingAppeal(true);
    try {
      const res = await api.appealNote(appealNoteId, appealReason);
      setAppealMsg(res.message);
      loadSellerData();
      setTimeout(() => {
        setAppealNoteId(null);
        setAppealReason('');
        setAppealMsg('');
      }, 2000);
    } catch (err: any) {
      alert(err.message || 'Appeal failed.');
    } finally {
      setSubmittingAppeal(false);
    }
  };

  const handleResubmit = async (noteId: string) => {
    try {
      await api.updateNote(noteId, {
        resubmitForReview: true,
      });
      alert('Document resubmitted for peer quality inspection!');
      loadSellerData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-xs text-[#746B70]">
        Loading student author hub metrics...
      </div>
    );
  }

  const { metrics, listings, sales, payouts } = data;

  const publishedListings = listings.filter((l: any) => l.status === 'published');
  const inReviewListings = listings.filter((l: any) => l.status === 'submitted_for_review' || l.status === 'under_quality_inspection');
  const changesRequestedListings = listings.filter((l: any) => l.status === 'changes_requested');
  const rejectedListings = listings.filter((l: any) => l.status === 'rejected');
  const draftListings = listings.filter((l: any) => l.status === 'draft');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-[#F8EDEF] p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono text-[#800000] uppercase font-bold tracking-wider">
            Student Author Hub & Payouts
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#292329] tracking-tight">
            Seller Dashboard & Quality Inspection Tracking
          </h1>
          <p className="text-xs text-[#746B70] mt-1">
            Track peer moderation reviews, student downloads, eligible sales, and request withdrawals in Philippine Pesos (₱).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPayoutModal(true)}
            disabled={metrics.availableBalancePhp < metrics.minPayoutPhp}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 hover:from-emerald-500 hover:to-teal-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm hover:shadow-md hover:shadow-emerald-600/30 hover:-translate-y-0.5 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer active:scale-95 ring-1 ring-emerald-300/40"
          >
            <ArrowUpRight className="w-4 h-4 text-emerald-200" />
            <span>Withdraw Earnings</span>
          </button>
          <button
            onClick={onOpenUpload}
            className="px-4 py-2.5 bg-gradient-to-r from-[#800000] via-[#A01A33] to-[#C02636] hover:from-[#6B1E35] hover:to-[#A01A33] text-white font-bold text-xs rounded-xl transition-all shadow-sm hover:shadow-md hover:shadow-[#800000]/25 hover:-translate-y-0.5 flex items-center gap-1.5 cursor-pointer active:scale-95 ring-1 ring-amber-300/40 group"
          >
            <Upload className="w-4 h-4 text-amber-200 group-hover:rotate-6 transition-transform" />
            <span>Upload New Material</span>
          </button>
        </div>
      </div>

      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#F8EDEF] shadow-xs space-y-1">
          <span className="text-xs font-semibold text-[#746B70]">Available Withdrawable Balance</span>
          <div className="text-2xl font-black text-[#287D4F] font-mono tabular-nums">
            {formatPhp(metrics.availableBalancePhp)}
          </div>
          <p className="text-[10px] text-[#746B70]">
            Min. payout: {formatPhp(metrics.minPayoutPhp || 100)} (GCash / Maya)
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#F8EDEF] shadow-xs space-y-1">
          <span className="text-xs font-semibold text-[#746B70]">Total Net Earnings</span>
          <div className="text-2xl font-black text-[#292329] font-mono tabular-nums">
            {formatPhp(metrics.totalNetEarningsPhp)}
          </div>
          <p className="text-[10px] text-[#746B70]">
            After {metrics.commissionPercent}% platform commission
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#F8EDEF] shadow-xs space-y-1">
          <span className="text-xs font-semibold text-[#746B70]">Gross Marketplace Sales</span>
          <div className="text-2xl font-black text-[#292329] font-mono tabular-nums">
            {formatPhp(metrics.totalGrossPhp)}
          </div>
          <p className="text-[10px] text-[#746B70]">
            {sales.length} verified purchases recorded
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#F8EDEF] shadow-xs space-y-1">
          <span className="text-xs font-semibold text-[#746B70]">Community Engagement</span>
          <div className="text-2xl font-black text-[#800000] font-mono tabular-nums">
            {metrics.totalViews} <span className="text-sm font-normal text-[#746B70]">views / +{metrics.totalUpvotes}</span>
          </div>
          <p className="text-[10px] text-[#746B70]">
            Across {listings.length} submitted documents
          </p>
        </div>
      </div>

      {/* Upload Review Status Tabs */}
      <div className="bg-white rounded-2xl border border-[#F8EDEF] overflow-hidden shadow-xs">
        <div className="p-4 border-b border-[#F8EDEF] flex flex-wrap items-center justify-between gap-3 bg-[#F8EDEF]/30">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              onClick={() => setActiveTab('published')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === 'published' ? 'bg-[#287D4F] text-white shadow-2xs' : 'text-[#746B70] hover:bg-white'
              }`}
            >
              Approved & Published ({publishedListings.length})
            </button>
            <button
              onClick={() => setActiveTab('in_review')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === 'in_review' ? 'bg-amber-600 text-white shadow-2xs' : 'text-[#746B70] hover:bg-white'
              }`}
            >
              Awaiting Inspection ({inReviewListings.length})
            </button>
            <button
              onClick={() => setActiveTab('changes_requested')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === 'changes_requested' ? 'bg-orange-600 text-white shadow-2xs' : 'text-[#746B70] hover:bg-white'
              }`}
            >
              Changes Requested ({changesRequestedListings.length})
            </button>
            <button
              onClick={() => setActiveTab('rejected')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === 'rejected' ? 'bg-rose-700 text-white shadow-2xs' : 'text-[#746B70] hover:bg-white'
              }`}
            >
              Rejected ({rejectedListings.length})
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-5">
          {activeTab === 'published' && (
            <div>
              {publishedListings.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#746B70]">No published notes yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F5F5F5] text-[#746B70] font-semibold text-[11px] uppercase">
                      <tr>
                        <th className="px-4 py-3">Material Title</th>
                        <th className="px-4 py-3">Classification</th>
                        <th className="px-4 py-3">Subject</th>
                        <th className="px-4 py-3">Price (PHP)</th>
                        <th className="px-4 py-3">Sales</th>
                        <th className="px-4 py-3">Score</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-sans">
                      {publishedListings.map((l: any) => (
                        <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3.5 max-w-xs">
                            <span className="font-bold text-[#292329] truncate block">{l.title}</span>
                            <span className="text-[10px] text-[#746B70]">{l.format} · {l.pageCount} pages</span>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="text-[11px] font-semibold text-[#800000] block">{l.materialType}</span>
                            <span className="text-[10px] text-[#746B70]">Target: {l.yearLevel}</span>
                          </td>
                          <td className="px-4 py-3.5 font-mono text-xs text-[#292329]">
                            {l.subject}
                          </td>
                          <td className="px-4 py-3.5 font-mono font-bold text-[#292329]">
                            {l.pricePhp === 0 ? 'FREE' : formatPhp(l.pricePhp)}
                          </td>
                          <td className="px-4 py-3.5 font-mono tabular-nums text-[#746B70]">
                            {l.purchasesCount}
                          </td>
                          <td className="px-4 py-3.5 font-mono font-bold text-[#800000] tabular-nums">
                            +{l.netScore}
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <button
                              onClick={() => onSelectNote(l)}
                              className="px-2.5 py-1 text-[11px] font-semibold text-[#800000] hover:underline"
                            >
                              Inspect
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'in_review' && (
            <div className="space-y-3">
              {inReviewListings.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#746B70]">
                  No study materials currently in the review queue.
                </div>
              ) : (
                inReviewListings.map((l: any) => (
                  <div key={l.id} className="p-4 rounded-xl border border-[#E8A5A9] bg-[#F8EDEF]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#F8EDEF] text-[#800000] border border-[#E8A5A9]">
                          Awaiting Peer Inspection
                        </span>
                        <span className="font-bold text-[#800000]">{l.materialType}</span>
                      </div>
                      <h4 className="font-bold text-[#292329] mt-1">{l.title}</h4>
                      <p className="text-[11px] text-[#746B70] mt-0.5">
                        Subject: {l.subject} · Intended for: {l.yearLevel} · Submitted on {new Date(l.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-[11px] text-[#746B70] italic">
                      Inspecting for readability, syllabus accuracy, and RA 10173 data privacy.
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'changes_requested' && (
            <div className="space-y-3">
              {changesRequestedListings.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#746B70]">
                  No changes currently requested by peer moderators.
                </div>
              ) : (
                changesRequestedListings.map((l: any) => (
                  <div key={l.id} className="p-4 rounded-xl border border-[#B7791F] bg-[#B7791F]/5 space-y-3 text-xs">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#B7791F]/20 text-[#B7791F] border border-[#B7791F]/40">
                          Action Required: Changes Requested
                        </span>
                        <h4 className="font-bold text-[#292329] text-sm mt-1">{l.title}</h4>
                      </div>
                      <span className="font-mono text-[10px] text-[#746B70]">
                        {l.courseCode} · {l.materialType}
                      </span>
                    </div>

                    <div className="p-3 bg-white rounded-lg border border-[#B7791F]/30 text-[#292329]">
                      <span className="font-bold text-[#800000] block mb-1">Peer Moderator Feedback:</span>
                      <p className="text-xs leading-relaxed">{l.requestedCorrections || 'Please review your document.'}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleResubmit(l.id)}
                        className="px-4 py-2 bg-[#800000] hover:bg-[#6B1E35] text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                      >
                        I Made Corrections, Resubmit for Review
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'rejected' && (
            <div className="space-y-3">
              {rejectedListings.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#746B70]">No rejected listings.</div>
              ) : (
                rejectedListings.map((l: any) => (
                  <div key={l.id} className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 space-y-2 text-xs">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-rose-100 text-[#B42318]">
                          Rejected
                        </span>
                        <h4 className="font-bold text-[#292329] mt-1">{l.title}</h4>
                      </div>
                      <button
                        onClick={() => setAppealNoteId(l.id)}
                        className="px-3 py-1 bg-white border border-rose-300 text-[#B42318] rounded-lg font-bold hover:bg-rose-50"
                      >
                        Appeal Rejection
                      </button>
                    </div>
                    <p className="text-[11px] text-[#746B70]">
                      Reason: {l.moderationFeedback || 'Did not meet original student work guidelines or syllabus criteria.'}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Appeal Modal */}
      {appealNoteId && (
        <div className="fixed inset-0 z-50 bg-[#570018]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#F8EDEF] space-y-4">
            <h3 className="text-sm font-bold text-[#292329]">Submit Moderation Appeal</h3>
            <p className="text-xs text-[#746B70]">
              Explain to the Lead Administrator why this material meets original student authorship and RA 10173 privacy standards.
            </p>

            {appealMsg && (
              <div className="p-3 bg-emerald-50 text-[#287D4F] text-xs rounded-xl">
                {appealMsg}
              </div>
            )}

            <form onSubmit={handleAppeal} className="space-y-3">
              <textarea
                rows={3}
                required
                value={appealReason}
                onChange={(e) => setAppealReason(e.target.value)}
                placeholder="Explain the originality of your calculations and why this does not infringe instructor materials..."
                className="w-full p-2.5 text-xs bg-[#F5F5F5] border border-slate-300 rounded-xl"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setAppealNoteId(null)}
                  className="flex-1 py-2 text-xs font-semibold text-[#746B70] border border-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAppeal}
                  className="flex-1 py-2 text-xs font-bold text-white bg-[#800000] rounded-xl hover:bg-[#6B1E35]"
                >
                  {submittingAppeal ? 'Submitting...' : 'Submit Appeal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payout Withdrawal Modal */}
      {showPayoutModal && (
        <div className="fixed inset-0 z-50 bg-[#570018]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#F8EDEF] space-y-4">
            <h3 className="text-sm font-bold text-[#292329]">Request Payout in Philippine Pesos (₱)</h3>
            <p className="text-xs text-[#746B70]">
              Disburse your verified student earnings to GCash, Maya, or Philippine bank account.
            </p>

            {errorMsg && (
              <div className="p-3 bg-rose-50 text-[#B42318] text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {payoutMsg && (
              <div className="p-3 bg-emerald-50 text-[#287D4F] text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{payoutMsg}</span>
              </div>
            )}

            <form onSubmit={handleRequestPayout} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#292329] mb-1">
                  Payout Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['GCash', 'Maya', 'Bank Transfer'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPayoutMethod(m)}
                      className={`p-2 text-xs font-semibold rounded-lg border text-center transition-all ${
                        payoutMethod === m
                          ? 'border-[#800000] bg-[#F8EDEF] text-[#800000] font-bold'
                          : 'border-slate-200 text-[#746B70]'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#292329] mb-1">
                  Amount in PHP (Max {formatPhp(metrics.availableBalancePhp)})
                </label>
                <input
                  type="number"
                  min={metrics.minPayoutPhp || 100}
                  max={metrics.availableBalancePhp}
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono font-bold bg-[#F5F5F5] border border-slate-300 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#292329] mb-1">
                  Account Name on {payoutMethod}
                </label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#F5F5F5] border border-slate-300 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#292329] mb-1">
                  {payoutMethod === 'Bank Transfer' ? 'Bank Account Number' : `${payoutMethod} Mobile Number`}
                </label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="0917 123 4567"
                  className="w-full px-3 py-2 text-xs bg-[#F5F5F5] border border-slate-300 rounded-xl font-mono"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPayoutModal(false)}
                  className="flex-1 py-2 text-xs font-semibold text-[#746B70] border border-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPayout}
                  className="flex-1 py-2 text-xs font-bold text-white bg-[#287D4F] hover:bg-emerald-700 rounded-xl disabled:opacity-50"
                >
                  {submittingPayout ? 'Submitting...' : 'Submit Payout'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
