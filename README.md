# Keyboard Smash

A toddler-friendly page (inspired by toddlersmash.com / tinyfingers.com): press any key or tap the screen and emojis pop and float away with a little sound.

## Run locally

No build step — just serve the folder:

```
python3 -m http.server 8000
```

Then open http://localhost:8000

## Deploy to GitHub Pages

1. Push this repo to GitHub.
2. In the repo settings, enable Pages, source: `main` branch, `/ (root)`.
3. Site will be live at `https://<username>.github.io/<repo>/`.

## Files

- `index.html` — page structure
- `style.css` — background, layout, emoji pop animation
- `script.js` — keyboard/pointer handling, emoji spawning, sound
