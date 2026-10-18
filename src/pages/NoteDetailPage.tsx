import React, { useState } from 'react';
import {
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  ShieldCheck,
  ShieldAlert,
  Download,
  BookOpen,
  Calendar,
  Eye,
  ShoppingBag,
  Share2,
  CheckCircle2,
  FileText,
  Building,
  GraduationCap,
  Lock,
  Tag
} from 'lucide-react';
import { NoteListing, UserProfile } from '../types';
import { formatPhp } from '../lib/api';

interface NoteDetailPageProps {
  note: NoteListing;
  currentUser: UserProfile;
  isPurchased: boolean;
  userVote: number;
  onBack: () => void;
  onBuy: () => void;
  onOpenViewer: () => void;
  onMessageSeller: (sellerId: string, noteId: string) => void;
  onReport: (noteId: string, title: string) => void;
  onVote: (noteId: string, direction: 1 | -1) => void;
  relatedNotes: NoteListing[];
  onSelectRelated: (note: NoteListing) => void;
}

export const NoteDetailPage: React.FC<NoteDetailPageProps> = ({
  note,
  currentUser,
  isPurchased,
  userVote,
  onBack,
  onBuy,
  onOpenViewer,
  onMessageSeller,
  onReport,
  onVote,
  relatedNotes,
  onSelectRelated,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);

  const currentUid = currentUser.uid || currentUser.id;
  const isFree = (note.price === 0 || note.pricePhp === 0);
  const isAuthor = note.sellerId === currentUid;
  const isAuthorized = Array.isArray(note.authorizedBuyers) && note.authorizedBuyers.includes(currentUid);
  const hasAccess = isPurchased || isFree || isAuthor || isAuthorized;

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-[#746B70] hover:text-[#800000] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#746B70] hover:text-[#292329] border border-[#F8EDEF] rounded-lg hover:bg-white transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copiedLink ? 'Link Copied!' : 'Share Notes'}</span>
          </button>
          <button
            onClick={() => onReport(note.id, note.title)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#B42318] hover:text-red-700 border border-rose-200 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Report Violation</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (Document Preview Gallery): 7 cols */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-[#F8EDEF] overflow-hidden shadow-xs relative">
            <div className="relative aspect-[4/3] bg-[#570018] flex items-center justify-center overflow-hidden">
              <img
                src={note.previewImages?.[0] || '/src/assets/images/note_preview_structures_1792130896313.jpg'}
                alt={note.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
              />
              <div className="absolute top-3 left-3 bg-[#570018]/90 backdrop-blur-xs text-[#FAF6F0] px-2.5 py-1 rounded-md text-[11px] font-mono">
                Sample Preview · Page 1 of {note.pageCount}
              </div>
              <div className="absolute top-3 right-3 bg-[#800000] text-white px-2.5 py-1 rounded-md text-[11px] font-bold">
                {note.materialType}
              </div>
            </div>

            {hasAccess && (
              <div className="p-3 bg-emerald-50 border-t border-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-[#287D4F] font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-[#287D4F] shrink-0" />
                  <span>Full access unlocked! Read online or download PDF.</span>
                </div>
                <button
                  onClick={onOpenViewer}
                  className="px-3 py-1 bg-[#287D4F] hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Open Full Document
                </button>
              </div>
            )}
          </div>

          {/* RA 10173 & Quality Control Verified Box */}
          <div className="bg-[#F8EDEF] border border-[#E8A5A9] rounded-2xl p-4 space-y-2 text-xs text-[#570018]">
            <div className="flex items-center justify-between font-bold">
              <span className="flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-[#800000] shrink-0" />
                RA 10173 & Peer Quality Inspected
              </span>
              <span className="text-[10px] font-mono text-[#800000]">
                {note.consents?.consentVersion || 'v2.1-RA10173'}
              </span>
            </div>
            <p className="text-[11px] text-[#746B70] leading-relaxed italic">
              "This document was inspected by peer moderators for syllabus relevance, handwriting legibility, zero personal identifying student information (RA 10173), and original student authorship without copied faculty slides."
            </p>
          </div>
        </div>

        {/* Right Column (Purchase & Metadata Module): 5 cols */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-[#F8EDEF] p-6 shadow-xs space-y-5">
            {/* Header Metadata */}
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#746B70] font-mono">
                <span className="font-bold text-[#800000]">{note.materialType}</span>
                <span>·</span>
                <span>{note.subject}</span>
                <span>·</span>
                <span>{note.program}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#292329] leading-snug">
                {note.title}
              </h1>
              <div className="text-xs text-[#746B70] pt-1">
                Course: <strong className="text-[#292329]">{note.courseName}</strong> ({note.courseCode})
              </div>
              <div className="text-xs text-[#746B70]">
                Target Year: <strong className="text-[#292329]">{note.yearLevel}</strong> · Language: {note.language || 'English'}
              </div>
            </div>

            {/* Academic Topics */}
            {note.topics && note.topics.length > 0 && (
              <div className="p-3 bg-[#F8EDEF]/50 rounded-xl border border-[#E8A5A9]/50 text-xs">
                <span className="font-bold text-[#800000] block mb-1">Topics Covered:</span>
                <div className="flex flex-wrap gap-1.5 text-[11px] font-mono text-[#292329]">
                  {note.topics.map((t) => (
                    <span key={t} className="bg-white px-2 py-0.5 rounded border border-[#E8A5A9]/60">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Price block */}
            <div className="p-4 bg-[#F8EDEF]/40 rounded-xl border border-[#E8A5A9]/60 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-[#746B70] uppercase tracking-wide block">
                  Student Price (PHP)
                </span>
                <span className="text-2xl font-black text-[#800000] font-mono tabular-nums">
                  {isFree ? 'FREE' : formatPhp(note.pricePhp)}
                </span>
              </div>

              {/* Reddit Voting Widget */}
              <div className="flex items-center gap-2 bg-white border border-[#E8A5A9] px-3 py-1.5 rounded-xl shadow-2xs">
                <button
                  onClick={() => onVote(note.id, 1)}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    userVote === 1
                      ? 'text-[#EA580C] bg-orange-100 font-bold'
                      : 'text-[#746B70] hover:text-[#EA580C] hover:bg-orange-50'
                  }`}
                  title="Upvote note"
                >
                  <ThumbsUp className="w-4 h-4" />
                </button>
                <div className="text-center font-mono font-bold text-xs text-[#800000] tabular-nums">
                  {note.netScore}
                </div>
                <button
                  onClick={() => onVote(note.id, -1)}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    userVote === -1
                      ? 'text-[#4F46E5] bg-indigo-100 font-bold'
                      : 'text-[#746B70] hover:text-[#4F46E5] hover:bg-indigo-50'
                  }`}
                  title="Downvote note"
                >
                  <ThumbsDown className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Action Buttons: Dynamic Buy / Download */}
            <div className="space-y-2.5">
              {hasAccess ? (
                <div className="space-y-2">
                  <a
                    href={note.fileUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'}
                    download={`${note.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 hover:from-emerald-500 hover:to-teal-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md hover:shadow-lg hover:shadow-emerald-600/30 hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer active:scale-95 ring-1 ring-emerald-300/40 text-center"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Note (Secure PDF)</span>
                  </a>
                  <button
                    type="button"
                    onClick={onOpenViewer}
                    className="w-full py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4 text-emerald-700" />
                    <span>Open in Document Viewer</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={onBuy}
                  className="w-full py-3.5 px-4 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer active:scale-95 text-white bg-gradient-to-r from-[#800000] via-[#A01A33] to-[#C02636] hover:from-[#6B1E35] hover:to-[#A01A33] ring-1 ring-amber-300/40 hover:shadow-[#800000]/30"
                >
                  <ShoppingBag className="w-4 h-4 text-amber-200" />
                  <span>Pay with PayMongo ({formatPhp(note.price ?? note.pricePhp ?? 0)})</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => onMessageSeller(note.sellerId, note.id)}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500/15 via-amber-50 to-[#F8EDEF] hover:from-amber-500/25 hover:to-[#F8EDEF] text-amber-950 font-extrabold text-xs rounded-xl border-2 border-amber-400 hover:border-amber-500 transition-all shadow-xs hover:shadow-md hover:shadow-amber-500/15 hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <MessageSquare className="w-4 h-4 text-amber-700" />
                <span>Message Seller Directly (Free)</span>
              </button>
            </div>

            {/* Format & Statistics */}
            <div className="pt-3 border-t border-[#F8EDEF] grid grid-cols-3 gap-2 text-center text-[11px] text-[#746B70] font-mono">
              <div>
                <span className="block text-[10px] text-[#746B70]/80">FORMAT</span>
                <span className="font-bold text-[#292329]">{note.format} ({note.pageCount}p)</span>
              </div>
              <div>
                <span className="block text-[10px] text-[#746B70]/80">PURCHASES</span>
                <span className="font-bold text-[#292329] tabular-nums">{note.purchasesCount}</span>
              </div>
              <div>
                <span className="block text-[10px] text-[#746B70]/80">VIEWS</span>
                <span className="font-bold text-[#292329] tabular-nums">{note.viewsCount}</span>
              </div>
            </div>

            {/* Author Profile Card */}
            <div className="pt-4 border-t border-[#F8EDEF] flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#570018] text-[#FAF6F0] font-bold flex items-center justify-center text-sm font-mono shrink-0">
                {(note.sellerName || 'S').charAt(0)}
              </div>
              <div className="flex-1 truncate">
                <span className="text-xs font-bold text-[#292329] truncate block">{note.sellerName || 'Student Uploader'}</span>
                <span className="text-[11px] text-[#746B70] truncate block">
                  Author Year: {note.creatorYearLevel || 'Senior'} · {note.sellerUniversity || 'Philippines'}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-2xl border border-[#F8EDEF] p-6 shadow-xs space-y-3">
            <h3 className="text-xs uppercase font-bold text-[#800000] tracking-wider">
              About This Study Material
            </h3>
            <p className="text-xs text-[#292329] leading-relaxed whitespace-pre-line">
              {note.description}
            </p>
          </div>
        </div>
      </div>

      {/* Related Notes */}
      {relatedNotes.length > 0 && (
        <section className="pt-8 border-t border-[#F8EDEF] space-y-4">
          <h2 className="text-lg font-bold text-[#292329]">
            More in {note.subject || note.program}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {relatedNotes.map((rel) => (
              <div
                key={rel.id}
                onClick={() => onSelectRelated(rel)}
                className="bg-white rounded-xl border border-[#F8EDEF] p-3 hover:border-[#800000] hover:shadow-xs transition-all cursor-pointer space-y-2"
              >
                <div className="aspect-[16/10] bg-slate-100 rounded-lg overflow-hidden relative">
                  <img
                    src={rel.previewImages?.[0] || '/src/assets/images/note_preview_structures_1792130896313.jpg'}
                    alt={rel.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-1.5 left-1.5 bg-[#800000] text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                    {rel.materialType}
                  </span>
                </div>
                <div className="text-[10px] text-[#746B70] font-mono">
                  {rel.subject} · {rel.yearLevel}
                </div>
                <h4 className="text-xs font-bold text-[#292329] line-clamp-2">
                  {rel.title}
                </h4>
                <div className="text-xs font-mono font-bold text-[#800000]">
                  {rel.pricePhp === 0 ? 'FREE' : formatPhp(rel.pricePhp)}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
