import React, { useState, useEffect } from 'react';
import {
  Send,
  MessageSquare,
  Shield,
  FileText,
  User,
  AlertTriangle,
  ExternalLink,
  Ban
} from 'lucide-react';
import { Conversation, DirectMessage, UserProfile, NoteListing } from '../types';
import { api, formatPhp } from '../lib/api';

interface DirectMessagesProps {
  currentUser: UserProfile;
  initialRecipientId?: string;
  initialNoteId?: string;
  notes: NoteListing[];
  onSelectNote: (note: NoteListing) => void;
}

export const DirectMessages: React.FC<DirectMessagesProps> = ({
  currentUser,
  initialRecipientId,
  initialNoteId,
  notes,
  onSelectNote,
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, [currentUser.id]);

  const loadConversations = async () => {
    setLoading(true);
    try {
      const res = await api.getConversations();
      setConversations(res.conversations);

      // If initialRecipientId requested from "Message Seller", find or prepare
      if (initialRecipientId) {
        const found = res.conversations.find((c) =>
          c.participantIds.includes(initialRecipientId)
        );
        if (found) {
          selectConversation(found.id);
        } else {
          // Preload target partner
          selectConversation(res.conversations[0]?.id || null);
        }
      } else if (res.conversations.length > 0 && !activeConvId) {
        selectConversation(res.conversations[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectConversation = async (convId: string | null) => {
    if (!convId) return;
    setActiveConvId(convId);
    try {
      const res = await api.getMessages(convId);
      setActiveConv(res.conversation);
      setMessages(res.messages);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    // Determine partner
    let recipientId = initialRecipientId;
    if (activeConv) {
      recipientId = activeConv.participantIds.find((id) => id !== currentUser.id);
    }

    if (!recipientId) return;

    setSending(true);
    try {
      const res = await api.sendMessage({
        recipientId,
        content: inputMessage,
        noteId: activeConv?.noteId || initialNoteId,
      });

      setMessages((prev) => [...prev, res.message]);
      setInputMessage('');
      setActiveConvId(res.conversationId);
      loadConversations();
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const otherParticipantName = activeConv
    ? Object.entries(activeConv.participantNames).find(([id]) => id !== currentUser.id)?.[1] || 'Peer Student'
    : 'Select a conversation';

  const otherParticipantProgram = activeConv
    ? Object.entries(activeConv.participantPrograms).find(([id]) => id !== currentUser.id)?.[1] || 'Engineering'
    : '';

  const linkedNote = activeConv?.noteId ? notes.find((n) => n.id === activeConv.noteId) : undefined;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm grid grid-cols-1 md:grid-cols-12 min-h-[620px]">
        {/* Left Column: Conversation List (4 cols) */}
        <div className="md:col-span-4 border-r border-slate-200 flex flex-col bg-slate-50/50">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white">
            <h2 className="text-sm font-bold text-slate-900">Direct Messages</h2>
            <span className="text-[10px] font-mono text-slate-400">{conversations.length} active</span>
          </div>

          <div className="overflow-y-auto flex-1 divide-y divide-slate-100">
            {conversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                No messages yet. Click "Message Seller" on any note listing to chat!
              </div>
            ) : (
              conversations.map((c) => {
                const partnerName =
                  Object.entries(c.participantNames).find(([id]) => id !== currentUser.id)?.[1] || 'Student';
                const partnerProg =
                  Object.entries(c.participantPrograms).find(([id]) => id !== currentUser.id)?.[1] || '';
                const isSelected = c.id === activeConvId;

                return (
                  <button
                    key={c.id}
                    onClick={() => selectConversation(c.id)}
                    className={`w-full text-left p-3.5 transition-all flex items-start gap-3 cursor-pointer rounded-xl mx-1.5 my-0.5 ${
                      isSelected
                        ? 'bg-[#F8EDEF] ring-1 ring-inset ring-[#E8A5A9] text-[#800000] shadow-2xs'
                        : 'hover:bg-white text-[#292329]'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#570018] text-white flex items-center justify-center font-bold text-xs shrink-0 font-mono">
                      {partnerName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#292329] truncate">{partnerName}</span>
                        <span className="text-[10px] text-[#746B70] font-mono">
                          {new Date(c.lastMessageAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-[10px] text-[#746B70] truncate">{partnerProg}</div>
                      <p className="text-xs text-[#746B70] truncate mt-1">
                        {c.lastMessage}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Chat History & Input (8 cols) */}
        <div className="md:col-span-8 flex flex-col justify-between bg-white">
          {activeConvId ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#570018] text-white flex items-center justify-center text-xs font-bold font-mono">
                    {otherParticipantName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-[#292329] leading-tight">
                      {otherParticipantName}
                    </h3>
                    <p className="text-[11px] text-[#746B70]">
                      {otherParticipantProgram} · Philippine Engineering Student
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-[#746B70]">
                  <Shield className="w-3.5 h-3.5 text-[#287D4F]" />
                  <span className="text-[11px] text-[#746B70]">Peer verified</span>
                </div>
              </div>

              {/* Linked Note Banner (if discussion revolves around a specific listing) */}
              {linkedNote && (
                <div className="px-4 py-2.5 bg-[#F8EDEF] border-b border-[#E8A5A9]/80 flex items-center justify-between text-xs text-[#570018]">
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-4 h-4 text-[#800000] shrink-0" />
                    <span className="font-semibold truncate">Discussing: {linkedNote.title}</span>
                    <span className="font-mono text-[#800000] font-bold shrink-0">({formatPhp(linkedNote.pricePhp)})</span>
                  </div>
                  <button
                    onClick={() => onSelectNote(linkedNote)}
                    className="text-[11px] font-bold text-[#800000] hover:underline flex items-center gap-1 shrink-0 ml-2 cursor-pointer"
                  >
                    <span>View Listing</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Message Feed */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/40">
                {messages.map((m) => {
                  const isMe = m.senderId === currentUser.id;
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 mb-0.5 px-1 font-mono">
                        <span>{isMe ? 'You' : m.senderName}</span>
                        <span>·</span>
                        <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div
                        className={`max-w-md p-3 rounded-2xl text-xs leading-relaxed ${
                          isMe
                            ? 'bg-[#570018] text-white rounded-br-xs'
                            : 'bg-white text-[#292329] border border-slate-200 rounded-bl-xs shadow-xs'
                        }`}
                      >
                        {m.content}

                        {/* If message attached a listing card */}
                        {m.listingTitle && (
                          <div className={`mt-2 p-2 rounded-lg border text-[11px] ${
                            isMe ? 'bg-[#6B1E35] border-[#800000] text-[#FAF6F0]' : 'bg-[#F8EDEF] border-[#E8A5A9] text-[#292329]'
                          }`}>
                            <span className="font-bold block truncate">{m.listingTitle}</span>
                            {m.listingPrice !== undefined && (
                              <span className="font-mono font-semibold text-[#E8A5A9]">
                                {m.listingPrice === 0 ? 'FREE' : formatPhp(m.listingPrice)}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Message Input Bar */}
              <form onSubmit={handleSendMessage} className="p-3.5 border-t border-slate-200 bg-white flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask the seller about handwriting legibility, topics, or formulas..."
                  className="flex-1 px-4 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800000]/30"
                />
                <button
                  type="submit"
                  disabled={sending || !inputMessage.trim()}
                  className="px-4 py-2.5 bg-[#800000] hover:bg-[#6B1E35] text-white font-bold text-xs rounded-xl transition-colors disabled:opacity-40 flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <MessageSquare className="w-12 h-12 text-slate-300 mb-3" />
              <h3 className="text-sm font-bold text-slate-700">Open a Conversation</h3>
              <p className="text-xs text-slate-500 max-w-xs mt-1">
                Select a message on the left or reach out directly to any student seller from their note listing.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
