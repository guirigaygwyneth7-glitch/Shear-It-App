import React from 'react';
import { ShieldCheck, FileText, CheckCircle2, AlertTriangle, Lock } from 'lucide-react';
import { ShearItLogo } from './ShearItLogo';

export const Footer: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
  return (
    <footer className="bg-[#570018] text-[#FAF6F0] border-t border-[#6B1E35] mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand & Mission */}
          <div className="space-y-4">
            <ShearItLogo variant="full" theme="maroon" size="md" />
            <p className="text-xs text-[#E5D6DA] leading-relaxed">
              The peer-to-peer academic notes marketplace and student community exclusively for engineering colleges and universities across the Philippines.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#E8A5A9] font-semibold">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#287D4F]" />
              <span>100% Free Student Registration</span>
            </div>
          </div>

          {/* Quality & Data Privacy (RA 10173) */}
          <div>
            <h4 className="text-xs uppercase font-bold text-white tracking-wider mb-3">
              Data Privacy & Standards
            </h4>
            <ul className="space-y-1.5 text-xs text-[#E5D6DA]">
              <li className="flex items-center gap-1.5 text-white font-medium">
                <Lock className="w-3.5 h-3.5 text-[#E8A5A9] shrink-0" />
                Data Privacy Act of 2012 (RA 10173)
              </li>
              <li>Mandatory Student Redaction of PII</li>
              <li>Peer Moderator Quality Inspection</li>
              <li>Anti-Instructor Material Guarantee</li>
              <li>Zero Confidential Exam Answer Keys</li>
              <li>Transparent Consent Records & Audit</li>
            </ul>
          </div>

          {/* Engineering Programs & Disciplines */}
          <div>
            <h4 className="text-xs uppercase font-bold text-white tracking-wider mb-3">
              Engineering Disciplines
            </h4>
            <ul className="space-y-1.5 text-xs text-[#E5D6DA]">
              <li>Civil & Geotechnical Engineering</li>
              <li>Mechanical & Energy Systems</li>
              <li>Electrical & Power Engineering</li>
              <li>Electronics & Communications (ECE)</li>
              <li>Computer & Software Engineering</li>
              <li>Chemical & Environmental Engineering</li>
              <li>Industrial & Systems Engineering</li>
            </ul>
          </div>

          {/* Philippine Payments in PHP */}
          <div>
            <h4 className="text-xs uppercase font-bold text-white tracking-wider mb-3">
              Philippine Online Payments
            </h4>
            <p className="text-xs text-[#E5D6DA] leading-relaxed mb-3">
              All transactions, prices, and seller payouts are processed exclusively in Philippine Pesos (₱) via secure authorized payment gateways.
            </p>
            <div className="flex flex-wrap gap-1.5 text-[11px] text-[#FAF6F0] font-mono">
              <span className="bg-[#6B1E35] px-2 py-0.5 rounded border border-[#800000]">GCash</span>
              <span className="bg-[#6B1E35] px-2 py-0.5 rounded border border-[#800000]">Maya</span>
              <span className="bg-[#6B1E35] px-2 py-0.5 rounded border border-[#800000]">BPI / UB Online</span>
              <span className="bg-[#6B1E35] px-2 py-0.5 rounded border border-[#800000]">Cards</span>
            </div>
            <p className="text-[11px] text-[#E8A5A9] mt-3">
              StudEase Philippine Education Network
            </p>
            <div className="mt-2 pt-2 border-t border-[#6B1E35]/60">
              <button
                onClick={() => onNavigate('tasks')}
                className="text-[11px] font-bold text-amber-300 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>→ Team Task Tracker (Live Sync)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Legal bar */}
        <div className="pt-8 border-t border-[#6B1E35] flex flex-col sm:flex-row items-center justify-between text-xs text-[#E5D6DA] gap-4">
          <p>© {new Date().getFullYear()} Shear It Philippines. Share Notes. Build Together. — StudEase</p>
          <div className="flex items-center gap-4 text-xs text-[#FAF6F0]/80">
            <span className="hover:text-white transition-colors cursor-pointer">Terms of Service</span>
            <span>·</span>
            <span className="hover:text-white transition-colors cursor-pointer">RA 10173 Privacy Notice</span>
            <span>·</span>
            <span className="hover:text-white transition-colors cursor-pointer">Copyright & Takedown</span>
            <span>·</span>
            <span className="hover:text-white transition-colors cursor-pointer">Academic Honor Code</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
