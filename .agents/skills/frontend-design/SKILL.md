---
name: frontend-design
description: Create distinctive, world-class frontend interfaces that avoid generic AI-generated templates. Enforces intentional visual hierarchy, refined typography pairings, cohesive color palettes, tactile micro-interactions, and robust UX standards. Use when designing, building, or styling web pages, landing pages, dashboards, components, and interactive tools.
license: MIT
metadata:
  author: anthropic
  version: "1.0.0"
---

# Frontend Design: Anti-Slop & Distinctive UI

This skill transforms your frontend design process from generic AI output into polished, bespoke, world-class digital experiences.

---

## 1. The Design Director Mindset

Never generate predictable, cookie-cutter "AI templates" (e.g. generic centered hero text, floating pill badges above every headline, clichéd purple/indigo gradients on white cards, or uniform grids of identical feature boxes). 

Instead, act as a **Principal Design Director at a top-tier digital product studio**:
- Treat each screen as a crafted product with its own distinct character, mood, and brand tone.
- Prioritize visual hierarchy: the most important element should command immediate attention.
- Balance utility, elegance, and tactile polish.

---

## 2. Pre-Execution Grounding

Before writing JSX, HTML, or CSS:
1. **Clarify the Core Action:** What is the single most important action the user is here to take?
2. **Determine the Tone & Vibe:** 
   - *Technical / Utility:* High density, crisp borders, monospaced data accents, micro-labels (e.g., Linear, Raycast, Vercel).
   - *Editorial / High Taste:* Elegant serif or geometric sans, generous whitespace, asymmetric layout balance.
   - *Consumer / Interactive:* Rich tactile feedback, playful springs, high-contrast surfaces.
3. **Define the Color Palette (4–6 Tokens):**
   - **Background / Canvas:** Deep rich tone (e.g., `#090a0f`, `#0d1117`) or warm organic paper light (`#faf9f6`, `#f4f4f0`).
   - **Surface / Card:** Slightly elevated tone with subtle border delineation (`rgba(255, 255, 255, 0.05)` or 1px subtle neutral).
   - **Text Hierarchy:** High-contrast primary text, muted secondary text (60–70% opacity), subtle tertiary metadata.
   - **Accent / Focal Point:** One signature accent color used deliberately for primary actions and active states.

---

## 3. Typography & Spatial Layout Rules

### Typography
- **Intentional Font Pairing:** Combine a character-rich headline font with an ultra-readable body font (e.g., Geist / Inter / Plus Jakarta Sans paired with JetBrains Mono for data, or an editorial serif for editorial products).
- **Scale & Contrast:** Avoid weak visual size differences. If a headline is 32px, a section title shouldn't be 28px. Use bold proportional contrast (e.g., 48px Display vs 14px Micro-label).
- **Letter Spacing & Rhythm:** 
  - Tighten tracking on large display headlines (`tracking-tight` or `-0.02em`).
  - Expand tracking slightly on uppercase sub-labels (`tracking-wider` or `+0.05em`).
  - Set comfortable line heights (`leading-relaxed` for prose, `leading-tight` for big titles).

### Layout & Composition
- **Asymmetric Balance:** Avoid defaulting to 3 identical centered cards. Use an asymmetric Bento Grid or a hero layout with a dominant primary canvas and auxiliary supporting panels.
- **Rhythm & Gutters:** Use consistent spacing steps (4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px). Never mix arbitrary margins (`margin: 17px`).
- **Surface Elevation:** Use 1px crisp borders with subtle alpha transparency rather than muddy, oversized drop-shadows.

---

## 4. Tactility & Micro-Interactions

A great interface feels physical, responsive, and responsive to user input:
- **Button States:** 
  - Default: Crisp surface, high contrast.
  - Hover: Subtle brightness lift or border highlight (`translate-y-[-1px]`, gentle shadow bloom).
  - Active: Tactile depression (`active:scale-[0.98]` or `active:translate-y-0`).
- **Focus Rings:** Always provide high-visibility, offset keyboard focus indicators for accessibility (`focus-visible:ring-2 focus-visible:ring-offset-2`).
- **Card Interactivity:** If an item is interactive, indicate it with cursor changes, subtle border transitions, or subtle inner glow rather than jarring color shifts.

---

## 5. Anti-Cliché Checklist (Self-Critique Pass)

Before delivering any frontend UI, verify that you **did NOT**:
- ❌ Default to a lazy centered headline with a floating pill badge above it.
- ❌ Use generic stock purple-to-blue linear gradients on buttons or text.
- ❌ Render 3 identical cards side-by-side with generic icons inside colored circles.
- ❌ Use low-contrast light grey text on white backgrounds that fails accessibility.
- ❌ Use vague placeholder button copy like "Submit" or "Click Here" (use action-oriented verbs like "Print PVC Card", "Download PDF", "Verify Identity").

---

## 6. Technical Quality Floor

- **Responsive Viewports:** Ensure layout cleanly adapts to 375px mobile, 768px tablet, and 1280px+ desktop displays without horizontal scroll overflow.
- **Accessibility:** Meet WCAG AA contrast standards minimum. Preserve semantic HTML tags (`<main>`, `<nav>`, `<button>`, `<section>`).
- **Motion Restraint:** Ensure all transitions are swift (150ms–250ms with `cubic-bezier(0.16, 1, 0.3, 1)`) and respect `@media (prefers-reduced-motion: reduce)`.
