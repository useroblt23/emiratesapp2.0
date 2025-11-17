# Firestore Rules Deployment Guide

## Issues Fixed

### 1. System Control Permissions Error
The "Missing or insufficient permissions" error when loading system control has been resolved by updating the Firestore security rules to allow unauthenticated read access to the `systemControl` collection.

**Previous Rule:**
```javascript
match /systemControl/{docId} {
  allow read: if isAuthenticated();
  allow write: if isGovernor() || hasPermission('manageSystem');
}
```

**Updated Rule:**
```javascript
match /systemControl/{docId} {
  allow read: if true;
  allow write: if isGovernor() || hasPermission('manageSystem');
}
```

### 2. Courses Not Displaying for Students
The courses collection rules were checking for the wrong field name (`layer` with capital letters instead of lowercase `plan`), preventing authenticated students from viewing courses.

**Previous Rule:**
```javascript
match /courses/{courseId} {
  allow read: if isAuthenticated() && (
    resource.data.layer == 'Free' ||
    (resource.data.layer == 'Pro' && getUserData().plan in ['pro', 'vip']) ||
    (resource.data.layer == 'VIP' && getUserData().plan == 'vip') ||
    isStaff()
  );
```

**Updated Rule:**
```javascript
match /courses/{courseId} {
  allow read: if isAuthenticated() && (
    resource.data.plan == 'free' ||
    (resource.data.plan == 'pro' && getUserData().plan in ['pro', 'vip']) ||
    (resource.data.plan == 'vip' && getUserData().plan == 'vip') ||
    isStaff()
  );
```

## Manual Deployment Required

The Firebase CLI deployment failed due to authentication/API access requirements. Please deploy the updated rules manually:

### Option 1: Firebase Console (Recommended)
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `emirates-app-d80c5`
3. Navigate to **Firestore Database** → **Rules**
4. Copy the entire contents of `firestore.rules` file
5. Paste into the rules editor
6. Click **Publish**

### Option 2: Firebase CLI (If Authenticated)
```bash
# Login to Firebase
firebase login

# Deploy only the Firestore rules
firebase deploy --only firestore:rules
```

## Files Modified
- `firestore.rules` - Updated systemControl read permissions and courses field names
- `firebase.json` - Created for Firebase CLI configuration
- `.firebaserc` - Created with project ID

## New Features Added
- **Initialize Data Page** (`/governor/initialize`) - Governors can now populate the database with sample courses and modules
- Created `initializeCourses.ts` utility to seed 9 sample courses
- Added route for data initialization in governor section

## How to Initialize Sample Data
1. Log in as a governor
2. Navigate to `/governor/initialize`
3. Click "Initialize All Data" to populate courses and modules
4. Sample data will only be added if the database is empty

## Security Notes
- System control data is safe to expose publicly as it only contains feature flags and announcements
- Courses are now properly filtered based on user plan (free/pro/vip)
- Write access remains restricted to governors and users with appropriate permissions
- No user data or sensitive information is exposed by these changes
