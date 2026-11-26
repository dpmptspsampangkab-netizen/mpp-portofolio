// Menambahkan menu "Aturan" (dengan sub menu dari kategori) ke navigasi situs.
// Dipanggil dari Base.astro: <script>import '../lib/menuAturan';</script>
import { muatAturan, kategoriUrut } from './aturan';
import { esc } from './data';

const PANAH = '<svg class="chev" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';

function pasang(): HTMLLIElement | null {
  const ul = document.querySelector('nav#nv ul');
  if (!ul) return null;
  const ada = ul.querySelector('li.has-sub') as HTMLLIElement | null;
  if (ada) return ada;
  const li = document.createElement('li');
  li.className = 'has-sub';
  const aktif = location.pathname.replace(/\/+$/, '') === '/aturan';
  li.innerHTML = `<a href="/aturan/" class="sub-toggle"${aktif ? ' aria-current="page"' : ''}>Aturan${PANAH}</a><ul class="sub-menu" aria-label="Sub menu Aturan"></ul>`;
  const acuan = [...ul.children].find((x) => /^instansi$/i.test((x.textContent || '').trim()));
  if (acuan) acuan.after(li); else ul.appendChild(li);
  return li;
}

function isi(li: HTMLLIElement, kats: string[]) {
  li.classList.toggle('ada-sub', kats.length > 0);
  (li.querySelector('.sub-menu') as HTMLElement).innerHTML = kats.length
    ? `<li><a href="/aturan/">Semua aturan</a></li>` +
      kats.map((k) => `<li><a href="/aturan/?k=${encodeURIComponent(k)}">${esc(k)}</a></li>`).join('')
    : '';
}

const li = pasang();
if (li) muatAturan((d) => isi(li, kategoriUrut(d)), false);
