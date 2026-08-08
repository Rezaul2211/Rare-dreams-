import admin from 'firebase-admin';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin
initializeApp({
  projectId: process.env.FIREBASE_PROJECT_ID || "lofty-theme-0nn32"
});

const db = getFirestore();

async function clearProducts() {
  const productsRef = db.collection('products');
  const snapshot = await productsRef.get();
  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();
  console.log('Cleared all products.');
}

clearProducts();
