// firebaseConfig.ts

import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyBkEtsGUB3mRzbi8-zj1BV7sPjd279GA4c",
  authDomain: "dekao-gg.firebaseapp.com",
  projectId: "dekao-gg",
  storageBucket: "dekao-gg.appspot.com",
  messagingSenderId: "952726204332",
  appId: "1:952726204332:web:a62367f3584289ee899409",
  measurementId: "G-V3Y210YN7S"
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

export { app, db }
