import React, { useState, useEffect } from 'react';
import {
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  DollarSign,
  Users,
  Check,
  X,
  ExternalLink,
  Radio,
  Eye,
  Trash2,
  Wallet,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { UserProfile, NoteListing } from '../types';
import { formatPhp } from '../lib/api';
import {
  subscribeToPendingNotes,
  toggleNoteApproval,
  deleteNoteFromFirestore,
} from '../lib/firebase';

interface AdminDashboardProps {
  currentUser: UserProfile;
  onOpenViewer?: (note: NoteListing) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  onOpenViewer,
}) => {
  const [pendingNotes, setPendingNotes] = useState<NoteListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ id: string; text: string; type: 'success' | 'error' } | null>(null);
  const [adminRoleVerified, setAdminRoleVerified] = useState<boolean | null>(null);

  // Check if current user is admin either from profile or directly by checking their user document in Firestore
  useEffect(() => {
    let isMounted = true;
    async function verifyAdminRole() {
      const uid = currentUser?.uid || currentUser?.id;
      if (!uid) {
        if (isMounted) setAdminRoleVerified(false);
        return;
      }

      // Check current user object first
      if (currentUser.role === 'admin' || currentUser.email === 'guirigay.gwyneth7@gmail.com') {
        if (isMounted) setAdminRoleVerified(true);
        return;
      }

      // Query the 'users' collection in Firestore
      try {
        const { doc, getDoc } = await import('firebase/firestore');
        const { db } = await import('../lib/firebase');
        const userSnap = await getDoc(doc(db, 'users', uid));
        if (userSnap.exists() && userSnap.data()?.role === 'admin') {
          if (isMounted) setAdminRoleVerified(true);
          return;
        }
      } catch (err) {
        console.warn('Firestore admin verification notice:', err);
      }

      if (isMounted) setAdminRoleVerified(false);
    }

    verifyAdminRole();
    return () => { isMounted = false; };
  }, [currentUser]);

  const isAdmin = adminRoleVerified === true || currentUser.role === 'admin' || currentUser.email === 'guirigay.gwyneth7@gmail.com';

  useEffect(() => {
    if (adminRoleVerified === false) {
      setLoading(false);
      return;
    }
    if (!isAdmin) return;

    setLoading(true);
    // Real-time Firestore onSnapshot() listener streaming notes where approvedStatus == false
    const unsubscribe = subscribeToPendingNotes(
      (notes) => {
        setPendingNotes(notes);
        setLoading(false);
      },
      (error) => {
        console.error('Failed to stream pending notes:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [isAdmin, adminRoleVerified]);

  const handleToggleApprove = async (note: NoteListing) => {
    setProcessingId(note.id);
    try {
      // Instantly toggle approvedStatus to true in Firestore
      await toggleNoteApproval(note.id, true);
      setFeedbackMsg({
        id: note.id,
        text: `"${note.title}" was approved! It is now live in the student marketplace.`,
        type: 'success',
      });
      setTimeout(() => setFeedbackMsg(null), 3500);
    } catch (err: any) {
      console.error('Approval toggle error:', err);
      setFeedbackMsg({
        id: note.id,
        text: err.message || 'Failed to approve note.',
        type: 'error',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (noteId: string) => {
    if (!confirm('Are you sure you want to permanently delete this unapproved submission?')) return;
    try {
      await deleteNoteFromFirestore(noteId);
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-3xl flex items-center justify-center mx-auto border border-rose-200 shadow-sm">
          <Shield className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-[#292329]">Administrator Access Only</h2>
        <p className="text-xs text-[#746B70] leading-relaxed max-w-md mx-auto">
          This dashboard requires an account with <code className="bg-[#FAF9F9] px-2 py-0.5 rounded border border-[#E8A5A9] text-[#800000] font-mono font-bold">role == "admin"</code>. Switch to the Gwyneth Guirigay administrator persona or sign in with an authorized administrator account.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#800000] via-[#570018] to-[#400010] text-white rounded-3xl p-6 sm:p-8 shadow-lg border border-[#800000] relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] uppercase font-mono tracking-wider px-2.5 py-0.5 rounded-full bg-white/20 font-bold backdrop-blur-xs">
                Admin Console
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Firestore Stream
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Real-Time Marketplace Review Queue
            </h1>
            <p className="text-xs text-[#E5D6DA] mt-1.5 max-w-2xl leading-relaxed">
              Streaming all student-uploaded engineering notes where <code className="bg-white/10 px-1.5 py-0.5 rounded font-mono text-white">approvedStatus == false</code>. Review problem sets and formula sheets before publishing to the live marketplace feed.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="px-5 py-3 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/20 text-center">
              <div className="text-2xl sm:text-3xl font-black font-mono text-amber-300">
                {pendingNotes.length}
              </div>
              <p className="text-[10px] text-[#E5D6DA] uppercase font-mono font-bold tracking-wider mt-0.5">
                Pending Approval
              </p>
            </div>
          </div>
        </div>
      </div>

      {feedbackMsg && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs font-semibold ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
          <button onClick={() => setFeedbackMsg(null)} className="text-[#746B70] hover:text-[#292329]">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Review Stream */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold text-[#292329]">
              Unapproved Submissions Queue
            </h2>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-[#F8EDEF] text-[#800000]">
              {pendingNotes.length} pending
            </span>
          </div>
          <span className="text-xs text-[#746B70] font-mono">
            Auto-syncs via Firestore onSnapshot
          </span>
        </div>

        {loading ? (
          <div className="p-16 bg-white rounded-3xl border border-[#F8EDEF] text-center space-y-3">
            <div className="w-10 h-10 border-4 border-[#800000] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-[#746B70] font-medium">Connecting to Firestore pending stream...</p>
          </div>
        ) : pendingNotes.length === 0 ? (
          <div className="p-16 bg-white rounded-3xl border border-[#F8EDEF] text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-[#292329]">Queue is All Caught Up!</h3>
            <p className="text-xs text-[#746B70] max-w-md mx-auto">
              There are currently no notes awaiting administrator approval (<code className="font-mono text-[#800000]">approvedStatus == false</code>). When student creators upload new study guides, they will automatically appear here in real time.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {pendingNotes.map((note) => {
              const isProcessing = processingId === note.id;

              return (
                <div
                  key={note.id}
                  className="bg-white rounded-2xl border border-[#F8EDEF] hover:border-[#E8A5A9] p-5 shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
                >
                  {/* Left: Info */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded bg-amber-50 text-amber-800 border border-amber-200">
                        Pending Review
                      </span>
                      <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded bg-[#F8EDEF] text-[#800000]">
                        {note.program || 'Engineering'}
                      </span>
                      <span className="text-[11px] font-mono text-[#746B70]">
                        {note.materialType || 'Reviewer'} · {note.subject || 'Engineering'}
                      </span>
                      <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {formatPhp(note.price || note.pricePhp || 0)}
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-[#292329]">
                      {note.title}
                    </h3>

                    {note.description && (
                      <p className="text-xs text-[#746B70] line-clamp-2 leading-relaxed">
                        {note.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-[#746B70] pt-1">
                      <span>Uploader UID: <code className="font-mono text-[#292329]">{note.sellerId}</code> ({note.sellerName || 'Student'})</span>
                      {note.sellerPaymongoAccountId && (
                        <span className="flex items-center gap-1 text-emerald-700 font-mono">
                          <Wallet className="w-3 h-3" />
                          Payout: {note.sellerPaymongoAccountId}
                        </span>
                      )}
                      <span>Uploaded: {new Date(note.createdAt || Date.now()).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2.5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#F8EDEF]">
                    {onOpenViewer && (
                      <button
                        type="button"
                        onClick={() => onOpenViewer(note)}
                        className="px-3.5 py-2 text-xs font-semibold text-[#746B70] hover:text-[#800000] bg-[#FAF9F9] hover:bg-[#F8EDEF] border border-[#E8A5A9]/70 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                        title="Inspect Document"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleToggleApprove(note)}
                      disabled={isProcessing}
                      className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 hover:from-emerald-500 hover:to-teal-700 text-white font-extrabold text-xs rounded-xl transition-all shadow-sm hover:shadow-md hover:shadow-emerald-600/25 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-95"
                    >
                      {isProcessing ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Publishing...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span>Approve & Publish Note</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(note.id)}
                      className="p-2 text-[#746B70] hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                      title="Reject and delete submission"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
