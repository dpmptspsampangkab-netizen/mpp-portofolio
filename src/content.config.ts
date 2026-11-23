import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const layanan = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/layanan' }),
  schema: z.object({
    nama: z.string(),
    instansi: z.string(),
    kategori: z.string(),
    ringkas: z.string(),
    syarat: z.array(z.string()),
    alur: z.array(z.string()),
    biaya: z.string().default('Gratis'),
    waktu: z.string(),
    diperbarui: z.coerce.date(),
  }),
});

const instansi = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/instansi' }),
  schema: z.object({
    nama: z.string(),
    loket: z.string(),
    telepon: z.string().optional(),
    urutan: z.number().default(99),
  }),
});

const berita = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/berita' }),
  schema: z.object({
    judul: z.string(),
    tanggal: z.coerce.date(),
    ringkas: z.string(),
  }),
});

export const collections = { layanan, instansi, berita };
