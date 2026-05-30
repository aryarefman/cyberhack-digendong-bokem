# Requirements Document

## Introduction

Dokumen ini mendefinisikan kebutuhan perbaikan dan peningkatan fitur untuk aplikasi AromaSys Warehouse Management System. AromaSys adalah aplikasi berbasis Next.js (App Router) yang digunakan untuk manajemen gudang pabrik aroma/parfum, mencakup tracking inventori, FIFO & expiry monitoring, cold-chain monitoring, dan audit trail. Perbaikan ini mencakup 7 area utama: pagination fungsional, dashboard informatif, foto profil di audit trail, notification badge dinamis, detail card inventori, landing page branding, dan overlay teks di halaman autentikasi.

## Glossary

- **Sistem_Pagination**: Komponen pagination pada halaman FIFO & Expiry yang mengatur navigasi antar halaman data
- **Sistem_Dashboard**: Halaman dashboard utama yang menampilkan ringkasan statistik dan informasi gudang
- **Sistem_Profil**: Halaman pengaturan profil pengguna yang mengelola data akun dan avatar
- **Sistem_AuditTrail**: Halaman log aktivitas sistem yang menampilkan riwayat aksi pengguna
- **Sistem_Notifikasi**: Komponen notification badge dan dropdown di topbar layout dashboard
- **Sistem_Inventori**: Halaman master data inventori yang menampilkan daftar bahan baku
- **Sistem_Landing**: Halaman utama (landing page) yang ditampilkan sebelum login
- **Sistem_Auth**: Halaman Sign-in dan Sign-up untuk autentikasi pengguna
- **PAGE_SIZE**: Jumlah item yang ditampilkan per halaman, yaitu 10 item
- **Avatar**: Foto profil pengguna yang disimpan sebagai string base64 di database
- **Detail_Card**: Modal/card melayang yang menampilkan informasi lengkap item inventori
- **Notification_Badge**: Indikator angka merah pada ikon lonceng yang menunjukkan jumlah notifikasi belum dibaca

## Requirements

### Requirement 1: Pagination Fungsional di Halaman FIFO & Expiry

**User Story:** Sebagai operator gudang, saya ingin bisa berpindah halaman di tabel FIFO & Expiry, sehingga saya dapat melihat semua data inventori secara terorganisir tanpa scroll panjang.

#### Acceptance Criteria

1. WHEN pengguna membuka halaman FIFO & Expiry, THE Sistem_Pagination SHALL menampilkan maksimal 10 item per halaman dan menampilkan halaman pertama sebagai halaman aktif
2. WHEN pengguna mengklik tombol nomor halaman, THE Sistem_Pagination SHALL menampilkan 10 item (atau sisa item pada halaman terakhir) sesuai offset halaman yang dipilih, dan menandai tombol halaman tersebut sebagai aktif secara visual
3. WHEN pengguna mengklik tombol "Next" (>), THE Sistem_Pagination SHALL berpindah ke halaman berikutnya dan memperbarui indikator halaman aktif
4. WHEN pengguna mengklik tombol "Previous" (<), THE Sistem_Pagination SHALL berpindah ke halaman sebelumnya dan memperbarui indikator halaman aktif
5. WHILE pengguna berada di halaman pertama, THE Sistem_Pagination SHALL menonaktifkan tombol "Previous" sehingga tombol tidak dapat diklik
6. WHILE pengguna berada di halaman terakhir, THE Sistem_Pagination SHALL menonaktifkan tombol "Next" sehingga tombol tidak dapat diklik
7. WHEN data difilter melalui pencarian, filter zona, atau filter kategori, THE Sistem_Pagination SHALL mereset ke halaman pertama dan menghitung ulang jumlah halaman berdasarkan jumlah hasil filter
8. THE Sistem_Pagination SHALL menampilkan informasi "Showing X to Y of Z entries" di mana X adalah indeks item pertama di halaman aktif (dimulai dari 1), Y adalah indeks item terakhir di halaman aktif, dan Z adalah jumlah total item hasil filter
9. IF jumlah item hasil filter kurang dari atau sama dengan 10, THEN THE Sistem_Pagination SHALL menyembunyikan kontrol pagination karena semua data cukup ditampilkan dalam satu halaman
10. IF jumlah item hasil filter adalah 0, THEN THE Sistem_Pagination SHALL menyembunyikan seluruh area pagination dan menampilkan pesan kosong

### Requirement 2: Dashboard Informatif dengan Visualisasi Data

**User Story:** Sebagai manajer gudang, saya ingin melihat informasi yang lebih lengkap di dashboard, sehingga saya dapat memantau kondisi gudang secara menyeluruh dalam satu tampilan.

#### Acceptance Criteria

1. THE Sistem_Dashboard SHALL menampilkan grafik tren stok mingguan berupa line chart yang menunjukkan total jumlah item aktif (non-expired) per hari selama 7 hari terakhir, dengan sumbu X menampilkan tanggal dan sumbu Y menampilkan jumlah item
2. THE Sistem_Dashboard SHALL menampilkan ringkasan zona gudang untuk setiap zona (A, B, C, D, E) yang mencakup jumlah item tersimpan dan persentase kapasitas terpakai berdasarkan jumlah slot terisi dibagi total slot per zona
3. THE Sistem_Dashboard SHALL menampilkan alert expiry terdekat berupa daftar maksimal 5 item non-expired dengan tanggal kedaluwarsa paling dekat, yang menampilkan nama item, lokasi zona, dan jumlah hari tersisa sebelum kedaluwarsa
4. IF jumlah item non-expired yang tersedia kurang dari 5, THEN THE Sistem_Dashboard SHALL menampilkan hanya item yang tersedia pada daftar alert expiry terdekat
5. THE Sistem_Dashboard SHALL menampilkan quick stats yang mencakup total kategori bahan yang terdaftar, rata-rata sisa hari sebelum kedaluwarsa dihitung dari seluruh item non-expired, dan jumlah item berstatus expired
6. WHEN halaman dashboard dimuat atau dimuat ulang, THE Sistem_Dashboard SHALL mengambil data inventori terbaru dari server dan memperbarui seluruh visualisasi (grafik tren, ringkasan zona, alert expiry, dan quick stats) dalam waktu maksimal 3 detik
7. IF pengambilan data dari server gagal, THEN THE Sistem_Dashboard SHALL menampilkan pesan error yang menginformasikan kegagalan koneksi dan menyediakan tombol untuk mencoba ulang pengambilan data

### Requirement 3: Upload Foto Profil dan Tampilan di Audit Trail

**User Story:** Sebagai pengguna sistem, saya ingin mengunggah foto profil, sehingga identitas saya terlihat jelas di audit trail dan memudahkan identifikasi aktivitas.

#### Acceptance Criteria

1. WHEN pengguna membuka tab Account di halaman Profile, THE Sistem_Profil SHALL menampilkan area upload foto profil dengan preview gambar saat ini (foto yang sudah tersimpan, atau inisial nama jika belum ada foto)
2. WHEN pengguna memilih file gambar, THE Sistem_Profil SHALL menampilkan preview gambar yang dipilih dalam area berukuran maksimal 150x150 piksel sebelum disimpan
3. WHEN pengguna menyimpan foto profil, THE Sistem_Profil SHALL mengkonversi gambar ke format base64, menyimpannya ke kolom avatar di tabel users, dan menampilkan pesan konfirmasi bahwa foto berhasil disimpan
4. IF file yang diunggah bukan format gambar (JPG, PNG, GIF), THEN THE Sistem_Profil SHALL menampilkan pesan error yang menjelaskan format yang didukung dan tidak menyimpan file tersebut
5. IF ukuran file melebihi 2MB, THEN THE Sistem_Profil SHALL menampilkan pesan error yang menjelaskan batas ukuran maksimal 2MB dan tidak menyimpan file tersebut
6. THE Sistem_AuditTrail SHALL menampilkan foto profil (avatar) berukuran 32x32 piksel di samping nama pengguna pada setiap entri log
7. WHEN pengguna belum mengunggah foto profil, THE Sistem_AuditTrail SHALL menampilkan inisial nama (huruf pertama dari nama pengguna dalam huruf kapital) sebagai placeholder avatar dengan ukuran 32x32 piksel
8. IF proses penyimpanan foto profil gagal karena kesalahan server atau jaringan, THEN THE Sistem_Profil SHALL menampilkan pesan error yang menjelaskan kegagalan penyimpanan dan mempertahankan foto profil sebelumnya tanpa perubahan

### Requirement 4: Notification Badge Dinamis dan Sinkronisasi

**User Story:** Sebagai pengguna sistem, saya ingin notification badge menunjukkan jumlah notifikasi yang akurat dan hilang saat sudah dibaca, sehingga saya tahu kapan ada informasi baru yang perlu diperhatikan.

#### Acceptance Criteria

1. THE Sistem_Notifikasi SHALL menampilkan badge dengan jumlah notifikasi yang belum dibaca secara dinamis, dihitung dari notifikasi dengan status isRead=false
2. WHEN jumlah notifikasi belum dibaca adalah 0, THE Sistem_Notifikasi SHALL menyembunyikan badge angka dari ikon lonceng sepenuhnya
3. WHEN pengguna mengklik "Mark All as Read", THE Sistem_Notifikasi SHALL mengubah status semua notifikasi menjadi isRead=true dan menghilangkan badge angka dari ikon lonceng
4. WHEN ada notifikasi baru ditambahkan, THE Sistem_Notifikasi SHALL memperbarui angka badge sesuai jumlah notifikasi belum dibaca tanpa perlu refresh halaman
5. THE Sistem_Notifikasi SHALL menyinkronkan status baca notifikasi antara dropdown di topbar dan halaman /settings/notifications menggunakan shared state (React Context atau state management)
6. WHEN pengguna menandai notifikasi sebagai dibaca di halaman /settings/notifications, THE Sistem_Notifikasi SHALL memperbarui badge di topbar dalam waktu kurang dari 1 detik tanpa perlu refresh halaman
7. IF jumlah notifikasi belum dibaca melebihi 99, THEN THE Sistem_Notifikasi SHALL menampilkan "99+" pada badge

### Requirement 5: Detail Card Inventori dengan Gambar

**User Story:** Sebagai operator gudang, saya ingin melihat detail lengkap item inventori dalam card melayang, sehingga saya dapat memeriksa informasi item tanpa meninggalkan halaman daftar.

#### Acceptance Criteria

1. WHEN pengguna mengklik baris item di tabel inventori, THE Sistem_Inventori SHALL menampilkan modal (detail card) dengan informasi lengkap item dalam waktu maksimal 2 detik setelah klik
2. THE Sistem_Inventori SHALL menampilkan informasi berikut di detail card: gambar item (maksimal 300x300 piksel area tampilan), nama, kategori, kuantitas, unit, lokasi, tanggal masuk, tanggal expiry, dan status
3. WHEN item belum memiliki gambar yang diunggah, THE Sistem_Inventori SHALL menampilkan gambar placeholder berupa ikon generik yang berbeda untuk setiap kategori item (Tepung, Gula, Minyak, Pewarna, Essence, Pengawet, Susu, Cokelat, Rempah, Kimia)
4. WHERE fitur upload gambar diaktifkan, THE Sistem_Inventori SHALL menyediakan tombol upload di detail card yang hanya menerima file dengan format JPEG, PNG, atau WebP dengan ukuran maksimal 2 MB
5. WHEN pengguna mengunggah gambar item yang valid (format JPEG/PNG/WebP, ukuran ≤ 2 MB), THE Sistem_Inventori SHALL menyimpan gambar sebagai base64 dan menampilkannya di detail card menggantikan placeholder
6. IF pengguna mengunggah file yang tidak valid (format selain JPEG/PNG/WebP atau ukuran > 2 MB), THEN THE Sistem_Inventori SHALL menolak unggahan dan menampilkan pesan error yang menjelaskan alasan penolakan (format tidak didukung atau ukuran melebihi batas)
7. WHEN pengguna mengklik area di luar modal atau tombol close, THE Sistem_Inventori SHALL menutup detail card dan mengembalikan fokus ke baris item yang sebelumnya diklik

### Requirement 6: Landing Page Sesuai Branding AromaSys

**User Story:** Sebagai pengunjung baru, saya ingin melihat landing page yang menjelaskan produk AromaSys dengan jelas, sehingga saya memahami fungsi dan manfaat sistem sebelum mendaftar.

#### Acceptance Criteria

1. THE Sistem_Landing SHALL menampilkan heading yang mengandung nama "AromaSys" dan menyebutkan fungsinya sebagai warehouse management system untuk pabrik aroma dan parfum
2. THE Sistem_Landing SHALL menampilkan deskripsi dengan panjang maksimal 200 karakter yang menyebutkan minimal 3 fitur utama sistem (dari: manajemen inventori, cold-chain monitoring, FIFO & expiry tracking, digital twin denah gudang, atau copilot AI)
3. THE Sistem_Landing SHALL menggunakan gambar login_bg.png dari folder /public/ sebagai background image yang menutupi area halaman secara penuh (cover)
4. THE Sistem_Landing SHALL menampilkan tombol navigasi berlabel "Sign In" yang mengarah ke halaman /login dan tombol berlabel "Sign Up" yang mengarah ke halaman /register
5. IF pengguna sudah terautentikasi, THEN THE Sistem_Landing SHALL mengarahkan pengguna secara otomatis ke halaman /dashboard dalam waktu maksimal 2 detik
6. THE Sistem_Landing SHALL menampilkan seluruh konten dalam bahasa Indonesia

### Requirement 7: Overlay Teks di Halaman Autentikasi

**User Story:** Sebagai pengguna baru, saya ingin melihat tagline inspiratif di halaman login dan register, sehingga saya mendapat kesan profesional tentang sistem AromaSys.

#### Acceptance Criteria

1. WHEN halaman Sign-in dimuat, THE Sistem_Auth SHALL menampilkan teks overlay berupa tagline pada panel gambar (menggunakan login_bg.png), diposisikan di area bawah panel gambar dengan z-index di atas lapisan overlay gelap
2. WHEN halaman Sign-up dimuat, THE Sistem_Auth SHALL menampilkan teks overlay berupa tagline pada panel gambar (menggunakan register_bg.png), diposisikan di area bawah panel gambar dengan z-index di atas lapisan overlay gelap
3. THE Sistem_Auth SHALL menampilkan tagline bertema warehouse management pada kedua halaman autentikasi, dengan panjang teks antara 3 hingga 8 kata, menggunakan bahasa Inggris
4. THE Sistem_Auth SHALL menampilkan teks overlay dengan ukuran font minimum 48px, font-weight 600, dan warna teks yang memiliki rasio kontras minimal 4.5:1 terhadap latar belakang gambar (menggunakan text-shadow atau semi-transparent backdrop untuk memastikan keterbacaan)
5. IF lebar viewport kurang dari atau sama dengan 1024px, THEN THE Sistem_Auth SHALL menyembunyikan panel gambar beserta teks overlay-nya

### Requirement 8: Migrasi Database untuk Kolom Avatar

**User Story:** Sebagai developer, saya ingin skema database mendukung penyimpanan avatar pengguna, sehingga fitur foto profil dapat berfungsi dengan benar.

#### Acceptance Criteria

1. THE Sistem_Profil SHALL menambahkan kolom avatar bertipe TEXT dengan nilai default NULL pada tabel users di script init-db.js, dengan batas maksimum data base64 sebesar 2MB (sekitar 2.796.202 karakter)
2. WHEN kolom avatar bernilai NULL, THE Sistem_Profil SHALL mengembalikan nilai avatar sebagai null pada response API profil sehingga klien dapat menampilkan placeholder default
3. WHEN pengguna mengirim request GET ke API endpoint profil dengan parameter userId yang valid, THE Sistem_Profil SHALL mengembalikan data avatar (base64 string atau null) sebagai bagian dari response objek user
4. WHEN pengguna mengirim request PUT ke API endpoint profil dengan field avatar berisi string base64 yang valid (diawali dengan prefix data URI format "data:image/[png|jpeg|webp];base64,"), THE Sistem_Profil SHALL menyimpan data avatar ke kolom avatar pada tabel users untuk userId yang bersangkutan
5. IF data avatar yang dikirim melebihi 2MB atau tidak memiliki format base64 data URI yang valid, THEN THE Sistem_Profil SHALL menolak request dengan response error yang mengindikasikan alasan penolakan dan status HTTP 400
