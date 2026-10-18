import React, { useState, useEffect } from 'react';
import {
  FileQuestion,
  Plus,
  Search,
  Filter,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Sparkles,
  Calendar,
  Wallet,
  CheckCircle2,
  Send,
  BookOpen,
  ArrowRight,
  ExternalLink,
  Tag,
  Clock,
  Building,
  GraduationCap,
  X,
  RefreshCw,
  ShoppingBag,
  Share2,
  ChevronDown
} from 'lucide-react';
import {
  NoteRequest,
  RequestComment,
  RecommendedNoteItem,
  UserProfile,
  NoteListing,
  EngineeringProgram,
  YearLevel,
  MaterialType
} from '../types';
import {
  subscribeToNoteRequests,
  createNoteRequest,
  voteNoteRequest,
  addCommentToNoteRequest,
  subscribeToRequestComments,
  findMatchingNotesForRequest,
  updateRequestStatus
} from '../lib/firebase';
import { formatPhp } from '../lib/api';

interface NoteRequestsPageProps {
  currentUser: UserProfile;
  approvedNotes: NoteListing[];
  onMessageRequester: (recipientId: string, topicSummary: string) => void;
  onBuyNote: (note: NoteListing) => void;
  onOpenViewer: (note: NoteListing) => void;
}

const PROGRAMS: (EngineeringProgram | 'All Programs')[] = [
  'All Programs',
  'Civil Engineering',
  'Mechanical Engineering',
  'Electrical Engineering',
  'Electronics Engineering',
  'Computer Engineering',
  'Chemical Engineering',
  'Industrial Engineering',
  'Mining Engineering',
  'Geological Engineering',
  'Sanitary Engineering',
  'Environmental Engineering',
  'Agricultural and Biosystems Engineering',
  'Other Engineering Programs',
];

const MATERIAL_TYPES: MaterialType[] = [
  'Lecture Notes',
  'Handwritten Notes',
  'Typed Notes',
  'Reviewer',
  'Formula Sheet',
  'Answered Sample Problems',
  'Solved Engineering Problems',
  'Practice Problems with Solutions',
  'Practice Problems Without Solutions',
  'Study Guide',
  'Subject Summary',
  'Concept Explanation',
  'Design Computation Examples',
  'Board Exam Review Materials',
  'Flashcards and Quick Review',
  'Other Student-Created Study Material',
];

const YEAR_LEVELS: YearLevel[] = [
  '1st Year',
  '2nd Year',
  '3rd Year',
  '4th Year',
  '5th Year',
  'Irregular Student',
  'Graduate Student',
];

export const NoteRequestsPage: React.FC<NoteRequestsPageProps> = ({
  currentUser,
  approvedNotes,
  onMessageRequester,
  onBuyNote,
  onOpenViewer,
}) => {
  const [requests, setRequests] = useState<NoteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [programFilter, setProgramFilter] = useState<string>('All Programs');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'fulfilled'>('all');
  const [sortBy, setSortBy] = useState<'votes' | 'newest' | 'budget'>('votes');

  // Modal State: Create Request
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [createFeedback, setCreateFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [program, setProgram] = useState<EngineeringProgram>(
    (currentUser.program as EngineeringProgram) || 'Civil Engineering'
  );
  const [yearLevel, setYearLevel] = useState<YearLevel>(
    (currentUser.yearLevel as YearLevel) || '3rd Year'
  );
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [materialType, setMaterialType] = useState<MaterialType>('Reviewer');
  const [description, setDescription] = useState('');
  const [preferredFormat, setPreferredFormat] = useState<'PDF' | 'JPG / PNG' | 'Any Format'>('PDF');
  const [budgetPhp, setBudgetPhp] = useState('');
  const [deadline, setDeadline] = useState('');

  // "Find Notes for Me" instant matcher
  const [matcherLoading, setMatcherLoading] = useState(false);
  const [matchedNotes, setMatchedNotes] = useState<NoteListing[]>([]);
  const [hasSearchedMatches, setHasSearchedMatches] = useState(false);

  // Selected Request detail / comment drawer
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [activeComments, setActiveComments] = useState<RequestComment[]>([]);
  const [commentInput, setCommentInput] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Recommending note modal state
  const [showRecommendModal, setShowRecommendModal] = useState(false);
  const [recommendSearch, setRecommendSearch] = useState('');

  // Real-time Firestore stream of note requests
  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToNoteRequests(
      (streamed) => {
        setRequests(streamed);
        setLoading(false);
      },
      (error) => {
        console.error('Failed to stream note requests:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Real-time comments listener for active request
  useEffect(() => {
    if (!selectedRequestId) {
      setActiveComments([]);
      return;
    }

    const unsubComments = subscribeToRequestComments(selectedRequestId, (comments) => {
      setActiveComments(comments);
    });

    return () => unsubComments();
  }, [selectedRequestId]);

  // "Find Notes for Me" handler
  const handleFindNotesForMe = async () => {
    if (!subject.trim() && !topic.trim() && !title.trim()) {
      alert('Please fill in at least the Subject or Topic to search for existing notes.');
      return;
    }

    setMatcherLoading(true);
    setHasSearchedMatches(true);
    try {
      const results = await findMatchingNotesForRequest({
        program,
        subject,
        topic,
        materialType,
        title,
      });
      setMatchedNotes(results);
    } catch (err) {
      console.error('Find Notes for Me error:', err);
    } finally {
      setMatcherLoading(false);
    }
  };

  // Submit new request to Firestore
  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subject.trim() || !description.trim()) {
      setCreateFeedback({
        type: 'error',
        text: 'Please provide request title, engineering subject, and brief description.',
      });
      return;
    }

    setSubmitting(true);
    setCreateFeedback(null);
    try {
      const newReq = await createNoteRequest({
        title,
        program,
        yearLevel,
        subject,
        topic: topic.trim() || subject.trim(),
        materialType,
        description,
        preferredFormat,
        budgetPhp: budgetPhp ? parseFloat(budgetPhp) : undefined,
        deadline: deadline || undefined,
        requesterId: currentUser.uid || currentUser.id,
        requesterName: currentUser.name,
        requesterUniversity: currentUser.university || 'Philippine University',
      });

      setCreateFeedback({
        type: 'success',
        text: 'Your study material request is live! Other students and peer tutors have been notified.',
      });

      setTimeout(() => {
        setShowCreateModal(false);
        setTitle('');
        setSubject('');
        setTopic('');
        setDescription('');
        setBudgetPhp('');
        setDeadline('');
        setMatchedNotes([]);
        setHasSearchedMatches(false);
        setCreateFeedback(null);
        if (newReq) {
          setSelectedRequestId(newReq.id);
        }
      }, 1200);
    } catch (err: any) {
      setCreateFeedback({
        type: 'error',
        text: err.message || 'Failed to submit request. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Voting handler
  const handleVote = async (requestId: string, direction: 1 | -1) => {
    try {
      const uid = currentUser.uid || currentUser.id;
      const res = await voteNoteRequest(requestId, uid, direction);
      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? { ...r, netScore: res.netScore, userVote: res.userVote as any }
            : r
        )
      );
    } catch (err) {
      console.error('Voting error:', err);
    }
  };

  // Add Comment / Recommendation
  const handleSendComment = async (recommendedNote?: RecommendedNoteItem) => {
    if (!selectedRequestId) return;
    if (!commentInput.trim() && !recommendedNote) return;

    setSubmittingComment(true);
    try {
      await addCommentToNoteRequest(selectedRequestId, {
        userId: currentUser.uid || currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        content: commentInput.trim() || (recommendedNote ? `I recommend checking this approved reviewer: ${recommendedNote.noteTitle}` : ''),
        recommendedNote,
      });
      setCommentInput('');
      setShowRecommendModal(false);
    } catch (err) {
      console.error('Comment error:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  // Status toggle
  const handleToggleStatus = async (requestId: string, newStatus: 'open' | 'fulfilled') => {
    try {
      await updateRequestStatus(requestId, newStatus);
      setRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status: newStatus } : r))
      );
    } catch (err) {
      console.error('Status error:', err);
    }
  };

  // Filter and sort requests
  const filteredRequests = requests.filter((r) => {
    if (programFilter !== 'All Programs' && r.program !== programFilter) return false;
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        r.title.toLowerCase().includes(q) ||
        r.subject.toLowerCase().includes(q) ||
        r.topic.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.requesterName.toLowerCase().includes(q) ||
        (r.materialType && r.materialType.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const sortedRequests = [...filteredRequests].sort((a, b) => {
    if (sortBy === 'votes') return (b.netScore ?? 0) - (a.netScore ?? 0);
    if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === 'budget') return (b.budgetPhp || 0) - (a.budgetPhp || 0);
    return 0;
  });

  const activeRequest = requests.find((r) => r.id === selectedRequestId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#800000] via-[#570018] to-[#400010] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-[#800000] relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono tracking-wider px-2.5 py-0.5 rounded-full bg-white/20 font-bold backdrop-blur-xs">
                Student Community Feature
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-300/30">
                <Sparkles className="w-3 h-3" />
                Free to Post
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Request Engineering Study Materials
            </h1>
            <p className="text-xs sm:text-sm text-[#F0D5DA] leading-relaxed">
              Cannot find specific reviewer notes, formula sheets, or worked board problems in the marketplace? Post your request here. Fellow students, top creators, and peer mentors will help or recommend verified materials.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setShowCreateModal(true);
              setCreateFeedback(null);
            }}
            className="px-6 py-3.5 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg hover:shadow-xl hover:shadow-amber-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 shrink-0 ring-2 ring-white/20"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Post a Note Request</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-[#F8EDEF] p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#746B70] absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search requested topics, subjects (e.g. Thermodynamics, Soil Mechanics, Beam Shear)..."
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-[#FAF9F9] border border-[#E8A5A9]/70 rounded-xl focus:border-[#800000] focus:ring-1 focus:ring-[#800000] focus:outline-none"
            />
          </div>

          {/* Program Select */}
          <div className="flex items-center gap-2">
            <select
              value={programFilter}
              onChange={(e) => setProgramFilter(e.target.value)}
              className="px-3 py-2.5 text-xs bg-[#FAF9F9] border border-[#E8A5A9]/70 rounded-xl focus:border-[#800000] focus:outline-none font-medium text-[#292329]"
            >
              {PROGRAMS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>

            {/* Status Filter */}
            <div className="flex p-1 bg-[#FAF9F9] border border-[#E8A5A9]/70 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  statusFilter === 'all' ? 'bg-[#800000] text-white shadow-2xs' : 'text-[#746B70] hover:text-[#292329]'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('open')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  statusFilter === 'open' ? 'bg-[#800000] text-white shadow-2xs' : 'text-[#746B70] hover:text-[#292329]'
                }`}
              >
                Open
              </button>
              <button
                onClick={() => setStatusFilter('fulfilled')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  statusFilter === 'fulfilled' ? 'bg-[#800000] text-white shadow-2xs' : 'text-[#746B70] hover:text-[#292329]'
                }`}
              >
                Fulfilled
              </button>
            </div>

            {/* Sort Order */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2.5 text-xs bg-[#FAF9F9] border border-[#E8A5A9]/70 rounded-xl focus:border-[#800000] focus:outline-none font-medium text-[#292329]"
            >
              <option value="votes">Highest Upvoted</option>
              <option value="newest">Recently Requested</option>
              <option value="budget">Highest Budget (₱)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid: Requests List & Details Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Requests Stream (7 or 12 Cols depending on selection) */}
        <div className={`${selectedRequestId ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-[#292329]">
                Live Note Requests Stream
              </h2>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-[#F8EDEF] text-[#800000]">
                {sortedRequests.length} active
              </span>
            </div>
            <span className="text-[11px] text-[#746B70] font-mono">
              Real-time Firestore Sync
            </span>
          </div>

          {loading ? (
            <div className="p-16 bg-white rounded-3xl border border-[#F8EDEF] text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-[#800000] animate-spin mx-auto" />
              <p className="text-xs text-[#746B70] font-medium">Connecting to community requests...</p>
            </div>
          ) : sortedRequests.length === 0 ? (
            <div className="p-16 bg-white rounded-3xl border border-[#F8EDEF] text-center space-y-4 shadow-xs">
              <FileQuestion className="w-12 h-12 text-[#E8A5A9] mx-auto" />
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-[#292329]">No requests match your filters</h3>
                <p className="text-xs text-[#746B70] max-w-md mx-auto">
                  Be the first to request a study guide, reviewer, or formula sheet for this subject. Fellow students and tutors can fulfill it.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="px-5 py-2.5 bg-[#800000] text-white text-xs font-bold rounded-xl hover:bg-[#6B1E35] transition-colors cursor-pointer"
              >
                Create First Request
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedRequests.map((req) => {
                const isSelected = selectedRequestId === req.id;
                const isOwner = req.requesterId === (currentUser.uid || currentUser.id);

                return (
                  <div
                    key={req.id}
                    className={`bg-white rounded-2xl border p-5 transition-all shadow-xs hover:shadow-md ${
                      isSelected
                        ? 'border-[#800000] ring-1 ring-[#800000]/20'
                        : 'border-[#F8EDEF] hover:border-[#E8A5A9]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      {/* Left: Voting Control */}
                      <div className="flex flex-col items-center gap-1 bg-[#FAF9F9] border border-[#E8A5A9]/60 rounded-xl p-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleVote(req.id, 1)}
                          className={`p-1 rounded-md transition-colors cursor-pointer ${
                            req.userVote === 1
                              ? 'text-orange-600 bg-orange-100 font-bold'
                              : 'text-[#746B70] hover:text-orange-600 hover:bg-orange-50'
                          }`}
                          title="Upvote request"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-mono text-xs font-bold text-[#800000] tabular-nums">
                          {req.netScore}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleVote(req.id, -1)}
                          className={`p-1 rounded-md transition-colors cursor-pointer ${
                            req.userVote === -1
                              ? 'text-indigo-600 bg-indigo-100 font-bold'
                              : 'text-[#746B70] hover:text-indigo-600 hover:bg-indigo-50'
                          }`}
                          title="Downvote request"
                        >
                          <ThumbsDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Middle: Request Metadata */}
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded ${
                              req.status === 'fulfilled'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-amber-100 text-amber-900 border border-amber-300'
                            }`}
                          >
                            {req.status === 'fulfilled' ? '✓ Fulfilled' : 'Open Request'}
                          </span>

                          <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded bg-[#F8EDEF] text-[#800000]">
                            {req.program}
                          </span>

                          <span className="text-[11px] font-mono text-[#746B70]">
                            {req.materialType} · {req.subject}
                          </span>

                          {req.budgetPhp && req.budgetPhp > 0 && (
                            <span className="px-2 py-0.5 text-[10px] font-mono font-bold text-[#287D4F] bg-emerald-50 rounded border border-emerald-200">
                              Budget: {formatPhp(req.budgetPhp)}
                            </span>
                          )}

                          {req.deadline && (
                            <span className="px-2 py-0.5 text-[10px] font-mono text-[#746B70] bg-slate-50 rounded border border-slate-200 flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-[#800000]" />
                              Due: {new Date(req.deadline).toLocaleDateString()}
                            </span>
                          )}
                        </div>

                        <h3
                          onClick={() => setSelectedRequestId(req.id)}
                          className="text-sm sm:text-base font-bold text-[#292329] hover:text-[#800000] cursor-pointer transition-colors"
                        >
                          {req.title}
                        </h3>

                        <p className="text-xs text-[#746B70] line-clamp-2 leading-relaxed">
                          {req.description}
                        </p>

                        {/* Recommended Notes Preview Pill */}
                        {req.recommendedNotes && req.recommendedNotes.length > 0 && (
                          <div className="p-2.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl space-y-1.5">
                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-900">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>{req.recommendedNotes.length} Verified Note(s) Recommended by Community:</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {req.recommendedNotes.map((rec) => (
                                <button
                                  key={rec.noteId}
                                  type="button"
                                  onClick={() => {
                                    const found = approvedNotes.find((n) => n.id === rec.noteId);
                                    if (found) onOpenViewer(found);
                                  }}
                                  className="text-[11px] bg-white border border-emerald-300 px-2.5 py-1 rounded-lg text-emerald-950 hover:bg-emerald-100 transition-colors flex items-center gap-1 font-medium cursor-pointer shadow-2xs"
                                >
                                  <BookOpen className="w-3 h-3 text-emerald-700" />
                                  <span className="truncate max-w-[200px]">{rec.noteTitle}</span>
                                  <span className="font-mono font-bold text-emerald-800">({formatPhp(rec.pricePhp)})</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex flex-wrap items-center justify-between text-[11px] text-[#746B70] pt-1">
                          <div className="flex items-center gap-2">
                            <span>Requested by <strong className="text-[#292329]">{req.requesterName}</strong></span>
                            <span>·</span>
                            <span className="font-mono text-[10px]">{new Date(req.createdAt).toLocaleDateString()}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Message Requester */}
                            <button
                              type="button"
                              onClick={() => onMessageRequester(req.requesterId, `Regarding note request: ${req.title}`)}
                              className="px-2.5 py-1 text-[11px] font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                              title="Message requester to discuss fulfilling notes"
                            >
                              <MessageSquare className="w-3 h-3 text-amber-700" />
                              <span>Message Requester</span>
                            </button>

                            {/* View Details / Comments */}
                            <button
                              type="button"
                              onClick={() => setSelectedRequestId(isSelected ? null : req.id)}
                              className="px-2.5 py-1 text-[11px] font-bold text-[#800000] bg-[#F8EDEF] hover:bg-[#E8A5A9]/40 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <MessageSquare className="w-3 h-3 text-[#800000]" />
                              <span>{req.commentsCount || 0} Replies</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Active Request Discussion & Recommendation Panel (5 Cols) */}
        {selectedRequestId && activeRequest && (
          <div className="lg:col-span-5 space-y-4 sticky top-20">
            <div className="bg-white rounded-3xl border border-[#F8EDEF] p-5 sm:p-6 shadow-xl space-y-5">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 border-b border-[#F8EDEF] pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[9px] font-mono font-bold uppercase rounded bg-[#F8EDEF] text-[#800000]">
                      {activeRequest.program}
                    </span>
                    <span className="text-[10px] font-mono text-[#746B70]">
                      Format: {activeRequest.preferredFormat}
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-[#292329] leading-snug">
                    {activeRequest.title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedRequestId(null)}
                  className="p-1 text-[#746B70] hover:text-[#292329] rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Full Request Body */}
              <div className="space-y-2 text-xs">
                <div className="text-[11px] font-bold text-[#800000] uppercase tracking-wider font-mono">
                  Subject & Topic Requirements
                </div>
                <div className="p-3 bg-[#FAF9F9] rounded-xl border border-[#F8EDEF] space-y-1">
                  <div><strong>Course / Subject:</strong> {activeRequest.subject}</div>
                  <div><strong>Topic Details:</strong> {activeRequest.topic}</div>
                  <div><strong>Intended Level:</strong> {activeRequest.yearLevel}</div>
                  {activeRequest.budgetPhp && (
                    <div className="text-[#287D4F] font-bold font-mono">
                      Suggested Student Budget: {formatPhp(activeRequest.budgetPhp)}
                    </div>
                  )}
                </div>

                <p className="text-[#292329] leading-relaxed pt-1">
                  {activeRequest.description}
                </p>
              </div>

              {/* Status Toggle if Requester */}
              {(activeRequest.requesterId === (currentUser.uid || currentUser.id) || currentUser.role === 'admin') && (
                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-between text-xs">
                  <span className="font-semibold text-amber-950">
                    Status: <strong>{activeRequest.status.toUpperCase()}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(activeRequest.id, activeRequest.status === 'open' ? 'fulfilled' : 'open')}
                    className="px-3 py-1 bg-[#800000] text-white font-bold rounded-lg text-[11px] hover:bg-[#6B1E35] transition-colors cursor-pointer"
                  >
                    Mark as {activeRequest.status === 'open' ? 'Fulfilled ✓' : 'Open'}
                  </button>
                </div>
              )}

              {/* Recommend Note Action */}
              <div className="p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-emerald-950">Know an existing note?</div>
                  <div className="text-[11px] text-emerald-800">Recommend an approved marketplace reviewer.</div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowRecommendModal(true)}
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs shrink-0 flex items-center gap-1"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Recommend Note</span>
                </button>
              </div>

              {/* Discussion & Comments Stream */}
              <div className="space-y-3 pt-2 border-t border-[#F8EDEF]">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#800000]">
                  Community Discussion & Help ({activeComments.length})
                </h4>

                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {activeComments.length === 0 ? (
                    <div className="text-center py-6 text-xs text-[#746B70] bg-[#FAF9F9] rounded-2xl border border-dashed border-[#E8A5A9]/70">
                      No replies yet. Be the first to advise or recommend a verified reviewer!
                    </div>
                  ) : (
                    activeComments.map((cm) => (
                      <div key={cm.id} className="p-3 bg-[#FAF9F9] rounded-xl border border-[#F8EDEF] space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#292329]">{cm.userName}</span>
                          <span className="text-[10px] font-mono text-[#746B70]">
                            {new Date(cm.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <p className="text-[#292329] leading-relaxed">
                          {cm.content}
                        </p>

                        {/* Recommended Note Attachment Card */}
                        {cm.recommendedNote && (
                          <div className="p-2 bg-white rounded-lg border border-emerald-300 flex items-center justify-between gap-2 shadow-2xs mt-1">
                            <div className="truncate">
                              <span className="font-bold text-emerald-900 block truncate text-[11px]">
                                {cm.recommendedNote.noteTitle}
                              </span>
                              <span className="text-[10px] text-[#746B70] font-mono">
                                Price: {formatPhp(cm.recommendedNote.pricePhp)}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const found = approvedNotes.find((n) => n.id === cm.recommendedNote?.noteId);
                                if (found) onOpenViewer(found);
                              }}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold shrink-0"
                            >
                              Inspect Note
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Comment Input */}
                <div className="pt-2 flex items-center gap-2">
                  <input
                    type="text"
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSendComment();
                    }}
                    placeholder="Write advice or reply to this requester..."
                    className="flex-1 px-3 py-2 text-xs bg-[#FAF9F9] border border-[#E8A5A9]/70 rounded-xl focus:border-[#800000] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleSendComment()}
                    disabled={submittingComment || !commentInput.trim()}
                    className="p-2 bg-[#800000] hover:bg-[#6B1E35] text-white rounded-xl disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CREATE REQUEST MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#F8EDEF] overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-[#800000] via-[#570018] to-[#400010] text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 font-bold">
                  Free Student Service
                </span>
                <h3 className="text-xl font-black mt-1">Request Engineering Study Material</h3>
                <p className="text-xs text-[#E8A5A9] mt-0.5">
                  Specify what you need and our community and tutors will provide or recommend notes.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-full text-[#E8A5A9] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleCreateRequest} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {createFeedback && (
                <div
                  className={`p-3.5 rounded-xl text-xs flex items-start gap-2 ${
                    createFeedback.type === 'success'
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                      : 'bg-rose-50 border border-rose-200 text-rose-900'
                  }`}
                >
                  {createFeedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <X className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <span>{createFeedback.text}</span>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-[#292329] mb-1">
                  Request Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. NSCP 2015 Continuous Beam Shear Stirrup Spacing Solved Problems"
                  className="w-full px-3 py-2 text-xs bg-[#FAF9F9] border border-[#E8A5A9]/70 rounded-xl focus:border-[#800000] focus:ring-1 focus:ring-[#800000] focus:outline-none"
                />
              </div>

              {/* Program & Year Level */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#292329] mb-1">
                    Engineering Program *
                  </label>
                  <select
                    value={program}
                    onChange={(e) => setProgram(e.target.value as EngineeringProgram)}
                    className="w-full px-3 py-2 text-xs bg-[#FAF9F9] border border-[#E8A5A9]/70 rounded-xl focus:border-[#800000] focus:outline-none"
                  >
                    {PROGRAMS.filter((p) => p !== 'All Programs').map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#292329] mb-1">
                    Intended Year Level *
                  </label>
                  <select
                    value={yearLevel}
                    onChange={(e) => setYearLevel(e.target.value as YearLevel)}
                    className="w-full px-3 py-2 text-xs bg-[#FAF9F9] border border-[#E8A5A9]/70 rounded-xl focus:border-[#800000] focus:outline-none"
                  >
                    {YEAR_LEVELS.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Subject & Topic */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#292329] mb-1">
                    Engineering Subject / Course *
                  </label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Theory of Structures, Thermodynamics, Circuits 1"
                    className="w-full px-3 py-2 text-xs bg-[#FAF9F9] border border-[#E8A5A9]/70 rounded-xl focus:border-[#800000] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#292329] mb-1">
                    Specific Topic / Chapter
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. Shear and Moment Diagrams, Pure Substance"
                    className="w-full px-3 py-2 text-xs bg-[#FAF9F9] border border-[#E8A5A9]/70 rounded-xl focus:border-[#800000] focus:outline-none"
                  />
                </div>
              </div>

              {/* Material Type & Preferred Format */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#292329] mb-1">
                    Material Type *
                  </label>
                  <select
                    value={materialType}
                    onChange={(e) => setMaterialType(e.target.value as MaterialType)}
                    className="w-full px-3 py-2 text-xs bg-[#FAF9F9] border border-[#E8A5A9]/70 rounded-xl focus:border-[#800000] focus:outline-none"
                  >
                    {MATERIAL_TYPES.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#292329] mb-1">
                    Preferred Format
                  </label>
                  <select
                    value={preferredFormat}
                    onChange={(e) => setPreferredFormat(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-[#FAF9F9] border border-[#E8A5A9]/70 rounded-xl focus:border-[#800000] focus:outline-none"
                  >
                    <option value="PDF">PDF Document (Preferred)</option>
                    <option value="JPG / PNG">Images (JPG / PNG)</option>
                    <option value="Any Format">Any Format</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-[#292329] mb-1">
                  Detailed Description & Specific Requirements *
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detail what specific sample problems, derivation steps, or exam topics you need help reviewing..."
                  className="w-full px-3 py-2 text-xs bg-[#FAF9F9] border border-[#E8A5A9]/70 rounded-xl focus:border-[#800000] focus:ring-1 focus:ring-[#800000] focus:outline-none"
                />
              </div>

              {/* Optional Budget & Deadline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#292329] mb-1">
                    Optional Budget in PHP (₱)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-[#746B70] font-mono text-xs">₱</span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={budgetPhp}
                      onChange={(e) => setBudgetPhp(e.target.value)}
                      placeholder="e.g. 50 (Free if blank)"
                      className="w-full pl-7 pr-3 py-2 text-xs bg-[#FAF9F9] border border-[#E8A5A9]/70 rounded-xl focus:border-[#800000] focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#292329] mb-1">
                    Optional Deadline
                  </label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#FAF9F9] border border-[#E8A5A9]/70 rounded-xl focus:border-[#800000] focus:outline-none"
                  />
                </div>
              </div>

              {/* "Find Notes for Me" Automated Search Matcher Module */}
              <div className="p-4 bg-gradient-to-r from-amber-500/10 via-[#F8EDEF] to-amber-500/10 rounded-2xl border border-amber-300/70 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-950">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>Find Notes for Me (Automatic Marketplace Search)</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleFindNotesForMe}
                    disabled={matcherLoading}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {matcherLoading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Searching...</span>
                      </>
                    ) : (
                      <>
                        <Search className="w-3.5 h-3.5" />
                        <span>Check Existing Notes</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-[11px] text-[#746B70]">
                  Check if an approved reviewer already covers your required subject or topic before posting.
                </p>

                {/* Match Results */}
                {hasSearchedMatches && (
                  <div className="space-y-2 pt-2 border-t border-amber-200">
                    {matchedNotes.length === 0 ? (
                      <div className="p-3 bg-white rounded-xl border border-amber-200 text-xs text-[#746B70] text-center">
                        No exact match found in current approved reviewers. Your request will stay open for student uploaders!
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <div className="text-[11px] font-bold text-[#800000]">
                          Found {matchedNotes.length} Possible Matches in Marketplace:
                        </div>
                        {matchedNotes.map((note) => (
                          <div
                            key={note.id}
                            className="p-2.5 bg-white rounded-xl border border-amber-200 flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="truncate">
                              <span className="font-bold text-[#292329] block truncate">{note.title}</span>
                              <span className="text-[10px] text-[#746B70] font-mono">
                                {note.subject} · {note.materialType} · By {note.sellerName || 'Student'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => onOpenViewer(note)}
                                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-[11px] font-medium"
                              >
                                View
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setShowCreateModal(false);
                                  onBuyNote(note);
                                }}
                                className="px-2.5 py-1 bg-[#800000] text-white rounded-lg text-[11px] font-bold"
                              >
                                {note.pricePhp === 0 ? 'Claim Free' : formatPhp(note.pricePhp)}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Submit Action */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#F8EDEF]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-[#746B70] hover:text-[#292329]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#800000] via-[#A01A33] to-[#C02636] hover:from-[#6B1E35] hover:to-[#A01A33] text-white text-xs font-bold rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer active:scale-95"
                >
                  {submitting ? 'Broadcasting Request...' : 'Post Free Note Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECOMMEND NOTE MODAL */}
      {showRecommendModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#F8EDEF] overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 bg-gradient-to-r from-emerald-700 to-teal-800 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold">Recommend an Approved Reviewer</h3>
                <p className="text-xs text-emerald-100">
                  Select a verified note from the marketplace to recommend to this requester.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowRecommendModal(false)}
                className="text-white hover:text-emerald-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              <input
                type="text"
                value={recommendSearch}
                onChange={(e) => setRecommendSearch(e.target.value)}
                placeholder="Search approved notes..."
                className="w-full px-3 py-2 text-xs bg-[#FAF9F9] border border-[#E8A5A9]/70 rounded-xl focus:outline-none"
              />

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {approvedNotes
                  .filter((n) =>
                    !recommendSearch.trim() ||
                    n.title.toLowerCase().includes(recommendSearch.toLowerCase()) ||
                    (n.subject && n.subject.toLowerCase().includes(recommendSearch.toLowerCase()))
                  )
                  .slice(0, 6)
                  .map((note) => (
                    <div
                      key={note.id}
                      className="p-3 bg-[#FAF9F9] hover:bg-emerald-50 rounded-xl border border-[#F8EDEF] flex items-center justify-between gap-3 text-xs transition-colors"
                    >
                      <div className="truncate">
                        <span className="font-bold text-[#292329] block truncate">{note.title}</span>
                        <span className="text-[10px] text-[#746B70] font-mono">
                          {note.subject} · {formatPhp(note.pricePhp)} · By {note.sellerName || 'Student'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          handleSendComment({
                            noteId: note.id,
                            noteTitle: note.title,
                            pricePhp: Number(note.price ?? note.pricePhp ?? 0),
                            materialType: note.materialType,
                            subject: note.subject,
                            sellerName: note.sellerName,
                            recommenderName: currentUser.name,
                          });
                        }}
                        className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-xs shrink-0 cursor-pointer"
                      >
                        Recommend
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
