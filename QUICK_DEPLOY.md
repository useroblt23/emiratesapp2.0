# Quick Deploy Guide - Governor Control Nexus Level 2

## 5-Minute Setup

### 1. Install Dependencies (2 minutes)

```bash
# Root project
npm install

# Cloud Functions
cd functions
npm install
cd ..
```

### 2. Configure Environment (1 minute)

```bash
# Copy environment templates
cp .env.example .env
cp functions/.env.example functions/.env

# Edit both files with your keys
```

### 3. Deploy Firebase (2 minutes)

```bash
# Login to Firebase
firebase login

# Select project
firebase use emirates-app-d80c5

# Deploy everything
firebase deploy
```

## Essential Commands

### Deploy Specific Components

```bash
# Functions only
firebase deploy --only functions

# Rules only
firebase deploy --only firestore:rules

# Indexes only
firebase deploy --only firestore:indexes

# Hosting only
npm run build && firebase deploy --only hosting
```

### View Logs

```bash
# Function logs
firebase functions:log

# Specific function
firebase functions:log --only runGovernorCommand

# Follow logs
firebase functions:log --follow
```

### Set Function Config

```bash
# Set all at once
firebase functions:config:set \
  deepseek.api_key="sk-xxx" \
  stripe.secret_key="sk_live_xxx" \
  stripe.webhook_secret="whsec_xxx"

# View config
firebase functions:config:get

# Unset a value
firebase functions:config:unset deepseek.api_key
```

## Create First Governor

### Option 1: Firebase Console

1. Go to Firestore
2. Find your user in `users` collection
3. Set `role: "governor"`

### Option 2: Quick Script

```javascript
// Run in Firebase Console > Firestore Rules Playground
const db = firebase.firestore();

db.collection('users').doc('YOUR_USER_ID').update({
  role: 'governor',
  plan: 'vip'
}).then(() => console.log('Governor created!'));
```

## Initialize Collections

### Create systemControl Document

```javascript
// Run in Firebase Console
db.collection('systemControl').doc('status').set({
  features: {
    aiTrainer: true,
    openDay: true,
    chat: true,
    courses: true,
    profileEdit: true,
    downloads: true,
    stripePayments: true
  },
  announcement: {
    active: false,
    message: '',
    type: 'info',
    startedAt: null,
    expiresAt: null
  },
  maintenance: {
    active: false,
    message: '',
    startedAt: null
  },
  updatedBy: 'system',
  updatedAt: firebase.firestore.FieldValue.serverTimestamp()
});
```

### Create Governor Role

```javascript
db.collection('governorRoles').doc('governor').set({
  id: 'governor',
  name: 'Governor',
  permissions: {
    manageUsers: true,
    manageContent: true,
    manageBilling: true,
    manageSystem: true,
    viewAudit: true
  }
});
```

## Test Commands

### Via UI Command Console

Navigate to `/governor/nexus` and type:

```
enable aiTrainer
disable downloads
announce message="System updated!" type="success"
maintenance on Updating system
maintenance off
```

### Via Cloud Function (Developer Console)

```javascript
const functions = firebase.functions();

// Test feature toggle
functions.httpsCallable('runGovernorCommand')({
  command: 'enable aiTrainer'
}).then(result => console.log(result));

// Test announcement
functions.httpsCallable('runGovernorCommand')({
  command: 'announce',
  args: {
    message: 'Test announcement',
    type: 'info',
    expiresAt: null
  }
}).then(result => console.log(result));
```

## Stripe Webhook Setup

```bash
# 1. Get your webhook URL (after deploying functions)
echo "https://us-central1-$(firebase use).cloudfunctions.net/stripeWebhookHandler"

# 2. Add to Stripe Dashboard:
# https://dashboard.stripe.com/webhooks

# 3. Copy signing secret and set:
firebase functions:config:set stripe.webhook_secret="whsec_xxx"
firebase deploy --only functions:stripeWebhookHandler
```

## Common Issues

### Functions won't deploy
```bash
firebase login --reauth
firebase use --add
firebase deploy --only functions --debug
```

### Rules validation fails
```bash
firebase firestore:rules:get
# Fix issues, then:
firebase deploy --only firestore:rules
```

### Indexes not creating
```bash
# Wait 5-10 minutes after deployment
# Check status in Firebase Console > Firestore > Indexes
```

## Verification Checklist

```bash
# ✅ Functions deployed
firebase functions:list

# ✅ Rules deployed
firebase firestore:rules:get

# ✅ Config set
firebase functions:config:get

# ✅ Frontend built
ls dist/

# ✅ Governor user exists
# Check in Firebase Console > Firestore > users

# ✅ System control exists
# Check in Firebase Console > Firestore > systemControl

# ✅ Can access /governor/nexus
# Log in and navigate to URL
```

## Emergency Commands

### Disable All Features
```bash
firebase functions:call runGovernorCommand \
  --data='{"command":"disable aiTrainer"}' && \
firebase functions:call runGovernorCommand \
  --data='{"command":"disable openDay"}' && \
firebase functions:call runGovernorCommand \
  --data='{"command":"disable chat"}'
```

### Enable Maintenance Mode
```bash
firebase functions:call runGovernorCommand \
  --data='{"command":"maintenance on Emergency maintenance"}'
```

### Force User Logout
```bash
firebase functions:call runGovernorCommand \
  --data='{"command":"forceLogout","args":{"uid":"USER_ID"}}'
```

## Useful Links

- [Firebase Console](https://console.firebase.google.com)
- [Stripe Dashboard](https://dashboard.stripe.com)
- [Cloud Functions Logs](https://console.cloud.google.com/functions/list)
- [Full Setup Guide](./GOVERNOR_SETUP.md)
- [Implementation Summary](./GOVERNOR_LEVEL2_SUMMARY.md)

## Support

- Check function logs: `firebase functions:log`
- Review audit logs in Firestore `audit` collection
- See detailed setup: `GOVERNOR_SETUP.md`
- Check security rules: `firestore.rules`

---

**Quick Deploy Complete!** 🚀

Next: Log in as governor → Navigate to `/governor/nexus` → Test commands!
