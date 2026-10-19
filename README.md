# Spartan Drill

3D arena shooter that runs in the browser. Static files only, no build step.

Deploy: push this folder to a GitHub repo, then Settings > Pages > deploy from the branch root.
Local test: run `python3 -m http.server` in this folder and open http://localhost:8000.

## Files
- `favicon.svg` game icon (crosshair)
- `index.html` menu, HUD, pause screen and the match-end overlay
- `style.css` all styling (including phone layout)
- `js/core.js` data (weapons, perks, maps), Boomtown map, engine/collision, bots, weapons, game loop, keyboard and mouse input
- `js/systems.js` juice (shake, particles, sounds), pickups and killstreaks, VMP-X, KN-115 and RayGun models, held weapons (visible magazines, pump shotgun), character rigs, reload animations, mantling and wall jumps, bot PvP, Team Deathmatch, Capture the Flag
- `js/interface.js` levels, prestige and the camo tracks (animated shader camos), death camera, private P2P matches and persistent lobbies, home screen and the Zombies / Multiplayer menus, pause/dev menus, match-end sequence (victory/defeat, leaderboard, podium with emotes), touch controls
- `js/gfx.js` graphics: procedurally textured and merged level geometry, real-time shadows, sky dome (day and night), window facades, flickering lights
- `js/input.js` gamepad controller support (menus and play) and WebXR VR mode
- `js/zombies.js` the Zombies mode: the Hollow Estate map, rounds and waves, zombie AI with flow-field pathfinding, points, doors, mystery boxes, Pack-a-Punch, soda perks and the co-op networking

Each section inside the JS files starts with a banner comment showing its original file name.

## Controls
WASD move, Shift sprint, mouse look, click or F shoot, R reload, G grenade, V melee, E killstreak (in Zombies: buy / interact, hold to revive a teammate), 1/2/3 or Q swap, Space jump (also mantles ledges and wall jumps), Esc pause. On the podium: 1 to 4 emote. Touch: drag left to look, tap/hold right to shoot, stick to move.

## Home screen
The game opens on a home screen with two choices. ZOMBIES opens the Zombies menu (Play, Co-op lobby, Camos, Settings). MULTIPLAYER opens the Multiplayer menu (Play, Private match, Loadout, Weapon mastery, Settings). Back returns to the home screen.

## Balance
Everyone (player, bots, other players) has 50 health plus 50 recharging shield and uses the same weapon stats, so a standard weapon kills in 3 to 5 body shots. Each match is worth 1 to 3 player levels.

## Match end
When a match ends the world freezes and blurs, VICTORY or DEFEAT pops up, then the leaderboard (Continue to skip ahead), then a podium of the top 3 players who emote (Wave, Cheer, Dance, Flex; keys 1 to 4 or the buttons). If you are not in the top 3 you stand beside the podium so you can still emote. After 5 seconds you are back at the main menu.

## Reloads
Every weapon has its own reload and the part being loaded travels with the left hand: magazine weapons drop the old mag and seat a fresh one, the shotgun is loaded shell by shell and then pumped, the rocket launcher is loaded from the rear and the RayGun swaps its energy cell. Bots use the same animations.

## Movement
Walking speed is 7, hold Shift to sprint at 9 (forward only, the FOV widens slightly). While sprinting the weapon is held low, muzzle pointing down, and across the body with a running swing and you cannot fire it, unless you carry the Run & Gun perk (Multiplayer loadout, unlocks at level 10; in Zombies the Stamin Fizz soda gives the same ability). Movement accelerates and stops smoothly. The Marathon perk adds 15% to both. On touch, push the stick to its edge to sprint.

## Domination
Two teams (you are Blue, 5v5 with bots), three zones (A, B, C) per map. Stand in a zone with no enemy inside to capture it; the more of your team inside, the faster it flips (up to 3 count). A contested zone does not move. Every 2 seconds each zone a team owns gives that team 1 point. First team to 350 wins. Zones show on the radar and in the top bar. Bots go for the nearest zone their team does not own, and defenders hold zones the team already has. Zone positions come from `zn` in each map (a default row is used if a map has none).

## Maps
Blockfort, Pillars, Canyon, Boomtown and Suburbia: two crossing streets with sidewalks, driveways with cars, houses with garages, picket fences you can mantle, backyard pools, sheds and trees. Flat ground pieces (streets, driveways, decks) are walkable and ignored by spawning.

## Random picks and private lobbies
The Play screen has a Random mode card and a Random map card. Pick them and a new combination is rolled every time you press Deploy. The private match host also has Random mode and Random map in the dropdowns.
Private lobbies are persistent: after a match everybody (host and guests) goes back to the Private match screen still connected to the same code. The host picks a mode and map again and presses Start match. Use Leave lobby to disconnect. Exit match from the pause menu leaves the lobby.

## Zombies
Survive endless rounds in the Hollow Estate, an abandoned and half-collapsed mansion: four ruined wings (Foyer, Ballroom, Conservatory, Kitchen) joined by four locked doors. Walls are 8 high, doors are 8 high, wall jumps are disabled and nothing can be mantled above 2.6, so nobody can climb out. Each wing has broken partition walls, rubble to jump on, wrecked furniture, rafters open to the sky and its own lighting that comes from real objects (a floor lamp, a fallen chandelier, burning barrels, a lantern on the fountain, a wall sconce) instead of floating lights. You start in the first wing with the 1911 and 500 points.
- Points: 10 per hit; kills pay 50 (60 with explosives or the RayGun), 100 for a headshot kill and 130 for a knife kill. The knife kills in one hit up to round 2, then loses effectiveness gradually: it takes about 2 swings in round 3, 4 in round 6, 7 in round 12 and tops out at 20 swings from round 35.
- Rounds and waves: each round has more zombies than the last and they spawn in waves from the wings you have opened. All ammo is restocked at the start of every round.
- Zombies get stronger every round: more health (steady growth, then 7% per round after round 10), harder hits (up to 55), faster attacks and movement. Runners appear from round 6 and everything runs from round 25. Weapons do 2.2x damage to zombies (explosives 3x) so the arsenal keeps up. Every fifth round brings brutes (large, 4x health, heavy hits). Zombie colours shift from green to rotten purple to ember red as rounds go up.
- Doors (Ballroom 1000, Conservatory 1250, Kitchen 1500 and 2000) open new wings. Zombies path around walls and through doors you opened.
- Mystery Box (950, two locations): a random weapon (KN-115, SMG, Battle Rifle, Shotgun, Magnum, Machine Pistol, VMP-X, Sniper, Rocket Launcher, Coyote). The RayGun is rare (3%) and one-shots every normal zombie up to round 29; from round 30 a base RayGun no longer kills in one shot, but a Pack-a-Punched RayGun still does (until round ~49, and PaP II beyond).
- Pack-a-Punch (5000 then 10000): upgrades the weapon you are holding (damage x2.2 then x3.6, bigger magazine, faster fire).
- Perk machines (soda machines): red Vitality Cola +50 health (2500), green Quick Fizz reload twice as fast (3000), yellow Double Pop double damage with bullet weapons and faster fire (2000), blue Revive Soda self-revive once (500; the machine runs dry after 4 purchases), purple Stamin Fizz run 20% faster (2000), orange Mule Soda third weapon slot (4000).
- Down: you lie on the floor (low camera, slow crawl; no ragdoll) and you lose all your perks and any third weapon. With Revive Soda you get back up by yourself after 4 seconds. In solo, going down otherwise ends the run.

### Co-op (up to 4 players)
In the Zombies menu choose Co-op lobby: the host creates a code, up to 3 friends join, the host presses Start match. The host simulates every zombie, round and door; guests see the zombies, their hits count, and the kill points come back to them. Points, perks and weapons belong to each player; doors, boxes and the Revive Soda stock are shared. Teammates cannot hurt each other.
- When a player goes down everyone else gets a PLAYER DOWN alert with a sound, a kill-feed line and a red marker with distance over the body. A teammate can revive you: hold E next to them for 2 seconds (the reviver earns 100 points). You have 45 seconds.
- Downed or bled-out players come back at the start of the next round with a pistol (points are kept).
- The run ends when everybody is down at the same time.
- The lobby stays connected after the run, like private matches.

## Camos
Two separate tracks, both usable in both modes. Multiplayer camos are earned with kills (Weapon mastery menu). Zombie camos are earned with zombie kills per weapon (Rotted 25, Bile 75, Bone 150, Blood 225, Rust 300, Toxic 375), three global camos for your best round (Graveyard round 10, Wasteland round 15, Hellscape round 20) and the three animated finishers (Inferno 500 zombie kills, Necrotic 500 zombie kills on every weapon of that type, Abyss 500 zombie kills on every weapon). Any unlocked camo from either track can be picked on any weapon from either menu.
The final three of each track are live shaders that animate on the weapon: Gold (molten gold), Diamond (prismatic ice), Dark Matter (swirling nebula), Inferno (flames and lava cracks), Necrotic (toxic plasma), Abyss (a void with glowing rifts).

## Weapons
New: the Coyote, a 60 round LMG (unlocks at level 34), modelled on the reference picture with a drum magazine that really comes out when you reload.

## Open maps
Suburbia and Boomtown have no tall walls. The play area is enclosed by one continuous painted fence that follows the edge of the map (Boomtown's bat-wing outline included). An invisible tall collision wall sits on top of it so it cannot be mantled, wall-jumped or squeezed through, and the scenery (houses, trees, hills) continues beyond it. Suburbia is larger now with an outer ring road and a ring of houses.

## Characters and animation
Players and bots are now real humans: head with face, ears and hair or a combat helmet, neck, oval torso, tactical vest, tapered jointed arms and legs, boots. Zombies are rotting undead: pale or sickly skin, glowing eyes, hanging jaw, wounds, ragged clothes in random colours, a hunched lurching gait with one dragging leg and reaching arms. Skin and clothes darken as rounds climb. Bots fall over when killed. Animation is procedural: smooth turning, stride and arm counter-swing, torso twist and lean, breathing and idle weight shift, hit flinches. First person has a proper sprint pose, head bob, strafe roll and a landing dip (the sprint shake is fixed: the bob uses an accumulated phase).

## Graphics
Level geometry is merged into a few textured meshes (brick, stucco, wood planks, concrete, asphalt, grass, shingles, tile, metal) with real-time shadows, a sky dome with sun and clouds (or a night sky with moon and stars in the zombie estate), window facades, street furniture, car wheels and lights, rounded trees and bushes. The zombie estate has flickering warm and cold lights, blood and debris. Settings has a Graphics option: High (shadows) or Low (faster, default on phones).

## Player name
The name box lives in the profile area of both menus and is saved in the browser, so it is still there after closing the tab.

## Weapons and perks (update)
- **1911** (new, `CT`): the Zombies starter pistol and a Multiplayer sidearm (level 12). Modelled on a government-pattern 1911 with a serrated slide, spur hammer, beavertail and checkered wood grips (built from boxes, the reference photo is not used in the game).
- **Magnum** now has a new revolver model: 6 inch vented-rib barrel with underlug, ramp front sight, fluted cylinder, spur hammer and walnut grips with a gold medallion.
- **KN-115** has a single magazine attached under the receiver.
- **Sniper Rifle** pierces: one shot damages every enemy and zombie along the line until it hits a wall, in both modes.
- **RayGun**: no range falloff and no headshot bonus; direct damage 48 plus a larger, stronger blast (radius 4.4, damage 62) so it is a 2 shot kill in Multiplayer at any range and one shot still cannot kill a full health player.
- **Run & Gun** perk: lets you shoot while sprinting.

## Characters
Human heads were rebuilt (smaller eyes in sockets, brows, nose, mouth, ears, chin) and skin and hair are lighter and slightly self-lit so people stay readable in dark lighting. Uniforms, vests, helmets and gloves are unchanged.

## Ragdolls
Players, bots and zombies that die are thrown by the hit, tumble, bounce off walls, land on the highest surface under them (crates, rubble, ledges) and lie there limp with floppy legs, arms and head. Zombie bodies stay for several seconds and then sink away.

## Menus, saving and audio
- Pausing in a Private match or Zombies co-op only opens the menu: the match keeps running for everyone (including you). Solo matches still freeze.
- Your loadout, mode, map and settings are saved on every change and when the tab is hidden or closed, and are loaded after all weapons exist (previously a loadout using the VMP-X, Coyote or other late-defined weapons was thrown away on load).
- Audio resumes automatically when you return to the tab.
- Zombies podium: only the real players stand on it (just you in solo) while a crowd of zombies shambles around them.

## Controller and VR
- **Controller** (any standard gamepad, plug in and press a button): left stick move, right stick look, RT shoot, A jump, X reload, B or R3 knife, Y or D-pad swap, LB or LT grenade, RB use / killstreak (hold to revive), L3 toggles sprint (releasing the stick cancels it), Start pause. In menus the D-pad or left stick moves the focus, A presses, B goes back or resumes, left/right changes drop-downs and sliders. Note: browsers may refuse pointer lock without a mouse click; the game plays fine without it.
- **VR** (WebXR, e.g. Quest browser or desktop Chrome/Edge with a headset): Settings > VR headset mode > On, then Deploy / Start survival; the match opens in the headset. The right controller aims and holds the gun (shots go where it points), trigger shoots, left stick moves in the aim direction, right stick snap-turns 30 degrees, A jump, B swap, X use, left trigger grenade, left grip reload, right grip knife, stick click sprint, Y leaves VR and opens the pause menu (Resume goes back into VR). Health, shield, ammo and round/points are on a panel on your left wrist. Shadows are turned off while in VR. Match end also returns you to the screen. Not tested on real hardware: please report anything that feels off.
