import React, { useState, useEffect } from 'react';
import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Eye,
  Lock,
  FileText,
  User,
  Shield,
  Search,
  ExternalLink,
  HelpCircle,
  FileCheck
} from 'lucide-react';
import { NoteListing, UserProfile, PublicationStatus, ModeratorChecklist } from '../types';
import { api, formatPhp } from '../lib/api';

interface ModeratorDashboardProps {
  currentUser: UserProfile;
  onOpenViewer: (note: NoteListing) => void;
}

export const ModeratorDashboard: React.FC<ModeratorDashboardProps> = ({
  currentUser,
  onOpenViewer,
}) => {
  const [queue, setQueue] = useState<NoteListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNote, setSelectedNote] = useState<NoteListing | null>(null);
  const [moderatorNotes, setModeratorNotes] = useState('');
  const [requestedCorrections, setRequestedCorrections] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  // 10-point checklist state
  const [checklist, setChecklist] = useState<ModeratorChecklist>({
    legibility: true,
    correctClassification: true,
    syllabusRelevance: true,
    organizationCompleteness: true,
    academicUsefulness: true,
    noInstructorMaterial: true,
    noConfidentialExam: true,
    noPersonalStudentPII: true,
    noCopyrightInfringement: true,
    noSpamMalware: true,
  });

  useEffect(() => {
    loadQueue();
  }, [currentUser.id]);

  const loadQueue = async () => {
    setLoading(true);
    try {
      const res = await api.getModerationQueue();
      setQueue(res.queue);
      if (res.queue.length > 0 && !selectedNote) {
        setSelectedNote(res.queue[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (decision: PublicationStatus) => {
    if (!selectedNote) return;
    setSubmittingAction(true);
    setActionMessage('');

    try {
      await api.inspectMaterial(selectedNote.id, {
        decision,
        checklist,
        moderatorNotes,
        requestedCorrections: decision === 'changes_requested' ? requestedCorrections : undefined,
      });

      setActionMessage(`Material successfully updated: ${decision.replace(/_/g, ' ')}.`);
      setSelectedNote(null);
      loadQueue();
    } catch (err: any) {
      alert(err.message || 'Inspection action failed.');
    } finally {
      setSubmittingAction(false);
    }
  };

  if (currentUser.role !== 'moderator' && currentUser.role !== 'admin') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-3">
        <Shield className="w-12 h-12 text-[#800000] mx-auto" />
        <h2 className="text-sm font-bold text-[#292329]">Peer Moderator Authorization Required</h2>
        <p className="text-xs text-[#746B70]">
          Quality inspection is restricted to authorized peer moderators and administrators. Switch to Bea Nicole Santos (Moderator) or Gwyneth Guirigay (Admin) in the top bar.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Banner */}
      <div className="bg-[#570018] text-white rounded-2xl p-6 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4 text-[#E8A5A9]" />
            <span className="text-[11px] font-mono uppercase text-[#E8A5A9] font-bold tracking-wider">
              Academic Peer Review & RA 10173 Compliance
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight mt-1">
            Peer Quality & Privacy Inspection Queue
          </h1>
          <p className="text-xs text-[#E5D6DA] mt-1">
            Verify student original authorship, inspect handwriting readability, and enforce zero personal identifying information (PII).
          </p>
        </div>

        <div className="bg-[#6B1E35] px-3 py-1.5 rounded-xl border border-[#800000] text-xs font-mono text-center">
          <span className="text-[#E8A5A9] text-[10px] block">PENDING REVIEWS</span>
          <span className="text-base font-bold text-white tabular-nums">{queue.length}</span>
        </div>
      </div>

      {actionMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-[#287D4F] text-xs font-semibold rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Main Inspection Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Submissions Queue (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <h2 className="text-xs font-bold text-[#292329] uppercase tracking-wider">
              Awaiting Inspection ({queue.length})
            </h2>
            <button
              onClick={loadQueue}
              className="text-[11px] font-semibold text-[#800000] hover:underline"
            >
              Refresh
            </button>
          </div>

          <div className="divide-y divide-slate-100 max-h-[640px] overflow-y-auto">
            {queue.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#746B70]">
                <FileCheck className="w-10 h-10 text-[#E8A5A9] mx-auto mb-2" />
                All student uploads have been inspected. The review queue is clear!
              </div>
            ) : (
              queue.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedNote(item)}
                  className={`w-full text-left p-4 transition-all flex flex-col gap-1 cursor-pointer ${
                    selectedNote?.id === item.id
                      ? 'bg-[#F8EDEF] ring-1 ring-inset ring-[#E8A5A9] text-[#800000]'
                      : 'hover:bg-[#F8EDEF]/40'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#746B70]">
                    <span className="font-bold text-[#800000]">{item.courseCode} · {item.materialType}</span>
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h4 className="text-xs font-bold text-[#292329] line-clamp-2 leading-snug">
                    {item.title}
                  </h4>
                  <div className="text-[11px] text-[#746B70] flex items-center justify-between mt-1">
                    <span>By {item.sellerName}</span>
                    <span className="font-mono font-bold text-[#800000]">
                      {item.pricePhp === 0 ? 'FREE' : formatPhp(item.pricePhp)}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Detailed Quality Inspection Panel (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          {selectedNote ? (
            <>
              {/* Submission Overview */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-[#746B70] font-mono">
                    <span className="font-bold text-[#800000]">{selectedNote.materialType}</span>
                    <span>·</span>
                    <span>{selectedNote.subject}</span>
                    <span>·</span>
                    <span>Intended: {selectedNote.yearLevel}</span>
                  </div>
                  <h2 className="text-lg font-extrabold text-[#292329] leading-snug">
                    {selectedNote.title}
                  </h2>
                  <p className="text-xs text-[#746B70]">
                    Author: <strong className="text-[#292329]">{selectedNote.sellerName}</strong> ({selectedNote.sellerProgram} · {selectedNote.sellerUniversity})
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenViewer(selectedNote)}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect Full Document</span>
                </button>
              </div>

              {/* Topics & Description */}
              <div className="bg-[#F8EDEF]/50 p-3.5 rounded-xl border border-[#E8A5A9]/50 text-xs space-y-2">
                <div>
                  <span className="font-bold text-[#570018]">Specific Academic Topics: </span>
                  <span className="font-mono text-[#292329]">
                    {selectedNote.topics?.join(' · ') || selectedNote.topic}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-[#570018]">Author Description: </span>
                  <span className="text-[#292329]">{selectedNote.description}</span>
                </div>
              </div>

              {/* Verified Uploader Consents Record (RA 10173 Audit) */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
                <div className="flex items-center justify-between font-bold text-[#292329] border-b border-slate-200 pb-1.5">
                  <span className="flex items-center gap-1.5 text-[#570018]">
                    <Lock className="w-3.5 h-3.5 text-[#800000]" />
                    Verified Consent & Affidavit Record
                  </span>
                  <span className="font-mono text-[10px] text-[#746B70]">
                    Version: {selectedNote.consents?.consentVersion || 'v2.1-RA10173'}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-[#746B70]">
                  <div className="flex items-center gap-1.5 text-[#287D4F]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Dissemination Consent Signed</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#287D4F]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>RA 10173 No PII Certified</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#287D4F]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Peer Quality Inspection Consented</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#287D4F]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Anti-Instructor Guarantee Signed</span>
                  </div>
                </div>
              </div>

              {/* 10-Point Moderator Quality Checklist */}
              <div className="space-y-3">
                <h3 className="text-xs uppercase font-bold text-[#292329] tracking-wider">
                  Quality & Privacy Inspection Checklist
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  {[
                    { key: 'legibility', label: '1. Legibility & Readability (Clean scans/equations)' },
                    { key: 'correctClassification', label: '2. Correct Material Classification & Type' },
                    { key: 'syllabusRelevance', label: '3. Aligns with Philippine CHED Syllabus' },
                    { key: 'organizationCompleteness', label: '4. Logical Problem Derivation & Steps' },
                    { key: 'academicUsefulness', label: '5. High-Yield Student Academic Value' },
                    { key: 'noInstructorMaterial', label: '6. No Faculty Slides or Professor PPT Templates' },
                    { key: 'noConfidentialExam', label: '7. No Confidential University Test Banks' },
                    { key: 'noPersonalStudentPII', label: '8. RA 10173: Zero Visible Student ID/PII' },
                    { key: 'noCopyrightInfringement', label: '9. No Textbook Scans or Copyright Piracy' },
                    { key: 'noSpamMalware', label: '10. Safe Verified File Format' },
                  ].map((item) => (
                    <label
                      key={item.key}
                      className="flex items-center gap-2 p-2.5 bg-white rounded-lg border border-slate-200 hover:border-[#800000] cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={(checklist as any)[item.key]}
                        onChange={(e) =>
                          setChecklist((prev) => ({
                            ...prev,
                            [item.key]: e.target.checked,
                          }))
                        }
                        className="w-4 h-4 text-[#800000] rounded focus:ring-[#800000]"
                      />
                      <span className="text-[11px] font-medium text-[#292329]">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Moderator Feedback Notes & Correction Request */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-[#292329] mb-1">
                    Moderator Inspection Notes (Internal / Feedback)
                  </label>
                  <textarea
                    rows={2}
                    value={moderatorNotes}
                    onChange={(e) => setModeratorNotes(e.target.value)}
                    placeholder="e.g. Well-organized shear moment equilibrium diagrams. Formulas follow NSCP guidelines."
                    className="w-full p-2.5 text-xs bg-[#F5F5F5] border border-slate-300 rounded-xl focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#B42318] mb-1">
                    Requested Corrections (Shown to Student if Requesting Changes)
                  </label>
                  <input
                    type="text"
                    value={requestedCorrections}
                    onChange={(e) => setRequestedCorrections(e.target.value)}
                    placeholder="e.g. Please redact the visible student number on page 2 before publication."
                    className="w-full px-3 py-2 text-xs bg-[#F5F5F5] border border-slate-300 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={() => handleDecision('published')}
                  disabled={submittingAction}
                  className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 hover:from-emerald-500 hover:to-teal-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm hover:shadow-md hover:shadow-emerald-600/30 ring-1 ring-emerald-300/40 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                  <span>Approve & Publish to Marketplace</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDecision('changes_requested')}
                  disabled={submittingAction || !requestedCorrections.trim()}
                  className="px-4 py-2.5 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white font-bold text-xs rounded-xl transition-all shadow-sm hover:shadow-md hover:shadow-amber-500/25 ring-1 ring-amber-300/40 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-95"
                >
                  <RotateCcw className="w-4 h-4 text-amber-200" />
                  <span>Request Student Corrections</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDecision('rejected')}
                  disabled={submittingAction}
                  className="px-4 py-2.5 bg-gradient-to-r from-rose-600 via-rose-700 to-rose-800 hover:from-rose-500 hover:to-rose-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm hover:shadow-md hover:shadow-rose-600/25 ring-1 ring-rose-300/40 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-95"
                >
                  <XCircle className="w-4 h-4 text-rose-200" />
                  <span>Reject Submission</span>
                </button>
              </div>
            </>
          ) : (
            <div className="py-16 text-center text-xs text-[#746B70] space-y-2">
              <ClipboardCheck className="w-12 h-12 text-[#E8A5A9] mx-auto mb-2" />
              <h3 className="text-sm font-bold text-[#292329]">Select a Material to Inspect</h3>
              <p className="max-w-xs mx-auto text-[#746B70]">
                Choose an item from the pending queue on the left to verify academic quality, classification, and RA 10173 privacy compliance.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
