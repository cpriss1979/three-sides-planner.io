// firebase-init.js — shared Firebase v10 ESM init
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
    initializeFirestore,
    persistentLocalCache,
    persistentMultipleTabManager,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAIB1E3TL9EchtDDvFL69AnP7x9_OlDwj4",
    authDomain: "threesidesapp.firebaseapp.com",
    projectId: "threesidesapp",
    storageBucket: "threesidesapp.appspot.com",
    messagingSenderId: "203058316349",
    appId: "1:203058316349:web:d6c53c82310aa1a03b9654",
};

const app = initializeApp(firebaseConfig);

// Fast, offline-friendly Firestore (multi-tab safe)
const db = initializeFirestore(app, {
    localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
    }),
});

const auth = getAuth(app);

console.info("[firebase-init] loaded");
export { app, auth, db };
