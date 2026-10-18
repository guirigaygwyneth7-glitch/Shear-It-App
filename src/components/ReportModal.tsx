import React, { useState } from 'react';
import { X, AlertTriangle, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { api } from '../lib/api';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'note' | 'post' | 'comment' | 'user';
  targetId: string;
  targetTitle: string;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetTitle,
}) => {
  const [reason, setReason] = useState<string>('copyright');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    try {
      await api.submitReport({
        targetType,
        targetId,
        reason,
        details,
      });
      setSubmitted(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit report.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider">Report Material to Moderation</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5">
          {submitted ? (
            <div className="py-6 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h4 className="text-sm font-bold text-slate-900">Report Submitted</h4>
              <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
                Thank you for protecting student academic integrity. Our moderation team reviews all flagged copyright and unauthorized instructor material promptly.
              </p>
              <button
                onClick={onClose}
                className="mt-3 px-5 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="text-xs text-slate-600">
                Reporting: <strong className="text-slate-900">{targetTitle}</strong>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Reason for Violation:
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none"
                >
                  <option value="copyright">Copyright Infringement (Stolen content / textbook scan)</option>
                  <option value="instructor_material">Unauthorized Instructor Material (Lectures, slide decks)</option>
                  <option value="confidential_exam">Confidential Examination / Unauthorized Test Bank</option>
                  <option value="spam">Spam / Low-quality misleading content</option>
                  <option value="inappropriate">Inappropriate / Harassment</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Detailed Explanation / Proof:
                </label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Please specify why this material violates copyright or platform rules (e.g., textbook author name, original instructor attribution, etc.)."
                  rows={3}
                  required
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none"
                />
              </div>

              {errorMsg && (
                <div className="text-xs text-rose-600 bg-rose-50 p-2 rounded-lg">
                  {errorMsg}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2 text-xs font-semibold text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
