# Hybrid Architecture — Universal App Directive

## Architecture
This project uses a **Universal App** structure — a single Next.js codebase that serves:
- **Web browsers** (desktop + mobile) via standard HTTP
- **Native iOS/Android** via Capacitor wrapping the same web routes

The Capacitor native shell loads the `/scanner` route. No separate native codebase exists.

## Route Groups
The `app/` directory is organized into three Route Groups (invisible to the URL router):

| Group | Purpose | Contains |
|---|---|---|
| `(public)` | Customer-facing pages | `/`, `/login`, `/register`, `/events`, `/events/[eventId]`, `/tickets` |
| `(admin)` | Admin dashboard & management | `/admin`, `/admin/events`, `/admin/events/new`, `/admin/events/[eventId]/edit` |
| `(staff)` | Door staff scanner system | `/scanner`, `/staff/login` |

## Scanner Component Architecture
The scanner UI is decomposed into reusable components in `components/scanner/`:

| Component | Responsibility |
|---|---|
| `QrReader.tsx` | Camera lifecycle (start/stop), html5-qrcode integration, viewfinder UI |
| `ScanFeedback.tsx` | Full-screen green/red overlay + result banner |
| `ManualEntry.tsx` | Manual ticket UUID input fallback |
| `WakeLock.tsx` | `useWakeLock()` hook — prevents screen dimming |
| `types.ts` | Shared types: `ScanState`, `ScanResult` |

## RBAC Enforcement (proxy.ts)
| Route | Allowed Roles | Unauthenticated Redirect |
|---|---|---|
| `/admin/*` | `admin` | → `/login` |
| `/scanner` | `scanner`, `admin` | → `/staff/login` |
| `/staff/login` | unauthenticated, `customer` | (shows form) |

Staff (`scanner` role) are **blocked** from `/admin` and redirected to `/scanner`.
Admins can access everything.

## Staff Login vs Customer Login
- `/login` — Customer login (Google + email, registration link)
- `/staff/login` — Staff-only login (email only, no registration, "Authorized Personnel Only" badge)

Staff accounts are provisioned by admins in Firestore with `role: "scanner"`.

## Capacitor Compatibility
The Capacitor native app points to `/scanner` — no config changes needed. The `(staff)` route group resolves to the same `/scanner` URL that Capacitor already uses.