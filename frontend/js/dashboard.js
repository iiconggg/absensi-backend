/**
 * dashboard.js
 * 
 * File ini mengatur logika utama untuk halaman dashboard admin.
 * Menggunakan Firebase Authentication dan Firestore untuk autentikasi,
 * pengelolaan data karyawan, pengajuan cuti, dan statistik absensi.
 * 
 * Fitur utama:
 * - Cek autentikasi dan peran admin
 * - Menampilkan data karyawan secara real-time
 * - Membuat user baru dengan password default
 * - Menyimpan data karyawan dan pengguna
 * - Mengelola pengajuan cuti dengan fitur setujui/tolak
 * - Menampilkan grafik statistik absensi menggunakan Chart.js
 */

import { initializeApp, deleteApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import {
    getFirestore,
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    setDoc,
    onSnapshot,
    getDocs
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import {
    getAuth,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import {
    initializeApp as initializeSecondaryApp
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import {
    getAuth as getSecondaryAuth,
    createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

// Konfigurasi Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAVRR5m7HHw8yMeq9n5lauNGtZRNoNRlVM",
    authDomain: "absensi-karyawans.firebaseapp.com",
    projectId: "absensi-karyawans",
    storageBucket: "absensi-karyawans.appspot.com",
    messagingSenderId: "962962836926",
    appId: "1:962962836926:web:a5f89ad94e1b1fdef",
};

// Inisialisasi Firebase utama
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const karyawansRef = collection(db, "karyawans");
const absensiRef = collection(db, "absensi");

  
// Elemen form dan daftar karyawan
const form = document.getElementById("employee-form");
const list = document.getElementById("employee-list");
const cancelBtn = document.getElementById("cancel-edit");

let editId = null;


// Cek autentikasi dan peran admin
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        alert("Silakan login terlebih dahulu.");
        window.location.href = "index.html";
    } else {
        const tokenResult = await user.getIdTokenResult(true);
        if (tokenResult.claims.admin !== true) {
            alert("❌ Anda bukan admin");
            await signOut(auth);
            window.location.href = "index.html";
        }
    }
});

// Menampilkan data karyawan secara real-time
onSnapshot(karyawansRef, (snapshot) => {
    list.innerHTML = "";
    snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const tr = document.createElement("tr");
        tr.innerHTML = `
  <td>
    <strong>${data.nama}</strong><br>
    <small style="color: #6b7280;">${data.email}</small>
  </td>
  <td>${data.status}</td>
  <td>
    <button class="edit-btn" onclick="editEmployee('${docSnap.id}', '${data.nama}', '${data.email}', '${data.status}')">✏️ Edit</button>
    <button class="delete-btn" onclick="deleteEmployee('${docSnap.id}')">🗑️ Hapus</button>
  </td>
`;
        list.appendChild(tr);
    });
}, (error) => {
    console.error("❌ Gagal memuat data karyawan:", error);
    list.innerHTML = '<tr><td colspan="3" style="color: red; text-align: center;">Gagal memuat data karyawan. Periksa koneksi dan ekstensi browser Anda.</td></tr>';
});

// Menampilkan daftar karyawan yang sudah absensi
const attendanceList = document.getElementById("attendance-list");

onSnapshot(absensiRef, (snapshot) => {
    attendanceList.innerHTML = "";
    snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const waktuFormatted = data.waktu && data.waktu.toDate ? data.waktu.toDate().toLocaleString() : "";
        const ip = data.ip || "";
        const keterangan = data.keterangan || "";
        attendanceList.innerHTML += `
  <tr>
    <td>${data.email || ""}</td>
    <td>${data.status || ""}</td>
    <td>${ip}</td>
    <td>${keterangan}</td>
    <td>${waktuFormatted}</td>
  </tr>
`;
    });
}, (error) => {
    console.error("❌ Gagal memuat data absensi:", error);
    attendanceList.innerHTML = '<tr><td colspan="5" style="color: red; text-align: center;">Gagal memuat data absensi. Periksa koneksi dan ekstensi browser Anda.</td></tr>';
});

// Membuat app sekunder untuk membuat user baru
let secondaryApp = null;
let secondaryAuth = null;

function initSecondaryApp() {
    if (!secondaryApp) {
        secondaryApp = initializeSecondaryApp(firebaseConfig, "Secondary");
        secondaryAuth = getSecondaryAuth(secondaryApp);
    }
}

function cleanupSecondaryApp() {
    if (secondaryApp) {
        deleteApp(secondaryApp).catch((err) => {
            console.warn("⚠️ Gagal menghapus secondaryApp:", err.message);
        });
        secondaryApp = null;
        secondaryAuth = null;
    }
}

// Event listener submit form tambah/edit karyawan
form.addEventListener("submit", async function(e) {
    e.preventDefault();
    const nama = (form.nama && form.nama.value) ? form.nama.value.trim() : '';
    const email = (form.email && form.email.value) ? form.email.value.trim() : '';
    const status = (form.status && form.status.value) ? form.status.value.trim() : '';

    if (!nama || !email || !status) {
        alert("⚠️ Semua field wajib diisi!");
        return;
    }

    if (editId) {
        // Update data karyawan
        await updateDoc(doc(db, "karyawans", editId), { nama, email, status });
        editId = null;
        cancelBtn.style.display = "none";
    } else {
        try {
            const defaultPassword = "12345678";

            initSecondaryApp();

            // 1. Coba buat user baru dengan password default
            try {
                await createUserWithEmailAndPassword(secondaryAuth, email, defaultPassword);
                console.log("✅ User baru berhasil dibuat.");
            } catch (err) {
                if (err.code === 'auth/email-already-in-use') {
                    console.warn("⚠️ Email sudah terdaftar, lanjutkan tanpa createUser.");
                } else {
                    throw err;
                }
            }

            // 2. Simpan data ke koleksi 'users'
            await setDoc(doc(db, "users", email), {
                nama,
                email,
                status,
                role: "karyawan"
            });

            // 3. Simpan data ke koleksi 'karyawans'
            await addDoc(karyawansRef, { nama, email, status });

            alert(`✅ Karyawan berhasil ditambahkan.\nPassword default: ${defaultPassword}`);
        } catch (err) {
            alert("❌ Gagal menambahkan karyawan: " + err.message);
            console.error(err);
        } finally {
            cleanupSecondaryApp();
        }
    }
    form.reset();
});

// Fungsi hapus karyawan dengan konfirmasi
window.deleteEmployee = async (id) => {
    if (confirm("Yakin ingin menghapus?")) {
        await deleteDoc(doc(db, "karyawans", id));
    }
};

// Fungsi isi form untuk edit data karyawan
window.editEmployee = (id, nama, email, status) => {
    form.nama.value = nama;
    form.email.value = email;
    form.status.value = status;
    editId = id;
    cancelBtn.style.display = "inline-block";
};

// Event listener tombol batal edit
cancelBtn.addEventListener("click", () => {
    form.reset();
    editId = null;
    cancelBtn.style.display = "none";
});

// Event listener tombol logout
document.getElementById("logout-btn").addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "index.html";
});


const cutiRef = collection(db, "cuti");
const cutiList = document.getElementById("cuti-list");


try {
    onSnapshot(cutiRef, (snapshot) => {
        cutiList.innerHTML = "";

        snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const mulai = (data.tanggalMulai && data.tanggalMulai.toDate) ? data.tanggalMulai.toDate().toLocaleDateString() : "-";
            const selesai = (data.tanggalSelesai && data.tanggalSelesai.toDate) ? data.tanggalSelesai.toDate().toLocaleDateString() : "-";

            const li = document.createElement("li");
            li.classList.add("cuti-item");

            li.innerHTML = '<div class="cuti-info">' +
                '<strong>' + data.email + '</strong><br>' +
                'Alasan: ' + data.alasan + '<br>' +
                'Tanggal: ' + mulai + ' s/d ' + selesai + '<br>' +
                'Status: <span style="color: ' + (data.status === "Disetujui" ? "#4caf50" :
                    data.status === "Ditolak" ? "#f44336" :
                        "#ff9800") + '">' + data.status + '</span>' +
                '</div>' +
                (data.status === "Menunggu"
                    ? `<div class="cuti-actions">
                    <button class="approve-btn" onclick="setujuiCuti('${docSnap.id}')">✅ Setujui</button>
                    <button class="reject-btn" onclick="tolakCuti('${docSnap.id}')">❌ Tolak</button>
                    </div>`
                    : '');

            cutiList.appendChild(li);
        });
    });

} catch (err) {
    console.error("❌ Gagal mengambil data cuti:", err.message);
}


window.setujuiCuti = async (id) => {
    await updateDoc(doc(db, "cuti", id), { status: "Disetujui" });
};


window.setujuiSemuaCuti = async () => {
    try {
        const q = query(collection(db, "cuti"), where("status", "==", "Menunggu"));
        const querySnapshot = await getDocs(q);
        const batch = db.batch ? db.batch() : null;

        if (!batch) {
            
            for (const docSnap of querySnapshot.docs) {
                await updateDoc(doc(db, "cuti", docSnap.id), { status: "Disetujui" });
            }
        } else {
            querySnapshot.forEach((docSnap) => {
                const docRef = doc(db, "cuti", docSnap.id);
                batch.update(docRef, { status: "Disetujui" });
            });
            await batch.commit();
        }
        alert("✅ Semua pengajuan cuti telah disetujui.");
    } catch (error) {
        console.error("❌ Gagal menyetujui semua pengajuan cuti:", error);
        alert("Gagal menyetujui semua pengajuan cuti.");
    }
};


document.getElementById("approve-all").addEventListener("click", () => {
    window.setujuiSemuaCuti();
});


window.tolakCuti = async (id) => {
    await updateDoc(doc(db, "cuti", id), { status: "Ditolak" });
};


const ctx = document.getElementById("absensiChart").getContext("2d");

// Fungsi mengambil data absensi dan menampilkan grafik statistik
async function loadAbsensiChart() {
    const snapshot = await getDocs(absensiRef);

    const statistik = {
        Hadir: 0,
        Izin: 0,
        Sakit: 0,
        Alpha: 0,
    };

    snapshot.forEach(doc => {
        const data = doc.data();
        const status = data.status;
        if (statistik[status] !== undefined) {
            statistik[status]++;
        }
    });

    // Membuat gradasi warna untuk setiap status
    const gradientColors = [
        ctx.createLinearGradient(0, 0, 0, 400),
        ctx.createLinearGradient(0, 0, 0, 400),
        ctx.createLinearGradient(0, 0, 0, 400),
        ctx.createLinearGradient(0, 0, 0, 400),
    ];

    gradientColors[0].addColorStop(0, '#4caf50');
    gradientColors[0].addColorStop(1, '#81c784');

    gradientColors[1].addColorStop(0, '#ff9800');
    gradientColors[1].addColorStop(1, '#ffb74d');

    gradientColors[2].addColorStop(0, '#03a9f4');
    gradientColors[2].addColorStop(1, '#4fc3f7');

    gradientColors[3].addColorStop(0, '#f44336');
    gradientColors[3].addColorStop(1, '#e57373');

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: Object.keys(statistik),
            datasets: [{
                label: 'Jumlah Absensi',
                data: Object.values(statistik),
                fill: true,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 3,
                tension: 0.4,
                pointBackgroundColor: 'rgba(75, 192, 192, 1)',
                pointRadius: 6,
                pointHoverRadius: 8,
                cubicInterpolationMode: 'monotone'
            }]
        },
        options: {
            responsive: true,
            animation: {
                duration: 1200,
                easing: 'easeOutQuart'
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    },
                    grid: {
                        drawBorder: false,
                        color: '#e0e0e0'
                    }
                },
                x: {
                    grid: {
                        drawBorder: false,
                        color: '#e0e0e0'
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: '#333',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    }
                },
                tooltip: {
                    enabled: true,
                    backgroundColor: '#333',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    cornerRadius: 6,
                    padding: 10,
                }
            }
        }
    });
}

// Memanggil fungsi untuk menampilkan grafik absensi saat halaman dimuat
loadAbsensiChart();
