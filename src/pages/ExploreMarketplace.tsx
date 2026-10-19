import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  SlidersHorizontal,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Sparkles,
  ArrowUpDown,
  BookOpen,
  Building,
  Check,
  X,
  Tag,
  Download,
  Wallet,
  CheckCircle2,
  Radio,
  FileQuestion,
} from 'lucide-react';
import { NoteListing, EngineeringProgram, YearLevel, MaterialType, UserProfile } from '../types';
import { formatPhp } from '../lib/api';
import { subscribeToMarketplaceNotes, seedInitialNotesIfEmpty } from '../lib/firebase';

interface ExploreMarketplaceProps {
  notes: NoteListing[];
  currentUser: UserProfile;
  selectedProgram?: string;
  initialSearch?: string;
  onSelectNote: (note: NoteListing) => void;
  onRequestNote?: () => void;
  onBuyNote?: (note: NoteListing) => void;
  onOpenViewer?: (note: NoteListing) => void;
  onMessageSeller: (sellerId: string, noteId: string) => void;
  onVote: (noteId: string, direction: 1 | -1) => void;
}

const MATERIAL_SHORTCUTS: {
  label: string;
  type: MaterialType;
  badgeBg: string;
  activeColor: string;
}[] = [
  { label: 'Find Reviewers', type: 'Reviewer', badgeBg: 'bg-rose-50 border-rose-200 text-[#800000] hover:bg-[#800000] hover:text-white', activeColor: 'bg-[#800000] text-white border-[#800000]' },
  { label: 'Find Formula Sheets', type: 'Formula Sheet', badgeBg: 'bg-amber-50 border-amber-200 text-amber-900 hover:bg-amber-600 hover:text-white', activeColor: 'bg-amber-600 text-white border-amber-600' },
  { label: 'Find Solved Problems', type: 'Solved Engineering Problems', badgeBg: 'bg-emerald-50 border-emerald-200 text-emerald-900 hover:bg-[#287D4F] hover:text-white', activeColor: 'bg-[#287D4F] text-white border-[#287D4F]' },
  { label: 'Find Handwritten Notes', type: 'Handwritten Notes', badgeBg: 'bg-indigo-50 border-indigo-200 text-indigo-900 hover:bg-indigo-600 hover:text-white', activeColor: 'bg-indigo-600 text-white border-indigo-600' },
  { label: 'Find Practice Problems', type: 'Practice Problems with Solutions', badgeBg: 'bg-sky-50 border-sky-200 text-sky-900 hover:bg-sky-600 hover:text-white', activeColor: 'bg-sky-600 text-white border-sky-600' },
  { label: 'Find Board Exam Review Materials', type: 'Board Exam Review Materials', badgeBg: 'bg-orange-50 border-orange-200 text-orange-900 hover:bg-orange-600 hover:text-white', activeColor: 'bg-orange-600 text-white border-orange-600' },
];

const ALL_MATERIAL_TYPES: (MaterialType | 'All Types')[] = [
  'All Types',
  'Reviewer',
  'Handwritten Notes',
  'Formula Sheet',
  'Solved Engineering Problems',
  'Practice Problems with Solutions',
  'Study Guide',
  'Subject Summary',
  'Concept Explanation',
  'Design Computation Examples',
  'Board Exam Review Materials',
  'Engineering Tables and Reference Sheets',
  'Lecture Notes',
  'Typed Notes',
  'Answered Sample Problems',
  'Practice Problems Without Solutions',
  'Laboratory Study Notes',
  'Laboratory Report Guide',
  'Flashcards and Quick Review',
  'Other Student-Created Study Material',
];

const PROGRAMS: (EngineeringProgram | 'All')[] = [
  'All',
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

const YEAR_LEVELS: (YearLevel | 'All')[] = [
  'All',
  '1st Year',
  '2nd Year',
  '3rd Year',
  '4th Year',
  '5th Year',
  'Irregular Student',
  'Graduate Student',
];

export const ExploreMarketplace: React.FC<ExploreMarketplaceProps> = ({
  notes: initialNotes,
  currentUser,
  selectedProgram = 'All',
  initialSearch = '',
  onSelectNote,
  onRequestNote,
  onBuyNote,
  onOpenViewer,
  onMessageSeller,
  onVote,
}) => {
  const [realtimeNotes, setRealtimeNotes] = useState<NoteListing[]>(initialNotes);
  const [search, setSearch] = useState(initialSearch);
  const [programFilter, setProgramFilter] = useState<string>(selectedProgram);
  const [materialFilter, setMaterialFilter] = useState<string>('All Types');
  const [yearFilter, setYearFilter] = useState<string>('All');
  const [priceType, setPriceType] = useState<'all' | 'free' | 'paid'>('all');
  const [sortBy, setSortBy] = useState<'top' | 'newest' | 'purchases' | 'price_low' | 'price_high'>('top');

  // Stream notes in real-time from Firestore collection('notes') where approvedStatus == true
  useEffect(() => {
    seedInitialNotesIfEmpty();
    const unsubscribe = subscribeToMarketplaceNotes(
      (streamed) => {
        setRealtimeNotes(streamed || []);
      },
      (err) => console.warn('Marketplace feed listener notice:', err)
    );
    return () => unsubscribe();
  }, []);

  const activeNotes = realtimeNotes !== null ? realtimeNotes : (initialNotes || []);

  // Filter notes - strictly ensure approvedStatus == true
  const filteredNotes = activeNotes.filter((note) => {
    if (note.approvedStatus === false) return false;

    if (programFilter !== 'All' && note.program !== programFilter) return false;
    if (yearFilter !== 'All' && note.yearLevel !== yearFilter) return false;
    if (materialFilter !== 'All Types' && note.materialType !== materialFilter) return false;
    if (priceType === 'free' && note.pricePhp !== 0) return false;
    if (priceType === 'paid' && note.pricePhp === 0) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const matches =
        note.title.toLowerCase().includes(q) ||
        note.description.toLowerCase().includes(q) ||
        (note.subject && note.subject.toLowerCase().includes(q)) ||
        (note.materialType && note.materialType.toLowerCase().includes(q)) ||
        (note.courseCode && note.courseCode.toLowerCase().includes(q)) ||
        (note.topic && note.topic.toLowerCase().includes(q)) ||
        (note.topics && note.topics.some((t: string) => t.toLowerCase().includes(q))) ||
        (note.sellerName && note.sellerName.toLowerCase().includes(q));
      if (!matches) return false;
    }

    return true;
  });

  // Sorting
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (sortBy === 'top') return (b.netScore ?? 0) - (a.netScore ?? 0);
    if (sortBy === 'newest') return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    if (sortBy === 'purchases') return (b.purchasesCount ?? 0) - (a.purchasesCount ?? 0);
    if (sortBy === 'price_low') return (a.pricePhp || 0) - (b.pricePhp || 0);
    if (sortBy === 'price_high') return (b.pricePhp || 0) - (a.pricePhp || 0);
    return 0;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Search Header Banner */}
      <div className="bg-white rounded-2xl border border-[#F8EDEF] p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#292329] tracking-tight">
              Engineering Study Marketplace
            </h1>
            <p className="text-xs text-[#746B70] mt-1">
              Filter by material type, subject, engineering curriculum, and peer quality score.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-[#746B70] font-medium font-mono tabular-nums">
              {sortedNotes.length} verified listings
            </span>
            {onRequestNote && (
              <button
                type="button"
                onClick={onRequestNote}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F8EDEF] hover:bg-[#800000] text-[#800000] hover:text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer border border-[#E8A5A9]/70"
              >
                <FileQuestion className="w-3.5 h-3.5" />
                <span>Request a Note</span>
              </button>
            )}
          </div>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#800000]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by topic, material type (e.g., Reviewer, Formula Sheet), subject, or course code..."
            className="w-full pl-10 pr-10 py-2.5 bg-[#FAF9F9] border border-[#E8A5A9]/70 rounded-xl text-xs sm:text-sm text-[#292329] focus:outline-none focus:ring-2 focus:ring-[#800000]/25 focus:bg-white transition-all shadow-2xs"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3.5 top-3 text-[#746B70] hover:text-[#292329] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Material-Type-Specific Search Shortcuts */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] font-bold text-[#800000] mr-1">Shortcuts:</span>
          {MATERIAL_SHORTCUTS.map((sc) => {
            const isActive = materialFilter === sc.type;
            return (
              <button
                key={sc.label}
                type="button"
                onClick={() => setMaterialFilter(sc.type)}
                className={`px-2.5 py-1 text-[11px] rounded-lg transition-all cursor-pointer border shadow-2xs hover:-translate-y-0.5 ${
                  isActive ? sc.activeColor : sc.badgeBg
                }`}
              >
                {sc.label}
              </button>
            );
          })}
          {materialFilter !== 'All Types' && (
            <button
              onClick={() => setMaterialFilter('All Types')}
              className="text-[11px] font-bold text-[#B42318] hover:underline ml-1 cursor-pointer"
            >
              Reset Type
            </button>
          )}
        </div>

        {/* Filter controls bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#F8EDEF]">
          {/* Price segmented filter */}
          <div className="flex items-center gap-1.5 bg-[#FAF9F9] p-1 rounded-xl border border-[#F8EDEF]">
            <button
              onClick={() => setPriceType('all')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                priceType === 'all'
                  ? 'bg-[#570018] text-white shadow-2xs'
                  : 'text-[#746B70] hover:text-[#292329] hover:bg-white'
              }`}
            >
              All Notes
            </button>
            <button
              onClick={() => setPriceType('free')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                priceType === 'free'
                  ? 'bg-emerald-600 text-white shadow-2xs ring-1 ring-emerald-400/50'
                  : 'text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50/60'
              }`}
            >
              Free (₱0.00)
            </button>
            <button
              onClick={() => setPriceType('paid')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                priceType === 'paid'
                  ? 'bg-gradient-to-r from-[#800000] to-[#A01A33] text-white shadow-2xs ring-1 ring-rose-400/40'
                  : 'text-[#746B70] hover:text-[#800000] hover:bg-rose-50/60'
              }`}
            >
              Paid Only
            </button>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#746B70] font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="px-3 py-1.5 bg-[#FAF9F9] border border-[#E8A5A9]/70 rounded-xl text-xs font-semibold text-[#292329] focus:outline-none focus:ring-2 focus:ring-[#800000]/25 cursor-pointer shadow-2xs"
            >
              <option value="top">Highest Upvoted (Top Score)</option>
              <option value="newest">Newest Uploads</option>
              <option value="purchases">Most Purchased</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Active Filters Summary row */}
        {(programFilter !== 'All' || materialFilter !== 'All Types' || yearFilter !== 'All' || search || priceType !== 'all') && (
          <div className="flex flex-wrap items-center gap-2 pt-2 text-xs border-t border-[#F8EDEF]">
            <span className="text-[#746B70] font-medium">Active filters:</span>
            {programFilter !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#F8EDEF] text-[#800000] font-semibold text-[11px]">
                {programFilter}
                <button onClick={() => setProgramFilter('All')} className="hover:text-black cursor-pointer">×</button>
              </span>
            )}
            {materialFilter !== 'All Types' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#F8EDEF] text-[#800000] font-semibold text-[11px]">
                {materialFilter}
                <button onClick={() => setMaterialFilter('All Types')} className="hover:text-black cursor-pointer">×</button>
              </span>
            )}
            {yearFilter !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#F8EDEF] text-[#800000] font-semibold text-[11px]">
                {yearFilter}
                <button onClick={() => setYearFilter('All')} className="hover:text-black cursor-pointer">×</button>
              </span>
            )}
            {search && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#F8EDEF] text-[#800000] font-semibold text-[11px]">
                "{search}"
                <button onClick={() => setSearch('')} className="hover:text-black cursor-pointer">×</button>
              </span>
            )}
            <button
              onClick={() => {
                setSearch('');
                setProgramFilter('All');
                setMaterialFilter('All Types');
                setYearFilter('All');
                setPriceType('all');
              }}
              className="text-[11px] text-[#800000] font-bold hover:underline cursor-pointer ml-auto"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Main Layout: Filters Sidebar + Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Column: Filter Sidebar */}
        <aside className="lg:col-span-1 space-y-4 lg:sticky lg:top-20 self-start">
          {/* Material Type Dropdown / List */}
          <div className="bg-white rounded-2xl border border-[#F8EDEF] p-4 shadow-xs">
            <h3 className="text-xs uppercase font-bold text-[#800000] tracking-wider mb-2.5">
              Material Type
            </h3>
            <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
              {ALL_MATERIAL_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => setMaterialFilter(type)}
                  className={`w-full text-left px-2 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between cursor-pointer ${
                    materialFilter === type
                      ? 'bg-[#800000] text-white font-bold'
                      : 'text-[#292329] hover:bg-[#F8EDEF]'
                  }`}
                >
                  <span className="truncate">{type}</span>
                  {materialFilter === type && <Check className="w-3.5 h-3.5 text-white shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* Engineering Program Filter */}
          <div className="bg-white rounded-2xl border border-[#F8EDEF] p-4 shadow-xs">
            <h3 className="text-xs uppercase font-bold text-[#800000] tracking-wider mb-2.5">
              Engineering Program
            </h3>
            <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
              {PROGRAMS.map((prog) => (
                <button
                  key={prog}
                  onClick={() => setProgramFilter(prog)}
                  className={`w-full text-left px-2 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between cursor-pointer ${
                    programFilter === prog
                      ? 'bg-[#800000] text-white font-bold'
                      : 'text-[#292329] hover:bg-[#F8EDEF]'
                  }`}
                >
                  <span className="truncate">{prog}</span>
                  {programFilter === prog && <Check className="w-3.5 h-3.5 text-white shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* Intended Target Year Level Filter */}
          <div className="bg-white rounded-2xl border border-[#F8EDEF] p-4 shadow-xs">
            <h3 className="text-xs uppercase font-bold text-[#800000] tracking-wider mb-2.5">
              Target Year Level
            </h3>
            <div className="space-y-1">
              {YEAR_LEVELS.map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setYearFilter(lvl)}
                  className={`w-full text-left px-2 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between cursor-pointer ${
                    yearFilter === lvl
                      ? 'bg-[#800000] text-white font-bold'
                      : 'text-[#292329] hover:bg-[#F8EDEF]'
                  }`}
                >
                  <span>{lvl}</span>
                  {yearFilter === lvl && <Check className="w-3.5 h-3.5 text-white shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Right Column: Note Card Grid */}
        <div className="lg:col-span-3 space-y-4">
          {sortedNotes.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <BookOpen className="w-12 h-12 text-[#E8A5A9] mx-auto" />
              <h3 className="text-base font-bold text-[#292329]">No study materials match your filters</h3>
              <p className="text-xs text-[#746B70] max-w-sm mx-auto">
                Try clearing your search query or selecting "All Types" to discover more materials.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => {
                    setSearch('');
                    setProgramFilter('All');
                    setMaterialFilter('All Types');
                    setYearFilter('All');
                    setPriceType('all');
                  }}
                  className="px-5 py-2.5 bg-gradient-to-r from-[#800000] via-[#A01A33] to-[#C02636] hover:from-[#6B1E35] hover:to-[#A01A33] text-white font-bold text-xs rounded-xl shadow-sm hover:shadow-md hover:shadow-[#800000]/25 transition-all cursor-pointer active:scale-95 ring-1 ring-white/20"
                >
                  Reset All Filters
                </button>
                {onRequestNote && (
                  <button
                    type="button"
                    onClick={onRequestNote}
                    className="px-5 py-2.5 bg-white border border-[#800000] text-[#800000] hover:bg-[#800000] hover:text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <FileQuestion className="w-3.5 h-3.5" />
                    <span>Request This Study Material</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {sortedNotes.map((note) => (
                <div
                  key={note.id}
                  className="bg-white rounded-2xl border border-[#F8EDEF] overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Thumbnail with Material Type Badge and Price */}
                    <div
                      onClick={() => onSelectNote(note)}
                      className="relative aspect-[16/10] bg-slate-100 overflow-hidden cursor-pointer"
                    >
                      <img
                        src={note.previewImages?.[0] || '/src/assets/images/note_preview_structures_1792130896313.jpg'}
                        alt={note.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                      />
                      {/* Price in PHP */}
                      <div className="absolute top-2.5 right-2.5 bg-[#570018]/95 backdrop-blur-xs text-[#FAF6F0] px-2 py-0.5 rounded-md text-xs font-mono font-bold shadow-md">
                        {note.pricePhp === 0 ? 'FREE' : formatPhp(note.pricePhp)}
                      </div>
                      {/* Material Type Ribbon */}
                      <div className="absolute top-2.5 left-2.5 bg-[#800000] text-white px-2 py-0.5 rounded-md text-[10px] font-bold shadow-xs">
                        {note.materialType}
                      </div>
                      <div className="absolute bottom-2 left-2.5 text-[10px] font-mono text-white/95 bg-[#570018]/80 px-1.5 py-0.5 rounded">
                        {note.pageCount || 20} Pages · {note.format || 'PDF'}
                      </div>

                      {/* Access Badges */}
                      {note.sellerId === (currentUser?.uid || currentUser?.id) && (
                        <div className="absolute bottom-2 right-2.5 bg-amber-500 text-white font-mono text-[9px] font-bold px-2 py-0.5 rounded shadow-xs">
                          Your Note
                        </div>
                      )}
                      {Array.isArray(note.authorizedBuyers) &&
                        note.authorizedBuyers.includes(currentUser?.uid || currentUser?.id) &&
                        note.sellerId !== (currentUser?.uid || currentUser?.id) && (
                          <div className="absolute bottom-2 right-2.5 bg-emerald-600 text-white font-mono text-[9px] font-bold px-2 py-0.5 rounded shadow-xs flex items-center gap-1">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            <span>Authorized</span>
                          </div>
                        )}
                    </div>

                    {/* Metadata following Section 2.E requirements */}
                    <div className="p-4 space-y-1.5">
                      {/* Program · Intended Year Level · Subject */}
                      <div className="text-[11px] text-[#746B70] flex flex-wrap items-center gap-1 font-mono">
                        <span className="font-bold text-[#800000]">{note.subject || note.courseCode}</span>
                        <span>·</span>
                        <span>{(note.program || 'Civil').replace(' Engineering', '')}</span>
                        <span>·</span>
                        <span>{note.yearLevel || '3rd Year'}</span>
                      </div>

                      <h3
                        onClick={() => onSelectNote(note)}
                        className="text-xs sm:text-sm font-bold text-[#292329] line-clamp-2 leading-snug cursor-pointer group-hover:text-[#800000] transition-colors"
                      >
                        {note.title}
                      </h3>

                      {/* Academic Topics */}
                      {note.topics && note.topics.length > 0 && (
                        <div className="text-[10px] text-[#746B70] font-mono line-clamp-1">
                          Topics: {note.topics.slice(0, 3).join(', ')}
                        </div>
                      )}

                      <p className="text-xs text-[#746B70] line-clamp-2 leading-relaxed">
                        {note.description}
                      </p>

                      <div className="pt-1 text-[11px] text-[#746B70] flex items-center justify-between">
                        <span className="font-semibold text-[#292329] truncate max-w-[120px]">
                          By {note.sellerName || 'Student Uploader'}
                        </span>
                        <span className="text-[10px] text-[#746B70] truncate max-w-[120px]">
                          {note.university || 'Philippines'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Reddit Vote & Action controls */}
                  <div className="px-4 py-2.5 bg-[#F8EDEF]/40 border-t border-[#F8EDEF] flex items-center justify-between">
                    {/* Voting */}
                    <div className="flex items-center gap-1.5 bg-white border border-[#E8A5A9] rounded-lg px-2 py-1 shadow-2xs">
                      <button
                        onClick={() => onVote(note.id, 1)}
                        className="text-[#746B70] hover:text-[#EA580C] hover:bg-orange-50 rounded p-1 transition-colors cursor-pointer"
                        title="Upvote note"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-mono font-bold text-[#800000] tabular-nums">
                        {note.netScore || 0}
                      </span>
                      <button
                        onClick={() => onVote(note.id, -1)}
                        className="text-[#746B70] hover:text-[#4F46E5] hover:bg-indigo-50 rounded p-1 transition-colors cursor-pointer"
                        title="Downvote note"
                      >
                        <ThumbsDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* DYNAMIC BUY / DOWNLOAD BUTTON */}
                    {(() => {
                      const currentUid = currentUser?.uid || currentUser?.id;
                      const isAuthBuyer =
                        Array.isArray(note.authorizedBuyers) &&
                        note.authorizedBuyers.includes(currentUid);
                      const isSeller = note.sellerId === currentUid;
                      const currentPrice = Number(note.price ?? note.pricePhp ?? 0);
                      const hasAccess = isAuthBuyer || isSeller || currentPrice === 0;

                      return (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onMessageSeller(note.sellerId, note.id)}
                            className="p-2 text-amber-700 bg-amber-50 hover:bg-amber-100 hover:text-amber-900 rounded-xl transition-all cursor-pointer border border-amber-200/80 shadow-2xs hover:shadow-xs active:scale-95"
                            title="Message Seller"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>

                          {hasAccess ? (
                            <a
                              href={note.fileUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'}
                              download={`${note.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 text-xs font-bold rounded-xl transition-all shadow-xs hover:shadow-md cursor-pointer active:scale-95 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 hover:from-emerald-500 hover:to-teal-700 text-white ring-1 ring-emerald-300/40 hover:shadow-emerald-600/20 flex items-center gap-1.5"
                              title="Download full verified note"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Download Note</span>
                            </a>
                          ) : (
                            <button
                              type="button"
                              onClick={() => (onBuyNote ? onBuyNote(note) : onSelectNote(note))}
                              className="px-3 py-1.5 text-xs font-bold rounded-xl transition-all shadow-xs hover:shadow-md cursor-pointer active:scale-95 bg-gradient-to-r from-[#800000] via-[#A01A33] to-[#B8233C] hover:from-[#6B1E35] hover:to-[#800000] text-white ring-1 ring-amber-300/30 hover:shadow-[#800000]/25 flex items-center gap-1.5"
                              title="Pay note uploader directly via PayMongo"
                            >
                              <Wallet className="w-3.5 h-3.5 text-amber-200" />
                              <span>Pay with PayMongo</span>
                            </button>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
