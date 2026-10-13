/* Trải Nghiệm Vùng Cao - script dùng chung */
(function () {
  "use strict";

  // ----- Menu mobile -----
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    links.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  // ----- Năm ở footer -----
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  // ----- Hiệu ứng xuất hiện khi cuộn -----
  var reveals = document.querySelectorAll(".reveal");
  var hasIO = "IntersectionObserver" in window;
  if (hasIO) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("visible");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("visible"); });
  }

  // ----- Đếm số thống kê -----
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function format(n) { return n.toLocaleString("vi-VN"); }
  function countUp(el) {
    var target = parseInt(el.dataset.count, 10);
    var suffix = el.dataset.suffix || "";
    if (reduceMotion || isNaN(target)) { el.textContent = format(target) + suffix; return; }
    var start = null, dur = 1600;
    function frame(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = format(Math.round(target * eased)) + suffix;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  var counters = document.querySelectorAll("[data-count]");
  if (hasIO && counters.length) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { countUp(en.target); cio.unobserve(en.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    counters.forEach(countUp);
  }

  // ----- Thanh tiến độ chiến dịch -----
  var bar = document.querySelector(".progress > span");
  if (bar) {
    var pct = bar.dataset.percent || "0";
    if (hasIO) {
      var pio = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) { bar.style.width = pct + "%"; pio.disconnect(); }
      }, { threshold: 0.4 });
      pio.observe(bar);
    } else {
      bar.style.width = pct + "%";
    }
  }

  // ----- Chọn mức ủng hộ -----
  var amountBtns = document.querySelectorAll(".amount");
  var note = document.getElementById("donate-note");
  var donateBtn = document.getElementById("donate-btn");
  var chosen = null;
  amountBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      amountBtns.forEach(function (b) { b.setAttribute("aria-pressed", "false"); });
      btn.setAttribute("aria-pressed", "true");
      chosen = btn.dataset.amount;
      if (note) note.textContent = btn.dataset.impact || "";
    });
  });
  if (donateBtn) {
    donateBtn.addEventListener("click", function (e) {
      if (!chosen) {
        e.preventDefault();
        if (note) note.textContent = "Vui lòng chọn một mức ủng hộ để tiếp tục.";
      } else {
        // Chuyển sang trang liên hệ kèm số tiền để hiện thông tin chuyển khoản
        donateBtn.href = "contact.html?amount=" + encodeURIComponent(chosen) + "#ung-ho";
      }
    });
  }

  // ----- Hiển thị số tiền đã chọn ở trang liên hệ -----
  var amountParam = new URLSearchParams(window.location.search).get("amount");
  var amountOut = document.getElementById("chosen-amount");
  if (amountParam && amountOut && /^\d+$/.test(amountParam)) {
    amountOut.textContent = "Cảm ơn bạn đã chọn ủng hộ " + format(parseInt(amountParam, 10)) + "đ. Vui lòng chuyển khoản theo thông tin bên dưới.";
    amountOut.hidden = false;
  }

  // ----- Form liên hệ -----
  var form = document.getElementById("contact-form");
  if (form) {
    var success = document.getElementById("form-success");

    function validateField(field) {
      var input = field.querySelector("input, select, textarea");
      var msg = field.querySelector(".error-msg");
      var value = input.value.trim();
      var error = "";

      if (input.required && !value) {
        error = "Vui lòng nhập thông tin này.";
      } else if (input.type === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        error = "Email chưa đúng định dạng.";
      } else if (input.name === "phone" && value && !/^(0|\+84)[0-9\s.\-]{8,12}$/.test(value)) {
        error = "Số điện thoại chưa hợp lệ.";
      } else if (input.name === "message" && value && value.length < 10) {
        error = "Nội dung cần ít nhất 10 ký tự.";
      }

      field.classList.toggle("invalid", Boolean(error));
      if (msg) msg.textContent = error;
      input.setAttribute("aria-invalid", error ? "true" : "false");
      return !error;
    }

    var fields = form.querySelectorAll(".field");
    fields.forEach(function (f) {
      var input = f.querySelector("input, select, textarea");
      input.addEventListener("blur", function () { validateField(f); });
      input.addEventListener("input", function () {
        if (f.classList.contains("invalid")) validateField(f);
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true, firstBad = null;
      fields.forEach(function (f) {
        if (!validateField(f)) {
          ok = false;
          if (!firstBad) firstBad = f.querySelector("input, select, textarea");
        }
      });
      if (!ok) { if (firstBad) firstBad.focus(); return; }

      // Trang này là bản tĩnh nên chưa gửi đi đâu. Khi có backend,
      // hãy gửi dữ liệu bằng fetch() tại đây.
      form.reset();
      success.classList.add("show");
      success.focus();
    });
  }
})();
