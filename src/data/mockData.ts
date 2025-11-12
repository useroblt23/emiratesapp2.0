import { User, Role } from '../context/AppContext';

export const demoUsers: Array<User & { password: string }> = [
  {
    uid: 'gov-001',
    email: 'governor@emirates.com',
    password: 'Governor123',
    name: 'Sarah Al-Mansouri',
    role: 'governor',
    country: 'United Arab Emirates',
    bio: 'Head of Emirates Academy operations and quality assurance.',
    photoURL: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200',
  },
  {
    uid: 'mentor-001',
    email: 'coach@emirates.com',
    password: 'Coach123',
    name: 'James Chen',
    role: 'mentor',
    country: 'Singapore',
    bio: 'Senior cabin crew trainer with 10 years of experience.',
    photoURL: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200',
  },
  {
    uid: 'student-001',
    email: 'student@emirates.com',
    password: 'Student123',
    name: 'Maria Rodriguez',
    role: 'student',
    country: 'Spain',
    bio: 'Aspiring cabin crew member preparing for Emirates recruitment.',
    photoURL: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=200',
  },
];

export const mockUsers: User[] = [
  ...demoUsers,
  {
    uid: 'student-002',
    email: 'ahmed.ali@gmail.com',
    name: 'Ahmed Ali',
    role: 'student',
    country: 'Egypt',
    bio: 'Aviation enthusiast from Cairo.',
    photoURL: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=200',
  },
  {
    uid: 'student-003',
    email: 'sophie.martin@gmail.com',
    name: 'Sophie Martin',
    role: 'student',
    country: 'France',
    bio: 'Multilingual student with passion for hospitality.',
    photoURL: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=200',
  },
  {
    uid: 'mentor-002',
    email: 'lisa.johnson@emirates.com',
    name: 'Lisa Johnson',
    role: 'mentor',
    country: 'United Kingdom',
    bio: 'Specialized in grooming and professional standards.',
    photoURL: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=200',
  },
  {
    uid: 'student-004',
    email: 'yuki.tanaka@gmail.com',
    name: 'Yuki Tanaka',
    role: 'student',
    country: 'Japan',
    bio: 'Service excellence enthusiast from Tokyo.',
    photoURL: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200',
  },
];

export interface Course {
  id: string;
  title: string;
  instructor: string;
  thumbnail: string;
  description: string;
  duration: string;
  progress?: number;
}

export const mockCourses: Course[] = [
  {
    id: 'course-001',
    title: 'Emirates Service Excellence',
    instructor: 'James Chen',
    thumbnail: 'https://images.pexels.com/photos/2026324/pexels-photo-2026324.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Master the art of five-star hospitality and customer service.',
    duration: '2h 30min',
    progress: 65,
  },
  {
    id: 'course-002',
    title: 'Interview Preparation Masterclass',
    instructor: 'Lisa Johnson',
    thumbnail: 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Complete guide to ace your Emirates cabin crew interview.',
    duration: '3h 15min',
    progress: 30,
  },
  {
    id: 'course-003',
    title: 'Grooming & Professional Standards',
    instructor: 'Sarah Al-Mansouri',
    thumbnail: 'https://images.pexels.com/photos/3756681/pexels-photo-3756681.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Learn Emirates grooming standards and professional conduct.',
    duration: '1h 45min',
    progress: 100,
  },
  {
    id: 'course-004',
    title: 'Cultural Awareness Training',
    instructor: 'James Chen',
    thumbnail: 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Understanding diverse cultures in international aviation.',
    duration: '2h 00min',
  },
];

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  encrypted: boolean;
}

export interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantPhoto: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  messages: Message[];
}

export const mockConversations: Conversation[] = [
  {
    id: 'conv-001',
    participantId: 'mentor-001',
    participantName: 'James Chen',
    participantPhoto: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200',
    lastMessage: 'Great progress on your interview preparation!',
    timestamp: '2 hours ago',
    unread: 2,
    messages: [
      {
        id: 'msg-001',
        senderId: 'mentor-001',
        senderName: 'James Chen',
        text: 'Hi Maria! How is your preparation going?',
        timestamp: '10:30 AM',
        encrypted: true,
      },
      {
        id: 'msg-002',
        senderId: 'student-001',
        senderName: 'Maria Rodriguez',
        text: 'Hello! I just completed the service excellence module.',
        timestamp: '10:45 AM',
        encrypted: true,
      },
      {
        id: 'msg-003',
        senderId: 'mentor-001',
        senderName: 'James Chen',
        text: 'Great progress on your interview preparation!',
        timestamp: '11:00 AM',
        encrypted: true,
      },
    ],
  },
  {
    id: 'conv-002',
    participantId: 'student-002',
    participantName: 'Ahmed Ali',
    participantPhoto: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=200',
    lastMessage: 'Thank you for the feedback!',
    timestamp: '1 day ago',
    unread: 0,
    messages: [
      {
        id: 'msg-004',
        senderId: 'student-002',
        senderName: 'Ahmed Ali',
        text: 'Can you review my CV?',
        timestamp: 'Yesterday 3:00 PM',
        encrypted: true,
      },
      {
        id: 'msg-005',
        senderId: 'mentor-001',
        senderName: 'James Chen',
        text: 'Of course! Please upload it to the platform.',
        timestamp: 'Yesterday 3:15 PM',
        encrypted: true,
      },
      {
        id: 'msg-006',
        senderId: 'student-002',
        senderName: 'Ahmed Ali',
        text: 'Thank you for the feedback!',
        timestamp: 'Yesterday 4:30 PM',
        encrypted: true,
      },
    ],
  },
];
