# Spartan Drill

3D arena shooter that runs in the browser. Static files only, no build step.

Deploy: push this folder to a GitHub repo, then Settings > Pages > deploy from the branch root.
Local test: run `python3 -m http.server` in this folder and open http://localhost:8000.

## Files
- `index.html` menu, HUD, pause screen and the match-end overlay
- `style.css` all styling (including phone layout)
- `js/core.js` data (weapons, perks, maps), Boomtown map, engine/collision, bots, weapons, game loop, keyboard and mouse input
- `js/systems.js` juice (shake, particles, sounds), pickups and killstreaks, VMP-X, KN-115 and RayGun models, held weapons (visible magazines, pump shotgun), character rigs, reload animations, mantling and wall jumps, bot PvP, Team Deathmatch, Capture the Flag
- `js/interface.js` levels, prestige and camos, death camera, private P2P matches, main/pause/dev menus, match-end sequence (victory/defeat, leaderboard, podium with emotes), touch controls

Each section inside the three JS files starts with a banner comment showing its original file name.

## Controls
WASD move, mouse look, click or F shoot, R reload, G grenade, V melee, E killstreak, 1/2/3 or Q swap, Space jump (also mantles ledges and wall jumps), Esc pause. On the podium: 1 to 4 emote. Touch: drag left to look, tap/hold right to shoot, stick to move.

## Balance
Everyone (player, bots, other players) has 50 health plus 50 recharging shield and uses the same weapon stats, so a standard weapon kills in 3 to 5 body shots. Each match is worth 1 to 3 player levels.

## Match end
When a match ends the world freezes and blurs, VICTORY or DEFEAT pops up, then the leaderboard (Continue to skip ahead), then a podium of the top 3 players who emote (Wave, Cheer, Dance, Flex; keys 1 to 4 or the buttons). If you are not in the top 3 you stand beside the podium so you can still emote. After 5 seconds you are back at the main menu.

## Reloads
Every weapon has its own reload and the part being loaded travels with the left hand: magazine weapons drop the old mag and seat a fresh one, the shotgun is loaded shell by shell and then pumped, the rocket launcher is loaded from the rear and the RayGun swaps its energy cell. Bots use the same animations.

## Movement
Base walking speed is 13.5 (Marathon perk adds 15%).

## Domination
Two teams (you are Blue, 5v5 with bots), three zones (A, B, C) per map. Stand in a zone with no enemy inside to capture it; the more of your team inside, the faster it flips (up to 3 count). A contested zone does not move. Every 2 seconds each zone a team owns gives that team 1 point. First team to 350 wins. Zones show on the radar and in the top bar. Bots go for the nearest zone their team does not own, and defenders hold zones the team already has. Zone positions come from `zn` in each map (a default row is used if a map has none).

## Maps
Blockfort, Pillars, Canyon, Boomtown and Suburbia (new): two crossing streets with sidewalks, driveways with cars, houses with garages, picket fences you can mantle, backyard pools, sheds and trees. Flat ground pieces (streets, driveways, decks) are walkable and ignored by spawning.

## Random picks and private lobbies
The Play screen has a Random mode card and a Random map card. Pick them and a new combination is rolled every time you press Deploy. The private match host also has Random mode and Random map in the dropdowns.
Private lobbies are persistent: after a match everybody (host and guests) goes back to the Private match screen still connected to the same code. The host picks a mode and map again and presses Start match. Use Leave lobby to disconnect. Exit match from the pause menu leaves the lobby.
