/* Public, read-only renderer for approved CMS content. Publishing still requires authorised GitHub/CMS access. */
(() => {
 const owner='Abhiram5566', repo='bullet-news-global', branch='main';
 const api=(folder)=>`https://api.github.com/repos/${owner}/${repo}/contents/${folder}?ref=${branch}`;
 const esc=(v='')=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 async function getFolder(folder){try{const r=await fetch(api(folder));if(!r.ok)return[];const files=(await r.json()).filter(x=>x.name.endsWith('.json'));return (await Promise.all(files.map(async f=>{try{const x=await fetch(f.download_url);return x.ok?await x.json():null}catch{return null}}))).filter(Boolean)}catch{return[]}}

 async function team(){const el=document.getElementById('editorial-team');if(!el)return;const data=(await getFolder('content/editorial')).filter(x=>x.published===true).sort((a,b)=>(a.order||99)-(b.order||99));el.innerHTML=data.length?data.map(x=>`<article class="cms-content-card"><h3>${esc(x.name)}</h3><p><strong>${esc(x.role)}</strong></p><p>${esc(x.bio||'')}</p>${x.email?`<p><a href="mailto:${esc(x.email)}">Contact</a></p>`:''}</article>`).join(''):'<p class="form-help">No public team profiles have been approved for display yet.</p>'}
 team();


function formatPlainBody(value) {
  return String(value || "")
    .split(/\n\s*\n/)
    .map(paragraph => paragraph.trim())
    .filter(Boolean)
    .map(paragraph => '<p>' + esc(paragraph.replace(/^#{1,6}\s+/gm, "").replace(/\n/g, " ")) + '</p>')
    .join("");
}

async function mountDramas() {
  const element = document.getElementById("cms-drama-list");
  if (!element) return;

  const data = (await getFolder("content/dramas"))
    .filter(item => item.featured !== false)
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

  if (!data.length) {
    element.innerHTML = '<p class="form-help">No additional dramas are listed yet. Add drama titles from Editorial Login.</p>';
    return;
  }

  element.innerHTML = data.map(item => {
    const title = esc(item.title || "Untitled drama");
    const posterUrl = typeof item.image === "string" && (/^https?:\/\//i.test(item.image) || item.image.startsWith("/")) ? item.image : "";
    const poster = posterUrl
      ? '<img class="drama-poster" loading="lazy" src="' + esc(posterUrl) + '" alt="' + title + '">'
      : '<div class="drama-poster-placeholder" aria-hidden="true">🎬</div>';
    const genre = esc(item.genre || "Drama");
    const hasLocalPage = typeof item.page === "string" && /^[a-z0-9-]+\.html$/i.test(item.page);
    const link = hasLocalPage
      ? '<a class="watch-btn" href="' + esc(item.page) + '">Read More</a>'
      : '<span class="form-help">Detail page coming soon</span>';
    return '<article class="drama-card cms-drama-card">' +
      poster +
      '<h3>' + title + '</h3>' +
      '<p>' + genre + '</p>' +
      link +
      '</article>';
  }).join("");
}

async function mountEsports() {
  const element = document.getElementById("cms-esports-list");
  if (!element) return;

  const data = (await getFolder("content/esports"))
    .filter(item => item.featured !== false)
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

  if (!data.length) {
    element.innerHTML = '<p class="form-help">No esports stories have been published yet. Add a story through Editorial Login.</p>';
    return;
  }

  element.innerHTML = data.map(item => {
    const title = esc(item.title || "Untitled esports story");
    const summary = esc(item.summary || item.excerpt || "");
    const category = esc(item.category || "Esports");
    const game = esc(item.game || "");
    const date = esc(dateLabel(item.date));
    const imageUrl = typeof item.image === "string" && (/^https?:\/\//i.test(item.image) || item.image.startsWith("/")) ? item.image : "";
    const image = imageUrl ? '<img class="cms-esports-image" loading="lazy" src="' + esc(imageUrl) + '" alt="' + title + '">' : "";
    const hasBody = Boolean(item.body && String(item.body).trim());
    const body = hasBody
      ? '<details class="cms-esports-details"><summary>Read full story</summary><div class="cms-esports-full-body">' + formatPlainBody(item.body) + '</div></details>'
      : "";
    const summaryClass = hasBody ? "cms-esports-summary" : "cms-esports-summary no-clamp";
    const sourceOk = typeof item.source === "string" && /^https?:\/\//i.test(item.source);
    const source = sourceOk ? '<p class="cms-esports-source"><a href="' + esc(item.source) + '" target="_blank" rel="noopener noreferrer">Original source ↗</a></p>' : "";
    return '<article class="news-card cms-esports-card">' +
      '<p class="cms-esports-meta"><span class="badge badge-esports">' + category + '</span>' +
      (game ? '<span class="cms-esports-game">' + game + '</span>' : '') +
      (date ? '<span class="cms-esports-date">' + date + '</span>' : '') +
      '</p>' +
      image +
      '<h3>' + title + '</h3>' +
      '<p class="' + summaryClass + '">' + summary + '</p>' +
      body +
      source +
      '</article>';
  }).join("");
}

mountDramas();
mountEsports();

async function mountIndiaSections() {
  const element = document.getElementById("cms-india-sections");
  if (!element) return;

  const data = (await getFolder("content/india-sections"))
    .filter(item => item.published !== false)
    .sort((a, b) => Number(a.order || 99) - Number(b.order || 99));

  if (!data.length) {
    element.innerHTML =
      '<p class="form-help">No India sections published yet.</p>';
    return;
  }

  const escapeHTML = value =>
    String(value || "").replace(/[&<>"']/g, character => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[character]);

  element.innerHTML = data.map(item => `
    <article class="news-card">
      <h3>${escapeHTML(item.icon || "🇮🇳")} ${escapeHTML(item.title)}</h3>
      <p>${escapeHTML(item.summary)}</p>
    </article>
  `).join("");
}


function dateLabel(value) {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

async function mountNewsDesk(id, folder, defaultIcon, deskName) {
  const element = document.getElementById(id);
  if (!element) return;

  const data = (await getFolder(folder))
    .filter(item => item.published !== false)
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

  if (!data.length) {
    element.innerHTML = '<div class="info-box"><p>No published ' + esc(deskName) + ' stories yet. Sign in to Editorial Login to add a story.</p></div>';
    return;
  }

  element.innerHTML = data.map(item => {
    const icon = esc(item.icon || defaultIcon);
    const title = esc(item.title || "Untitled story");
    const summary = esc(item.summary || "");
    const category = esc(item.category || deskName);
    const date = esc(dateLabel(item.date));
    const breaking = item.isBreaking
      ? '<span class="badge" style="background:#b91c1c;color:#fff;margin-right:8px;">BREAKING</span>'
      : "";
    const validLink = typeof item.link === "string" && /^https?:\/\//i.test(item.link);
    const sourceLink = validLink
      ? '<p class="form-help"><a href="' + esc(item.link) + '" target="_blank" rel="noopener noreferrer">Read original report ↗</a></p>'
      : "";
    return '<article class="news-card' + (item.isBreaking ? ' breaking-card' : '') + '">' +
      '<p class="form-help">' + breaking + '<strong>' + category + '</strong>' + (date ? ' · ' + date : '') + '</p>' +
      '<h3>' + icon + ' ' + title + '</h3>' +
      '<p>' + summary + '</p>' +
      sourceLink +
      '</article>';
  }).join("");
}

mountNewsDesk("news-feed-container", "content/world-news", "🌍", "World");
mountNewsDesk("cms-china-news", "content/china-news", "🇨🇳", "China");
mountNewsDesk("cms-korea-news", "content/korea-news", "🇰🇷", "Korea");
mountIndiaSections();
})();
