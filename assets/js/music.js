/* Nhạc nền: phát video YouTube (chỉ nghe tiếng) và nhớ trạng thái giữa các trang.
   Trình duyệt chặn nhạc có tiếng tự phát khi vừa mở trang, nên nhạc bắt đầu từ lần
   bấm / chạm đầu tiên của khách (hoặc khi khách bấm nút loa ở góc màn hình). */
(function () {
  "use strict";

  var VIDEO_ID = "sj_UDyfoo-A"; // Người Gieo Mầm Xanh - Hứa Kim Tuyền x Hoàng Dũng
  var TITLE = "Người Gieo Mầm Xanh – Hứa Kim Tuyền x Hoàng Dũng";
  var STORE = "tnvc-music";

  // ----- Lưu / đọc trạng thái (pref: "on" | "off" | null = chưa chọn) -----
  function load() {
    try { return JSON.parse(localStorage.getItem(STORE)) || {}; } catch (e) { return {}; }
  }
  function save(patch) {
    try {
      var s = load();
      for (var k in patch) s[k] = patch[k];
      localStorage.setItem(STORE, JSON.stringify(s));
    } catch (e) { /* bỏ qua nếu trình duyệt chặn localStorage */ }
  }
  var state = load();

  // ----- Nút loa nổi + vùng chứa player ẩn -----
  var btn = document.createElement("button");
  btn.className = "music-toggle";
  btn.type = "button";
  btn.setAttribute("aria-pressed", "false");
  btn.setAttribute("aria-label", "Bật nhạc nền: " + TITLE);
  btn.title = "Nhạc nền: " + TITLE;
  btn.innerHTML =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path class="m-off" d="M11 5 6 9H3v6h3l5 4zM22 9l-6 6M16 9l6 6"/>' +
    '<path class="m-on" d="M11 5 6 9H3v6h3l5 4zM15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/></svg>';
  var holder = document.createElement("div");
  holder.className = "music-player-holder";
  holder.setAttribute("aria-hidden", "true");
  holder.innerHTML = '<div id="music-player"></div>';
  document.body.appendChild(btn);
  document.body.appendChild(holder);

  var player = null, ready = false, playing = false, timer = null, gestureBound = false;

  function setUI(on) {
    playing = on;
    btn.classList.toggle("is-playing", on);
    btn.setAttribute("aria-pressed", String(on));
    btn.setAttribute("aria-label", (on ? "Tắt" : "Bật") + " nhạc nền: " + TITLE);
  }

  function tryPlay() {
    if (ready && player && player.playVideo) player.playVideo();
  }

  // Nếu chưa được phép tự phát: chờ lần bấm / chạm đầu tiên rồi phát
  function waitForGesture() {
    if (gestureBound || state.pref === "off") return;
    gestureBound = true;
    var go = function (e) {
      if (btn.contains(e.target)) return; // nút loa tự xử lý
      cleanup();
      if (load().pref !== "off") { save({ pref: "on" }); tryPlay(); }
    };
    var cleanup = function () {
      gestureBound = false;
      document.removeEventListener("pointerdown", go, true);
      document.removeEventListener("keydown", go, true);
    };
    document.addEventListener("pointerdown", go, true);
    document.addEventListener("keydown", go, true);
  }

  btn.addEventListener("click", function () {
    if (!ready) { save({ pref: "on" }); state.pref = "on"; return; }
    if (playing) {
      player.pauseVideo();
      save({ pref: "off" });
      state.pref = "off";
    } else {
      save({ pref: "on" });
      state.pref = "on";
      player.playVideo();
    }
  });

  // ----- YouTube IFrame API -----
  window.onYouTubeIframeAPIReady = function () {
    var start = Math.max(0, Math.floor(state.time || 0));
    player = new YT.Player("music-player", {
      width: "200",
      height: "200",
      videoId: VIDEO_ID,
      playerVars: {
        autoplay: 0, controls: 0, disablekb: 1, playsinline: 1, rel: 0,
        modestbranding: 1, loop: 1, playlist: VIDEO_ID, start: start
      },
      events: {
        onReady: function () {
          ready = true;
          try { player.setVolume(60); } catch (e) {}
          if (state.pref === "on") {
            tryPlay();
            // Trình duyệt có thể chặn tự phát: lúc đó chờ khách chạm vào trang
            setTimeout(function () { if (!playing) waitForGesture(); }, 1500);
          } else if (state.pref !== "off") {
            waitForGesture(); // lần đầu vào web: bắt đầu từ lần bấm / chạm đầu tiên
          }
        },
        onAutoplayBlocked: function () { waitForGesture(); },
        onStateChange: function (e) {
          var on = e.data === 1; // 1 = đang phát
          setUI(on);
          if (on && !timer) {
            timer = setInterval(function () {
              try { save({ time: player.getCurrentTime() }); } catch (err) {}
            }, 1000);
          } else if (!on && e.data !== 3 && timer) { // 3 = đang tải đệm
            clearInterval(timer);
            timer = null;
          }
        }
      }
    });
  };

  window.addEventListener("pagehide", function () {
    try { if (player && player.getCurrentTime) save({ time: player.getCurrentTime() }); } catch (e) {}
  });

  var tag = document.createElement("script");
  tag.src = "https://www.youtube.com/iframe_api";
  tag.async = true;
  document.head.appendChild(tag);
})();
