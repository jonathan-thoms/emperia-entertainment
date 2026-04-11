"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

// ── Types ──────────────────────────────────────────────────────────────────────
export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: "customer" | "admin";
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// ── Provider ───────────────────────────────────────────────────────────────────
const googleProvider = new GoogleAuthProvider();

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // ── Fetch or create Firestore user profile ─────────────────────────────────
  const fetchOrCreateProfile = useCallback(async (firebaseUser: User): Promise<UserProfile> => {
    const userRef = doc(db, "users", firebaseUser.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: data.displayName ?? firebaseUser.displayName,
        photoURL: data.photoURL ?? firebaseUser.photoURL,
        role: data.role ?? "customer",
      };
    }

    // First-time user — create doc
    const newProfile: UserProfile = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      role: "customer",
    };

    await setDoc(userRef, {
      ...newProfile,
      createdAt: serverTimestamp(),
    });

    return newProfile;
  }, []);

  // ── Auth state listener ────────────────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const p = await fetchOrCreateProfile(firebaseUser);
          setProfile(p);
        } catch (err) {
          console.error("[AuthProvider] Error fetching profile:", err);
          setProfile(null);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [fetchOrCreateProfile]);

  // ── Email sign-in ──────────────────────────────────────────────────────────
  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      try {
        await signInWithEmailAndPassword(auth, email, password);
        return { success: true };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Sign in failed.";
        return { success: false, error: msg };
      }
    },
    []
  );

  // ── Email sign-up ──────────────────────────────────────────────────────────
  const signUpWithEmail = useCallback(
    async (email: string, password: string, name: string) => {
      try {
        const { user: newUser } = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(newUser, { displayName: name });
        return { success: true };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Sign up failed.";
        return { success: false, error: msg };
      }
    },
    []
  );

  // ── Google sign-in ─────────────────────────────────────────────────────────
  const signInWithGoogle = useCallback(async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Google sign in failed.";
      return { success: false, error: msg };
    }
  }, []);

  // ── Sign out ───────────────────────────────────────────────────────────────
  const signOut = useCallback(async () => {
    await firebaseSignOut(auth);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ───────────────────────────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
