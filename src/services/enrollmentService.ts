import { db } from '../lib/firebase';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  Timestamp,
  increment
} from 'firebase/firestore';

export interface ModuleEnrollment {
  user_id: string;
  module_id: string;
  module_type: 'main_module' | 'submodule';
  enrolled_at: string;
  last_accessed: string;
  progress_percentage: number;
  completed: boolean;
  completed_at?: string;
}

export interface CourseProgress {
  user_id: string;
  course_id: string;
  module_id: string;
  enrolled_at: string;
  last_accessed: string;
  video_progress: number;
  video_duration: number;
  completed: boolean;
  completed_at?: string;
}

export interface VideoProgress {
  user_id: string;
  course_id: string;
  video_url: string;
  current_time: number;
  duration: number;
  last_watched: string;
  completed: boolean;
}

export const enrollInModule = async (
  userId: string,
  moduleId: string,
  moduleType: 'main_module' | 'submodule'
): Promise<void> => {
  try {
    const enrollmentRef = doc(db, 'enrollments', `${userId}_${moduleId}`);

    const enrollment: ModuleEnrollment = {
      user_id: userId,
      module_id: moduleId,
      module_type: moduleType,
      enrolled_at: new Date().toISOString(),
      last_accessed: new Date().toISOString(),
      progress_percentage: 0,
      completed: false
    };

    await setDoc(enrollmentRef, enrollment);
    console.log('Enrolled in module:', moduleId);
  } catch (error) {
    console.error('Error enrolling in module:', error);
    throw error;
  }
};

export const isEnrolledInModule = async (
  userId: string,
  moduleId: string
): Promise<boolean> => {
  try {
    const enrollmentRef = doc(db, 'enrollments', `${userId}_${moduleId}`);
    const enrollmentSnap = await getDoc(enrollmentRef);
    return enrollmentSnap.exists();
  } catch (error) {
    console.error('Error checking enrollment:', error);
    return false;
  }
};

export const getModuleEnrollment = async (
  userId: string,
  moduleId: string
): Promise<ModuleEnrollment | null> => {
  try {
    const enrollmentRef = doc(db, 'enrollments', `${userId}_${moduleId}`);
    const enrollmentSnap = await getDoc(enrollmentRef);

    if (enrollmentSnap.exists()) {
      return enrollmentSnap.data() as ModuleEnrollment;
    }
    return null;
  } catch (error) {
    console.error('Error getting module enrollment:', error);
    return null;
  }
};

export const updateLastAccessed = async (
  userId: string,
  moduleId: string
): Promise<void> => {
  try {
    const enrollmentRef = doc(db, 'enrollments', `${userId}_${moduleId}`);
    await updateDoc(enrollmentRef, {
      last_accessed: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating last accessed:', error);
  }
};

export const trackCourseProgress = async (
  userId: string,
  courseId: string,
  moduleId: string,
  videoProgress: number,
  videoDuration: number
): Promise<void> => {
  try {
    const progressRef = doc(db, 'course_progress', `${userId}_${courseId}`);
    const progressSnap = await getDoc(progressRef);

    const isCompleted = videoProgress >= videoDuration * 0.9;

    if (progressSnap.exists()) {
      const updates: any = {
        last_accessed: new Date().toISOString(),
        video_progress: videoProgress,
        video_duration: videoDuration,
        completed: isCompleted
      };

      if (isCompleted && !progressSnap.data().completed) {
        updates.completed_at = new Date().toISOString();
      }

      await updateDoc(progressRef, updates);
    } else {
      const progress: CourseProgress = {
        user_id: userId,
        course_id: courseId,
        module_id: moduleId,
        enrolled_at: new Date().toISOString(),
        last_accessed: new Date().toISOString(),
        video_progress: videoProgress,
        video_duration: videoDuration,
        completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : undefined
      };

      await setDoc(progressRef, progress);
    }

    await updateModuleProgress(userId, moduleId);
  } catch (error) {
    console.error('Error tracking course progress:', error);
    throw error;
  }
};

export const getCourseProgress = async (
  userId: string,
  courseId: string
): Promise<CourseProgress | null> => {
  try {
    const progressRef = doc(db, 'course_progress', `${userId}_${courseId}`);
    const progressSnap = await getDoc(progressRef);

    if (progressSnap.exists()) {
      return progressSnap.data() as CourseProgress;
    }
    return null;
  } catch (error) {
    console.error('Error getting course progress:', error);
    return null;
  }
};

export const updateModuleProgress = async (
  userId: string,
  moduleId: string
): Promise<void> => {
  try {
    const progressQuery = query(
      collection(db, 'course_progress'),
      where('user_id', '==', userId),
      where('module_id', '==', moduleId)
    );

    const progressSnap = await getDocs(progressQuery);
    const totalCourses = progressSnap.size;

    if (totalCourses === 0) return;

    const completedCourses = progressSnap.docs.filter(
      doc => doc.data().completed
    ).length;

    const progressPercentage = (completedCourses / totalCourses) * 100;
    const isModuleCompleted = progressPercentage === 100;

    const enrollmentRef = doc(db, 'enrollments', `${userId}_${moduleId}`);
    const updates: any = {
      progress_percentage: progressPercentage,
      completed: isModuleCompleted,
      last_accessed: new Date().toISOString()
    };

    if (isModuleCompleted) {
      const enrollmentSnap = await getDoc(enrollmentRef);
      if (enrollmentSnap.exists() && !enrollmentSnap.data().completed) {
        updates.completed_at = new Date().toISOString();
      }
    }

    await updateDoc(enrollmentRef, updates);
  } catch (error) {
    console.error('Error updating module progress:', error);
  }
};

export const saveVideoProgress = async (
  userId: string,
  courseId: string,
  videoUrl: string,
  currentTime: number,
  duration: number
): Promise<void> => {
  try {
    const videoProgressRef = doc(db, 'video_progress', `${userId}_${courseId}`);

    const videoProgress: VideoProgress = {
      user_id: userId,
      course_id: courseId,
      video_url: videoUrl,
      current_time: currentTime,
      duration: duration,
      last_watched: new Date().toISOString(),
      completed: currentTime >= duration * 0.9
    };

    await setDoc(videoProgressRef, videoProgress);
  } catch (error) {
    console.error('Error saving video progress:', error);
  }
};

export const getVideoProgress = async (
  userId: string,
  courseId: string
): Promise<VideoProgress | null> => {
  try {
    const videoProgressRef = doc(db, 'video_progress', `${userId}_${courseId}`);
    const videoProgressSnap = await getDoc(videoProgressRef);

    if (videoProgressSnap.exists()) {
      return videoProgressSnap.data() as VideoProgress;
    }
    return null;
  } catch (error) {
    console.error('Error getting video progress:', error);
    return null;
  }
};

export const getUserEnrollments = async (
  userId: string
): Promise<ModuleEnrollment[]> => {
  try {
    const enrollmentsQuery = query(
      collection(db, 'enrollments'),
      where('user_id', '==', userId)
    );

    const enrollmentsSnap = await getDocs(enrollmentsQuery);
    return enrollmentsSnap.docs.map(doc => doc.data() as ModuleEnrollment);
  } catch (error) {
    console.error('Error getting user enrollments:', error);
    return [];
  }
};
