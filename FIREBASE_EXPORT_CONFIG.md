# Firebase Environment Configuration Guide

This document specifies all required Firebase environment variables for MenuxPRO.

> **SECURITY WARNING**: Never commit `.env.local` or any file containing real Firebase credentials to version control.

---

## Required Environment Variables

### Client-Side (NEXT_PUBLIC_ prefix)

These values are **safe to expose to the browser** as they are meant to be public. Find them in Firebase Console > Project Settings > General > Your Apps.

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API Key | `AIzaSyC...` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain | `your-project.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase Project ID | `your-project-id` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase Storage Bucket | `your-project.appspot.com` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | FCM Sender ID | `123456789012` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase App ID | `1:123456789012:web:abc123` |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Analytics Measurement ID (optional) | `G-ABC123DEF456` |

### Server-Side (NO NEXT_PUBLIC_ prefix)

These values are **sensitive credentials**. NEVER expose them to the client. Find them in Firebase Console > Project Settings > Service Accounts.

| Variable | Description | Example |
|----------|-------------|---------|
| `FIREBASE_CLIENT_EMAIL` | Service Account Email | `firebase-adminsdk@your-project.iam.gserviceaccount.com` |
| `FIREBASE_PRIVATE_KEY` | Service Account Private Key | `-----BEGIN PRIVATE KEY-----\n...` |

### SuperAdmin Configuration

| Variable | Description | Notes |
|----------|-------------|-------|
| `SUPERADMIN_UID` | SuperAdmin user UID | Server-only, no NEXT_PUBLIC_ prefix |

### Site Configuration

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SITE_URL` | Public URL of your MenuxPRO instance | `https://menux.tn` |

---

## Local Development Setup

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your Firebase values in `.env.local`

3. Start the development server:
   ```bash
   bun run dev
   ```

### Using Firebase Emulator (Optional)

For local development with Firebase Emulator Suite:

```bash
# Set emulator hosts
export FIRESTORE_EMULATOR_HOST=localhost:8080
export FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
```

---

## Vercel Deployment

1. Go to your Vercel project settings
2. Navigate to Environment Variables
3. Add ALL variables from the tables above
4. For `FIREBASE_PRIVATE_KEY`:
   - Paste the entire key including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
   - Ensure newlines are preserved (use `\n` for newlines)

### Vercel CLI (Alternative)

```bash
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
# ... repeat for all variables
```

---

## Firebase Admin SDK

The Admin SDK is used for:
- SuperAdmin custom claims verification
- Server-side authentication
- Administrative operations

### Required Variables for Admin SDK

```env
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour_Private_Key_Here\n-----END PRIVATE KEY-----\n"
```

### Testing Admin SDK

```bash
# Test superadmin claim script (development only)
bun run scripts/set-superadmin-claim.ts <uid>

# In production, requires explicit override
ALLOW_SUPERADMIN_SCRIPT=true bun run scripts/set-superadmin-claim.ts <uid>
```

---

## Firebase Cloud Messaging (VAPID)

If using push notifications:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_FIREBASE_VAPID_KEY` | VAPID key for web push |

Generate VAPID key in Firebase Console > Project Settings > Cloud Messaging > Web Push Certificates.

---

## Security Checklist

- [ ] `.env.local` is in `.gitignore`
- [ ] No Firebase private keys in client code
- [ ] `FIREBASE_PRIVATE_KEY` has no NEXT_PUBLIC_ prefix
- [ ] `SUPERADMIN_UID` has no NEXT_PUBLIC_ prefix
- [ ] Service account has minimal required permissions
- [ ] Production Firebase project has proper security rules deployed

---

## Troubleshooting

### "Missing Firebase Admin credentials"

Ensure these are set:
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

### "auth/invalid-api-key"

1. Verify `NEXT_PUBLIC_FIREBASE_API_KEY` is correct
2. Check that the API key is not restricted to specific domains
3. Add your domain to Firebase Console > Project Settings > Authorized domains

### Build fails with Firebase errors

1. Ensure all `NEXT_PUBLIC_` variables are set
2. Check for typos in variable names
3. Verify Firebase project exists and is accessible

---

## Quick Reference

```env
# .env.local (NEVER COMMIT THIS FILE)

# Client Firebase Config
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Server Firebase Config (SECRET)
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# SuperAdmin
SUPERADMIN_UID=your_superadmin_uid

# Site URL
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# Database
DATABASE_URL=file:./db/menux.db
```

---

*Last updated: 2025-01-08*
