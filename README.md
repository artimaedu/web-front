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
