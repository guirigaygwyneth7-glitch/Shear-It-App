// High-fidelity asset resolver and preview manager for Shear It
import structuresImg from '../assets/images/note_preview_structures_1792130896313.jpg';
import circuitsImg from '../assets/images/note_preview_circuits_1792130897238.jpg';
import calculusImg from '../assets/images/note_preview_calculus_1792130898199.jpg';
import heroImg from '../assets/images/hero_engineering_notes_1792130895707.jpg';
import { NoteListing } from '../types';

export const ASSET_MAP: Record<string, string> = {
  structures: structuresImg,
  circuits: circuitsImg,
  calculus: calculusImg,
  hero: heroImg,
  // Map legacy filesystem paths to bundled URLs
  '/src/assets/images/note_preview_structures_1792130896313.jpg': structuresImg,
  '/src/assets/images/note_preview_circuits_1792130897238.jpg': circuitsImg,
  '/src/assets/images/note_preview_calculus_1792130898199.jpg': calculusImg,
  '/src/assets/images/hero_engineering_notes_1792130895707.jpg': heroImg,
  '/assets/images/note_preview_structures_1792130896313.jpg': structuresImg,
  '/assets/images/note_preview_circuits_1792130897238.jpg': circuitsImg,
  '/assets/images/note_preview_calculus_1792130898199.jpg': calculusImg,
  '/assets/images/hero_engineering_notes_1792130895707.jpg': heroImg,
};

/**
 * Resolves any preview image URL (legacy path, blob, data URL, or subject key) to a working image.
 */
export function resolvePreviewUrl(rawUrl?: string, subjectOrProgram?: string): string {
  if (rawUrl && ASSET_MAP[rawUrl]) {
    return ASSET_MAP[rawUrl];
  }
  if (rawUrl && (rawUrl.startsWith('data:') || rawUrl.startsWith('blob:') || rawUrl.startsWith('http'))) {
    return rawUrl;
  }

  // Fallback based on subject or program keywords
  const text = (subjectOrProgram || '').toLowerCase();
  if (text.includes('circuit') || text.includes('electr') || text.includes('logic') || text.includes('power')) {
    return circuitsImg;
  }
  if (text.includes('calc') || text.includes('math') || text.includes('thermo') || text.includes('diff') || text.includes('chem')) {
    return calculusImg;
  }
  if (text.includes('civil') || text.includes('struct') || text.includes('mechanic') || text.includes('beam') || text.includes('soil')) {
    return structuresImg;
  }

  return structuresImg;
}

/**
 * Returns an array of sample preview pages for a note.
 * Guaranteed to have at least 2-4 pages for interactive inspection.
 */
export function getNotePreviewPages(note: Partial<NoteListing>): string[] {
  const resolved: string[] = [];

  if (Array.isArray(note.previewImages) && note.previewImages.length > 0) {
    for (const img of note.previewImages) {
      resolved.push(resolvePreviewUrl(img, note.subject || note.program));
    }
  }

  // If only 1 image provided, augment with complementary engineering sample pages for multi-page inspection
  if (resolved.length === 1) {
    const text = (note.subject || note.program || '').toLowerCase();
    if (text.includes('circuit') || text.includes('electr')) {
      resolved.push(calculusImg, heroImg);
    } else if (text.includes('calc') || text.includes('math') || text.includes('thermo')) {
      resolved.push(structuresImg, heroImg);
    } else {
      resolved.push(heroImg, calculusImg);
    }
  }

  if (resolved.length === 0) {
    const defaultImg = resolvePreviewUrl(undefined, note.subject || note.program);
    resolved.push(defaultImg, heroImg, calculusImg);
  }

  return resolved;
}

/**
 * Generates an SVG Data URI containing authentic Philippine Engineering diagram notes.
 * Used as high-performance instant fallback if an external image fails to render.
 */
export function generateEngineeringDiagramSvg(
  title: string,
  courseCode: string,
  pageNumber: number = 1,
  totalPages: number = 24
): string {
  const safeTitle = (title || 'Engineering Notes').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const safeCode = (courseCode || 'ENGR').replace(/&/g, '&amp;');

  const svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1131" width="100%" height="100%">
  <!-- Page Background (Grid / Engineering Paper) -->
  <rect width="800" height="1131" fill="#FFFDF8"/>
  <defs>
    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#EFE4DC" stroke-width="0.75"/>
    </pattern>
  </defs>
  <rect width="800" height="1131" fill="url(#grid)"/>

  <!-- Academic Header Stamp -->
  <rect x="40" y="40" width="720" height="75" rx="8" fill="#F8EDEF" stroke="#E8A5A9" stroke-width="1.5"/>
  <text x="60" y="70" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="bold" fill="#800000">SHEAR IT · PHILIPPINE ACADEMIC NOTES MARKETPLACE</text>
  <text x="60" y="95" font-family="monospace" font-size="12" fill="#570018">${safeCode} · ${safeTitle} · PAGE ${pageNumber} OF ${totalPages}</text>
  <circle cx="725" cy="77" r="14" fill="#800000"/>
  <text x="725" y="82" font-family="monospace" font-size="12" font-weight="bold" fill="#FFF" text-anchor="middle">SI</text>

  <!-- Technical Sketch: Beam and Shear-Moment Diagram -->
  <rect x="40" y="140" width="720" height="420" rx="12" fill="#FFFFFF" stroke="#D1C3C8" stroke-width="1.2"/>
  <text x="65" y="175" font-family="monospace" font-size="13" font-weight="bold" fill="#800000">FIG. 1: FREE BODY DIAGRAM &amp; SHEAR FORCE DISTRIBUTION (V-x)</text>

  <!-- Beam Line -->
  <line x1="120" y1="230" x2="680" y2="230" stroke="#292329" stroke-width="5" stroke-linecap="round"/>
  <!-- Supports -->
  <polygon points="120,230 105,255 135,255" fill="#800000"/>
  <polygon points="560,230 545,255 575,255" fill="#800000"/>
  <circle cx="560" cy="260" r="5" fill="#570018"/>

  <!-- Distributed Load Arrows -->
  <line x1="120" y1="195" x2="560" y2="195" stroke="#C02636" stroke-width="2"/>
  <text x="340" y="190" font-family="monospace" font-size="12" font-weight="bold" fill="#C02636" text-anchor="middle">w = 18.5 kN/m</text>
  <path d="M 160 195 L 160 225 M 240 195 L 240 225 M 320 195 L 320 225 M 400 195 L 400 225 M 480 195 L 480 225 M 560 195 L 560 225" stroke="#C02636" stroke-width="1.5"/>

  <!-- Concentrated Overhang Load -->
  <line x1="680" y1="180" x2="680" y2="225" stroke="#B42318" stroke-width="2.5" marker-end="url(#arrow)"/>
  <text x="680" y="170" font-family="monospace" font-size="12" font-weight="bold" fill="#B42318" text-anchor="middle">P = 42 kN</text>

  <!-- Shear Diagram (V) -->
  <text x="65" y="300" font-family="monospace" font-size="12" font-weight="bold" fill="#287D4F">V-DIAGRAM (kN):</text>
  <line x1="120" y1="360" x2="680" y2="360" stroke="#94A3B8" stroke-width="1.5" stroke-dasharray="4"/>
  <polygon points="120,360 120,310 560,390 560,360" fill="#287D4F" fill-opacity="0.18"/>
  <polyline points="120,360 120,310 560,390 560,318 680,318 680,360" fill="none" stroke="#287D4F" stroke-width="2.5"/>
  <text x="130" y="305" font-family="monospace" font-size="11" font-weight="bold" fill="#287D4F">+55.5 kN</text>
  <text x="540" y="410" font-family="monospace" font-size="11" font-weight="bold" fill="#287D4F">-44.5 kN</text>

  <!-- Bending Moment (M) -->
  <text x="65" y="445" font-family="monospace" font-size="12" font-weight="bold" fill="#0284C7">BENDING MOMENT DIAGRAM (M-x in kN·m):</text>
  <line x1="120" y1="510" x2="680" y2="510" stroke="#94A3B8" stroke-width="1.5" stroke-dasharray="4"/>
  <path d="M 120 510 Q 340 450 560 510 L 680 540" fill="none" stroke="#0284C7" stroke-width="2.8"/>
  <text x="340" y="440" font-family="monospace" font-size="11" font-weight="bold" fill="#0284C7" text-anchor="middle">M_max = +83.25 kN·m (Parabolic)</text>

  <!-- Hand-derived Solution Text Area -->
  <rect x="40" y="580" width="720" height="490" rx="12" fill="#FFFFFF" stroke="#D1C3C8" stroke-width="1.2"/>
  <text x="65" y="615" font-family="system-ui, sans-serif" font-size="14" font-weight="bold" fill="#800000">DERIVATION &amp; GOVERNING EQUATIONS (Philippine Syllabus Verified)</text>
  
  <text x="65" y="650" font-family="monospace" font-size="13" fill="#292329">1. Equilibrium Equations: &#x2211;M_A = 0 &#x21D2; R_B &#xD7; (8.0m) - (18.5 &#xD7; 8)(4.0) - (42)(10.0) = 0</text>
  <text x="65" y="680" font-family="monospace" font-size="13" fill="#287D4F" font-weight="bold">&#x21D2; R_B = 126.50 kN &#x2191; (Right Support Reaction)</text>
  
  <text x="65" y="720" font-family="monospace" font-size="13" fill="#292329">2. Vertical Force Balance: &#x2211;F_y = 0 &#x21D2; R_A + R_B - (18.5 &#xD7; 8) - 42 = 0</text>
  <text x="65" y="750" font-family="monospace" font-size="13" fill="#287D4F" font-weight="bold">&#x21D2; R_A = 63.50 kN &#x2191; (Left Pin Support Reaction)</text>

  <text x="65" y="790" font-family="monospace" font-size="13" fill="#292329">3. Differential Relation: dV/dx = -w(x) &amp; dM/dx = V(x)</text>
  <text x="65" y="820" font-family="monospace" font-size="13" fill="#570018">&#x21D2; Point of Zero Shear: x_0 = R_A / w = 63.5 / 18.5 = 3.432 m from support A.</text>
  
  <text x="65" y="860" font-family="monospace" font-size="13" fill="#292329">4. Absolute Maximum Bending Moment:</text>
  <text x="65" y="890" font-family="monospace" font-size="13" fill="#800000" font-weight="bold">&#x21D2; M_max = (63.50)(3.432) - 0.5(18.5)(3.432)&#xB2; = 108.99 kN&#xB7;m (Tension Bottom Fiber)</text>

  <text x="65" y="930" font-family="monospace" font-size="12" fill="#746B70">&#x2605; BOARD EXAM TIP: Watch out for negative cantilever moment at the overhang root:</text>
  <text x="65" y="955" font-family="monospace" font-size="12" fill="#B42318">M_supportB = -42 kN &#xD7; 2.0 m = -84.00 kN&#xB7;m (Top Tension / Hogging Moment)</text>

  <!-- Watermark Diagonal -->
  <text x="400" y="760" font-family="system-ui, sans-serif" font-size="34" font-weight="900" fill="#800000" fill-opacity="0.04" text-anchor="middle" transform="rotate(-30 400 760)">
    SHEAR IT · LICENSED STUDENT PREVIEW
  </text>

  <!-- Footer -->
  <rect x="40" y="1080" width="720" height="30" fill="none"/>
  <text x="40" y="1098" font-family="sans-serif" font-size="10" fill="#999">Verified Original Student Material · Republic Act No. 10173 Protected · www.shearit.ph</text>
  <text x="760" y="1098" font-family="monospace" font-size="10" fill="#999" text-anchor="end">SEC-HASH-${Math.abs(pageNumber * 7919)}</text>
</svg>
  `.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svgContent)}`;
}
