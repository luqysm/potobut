# PRD — Ruang Jepret

**Status:** Draft untuk validasi  
**Versi:** 0.2 — visual direction fun/editorial  
**Arah visual:** scrapbook pop, playful, ekspresif; adaptasi prinsip visual dari referensi, bukan salinan komposisi atau aset.
**Produk:** Website photobooth responsif  
**Target awal:** Web app lokal, lalu bisa dipublikasikan melalui HTTPS

## 1. Ringkasan

Ruang Jepret adalah photobooth berbasis web untuk mengambil foto dari kamera perangkat, menambahkan filter sederhana, lalu mengunduh hasilnya. UI menyesuaikan ponsel, tablet, dan desktop. Pada desktop, pengguna juga dapat memakai kamera ponsel sebagai kamera jarak jauh melalui koneksi Wi‑Fi dan WebRTC.

## 2. Masalah

Pengguna ingin photobooth yang mudah dibuka tanpa memasang aplikasi, mendukung kamera laptop maupun ponsel, serta memberi cara praktis memakai kamera HP saat tampilan dan kontrol berada di laptop. Koneksi Bluetooth tidak sesuai untuk mengirim video kamera secara langsung karena bandwidth dan dukungan browser; jalur yang direncanakan adalah WebRTC melalui Wi‑Fi.

## 3. Tujuan dan metrik keberhasilan

### Tujuan
- Pengguna dapat membuka kamera dan mengambil foto di browser modern.
- Alur foto dapat digunakan dengan nyaman pada layar mobile, tablet, dan desktop.
- Foto dapat ditinjau, dihapus, dan diunduh tanpa diunggah ke server.
- Pengguna dapat memasangkan ponsel sebagai kamera live untuk sesi di laptop.

### Metrik keberhasilan MVP
- Pengguna dapat menyelesaikan alur buka kamera → jepret → unduh tanpa bantuan.
- Foto hasil jepret dapat dibuka setelah diunduh dan memiliki orientasi yang benar.
- Layout tetap berfungsi pada lebar 360 px, 768 px, dan 1280 px.
- Izin kamera ditolak/perangkat tanpa kamera menghasilkan instruksi pemulihan yang jelas.
- Mode kamera HP-ke-laptop mengirim video live dengan latensi yang layak pada jaringan Wi‑Fi lokal yang stabil.

## 4. Pengguna dan kebutuhan

1. **Pengguna ponsel:** ingin selfie cepat, mengganti kamera depan/belakang, memakai timer/filter, dan menyimpan foto.
2. **Pengguna laptop:** ingin tampilan photobooth besar, kamera laptop, kontrol sederhana, serta opsi kamera HP dengan kualitas lebih baik.
3. **Pengguna sesi bersama:** ingin mengambil beberapa foto, meninjau hasil, menghapus yang tidak dipakai, lalu mengunduh pilihan.

## 5. Ruang lingkup

### MVP
- Responsive UI untuk mobile, tablet, desktop.
- Akses kamera lokal via `navigator.mediaDevices.getUserMedia`.
- Pemilihan kamera bila tersedia dan pergantian kamera depan/belakang pada ponsel.
- Countdown, tombol jepret, flash visual, dan panduan grid opsional.
- Filter sederhana: natural, hangat, monokrom, pudar.
- Galeri sesi: pratinjau, hapus, unduh foto individual.
- Pemrosesan foto di browser; tidak ada unggahan otomatis.
- Pesan izin, kamera tidak tersedia, browser tidak didukung, dan kamera sedang dipakai aplikasi lain.
- Mode sambungkan kamera HP ke laptop melalui Wi‑Fi menggunakan WebRTC.

### Tidak termasuk MVP
- Akun pengguna, sinkronisasi cloud, penyimpanan permanen di server.
- Pembayaran, watermark berbayar, template cetak kompleks, kolase lanjutan.
- Pairing kamera melalui Bluetooth.
- Rekaman video atau panggilan audio.
- Aplikasi native.

## 6. Alur utama

### A. Mengambil foto dengan kamera perangkat
1. Pengguna membuka halaman pada perangkat yang memiliki kamera.
2. Menekan **Nyalakan kamera** dan menyetujui izin browser.
3. Memilih kamera, filter, dan grid jika diperlukan.
4. Menekan **Ambil foto**; countdown berjalan.
5. Foto tampil pada galeri sesi.
6. Pengguna mengunduh atau menghapus foto.

### B. Memakai kamera ponsel dari laptop
1. Laptop membuka photobooth dan memilih **Sambungkan kamera HP**.
2. Laptop membuat sesi pairing dan menampilkan QR code serta kode pendek.
3. Ponsel dan laptop terhubung ke Wi‑Fi yang sama; pengguna membuka tautan HTTPS dari QR code.
4. Ponsel menyetujui izin kamera dan memilih kamera belakang/depan.
5. Ponsel mengirim video langsung ke laptop melalui WebRTC.
6. Laptop menjadi perangkat kontrol: countdown dan jepret.
7. Foto diambil dari stream, ditampilkan di galeri laptop, lalu diunduh.
8. Pengguna mengakhiri sesi; pairing token dan stream dihentikan.

**Catatan teknis:** Wi‑Fi adalah jaringan transport, WebRTC mengirim media. Untuk negosiasi koneksi diperlukan signaling server ringan (misalnya WebSocket) untuk pertukaran SDP/ICE. Sesi perlu token acak, berumur pendek, dan dibatasi satu kamera ponsel per sesi. Jika jaringan memerlukan relay, TURN server dapat ditambahkan; jangan menjanjikan koneksi peer-to-peer selalu berhasil tanpa TURN.

## 7. Persyaratan fungsional

- **FR-01:** Halaman meminta izin kamera hanya setelah tindakan eksplisit pengguna.
- **FR-02:** Jika izin ditolak, UI menjelaskan cara mengubah izin dan menyediakan retry.
- **FR-03:** App menampilkan preview live dan menjaga orientasi/mirroring preview tetap konsisten dengan hasil foto.
- **FR-04:** Pengguna dapat mengganti kamera yang tersedia tanpa memuat ulang halaman.
- **FR-05:** Timer jepret menampilkan hitung mundur 3–2–1 dan menyediakan cara membatalkan.
- **FR-06:** Filter diterapkan secara konsisten pada preview dan hasil ekspor.
- **FR-07:** Foto sesi dapat ditinjau, dihapus, dan diunduh dalam format JPEG.
- **FR-08:** App tidak mengunggah gambar atau video tanpa tindakan dan persetujuan terpisah.
- **FR-09:** Pairing jarak jauh menampilkan status menunggu, tersambung, kamera aktif, terputus, dan kedaluwarsa.
- **FR-10:** Kode pairing acak, sekali pakai, kedaluwarsa, dan tidak dapat ditebak dengan mudah.
- **FR-11:** Pengguna dapat menghentikan stream; semua track kamera dan koneksi peer ditutup.
- **FR-12:** Jika WebRTC gagal, UI memberi langkah pemulihan dan tetap menyediakan kamera lokal.

## 8. Persyaratan nonfungsional

- **Responsif:** mobile-first; target layout diuji pada 360×800, 768×1024, 1280×800.
- **Kompatibilitas:** versi terbaru Chrome, Edge, Safari, dan Firefox; perilaku kamera diverifikasi per browser.
- **Secure context:** `getUserMedia` memerlukan HTTPS atau `localhost`; akses lewat IP lokal HTTP saja tidak cukup pada kebanyakan browser.
- **Privasi:** media diproses lokal; stream berhenti saat sesi ditutup atau halaman ditinggalkan.
- **Aksesibilitas:** kontrol dapat digunakan dengan keyboard, label aksesibel, fokus terlihat, kontras memadai, dan status dibacakan screen reader.
- **Performa:** preview tidak membuat UI kontrol macet; ukuran ekspor dan resolusi mengikuti kemampuan perangkat.
- **Keamanan:** signaling hanya menerima pesan sesi tervalidasi; gunakan HTTPS/WSS, batasi laju percobaan kode pairing, dan jangan mencatat media atau token sensitif.

## 9. Layout adaptif

- **Ponsel:** preview vertikal dominan; kontrol utama mudah dijangkau ibu jari; galeri berada setelah preview.
- **Tablet:** preview lebar dengan galeri dan kontrol terpisah; kontrol kamera tidak bertumpuk berlebihan.
- **Desktop:** preview utama dan galeri/status di panel samping; pairing kamera HP dapat diakses dari panel kamera.
- Rasio preview mengikuti sensor bila relevan; hasil tidak terpotong tanpa pilihan pengguna.

## 10. Kebutuhan data dan penyimpanan

- Foto sesi berada di memori browser secara default; hilang saat halaman dimuat ulang atau ditutup.
- MVP tidak membutuhkan akun atau database foto.
- Jika kelak ditambahkan penyimpanan lokal persisten, jelaskan batas kapasitas dan beri kontrol hapus semua data.
- Untuk pairing, server signaling hanya menyimpan status sesi sementara dan metadata koneksi minimum; tidak menyimpan frame/video.

## 11. Risiko dan mitigasi

- **Izin kamera ditolak:** tampilkan instruksi per browser dan tombol coba lagi.
- **Tidak ada kamera:** tampilkan keadaan kosong yang jelas dan cara menghubungkan HP.
- **Mixed content / insecure context:** deploy HTTPS; jangan mengandalkan `http://alamat-LAN` untuk kamera ponsel.
- **NAT/firewall menghalangi WebRTC:** siapkan TURN relay sebagai fallback dan uji jaringan yang berbeda.
- **Pairing disalahgunakan:** token acak, kedaluwarsa cepat, satu koneksi kamera, rate limit, tombol putus.
- **Perbedaan kualitas perangkat:** izinkan resolusi adaptif dan sediakan preview/test sebelum sesi.
- **Foto hilang saat tab ditutup:** beri peringatan bahwa unduhan belum otomatis dan sediakan unduh individual.

## 12. Kriteria penerimaan

- Kamera lokal dapat dimulai, dihentikan, dan dimulai kembali tanpa reload.
- Penolakan izin dan ketiadaan perangkat menghasilkan pesan yang dapat ditindaklanjuti.
- Hitung mundur, filter, grid, jepret, hapus, dan unduh dapat digunakan.
- File hasil unduhan dapat dibuka dan tidak terbalik secara tak terduga.
- Layout lolos pemeriksaan pada tiga lebar target dan kontrol utama tidak terpotong.
- Tidak ada media yang dikirim ke server pada mode kamera lokal.
- Pairing HP-ke-laptop berhasil pada jaringan Wi‑Fi yang didukung, menunjukkan status koneksi, dan dapat diputus dari kedua perangkat.
- Kode pairing kedaluwarsa dan koneksi/track kamera berhenti setelah sesi ditutup.

## 13. Tahapan rilis

1. **Prototype lokal:** kamera perangkat, filter, countdown, galeri sementara, unduh; tanpa server.
2. **Web release:** hosting HTTPS dan uji browser/perangkat.
3. **Remote camera:** signaling server, pairing QR/kode, WebRTC, validasi keamanan sesi.
4. **Hardening:** TURN fallback, uji jaringan, aksesibilitas, batas resolusi, dan pengujian privasi.

## 14. Arahan visual dan pengalaman

### 14.1 Inti visual

Photobooth harus terasa seperti meja kolase/stiker yang hidup: ceria, personal, sedikit spontan, tetapi tetap mudah dipakai. Foto kamera menjadi pusat perhatian; dekorasi membingkai pengalaman, bukan menutupi wajah, preview, atau kontrol. Ambil inspirasi dari warna hangat, huruf display ekspresif, bentuk kertas tempel, doodle dan ilustrasi karakter pada referensi. Jangan menyalin halaman, karakter, ilustrasi, lettering, atau layout spesifik dari portofolio referensi.

### 14.2 Palet warna

Gunakan warna solid dan aksen seperti potongan kertas; hindari gradient dekoratif penuh halaman.

- **Cream paper — `#FFF4DE`:** latar utama, memberi rasa kertas hangat.
- **Ink — `#24211D`:** teks utama dan outline; kontras tinggi.
- **Tomato red — `#EF5B45`:** tombol jepret, penanda aksi utama.
- **Cobalt — `#4263D8`:** navigasi, pilihan aktif, aksen dingin.
- **Butter yellow — `#FFD45C`:** bintang, penanda countdown, label kecil.
- **Leaf green — `#85A86A`:** status berhasil/siap, bukan satu-satunya petunjuk status.
- **Lilac — `#B99AE8`:** aksen dekoratif/varian filter.
- **White — `#FFFFFF`:** bingkai foto dan permukaan kartu.

Gunakan tinta gelap pada cream/yellow, putih pada tomato/cobalt hanya setelah kontras teruji. Warna status harus didampingi teks atau ikon. Batasi satu layar pada satu warna aksi dominan ditambah aksen dekoratif.

### 14.3 Tipografi

- **Display/judul:** sans display tebal, bulat, ekspresif dengan bentuk karakter unik. Contoh pilihan lisensi terbuka: `Bricolage Grotesque` atau `Fredoka`; pilih satu setelah uji keterbacaan. Font dapat dimuat lokal atau dari provider web yang disetujui.
- **UI/body:** sans netral dan mudah dibaca seperti `DM Sans`, dengan fallback system sans.
- Pakai judul besar untuk momen/arah layar; instruksi, label, dan pesan error selalu memakai font UI yang jelas.
- Aksen tulisan tangan hanya untuk label singkat, tidak untuk kontrol kritis atau paragraf.
- Selalu sediakan fallback lokal jika font eksternal tidak tersedia.

### 14.4 Bentuk, ikon, tekstur

- Tombol dan chip memakai bentuk rounded tidak seragam secara terkendali: pill, label seperti tiket, atau kotak dengan outline tebal.
- Bingkai foto meniru cetakan instant-photo: ruang putih, sedikit rotasi hanya pada thumbnail/galeri, foto utama tetap tegak dan stabil.
- Gunakan ikon line sederhana dengan stroke tebal dan label teks: kamera, balik kamera, timer, grid, unduh, hapus, flash, QR/pairing.
- Ikon dekoratif dapat berupa bintang, kilau, panah coret, garis gerak, pita, potongan tape, dan stiker bentuk geometris. Ikon kontrol harus konsisten, tidak diganti doodle ambigu.
- Tekstur kertas/noise opsional, sangat halus, tidak mengurangi kontras atau performa.

### 14.5 Karakter brand

Buat satu karakter maskot orisinal bernama **Jep**: makhluk kecil berbentuk kamera saku dengan kaki mungil dan ekspresi wajah sederhana pada lensa. Siluet geometris dan palet terbatas (cream, tinta, tomato, satu warna aksen); hindari detail yang mengganggu foto.

- Saat idle: Jep mengintip dari bingkai foto atau memegang papan kecil berisi instruksi.
- Saat kamera siap: Jep memberi pose/gesture jempol singkat.
- Saat countdown: Jep menampilkan angka atau pose bersiap, tanpa menutupi preview.
- Saat foto berhasil: Jep muncul sebentar di sisi hasil sebagai reaksi.
- Saat kamera gagal: Jep menunjukkan pesan bantuan dan tindakan retry, tanpa menyalahkan pengguna.
- Hormati `prefers-reduced-motion`; animasi berhenti atau beralih ke pose statis.
- Maskot bersifat dekoratif kecuali pada empty/error state; tetap sediakan pesan teks dan jangan menjadikan karakter satu-satunya pembawa informasi.

Karakter adalah aset baru yang dibuat khusus untuk produk; jangan menjiplak karakter dari gambar referensi.

### 14.6 Animasi dan respons kontrol

- **Masuk sesi:** elemen utama muncul dengan gerak pendek seperti kartu foto ditaruh di meja (sekitar 180–280 ms), tanpa intro yang menghambat.
- **Countdown:** angka besar muncul/mengecil satu per satu; bunyi hanya jika pengguna mengaktifkannya.
- **Jepret:** flash putih singkat dan gerakan shutter kecil; jangan berkedip berulang atau berintensitas tinggi.
- **Foto baru:** kartu hasil masuk ke galeri dengan sedikit gerak/rotasi lalu stabil.
- **Hover/focus:** tombol memberi respons warna/tekan yang jelas; semua state tersedia juga untuk keyboard dan sentuhan.
- **Pairing:** QR/kode dan status memakai transisi ringan; status penting berubah langsung tanpa animasi panjang.
- Batasi animasi kontinu; hormati `prefers-reduced-motion` dan hindari parallax yang mengganggu.

### 14.7 Penggunaan warna/font per perangkat

- **Mobile:** headline pendek, tombol jepret tomato ukuran sentuh minimal 44×44 px; maskot kecil di luar area wajah.
- **Tablet:** komposisi seperti meja kolase dengan preview tetap dominan, galeri beberapa foto, dekorasi lebih terlihat.
- **Desktop:** panel preview besar dan galeri samping; gunakan ruang kosong agar bentuk stiker tidak membuat UI berantakan.
- Pada semua ukuran, jaga kontras teks, hirarki yang konsisten, dan fokus visual pada preview/foto.

### 14.8 Kriteria penerimaan visual

- Arah visual terasa playful dan kolase melalui warna, bentuk, tipografi, serta karakter orisinal; bukan hanya memakai gradient atau kartu generik.
- Font display tidak dipakai pada paragraf instruksi atau pesan error.
- Ikon kontrol punya label/accessible name, fokus keyboard terlihat, target sentuh sekurangnya 44×44 px.
- Maskot dan ornamen tidak menutupi wajah, tombol, countdown, QR, atau status kamera.
- Animasi utama dapat dimatikan/dikurangi melalui preferensi sistem.
- Screenshot pada viewport 360 px, 768 px, dan 1280 px tetap terbaca; foto menjadi titik fokus pada ketiganya.
- Palet diuji untuk kontras; warna tidak menjadi satu-satunya pembeda state.

## 15. Pertanyaan terbuka

- Apakah sesi photobooth perlu menyimpan foto setelah browser ditutup, atau unduh manual sudah cukup?
- Berapa lama sesi pairing kamera HP perlu aktif sebelum otomatis kedaluwarsa?
- Apakah kebutuhan utamanya foto portrait untuk selfie atau format strip photobooth/cetak?
- Apakah mode HP-ke-laptop harus mendukung internet/jaringan berbeda, atau cukup satu Wi‑Fi lokal?
- Apakah nama maskot “Jep” cocok, atau pengguna ingin nama lain?
- Apakah font boleh dimuat dari Google Fonts saat online, atau harus bundled/lokal untuk mendukung offline?
- Apakah ada preferensi untuk jumlah/ukuran doodle dan intensitas animasi?

## 16. Referensi visual

- Gambar referensi yang dikirim pengguna: arah scrapbook pop, latar kertas hangat, judul tebal berwarna, aksen doodle, karakter kartun, label seperti stiker.
- Adaptasi dibatasi pada prinsip visual umum; hindari reproduksi artwork/layout spesifik.
- Referensi aksesibilitas: WCAG 2.2 AA untuk kontras, keyboard, fokus, dan gerak yang dapat dikurangi.

## 17. Dampak terhadap prototype yang sudah ada

Prototype `index.html` yang tersedia saat ini memakai tema gelap editorial. Tema tersebut tidak memenuhi arahan visual di versi PRD ini dan perlu dirombak sebelum dianggap sesuai. Prototype hanya membuktikan alur kamera lokal dasar; pairing WebRTC, karakter Jep, dan sistem scrapbook masih berupa persyaratan desain/produk, belum implementasi.


