import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
  User as FirebaseUser,
} from 'firebase/auth';

export { onAuthStateChanged, sendPasswordResetEmail, sendEmailVerification };
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  onSnapshot,
  arrayUnion,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  NoteListing,
  PaymentTransaction,
  PayoutRequest,
  UserProfile,
  MaterialType,
  EngineeringProgram,
  YearLevel,
  TaskItem,
  TaskStatus,
  NoteRequest,
  RequestComment,
  RecommendedNoteItem,
} from '../types';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// CRITICAL: The app will break without databaseId specified
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection Validation constraint
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase Firestore client is currently offline.');
    }
  }
}
testFirestoreConnection();

// ==========================================
// AUTHENTICATION & USER PROFILE
// ==========================================

export async function signInWithGooglePopup(): Promise<UserProfile> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return await syncUserProfile(result.user);
  } catch (error: any) {
    console.error('Google Sign-In Error:', error);
    throw error;
  }
}

export async function signUpWithEmail(
  email: string,
  pass: string,
  name: string,
  program?: string,
  yearLevel?: string,
  university?: string,
  paymongoAccountId?: string
): Promise<UserProfile> {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, pass);
    if (name) {
      await updateProfile(result.user, { displayName: name });
    }
    try {
      await sendEmailVerification(result.user);
    } catch (verr) {
      console.warn('Email verification send notice:', verr);
    }
    return await syncUserProfile(result.user, {
      name,
      program: program as EngineeringProgram,
      yearLevel: yearLevel as YearLevel,
      university,
      paymongoAccountId: paymongoAccountId || '',
    });
  } catch (error: any) {
    console.error('Email Sign-Up Error:', error);
    throw error;
  }
}

export async function sendPasswordReset(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    console.error('Password Reset Error:', error);
    throw error;
  }
}

export async function triggerEmailVerification(): Promise<void> {
  if (auth.currentUser) {
    await sendEmailVerification(auth.currentUser);
  }
}

export async function signInWithEmail(email: string, pass: string): Promise<UserProfile> {
  try {
    const result = await signInWithEmailAndPassword(auth, email, pass);
    return await syncUserProfile(result.user);
  } catch (error: any) {
    console.error('Email Sign-In Error:', error);
    throw error;
  }
}

export async function signOutUser(): Promise<void> {
  await signOut(auth);
}

export async function syncUserProfile(
  fbUser: FirebaseUser,
  additionalInfo?: {
    name?: string;
    role?: 'user' | 'admin';
    paymongoAccountId?: string;
    program?: EngineeringProgram | string;
    yearLevel?: YearLevel | string;
    university?: string;
  }
): Promise<UserProfile> {
  const userRef = doc(db, 'users', fbUser.uid);
  try {
    const snapshot = await getDoc(userRef);
    const isAdminEmail = fbUser.email === 'guirigay.gwyneth7@gmail.com';

    if (snapshot.exists()) {
      const existingData = snapshot.data() as UserProfile;
      // Ensure admin role for bootstrapped email
      if (isAdminEmail && existingData.role !== 'admin') {
        await updateDoc(userRef, { role: 'admin' });
        existingData.role = 'admin';
      }
      return existingData;
    }

    const newUser: UserProfile = {
      uid: fbUser.uid,
      id: fbUser.uid,
      name:
        additionalInfo?.name ||
        fbUser.displayName ||
        fbUser.email?.split('@')[0] ||
        'Engineering Student',
      email: fbUser.email || '',
      phone: fbUser.phoneNumber || '+63 917 000 0000',
      program: (additionalInfo?.program as EngineeringProgram) || 'Civil Engineering',
      yearLevel: (additionalInfo?.yearLevel as YearLevel) || '3rd Year',
      university: additionalInfo?.university || 'University of the Philippines Diliman',
      avatarUrl: fbUser.photoURL || undefined,
      role: isAdminEmail ? 'admin' : (additionalInfo?.role || 'user'),
      paymongoAccountId: additionalInfo?.paymongoAccountId || '',
      reputationScore: 50,
      createdAt: new Date().toISOString(),
    };

    await setDoc(userRef, newUser);
    return newUser;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `users/${fbUser.uid}`);
  }
}

export async function updateUserProfile(
  uid: string,
  updates: Partial<UserProfile>
): Promise<void> {
  const userRef = doc(db, 'users', uid);
  try {
    await updateDoc(userRef, updates);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `users/${uid}`);
  }
}

// ==========================================
// NOTES MARKETPLACE & REAL-TIME FEED
// ==========================================

/**
 * Real-time marketplace feed via Firestore onSnapshot()
 * Filters strictly where approvedStatus == true
 */
export function subscribeToMarketplaceNotes(
  onUpdate: (notes: NoteListing[]) => void,
  onError?: (err: Error) => void
): () => void {
  const notesRef = collection(db, 'notes');
  const q = query(notesRef, where('approvedStatus', '==', true));

  return onSnapshot(
    q,
    (snapshot) => {
      const notes: NoteListing[] = [];
      snapshot.forEach((d) => {
        const data = d.data() as NoteListing;
        notes.push({
          ...data,
          price: Number(data.price ?? data.pricePhp ?? 0),
          pricePhp: Number(data.price ?? data.pricePhp ?? 0),
          authorizedBuyers: Array.isArray(data.authorizedBuyers) ? data.authorizedBuyers : [],
        });
      });
      // Sort newest first
      notes.sort(
        (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
      onUpdate(notes);
    },
    (err) => {
      console.error('Real-time notes marketplace feed error:', err);
      if (typeof onError === 'function') onError(err);
      handleFirestoreError(err, OperationType.LIST, 'notes');
    }
  );
}

/**
 * Real-time admin stream of unapproved notes via onSnapshot()
 * Filters strictly where approvedStatus == false
 */
export function subscribeToPendingNotes(
  onUpdate: (notes: NoteListing[]) => void,
  onError?: (err: Error) => void
): () => void {
  const notesRef = collection(db, 'notes');
  const q = query(notesRef, where('approvedStatus', '==', false));

  return onSnapshot(
    q,
    (snapshot) => {
      const notes: NoteListing[] = [];
      snapshot.forEach((d) => {
        const data = d.data() as NoteListing;
        notes.push({
          ...data,
          price: Number(data.price ?? data.pricePhp ?? 0),
          pricePhp: Number(data.price ?? data.pricePhp ?? 0),
          authorizedBuyers: Array.isArray(data.authorizedBuyers) ? data.authorizedBuyers : [],
        });
      });
      notes.sort(
        (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
      onUpdate(notes);
    },
    (err) => {
      console.error('Real-time pending notes stream error:', err);
      if (typeof onError === 'function') onError(err);
      handleFirestoreError(err, OperationType.LIST, 'notes');
    }
  );
}

/**
 * Upload note to Firestore with:
 * 'title', 'description', 'price', 'fileUrl', 'sellerId',
 * 'approvedStatus' (defaults to false), and 'authorizedBuyers' (empty array)
 */
export async function uploadNoteToFirestore(
  noteData: {
    title: string;
    description: string;
    price: number;
    fileUrl: string;
    sellerId: string;
    sellerName?: string;
    subject?: string;
    program?: string;
    materialType?: string;
    pageCount?: number;
    previewImages?: string[];
  }
): Promise<NoteListing> {
  const id = `note_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const noteRef = doc(db, 'notes', id);

  const newNote: NoteListing = {
    id,
    title: noteData.title,
    description: noteData.description || '',
    price: Number(noteData.price || 0),
    pricePhp: Number(noteData.price || 0),
    fileUrl: noteData.fileUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    sellerId: noteData.sellerId,
    sellerName: noteData.sellerName || 'Engineering Student',
    approvedStatus: false, // Default false until admin reviews
    authorizedBuyers: [], // Empty array initially
    subject: noteData.subject || 'Engineering Subject',
    program: noteData.program || 'Civil Engineering',
    materialType: noteData.materialType || 'Reviewer',
    previewImages: noteData.previewImages || [],
    pageCount: noteData.pageCount || 10,
    viewsCount: 0,
    purchasesCount: 0,
    upvotes: 0,
    downvotes: 0,
    netScore: 0,
    status: 'under_quality_inspection',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    await setDoc(noteRef, newNote);
    return newNote;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `notes/${id}`);
  }
}

/**
 * Admin action: toggle approvedStatus to true/false in Firestore
 */
export async function toggleNoteApproval(
  noteId: string,
  approvedStatus: boolean
): Promise<void> {
  const noteRef = doc(db, 'notes', noteId);
  try {
    await updateDoc(noteRef, {
      approvedStatus,
      status: approvedStatus ? 'published' : 'under_quality_inspection',
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `notes/${noteId}`);
  }
}

export async function deleteNoteFromFirestore(noteId: string): Promise<void> {
  const noteRef = doc(db, 'notes', noteId);
  try {
    await deleteDoc(noteRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `notes/${noteId}`);
  }
}

// ==========================================
// DIRECT PAYMONGO CHECKOUT & PAYOUT INTEGRATION
// ==========================================

export async function createPayMongoCheckoutSession(params: {
  noteId: string;
  buyerUid: string;
  buyerName?: string;
  buyerEmail?: string;
}): Promise<{
  sessionId: string;
  checkoutUrl: string;
  mode: 'live' | 'sandbox';
  amountPhp?: number;
  noteTitle?: string;
  sellerPaymongoAccountId?: string;
}> {
  const response = await fetch('/api/paymongo/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to create PayMongo checkout session');
  }

  return await response.json();
}

export async function simulatePayMongoPaymentSuccess(params: {
  noteId: string;
  buyerUid: string;
  sessionId?: string;
}): Promise<{ success: boolean; message: string }> {
  const response = await fetch('/api/paymongo/simulate-payment-success', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to verify simulated payment');
  }

  return await response.json();
}

// Seed initial marketplace notes if collection is empty
export async function seedInitialNotesIfEmpty(): Promise<void> {
  try {
    const notesRef = collection(db, 'notes');
    const snap = await getDocs(query(notesRef, limit(1)));
    if (!snap.empty) return; // already seeded

    const SEED_NOTES: NoteListing[] = [
      {
        id: 'note_fea_001',
        title: 'Reinforced Concrete Beam & Shear Wall NSCP 2015 Reviewer',
        description: 'Comprehensive handwritten problem set and derivations for shear stirrup spacing, flexural moment capacities, and NSCP 2015 seismic detailing code equations.',
        price: 75,
        pricePhp: 75,
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        sellerId: 'usr_carlo',
        sellerName: 'Carlo Mendoza',
        approvedStatus: true,
        authorizedBuyers: ['usr_gwyneth'],
        subject: 'Reinforced Concrete Design',
        program: 'Civil Engineering',
        materialType: 'Solved Problem Set',
        pageCount: 32,
        previewImages: ['/src/assets/images/note_preview_structures_1792130896313.jpg'],
        viewsCount: 240,
        purchasesCount: 18,
        upvotes: 42,
        downvotes: 1,
        netScore: 41,
        status: 'published',
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'note_thermo_002',
        title: 'Thermodynamics Pure Substance Steam Table Quick Formula Guide',
        description: 'Instant lookup formulas for quality x, enthalpy h, entropy s, and interpolation shortcuts for Rankine cycle and reheat turbine calculations.',
        price: 50,
        pricePhp: 50,
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        sellerId: 'usr_bea',
        sellerName: 'Bea Nicole Santos',
        approvedStatus: true,
        authorizedBuyers: [],
        subject: 'Thermodynamics 1 & 2',
        program: 'Mechanical Engineering',
        materialType: 'Formula Sheet',
        pageCount: 16,
        previewImages: ['/src/assets/images/note_preview_calculus_1792130898199.jpg'],
        viewsCount: 180,
        purchasesCount: 12,
        upvotes: 35,
        downvotes: 0,
        netScore: 35,
        status: 'published',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'note_circuits_003',
        title: 'BJT & MOSFET Small-Signal Model Transconductance Equations',
        description: 'Step-by-step small-signal AC equivalence, hybrid-pi model, input impedance Zin, and output impedance Zout derivations for ECE board exam prep.',
        price: 65,
        pricePhp: 65,
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        sellerId: 'usr_mark',
        sellerName: 'Mark Vincent Alcantara',
        approvedStatus: true,
        authorizedBuyers: ['usr_carlo'],
        subject: 'Electronics 1 & Circuit Analysis',
        program: 'Electronics Engineering',
        materialType: 'Reviewer',
        pageCount: 24,
        previewImages: ['/src/assets/images/note_preview_circuits_1792130897238.jpg'],
        viewsCount: 145,
        purchasesCount: 9,
        upvotes: 28,
        downvotes: 0,
        netScore: 28,
        status: 'published',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'note_geotech_004',
        title: 'Soil Mechanics Direct Shear & Mohr-Coulomb Triaxial Solved Problems',
        description: 'Pending Peer Review: 15 full board-style solved problems calculating pore water pressure, effective stress sigma prime, and soil cohesion c.',
        price: 80,
        pricePhp: 80,
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        sellerId: 'usr_carlo',
        sellerName: 'Carlo Mendoza',
        approvedStatus: false, // Under admin inspection
        authorizedBuyers: [],
        subject: 'Geotechnical Engineering',
        program: 'Civil Engineering',
        materialType: 'Practice Exam',
        pageCount: 28,
        previewImages: ['/src/assets/images/note_preview_structures_1792130896313.jpg'],
        viewsCount: 12,
        purchasesCount: 0,
        upvotes: 3,
        downvotes: 0,
        netScore: 3,
        status: 'under_quality_inspection',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    for (const note of SEED_NOTES) {
      await setDoc(doc(db, 'notes', note.id), note);
    }
    console.log('Seeded initial marketplace notes in Firestore.');
  } catch (err) {
    console.warn('Initial notes seeding error:', err);
  }
}

// ==========================================
// BUYER DASHBOARD & ORDERS
// ==========================================
export async function getOrdersFromFirestore(buyerId: string): Promise<any[]> {
  try {
    const notesRef = collection(db, 'notes');
    const q = query(notesRef, where('authorizedBuyers', 'array-contains', buyerId));
    const snap = await getDocs(q);
    const orders: any[] = [];
    snap.forEach((d) => {
      const data = d.data() as NoteListing;
      orders.push({
        id: `ord_${d.id}_${buyerId.slice(-4)}`,
        referenceNo: `SI-${d.id.slice(-6).toUpperCase()}`,
        noteId: d.id,
        noteTitle: data.title,
        materialType: data.materialType || 'Reviewer',
        sellerId: data.sellerId,
        sellerName: data.sellerName || 'Student Uploader',
        amountPhp: Number(data.price ?? data.pricePhp ?? 0),
        status: 'Paid',
        paymentMethod: 'PayMongo Direct Payout',
        purchasedAt: data.updatedAt || data.createdAt || new Date().toISOString(),
        downloadUrl: data.fileUrl,
      });
    });
    return orders;
  } catch (err) {
    console.warn('Firestore getOrders error:', err);
    return [];
  }
}

// ==========================================
// SELLER DASHBOARD & PAYOUTS
// ==========================================
export async function getSellerDashboardFromFirestore(sellerId: string): Promise<{
  listings: any[];
  sales: any[];
  payouts: any[];
}> {
  try {
    const notesRef = collection(db, 'notes');
    const q = query(notesRef, where('sellerId', '==', sellerId));
    const snap = await getDocs(q);
    const listings: any[] = [];
    const sales: any[] = [];

    snap.forEach((d) => {
      const data = d.data() as NoteListing;
      listings.push(data);
      if (Array.isArray(data.authorizedBuyers) && data.authorizedBuyers.length > 0) {
        data.authorizedBuyers.forEach((buyerUid: string, idx: number) => {
          const price = Number(data.price ?? data.pricePhp ?? 0);
          const fee = Math.round(price * 0.1 * 100) / 100;
          sales.push({
            id: `sale_${d.id}_${buyerUid.slice(-4)}_${idx}`,
            noteId: d.id,
            noteTitle: data.title,
            buyerId: buyerUid,
            buyerName: `Student (${buyerUid.slice(-4)})`,
            amountPhp: price,
            platformFeePhp: fee,
            sellerNetPhp: price - fee,
            paymentMethod: 'PayMongo',
            purchasedAt: data.updatedAt || new Date().toISOString(),
          });
        });
      }
    });

    return { listings, sales, payouts: [] };
  } catch (err) {
    console.warn('Firestore getSellerDashboard error:', err);
    return { listings: [], sales: [], payouts: [] };
  }
}

export async function requestPayoutInFirestore(
  paramsOrSellerId: any,
  amountPhp?: number,
  method?: string,
  accountNumber?: string,
  accountName?: string
): Promise<any> {
  const payout =
    typeof paramsOrSellerId === 'object'
      ? paramsOrSellerId
      : {
          id: `po_${Date.now()}`,
          sellerId: paramsOrSellerId,
          amountPhp: amountPhp || 0,
          method: method || 'GCash',
          accountNumber: accountNumber || '',
          accountName: accountName || '',
          status: 'pending',
          requestedAt: new Date().toISOString(),
        };
  return payout;
}

// ==========================================
// COLLABORATIVE TASKS (FOR TASK TRACKER PAGE)
// ==========================================
export function subscribeToTasks(
  onUpdate: (tasks: TaskItem[]) => void,
  onError?: (err: Error) => void
): () => void {
  const tasksRef = collection(db, 'tasks');
  return onSnapshot(
    tasksRef,
    (snapshot) => {
      const tasks: TaskItem[] = [];
      snapshot.forEach((d) => {
        tasks.push({ ...(d.data() as TaskItem), id: d.id });
      });
      tasks.sort(
        (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
      onUpdate(tasks);
    },
    (err) => {
      console.warn('Tasks subscription notice:', err);
      if (typeof onError === 'function') onError(err);
    }
  );
}

export async function createTaskInFirestore(task: Partial<TaskItem>): Promise<TaskItem> {
  const id = `task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const fullTask: TaskItem = {
    id,
    title: task.title || 'New Task',
    description: task.description || '',
    status: task.status || 'todo',
    priority: task.priority || 'medium',
    category: task.category || 'General',
    assigneeId: task.assigneeId || 'usr_carlo',
    assigneeName: task.assigneeName || 'Carlo Mendoza',
    creatorId: task.creatorId || 'usr_carlo',
    creatorName: task.creatorName || 'Carlo Mendoza',
    dueDate: task.dueDate || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    tags: task.tags || [],
    subtasks: task.subtasks || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, 'tasks', id), fullTask);
  } catch (e) {
    console.warn('createTaskInFirestore notice:', e);
  }
  return fullTask;
}

export async function updateTaskInFirestore(taskId: string, updates: Partial<TaskItem>): Promise<void> {
  try {
    await updateDoc(doc(db, 'tasks', taskId), {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (e) {
    console.warn('updateTaskInFirestore notice:', e);
  }
}

export async function deleteTaskInFirestore(taskId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'tasks', taskId));
  } catch (e) {
    console.warn('deleteTaskInFirestore notice:', e);
  }
}

export async function seedInitialTasksIfEmpty(): Promise<void> {
  try {
    const snap = await getDocs(query(collection(db, 'tasks'), limit(1)));
    if (!snap.empty) return;

    const initialTasks: TaskItem[] = [
      {
        id: 'task_001',
        title: 'NSCP 2015 Beam Shear Derivations Review',
        description: 'Double check stirrup spacing calculations on handwritten problem set #4 before admin review.',
        status: 'in_progress',
        priority: 'high',
        category: 'Civil Engineering',
        assigneeId: 'usr_carlo',
        assigneeName: 'Carlo Mendoza',
        creatorId: 'usr_gwyneth',
        creatorName: 'Gwyneth Guirigay',
        dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        tags: ['NSCP 2015', 'Shear', 'Reviewer'],
        subtasks: [
          { id: 'sub_1', title: 'Cross-reference formula 406.3 with NSCP 2015', completed: true },
          { id: 'sub_2', title: 'Add step-by-step equilibrium diagram', completed: false }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'task_002',
        title: 'Review ECE Transconductance Notes',
        description: 'Verify hybrid-pi AC small-signal models for Mapua and UP reviewers.',
        status: 'todo',
        priority: 'medium',
        category: 'Electronics Engineering',
        assigneeId: 'usr_mark',
        assigneeName: 'Mark Vincent Alcantara',
        creatorId: 'usr_carlo',
        creatorName: 'Carlo Mendoza',
        dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
        tags: ['Circuits', 'Small-Signal', 'ECE'],
        subtasks: [
          { id: 'sub_3', title: 'BJT common-emitter equation proof', completed: true }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ];

    for (const t of initialTasks) {
      await setDoc(doc(db, 'tasks', t.id), t);
    }
  } catch (e) {
    console.warn('seedInitialTasks notice:', e);
  }
}

// ==========================================
// REQUEST A NOTE FEATURE (FIRESTORE REAL-TIME)
// ==========================================

export async function createNoteRequest(data: {
  title: string;
  program: string;
  yearLevel: string;
  subject: string;
  topic: string;
  materialType: string;
  description: string;
  preferredFormat: 'PDF' | 'JPG / PNG' | 'Any Format';
  budgetPhp?: number;
  deadline?: string;
  requesterId: string;
  requesterName: string;
  requesterUniversity?: string;
}): Promise<NoteRequest> {
  const id = `req_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const requestDoc: NoteRequest = {
    id,
    title: data.title.trim(),
    program: data.program,
    yearLevel: data.yearLevel,
    subject: data.subject.trim(),
    topic: data.topic.trim(),
    materialType: data.materialType,
    description: data.description.trim(),
    preferredFormat: data.preferredFormat || 'PDF',
    budgetPhp: data.budgetPhp ? Number(data.budgetPhp) : undefined,
    deadline: data.deadline || undefined,
    requesterId: data.requesterId,
    requesterName: data.requesterName || 'Engineering Student',
    requesterUniversity: data.requesterUniversity || 'Philippine University',
    status: 'open',
    upvotes: 1, // Start with requester's upvote
    downvotes: 0,
    netScore: 1,
    userVote: 1,
    recommendedNotes: [],
    commentsCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, 'requests', id), requestDoc);
    return requestDoc;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `requests/${id}`);
  }
}

export function subscribeToNoteRequests(
  onUpdate: (requests: NoteRequest[]) => void,
  onError?: (err: Error) => void
): () => void {
  const requestsRef = collection(db, 'requests');
  return onSnapshot(
    requestsRef,
    (snapshot) => {
      const requests: NoteRequest[] = [];
      snapshot.forEach((d) => {
        const item = d.data() as NoteRequest;
        requests.push({
          ...item,
          id: d.id,
          netScore: Number(item.netScore ?? (item.upvotes || 0) - (item.downvotes || 0)),
          recommendedNotes: Array.isArray(item.recommendedNotes) ? item.recommendedNotes : [],
          commentsCount: Number(item.commentsCount || 0),
        });
      });
      // Sort newest or highest voted first
      requests.sort(
        (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
      onUpdate(requests);
    },
    (err) => {
      console.warn('Real-time note requests stream error:', err);
      if (typeof onError === 'function') onError(err);
      handleFirestoreError(err, OperationType.LIST, 'requests');
    }
  );
}

export async function voteNoteRequest(
  requestId: string,
  userId: string,
  direction: 1 | -1
): Promise<{ netScore: number; userVote: number }> {
  const requestRef = doc(db, 'requests', requestId);
  try {
    const snap = await getDoc(requestRef);
    if (!snap.exists()) throw new Error('Request not found');
    const data = snap.data() as NoteRequest;

    let up = data.upvotes || 0;
    let down = data.downvotes || 0;

    if (direction === 1) {
      up += 1;
    } else {
      down += 1;
    }

    const netScore = up - down;
    await updateDoc(requestRef, {
      upvotes: up,
      downvotes: down,
      netScore,
      updatedAt: new Date().toISOString(),
    });

    return { netScore, userVote: direction };
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `requests/${requestId}`);
  }
}

export async function addCommentToNoteRequest(
  requestId: string,
  commentData: {
    userId: string;
    userName: string;
    userRole?: string;
    content: string;
    recommendedNote?: RecommendedNoteItem;
  }
): Promise<RequestComment> {
  const commentId = `cm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const commentRef = doc(db, 'requests', requestId, 'comments', commentId);
  const commentDoc: RequestComment = {
    id: commentId,
    requestId,
    userId: commentData.userId,
    userName: commentData.userName,
    userRole: commentData.userRole || 'student',
    content: commentData.content.trim(),
    recommendedNote: commentData.recommendedNote,
    createdAt: new Date().toISOString(),
  };

  try {
    await setDoc(commentRef, commentDoc);

    // Also update parent request comments count and recommendations
    const reqRef = doc(db, 'requests', requestId);
    const reqSnap = await getDoc(reqRef);
    if (reqSnap.exists()) {
      const cur = reqSnap.data() as NoteRequest;
      const updates: any = {
        commentsCount: (cur.commentsCount || 0) + 1,
        updatedAt: new Date().toISOString(),
      };
      if (commentData.recommendedNote) {
        updates.recommendedNotes = arrayUnion(commentData.recommendedNote);
      }
      await updateDoc(reqRef, updates);
    }

    return commentDoc;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `requests/${requestId}/comments/${commentId}`);
  }
}

export function subscribeToRequestComments(
  requestId: string,
  onUpdate: (comments: RequestComment[]) => void
): () => void {
  const commentsRef = collection(db, 'requests', requestId, 'comments');
  return onSnapshot(
    commentsRef,
    (snapshot) => {
      const comments: RequestComment[] = [];
      snapshot.forEach((d) => {
        comments.push(d.data() as RequestComment);
      });
      comments.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      onUpdate(comments);
    },
    (err) => {
      console.warn('Comments subscription notice:', err);
    }
  );
}

export async function updateRequestStatus(
  requestId: string,
  status: 'open' | 'fulfilled' | 'closed'
): Promise<void> {
  const requestRef = doc(db, 'requests', requestId);
  try {
    await updateDoc(requestRef, {
      status,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `requests/${requestId}`);
  }
}

/**
 * "Find Notes for Me" automated search matcher:
 * Queries approved notes in the marketplace collection to find materials
 * matching the user's requested subject, program, topic, or material type.
 */
export async function findMatchingNotesForRequest(filters: {
  program?: string;
  subject?: string;
  topic?: string;
  materialType?: string;
  title?: string;
}): Promise<NoteListing[]> {
  try {
    const notesRef = collection(db, 'notes');
    const q = query(notesRef, where('approvedStatus', '==', true));
    const snap = await getDocs(q);

    const matches: { note: NoteListing; relevance: number }[] = [];
    const searchTerms = [
      filters.subject?.toLowerCase(),
      filters.topic?.toLowerCase(),
      filters.title?.toLowerCase(),
      filters.materialType?.toLowerCase(),
    ]
      .filter(Boolean)
      .flatMap((s) => s!.split(/[\s,/-]+/))
      .filter((w) => w.length > 2);

    snap.forEach((d) => {
      const note = d.data() as NoteListing;
      let relevance = 0;

      // Program match
      if (filters.program && note.program && note.program.toLowerCase() === filters.program.toLowerCase()) {
        relevance += 15;
      }

      // Material type match
      if (filters.materialType && note.materialType && note.materialType.toLowerCase() === filters.materialType.toLowerCase()) {
        relevance += 10;
      }

      const noteText = `${note.title} ${note.subject || ''} ${note.description || ''} ${note.topic || ''} ${(note.topics || []).join(' ')}`.toLowerCase();

      // Check keyword occurrences
      for (const term of searchTerms) {
        if (noteText.includes(term)) {
          relevance += 8;
        }
      }

      if (relevance > 0) {
        matches.push({ note, relevance });
      }
    });

    matches.sort((a, b) => b.relevance - a.relevance);
    return matches.slice(0, 5).map((m) => m.note);
  } catch (err) {
    console.warn('findMatchingNotesForRequest error:', err);
    return [];
  }
}
