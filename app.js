// ====== IMPORTANT ======
// Replace the firebaseConfig below with your own values from the Firebase Console (web app).
// ====== IMPORTANT ======

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// --- Your Firebase Config ---
const firebaseConfig = {
  apiKey: "AIzaSyAfTmjToH6C0Xje5zVI2ZlDFgMuz92nUXs",
  authDomain: "quizzo1-e5157.firebaseapp.com",
  projectId: "quizzo1-e5157",
  storageBucket: "quizzo1-e5157.firebasestorage.app",
  messagingSenderId: "1003232389896",
  appId: "1:1003232389896:web:9abf8f2a9f92dd94b5dabd"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// DOM elements
const signupForm = document.getElementById("signup-form");
const loginForm = document.getElementById("login-form");
const googleBtn = document.getElementById("google-signin");
const signoutBtn = document.getElementById("signout");
const messages = document.getElementById("messages");

// Optional: greeting on dashboard
const welcomeHeading = document.getElementById("welcome");

// Helper to show messages
function showMessage(msg) {
  if (messages) messages.textContent = msg;
}

// ------------- Signup with email/password -------------
// ------------- Signup with email/password -------------
if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("signup-email").value.trim();
    const password = document.getElementById("signup-password").value;
    const username = document.getElementById("signup-username").value.trim();

    if (password.length < 6) {
      showMessage("Password must be at least 6 characters.");
      return;
    }
    if (!username) {
      showMessage("Please enter a username.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      // Create a user doc in Firestore
      await setDoc(doc(db, "users", user.uid), {
        username: username,
        email: user.email,
        createdAt: serverTimestamp()
      });
      showMessage(`Account created:For ${user.email}`);
      signupForm.reset();

      // Redirect to dashboard after signup
      window.location.href = "dashboard.html";
    } catch (err) {
      showMessage(err.message);
    }
  });
}


// ------------- Login with email/password -------------
// ------------- Login with email/password -------------
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      showMessage(`Signed in: ${userCredential.user.email}`);
      loginForm.reset();

      // Redirect to dashboard after login
      window.location.href = "dashboard.html";
    } catch (err) {
      showMessage(err.message);
    }
  });
}


// ------------- Google sign-in -------------
// ------------- Google sign-in -------------
if (googleBtn) {
  googleBtn.addEventListener("click", async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      // Merge info into Firestore
      await setDoc(doc(db, "users", user.uid), {
        username: user.displayName || null,
        email: user.email,
        provider: "google",
        lastLogin: serverTimestamp()
      }, { merge: true });
      showMessage(`Signed in with Google: ${user.email}`);

      // Redirect to dashboard after google sign-in
      window.location.href = "dashboard.html";
    } catch (err) {
      showMessage(err.message);
    }
  });
}

// ------------- Sign out -------------
if (signoutBtn) {
  signoutBtn.addEventListener("click", async () => {
    await signOut(auth);
  });
}

// ------------- Auth state listener -------------
// ------------- Auth state listener -------------
onAuthStateChanged(auth, async (user) => {
  if (user) {
    // If user is on the signin page (index), send them to dashboard
    const path = window.location.pathname;
    const onIndex = path === "/" || path.endsWith("index.html") || path.includes("index.html");
    if (onIndex) {
      window.location.href = "dashboard.html";
      return;
    }

    // If this script is used on a page with a welcome heading, set the text
    try {
      const snap = await getDoc(doc(db, "users", user.uid));
      const nameToShow = snap.exists() && snap.data().username ? snap.data().username : user.email;
      if (welcomeHeading) {
        welcomeHeading.textContent = `Welcome, ${nameToShow}`;
      }
    } catch (e) {
      console.error("Failed to read user doc:", e);
    }
  } else {
    // Not logged in — leave on index or optionally show forms
    // (We don't auto-redirect to login here because this file runs on the login page.)
  }
});

