# AromaSys — Design System & UI Specification

**Project:** AromaSys — Warehouse Management & Intelligence Platform
**Version:** 1.0
**Status:** Design Approved
**Last Updated:** 28 Mei 2025

---

## 1. Design Philosophy

AromaSys menggunakan pendekatan **Industrial Clarity** — antarmuka yang tegas, fungsional, dan tanpa ornamen berlebihan. Semua elemen visual melayani fungsi operasional gudang: informasi harus terbaca dalam satu detik, status harus terlihat tanpa interpretasi, dan aksi harus jelas tanpa ambiguitas.

Desain menghindari siluet ikon generik. Seluruh ikon dan elemen grafis menggunakan bentuk geometris tegas dalam gaya **outline monochrome** atau **filled minimal** tanpa gradien dekoratif.

---

## 2. Color System

### 2.1 Primary Palette

| Token | Hex | Penggunaan |
|-------|-----|------------|
| `--color-brand-primary` | `#1A7A4A` | CTA utama, sidebar aktif, aksen brand |
| `--color-brand-secondary` | `#2ECC71` | Hover state, badge sukses, konfirmasi |
| `--color-brand-dark` | `#0F4F30` | Sidebar background, header area |
| `--color-brand-light` | `#E8F5EE` | Background highlight, card terpilih |

### 2.2 Semantic Colors (Status)

| Token | Hex | Penggunaan |
|-------|-----|------------|
| `--color-status-critical` | `#E74C3C` | Expired, suhu kritis, alert merah |
| `--color-status-warning` | `#F39C12` | Near-expired (< 30 hari), warning kuning |
| `--color-status-safe` | `#27AE60` | Aman, normal, aktif |
| `--color-status-info` | `#2980B9` | Informasi, cold-chain zone |
| `--color-status-neutral` | `#95A5A6` | Nonaktif, placeholder, disabled |

### 2.3 Neutral Palette

| Token | Hex | Penggunaan |
|-------|-----|------------|
| `--color-bg-base` | `#F4F6F8` | Background halaman utama |
| `--color-bg-surface` | `#FFFFFF` | Card, panel, modal |
| `--color-bg-elevated` | `#EAECEF` | Input background, row hover |
| `--color-text-primary` | `#1C2833` | Teks utama |
| `--color-text-secondary` | `#566573` | Label, caption, teks pendukung |
| `--color-text-disabled` | `#B2BABB` | Teks nonaktif |
| `--color-border-default` | `#D5D8DC` | Border card, divider |
| `--color-border-strong` | `#AEB6BF` | Border input aktif, tabel |

### 2.4 Aturan Penggunaan Warna

- Warna brand (`--color-brand-*`) hanya untuk elemen interaktif dan navigasi aktif
- Warna status digunakan **eksklusif** untuk indikator — tidak untuk dekorasi
- Tidak ada gradien dekoratif. Gradien hanya diizinkan pada grafik data (chart)
- Background putih murni (`#FFFFFF`) hanya untuk surface card dan modal
- Dark background (`--color-brand-dark`) eksklusif untuk sidebar

---

## 3. Typography

### 3.1 Font Stack

| Jenis | Font | Fallback |
|-------|------|----------|
| Display / Heading | `IBM Plex Sans` | `'Segoe UI'`, sans-serif |
| Body / UI | `IBM Plex Sans` | `'Segoe UI'`, sans-serif |
| Monospace / Kode / ID | `IBM Plex Mono` | `'Courier New'`, monospace |

Alasan pemilihan: IBM Plex Sans memiliki karakter industri yang kuat, sangat terbaca pada ukuran kecil, dan memiliki variabel weight yang konsisten dari 300 hingga 700. Cocok untuk konteks gudang/pabrik yang membutuhkan data-heavy interface.

### 3.2 Type Scale

| Token | Size | Weight | Line Height | Penggunaan |
|-------|------|--------|-------------|------------|
| `--text-display` | 28px | 700 | 1.2 | Judul halaman utama |
| `--text-heading-lg` | 22px | 600 | 1.3 | Judul modul, section header |
| `--text-heading-md` | 18px | 600 | 1.4 | Judul card, sub-section |
| `--text-heading-sm` | 15px | 600 | 1.4 | Label kolom tabel, grup navigasi |
| `--text-body-lg` | 15px | 400 | 1.6 | Body teks utama |
| `--text-body-md` | 14px | 400 | 1.6 | Body teks pendukung |
| `--text-body-sm` | 13px | 400 | 1.5 | Caption, helper text |
| `--text-label` | 12px | 500 | 1.4 | Badge, tag, chip status |
| `--text-mono` | 13px | 400 | 1.5 | Lot number, kode slot, ID inventori |

### 3.3 Aturan Tipografi

- Lot number, ID slot, dan kode barang **selalu** menggunakan `--text-mono`
- Tidak ada teks dengan `font-weight: 800` atau lebih
- Tidak ada teks ALL CAPS kecuali badge status (maksimal 3 kata)
- Line length maksimal 72 karakter untuk paragraf deskripsi

---

## 4. Iconography

### 4.1 Prinsip Ikon

- Gaya: **Outline stroke 1.5px**, sudut sedikit rounded (radius 2px)
- Ukuran standar: 16px, 20px, 24px
- Tidak menggunakan silhouette filled kecuali untuk ikon status aktif (toggle on/off)
- Tidak menggunakan ikon bergambar orang atau wajah manusia
- Semua ikon dalam warna `currentColor` — mengikuti warna teks kontekstual

### 4.2 Ikon Per Modul

| Modul / Fitur | Ikon (Lucide/Phosphor) | Deskripsi Visual |
|--------------|------------------------|------------------|
| Dashboard | `LayoutDashboard` | Grid 2x2 kotak outline |
| Denah Gudang | `Map` | Peta outline dengan marker |
| Cold-Chain | `Thermometer` | Tabung dengan garis suhu |
| FIFO & Expiry | `CalendarClock` | Kalender dengan ikon jam |
| Chatbot Copilot | `MessageSquare` | Bubble chat outline |
| Upload Dokumen | `Upload` | Panah ke atas dalam kotak |
| Auto-Report | `FileBarChart` | Dokumen dengan grafik batang |
| Database Inventori | `Database` | Silinder data bertumpuk |
| Audit Trail | `ShieldCheck` | Perisai dengan centang |
| Alert Suhu | `AlertTriangle` | Segitiga dengan tanda seru |
| Alert Expired | `Clock` | Jam outline |
| Status Aman | `CheckCircle` | Lingkaran dengan centang |
| Status Bahaya | `XCircle` | Lingkaran dengan silang |
| Edit | `Pencil` | Pensil outline |
| Hapus | `Trash2` | Tempat sampah outline |
| Export | `Download` | Panah ke bawah dalam kotak |
| Filter | `SlidersHorizontal` | Tiga slider horizontal |
| Pencarian | `Search` | Kaca pembesar outline |
| Logout | `LogOut` | Kotak dengan panah keluar |
| Notifikasi | `Bell` | Lonceng outline |
| Pengaturan | `Settings` | Roda gigi outline |
| User | `UserCircle` | Lingkaran dengan siluet orang |

### 4.3 Aturan Penggunaan Ikon

- Ikon navigasi sidebar: ukuran 20px
- Ikon aksi tabel (edit, hapus): ukuran 16px dalam tombol icon-only
- Ikon alert/status: ukuran 20px
- Ikon tombol (dengan label): ukuran 16px, margin-right 6px
- Selalu sertakan `aria-label` pada ikon tanpa teks

---

## 5. Layout & Grid

### 5.1 Struktur Halaman Global

```
+------------------+--------------------------------------------+
|                  |  TOPBAR (56px tinggi)                      |
|   SIDEBAR        |--------------------------------------------|
|   (240px lebar)  |                                            |
|                  |  CONTENT AREA                              |
|                  |  (padding: 24px)                           |
|                  |                                            |
|                  |                                            |
+------------------+--------------------------------------------+
```

- Sidebar: lebar tetap 240px, height 100vh, sticky
- Sidebar collapsed (mobile): 60px (ikon saja)
- Topbar: tinggi 56px, sticky top, z-index 100
- Content area: `max-width: 1280px`, auto margin horizontal, padding 24px

### 5.2 Breakpoints

| Breakpoint | Width | Perubahan Layout |
|------------|-------|------------------|
| Desktop | >= 1280px | Sidebar expanded (240px) |
| Tablet | 768px – 1279px | Sidebar collapsed (60px) |
| Mobile | < 768px | Sidebar hidden, burger menu |

### 5.3 Grid Konten

- Sistem grid: 12 kolom, gap 16px
- Card dashboard: 3 kolom (4/12 tiap card)
- Tabel: full width dalam content area
- Panel detail (slide-in): lebar 360px dari kanan, overlay

### 5.4 Spacing Scale

| Token | Value | Penggunaan Umum |
|-------|-------|-----------------|
| `--space-1` | 4px | Gap ikon-teks, padding badge |
| `--space-2` | 8px | Padding cell tabel, gap item kecil |
| `--space-3` | 12px | Padding input, gap komponen kecil |
| `--space-4` | 16px | Padding card, gap grid |
| `--space-5` | 20px | Margin antar section dalam card |
| `--space-6` | 24px | Padding content area, margin antar card |
| `--space-8` | 32px | Margin antar section halaman |
| `--space-12` | 48px | Margin antar blok besar |

---

## 6. Component Specification

### 6.1 Sidebar Navigation

**Struktur:**
- Background: `--color-brand-dark` (`#0F4F30`)
- Logo area: tinggi 64px, padding 20px
- Nav grup: label group uppercase 11px, `--color-text-disabled`
- Nav item: tinggi 44px, padding 12px 16px, border-radius 8px
- Nav item aktif: background `--color-brand-primary`, teks putih
- Nav item hover: background `rgba(255,255,255,0.08)`
- Icon: 20px, opacity 0.7 (normal), 1.0 (aktif)
- Teks nav: `--text-body-md`, weight 500, warna `rgba(255,255,255,0.85)`

**Grup Navigasi:**
```
[MAIN]
- Dashboard

[WAREHOUSE]
- Interactive Floor Plan
- FIFO & Expiry
- Cold-Chain Monitor

[PRODUCTION]
- Production Copilot
- Inventory Master

[SYSTEM]
- Audit Trail
- Log Out
```

---

### 6.2 Topbar

- Background: `--color-bg-surface` (`#FFFFFF`)
- Border bottom: 1px solid `--color-border-default`
- Kiri: breadcrumb atau judul halaman aktif (`--text-heading-md`)
- Kanan: ikon notifikasi, ikon pengaturan, avatar user + nama + role (chip kecil)
- Avatar: lingkaran 32px, inisial nama dengan background `--color-brand-primary`
- Role chip: background `--color-brand-light`, teks `--color-brand-primary`, 11px uppercase

---

### 6.3 Card

**Default Card:**
- Background: `#FFFFFF`
- Border: 1px solid `--color-border-default`
- Border-radius: 12px
- Padding: 20px
- Box-shadow: `0 1px 3px rgba(0,0,0,0.06)`

**Card Hover (interaktif):**
- Box-shadow: `0 4px 12px rgba(0,0,0,0.10)`
- Transition: 150ms ease

**Card Header:**
- Judul: `--text-heading-md`, `--color-text-primary`
- Sub-judul / caption: `--text-body-sm`, `--color-text-secondary`
- Divider bawah header: 1px solid `--color-border-default`, margin 16px 0

**Stat Card (Dashboard Widget):**
- Angka besar: `--text-display`, weight 700
- Label: `--text-body-sm`, `--color-text-secondary`
- Ikon pendukung: 24px, `--color-brand-primary`
- Trend indicator: panah naik/turun + persentase, warna sesuai status

---

### 6.4 Alert Banner

Tampil otomatis di atas konten dashboard jika ada anomali.

**Struktur:**
- Lebar: full content width
- Padding: 12px 16px
- Border-radius: 8px
- Border kiri: 4px solid warna status
- Ikon: 20px, sama dengan warna border
- Teks: `--text-body-md`, weight 500
- Tombol dismiss: `X` kecil di kanan

**Variasi:**
| Jenis | Background | Border | Teks |
|-------|------------|--------|------|
| Critical (suhu/expired) | `#FDEDEC` | `#E74C3C` | `#922B21` |
| Warning (near-expired) | `#FEF9E7` | `#F39C12` | `#784212` |
| Info | `#EBF5FB` | `#2980B9` | `#1A5276` |

---

### 6.5 Button

**Variasi:**

| Variant | Background | Teks | Border | Penggunaan |
|---------|------------|------|--------|------------|
| Primary | `--color-brand-primary` | Putih | Tidak ada | Aksi utama (Simpan, Konfirmasi) |
| Secondary | `--color-bg-surface` | `--color-brand-primary` | 1.5px brand | Aksi sekunder (Batal, Lihat Detail) |
| Danger | `--color-status-critical` | Putih | Tidak ada | Hapus, Reset |
| Ghost | Transparan | `--color-text-primary` | Tidak ada | Aksi tersier, link-like |
| Disabled | `--color-bg-elevated` | `--color-text-disabled` | Tidak ada | State nonaktif |

**Ukuran:**
| Size | Height | Padding H | Font Size |
|------|--------|-----------|-----------|
| Large | 44px | 20px | 15px |
| Medium (default) | 36px | 16px | 14px |
| Small | 28px | 12px | 13px |
| Icon-only | 36px | 10px | — |

**Aturan:**
- Border-radius: 8px untuk semua button
- Loading state: spinner 16px menggantikan ikon
- Ikon dalam button: 16px, margin-right 6px

---

### 6.6 Input & Form

**Input Text:**
- Height: 40px
- Border: 1px solid `--color-border-strong`
- Border-radius: 8px
- Padding: 0 12px
- Background: `#FFFFFF`
- Focus: border 2px `--color-brand-primary`, outline none
- Error: border `--color-status-critical`
- Placeholder: `--color-text-disabled`

**Dropdown / Select:**
- Sama dengan Input Text
- Ikon chevron: 16px di kanan

**Label:**
- `--text-body-sm`, weight 500, `--color-text-primary`
- Margin bawah 6px
- Required indicator: `*` merah setelah label

**Helper Text / Error:**
- `--text-body-sm`, `--color-text-secondary` (helper), `--color-status-critical` (error)
- Margin atas 4px

---

### 6.7 Table

**Header Row:**
- Background: `--color-bg-elevated`
- Teks: `--text-heading-sm`, uppercase, `--color-text-secondary`
- Padding cell: 12px 16px
- Border bottom: 2px solid `--color-border-strong`

**Data Row:**
- Padding cell: 12px 16px
- Border bottom: 1px solid `--color-border-default`
- Hover: background `--color-bg-elevated`
- Teks: `--text-body-md`

**Row Status (FIFO Tracker):**
| Status | Background Row | Badge |
|--------|----------------|-------|
| Expired / < 7 hari | `#FDEDEC` | Merah — CRITICAL |
| < 30 hari | `#FEF9E7` | Kuning — WARNING |
| Aman | Transparan | Hijau — SAFE |

**Badge Status dalam Tabel:**
- Border-radius: 4px
- Padding: 2px 8px
- Font: `--text-label`, uppercase, weight 600
- No icon (teks saja, warna mengikuti semantic)

---

### 6.8 Badge & Chip

**Badge (status label):**
- Inline dalam tabel atau card
- Tanpa ikon
- Border-radius: 4px
- Padding: 2px 8px

**Chip (filter aktif, tag kategori):**
- Border-radius: 20px (pill)
- Padding: 4px 12px
- Dengan tombol `x` untuk remove (filter chip)

---

### 6.9 Toast / Notification

Muncul di pojok kanan bawah, stack vertikal, auto-dismiss 4 detik.

- Lebar: 320px
- Padding: 14px 16px
- Border-radius: 10px
- Box-shadow: `0 4px 16px rgba(0,0,0,0.12)`
- Ikon: 20px di kiri
- Teks: `--text-body-md`, weight 500
- Tombol dismiss: `X` 16px di kanan
- Animasi masuk: slide dari kanan + fade in (200ms)
- Animasi keluar: fade out (150ms)

---

### 6.10 Modal & Panel Detail

**Modal Konfirmasi:**
- Overlay: `rgba(0,0,0,0.4)` background
- Panel: background putih, border-radius 16px, padding 28px
- Lebar: 480px (max)
- Animasi: scale 0.95 → 1 + fade in (200ms)

**Slide-in Panel (Detail Slot Gudang):**
- Muncul dari kanan, lebar 360px
- Background putih
- Box-shadow: `-4px 0 24px rgba(0,0,0,0.12)`
- Animasi: translateX(100%) → translateX(0) (250ms ease)
- Header panel: judul slot + tombol close (X)
- Scrollable content

---

### 6.11 Floor Plan (Denah Gudang)

**Zona Warna:**
| Zona | Warna Fill | Border | Keterangan |
|------|------------|--------|------------|
| Cold Storage | `#D6EAF8` | `#2980B9` | Zona suhu terkontrol |
| Bahan Berbahaya | `#FADBD8` | `#E74C3C` | Hazardous material |
| Bahan Umum | `#D5F5E3` | `#27AE60` | Non-berbahaya, non-cold |
| Area Kosong | `#F2F3F4` | `#BDC3C7` | Slot tersedia |
| Loading Dock | `#FEF9E7` | `#F39C12` | Area penerimaan/pengiriman |

**Slot:**
- Label: kode slot format `A-1`, `B-3` menggunakan `--text-mono`
- Slot terisi: warna zona + badge kecil persentase kapasitas
- Slot diklik: border 2px `--color-brand-primary`, shadow highlight
- Slot kosong: opacity 0.5, border dashed

---

### 6.12 Chart & Grafik

**Cold-Chain Temperature Chart:**
- Library: Recharts atau Chart.js
- Warna garis zona normal: `--color-brand-primary`
- Garis batas suhu: dashed, `--color-status-critical`
- Area di bawah garis: fill `rgba(26,122,74,0.08)`
- Grid: `--color-border-default`, opacity 0.5
- Tooltip: background putih, border-radius 8px, shadow ringan

**Kapasitas Widget (Gauge/Progress):**
- Progress bar: `--color-brand-primary` (isi), `--color-bg-elevated` (track)
- Angka persen di tengah: `--text-heading-lg`, bold
- Border-radius bar: 8px

---

## 7. Login & Register Page

### 7.1 Layout

- Split screen: kiri (40%) gambar atmosferik, kanan (60%) form
- Background kiri: foto high-quality bahan baku/aroma (botol parfum, rempah, tanaman) dengan overlay tipis hitam transparan
- Background kanan: `#FFFFFF`
- Tidak ada elemen dekoratif di area form kecuali logo

### 7.2 Elemen Form Login

- Logo AromaSys: atas kiri form, tinggi 36px
- Judul: `--text-display` — "Sign In"
- Sub-judul: `--text-body-md`, `--color-text-secondary` — "Sign in to your AromaSys account."
- Input Email: label "Email", placeholder `john.doe@gmail.com`
- Input Password: label "Password", toggle show/hide, placeholder `••••••••`
- Dropdown Role: label "Role", pilihan: Operator / QC / PPIC / Admin
- Checkbox: "Remember me"
- Link: "Forgot Password?" — di sebelah kanan checkbox
- Button Primary full-width: "Sign In" — tinggi 44px
- Footer teks: "Don't have an account? Sign up" — link ke Register

### 7.3 Elemen Form Register

- Sama dengan login
- Tambah field: "Full Name" (di atas email)
- Konfirmasi Password: tambah field "Confirm Password"
- Button: "Sign Up"
- Footer: "Already have an account? Sign in"

### 7.4 Validasi Form

- Email: format valid, required
- Password: minimum 8 karakter
- Confirm Password: harus cocok
- Error inline di bawah field menggunakan `--color-status-critical`

---

## 8. Dashboard Page

### 8.1 Layout

- 3 Stat Card di baris atas (kapasitas, item warning, zona cold-chain)
- Alert Banner (jika ada anomali) — di bawah stat card
- Tabel "Items Requiring Immediate Use" — kolom: Nama, Lot Number, Tanggal Expired, Status
- Panel "Recent Activity" — log singkat aktivitas terbaru
- 2 Quick Action Button: "Ask Copilot", "View Floor Plan"

### 8.2 Stat Cards

| Card | Metrik | Ikon |
|------|--------|------|
| Total Active Items | Jumlah item aktif | `Package` |
| Expiring Soon | Jumlah item dalam 30 hari | `CalendarClock` |
| Warehouse Capacity | Persentase kapasitas terpakai | `Warehouse` |
| Cold-Chain Zones | Jumlah zona cold aktif/total | `Thermometer` |

---

## 9. States & Micro-interaction

### 9.1 Loading State

- Skeleton loading untuk card dan tabel: rectangle abu-abu animasi shimmer
- Spinner untuk tombol dan inline action: ukuran 16px
- Tidak menggunakan loading overlay seluruh halaman kecuali untuk operasi kritis

### 9.2 Empty State

- Ikon outline 48px, `--color-text-disabled`
- Judul: `--text-heading-sm`, `--color-text-secondary`
- Deskripsi singkat: `--text-body-sm`
- CTA button jika ada aksi yang relevan

### 9.3 Error State

- Sama dengan empty state tapi ikon menggunakan `AlertCircle`
- Tombol "Coba Lagi" (retry)

### 9.4 Hover & Focus

- Semua elemen interaktif: transisi 150ms ease
- Focus ring: 2px offset, warna `--color-brand-primary`, border-radius mengikuti elemen
- Tidak menggunakan `outline: none` tanpa pengganti

---

## 10. Accessibility

- Contrast ratio minimum 4.5:1 untuk teks normal, 3:1 untuk teks besar
- Semua ikon yang membawa makna harus memiliki `aria-label`
- Form label harus terhubung ke input via `htmlFor` / `id`
- Alert banner menggunakan `role="alert"` untuk screen reader
- Keyboard navigasi penuh pada sidebar dan modal
- Tabel menggunakan `<th scope="col">` untuk header kolom

---

## 11. Motion & Animation

| Elemen | Animasi | Durasi |
|--------|---------|--------|
| Sidebar item hover | Background fade | 120ms |
| Card hover | Shadow elevation | 150ms |
| Modal masuk | Scale + fade | 200ms ease-out |
| Panel slide-in | TranslateX | 250ms ease |
| Toast masuk | SlideX + fade | 200ms |
| Alert banner | SlideY + fade | 180ms |
| Button loading | Spinner rotate | continuous |
| Skeleton loader | Shimmer sweep | 1.5s loop |

Aturan:
- Tidak ada animasi > 400ms kecuali page transition
- Semua animasi menghormati `prefers-reduced-motion: reduce`
- Tidak ada animasi dekoratif yang tidak membawa makna fungsional

---

## 12. File & Asset Convention

### 12.1 Penamaan File Komponen

```
PascalCase untuk komponen React
kebab-case untuk file CSS/SCSS module
```

Contoh:
```
SidebarNav.tsx
DashboardStatCard.tsx
FloorPlanCanvas.tsx
cold-chain-chart.module.css
```

### 12.2 Struktur Folder Frontend

```
/src
  /components
    /layout         (Sidebar, Topbar, PageWrapper)
    /common         (Button, Input, Card, Badge, Modal, Toast)
    /charts         (TemperatureChart, CapacityGauge)
    /dashboard      (StatCard, AlertBanner, ActivityFeed)
    /floor-plan     (FloorCanvas, SlotPanel, ZoneLegend)
    /cold-chain     (ZoneMonitor, AlarmPopup)
    /fifo-expiry    (ExpiryTable, FilterBar)
    /copilot        (ChatBubble, UploadDropzone, ReportForm)
    /settings       (InventoryTable, AuditLogTable)
  /pages
    /login
    /dashboard
    /digital-twin
    /copilot
    /settings
  /styles
    tokens.css      (semua CSS variables)
    global.css
  /utils
  /hooks
  /services         (API calls)
```

---

## 13. Checklist Implementasi Desain

Sebelum komponen dinyatakan selesai, pastikan:

- Menggunakan CSS variable dari `tokens.css`, bukan hardcode hex
- Status visual (loading, error, empty, success) semua diimplementasikan
- RBAC: elemen yang dibatasi per role tidak ditampilkan (bukan hanya disabled)
- Tabel memiliki state hover dan baris status berwarna
- Semua form memiliki validasi dan pesan error
- Ikon menggunakan ukuran standar (16/20/24px)
- Teks monospace untuk kode/ID/lot number
- Responsive minimal untuk tablet (sidebar collapsed)
- Tidak ada magic number — semua spacing dari `--space-*` tokens

---

*Dokumen ini adalah acuan desain hidup untuk tim AromaSys. Setiap perubahan visual harus diperbarui di sini sebelum diimplementasikan.*