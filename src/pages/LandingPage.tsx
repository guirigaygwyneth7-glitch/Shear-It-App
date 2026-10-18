import React, { useState } from 'react';
import {
  Search,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Award,
  BookOpen,
  Users,
  Sparkles,
  ChevronRight,
  ThumbsUp,
  ThumbsDown,
  Lock,
  Building,
  Cpu,
  Zap,
  Wrench,
  FlaskConical,
  GraduationCap,
  CheckSquare,
} from 'lucide-react';
import { NoteListing, EngineeringProgram, MaterialType } from '../types';
import { formatPhp } from '../lib/api';
import { ShearItLogo } from '../components/ShearItLogo';

interface LandingPageProps {
  popularNotes: NoteListing[];
  recentNotes: NoteListing[];
  onSelectNote: (note: NoteListing) => void;
  onExplore: (program?: string, search?: string, materialType?: string) => void;
  onStartSelling: () => void;
  onVote: (noteId: string, direction: 1 | -1) => void;
  onNavigateTasks?: () => void;
}

const MATERIAL_SHORTCUTS: {
  label: string;
  type: MaterialType;
  badgeBg: string;
}[] = [
  { label: 'Find Reviewers', type: 'Reviewer', badgeBg: 'bg-rose-50 border-rose-200 text-[#800000] hover:bg-[#800000] hover:text-white' },
  { label: 'Find Formula Sheets', type: 'Formula Sheet', badgeBg: 'bg-amber-50 border-amber-200 text-amber-900 hover:bg-amber-600 hover:text-white' },
  { label: 'Find Solved Problems', type: 'Solved Engineering Problems', badgeBg: 'bg-emerald-50 border-emerald-200 text-emerald-900 hover:bg-[#287D4F] hover:text-white' },
  { label: 'Find Handwritten Notes', type: 'Handwritten Notes', badgeBg: 'bg-indigo-50 border-indigo-200 text-indigo-900 hover:bg-indigo-600 hover:text-white' },
  { label: 'Find Practice Problems', type: 'Practice Problems with Solutions', badgeBg: 'bg-sky-50 border-sky-200 text-sky-900 hover:bg-sky-600 hover:text-white' },
  { label: 'Find Board Exam Review Materials', type: 'Board Exam Review Materials', badgeBg: 'bg-orange-50 border-orange-200 text-orange-900 hover:bg-orange-600 hover:text-white' },
];

const PROGRAM_ICONS: { name: EngineeringProgram; short: string; icon: any; courses: string; accentBg: string }[] = [
  { name: 'Civil Engineering', short: 'CE', icon: Building, courses: 'Theory of Structures · Soil Mechanics · Hydraulics', accentBg: 'bg-amber-100/70 text-amber-900 border-amber-200' },
  { name: 'Mechanical Engineering', short: 'ME', icon: Wrench, courses: 'Thermodynamics · Machine Design · Fluid Mechanics', accentBg: 'bg-blue-100/70 text-blue-900 border-blue-200' },
  { name: 'Electrical Engineering', short: 'EE', icon: Zap, courses: 'Power Systems · Circuit Analysis · AC Machinery', accentBg: 'bg-amber-100/70 text-amber-700 border-amber-200' },
  { name: 'Electronics Engineering', short: 'ECE', icon: Cpu, courses: 'Signals & Systems · Microprocessors · Communications', accentBg: 'bg-teal-100/70 text-teal-800 border-teal-200' },
  { name: 'Computer Engineering', short: 'CpE', icon: Cpu, courses: 'Data Structures · Embedded Systems · Logic Design', accentBg: 'bg-indigo-100/70 text-indigo-800 border-indigo-200' },
  { name: 'Chemical Engineering', short: 'ChE', icon: FlaskConical, courses: 'Unit Operations · Chemical Kinetics · Mass Transfer', accentBg: 'bg-emerald-100/70 text-emerald-800 border-emerald-200' },
  { name: 'Industrial Engineering', short: 'IE', icon: TrendingUp, courses: 'Operations Research · Statistical Quality · Ergonomics', accentBg: 'bg-rose-100/70 text-rose-800 border-rose-200' },
];

export const LandingPage: React.FC<LandingPageProps> = ({
  popularNotes,
  recentNotes,
  onSelectNote,
  onExplore,
  onStartSelling,
  onVote,
  onNavigateTasks,
}) => {
  const [searchInput, setSearchInput] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onExplore(undefined, searchInput.trim());
    }
  };

  return (
    <div className="space-y-16 pb-12">
      {/* HERO SECTION WITH OFFICIAL LOGO & MAROON BRANDING */}
      <section className="relative overflow-hidden bg-white border-b border-[#F8EDEF] bg-engineering-grid">
        <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/80 to-white/95 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Official Logo, Headline, and Search */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#800000] bg-[#F8EDEF] border border-[#E8A5A9]/80 px-3.5 py-1.5 rounded-full shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-[#800000] shrink-0" />
                <span>The Academic Notes Marketplace for Philippine Engineering Students</span>
              </div>

              {/* Prominent Official Logo in Hero */}
              <div className="pt-1">
                <ShearItLogo variant="full" size="lg" />
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#292329] tracking-tight leading-[1.12]" style={{ textWrap: 'balance' }}>
                Share Your Notes.{' '}
                <span className="text-[#800000]">Earn From What You Know.</span>
              </h1>

              <p className="text-sm sm:text-base text-[#746B70] leading-relaxed max-w-xl">
                Buy and sell original student-authored study guides, step-by-step solved engineering problem sets, and formula cheat sheets in Philippine Pesos (₱). Built with peer moderator inspection and RA 10173 data privacy controls.
              </p>

              {/* Central Search Form */}
              <form onSubmit={handleSearchSubmit} className="relative max-w-xl">
                <div className="relative flex items-center shadow-xs rounded-2xl bg-white border border-[#E8A5A9]/80 focus-within:ring-2 focus-within:ring-[#800000]/25 transition-all">
                  <Search className="absolute left-4 w-5 h-5 text-[#800000]/70 shrink-0" />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search subject, course code (e.g., Soil Mechanics, CE 312, MATH 201)..."
                    className="w-full pl-12 pr-28 py-3.5 text-xs sm:text-sm text-[#292329] placeholder-[#746B70] bg-transparent focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 px-4 py-2 bg-[#800000] hover:bg-[#6B1E35] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
                  >
                    Search
                  </button>
                </div>

                {/* Material-Type Shortcuts */}
                <div className="flex flex-wrap items-center gap-1.5 mt-3 text-[11px]">
                  <span className="font-bold text-[#800000]">Quick Find:</span>
                  {MATERIAL_SHORTCUTS.slice(0, 4).map((sc) => (
                    <button
                      key={sc.label}
                      type="button"
                      onClick={() => onExplore(undefined, undefined, sc.type)}
                      className={`px-2.5 py-1 rounded-lg border font-semibold transition-all cursor-pointer shadow-2xs hover:-translate-y-0.5 ${sc.badgeBg}`}
                    >
                      {sc.label}
                    </button>
                  ))}
                </div>
              </form>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => onExplore()}
                  className="px-6 py-3 bg-gradient-to-r from-[#800000] via-[#A01A33] to-[#C02636] hover:from-[#6B1E35] hover:to-[#A01A33] text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md hover:shadow-lg hover:shadow-[#800000]/25 hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer active:scale-95 ring-1 ring-white/20"
                >
                  <span>Explore All Notes</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={onStartSelling}
                  className="px-5 py-3 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white text-xs sm:text-sm font-extrabold rounded-xl transition-all shadow-md hover:shadow-lg hover:shadow-amber-500/25 hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer active:scale-95 ring-1 ring-amber-300/40"
                >
                  <TrendingUp className="w-4 h-4 text-amber-200" />
                  <span>Start Selling Notes (Free)</span>
                </button>
                {onNavigateTasks && (
                  <button
                    type="button"
                    onClick={onNavigateTasks}
                    className="px-5 py-3 bg-white hover:bg-[#F8EDEF] text-[#800000] border-2 border-[#800000]/30 hover:border-[#800000] text-xs sm:text-sm font-bold rounded-xl transition-all shadow-xs hover:shadow-md hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer active:scale-95"
                  >
                    <CheckSquare className="w-4 h-4 text-[#800000]" />
                    <span>Team Tasks (Live Sync)</span>
                  </button>
                )}
              </div>

              {/* Trust Indicators */}
              <div className="pt-2 flex flex-wrap items-center gap-6 text-xs text-[#746B70]">
                <div className="flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-[#800000] shrink-0" />
                  <span>RA 10173 Privacy Certified</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#287D4F] shrink-0" />
                  <span>Peer Quality Inspected</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-[#B7791F] shrink-0" />
                  <span>GCash & Maya in PHP</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero High-Fidelity Studio Image with interactive badge */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border border-[#E8A5A9] shadow-xl bg-slate-900 aspect-[4/3] sm:aspect-[4/3] group cursor-pointer"
                onClick={() => popularNotes[0] && onSelectNote(popularNotes[0])}
              >
                <img
                  src="/src/assets/images/hero_engineering_notes_1792130895707.jpg"
                  alt="Student engineering calculations and handwritten notes"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#570018]/95 via-[#570018]/30 to-transparent flex flex-col justify-end p-6 text-white">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded bg-white/20 backdrop-blur-xs text-[#FAF6F0] font-bold">
                      Peer Inspected Student Study Guide
                    </span>
                    <span className="text-xs font-mono font-bold bg-[#800000] text-white px-2 py-0.5 rounded-md">
                      ₱75.00
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white leading-snug group-hover:text-[#FAF6F0] transition-colors">
                    Structural Analysis & Shear-Moment Reviewer
                  </h3>
                  <div className="flex items-center justify-between mt-1 text-xs text-[#E5D6DA]">
                    <span>UP Diliman · 28 Pages · Solved Problems</span>
                    <span className="text-[#FAF6F0] font-semibold underline underline-offset-2">Click to Inspect →</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Academic Marketplace Statistics Strip */}
        <div className="border-t border-[#F8EDEF] bg-[#F8EDEF]/50 py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg sm:text-xl font-black text-[#800000] font-mono tabular-nums">13 Disciplines</div>
              <p className="text-[11px] text-[#746B70]">Civil, Mech, Elec, ECE, CpE, ChE, IE & more</p>
            </div>
            <div>
              <div className="text-lg sm:text-xl font-black text-[#570018] font-mono tabular-nums">19 Material Types</div>
              <p className="text-[11px] text-[#746B70]">Reviewers, Formula Sheets, Solved Sets</p>
            </div>
            <div>
              <div className="text-lg sm:text-xl font-black text-[#287D4F] font-mono tabular-nums">100% Inspected</div>
              <p className="text-[11px] text-[#746B70]">RA 10173 & Anti-Faculty-Slide Guarantee</p>
            </div>
            <div>
              <div className="text-lg sm:text-xl font-black text-[#800000] font-mono tabular-nums">₱0.00 & Paid</div>
              <p className="text-[11px] text-[#746B70]">Instant Access + GCash/Maya Payouts</p>
            </div>
          </div>
        </div>
      </section>

      {/* MATERIAL TYPE SHORTCUTS BAR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl p-6 border border-[#F8EDEF] shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#570018]">
                Browse by Academic Material Type
              </h2>
              <p className="text-xs text-[#746B70] mt-0.5">Every upload is classified by actual study content rather than title alone</p>
            </div>
            <button
              onClick={() => onExplore()}
              className="text-xs font-bold text-[#800000] hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
            >
              <span>View all 19 types</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {MATERIAL_SHORTCUTS.map((sc) => (
              <button
                key={sc.label}
                onClick={() => onExplore(undefined, undefined, sc.type)}
                className={`p-3.5 rounded-xl border text-left transition-all group shadow-2xs hover:shadow-sm cursor-pointer hover:-translate-y-0.5 ${sc.badgeBg}`}
              >
                <div className="text-xs font-bold truncate">
                  {sc.type}
                </div>
                <div className="text-[10px] opacity-80 mt-1 font-medium">
                  Find materials →
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ENGINEERING DISCIPLINE DIRECTORY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-[#292329] tracking-tight">
              Curriculum Notes by Engineering Program
            </h2>
            <p className="text-xs text-[#746B70] mt-1">
              Find customized reviewers matched to your CHED curriculum and major Philippine board exam syllabi.
            </p>
          </div>
          <button
            onClick={() => onExplore()}
            className="text-xs font-bold text-[#800000] hover:underline flex items-center gap-1 mt-2 sm:mt-0 cursor-pointer"
          >
            <span>View all 13 programs</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {PROGRAM_ICONS.map((prog) => {
            const Icon = prog.icon;
            return (
              <button
                key={prog.name}
                type="button"
                onClick={() => onExplore(prog.name)}
                className="p-4 bg-white hover:bg-[#F8EDEF]/50 border border-[#F8EDEF] hover:border-[#800000] rounded-xl text-left transition-all group shadow-2xs hover:shadow-sm cursor-pointer hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${prog.accentBg} group-hover:bg-[#800000] group-hover:text-white`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-[#746B70] px-1.5 py-0.5 rounded bg-[#FAF9F9]">
                    {prog.short}
                  </span>
                </div>
                <h3 className="text-xs font-bold text-[#292329] group-hover:text-[#800000] transition-colors">
                  {prog.name}
                </h3>
                <p className="text-[11px] text-[#746B70] mt-1 line-clamp-1">
                  {prog.courses}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* POPULAR NOTES WITH MATERIAL CLASSIFICATION & REDDIT VOTING */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#800000]" />
            <h2 className="text-lg sm:text-xl font-extrabold text-[#292329] tracking-tight">
              Top Rated & Peer Verified Study Materials
            </h2>
          </div>
          <button
            onClick={() => onExplore()}
            className="text-xs font-bold text-[#800000] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Explore All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {popularNotes.map((note) => (
            <div
              key={note.id}
              className="bg-white rounded-2xl border border-[#F8EDEF] overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Image preview with Material Type & Price */}
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
                  <div className="absolute top-2.5 right-2.5 bg-[#570018]/95 text-[#FAF6F0] px-2 py-0.5 rounded-md text-xs font-mono font-bold shadow-md">
                    {note.pricePhp === 0 ? 'FREE' : formatPhp(note.pricePhp)}
                  </div>
                  <div className="absolute top-2.5 left-2.5 bg-[#800000] text-white px-2 py-0.5 rounded text-[10px] font-bold">
                    {note.materialType}
                  </div>
                  <div className="absolute bottom-2 left-2.5 text-[10px] font-mono text-white/95 bg-[#570018]/80 px-1.5 py-0.5 rounded">
                    {note.pageCount || 10} Pages · {note.format || 'PDF'}
                  </div>
                </div>

                {/* Content info */}
                <div className="p-4 space-y-2">
                  <div className="text-[11px] text-[#746B70] font-mono flex items-center gap-1.5">
                    <span className="font-bold text-[#800000]">{note.subject || note.courseCode}</span>
                    <span>·</span>
                    <span>{(note.program || 'Civil').replace(' Engineering', '')}</span>
                    <span>·</span>
                    <span>{note.yearLevel || '3rd Year'}</span>
                  </div>

                  <h3
                    onClick={() => onSelectNote(note)}
                    className="text-sm font-bold text-[#292329] line-clamp-2 leading-snug cursor-pointer group-hover:text-[#800000] transition-colors"
                  >
                    {note.title}
                  </h3>

                  <p className="text-xs text-[#746B70] line-clamp-2 leading-relaxed">
                    {note.description}
                  </p>

                  <div className="pt-1 text-[11px] text-[#746B70] flex items-center justify-between">
                    <span>By {note.sellerName}</span>
                    <span className="truncate max-w-[140px] text-[#746B70]/80">{note.sellerUniversity}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Reddit Vote bar & Action */}
              <div className="px-4 py-3 bg-[#F8EDEF]/40 border-t border-[#F8EDEF] flex items-center justify-between">
                <div className="flex items-center gap-1.5 bg-white border border-[#E8A5A9] rounded-lg px-2 py-1 shadow-2xs">
                  <button
                    onClick={() => onVote(note.id, 1)}
                    className="text-[#746B70] hover:text-[#EA580C] hover:bg-orange-50 rounded p-1 transition-colors cursor-pointer"
                    title="Upvote note"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-mono font-bold text-[#800000] tabular-nums">
                    {note.netScore}
                  </span>
                  <button
                    onClick={() => onVote(note.id, -1)}
                    className="text-[#746B70] hover:text-[#4F46E5] hover:bg-indigo-50 rounded p-1 transition-colors cursor-pointer"
                    title="Downvote note"
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectNote(note)}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all shadow-xs hover:shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                    note.pricePhp === 0
                      ? 'bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 hover:from-emerald-500 hover:to-teal-700 text-white ring-1 ring-emerald-300/40 hover:shadow-emerald-600/20'
                      : 'bg-gradient-to-r from-[#800000] via-[#A01A33] to-[#B8233C] hover:from-[#6B1E35] hover:to-[#800000] text-white ring-1 ring-rose-300/30 hover:shadow-[#800000]/25'
                  }`}
                >
                  {note.pricePhp === 0 ? 'Get Free' : 'Inspect'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW SHEAR IT WORKS (DEEP MAROON SECTION) */}
      <section className="bg-[#570018] text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl font-extrabold tracking-tight">
              How Shear It Works
            </h2>
            <p className="text-xs text-[#E5D6DA] mt-2">
              A transparent, safe, and student-first workflow with peer quality inspection and RA 10173 data privacy safeguards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-[#6B1E35] p-5 rounded-2xl border border-[#800000] space-y-3">
              <div className="w-9 h-9 rounded-xl bg-[#FAF6F0] text-[#570018] font-bold flex items-center justify-center text-sm font-mono">
                01
              </div>
              <h3 className="text-sm font-bold text-white">Classify & Redact</h3>
              <p className="text-xs text-[#E5D6DA] leading-relaxed">
                Choose the exact material type (Reviewer, Formula Sheet, etc.) and ensure zero student identifying information (RA 10173).
              </p>
            </div>

            <div className="bg-[#6B1E35] p-5 rounded-2xl border border-[#800000] space-y-3">
              <div className="w-9 h-9 rounded-xl bg-[#FAF6F0] text-[#570018] font-bold flex items-center justify-center text-sm font-mono">
                02
              </div>
              <h3 className="text-sm font-bold text-white">Quality Inspection</h3>
              <p className="text-xs text-[#E5D6DA] leading-relaxed">
                Authorized peer moderators verify legibility, syllabus relevance, and absence of instructor slides before public marketplace listing.
              </p>
            </div>

            <div className="bg-[#6B1E35] p-5 rounded-2xl border border-[#800000] space-y-3">
              <div className="w-9 h-9 rounded-xl bg-[#FAF6F0] text-[#570018] font-bold flex items-center justify-center text-sm font-mono">
                03
              </div>
              <h3 className="text-sm font-bold text-white">Peer Evaluation</h3>
              <p className="text-xs text-[#E5D6DA] leading-relaxed">
                Engineering students nationwide browse by subject, inspect sample pages, and upvote helpful materials Reddit-style.
              </p>
            </div>

            <div className="bg-[#6B1E35] p-5 rounded-2xl border border-[#800000] space-y-3">
              <div className="w-9 h-9 rounded-xl bg-[#FAF6F0] text-[#570018] font-bold flex items-center justify-center text-sm font-mono">
                04
              </div>
              <h3 className="text-sm font-bold text-white">Instant Access & GCash</h3>
              <p className="text-xs text-[#E5D6DA] leading-relaxed">
                Buyers get instant verified download access; sellers withdraw earnings straight to their Philippine GCash or Maya mobile wallet.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
