import React, { useState } from 'react';
import {
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Pin,
  Send,
  Sparkles,
  Share2,
  AlertTriangle,
  Tag,
  Filter,
  Plus
} from 'lucide-react';
import { CommunityPost, CommunityComment, UserProfile, EngineeringProgram } from '../types';
import { api } from '../lib/api';

interface CommunityFeedProps {
  posts: CommunityPost[];
  currentUser: UserProfile;
  onVotePost: (postId: string, direction: 1 | -1) => void;
  onRefresh: () => void;
  onReport: (postId: string, title: string) => void;
}

const DISCIPLINES: (EngineeringProgram | 'All Programs')[] = [
  'All Programs',
  'Civil Engineering',
  'Mechanical Engineering',
  'Electrical Engineering',
  'Electronics Engineering',
  'Computer Engineering',
  'Chemical Engineering',
  'Industrial Engineering',
];

export const CommunityFeed: React.FC<CommunityFeedProps> = ({
  posts,
  currentUser,
  onVotePost,
  onRefresh,
  onReport,
}) => {
  const [selectedProgram, setSelectedProgram] = useState<string>('All Programs');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newProgram, setNewProgram] = useState<EngineeringProgram>((currentUser.program as EngineeringProgram) || 'Civil Engineering');
  const [newTags, setNewTags] = useState('Study Tips, Midterms');
  const [activeCommentsPostId, setActiveCommentsPostId] = useState<string | null>(null);
  const [commentsMap, setCommentsMap] = useState<Record<string, CommunityComment[]>>({});
  const [commentInput, setCommentInput] = useState('');
  const [submittingPost, setSubmittingPost] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  // Filter posts
  const filteredPosts = posts.filter((p) => {
    if (selectedProgram === 'All Programs') return true;
    return p.program === selectedProgram || p.program === 'All Programs';
  });

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    setSubmittingPost(true);
    try {
      const tagsArray = newTags.split(',').map((t) => t.trim()).filter(Boolean);
      await api.createPost({
        title: newTitle,
        content: newContent,
        program: newProgram,
        tags: tagsArray,
      });
      setNewTitle('');
      setNewContent('');
      setShowCreateModal(false);
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingPost(false);
    }
  };

  const handleToggleComments = async (postId: string) => {
    if (activeCommentsPostId === postId) {
      setActiveCommentsPostId(null);
      return;
    }

    setActiveCommentsPostId(postId);
    try {
      const res = await api.getComments(postId);
      setCommentsMap((prev) => ({ ...prev, [postId]: res.comments }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async (postId: string) => {
    if (!commentInput.trim()) return;
    setSubmittingComment(true);
    try {
      const res = await api.createComment(postId, commentInput);
      setCommentsMap((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] || []), res.comment],
      }));
      setCommentInput('');
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingComment(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-[#F8EDEF] p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#292329] tracking-tight">
            Engineering Student Community
          </h1>
          <p className="text-xs text-[#746B70] mt-1">
            Reddit-style peer discussions, exam prep strategies, formula derivation tips, and recommended reviewers.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#800000] via-[#A01A33] to-[#C02636] hover:from-[#6B1E35] hover:to-[#A01A33] text-white font-bold text-xs rounded-xl transition-all shadow-sm hover:shadow-md hover:shadow-[#800000]/25 hover:-translate-y-0.5 cursor-pointer whitespace-nowrap self-start sm:self-auto active:scale-95 ring-1 ring-amber-300/40 group"
        >
          <Plus className="w-4 h-4 text-amber-200 group-hover:rotate-90 transition-transform" />
          <span>New Discussion Post</span>
        </button>
      </div>

      {/* Program Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        {DISCIPLINES.map((prog) => (
          <button
            key={prog}
            onClick={() => setSelectedProgram(prog)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedProgram === prog
                ? 'bg-gradient-to-r from-[#800000] to-[#A01A33] text-white shadow-xs ring-1 ring-rose-400/30'
                : 'bg-white text-[#746B70] hover:bg-[#F8EDEF] hover:text-[#800000] border border-[#F8EDEF] hover:border-[#E8A5A9]'
            }`}
          >
            {prog}
          </button>
        ))}
      </div>

      {/* Post Creation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-[#570018]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#F8EDEF] space-y-4">
            <h3 className="text-sm font-bold text-[#292329]">Start an Engineering Discussion</h3>

            <form onSubmit={handleCreatePost} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#292329] mb-1">Post Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Tips for solving overhanging beam inflection points in Theory of Structures"
                  className="w-full px-3.5 py-2 text-xs bg-[#FAF9F9] border border-[#E8A5A9]/70 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800000]/25"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#292329] mb-1">Engineering Discipline</label>
                <select
                  value={newProgram}
                  onChange={(e) => setNewProgram(e.target.value as EngineeringProgram)}
                  className="w-full px-3 py-2 text-xs bg-[#FAF9F9] border border-[#E8A5A9]/70 rounded-xl"
                >
                  {DISCIPLINES.filter((d) => d !== 'All Programs').map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#292329] mb-1">Discussion Content *</label>
                <textarea
                  required
                  rows={4}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Share your problem derivation, ask for recommendations, or discuss study strategies..."
                  className="w-full p-3 text-xs bg-[#FAF9F9] border border-[#E8A5A9]/70 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800000]/25"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#292329] mb-1">Tags (Comma separated)</label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="Statics, SFD, Study Tips"
                  className="w-full px-3 py-1.5 text-xs bg-[#FAF9F9] border border-[#E8A5A9]/70 rounded-xl font-mono"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2 text-xs font-semibold text-[#746B70] border border-[#E8A5A9] rounded-xl hover:bg-[#F8EDEF]/50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPost}
                  className="flex-1 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-[#800000] via-[#A01A33] to-[#C02636] hover:from-[#6B1E35] hover:to-[#A01A33] rounded-xl disabled:opacity-50 cursor-pointer shadow-sm hover:shadow-md hover:shadow-[#800000]/25 transition-all active:scale-95 ring-1 ring-white/20"
                >
                  {submittingPost ? 'Posting...' : 'Post to Community'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Discussion Posts Feed */}
      <div className="space-y-4">
        {filteredPosts.map((post) => {
          const comments = commentsMap[post.id] || [];
          const isCommentsOpen = activeCommentsPostId === post.id;

          return (
            <div
              key={post.id}
              className="bg-white rounded-2xl border border-[#F8EDEF] overflow-hidden shadow-xs hover:border-[#E8A5A9] transition-all flex"
            >
              {/* Left Column: Reddit-style Vote Gutter */}
              <div className="w-12 bg-[#F8EDEF]/30 border-r border-[#F8EDEF] flex flex-col items-center py-4 px-1 gap-1 shrink-0">
                <button
                  onClick={() => onVotePost(post.id, 1)}
                  className="text-[#746B70] hover:text-[#EA580C] hover:bg-orange-50 rounded p-1 transition-colors cursor-pointer"
                  title="Upvote post"
                >
                  <ThumbsUp className="w-4 h-4" />
                </button>
                <span className="font-mono text-xs font-bold text-[#800000] tabular-nums">
                  {post.netScore}
                </span>
                <button
                  onClick={() => onVotePost(post.id, -1)}
                  className="text-[#746B70] hover:text-[#4F46E5] hover:bg-indigo-50 rounded p-1 transition-colors cursor-pointer"
                  title="Downvote post"
                >
                  <ThumbsDown className="w-4 h-4" />
                </button>
              </div>

              {/* Right Column: Post Body */}
              <div className="flex-1 p-5 space-y-3">
                {/* Header metadata (Clean unboxed text, no pills) */}
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#746B70] font-mono">
                  {post.isPinned && (
                    <span className="flex items-center gap-1 text-[#800000] font-bold">
                      <Pin className="w-3 h-3 text-[#800000]" /> Pinned
                    </span>
                  )}
                  <span className="font-bold text-[#292329]">{post.authorName}</span>
                  <span>·</span>
                  <span>{post.program.replace(' Engineering', '')}</span>
                  <span>·</span>
                  <span>{post.authorUniversity || 'PH'}</span>
                  <span>·</span>
                  <span className="text-[#746B70]/80">{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-[#292329] leading-snug">
                  {post.title}
                </h3>

                <p className="text-xs text-[#292329]/90 leading-relaxed whitespace-pre-line">
                  {post.content}
                </p>

                {/* Tags (clean unboxed inline text) */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 text-[10px] text-[#800000] font-mono">
                    {post.tags.map((tag) => (
                      <span key={tag} className="hover:underline cursor-pointer">#{tag}</span>
                    ))}
                  </div>
                )}

                {/* Bottom Action strip */}
                <div className="pt-2 border-t border-[#F8EDEF] flex items-center justify-between text-xs text-[#746B70]">
                  <button
                    onClick={() => handleToggleComments(post.id)}
                    className="flex items-center gap-1.5 hover:text-[#800000] font-semibold cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{post.commentsCount} Comments</span>
                  </button>

                  <button
                    onClick={() => onReport(post.id, post.title)}
                    className="hover:text-[#B42318] text-[11px] cursor-pointer"
                  >
                    Report
                  </button>
                </div>

                {/* Collapsible Comments Section */}
                {isCommentsOpen && (
                  <div className="mt-4 pt-4 border-t border-[#F8EDEF] space-y-3 bg-[#FAF9F9] p-4 rounded-xl border border-[#F8EDEF]">
                    <h4 className="text-xs font-bold text-[#292329]">Community Replies</h4>

                    {/* Comment Input */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={commentInput}
                        onChange={(e) => setCommentInput(e.target.value)}
                        placeholder="Add a constructive engineering reply or tip..."
                        className="flex-1 px-3 py-1.5 text-xs bg-white border border-[#E8A5A9]/70 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800000]/25"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddComment(post.id);
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleAddComment(post.id)}
                        disabled={submittingComment}
                        className="px-3.5 py-1.5 bg-[#800000] text-white font-bold text-xs rounded-xl hover:bg-[#6B1E35] cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Comment List */}
                    <div className="space-y-2.5 pt-2">
                      {comments.length === 0 ? (
                        <p className="text-[11px] text-[#746B70] italic">No comments yet. Be the first to reply!</p>
                      ) : (
                        comments.map((com) => (
                          <div key={com.id} className="p-3 bg-white border border-[#F8EDEF] rounded-xl text-xs space-y-1 shadow-2xs">
                            <div className="flex items-center justify-between text-[10px] text-[#746B70] font-mono">
                              <span className="font-bold text-[#800000]">{com.authorName} ({com.authorProgram.slice(0, 7)}.)</span>
                              <span>{new Date(com.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-xs text-[#292329] leading-relaxed">{com.content}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
