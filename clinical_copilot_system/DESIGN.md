---
name: Clinical Copilot System
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#3f4850'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#707881'
  outline-variant: '#bfc7d2'
  surface-tint: '#006398'
  primary: '#006194'
  on-primary: '#ffffff'
  primary-container: '#007bb9'
  on-primary-container: '#fdfcff'
  inverse-primary: '#93ccff'
  secondary: '#006a61'
  on-secondary: '#ffffff'
  secondary-container: '#86f2e4'
  on-secondary-container: '#006f66'
  tertiary: '#b61722'
  on-tertiary: '#ffffff'
  tertiary-container: '#da3437'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#cce5ff'
  primary-fixed-dim: '#93ccff'
  on-primary-fixed: '#001d31'
  on-primary-fixed-variant: '#004b73'
  secondary-fixed: '#89f5e7'
  secondary-fixed-dim: '#6bd8cb'
  on-secondary-fixed: '#00201d'
  on-secondary-fixed-variant: '#005049'
  tertiary-fixed: '#ffdad7'
  tertiary-fixed-dim: '#ffb3ad'
  on-tertiary-fixed: '#410004'
  on-tertiary-fixed-variant: '#930013'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  title-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-lg-medium:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-md-medium:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.03em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-tablet: 1.25rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-tablet: 1.5rem
  margin-desktop: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
---

## Brand & Style

This design system is engineered for high-throughput, high-stress outpatient clinics and hospitals across India. It operates as an unobtrusive, hyper-reliable clinical copilot that bridges voice consultations, real-time multilingual transcription, automated clinical documentation (EMR/EHR notes), and diagnostic decision support.

### Personality & Emotional Tenor
- **Sterile & Trustworthy:** Evokes clinical precision, cleanliness, and regulatory-grade dependability.
- **Calm & Unobtrusive:** Never distracts from patient eye contact; prioritizes ultra-high legibility under intense clinic lighting.
- **Decisive & Real-Time:** Clear ambient signaling for listening, processing, transcription locks, and multilingual script toggling (e.g., Devanagari, Tamil, Telugu, Hindi, English).

### Visual Movement
- **Clean Modern Clinical Health-Tech:** Emphasizes high-contrast flat surfaces, delicate structural borders (1px slate framing), whisper-thin dividers, and absolute clarity over visual ornament. No heavy gradients, no novelty skeuomorphism, and zero ambient blur distractions.
- **Touch-First Tablet Priority:** Tuned specifically for 10"–12" clinic tablets mounted on swivel stands or hand-carried by physicians during rounds, featuring minimum 48px touch targets and rapid single-tap confirmations.

## Colors

The palette reflects a hygienic medical environment. The system defaults strictly to a high-luminance light mode to maintain contrast under daylight and fluorescent clinic lamps.

### Color Roles & Semantics
- **Primary Clinical Blue (`#0284C7` / `#0EA5E9`):** Represents institutional authority, primary actions, active copilot state, and core clinical affordances.
- **Secondary Teal Accent (`#0D9488`):** Designates verified prescriptions, confirmed diagnostic codes (ICD-10/SNOMED CT), and stable ambient audio ingestion.
- **Critical Status Crimson (`#EF4444`):** Reserved exclusively for live audio recording pulses, drug-allergy red flags, critical vitals out-of-range, and emergency stop triggers.
- **Clinical Amber (`#F59E0B`):** Denotes tentative AI suggestions, drug interaction warnings, or unverified voice-transcription segments needing physician review.
- **Background Slate Foundation (`#F8FAFC`, `#F1F5F9`):** Sterile canvas tiers that prevent glare while clearly framing white interactive card surfaces.
- **High-Contrast Ink (`#0F172A`, `#1E293B`):** Deep navy slate providing near-black contrast ratios (AAA compliant) to ensure readability for dense pharmacological tables and patient records.

## Typography

The type scale pairs **Plus Jakarta Sans** for structural section markers and major clinical headings with **Inter** for data grids, transcript streams, and medical charts.

- **Multilingual Harmony:** Inter provides exceptional legibility alongside Indic fallback typefaces (Noto Sans Devanagari, Tamil, Telugu) without jarring baseline shifts or uneven vertical rhythms.
- **Numbers & Dosage Formats:** Numeric data (dosages, blood pressure, SPO2, pulse) always render in tabular lining figures (`font-variant-numeric: tabular-nums`) to preserve column alignment across clinical audit logs.
- **Glanceability:** Important findings use `body-lg-medium` or `label-lg` so physicians can review summarized symptoms in under two seconds.

## Layout & Spacing

The layout is built upon a 12-column adaptive fluid grid optimized for dual-pane tablet orientations (consultation view + live clinical copilot sidebar).

### Form Factors & Behavior
- **Mobile (Handheld Triage, <768px):** Single-column stacked mode. Navigation converts to an anchored bottom taskbar. Outer margin: `margin` (`1rem`).
- **Tablet (Primary Clinical Surface, 768px - 1199px):** Split-view architecture. 7 columns dedicated to the patient record/EMR documentation and 5 columns dedicated to the persistent voice transcription and AI suggestions drawer. Outer margin: `margin-tablet` (`1.25rem`).
- **Desktop / Workstation (1200px+):** Tri-pane layout featuring patient queue, active consultation notes, and AI diagnostic insights panel. Outer margin: `margin-desktop` (`2rem`).

### Rhythm Rules
- Component layouts strictly use a 4px/8px modular spacing scale.
- Interactive elements must maintain an internal touch bounding box of at least 48x48px, even when the visible label is compact.

## Elevation & Depth

Visual hierarchy is communicated through structural layering and razor-sharp separation rather than heavy shadows.

### Surface Tiers
1. **Canvas (Base Level):** `#F8FAFC` for primary clinic backdrops and `#F1F5F9` for secondary contextual panels.
2. **Container Level 1 (Resting Cards):** Solid `#FFFFFF` bordered with an exact 1px structural stroke of `#E2E8F0` (slate-200).
3. **Container Level 2 (Active Panels / Popovers):** Solid `#FFFFFF` with a 1px border of `#CBD5E1` accompanied by a clinical micro-shadow: `0 2px 4px -1px rgba(15, 23, 42, 0.04), 0 4px 6px -1px rgba(15, 23, 42, 0.02)`.
4. **Modal / Emergency Overlay Level 3:** Elevated with a controlled diffuse shadow: `0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -2px rgba(15, 23, 42, 0.04)`.

### Ambient Live Indicators
Dynamic operational states (e.g., active acoustic ingestion) use a soft animated keyframe border or pure colored indicator dot, avoiding glowing halos that could compromise text contrast on calibrated monitors.

## Shapes

The shape system utilizes controlled, balanced curvature (Level 2). This balances clinical authority with approachable touch affordances.

### Corner Radii
- **Default Elements (`rounded`):** `0.5rem` (8px). Standard for buttons, form inputs, prescription list rows, and clinical alerts.
- **Containers (`rounded-lg`):** `1rem` (16px). Used for major diagnostic cards, live transcript viewports, and medication summary blocks.
- **Large Modals (`rounded-xl`):** `1.5rem` (24px). Dedicated to bottom sheets and critical diagnostic review dialogues.
- **Pills (`rounded-full`):** Reserved strictly for micro-status indicators (e.g., "Listening", "Tamil Audio Active", "ICD-10 Verified") and quick audio-scrub handles.

## Components

### Buttons
- **Primary Clinical Action:** Background `#0284C7`, text `#FFFFFF`, radius `0.5rem`, minimum height 48px. State hover: `#0369A1`. Focus: 2px offset ring in `#38BDF8`.
- **Secondary Action:** Background `#FFFFFF`, 1px border `#E2E8F0`, text `#0F172A`. Hover: `#F8FAFC`.
- **Destructive / Emergency Stop:** Background `#EF4444`, text `#FFFFFF`. Hover: `#DC2626`.
- **Voice Mic FAB:** 56x56px circular button floating or anchored in the copilot panel. Solid `#0284C7` with a pulse ring of `#EF4444` when live audio capture is engaged.

### Form Inputs & Selectors
- **Input Fields:** 48px height for touch confidence. Background `#FFFFFF`, border `1px solid #CBD5E1`, text `#0F172A`, placeholder `#94A3B8`. On focus: border `#0284C7` with a subtle `0 0 0 3px rgba(2, 132, 199, 0.12)` halo.
- **Multilingual Script Switcher:** Segmented controls with distinct active state (`#FFFFFF` on `#F1F5F9` track) allowing 1-tap switching between regional languages and English.

### Cards & Clinical Containers
- Pure white background (`#FFFFFF`), `1px solid #E2E8F0`, corner radius `1rem`.
- Padding: 16px mobile, 20px tablet. Card headers include clear semantic labels in `title-lg` and an optional secondary teal or amber badge.

### Status Chips & Badges
- **Transcribing / Listening:** Pill badge, `#FEF2F2` background, `#991B1B` text, containing a pulsating 8px `#EF4444` circle.
- **AI Suggested / Unverified:** Pill badge, `#FFFBEB` background, `#92400E` text, amber warning icon.
- **Verified / Physician Signed:** Pill badge, `#F0FDFA` background, `#115E59` text, checkmark icon.

### Selection Controls (Checkboxes & Radios)
- Sized at 24x24px with an internal 48px tap target.
- Checked state: `#0284C7` fill with crisp `#FFFFFF` glyph. Unchecked state: `#CBD5E1` border on white background.

### Prescription & Vitals List
- Tabular row height: 56px minimum. Alternating micro-stripes or separated by `1px solid #F1F5F9`. Critical numeric thresholds (e.g., systolic > 140) display in bold crimson text with an inline icon.