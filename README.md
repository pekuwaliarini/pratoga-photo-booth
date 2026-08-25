# PRATOGA Digital Photo Booth — GRATIS / Rp0

Versi ini TIDAK memakai Firebase Storage dan tidak membutuhkan kartu kredit.

## Fitur
- Kamera HP
- Balik kamera
- Countdown 3–2–1
- Frame PRATOGA
- Download hasil JPG
- Siap di-host gratis di GitHub Pages
- Opsional: salinan otomatis ke Google Drive panitia melalui Google Apps Script

## A. Uji dulu di laptop
Buka folder di VS Code lalu jalankan:
`python -m http.server 8000`
Buka:
`http://localhost:8000/`

## B. Hosting gratis GitHub Pages
1. Login ke GitHub.
2. Buat repository: `pratoga-photo-booth`
3. Upload seluruh isi folder ini ke repository.
4. Settings → Pages → Deploy from branch → `main` → `/ (root)`.
5. GitHub akan memberi URL, misalnya:
`https://USERNAME.github.io/pratoga-photo-booth/`

Gunakan URL tersebut untuk QR Code.

## C. Agar salinan foto masuk ke Google Drive panitia (gratis)
1. Buka Google Drive dan buat folder bernama `PRATOGA_FOTO_2026`.
2. Buka https://script.google.com/ → New project.
3. Tempel kode berikut:

const FOLDER_NAME = 'PRATOGA_FOTO_2026';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const it = DriveApp.getFoldersByName(FOLDER_NAME);
    const folder = it.hasNext() ? it.next() : DriveApp.createFolder(FOLDER_NAME);
    const bytes = Utilities.base64Decode(data.base64);
    const blob = Utilities.newBlob(bytes, data.mimeType || 'image/jpeg',
      data.filename || ('PRATOGA_' + Date.now() + '.jpg'));
    const file = folder.createFile(blob);
    return ContentService.createTextOutput(JSON.stringify({
      ok:true, id:file.getId(), name:file.getName()
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      ok:false, error:String(err)
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

4. Deploy → New deployment → Web app.
5. Execute as: Me.
6. Who has access: Anyone.
7. Deploy dan copy Web App URL.
8. Buka `config.js`.
9. Isi:
`const UPLOAD_ENDPOINT = "URL_WEB_APP_ANDA";`
10. Upload ulang file ke GitHub.

Catatan: Apps Script + Drive memiliki kuota layanan Google. Untuk acara dengan ratusan foto ukuran kecil/menengah biasanya jauh lebih praktis daripada membeli server, tetapi kuota Google tetap berlaku.

## D. QR
QR cukup diarahkan ke halaman utama GitHub Pages:
`https://USERNAME.github.io/pratoga-photo-booth/`

Setelah acara selesai, Anda dapat menonaktifkan Web App Apps Script bila tidak ingin menerima upload lagi.

## E. Penting
Kamera browser membutuhkan HTTPS atau localhost. GitHub Pages menyediakan HTTPS.
