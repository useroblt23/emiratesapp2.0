# New Module System Implementation Guide

## Current Implementation Status

### ✅ Completed
1. **Data Models Created**
   - MainModule interface with Firestore service
   - Submodule interface with Firestore service
   - Updated Course interface with `submodule_id` and `subtitle` fields

2. **Services Created**
   - `mainModuleService.ts` - Full CRUD operations for main modules and submodules
   - Updated `courseService.ts` with `getCoursesBySubmodule()` function

3. **Components Created**
   - `CreateModuleForm.tsx` - Modal form for creating main modules or submodules
     - Toggle between "Main Module" and "Submodule"
     - Parent module dropdown for submodules
     - Submodule number selector (1-10)
     - Image upload with preview
     - Form validation

4. **Pages Created**
   - `MainModuleViewerPage.tsx` - Shows main module with list of submodules
     - Displays cover image, title, description
     - Lists all submodules with thumbnails
     - "Add Submodule" button

### 🚧 Remaining Implementation

#### 1. Submodule Viewer Page
Create `/src/pages/SubmoduleViewerPage.tsx`:
```typescript
- Display submodule details (cover, title, description)
- List all courses assigned to this submodule
- "Add Course" button that opens course form
- Navigation back to parent main module
```

#### 2. Updated Course Upload Form
Modify `/src/components/CourseUploadForm.tsx`:
```typescript
- Add subtitle field
- Replace module dropdown with submodule dropdown
- Only show submodules (not main modules)
- Save course with submodule_id field
- Thumbnail upload instead of just URL
```

#### 3. Update Coach Dashboard
Modify `/src/pages/CoachDashboard.tsx`:
```typescript
- Add two prominent buttons at top:
  1. "Create Module" - Opens CreateModuleForm
  2. "Add Course" - Opens updated CourseUploadForm

- Display only Main Modules (not submodules)
- Each main module card shows:
  - Cover image
  - Title
  - Description
  - Number of submodules
  - Click to navigate to MainModuleViewerPage
```

#### 4. Add Routing
Update `/src/App.tsx` to add routes:
```typescript
<Route path="/main-modules/:moduleId" element={<MainModuleViewerPage />} />
<Route path="/submodules/:submoduleId" element={<SubmoduleViewerPage />} />
```

## Data Structure

### Firestore Collections

**`main_modules`** collection:
```json
{
  "id": "uuid",
  "type": "main",
  "title": "Cabin Crew Training",
  "description": "Complete training program...",
  "coverImage": "data:image/png;base64,...",
  "created_at": "2025-01-17T...",
  "updated_at": "2025-01-17T..."
}
```

**`submodules`** collection:
```json
{
  "id": "uuid",
  "type": "submodule",
  "parentModuleId": "parent-uuid",
  "order": 1,
  "title": "Safety Procedures",
  "description": "Learn emergency protocols...",
  "coverImage": "data:image/png;base64,...",
  "created_at": "2025-01-17T...",
  "updated_at": "2025-01-17T..."
}
```

**`courses`** collection (updated):
```json
{
  "id": "uuid",
  "title": "Fire Safety Training",
  "subtitle": "Emergency Response Basics",
  "description": "Learn how to handle...",
  "video_url": "https://youtube.com/embed/...",
  "thumbnail": "data:image/png;base64,...",
  "submodule_id": "submodule-uuid",
  "instructor": "Coach Name",
  "duration": "45 min",
  "coach_id": "coach-uuid",
  "created_at": "2025-01-17T...",
  "updated_at": "2025-01-17T..."
}
```

## User Flow

### For Coaches

1. **Create Main Module**
   ```
   Dashboard → "Create Module" → Select "Main Module"
   → Fill form → Upload cover image → Save
   ```

2. **Add Submodules**
   ```
   Dashboard → Click Main Module → "Add Submodule"
   → Select parent module → Choose order → Fill form → Save
   ```

3. **Add Courses**
   ```
   Option A: Dashboard → "Add Course" → Select submodule → Fill form → Save
   Option B: Main Module → Submodule → "Add Course" → Fill form → Save
   ```

### Navigation Structure
```
Coach Dashboard (shows only Main Modules)
  └─ Main Module 1
      ├─ Submodule 1
      │   ├─ Course 1
      │   ├─ Course 2
      │   └─ Course 3
      ├─ Submodule 2
      │   ├─ Course 4
      │   └─ Course 5
      └─ Submodule 3
          └─ Course 6
```

## Implementation Checklist

- [x] Create mainModuleService.ts
- [x] Update courseService.ts with submodule support
- [x] Create CreateModuleForm component
- [x] Create MainModuleViewerPage
- [ ] Create SubmoduleViewerPage
- [ ] Update CourseUploadForm for submodule assignment
- [ ] Add image upload handler utility
- [ ] Update Coach Dashboard with buttons and main module display
- [ ] Add routes to App.tsx
- [ ] Test complete flow: Create module → Add submodule → Add course
- [ ] Update Governor Nexus to manage new system

## Next Steps

1. Complete SubmoduleViewerPage
2. Update CourseUploadForm with submodule dropdown
3. Redesign Coach Dashboard to show only main modules
4. Add routing for new pages
5. Test end-to-end flow
6. Deploy and validate

## Notes

- Images are stored as base64 strings in Firestore
- YouTube videos should use embed URLs (not watch URLs)
- Submodule order determines display sequence
- Courses can only be assigned to submodules (not main modules directly)
- Main modules act as containers for organizing submodules
