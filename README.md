# Ruang Jepret — Photobooth

Website photobooth pop scrapbook. Foto strip 3 atau 4 frame, tema Snap On, Sukhakala, Market Strip & Polaroid. Semua foto diproses lokal di browser, tidak ada upload.

## Cara pakai
Buka `index.html` langsung di browser, atau serve via HTTP server.

## Frame sendiri ("Frame saya")
Frame memakai `assets/tes-strips.png`. Gambar itu di-embed ke `js/frame-asset.js`
sebagai data URL, karena kalau `index.html` dibuka langsung dari disk (file://),
`<img src="assets/...">` membuat canvas jadi *tainted* dan `toDataURL()` gagal —
itu sebabnya pratinjau dan unduhan strip jadi kosong.

Setelah mengganti PNG-nya, jalankan ulang:

```bash
python -c "import base64;b=base64.b64encode(open('assets/tes-strips.png','rb').read()).decode();open('js/frame-asset.js','w').write('window.FRAME_ASSET_B64=\'%s\';\n'%b)"
```

Kalau ukuran atau posisi jendela foto di PNG berubah, sesuaikan `customArt`
(`w`, `h`, dan `windows`) di `js/strip-renderer.js`. Ekspor PNG di ukuran lebih
besar (misal 1200×3600) supaya hasil unduhan lebih tajam.

## Stack
- HTML + Vanilla CSS + Vanilla JavaScript
- Tanpa framework, tanpa dependency npm

## Deploy
- **Netlify Drop**: drag & drop folder ke [netlify.com/drop](https://netlify.com/drop)
- **Vercel**: `npx vercel --prod`
- **GitHub Pages**: push ke GitHub → Settings → Pages → Deploy from branch
