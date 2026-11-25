# Spartan Drill

3D arena shooter that runs in the browser with no build step.

Deploy: push this folder to a GitHub repo, then Settings > Pages > deploy from the branch root.
Local test: run `python3 -m http.server` in this folder and open http://localhost:8000.

## Online parties and co-op

For play across devices, serve the game and its relay together. Run `python3 relay.py` for a local test at `http://localhost:8000`. Players use the same hosted game URL and share the usual party, match, or squad code. The same code works on both the direct PeerJS route and the HTTPS relay. The game tries WebRTC first when available, then switches to HTTPS if the direct connection stalls. Player accounts and external relay credentials are unnecessary.

For a public HTTPS deployment, run the relay on the host and reverse-proxy the game and `/sd-relay` routes to it. Preserve the original Host header, allow requests to wait at least 15 seconds, and use one relay process so both players reach the same rooms. On a LAN with a browser-trusted TLS certificate, run `python3 relay.py --bind 0.0.0.0 --cert fullchain.pem --key privkey.pem` and open the certificate's HTTPS hostname on both devices.

Static hosting uses PeerJS and WebRTC without the HTTPS fallback. Direct WebRTC peers may see each other's public IP addresses. The same-origin relay runs only when the game is served through `relay.py`.

## Files

| Path | Contents |
| --- | --- |
| `index.html`, `style.css`, `favicon.svg` | Main game, menus, HUD, and site icon |
| `stormwatch.html` | Standalone Stormwatch entry point |
| `js/world.js`, `js/systems.js` | Map geometry, rendering, combat, bots, and 3D models |
| `js/interface.js`, `js/menus.js`, `js/player-audio.js` | Input, progression, menus, and shared audio |
| `js/zombies.js`, `js/streaks.js` | Zombies maps and quests, equipment, training, match features, and killstreaks |
| `js/stormwatch-services.js`, `js/stormwatch.js` | Stormwatch command, campaign, construction, physics, and missions |
| `js/net-safety.js`, `relay.py` | Shared multiplayer transports and optional same-origin relay |
| `js/mods.js` | Mod file schema, library, and local mod sessions |
| `assets/` | Map preview images |

## Controls

WASD moves, Shift sprints, Space jumps or mantles, and C crouches or slides. Use the left mouse button to fire, right mouse button to aim, R to reload, V for melee, E for lethal equipment, Q for tactical equipment, and F to interact or revive. Use 1 and 2 or the mouse wheel to switch weapons, 3–6 to use killstreaks, M to view the tactical map, Tab for the scoreboard, and Esc to pause. See **Settings → Controls** for rebinding, controller prompts, WebXR, and touch controls.

## Home screen
The home screen opens Multiplayer, Zombies, or Stormwatch. Back returns to mode select.

## Official mod support

Open **Mods** on the main menu and drop in one `.sdmod` file. You can also use **Choose file**. Enable a pack and close Mods. Its arena playlists and maps appear in **Multiplayer → Match setup**, its weapons appear in **Loadout**, and its Zombies maps and playlists appear under **Zombies → Play**. Use **Load example mod** to install Signal Yard. Return to Mods to switch packs, disable the active pack, export a file, or remove an installed pack.

To make a mod with AI, click **Copy AI prompt**, paste it into an AI chat, and describe your idea. Save the JSON it gives you as a file ending in `.sdmod`, then drop that file into Mods. **Download template** gives you a complete working pack. **Download schema** gives you the versioned JSON Schema for validation in an editor or an AI coding tool. The importer also checks references and map rules and shows the location of any error.

A v1 pack is plain UTF-8 JSON, up to 384 KiB. It contains every definition it needs. The smallest pack can use existing maps and weapons.

```json
{
  "format": "spartan-drill-mod",
  "version": 1,
  "id": "dock-duel",
  "name": "Dock Duel",
  "playlists": [
    {
      "id": "duel",
      "name": "First to Five",
      "base": "Slayer",
      "map": "Dry Dock",
      "bots": 1,
      "scoreLimit": 5,
      "timeSeconds": 90
    }
  ]
}
```

- **Weapons** inherit the defaults of an official weapon. Override damage, RPM, ammo, recoil, spread, reload time, fire mode, pellets, and explosive damage. Build an original 3D model out of colored and rotated parts, with hand grips, a muzzle and optional moving magazine parts. Set a playlist's starting weapons and bot pool. Custom weapons are also eligible for the Zombies Mystery Box.
- **Maps** define their terrain palette, collision boxes, decorative props, lights, spawn points, and flag or zone positions. Coordinates are `[x, z]` and sizes are `[width, height, depth]`. Zombies maps use the same geometry and can define rooms, paid doors, enemy spawns, wall buys, perk machines, the Mystery Box, Pack-a-Punch and ammo crates. Room `0` is open at the start.
- **Playlists** combine a map, starting loadout, bot count, and match rules such as score, round, or time limits, starting health and shields, and infinite ammo. **Gun Game** can use a custom weapon ladder. **Objective Course** supports ordered reach, hold, interact, and eliminate steps with optional heal or ammo-refill rewards. Map and weapon references written as `@id` refer to definitions in the current file.
- **Progression** is frozen while any pack is enabled, including when playing a built-in map or mode. Official rank and XP, weapon mastery and camos, Battle Pass and Bux, challenges, quest rewards, Chewables, and combat records stay in the official game. Points, ammo, upgrades and score earned inside a mod still work for that match.

Version 1 supports offline arena and Zombies content and data-defined rules. It accepts game data only. Online mod play, Stormwatch mods, arbitrary scripts, and imported asset files are outside this version's format.

## Stormwatch

Stormwatch opens at Command. Choose one of four regions on the World Map, then pan its sector grid and select a mission marker. **Deploy Solo** launches locally. **Find Squad** looks for players queuing for that operation. **Squad** also supports private codes for up to four players. Teammates share the objective and fortifications. Use **F** near a downed teammate to revive them.

The **Inventory** tab shows stored salvage and recovered blueprints, and lets you set a Stormwatch-specific primary and secondary weapon. Salvage and loadout choices carry over on the same browser and origin. Equipped operators and locker cosmetics come from Spartan Drill. Cleared waves and completed stages award Battle Pass XP.

- **ATLAS Defense** gives you 60 seconds to fortify before the first of five waves. **Seal the Breach** asks you to collect three Flux Crystals and bring them to the Rift Anchor before a four-minute siege.
- **Clear the Nests** sends you to five marked sites. Scan each nest, defeat its guardians, and break the exposed core. **Secure the Payload** starts with a 40-second landing countdown and ends after 145 seconds defending the recovery pod inside a contracting storm.
- Timbervale, Ironridge, Canyonlands, and Obsidian Peaks each generate field layouts. Citadel Power controls deployment access.
- **Q** opens building. **1–4** select Wall, Floor, Ramp, or Cap. **RMB** changes material. **B** edits an aimed structure and **G** repairs or reinforces it. **Tab** opens the Field Kit for trap recipes and ammo crafting.
- **F** opens chests, equips their weapon rewards, scans nests, and revives teammates. **5–8** activate the lead operative's abilities. On a controller, click **RS** to edit, use **View** for the Field Kit, and use **D-pad left/right** and **RB** to select and activate abilities in combat.
- **Field fabrication** uses mission components and building materials to equip a weapon from a Citadel blueprint.
- **Citadel → Operations** tracks a rotating daily contract, a weekly contract for distinct mission wins, and the Field Index. The highlighted Alert on the deployment board opts into a mission modifier with a once-daily salvage reward.

The structure grid uses cubic cells with integer contact coordinates for support checks. Edits share their geometry with Rapier collision and Hollow routing. Terrain and settled fortifications use instanced meshes where geometry and materials match. The Citadel management screen uses React and the profile is saved to IndexedDB on the current browser origin. Its saves are separate from Multiplayer and Zombies profiles. The Rapier and Citadel libraries load from jsDelivr.

Epic's front-end notes, mission variety, and progression references informed the operation board, alert rotation, and Field Index. [Front End reorganization](https://www.fortnite.com/patch-notes/v6-30) · [Seasonal mission modifiers](https://www.fortnite.com/news/save-the-worlds-newest-update-7-21-2020) · [Mission Alert rewards](https://www.fortnite.com/news/changes-coming-to-fortnite-save-the-worlds-daily-reward-system-in-v25-10) · [Collection Book](https://www.epicgames.com/help/c-39719500/c-36066936/a25876301)

## Balance
Every fighter has 50 health plus 50 recharging shield and uses the same weapon stats, so a standard weapon kills in 3 to 5 body shots. Each match is worth 1 to 3 player levels.

## Match end
When a match ends the world freezes and blurs, VICTORY or DEFEAT pops up, then the leaderboard (Continue to skip ahead), then a podium of the top 3 players who emote (Wave, Cheer, Dance, Flex; keys 1 to 4 or the buttons). If you are not in the top 3 you stand beside the podium so you can still emote. After 5 seconds you are back at the main menu.

## Reloads
Every weapon has its own reload and the part being loaded travels with the left hand: magazine weapons drop the old mag and seat a fresh one, the shotgun is loaded shell by shell and then pumped, the rocket launcher is loaded from the rear and the RayGun swaps its energy cell.

## Movement
Walking speed is 7, hold Shift to sprint at 9 (forward only, the FOV widens slightly). While sprinting the weapon is held low, muzzle pointing down, and across the body with a running swing and you cannot fire it, unless you carry the Run & Gun perk (Multiplayer loadout, unlocks at level 10; in Zombies the Stamin Fizz soda gives the same ability). Movement accelerates and stops smoothly. The Marathon perk adds 15% to both. On touch, push the stick to its edge to sprint.

## Domination
Two teams of five compete for three zones (A, B, C) per map. Stand in a zone with no enemy inside to capture it; the more of your team inside, the faster it flips (up to 3 count). A contested zone does not move. Every 2 seconds each zone a team owns gives that team 1 point. First team to 350 wins. Zones show on the radar and in the top bar. Zone positions come from `zn` in each map (a default row is used if a map has none).

## Maps
Multiplayer includes Blockfort, Pillars, Canyon, Suburbia, Boomtown, Rust, Decay, Dry Dock, Shardworks, and Classic Crossroads. **Classic Crossroads** links the original Blockfort, Pillars, and Canyon layouts in a single arena. Find it in Multiplayer Match setup or the private match map picker.

## Random picks and private lobbies
The Play screen has a Random mode card and a Random map card. Pick them and a new combination is rolled every time you select Find Match. The private match host also has Random mode and Random map in the dropdowns. Multiplayer matchmaking fills unused seats with game bots.
Private lobbies stay connected after a match. The host picks a mode and map again and presses Start match. Use Leave lobby to disconnect.

**Party** on the home screen or menu creates a reusable six-character code for up to four players. The leader can switch between modes and deploy everyone together into the same Multiplayer, Zombies, or Stormwatch session. Teammates stay together in team-based Multiplayer modes. Returning from a match keeps the party connected.

## Zombies

Perk machines and wall weapons vary by map. Hollow Estate has Crypt Tonic, which boosts melee damage by 50% and restores 25 health on a melee kill with a 3-second cooldown. London has Linebreaker Soda, which lets gunfire penetrate to a second zombie for 40% damage. The 1 Room Challenge has Bolt Brew, which makes its rebuilt boards last 50% longer. A full rebuild arms a two-second stun that fires when the final reinforced board breaks.
Survive endless rounds in the Hollow Estate, an abandoned and half-collapsed mansion: four ruined wings (Foyer, Ballroom, Conservatory, Kitchen) joined by four locked doors. Walls are 8 high, doors are 8 high, wall jumps are disabled and nothing can be mantled above 2.6, so nobody can climb out. Each wing has broken partition walls, rubble to jump on, wrecked furniture, rafters open to the sky and its own lighting that comes from real objects (a floor lamp, a fallen chandelier, burning barrels, a lantern on the fountain, a wall sconce) instead of floating lights. You start in the first wing with the 1911 and 500 points.
- Points: 10 per hit; kills pay 50 (60 with explosives or the RayGun), 100 for a headshot kill and 130 for a knife kill. The knife kills in one hit up to round 2, then loses effectiveness gradually: it takes about 2 swings in round 3, 4 in round 6, 7 in round 12 and tops out at 20 swings from round 35.
- Rounds and waves: each round has more zombies than the last and they spawn in waves from the wings you have opened. All ammo is restocked at the start of every round.
- Zombies get stronger every round: more health (steady growth, then 7% per round after round 10), harder hits (up to 55), faster attacks and movement. Runners appear from round 6 and everything runs from round 25. Weapons do 2.2x damage to zombies (explosives 3x) so the arsenal keeps up. Every fifth round brings brutes (large, 4x health, heavy hits). Zombie colours shift from green to rotten purple to ember red as rounds go up.
- Doors (Ballroom 1000, Conservatory 1250, Kitchen 1500 and 2000) open new wings. Zombies path around walls and through doors you opened.
- Mystery Box (950, two locations): a random weapon (KN-115, SMG, Battle Rifle, Shotgun, Magnum, Machine Pistol, VMP-X, Sniper, Rocket Launcher, Coyote). The RayGun is rare (3%) and one-shots every normal zombie up to round 29; from round 30 a base RayGun no longer kills in one shot, but a Pack-a-Punched RayGun still does (until round ~49, and PaP II beyond).
- Pack-a-Punch (5000 then 10000): upgrades the weapon you are holding (damage x2.2 then x3.6, bigger magazine, faster fire).
- Perk machines (soda machines): red Vitality Cola +50 health (2500), green Quick Fizz reloads and rebuilds window boards twice as fast (3000), yellow Double Pop double damage with bullet weapons and faster fire (2000), blue Revive Soda self-revives once, doubles teammate revive speed, and doubles health regeneration after 2 seconds (500, four purchases per match), purple Stamin Fizz run 20% faster (2000), orange Mule Soda third weapon slot (4000).
- Down: you lie on the floor (low camera, slow crawl; no ragdoll) and you lose all your perks and any third weapon. With Revive Soda you get back up by yourself after 4 seconds. In solo, going down otherwise ends the run.

### Main quests

- **Hollow Estate — The Last Testament.** Read the ledger in the Foyer and break the gauntlet stasis in the Study. Nitro-dash through the seals as they open, defend their ritual rings, then enter the Court Below from the Crypt. The Hollow Steward encounter unlocks Estate Warden.
- **London — The Thirteenth Hour.** Read the maintenance docket in the Tube station, restore power, and recover the Abbey escapement. Unlock The Brew and use it to vent the condensers around Westminster. Enter the Unwound Belfry from the Palace Yard to fight the Bellkeeper for Belfry Sentinel.

The three ritual stages open on rounds 6, 10, and 15. Each has its own hold time and marked kill target. Both arena fights use the map’s quest weapon again when the boss shields go up.

### Co-op (up to 4 players)
In the Zombies menu choose Co-op lobby: the host creates a code, up to 3 friends join, the host presses Start match. The host simulates every zombie, round and door; guests see the zombies, their hits count, and the kill points come back to them. Points, perks and weapons belong to each player; doors, boxes and the Revive Soda stock are shared. Teammates cannot hurt each other.
- When a player goes down everyone else gets a PLAYER DOWN alert with a sound, a kill-feed line and a red marker with distance over the body. A teammate can revive you: hold F next to them for 2 seconds (the reviver earns 100 points). You have 45 seconds.
- Downed or bled-out players come back at the start of the next round with a pistol (points are kept).
- The run ends when everybody is down at the same time.
- The lobby stays connected after the run, like private matches.

## Camos
Two separate tracks, both usable in both modes. Multiplayer camos are earned with kills (Customize weapon in the Loadout). Zombie camos are earned with zombie kills per weapon (Rotted 25, Bile 75, Bone 150, Blood 225, Rust 300, Toxic 375), three global camos for your best round (Graveyard round 10, Wasteland round 15, Hellscape round 20) and the three animated finishers (Inferno 500 zombie kills, Necrotic 500 zombie kills on every weapon of that type, Abyss 500 zombie kills on every weapon). Any unlocked camo from either track can be picked on any weapon from either menu.
The final three of each track are live shaders that animate on the weapon: Gold (molten gold), Diamond (prismatic ice), Dark Matter (swirling nebula), Inferno (flames and lava cracks), Necrotic (toxic plasma), Abyss (a void with glowing rifts).

## Shardworks

Shardworks is a Multiplayer quarry made from individually destructible voxels. Gunfire chips through blocks, explosions open larger gaps, and structures collapse when they lose their last ground connection. The host shares the damage in online games, and each match starts with the quarry rebuilt.

## Progression and settings

Multiplayer loadouts, settings, combat records, camos, player and weapon prestige, and Battle Pass progress are stored locally on the browser origin. Customize weapons from **Loadout**. Select **Locker** to equip an operator and identity cosmetics. Private lobbies include local split screen for two connected controllers.

## Multiplayer objectives

**Hardpoint** rotates a single capture zone through the map. Hold the active zone to reach 250 points first. **Kill Confirmed** awards points for collecting enemy tags and lets teammates deny them by picking up friendly tags. **Capture the Flag** ends when a team scores three captures.
