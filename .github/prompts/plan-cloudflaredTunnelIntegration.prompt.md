## Plan: Cloudflared Tunnel Integration

TL;DR - Replicate the Python `cloudflared` logic in the Electron Main process using Node's `child_process`, establish IPC channels to communicate status and URLs, and update the React/Zustand frontend to display real-time data instead of mock data.

**Steps**

1. **Backend Service (`CloudflaredService.ts`)**: Create a Node.js service to spawn and manage `cloudflared` child processes. Parse stdout/stderr to extract the `trycloudflare.com` URL for quick tunnels. Implement the `custom_domain.py` logic (login, create, route dns, run with config).
2. **IPC Channel Setup (`main.ts` & `preload.ts`)**: Define bidirectional IPC channels for starting/stopping tunnels (Quick & Custom), receiving generated URLs, and streaming CLI logs to the frontend.
3. **State Management (`tunnelStore.ts` & `logsStore.ts`)**: Remove mocked URLs. Implement Zustand logic to listen for IPC events, update tunnel status (connecting -> running), store the true public URLs, and append logs.
4. **UI Integration (`PublicAccessCard.tsx` & `TunnelItem.tsx`)**: Bind the UI components to the `tunnelStore` to display accurate generated URLs, ports, and loading states. Add forms/inputs for custom domain details.

**Relevant files**

- `main/services/CloudflaredService.ts` (New) — Core logic traversing `cloudflared` setup and execution.
- `main/main.ts` — IPC handlers for tunnel lifecycle events.
- `app/preload.js` / `main/preload.ts` — Expose tunnel APIs to the window object.
- `renderer/store/tunnelStore.ts` — State for managing active tunnels and URLs.
- `renderer/components/Dashboard/PublicAccessCard.tsx` — Dynamic UI for displaying active tunnels.
- `renderer/pages/domains.tsx` — UI for Custom Domain configurations.

**Verification**

1. Test Quick Tunnel: Start tunnel on port 3000 -> Parse URL -> Validate UI updates with the `trycloudflare` link.
2. Test Custom Domain (Prerequisite: logged in to Cloudflare): Config generated -> DNS routed -> Tunnel runs -> UI updates correctly.
3. Edge case: `cloudflared` not installed (show error in UI).

**Decisions**

- `cloudflared` binary will be assumed to be installed in the system PATH initially (similar to the Python script). Future enhancement could bundle or download it.
- Regex from `quick_tunnel.py` will be used in Node `stdout.on('data')` to catch the URL.
