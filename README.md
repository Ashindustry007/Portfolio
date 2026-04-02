# Panda Portfolio

AI Engineer & MSCS Student Portfolio for Ashish Kumar Panda.

## 💸 Zero-Cost Deployment Guide

To host this AI-powered portfolio for **completely free**, follow these steps:

### 1. Get a Free Gemini API Key
This app uses Genkit and Google AI. You can get a free API key:
1. Go to [Google AI Studio](https://aistudio.google.com/).
2. Create a new API Key.
3. You will use this in the next step.

### 2. Deploy to Firebase (Free Tier / Spark Plan)
Firebase's **Spark Plan** is $0/month and provides enough resources for a high-traffic personal portfolio.

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Ready for free deployment"
   git push origin main
   ```
2. **Go to the [Firebase Console](https://console.firebase.google.com/)**.
3. Create a new project (select the **Spark Plan**).
4. Navigate to **Build > App Hosting**.
5. Click **Get Started** and connect your GitHub repo.
6. **Important (Environment Variables)**: During setup or in the App Hosting settings after deployment, add your Gemini API key:
   - Key: `GOOGLE_GENAI_API_KEY`
   - Value: `YOUR_API_KEY_FROM_STEP_1`
7. Firebase will automatically build and host your site.

---

## 🛠️ Troubleshooting common issues

### "6k Files" Git Issue
If Git is trying to upload 6,000+ files, run these commands to clean it up:
```bash
git rm -r --cached .
git add .
git commit -m "Cleaned repository"
git push origin main --force
```

### Why not GitHub Pages?
GitHub Pages only hosts static files. Because this portfolio uses **Server-Side Rendering (SSR)** and **AI (Genkit)**, it requires a server environment like Firebase App Hosting to function correctly.

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **AI Integration**: Genkit (Google AI)
- **Free Hosting**: Firebase App Hosting (Spark Plan)
- **Styling**: Tailwind CSS + ShadCN UI
- **Animations**: Framer Motion
