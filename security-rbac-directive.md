# Neon Ticketing: Role-Based Access Control (RBAC)

## User Roles
Every user document in Firestore (`/users/{userId}`) must now include a `role` field.
- `role: 'admin'` (Access to EVERYTHING, including financial dashboards).
- `role: 'scanner'` (Strictly limited access).
- `role: 'customer'` (Default, can only view their own tickets).

## Next.js Middleware Routing Rules
Update `middleware.ts` to strictly enforce these boundaries:
1. **`/admin/*` routes:** If a user is authenticated but has `role: 'scanner'` or `role: 'customer'`, immediately redirect them to `/unauthorized` or `/login`.
2. **`/scanner/*` routes:** Only allow users with `role: 'scanner'` (or 'admin'). 
3. **Login Redirects:** When a user logs in, check their role. 
   - Admins go to `/admin`.
   - Scanners go directly to `/scanner`.

## Firestore Security Rules
Ensure Firestore rules match the middleware. A user with `role: 'scanner'` can ONLY `read` and `update` documents in the `/tickets` collection. They cannot read `/events` revenue or `/users`.