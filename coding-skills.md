# AI Coding Standards & Behavior

## 1. Zero Placeholder Policy
- You are writing code for a fast-moving production environment. Do not use placeholders like `// TODO: add Stripe logic here` or `// implement error handling`. 
- Write complete, fully functional, ready-to-run files. If you lack context to finish a file, ask for it.

## 2. Component Architecture
- Default to React Server Components (RSC). Only use `'use client'` when React hooks (`useState`, `useEffect`) or the Stripe Payment Element strictly require it.
- Use `shadcn/ui` for all complex interactive elements (Dialogs, Selects, Toasts).

## 3. Error Handling & State
- All Server Actions and Firebase queries must be wrapped in `try/catch` blocks.
- Return standardized error objects from Server Actions (e.g., `{ success: false, error: "Message" }`) so the frontend can display them via toast notifications.

## 4. Environment Variables
- Never hardcode API keys. Always use `process.env.STRIPE_SECRET_KEY` for server-side code and `process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` for client-side code.