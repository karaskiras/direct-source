import { readFile, mkdir, writeFile, copyFile } from 'node:fs/promises';
const root = new URL('../', import.meta.url);
const data = JSON.parse(await readFile(new URL('catalog.json', root), 'utf8'));
const escape = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const categories = [...new Set(data.map(p => p.category))];
const ids = new Set();
for (const p of data) {
  for (const key of ['id','name','monogram','category','description','note','url','linkLabel','evidence','sourceNote','checked','color']) {
    if (typeof p[key] !== 'string' || !p[key].trim()) throw Error(`Missing ${key}: ${p.id}`);
  }
  if (!/^[a-z0-9-]+$/.test(p.id) || ids.has(p.id)) throw Error(`Invalid/duplicate ID: ${p.id}`);
  ids.add(p.id);
  if (!Array.isArray(p.platforms) || !p.platforms.length || p.platforms.some(v => !['Windows','macOS','Linux','Android','iOS'].includes(v))) throw Error(`Invalid platforms: ${p.id}`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(p.checked) || Number.isNaN(Date.parse(p.checked))) throw Error(`Invalid date: ${p.id}`);
  for (const value of [p.url, p.evidence, p.relatedUrl].filter(Boolean)) {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password) throw Error(`Invalid URL: ${value}`);
  }
}
const cards = data.map(p => `<article class="program" id="${p.id}" data-category="${escape(p.category)}" data-platforms="${escape(p.platforms.join(' '))}" data-search="${escape([p.name,p.description,p.category,p.note].join(' ').toLocaleLowerCase('ru'))}">
  <div class="card-top"><span class="app-icon ${escape(p.color)}" aria-hidden="true">${escape(p.monogram)}</span><span class="category">${escape(p.category)}</span></div>
  <h3>${escape(p.name)}</h3><p class="description">${escape(p.description)}</p>
  <ul class="platforms" aria-label="Платформы">${p.platforms.map(s => `<li>${escape(s)}</li>`).join('')}</ul>
  <p class="note">${escape(p.note)}</p>
  <div class="card-bottom"><span class="domain">${escape(new URL(p.url).hostname.replace(/^www\./,''))}${p.id === 'zapret' ? '/Flowseal' : ''}</span><a class="source-link" href="${escape(p.url)}" target="_blank" rel="noopener noreferrer">${escape(p.linkLabel)}<span class="sr-only">: ${escape(p.name)} (новая вкладка)</span></a></div>
  <details class="source-details"><summary>Об источнике · ${p.checked.split('-').reverse().join('.')}</summary><p>${escape(p.sourceNote)} <a href="${escape(p.evidence)}" target="_blank" rel="noopener noreferrer">Страница-основание<span class="sr-only"> (новая вкладка)</span></a>${p.relatedUrl ? ` · <a href="${escape(p.relatedUrl)}" target="_blank" rel="noopener noreferrer">${escape(p.relatedLabel)}<span class="sr-only"> (новая вкладка)</span></a>` : ''}</p></details>
</article>`).join('\n');
const template = await readFile(new URL('src/index.html', root), 'utf8');
const html = template.replaceAll('{{COUNT}}', data.length).replace('{{CATEGORIES}}', categories.map(c => `<a href="#catalog" data-category-filter="${escape(c)}">${escape(c)} <span>${data.filter(p => p.category === c).length}</span></a>`).join('')).replace('{{CARDS}}', cards);
await mkdir(new URL('docs/', root), { recursive: true });
await writeFile(new URL('docs/index.html', root), html);
for (const file of ['styles.css','app.js','favicon.svg']) await copyFile(new URL(`src/${file}`, root), new URL(`docs/${file}`, root));
await writeFile(new URL('docs/.nojekyll', root), '');
await writeFile(new URL('CATALOG.md', root), `# Каталог программ\n\nПроверка источников: 4 октября 2026 года. Проверяется принадлежность ссылки проекту, а не безопасность конкретного установщика или доступность у всех провайдеров.\n\n| Программа | Назначение | Официальный источник | Платформы |\n|---|---|---|---|\n${data.map(p => `| ${p.name} | ${p.description} | [${new URL(p.url).hostname}](${p.url}) | ${p.platforms.join(', ')} |`).join('\n')}\n\n[Сведения об источниках и оговорки](catalog.json).\n`);
console.log(`Built ${data.length} programs in ${categories.length} categories → docs/`);
