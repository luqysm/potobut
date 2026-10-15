# Prompt Antigravity — Frontend Specialist

Pilih agent `frontend-specialist`, buka workspace `C:\Users\Luqy\Documents\Programming\photobooth`, lalu lampirkan/export hasil Google Stitch. Salin prompt ini ke Antigravity.

```text
Kamu bertindak sebagai frontend specialist. Implementasikan website photobooth Ruang Jepret di workspace ini.

BACA SEBELUM MENGUBAH KODE
- Baca `PRD.md` untuk kebutuhan dan kriteria penerimaan.
- Baca `DESIGN.md` sebagai sumber kebenaran warna, tipografi, komponen, responsivitas, karakter, dan strip.
- Baca desain/screenshot/kode hasil Stitch yang saya lampirkan. Ikuti desain terpilih; jika bertentangan, gunakan urutan prioritas: keputusan eksplisit terbaru saya, PRD untuk perilaku, DESIGN.md untuk visual tokens, lalu Stitch untuk komposisi.
- Periksa file dan stack proyek yang ada sebelum mengubah apa pun. Jangan timpa atau hapus file yang tidak terkait. Pertahankan stack/dependency yang sudah ada; jangan menambah dependency tanpa kebutuhan yang jelas.

TARGET IMPLEMENTASI
Buat UI web photobooth responsif untuk mobile, tablet, dan desktop yang mengikuti desain Stitch dan DESIGN.md. Kamera lokal berfungsi. Pengguna bisa memilih output strip 3 foto atau 4 foto; pilihan memengaruhi jumlah foto yang harus diambil dan preview strip final. Foto dapat diambil, ditinjau, diulang/dihapus, disusun sesuai template terpilih, dan diunduh sebagai satu gambar strip.

FITUR
1. Minta izin kamera hanya setelah tindakan eksplisit pengguna; gunakan API kamera browser yang sesuai dan pastikan preview memakai `playsinline` di mobile.
2. Tampilkan state izin belum diberikan, kamera aktif, error izin/perangkat, countdown, hasil jepretan, serta retry yang jelas.
3. Kamera tersedia: pemilih kamera dan flip depan/belakang; sediakan kontrol timer, grid opsional, filter natural/hangat/monokrom/pudar.
4. Shutter dengan countdown 3-2-1. Setelah foto diambil, pengguna dapat melihat hasil, mengulang foto slot tersebut, atau menghapus/mengambil ulang sebelum finalisasi.
5. Buat selector yang jelas untuk “3 foto” dan “4 foto”. Ketika dipilih, tampilkan 3 atau 4 slot dan preview strip dengan jumlah frame yang sama. Jangan menyamakan jumlah frame dengan banyaknya file strip.
6. Rangkai foto pilihan ke satu file strip vertikal beresolusi layak; pertahankan orientasi dan filter yang tampak di preview. Beri unduh strip final dan, bila sederhana, unduh foto individual.
7. Galeri sesi sementara; tampilkan jumlah/thumbnail dan aksi hapus. Jelaskan bahwa foto belum tersimpan permanen sampai diunduh.
8. Maskot orisinal Jep dan ikon mengikuti DESIGN.md; dekorasi tidak boleh menutupi wajah, kontrol, status, countdown, atau QR. Implementasikan animasi ringan dan hormati `prefers-reduced-motion`.
9. Kamera HP-ke-laptop: pada tahap ini buat UI/status pairing sesuai desain Stitch saja, dengan keterangan bahwa perlu layanan pairing. Jangan membuat pairing palsu dan jangan mengklaim WebRTC berfungsi. Siapkan batas komponen yang bersih agar fitur WebRTC dapat ditambahkan nanti, tanpa membangun server kecuali diminta.
10. Data foto diproses lokal di browser dan tidak diunggah. Hentikan semua media tracks saat kamera dimatikan/halaman ditinggalkan.

RESPONSIVE / A11Y
- Uji layout setidaknya pada lebar 360px, 768px, dan 1280px.
- Mobile: preview portrait dominan, shutter mudah dijangkau, strip chooser dan hasil tetap dapat digunakan.
- Tablet: preview dan controls seimbang.
- Desktop: preview besar, galeri/setting strip di panel pendamping.
- Gunakan semantic HTML, accessible names, visible keyboard focus, status non-color-only, touch target minimal 44x44px, kontras WCAG AA, dan reduced motion.

URUTAN KERJA
1. Inspeksi repo dan desain Stitch; rangkum file/struktur yang akan disentuh.
2. Implementasikan alur dasar dan seluruh UI utama tanpa mengarang fitur backend.
3. Jalankan proyek secara lokal menggunakan cara yang cocok dengan stack repo.
4. Tes sungguhan: buka kamera bila lingkungan/browser mengizinkan; cek izin error; pilih 3 foto lalu ambil hingga strip dapat diunduh; ulangi untuk 4 foto; tes hapus/retake; tes responsive breakpoints; cek console dan syntax/type errors.
5. Perbaiki isu yang ditemukan. Jangan berhenti setelah menulis halaman statis atau hanya satu screenshot.
6. Laporkan file yang berubah, perintah menjalankan lokal, URL lokal, hasil tes yang benar-benar dijalankan, dan batasan yang tersisa. Jangan klaim kamera atau pairing terverifikasi bila tidak diuji.

BATASAN
- Jangan melakukan redesign yang menyimpang dari Stitch/DESIGN.md tanpa alasan aksesibilitas atau keterbatasan teknis; jelaskan jika perlu.
- Jangan menyalin artwork, karakter, atau komposisi persis dari gambar referensi.
- Jangan implementasikan login, upload, cloud storage, pembayaran, analytics, atau pairing WebRTC server di luar scope.
- Jangan menghapus data/file pengguna.
```
