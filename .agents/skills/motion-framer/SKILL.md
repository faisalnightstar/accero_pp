---
name: motion-framer
description: Master Framer Motion (and modern motion/react) animation patterns for React and Next.js. Covers physics-based springs, gesture micro-interactions, layout transitions (layoutId), staggered orchestration, exit animations with AnimatePresence, and 60fps performance optimization. Use when building animated tabs, modals, drawer trays, card flips, interactive lists, and page transitions.
license: MIT
metadata:
  author: freshtechbro
  version: "1.0.0"
---

# Motion Framer: Modern React Animation Engine

Production patterns for crafting fluid, physics-grounded, and performant UI animations using Motion (`framer-motion` or `motion/react`).

---

## 1. When to Use Motion vs GSAP

- **Use Motion (`motion-framer`)** when:
  - Building component-driven React / Next.js UIs.
  - Handling mount/unmount animations (`AnimatePresence`).
  - Animating shared element transitions between views (`layoutId`).
  - Adding micro-interactions to buttons, cards, and dropdowns (`whileHover`, `whileTap`).
- **Use GSAP (`gsap-master`)** when:
  - Complex multi-stage choreographed timelines across arbitrary non-React DOM nodes.
  - Heavy canvas, SVG morphing, or scroll-pinned scrub triggers (`ScrollTrigger`).

---

## 2. Modern Import Convention

For modern projects (v11+):
```tsx
// Modern import
import { motion, AnimatePresence } from "motion/react";

// Legacy import (framer-motion v10 and earlier)
import { motion, AnimatePresence } from "framer-motion";
```

Always mark animated components with `"use client"` in Next.js App Router.

---

## 3. Physics-Based Spring Defaults

Ditch linear or generic bezier easings for UI interactions. Use natural spring physics:

```tsx
// Snappy Micro-Interaction (Buttons, Toggles, Tooltips)
export const snappySpring = {
  type: "spring",
  stiffness: 400,
  damping: 30,
};

// Gentle Surface Spring (Modals, Drawers, Card Flips)
export const gentleSpring = {
  type: "spring",
  stiffness: 260,
  damping: 25,
  mass: 0.8,
};

// Elastic Bounce (Celebrations, Badges)
export const bouncySpring = {
  type: "spring",
  stiffness: 300,
  damping: 15,
};
```

---

## 4. Variants & Choreography

Use variants to orchestrate child elements cleanly without passing down manual delay props:

```tsx
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

export function CardGrid({ items }: { items: string[] }) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-3 gap-4"
    >
      {items.map((item) => (
        <motion.div key={item} variants={itemVariants} className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
          {item}
        </motion.div>
      ))}
    </motion.div>
  );
}
```

---

## 5. Exit Animations (`AnimatePresence`)

Always wrap unmounting conditional elements in `<AnimatePresence>`:

```tsx
<AnimatePresence mode="wait">
  {isOpen && (
    <motion.div
      key="modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
    >
      <motion.div
        key="modal-card"
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={snappySpring}
        className="max-w-lg mx-auto mt-20 p-6 bg-neutral-900 border border-neutral-800 rounded-2xl"
      >
        <h3>Card Modal</h3>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
```

---

## 6. Layout Transitions & Shared Tabs (`layoutId`)

Create silky smooth sliding indicator bars and shared element transitions:

```tsx
export function Tabs({ tabs, activeTab, onSelect }: any) {
  return (
    <div className="flex space-x-1 bg-neutral-900 p-1 rounded-xl border border-neutral-800">
      {tabs.map((tab: string) => {
        const isActive = activeTab === tab;
        return (
          <button
            key={tab}
            onClick={() => onSelect(tab)}
            className="relative px-4 py-2 text-sm font-medium transition-colors text-white"
          >
            {isActive && (
              <motion.div
                layoutId="active-pill"
                className="absolute inset-0 bg-white/10 rounded-lg border border-white/20"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative z-10">{tab}</span>
          </button>
        );
      })}
    </div>
  );
}
```

---

## 7. Performance & Reduced Motion Checklist

1. **Reduced Motion Support:**
   Always wrap or guard expressive transitions with `useReducedMotion`:
   ```tsx
   import { useReducedMotion } from "motion/react";
   const shouldReduceMotion = useReducedMotion();
   const animate = shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 };
   ```
2. **Transform Only:** Animate `transform` (`x`, `y`, `scale`, `rotate`) and `opacity`. Never animate `width`, `height`, `margin`, or `left` directly (which trigger browser reflows). Use `layout` when animating layout dimensions.
3. **Bundle Optimization:** For large apps, wrap components in `<LazyMotion features={domAnimation}>` to save ~20KB bundle size.
