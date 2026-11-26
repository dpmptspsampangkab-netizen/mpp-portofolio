import site from '../data/site.json';

// Alamat endpoint data dari Google Apps Script (Sheets)
export const API_URL =
  'https://script.google.com/macros/s/AKfycbwsZY7uMYOpOt3fTPPNjJhEYNmrCs8D3eFhGzNPS81-8TqAhgyUg6ZP7GsabIAq5ArL/exec?api=1';
const KEY = 'mpp-data-v1';
// Tautan bawaan formulir pengaduan; admin bisa menggantinya lewat Pengaturan (kunci pengaduanLink).
const PENGADUAN_BAWAAN =
  'https://script.google.com/macros/s/AKfycbzjx4KxqYw0IEPbaMUqtIbB8HU49ntjx8xi40tVdp4E6p7FHtPStpAs7Ar3iWLckDYo/exec';

export interface Layanan {
  id: string; nama: string; kategori: string; instansi: string; ringkas: string;
  syarat: string[]; alur: string[]; biaya: string; waktu: string; catatan: string;
  diperbarui: string; unggulan: boolean; urutan: number;
}
export interface Instansi { id: string; nama: string; loket: string; telepon: string; deskripsi: string; urutan: number }
export interface Berita { id: string; judul: string; tanggal: string; ringkas: string; isi: string; gambar: string }
export interface Galeri { id: string; judul: string; url: string; keterangan: string }

const teks = (v: unknown): string => (v === undefined || v === null ? '' : String(v));
const baris = (v: unknown): string[] => teks(v).split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
// Hapus penomoran/butir yang diketik admin ("1. ", "2) ", "- ", "• ") agar tidak dobel dengan daftar situs.
const poin = (v: unknown): string[] => baris(v).map((x) => x.replace(/^(?:\d{1,2}\s*[.)]|[-•*])\s+/, '')).filter(Boolean);
const angka = (v: unknown, def = 0): number => {
  const s = teks(v).trim().replace(',', '.');
  if (!s) return def;
  const n = Number(s);
  return Number.isFinite(n) ? n : def;
};

// Jumlah titik terisi pada kartu capaian (maks. 50 titik = 10 x 5).
const titik = (n: number): number => Math.max(0, Math.min(50, Math.round(n)));

// Hanya alamat https yang aman dipakai sebagai latar (tanpa tanda kutip/kurung/spasi).
export const ambilWallpaper = (v: unknown): string => {
  const u = teks(v).trim();
  return /^https:\/\/[^\s"'()<>\\]+$/.test(u) ? u : '';
};

export function normalisasi(raw: any) {
  const p = raw?.pengaturan ?? {};
  const ambil = (k: string, def: string) => teks(p[k]).trim() || def;

  const layanan: Layanan[] = (raw?.layanan ?? []).map((r: any) => ({
    id: teks(r.id),
    nama: teks(r.nama),
    kategori: teks(r.kategori) || 'Lainnya',
    instansi: teks(r.instansi),
    ringkas: teks(r.ringkas),
    syarat: poin(r.syarat),
    alur: poin(r.alur),
    biaya: teks(r.biaya) || '-',
    waktu: teks(r.waktu) || '-',
    catatan: teks(r.catatan),
    diperbarui: teks(r.diperbarui),
    unggulan: teks(r.unggulan).trim().toLowerCase() === 'ya',
    urutan: angka(r.urutan, 999),
  })).filter((l: Layanan) => l.id && l.nama)
    .sort((a: Layanan, b: Layanan) => a.urutan - b.urutan || a.nama.localeCompare(b.nama, 'id'));

  const instansi: Instansi[] = (raw?.instansi ?? []).map((r: any) => ({
    id: teks(r.id), nama: teks(r.nama), loket: teks(r.loket), telepon: teks(r.telepon),
    deskripsi: teks(r.deskripsi), urutan: angka(r.urutan, 999),
  })).filter((i: Instansi) => i.id && i.nama)
    .sort((a: Instansi, b: Instansi) => a.urutan - b.urutan || a.nama.localeCompare(b.nama, 'id'));

  const berita: Berita[] = (raw?.berita ?? []).map((r: any) => ({
    id: teks(r.id), judul: teks(r.judul), tanggal: teks(r.tanggal), ringkas: teks(r.ringkas),
    isi: teks(r.isi), gambar: teks(r.gambar),
  })).filter((b: Berita) => b.id && b.judul)
    .sort((a: Berita, b: Berita) => b.tanggal.localeCompare(a.tanggal));

  const galeri: Galeri[] = (raw?.galeri ?? []).map((r: any) => ({
    id: teks(r.id), judul: teks(r.judul), url: teks(r.url), keterangan: teks(r.keterangan),
  })).filter((g: Galeri) => g.id && g.url);

  // Pengunjung = hitungan otomatis tahun berjalan + angka awal (opsional) dari Pengaturan.
  const pengunjung = angka(raw?.kunjungan) + angka(p.pengunjung);

  // Indeks kepuasan: otomatis dari penilaian pengunjung bila sudah ada; jika belum, memakai angka manual di Pengaturan.
  const kp = raw?.kepuasan ?? {};
  const jumlahNilai = angka(kp.jumlah);
  const kepuasan = jumlahNilai > 0 ? angka(kp.indeks) : angka(p.kepuasan);

  const jam = baris(p.jam).map((l) => {
    const [hari, ...sisa] = l.split('|');
    return { hari: hari.trim(), jam: sisa.join('|').trim() };
  });

  const situs = {
    nama: ambil('nama', site.nama),
    singkat: ambil('singkat', site.singkat),
    daerah: ambil('daerah', site.daerah),
    tagline: ambil('tagline', site.tagline),
    logo: site.logo,
    wallpaper: ambilWallpaper(p.wallpaper),
    pengaduanLink: ambilWallpaper(p.pengaduanLink) || PENGADUAN_BAWAAN,
    pengaduanTeks: ambil('pengaduanTeks', 'Buat pengaduan'),
    barcode: ambilWallpaper(p.barcode),
    alamat: ambil('alamat', site.alamat),
    telepon: ambil('telepon', site.telepon),
    whatsapp: ambil('whatsapp', site.whatsapp),
    email: ambil('email', site.email),
    petaLink: ambil('petaLink', site.petaLink),
    jam: jam.length ? jam : site.jam,
    tentang: {
      visi: ambil('visi', site.tentang.visi),
      maklumat: ambil('maklumat', site.tentang.maklumat),
    },
    capaian: [
      { label: 'Instansi di MPP', nilai: instansi.length, satuan: '', titik: titik(instansi.length), skala: '1 titik = 1 instansi', tautan: '' },
      { label: 'Jenis layanan', nilai: layanan.length, satuan: '', titik: titik(layanan.length), skala: '1 titik = 1 layanan', tautan: '' },
      { label: 'Pengunjung per tahun', nilai: pengunjung, satuan: '', titik: titik(Math.ceil(pengunjung / 1000)), skala: '1 titik = 1.000 pengunjung', tautan: '' },
      {
        label: 'Indeks kepuasan', nilai: kepuasan, satuan: '/ 100', titik: titik(Math.round(kepuasan / 2)),
        skala: '1 titik = 2 poin' + (jumlahNilai > 0 ? ` · dari ${jumlahNilai.toLocaleString('id-ID')} penilaian` : ''),
        tautan: '/kontak#nilai',
      },
    ],
  };

  return { situs, layanan, instansi, berita, galeri };
}

export type Data = ReturnType<typeof normalisasi>;

/**
 * Menampilkan data cadangan (cache) lebih dulu bila ada, lalu mengambil data terbaru
 * dari Google Sheets dan menampilkannya lagi. `segar` = true bila data baru dari server.
 */
// Satu permintaan jaringan dipakai bersama oleh semua skrip di halaman yang sama.
let permintaan: Promise<string> | null = null;
function ambilTeks(): Promise<string> {
  if (!permintaan) {
    permintaan = fetch(API_URL)
      .then((res) => {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.text();
      })
      .catch((e) => { permintaan = null; throw e; });
  }
  return permintaan;
}

export async function muatData(
  render: (d: Data, segar: boolean) => void,
  gagal?: () => void,
): Promise<void> {
  let lama: string | null = null;
  try { lama = localStorage.getItem(KEY); } catch { /* abaikan */ }
  if (lama) {
    try { render(normalisasi(JSON.parse(lama)), false); } catch { lama = null; }
  }
  try {
    const baru = await ambilTeks();
    const json = JSON.parse(baru);
    try { localStorage.setItem(KEY, baru); } catch { /* abaikan */ }
    render(normalisasi(json), true);
  } catch {
    if (!lama && gagal) gagal();
  }
}

export const esc = (s: unknown): string =>
  teks(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));

export function tanggalIndo(s: string): string {
  if (!s) return '';
  const d = new Date(s + 'T00:00:00');
  return isNaN(d.getTime()) ? s : d.toLocaleDateString('id-ID', { dateStyle: 'long' });
}

/** Teks bebas -> paragraf HTML aman (baris kosong = paragraf baru). */
export function paragraf(s: string): string {
  return teks(s).split(/\n{2,}/).map((x) => x.trim()).filter(Boolean)
    .map((x) => `<p>${esc(x).replace(/\n/g, '<br />')}</p>`).join('');
}

export function kartuLayanan(l: Layanan): string {
  const q = `${l.nama} ${l.instansi} ${l.kategori} ${l.ringkas}`.toLowerCase();
  return `<a class="card svc" href="/layanan/detail?id=${encodeURIComponent(l.id)}" data-q="${esc(q)}" data-k="${esc(l.kategori)}">` +
    `<span class="tag">${esc(l.kategori)}</span><h3>${esc(l.nama)}</h3>` +
    `<p>${esc(l.instansi)} · ${esc(l.waktu)}</p></a>`;
}

export const pesanGagal = '<p class="meta">Data belum bisa dimuat. Coba muat ulang halaman.</p>';
