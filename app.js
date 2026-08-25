(() => {
  const video = document.getElementById("video");
  const canvas = document.getElementById("canvas");
  const countdown = document.getElementById("countdown");
  const captureBtn = document.getElementById("captureBtn");
  const switchBtn = document.getElementById("switchBtn");
  const result = document.getElementById("result");
  const resultImg = document.getElementById("resultImg");
  const downloadBtn = document.getElementById("downloadBtn");
  const againBtn = document.getElementById("againBtn");
  const uploadStatus = document.getElementById("uploadStatus");

  const frameUrl = "frame.png";

  let stream = null;
  let facing = "user";
  let busy = false;


  // =========================
  // MEMBUKA KAMERA
  // =========================
  async function startCamera() {

    // Matikan stream kamera sebelumnya
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      stream = null;
    }

    // Tampilan sementara
    video.srcObject = null;

    try {
      console.log("Membuka kamera...");
      console.log("Mode kamera:", facing);

      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode:
            facing === "user"
              ? { ideal: "user" }
              : { ideal: "environment" },

          width: {
            ideal: 1280
          },

          height: {
            ideal: 720
          }
        },

        audio: false
      });

      console.log("Kamera berhasil dibuka:", stream);

      // Hubungkan stream ke video
      video.srcObject = stream;

      // Pastikan video berjalan
      await video.play();

      console.log("Video berhasil dimainkan");

    } catch (error) {

      console.error("ERROR KAMERA:", error);

      let message = "Kamera tidak dapat dibuka.\n\n";

      if (error.name === "NotAllowedError") {

        message +=
          "Izin kamera ditolak.\n\n" +
          "Klik ikon 🔒 di samping alamat website lalu ubah Kamera menjadi IZINKAN.";

      } else if (error.name === "NotFoundError") {

        message +=
          "Kamera tidak ditemukan.\n\n" +
          "Pastikan webcam terhubung dan aktif.";

      } else if (error.name === "NotReadableError") {

        message +=
          "Kamera sedang digunakan aplikasi lain.\n\n" +
          "Tutup Zoom, Google Meet, WhatsApp, aplikasi Camera Windows, atau aplikasi lain yang menggunakan kamera.";

      } else {

        message +=
          "Error: " +
          error.name +
          "\n\n" +
          error.message;
      }

      alert(message);
    }
  }


  // =========================
  // FUNGSI JEDA
  // =========================
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }


  // =========================
  // COUNTDOWN FOTO
  // =========================
  async function doCountdown() {

    if (!stream) {
      alert("Kamera belum aktif.");
      return;
    }

    busy = true;

    captureBtn.disabled = true;

    for (const n of [3, 2, 1]) {

      countdown.textContent = n;

      await sleep(700);
    }

    countdown.textContent = "📸";

    await sleep(250);

    countdown.textContent = "";

    await composePhoto();

    captureBtn.disabled = false;

    busy = false;
  }


  // =========================
  // MEMBUAT FOTO + FRAME
  // =========================
  async function composePhoto() {

    try {

      const w = video.videoWidth || 1280;
      const h = video.videoHeight || 720;

      canvas.width = w;
      canvas.height = h;

      const ctx = canvas.getContext("2d");


      // =========================
      // FOTO DARI KAMERA
      // =========================

      ctx.save();

      // Mirror kamera depan
      if (facing === "user") {

        ctx.translate(w, 0);

        ctx.scale(-1, 1);
      }

      ctx.drawImage(
        video,
        0,
        0,
        w,
        h
      );

      ctx.restore();


      // =========================
      // LOAD FRAME
      // =========================

      const frame = new Image();

      frame.src = frameUrl;

      await new Promise((resolve, reject) => {

        frame.onload = resolve;

        frame.onerror = () => {
          reject(
            new Error(
              "Frame tidak dapat dimuat: " +
              frameUrl
            )
          );
        };

      });


      // =========================
      // PASANG FRAME
      // =========================

      ctx.drawImage(
        frame,
        0,
        0,
        w,
        h
      );


      // =========================
      // HASIL FOTO
      // =========================

      const dataUrl = canvas.toDataURL(
        "image/jpeg",
        0.92
      );


      // Tampilkan hasil
      resultImg.src = dataUrl;


      // Tombol download
      downloadBtn.href = dataUrl;

      downloadBtn.download =
        `PRATOGA_${new Date()
          .toISOString()
          .replace(/[:.]/g, "-")}.jpg`;


      // Tampilkan area hasil
      result.hidden = false;


      result.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });


      // =========================
      // STATUS UPLOAD
      // =========================

      uploadStatus.textContent =
        "Menyiapkan salinan untuk panitia…";


      // =========================
      // KIRIM FOTO KE GOOGLE DRIVE
      // =========================

      if (
        typeof UPLOAD_ENDPOINT !== "undefined" &&
        UPLOAD_ENDPOINT &&
        UPLOAD_ENDPOINT.trim()
      ) {

        try {

          const base64 =
            dataUrl.split(",")[1];


          const payload = {

            filename:
              downloadBtn.download,

            mimeType:
              "image/jpeg",

            base64:
              base64

          };


          console.log(
            "Mengirim foto ke:",
            UPLOAD_ENDPOINT
          );


          const response =
            await fetch(
              UPLOAD_ENDPOINT,
              {

                method: "POST",

                headers: {
                  "Content-Type":
                    "text/plain;charset=utf-8"
                },

                body:
                  JSON.stringify(payload)

              }
            );


          const responseText =
            await response.text();


          console.log(
            "Response server:",
            responseText
          );


          let data;

          try {

            data =
              JSON.parse(
                responseText
              );

          } catch (e) {

            throw new Error(
              responseText
            );

          }


          if (data.success || data.ok) {

            uploadStatus.textContent =
              "✓ Salinan foto berhasil dikirim ke galeri panitia.";

          } else {

            uploadStatus.textContent =
              "Foto siap di-download, tetapi salinan panitia gagal dikirim.";

            console.error(
              "Upload gagal:",
              data
            );

          }

        } catch (error) {

          console.error(
            "ERROR UPLOAD:",
            error
          );

          uploadStatus.textContent =
            "Foto siap di-download, tetapi salinan panitia gagal dikirim.";

        }

      } else {

        uploadStatus.textContent =
          "✓ Foto siap di-download.";

      }

    } catch (error) {

      console.error(
        "ERROR MEMBUAT FOTO:",
        error
      );

      alert(
        "Terjadi masalah saat membuat foto:\n\n" +
        error.message
      );

    }
  }


  // =========================
  // TOMBOL AMBIL FOTO
  // =========================

  captureBtn.addEventListener(
    "click",
    () => {

      if (!busy) {

        doCountdown();

      }

    }
  );


  // =========================
  // TOMBOL BALIK KAMERA
  // =========================

  switchBtn.addEventListener(
    "click",
    async () => {

      facing =
        facing === "user"
          ? "environment"
          : "user";

      console.log(
        "Ganti kamera ke:",
        facing
      );

      await startCamera();

    }
  );


  // =========================
  // TOMBOL FOTO LAGI
  // =========================

  againBtn.addEventListener(
    "click",
    () => {

      result.hidden = true;

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });

    }
  );


  // =========================
  // CEK DUKUNGAN KAMERA
  // =========================

  if (
    !navigator.mediaDevices ||
    !navigator.mediaDevices.getUserMedia
  ) {

    alert(
      "Browser ini tidak mendukung akses kamera.\n\n" +
      "Gunakan Google Chrome versi terbaru."
    );

  } else {

    // Buka kamera otomatis
    startCamera();

  }


  // =========================
  // MATIKAN KAMERA SAAT PAGE DITUTUP
  // =========================

  window.addEventListener(
    "beforeunload",
    () => {

      if (stream) {

        stream
          .getTracks()
          .forEach(
            track => track.stop()
          );

      }

    }
  );

})();
