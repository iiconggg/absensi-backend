<<<<<<< HEAD
# Web Admin RT - Absensi Karyawan

## Struktur Proyek

- **backend/**  
  Berisi kode backend menggunakan Node.js, Express, dan Firebase Admin SDK.  
  - `server.js` : Server utama backend.  
  - `package.json` : Dependensi backend.  

- **frontend/**  
  Berisi kode frontend aplikasi.  
  - File JS, CSS, HTML untuk dashboard, autentikasi, dan layanan karyawan.  
  - Folder `img/` untuk aset gambar.  

- **test/**  
  Berisi file pengujian (misal `api.test.js`).  

- File konfigurasi di root:  
  - `.firebaserc`, `.gitignore`, `firebase.json`  
  - `package.json` dan `package-lock.json` (untuk frontend)  
  - `serviceAccountKey.json.json` (kunci Firebase Admin)  

## Cara Menjalankan

1. **Backend**  
   - Masuk ke folder `backend`  
   - Jalankan `npm install`  
   - Jalankan `npm start` untuk menjalankan server backend di http://localhost:3000  

2. **Frontend**  
   - Buka file `frontend/index.html` atau `frontend/dashboard.html` di browser  
   - Pastikan backend berjalan untuk API  

## Catatan

- Backend menggunakan ES Modules, pastikan Node.js versi terbaru.  
- Pastikan file `serviceAccountKey.json.json` ada dan valid.  
- Struktur sudah diorganisir agar mudah dikembangkan dan dipelihara.  
=======
# absensi-backend
>>>>>>> 773aba565c8283610386c3e00a57c0ee469d25ad
