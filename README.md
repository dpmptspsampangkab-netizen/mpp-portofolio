# Portofolio Mal Pelayanan Publik (MPP)

Situs statis berbasis [Astro](https://astro.build). Konten dikelola lewat file, tanpa database.

## Menjalankan di komputer
```bash
npm install
npm run dev        # buka http://localhost:4321
npm run build      # hasil di folder dist/
```
Butuh Node.js versi LTS dan Git.

## Mengubah isi situs
| Yang diubah | Lokasi |
|---|---|
| Nama, alamat, jam layanan, kontak, visi, maklumat, angka capaian | `src/data/site.json` |
| Logo | ganti `public/logo-placeholder.svg` (atau ubah `logo` di `site.json`) dan `public/favicon.svg` |
| Warna | variabel di bagian atas `src/styles/global.css` |
| Layanan | satu file per layanan di `src/content/layanan/` |
| Instansi | `src/content/instansi/` |
| Berita | `src/content/berita/` |
| Foto galeri | taruh di `public/galeri/`, daftarkan di `src/data/galeri.json` |

Semua isi saat ini adalah **data contoh**. Ganti dengan data resmi sebelum rilis.
Kompres foto (di bawah ±500 KB) sebelum diunggah.

## Tayang otomatis (GitHub + Cloudflare Pages)
1. Buat repositori GitHub, lalu `git init`, `git add .`, `git commit -m "awal"`, `git remote add origin <url>`, `git push -u origin main`.
2. Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git → pilih repositori.
3. Framework preset: **Astro**. Build command: `npm run build`. Output directory: `dist`.
4. Setelah tayang, ubah `site` di `astro.config.mjs` ke alamat yang sebenarnya.

Setiap `git push` ke cabang `main` memperbarui situs otomatis. Jangan commit file rahasia (`.env` sudah diabaikan lewat `.gitignore`).

## Catatan
- SIPOS/SIPANDAI belum ditampilkan di versi 1 (lihat PRD).
