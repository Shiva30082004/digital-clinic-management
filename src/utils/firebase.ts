import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { NextRouter } from "next/router";

export const getFirebaseAuth = () => {
  const firebaseConfig = {
    
    authDomain: "sequelite-102.firebaseapp.com",
    projectId: "sequelite-102",
    storageBucket: "sequelite-102.firebasestorage.app",
    messagingSenderId: "153046959301",
    appId: "1:153046959301:web:38a205c5020164b2a81cac"
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
