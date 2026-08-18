# 🌿 Bitki Bakım Takipçisi

Sahip olduğun bitkileri ekleyip sulama takvimini takip etmeni sağlayan bir Next.js uygulaması. Her bitki kartı, son sulama tarihine ve sulama aralığına göre otomatik olarak **"Bugün sula"**, **"Yakında"** veya **"İyi durumda"** durumunu gösterir. Veriler tarayıcının `localStorage`'ında saklanır.

![Bitki Bakım Takipçisi ekran görüntüsü](public/screenshot.png)

## Özellikler

- **Ekle** — Yeni bitki ekleme formu (`/plants/new`)
- **Listele** — Ana sayfada kart grid, sulama durumuna göre renkli rozetler
- **Güncelle** — Bitki bilgilerini düzenleme (`/plants/[id]/edit`) veya tek tıkla "Sulandı" ile hızlı güncelleme
- **Sil** — Onay ile bitki silme

## Kullanılan Teknolojiler

- [Next.js](https://nextjs.org) (App Router, TypeScript)
- [Tailwind CSS](https://tailwindcss.com)
- [lucide-react](https://lucide.dev) — ikonlar
- `localStorage` — veri kalıcılığı (backend yok)

## Proje Yapısı

```
src/
  app/            # Sayfalar (ana liste, ekle, düzenle)
  components/     # PlantCard, PlantForm, PlantList, Header
  interfaces/     # Plant tipi (TypeScript)
  lib/            # localStorage tabanlı usePlants hook'u ve durum hesaplama
```

## Kurulum

```bash
npm install
npm run dev
```

Ardından [http://localhost:3000](http://localhost:3000) adresini aç.

## Yayınlama

- **GitHub:** <REPO_URL>
- **Canlı demo (Vercel):** <VERCEL_URL>

Vercel'e almak için: [vercel.com/new](https://vercel.com/new) üzerinden bu GitHub reposunu import et — `next build` ayarları otomatik algılanır, ekstra yapılandırma gerekmez.
