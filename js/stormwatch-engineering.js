/* Stormwatch's engineering rules use integer coordinates on the structural grid. */
var StormwatchEngineering = (() => {
 const CELL = 3.25;
 const QUANTA = 12;
 const ARCHETYPES = ['Wall', 'Floor', 'Ramp', 'Trap', 'Cap'];
 const dimensions = piece => piece === 0 ? 3 : 2;
 const fullMask = piece => (1 << dimensions(piece) ** 2) - 1;
 const present = (mask, bit) => (mask & (1 << bit)) !== 0;
 const rotations = angle => [Math.round(Math.cos(angle)), Math.round(Math.sin(angle))];
 const elements = ['Kinetic', 'Aether', 'Scorch', 'Frost', 'Volt'];
 const advantageous = {Scorch:'Volt', Frost:'Scorch', Volt:'Frost'};
 const materialWeakness = {wood:'Scorch', stone:'Frost', metal:'Volt'};

 function damageFactor(attack, defense) {
  if (defense === 'Kinetic') return 1;
  if (attack === 'Aether') return .75;
  if (attack === 'Kinetic') return .5;
  if (defense === 'Aether') return .75;
  if (advantageous[attack] === defense) return 1;
  return attack === defense ? .67 : .25;
 }
 const structureFactor = (attack, material) => materialWeakness[material] === attack ? 2 : 1;

 function connectedMask(piece, mask) {
  const n = dimensions(piece);
  if (!Number.isInteger(mask) || mask < 1 || mask > fullMask(piece)) return false;
  const first = Math.log2(mask & -mask);
  const todo = [first];
  let seen = 0;
  while (todo.length) {
   const bit = todo.pop();
   if (present(seen, bit)) continue;
   seen |= 1 << bit;
   const x = bit % n, y = Math.floor(bit / n);
   for (const [dx, dy] of [[1,0], [-1,0], [0,1], [0,-1]]) {
    const a = x + dx, b = y + dy, i = b * n + a;
    if (a >= 0 && a < n && b >= 0 && b < n && present(mask, i) && !present(seen, i)) todo.push(i);
   }
  }
  return seen === mask;
 }

 function patchBounds(piece, bit) {
  const n = dimensions(piece), span = CELL / n;
  const x = bit % n, row = Math.floor(bit / n);
  return { u0:x * span - CELL / 2, u1:(x + 1) * span - CELL / 2,
   v0:row * span - (piece === 0 ? 0 : CELL / 2),
   v1:(row + 1) * span - (piece === 0 ? 0 : CELL / 2) };
 }
 function bitAt(piece, u, v) {
  const n = dimensions(piece);
  const inside = (value, low) => Math.max(0, Math.min(n - 1, Math.floor((value - low) * n / CELL)));
  return n * inside(v, piece === 0 ? 0 : -CELL / 2) + inside(u, -CELL / 2);
 }
 function surfaceHeight(piece, u, v) {
  if (piece === 2) return CELL / 2 - v;
  if (piece === 4) return Math.max(0, CELL / 2 - Math.max(Math.abs(u), Math.abs(v)));
  return 0;
 }
 function contacts(item) {
  const n = dimensions(item.piece), size = QUANTA / n;
  const [c, s] = rotations(item.angle);
  const ox = Math.round(item.x / CELL * QUANTA), oy = item.layer * QUANTA, oz = Math.round(item.z / CELL * QUANTA);
  const result = new Set();
  for (let i = 0; i < n * n; i++) {
   if (!present(item.mask, i)) continue;
   const left = (i % n) * size - QUANTA / 2;
   const bottom = Math.floor(i / n) * size - (item.piece === 0 ? 0 : QUANTA / 2);
   for (let x = 0; x <= size; x++) for (let y = 0; y <= size; y++) {
    if (x > 0 && x < size && y > 0 && y < size) continue;
    const u = left + x, v = bottom + y;
    let ly = v, w = 0;
    if (item.piece !== 0) {
     ly = Math.round(surfaceHeight(item.piece, u / QUANTA * CELL, v / QUANTA * CELL) * QUANTA / CELL);
     w = v;
    }
    result.add((ox + c * u + s * w) + ',' + (oy + ly) + ',' + (oz - s * u + c * w));
   }
  }
  return result;
 }
 const anchored = port => port.split(',')[1] === '0';

 function supportIndex(items) {
  const ports = new Map(), neighbors = new Map(), roots = [];
  for (const item of items) {
   neighbors.set(item, new Set());
   const keys = item.contacts;
   if ([...keys].some(anchored)) roots.push(item);
   const shared = new Map();
   for (const key of keys) {
    const occupants = ports.get(key);
    if (occupants) {
     for (const other of occupants) shared.set(other, (shared.get(other) || 0) + 1);
     occupants.push(item);
    } else ports.set(key, [item]);
   }
   for (const [other, count] of shared) if (count >= 2) {
    neighbors.get(item).add(other);
    neighbors.get(other).add(item);
   }
  }
  const supported = new Set(roots), queue = roots.slice();
  for (let i = 0; i < queue.length; i++) for (const next of neighbors.get(queue[i])) {
   if (supported.has(next)) continue;
   supported.add(next);
   queue.push(next);
  }
  return {ports, supported, neighbors};
 }

 function canSupport(keys, index) {
  const shared = new Map();
  for (const key of keys) {
   if (anchored(key)) return true;
   for (const other of index.ports.get(key) || []) if (index.supported.has(other)) {
    const count = (shared.get(other) || 0) + 1;
    if (count >= 2) return true;
    shared.set(other, count);
   }
  }
  return false;
 }

 const recipes = [
  {name:'Trench Spikes', id:'spikes', mount:'floor', cost:[10,0,6], range:1.55, reload:2.3, charges:18, element:'Kinetic'},
  {name:'Tar Pit', id:'tar', mount:'floor', cost:[8,10,0], range:1.42, reload:3.8, charges:12, element:'Scorch'},
  {name:'Launch Pad', id:'launch', mount:'floor', cost:[4,7,13], range:1.28, reload:4.5, charges:12, element:'Kinetic'},
  {name:'Flame Grill', id:'grill', mount:'floor', cost:[4,10,14], range:1.86, reload:4, charges:12, element:'Scorch'},
  {name:'Dart Volley', id:'darts', mount:'wall', cost:[11,0,11], range:3*CELL, reload:3.6, charges:16, element:'Kinetic'},
  {name:'Cannonade', id:'cannon', mount:'wall', cost:[6,9,19], range:6.6, reload:5.3, charges:10, element:'Kinetic'},
  {name:'Repulsor Piston', id:'piston', mount:'wall', cost:[6,5,15], range:2.32, reload:4.3, charges:13, element:'Kinetic'},
  {name:'Dynamo Grid', id:'dynamo', mount:'wall', cost:[3,8,17], range:2.15, reload:4, charges:13, element:'Volt'},
  {name:'Miasma Diffuser', id:'miasma', mount:'ceiling', cost:[7,10,12], range:2.9, reload:5, charges:12, element:'Aether'},
  {name:'Arc Coil', id:'coil', mount:'ceiling', cost:[2,12,19], range:1.5*CELL, reload:5.6, charges:10, element:'Volt'},
  {name:'Tire Dropper', id:'tires', mount:'ceiling', cost:[6,9,14], range:2.25, reload:6.2, charges:9, element:'Kinetic'}
 ];

 return {CELL, ARCHETYPES, dimensions, fullMask, present, connectedMask, patchBounds, bitAt, surfaceHeight,
  contacts, supportIndex, canSupport, elements, damageFactor, structureFactor, recipes};
})();
