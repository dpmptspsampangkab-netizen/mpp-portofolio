// Data "Aturan" (dokumen) dari Sheets. Dipakai halaman /aturan dan menu situs.
import * as D from './data';

// Alamat web app Apps Script. Memakai API_URL dari data.ts bila ada; bila tidak, memakai alamat cadangan ini.
const CADANGAN = 'https://script.google.com/macros/s/AKfycbwsZY7uMYOpOt3fTPPNjJhEYNmrCs8D3eFhGzNPS81-8TqAhgyUg6ZP7GsabIAq5ArL/exec';
const API_URL: string = String((D as any).API_URL || CADANGAN);

export type Aturan = {
  id: string; judul: string; kategori: string; nomor: string; tahun: string;
  keterangan: string; berkas: string; urutan: number; tanggal: string; ukuran: number;
};

const KUNCI = 'mpp-aturan';
const s = (v: unknown) => String(v ?? '').trim();
const bersih = (r: any): Aturan => ({
  id: s(r.id), judul: s(r.judul), kategori: s(r.kategori) || 'Umum', nomor: s(r.nomor), tahun: s(r.tahun),
  keterangan: s(r.keterangan), berkas: s(r.berkas), urutan: Number(r.urutan) || 999,
  tanggal: s(r.tanggal), ukuran: Number(r.ukuran) || 0,
});

function baca(): { t: number; d: Aturan[] } | null {
  try {
    const j = JSON.parse(localStorage.getItem(KUNCI) || 'null');
    if (j && Array.isArray(j.d)) return j;
  } catch { /* abaikan */ }
  return null;
}

/** Tampilkan cache dulu, lalu data segar. segar=false: ambil ulang hanya bila cache > 5 menit. */
export function muatAturan(render: (d: Aturan[]) => void, segar = true, gagal?: () => void) {
  const c = baca();
  if (c) render(c.d);
  if (!segar && c && Date.now() - c.t < 300000) return;
  const u = API_URL + (API_URL.includes('?') ? '&' : '?') + 'api=1';
  fetch(u)
    .then((r) => r.json())
    .then((j) => {
      const d = (Array.isArray(j.aturan) ? j.aturan : []).map(bersih).filter((a: Aturan) => a.judul);
      try { localStorage.setItem(KUNCI, JSON.stringify({ t: Date.now(), d })); } catch { /* abaikan */ }
      render(d);
    })
    .catch(() => { if (!c && gagal) gagal(); });
}

/** Kategori (= sub menu) berurutan menurut urutan terkecil lalu nama. */
export function kategoriUrut(d: Aturan[]): string[] {
  const m = new Map<string, number>();
  d.forEach((a) => m.set(a.kategori, Math.min(m.get(a.kategori) ?? 999, a.urutan)));
  return [...m.entries()].sort((a, b) => a[1] - b[1] || a[0].localeCompare(b[0])).map(([k]) => k);
}

/** Hanya tautan https:// atau / yang dipakai. */
export const aman = (u: string) => (/^(https:\/\/|\/)\S+$/.test(u) ? u : '');

/** Tautan unduh langsung untuk berkas Google Drive; selain itu tautan apa adanya. */
export function unduhUrl(u: string): string {
  const m = /drive\.google\.com\/file\/d\/([\w-]+)/.exec(u) || /[?&]id=([\w-]+)/.exec(u);
  return m && /drive\.google\.com/.test(u) ? `https://drive.google.com/uc?export=download&id=${m[1]}` : u;
}

const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

/** "2026-11-26" -> "Kamis, 26 Nov 2026" (kosong bila format tidak dikenal). */
export function tglIndo(v: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(v);
  if (!m) return '';
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], 12));
  return `${HARI[d.getUTCDay()]}, ${+m[3]} ${BULAN[+m[2] - 1]} ${m[1]}`;
}

/** Byte -> "281 KB" atau "1,4 MB" (kosong bila ukuran tidak diketahui). */
export function ukuranTeks(b: number): string {
  if (!b || b <= 0) return '';
  if (b < 1024 * 1024) return `${Math.max(1, Math.round(b / 1024))} KB`;
  return `${(b / 1048576).toFixed(1).replace('.', ',')} MB`;
}
