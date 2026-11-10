# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Static website for "Trải Nghiệm Vùng Cao", a Vietnamese volunteer group. Plain HTML/CSS/vanilla JS: no build step, no package manager, no tests, no linter. All user-facing text and code comments are in Vietnamese; keep new content in Vietnamese.

Hosted on GitHub Pages (`trainghiemvungcao/trainghiemvungcao.github.io`) at the custom domain in `CNAME` (trainghiemvungcao.com). Pushing to `main` deploys.

## Running locally

Serve the repo root with any static file server, then open `http://localhost:8080`. Python is not installed on the dev machine; Node is, e.g.:

```
npx http-server -p 8080
```

Opening the HTML files directly via `file://` mostly works, but the YouTube music player and the contact form `fetch` behave better over http.

## Architecture

**Pages** (`index.html`, `trips.html`, `about.html`, `contact.html`) are standalone files. There are no templates or includes, so the header/nav, footer (contact info, address link, social links) and `<head>` are duplicated in all four. Any change to shared chrome (nav items, phone, email, address, footer text) must be applied to every page. The contact page also repeats the address/phone/email in its own "Thông tin liên hệ" list.

**Scripts** (all are IIFEs that no-op when their target elements are absent, so they are safe to load on every page):
- `assets/js/main.js` — loaded on every page. Mobile nav, footer year, `.reveal` scroll animations, `[data-count]` counters, campaign progress bar (`.progress > span[data-percent]`), donation amount picker, and the contact form.
- `assets/js/music.js` — loaded on every page. Background music via a hidden YouTube IFrame player (`VIDEO_ID`); play/pause preference and playback position persist across pages in `localStorage` key `tnvc-music`. Starts on the visitor's first click/keypress because browsers block autoplay.
- `assets/js/trips.js` — `trips.html` only. Album lightbox (`<dialog id="lightbox">`) and the missing-image fallback.

**Cross-page data flow:**
- Donation: on `index.html` the `.amount` buttons set `#donate-btn` to `contact.html?amount=<n>#ung-ho`; `main.js` on the contact page reads `?amount` and fills `#chosen-amount` above the bank details.
- Contact form: `main.js` POSTs JSON to the Google Apps Script web app at `GOOGLE_SCRIPT_URL`, which appends a row to a Google Sheet. The request deliberately sends no `Content-Type` (so it is `text/plain` and avoids a CORS preflight that Apps Script cannot answer). A hidden `botcheck` checkbox is a honeypot. Server side is `google-apps-script/Code.gs`; it is not deployed from this repo and must be pasted into Apps Script and redeployed as a new version after every edit (see `google-apps-script/HUONG-DAN.md`). Field names in the form, the `data` object in `main.js`, and `HEADERS`/`appendRow` in `Code.gs` must stay in sync.

**Trips page content** is hand-written HTML. Each trip is an `<article>` card whose `button.trip-photo[data-album="album-N"]` opens the matching `<div class="album" id="album-N">` of `.album-item` buttons. The "Xem album N ảnh" counts on the cards are hard-coded. When an image fails to load, `trips.js` adds `.no-img` and the CSS shows "Thêm ảnh: <data-file>" as a placeholder, so keep `data-file` equal to the cover image path. Photos live in `image/trip-N/`. `image/README.txt` describes an older naming scheme (`trip-1.jpg`, `gallery-*.jpg`) that the pages no longer use.

**Campaign block** on `index.html` (`#chien-dich`): the progress bar width comes from `data-percent` on the inner `<span>`; the `aria-valuenow` on `.progress` is separate and must be updated by hand to match.

**Styling**: single stylesheet `assets/css/style.css` with design tokens as CSS custom properties on `:root` (green/amber/cream palette, `--radius`, `--maxw`). Icons are inline SVGs copied between pages, not an icon library.
