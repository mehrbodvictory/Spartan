# Spartan Drill scripting API

Use a v3 .sdmod to run JavaScript in the local Multiplayer and Zombies engine. Install the file in **Mods**, select **Launch**, then start a match from one of those modes. The [Vehicle Workshop example](../examples/vehicle-workshop.sdmod) opens on **V**. Its HUD button is clickable with the pointer unlocked, and its pause-menu entry works while paused.

## Manifest and module loading

The [full v3 JSON schema](../spartan-drill-mod-v3.schema.json) includes native content, Stormfront, standalone conversions, and legacy engine overrides. The [TypeScript declarations](spartan-mod.d.ts) describe every scripting method and event. v1 native packs and v2 packs still use their original formats.

```json
{
  "format": "spartan-drill-mod",
  "version": 3,
  "id": "my-arena",
  "name": "My Arena",
  "scripts": ["main.mjs"],
  "keybinds": {
    "arena-menu": { "key": "KeyV", "label": "Arena menu" }
  },
  "files": {
    "main.mjs": "const g = SpartanMod.game; g.events.onStart(() => g.ui.showToast('Ready'));"
  }
}
```

- `scripts` lists 1–64 distinct packaged JavaScript paths. They load as ES modules in the listed order. Import packaged helpers with `import { helper } from '@mod/helper.js'`. Static import dependencies run before their importing module. Use a packaged path in `SpartanMod.url(path)`, `readText(path)`, or `readBytes(path)`.
- `keybinds` is an optional object keyed by stable lowercase IDs. Each value has a physical key code and an optional label. Bind the declaration by ID with `game.ui.addKeybind('arena-menu', callback)`.
- `scripts` can accompany native weapons, maps, playlists, map patches, or `engine`. `entry` is for a separate custom game. `engine.patches`, `engine.replace`, `engine.scripts`, `engine.styles`, and `engine.order` remain available for source-level conversions. Keep the `sd-game-loader` script when supplying an engine page. The [source index](source-index.md) lists the shipped patch targets.
- `SpartanMod.game.version` is the API version, currently **1**. `SpartanMod.game` is available before the first v3 module runs. Match callbacks may safely access the local actor and loaded map from `onStart`. Register listeners, menu entries, default rules, and vehicle types at module scope.
- The opaque-origin conversion frame uses fresh in-memory engine settings and has no bridge to the stock profile, stock saves, or stock lobbies. `SpartanMod.load()`, `save(value)`, and `clearSave()` use the current pack’s separate save slot. Await each save operation before starting another. Use structured-cloneable data. A declared `connections` origin enables the mod’s own HTTPS/WSS endpoint, subject to browser CORS. Stock origins and PeerJS signaling domains are blocked. A local engine match is defined by its Multiplayer or Zombies ruleset. It runs without lobby matchmaking, stock split-screen, or stock progression.

## Conventions and lifetime

Positions, velocity, and size use `[x, y, z]` in world units and world units per second. Y is vertical. Angles are in radians except camera field of view, which is in degrees. Vehicle, player, and bot positions use their base as the origin. Primitive models and collider rectangles are centered at their supplied positions. Colors accept a numeric RGB value or six-digit hex string.

Read methods return snapshots. Change the game through the setter methods. Spawning, teleporting, assigning weapons, and changing live entities require an active match and throw when called outside it. A missing entity or unsupported setter generally returns `false`; an unknown getter returns `null`. Invalid arguments throw. The local player ID is always `'player'`. Bot and runtime object IDs belong to the current match. Objects, seats, actor-specific settings, and camera overrides clear at match change. Rules, gravity, visual map overrides, vehicle definitions, registered controls, and global NPC defaults last until the pack is unloaded.

## Events

Register with `game.events.onEvent(listener)` and call the returned function to unsubscribe. Listeners run in registration order. The engine catches and logs callback errors. It does not wait for promises before advancing simulation.

| Event | Callback receives | Timing |
| --- | --- | --- |
| `onStart` | `{mode, map, time}` | The selected map, loadout, and initial actors are ready. You can spawn objects and configure the match. |
| `onTick` | `dt, {mode, map, time}` | Once per unpaused simulation step, before stock movement. Time values are in seconds. |
| `onRender` | `{dt, mode, map, time, camera}` | Before an active match frame is drawn, including paused frames. May set the camera for the upcoming frame. |
| `onPlayerSpawn` | Player entity snapshot | Initial spawn, respawn, or Zombies revive. |
| `onPlayerDeath` | Player entity snapshot | After the player dies or is downed. |
| `onBotSpawn` | Bot entity snapshot | On the next simulation step or at match start, after NPC configuration. |
| `onDamage` | `{target, source, weapon, amount, reason}` | Before applying supported player, bot, zombie, and vehicle combat damage. Return a finite amount to replace it, or `0` to cancel it. Direct health setters and scripted stock eliminations can bypass damage. |
| `onKeyDown`, `onKeyUp` | `{code, key, repeat, alt, ctrl, shift, meta}` | Physical keyboard input while the match exists, including paused state. Text inputs keep their keys. |
| `onMatchEnd` | `{mode, map, time, result, score}` | When the game records a result or the player leaves the match. Leaving early reports `Abandoned` and clears the match objects. |

## Entities and NPCs

`game.entities` exposes `list({type?, team?, alive?})`, `get(id)`, `spawn(type, position, options?)`, and `despawn(id)`. Spawnable types are `bot`, `zombie`, `prop`, `model`, `light`, `collider`, and `vehicle`. A zombie requires Zombies mode. A vehicle spawn needs its registered ID in `options.vehicle`. A collider needs `options.size`. `player` is a queryable entity.

Each snapshot includes `id`, `type`, `name`, `position`, `velocity`, `health`, `maxHealth`, `team`, `model`, and `alive`. Use `getPosition/setPosition`, `getVelocity/setVelocity`, `getHealth/setHealth`, `getTeam/setTeam`, and `getModel/setModel` with an entity ID. Use `setMaxHealth(id, health, refill?)` to raise or lower the cap and optionally refill health. Assigning an actor position releases its vehicle seat. Assigning an NPC velocity gives its movement to the script until the NPC respawns or is removed. A model descriptor accepts `box`, `cylinder`, `sphere`, `cone`, or a packaged Wavefront OBJ, plus `size` and `color`. OBJ geometry is centered and fitted to the requested size. Passing `null` restores an actor’s stock appearance or a vehicle’s built-in visuals. A local player model shows with an external camera position. In team modes the local team is `A` or `B`.

`game.bots` exposes:

| Method | Behaviour |
| --- | --- |
| `list()`, `spawn(position, options?)`, `remove(id)` | Manage local NPCs, with up to 64 at a time. Spawn defaults to a zombie for Zombies and a combat bot for Multiplayer. Options include `type`, `name`, `health`, `shield`, `team`, `model`, `weapon`, `difficulty`, `brute`, and `behaviour`. |
| `setEnabled(boolean)`, `isEnabled()` | Pause or resume NPC AI. Existing actors stay in the world. Pausing AI also pauses native survival-wave spawning. |
| `setCount(number \| null)`, `getCount()` | Maintain a count of 0–64 live actors, replacing dead actors while active. In Zombies and Survival this takes over wave spawning. Pass `null` to return to stock spawn rules. |
| `setBehaviour(id, value)` | `normal` uses native AI, `passive` moves without attacking, and `idle` leaves the NPC in place. A callback receives `(bot, dt)` in place of its native AI. Use `null` for the default. Stock quest actors use additional encounter rules. |
| `setWeapons(id, ids)` | Give a combat bot a weapon from a list of 1–32 stock IDs or `@custom-id` references. Pass `null` to set the default pool. Native Zombies use melee or their encounter attacks. |

## Player and camera

`game.player` exposes `get()`, `getPosition()`, `getHealth()`, `setHealth(health)`, `setMaxHealth(health, refill?)`, `teleport(position)`, `getWeapons()`, `setWeapons(loadout)`, `equipWeapon(id)`, `getCamera()`, `setCamera(settings)`, and `getInput()`.

Set a loadout of 1–8 entries with weapon IDs or `{id, magazine?, reserve?}`. `getWeapons()` returns each ID, current and maximum magazine, reserve, equipped status, and Pack-a-Punch tier. `getInput()` returns physical keys, fire, aim, pause, and pointer lock state. For a camera override, set a world-space `position`, a look-at `target`, an `fov`, or a first-person `yaw` and `pitch`. `getCamera()` returns the displayed position and field of view alongside the player’s aim angles. Use `setCamera(null)` to clear the override. Stock scripted cinematics have camera priority.

## Vehicles

`game.vehicles.registerVehicle({id, name, model?, stats?})` registers a type through the same system as the built-in `sports-car`, `truck`, and `bike`. Supply a custom primitive or packaged OBJ in `model`, or omit it to use the built-in body scaled to `stats.size`. Up to 64 types may be registered.

```js
const game = SpartanMod.game;
game.vehicles.registerVehicle({
  id: 'service-van',
  name: 'Service Van',
  stats: { size: [2.1, 1.9, 4.4], seats: 4, topSpeed: 17, health: 650 }
});
game.events.onStart(() => {
  const [x, y, z] = game.player.getPosition();
  game.vehicles.spawn('service-van', [x + 4, y, z], { color: '#5b9b89' });
});
```

| Method or option | Behaviour |
| --- | --- |
| `spawn(type, position, options?)` | Spawns up to 32 vehicles per match. Options include heading, paint color, name, team, health, and a model override. Use clear ground. |
| `enter(id, seat=0, occupant='player')`, `exit(occupant='player')` | Seats are zero-indexed. Seat 0 controls the vehicle when occupied by the local player. Scripted NPCs can occupy seats and travel with the vehicle. Entry requires a nearby, living actor and a free seat. |
| `list()`, `get(id)`, `types()`, `getSeat(occupant?)` | Read instances, registered types, occupant IDs, speed, heading, or an actor’s current seat. |
| `damage(id, amount)`, `remove(id)` | Damage or despawn a vehicle. Bullets, explosions, crashes, and impacts directed at the rider can hurt it. Destruction releases occupants. |
| `stats` | `size`, `health`, `seats` (1–8), `topSpeed`, `reverseSpeed`, `acceleration`, `steering`, `traction`, `brake`, and `crashDamage`. |

Press the game’s **Interact** key (F by default) beside a vehicle to enter or exit. Use **WASD** or arrows to drive and **Space** to brake. The renderer switches to a chase camera. Vehicles have acceleration, coasting, reversing, steering, ground collision, and impact damage. Scripted NPCs can ride, and scripts control their vehicles by setting velocity or position.

## World and rules

`game.world` provides `addCollider(position, size)`, `addModel(position, model, options?)`, `addLight(position, options?)`, `addProp(position, model, {collidable?})`, `remove(id)`, and the typed removal methods `removeCollider`, `removeModel`, `removeLight`, and `removeProp`. Collidable props use a non-rotating box. Lights are point lights with color, intensity, and distance. These functions manage objects added through the API. Use `mapPatches` to replace authored stock obstacles. Up to 512 runtime objects can be present.

`getMap()` identifies the selected map and ruleset. `groundHeight(x, z, ceiling?)` finds a collision surface below the supplied ceiling. Use `isAreaClear(position, size, heading?)` to check a base-anchored volume against map boundaries, colliders, and parked vehicles before spawning. Set gravity with `setGravity(value)`, and use `getGravity()` to read it. `setTimeOfDay(hour)` controls outdoor ambient lighting, tint, and sky from hours 0–24. `setMapSettings({skyColor?, fogColor?, fogNear?, fogFar?, ambient?})` changes visuals and `getMapSettings()` reads the overrides. Pass `null` to restore stock defaults for those settings or individual fields.

`game.rules.get(name)`, `set(name, value)`, and `list()` cover the following settings. Pass `null` to clear an override.

| Rule | Effect |
| --- | --- |
| `scoreLimit` | Winning score in Slayer and score-based team modes. Use an integer from 1–100,000. |
| `speed` | Player movement multiplier from 0.05–10. |
| `damageMultiplier` | Global multiplier from 0–20. |
| `playerDamageMultiplier`, `botDamageMultiplier`, `vehicleDamageMultiplier` | Target-specific multiplier from 0–20, applied after the global multiplier. |

## HUD and pause menu

`game.ui.addHudButton(label, callback)` and `addPauseMenuEntry(label, callback)` return removal functions. A pointer-locked player can use a keybind or open the pause menu to reach the buttons. `addMenu({title, description?, closeLabel?, items?})` returns a controller with `open()`, `close()`, `toggle()`, `isOpen`, `addButton(label, callback)`, and `remove()`. Menu items can also be provided as `{label, onClick}` objects. The modal pauses local simulation while open. When the browser requires a fresh gesture to capture the pointer, **Resume** remains available.

Use `addKeybind(idOrCode, callback)` for declared keys or direct `KeyboardEvent.code` values. Bare letters and digits normalize to physical codes such as `KeyV` and `Digit1`. A registered binding takes precedence over the stock action for that physical key during the match. Hold repeats are ignored. `game.ui.keybinds` gives declared labels and defaults, and `showToast(text, seconds=2.5)` shows a transient status message.

## Debugging and compatibility

Open browser developer tools for the isolated frame to see module errors and event callback errors. Keep source overrides small and use the API for state and lifecycle hooks. `engine.patches` applies exact string replacements and rejects a mismatched expected count. `engine.order` replaces the stock script order. If you supply a custom engine and want `SpartanMod.game`, keep the stock functions used by the adapter. An engine-only conversion can provide its own order and gameplay without the adapter. The launcher fills in the engine files from the installed game automatically. It reads served files on HTTP or HTTPS and uses the bundled source when opened from disk. Pack only your mod’s files and explicit overrides. When releasing an edited copy of the game, run `node tools/build-engine-source.cjs` to update its bundle for local launches.
