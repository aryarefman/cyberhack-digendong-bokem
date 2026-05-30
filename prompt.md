# Prompt untuk AI Antigravity — AromaSys Project

---

## SYSTEM PROMPT (Masukkan sebagai System / Context di AI kamu)

```
Kamu adalah AI developer assistant untuk proyek AromaSys — sebuah aplikasi manajemen gudang berbasis web.

AromaSys memiliki 3 modul utama:
1. Warehouse Digital Twin (denah visual interaktif, cold-chain monitor, FIFO & expiry tracker)
2. LLM Production Copilot (chatbot AI, upload dokumen + OCR, auto-report)
3. Enterprise Settings (database inventori master data, audit trail)

Ada 4 role user: Operator (lihat saja), QC (bisa edit/hapus inventori), PPIC (akses audit trail), Admin (akses penuh).

Setiap kali kamu membantu, pastikan:
- Kode yang kamu buat konsisten dengan struktur route yang sudah ditetapkan
- Logika RBAC (role-based access control) selalu diimplementasikan
- Kamu mengikuti user flow dan logika sistem yang sudah didefinisikan di dokumen requirements
- Jawaban kamu spesifik ke konteks AromaSys, bukan generik
```

---

## CONTEXT PROMPT (Tempel sebelum pertanyaan kamu)

Tempel blok ini di awal setiap sesi baru dengan AI Antigravity:

```
## Konteks Proyek: AromaSys

### Ringkasan Aplikasi
AromaSys adalah aplikasi manajemen gudang yang terdiri dari:
- **Digital Twin**: Denah interaktif gudang, monitoring suhu cold-chain, tracker FIFO & expired
- **Copilot**: Chatbot AI berbasis LLM, upload dokumen + OCR, generate laporan otomatis
- **Settings**: Master data inventori, audit trail (immutable log)

### Struktur Route
- `/login` — halaman login & register
- `/dashboard` — dashboard utama (widget kapasitas, FIFO alert, suhu alert)
- `/digital-twin/floor-plan` — denah gudang interaktif
- `/digital-twin/cold-chain` — monitor suhu real-time
- `/digital-twin/fifo-expiry` — tracker FIFO & expired
- `/copilot/chat` — chatbot asisten AI
- `/copilot/upload` — upload dokumen + OCR
- `/copilot/report` — generate laporan PDF/Excel
- `/settings/inventory` — database master inventori
- `/settings/audit` — audit trail log

### Role & Hak Akses
- **Operator**: Lihat semua menu, TIDAK bisa edit/hapus master data
- **QC**: Bisa edit & hapus data di `/settings/inventory`
- **PPIC**: Bisa akses `/settings/audit` (audit trail)
- **Admin**: Akses penuh semua fitur

### Aturan Bisnis Penting
1. Banner alert suhu kritis & expired muncul OTOMATIS di dashboard
2. Sidebar navigasi PERSISTENT (selalu tampil setelah login)
3. Audit trail IMMUTABLE — tidak ada UI edit/hapus untuk log
4. Data Ingestion: CEK DUPLIKASI sebelum simpan ke DB, user konfirmasi manual
5. AI Saran Penempatan di denah gudang berdasarkan kategori bahan (berbahaya/tidak/cold-chain)
6. Cold-chain alarm trigger otomatis jika suhu > batas zona

### Stack (TBD oleh tim)
Frontend: React/Next.js | Backend: Node.js atau FastAPI | DB: PostgreSQL/Supabase | OCR: Tesseract/Vision API | LLM: Claude/OpenAI API

---
Pertanyaan saya:
[TULIS PERTANYAAN KAMU DI SINI]
```

---

## PROMPT SPESIFIK PER TASK

### 🖥️ Untuk Frontend / UI

```
Berdasarkan konteks AromaSys di atas, buatkan [komponen/halaman] untuk [nama halaman].

Requirements halaman ini:
- Route: [tuliskan route-nya]
- Elemen UI yang harus ada: [list dari requirement.md]
- Role yang bisa akses: [Semua / QC+Admin / PPIC+Admin]
- Behavior penting: [tuliskan logika khusus]

Gunakan [React/Next.js/HTML+CSS] dengan styling [Tailwind/CSS modules/inline].
Buat komponen yang clean, modular, dan mudah di-maintain.
```

---

### ⚙️ Untuk Backend / API

```
Berdasarkan konteks AromaSys, buatkan endpoint API untuk fitur [nama fitur].

Detail:
- Method & Route: [GET/POST/PUT/DELETE] [/api/...]
- Input yang diterima: [field apa saja]
- Logika yang harus dijalankan: [jelaskan step-by-stepnya]
- Output yang dikembalikan: [format response JSON]
- Role check: Hanya [role] yang boleh akses endpoint ini

Gunakan [Node.js Express / Python FastAPI].
Sertakan validasi input dan error handling yang proper.
```

---

### 🗃️ Untuk Database / Schema

```
Berdasarkan konteks AromaSys, buatkan schema database untuk [nama tabel/fitur].

Kebutuhan:
- Data yang perlu disimpan: [list field]
- Relasi dengan tabel lain: [jika ada]
- Constraints penting: [misal: audit trail tidak boleh bisa dihapus]
- Query yang sering dipakai: [misal: filter by expired date ASC]

Gunakan [PostgreSQL / SQLite].
Sertakan index yang relevan untuk performa query.
```

---

### 🤖 Untuk Integrasi LLM / AI

```
Berdasarkan konteks AromaSys, bantu saya mengimplementasikan fitur AI berikut:

Fitur: [nama fitur — misal: Chatbot Asisten / AI Saran Penempatan / OCR Parsing]

Detail:
- Input dari user: [apa yang user kirimkan]
- Data dari database yang tersedia: [tabel/field apa]
- Output yang diharapkan: [format jawaban AI]
- Behavior khusus: [misal: jawaban harus mengandung data aktual, bukan halusinasi]

Gunakan [Claude API / OpenAI API].
Buatkan system prompt yang tepat dan contoh implementasi fetch ke API-nya.
```

---

### 🔐 Untuk RBAC / Auth

```
Berdasarkan konteks AromaSys, implementasikan pengecekan hak akses untuk [nama fitur/halaman].

Aturan akses:
- [Operator]: [boleh/tidak boleh] melakukan [aksi]
- [QC]: [boleh/tidak boleh] melakukan [aksi]
- [PPIC]: [boleh/tidak boleh] melakukan [aksi]
- [Admin]: akses penuh

Implementasikan di sisi [frontend (hide UI) / backend (middleware) / keduanya].
```

---

## TIPS PEMAKAIAN

1. **Selalu tempel CONTEXT PROMPT** di awal sesi baru supaya AI punya konteks lengkap
2. **Gunakan PROMPT SPESIFIK** sesuai task yang sedang dikerjakan
3. **Sebutkan nama halaman/fitur dengan jelas** supaya AI tidak generik
4. **Kalau AI salah konteks**, ingatkan: *"Ingat, ini untuk AromaSys. Sesuaikan dengan requirement yang sudah dikasih."*
5. **Untuk task yang panjang**, pecah jadi sub-task kecil dan tempel context di setiap prompt baru

---

*File ini dibuat sebagai panduan prompt untuk tim AromaSys. Update seiring perkembangan proyek.*