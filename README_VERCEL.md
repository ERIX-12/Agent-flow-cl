# Host on Vercel 🚀

This full-stack application (Vite React + Express) has been fully prepared for seamless, zero-config deployment on Vercel. 

---

## 🛠️ Step-by-Step Deployment

### Step 1: Export project to GitHub
In **Google AI Studio Build**, open the settings/export menu and export your repository directly to **GitHub** or download it as a **ZIP** file and push it to a new GitHub repo.

### Step 2: Import into Vercel
1. Go to the [Vercel Dashboard](https://vercel.com/) and click **Add New** > **Project**.
2. Select your imported GitHub repository.
3. Vercel will automatically auto-detect the **Vite** framework preset.

### Step 3: Configure Environment Variables
Expand the **Environment Variables** section and add:
- `GEMINI_API_KEY`: Your Google Gemini API Key.

### Step 4: Deploy
Click **Deploy**. Vercel will:
1. Run `npm run build` to compile the frontend static assets.
2. Publish static files to their edge global CDN.
3. Turn `/api/index.ts` into a fast, scale-to-zero serverless function to power your Express API.

---

## 💾 Serverless Storage Considerations

This application currently uses a lightweight, local, file-based database (`db_store.json`) to track user jobs and agent statuses. 

- **How it runs on Vercel:** Under Vercel, the serverless execution environment has an **ephemeral storage layer**. State changes may be reset when serverless instances spin down.
- **For production use:** For long-term persistent storage, we recommend integrating a cloud database. Since we have a modular backend setup, you can easily integrate:
  - **Firebase Firestore**
  - **Supabase / PostgresSQL** / **Neon**
  - **MongoDB**
