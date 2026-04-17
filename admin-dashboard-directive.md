# Neon Ticketing: Admin Dashboard Architecture

## UI & Layout Strategy
- **Framework:** Next.js App Router (`app/(admin)/admin/`).
- **Components:** Strictly use `shadcn/ui`. We will heavily rely on `DataTable` (for sorting/filtering tickets and logs), `Dialog` (for editing details), `Card` (for high-level metrics), and `recharts` (for visual data).
- **Layout:** A persistent sidebar navigation with the following routes:
  - `/admin` (Overview metrics & Live Occupancy)
  - `/admin/events` (Create, Update, Delete events)
  - `/admin/tickets` (Master ticket list, manual status overrides)
  - `/admin/users` (RBAC management, assign 'scanner' or 'admin' roles)
  - `/admin/logs` (Audit trail and scan history)

## Required Libraries
- `xlsx`: For generating and downloading Excel audit reports directly from the browser.
- `recharts`: For generating revenue and attendance graphs.
- `date-fns`: For formatting timestamps consistently.

## Database Schema Updates (Audit Trail)
Create a new Firestore collection: `/audit_logs/{logId}`
- `adminId` (Who did it)
- `action` (e.g., 'MANUAL_STATUS_OVERRIDE', 'ROLE_CHANGED', 'EVENT_CREATED')
- `targetId` (The ticketId or userId affected)
- `timestamp`
- `details` (String describing the change, e.g., "Changed ticket xyz status from scanned to active")

## Security & Data Fetching
- All routes inside `(admin)` MUST be protected by Next.js middleware ensuring the user has `role: 'admin'`. 
- **Server Components:** Use Next.js Server Components to fetch the initial bulk data (Events, Total Revenue) for fast loading.
- **Client Components:** Use Client Components for the DataTables so admins can instantly search by Name, Email, or Ticket UUID without waiting for server roundtrips.
- **Manual Overrides:** Any time an admin manually changes a ticket status or user role, a Next.js Server Action must execute the change AND write a record to the `/audit_logs` collection in a single Firebase batch operation.