const cards = [...document.querySelectorAll('.program')];
const search = document.querySelector('#search');
const platform = document.querySelector('#platform');
const categoryLinks = [...document.querySelectorAll('[data-category-filter]')];
let category = 'all';
const normalize = value => value.toLocaleLowerCase('ru').replaceAll('ё', 'е').trim();
const noun = n => n % 10 === 1 && n % 100 !== 11 ? 'программа' : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? 'программы' : 'программ';
function filter() {
  const terms = normalize(search.value).split(/\s+/).filter(Boolean);
  let count = 0;
  for (const card of cards) {
    const visible = (category === 'all' || category === card.dataset.category)
      && (platform.value === 'all' || card.dataset.platforms.split(' ').includes(platform.value))
      && terms.every(term => normalize(card.dataset.search).includes(term));
    card.hidden = !visible;
    if (visible) count++;
  }
  document.querySelector('#result-count').textContent = `${count} ${noun(count)}`;
  document.querySelector('#empty').hidden = count !== 0;
  for (const link of categoryLinks) {
    if (link.dataset.categoryFilter === category) link.setAttribute('aria-current', 'true');
    else link.removeAttribute('aria-current');
  }
}
document.querySelector('.filters').hidden = false;
search.addEventListener('input', filter);
platform.addEventListener('change', filter);
for (const link of categoryLinks) link.addEventListener('click', () => { category = link.dataset.categoryFilter; filter(); });
document.querySelector('#reset').addEventListener('click', () => { search.value = ''; platform.value = 'all'; category = 'all'; filter(); search.focus(); });
filter();
