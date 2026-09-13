/**
 * Bullet News Global - Universal Dynamic News Loader
 * Automatically fetches and renders CMS news bullets on Homepage and Category pages.
 */

const GITHUB_USER = "Abhiram5566";
const GITHUB_REPO = "bullet-news-global";
const GITHUB_BRANCH = "main";
const NEWS_PATH = "content/news";

const NEWS_API_URL = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${NEWS_PATH}?ref=${GITHUB_BRANCH}`;

async function loadBulletNews(targetCategory = "all") {
  const container = document.getElementById("news-feed-container");
  if (!container) return;

  try {
    // 1. Fetch file list from GitHub
    const res = await fetch(NEWS_API_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const files = await res.json();

    const jsonFiles = files.filter(file => file.name.endsWith(".json"));

    if (jsonFiles.length === 0) {
      container.innerHTML = `<div class="info-box"><p>No bullet news posted yet in this section.</p></div>`;
      return;
    }

    // 2. Fetch all news contents in parallel
    const newsItems = await Promise.all(
      jsonFiles.map(async (file) => {
        try {
          const itemRes = await fetch(file.download_url);
          const data = await itemRes.json();
          data._filename = file.name;
          return data;
        } catch (e) {
          return null;
        }
      })
    );

    // Filter valid items and sort newest first
    const validNews = newsItems
      .filter(item => item !== null)
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

    // 3. Filter by category if on a specific category page
    const filteredNews = targetCategory === "all"
      ? validNews
      : validNews.filter(item => item.category && item.category.toLowerCase() === targetCategory.toLowerCase());

    if (filteredNews.length === 0) {
      container.innerHTML = `<div class="info-box"><p>No updates for ${targetCategory} right now. Check back shortly!</p></div>`;
      return;
    }

    // 4. Render News Cards
    container.innerHTML = filteredNews.map(item => {
      const catClass = `badge-${(item.category || 'global').toLowerCase()}`;
      const icon = item.icon || "📌";
      const breakingBadge = item.isBreaking ? `<span class="badge" style="background:#e63946;color:#fff;">🔥 BREAKING</span> ` : "";
      
      const optionalLink = item.link 
        ? `<div style="margin-top:8px;"><a href="${item.link}" target="_blank" style="color:#2a9d8f;font-weight:600;font-size:13px;text-decoration:underline;">Read More →</a></div>` 
        : "";

      return `
        <div class="news-card ${item.isBreaking ? 'breaking-card' : ''}">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
            ${breakingBadge}
            <span class="badge ${catClass}">${(item.category || 'GLOBAL').toUpperCase()}</span>
          </div>
          <h3>${icon} ${item.title}</h3>
          <p>${item.summary || ""}</p>
          ${optionalLink}
        </div>
      `;
    }).join("");

  } catch (err) {
    console.error("News Feed Error:", err);
    // Keep fallback cards if present
  }
}
