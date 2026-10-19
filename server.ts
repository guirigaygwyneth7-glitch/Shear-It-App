import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Generated preview images
const HERO_IMG = '/src/assets/images/hero_engineering_notes_1792130895707.jpg';
const NOTE_STRUCT_IMG = '/src/assets/images/note_preview_structures_1792130896313.jpg';
const NOTE_CALC_IMG = '/src/assets/images/note_preview_calculus_1792130898199.jpg';
const NOTE_CIRCUITS_IMG = '/src/assets/images/note_preview_circuits_1792130897238.jpg';

interface DBState {
  users: any[];
  notes: any[];
  noteVotes: Record<string, Record<string, number>>;
  postVotes: Record<string, Record<string, number>>;
  commentVotes: Record<string, Record<string, number>>;
  transactions: any[];
  payouts: any[];
  conversations: any[];
  messages: any[];
  posts: any[];
  comments: any[];
  reports: any[];
  moderationReviews: any[];
  appeals: any[];
  config: {
    commissionPercent: number;
    minPayoutPhp: number;
    paymongoSandboxEnabled: boolean;
    autoScanPiiEnabled: boolean;
    requirePeerReviewBeforePublish: boolean;
  };
}

const db: DBState = {
  config: {
    commissionPercent: 10,
    minPayoutPhp: 100,
    paymongoSandboxEnabled: true,
    autoScanPiiEnabled: true,
    requirePeerReviewBeforePublish: true,
  },
  users: [
    {
      id: 'usr_carlo',
      name: 'Carlo Mendoza',
      email: 'carlo.mendoza@up.edu.ph',
      phone: '+63 917 845 2310',
      program: 'Civil Engineering',
      yearLevel: '4th Year',
      university: 'University of the Philippines Diliman',
      bio: 'Structural engineering senior. Sharing verified personal reviewers for CE Board subjects.',
      role: 'student',
      reputationScore: 142,
      createdAt: '2026-01-15T08:30:00Z',
    },
    {
      id: 'usr_bea',
      name: 'Bea Nicole Santos',
      email: 'bea.santos@dlsu.edu.ph',
      phone: '+63 928 554 9921',
      program: 'Mechanical Engineering',
      yearLevel: '3rd Year',
      university: 'De La Salle University Manila',
      bio: 'Dean’s Lister sharing visual summaries of Thermodynamics and Machine Design.',
      role: 'moderator', // Peer Moderator role
      reputationScore: 189,
      createdAt: '2026-02-10T11:20:00Z',
    },
    {
      id: 'usr_mark',
      name: 'Mark Vincent Alcantara',
      email: 'mvalcantara@mymail.mapua.edu.ph',
      phone: '+63 995 123 4872',
      program: 'Electronics Engineering',
      yearLevel: '4th Year',
      university: 'Mapúa University',
      bio: 'Circuit analysis and communication electronics personal reviewers.',
      role: 'student',
      reputationScore: 115,
      createdAt: '2026-02-18T14:10:00Z',
    },
    {
      id: 'usr_gwyneth',
      name: 'Gwyneth Guirigay',
      email: 'guirigay.gwyneth7@gmail.com',
      phone: '+63 919 456 7890',
      program: 'Chemical Engineering',
      yearLevel: '3rd Year',
      university: 'University of Santo Tomas',
      bio: 'ChE student passionate about Unit Operations. Platform Administrator & Lead Peer Moderator.',
      role: 'admin',
      reputationScore: 245,
      createdAt: '2026-01-01T00:00:00Z',
    },
  ],
  notes: [
    {
      id: 'note_01_structural_analysis',
      title: 'Complete Shear & Bending Moment Diagrams + Solved Beam Problems',
      description: 'High-yield reviewer for junior Civil & Mechanical Engineering students. Detailed derivations of shear and moment equilibrium equations, inflection points, and overhanging beams with combined triangular loads. Includes 14 solved Philippine Board Exam problems.',
      price: 75.0,
      pricePhp: 75.0,
      fileUrl: '/src/assets/images/note_preview_structures_1792130896313.jpg',
      sellerId: 'usr_carlo',
      sellerName: 'Carlo Mendoza',
      sellerUniversity: 'UP Diliman',
      sellerProgram: 'Civil Engineering',
      sellerPaymongoAccountId: 'acct_paymongo_carlo_upd',
      approvedStatus: true,
      status: 'published',
      authorizedBuyers: [],
      program: 'Civil Engineering',
      yearLevel: '3rd Year',
      creatorYearLevel: '4th Year',
      subject: 'Theory of Structures',
      courseCode: 'CE 311',
      courseName: 'Structural Theory & Mechanics of Deformable Bodies',
      materialType: 'Reviewer',
      secondaryMaterialTypes: ['Solved Engineering Problems', 'Formula Sheet'],
      topic: 'Shear and Moment Diagrams',
      topics: ['Shear-Moment Diagrams', 'Overhanging Beams', 'Cantilever Beams', 'Triangular Loading', 'Sign Conventions'],
      language: 'English with Tagalog Study Tips',
      academicTerm: '1st Semester AY 2025-2026',
      university: 'University of the Philippines Diliman',
      format: 'PDF',
      previewImages: [
        '/src/assets/images/note_preview_structures_1792130896313.jpg',
        '/src/assets/images/hero_engineering_notes_1792130895707.jpg',
      ],
      fileSizeBytes: 14200000,
      pageCount: 28,
      viewsCount: 384,
      purchasesCount: 52,
      upvotes: 89,
      downvotes: 2,
      netScore: 87,
      createdAt: '2026-02-01T08:00:00Z',
      updatedAt: '2026-02-01T08:00:00Z',
      consents: {
        declaration1_disseminationConsent: true,
        declaration2_dataPrivacyRA10173: true,
        declaration3_qualityInspection: true,
        declaration4_antiInstructorMaterial: true,
        consentedAt: '2026-02-01T08:00:00Z',
        consentVersion: 'v2.1-RA10173',
      },
    },
    {
      id: 'note_02_thermodynamics',
      title: 'Thermodynamics 1 & 2: Complete Formula Sheet, P-V / T-S Diagrams & Steam Tables Guide',
      description: 'Visual reference guide for Mechanical and Chemical Engineering students. Covers Closed/Open Systems, Carnot, Rankine, Otto & Diesel cycles, Mollier diagram interpolation shortcuts, and entropy balance.',
      price: 0.0,
      pricePhp: 0.0,
      fileUrl: '/src/assets/images/note_preview_calculus_1792130898199.jpg',
      sellerId: 'usr_bea',
      sellerName: 'Bea Nicole Santos',
      sellerUniversity: 'De La Salle University Manila',
      sellerProgram: 'Mechanical Engineering',
      sellerPaymongoAccountId: 'acct_paymongo_bea_dlsu',
      approvedStatus: true,
      status: 'published',
      authorizedBuyers: [],
      program: 'Mechanical Engineering',
      yearLevel: '3rd Year',
      creatorYearLevel: '3rd Year',
      subject: 'Thermodynamics',
      courseCode: 'ME 221',
      courseName: 'Engineering Thermodynamics',
      materialType: 'Formula Sheet',
      secondaryMaterialTypes: ['Reviewer', 'Engineering Tables and Reference Sheets'],
      topic: 'Power Cycles & Steam Tables',
      topics: ['Carnot Cycle', 'Rankine Cycle', 'P-V Diagrams', 'T-S Diagrams', 'Steam Table Interpolation', 'Ideal Gas Laws'],
      language: 'English',
      academicTerm: '2nd Term AY 2025-2026',
      university: 'De La Salle University Manila',
      format: 'PDF',
      previewImages: [
        '/src/assets/images/note_preview_calculus_1792130898199.jpg',
      ],
      fileSizeBytes: 8900000,
      pageCount: 16,
      viewsCount: 612,
      purchasesCount: 148,
      upvotes: 114,
      downvotes: 1,
      netScore: 113,
      createdAt: '2026-02-10T11:20:00Z',
      updatedAt: '2026-02-10T11:20:00Z',
      consents: {
        declaration1_disseminationConsent: true,
        declaration2_dataPrivacyRA10173: true,
        declaration3_qualityInspection: true,
        declaration4_antiInstructorMaterial: true,
        consentedAt: '2026-02-10T11:20:00Z',
        consentVersion: 'v2.1-RA10173',
      },
    },
    {
      id: 'note_03_circuits_analysis',
      title: 'AC/DC Circuit Analysis & Network Theorems: Mesh, Nodal & Thevenin Solved Sets',
      description: 'Clean handwritten step-by-step problem sets for EE and ECE students. Comprehensive coverage of Kirchhoff Laws, Superposition, Thevenin-Norton conversions, Maximum Power Transfer, and first-order RL/RC transient responses.',
      price: 65.0,
      pricePhp: 65.0,
      fileUrl: '/src/assets/images/note_preview_circuits_1792130897238.jpg',
      sellerId: 'usr_mark',
      sellerName: 'Mark Vincent Alcantara',
      sellerUniversity: 'Mapúa University',
      sellerProgram: 'Electronics Engineering',
      sellerPaymongoAccountId: 'acct_paymongo_mark_mapua',
      approvedStatus: true,
      status: 'published',
      authorizedBuyers: [],
      program: 'Electrical Engineering',
      yearLevel: '2nd Year',
      creatorYearLevel: '4th Year',
      subject: 'Circuit Analysis',
      courseCode: 'EE 201',
      courseName: 'Electric Circuit Theory',
      materialType: 'Solved Engineering Problems',
      secondaryMaterialTypes: ['Handwritten Notes', 'Reviewer'],
      topic: 'Network Theorems',
      topics: ['Mesh Analysis', 'Nodal Voltage Method', 'Thevenin Theorem', 'Norton Equivalent', 'Kirchhoff Laws'],
      language: 'English',
      academicTerm: '3rd Quarter AY 2025-2026',
      university: 'Mapúa University',
      format: 'PDF',
      previewImages: [
        '/src/assets/images/note_preview_circuits_1792130897238.jpg',
      ],
      fileSizeBytes: 18500000,
      pageCount: 24,
      viewsCount: 290,
      purchasesCount: 39,
      upvotes: 72,
      downvotes: 0,
      netScore: 72,
      createdAt: '2026-02-12T14:10:00Z',
      updatedAt: '2026-02-12T14:10:00Z',
      consents: {
        declaration1_disseminationConsent: true,
        declaration2_dataPrivacyRA10173: true,
        declaration3_qualityInspection: true,
        declaration4_antiInstructorMaterial: true,
        consentedAt: '2026-02-12T14:10:00Z',
        consentVersion: 'v2.1-RA10173',
      },
    },
    {
      id: 'note_04_differential_equations',
      title: 'Differential Equations for Engineers: Laplace Transforms, 2nd Order ODEs & Systems',
      description: 'High-clarity mathematical derivations with engineering applications to mass-spring-damper vibrations and RLC electrical networks. Complete transform pairs table with solved boundary value problems.',
      price: 50.0,
      pricePhp: 50.0,
      fileUrl: '/src/assets/images/note_preview_calculus_1792130898199.jpg',
      sellerId: 'usr_gwyneth',
      sellerName: 'Gwyneth Guirigay',
      sellerUniversity: 'University of Santo Tomas',
      sellerProgram: 'Chemical Engineering',
      sellerPaymongoAccountId: 'acct_paymongo_gwyneth_ust',
      approvedStatus: true,
      status: 'published',
      authorizedBuyers: [],
      program: 'Chemical Engineering',
      yearLevel: '2nd Year',
      creatorYearLevel: '3rd Year',
      subject: 'Differential Equations',
      courseCode: 'MATH 205',
      courseName: 'Differential Equations in Engineering Systems',
      materialType: 'Study Guide',
      secondaryMaterialTypes: ['Formula Sheet', 'Practice Problems with Solutions'],
      topic: 'Laplace Transforms & Vibrations',
      topics: ['Laplace Transforms', 'Second Order ODE', 'Harmonic Oscillators', 'Undetermined Coefficients', 'Initial Value Problems'],
      language: 'English',
      academicTerm: '1st Semester AY 2025-2026',
      university: 'University of Santo Tomas',
      format: 'PDF',
      previewImages: [
        '/src/assets/images/note_preview_calculus_1792130898199.jpg',
        '/src/assets/images/hero_engineering_notes_1792130895707.jpg',
      ],
      fileSizeBytes: 12100000,
      pageCount: 22,
      viewsCount: 440,
      purchasesCount: 68,
      upvotes: 95,
      downvotes: 1,
      netScore: 94,
      createdAt: '2026-02-15T09:30:00Z',
      updatedAt: '2026-02-15T09:30:00Z',
      consents: {
        declaration1_disseminationConsent: true,
        declaration2_dataPrivacyRA10173: true,
        declaration3_qualityInspection: true,
        declaration4_antiInstructorMaterial: true,
        consentedAt: '2026-02-15T09:30:00Z',
        consentVersion: 'v2.1-RA10173',
      },
    },
  ],
  noteVotes: {},
  postVotes: {},
  commentVotes: {},
  transactions: [],
  payouts: [
    {
      id: 'po_01',
      sellerId: 'usr_carlo',
      sellerName: 'Carlo Mendoza',
      amountPhp: 1500.0,
      method: 'GCash',
      accountName: 'Carlo Mendoza',
      accountNumber: '09178452310',
      status: 'approved',
      createdAt: '2026-02-01T12:00:00Z',
    },
  ],
  conversations: [
    {
      id: 'conv_carlo_gwyneth',
      participantIds: ['usr_carlo', 'usr_gwyneth'],
      participantNames: {
        usr_carlo: 'Carlo Mendoza',
        usr_gwyneth: 'Gwyneth Guirigay',
      },
      participantPrograms: {
        usr_carlo: 'Civil Engineering',
        usr_gwyneth: 'Chemical Engineering',
      },
      noteId: 'note_01',
      noteTitle: 'Complete Shear & Bending Moment Diagrams + Solved Beam Problems',
      lastMessage: 'The inflection point calculation in page 14 helped me immensely for our structural mechanics quiz.',
      lastMessageAt: '2026-02-10T14:30:00Z',
    },
  ],
  messages: [
    {
      id: 'msg_01',
      conversationId: 'conv_carlo_gwyneth',
      senderId: 'usr_gwyneth',
      senderName: 'Gwyneth Guirigay',
      content: 'Hi Carlo! Just wanted to ask: does this reviewer cover overhanging beams with combined triangular loads?',
      createdAt: '2026-02-10T08:45:00Z',
      listingId: 'note_01',
      listingTitle: 'Complete Shear & Bending Moment Diagrams + Solved Beam Problems',
      listingPrice: 75.0,
    },
    {
      id: 'msg_02',
      conversationId: 'conv_carlo_gwyneth',
      senderId: 'usr_carlo',
      senderName: 'Carlo Mendoza',
      content: 'Hello Gwyneth! Yes it does! Pages 12 to 16 are devoted specifically to overhangs and trapezoidal/triangular distributions.',
      createdAt: '2026-02-10T08:50:00Z',
    },
  ],
  posts: [
    {
      id: 'post_01',
      authorId: 'usr_carlo',
      authorName: 'Carlo Mendoza',
      authorProgram: 'Civil Engineering',
      authorYear: '4th Year',
      authorUniversity: 'UP Diliman',
      title: 'How to reliably tackle Shear and Moment Diagrams without getting lost in sign conventions',
      content: 'For junior CE and ME students struggling with beam equilibrium: remember the derivative relationships! V = dM/dx and w = -dV/dx. If load is downwards (negative w), slope of V is negative. If shear V is zero, Moment M is at its local maximum or minimum.',
      program: 'Civil Engineering',
      yearLevel: '3rd Year',
      tags: ['Statics', 'Theory of Structures', 'Study Tips'],
      upvotes: 43,
      downvotes: 1,
      netScore: 42,
      commentsCount: 2,
      createdAt: '2026-02-08T10:00:00Z',
      isPinned: true,
    },
  ],
  comments: [
    {
      id: 'com_01',
      postId: 'post_01',
      authorId: 'usr_gwyneth',
      authorName: 'Gwyneth Guirigay',
      authorProgram: 'Chemical Engineering',
      content: 'Area under the load curve = change in shear; area under the shear curve = change in moment! This calculus connection made it click.',
      upvotes: 18,
      downvotes: 0,
      netScore: 18,
      createdAt: '2026-02-08T11:15:00Z',
    },
  ],
  reports: [
    {
      id: 'rep_01',
      targetType: 'note',
      targetId: 'note_test_flagged',
      targetTitle: 'Sample Instructor Handout Slides (Flagged Demo)',
      reporterId: 'usr_carlo',
      reporterName: 'Carlo Mendoza',
      reason: 'instructor_material',
      details: 'This upload appears to be direct PowerPoint slides distributed confidentially by a university professor rather than student-created notes.',
      status: 'pending',
      createdAt: '2026-02-18T09:20:00Z',
    },
  ],
  moderationReviews: [
    {
      id: 'rev_01',
      listingId: 'note_01',
      listingTitle: 'Complete Shear & Bending Moment Diagrams + Solved Beam Problems',
      moderatorId: 'usr_gwyneth',
      moderatorName: 'Gwyneth Guirigay',
      reviewDate: '2026-02-01T09:55:00Z',
      checklist: {
        legibility: true,
        correctClassification: true,
        syllabusRelevance: true,
        organizationCompleteness: true,
        academicUsefulness: true,
        noInstructorMaterial: true,
        noConfidentialExam: true,
        noPersonalStudentPII: true,
        noCopyrightInfringement: true,
        noSpamMalware: true,
      },
      decision: 'published',
      moderatorNotes: 'Exceptional handwriting legibility, clear equilibrium derivations, and zero personal identifying information found.',
    },
  ],
  appeals: [],
};

// Auth helper
function getOptionalAuthUser(req: Request) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const user = db.users.find((u) => u.id === token || u.email === token);
    if (user) return user;
  }
  const customId = req.headers['x-user-id'] as string;
  if (customId) {
    const user = db.users.find((u) => u.id === customId);
    if (user) return user;
  }
  return null;
}

// Auth helper
function getAuthUser(req: Request) {
  return getOptionalAuthUser(req) || db.users[0];
}

// ----------------------------------------------------
// AUTH ENDPOINTS
// ----------------------------------------------------
app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email, phone, program, yearLevel, university } = req.body;
  if (!name || !email || !program || !yearLevel) {
    return res.status(400).json({ error: 'Name, email, program, and year level are required.' });
  }

  if (phone) {
    const cleanPhone = phone.replace(/[\s-]/g, '');
    const isPhPhone = /^(09|\+639)\d{9}$/.test(cleanPhone);
    if (!isPhPhone) {
      return res.status(400).json({
        error: 'Please enter a valid Philippine mobile number (e.g., 0917 123 4567 or +63 917 123 4567).',
      });
    }
  }

  const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'An account with this email address already exists.' });
  }

  const newUser = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone ? phone.trim() : '',
    program,
    yearLevel,
    university: university ? university.trim() : 'Philippine Engineering University',
    bio: '',
    role: 'student',
    reputationScore: 10,
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);
  return res.status(201).json({
    user: newUser,
    token: newUser.id,
    message: 'Registration successful! Free student account created.',
  });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }
  let user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    user = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: email.split('@')[0],
      email: email.trim().toLowerCase(),
      phone: '',
      program: 'Civil Engineering',
      yearLevel: '3rd Year',
      university: 'Philippine Engineering University',
      bio: '',
      role: email.toLowerCase() === 'guirigay.gwyneth7@gmail.com' ? 'admin' : 'student',
      reputationScore: 10,
      createdAt: new Date().toISOString(),
    };
    db.users.push(user);
  }
  return res.json({
    user,
    token: user.id,
    message: 'Welcome back to Shear It!',
  });
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const user = getOptionalAuthUser(req);
  if (!user) {
    return res.status(401).json({ user: null, error: 'Not authenticated' });
  }
  return res.json({ user });
});

app.put('/api/auth/profile', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  const { name, bio, program, yearLevel, university, phone } = req.body;
  if (name) user.name = name;
  if (bio !== undefined) user.bio = bio;
  if (program) user.program = program;
  if (yearLevel) user.yearLevel = yearLevel;
  if (university !== undefined) user.university = university;
  if (phone) user.phone = phone;

  return res.json({ user, message: 'Profile updated successfully.' });
});

app.post('/api/auth/switch-user', (req: Request, res: Response) => {
  const { userId } = req.body;
  const user = db.users.find((u) => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }
  return res.json({ user, token: user.id });
});

// ----------------------------------------------------
// NOTES MARKETPLACE ENDPOINTS
// ----------------------------------------------------
app.get('/api/notes', (req: Request, res: Response) => {
  const {
    program,
    yearLevel,
    materialType,
    subject,
    topic,
    search,
    minPrice,
    maxPrice,
    isFree,
    sort,
    sellerId,
    status,
  } = req.query;

  const currentUser = getAuthUser(req);

  let results = [...db.notes];

  // If sellerId provided, seller can see their own listings regardless of status
  if (sellerId) {
    results = results.filter((n) => n.sellerId === sellerId);
    if (status && status !== 'all') {
      results = results.filter((n) => n.status === status);
    }
  } else if (currentUser.role === 'moderator' || currentUser.role === 'admin') {
    // Moderators/admins can view all statuses if filtering in moderation
    if (status && status !== 'all') {
      results = results.filter((n) => n.status === status);
    } else {
      // Default public marketplace: only published
      results = results.filter((n) => n.status === 'published');
    }
  } else {
    // Standard student public view: only published
    results = results.filter((n) => n.status === 'published');
  }

  if (program && program !== 'All Programs' && program !== 'All') {
    results = results.filter((n) => n.program === program);
  }

  if (yearLevel && yearLevel !== 'All Years' && yearLevel !== 'All') {
    results = results.filter((n) => n.yearLevel === yearLevel);
  }

  if (materialType && materialType !== 'All' && materialType !== 'All Types') {
    results = results.filter(
      (n) =>
        n.materialType === materialType ||
        (n.secondaryMaterialTypes && n.secondaryMaterialTypes.includes(materialType as any))
    );
  }

  if (subject && subject !== 'All') {
    results = results.filter(
      (n) => n.subject && n.subject.toLowerCase() === String(subject).toLowerCase()
    );
  }

  if (topic && topic !== 'All') {
    const t = String(topic).toLowerCase();
    results = results.filter(
      (n) =>
        (n.topic && n.topic.toLowerCase().includes(t)) ||
        (n.topics && n.topics.some((item: string) => item.toLowerCase().includes(t)))
    );
  }

  if (isFree === 'true') {
    results = results.filter((n) => n.pricePhp === 0);
  } else if (isFree === 'false') {
    results = results.filter((n) => n.pricePhp > 0);
  }

  if (minPrice !== undefined && minPrice !== '') {
    const min = parseFloat(String(minPrice));
    if (!isNaN(min)) results = results.filter((n) => n.pricePhp >= min);
  }

  if (maxPrice !== undefined && maxPrice !== '') {
    const max = parseFloat(String(maxPrice));
    if (!isNaN(max)) results = results.filter((n) => n.pricePhp <= max);
  }

  if (search) {
    const q = String(search).toLowerCase();
    results = results.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.description.toLowerCase().includes(q) ||
        (n.subject && n.subject.toLowerCase().includes(q)) ||
        (n.courseCode && n.courseCode.toLowerCase().includes(q)) ||
        (n.courseName && n.courseName.toLowerCase().includes(q)) ||
        (n.materialType && n.materialType.toLowerCase().includes(q)) ||
        (n.topic && n.topic.toLowerCase().includes(q)) ||
        (n.topics && n.topics.some((tag: string) => tag.toLowerCase().includes(q))) ||
        n.sellerName.toLowerCase().includes(q) ||
        (n.university && n.university.toLowerCase().includes(q))
    );
  }

  // Sorting
  switch (sort) {
    case 'top':
      results.sort((a, b) => b.netScore - a.netScore);
      break;
    case 'purchases':
      results.sort((a, b) => b.purchasesCount - a.purchasesCount);
      break;
    case 'views':
      results.sort((a, b) => b.viewsCount - a.viewsCount);
      break;
    case 'price_low':
      results.sort((a, b) => a.pricePhp - b.pricePhp);
      break;
    case 'price_high':
      results.sort((a, b) => b.pricePhp - a.pricePhp);
      break;
    case 'newest':
    default:
      results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      break;
  }

  return res.json({ notes: results, total: results.length });
});

app.get('/api/notes/:id', (req: Request, res: Response) => {
  const note = db.notes.find((n) => n.id === req.params.id);
  if (!note) {
    return res.status(404).json({ error: 'Note listing not found.' });
  }

  const currentUser = getAuthUser(req);
  const userVote = db.noteVotes[note.id]?.[currentUser.id] || 0;
  const isPurchased = db.transactions.some(
    (t) => t.buyerId === currentUser.id && t.noteId === note.id && t.status === 'Paid'
  );

  return res.json({
    note,
    userVote,
    isPurchased: isPurchased || note.pricePhp === 0 || note.sellerId === currentUser.id,
  });
});

// UPLOAD NOTE WITH MANDATORY RA 10173 & QUALITY CONTROL DECLARATIONS
app.post('/api/notes', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  const {
    title,
    description,
    program,
    yearLevel, // Intended audience year level
    subject,
    courseCode,
    courseName,
    materialType,
    secondaryMaterialTypes,
    topic,
    topics,
    language,
    academicTerm,
    university,
    pricePhp,
    format,
    previewImages,
    pageCount,
    consents, // 4 separate required checkboxes
  } = req.body;

  if (!title || !description || !program || !yearLevel || !subject || !materialType) {
    return res.status(400).json({
      error: 'Please provide all required fields: Title, Description, Program, Intended Year Level, Subject, and Material Type.',
    });
  }

  // Verify all 4 required declarations
  if (
    !consents ||
    !consents.declaration1_disseminationConsent ||
    !consents.declaration2_dataPrivacyRA10173 ||
    !consents.declaration3_qualityInspection ||
    !consents.declaration4_antiInstructorMaterial
  ) {
    return res.status(400).json({
      error: 'All four Quality and Data Privacy (RA 10173) declarations must be individually accepted before submission.',
    });
  }

  const price = parseFloat(pricePhp);
  if (isNaN(price) || price < 0) {
    return res.status(400).json({ error: 'Please specify a valid price in PHP (₱0.00 for free notes).' });
  }

  // Previews
  let chosenPreviews = previewImages && previewImages.length > 0 ? previewImages : [];
  if (chosenPreviews.length === 0) {
    if (program.includes('Civil')) chosenPreviews = [NOTE_STRUCT_IMG];
    else if (program.includes('Electrical') || program.includes('Electronics')) chosenPreviews = [NOTE_CIRCUITS_IMG];
    else if (program.includes('Mechanical')) chosenPreviews = [HERO_IMG];
    else chosenPreviews = [NOTE_CALC_IMG];
  }

  // Initial status: submitted_for_review (awaits peer moderator quality inspection)
  const initialStatus = 'submitted_for_review';

  const newNote = {
    id: `note_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    title: title.trim(),
    description: description.trim(),
    program,
    yearLevel, // Intended reader year level
    creatorYearLevel: user.yearLevel, // Uploader's own year level from profile
    subject: subject.trim(),
    courseCode: courseCode ? courseCode.trim().toUpperCase() : 'ENGR',
    courseName: courseName ? courseName.trim() : subject.trim(),
    materialType,
    secondaryMaterialTypes: Array.isArray(secondaryMaterialTypes) ? secondaryMaterialTypes : [],
    topic: topic ? topic.trim() : subject.trim(),
    topics: Array.isArray(topics) && topics.length > 0 ? topics : [topic ? topic.trim() : subject.trim()],
    language: language || 'English',
    academicTerm: academicTerm || '1st Semester',
    university: university || user.university || 'Philippine University',
    format: format || 'PDF',
    previewImages: chosenPreviews,
    fileUrl: `/api/files/download_${Date.now()}.pdf`,
    fileSizeBytes: 3200000,
    pageCount: pageCount ? parseInt(pageCount, 10) : 20,
    pricePhp: price,
    sellerId: user.id,
    sellerName: user.name,
    sellerProgram: user.program,
    sellerUniversity: user.university,
    viewsCount: 0,
    purchasesCount: 0,
    upvotes: 1,
    downvotes: 0,
    netScore: 1,
    status: initialStatus,
    consents: {
      ...consents,
      consentedAt: new Date().toISOString(),
      consentVersion: 'v2.1-RA10173',
      uploaderIpHash: 'sha256-verified-ph-session',
    },
    createdAt: new Date().toISOString(),
  };

  db.notes.unshift(newNote);

  if (!db.noteVotes[newNote.id]) db.noteVotes[newNote.id] = {};
  db.noteVotes[newNote.id][user.id] = 1;

  return res.status(201).json({
    note: newNote,
    message: 'Study material submitted for peer quality and privacy inspection! You will be notified once reviewed.',
  });
});

// Edit listing / resubmit after changes requested
app.put('/api/notes/:id', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  const note = db.notes.find((n) => n.id === req.params.id);
  if (!note) return res.status(404).json({ error: 'Note not found.' });

  if (note.sellerId !== user.id && user.role !== 'admin' && user.role !== 'moderator') {
    return res.status(403).json({ error: 'You are not authorized to edit this listing.' });
  }

  const {
    title,
    description,
    pricePhp,
    subject,
    courseCode,
    courseName,
    materialType,
    secondaryMaterialTypes,
    topic,
    topics,
    language,
    resubmitForReview,
  } = req.body;

  if (title) note.title = title.trim();
  if (description) note.description = description.trim();
  if (subject) note.subject = subject.trim();
  if (courseCode) note.courseCode = courseCode.trim().toUpperCase();
  if (courseName) note.courseName = courseName.trim();
  if (materialType) note.materialType = materialType;
  if (secondaryMaterialTypes) note.secondaryMaterialTypes = secondaryMaterialTypes;
  if (topic) note.topic = topic.trim();
  if (topics) note.topics = topics;
  if (language) note.language = language;
  if (pricePhp !== undefined) {
    const p = parseFloat(pricePhp);
    if (!isNaN(p) && p >= 0) note.pricePhp = p;
  }

  if (resubmitForReview) {
    note.status = 'submitted_for_review';
    note.requestedCorrections = undefined;
    note.updatedAt = new Date().toISOString();
  }

  return res.json({ note, message: 'Listing updated successfully.' });
});

// Seller Unpublish / Delete listing
app.delete('/api/notes/:id', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  const noteIndex = db.notes.findIndex((n) => n.id === req.params.id);
  if (noteIndex === -1) return res.status(404).json({ error: 'Note not found.' });

  const note = db.notes[noteIndex];
  if (note.sellerId !== user.id && user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized.' });
  }

  note.status = 'removed';
  return res.json({ message: 'Note listing removed from marketplace.' });
});

// Seller Appeal Rejection
app.post('/api/notes/:id/appeal', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  const note = db.notes.find((n) => n.id === req.params.id);
  if (!note) return res.status(404).json({ error: 'Note not found.' });

  if (note.sellerId !== user.id) {
    return res.status(403).json({ error: 'Unauthorized.' });
  }

  const { reason } = req.body;
  if (!reason || !reason.trim()) {
    return res.status(400).json({ error: 'Please provide reason for moderation appeal.' });
  }

  const appeal = {
    id: `app_${Date.now()}`,
    listingId: note.id,
    listingTitle: note.title,
    sellerId: user.id,
    sellerName: user.name,
    reason: reason.trim(),
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  db.appeals.push(appeal);
  note.appealNotes = reason.trim();

  return res.status(201).json({
    appeal,
    message: 'Appeal submitted to Lead Administrator. We will review your originality submission promptly.',
  });
});

// Voting
app.post('/api/notes/:id/vote', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  const { direction } = req.body;
  const note = db.notes.find((n) => n.id === req.params.id);

  if (!note) return res.status(404).json({ error: 'Note not found.' });

  if (note.sellerId === user.id) {
    return res.status(400).json({ error: 'You cannot vote on your own uploaded listing.' });
  }

  if (!db.noteVotes[note.id]) db.noteVotes[note.id] = {};

  const currentVote = db.noteVotes[note.id][user.id] || 0;
  let newVote = 0;

  if (direction === currentVote) {
    newVote = 0;
  } else {
    newVote = direction === 1 ? 1 : direction === -1 ? -1 : 0;
  }

  if (currentVote === 1) note.upvotes = Math.max(0, note.upvotes - 1);
  if (currentVote === -1) note.downvotes = Math.max(0, note.downvotes - 1);

  if (newVote === 1) note.upvotes += 1;
  if (newVote === -1) note.downvotes += 1;

  note.netScore = note.upvotes - note.downvotes;
  db.noteVotes[note.id][user.id] = newVote;

  const seller = db.users.find((u) => u.id === note.sellerId);
  if (seller) {
    seller.reputationScore += (newVote - currentVote);
  }

  return res.json({
    upvotes: note.upvotes,
    downvotes: note.downvotes,
    netScore: note.netScore,
    userVote: newVote,
  });
});

app.post('/api/notes/:id/view', (req: Request, res: Response) => {
  const note = db.notes.find((n) => n.id === req.params.id);
  if (note) {
    note.viewsCount += 1;
  }
  return res.json({ viewsCount: note?.viewsCount || 0 });
});

// ----------------------------------------------------
// PEER MODERATOR QUALITY INSPECTION ENDPOINTS
// ----------------------------------------------------
app.get('/api/moderation/queue', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (user.role !== 'moderator' && user.role !== 'admin') {
    return res.status(403).json({ error: 'Moderator access required.' });
  }

  const queue = db.notes.filter(
    (n) => n.status === 'submitted_for_review' || n.status === 'under_quality_inspection'
  );

  return res.json({ queue, total: queue.length });
});

app.post('/api/moderation/inspect/:id', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (user.role !== 'moderator' && user.role !== 'admin') {
    return res.status(403).json({ error: 'Moderator access required.' });
  }

  const { decision, checklist, moderatorNotes, requestedCorrections } = req.body;
  const note = db.notes.find((n) => n.id === req.params.id);
  if (!note) return res.status(404).json({ error: 'Note not found.' });

  // Decision can be: 'published' | 'approved_for_publication' | 'changes_requested' | 'rejected' | 'temporarily_hidden'
  note.status = decision;
  note.moderationFeedback = moderatorNotes;
  if (requestedCorrections) {
    note.requestedCorrections = requestedCorrections;
  }

  const reviewRecord = {
    id: `rev_${Date.now()}`,
    listingId: note.id,
    listingTitle: note.title,
    moderatorId: user.id,
    moderatorName: user.name,
    reviewDate: new Date().toISOString(),
    checklist: checklist || {},
    decision,
    moderatorNotes: moderatorNotes || '',
    requestedCorrections: requestedCorrections || '',
  };

  db.moderationReviews.unshift(reviewRecord);

  return res.json({
    review: reviewRecord,
    note,
    message: `Material status updated to ${decision.replace(/_/g, ' ')}.`,
  });
});

app.get('/api/moderation/appeals', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin only.' });
  }
  return res.json({ appeals: db.appeals });
});

app.post('/api/moderation/appeals/:id/resolve', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin only.' });
  }

  const { action, resolutionNotes } = req.body; // 'approve' | 'reject'
  const appeal = db.appeals.find((a) => a.id === req.params.id);
  if (!appeal) return res.status(404).json({ error: 'Appeal not found.' });

  appeal.status = action === 'approve' ? 'approved' : 'rejected';
  appeal.reviewedAt = new Date().toISOString();
  appeal.resolutionNotes = resolutionNotes;

  const note = db.notes.find((n) => n.id === appeal.listingId);
  if (note && action === 'approve') {
    note.status = 'published';
  }

  return res.json({ appeal, message: `Appeal ${appeal.status}.` });
});

// ----------------------------------------------------
// FIREBASE FIRESTORE SERVER CLIENT (WEBHOOK & PAYOUTS)
// ----------------------------------------------------
let firestoreDb: any = null;
(async () => {
  try {
    const fbConfigPath = path.resolve(__dirname, 'firebase-applet-config.json');
    if (fs.existsSync(fbConfigPath)) {
      const fbConfig = JSON.parse(fs.readFileSync(fbConfigPath, 'utf-8'));
      const { initializeApp } = await import('firebase/app');
      const { getFirestore } = await import('firebase/firestore');
      const serverApp = initializeApp(fbConfig, 'serverApp_' + Date.now());
      firestoreDb = getFirestore(serverApp, fbConfig.firestoreDatabaseId);
      console.log('Server Firebase Firestore connected successfully.');

      // Sync initial verified notes to Firestore if empty
      try {
        const { collection, getDocs, doc, setDoc } = await import('firebase/firestore');
        const notesRef = collection(firestoreDb, 'notes');
        const snap = await getDocs(notesRef);
        if (snap.empty) {
          console.log('Seeding initial verified notes to Firestore...');
          for (const note of db.notes) {
            await setDoc(doc(firestoreDb, 'notes', note.id), note);
          }
          console.log(`Seeded ${db.notes.length} verified notes to Firestore.`);
        }
      } catch (seedErr) {
        console.warn('Notice seeding Firestore from server:', seedErr);
      }
    }
  } catch (err) {
    console.warn('Server Firestore initialization notice:', err);
  }
})();

async function addAuthorizedBuyerToFirestore(noteId: string, buyerUid: string) {
  if (!firestoreDb) return;
  try {
    const { doc, updateDoc, arrayUnion } = await import('firebase/firestore');
    const noteRef = doc(firestoreDb, 'notes', noteId);
    await updateDoc(noteRef, {
      authorizedBuyers: arrayUnion(buyerUid),
      updatedAt: new Date().toISOString(),
    });
    console.log(`[PayMongo Webhook] Added buyer ${buyerUid} to note ${noteId} in Firestore.`);
  } catch (err) {
    console.error(`[PayMongo Webhook] Firestore updateDoc error for note ${noteId}:`, err);
  }
}

// ----------------------------------------------------
// DIRECT PAYMONGO CHECKOUT SESSION & WEBHOOK
// ----------------------------------------------------
app.post('/api/paymongo/create-checkout-session', async (req: Request, res: Response) => {
  try {
    const { noteId, buyerUid, buyerName, buyerEmail } = req.body;
    if (!noteId || !buyerUid) {
      return res.status(400).json({ error: 'noteId and buyerUid are required.' });
    }

    let noteTitle = 'Engineering Reviewer';
    let notePrice = 50;
    let sellerId = '';
    let sellerPaymongoAccountId = '';

    if (firestoreDb) {
      try {
        const { doc, getDoc } = await import('firebase/firestore');
        const noteSnap = await getDoc(doc(firestoreDb, 'notes', noteId));
        if (noteSnap.exists()) {
          const data = noteSnap.data();
          noteTitle = data.title || noteTitle;
          notePrice = Number(data.price ?? data.pricePhp ?? 50);
          sellerId = data.sellerId || '';
          if (sellerId) {
            const userSnap = await getDoc(doc(firestoreDb, 'users', sellerId));
            if (userSnap.exists()) {
              sellerPaymongoAccountId = userSnap.data().paymongoAccountId || '';
            }
          }
        }
      } catch (err) {
        console.warn('Firestore lookup error in create-checkout-session:', err);
      }
    }

    if (!sellerId) {
      const memoryNote = db.notes.find((n) => n.id === noteId);
      if (memoryNote) {
        noteTitle = memoryNote.title;
        notePrice = Number(memoryNote.price ?? memoryNote.pricePhp ?? 50);
        sellerId = memoryNote.sellerId;
      }
    }

    const paymongoKey = process.env.PAYMONGO_SECRET_KEY;
    const amountInCentavos = Math.max(100, Math.round(notePrice * 100));

    if (paymongoKey) {
      const authHeader = 'Basic ' + Buffer.from(paymongoKey + ':').toString('base64');
      const origin = req.headers.origin || `http://localhost:${PORT}`;

      const payload = {
        data: {
          attributes: {
            billing: {
              name: buyerName || 'Engineering Student',
              email: buyerEmail || 'student@university.edu.ph',
            },
            line_items: [
              {
                name: noteTitle,
                amount: amountInCentavos,
                currency: 'PHP',
                quantity: 1,
              },
            ],
            payment_method_types: ['gcash', 'paymaya', 'card', 'grab_pay', 'dob'],
            description: `Payment for note: ${noteTitle}`,
            send_email_receipt: true,
            show_description: true,
            show_line_items: true,
            cancel_url: `${origin}/?status=canceled&noteId=${noteId}`,
            success_url: `${origin}/?status=success&noteId=${noteId}`,
            metadata: {
              buyerUid,
              noteId,
              sellerId,
              paymongoAccountId: sellerPaymongoAccountId || '',
            },
          },
        },
      };

      const response = await fetch('https://api.paymongo.com/v1/checkout_sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authHeader,
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();
      if (!response.ok) {
        console.error('PayMongo API Error:', responseData);
        return res.status(response.status).json(responseData);
      }

      return res.json({
        sessionId: responseData.data.id,
        checkoutUrl: responseData.data.attributes.checkout_url,
        mode: 'live',
      });
    } else {
      // High-fidelity sandbox session
      const sessionId = `cs_sandbox_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      return res.json({
        sessionId,
        mode: 'sandbox',
        noteTitle,
        noteId,
        buyerUid,
        sellerId,
        amountPhp: notePrice,
        sellerPaymongoAccountId: sellerPaymongoAccountId || 'acct_paymongo_student_payout',
        checkoutUrl: `/paymongo-checkout?session_id=${sessionId}&noteId=${noteId}&buyerUid=${buyerUid}&amount=${notePrice}`,
      });
    }
  } catch (err: any) {
    console.error('Error creating checkout session:', err);
    res.status(500).json({ error: err.message || 'Error creating PayMongo checkout session' });
  }
});

// PayMongo Webhook Endpoint
app.post('/api/paymongo-webhook', async (req: Request, res: Response) => {
  try {
    const event = req.body;
    console.log('[PayMongo Webhook Event Received]:', JSON.stringify(event, null, 2));

    const eventType = event?.data?.attributes?.type || event?.type || 'checkout_session.paid';
    const metadata =
      event?.data?.attributes?.data?.attributes?.metadata ||
      event?.data?.attributes?.metadata ||
      event?.metadata ||
      {};

    const noteId = metadata.noteId || event.noteId;
    const buyerUid = metadata.buyerUid || event.buyerUid;

    if (!noteId || !buyerUid) {
      console.warn('[PayMongo Webhook] Missing noteId or buyerUid in metadata:', metadata);
      return res.status(200).json({ received: true, note: 'Skipped - no noteId or buyerUid' });
    }

    await addAuthorizedBuyerToFirestore(noteId, buyerUid);

    // Also update memory store
    const memoryNote = db.notes.find((n) => n.id === noteId);
    if (memoryNote) {
      if (!memoryNote.authorizedBuyers) memoryNote.authorizedBuyers = [];
      if (!memoryNote.authorizedBuyers.includes(buyerUid)) {
        memoryNote.authorizedBuyers.push(buyerUid);
      }
      memoryNote.purchasesCount = (memoryNote.purchasesCount || 0) + 1;
    }

    return res.status(200).json({
      received: true,
      eventType,
      noteId,
      buyerUid,
      status: 'authorizedBuyers_updated',
    });
  } catch (err: any) {
    console.error('[PayMongo Webhook Handler Error]:', err);
    return res.status(500).json({ error: err.message || 'Error processing webhook' });
  }
});

// Direct Simulated Payment Success (Triggers Webhook Flow in Sandbox)
app.post('/api/paymongo/simulate-payment-success', async (req: Request, res: Response) => {
  try {
    const { noteId, buyerUid, sessionId } = req.body;
    if (!noteId || !buyerUid) {
      return res.status(400).json({ error: 'noteId and buyerUid are required' });
    }

    await addAuthorizedBuyerToFirestore(noteId, buyerUid);

    const memoryNote = db.notes.find((n) => n.id === noteId);
    if (memoryNote) {
      if (!memoryNote.authorizedBuyers) memoryNote.authorizedBuyers = [];
      if (!memoryNote.authorizedBuyers.includes(buyerUid)) {
        memoryNote.authorizedBuyers.push(buyerUid);
      }
      memoryNote.purchasesCount = (memoryNote.purchasesCount || 0) + 1;
    }

    return res.json({
      success: true,
      noteId,
      buyerUid,
      sessionId: sessionId || `cs_sim_${Date.now()}`,
      message: 'Payment verified and buyer added to authorizedBuyers in Firestore.',
    });
  } catch (err: any) {
    console.error('Error simulating payment success:', err);
    return res.status(500).json({ error: err.message || 'Simulation error' });
  }
});

// ----------------------------------------------------
// PAYMENT & CHECKOUT FLOW (PHILIPPINE PESOS ₱)
// ----------------------------------------------------
app.post('/api/checkout/create-intent', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  const { noteId, paymentMethod } = req.body;

  const note = db.notes.find((n) => n.id === noteId);
  if (!note) return res.status(404).json({ error: 'Note not found.' });

  if (note.pricePhp === 0) {
    const existingTx = db.transactions.find(
      (t) => t.buyerId === user.id && t.noteId === note.id && t.status === 'Paid'
    );
    if (existingTx) {
      return res.json({ transaction: existingTx, message: 'You already claimed these free notes!' });
    }

    const freeTx = {
      id: `tx_${Date.now()}`,
      referenceNo: `SI-FREE-${Math.floor(100000 + Math.random() * 900000)}`,
      noteId: note.id,
      noteTitle: note.title,
      materialType: note.materialType,
      buyerId: user.id,
      buyerName: user.name,
      sellerId: note.sellerId,
      sellerName: note.sellerName,
      amountPhp: 0.0,
      platformFeePhp: 0.0,
      sellerNetPhp: 0.0,
      paymentMethod: 'Free Claim',
      status: 'Paid',
      createdAt: new Date().toISOString(),
      paidAt: new Date().toISOString(),
      downloadAccessGranted: true,
    };

    db.transactions.push(freeTx);
    note.purchasesCount += 1;

    return res.json({
      transaction: freeTx,
      status: 'Paid',
      message: 'Free notes added to your library! You can download them anytime.',
    });
  }

  if (note.sellerId === user.id) {
    return res.status(400).json({ error: 'You are the author of these notes. You already have full access.' });
  }

  const alreadyPurchased = db.transactions.find(
    (t) => t.buyerId === user.id && t.noteId === note.id && t.status === 'Paid'
  );
  if (alreadyPurchased) {
    return res.json({ transaction: alreadyPurchased, message: 'You already own these notes.' });
  }

  const commissionPercent = db.config.commissionPercent;
  const platformFee = Math.round((note.pricePhp * (commissionPercent / 100)) * 100) / 100;
  const sellerNet = Math.round((note.pricePhp - platformFee) * 100) / 100;

  const refNo = `SI-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;

  const pendingTx = {
    id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    referenceNo: refNo,
    noteId: note.id,
    noteTitle: note.title,
    materialType: note.materialType,
    buyerId: user.id,
    buyerName: user.name,
    sellerId: note.sellerId,
    sellerName: note.sellerName,
    amountPhp: note.pricePhp,
    platformFeePhp: platformFee,
    sellerNetPhp: sellerNet,
    paymentMethod: paymentMethod || 'GCash',
    status: 'Pending',
    createdAt: new Date().toISOString(),
    downloadAccessGranted: false,
  };

  db.transactions.push(pendingTx);

  return res.json({
    transactionId: pendingTx.id,
    referenceNo: pendingTx.referenceNo,
    amountPhp: note.pricePhp,
    noteTitle: note.title,
    sellerName: note.sellerName,
    platformFeePhp: platformFee,
    sellerNetPhp: sellerNet,
    status: 'Pending',
    gateway: {
      provider: 'PayMongo Philippines Sandbox',
      supportedMethods: ['GCash', 'Maya', 'Card', 'BPI / UnionBank Online Banking'],
      testMode: true,
    },
  });
});

app.post('/api/checkout/verify', (req: Request, res: Response) => {
  const { transactionId, paymentSimulationSuccess } = req.body;

  const tx = db.transactions.find((t) => t.id === transactionId);
  if (!tx) return res.status(404).json({ error: 'Transaction not found.' });

  if (tx.status === 'Paid') {
    return res.json({ transaction: tx, message: 'Payment already verified and settled.' });
  }

  if (paymentSimulationSuccess === false) {
    tx.status = 'Failed';
    return res.status(400).json({
      error: 'Payment failed or was canceled by user at payment gateway.',
      transaction: tx,
    });
  }

  tx.status = 'Paid';
  tx.paidAt = new Date().toISOString();
  tx.downloadAccessGranted = true;

  const note = db.notes.find((n) => n.id === tx.noteId);
  if (note) {
    note.purchasesCount += 1;
  }

  return res.json({
    transaction: tx,
    status: 'Paid',
    message: 'Payment verified successfully! Access granted to notes.',
    downloadUrl: `/api/notes/${tx.noteId}/download?tx=${tx.id}`,
  });
});

// Download Route
app.get('/api/notes/:id/download', (req: Request, res: Response) => {
  const note = db.notes.find((n) => n.id === req.params.id);
  if (!note) return res.status(404).json({ error: 'Note not found.' });

  const user = getAuthUser(req);
  const txId = req.query.tx as string;

  let hasAccess = false;

  if (note.pricePhp === 0) hasAccess = true;
  if (note.sellerId === user.id || user.role === 'admin' || user.role === 'moderator') hasAccess = true;

  if (!hasAccess) {
    const verifiedTx = db.transactions.find(
      (t) =>
        t.noteId === note.id &&
        t.status === 'Paid' &&
        (t.buyerId === user.id || (txId && t.id === txId))
    );
    if (verifiedTx) hasAccess = true;
  }

  if (!hasAccess) {
    return res.status(403).json({
      error: 'Access denied. You have not purchased this note yet or payment is not verified.',
    });
  }

  return res.json({
    authorized: true,
    noteTitle: note.title,
    materialType: note.materialType,
    subject: note.subject,
    courseCode: note.courseCode,
    sellerName: note.sellerName,
    format: note.format,
    fileSizeMb: (note.fileSizeBytes / (1024 * 1024)).toFixed(1) + ' MB',
    pageCount: note.pageCount,
    downloadTimestamp: new Date().toISOString(),
    previewImageUrl: note.previewImages[0] || NOTE_STRUCT_IMG,
    documentContent: `Shear It Philippine Academic Notes Archive\nTitle: ${note.title}\nClassification: ${note.materialType} · ${note.subject}\nAuthor: ${note.sellerName} (${note.university})\nRA 10173 Student Data Privacy & Distribution Rights Confirmed.`,
  });
});

// Buyer Purchases
app.get('/api/purchases', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  const myPurchases = db.transactions
    .filter((t) => t.buyerId === user.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const enriched = myPurchases.map((tx) => {
    const note = db.notes.find((n) => n.id === tx.noteId);
    return {
      ...tx,
      noteDetails: note || {
        title: tx.noteTitle,
        materialType: tx.materialType || 'Reviewer',
        previewImages: [NOTE_STRUCT_IMG],
        courseCode: 'ENGR',
        format: 'PDF',
      },
    };
  });

  return res.json({ purchases: enriched });
});

// Seller Dashboard
app.get('/api/seller/dashboard', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  const myListings = db.notes.filter((n) => n.sellerId === user.id);
  const mySales = db.transactions.filter(
    (t) => t.sellerId === user.id && t.status === 'Paid' && t.amountPhp > 0
  );

  const totalGrossPhp = mySales.reduce((acc, s) => acc + s.amountPhp, 0);
  const totalPlatformFeesPhp = mySales.reduce((acc, s) => acc + s.platformFeePhp, 0);
  const totalNetEarningsPhp = mySales.reduce((acc, s) => acc + s.sellerNetPhp, 0);

  const myPayouts = db.payouts.filter((p) => p.sellerId === user.id);
  const withdrawnPhp = myPayouts
    .filter((p) => p.status === 'approved')
    .reduce((acc, p) => acc + p.amountPhp, 0);
  const pendingPayoutPhp = myPayouts
    .filter((p) => p.status === 'pending')
    .reduce((acc, p) => acc + p.amountPhp, 0);

  const availableBalancePhp = Math.max(0, totalNetEarningsPhp - withdrawnPhp - pendingPayoutPhp);
  const totalViews = myListings.reduce((acc, n) => acc + n.viewsCount, 0);
  const totalUpvotes = myListings.reduce((acc, n) => acc + n.upvotes, 0);

  return res.json({
    listings: myListings,
    sales: mySales,
    payouts: myPayouts,
    metrics: {
      totalGrossPhp,
      totalPlatformFeesPhp,
      totalNetEarningsPhp,
      withdrawnPhp,
      pendingPayoutPhp,
      availableBalancePhp,
      totalViews,
      totalUpvotes,
      commissionPercent: db.config.commissionPercent,
      minPayoutPhp: db.config.minPayoutPhp,
    },
  });
});

app.post('/api/seller/payout-request', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  const { amountPhp, method, accountName, accountNumber } = req.body;

  const amt = parseFloat(amountPhp);
  if (isNaN(amt) || amt < db.config.minPayoutPhp) {
    return res.status(400).json({
      error: `Minimum withdrawal amount is ₱${db.config.minPayoutPhp.toFixed(2)}.`,
    });
  }

  if (!accountName || !accountNumber || !method) {
    return res.status(400).json({ error: 'Please provide full account name and account number.' });
  }

  const newPayout = {
    id: `po_${Date.now()}`,
    sellerId: user.id,
    sellerName: user.name,
    amountPhp: amt,
    method,
    accountName: accountName.trim(),
    accountNumber: accountNumber.trim(),
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  db.payouts.push(newPayout);
  return res.status(201).json({
    payout: newPayout,
    message: `Withdrawal request of ₱${amt.toFixed(2)} to ${method} submitted. Processed within 24-48 business hours.`,
  });
});

// Community
app.get('/api/community/posts', (req: Request, res: Response) => {
  const { program, sort } = req.query;
  let results = [...db.posts];

  if (program && program !== 'All Programs' && program !== 'All') {
    results = results.filter((p) => p.program === program || p.program === 'All Programs');
  }

  const currentUser = getAuthUser(req);

  const enriched = results.map((p) => ({
    ...p,
    userVote: db.postVotes[p.id]?.[currentUser.id] || 0,
  }));

  if (sort === 'top') {
    enriched.sort((a, b) => b.netScore - a.netScore);
  } else {
    enriched.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  return res.json({ posts: enriched });
});

app.post('/api/community/posts', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  const { title, content, program, yearLevel, tags } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required.' });
  }

  const newPost = {
    id: `post_${Date.now()}`,
    authorId: user.id,
    authorName: user.name,
    authorProgram: user.program,
    authorYear: user.yearLevel,
    authorUniversity: user.university,
    title: title.trim(),
    content: content.trim(),
    program: program || user.program,
    yearLevel: yearLevel || user.yearLevel,
    tags: Array.isArray(tags) ? tags : ['Study Tips'],
    upvotes: 1,
    downvotes: 0,
    netScore: 1,
    commentsCount: 0,
    createdAt: new Date().toISOString(),
  };

  db.posts.unshift(newPost);
  if (!db.postVotes[newPost.id]) db.postVotes[newPost.id] = {};
  db.postVotes[newPost.id][user.id] = 1;

  return res.status(201).json({ post: newPost, message: 'Discussion post created.' });
});

app.post('/api/community/posts/:id/vote', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  const { direction } = req.body;
  const post = db.posts.find((p) => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found.' });

  if (!db.postVotes[post.id]) db.postVotes[post.id] = {};
  const currentVote = db.postVotes[post.id][user.id] || 0;
  let newVote = 0;

  if (direction === currentVote) {
    newVote = 0;
  } else {
    newVote = direction === 1 ? 1 : direction === -1 ? -1 : 0;
  }

  if (currentVote === 1) post.upvotes = Math.max(0, post.upvotes - 1);
  if (currentVote === -1) post.downvotes = Math.max(0, post.downvotes - 1);

  if (newVote === 1) post.upvotes += 1;
  if (newVote === -1) post.downvotes += 1;

  post.netScore = post.upvotes - post.downvotes;
  db.postVotes[post.id][user.id] = newVote;

  return res.json({
    upvotes: post.upvotes,
    downvotes: post.downvotes,
    netScore: post.netScore,
    userVote: newVote,
  });
});

app.get('/api/community/posts/:id/comments', (req: Request, res: Response) => {
  const comments = db.comments.filter((c) => c.postId === req.params.id);
  const user = getAuthUser(req);
  const enriched = comments.map((c) => ({
    ...c,
    userVote: db.commentVotes[c.id]?.[user.id] || 0,
  }));
  return res.json({ comments: enriched });
});

app.post('/api/community/posts/:id/comments', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  const { content, parentCommentId } = req.body;

  if (!content) return res.status(400).json({ error: 'Comment cannot be empty.' });

  const post = db.posts.find((p) => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found.' });

  const newComment = {
    id: `com_${Date.now()}`,
    postId: post.id,
    authorId: user.id,
    authorName: user.name,
    authorProgram: user.program,
    content: content.trim(),
    upvotes: 1,
    downvotes: 0,
    netScore: 1,
    createdAt: new Date().toISOString(),
    parentCommentId,
  };

  db.comments.push(newComment);
  post.commentsCount += 1;

  return res.status(201).json({ comment: newComment });
});

// Messages
app.get('/api/messages/conversations', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  const convs = db.conversations
    .filter((c) => c.participantIds.includes(user.id))
    .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());

  return res.json({ conversations: convs });
});

app.get('/api/messages/conversations/:id/messages', (req: Request, res: Response) => {
  const conv = db.conversations.find((c) => c.id === req.params.id);
  if (!conv) return res.status(404).json({ error: 'Conversation not found.' });

  const messages = db.messages
    .filter((m) => m.conversationId === conv.id)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  return res.json({ conversation: conv, messages });
});

app.post('/api/messages/send', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  const { recipientId, content, noteId } = req.body;

  if (!recipientId || !content) {
    return res.status(400).json({ error: 'Recipient and message content are required.' });
  }

  const recipient = db.users.find((u) => u.id === recipientId);
  if (!recipient) return res.status(404).json({ error: 'Recipient not found.' });

  let conv = db.conversations.find(
    (c) => c.participantIds.includes(user.id) && c.participantIds.includes(recipientId)
  );

  const note = noteId ? db.notes.find((n) => n.id === noteId) : undefined;

  if (!conv) {
    conv = {
      id: `conv_${Date.now()}`,
      participantIds: [user.id, recipientId],
      participantNames: {
        [user.id]: user.name,
        [recipientId]: recipient.name,
      },
      participantPrograms: {
        [user.id]: user.program,
        [recipientId]: recipient.program,
      },
      noteId: note?.id,
      noteTitle: note?.title,
      lastMessage: content.trim(),
      lastMessageAt: new Date().toISOString(),
    };
    db.conversations.unshift(conv);
  } else {
    conv.lastMessage = content.trim();
    conv.lastMessageAt = new Date().toISOString();
    if (note && !conv.noteId) {
      conv.noteId = note.id;
      conv.noteTitle = note.title;
    }
  }

  const newMsg = {
    id: `msg_${Date.now()}`,
    conversationId: conv.id,
    senderId: user.id,
    senderName: user.name,
    content: content.trim(),
    createdAt: new Date().toISOString(),
    listingId: note?.id,
    listingTitle: note?.title,
    listingPrice: note?.pricePhp,
  };

  db.messages.push(newMsg);
  return res.status(201).json({ message: newMsg, conversationId: conv.id });
});

// Reports & Moderation
app.post('/api/reports', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  const { targetType, targetId, reason, details } = req.body;

  if (!targetType || !targetId || !reason) {
    return res.status(400).json({ error: 'Target and reason are required.' });
  }

  let targetTitle = targetId;
  if (targetType === 'note') {
    const note = db.notes.find((n) => n.id === targetId);
    if (note) targetTitle = note.title;
  }

  const report = {
    id: `rep_${Date.now()}`,
    targetType,
    targetId,
    targetTitle,
    reporterId: user.id,
    reporterName: user.name,
    reason,
    details: details ? details.trim() : '',
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  db.reports.unshift(report);
  return res.status(201).json({
    report,
    message: 'Report submitted to Peer Moderation & Data Privacy Officer.',
  });
});

app.get('/api/admin/reports', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (user.role !== 'admin' && user.role !== 'moderator') {
    return res.status(403).json({ error: 'Administrative privileges required.' });
  }
  return res.json({ reports: db.reports });
});

app.post('/api/admin/reports/:id/action', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (user.role !== 'admin' && user.role !== 'moderator') {
    return res.status(403).json({ error: 'Admin or moderator only.' });
  }

  const { action, notes } = req.body;
  const report = db.reports.find((r) => r.id === req.params.id);
  if (!report) return res.status(404).json({ error: 'Report not found.' });

  report.reviewedAt = new Date().toISOString();
  report.moderatorNotes = notes;

  if (action === 'takedown') {
    report.status = 'takedown_actioned';
    if (report.targetType === 'note') {
      const note = db.notes.find((n) => n.id === report.targetId);
      if (note) note.status = 'removed';
    }
  } else if (action === 'dismiss') {
    report.status = 'dismissed';
  } else if (action === 'reinstate') {
    report.status = 'reviewed';
    if (report.targetType === 'note') {
      const note = db.notes.find((n) => n.id === report.targetId);
      if (note) note.status = 'published';
    }
  }

  return res.json({ report, message: `Report marked as ${report.status}.` });
});

app.get('/api/admin/stats', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (user.role !== 'admin' && user.role !== 'moderator') {
    return res.status(403).json({ error: 'Admin only.' });
  }

  const totalUsers = db.users.length;
  const totalNotes = db.notes.length;
  const publishedNotes = db.notes.filter((n) => n.status === 'published').length;
  const pendingReviews = db.notes.filter((n) => n.status === 'submitted_for_review').length;
  const paidTx = db.transactions.filter((t) => t.status === 'Paid');
  const totalGmvPhp = paidTx.reduce((sum, t) => sum + t.amountPhp, 0);
  const totalCommissionRevenuePhp = paidTx.reduce((sum, t) => sum + t.platformFeePhp, 0);
  const pendingReports = db.reports.filter((r) => r.status === 'pending').length;

  return res.json({
    totalUsers,
    totalNotes,
    publishedNotes,
    pendingReviews,
    totalTransactions: paidTx.length,
    totalGmvPhp,
    totalCommissionRevenuePhp,
    pendingReports,
    commissionPercent: db.config.commissionPercent,
    minPayoutPhp: db.config.minPayoutPhp,
  });
});

app.post('/api/admin/config', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin only.' });
  }

  const { commissionPercent, minPayoutPhp, autoScanPiiEnabled, requirePeerReviewBeforePublish } = req.body;
  if (commissionPercent !== undefined) {
    db.config.commissionPercent = Math.max(0, Math.min(50, parseFloat(commissionPercent)));
  }
  if (minPayoutPhp !== undefined) {
    db.config.minPayoutPhp = Math.max(10, parseFloat(minPayoutPhp));
  }
  if (autoScanPiiEnabled !== undefined) {
    db.config.autoScanPiiEnabled = !!autoScanPiiEnabled;
  }
  if (requirePeerReviewBeforePublish !== undefined) {
    db.config.requirePeerReviewBeforePublish = !!requirePeerReviewBeforePublish;
  }

  return res.json({ config: db.config, message: 'Platform settings updated.' });
});

// ----------------------------------------------------
// VITE INTEGRATION
// ----------------------------------------------------
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Shear It server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
