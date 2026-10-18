import React, { useState } from 'react';
import {
  X,
  Upload,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  ShieldAlert,
  FileCheck,
  Lock,
  Tag,
  BookOpen
} from 'lucide-react';
import {
  EngineeringProgram,
  YearLevel,
  MaterialType,
  NoteListing,
  UserProfile,
  UploaderConsents
} from '../types';
import { api, formatPhp } from '../lib/api';
import { uploadNoteToFirestore } from '../lib/firebase';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newNote: NoteListing) => void;
  currentUser: UserProfile;
}

const MATERIAL_TYPES: MaterialType[] = [
  'Lecture Notes',
  'Handwritten Notes',
  'Typed Notes',
  'Reviewer',
  'Formula Sheet',
  'Answered Sample Problems',
  'Solved Engineering Problems',
  'Practice Problems with Solutions',
  'Practice Problems Without Solutions',
  'Study Guide',
  'Subject Summary',
  'Concept Explanation',
  'Laboratory Study Notes',
  'Laboratory Report Guide',
  'Engineering Tables and Reference Sheets',
  'Design Computation Examples',
  'Board Exam Review Materials',
  'Flashcards and Quick Review',
  'Other Student-Created Study Material',
];

const PROGRAMS: EngineeringProgram[] = [
  'Civil Engineering',
  'Mechanical Engineering',
  'Electrical Engineering',
  'Electronics Engineering',
  'Computer Engineering',
  'Chemical Engineering',
  'Industrial Engineering',
  'Mining Engineering',
  'Geological Engineering',
  'Sanitary Engineering',
  'Environmental Engineering',
  'Agricultural and Biosystems Engineering',
  'Other Engineering Programs',
];

const YEAR_LEVELS: YearLevel[] = [
  '1st Year',
  '2nd Year',
  '3rd Year',
  '4th Year',
  '5th Year',
  'Irregular Student',
  'Graduate Student',
];

// Engineering Subjects per Program
const SUBJECTS_BY_PROGRAM: Record<string, string[]> = {
  'Civil Engineering': [
    'Engineering Mathematics',
    'Calculus',
    'Differential Equations',
    'Statics of Rigid Bodies',
    'Mechanics of Deformable Bodies',
    'Structural Theory',
    'Reinforced Concrete Design',
    'Steel Design',
    'Geotechnical Engineering',
    'Soil Mechanics',
    'Foundation Engineering',
    'Hydraulics',
    'Hydrology',
    'Transportation Engineering',
    'Highway and Pavement Engineering',
    'Construction Materials',
    'Construction Management',
    'Surveying',
    'Environmental Engineering',
    'Other / Custom Subject',
  ],
  'Mechanical Engineering': [
    'Thermodynamics 1',
    'Thermodynamics 2',
    'Fluid Mechanics',
    'Heat Transfer',
    'Machine Design',
    'Refrigeration and Air Conditioning',
    'Power Plant Engineering',
    'Internal Combustion Engines',
    'Materials Science and Engineering',
    'Dynamics of Rigid Bodies',
    'Mechatronics',
    'Other / Custom Subject',
  ],
  'Electrical Engineering': [
    'Circuits 1',
    'Circuits 2',
    'Electromagnetics',
    'Electrical Machines',
    'Power Systems Analysis',
    'Control Systems',
    'Power Distribution Systems',
    'Power Plant Design',
    'Electrical Safety and Code',
    'Instrumentation and Measurement',
    'Other / Custom Subject',
  ],
  'Electronics Engineering': [
    'Electronic Devices and Circuits',
    'Signals, Spectra, and Signal Processing',
    'Communications Engineering',
    'Electromagnetics for ECE',
    'Microprocessor and Microcontroller Systems',
    'Feedback and Control Systems',
    'Digital Electronics and Logic Circuits',
    'Broadcast and Acoustic Engineering',
    'Other / Custom Subject',
  ],
  'Computer Engineering': [
    'Data Structures and Algorithms',
    'Discrete Mathematics',
    'Logic Circuits and Design',
    'Computer Organization and Architecture',
    'Operating Systems',
    'Embedded Systems',
    'Computer Networks and Security',
    'Software Engineering for Engineers',
    'Object-Oriented Programming in C++',
    'Other / Custom Subject',
  ],
  'Chemical Engineering': [
    'Chemical Engineering Calculations',
    'Thermodynamics for Chemical Engineers',
    'Unit Operations 1 (Fluid Flow & Heat Transfer)',
    'Unit Operations 2 (Mass Transfer & Separation)',
    'Chemical Reaction Engineering',
    'Transport Phenomena',
    'Plant Design and Economics',
    'Environmental Engineering for ChE',
    'Biochemical Engineering',
    'Other / Custom Subject',
  ],
  'Industrial Engineering': [
    'Operations Research 1 (Deterministic)',
    'Operations Research 2 (Stochastic)',
    'Statistical Quality Control',
    'Ergonomics and Human Factors',
    'Work Study and Measurement',
    'Facility Planning and Layout',
    'Production Planning and Control',
    'Supply Chain Engineering',
    'Other / Custom Subject',
  ],
};

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentUser,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [program, setProgram] = useState<EngineeringProgram>((currentUser.program as EngineeringProgram) || 'Civil Engineering');
  const [yearLevel, setYearLevel] = useState<YearLevel>('3rd Year'); // Intended target audience year level
  const [subject, setSubject] = useState('Theory of Structures');
  const [customSubject, setCustomSubject] = useState('');
  const [courseCode, setCourseCode] = useState('CE 312');
  const [courseName, setCourseName] = useState('Theory of Structures 1');
  const [materialType, setMaterialType] = useState<MaterialType>('Reviewer');
  const [topic, setTopic] = useState('');
  const [topicsInput, setTopicsInput] = useState('Shear Force and Bending Moment, Beams, Statics');
  const [language, setLanguage] = useState('English');
  const [academicTerm, setAcademicTerm] = useState('1st Semester');
  const [university, setUniversity] = useState(currentUser.university || '');
  const [pageCount, setPageCount] = useState('24');
  const [pricePhp, setPricePhp] = useState('50.00');

  // Mandatory Quality & Data Privacy Control (RA 10173) Declarations (Unchecked by default)
  const [dec1, setDec1] = useState(false);
  const [dec2, setDec2] = useState(false);
  const [dec3, setDec3] = useState(false);
  const [dec4, setDec4] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submittedSuccess, setSubmittedSuccess] = useState<NoteListing | null>(null);

  if (!isOpen) return null;

  const currentSubjectList = SUBJECTS_BY_PROGRAM[program] || [
    'Engineering Mathematics',
    'Calculus',
    'Differential Equations',
    'Physics for Engineers',
    'Chemistry for Engineers',
    'Other / Custom Subject',
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setFileName(selected.name);
      setFileSize((selected.size / (1024 * 1024)).toFixed(1) + ' MB');
    }
  };

  const handlePublish = async () => {
    setErrorMsg('');
    if (!dec1 || !dec2 || !dec3 || !dec4) {
      setErrorMsg('All four Quality and Data Privacy (RA 10173) declarations must be individually accepted.');
      return;
    }

    setSubmitting(true);
    try {
      const resolvedSubject = subject === 'Other / Custom Subject' && customSubject ? customSubject : subject;
      const parsedTopics = topicsInput.split(',').map((t) => t.trim()).filter(Boolean);

      const consentsPayload: UploaderConsents = {
        declaration1_disseminationConsent: dec1,
        declaration2_dataPrivacyRA10173: dec2,
        declaration3_qualityInspection: dec3,
        declaration4_antiInstructorMaterial: dec4,
        consentedAt: new Date().toISOString(),
        consentVersion: 'v2.1-RA10173',
      };

      const parsedPrice = parseFloat(pricePhp) || 0;
      const firestoreNote = await uploadNoteToFirestore({
        title,
        description,
        price: parsedPrice,
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        sellerId: currentUser.uid || currentUser.id,
        sellerName: currentUser.name,
        subject: resolvedSubject,
        program,
        materialType,
        pageCount: parseInt(pageCount, 10) || 20,
        previewImages: ['/src/assets/images/note_preview_structures_1792130896313.jpg'],
      });

      // Also register in backend API for legacy sync
      try {
        await api.createNote({
          title,
          description,
          program,
          yearLevel,
          subject: resolvedSubject,
          courseCode,
          courseName,
          materialType,
          topic: topic || resolvedSubject,
          topics: parsedTopics.length > 0 ? parsedTopics : [topic || resolvedSubject],
          language,
          academicTerm,
          university,
          pricePhp: parsedPrice,
          pageCount: parseInt(pageCount, 10) || 20,
          format: fileName.toLowerCase().endsWith('.png') ? 'PNG' : fileName.toLowerCase().endsWith('.jpg') ? 'JPG' : 'PDF',
          consents: consentsPayload,
        });
      } catch (e) {
        console.warn('API sync notice:', e);
      }

      setSubmittedSuccess(firestoreNote);
      onSuccess(firestoreNote);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit note.');
    } finally {
      setSubmitting(false);
    }
  };

  const priceNum = parseFloat(pricePhp) || 0;
  const platformFee = Math.round(priceNum * 0.1 * 100) / 100;
  const netEarnings = Math.max(0, Math.round((priceNum - platformFee) * 100) / 100);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#570018]/65 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[#F8EDEF] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#570018] text-white flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-sm font-bold">Upload Engineering Study Material</h3>
            <p className="text-[11px] text-[#E8A5A9]">
              Step {currentStep} of 6: {
                currentStep === 1 ? 'Select Document File' :
                currentStep === 2 ? 'Academic Classification & Material Type' :
                currentStep === 3 ? 'Title, Topics & Description' :
                currentStep === 4 ? 'Student Pricing in PHP' :
                currentStep === 5 ? 'Quality & Data Privacy (RA 10173)' :
                'Review Submission'
              }
            </p>
          </div>
          <button onClick={onClose} className="text-[#E5D6DA] hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Maroon Step Progress */}
        <div className="w-full bg-[#F8EDEF] h-1.5 shrink-0">
          <div
            className="bg-[#800000] h-1.5 transition-all duration-300"
            style={{ width: `${(currentStep / 6) * 100}%` }}
          />
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex-1 text-[#292329]">
          {errorMsg && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-[#B42318] text-xs rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {submittedSuccess ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-14 h-14 bg-emerald-100 text-[#287D4F] rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-base font-extrabold text-[#292329]">
                Submitted for Peer Quality Inspection!
              </h3>
              <p className="text-xs text-[#746B70] max-w-md mx-auto leading-relaxed">
                Your material <strong>"{submittedSuccess.title}"</strong> has entered the moderation queue with status: <span className="font-mono font-bold text-[#800000]">Submitted for Review</span>.
              </p>
              <div className="bg-[#F8EDEF] p-4 rounded-xl text-left text-xs space-y-1.5 max-w-md mx-auto border border-[#E8A5A9]/50">
                <p className="font-bold text-[#800000]">What happens next?</p>
                <p className="text-[11px] text-[#746B70]">
                  1. Authorized peer moderators will inspect your upload for readability, syllabus accuracy, and compliance with the Philippine Data Privacy Act (RA 10173).
                </p>
                <p className="text-[11px] text-[#746B70]">
                  2. Once approved, it will be published to the public marketplace.
                </p>
                <p className="text-[11px] text-[#746B70]">
                  3. You can track this upload anytime inside your <strong>Seller Hub</strong>.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="mt-4 px-6 py-2 bg-[#800000] hover:bg-[#6B1E35] text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Go to Seller Hub
              </button>
            </div>
          ) : (
            <>
              {/* STEP 1: Upload Document File */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-[#E8A5A9] rounded-2xl p-8 text-center hover:border-[#800000] transition-colors bg-[#F8EDEF]/30">
                    <Upload className="w-12 h-12 text-[#800000] mx-auto mb-3" />
                    <h4 className="text-sm font-bold text-[#292329]">Select Document or Scans</h4>
                    <p className="text-xs text-[#746B70] mt-1 max-w-sm mx-auto">
                      Upload your handwritten notes, typed reviewers, formula sheets, or solved problems.
                      Supported formats: PDF, JPG, JPEG, PNG (max 50 MB).
                    </p>

                    <input
                      type="file"
                      id="note-file-upload"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="note-file-upload"
                      className="mt-4 inline-block px-5 py-2.5 bg-gradient-to-r from-[#800000] via-[#A01A33] to-[#C02636] hover:from-[#6B1E35] hover:to-[#A01A33] text-white font-bold text-xs rounded-xl cursor-pointer transition-all shadow-sm hover:shadow-md hover:shadow-[#800000]/25 active:scale-95 ring-1 ring-white/20"
                    >
                      Browse Files
                    </label>

                    {fileName && (
                      <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-[#287D4F] text-xs rounded-xl flex items-center justify-between max-w-sm mx-auto">
                        <div className="flex items-center gap-2 truncate">
                          <FileCheck className="w-4 h-4 text-[#287D4F] shrink-0" />
                          <span className="font-semibold truncate">{fileName}</span>
                        </div>
                        <span className="font-mono text-[11px] text-[#746B70]">{fileSize}</span>
                      </div>
                    )}
                  </div>

                  <div className="bg-[#F8EDEF] border border-[#E8A5A9] rounded-xl p-3.5 text-[11px] text-[#570018] leading-relaxed flex items-start gap-2.5">
                    <Lock className="w-4 h-4 text-[#800000] shrink-0 mt-0.5" />
                    <div>
                      <strong>RA 10173 Privacy Notice:</strong> Ensure all personal identifying information (classmate names, student ID numbers, emails, signatures) is redacted from your document prior to uploading.
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Expanded Note Classification & Material Type */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Material Type (Required 19 options) */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-[#292329] mb-1">
                        Academic Material Type *
                      </label>
                      <select
                        value={materialType}
                        onChange={(e) => setMaterialType(e.target.value as MaterialType)}
                        className="w-full px-3 py-2 text-xs bg-[#F5F5F5] border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800000]/30 font-semibold text-[#800000]"
                      >
                        {MATERIAL_TYPES.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                      <p className="text-[11px] text-[#746B70] mt-1">
                        Select the exact type of study resource so students can find specific reviewers or formula sheets.
                      </p>
                    </div>

                    {/* Engineering Program */}
                    <div>
                      <label className="block text-xs font-bold text-[#292329] mb-1">
                        Engineering Program *
                      </label>
                      <select
                        value={program}
                        onChange={(e) => {
                          const p = e.target.value as EngineeringProgram;
                          setProgram(p);
                          const subjects = SUBJECTS_BY_PROGRAM[p];
                          if (subjects && subjects.length > 0) setSubject(subjects[0]);
                        }}
                        className="w-full px-3 py-2 text-xs bg-[#F5F5F5] border border-slate-300 rounded-xl"
                      >
                        {PROGRAMS.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>

                    {/* Intended Target Audience Year Level */}
                    <div>
                      <label className="block text-xs font-bold text-[#292329] mb-1">
                        Intended Target Year Level *
                      </label>
                      <select
                        value={yearLevel}
                        onChange={(e) => setYearLevel(e.target.value as YearLevel)}
                        className="w-full px-3 py-2 text-xs bg-[#F5F5F5] border border-slate-300 rounded-xl"
                      >
                        {YEAR_LEVELS.map((y) => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                      <p className="text-[10px] text-[#746B70] mt-0.5">
                        (Your author year level: {currentUser.yearLevel})
                      </p>
                    </div>
                  </div>

                  {/* Subject and Course */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#292329] mb-1">
                        Curriculum Subject *
                      </label>
                      <select
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-[#F5F5F5] border border-slate-300 rounded-xl"
                      >
                        {currentSubjectList.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    {subject === 'Other / Custom Subject' ? (
                      <div>
                        <label className="block text-xs font-bold text-[#292329] mb-1">
                          Propose Subject Name *
                        </label>
                        <input
                          type="text"
                          value={customSubject}
                          onChange={(e) => setCustomSubject(e.target.value)}
                          placeholder="e.g. Geotechnical Engineering II"
                          className="w-full px-3 py-2 text-xs bg-[#F5F5F5] border border-slate-300 rounded-xl"
                          required
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-xs font-bold text-[#292329] mb-1">
                          Course Code *
                        </label>
                        <input
                          type="text"
                          value={courseCode}
                          onChange={(e) => setCourseCode(e.target.value)}
                          placeholder="e.g. CE 312, MATH 201, ME 211"
                          className="w-full px-3 py-2 text-xs bg-[#F5F5F5] border border-slate-300 rounded-xl font-mono uppercase"
                          required
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 3: Title, Topics & Details */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#292329] mb-1">
                      Material Title *
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Soil Mechanics — Shear Strength Review & Mohr-Coulomb Breakdown"
                      className="w-full px-3.5 py-2 text-xs bg-[#F5F5F5] border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800000]/30"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#292329] mb-1">
                      Specific Academic Topics & Tags *
                    </label>
                    <input
                      type="text"
                      value={topicsInput}
                      onChange={(e) => setTopicsInput(e.target.value)}
                      placeholder="e.g. Direct Shear Test, Mohr-Coulomb Failure Criterion, Shear Strength"
                      className="w-full px-3.5 py-2 text-xs bg-[#F5F5F5] border border-slate-300 rounded-xl font-mono"
                      required
                    />
                    <p className="text-[11px] text-[#746B70] mt-1">
                      Comma separated. Topics help peers discover calculations for their exact quizzes.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#292329] mb-1">
                      Short Description *
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Highlight what formulas, derivations, diagrams, and board exam tips are included..."
                      rows={3}
                      className="w-full p-3 text-xs bg-[#F5F5F5] border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800000]/30"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#292329] mb-1">Language</label>
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-[#F5F5F5] border border-slate-300 rounded-xl"
                      >
                        <option value="English">English</option>
                        <option value="Filipino / Taglish">Filipino / Taglish</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#292329] mb-1">Academic Term</label>
                      <select
                        value={academicTerm}
                        onChange={(e) => setAcademicTerm(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-[#F5F5F5] border border-slate-300 rounded-xl"
                      >
                        <option value="1st Semester">1st Semester</option>
                        <option value="2nd Semester">2nd Semester</option>
                        <option value="Midyear / Summer">Midyear / Summer</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#292329] mb-1">Total Pages</label>
                      <input
                        type="number"
                        min="1"
                        value={pageCount}
                        onChange={(e) => setPageCount(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-[#F5F5F5] border border-slate-300 rounded-xl font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: Pricing in Philippine Pesos (₱) */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#292329] mb-1">
                      Selling Price in Philippine Pesos (₱) *
                    </label>
                    <div className="relative max-w-xs">
                      <span className="absolute left-3.5 top-2.5 text-[#746B70] font-mono font-bold text-sm">₱</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={pricePhp}
                        onChange={(e) => setPricePhp(e.target.value)}
                        className="w-full pl-8 pr-4 py-2 text-sm font-mono font-bold bg-[#F5F5F5] border border-slate-300 rounded-xl focus:outline-none"
                        placeholder="50.00"
                      />
                    </div>
                    <p className="text-[11px] text-[#746B70] mt-1">
                      Set to <strong>₱0.00</strong> to offer your material for free to fellow students.
                    </p>
                  </div>

                  {/* Preset Price Buttons */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {[0, 25, 50, 75, 99, 150].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPricePhp(p.toFixed(2))}
                        className={`px-3 py-1 text-xs font-mono font-semibold rounded-lg border transition-all cursor-pointer ${
                          priceNum === p
                            ? 'bg-[#800000] text-white border-[#800000] shadow-xs'
                            : 'bg-white text-[#292329] border-slate-200 hover:border-[#800000]'
                        }`}
                      >
                        {p === 0 ? 'Free (₱0.00)' : `₱${p}.00`}
                      </button>
                    ))}
                  </div>

                  {/* Net Breakdown */}
                  <div className="bg-[#F8EDEF]/50 border border-[#E8A5A9]/60 rounded-xl p-4 text-xs space-y-2 mt-4">
                    <div className="font-bold text-[#570018] border-b border-[#E8A5A9]/50 pb-1.5">
                      Transparent Earnings Calculation:
                    </div>
                    <div className="flex justify-between text-[#746B70]">
                      <span>Student Buyer Price</span>
                      <span className="font-mono tabular-nums text-[#292329]">{formatPhp(priceNum)}</span>
                    </div>
                    <div className="flex justify-between text-[#746B70]">
                      <span>Platform Commission (10%)</span>
                      <span className="font-mono tabular-nums text-[#B42318]">-{formatPhp(platformFee)}</span>
                    </div>
                    <div className="border-t border-[#E8A5A9]/50 pt-1.5 flex justify-between font-bold text-[#292329]">
                      <span>Net Withdrawable to GCash/Maya</span>
                      <span className="text-[#287D4F] font-mono tabular-nums text-sm">
                        {formatPhp(netEarnings)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: Quality and Data Privacy Control (RA 10173) */}
              {currentStep === 5 && (
                <div className="space-y-4">
                  <div className="bg-[#F8EDEF] border border-[#E8A5A9] rounded-2xl p-4 space-y-3">
                    <div className="flex items-center gap-2 text-[#570018] font-bold text-xs">
                      <Lock className="w-4 h-4 text-[#800000] shrink-0" />
                      <span>Republic Act No. 10173 & Quality Control Declarations</span>
                    </div>
                    <p className="text-[11px] text-[#746B70] leading-relaxed">
                      All four declarations below must be individually accepted. Consent timestamps and user IDs are securely audited in accordance with the Philippine Data Privacy Act of 2012.
                    </p>

                    <div className="space-y-3 pt-1">
                      {/* Declaration 1 */}
                      <label className="flex items-start gap-3 p-3 bg-white rounded-xl border border-[#E8A5A9] cursor-pointer hover:bg-slate-50 transition-colors">
                        <input
                          type="checkbox"
                          checked={dec1}
                          onChange={(e) => setDec1(e.target.checked)}
                          className="w-4 h-4 mt-0.5 text-[#800000] rounded focus:ring-[#800000]"
                        />
                        <div className="text-xs">
                          <span className="font-bold text-[#570018] block mb-0.5">
                            Declaration 1 — Uploader Confirmation and Dissemination Consent
                          </span>
                          <span className="text-[#746B70] leading-relaxed italic">
                            "I confirm that I am the verified student creator of this study material and explicitly authorize ShearIt to distribute and monetize this content on the academic marketplace."
                          </span>
                        </div>
                      </label>

                      {/* Declaration 2 */}
                      <label className="flex items-start gap-3 p-3 bg-white rounded-xl border border-[#E8A5A9] cursor-pointer hover:bg-slate-50 transition-colors">
                        <input
                          type="checkbox"
                          checked={dec2}
                          onChange={(e) => setDec2(e.target.checked)}
                          className="w-4 h-4 mt-0.5 text-[#800000] rounded focus:ring-[#800000]"
                        />
                        <div className="text-xs">
                          <span className="font-bold text-[#570018] block mb-0.5">
                            Declaration 2 — Data Privacy Act of 2012 (RA 10173)
                          </span>
                          <span className="text-[#746B70] leading-relaxed italic">
                            "I certify that this document contains zero personal identifying student information, confidential exam answer keys, or private records."
                          </span>
                        </div>
                      </label>

                      {/* Declaration 3 */}
                      <label className="flex items-start gap-3 p-3 bg-white rounded-xl border border-[#E8A5A9] cursor-pointer hover:bg-slate-50 transition-colors">
                        <input
                          type="checkbox"
                          checked={dec3}
                          onChange={(e) => setDec3(e.target.checked)}
                          className="w-4 h-4 mt-0.5 text-[#800000] rounded focus:ring-[#800000]"
                        />
                        <div className="text-xs">
                          <span className="font-bold text-[#570018] block mb-0.5">
                            Declaration 3 — Academic Quality Inspection
                          </span>
                          <span className="text-[#746B70] leading-relaxed italic">
                            "I consent to peer moderator inspection for syllabus accuracy, legibility, and high-yield value before public distribution."
                          </span>
                        </div>
                      </label>

                      {/* Declaration 4 */}
                      <label className="flex items-start gap-3 p-3 bg-white rounded-xl border border-[#E8A5A9] cursor-pointer hover:bg-slate-50 transition-colors">
                        <input
                          type="checkbox"
                          checked={dec4}
                          onChange={(e) => setDec4(e.target.checked)}
                          className="w-4 h-4 mt-0.5 text-[#800000] rounded focus:ring-[#800000]"
                        />
                        <div className="text-xs">
                          <span className="font-bold text-[#570018] block mb-0.5">
                            Declaration 4 — Anti-Instructor Material Guarantee
                          </span>
                          <span className="text-[#746B70] leading-relaxed italic">
                            "I solemnly certify that this file is 100% original student-authored work (handwritten notes, personal derivations, or synthesized study guides) and is NOT directly copied or downloaded from faculty lecture slides, professor PowerPoint templates, or official exam answer keys."
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 6: Review & Final Submission */}
              {currentStep === 6 && (
                <div className="space-y-4">
                  <div className="border border-[#E8A5A9] rounded-xl p-4 space-y-2 bg-[#F8EDEF]/40 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#746B70]">Material Type:</span>
                      <span className="font-bold text-[#800000]">{materialType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#746B70]">Subject & Course:</span>
                      <span className="font-mono text-[#292329]">{courseCode} — {subject}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#746B70]">Title:</span>
                      <span className="font-bold text-[#292329] text-right max-w-xs">{title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#746B70]">Intended Audience:</span>
                      <span className="text-[#292329]">{program} ({yearLevel})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#746B70]">Price (PHP):</span>
                      <span className="font-mono font-bold text-[#800000]">
                        {priceNum === 0 ? 'FREE (₱0.00)' : formatPhp(priceNum)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#746B70]">RA 10173 & Quality Consents:</span>
                      <span className="text-[#287D4F] font-bold">4/4 Declarations Accepted</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-[#746B70] text-center">
                    Upon clicking Submit, this material will be queued for peer quality inspection. It will be made publicly available once verified by peer moderators.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Controls */}
        {!submittedSuccess && (
          <div className="px-6 py-3.5 bg-[#F5F5F5] border-t border-[#F8EDEF] flex items-center justify-between shrink-0">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((s) => s - 1)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#746B70] hover:bg-[#F8EDEF] rounded-xl transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            {currentStep < 6 ? (
              <button
                type="button"
                onClick={() => {
                  if (currentStep === 1 && !fileName) {
                    setFileName('Soil_Mechanics_Shear_Strength_Review.pdf');
                    setFileSize('4.2 MB');
                  }
                  if (currentStep === 2 && !title) {
                    setTitle(`${subject} — ${materialType}`);
                  }
                  setCurrentStep((s) => s + 1);
                }}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-[#800000] via-[#A01A33] to-[#C02636] hover:from-[#6B1E35] hover:to-[#A01A33] text-white text-xs font-bold rounded-xl transition-all shadow-sm hover:shadow-md hover:shadow-[#800000]/25 cursor-pointer active:scale-95 ring-1 ring-white/20"
              >
                <span>Next</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePublish}
                disabled={submitting || !dec1 || !dec2 || !dec3 || !dec4}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 hover:from-emerald-500 hover:to-teal-700 text-white text-xs font-bold rounded-xl transition-all shadow-md hover:shadow-lg hover:shadow-emerald-600/30 disabled:opacity-50 cursor-pointer active:scale-95 ring-1 ring-emerald-300/40"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                <span>{submitting ? 'Submitting...' : 'Submit for Quality Inspection'}</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
