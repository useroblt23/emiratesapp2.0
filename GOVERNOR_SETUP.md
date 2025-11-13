# Governor Control Nexus - Level 2 Setup Guide

This document provides complete setup instructions for the enhanced Governor Control Nexus system with Cloud Functions, Stripe integration, and advanced permissions.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Variables Setup](#environment-variables-setup)
3. [Cloud Functions Deployment](#cloud-functions-deployment)
4. [Firestore Rules & Indexes](#firestore-rules--indexes)
5. [Governor Roles Setup](#governor-roles-setup)
6. [Stripe Webhook Configuration](#stripe-webhook-configuration)
7. [First Governor User](#first-governor-user)
8. [Testing & Verification](#testing--verification)
9. [Security & API Key Rotation](#security--api-key-rotation)

---

## Prerequisites

- Firebase CLI installed: `npm install -g firebase-tools`
- Node.js 18+ installed
- Firebase project created (emirates-app-d80c5)
- Firebase Blaze plan (required for Cloud Functions)
- Stripe account (for payment features)
- DeepSeek API key (for AI Assistant - optional)

---

## Environment Variables Setup

### Frontend Environment (.env)

Copy `.env.example` to `.env` and update:

```bash
cp .env.example .env
```

The `.env` file should contain:

```env
VITE_FIREBASE_API_KEY="your_firebase_api_key"
VITE_FIREBASE_AUTH_DOMAIN="your_project.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your_project_id"
VITE_FIREBASE_STORAGE_BUCKET="your_bucket.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="your_sender_id"
VITE_FIREBASE_APP_ID="your_app_id"
VITE_FIREBASE_MEASUREMENT_ID="your_measurement_id"

# Cloud Functions Base URL (update after deployment)
VITE_API_BASE_URL=https://us-central1-your-project.cloudfunctions.net

# Governor Console Feature Flag
VITE_GOVERNOR_CONSOLE_ENABLED=true
```

### Cloud Functions Environment

Navigate to functions directory:

```bash
cd functions
cp .env.example .env
```

Edit `functions/.env`:

```env
DEEPSEEK_API_KEY=your_deepseek_api_key
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
GCS_BUCKET=your_backup_bucket
ADMIN_EMAILS=admin1@example.com,admin2@example.com
```

**Set using Firebase CLI (recommended for production):**

```bash
firebase functions:config:set \
  deepseek.api_key="your_deepseek_api_key" \
  stripe.secret_key="sk_live_your_key" \
  stripe.webhook_secret="whsec_your_secret"
```

View current config:

```bash
firebase functions:config:get
```

---

## Cloud Functions Deployment

### 1. Install Dependencies

```bash
cd functions
npm install
```

### 2. Build TypeScript

```bash
npm run build
```

### 3. Deploy Functions

Deploy all functions:

```bash
firebase deploy --only functions
```

Or deploy specific functions:

```bash
firebase deploy --only functions:runGovernorCommand
firebase deploy --only functions:stripeWebhookHandler
firebase deploy --only functions:aiAssistantProxy
firebase deploy --only functions:triggerManualBackup
firebase deploy --only functions:fetchLargeMetrics
firebase deploy --only functions:syncStripeToFirestore
```

### 4. Note Function URLs

After deployment, note the HTTPS endpoint URLs. They'll be in format:

```
https://us-central1-PROJECT_ID.cloudfunctions.net/FUNCTION_NAME
```

---

## Firestore Rules & Indexes

### 1. Deploy Security Rules

```bash
firebase deploy --only firestore:rules
```

This deploys the enhanced security rules with role-based permissions from `firestore.rules`.

### 2. Deploy Indexes

```bash
firebase deploy --only firestore:indexes
```

This creates all necessary composite indexes defined in `firestore.indexes.json`.

**Note:** Index creation can take several minutes. Monitor progress in Firebase Console.

---

## Governor Roles Setup

### 1. Initialize System Control

The system will auto-create the `systemControl/status` document on first access. You can also manually create it:

**Using Firebase Console:**

1. Go to Firestore Database
2. Create collection: `systemControl`
3. Add document with ID: `status`
4. Add fields:

```json
{
  "features": {
    "aiTrainer": true,
    "openDay": true,
    "chat": true,
    "courses": true,
    "profileEdit": true,
    "downloads": true,
    "stripePayments": true
  },
  "announcement": {
    "active": false,
    "message": "",
    "type": "info",
    "startedAt": null,
    "expiresAt": null
  },
  "maintenance": {
    "active": false,
    "message": "",
    "startedAt": null
  },
  "updatedBy": "system",
  "updatedAt": "SERVER_TIMESTAMP"
}
```

### 2. Create Governor Roles

Create these documents in `governorRoles` collection:

**Document ID: `governor` (Super Admin)**

```json
{
  "id": "governor",
  "name": "Governor",
  "permissions": {
    "manageUsers": true,
    "manageContent": true,
    "manageBilling": true,
    "manageSystem": true,
    "viewAudit": true
  }
}
```

**Document ID: `finance`**

```json
{
  "id": "finance",
  "name": "Finance Manager",
  "permissions": {
    "manageUsers": false,
    "manageContent": false,
    "manageBilling": true,
    "manageSystem": false,
    "viewAudit": true
  }
}
```

**Document ID: `moderator`**

```json
{
  "id": "moderator",
  "name": "Content Moderator",
  "permissions": {
    "manageUsers": false,
    "manageContent": true,
    "manageBilling": false,
    "manageSystem": false,
    "viewAudit": false
  }
}
```

**Document ID: `trainer`**

```json
{
  "id": "trainer",
  "name": "Trainer",
  "permissions": {
    "manageUsers": false,
    "manageContent": true,
    "manageBilling": false,
    "manageSystem": false,
    "viewAudit": false
  }
}
```

---

## Stripe Webhook Configuration

### 1. Get Webhook Endpoint URL

After deploying Cloud Functions, get the `stripeWebhookHandler` URL:

```
https://us-central1-PROJECT_ID.cloudfunctions.net/stripeWebhookHandler
```

### 2. Configure in Stripe Dashboard

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Enter your webhook URL
4. Select events to listen for:
   - `customer.created`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `charge.refunded`
   - `subscription.updated`
   - `charge.dispute.created`
5. Copy the webhook signing secret
6. Update Cloud Functions config:

```bash
firebase functions:config:set stripe.webhook_secret="whsec_YOUR_SECRET"
firebase deploy --only functions:stripeWebhookHandler
```

### 3. Test Webhook

Use Stripe CLI to test locally:

```bash
stripe listen --forward-to http://localhost:5001/PROJECT_ID/us-central1/stripeWebhookHandler
```

---

## First Governor User

### Option 1: Firebase Console

1. Go to Firestore Database
2. Find your user document in `users` collection
3. Update the user document:

```json
{
  "role": "governor",
  "plan": "vip"
}
```

### Option 2: Firebase Authentication

1. Create user via Firebase Authentication UI
2. Note the UID
3. Create corresponding user document in Firestore `users` collection
4. Set `role: "governor"`

### Option 3: Using Firebase Admin SDK (Node.js script)

Create `scripts/create-governor.js`:

```javascript
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function createGovernor(email, name) {
  try {
    // Create auth user
    const user = await admin.auth().createUser({
      email,
      password: 'temporaryPassword123!', // User should change this
      displayName: name,
    });

    // Create Firestore document
    await db.collection('users').doc(user.uid).set({
      uid: user.uid,
      email,
      name,
      role: 'governor',
      plan: 'vip',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'active',
    });

    console.log(`Governor created: ${email} (UID: ${user.uid})`);
    console.log('IMPORTANT: User should change password on first login');
  } catch (error) {
    console.error('Error creating governor:', error);
  }
}

createGovernor('governor@example.com', 'Governor Name');
```

Run:

```bash
node scripts/create-governor.js
```

---

## Testing & Verification

### 1. Test System Control

Log in as governor and navigate to `/governor/nexus`

### 2. Test Feature Toggle

Try running a command:

```javascript
// In browser console or via UI
runGovernorCommand({
  command: 'disable aiTrainer',
});
```

### 3. Test Announcement

```javascript
runGovernorCommand({
  command: 'announce',
  args: {
    message: 'Welcome to the new system!',
    type: 'info',
    expiresAt: null,
  },
});
```

### 4. Test Maintenance Mode

```javascript
runGovernorCommand({
  command: 'maintenance on System maintenance in progress',
});
```

### 5. Verify Audit Logs

Check Firestore `audit` collection for logged events.

### 6. Test Stripe Webhook

Create a test payment in Stripe and verify:
- Payment appears in `stripe/invoices` collection
- Audit event logged in `audit` collection

---

## Security & API Key Rotation

### Rotating DeepSeek API Key

1. Generate new key from DeepSeek dashboard
2. Update Cloud Functions config:

```bash
firebase functions:config:set deepseek.api_key="NEW_KEY"
firebase deploy --only functions:aiAssistantProxy
```

### Rotating Stripe Keys

1. Generate new keys in Stripe Dashboard
2. Update config:

```bash
firebase functions:config:set \
  stripe.secret_key="NEW_SECRET_KEY" \
  stripe.webhook_secret="NEW_WEBHOOK_SECRET"
firebase deploy --only functions
```

3. Update webhook endpoint in Stripe Dashboard

### Emergency Access Revocation

To immediately revoke access:

1. Suspend user:

```javascript
runGovernorCommand({
  command: 'suspendUser',
  args: { uid: 'USER_ID' },
});
```

2. Force logout:

```javascript
runGovernorCommand({
  command: 'forceLogout',
  args: { uid: 'USER_ID' },
});
```

### Monitoring & Alerts

- Check `audit` collection regularly
- Monitor Cloud Functions logs: `firebase functions:log`
- Set up budget alerts in Google Cloud Console
- Monitor Stripe dashboard for payment anomalies

---

## Troubleshooting

### Functions Not Deploying

```bash
# Check Firebase login
firebase login

# Check project
firebase use --add

# Redeploy with verbose
firebase deploy --only functions --debug
```

### Permission Denied Errors

- Verify user has correct role in Firestore
- Check `governorRoles` collection exists
- Verify Firestore rules deployed correctly

### Stripe Webhook Failures

- Check webhook secret matches
- Verify function URL in Stripe dashboard
- Check Cloud Functions logs

### AI Assistant Not Working

- Verify DEEPSEEK_API_KEY is set
- Check API quota/limits
- Review function logs for API errors

---

## Additional Resources

- [Firebase Cloud Functions Documentation](https://firebase.google.com/docs/functions)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [DeepSeek API Documentation](https://deepseek.com/docs)

---

## Support

For issues or questions:
1. Check Cloud Functions logs: `firebase functions:log`
2. Review Firestore rules: `firebase firestore:rules:get`
3. Check audit logs in Firestore `audit` collection
4. Review this documentation

---

**Last Updated:** November 2025
**Version:** 2.0.0 (Level-2 Enhanced System)
