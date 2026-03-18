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
  limit,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase';

export interface Question {
  id: string;
  content: string; // LaTeX
  answer: string;
  difficulty: number; // 1 to 5
  fieldId: string;
  subjectId: string;
  majorUnitId: string;
  minorUnitId: string;
  tagId: string;
  tags: string[];
  createdAt: number;
}

export class QuestionService {
  /**
   * Saves a new question to the database.
   */
  static async saveQuestion(question: Question): Promise<void> {
    const path = `questions/${question.id}`;
    try {
      await setDoc(doc(db, path), question);
    } catch (error) {
      console.error('Error saving question:', error);
      throw error;
    }
  }

  /**
   * Fetches a single question by ID.
   */
  static async getQuestion(id: string): Promise<Question | null> {
    const path = `questions/${id}`;
    try {
      const docRef = doc(db, path);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data() as Question;
      }
      return null;
    } catch (error) {
      console.error('Error fetching question:', error);
      throw error;
    }
  }

  /**
   * Fetches questions by hierarchy node.
   */
  static async getQuestionsByHierarchy(hierarchyId: string, limitCount: number = 20): Promise<Question[]> {
    const path = 'questions';
    try {
      const q = query(
        collection(db, path), 
        where('tagId', '==', hierarchyId),
        limit(limitCount)
      );
      const snapshot = await getDocs(q);
      const questions: Question[] = [];
      snapshot.forEach((doc) => {
        questions.push(doc.data() as Question);
      });
      return questions;
    } catch (error) {
      console.error('Error fetching questions by hierarchy:', error);
      throw error;
    }
  }

  /**
   * Fetches random questions for a specific difficulty.
   */
  static async getRandomQuestions(difficulty: number, limitCount: number = 10): Promise<Question[]> {
    const path = 'questions';
    try {
      const q = query(
        collection(db, path), 
        where('difficulty', '==', difficulty),
        limit(limitCount)
      );
      const snapshot = await getDocs(q);
      const questions: Question[] = [];
      snapshot.forEach((doc) => {
        questions.push(doc.data() as Question);
      });
      return questions;
    } catch (error) {
      console.error('Error fetching random questions:', error);
      throw error;
    }
  }
}
