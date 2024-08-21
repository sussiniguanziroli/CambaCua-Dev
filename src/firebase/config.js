// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
    apiKey: "AIzaSyBowZR1GQErtsxNP4Js_LUSYwHFqkK4loY",
    authDomain: "cambacuavet-d3dfc.firebaseapp.com",
    projectId: "cambacuavet-d3dfc",
    storageBucket: "cambacuavet-d3dfc.appspot.com",
    messagingSenderId: "663520601034",
    appId: "1:663520601034:web:b426d53675faeb18e42533",
    measurementId: "G-WZT4ZJQSDX"
  };
// Inicializar Firebase solo si no está inicializado previamente

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

