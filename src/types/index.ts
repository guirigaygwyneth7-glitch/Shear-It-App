export type EngineeringProgram =
  | 'Civil Engineering'
  | 'Mechanical Engineering'
  | 'Electrical Engineering'
  | 'Electronics Engineering'
  | 'Computer Engineering'
  | 'Chemical Engineering'
  | 'Industrial Engineering'
  | 'Mining Engineering'
  | 'Geological Engineering'
  | 'Sanitary Engineering'
  | 'Environmental Engineering'
  | 'Agricultural and Biosystems Engineering'
  | 'Other Engineering Programs';

export type YearLevel =
  | '1st Year'
  | '2nd Year'
  | '3rd Year'
  | '4th Year'
  | '5th Year'
  | 'Irregular Student'
  | 'Graduate Student';

export type MaterialType =
  | 'Lecture Notes'
  | 'Handwritten Notes'
  | 'Typed Notes'
  | 'Reviewer'
  | 'Formula Sheet'
  | 'Answered Sample Problems'
  | 'Solved Engineering Problems'
  | 'Practice Problems with Solutions'
  | 'Practice Problems Without Solutions'
  | 'Study Guide'
  | 'Subject Summary'
  | 'Concept Explanation'
  | 'Laboratory Study Notes'
  | 'Laboratory Report Guide'
  | 'Engineering Tables and Reference Sheets'
  | 'Design Computation Examples'
  | 'Board Exam Review Materials'
  | 'Flashcards and Quick Review'
  | 'Other Student-Created Study Material';

export type PublicationStatus =
  | 'draft'
  | 'submitted_for_review'
  | 'under_quality_inspection'
  | 'changes_requested'
  | 'approved_for_publication'
  | 'published'
  | 'rejected'
  | 'temporarily_hidden'
  | 'removed';

export interface UploaderConsents {
  declaration1_disseminationConsent: boolean;
  declaration2_dataPrivacyRA10173: boolean;
  declaration3_qualityInspection: boolean;
  declaration4_antiInstructorMaterial: boolean;
  consentedAt: string;
  consentVersion: string;
  uploaderIpHash?: string;
}

export interface ModeratorChecklist {
  legibility: boolean;
  correctClassification: boolean;
  syllabusRelevance: boolean;
  organizationCompleteness: boolean;
  academicUsefulness: boolean;
  noInstructorMaterial: boolean;
  noConfidentialExam: boolean;
  noPersonalStudentPII: boolean; // RA 10173 student data privacy
  noCopyrightInfringement: boolean;
  noSpamMalware: boolean;
}

export interface ModeratorReview {
  id: string;
  listingId: string;
  listingTitle: string;
  moderatorId: string;
  moderatorName: string;
  reviewDate: string;
  checklist: ModeratorChecklist;
  decision: PublicationStatus;
  moderatorNotes: string;
  requestedCorrections?: string;
}

export interface UserProfile {
  uid: string;
  id: string; // compatibility alias
  name: string;
  email: string;
  phone?: string;
  program?: EngineeringProgram | string;
  yearLevel?: YearLevel | string;
  university?: string;
  bio?: string;
  avatarUrl?: string;
  role: 'user' | 'admin' | 'student' | 'moderator';
  paymongoAccountId?: string;
  reputationScore?: number;
  createdAt: string;
}

export interface NoteListing {
  id: string;
  title: string;
  description: string;
  price: number; // in PHP
  pricePhp: number; // compatibility alias
  fileUrl: string;
  sellerId: string; // uploader uid
  approvedStatus: boolean; // default false
  authorizedBuyers: string[]; // array of buyer uids
  program?: EngineeringProgram | string;
  yearLevel?: YearLevel | string;
  creatorYearLevel?: YearLevel | string;
  subject?: string;
  courseCode?: string;
  courseName?: string;
  materialType?: MaterialType | string;
  secondaryMaterialTypes?: MaterialType[];
  topic?: string;
  topics?: string[];
  language?: string;
  academicTerm?: string;
  university?: string;
  format?: 'PDF' | 'JPG' | 'PNG';
  previewImages?: string[];
  fileSizeBytes?: number;
  pageCount?: number;
  sellerName?: string;
  sellerProgram?: EngineeringProgram | string;
  sellerUniversity?: string;
  sellerPaymongoAccountId?: string;
  viewsCount?: number;
  purchasesCount?: number;
  upvotes?: number;
  downvotes?: number;
  netScore?: number;
  status?: PublicationStatus;
  consents?: UploaderConsents;
  moderationHistory?: ModeratorReview[];
  moderationFeedback?: string;
  requestedCorrections?: string;
  appealNotes?: string;
  isFlagged?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface NoteVote {
  userId: string;
  noteId: string;
  direction: 1 | -1; // 1 = upvote, -1 = downvote
}

export interface PaymentTransaction {
  id: string;
  referenceNo: string;
  noteId: string;
  noteTitle: string;
  materialType?: MaterialType;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  amountPhp: number;
  platformFeePhp: number;
  sellerNetPhp: number;
  paymentMethod: 'GCash' | 'Maya' | 'Card' | 'Online Banking' | 'Free Claim';
  status: 'Paid' | 'Pending' | 'Failed' | 'Canceled' | 'Refunded';
  createdAt: string;
  paidAt?: string;
  downloadAccessGranted: boolean;
}

export interface PayoutRequest {
  id: string;
  sellerId: string;
  sellerName: string;
  amountPhp: number;
  method: 'GCash' | 'Maya' | 'Bank Transfer';
  accountName: string;
  accountNumber: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface DirectMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
  listingId?: string;
  listingTitle?: string;
  listingPrice?: number;
  attachmentUrl?: string;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  participantNames: Record<string, string>;
  participantPrograms: Record<string, string>;
  noteId?: string;
  noteTitle?: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCountForMe?: number;
}

export interface CommunityPost {
  id: string;
  authorId: string;
  authorName: string;
  authorProgram: EngineeringProgram;
  authorYear: YearLevel;
  authorUniversity?: string;
  title: string;
  content: string;
  program: EngineeringProgram | 'All Programs';
  yearLevel?: YearLevel | 'All Years';
  tags: string[];
  upvotes: number;
  downvotes: number;
  netScore: number;
  commentsCount: number;
  createdAt: string;
  isPinned?: boolean;
}

export interface CommunityComment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorProgram: EngineeringProgram;
  content: string;
  upvotes: number;
  downvotes: number;
  netScore: number;
  createdAt: string;
  parentCommentId?: string;
}

export interface ContentReport {
  id: string;
  targetType: 'note' | 'post' | 'comment' | 'user';
  targetId: string;
  targetTitle: string;
  reporterId: string;
  reporterName: string;
  reason: 'copyright' | 'instructor_material' | 'confidential_exam' | 'spam' | 'inappropriate' | 'data_privacy_pii';
  details: string;
  status: 'pending' | 'reviewed' | 'takedown_actioned' | 'dismissed';
  createdAt: string;
  reviewedAt?: string;
  moderatorNotes?: string;
}

export interface ModerationAppeal {
  id: string;
  listingId: string;
  listingTitle: string;
  sellerId: string;
  sellerName: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  reviewedAt?: string;
  resolutionNotes?: string;
}

export interface PlatformConfig {
  commissionPercent: number; // default e.g. 10%
  minPayoutPhp: number; // e.g. 100 PHP
  paymongoSandboxEnabled: boolean;
  paymongoPublicKey?: string;
  autoScanPiiEnabled: boolean;
  requirePeerReviewBeforePublish: boolean;
}

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface TaskSubtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: string;
  assigneeId?: string;
  assigneeName?: string;
  assigneeAvatar?: string;
  creatorId: string;
  creatorName: string;
  dueDate?: string;
  tags: string[];
  subtasks: TaskSubtask[];
  commentsCount?: number;
  order?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface TaskActivity {
  id: string;
  taskId: string;
  taskTitle: string;
  userId: string;
  userName: string;
  action: string;
  timestamp: string;
}

export interface RecommendedNoteItem {
  noteId: string;
  noteTitle: string;
  pricePhp: number;
  materialType?: string;
  subject?: string;
  sellerName?: string;
  recommenderName?: string;
  fileUrl?: string;
}

export interface NoteRequest {
  id: string;
  title: string;
  program: EngineeringProgram | string;
  yearLevel: YearLevel | string;
  subject: string;
  topic: string;
  materialType: MaterialType | string;
  description: string;
  preferredFormat: 'PDF' | 'JPG / PNG' | 'Any Format';
  budgetPhp?: number;
  deadline?: string;
  requesterId: string;
  requesterName: string;
  requesterUniversity?: string;
  status: 'open' | 'fulfilled' | 'closed';
  upvotes: number;
  downvotes: number;
  netScore: number;
  userVote?: 1 | -1 | 0;
  recommendedNotes?: RecommendedNoteItem[];
  commentsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface RequestComment {
  id: string;
  requestId: string;
  userId: string;
  userName: string;
  userRole?: string;
  content: string;
  recommendedNote?: RecommendedNoteItem;
  createdAt: string;
}

