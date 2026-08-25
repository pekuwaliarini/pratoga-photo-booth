(() => {

  const video =
    document.getElementById("video");

  const canvas =
    document.getElementById("canvas");

  const countdown =
    document.getElementById("countdown");

  const captureBtn =
    document.getElementById("captureBtn");

  const switchBtn =
    document.getElementById("switchBtn");

  const result =
    document.getElementById("result");

  const resultImg =
    document.getElementById("resultImg");

  const downloadBtn =
    document.getElementById("downloadBtn");

  const againBtn =
    document.getElementById("againBtn");


  const FRAME_URL = "frame.png";


  let stream = null;

  let facingMode = "user";

  let busy = false;


  /* =========================
     LOAD FRAME
  ========================= */

  const frame = new Image();

  frame.src = FRAME_URL;


  frame.onerror = () => {

    alert(
      "Frame tidak dapat dimuat.\n\n" +
      "Pastikan file frame.png berada di folder yang sama dengan index.html."
    );

  };



  /* =========================
     START CAMERA
  ========================= */

  async function startCamera() {

    try {

      captureBtn.disabled = true;

      captureBtn.textContent =
        "⏳ Membuka Kamera...";


      if (stream) {

        stream
          .getTracks()
          .forEach(
            track => track.stop()
          );

        stream = null;

      }


      video.srcObject = null;


      const constraints = {

        video: {

          facingMode: {
            ideal: facingMode
          },

          width: {
            ideal: 1920
          },

          height: {
            ideal: 1080
          }

        },

        audio: false

      };


      stream =
        await navigator
          .mediaDevices
          .getUserMedia(
            constraints
          );


      video.srcObject = stream;


      await video.play();


      /* Mirror hanya untuk preview kamera depan */

      if (
        facingMode === "user"
      ) {

        video.classList.add(
          "front-camera"
        );

      } else {

        video.classList.remove(
          "front-camera"
        );

      }


      captureBtn.disabled = false;

      captureBtn.textContent =
        "📸 Ambil Foto";


    } catch (error) {

      console.error(
        "CAMERA ERROR:",
        error
      );


      captureBtn.disabled = false;

      captureBtn.textContent =
        "📸 Ambil Foto";


      let message =
        "Kamera tidak dapat dibuka.\n\n";


      if (
        error.name ===
        "NotAllowedError"
      ) {

        message +=
          "Izin kamera belum diberikan.\n\n" +
          "Klik ikon kamera atau ikon kunci di samping alamat website, lalu pilih IZINKAN kamera.";

      }

      else if (
        error.name ===
        "NotFoundError"
      ) {

        message +=
          "Kamera tidak ditemukan.\n\n" +
          "Pastikan perangkat memiliki kamera.";

      }

      else if (
        error.name ===
        "NotReadableError"
      ) {

        message +=
          "Kamera sedang digunakan aplikasi lain.\n\n" +
          "Tutup Zoom, Google Meet, WhatsApp, Camera, atau aplikasi lain.";

      }

      else {

        message +=
          error.name +
          "\n\n" +
          error.message;

      }


      alert(
        message
      );

    }

  }



  /* =========================
     SLEEP
  ========================= */

  function sleep(ms) {

    return new Promise(
      resolve =>
        setTimeout(
          resolve,
          ms
        )
    );

  }



  /* =========================
     COUNTDOWN
  ========================= */

  async function takePhoto() {

    if (busy) {
      return;
    }


    if (!stream) {

      alert(
        "Kamera belum aktif."
      );

      return;

    }


    busy = true;


    captureBtn.disabled = true;

    switchBtn.disabled = true;


    for (
      const number of [3, 2, 1]
    ) {

      countdown.textContent =
        number;

      await sleep(800);

    }


    countdown.textContent =
      "📸";


    await sleep(250);


    countdown.textContent =
      "";


    await createPhoto();


    captureBtn.disabled = false;

    switchBtn.disabled = false;

    busy = false;

  }



  /* =========================
     CREATE PHOTO
  ========================= */

  async function createPhoto() {

    try {

      if (!frame.complete) {

        await new Promise(
          (resolve, reject) => {

            frame.onload =
              resolve;

            frame.onerror =
              reject;

          }
        );

      }


      /*
       * Gunakan ukuran asli frame.
       *
       * Ini penting agar frame tidak
       * stretch atau rusak di HP.
       */

      const outputWidth =
        frame.naturalWidth;

      const outputHeight =
        frame.naturalHeight;


      canvas.width =
        outputWidth;

      canvas.height =
        outputHeight;


      const ctx =
        canvas.getContext("2d");


      /*
       * VIDEO SIZE
       */

      const videoWidth =
        video.videoWidth;

      const videoHeight =
        video.videoHeight;


      /*
       * COVER CROP
       *
       * Video akan memenuhi
       * ukuran frame tanpa gepeng.
       */

      const videoRatio =
        videoWidth /
        videoHeight;


      const outputRatio =
        outputWidth /
        outputHeight;


      let sourceX = 0;

      let sourceY = 0;

      let sourceWidth =
        videoWidth;

      let sourceHeight =
        videoHeight;


      if (
        videoRatio >
        outputRatio
      ) {

        /*
         * Video terlalu lebar
         */

        sourceWidth =
          videoHeight *
          outputRatio;


        sourceX =
          (
            videoWidth -
            sourceWidth
          ) / 2;

      }

      else {

        /*
         * Video terlalu tinggi
         */

        sourceHeight =
          videoWidth /
          outputRatio;


        sourceY =
          (
            videoHeight -
            sourceHeight
          ) / 2;

      }


      /*
       * FOTO KAMERA
       */

      ctx.save();


      /*
       * Mirror hasil jika kamera depan
       */

      if (
        facingMode === "user"
      ) {

        ctx.translate(
          outputWidth,
          0
        );

        ctx.scale(
          -1,
          1
        );

      }


      ctx.drawImage(

        video,

        sourceX,
        sourceY,

        sourceWidth,
        sourceHeight,

        0,
        0,

        outputWidth,
        outputHeight

      );


      ctx.restore();


      /*
       * PASANG FRAME
       *
       * Frame dipasang menggunakan
       * ukuran asli canvas.
       */

      ctx.drawImage(

        frame,

        0,
        0,

        outputWidth,
        outputHeight

      );


      /*
       * HASIL JPEG
       */

      const dataUrl =
        canvas.toDataURL(
          "image/jpeg",
          0.95
        );


      resultImg.src =
        dataUrl;


      /*
       * DOWNLOAD
       */

      const now =
        new Date();


      const filename =
        `PRATOGA_${now
          .toISOString()
          .replace(
            /[:.]/g,
            "-"
          )}.jpg`;


      downloadBtn.href =
        dataUrl;


      downloadBtn.download =
        filename;


      /*
       * TAMPILKAN HASIL
       */

      result.hidden =
        false;


      setTimeout(
        () => {

          result.scrollIntoView({

            behavior: "smooth",

            block: "start"

          });

        },
        200
      );


    }

    catch (error) {

      console.error(
        "PHOTO ERROR:",
        error
      );


      alert(
        "Terjadi masalah saat membuat foto.\n\n" +
        error.message
      );

    }

  }



  /* =========================
     CAPTURE BUTTON
  ========================= */

  captureBtn.addEventListener(

    "click",

    takePhoto

  );



  /* =========================
     SWITCH CAMERA
  ========================= */

  switchBtn.addEventListener(

    "click",

    async () => {

      if (busy) {
        return;
      }


      if (
        facingMode === "user"
      ) {

        facingMode =
          "environment";

      }

      else {

        facingMode =
          "user";

      }


      await startCamera();

    }

  );



  /* =========================
     PHOTO AGAIN
  ========================= */

  againBtn.addEventListener(

    "click",

    () => {

      result.hidden =
        true;


      window.scrollTo({

        top: 0,

        behavior: "smooth"

      });

    }

  );



  /* =========================
     CHECK CAMERA SUPPORT
  ========================= */

  if (

    !navigator.mediaDevices ||

    !navigator.mediaDevices.getUserMedia

  ) {

    alert(
      "Browser ini tidak mendukung kamera.\n\n" +
      "Gunakan Google Chrome atau Safari versi terbaru."
    );

  }

  else {

    startCamera();

  }



  /* =========================
     STOP CAMERA
  ========================= */

  window.addEventListener(

    "beforeunload",

    () => {

      if (stream) {

        stream
          .getTracks()
          .forEach(
            track =>
              track.stop()
          );

      }

    }

  );

})();
