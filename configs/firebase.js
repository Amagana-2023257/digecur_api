import admin from 'firebase-admin';
import { config } from 'dotenv';
config();

const serviceAccount = {
  projectId: process.env.PROJECT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
};

console.log("Iniciando conexión a Firebase Admin App...");

let app;
try {
  app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.STORAGE_BUCKET,
  });
  console.log("Conexión establecida a Firebase Admin App");
} catch (err) {
  console.error("Conexión fallida a Firebase Admin App", err);
}

console.log("Intentando conexión con Firebase Firestore (Admin)...");
let firestore;
try {
  firestore = admin.firestore();
  console.log("Conexión establecida a Firebase Firestore (Admin)");
} catch (err) {
  console.error("Conexión fallida a Firebase Firestore (Admin)", err);
}

console.log("Intentando conexión con Firebase Auth (Admin)...");
let auth;
try {
  auth = admin.auth();
  console.log("Conexión establecida a Firebase Auth (Admin)");
} catch (err) {
  console.error("Conexión fallida a Firebase Auth (Admin)", err);
}

export { app, firestore, auth, admin };
