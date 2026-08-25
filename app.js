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

  async function startCamera() {
    if (stream) stream.getTracks().forEach(t => t.stop());
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: {facingMode: facing, width:{ideal:1280}, height:{ideal:1280}},
        audio: false
      });
      video.srcObject = stream;
    } catch (e) {
      alert("Kamera tidak dapat dibuka. Pastikan izin kamera diberikan dan website memakai HTTPS.");
    }
  }

  function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }

  async function doCountdown() {
    busy = true;
    captureBtn.disabled = true;
    for (const n of [3,2,1]) {
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

  async function composePhoto() {
    const w = video.videoWidth || 1280;
    const h = video.videoHeight || 1280;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");

    // Mirror front camera preview/result naturally.
    ctx.save();
    if (facing === "user") {
      ctx.translate(w,0); ctx.scale(-1,1);
    }
    ctx.drawImage(video,0,0,w,h);
    ctx.restore();

    const frame = new Image();
    frame.src = frameUrl;
    await new Promise((resolve,reject)=>{
      frame.onload=resolve; frame.onerror=reject;
    });

    // Cover-style fit of the frame over the captured photo.
    ctx.drawImage(frame,0,0,w,h);

    const dataUrl = canvas.toDataURL("image/jpeg",0.92);
    resultImg.src = dataUrl;
    downloadBtn.href = dataUrl;
    downloadBtn.download = `PRATOGA_${new Date().toISOString().replace(/[:.]/g,"-")}.jpg`;
    result.hidden = false;
    result.scrollIntoView({behavior:"smooth",block:"start"});
    uploadStatus.textContent = "Menyiapkan salinan untuk panitia…";

    if (typeof UPLOAD_ENDPOINT !== "undefined" && UPLOAD_ENDPOINT.trim()) {
      try {
        const base64 = dataUrl.split(",")[1];
        const payload = {
          filename: downloadBtn.download,
          mimeType: "image/jpeg",
          base64
        };
        const r = await fetch(UPLOAD_ENDPOINT, {
          method:"POST",
          headers:{"Content-Type":"text/plain;charset=utf-8"},
          body:JSON.stringify(payload)
        });
        const j = await r.json();
        uploadStatus.textContent = j.ok
          ? "✓ Salinan foto juga sudah dikirim ke galeri panitia."
          : "Foto siap di-download, tetapi salinan panitia gagal dikirim.";
      } catch(e) {
        uploadStatus.textContent = "Foto siap di-download. Koneksi ke galeri panitia belum tersedia.";
      }
    } else {
      uploadStatus.textContent = "✓ Foto siap di-download. Penyimpanan panitia belum dihubungkan.";
    }
  }

  captureBtn.addEventListener("click",()=>{ if(!busy) doCountdown(); });
  switchBtn.addEventListener("click",async()=>{
    facing = facing === "user" ? "environment" : "user";
    await startCamera();
  });
  againBtn.addEventListener("click",()=>{
    result.hidden = true;
    window.scrollTo({top:0,behavior:"smooth"});
  });

  if (!navigator.mediaDevices?.getUserMedia) {
    alert("Browser ini tidak mendukung kamera web. Gunakan Chrome/Safari versi terbaru.");
  } else {
    startCamera();
  }
})();