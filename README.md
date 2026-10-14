# Spartan Drill

Single-player 3D arena shooter. Pure static files: no build step.

Deploy: push this folder to a GitHub repo, then Settings > Pages > deploy from branch (root).
Local test: `python3 -m http.server` in this folder, then open http://localhost:8000.

- `index.html` menu and HUD markup
- `style.css` styling
- `js/data.js` weapons, attachments, perks, maps, loadout menu
- `js/engine.js` renderer, collision, raycasts, aim-assist target search
- `js/bots.js` enemy bots and damage
- `js/weapons.js` firing, reloading, grenades
- `js/game.js` modes, main update loop
- `js/input.js` keyboard, mouse, pointer lock
- `js/juice.js` particles, screen shake, sounds, kill medals, best scores
- `js/features.js` melee (V), radar, killstreaks (E), power-weapon and health/shield/ammo pickups, XP and ranks, kill feed
- `js/mastery.js` levels 1-55, prestige 1-10, Prestige Master (to 1250), unlock list, weapon levels/prestige, camos (saved in your browser)
