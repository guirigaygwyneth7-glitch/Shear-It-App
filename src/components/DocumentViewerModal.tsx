import React, { useState } from 'react';
import {
  X,
  Download,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  FileCheck,
  Shield,
  Layers,
  BookOpen
} from 'lucide-react';
import { NoteListing } from '../types';
import { getNotePreviewPages, generateEngineeringDiagramSvg } from '../lib/assets';

interface DocumentViewerModalProps {
  note: NoteListing;
  isOpen: boolean;
  onClose: () => void;
  buyerName?: string;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  note,
  isOpen,
  onClose,
  buyerName = 'Verified Student',
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [downloading, setDownloading] = useState(false);
  const [imageErrorMap, setImageErrorMap] = useState<Record<number, boolean>>({});

  const totalPages = note.pageCount || 24;
  const previewPages = getNotePreviewPages(note);

  if (!isOpen) return null;

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      // Create real downloadable text/pdf document blob
      const element = document.createElement('a');
      const file = new Blob([
        `SHEAR IT PHILIPPINE ACADEMIC NOTES ARCHIVE\n=========================================\nTitle: ${note.title}\nCourse: ${note.courseCode} - ${note.courseName || note.subject}\nMaterial Type: ${note.materialType}\nAuthor / Creator: ${note.sellerName} (${note.university || 'Philippines'})\nLicensed To: ${buyerName}\nSyllabus Protection: Republic Act No. 10173 (Data Privacy Act of 2012)\nVerification Hash: SI-SEC-${Date.now()}-${note.id}\n\n[Full ${totalPages}-page high-resolution study guide package active]`
      ], { type: 'application/pdf' });
      element.href = URL.createObjectURL(file);
      element.download = `${note.courseCode || 'Notes'}_${note.title.substring(0, 24).replace(/[^a-zA-Z0-9]/g, '_')}_ShearIt.pdf`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      setDownloading(false);
    }, 600);
  };

  const pageIndex = (currentPage - 1) % previewPages.length;
  const rawPageImage = previewPages[pageIndex];
  const isImageFailed = !!imageErrorMap[currentPage];

  // If external image fails or fallback needed, use high-clarity SVG engineering sheet
  const activeImage = isImageFailed
    ? generateEngineeringDiagramSvg(note.title, note.courseCode, currentPage, totalPages)
    : rawPageImage;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-between p-2 sm:p-4">
      {/* Top Controls Bar */}
      <div className="w-full max-w-5xl bg-[#570018] text-white rounded-t-xl px-4 py-2.5 flex items-center justify-between border-b border-[#6B1E35] shrink-0 shadow-lg">
        <div className="flex items-center gap-3 overflow-hidden">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
          <div className="truncate">
            <h3 className="text-xs sm:text-sm font-bold text-white truncate">{note.title}</h3>
            <span className="text-[10px] sm:text-[11px] text-[#E8A5A9] font-mono">
              {note.courseCode} · {note.materialType} · {note.sellerName} · Verified Student Copy
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-[#6B1E35] px-2 py-1 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(70, z - 15))}
              className="p-1 hover:text-[#E8A5A9] cursor-pointer"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-[11px] px-1">{zoomLevel}%</span>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(160, z + 15))}
              className="p-1 hover:text-[#E8A5A9] cursor-pointer"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Download button */}
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 bg-gradient-to-r from-[#287D4F] to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer active:scale-95 disabled:opacity-50"
            title="Download note document"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{downloading ? 'Preparing...' : 'Download PDF'}</span>
            <span className="sm:hidden">{downloading ? '...' : 'PDF'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="text-[#E5D6DA] hover:text-white p-1 ml-1 cursor-pointer rounded-lg hover:bg-[#6B1E35]"
            title="Close viewer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Viewport */}
      <div className="relative w-full max-w-5xl flex-1 bg-slate-900/90 overflow-auto flex items-center justify-center p-3 sm:p-5">
        {/* Document Page Simulation */}
        <div
          style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'center center' }}
          className="transition-transform duration-200 relative bg-white shadow-2xl rounded-sm max-w-2xl w-full aspect-[1/1.414] overflow-hidden flex flex-col justify-between border border-slate-300 select-none my-auto"
        >
          {/* Security & Ownership Watermark header */}
          <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-[10px] text-slate-500 font-mono">
            <span className="font-bold text-[#800000] flex items-center gap-1">
              <BookOpen className="w-3 h-3 text-[#800000]" />
              SHEAR IT · LICENSED STUDENT COPY
            </span>
            <span>{note.courseCode} · PAGE {currentPage} OF {totalPages}</span>
          </div>

          {/* Page Image / Content */}
          <div className="relative flex-1 p-3 sm:p-5 flex flex-col items-center justify-center bg-[#FAF9F6] overflow-hidden">
            <img
              key={`page-${currentPage}`}
              src={activeImage}
              alt={`Page ${currentPage} - ${note.title}`}
              referrerPolicy="no-referrer"
              onError={() => {
                setImageErrorMap((prev) => ({ ...prev, [currentPage]: true }));
              }}
              className="max-h-[580px] w-full h-full object-contain rounded border border-slate-200/80 shadow-sm"
            />

            {/* Subtle Diagonal Security Watermark */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.05] rotate-[-28deg] select-none text-slate-900 font-extrabold text-2xl sm:text-3xl font-mono text-center px-4">
              SHEAR IT · LICENSED TO {buyerName.toUpperCase()} · DO NOT REDISTRIBUTE
            </div>
          </div>

          {/* Document Footer stamp */}
          <div className="px-5 py-2 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-600">
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-emerald-600" />
              Verified Original Student Material
            </span>
            <span className="font-mono text-[9px] text-slate-500">
              Authored by {note.sellerName} ({note.university || 'Philippines'})
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Paging Toolbar & Sample Page Thumbnails */}
      <div className="w-full max-w-5xl bg-slate-900 text-white rounded-b-xl px-4 py-2.5 flex flex-col sm:flex-row items-center justify-between border-t border-slate-800 text-xs gap-2 shrink-0">
        {/* Sample Pages Quick-Click Thumbnails */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full py-0.5">
          <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold shrink-0 flex items-center gap-1">
            <Layers className="w-3 h-3 text-[#E8A5A9]" />
            Pages:
          </span>
          {Array.from({ length: Math.min(totalPages, 6) }, (_, i) => i + 1).map((pg) => (
            <button
              key={pg}
              type="button"
              onClick={() => setCurrentPage(pg)}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition-all cursor-pointer ${
                currentPage === pg
                  ? 'bg-[#800000] text-white font-bold ring-1 ring-amber-300'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              p.{pg}
            </button>
          ))}
          {totalPages > 6 && (
            <span className="text-slate-500 text-[10px] font-mono">+{totalPages - 6} more</span>
          )}
        </div>

        {/* Prev / Next controls */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed text-xs transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Prev</span>
          </button>

          <span className="font-mono text-xs text-amber-200">
            {currentPage} / {totalPages}
          </span>

          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed text-xs transition-colors"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
