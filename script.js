
(() => {
  "use strict";

  const gallery = document.querySelector(".gallery-sheet");
  const photo1 = document.getElementById("galleryPhoto1");
  const photo2 = document.getElementById("galleryPhoto2");

  const photos = [
    "img1.webp",
    "img2.webp",
    "img3.webp",
    "img4.webp",
    "img5.webp",
    "img6.webp"
  ];

  let photoData = "";
  const input = document.getElementById("photoInput");
  const profile = document.getElementById("profilePhoto");
  const placeholder = document.getElementById("photoPlaceholder");

  // Profile photo upload
  if (input && profile && placeholder) {
    input.addEventListener("change", e => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;

      const reader = new FileReader();

      reader.onload = () => {
        photoData = reader.result;
        profile.src = photoData;
        profile.style.display = "block";
        placeholder.style.display = "none";
      };

      reader.readAsDataURL(file);
    });
  }

  // Save HTML
  window.saveHtml = function () {
    const clone = document.documentElement.cloneNode(true);

    if (photoData) {
      const im = clone.querySelector("#profilePhoto");
      if (im) im.src = photoData;

      const ph = clone.querySelector("#photoPlaceholder");
      if (ph) ph.style.display = "none";
    }

    const blob = new Blob(
      ["<!DOCTYPE html>\n" + clone.outerHTML],
      { type: "text/html;charset=utf-8" }
    );

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = "darshit-biodata.html";
    a.click();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  // Reset
  window.resetTemplate = function () {
    if (confirm("Reset this page and discard your edits?")) {
      location.reload();
    }
  };

  if (!gallery || !photo1 || !photo2) return;

  let visible = false;
  let timer = null;
  let current1 = 0;
  let current2 = 1;
  let preloaded = false;
  let changing = false;

  // Preload remaining photos
  function preload() {
    if (preloaded) return;

    preloaded = true;

    photos.slice(2).forEach(src => {
      const img = new Image();
      img.decoding = "async";
      img.src = src;
    });
  }

  // Change one image
  async function changeImage(img, index) {
    if (changing) return;

    changing = true;

    img.classList.add("fade-out");

    setTimeout(async () => {
      img.src = photos[index];

      try {
        if (img.decode) await img.decode();
      } catch (e) { }

      img.classList.remove("fade-out");
      changing = false;

    }, 350);
  }

  // Change first and second image alternately
  let nextImage = 1;

  async function rotateImages() {
    if (!visible || document.hidden || changing) return;

    if (nextImage === 1) {
      current1 = (current1 + 2) % photos.length;
      await changeImage(photo1, current1);
      nextImage = 2;

    } else {
      current2 = (current2 + 2) % photos.length;
      await changeImage(photo2, current2);
      nextImage = 1;
    }
  }

  // Start automatic slideshow
  function start() {
    if (timer || !visible) return;

    preload();

    timer = setInterval(rotateImages, 3000);
  }

  // Stop slideshow
  function stop() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  // Gallery visibility
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => {
      visible = entries.some(e => e.isIntersecting);

      if (visible) {
        gallery.classList.add("in-view");
        start();
      } else {
        gallery.classList.remove("in-view");
        stop();
      }

    }, {
      rootMargin: "150px 0px",
      threshold: 0.01
    });

    observer.observe(gallery);

  } else {
    visible = true;
    start();
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else if (visible) start();
  });

  // Click image to change it immediately
  photo1.addEventListener("click", () => {
    current1 = (current1 + 2) % photos.length;
    changeImage(photo1, current1);
  });

  photo2.addEventListener("click", () => {
    current2 = (current2 + 2) % photos.length;
    changeImage(photo2, current2);
  });

  // Portrait card animation on click
  document.querySelectorAll(".portrait-card").forEach(card => {
    card.addEventListener("click", () => {
      card.style.animation = "none";
      void card.offsetWidth;
      card.style.animation = "";
    }, { passive: true });
  });

})();
