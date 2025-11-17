# Splitwise-like app (React + Firebase)

This is a full-featured Splitwise-like app using React (Vite + TypeScript) on the frontend and Firebase (Auth + Firestore) for backend services. Designed for deployment to Vercel with automated CI/CD via GitHub Actions.

**Demo Features:**
- 🔐 Email/password and Google OAuth authentication
- 👥 Create groups and invite members by email
- 💰 Track expenses with flexible split logic
- 📊 Real-time balance calculations and settlement tracking
- 📝 Activity feed for group events
- ⚡ Responsive UI with React Router navigation

## Table of Contents

- [Quick Start](#quick-start)
- [Development](#development)
- [Firebase Setup](#firebase-setup)
- [Deployment](#deployment)
- [Architecture](#architecture)
- [Troubleshooting](#troubleshooting)

## Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd SplitWise
npm install
```

### 2. Set up Environment Variables

Copy `.env.example` to `.env.local` and fill in your Firebase credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Firebase Web App config:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. Run Locally

```bash
npm run dev
```

Visit `http://localhost:5173` in your browser.

### 4. Build for Production

```bash
npm run build
npm run preview
```

## Development

### Code Quality

**Lint code:**
```bash
npm run lint       # Show warnings
npm run lint:fix   # Auto-fix issues
```

**Format code:**
```bash
npm run format     # Format all files
```

### Testing

**Run unit tests:**
```bash
npm run test       # Watch mode
npm run test -- --run  # Single run
```

**Test UI dashboard:**
```bash
npm run test:ui
```

**Coverage report:**
```bash
npm run test:coverage
```

Tests cover:
- ✅ Balance calculation logic (equal/unequal splits)
- ✅ Multiple payer scenarios
- ✅ Settlement reconciliation
- ✅ Net balance calculations

## Firebase Setup

### Prerequisites

- A Firebase project (free tier is fine)
- Node.js 18+
- Firebase CLI: `npm install -g firebase-tools`

### Step-by-step Setup

1. **Create a Firebase Project**
   - Go to [firebase.google.com](https://firebase.google.com)
   - Click "Create project" or add to existing project
   - Enable Google Analytics (optional)

2. **Set up Authentication**
   - In Firebase Console, go to **Authentication**
   - Click **Get started**
   - Enable **Email/Password** provider
   - Enable **Google** provider
   - Configure OAuth consent screen if needed

3. **Create Firestore Database**
   - In Firebase Console, go to **Firestore Database**
   - Click **Create database**
   - Start in **test mode** (for development)
   - Choose your region (e.g., `us-central1`)
   - Deploy default security rules (we'll update them)

4. **Add Web App**
   - In Firebase Console, go to **Project settings**
   - Click **Add app** and select **Web**
   - Copy the config object and save values to `.env.local`

5. **Deploy Security Rules**
   ```bash
   firebase init  # If not already done, select Firestore
   firebase deploy --only firestore
   ```

### Security Rules

The `firestore.rules` file includes starter rules:
- Users can only read/write their own profiles
- Group members can read group and subcollection data
- Owners can update group settings
- Members can create expenses and settlements
- Activity logs are automatically created

**Review and customize** before deploying to production.

## Deployment

### Deploy to Vercel (Recommended)

#### Option 1: GitHub Integration (Automatic)

1. **Create GitHub Repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/splitwise.git
   git push -u origin main
   ```

2. **Link to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click **New Project**
   - Import your GitHub repository
   - Select framework: **Vite**
   - Build command: `npm run build` (auto-detected)
   - Output directory: `dist` (auto-detected)

3. **Add Environment Variables**
   - In Vercel project settings, go to **Environment Variables**
   - Add all `VITE_FIREBASE_*` variables from `.env.local`
   - Environment: Production, Preview, Development

4. **Deploy**
   - Click **Deploy**
   - Vercel will automatically build and deploy on every push to `main`
   - Preview deployments for pull requests

#### Option 2: GitHub Actions + Vercel CLI

The project includes a GitHub Actions workflow (`.github/workflows/ci.yml`) for automated deployments.

1. **Set GitHub Secrets**
   - Go to your GitHub repo: **Settings > Secrets and variables > Actions**
   - Add these secrets:
     - `VERCEL_TOKEN`: Get from [vercel.com/account/tokens](https://vercel.com/account/tokens)
     - `VERCEL_ORG_ID`: Get from Vercel project settings
     - `VERCEL_PROJECT_ID`: Get from Vercel project settings

2. **Workflow Runs**
   - On every push to `main`:
     - Runs linting
     - Runs tests
     - Builds production bundle
     - Deploys to Vercel
   - Pull requests: runs linting, tests, and build without deploying

#### Option 3: Manual Deployment

```bash
npm install -g vercel
npm run build
vercel --prod
```

### Troubleshooting Deployment

**Build fails: "Firebase config not found"**
- Ensure all `VITE_FIREBASE_*` variables are set in Vercel project settings
- Verify they match your Firebase Web App config

**Firebase errors in production**
- Check Firestore security rules are deployed: `firebase deploy --only firestore`
- Verify Firestore database is in the correct region
- Check browser console for CORS or permission errors

**Environment variables not loading**
- Vercel environment variables must start with `VITE_` to be accessible in browser
- Redeploy after adding/updating variables
- Clear browser cache

## Architecture

### Tech Stack

- **Frontend**: React 18, Vite 5, TypeScript 5, React Router 6
- **Backend**: Firebase v9 (Auth, Firestore)
- **Testing**: Vitest, Testing Library, JSDOM
- **Linting**: ESLint, Prettier
- **CI/CD**: GitHub Actions
- **Hosting**: Vercel

### Data Model

**Collections:**

```
users/{userId}
  - email: string
  - createdAt: timestamp
  
groups/{groupId}
  - name: string
  - owner: userId
  - members: [userId]
  - createdAt: timestamp
  
  └─ expenses/{expenseId}
     - amount: number
     - payer: userId
     - splits: { userId: amount }
     - description: string
     - timestamp: timestamp
     
  └─ settlements/{settlementId}
     - from: userId
     - to: userId
     - amount: number
     - description: string
     - timestamp: timestamp
     
  └─ activities/{activityId}
     - type: 'expense_added' | 'settlement_recorded' | 'member_invited'
     - actorId: userId
     - timestamp: timestamp
     - (other event-specific fields)

invites/{inviteId}
  - email: string (lowercased)
  - groupId: string
  - groupName: string
  - status: 'pending' | 'accepted'
  - createdAt: timestamp
```

### Key Features

**Balance Calculations:**
- Tracks who paid and who owes using split logic
- Supports equal splits, custom amounts, or custom percentages
- Calculates net balances considering settlements
- Shows minimal settlement suggestions

**Group Management:**
- Owners create groups and invite members by email
- Invited users accept and join groups
- All group members can see expenses and balances
- Only owners can update group settings

**Activity Feed:**
- Logs all expense, settlement, and member events
- Displays with timestamps in chronological order
- Used for notifications and audit trail

### Firestore Rules

Located in `firestore.rules`:

```firestore-rules
// Users: read/write own profile only
match /users/{userId}

// Groups: members can read, owner can manage
match /groups/{groupId}
  
  // Subcollections: expenses, settlements, activities
  match /expenses/{expenseId}
  match /settlements/{settlementId}
  match /activities/{activityId}

// Invites: user can read own, owner can manage
match /invites/{inviteId}
```

## Project Structure

```
src/
  __tests__/
    balance.test.ts          # Unit tests for balance calculations
  firebase/
    config.ts                # Firebase init + all helpers
  pages/
    Login.tsx                # Auth page
    Dashboard.tsx            # Groups list + pending invites
    CreateGroup.tsx          # New group form
    GroupView.tsx            # Group detail + expenses + activity
  App.tsx                    # Routes + auth guard
  main.tsx                   # Entry point
  styles.css                 # Global styles

scripts/
  test-rules.mjs             # Firestore rules test harness

.github/workflows/
  ci.yml                     # GitHub Actions CI/CD workflow

firestore.rules              # Security rules
firebase.json                # Firebase config
.eslintrc.cjs                # ESLint config
.prettierrc                  # Prettier config
vitest.config.ts             # Vitest config
tsconfig.json                # TypeScript config
package.json                 # Dependencies + scripts
.env.example                 # Environment template
```

## Firebase Emulator (Local Testing)

For local development and security rules testing:

```bash
# Install Firebase CLI if not already done
npm install -g firebase-tools

# Start the emulator
firebase emulators:start --only firestore

# In another terminal, run tests
npm run test-rules
```

The emulator runs at `http://localhost:8080` by default.

## Features

- ✅ **Authentication**: Email/password + Google OAuth
- ✅ **Groups**: Create, manage, invite members
- ✅ **Expenses**: Add with flexible splits, track balances
- ✅ **Settlements**: Record payments, net balance reconciliation
- ✅ **Invites**: Email-based member invitations
- ✅ **Activity Feed**: Event logging and audit trail
- ✅ **Security**: Firestore rules, auth guards
- ✅ **Testing**: Unit tests for core logic (7 tests, 100% pass)
- ✅ **CI/CD**: GitHub Actions + Vercel auto-deploy
- ✅ **Code Quality**: ESLint + Prettier + TypeScript strict mode

## Scripts

```bash
npm run dev              # Start dev server (Vite)
npm run build           # Build for production
npm run preview         # Preview production build
npm run lint            # Run ESLint (warnings + errors)
npm run lint:fix        # Auto-fix lint issues
npm run format          # Format code with Prettier
npm run test            # Run tests (watch mode)
npm run test -- --run   # Run tests once
npm run test:ui         # Interactive test UI
npm run test:coverage   # Coverage report
npm run test-rules      # Test Firestore rules (requires emulator)
```

## Troubleshooting

### "Firebase config not found" warning

**Cause**: Environment variables not loaded.

**Fix**:
1. Ensure `.env.local` exists with `VITE_FIREBASE_*` variables
2. Restart the dev server: `npm run dev`
3. Check browser DevTools console for warnings
4. In production, verify Vercel environment variables are set

### Tests fail to run

**Cause**: Vitest not installed or configured incorrectly.

**Fix**:
```bash
npm install
npm run test -- --run
```

### Firestore rules test fails

**Cause**: Emulator not running.

**Fix**:
```bash
firebase emulators:start --only firestore
# In another terminal:
npm run test-rules
```

### "Unexpected any" ESLint warnings

**Cause**: TypeScript strict mode with Firebase's dynamic typing.

**Fix**: These are warnings, not errors. For production, replace `any` with proper types:
```typescript
// Instead of:
const user: any = ...

// Use:
const user: FirebaseUser | null = ...
```

### Build too large (500KB+ warning)

**Cause**: Firebase v9 includes all modules.

**Fix** (optional, for production optimization):
1. Use dynamic imports for components
2. Lazy-load routes:
   ```typescript
   const GroupView = React.lazy(() => import('./pages/GroupView'))
   ```
3. Tree-shake unused Firebase functions

## Next Steps

### To Improve

1. **Type Safety**: Replace `any` types with proper interfaces
2. **Error Handling**: Add better error boundaries and retry logic
3. **Notifications**: Implement email or push notifications
4. **Analytics**: Add Firebase Analytics or Mixpanel
5. **Payments**: Integrate Stripe for settling up
6. **PWA**: Make it installable as a web app
7. **Offline Support**: Add service workers for offline access

### To Deploy

1. Set up Firebase project with proper security rules for production
2. Create GitHub repository
3. Link to Vercel (auto-deploys on push to `main`)
4. Configure GitHub secrets for CI/CD
5. Add custom domain (optional)

## License

MIT

---

**Questions or issues?** Open an issue on GitHub or check the [Firebase docs](https://firebase.google.com/docs) and [Vercel docs](https://vercel.com/docs).
