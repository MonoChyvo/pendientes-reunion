import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
  apiKey: "AIzaSyA-PKTnjFdoxbHHAhpbi-p4QzVjSD8DL60",
  authDomain: "kanban-fyl.firebaseapp.com",
  databaseURL: "https://kanban-fyl-default-rtdb.firebaseio.com",
  projectId: "kanban-fyl",
  storageBucket: "kanban-fyl.firebasestorage.app",
  messagingSenderId: "467982941586",
  appId: "1:467982941586:web:4847eb0bab8b9b29dc554b"
}

const app = initializeApp(firebaseConfig)
export const db = getDatabase(app)