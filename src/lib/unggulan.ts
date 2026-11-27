// Panel "Layanan unggulan" di beranda: tampilkan nama instansi dulu, klik instansi -> layanan unggulannya.
import { esc } from './data';
import type { Data, Layanan } from './data';

const kunci = (s: string) => s.trim().replace(/\s+/g, ' ').toLowerCase();

type Grup = { k: string; nama: string; daftar: Layanan[] };

// Hanya instansi yang punya layanan unggulan. Bila belum ada satu pun yang ditandai, semua layanan dipakai.
function kelompok(d: Data): Grup[] {
  const unggulan = d.layanan.filter((l) => l.unggulan);
  const peta = new Map<string, Grup>();
  (unggulan.length ? unggulan : d.layanan).forEach((l) => {
    const nama = l.instansi.trim() || 'Lainnya';
    const k = kunci(nama);
    if (!peta.has(k)) peta.set(k, { k, nama, daftar: [] });
    peta.get(k)!.daftar.push(l);
  });
  // Urutan dan penulisan nama mengikuti sheet Instansi; yang tidak terdaftar ditaruh di belakang.
  const hasil: Grup[] = [];
  d.instansi.forEach((i) => {
    const g = peta.get(kunci(i.nama));
    if (g) { hasil.push({ ...g, nama: i.nama }); peta.delete(g.k); }
  });
  return [...hasil, ...peta.values()];
}

let data: Data | null = null;

export function tampilUnggulan(d: Data, ikonGedung: string, ikonDok: string): void {
  data = d;
  const wadah = document.getElementById('layanan')!;
  const sub = document.getElementById('layanan-sub')!;

  // Pilihan disimpan di riwayat browser, jadi tombol "Kembali" dari halaman detail membuka instansi yang sama.
  const gambar = (diklik: boolean) => {
    const grup = kelompok(data!);
    const pilih = grup.find((g) => g.k === history.state?.instansi);
    // Setelah diklik memakai animasi masuk singkat; saat halaman dimuat mengikuti efek gulir.
    const attr = (j: number) => (diklik ? `class="tile masuk" style="--i:${j}"` : `class="tile" data-g data-gr="1,0.7" style="--i:${j % 3}"`);

    if (!grup.length) {
      sub.textContent = '';
      wadah.innerHTML = '<p class="meta">Belum ada layanan.</p>';
    } else if (!pilih) {
      sub.textContent = 'Pilih instansi untuk melihat layanan unggulannya.';
      wadah.innerHTML = grup.map((g, j) =>
        `<button type="button" ${attr(j)} data-instansi="${esc(g.k)}">${ikonGedung}<span><b>${esc(g.nama)}</b><small>${g.daftar.length} layanan</small></span><i class="panah" aria-hidden="true">›</i></button>`,
      ).join('');
    } else {
      sub.textContent = 'Klik layanan untuk melihat syarat dan alurnya.';
      wadah.innerHTML =
        `<div class="pilih-kepala"><button type="button" class="kembali" data-kembali>← Semua instansi</button><strong>${esc(pilih.nama)}</strong></div>` +
        pilih.daftar.map((l, j) =>
          `<a ${attr(j)} href="/layanan/detail?id=${encodeURIComponent(l.id)}">${ikonDok}<span><b>${esc(l.nama)}</b><small>${esc([l.kategori, l.waktu].filter((x) => x && x !== '-').join(' · '))}</small></span></a>`,
        ).join('');
    }
  };

  wadah.onclick = (e) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>('button[data-instansi], button[data-kembali]');
    if (!b) return;
    const sebelum = history.state?.instansi;
    const tujuan = b.dataset.instansi;
    history.replaceState({ ...history.state, instansi: tujuan ?? null }, '');
    gambar(true);
    const fokus = tujuan
      ? wadah.querySelector<HTMLElement>('[data-kembali]')
      : [...wadah.querySelectorAll<HTMLElement>('[data-instansi]')].find((x) => x.dataset.instansi === sebelum);
    fokus?.focus({ preventScroll: true });
  };

  gambar(false);
}
