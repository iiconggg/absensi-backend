/**
 * admin-auth.js
 * 
 * File ini mengatur autentikasi pengguna menggunakan Firebase Authentication,
 * serta pengelolaan data karyawan (CRUD) menggunakan Firestore.
 * Fungsi utama meliputi login, pengecekan status autentikasi, logout,
 * dan pengelolaan data karyawan dengan memanfaatkan modul employeeService.js.
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import {
  loadEmployees,
  addEmployee,
  updateEmployee,
  deleteEmployee
} from "./employeeService.js";

// Konfigurasi Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAVRR5m7HHw8yMeq9n5lauNGtZRNoNRlVM",
  authDomain: "absensi-karyawans.firebaseapp.com",
  databaseURL: "https://absensi-karyawans-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "absensi-karyawans",
  storageBucket: "absensi-karyawans.appspot.com",
  messagingSenderId: "962962836926",
  appId: "1:962962836926:web:a5f89ad94e1b1fdef",
  measurementId: "G-LJ913NWHX5"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Elemen form login dan pesan error
const loginForm = document.getElementById("login-form");
const loginError = document.getElementById("login-error");

// Event listener untuk form login
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  try {
    // Melakukan login dengan email dan password
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("✅ Login berhasil:", userCredential.user);
  } catch (err) {
    // Menampilkan pesan error jika login gagal
    console.error("❌ Login gagal:", err.code, err.message);
    loginError.textContent = err.message;
  }
});

// Elemen bagian login dan dashboard untuk pengaturan tampilan
const loginSection = document.getElementById("login-section");
const dashboardSection = document.getElementById("dashboard-section");

// Memantau status autentikasi pengguna secara real-time
onAuthStateChanged(auth, async (user) => {
  if (user) {
    // Mendapatkan token dan memeriksa apakah pengguna adalah admin
    const idTokenResult = await user.getIdTokenResult();
    const isAdmin = idTokenResult.claims.admin === true;

    if (isAdmin) {
      // Jika admin, sembunyikan bagian login dan tampilkan dashboard
      loginSection.style.display = "none";
      dashboardSection.style.display = "block";

      // Memuat data karyawan secara real-time dan menampilkan
      loadEmployees(db, (snapshot) => {
        const list = document.getElementById("employee-list");
        list.innerHTML = "";
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const li = document.createElement("li");
          li.innerHTML = `
            <strong>${data.name}</strong> (${data.email} - ${data.position})
            <button onclick="editEmployee('${docSnap.id}', '${data.name}', '${data.email}', '${data.position}')">✏️ Edit</button>
            <button onclick="deleteEmployeeHandler('${docSnap.id}')">🗑️ Hapus</button>
          `;
          list.appendChild(li);
        });
      });
    } else {
      // Jika bukan admin, tampilkan pesan dan logout
      alert("❌ Anda bukan admin.");
      await signOut(auth);
    }
  } else {
    // Jika tidak login, tampilkan bagian login dan sembunyikan dashboard
    loginSection.style.display = "block";
    dashboardSection.style.display = "none";
  }
});

// Event listener tombol logout
document.getElementById("logout-btn").addEventListener("click", async () => {
  await signOut(auth);
});

// Elemen form pengelolaan karyawan
const form = document.getElementById("employee-form");
const cancelBtn = document.getElementById("cancel-edit");
let editId = null;

// Event listener untuk submit form tambah/edit karyawan
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = form.name.value;
  const email = form.email.value;
  const position = form.position.value;

  if (editId) {
    // Jika editId ada, update data karyawan
    await updateEmployee(db, editId, { name, email, position });
    editId = null;
    cancelBtn.style.display = "none";
  } else {
    // Jika tidak, tambah data karyawan baru
    await addEmployee(db, { name, email, position });
  }

  form.reset();
});

// Fungsi untuk menghapus karyawan dengan konfirmasi
window.deleteEmployeeHandler = async (id) => {
  if (confirm("Yakin ingin menghapus?")) {
    await deleteEmployee(db, id);
  }
};

// Fungsi untuk mengisi form dengan data karyawan yang akan diedit
window.editEmployee = (id, name, email, position) => {
  form.name.value = name;
  form.email.value = email;
  form.position.value = position;
  editId = id;
  cancelBtn.style.display = "inline-block";
};

// Event listener tombol batal edit
cancelBtn.addEventListener("click", () => {
  form.reset();
  editId = null;
  cancelBtn.style.display = "none";
});
