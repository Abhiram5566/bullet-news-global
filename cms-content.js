/* Public, read-only renderer for approved CMS content. Publishing still requires authorised GitHub/CMS access. */
(() => {
 const owner='Abhiram5566', repo='bullet-news-global', branch='main';
 const api=(folder)=>`https://api.github.com/repos/${owner}/${repo}/contents/${folder}?ref=${branch}`;
 const esc=(v='')=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 async function getFolder(folder){try{const r=await fetch(api(folder));if(!r.ok)return[];const files=(await r.json()).filter(x=>x.name.endsWith('.json'));return (await Promise.all(files.map(async f=>{try{const x=await fetch(f.download_url);return x.ok?await x.json():null}catch{return null}}))).filter(Boolean)}catch{return[]}}
 function card(item, kind){const title=esc(item.title||item.name||'Untitled');const summary=esc(item.summary||item.bio||item.excerpt||'');const image=item.image?`<img loading="lazy" src="${esc(item.image)}" alt="${title}">`:'';const meta=esc([item.country,item.status,item.game,item.category,item.role].filter(Boolean).join(' · '));const link=item.link||item.source;return `<article class="cms-content-card">${image}<p class="form-help">${meta}</p><h3>${title}</h3><p>${summary}</p>${link?`<p><a href="${esc(link)}" target="_blank" rel="noopener noreferrer">Reference / Read more ↗</a></p>`:''}</article>`}
 async function mount(id,folder,kind){const el=document.getElementById(id);if(!el)return;const data=await getFolder(folder);const sorted=data.sort((a,b)=>new Date(b.date||0)-new Date(a.date||0));if(!sorted.length){el.innerHTML='<p class="form-help">No CMS entries have been published in this section yet.</p>';return}el.innerHTML=sorted.map(x=>card(x,kind)).join('')}
 async function team(){const el=document.getElementById('editorial-team');if(!el)return;const data=(await getFolder('content/editorial')).filter(x=>x.published===true).sort((a,b)=>(a.order||99)-(b.order||99));el.innerHTML=data.length?data.map(x=>`<article class="cms-content-card"><h3>${esc(x.name)}</h3><p><strong>${esc(x.role)}</strong></p><p>${esc(x.bio||'')}</p>${x.email?`<p><a href="mailto:${esc(x.email)}">Contact</a></p>`:''}</article>`).join(''):'<p class="form-help">No public team profiles have been approved for display yet.</p>'}
 mount('cms-drama-list','content/dramas','drama');mount('cms-esports-list','content/esports','esports');team();

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

mountIndiaSections();
})();
