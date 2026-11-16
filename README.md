# TAHA AI NEWS - Minimalist Daily AI News Website

A clean, minimalist, fully responsive, and user-friendly website designed specifically for posting daily Artificial Intelligence news and updates.

---

## 📁 Files & Folder Structure

```
taha_ai_news/
├── index.html            # Main website homepage (Header, Search, Filters, Empty State, News Grid, Newsletter, Footer)
├── post-template.html    # Clean article template for publishing detailed full-page news posts
├── README.md             # This guide
├── css/
│   └── style.css         # Minimalist stylesheet (Light/Dark themes, typography, responsive grid)
├── js/
│   ├── news-data.js      # Where you can add daily news posts (currently kept empty as requested)
│   └── main.js           # Theme toggle, search, filter chips, date badge, and post modal logic
└── assets/
    ├── icons/            # SVG icons
    └── images/           # Folder for article images/thumbnails
```

---

## ✨ Features Included

1. **Clean & Minimalist Design**: High-contrast typography (Inter), distraction-free reading, and generous whitespace.
2. **Empty State Ready**: Abhi koi news nahi dali gayi hai. Jab tak aap news add nahi karte, website aik modern empty state display karegi ("No AI News Published Yet - Post Daily News").
3. **Daily Post Modal (UI Se Post Karein)**: Website k top pe aik `+ Post News` button diya gaya hai. Aap direct browser se form fill kar k post kar sakte hain!
4. **Live Date Indicator**: Automatically displays today's live date and active status.
5. **Dark / Light Mode**: Smooth theme switcher with auto-saving in localStorage.
6. **Instant Search & Category Filters**: Users can search by keywords or filter by categories (`Models & LLMs`, `AI Tools`, `Robotics`, `Research`, `Tech & Ethics`).
7. **100% Responsive**: Looks great on Mobile phones, Tablets, Laptops, and Desktops.
8. **Fast & Lightweight**: Pure HTML, CSS, and Vanilla JavaScript with 0 heavy dependencies.

---

## 🚀 How to Add Daily AI News (Aap Daily News Kese Add Kar Sakte Hain)

Aapke pas **2 bohat aasan tareeqay** hain:

### Method 1: Website Ke Button Se (Bohat Aasan)
1. Browser mein `index.html` open karein.
2. Top right par **"+ Post News"** button par click karein.
3. Headline, Category, Summary aur link daal kar **"Publish Now"** par click karein.
4. News card foran website par appear ho jayega!

---

### Method 2: `js/news-data.js` File Mein Add Karna (Permanent Method)
Open karein `js/news-data.js`. Wahan `aiNewsList` array k andar simple object paste kar dein:

```javascript
const aiNewsList = [
  {
    id: 1,
    title: "OpenAI Announces New Reasoning Model",
    category: "models",           // models, tools, robotics, research, ethics
    categoryLabel: "Models & LLMs",
    date: "Nov 16, 2026",
    readTime: "2 min read",
    summary: "Today OpenAI unveiled their latest model focused on scientific reasoning and code generation...",
    source: "OpenAI Blog",
    url: "https://openai.com"     // ya "post-template.html"
  }
];
```

Jaise hi aap object save karenge, website auto-render karegi aur search/filter bhi automatically kaam karega!

---

## 🎨 How to Customize

- **Change Website Name**: Open `index.html` and search for `TAHA.AI`. You can rename it to whatever you like.
- **Change Colors**: Open `css/style.css` and adjust `--accent: #2563eb;` in the `:root` section.
