# AromaSys — Software Requirements Document

> **Project:** AromaSys — Warehouse Management & Intelligence Platform  
> **Version:** 0.1 (Draft)  
> **Status:** In Progress  
> **Last Updated:** 28 Mei 2025  
> **Team:** Hikari, Arya, Icaz + AI Antigravity

---

## 1. Project Overview

AromaSys adalah aplikasi manajemen gudang berbasis web yang mengintegrasikan **Digital Twin**, **LLM Production Copilot**, dan **Enterprise Settings (RBAC & Audit)** dalam satu platform terpadu. Aplikasi ini dirancang untuk industri produksi/pabrik yang membutuhkan pelacakan inventori bahan baku, pemantauan suhu cold-chain, dan otomasi laporan.

---

## 2. User Roles & Access Control (RBAC)

| Role | Deskripsi | Hak Akses Utama |
|------|-----------|-----------------|
| **Operator** | Pengguna harian gudang | Lihat semua menu, tidak bisa edit/hapus master data |
| **QC** | Quality Control | Lihat + edit/hapus data di Database Inventori |
| **PPIC** | Production Planning & Inventory Control | Lihat semua + akses Audit Trail |
| **Admin** | Administrator sistem | Akses penuh ke semua fitur dan pengaturan |

---

## 3. User Flow

```
[START]
  │
  ▼
[LOGIN / REGISTER PAGE]
  ├─ Input: Email & Password
  ├─ Tombol: Login, Daftar Akun, Lupa Password
  └─ Sistem: Cek kredensial → validasi role → redirect ke Dashboard
  │
  ▼
[GLOBAL DASHBOARD]  ← Halaman utama setelah login
  ├─ Widget 1: Ringkasan Kapasitas Gudang (real-time dari DB)
  ├─ Widget 2: Peringatan FIFO/Expired (merah = kritis, kuning = warning)
  ├─ Widget 3: Alert Suhu Cold-Chain (muncul otomatis jika ada anomali)
  ├─ Banner Alert: Suhu Kritis & Status Expired (otomatis)
  └─ Tombol Cepat: "Tanya Copilot", "Lihat Denah Gudang"
  │
  ▼
[SIDEBAR NAVIGASI — Persistent, selalu tampil di kiri layar]
  ├─ Menu: Warehouse Digital Twin
  ├─ Menu: LLM Production Copilot
  └─ Menu: Enterprise Settings
```

---

## 4. Modul & Fitur Detail

---

### 4.1 Modul: Login & Register

**Halaman:** `/login`, `/register`

#### Elemen UI
- Input field: Email & Password
- Tombol: Login, Daftar Akun
- Link: Lupa Password

#### Logika Sistem
1. User memasukkan kredensial
2. Sistem memvalidasi email & password di database
3. Sistem mengecek role user (Operator / QC / PPIC / Admin)
4. Redirect ke Global Dashboard

#### Hak Akses
- **Semua user** (belum login)

---

### 4.2 Modul: Global Dashboard

**Halaman:** `/dashboard`

#### Elemen UI
- Widget kapasitas gudang (progress bar / gauge chart)
- Widget FIFO/Expired — warna merah (kritis) & kuning (warning)
- Widget alert suhu cold-chain — aktif hanya jika ada anomali
- Banner alert otomatis: Suhu Kritis & Status Expired
- Tombol cepat: **"Tanya Copilot"** → redirect ke `/copilot/chat`
- Tombol cepat: **"Lihat Denah Gudang"** → redirect ke `/digital-twin/floor-plan`

#### Logika Sistem
1. Load data real-time dari database
2. Tampilkan ringkasan semua area gudang
3. Jika ada anomali suhu atau bahan near-expired → banner alert muncul otomatis

#### Hak Akses
- **Semua user**

---

### 4.3 Modul: Warehouse Digital Twin (Area 04)

**Base Route:** `/digital-twin`

---

#### 4.3.1 Sub-menu: Denah Gudang (Interactive Floor Plan)

**Halaman:** `/digital-twin/floor-plan`

##### Elemen UI
- Denah visual bird-eye view dari atas, warna-warni per zona
- Label slot: format A-1, A-2, B-1, B-2, dst.
- Panel detail muncul saat klik slot (slide-in dari kanan)
- Tombol: "Input Barang Baru" (di panel detail slot kosong)

##### Logika Sistem
1. **Klik Slot Terisi** → tampilkan detail barang (nama, jumlah, tanggal masuk, expired, status suhu)
2. **Input Barang Baru:**
   - User mengisi form barang
   - AI menganalisis jenis bahan
   - Sistem memberikan saran penempatan: *"Saran Penempatan: Zona C (Bukan Bahan Berbahaya)"*
   - User konfirmasi → denah diperbarui

##### Aksi Tersedia
- Lihat detail slot
- Tambah barang baru
- Edit slot (QC/Admin)
- Hapus slot (QC/Admin)

##### Hak Akses
- **Semua user**: lihat & tambah
- **QC/Admin**: edit & hapus

---

#### 4.3.2 Sub-menu: Cold-Chain Monitor

**Halaman:** `/digital-twin/cold-chain`

##### Elemen UI
- Grafik suhu real-time per zona (sumbu X: waktu, sumbu Y: °C)
- Garis batas suhu ideal (dashed line)
- Indikator status zona: aman (hijau), warning (kuning), bahaya (merah)

##### Logika Sistem
1. Baca data suhu dari sensor / database secara real-time
2. Jika suhu zona > batas yang ditentukan:
   - Pop-up alarm merah muncul otomatis
   - Notifikasi dikirim ke user yang sedang login
   - Opsi: **Buat Tiket Maintenance** atau **Tutup & Pantau**

##### Aksi Tersedia
- Pantau suhu real-time
- Buat tiket maintenance

##### Hak Akses
- **Semua user**

---

#### 4.3.3 Sub-menu: FIFO & Expiry Tracker

**Halaman:** `/digital-twin/fifo-expiry`

##### Elemen UI
- Tabel bahan baku diurutkan dari yang paling dekat expired
- Warna baris: merah (expired/< 7 hari), kuning (< 30 hari), hijau (aman)
- Filter: zona, kategori bahan
- Tombol: Export Excel

##### Logika Sistem
1. Ambil data bahan baku dari database
2. Urutkan ASC berdasarkan tanggal expired (terdekat di atas)
3. Warnai baris sesuai status

##### Aksi Tersedia
- Filter data
- Download Excel

##### Hak Akses
- **Semua user**

---

### 4.4 Modul: LLM Production Copilot (Area 01)

**Base Route:** `/copilot`

---

#### 4.4.1 Sub-menu: Chatbot Asisten

**Halaman:** `/copilot/chat`

##### Elemen UI
- Tampilan chat bubble (user kanan, AI kiri)
- Field input teks (dengan tombol kirim)
- Tombol saran pertanyaan cepat (contoh preset query)

##### Logika Sistem
1. User mengetik pertanyaan dalam bahasa natural (Bahasa Indonesia)
2. AI melakukan query ke database
3. Jawaban ditampilkan dengan data aktual
4. Item dalam jawaban bisa diklik → navigasi ke detail slot/item

##### Contoh Use Case
- *"Bahan apa yang expired minggu ini?"*
- *"Slot mana yang masih kosong di Zona B?"*
- *"Berapa stok tepung terigu sekarang?"*

##### Aksi Tersedia
- Tanya dalam bahasa natural
- Klik item di jawaban untuk navigasi

##### Hak Akses
- **Semua user**

---

#### 4.4.2 Sub-menu: Data Ingestion (Upload Dokumen)

**Halaman:** `/copilot/upload`

##### Elemen UI
- Area drag & drop (PDF nota / foto catatan / Excel)
- Panel preview hasil ekstraksi OCR
- Tabel data terstruktur hasil parsing
- Tombol: "Simpan ke Database", "Edit Hasil OCR"

##### Logika Sistem
1. User upload dokumen (PDF / gambar / Excel)
2. Library OCR mengekstrak teks dari dokumen
3. Sistem melakukan parsing & splitting data terstruktur
4. **Cek duplikasi** di database
5. Tampilkan preview hasil ke user
6. User konfirmasi → data disimpan ke database

##### Aksi Tersedia
- Upload dokumen
- Edit hasil OCR sebelum simpan
- Simpan ke database

##### Hak Akses
- **Semua user**

---

#### 4.4.3 Sub-menu: Auto-Report

**Halaman:** `/copilot/report`

##### Elemen UI
- Form pilih parameter: periode (tanggal awal–akhir), jenis laporan
- Pilihan format output: PDF / Excel
- Area preview laporan
- Tombol: "Generate", "Download"

##### Logika Sistem
1. User memilih parameter laporan
2. Sistem mengumpulkan data dari database sesuai parameter
3. Render laporan (tabel, grafik, ringkasan)
4. User preview → klik Download

##### Aksi Tersedia
- Generate laporan
- Preview
- Download PDF/Excel

##### Hak Akses
- **Semua user**

---

### 4.5 Modul: Enterprise Settings (RBAC & Audit)

**Base Route:** `/settings`

---

#### 4.5.1 Sub-menu: Database Inventori (Master Data)

**Halaman:** `/settings/inventory`

##### Elemen UI
- Tabel bahan baku: ID, Nama, Kategori, Jumlah, Lokasi, Tanggal Masuk, Tanggal Expired, Status
- Fitur pencarian & filter (kategori, zona, status)
- Pagination
- Tombol Edit & Hapus (hanya muncul untuk QC/Admin)

##### Logika Sistem
1. Load semua data dari database
2. Tampilkan dengan fitur filter & pencarian
3. Role Operator: hanya bisa **lihat**
4. Role QC/Admin: bisa **edit** & **hapus** (misal koreksi hasil OCR yang salah)

##### Aksi Tersedia
- **Semua user**: Lihat data
- **QC/Admin**: Edit & hapus data

##### Hak Akses
- **Semua** (lihat)
- **QC/Admin** (edit/hapus)

---

#### 4.5.2 Sub-menu: Audit Trail

**Halaman:** `/settings/audit`

##### Elemen UI
- Tabel log: Waktu, Nama User, Role, Aksi, Detail Perubahan, Modul
- Filter: rentang tanggal, nama user
- Tombol: Export Log

##### Logika Sistem
1. Semua aksi perubahan data tercatat otomatis di sistem
2. Data audit bersifat **permanen** — tidak bisa diedit atau dihapus oleh siapapun
3. Contoh log: *"Operator Budi menambahkan stok di Slot A-2 — 28/05/2025 09:15"*

##### Aksi Tersedia
- Lihat log
- Filter log
- Download log

##### Hak Akses
- **PPIC/Admin only**

---

## 5. Ringkasan Hak Akses Per Fitur

| Fitur | Operator | QC | PPIC | Admin |
|-------|----------|----|------|-------|
| Login & Register | ✅ | ✅ | ✅ | ✅ |
| Global Dashboard | ✅ | ✅ | ✅ | ✅ |
| Denah Gudang (lihat) | ✅ | ✅ | ✅ | ✅ |
| Denah Gudang (edit/hapus) | ❌ | ✅ | ❌ | ✅ |
| Cold-Chain Monitor | ✅ | ✅ | ✅ | ✅ |
| FIFO & Expiry Tracker | ✅ | ✅ | ✅ | ✅ |
| Chatbot Asisten | ✅ | ✅ | ✅ | ✅ |
| Data Ingestion | ✅ | ✅ | ✅ | ✅ |
| Auto-Report | ✅ | ✅ | ✅ | ✅ |
| Database Inventori (lihat) | ✅ | ✅ | ✅ | ✅ |
| Database Inventori (edit/hapus) | ❌ | ✅ | ❌ | ✅ |
| Audit Trail | ❌ | ❌ | ✅ | ✅ |

---

## 6. Tech Stack (Rencana)

> *Diisi oleh tim developer — belum final*

| Layer | Teknologi |
|-------|-----------|
| Frontend | React / Next.js (TBD) |
| Backend | Node.js / Python FastAPI (TBD) |
| Database | PostgreSQL / Supabase (TBD) |
| OCR | Tesseract / Google Vision (TBD) |
| LLM | Claude API / OpenAI (TBD) |
| Auth | JWT / Supabase Auth (TBD) |

---

## 7. Status Pekerjaan (Line of Work)

| Tugas | Deadline | PIC | Status |
|-------|----------|-----|--------|
| User Flow | 28/05 06.00 | Hikari | ✅ Done |
| Detail Page | 28/05 06.00 | Arya & Hikari | ✅ Done |
| UI/UX & Frontend Design | 28/05 23.59 | Icaz | 🔄 Design in progress |
| Caz info akses | — | Icaz | 🔄 In progress |
| Code (Frontend) | Cicil s/d 29/05 | Arya (mulai duluan) | 🔄 In progress |
| Backend | TBD | Semua | 🔄 In progress |

---

## 8. Catatan Tambahan

- **Banner Alert** di dashboard bersifat otomatis — tidak perlu trigger manual dari user
- **Persistent Sidebar** selalu tampil di semua halaman setelah login
- **Audit Trail** bersifat immutable — tidak ada UI edit/hapus untuk log
- **AI Saran Penempatan** di Denah Gudang menggunakan analisis berbasis kategori bahan (berbahaya / tidak berbahaya / perlu cold-chain)
- **Cek Duplikasi** di Data Ingestion dilakukan sebelum data masuk ke database — user harus konfirmasi manual jika ada potensi duplikat

---

*Dokumen ini adalah living document — update seiring perkembangan proyek.*