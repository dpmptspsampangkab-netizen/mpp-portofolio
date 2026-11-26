// Efek gulir kontinu: posisi gulir diterjemahkan menjadi variabel CSS (--p, --sp), tampilannya diatur di global.css.
// Tanpa pustaka. Tidak aktif bila pengunjung memilih gerak dikurangi; tanpa JS semua elemen tetap tampil penuh.

const klem = (n: number, a = 0, b = 1) => Math.min(b, Math.max(a, n));

// Angka pada kartu capaian dihitung naik mengikuti progres gulir.
const siapkanAngka = (k: HTMLElement) => {
  const b = k.querySelector('b');
  const node = b?.firstChild;
  if (!b || !node || node.nodeType !== 3 || b.dataset.v) return;
  const teks = (node.nodeValue || '').trim();
  const v = parseFloat(teks.replace(/\./g, '').replace(',', '.'));
  if (!isFinite(v)) return;
  b.dataset.v = String(v);
  b.dataset.dec = String((teks.split(',')[1] || '').length);
  b.dataset.last = '';
};

const tulisAngka = (k: HTMLElement, p: number) => {
  const b = k.querySelector('b');
  const node = b?.firstChild;
  if (!b || !node || !b.dataset.v) return;
  const dec = Number(b.dataset.dec || 0);
  const nilai = Number(b.dataset.v) * p;
  const t = nilai.toLocaleString('id-ID', { minimumFractionDigits: dec, maximumFractionDigits: dec });
  if (b.dataset.last !== t) { node.nodeValue = t + ' '; b.dataset.last = t; }
};

export function mulaiGulir(): void {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const root = document.documentElement;
  root.classList.add('gulir');

  let target: HTMLElement[] = [];
  const terakhir = new WeakMap<HTMLElement, string>();
  let menunggu = false;

  const kumpul = () => {
    document.querySelector('footer.site')?.setAttribute('data-g', '');
    target = Array.from(document.querySelectorAll<HTMLElement>('[data-g]'));
    target.forEach((e) => { if (e.classList.contains('kpi')) siapkanAngka(e); });
  };

  const perbarui = () => {
    menunggu = false;
    const vh = innerHeight;
    const y = scrollY;
    const maks = Math.max(1, root.scrollHeight - vh);
    root.style.setProperty('--sp', klem(y / maks).toFixed(4));

    for (const e of target) {
      const r = e.getBoundingClientRect();
      let p: number;
      if (e.dataset.g === 'hero') {
        p = klem(-r.top / Math.max(1, r.height));
      } else {
        const [a, b] = (e.dataset.gr || (e.dataset.g === 'kpi' ? '0.92,0.3' : '0.98,0.6')).split(',').map(Number);
        const topMaks = r.top - (maks - y); // posisi atas elemen saat halaman digulir mentok
        const awal = vh * a;
        const akhir = Math.max(vh * b, topMaks); // elemen di dasar halaman tetap bisa mencapai 100%
        p = klem((awal - r.top) / Math.max(40, awal - akhir));
      }
      const t = p.toFixed(3);
      if (terakhir.get(e) !== t) {
        terakhir.set(e, t);
        e.style.setProperty('--p', t);
        if (e.dataset.g === 'kpi') tulisAngka(e, p);
      }
    }
  };

  const jadwal = () => { if (!menunggu) { menunggu = true; requestAnimationFrame(perbarui); } };

  kumpul();
  perbarui();
  addEventListener('scroll', jadwal, { passive: true });
  addEventListener('resize', jadwal);
  // Konten dari Google Sheets dirender setelah halaman dimuat: kumpulkan ulang dan terapkan sebelum dicat.
  new MutationObserver(() => { kumpul(); perbarui(); }).observe(document.body, { childList: true, subtree: true });
}
