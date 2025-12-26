import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDpZXU3M85wouX3hk3aZkQqAIYAxDbCdOA",
  authDomain: "gproj1-uw.firebaseapp.com",
  projectId: "gproj1-uw",
  storageBucket: "gproj1-uw.appspot.com",
  messagingSenderId: "423445180852",
  appId: "1:423445180852:web:e21573e4bd1190965682e1"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
