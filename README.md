# RJ Car Rental

A modern car rental web application built with **React 19**, **TypeScript**, **Vite**, **Tailwind CSS v4**, and **Firebase**.

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI | React 19 + TypeScript |
| Routing | React Router DOM v7 |
| Styling | Tailwind CSS v4 |
| Backend / Auth | Firebase (Firestore + Auth + Storage) |
| Build Tool | Vite 8 |

---

## Getting Started

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd carrental-react
npm install
```

### 2. Configure Environment Variables

Copy the example env file and fill in your Firebase credentials:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |
| `VITE_FIREBASE_MEASUREMENT_ID` | Firebase measurement ID |

### 3. Run Locally

```bash
npm run dev
```

### 4. Build for Production

```bash
npm run build
```

---

## Deploying to Vercel

### Manual Steps

1. Push your project to a GitHub/GitLab/Bitbucket repository.
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import your repo.
3. Vercel will auto-detect the Vite framework. The `vercel.json` already sets the build command, output directory, and SPA rewrites.
4. In the **Environment Variables** section of the Vercel project settings, add all variables from `.env.example` with your real Firebase values.
5. Click **Deploy**.

> **Important:** Never commit your `.env` file. It is already excluded in `.gitignore`. Always set production secrets through the Vercel dashboard.

---

## Project Structure

```
src/
├── assets/        # Static assets
├── components/    # Reusable UI components
├── context/       # React context providers (Auth, etc.)
├── lib/           # Firebase initialization
├── pages/         # Route-level page components
├── services/      # Firestore data access layer
├── types/         # TypeScript type definitions
└── utils/         # Utility helpers
```
