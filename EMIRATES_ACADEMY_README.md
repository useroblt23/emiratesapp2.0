# Emirates Academy - Full UI Application

A luxurious, role-based educational platform for Emirates cabin crew training with complete UI implementation.

## Features Implemented

### Authentication System
- **Login Page** with quick-login demo accounts
- **Register Page** with role selection (Student, Mentor, Governor)
- Session persistence using localStorage
- Mock authentication (ready for Firebase backend integration)

### Role-Based Access Control

#### Student Features
- Dashboard with course progress tracking
- Browse and enroll in courses
- Encrypted messaging system
- Editable profile page
- Support center

#### Mentor Features
- Mentor dashboard with student statistics
- Student management (placeholder)
- Course upload interface (placeholder)
- Direct messaging with students
- Activity tracking

#### Governor Features (Full Admin Control)
- **Users Control**: Ban, mute, promote, demote users
- **Global Alerts**: Create system-wide banners with color themes
- **Maintenance Mode**: Lock system access (Governors exempt)
- **Hub Management**: Content library control (placeholder)
- **Conversations Control**: Monitor all chats (placeholder)
- **Analytics Dashboard**: System statistics (placeholder)

### Core Pages

#### Dashboard
- Role-specific views with statistics
- Progress tracking for students
- Activity feeds for mentors
- System health monitoring for governors

#### Courses
- Grid layout with course cards
- Video player modal with progress bars
- Course filtering and search
- Enrollment tracking

#### Messages
- Left sidebar with conversation list
- Real-time chat interface with message bubbles
- End-to-end encryption indicators
- File attachment and emoji support (UI ready)

#### Profile
- Editable user information
- Profile photo upload (mock)
- Activity statistics
- Governor badge for admins

### Design System

#### Color Palette (Emirates Theme)
```javascript
{
  primary: '#D71920',      // Emirates Red
  primaryDark: '#B91518',
  gold: '#B9975B',         // Deep Gold
  goldDark: '#A8865A',
  sand: '#EADBC8',         // Desert Sand
  black: '#1C1C1C',        // Charcoal Black
  white: '#FFFFFF'
}
```

#### Typography
- Font: **Lato** (300, 400, 700, 900 weights)
- Professional, clean, luxurious styling

#### UI Components
- Rounded corners (rounded-2xl)
- Smooth gradient backgrounds
- Hover animations with Framer Motion
- Soft shadows and transitions
- Responsive design (mobile to desktop)

### Technical Stack

- **React 18** with TypeScript
- **React Router DOM** for navigation
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Lucide React** for icons
- **Context API** for global state
- **localStorage** for session persistence

### Mock Demo Accounts

Three pre-configured accounts for testing:

1. **Governor Account**
   - Email: `governor@emirates.com`
   - Password: `Governor123`
   - Full system access

2. **Mentor Account**
   - Email: `coach@emirates.com`
   - Password: `Coach123`
   - Student management access

3. **Student Account**
   - Email: `student@emirates.com`
   - Password: `Student123`
   - Learning platform access

### Project Structure

```
src/
├── components/
│   └── layout/
│       ├── Layout.tsx       # Main layout wrapper
│       ├── Navbar.tsx       # Top navigation bar
│       └── Sidebar.tsx      # Role-based side navigation
├── context/
│   └── AppContext.tsx       # Global state management
├── data/
│   └── mockData.ts          # Demo users, courses, messages
├── pages/
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   └── RegisterPage.tsx
│   ├── governor/
│   │   ├── UsersControl.tsx
│   │   ├── GlobalAlerts.tsx
│   │   └── MaintenanceMode.tsx
│   ├── Dashboard.tsx
│   ├── CoursesPage.tsx
│   ├── MessagesPage.tsx
│   ├── ProfilePage.tsx
│   ├── SupportPage.tsx
│   └── PlaceholderPage.tsx  # Reusable placeholder component
├── utils/
│   └── encryption.ts        # Base64 encryption (placeholder)
└── App.tsx                  # Main routing and app logic
```

### Key Features

#### Navigation System
- Top navbar with notifications and profile dropdown
- Dynamic sidebar based on user role
- Breadcrumb-style routing
- Smooth page transitions

#### Global State Management
- Current user authentication
- Maintenance mode toggle
- Global alert banners
- Role-based permissions

#### Maintenance Mode
- System-wide lockout (except Governors)
- Custom maintenance messages
- Visual indicators and previews
- Impact statistics display

#### User Management (Governor)
- Searchable user table
- Role-based filtering
- Quick actions: Ban, Mute, Promote, Demote
- Visual status indicators
- Real-time updates (local state)

#### Messaging System
- Conversation list with unread counts
- Chat bubbles with timestamps
- Encryption indicators
- Real-time message sending (local)
- Emoji and file upload UI ready

### Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px)
- Touch-friendly interface
- Collapsible navigation on mobile

### Animation & Interactions
- Fade-in page transitions
- Hover effects on cards and buttons
- Smooth color transitions
- Loading states and spinners
- Modal animations

### Security Considerations
- Role-based route protection
- Maintenance mode enforcement
- Encrypted messaging placeholders
- Session management
- Governor-only features isolated

## Backend Integration Readiness

All components are designed with backend integration in mind:

1. **Authentication**: Replace mock login with Firebase Auth
2. **Database**: Connect Firestore for users, courses, messages
3. **Real-time**: Add Firestore listeners for live updates
4. **Storage**: Implement Firebase Storage for media uploads
5. **Encryption**: Replace Base64 with proper end-to-end encryption

### Next Steps (Phase 3)

- [ ] Connect Firebase Authentication
- [ ] Set up Firestore database schema
- [ ] Implement real-time listeners
- [ ] Add file upload functionality
- [ ] Integrate proper encryption (libsodium/tweetnacl)
- [ ] Add email notifications
- [ ] Implement search functionality
- [ ] Add pagination for large datasets
- [ ] Create admin activity logs
- [ ] Add export functionality for reports

## Running the Application

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Setup

No environment variables needed for UI-only version. Ready for:
```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance Optimizations

- Code splitting with React.lazy (ready to implement)
- Image optimization with Pexels CDN
- Lazy loading for routes
- Efficient re-renders with React.memo (where needed)
- Tailwind CSS purge for minimal bundle size

## Accessibility

- Semantic HTML structure
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus states on all interactive elements
- Color contrast WCAG AA compliant

---

**Status**: ✅ Full UI Complete | Backend Integration Pending (Phase 3)

**Version**: 1.0.0-ui

**License**: MIT
