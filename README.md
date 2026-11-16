# TAHA AI NEWS - Minimalist Daily AI News Website

A clean, minimalist, fully responsive, and automated Artificial Intelligence news website. It includes an automated end-to-end pipeline that daily researches, fact-checks, verifies, and publishes real AI news using GitHub Actions and Gemini AI.

---

## 🤖 Automated Daily AI Pipeline (Subha 8 Bje & Sham 6 Bje PKT)

Yeh repository **GitHub Actions** aur **Gemini AI** ke zariye fully automated hai:

1. **AI News Research**:
   - Google News AI, TechCrunch AI aur The Verge AI se live breaking tech & AI news fetch hoti hain.
2. **AI Fact-Checking & Verification**:
   - Gemini AI clickbait aur fake rumors ko filter out karta hai.
   - Real, authentic model releases, benchmarks, tools aur research stories ko verify karke crisp summary aur categories assign karta hai.
3. **Auto-Publishing**:
   - Nayi verified stories automatically `js/news-data.js` mein add hoti hain aur repository par commit & push ho jati hain.
4. **Schedule Timings (Pakistan Standard Time - PKT)**:
   - ☀️ **Subha 08:00 AM PKT** (03:00 UTC)
   - 🌙 **Sham 06:00 PM PKT** (13:00 UTC)
   - 🔘 **Manual Run**: GitHub Actions tab par jaa kar **"Run workflow"** button dabane se kisi bhi waqt manually chala sakte hain!

---

## 🔑 GitHub Secret Setup (Important Step)

Pipeline ko automatically chalne ke liye aapko apna Gemini API Key GitHub repository ke secrets mein add karna hai:

1. Apni repo mein jayein: [https://github.com/imbilawal22/taha_ai_news/settings/secrets/actions](https://github.com/imbilawal22/taha_ai_news/settings/secrets/actions)
2. **"New repository secret"** button par click karein.
3. **Name**: `GEMINI_API_KEY`
4. **Secret**: Apna API key paste karein (jo aapne provide kiya tha)
5. **Add secret** par click karein. Done!

---

## 🌐 Free Website Deployment (GitHub Pages)

Website ko free live karne ke liye:
1. Repo ke **Settings** -> **Pages** ([Link](https://github.com/imbilawal22/taha_ai_news/settings/pages)) par jayein.
2. **Source**: Select karein `Deploy from a branch`.
3. **Branch**: `main` aur folder `/ (root)` select karke **Save** karein.
4. 1-2 minutes mein aapki website live ho jayegi:
   👉 `https://imbilawal22.github.io/taha_ai_news/`

---

## 📁 Files & Folder Structure

```
taha_ai_news/
├── .github/workflows/
│   └── ai_news_pipeline.yml  # GitHub Actions cron schedule (8 AM & 6 PM PKT)
├── scripts/
│   └── fetch_and_publish_news.py # Python script for feed research, Gemini fact-check & publish
├── index.html            # Main website homepage
├── post-template.html    # Full-page article template
├── README.md             # Complete documentation
├── css/
│   └── style.css         # Minimalist stylesheet (Light/Dark themes)
├── js/
│   ├── news-data.js      # Auto-updated news data store
│   └── main.js           # Theme toggle, search, filter chips & modal logic
└── assets/
    ├── icons/            # SVG icons
    └── images/           # Images/thumbnails folder
```
