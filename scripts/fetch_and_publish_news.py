#!/usr/bin/env python3
"""
TAHA AI NEWS - Automated Daily AI Research, Fact-Checking & Publishing Pipeline
Fetches top AI news from verified feeds, uses Gemini AI to research, verify,
and summarize the most important stories, and updates js/news-data.js.
"""

import os
import sys
import json
import re
import urllib.request
import urllib.error
import xml.etree.ElementTree as ET
from datetime import datetime

# Feeds for real-time AI news research
FEEDS = [
    {
        "name": "Google News AI",
        "url": "https://news.google.com/rss/search?q=Artificial+Intelligence+OR+LLM+OR+OpenAI+OR+Anthropic+OR+Google+DeepMind+when:2d&hl=en-US&gl=US&ceid=US:en"
    },
    {
        "name": "TechCrunch AI",
        "url": "https://techcrunch.com/category/artificial-intelligence/feed/"
    },
    {
        "name": "The Verge AI",
        "url": "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml"
    }
]

# Models with fallback
MODELS = ["gemini-flash-lite-latest", "gemini-3.5-flash", "gemini-3.5-flash-lite"]

def clean_html(raw_html):
    """Remove HTML tags and entities from string."""
    if not raw_html:
        return ""
    clean_text = re.sub(r'<[^>]+>', ' ', raw_html)
    clean_text = clean_text.replace('&amp;', '&').replace('&quot;', '"').replace('&apos;', "'")
    clean_text = clean_text.replace('&#8217;', "'").replace('&#8220;', '"').replace('&#8221;', '"')
    clean_text = re.sub(r'\s+', ' ', clean_text)
    return clean_text.strip()

def fetch_rss_candidates():
    """Fetch raw candidates from RSS feeds."""
    candidates = []
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)"}

    for feed in FEEDS:
        try:
            print(f"[+] Fetching from {feed['name']}...")
            req = urllib.request.Request(feed["url"], headers=headers)
            with urllib.request.urlopen(req, timeout=15) as resp:
                xml_data = resp.read()
                root = ET.fromstring(xml_data)

                # Channel items (RSS 2.0)
                channel = root.find("channel")
                items = channel.findall("item") if channel is not None else root.findall(".//item")
                if not items:
                    items = root.findall(".//{http://www.w3.org/2005/Atom}entry")

                for it in items[:8]:
                    title_elem = it.find("title") if it.find("title") is not None else it.find("{http://www.w3.org/2005/Atom}title")
                    link_elem = it.find("link") if it.find("link") is not None else it.find("{http://www.w3.org/2005/Atom}link")
                    desc_elem = it.find("description") if it.find("description") is not None else it.find("summary")
                    if desc_elem is None:
                        desc_elem = it.find("{http://www.w3.org/2005/Atom}summary")

                    title = title_elem.text.strip() if title_elem is not None and title_elem.text else ""
                    if link_elem is not None:
                        link = link_elem.text.strip() if link_elem.text else link_elem.get("href", "")
                    else:
                        link = ""
                    desc = clean_html(desc_elem.text if desc_elem is not None and desc_elem.text else "")

                    if title and len(title) > 10:
                        candidates.append({
                            "feed": feed["name"],
                            "title": title,
                            "link": link,
                            "snippet": desc[:250]
                        })
        except Exception as e:
            print(f"[-] Warning: Failed to fetch feed {feed['name']}: {e}")

    print(f"[i] Collected {len(candidates)} raw news candidates.")
    return candidates

def verify_and_curate_with_gemini(candidates, api_key):
    """Use Gemini to filter, fact-check, select, and structure top AI news."""
    if not candidates:
        print("[-] No candidates to process.")
        return []

    current_date = datetime.now().strftime("%b %d, %Y")
    
    system_prompt = f"""
You are the Chief AI News Editor for 'TAHA AI NEWS'.
Current Date: {current_date}

Your mission:
1. Examine the provided raw AI news candidates.
2. Fact-check & verify: Only choose REAL, significant, high-value AI developments (e.g. LLM releases, major benchmarks, open-source models, AI tooling, robotics, or major enterprise AI shifts).
3. Filter out: Low-effort clickbait, non-AI general tech news, repeats/duplicates, or unverified rumors.
4. Pick the top 4 to 6 best and most relevant stories.
5. For each chosen story, output a JSON object with:
   - "title": Clean, punchy, engaging headline.
   - "category": Must be exactly one of: "models", "tools", "robotics", "research", "ethics"
   - "categoryLabel": Matching display label: "Models & LLMs", "AI Tools", "Robotics", "Research", or "Tech & Ethics"
   - "summary": 2-3 sentence accurate, engaging summary explaining what happened and why it matters.
   - "readTime": estimated read time like "2 min read" or "3 min read"
   - "source": reputable source name (e.g. OpenAI, Google, Anthropic, TechCrunch, The Verge, etc.)
   - "url": link to the source (use candidate's link or clean URL)
   - "date": "{current_date}"

OUTPUT REQUIREMENTS:
Respond ONLY with a valid JSON array of objects. Do not add markdown backticks (no ```json ... ```).
"""

    payload = {
        "contents": [
            {
                "parts": [
                    {"text": system_prompt},
                    {"text": f"Raw News Candidates:\n{json.dumps(candidates, indent=2)}"}
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.2,
            "responseMimeType": "application/json"
        }
    }

    last_error = None
    for model in MODELS:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
        print(f"[+] Trying Gemini model: {model}...")
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"}
        )

        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                content = data["candidates"][0]["content"]["parts"][0]["text"].strip()
                
                # Clean possible markdown block if any
                if content.startswith("```"):
                    content = re.sub(r"^```(?:json)?", "", content)
                    content = re.sub(r"```$", "", content)
                
                stories = json.loads(content)
                print(f"[+] Model {model} successfully verified and generated {len(stories)} curated news stories.")
                return stories
        except Exception as e:
            print(f"[-] Model {model} failed: {e}")
            last_error = e

    print(f"[-] All Gemini models failed. Last error: {last_error}")
    return []

def load_existing_news(file_path):
    """Load existing news items from js/news-data.js."""
    if not os.path.exists(file_path):
        return []

    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()

        match = re.search(r'const\s+aiNewsList\s*=\s*(\[[\s\S]*?\]);', content)
        if match:
            json_str = match.group(1)
            clean_json = re.sub(r'//.*', '', json_str)
            clean_json = re.sub(r',\s*([\]}])', r'\1', clean_json)
            return json.loads(clean_json)
    except Exception as e:
        print(f"[i] Could not parse existing news array: {e}. Starting fresh.")
    
    return []

def save_news_data(file_path, all_news):
    """Write updated news items back to js/news-data.js."""
    json_formatted = json.dumps(all_news, indent=2, ensure_ascii=False)
    
    file_content = f"""/**
 * =========================================================================
 * TAHA AI NEWS - AUTOMATED DAILY AI NEWS STORE
 * =========================================================================
 * Updated automatically via GitHub Actions & Gemini AI Research Pipeline.
 * Timings: 8:00 AM & 6:00 PM PKT
 */

const aiNewsList = {json_formatted};
"""
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(file_content)
    print(f"[+] Successfully wrote {len(all_news)} stories to {file_path}")

def main():
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("[-] Error: GEMINI_API_KEY environment variable is not set.")
        sys.exit(1)

    news_data_path = os.path.join(os.path.dirname(__file__), "..", "js", "news-data.js")
    news_data_path = os.path.normpath(news_data_path)

    print(f"[1] Researching AI news across feeds...")
    candidates = fetch_rss_candidates()
    if not candidates:
        print("[-] No candidates fetched. Exiting.")
        return

    print(f"[2] Fact-checking and curating news with Gemini AI...")
    new_stories = verify_and_curate_with_gemini(candidates, api_key)
    if not new_stories:
        print("[-] No verified stories generated. Exiting.")
        return

    print(f"[3] Updating news database...")
    existing_news = load_existing_news(news_data_path)
    
    existing_titles = {re.sub(r'[^a-zA-Z0-9]', '', item.get("title", "").lower()) for item in existing_news}
    
    unique_new = []
    base_id = int(datetime.now().timestamp())
    for idx, story in enumerate(new_stories):
        norm_title = re.sub(r'[^a-zA-Z0-9]', '', story.get("title", "").lower())
        if norm_title not in existing_titles and len(norm_title) > 5:
            story["id"] = base_id + idx
            unique_new.append(story)
            existing_titles.add(norm_title)

    if not unique_new:
        print("[i] All verified stories already exist in database. No new items to add.")
        return

    print(f"[+] Adding {len(unique_new)} new verified AI stories.")
    combined_news = unique_new + existing_news
    combined_news = combined_news[:40]

    save_news_data(news_data_path, combined_news)
    print("[✓] Pipeline execution finished successfully.")

if __name__ == "__main__":
    main()
