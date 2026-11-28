/** Ambient declarations for the Spartan Drill .sdmod v3 runtime. */
declare const SpartanMod: SpartanDrill.ModRuntime;

declare namespace SpartanDrill {
  type Vec3 = readonly [x: number, y: number, z: number];
  type Color = number | `#${string}`;
  type EntityId = string;
  type Remove = () => void;
  type Listener<T extends unknown[] = []> = (...args: T) => void | Promise<void>;
  type EntityType = 'player' | 'bot' | 'zombie' | 'model' | 'prop' | 'light' | 'collider' | 'vehicle';
  type Primitive = 'box' | 'sphere' | 'cylinder' | 'cone';

  interface ModRuntime {
    readonly id: string;
    readonly name: string;
    readonly files: readonly string[];
    readonly game?: Game;
    readonly content: Readonly<{
      weapons: readonly unknown[];
      maps: readonly unknown[];
      playlists: readonly unknown[];
      mapPatches: readonly unknown[];
    }>;
    readonly engine?: Readonly<{
      start(): void;
      has(path: string): boolean;
      keybinds: Readonly<Record<string, Keybind>>;
    }>;
    url(path: string): string;
    readText(path: string): string;
    readBytes(path: string): Uint8Array;
    load<T = unknown>(): Promise<T | undefined>;
    save(value: unknown): Promise<void>;
    clearSave(): Promise<void>;
  }

  interface MatchContext {
    readonly mode: string;
    readonly map: string;
    readonly time: number;
  }

  interface MatchEnd extends MatchContext {
    readonly result: string;
    readonly score: number;
  }

  interface RenderContext extends MatchContext {
    readonly dt: number;
    readonly camera: Camera;
  }

  interface KeyEvent {
    readonly code: string;
    readonly key: string;
    readonly repeat: boolean;
    readonly alt: boolean;
    readonly ctrl: boolean;
    readonly shift: boolean;
    readonly meta: boolean;
  }

  interface DamageEvent {
    readonly target: EntityId;
    readonly source: EntityId | null;
    readonly weapon: string | null;
    readonly reason: 'weapon' | 'actor' | 'environment' | 'occupant' | 'explosion' | 'collision' | 'script';
    readonly amount: number;
  }

  interface Events {
    onStart(listener: Listener<[match: MatchContext]>): Remove;
    onTick(listener: Listener<[dt: number, match: MatchContext]>): Remove;
    onRender(listener: Listener<[frame: RenderContext]>): Remove;
    onPlayerSpawn(listener: Listener<[player: Entity]>): Remove;
    onPlayerDeath(listener: Listener<[player: Entity]>): Remove;
    onBotSpawn(listener: Listener<[bot: Entity]>): Remove;
    onDamage(listener: (damage: DamageEvent) => number | void): Remove;
    onKeyDown(listener: Listener<[key: KeyEvent]>): Remove;
    onKeyUp(listener: Listener<[key: KeyEvent]>): Remove;
    onMatchEnd(listener: Listener<[match: MatchEnd]>): Remove;
  }

  type Model = {
    size?: Vec3;
    color?: Color;
  } & (
    | { primitive?: Primitive; file?: never }
    | { primitive?: 'obj'; file: string }
  );

  type ModelSnapshot = Readonly<{
    primitive: Primitive | 'obj';
    size: Vec3;
    color: number;
    file?: string;
  }>;

  interface Entity {
    readonly id: EntityId;
    readonly type: EntityType;
    readonly name: string;
    readonly position: Vec3;
    readonly velocity: Vec3;
    readonly health: number | null;
    readonly maxHealth: number | null;
    readonly team: string;
    readonly model: ModelSnapshot | null;
    readonly alive: boolean;
  }

  interface EntityFilter {
    type?: EntityType;
    team?: string;
    alive?: boolean;
  }

  interface ObjectOptions {
    name?: string;
    team?: string;
    health?: number;
  }

  interface VisualOptions extends ObjectOptions {
    heading?: number;
    velocity?: Vec3;
  }

  interface BotSpawnOptions {
    type?: 'bot' | 'zombie';
    name?: string;
    health?: number;
    shield?: number;
    team?: string;
    model?: Model | null;
    weapon?: string;
    difficulty?: number;
    brute?: boolean;
    behaviour?: BotBehaviour;
  }

  interface Entities {
    spawn(type: 'bot' | 'zombie', position: Vec3, options?: BotSpawnOptions): EntityId;
    spawn(type: 'prop' | 'model', position: Vec3, options?: VisualOptions & { model?: Model }): EntityId;
    spawn(type: 'light', position: Vec3, options?: LightOptions): EntityId;
    spawn(type: 'collider', position: Vec3, options: { size: Vec3 }): EntityId;
    spawn(type: 'vehicle', position: Vec3, options: VehicleOptions & { vehicle: string }): EntityId;
    despawn(id: EntityId): boolean;
    list(filter?: EntityFilter): Entity[];
    get(id: EntityId): Entity | null;
    getPosition(id: EntityId): Vec3 | null;
    setPosition(id: EntityId, position: Vec3): boolean;
    getVelocity(id: EntityId): Vec3 | null;
    setVelocity(id: EntityId, velocity: Vec3): boolean;
    getHealth(id: EntityId): number | null;
    setHealth(id: EntityId, health: number): boolean;
    setMaxHealth(id: EntityId, health: number, refill?: boolean): boolean;
    getTeam(id: EntityId): string | null;
    setTeam(id: EntityId, team: string): boolean;
    getModel(id: EntityId): ModelSnapshot | null;
    setModel(id: EntityId, model: Model | null): boolean;
  }

  type BotBehaviour = 'normal' | 'passive' | 'idle' | Listener<[bot: Entity, dt: number]>;

  interface Bots {
    list(): Entity[];
    spawn(position: Vec3, options?: BotSpawnOptions): EntityId;
    remove(id: EntityId): boolean;
    setEnabled(enabled: boolean): void;
    isEnabled(): boolean;
    setCount(count: number | null): void;
    getCount(): number | null;
    setBehaviour(id: EntityId | null, behaviour: BotBehaviour): boolean;
    setWeapons(id: EntityId | null, weapons: readonly string[]): boolean;
  }

  interface Camera {
    readonly position: Vec3;
    readonly yaw: number;
    readonly pitch: number;
    readonly fov: number;
  }

  interface CameraSettings {
    position?: Vec3 | null;
    target?: Vec3 | null;
    fov?: number | null;
    yaw?: number;
    pitch?: number;
  }

  interface Input {
    readonly keys: readonly string[];
    readonly fire: boolean;
    readonly aim: boolean;
    readonly paused: boolean;
    readonly pointerLocked: boolean;
  }

  interface Weapon {
    readonly id: string;
    readonly magazine: number;
    readonly reserve: number;
    readonly maxMagazine: number;
    readonly equipped: boolean;
    readonly packAPunch: number;
  }

  type WeaponSelection = string | { id: string; magazine?: number; reserve?: number };

  interface Player {
    readonly id: 'player';
    get(): Entity | null;
    getPosition(): Vec3 | null;
    teleport(position: Vec3): boolean;
    getHealth(): number | null;
    setHealth(health: number): boolean;
    setMaxHealth(health: number, refill?: boolean): boolean;
    getWeapons(): Weapon[];
    setWeapons(weapons: readonly WeaponSelection[]): Weapon[];
    equipWeapon(id: string): boolean;
    getCamera(): Camera;
    setCamera(settings: CameraSettings | null): void;
    getInput(): Input;
  }

  interface VehicleStats {
    size: Vec3;
    seats: number;
    health: number;
    topSpeed: number;
    acceleration: number;
    reverseSpeed: number;
    steering: number;
    traction: number;
    brake: number;
    crashDamage: number;
  }

  interface VehicleDefinition {
    id: string;
    name: string;
    model?: Model | null;
    stats?: Partial<VehicleStats>;
  }

  interface VehicleType {
    readonly id: string;
    readonly name: string;
    readonly model: ModelSnapshot | null;
    readonly stats: Readonly<VehicleStats>;
  }

  interface VehicleOptions extends ObjectOptions {
    heading?: number;
    color?: Color;
    model?: Model | null;
  }

  interface Vehicle extends Entity {
    readonly type: 'vehicle';
    readonly vehicle: string;
    readonly heading: number;
    readonly speed: number;
    readonly seats: readonly (EntityId | null)[];
  }

  interface Vehicles {
    registerVehicle(definition: VehicleDefinition): string;
    spawn(type: string, position: Vec3, options?: VehicleOptions): EntityId;
    enter(id: EntityId, seat?: number, occupant?: EntityId): boolean;
    exit(occupant?: EntityId): boolean;
    get(id: EntityId): Vehicle | null;
    list(): Vehicle[];
    types(): VehicleType[];
    getSeat(occupant?: EntityId): Readonly<{ id: EntityId; seat: number }> | null;
    damage(id: EntityId, amount: number): boolean;
    remove(id: EntityId): boolean;
  }

  interface LightOptions {
    color?: Color;
    intensity?: number;
    distance?: number;
  }

  interface MapSettings {
    skyColor?: Color | null;
    fogColor?: Color | null;
    fogNear?: number | null;
    fogFar?: number | null;
    ambient?: number | null;
  }

  interface World {
    addCollider(position: Vec3, size: Vec3): EntityId;
    addModel(position: Vec3, model: Model, options?: VisualOptions): EntityId;
    addLight(position: Vec3, options?: LightOptions): EntityId;
    addProp(position: Vec3, model: Model, options?: VisualOptions & { collidable?: boolean }): EntityId;
    remove(id: EntityId): boolean;
    removeCollider(id: EntityId): boolean;
    removeLight(id: EntityId): boolean;
    removeModel(id: EntityId): boolean;
    removeProp(id: EntityId): boolean;
    getGravity(): number;
    setGravity(value: number | null): void;
    getTimeOfDay(): number | null;
    setTimeOfDay(hour: number | null): void;
    getMapSettings(): Readonly<MapSettings>;
    setMapSettings(settings: MapSettings | null): void;
    getMap(): Readonly<{ id: string; name: string; mode: string; halfSize: number; zombies: boolean }>;
    groundHeight(x: number, z: number, ceiling?: number): number;
    isAreaClear(position: Vec3, size: Vec3, heading?: number): boolean;
  }

  type Rule = 'scoreLimit' | 'speed' | 'damageMultiplier'
    | 'playerDamageMultiplier' | 'botDamageMultiplier' | 'vehicleDamageMultiplier';

  interface Rules {
    get(field: 'scoreLimit'): number | null;
    get(field: Exclude<Rule, 'scoreLimit'>): number;
    get(field: Rule): number | null;
    set(field: Rule, value: number | null): void;
    list(): Readonly<Record<Rule, number | null>>;
  }

  interface Keybind {
    readonly key: string;
    readonly label?: string;
  }

  interface MenuOptions {
    title: string;
    description?: string;
    closeLabel?: string;
    items?: readonly { label: string; onClick: Listener }[];
  }

  interface Menu {
    readonly isOpen: boolean;
    open(): boolean;
    close(): boolean;
    toggle(): boolean;
    addButton(label: string, onClick: Listener): Remove;
    remove(): void;
  }

  interface UI {
    readonly keybinds: Readonly<Record<string, Keybind>>;
    addHudButton(label: string, onClick: Listener): Remove;
    addPauseMenuEntry(label: string, onClick: Listener): Remove;
    addMenu(options: MenuOptions): Menu;
    addKeybind(keyOrId: string, callback: Listener<[key: KeyEvent]>): Remove;
    showToast(message: string, duration?: number): void;
  }

  interface Game {
    readonly version: 1;
    readonly events: Events;
    readonly entities: Entities;
    readonly bots: Bots;
    readonly player: Player;
    readonly vehicles: Vehicles;
    readonly world: World;
    readonly rules: Rules;
    readonly ui: UI;
  }
}
