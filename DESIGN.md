# Design System & Aesthetics Specification - Proxlyte 🎨

This document outlines the design principles, color system, typography, and interactive aesthetics implemented across the **Proxlyte** user interface.

---

## 🖤 Design Aesthetics: Deep Obsidian & Glassmorphism

Proxlyte utilizes a premium, dark-mode-first aesthetic inspired by obsidian surfaces, digital glassmorphism, and neon-indigo accents. The interface is optimized to feel sleek, responsive, and distraction-free.

---

## 🎨 Color System

All colors are controlled using CSS variables defined in [global.css](file:///d:/Tools/proxlyte-desktop/renderer/styles/global.css).

### 1. Base Colors
* **Body Background**: `#030303` (`--bg-body`) - Pitch black base to emphasize UI elements.
* **Surface Background**: `#0a0a0a` (`--bg-surface`) - Main background for structural blocks.
* **Primary Container**: `#050505` (`--bg-main`) - Dark grey contrast containers.

### 2. Accent Colors
* **Accent Primary**: `#8b5cf6` (`--accent-primary`) - Royal purple.
* **Accent Secondary**: `#6366f1` (`--accent-secondary`) - Indigo.
* **Accent Light Indigo**: `#818cf8` (`--accent-indigo`) - Bright neon indigo for accents.
* **Accent Fuchsia**: `#d946ef` (`--accent-fuchsia`) - Vibrant magenta highlight.
* **Accent Blue**: `#3b82f6` (`--accent-blue`) - System status blue.

### 3. Semantic Colors
* **Success / Online**: `#4ade80` (`--color-success`) - Emerald green.
* **Warning / Connecting**: `#fbbf24` (`--color-warning`) - Amber gold.
* **Danger / Offline**: `#ef4444` (`--color-danger`) - Rose red.

---

## ✨ Glassmorphism Utility Tokens

We use two primary glass utility classes in our tailwind setup:

### `.glass`
A light semi-transparent container suited for interactive controls and cards.
```css
background: rgba(255, 255, 255, 0.02);
backdrop-filter: blur(24px);
border: 1px solid rgba(255, 255, 255, 0.05);
box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
```

### `.glass-dark`
A darker glass layer suited for layouts, sidebars, or backdrop overlays.
```css
background: rgba(0, 0, 0, 0.4);
backdrop-filter: blur(40px);
border: 1px solid rgba(255, 255, 255, 0.05);
```

---

## ✍️ Typography

* **Sans-Serif Font**: `"Inter"`, `"Plus Jakarta Sans"`, `system-ui`, `sans-serif`.
* **Monospace Font**: `"JetBrains Mono"`, `monospace` (used inside console logs and code outputs).
* **Headings**: Extra-bold weights (`font-extrabold`) utilizing linear-gradients matching `from-(--text-main) to-(--text-main)/60` for a metallic premium glow.

---

## 🎬 Custom Animations & Interactions

### 1. Page Transitions
All pages utilize Framer Motion to perform a smooth entrance transition on route changes:
* **Initial State**: `opacity: 0, y: 15, filter: "blur(4px)"`
* **Animate State**: `opacity: 1, y: 0, filter: "blur(0px)"`
* **Exit State**: `opacity: 0, y: -15, filter: "blur(4px)"`
* **Transition Curve**: `duration: 0.35, ease: "easeOut"`

### 2. Keyframes
* **`pulse-slow`**: A gentle breathing pulse effect that scales elements slightly (1.05x) and cycles opacity from 0.8 to 0.4.
* **`tilt`**: A subtle tilt rotation (-1deg to 1deg) to add micro-movements to container cards on hover.
* **Ping Effects**: Used on status badges (`animate-ping`) to signify active tunnels.

### 3. Interactive States
* **Hover Borders**: Buttons and cards utilize gradient background borders that shift opacity from `white/10` to `white/20` or `emerald-500/20` on mouse hover.
* **Custom Scrollbars**: Minimalist scrollbars (`width: 6px`) styled with high transparency (`rgba(255, 255, 255, 0.1)`) that become slightly more visible when hovered.
