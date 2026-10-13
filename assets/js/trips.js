/* Trang "Những chuyến đi": ảnh dự phòng và xem album ảnh lớn */
(function () {
  "use strict";

  // ----- Ảnh chưa có -> hiện ô màu kèm tên file cần thêm -----
  function markMissing(img) {
    var holder = img.closest(".trip-photo, .album-item");
    if (holder) holder.classList.add("no-img");
    img.hidden = true;
  }
  document.querySelectorAll(".trip-photo img, .album-item img").forEach(function (img) {
    img.addEventListener("error", function () { markMissing(img); });
    // Ảnh có thể đã lỗi trước khi script chạy
    if (img.complete && img.naturalWidth === 0) markMissing(img);
  });

  // ----- Xem album ảnh lớn -----
  var box = document.getElementById("lightbox");
  if (!box || typeof box.showModal !== "function") return;
  var boxImg = document.getElementById("lightbox-img");
  var boxCap = document.getElementById("lightbox-cap");
  var items = [];
  var current = 0;

  function show(i) {
    current = (i + items.length) % items.length;
    var img = items[current].querySelector("img");
    boxImg.src = img.currentSrc || img.src;
    boxImg.alt = img.alt;
    boxCap.textContent = img.alt + " (" + (current + 1) + "/" + items.length + ")";
  }

  function openAlbum(album, index) {
    items = Array.prototype.filter.call(
      album.querySelectorAll(".album-item"),
      function (el) { return !el.classList.contains("no-img"); }
    );
    if (!items.length) return;
    show(index || 0);
    box.showModal();
  }

  // Bấm ảnh trong album
  document.querySelectorAll(".album").forEach(function (album) {
    album.addEventListener("click", function (e) {
      var item = e.target.closest(".album-item");
      if (!item || item.classList.contains("no-img")) return;
      openAlbum(album, Array.prototype.indexOf.call(album.querySelectorAll(".album-item"), item));
    });
  });

  // Bấm ảnh bìa trên thẻ chuyến đi -> mở album của chuyến đó
  document.querySelectorAll("button.trip-photo[data-album]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var album = document.getElementById(btn.dataset.album);
      if (album) openAlbum(album, 0);
    });
  });

  box.querySelector(".lightbox-close").addEventListener("click", function () { box.close(); });
  box.querySelector(".lightbox-prev").addEventListener("click", function () { show(current - 1); });
  box.querySelector(".lightbox-next").addEventListener("click", function () { show(current + 1); });
  box.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") show(current - 1);
    if (e.key === "ArrowRight") show(current + 1);
  });
  // Bấm ra ngoài ảnh thì đóng
  box.addEventListener("click", function (e) { if (e.target === box) box.close(); });
})();
