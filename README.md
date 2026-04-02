# Panda Portfolio

AI Engineer & MSCS Student Portfolio for Ashish Kumar Panda.

## How to push to GitHub (Fixing the "6k Files" issue)

If you see 6,000+ files pending, it means `node_modules` or `.next` folders were accidentally tracked. Follow these exact steps in your terminal to fix it and force push only the source code:

1. **Clear the Git cache** (this removes everything from being tracked without deleting your actual files):
   ```bash
   git rm -r --cached .
   ```

2. **Add everything back** (the `.gitignore` file will now correctly exclude the 6k+ dependency files):
   ```bash
   git add .
   ```

3. **Check the status**:
   ```bash
   git status
   ```
   *You should now see only ~50-100 files listed, not 6,000.*

4. **Commit the changes**:
   ```bash
   git commit -m "Initial commit: Cinematic Portfolio (Source Only)"
   ```

5. **Force push to your repository**:
   ```bash
   git remote add origin https://github.com/Ashindustry007/ashindustry007.github.io.git
   git branch -M main
   git push -u origin main --force
   ```

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS + ShadCN UI
- **Animations**: Framer Motion
- **AI Integration**: Genkit
- **Database**: Firebase / Firestore
