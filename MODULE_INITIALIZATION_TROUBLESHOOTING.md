# Module Creation Not Working - Troubleshooting Guide

## Issue
Modules are not being created when clicking "Initialize Sample Data" in Governor Control Nexus.

## Most Likely Cause

**Firestore rules have not been deployed to Firebase.** The updated rules that allow governors to create modules must be published to Firebase.

## Solution (Follow These Steps)

### Step 1: Deploy Firestore Rules to Firebase

#### Option A: Using Firebase Console (Recommended)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `emirates-app-d80c5`
3. Navigate to **Firestore Database** → **Rules** tab
4. Copy the ENTIRE contents from `firestore.rules` file in your project
5. Paste it into the Firebase Console rules editor
6. Click **Publish** button
7. Wait for "Rules published successfully" confirmation

#### Option B: Using Firebase CLI

```bash
# Make sure you're in the project root directory
firebase deploy --only firestore:rules
```

### Step 2: Verify Rules Were Deployed

After deploying, check in Firebase Console → Firestore Database → Rules tab.

You should see these sections for modules:

```javascript
match /modules/{moduleId} {
  allow read: if isAuthenticated();
  allow write: if isGovernor() || hasPermission('manageContent');
}

match /user_module_progress/{progressId} {
  allow read, update: if isAuthenticated() &&
    resource.data.user_id == request.auth.uid;
  allow create: if isAuthenticated() &&
    request.resource.data.user_id == request.auth.uid;
}

match /course_enrollments/{enrollmentId} {
  allow read, update: if isAuthenticated() &&
    resource.data.user_id == request.auth.uid;
  allow create: if isAuthenticated() &&
    request.resource.data.user_id == request.auth.uid;
}
```

### Step 3: Test Module Creation

1. **Refresh your browser** (hard refresh: Ctrl+F5 or Cmd+Shift+R)
2. Open **browser console** (press F12)
3. Navigate to **Governor Control Nexus**
4. Click **"Initialize Sample Data"**
5. Watch the console output

### Expected Console Output (Success)

```
===== STARTING DATA INITIALIZATION =====
Step 1: Initializing courses...
✅ Courses initialized successfully
Step 2: Initializing modules...
Initializing default modules...
Total modules to create: 10
Creating module: Interview Prep - Module 1...
Creating module in Firestore...
Module data prepared: {id: "abc123", name: "Interview Prep - Module 1"}
Module saved to Firestore successfully
✅ Successfully created module: Interview Prep - Module 1 (ID: abc123)
...
(repeats for all 10 modules)
...
=== Module Initialization Complete ===
✅ Success: 10 modules
❌ Errors: 0 modules
=====================================
===== INITIALIZATION COMPLETE =====
```

## Common Errors

### Error 1: "Permission denied"

**Full error in console:**
```
Error code: permission-denied
Message: Missing or insufficient permissions
```

**Cause:** Firestore rules not deployed OR user doesn't have governor role

**Solution:**
1. Deploy Firestore rules (see Step 1 above)
2. Verify you're logged in as a user with `role: 'governor'`
3. Check Firebase Console → Authentication → find your user → Custom claims should show `role: governor`

### Error 2: No error but nothing happens

**Symptoms:** Button shows "Initializing..." then completes but no modules appear

**Causes:**
- Rules not deployed
- Network connectivity issue
- Firebase configuration error

**Solution:**
1. Open browser console (F12)
2. Look for any red error messages
3. Check Network tab for failed requests
4. Verify `.env` file has correct Firebase credentials

### Error 3: "Failed to initialize data"

**Cause:** Generic error, check console for details

**Solution:**
1. Open browser console
2. Look for detailed error message with ❌ symbol
3. Follow specific error guidance based on error code

## Verify Modules in Database

After successful initialization:

1. Open Firebase Console
2. Go to **Firestore Database**
3. Click on **modules** collection
4. You should see **10 documents**:
   - Interview Prep - Module 1
   - Interview Prep - Module 2
   - Grooming - Module 1
   - Grooming - Module 2
   - Customer Service - Module 1
   - Customer Service - Module 2
   - Safety - Module 1
   - Safety - Module 2
   - Language - Module 1
   - Language - Module 2

Each module document should have:
- `name`, `description`, `category`, `order`
- `lessons` array with 3 items
- `created_at` and `updated_at` timestamps

## Verify Modules Appear on Courses Page

1. Navigate to `/courses`
2. Click **"Modules"** tab (next to "Courses" button)
3. You should see 10 module cards
4. Click on any module to test enrollment and video viewing

## Still Having Issues?

### Checklist:

- [ ] Firestore rules deployed to Firebase
- [ ] Logged in as governor user
- [ ] Browser console shows no errors
- [ ] Hard refreshed the page (Ctrl+F5)
- [ ] Firebase config in `.env` is correct
- [ ] Internet connection is stable

### Debug Information to Share:

If you need help, provide:

1. **Browser console output** - Copy all console logs when clicking "Initialize Sample Data"
2. **Error messages** - Any red errors in console
3. **Firebase rules** - Screenshot of rules in Firebase Console
4. **User role** - Screenshot showing you're logged in as governor
5. **Network tab** - Any failed HTTP requests (check browser DevTools → Network)

### Manual Test Query

Try this in browser console to test if you can read modules:

```javascript
// Open browser console (F12) and paste this:
import { collection, getDocs } from 'firebase/firestore';
import { db } from './src/lib/firebase';

(async () => {
  try {
    const modulesRef = collection(db, 'modules');
    const snapshot = await getDocs(modulesRef);
    console.log('✅ Modules found:', snapshot.size);
    snapshot.forEach(doc => console.log(' -', doc.data().name));
  } catch (err) {
    console.error('❌ Error:', err.code, err.message);
  }
})();
```

This will tell you if:
- ✅ You can read from modules collection (rules work)
- ❌ Permission denied (rules not deployed or incorrect)
- ❌ Collection doesn't exist (modules not created)

## Quick Fix Summary

**90% of the time, the issue is:**
1. Firestore rules not deployed
2. User not logged in as governor

**Quick fix:**
1. Deploy rules: `firebase deploy --only firestore:rules`
2. Hard refresh browser: Ctrl+F5 / Cmd+Shift+R
3. Click "Initialize Sample Data" again
4. Check console for detailed logs
