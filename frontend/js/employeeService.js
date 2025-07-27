/**
 * employeeService.js
 * 
 * Modul ini menyediakan fungsi CRUD (Create, Read, Update, Delete) yang umum digunakan
 * untuk mengelola data karyawan ("karyawans") di Firestore.
 * Modul ini dirancang untuk diimpor dan digunakan oleh admin-auth.js dan admin-dashboard.js
 */

import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

/**
 * Memuat data karyawan secara real-time dan memanggil fungsi renderCallback untuk menampilkan data.
 * @param {Firestore} db - Instance database Firestore
 * @param {function} renderCallback - Fungsi callback untuk merender data karyawan, menerima snapshot
 * 
 * Fungsi ini membuat listener real-time pada koleksi "karyawans" di Firestore.
 * Setiap kali data berubah, renderCallback akan dipanggil dengan snapshot terbaru.
 */
export function loadEmployees(db, renderCallback) {
  const karyawansRef = collection(db, "karyawans");
  return onSnapshot(karyawansRef, renderCallback);
}

/**
 * Menambahkan data karyawan baru ke Firestore.
 * @param {Firestore} db - Instance database Firestore
 * @param {Object} employeeData - Objek yang berisi data karyawan (name, email, position/status)
 * 
 * Fungsi ini menambahkan dokumen baru ke koleksi "karyawans" dengan data yang diberikan.
 */
export async function addEmployee(db, employeeData) {
  const karyawansRef = collection(db, "karyawans");
  await addDoc(karyawansRef, employeeData);
}

/**
 * Memperbarui data karyawan yang sudah ada di Firestore.
 * @param {Firestore} db - Instance database Firestore
 * @param {string} id - ID dokumen karyawan yang akan diperbarui
 * @param {Object} employeeData - Objek yang berisi data karyawan yang diperbarui
 * 
 * Fungsi ini memperbarui dokumen dengan ID yang diberikan di koleksi "karyawans".
 */
export async function updateEmployee(db, id, employeeData) {
  const docRef = doc(db, "karyawans", id);
  await updateDoc(docRef, employeeData);
}

/**
 * Menghapus data karyawan dari Firestore.
 * @param {Firestore} db - Instance database Firestore
 * @param {string} id - ID dokumen karyawan yang akan dihapus
 * 
 * Fungsi ini menghapus dokumen dengan ID yang diberikan dari koleksi "karyawans".
 */
export async function deleteEmployee(db, id) {
  const docRef = doc(db, "karyawans", id);
  await deleteDoc(docRef);
}
