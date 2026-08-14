import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentSingleTabManager,
  doc,
  getDocFromServer
} from "firebase/firestore";
import { getStorage } from "firebase/storage";
import firebaseConfig from "../../firebase-applet-config.json";

let app: any;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  console.error("Firebase init error", error);
}

export const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.error("Auth persistence error:", err);
});

const databaseId = firebaseConfig.firestoreDatabaseId || undefined;

let firestoreDb: any;
try {
  firestoreDb = initializeFirestore(
    app,
    {
      experimentalForceLongPolling: true,
      localCache: persistentLocalCache({
        tabManager: persistentSingleTabManager({})
      })
    },
    databaseId
  );
} catch (e) {
  console.warn("Initializing Firestore with standard settings fallback:", e);
  firestoreDb = initializeFirestore(
    app,
    {
      experimentalForceLongPolling: true
    },
    databaseId
  );
}

export const db = firestoreDb;
export const storage = getStorage(app);

