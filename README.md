# Artima Edu — Landing Page

Bilingual (ID/EN) marketing landing page for `artimaedu.web.id`. Galactic Learning theme. Vanilla HTML/CSS/JS — no build step.

## Run locally
Open `index.html` in a browser, or serve the folder:
```bash
python3 -m http.server 8000
# visit http://localhost:8000
```

## Edit content
All copy lives in `assets/js/content.json` (ID + EN). Edit there — never hardcode text in `index.html`.

## Add a real mascot/logo
Replace files in `assets/img/` and `assets/img/mascots/`. Keep the same filenames, or update the `src` in `index.html`.

## Deploy (GitHub Pages)
1. Push `main` branch to GitHub.
2. Repo Settings → Pages → Source: `main` branch / root.
3. `CNAME` file sets the custom domain `artimaedu.web.id`.
4. Configure DNS on sumopod.com to point at GitHub Pages.

## WhatsApp CTA messages
Pre-filled messages live in `whatsapp.js` under `CTA_MESSAGES`. Edit there to change the text a mom sends.

## Pre-launch checklist
- [ ] Replace placeholder logo, mascots, og-image, favicon in `assets/img/` (see `assets/img/PLACEHOLDERS.md`)
- [ ] Replace testimonial placeholders in `assets/js/content.json` with real reviews
- [ ] Verify WhatsApp number in `assets/js/whatsapp.js` (`WA_NUMBER`)
- [ ] Verify Instagram link in `index.html` footer
- [ ] Push to GitHub `main` branch
- [ ] GitHub Settings → Pages → Source: main / root
- [ ] Confirm `CNAME` contains `artimaedu.web.id`
- [ ] Configure DNS on sumopod.com → GitHub Pages
- [ ] Test https://artimaedu.web.id live
