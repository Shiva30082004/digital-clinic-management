import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { NextRouter } from "next/router";

export const getFirebaseAuth = () => {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
  };

  // Check if Firebase app is already initialized
  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

  return getAuth(app);
};

const publicRoutes = ["/login", "/signup"];

export const checkAuthStatus = async (endpoint: string, router: NextRouter) => {
  const auth = getFirebaseAuth();
  await auth.authStateReady();

  let token = "";

  if (!endpoint.includes("/auth")) {
    if (publicRoutes.includes(endpoint)) {
      if (auth?.currentUser) {
        router.push("/");
        return token;
      }
    } else {
      if (!auth?.currentUser) {
        router.push("/login");
        return token;
      } else {
        token = (await auth.currentUser.getIdToken()) || "";
      }
    }
  }

  return token;
};
