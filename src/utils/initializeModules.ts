import { createModule } from '../services/moduleService';

export const initializeDefaultModules = async (): Promise<void> => {
  const defaultModules = [
    {
      name: 'Interview Prep - Module 1',
      description: 'Master the basics of cabin crew interviews including common questions, body language, and first impressions',
      category: 'interview' as const,
      order: 1
    },
    {
      name: 'Interview Prep - Module 2',
      description: 'Advanced interview techniques, scenario-based questions, and assessment day preparation',
      category: 'interview' as const,
      order: 2
    },
    {
      name: 'Grooming - Module 1',
      description: 'Essential grooming standards for cabin crew including uniform guidelines, hair, makeup, and personal presentation',
      category: 'grooming' as const,
      order: 1
    },
    {
      name: 'Grooming - Module 2',
      description: 'Advanced grooming techniques and maintaining professional appearance during long flights',
      category: 'grooming' as const,
      order: 2
    },
    {
      name: 'Customer Service - Module 1',
      description: 'Fundamentals of exceptional customer service, communication skills, and handling passenger requests',
      category: 'service' as const,
      order: 1
    },
    {
      name: 'Customer Service - Module 2',
      description: 'Managing difficult passengers, conflict resolution, and delivering premium service',
      category: 'service' as const,
      order: 2
    },
    {
      name: 'Safety - Module 1',
      description: 'Core aviation safety procedures, emergency equipment, and pre-flight safety checks',
      category: 'safety' as const,
      order: 1
    },
    {
      name: 'Safety - Module 2',
      description: 'Advanced emergency procedures, evacuations, medical emergencies, and crisis management',
      category: 'safety' as const,
      order: 2
    },
    {
      name: 'Language - Module 1',
      description: 'Essential aviation English terminology, announcements, and basic passenger communication',
      category: 'language' as const,
      order: 1
    },
    {
      name: 'Language - Module 2',
      description: 'Advanced language skills, cultural awareness, and multilingual passenger interactions',
      category: 'language' as const,
      order: 2
    }
  ];

  console.log('Initializing default modules...');

  for (const module of defaultModules) {
    try {
      await createModule(module);
      console.log(`Created module: ${module.name}`);
    } catch (error) {
      console.error(`Error creating module ${module.name}:`, error);
    }
  }

  console.log('Default modules initialization complete!');
};
