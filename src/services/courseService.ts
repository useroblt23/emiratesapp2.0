import { db } from '../lib/firebase';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { uploadPDFToStorage, deletePDFFromStorage } from './storageService';

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  thumbnail: string;
  duration: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  plan: 'free' | 'pro' | 'vip';
  category: 'grooming' | 'service' | 'safety' | 'interview' | 'language';
  lessons: number;
  coach_id: string;
  pdf_url?: string;
  pdf_path?: string;
  allow_download: boolean;
  content_type: 'pdf' | 'video' | 'text';
  created_at: string;
  updated_at: string;
}

export interface CreateCourseData {
  title: string;
  description: string;
  instructor: string;
  thumbnail: string;
  duration: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  plan: 'free' | 'pro' | 'vip';
  category: 'grooming' | 'service' | 'safety' | 'interview' | 'language';
  lessons?: number;
  pdfFile?: File;
  allow_download: boolean;
  content_type: 'pdf' | 'video' | 'text';
}

export const createCourse = async (data: CreateCourseData, coachId: string): Promise<Course> => {
  try {
    const courseId = crypto.randomUUID();
    let pdfUrl: string | undefined;
    let pdfPath: string | undefined;

    if (data.pdfFile) {
      const uploadResult = await uploadPDFToStorage(data.pdfFile, courseId);
      pdfUrl = uploadResult.url;
      pdfPath = uploadResult.path;
    }

    const courseData = {
      id: courseId,
      title: data.title,
      description: data.description,
      instructor: data.instructor,
      thumbnail: data.thumbnail,
      duration: data.duration,
      level: data.level,
      plan: data.plan,
      category: data.category,
      lessons: data.lessons || 1,
      coach_id: coachId,
      pdf_url: pdfUrl,
      pdf_path: pdfPath,
      allow_download: data.allow_download,
      content_type: data.content_type,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const docRef = doc(db, 'courses', courseId);
    await setDoc(docRef, courseData);

    return courseData as Course;
  } catch (error) {
    console.error('Error creating course:', error);
    throw error;
  }
};

export const updateCourse = async (
  courseId: string,
  data: Partial<CreateCourseData>,
  existingPdfPath?: string
): Promise<Course> => {
  try {
    let pdfUrl: string | undefined;
    let pdfPath: string | undefined;

    if (data.pdfFile) {
      if (existingPdfPath) {
        await deletePDFFromStorage(existingPdfPath);
      }

      const uploadResult = await uploadPDFToStorage(data.pdfFile, courseId);
      pdfUrl = uploadResult.url;
      pdfPath = uploadResult.path;
    }

    const updateData: any = {
      ...data,
      updated_at: new Date().toISOString(),
    };

    if (pdfUrl) updateData.pdf_url = pdfUrl;
    if (pdfPath) updateData.pdf_path = pdfPath;

    delete updateData.pdfFile;

    const docRef = doc(db, 'courses', courseId);
    await updateDoc(docRef, updateData);

    const docSnap = await getDoc(docRef);
    return { id: docSnap.id, ...docSnap.data() } as Course;
  } catch (error) {
    console.error('Error updating course:', error);
    throw error;
  }
};

export const deleteCourse = async (courseId: string, pdfPath?: string): Promise<void> => {
  try {
    if (pdfPath) {
      await deletePDFFromStorage(pdfPath);
    }

    const docRef = doc(db, 'courses', courseId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting course:', error);
    throw error;
  }
};

export const getCoursesByCoach = async (coachId: string): Promise<Course[]> => {
  try {
    const coursesRef = collection(db, 'courses');
    const q = query(
      coursesRef,
      where('coach_id', '==', coachId),
      orderBy('created_at', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Course[];
  } catch (error) {
    console.error('Error fetching courses:', error);
    return [];
  }
};

export const getAllCourses = async (): Promise<Course[]> => {
  try {
    const coursesRef = collection(db, 'courses');
    const q = query(coursesRef, orderBy('created_at', 'desc'));

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Course[];
  } catch (error) {
    console.error('Error fetching all courses:', error);
    return [];
  }
};

export const getCourseById = async (courseId: string): Promise<Course | null> => {
  try {
    const docRef = doc(db, 'courses', courseId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return { id: docSnap.id, ...docSnap.data() } as Course;
  } catch (error) {
    console.error('Error fetching course:', error);
    return null;
  }
};
