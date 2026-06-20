# Continuous Deployment Guide: Vercel (Frontend) + Render (Backend) 🚀

This guide explains how to deploy this full-stack application with the **Frontend** hosted on Vercel and the **Backend (Express)** hosted on Render. This architecture ensures high-performance client serving paired with a reliable, continuous backend process supporting long-running multi-agent pipelines.

---

## 🏗️ Architecture Design

- **Frontend (Vercel):** Clean static Vite React app served globally on Vercel's Edge CDN.
- **Backend (Render):** Reliable Node.js process running Express, enabling stable execution of sequential multi-agent stages without serverless timeout limitations.

---

## 1. 🌐 Setup Backend on Render

1. Go to the [Render Dashboard](https://dashboard.render.com/) and click **New** > **Web Service**.
2. Connect your GitHub repository.
3. Configure the following settings:
   - **Runtime:** `Node`
   - **Build Command:** `npm run build`
   - **Start Command:** `npm run start` 
4. Under the **Environment** tab, click **Add Environment Variable** and define:
   - `GEMINI_API_KEY`: *(Your Google Gemini API Key from Google AI Studio)*
   - `NODE_ENV`: `production`
5. Click **Create Web Service**.
6. Once deployed, Render will provide your public backend URL (e.g., `https://agent-flow-backend.onrender.com`). **Copy this URL**.

---

## 2. ⚡ Setup Frontend on Vercel

1. Go to the [Vercel Dashboard](https://vercel.com/) and click **Add New** > **Project**.
2. Select your cloned GitHub repository.
3. Keep the default **Vite** project configuration.
4. Under the **Environment Variables** section, add:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://agent-flow-cl.onrender.com` *(This is your active backend URL)*
5. Click **Deploy**.

---

## 🔑 How to find your Google Gemini API Key
To retrieve your credentials:
1. Navigate directly to the **[Google AI Studio API Keys Page](https://aistudio.google.com/app/apikey)**.
2. Select **Create API Key** or copy an existing key.
3. Paste the key value safely into your **Render Environment Variables** list as `GEMINI_API_KEY`. 

> ⚠️ **Security Tip:** Do NOT add `GEMINI_API_KEY` to Vercel. Adding it only to Render keeps the key safely hidden on your private backend.
