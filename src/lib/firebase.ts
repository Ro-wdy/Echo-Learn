import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, browserPopupRedirectResolver } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider, browserPopupRedirectResolver);
    return result.user;
  } catch (error: any) {
    console.error("Error signing in with Google:", error.code, error.message);
    if (error.code === 'auth/popup-blocked') {
      alert("Popup blocked! Please allow popups or use a new tab.");
    } else if (error.code === 'auth/unauthorized-domain') {
      const hostname = window.location.hostname;
      console.error("UNAUTHORIZED DOMAIN:", hostname);
      alert(`Domain Unauthorized!\n\nYour current domain "${hostname}" is not authorized in your Firebase Console.\n\nTo fix this:\n1. Go to Firebase Console > Authentication > Settings > Authorized Domains\n2. Click "Add domain"\n3. Add exactly: ${hostname}\n\nNote: You MUST add both the 'ais-dev' and 'ais-pre' domains if you use both.`);
    } else if (error.code === 'auth/popup-closed-by-user') {
      const hostname = window.location.hostname;
      alert(`Sign-in failed: Popup was closed before completion.\n\nThis is usually because the domain "${hostname}" is NOT authorized. Check your console for details.`);
    } else if (error.code === 'auth/network-request-failed') {
      alert("Network error: This often happens if cross-domain cookies are blocked. Try opening the app in a new tab using the URL in the top right.");
    } else {
      alert(`Sign-in failed (${error.code}): ${error.message}`);
    }
    throw error;
  }
};

export const logout = () => signOut(auth);
