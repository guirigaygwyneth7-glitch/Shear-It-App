import {
  UserProfile,
  NoteListing,
  PaymentTransaction,
  PayoutRequest,
  Conversation,
  DirectMessage,
  CommunityPost,
  CommunityComment,
  ContentReport,
  PlatformConfig,
  EngineeringProgram,
  YearLevel,
  MaterialType,
  PublicationStatus,
  ModeratorReview,
  ModerationAppeal,
} from '../types';

const TOKEN_KEY = 'shear_it_auth_token';

export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setAuthToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeAuthToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

const getHeaders = (): Record<string, string> => {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    headers['x-user-id'] = token;
  }
  return headers;
};

// Philippine Peso Formatter
export const formatPhp = (amount: number): string => {
  return `₱${amount.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const api = {
  // Auth
  async getMe(): Promise<{ user: UserProfile | null }> {
    const token = getAuthToken();
    if (!token) return { user: null };
    try {
      const res = await fetch('/api/auth/me', { headers: getHeaders() });
      if (!res.ok) return { user: null };
      return res.json();
    } catch {
      return { user: null };
    }
  },

  async register(data: {
    name: string;
    email: string;
    password?: string;
    phone: string;
    program: EngineeringProgram;
    yearLevel: YearLevel;
    university?: string;
  }): Promise<{ user: UserProfile; token: string; message: string }> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Registration failed');
    setAuthToken(result.token);
    return result;
  },

  async login(email: string): Promise<{ user: UserProfile; token: string; message: string }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Login failed');
    setAuthToken(result.token);
    return result;
  },

  async updateProfile(data: Partial<UserProfile>): Promise<{ user: UserProfile; message: string }> {
    const res = await fetch('/api/auth/profile', {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Update failed');
    return result;
  },

  async switchUser(userId: string): Promise<{ user: UserProfile; token: string }> {
    const res = await fetch('/api/auth/switch-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to switch user');
    setAuthToken(result.token);
    return result;
  },

  // Notes
  async getNotes(params?: {
    program?: string;
    yearLevel?: string;
    materialType?: string;
    subject?: string;
    topic?: string;
    search?: string;
    minPrice?: number | string;
    maxPrice?: number | string;
    isFree?: boolean;
    sort?: string;
    sellerId?: string;
    status?: string;
  }): Promise<{ notes: NoteListing[]; total: number }> {
    const q = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '') q.append(k, String(v));
      });
    }
    const res = await fetch(`/api/notes?${q.toString()}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to load notes');
    return res.json();
  },

  async getNoteById(id: string): Promise<{ note: NoteListing; userVote: number; isPurchased: boolean }> {
    const res = await fetch(`/api/notes/${id}`, { headers: getHeaders() });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to load note');
    return result;
  },

  async createNote(data: any): Promise<{ note: NoteListing; message: string }> {
    const res = await fetch('/api/notes', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to upload note');
    return result;
  },

  async updateNote(id: string, data: Partial<NoteListing> & { resubmitForReview?: boolean }): Promise<{ note: NoteListing; message: string }> {
    const res = await fetch(`/api/notes/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to update note');
    return result;
  },

  async deleteNote(id: string): Promise<{ message: string }> {
    const res = await fetch(`/api/notes/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to delete note');
    return result;
  },

  async appealNote(id: string, reason: string): Promise<{ appeal: ModerationAppeal; message: string }> {
    const res = await fetch(`/api/notes/${id}/appeal`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ reason }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to submit appeal');
    return result;
  },

  async voteNote(id: string, direction: 1 | -1 | 0): Promise<{ upvotes: number; downvotes: number; netScore: number; userVote: number }> {
    const res = await fetch(`/api/notes/${id}/vote`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ direction }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Voting failed');
    return result;
  },

  async recordNoteView(id: string): Promise<{ viewsCount: number }> {
    const res = await fetch(`/api/notes/${id}/view`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return res.json();
  },

  // Moderation Quality Inspection Queue
  async getModerationQueue(): Promise<{ queue: NoteListing[]; total: number }> {
    const res = await fetch('/api/moderation/queue', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to load moderation inspection queue');
    return res.json();
  },

  async inspectMaterial(id: string, data: {
    decision: PublicationStatus;
    checklist: any;
    moderatorNotes: string;
    requestedCorrections?: string;
  }): Promise<{ review: ModeratorReview; note: NoteListing; message: string }> {
    const res = await fetch(`/api/moderation/inspect/${id}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Inspection submission failed');
    return result;
  },

  async getModerationAppeals(): Promise<{ appeals: ModerationAppeal[] }> {
    const res = await fetch('/api/moderation/appeals', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to load appeals');
    return res.json();
  },

  async resolveAppeal(id: string, action: 'approve' | 'reject', resolutionNotes: string): Promise<any> {
    const res = await fetch(`/api/moderation/appeals/${id}/resolve`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ action, resolutionNotes }),
    });
    return res.json();
  },

  // Checkout & PayMongo
  async createCheckoutIntent(noteId: string, paymentMethod: string): Promise<any> {
    const res = await fetch('/api/checkout/create-intent', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ noteId, paymentMethod }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Checkout initiation failed');
    return result;
  },

  async verifyPayment(transactionId: string, paymentSimulationSuccess = true): Promise<any> {
    const res = await fetch('/api/checkout/verify', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ transactionId, paymentSimulationSuccess }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Payment verification failed');
    return result;
  },

  async downloadNote(noteId: string, txId?: string): Promise<any> {
    const url = txId ? `/api/notes/${noteId}/download?tx=${txId}` : `/api/notes/${noteId}/download`;
    const res = await fetch(url, { headers: getHeaders() });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Download failed');
    return result;
  },

  // Dashboards
  async getPurchases(): Promise<{ purchases: any[] }> {
    const res = await fetch('/api/purchases', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to load purchases');
    return res.json();
  },

  async getSellerDashboard(): Promise<any> {
    const res = await fetch('/api/seller/dashboard', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to load seller metrics');
    return res.json();
  },

  async requestPayout(data: {
    amountPhp: number;
    method: 'GCash' | 'Maya' | 'Bank Transfer';
    accountName: string;
    accountNumber: string;
  }): Promise<{ payout: PayoutRequest; message: string }> {
    const res = await fetch('/api/seller/payout-request', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Payout request failed');
    return result;
  },

  // Community
  async getPosts(program?: string, sort?: string): Promise<{ posts: CommunityPost[] }> {
    const q = new URLSearchParams();
    if (program) q.append('program', program);
    if (sort) q.append('sort', sort);
    const res = await fetch(`/api/community/posts?${q.toString()}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to load community discussions');
    return res.json();
  },

  async createPost(data: {
    title: string;
    content: string;
    program: string;
    yearLevel?: string;
    tags?: string[];
  }): Promise<{ post: CommunityPost; message: string }> {
    const res = await fetch('/api/community/posts', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Post creation failed');
    return result;
  },

  async votePost(id: string, direction: 1 | -1 | 0): Promise<any> {
    const res = await fetch(`/api/community/posts/${id}/vote`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ direction }),
    });
    return res.json();
  },

  async getComments(postId: string): Promise<{ comments: CommunityComment[] }> {
    const res = await fetch(`/api/community/posts/${postId}/comments`, { headers: getHeaders() });
    return res.json();
  },

  async createComment(postId: string, content: string, parentCommentId?: string): Promise<{ comment: CommunityComment }> {
    const res = await fetch(`/api/community/posts/${postId}/comments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ content, parentCommentId }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to post comment');
    return result;
  },

  // Direct Messaging
  async getConversations(): Promise<{ conversations: Conversation[] }> {
    const res = await fetch('/api/messages/conversations', { headers: getHeaders() });
    return res.json();
  },

  async getMessages(convId: string): Promise<{ conversation: Conversation; messages: DirectMessage[] }> {
    const res = await fetch(`/api/messages/conversations/${convId}/messages`, { headers: getHeaders() });
    return res.json();
  },

  async sendMessage(data: {
    recipientId: string;
    content: string;
    noteId?: string;
  }): Promise<{ message: DirectMessage; conversationId: string }> {
    const res = await fetch('/api/messages/send', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to send message');
    return result;
  },

  // Reporting & Copyright
  async submitReport(data: {
    targetType: 'note' | 'post' | 'comment' | 'user';
    targetId: string;
    reason: string;
    details?: string;
  }): Promise<{ report: ContentReport; message: string }> {
    const res = await fetch('/api/reports', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Report submission failed');
    return result;
  },

  async getAdminReports(): Promise<{ reports: ContentReport[] }> {
    const res = await fetch('/api/admin/reports', { headers: getHeaders() });
    if (!res.ok) throw new Error('Unauthorized or failed to load reports');
    return res.json();
  },

  async actionAdminReport(reportId: string, action: 'takedown' | 'dismiss' | 'reinstate', notes?: string): Promise<any> {
    const res = await fetch(`/api/admin/reports/${reportId}/action`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ action, notes }),
    });
    return res.json();
  },

  async getAdminStats(): Promise<any> {
    const res = await fetch('/api/admin/stats', { headers: getHeaders() });
    if (!res.ok) throw new Error('Unauthorized or failed to load admin stats');
    return res.json();
  },

  async updateAdminConfig(config: Partial<PlatformConfig>): Promise<any> {
    const res = await fetch('/api/admin/config', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(config),
    });
    return res.json();
  },
};
