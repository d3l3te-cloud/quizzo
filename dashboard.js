// dashboard.js
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  query,
  orderBy,
  getDocs
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// ====== Your Firebase Config ======
const firebaseConfig = {
  apiKey: "AIzaSyAfTmjToH6C0Xje5zVI2ZlDFgMuz92nUXs",
  authDomain: "quizzo1-e5157.firebaseapp.com",
  projectId: "quizzo1-e5157",
  storageBucket: "quizzo1-e5157.firebasestorage.app",
  messagingSenderId: "1003232389896",
  appId: "1:1003232389896:web:9abf8f2a9f92dd94b5dabd"
};

// Initialize Firebase only if not already
if (!getApps().length) initializeApp(firebaseConfig);

const auth = getAuth();
const db = getFirestore();

// DOM elements
const userEmailEl = document.getElementById("user-email");
const welcomeEl = document.getElementById("welcome");
const startBtn = document.getElementById("start-quiz");
const signoutBtn = document.getElementById("signout");
const resultsTable = document.getElementById("results-table");
const resultsBody = document.getElementById("results-body");
const noData = document.getElementById("no-data");

// Start Quiz button
startBtn.addEventListener("click", () => {
  // adjust filename if your quiz has a different name
  window.location.href = "ab.html";
});

// Sign out button
signoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

// Auth state listener
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    // Not logged in → redirect
    window.location.href = "index.html";
    return;
  }

  // Show email
  userEmailEl.textContent = user.email ||"";

  
  // Fetch quiz results
  try {
    const resultsCol = collection(db, "users", user.uid, "results");
    const q = query(resultsCol, orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    resultsBody.innerHTML = "";

    if (snap.empty) {
      resultsTable.style.display = "none";
      noData.style.display = "block";
      return;
    }

    noData.style.display = "none";
    resultsTable.style.display = "table";

    let i = 1;
    snap.forEach(docSnap => {
      const r = docSnap.data();
      const date = r.createdAt?.toDate
        ? r.createdAt.toDate()
        : (r.createdAt ? new Date(r.createdAt.seconds * 1000) : new Date());
      const dateStr = date.toLocaleString();

      const minutes = String(Math.floor((r.totalSeconds || 0) / 60)).padStart(2, "0");
      const seconds = String((r.totalSeconds || 0) % 60).padStart(2, "0");
      const timeStr = `${minutes}:${seconds}`;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${i++}</td>
        <td>${r.score ?? "-"}</td>
        <td>${r.totalQuestions ?? "-"}</td>
        <td>${timeStr}</td>
        <td>${dateStr}</td>
      `;
      resultsBody.appendChild(tr);
    });
  } catch (e) {
    console.error("Failed to load results:", e);
    noData.textContent = "Failed to load results.";
  }
  welcomeEl.textContent = `Welcome ${user.username || ""}`;
});
