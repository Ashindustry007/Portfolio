
# Panda Portfolio

AI Engineer & MSCS Student Portfolio for Ashish Kumar Panda.

## 🚀 GitHub Pages Deployment ($0/month)

This portfolio is configured for **Static Site Generation (SSG)**, allowing you to host it completely for free on GitHub Pages.

### 1. Prepare for Push
Ensure your local environment is clean. If you see thousands of files in Git, it's because `node_modules` or `.next` are being tracked. Run these commands:
```bash
git rm -r --cached .
git add .
git commit -m "Configure static export for GitHub Pages"
```

### 2. Deployment Steps
1. Push your code to the `main` branch of your repository: `https://github.com/Ashindustry007/ashindustry007.github.io`.
2. Go to your GitHub Repository **Settings > Pages**.
3. Under **Build and deployment > Source**, select **GitHub Actions**.
4. GitHub will automatically detect the Next.js project and provide a "Next.js" workflow template. Click **Configure**.
5. Commit the suggested `.github/workflows/nextjs.yml` file.
6. GitHub will now build and deploy your site automatically every time you push!

### 🔧 Why GitHub Pages?
- **Truly Free**: No credit card required.
- **Fast**: Global CDN hosting.
- **Automated**: Deploys directly from your code.

*Note: In static mode, any server-side features (like live Instagram API calls) are replaced with curated static data from `src/lib/config.ts`.*

---

## Tech Stack
- **Framework**: Next.js 15 (Static Export)
- **Styling**: Tailwind CSS + ShadCN UI
- **Animations**: Framer Motion
- **Hosting**: GitHub Pages
