# Panda Portfolio

AI Engineer & MSCS Student Portfolio for Ashish Kumar Panda.

## 🚀 Why is my site only showing the README on GitHub?

GitHub Pages (the `.github.io` URL) only hosts **static HTML**. Because this is a high-performance **Next.js** app with **AI (Genkit)** features, it needs a real server to run. 

**To host your portfolio properly, use Firebase App Hosting:**

### Step 1: Push your code to GitHub
If you haven't already, ensure your source code is on GitHub:
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 2: Deploy to Firebase App Hosting
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Select your project.
3. In the left sidebar, click **Build** > **App Hosting**.
4. Click **Get Started** and connect your GitHub account.
5. Select your repository (`Ashindustry007/ashindustry007.github.io`).
6. Set the deployment settings (default settings usually work, ensure the root directory is correct).
7. Firebase will now automatically build and host your Next.js app every time you push to `main`.

---

## 🛠️ Local Development & Maintenance

### How to fix the "6k Files" issue
If you see 6,000+ files pending in Git, it means `node_modules` or `.next` folders were accidentally tracked. Run these commands:

1. **Clear the Git cache**:
   ```bash
   git rm -r --cached .
   ```
2. **Add everything back** (the `.gitignore` will now work):
   ```bash
   git add .
   ```
3. **Commit and Force Push**:
   ```bash
   git commit -m "Cleaned repository structure"
   git push origin main --force
   ```

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **AI Integration**: Genkit (Google AI)
- **Styling**: Tailwind CSS + ShadCN UI
- **Animations**: Framer Motion
- **Hosting**: Firebase App Hosting (Supports SSR & AI)
