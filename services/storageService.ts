import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  orderBy,
} from "firebase/firestore";              
import { db } from "../firebase.ts";
import { Complaint, TransparencyArticle } from "../types";

/**
 * Firestore collections
 */
const complaintsRef = collection(db, "complaints");
const articlesRef = collection(db, "articles");

/**
 * Utility to dispatch sync animation events (kept for UI)
 */
function emitSync(action: string, duration = 600) {
  window.dispatchEvent(
    new CustomEvent("storage-sync-start", {
      detail: { action, duration },
    })
  );
}

/**
 * Utility to sanitize complaint data and convert GeoPoint objects to strings
 */
function sanitizeComplaint(complaint: any): Complaint {
  const sanitized = { ...complaint };
  
  // Convert GeoPoint location to string if it exists
  if (sanitized.location && typeof sanitized.location === 'object' && ('_lat' in sanitized.location || 'lat' in sanitized.location)) {
    const geo = sanitized.location;
    const lat = geo._lat !== undefined ? geo._lat : geo.lat;
    const lng = geo._long !== undefined ? geo._long : (geo.lng !== undefined ? geo.lng : geo.longitude);
    sanitized.location = `Lat: ${lat?.toFixed(4) || 'N/A'}, Lng: ${lng?.toFixed(4) || 'N/A'}`;
  }
  
  return sanitized as Complaint;
}

export const storageService = {
  /**
   * Init hook (kept for compatibility)
   */
  async initCollection() {
    emitSync("Initializing Firestore");
    return true;
  },

  /**
   * Complaints
   */
  async getComplaints(): Promise<Complaint[]> {
    emitSync("Fetching Complaints");

    const q = query(complaintsRef, orderBy("timestamp", "desc"));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return sanitizeComplaint({
        ...data,
        id: docSnap.id,
      });
    });
  },

  async saveComplaint(complaint: Complaint): Promise<void> {
    emitSync("Saving Complaint");

    const ref = doc(db, "complaints", complaint.id);
    await setDoc(ref, complaint);
  },

  async updateComplaint(
    id: string,
    updates: Partial<Complaint>
  ): Promise<void> {
    emitSync("Updating Complaint");

    const ref = doc(db, "complaints", id);
    await updateDoc(ref, updates);
  },

  /**
   * Transparency Articles
   */
  async getArticles(): Promise<TransparencyArticle[]> {
    emitSync("Fetching Reports");

    const q = query(articlesRef, orderBy("date", "desc"));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((docSnap) => ({
      ...(docSnap.data() as TransparencyArticle),
      id: docSnap.id,
    }));
  },

  async saveArticle(article: TransparencyArticle): Promise<void> {
    emitSync("Publishing Report");

    const ref = doc(db, "articles", article.id);
    await setDoc(ref, article);
  },
  /**
   * Admin-only registry clear (stub for now)
   * Keeps app stable until real implementation is added
   */
  async clearRegistry(): Promise<void> {
    emitSync("Clearing Registry");
    console.warn("[UrbanWatch] clearRegistry() called (stub)");
    return;
  }

            
  
};
