import express from 'express';
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());


const serviceAccountPath = path.resolve('serviceAccountKey.json.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

app.get('/', (req, res) => {
  res.send('Backend server is running');
});

app.get('/api/absensi', async (req, res, next) => {
  try {
    const snapshot = await db.collection('absensi').orderBy('waktu', 'desc').get();
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(data);
  } catch (err) {
    next(err);
  }
});

app.get('/api/statistik', async (req, res, next) => {
  try {
    const snapshot = await db.collection('absensi').get();

    const statistik = {};

    snapshot.forEach(doc => {
      const data = doc.data();
      const tanggal = data.tanggal || 'unknown';
      const status = data.status || 'unknown';

      if (!statistik[tanggal]) statistik[tanggal] = {};
      if (!statistik[tanggal][status]) statistik[tanggal][status] = 0;

      statistik[tanggal][status]++;
    });

    res.json(statistik);
  } catch (err) {
    next(err);
  }
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
