import { db } from '../lib/firebase';
import { collection, doc, getDoc, setDoc, updateDoc, deleteDoc, query, where, getDocs, orderBy, addDoc, Timestamp } from 'firebase/firestore';

export interface SimulationData {
  id?: string;
  user_id: string;
  current_phase: number;
  quiz_score: number;
  english_score: number;
  completed: boolean;
  started_at?: string;
  last_updated?: string;
}

export interface AnswerData {
  id?: string;
  simulation_id: string;
  user_id: string;
  phase: number;
  question_id: string;
  selected_answer: string;
  correct: boolean;
}

export async function getOrCreateSimulation(userId: string): Promise<SimulationData | null> {
  try {
    const simulationsRef = collection(db, 'open_day_simulations');
    const q = query(simulationsRef, where('user_id', '==', userId));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      } as SimulationData;
    }

    const newSimDoc = await addDoc(simulationsRef, {
      user_id: userId,
      current_phase: 1,
      quiz_score: 0,
      english_score: 0,
      completed: false,
      started_at: Timestamp.now(),
      last_updated: Timestamp.now()
    });

    return {
      id: newSimDoc.id,
      user_id: userId,
      current_phase: 1,
      quiz_score: 0,
      english_score: 0,
      completed: false,
      started_at: new Date().toISOString(),
      last_updated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error in getOrCreateSimulation:', error);
    return null;
  }
}

export async function updateSimulation(
  simulationId: string,
  updates: Partial<SimulationData>
): Promise<boolean> {
  try {
    const simRef = doc(db, 'open_day_simulations', simulationId);
    await updateDoc(simRef, {
      ...updates,
      last_updated: Timestamp.now()
    });
    return true;
  } catch (error) {
    console.error('Error updating simulation:', error);
    return false;
  }
}

export async function saveAnswers(answers: AnswerData[]): Promise<boolean> {
  try {
    const answersRef = collection(db, 'open_day_answers');
    const promises = answers.map(answer =>
      addDoc(answersRef, {
        ...answer,
        created_at: Timestamp.now()
      })
    );
    await Promise.all(promises);
    return true;
  } catch (error) {
    console.error('Error saving answers:', error);
    return false;
  }
}

export async function deleteSimulation(userId: string): Promise<boolean> {
  try {
    const simulationsRef = collection(db, 'open_day_simulations');
    const q = query(simulationsRef, where('user_id', '==', userId));
    const querySnapshot = await getDocs(q);

    const deletePromises = querySnapshot.docs.map(document =>
      deleteDoc(doc(db, 'open_day_simulations', document.id))
    );
    await Promise.all(deletePromises);
    return true;
  } catch (error) {
    console.error('Error deleting simulation:', error);
    return false;
  }
}

export async function getAllSimulations(): Promise<SimulationData[]> {
  try {
    const simulationsRef = collection(db, 'open_day_simulations');
    const q = query(simulationsRef, orderBy('last_updated', 'desc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as SimulationData[];
  } catch (error) {
    console.error('Error fetching all simulations:', error);
    return [];
  }
}
