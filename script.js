// Inisialisasi Firebase menggunakan compat
const firebaseConfig = {
  apiKey: "AIzaSyAVRR5m7HHw8yMeq9n5lauNGtZRNoNRlVM",
  authDomain: "absensi-karyawans.firebaseapp.com",
  databaseURL: "https://absensi-karyawans-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "absensi-karyawans",
  storageBucket: "absensi-karyawans.appspot.com",
  messagingSenderId: "962962836926",
  appId: "1:962962836926:web:a5f89ad94a5964e1b1fdef",
  measurementId: "G-LJ913NWHX5"
};

// Initialize Firebase compat
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const employeesRef = database.ref('karyawans');

// Tampilkan data
function displayEmployees(employees) {
    const employeeList = document.getElementById('employee-list');
    employeeList.innerHTML = '';

    for (const id in employees) {
        const e = employees[id];
        const li = document.createElement('li');
        li.textContent = `${e.name} (${e.email} - ${e.position})`;
        employeeList.appendChild(li);
    }
}

employeesRef.on('value', (snapshot) => {
    const data = snapshot.val();
    if (data) displayEmployees(data);
});

// Tambah karyawan
const form = document.getElementById('add-employee-form');
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const position = document.getElementById('position').value;

    employeesRef.push({ name, email, position })
      .then(() => {
        alert('✅ Karyawan berhasil ditambahkan');
        form.reset();
      })
      .catch((err) => {
        alert('❌ Gagal menambahkan: ' + err.message);
      });
});
