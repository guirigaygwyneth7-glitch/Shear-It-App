import React, { useState } from 'react';
import {
  X,
  Download,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  FileCheck,
  Shield,
  Printer
} from 'lucide-react';
import { NoteListing } from '../types';

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
  const totalPages = note.pageCount || 28;

  if (!isOpen) return null;

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      // Simulate real browser PDF blob download
      const element = document.createElement('a');
      const file = new Blob([
        `Shear It Philippine Academic Notes Archive\n\nTitle: ${note.title}\nCourse: ${note.courseCode} - ${note.courseName}\nAuthor: ${note.sellerName}\nLicensed to: ${buyerName}\nSecurity Hash: SI-SEC-${Date.now()}`
      ], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `${note.courseCode}_${note.title.substring(0, 20).replace(/\s+/g, '_')}_ShearIt.pdf`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      setDownloading(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-between p-2 sm:p-4">
      {/* Top Controls Bar */}
      <div className="w-full max-w-5xl bg-[#570018] text-white rounded-t-xl px-4 py-2.5 flex items-center justify-between border-b border-[#6B1E35]">
        <div className="flex items-center gap-3 overflow-hidden">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <div className="truncate">
            <h3 className="text-xs font-bold text-white truncate">{note.title}</h3>
            <span className="text-[10px] text-[#E8A5A9] font-mono">
              {note.courseCode} · {note.sellerName} · Verified Student Copy
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Zoom controls */}
          <div className="hidden sm:flex items-center gap-1 bg-[#6B1E35] px-2 py-1 rounded-lg text-xs">
            <button
              onClick={() => setZoomLevel((z) => Math.max(75, z - 15))}
              className="p-1 hover:text-[#E8A5A9] cursor-pointer"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-[11px] px-1">{zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(150, z + 15))}
              className="p-1 hover:text-[#E8A5A9] cursor-pointer"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Download button */}
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-[#287D4F] to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{downloading ? 'Preparing...' : 'Download PDF'}</span>
          </button>

          <button
            onClick={onClose}
            className="text-[#E5D6DA] hover:text-white p-1 ml-1 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Viewport */}
      <div className="relative w-full max-w-5xl flex-1 bg-slate-800/90 overflow-auto flex items-center justify-center p-4">
        {/* Document Page Simulation */}
        <div
          style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'center center' }}
          className="transition-transform duration-200 relative bg-white shadow-2xl rounded-sm max-w-2xl w-full aspect-[1/1.414] overflow-hidden flex flex-col justify-between border border-slate-300 select-none"
        >
          {/* Security & Ownership Watermark header */}
          <div className="px-6 py-3 border-b border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>SHEAR IT · LICENSED STUDENT COPY</span>
            <span>{note.courseCode} · PAGE {currentPage} OF {totalPages}</span>
          </div>

          {/* Page Image / Content */}
          <div className="relative flex-1 p-6 flex flex-col items-center justify-center">
            {note.previewImages && note.previewImages[0] ? (
              <img
                src={note.previewImages[0]}
                alt={`Page ${currentPage}`}
                referrerPolicy="no-referrer"
                className="max-h-[600px] w-auto object-contain rounded border border-slate-200 shadow-sm"
              />
            ) : (
              <div className="text-center p-8 text-slate-500">
                <FileCheck className="w-12 h-12 mx-auto text-[#800000] mb-2" />
                <h4 className="font-bold text-[#292329]">{note.title}</h4>
                <p className="text-xs text-[#746B70] mt-1">High resolution vector note stream active.</p>
              </div>
            )}

            {/* Subtle Diagonal Security Watermark */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.06] rotate-[-30deg] select-none text-slate-900 font-extrabold text-3xl font-mono text-center">
              SHEAR IT · LICENSED TO {buyerName.toUpperCase()} · DO NOT REDISTRIBUTE
            </div>
          </div>

          {/* Document Footer stamp */}
          <div className="px-6 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-emerald-600" />
              Verified Original Student Material
            </span>
            <span>Authored by {note.sellerName} ({note.university || 'Philippines'})</span>
          </div>
        </div>
      </div>

      {/* Bottom Paging Toolbar */}
      <div className="w-full max-w-5xl bg-slate-900 text-white rounded-b-xl px-4 py-2 flex items-center justify-between border-t border-slate-800 text-xs">
        <div className="text-slate-400 text-[11px]">
          Use navigation arrows or zoom controls to inspect equations & diagrams.
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            className="p-1 rounded hover:bg-slate-800 disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-mono text-xs">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className="p-1 rounded hover:bg-slate-800 disabled:opacity-30"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
