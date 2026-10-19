import React, { useState, useRef, useEffect } from 'react';
import {
  Compass,
  BookOpen,
  MessageSquare,
  Upload,
  User,
  Shield,
  Layers,
  ArrowRightLeft,
  ChevronDown,
  LogOut,
  FolderLock,
  ClipboardCheck,
  CheckSquare,
  Wallet,
  FileQuestion,
  LogIn,
} from 'lucide-react';
import { UserProfile } from '../types';
import { ShearItLogo } from './ShearItLogo';
import { signInWithGooglePopup } from '../lib/firebase';

interface NavbarProps {
  currentUser: UserProfile | null;
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenUpload: () => void;
  onOpenAuth: () => void;
  onOpenProfile?: () => void;
  onSignOut?: () => void;
  onSwitchUser: (userId: string) => void;
  allUsers: UserProfile[];
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  currentView,
  onNavigate,
  onOpenUpload,
  onOpenAuth,
  onOpenProfile,
  onSignOut,
  onSwitchUser,
  allUsers,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isModOrAdmin = currentUser ? (currentUser.role === 'moderator' || currentUser.role === 'admin') : false;
  const isAdmin = currentUser ? (currentUser.role === 'admin' || currentUser.email === 'guirigay.gwyneth7@gmail.com') : false;

  // Click outside to dismiss user dropdown menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#F8EDEF] shadow-xs">
      {/* 3-Zone Top Bar Contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Official Logo */}
        <button
          onClick={() => onNavigate('landing')}
          className="flex items-center text-left group shrink-0 focus:outline-none cursor-pointer"
        >
          <ShearItLogo variant="compact" size="md" />
        </button>

        {/* Zone 2: Navigation Links (single-line clean text links with maroon hover/active) */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#746B70]">
          <button
            onClick={() => onNavigate('marketplace')}
            className={`whitespace-nowrap shrink-0 hover:text-[#800000] transition-colors py-1 cursor-pointer ${
              currentView === 'marketplace' ? 'text-[#800000] font-bold border-b-2 border-[#800000]' : ''
            }`}
          >
            Explore Notes
          </button>
          <button
            onClick={() => onNavigate('requests')}
            className={`whitespace-nowrap shrink-0 hover:text-[#800000] transition-colors py-1 flex items-center gap-1.5 cursor-pointer ${
              currentView === 'requests' ? 'text-[#800000] font-bold border-b-2 border-[#800000]' : ''
            }`}
          >
            <FileQuestion className="w-4 h-4 text-[#800000]" />
            <span>Request Notes</span>
          </button>
          <button
            onClick={() => onNavigate('community')}
            className={`whitespace-nowrap shrink-0 hover:text-[#800000] transition-colors py-1 cursor-pointer ${
              currentView === 'community' ? 'text-[#800000] font-bold border-b-2 border-[#800000]' : ''
            }`}
          >
            Student Community
          </button>
          <button
            onClick={() => onNavigate('buyer_library')}
            className={`whitespace-nowrap shrink-0 hover:text-[#800000] transition-colors py-1 cursor-pointer ${
              currentView === 'buyer_library' ? 'text-[#800000] font-bold border-b-2 border-[#800000]' : ''
            }`}
          >
            My Library
          </button>
          <button
            onClick={() => onNavigate('messages')}
            className={`whitespace-nowrap shrink-0 hover:text-[#800000] transition-colors py-1 cursor-pointer ${
              currentView === 'messages' ? 'text-[#800000] font-bold border-b-2 border-[#800000]' : ''
            }`}
          >
            Messages
          </button>
          <button
            onClick={() => onNavigate('tasks')}
            className={`whitespace-nowrap shrink-0 hover:text-[#800000] transition-colors py-1 flex items-center gap-1.5 cursor-pointer ${
              currentView === 'tasks' ? 'text-[#800000] font-bold border-b-2 border-[#800000]' : ''
            }`}
          >
            <CheckSquare className="w-4 h-4 text-[#800000]" />
            <span>Team Tasks</span>
          </button>
          <button
            onClick={() => onNavigate('seller_dashboard')}
            className={`whitespace-nowrap shrink-0 hover:text-[#800000] transition-colors py-1 cursor-pointer ${
              currentView === 'seller_dashboard' ? 'text-[#800000] font-bold border-b-2 border-[#800000]' : ''
            }`}
          >
            Seller Hub
          </button>

          {isModOrAdmin && (
            <button
              onClick={() => onNavigate('moderation')}
              className={`whitespace-nowrap shrink-0 hover:text-[#570018] transition-colors py-1 flex items-center gap-1.5 text-[#800000] font-semibold cursor-pointer ${
                currentView === 'moderation' ? 'border-b-2 border-[#800000]' : ''
              }`}
            >
              <ClipboardCheck className="w-4 h-4 text-[#800000]" />
              Peer Moderation
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => onNavigate('admin')}
              className={`whitespace-nowrap shrink-0 hover:text-[#570018] transition-colors py-1 flex items-center gap-1.5 font-bold cursor-pointer ${
                currentView === 'admin' ? 'border-b-2 border-[#800000] text-[#800000]' : 'text-[#800000]'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-[#800000]" />
              <span>Admin Review Queue</span>
            </button>
          )}
        </nav>

        {/* Zone 3: Primary Action & User Profile Switcher */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#800000] via-[#A01A33] to-[#C02636] hover:from-[#6B1E35] hover:to-[#A01A33] rounded-xl transition-all shadow-sm hover:shadow-md hover:shadow-[#800000]/25 hover:-translate-y-0.5 whitespace-nowrap shrink-0 cursor-pointer active:scale-95 ring-1 ring-amber-400/40 group"
          >
            <Upload className="w-3.5 h-3.5 stroke-[2.5] text-amber-300 group-hover:rotate-6 transition-transform" />
            <span>Upload Notes</span>
          </button>

          {/* Profile Dropdown or Sign In CTA */}
          {currentUser ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1.5 rounded-xl border border-[#E8A5A9]/70 hover:border-[#800000] hover:bg-[#F8EDEF]/50 transition-all cursor-pointer bg-white shadow-2xs hover:shadow-xs"
                title="Account menu and persona switcher"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#800000] to-[#570018] text-white flex items-center justify-center text-xs font-bold font-mono shadow-2xs">
                  {currentUser.name ? currentUser.name.charAt(0) : 'U'}
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-bold text-[#292329] leading-tight truncate max-w-[110px]">
                    {currentUser.name ? currentUser.name.split(' ')[0] : 'User'}
                  </span>
                  <span className="text-[10px] text-[#746B70] leading-tight truncate max-w-[110px]">
                    {currentUser.role === 'admin' ? 'Administrator' : 'Student Seller'}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#746B70]" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-[#F8EDEF] py-2 z-50 text-[#292329]">
                  <div className="px-4 py-2.5 border-b border-[#F8EDEF]">
                    <p className="text-xs font-bold text-[#292329]">{currentUser.name}</p>
                    <p className="text-[11px] text-[#746B70] truncate">{currentUser.email}</p>
                    {currentUser.paymongoAccountId && (
                      <p className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded mt-1 truncate">
                        PayMongo: {currentUser.paymongoAccountId}
                      </p>
                    )}
                    <span className="inline-block mt-1 text-[9px] font-mono uppercase font-bold px-1.5 py-0.5 rounded bg-[#F8EDEF] text-[#800000]">
                      Role: {currentUser.role}
                    </span>
                  </div>

                  <div className="px-2 py-1.5">
                    {onOpenProfile && (
                      <button
                        onClick={() => {
                          onOpenProfile();
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs text-[#292329] hover:bg-[#F8EDEF]/70 rounded-lg flex items-center gap-2 cursor-pointer"
                      >
                        <Wallet className="w-3.5 h-3.5 text-[#800000]" />
                        PayMongo & Profile Settings
                      </button>
                    )}
                    <button
                      onClick={() => {
                        onNavigate('requests');
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-[#292329] hover:bg-[#F8EDEF]/70 rounded-lg flex items-center gap-2 cursor-pointer"
                    >
                      <FileQuestion className="w-3.5 h-3.5 text-[#800000]" />
                      Request a Note
                    </button>
                    <button
                      onClick={() => {
                        onNavigate('buyer_library');
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-[#292329] hover:bg-[#F8EDEF]/70 rounded-lg flex items-center gap-2 cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-[#800000]" />
                      My Purchased Notes
                    </button>
                    <button
                      onClick={() => {
                        onNavigate('seller_dashboard');
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-[#292329] hover:bg-[#F8EDEF]/70 rounded-lg flex items-center gap-2 cursor-pointer"
                    >
                      <FolderLock className="w-3.5 h-3.5 text-[#800000]" />
                      Seller Dashboard & Payouts
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => {
                          onNavigate('admin');
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs text-[#800000] font-bold hover:bg-[#F8EDEF] rounded-lg flex items-center gap-2 cursor-pointer"
                      >
                        <Shield className="w-3.5 h-3.5 text-[#800000]" />
                        Admin Review Queue (Live)
                      </button>
                    )}
                  </div>

                {/* Persona Switcher */}
                <div className="border-t border-[#F8EDEF] px-3 py-2 bg-[#F8EDEF]/40">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] uppercase font-bold text-[#746B70] tracking-wider">
                      Switch Student Persona
                    </span>
                    <ArrowRightLeft className="w-3 h-3 text-[#746B70]" />
                  </div>
                  <div className="space-y-1">
                    {allUsers.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          onSwitchUser(u.id);
                          setShowUserMenu(false);
                        }}
                        className={`w-full text-left px-2 py-1 text-[11px] rounded flex items-center justify-between ${
                          u.id === currentUser.id
                            ? 'bg-[#800000] text-white font-bold'
                            : 'text-[#292329] hover:bg-white'
                        }`}
                      >
                        <span className="truncate">{u.name} ({(u.program || 'Engineering').slice(0, 7)}.)</span>
                        <span className="text-[9px] uppercase font-mono ml-1 opacity-80">{u.role}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-[#F8EDEF] px-2 py-1.5 space-y-1">
                  <button
                    onClick={() => {
                      onOpenAuth();
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-[#746B70] hover:bg-[#F8EDEF] rounded-lg flex items-center gap-2"
                  >
                    <User className="w-3.5 h-3.5 text-[#800000]" />
                    Register New Account (Free)
                  </button>
                  {onSignOut && (
                    <button
                      onClick={() => {
                        onSignOut();
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-rose-700 hover:bg-rose-50 rounded-lg flex items-center gap-2 font-semibold cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-600" />
                      Sign Out (Return to Login)
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenAuth}
              className="px-3.5 py-2 text-xs font-bold text-[#800000] hover:text-[#570018] hover:bg-[#F8EDEF] border border-[#E8A5A9] rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs active:scale-95"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={onOpenAuth}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#800000] to-[#A01A33] hover:from-[#6B1E35] hover:to-[#800000] rounded-xl transition-all shadow-sm cursor-pointer active:scale-95"
            >
              <User className="w-3.5 h-3.5" />
              <span>Free Account</span>
            </button>
          </div>
        )}
        </div>
      </div>

      {/* Mobile nav */}
      <div className="md:hidden border-t border-[#F8EDEF] px-4 py-2 flex items-center justify-around text-xs font-semibold text-[#746B70] bg-white">
        <button
          onClick={() => onNavigate('marketplace')}
          className={`py-1 ${currentView === 'marketplace' ? 'text-[#800000] font-bold' : ''}`}
        >
          Explore
        </button>
        <button
          onClick={() => onNavigate('requests')}
          className={`py-1 flex items-center gap-1 ${currentView === 'requests' ? 'text-[#800000] font-bold' : ''}`}
        >
          <FileQuestion className="w-3.5 h-3.5" />
          <span>Requests</span>
        </button>
        <button
          onClick={() => onNavigate('community')}
          className={`py-1 ${currentView === 'community' ? 'text-[#800000] font-bold' : ''}`}
        >
          Community
        </button>
        {!currentUser && (
          <button
            onClick={onOpenAuth}
            className="py-1 text-[#800000] font-bold flex items-center gap-1"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        )}
        <button
          onClick={() => onNavigate('buyer_library')}
          className={`py-1 ${currentView === 'buyer_library' ? 'text-[#800000] font-bold' : ''}`}
        >
          Library
        </button>
        <button
          onClick={() => onNavigate('tasks')}
          className={`py-1 flex items-center gap-1 ${currentView === 'tasks' ? 'text-[#800000] font-bold' : ''}`}
        >
          <CheckSquare className="w-3.5 h-3.5" />
          <span>Tasks</span>
        </button>
        <button
          onClick={() => onNavigate('seller_dashboard')}
          className={`py-1 ${currentView === 'seller_dashboard' ? 'text-[#800000] font-bold' : ''}`}
        >
          Seller
        </button>
        {isModOrAdmin && (
          <button
            onClick={() => onNavigate('moderation')}
            className={`py-1 ${currentView === 'moderation' ? 'text-[#800000] font-bold' : ''}`}
          >
            Review
          </button>
        )}
      </div>
    </header>
  );
};
