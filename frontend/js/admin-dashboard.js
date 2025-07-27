/**
 * admin-dashboard.js
 * 
 * File ini mengatur tampilan dan pengelolaan data karyawan pada dashboard admin.
 * Menggunakan Firebase Firestore untuk menyimpan dan mengambil data karyawan secara real-time.
 * Fungsi utama meliputi render data karyawan, tambah, edit, hapus data karyawan,
 * serta pengelolaan form input dan interaksi pengguna.
 * Modul employeeService.js digunakan untuk operasi CRUD data karyawan.
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
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
const analytics = getAnalytics(app);
const db = getFirestore(app);

// Elemen form dan daftar karyawan
const form = document.getElementById("employee-form");
const list = document.getElementById("employee-list");
const cancelBtn = document.getElementById("cancel-edit");

let editId = null;

/**
 * Fungsi untuk merender daftar karyawan ke dalam elemen list.
 * Dipanggil setiap kali data karyawan berubah (real-time).
 * @param {QuerySnapshot} snapshot - Snapshot data karyawan dari Firestore
 */
function renderEmployees(snapshot) {
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
}

// Memulai listener real-time untuk data karyawan dan merendernya
loadEmployees(db, renderEmployees);

// Event listener untuk submit form tambah/edit karyawan
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = form.name.value;
  const email = form.email.value;
  const position = form.position.value;

  if (editId) {
    // Update data karyawan jika sedang dalam mode edit
    await updateEmployee(db, editId, { name, email, position });
    editId = null;
    cancelBtn.style.display = "none";
  } else {
    // Tambah data karyawan baru
    await addEmployee(db, { name, email, position });
  }

  form.reset();
});

/**
 * Fungsi untuk menghapus data karyawan dengan konfirmasi pengguna.
 * @param {string} id - ID dokumen karyawan yang akan dihapus
 */
window.deleteEmployeeHandler = async (id) => {
  if (confirm("Yakin ingin menghapus?")) {
    await deleteEmployee(db, id);
  }
};

/**
 * Fungsi untuk mengisi form dengan data karyawan yang akan diedit.
 * @param {string} id - ID dokumen karyawan
 * @param {string} name - Nama karyawan
 * @param {string} email - Email karyawan
 * @param {string} position - Posisi atau jabatan karyawan
 */
window.editEmployee = (id, name, email, position) => {
  form.name.value = name;
  form.email.value = email;
  form.position.value = position;
  editId = id;
  cancelBtn.style.display = "inline-block";
};

// Event listener tombol batal edit untuk mereset form dan membatalkan mode edit
cancelBtn.addEventListener("click", () => {
  form.reset();
  editId = null;
  cancelBtn.style.display = "none";
});
