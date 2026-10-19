import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { ExploreMarketplace } from './pages/ExploreMarketplace';
import { NoteDetailPage } from './pages/NoteDetailPage';
import { CommunityFeed } from './pages/CommunityFeed';
import { DirectMessages } from './pages/DirectMessages';
import { SellerDashboard } from './pages/SellerDashboard';
import { BuyerDashboard } from './pages/BuyerDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { CheckoutModal } from './components/CheckoutModal';
import { DocumentViewerModal } from './components/DocumentViewerModal';
import { UploadModal } from './components/UploadModal';
import { AuthModal } from './components/AuthModal';
import { ReportModal } from './components/ReportModal';
import { ProfileModal } from './components/ProfileModal';
import { ShearItLogo } from './components/ShearItLogo';
import { ModeratorDashboard } from './pages/ModeratorDashboard';
import { TaskTrackerPage } from './pages/TaskTrackerPage';
import { AuthScreen } from './pages/AuthScreen';
import { NoteRequestsPage } from './pages/NoteRequestsPage';
import { UserProfile, NoteListing } from './types';
import { api, setAuthToken, removeAuthToken } from './lib/api';
import {
  auth,
  onAuthStateChanged,
  syncUserProfile,
  subscribeToMarketplaceNotes,
  seedInitialNotesIfEmpty,
  signOutUser,
} from './lib/firebase';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [notes, setNotes] = useState<NoteListing[]>([]);
  const [communityPosts, setCommunityPosts] = useState<any[]>([]);
  const [currentView, setCurrentView] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      if (window.location.pathname === '/admin' || window.location.hash === '#admin') {
        return 'admin';
      }
    }
    return 'marketplace';
  });
  const [selectedNote, setSelectedNote] = useState<NoteListing | null>(null);
  const [exploreProgram, setExploreProgram] = useState<string>('All');
  const [exploreSearch, setExploreSearch] = useState<string>('');

  // Modals
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutNote, setCheckoutNote] = useState<NoteListing | null>(null);
  const [showViewerModal, setShowViewerModal] = useState(false);
  const [viewerNote, setViewerNote] = useState<NoteListing | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportTarget, setReportTarget] = useState<{ id: string; title: string; type: 'note' | 'post' | 'comment' | 'user' }>({
    id: '',
    title: '',
    type: 'note',
  });

  // Direct Message targeting
  const [dmRecipientId, setDmRecipientId] = useState<string | undefined>(undefined);
  const [dmNoteId, setDmNoteId] = useState<string | undefined>(undefined);

  const [loading, setLoading] = useState(true);

  const navigateTo = (view: string) => {
    setCurrentView(view);
    if (typeof window !== 'undefined') {
      if (view === 'admin') {
        window.history.pushState(null, '', '/admin');
      } else {
        window.history.pushState(null, '', '/');
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Sync browser back/forward buttons with views (e.g. /admin)
  useEffect(() => {
    const handlePopState = () => {
      if (window.location.pathname === '/admin' || window.location.hash === '#admin') {
        setCurrentView('admin');
      } else {
        setCurrentView('landing');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Initialize data and real-time Firestore listeners
  useEffect(() => {
    initApp();

    // 1. Seed initial notes in Firestore if collection is empty
    seedInitialNotesIfEmpty();

    // 2. Real-time marketplace feed via Firestore onSnapshot() for notes where approvedStatus == true
    const unsubscribeMarketplace = subscribeToMarketplaceNotes(
      (liveNotes) => {
        setNotes(liveNotes || []);
      },
      (err) => console.warn('Marketplace feed onSnapshot error:', err)
    );

    // 3. Firebase Auth listener for Google / Email sign-in
    const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const profile = await syncUserProfile(fbUser);
          if (profile) setCurrentUser(profile);
        } catch (e) {
          console.warn('Firebase user profile sync notice:', e);
        }
      }
    });

    return () => {
      unsubscribeMarketplace();
      unsubscribeAuth();
    };
  }, []);

  const initApp = async () => {
    setLoading(true);
    try {
      const [userRes, notesRes, postsRes] = await Promise.all([
        api.getMe(),
        api.getNotes(),
        api.getPosts(),
      ]);

      if (userRes && userRes.user) {
        setCurrentUser(userRes.user);
      } else {
        setCurrentUser(null);
      }
      setNotes(notesRes.notes);
      setCommunityPosts(postsRes.posts);

      // Preload available persona users for smooth testing
      setAllUsers([
        {
          uid: 'usr_carlo',
          id: 'usr_carlo',
          name: 'Carlo Mendoza',
          email: 'carlo.mendoza@up.edu.ph',
          phone: '+63 917 845 2310',
          program: 'Civil Engineering',
          yearLevel: '4th Year',
          university: 'University of the Philippines Diliman',
          role: 'student',
          reputationScore: 142,
          createdAt: '2026-01-15T08:30:00Z',
        },
        {
          uid: 'usr_bea',
          id: 'usr_bea',
          name: 'Bea Nicole Santos',
          email: 'bea.santos@dlsu.edu.ph',
          phone: '+63 928 554 9921',
          program: 'Mechanical Engineering',
          yearLevel: '3rd Year',
          university: 'De La Salle University Manila',
          role: 'student',
          reputationScore: 89,
          createdAt: '2026-02-10T11:20:00Z',
        },
        {
          uid: 'usr_mark',
          id: 'usr_mark',
          name: 'Mark Vincent Alcantara',
          email: 'mvalcantara@mymail.mapua.edu.ph',
          phone: '+63 995 123 4872',
          program: 'Electronics Engineering',
          yearLevel: '4th Year',
          university: 'Mapúa University',
          role: 'student',
          reputationScore: 115,
          createdAt: '2026-02-18T14:10:00Z',
        },
        {
          uid: 'usr_gwyneth',
          id: 'usr_gwyneth',
          name: 'Gwyneth Guirigay',
          email: 'guirigay.gwyneth7@gmail.com',
          phone: '+63 919 456 7890',
          program: 'Chemical Engineering',
          yearLevel: '3rd Year',
          university: 'University of Santo Tomas',
          role: 'admin',
          reputationScore: 230,
          createdAt: '2026-01-01T00:00:00Z',
        },
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVoteNote = async (noteId: string, direction: 1 | -1) => {
    try {
      const res = await api.voteNote(noteId, direction);
      setNotes((prev) =>
        prev.map((n) =>
          n.id === noteId
            ? { ...n, netScore: res.netScore, upvotes: res.upvotes, downvotes: res.downvotes }
            : n
        )
      );
      if (selectedNote && selectedNote.id === noteId) {
        setSelectedNote((prev) => (prev ? { ...prev, netScore: res.netScore } : null));
      }
    } catch (err: any) {
      alert(err.message || 'Voting failed');
    }
  };

  const handleVotePost = async (postId: string, direction: 1 | -1) => {
    try {
      const res = await api.votePost(postId, direction);
      setCommunityPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, netScore: res.netScore, upvotes: res.upvotes, downvotes: res.downvotes }
            : p
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectNote = (note: NoteListing) => {
    setSelectedNote(note);
    setCurrentView('note_detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    api.recordNoteView(note.id);
  };

  const handleExplore = (program?: string, search?: string) => {
    if (program) setExploreProgram(program);
    if (search !== undefined) setExploreSearch(search);
    setCurrentView('marketplace');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMessageSeller = (sellerId: string, noteId: string) => {
    setDmRecipientId(sellerId);
    setDmNoteId(noteId);
    setCurrentView('messages');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenReport = (id: string, title: string, type: 'note' | 'post' | 'comment' | 'user' = 'note') => {
    setReportTarget({ id, title, type });
    setShowReportModal(true);
  };

  const handleSwitchUser = async (userId: string) => {
    try {
      const res = await api.switchUser(userId);
      setCurrentUser(res.user);
      initApp();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
    } catch (e) {
      console.warn('Sign out notice:', e);
    }
    removeAuthToken();
    setCurrentUser(null);
    setCurrentView('marketplace');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex flex-col items-center justify-center p-4">
        <div className="animate-pulse">
          <ShearItLogo variant="compact" size="lg" />
        </div>
        <p className="text-xs text-[#746B70] font-medium mt-4">
          Loading Shear It Engineering Platform...
        </p>
      </div>
    );
  }

  // 1. Login and Registration First
  // When users open the website, the first screen must be the Login / Create Account page.
  // After successfully logging in, redirect users to the main marketplace. Do not show the marketplace before login.
  if (!currentUser) {
    return (
      <AuthScreen
        onSuccess={(u) => {
          setCurrentUser(u);
          setAuthToken(u.id || u.uid);
          navigateTo('marketplace');
        }}
        allUsers={allUsers}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Navigation */}
      <Navbar
        currentUser={currentUser}
        currentView={currentView}
        onNavigate={navigateTo}
        onOpenUpload={() => setShowUploadModal(true)}
        onOpenAuth={() => setShowAuthModal(true)}
        onSignOut={handleSignOut}
        onSwitchUser={handleSwitchUser}
        allUsers={allUsers}
      />

      {/* Main Content Router */}
      <main className="flex-1">
        {currentView === 'landing' && (
          <LandingPage
            popularNotes={notes.slice(0, 6)}
            recentNotes={notes.slice().reverse().slice(0, 4)}
            onSelectNote={handleSelectNote}
            onExplore={handleExplore}
            onStartSelling={() => setShowUploadModal(true)}
            onVote={handleVoteNote}
            onNavigateTasks={() => {
              navigateTo('tasks');
            }}
          />
        )}

        {currentView === 'marketplace' && (
          <ExploreMarketplace
            notes={notes}
            currentUser={currentUser}
            selectedProgram={exploreProgram}
            initialSearch={exploreSearch}
            onSelectNote={handleSelectNote}
            onRequestNote={() => navigateTo('requests')}
            onBuyNote={(note) => {
              setCheckoutNote(note);
              setShowCheckoutModal(true);
            }}
            onOpenViewer={(note) => {
              setViewerNote(note);
              setShowViewerModal(true);
            }}
            onMessageSeller={handleMessageSeller}
            onVote={handleVoteNote}
          />
        )}

        {currentView === 'note_detail' && selectedNote && (
          <NoteDetailPage
            note={selectedNote}
            currentUser={currentUser}
            isPurchased={selectedNote.pricePhp === 0 || selectedNote.sellerId === (currentUser.uid || currentUser.id)}
            userVote={0}
            onBack={() => navigateTo('marketplace')}
            onBuy={() => {
              setCheckoutNote(selectedNote);
              setShowCheckoutModal(true);
            }}
            onOpenViewer={() => {
              setViewerNote(selectedNote);
              setShowViewerModal(true);
            }}
            onMessageSeller={handleMessageSeller}
            onReport={(id, title) => handleOpenReport(id, title, 'note')}
            onVote={handleVoteNote}
            relatedNotes={notes.filter(
              (n) => n.id !== selectedNote.id && n.program === selectedNote.program
            ).slice(0, 4)}
            onSelectRelated={handleSelectNote}
          />
        )}

        {currentView === 'community' && (
          <CommunityFeed
            posts={communityPosts}
            currentUser={currentUser}
            onVotePost={handleVotePost}
            onRefresh={initApp}
            onReport={(id, title) => handleOpenReport(id, title, 'post')}
          />
        )}

        {currentView === 'messages' && (
          <DirectMessages
            currentUser={currentUser}
            initialRecipientId={dmRecipientId}
            initialNoteId={dmNoteId}
            notes={notes}
            onSelectNote={handleSelectNote}
          />
        )}

        {currentView === 'seller_dashboard' && (
          <SellerDashboard
            currentUser={currentUser}
            onOpenUpload={() => setShowUploadModal(true)}
            onSelectNote={handleSelectNote}
          />
        )}

        {currentView === 'buyer_library' && (
          <BuyerDashboard
            currentUser={currentUser}
            onOpenViewer={(note) => {
              setViewerNote(note);
              setShowViewerModal(true);
            }}
            onSelectNote={handleSelectNote}
            onExplore={() => handleExplore()}
          />
        )}

        {currentView === 'admin' && (
          <AdminDashboard
            currentUser={currentUser}
            onOpenViewer={(note) => {
              setViewerNote(note);
              setShowViewerModal(true);
            }}
          />
        )}

        {currentView === 'moderation' && (
          <ModeratorDashboard
            currentUser={currentUser}
            onOpenViewer={(note) => {
              setViewerNote(note);
              setShowViewerModal(true);
            }}
          />
        )}

        {currentView === 'tasks' && (
          <TaskTrackerPage
            currentUser={currentUser}
            allUsers={allUsers}
          />
        )}

        {currentView === 'requests' && (
          <NoteRequestsPage
            currentUser={currentUser}
            approvedNotes={notes.filter((n) => n.approvedStatus)}
            onMessageRequester={(recipientId, topicSummary) => {
              handleMessageSeller(recipientId, topicSummary);
            }}
            onBuyNote={(note) => {
              setCheckoutNote(note);
              setShowCheckoutModal(true);
            }}
            onOpenViewer={(note) => {
              setViewerNote(note);
              setShowViewerModal(true);
            }}
          />
        )}
      </main>

      {/* Global Modals */}
      {showCheckoutModal && checkoutNote && (
        <CheckoutModal
          note={checkoutNote}
          currentUser={currentUser}
          isOpen={showCheckoutModal}
          onClose={() => setShowCheckoutModal(false)}
          onSuccess={(updatedNote) => {
            initApp();
            if (updatedNote) {
              setNotes((prev) =>
                prev.map((n) => (n.id === updatedNote.id ? { ...n, ...updatedNote } : n))
              );
              if (selectedNote && selectedNote.id === updatedNote.id) {
                setSelectedNote((prev) => (prev ? { ...prev, ...updatedNote } : null));
              }
            }
          }}
          onOpenViewer={() => {
            if (checkoutNote) {
              setViewerNote(checkoutNote);
              setShowViewerModal(true);
            }
          }}
        />
      )}

      {showViewerModal && viewerNote && (
        <DocumentViewerModal
          note={viewerNote}
          isOpen={showViewerModal}
          onClose={() => setShowViewerModal(false)}
          buyerName={currentUser.name}
        />
      )}

      {showUploadModal && (
        <UploadModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          currentUser={currentUser}
          onSuccess={(newNote) => {
            setNotes((prev) => [newNote, ...prev]);
            setSelectedNote(newNote);
            setCurrentView('note_detail');
          }}
        />
      )}

      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          allUsers={allUsers}
          onSuccess={(u) => {
            setCurrentUser(u);
            initApp();
          }}
        />
      )}

      {showReportModal && (
        <ReportModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          targetId={reportTarget.id}
          targetTitle={reportTarget.title}
          targetType={reportTarget.type}
        />
      )}

      {/* Footer */}
      <Footer onNavigate={(v) => setCurrentView(v)} />
    </div>
  );
}
