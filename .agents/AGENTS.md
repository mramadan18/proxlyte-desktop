# Workspace Rules & Agent Guidelines - Proxlyte 🤖

This file defines project-specific constraints, architectural patterns, and guidelines to ensure code consistency and stability for all future AI agents and developers working on the **Proxlyte** workspace.

---

## 🏗️ Architectural Guidelines

### 1. Separation of Concerns (IPC Bridge)
* **Main Process (Backend)**: Put all system API, CLI interactions (e.g., executing `cloudflared`), and native window managers in [main/](file:///d:/Tools/proxlyte-desktop/main). Never import frontend code or react context here.
* **Preload Script**: All IPC calls must be securely exposed via the context bridge in [preload.ts](file:///d:/Tools/proxlyte-desktop/main/preload.ts). Use safe wrapper methods; do not expose `ipcRenderer` or `shell` directly to the window.
* **Renderer Process (Frontend)**: Standard Next.js/React code located in [renderer/](file:///d:/Tools/proxlyte-desktop/renderer). Use Zustand for state management and only interact with Electron APIs via the `window.api` namespace.

### 2. State Management & Persistence
* All state stores should reside in [renderer/store/](file:///d:/Tools/proxlyte-desktop/renderer/store).
* To persist state, use Zustand's `persist` middleware with the custom `electronStorage` engine configured to use `window.api.storeGet`, `window.api.storeSet`, and `window.api.storeDelete`.
* Avoid standard `localStorage` or `sessionStorage` in renderer to keep settings synced with Electron's backend configuration.

### 3. Multiple Tunnels Support
* The backend allows running multiple tunnels simultaneously. All IPC calls related to starting, stopping, and logging tunnels (`start-quick-tunnel`, `start-custom-tunnel`, `stop-tunnel`, `tunnel-url`, `tunnel-log`, `tunnel-error`) require passing the `tunnelId` parameter to ensure events and processes are isolated and directed to the correct tunnel instance.

---

## ⚙️ Development Environment & Custom Patches

### 1. Port Allocation
* **Do NOT use the default nextron port (8888)**. Hyper-V/Docker on Windows often reserves this port range.
* Nextron is configured to run the dev renderer port on **`1000`** in [package.json](file:///d:/Tools/proxlyte-desktop/package.json). Keep this config.

### 2. Hot-Reload SIGTERM Crash Patch
* Node.js v24+ throws a promise rejection inside the `execa` process management used by Nextron when terminating old Electron instances on hot reload.
* A patch is implemented at `patches/nextron+10.0.0.patch`.
* If adding new npm packages or installing dependencies, always run `npm run postinstall` (which runs `patch-package`) to ensure the hot-reload fix remains active.
* See [HOT_RELOAD_FIX_GUIDE.md](file:///d:/Tools/proxlyte-desktop/HOT_RELOAD_FIX_GUIDE.md) for background details.

---

## 🎨 UI & Design Principles

* **Aesthetic Standard**: High-end Obsidian/Deep-Dark mode with subtle glassmorphism (`glass` and `glass-dark` CSS utility classes).
* **Color Hierarchy**: Background: `#030303`/`#050505`. Accent primary: `#8b5cf6` (Fuchsia/Indigo tones).
* **Transitions**: Every route transition must use `AnimatePresence` with y-axis offsets and blur filters for a premium feel.
* Keep standard layouts unified via the [Layout](file:///d:/Tools/proxlyte-desktop/renderer/components/Layout/Layout.tsx) wrapper.
