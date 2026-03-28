import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDP8HtkLNdS9dZ6-CrFw_Z5nLAok-h23R0",
  authDomain: "bridgeai-cb5cc.firebaseapp.com",
  projectId: "bridgeai-cb5cc",
  storageBucket: "bridgeai-cb5cc.firebasestorage.app",
  messagingSenderId: "143800073612",
  appId: "1:143800073612:web:1e38601101b834cc766aa9",
  measurementId: "G-T2CVNVLQCZ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Firebase Login Error:", error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Firebase Logout Error:", error);
    throw error;
  }
};
