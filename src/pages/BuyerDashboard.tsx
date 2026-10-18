import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Download,
  Receipt,
  FileCheck,
  Search,
  ExternalLink,
  ShieldCheck,
  Clock
} from 'lucide-react';
import { UserProfile, NoteListing } from '../types';
import { api, formatPhp } from '../lib/api';
import { getOrdersFromFirestore } from '../lib/firebase';

interface BuyerDashboardProps {
  currentUser: UserProfile;
  onOpenViewer: (note: NoteListing) => void;
  onSelectNote: (note: NoteListing) => void;
  onExplore: () => void;
}

export const BuyerDashboard: React.FC<BuyerDashboardProps> = ({
  currentUser,
  onOpenViewer,
  onSelectNote,
  onExplore,
}) => {
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);

  useEffect(() => {
    loadLibrary();
  }, [currentUser.id]);

  const loadLibrary = async () => {
    setLoading(true);
    try {
      const res = await api.getPurchases();
      try {
        const firestoreOrders = await getOrdersFromFirestore(currentUser.id);
        if (firestoreOrders && firestoreOrders.length > 0) {
          const combined = [
            ...firestoreOrders,
            ...res.purchases.filter(
              (p: any) =>
                !firestoreOrders.some(
                  (fo) => fo.id === p.id || fo.referenceNo === p.referenceNo
                )
            ),
          ];
          setPurchases(combined);
          return;
        }
      } catch (fErr) {
        console.warn('Firestore orders load:', fErr);
      }
      setPurchases(res.purchases);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-[#F8EDEF] p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono text-[#800000] uppercase font-bold tracking-wider">
            Student Academic Library
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#292329] tracking-tight">
            My Study Materials & Access Vault
          </h1>
          <p className="text-xs text-[#746B70] mt-1">
            Access, read online, and download all your purchased study guides and claimed free reviewers.
          </p>
        </div>

        <button
          onClick={onExplore}
          className="px-4 py-2 bg-[#800000] hover:bg-[#6B1E35] text-white font-bold text-xs rounded-xl transition-all shadow-sm cursor-pointer whitespace-nowrap self-start sm:self-auto"
        >
          Explore More Reviewers
        </button>
      </div>

      {/* Library Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#292329]">
            Available Reviewers ({purchases.filter((p) => p.status === 'Paid').length})
          </h2>
        </div>

        {purchases.filter((p) => p.status === 'Paid').length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#F8EDEF] p-12 text-center space-y-3">
            <BookOpen className="w-12 h-12 text-[#E8A5A9] mx-auto" />
            <h3 className="text-sm font-bold text-[#292329]">Your library is currently empty</h3>
            <p className="text-xs text-[#746B70] max-w-sm mx-auto">
              Explore the Shear It marketplace to acquire free study guides or purchase step-by-step solved reviewers.
            </p>
            <button
              onClick={onExplore}
              className="mt-2 px-4 py-2 bg-[#800000] text-white font-bold text-xs rounded-xl hover:bg-[#6B1E35] cursor-pointer"
            >
              Browse Free & Paid Notes
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {purchases
              .filter((p) => p.status === 'Paid')
              .map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-[#F8EDEF] overflow-hidden shadow-xs hover:border-[#E8A5A9] transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
                      <img
                        src={item.noteDetails?.previewImages?.[0] || '/src/assets/images/note_preview_structures_1792130896313.jpg'}
                        alt={item.noteTitle}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2.5 right-2.5 bg-[#287D4F] text-white px-2 py-0.5 rounded text-[10px] font-bold">
                        ACCESS UNLOCKED
                      </div>
                    </div>

                    <div className="p-4 space-y-2">
                      <div className="text-[11px] text-[#746B70] font-mono">
                        <span className="font-bold text-[#800000]">{item.noteDetails?.courseCode || 'ENGR'}</span>
                        <span className="mx-1.5">·</span>
                        <span>By {item.sellerName}</span>
                      </div>

                      <h3 className="text-sm font-bold text-[#292329] line-clamp-2 leading-snug">
                        {item.noteTitle}
                      </h3>

                      <div className="text-[10px] text-[#746B70] font-mono">
                        Ref: {item.referenceNo} · Paid via {item.paymentMethod}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-[#FAF9F9] border-t border-[#F8EDEF] flex items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedReceipt(item)}
                      className="px-3.5 py-2 text-xs font-bold text-amber-950 bg-gradient-to-r from-amber-500/15 to-amber-100 hover:from-amber-500/25 hover:to-amber-200 border-2 border-amber-300 hover:border-amber-400 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-95"
                    >
                      <Receipt className="w-3.5 h-3.5 text-amber-700" />
                      <span>Receipt</span>
                    </button>

                    <button
                      onClick={() => onOpenViewer(item.noteDetails)}
                      className="flex-1 py-2 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 hover:from-emerald-500 hover:to-teal-700 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm hover:shadow-md hover:shadow-emerald-600/30 active:scale-95 ring-1 ring-emerald-300/40"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-200" />
                      <span>Open Document</span>
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Official Transaction History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Payment & Transaction Records</h2>
          <span className="text-xs text-slate-500 font-mono">Philippine Pesos (₱)</span>
        </div>

        {purchases.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">No transactions recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3">Reference No.</th>
                  <th className="px-5 py-3">Material Title</th>
                  <th className="px-5 py-3">Method</th>
                  <th className="px-5 py-3">Amount (PHP)</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {purchases.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3 font-mono font-bold text-slate-800">
                      {tx.referenceNo}
                    </td>
                    <td className="px-5 py-3 max-w-xs truncate font-medium text-slate-900">
                      {tx.noteTitle}
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      {tx.paymentMethod}
                    </td>
                    <td className="px-5 py-3 font-mono font-bold text-slate-900 tabular-nums">
                      {formatPhp(tx.amountPhp)}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${
                        tx.status === 'Paid' ? 'bg-emerald-100 text-[#287D4F]' : 'bg-[#B7791F]/20 text-[#B7791F]'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-400 font-mono text-[11px]">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-[#570018]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-[#F8EDEF] space-y-4">
            <div className="text-center pb-3 border-b border-slate-100">
              <span className="font-mono text-base font-bold text-[#800000]">Shear It Philippines</span>
              <p className="text-[10px] text-[#746B70] mt-0.5">OFFICIAL STUDENT TRANSACTION RECEIPT</p>
            </div>

            <div className="space-y-2 text-xs text-[#292329] font-sans">
              <div className="flex justify-between">
                <span className="text-[#746B70]">Reference:</span>
                <span className="font-mono font-bold text-[#292329]">{selectedReceipt.referenceNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#746B70]">Buyer:</span>
                <span className="font-bold text-[#292329]">{currentUser.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#746B70]">Author:</span>
                <span className="text-[#292329]">{selectedReceipt.sellerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#746B70]">Payment Gateway:</span>
                <span className="text-[#292329]">{selectedReceipt.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#746B70]">Date & Time:</span>
                <span className="font-mono text-[10px] text-[#746B70]">{new Date(selectedReceipt.createdAt).toLocaleString()}</span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-sm text-[#292329]">
                <span>Total Amount:</span>
                <span className="font-mono tabular-nums text-[#800000]">{formatPhp(selectedReceipt.amountPhp)}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedReceipt(null)}
              className="w-full py-2 bg-[#800000] hover:bg-[#6B1E35] text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
