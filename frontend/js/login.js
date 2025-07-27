import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAVRR5m7HHw8yMeq9n5lauNGtZRNoNRlVM",
  authDomain: "absensi-karyawans.firebaseapp.com",
  projectId: "absensi-karyawans",
  storageBucket: "absensi-karyawans.appspot.com",
  messagingSenderId: "962962836926",
  appId: "1:962962836926:web:a5f89ad94a5964e1b1fdef",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // ⛔️ WAJIB: cek custom claim admin
    const token = await user.getIdTokenResult(true); // force refresh

    if (token.claims.admin === true) {
      // ✅ Redirect ke dashboard jika admin
      window.location.href = "frontend/pages/dashboard.html";
    } else {
      alert("❌ Anda bukan admin");
    }

  } catch (err) {
    alert("❌ Login gagal: " + err.message);
  }
});

