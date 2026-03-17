import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  onSnapshot, 
  deleteDoc,
  FirestoreError
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { AbilityScore, GamificationStats } from '../types/ability';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

/**
 * Handles Firestore errors by logging detailed context and throwing a JSON string error.
 */
function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('[FirebaseService] Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export class FirebaseService {
  /**
   * Saves or updates an ability score for the current user.
   */
  static async saveAbilityScore(score: AbilityScore): Promise<void> {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const path = `users/${userId}/abilityScores/${score.id}`;
    try {
      await setDoc(doc(db, path), score);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }

  /**
   * Subscribes to real-time updates of the user's ability scores.
   */
  static subscribeToAbilityScores(callback: (scores: Record<string, AbilityScore>) => void): () => void {
    const userId = auth.currentUser?.uid;
    if (!userId) return () => {};

    const path = `users/${userId}/abilityScores`;
    const q = collection(db, path);

    return onSnapshot(q, (snapshot) => {
      const scores: Record<string, AbilityScore> = {};
      snapshot.forEach((doc) => {
        scores[doc.id] = doc.data() as AbilityScore;
      });
      callback(scores);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });
  }

  /**
   * Saves a bookmarked problem.
   */
  static async saveBookmark(problemId: string, title: string): Promise<void> {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const path = `users/${userId}/bookmarks/${problemId}`;
    try {
      await setDoc(doc(db, path), {
        problemId,
        title,
        bookmarkedAt: Date.now()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }

  /**
   * Deletes a bookmarked problem.
   */
  static async deleteBookmark(problemId: string): Promise<void> {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const path = `users/${userId}/bookmarks/${problemId}`;
    try {
      await deleteDoc(doc(db, path));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  }

  /**
   * Subscribes to real-time updates of the user's bookmarks.
   */
  static subscribeToBookmarks(callback: (bookmarks: string[]) => void): () => void {
    const userId = auth.currentUser?.uid;
    if (!userId) return () => {};

    const path = `users/${userId}/bookmarks`;
    const q = collection(db, path);

    return onSnapshot(q, (snapshot) => {
      const bookmarks: string[] = [];
      snapshot.forEach((doc) => {
        bookmarks.push(doc.id);
      });
      callback(bookmarks);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });
  }

  /**
   * Saves gamification statistics.
   */
  static async saveGamificationStats(stats: GamificationStats): Promise<void> {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const path = `users/${userId}/gamification/stats`;
    try {
      await setDoc(doc(db, path), stats);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }

  /**
   * Subscribes to real-time updates of gamification statistics.
   */
  static subscribeToGamificationStats(callback: (stats: GamificationStats | null) => void): () => void {
    const userId = auth.currentUser?.uid;
    if (!userId) return () => {};

    const path = `users/${userId}/gamification/stats`;
    const docRef = doc(db, path);

    return onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        callback(doc.data() as GamificationStats);
      } else {
        callback(null);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });
  }
}
