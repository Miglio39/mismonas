import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBeCXmUUstGNmoq1VfD5POvApa1_xNTM_o",
  authDomain: "paniniapp2026.firebaseapp.com",
  projectId: "paniniapp2026",
  storageBucket: "paniniapp2026.firebasestorage.app",
  messagingSenderId: "18416825568",
  appId: "1:18416825568:web:67372d3010b253a88bcc85"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar Auth y Base de Datos para usarlos en la app
export const auth = getAuth(app);
export const db = getFirestore(app);