---
name: Mittified Media
description: High-fidelity news and metrics tracker for the Pakistani YouTube ecosystem.
colors:
  primary: "#ffd700"
  neutral-bg: "#09090b"
  neutral-card: "#18181b"
  neutral-text: "#f4f4f5"
  neutral-border: "#27272a"
  destructive: "#ef4444"
typography:
  display:
    fontFamily: "system-ui, -apple-system, sans-serif"
    fontSize: "clamp(2rem, 5vw, 3rem)"
    fontWeight: 900
    lineHeight: 1.15
  body:
    fontFamily: "system-ui, -apple-system, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.6
rounded:
  sm: "6px"
  md: "12px"
  lg: "16px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral-bg}"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "#ffe234"
  card-container:
    backgroundColor: "{colors.neutral-card}"
    rounded: "{rounded.md}"
    padding: "20px"
---

# Design System: Mittified Media

## 1. Overview

**Creative North Star: "The Drama Sandbox"**

The Mittified Media design system is a high-contrast, entertainment-focused interface designed to cover news, stats, and controversies inside the Pakistani YouTube scene. The UI utilizes a dark canvas drenched in deep shadows to emulate a cinema or video-editing suite, positioning the content as high-impact gossip and analysis. The core visual elements are framed in subtle glassmorphism borders and backed by a vibrant accent color.

### Key Characteristics:
- **High-contrast hierarchy**: Saturated yellow indicators guide users directly to critical drama shifts.
- **Visual stability**: Ad placement containers enforce absolute, fixed dimensions to prevent cumulative layout shift.
- **Tactile feedback**: Hover actions scale cards and glowing accents dynamically to invite user engagement.

## 2. Colors

The color palette leverages a premium, low-light background with high-impact warnings and milestones.

### Primary
- **Supercluster Yellow** (#ffd700): Used exclusively for highlights, critical action targets, and drama heat meters.

### Neutral
- **Deep Void** (#09090b): Core canvas background color.
- **Glass Shard** (#18181b): Elevated container backing.
- **Ash Silver** (#f4f4f5): Primary text label ink.
- **Muted Border** (#27272a): Separation borders and divider rule stroke.

### Named Rules
**The 10% Accent Rule.** The primary Supercluster Yellow is used on ≤10% of any screen viewport. Its rarity keeps the highlights high-impact and prevents interface fatigue.

## 3. Typography

**Display Font:** System UI (sans-serif)
**Body Font:** System UI (sans-serif)

### Hierarchy
- **Display** (Heavy 900, clamp(2rem, 5vw, 3rem), 1.15): Used for title headings and article headlines.
- **Body** (Regular 400, 0.875rem, 1.6): Used for article paragraphs and text blocks. Max line-length capped at 75ch.
- **Label** (Medium 500, 0.75rem, 1.4): Used for counters, author indicators, and metadata chips.

## 4. Elevation

The system uses depth and elevation to represent priority levels, combining flat layers with neon backdrop blurs for highlighted items.

### Shadow Vocabulary
- **Ambient Low** (`box-shadow: 0 4px 24px rgba(0,0,0,0.12)`): Default container resting shadow.
- **Glow Accent** (`box-shadow: 0 10px 25px -5px rgba(255, 215, 0, 0.1)`): Interactive hover glow applied to highlighted items.

## 5. Components

### Buttons
- **Shape:** Rounded Small (6px)
- **Primary:** Background `#ffd700`, text color `#09090b`. Internal padding is `8px 16px`.
- **Hover:** Transitions background color smoothly to `#ffe234`.

### Cards / Containers
- **Corner Style:** Rounded Medium (12px)
- **Background:** Background `#18181b` (75% opacity) with a `12px` backdrop filter blur.
- **Border:** 1px stroke using color `#27272a`.

### Inputs / Fields
- **Style:** Background `#09090b`, stroke `1px` color `#27272a`.
- **Focus:** Changes border color to `#ffd700` with outline none.

## 6. Do's and Don'ts

### Do:
- **Do** wrap every AdSense placeholder script in static containers with fixed minimum heights to prevent mobile Cumulative Layout Shift.
- **Do** use uppercase typography tracking for eyebrow categories to maintain media identity.

### Don't:
- **Don't** use side-stripe accents greater than 1px on card borders.
- **Don't** animate image element scale values directly on card hovers; apply scaling strictly to background containers.
- **Don't** utilize saturated cream or sand colors as the body canvas.
