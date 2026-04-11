import {
  initializeApp,
  getApps,
  cert,
  type ServiceAccount,
} from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// ── Firebase Admin SDK (server-only) ─────────────────────────────────────────
// Used by the Stripe webhook and any other privileged server operations.
// Requires a service account — values come from environment variables.
// ─────────────────────────────────────────────────────────────────────────────

function getAdminApp() {
  if (getApps().length) {
    return getApps()[0];
  }

  const serviceAccount: ServiceAccount = {
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID!,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
    // The private key is stored as a single-line string in .env with literal \n.
    // We need to replace those with actual newlines.
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY!.replace(/\\n/g, "\n"),
  };

  return initializeApp({ credential: cert(serviceAccount) });
}

const adminApp = getAdminApp();
export const adminDb = getFirestore(adminApp);
export default adminApp;
