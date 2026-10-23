/* ===================== sk_data.js ===================== */
/* ---------- killstreaks: the table (name, category, kills needed, unlock level, description) and a 3D model for every one of them.
   The models are used in the world (placed devices, aircraft, drones, crates) and rendered into the icons of the Killstreaks screen. ---------- */
const SKC=['Radar & Reconnaissance','Disruption & Electronic Warfare','Supply & Team Support','Traps & Remote Explosives','Sentry Turrets & Ground Robotics','Guided Missiles & Guided Bombs','Directed Bombardments & Air Strikes','Choppers & Heavy Gunships','Armored Suits & Reinforcements','Heavy Infantry Weapons','Orbital Space Weapons','Game-Ending Nuke'];
/* id, name, category index, kills, unlock level, description */
const STK_=[
 ['uav','UAV',0,3,1,'Pings basic enemy locations as periodic dots on the mini-map.'],
 ['advuav','Advanced UAV',0,5,6,'Shows real-time enemy positions and the direction they are facing, with no radar delay.'],
 ['pradar','Personal Radar',0,4,3,'A small drone that follows you and scans for enemies in your immediate proximity.'],
 ['motion','Motion Sensor',0,3,2,'A placeable field device that highlights enemies moving within its radius on the mini-map.'],
 ['cuav','Counter-UAV',1,4,4,'Jams and scrambles the enemy team\'s mini-map. Enemies react slower and lose track of you.'],
 ['emp','EMP',1,9,22,'Temporarily shuts down all enemy electronics, HUD, red-dots and active scorestreaks map-wide.'],
 ['flak','Flak Guns',1,6,12,'Automatically shoots down active enemy air support and prevents new air assets from being called in.'],
 ['care','Care Package',2,4,1,'Drops a single crate containing a random streak or heavy weapon.'],
 ['airdrop','Emergency Airdrop',2,7,16,'Calls in a cargo plane to drop multiple Care Packages at once.'],
 ['vests','Ballistic Vests',2,5,8,'Drops a crate of body armor to increase your health pool.'],
 ['ammo','Ammo Crate',2,3,2,'Drops a supply crate that replenishes ammunition and explosive equipment.'],
 ['sim','S.I.M.',3,5,9,'A deployable explosive module that automatically launches airburst anti-personnel charges when enemies draw near.'],
 ['dcvt','DC-VT',3,5,5,'A small, fast, remote-controlled car packed with explosives that you detonate manually.'],
 ['bombdrone','Bomb Drone',3,6,13,'A low-flying remote quadcopter that explodes on your command.'],
 ['hunter','Hunter Killer Drone',3,5,7,'An autonomous mini-drone that seeks out and crashes into the nearest enemy.'],
 ['sentry','Sentry Gun',4,6,10,'An automated tripod-mounted machine gun that targets enemies in its line of sight.'],
 ['shieldt','Shield Turret',4,7,18,'A heavy machine gun turret fitted with a bulletproof head-shield.'],
 ['pal','PAL Turret',4,6,15,'An automated surface-to-air missile battery that shoots down enemy aircraft.'],
 ['guardian','Guardian',4,8,24,'A microwave dish turret that emits a cone of heat, slowing, disorienting and damaging enemies.'],
 ['groundsis','Groundsis',4,8,28,'An armored ground rover equipped with an airburst turret that follows you.'],
 ['terminator','Terminator Missile',5,7,19,'High-altitude guided missile you steer directly down into enemy clusters.'],
 ['glide','Glide Boom',5,8,26,'A heavy free-fall guided bomb dropped from the sky.'],
 ['knight','Knight Rockets',5,7,20,'Handheld remote-controlled rockets steered in first person with limited fuel.'],
 ['gilded','GildedBird',5,9,32,'A remote-controlled stealth drone capable of firing individual micro-missiles.'],
 ['precision','Precision Airstrike',6,7,1,'Jet fighters sweep across a targeted linear strip of the map.'],
 ['mortar','Mortar Strike',6,6,11,'Heavy mortar shell bombardment on multiple map coordinates.'],
 ['stealth','Stealth Bomber',6,11,34,'A B-2 bomber, invisible to enemy radar, carpet-bombs a massive section of the map.'],
 ['napalm','Napalm Strike',6,9,30,'An aerial bomb drop that coats a strip of land in lingering fire.'],
 ['dogs','Attack Dogs',6,8,21,'A pack of lethal AI hunting dogs spawns to hunt down enemies.'],
 ['achopper','Attack Chopper',7,8,17,'An automated helicopter that patrols the map and shoots nearby enemies.'],
 ['gunner','Chopper Gunner',7,10,27,'You manually operate a heavy turret from the side door of a circling helicopter.'],
 ['dc260','DC-260',7,12,36,'You control the 105mm, 40mm and 25mm cannons from a high-altitude gunship.'],
 ['overwatch','Overwatch',7,9,29,'An armored chopper that follows and protects you.'],
 ['tolv','TOLV Planet',7,11,38,'A hover-capable fighter jet that drops bombs then hovers to auto-engage enemies.'],
 ['cube','Cube Turret Gunner',7,13,42,'You operate a 360-degree underbelly turret from a flying fortress bomber.'],
 ['jugg','Juggernaut',8,10,25,'An armored suit with a minigun and boosted health.'],
 ['goliath','Goliath',8,13,40,'A heavy mechanized battle suit with continuous miniguns and a self-destruct.'],
 ['para','Paratroopers',8,9,23,'An AI squad of soldiers drops into the map to fight alongside you.'],
 ['guarddog','Guard Dog',8,6,14,'A companion dog that follows you, guarding your back and attacking flankers.'],
 ['fear','Fear Machine',9,9,31,'A handheld multi-barrel minigun with a huge firing rate.'],
 ['boom','Boom Machine',9,8,33,'A semi-automatic handheld grenade launcher.'],
 ['flame','Flamethrower',9,8,35,'A portable incendiary weapon that incinerates close-quarters targets.'],
 ['satellite','Super Satellite',10,14,44,'Space station: kinetic rod strikes, smoke canisters and a tactical supply drop.'],
 ['annihil','Annihilation',10,15,48,'An orbital high-energy particle beam that burns everything it sweeps over.'],
 ['nuke','Nuke',11,25,52,'High-tier streak: detonates a weapon of mass destruction that ends the match in victory.']];
const STK={},STKL=[];for(const[id,n,c,k,lv,d]of STK_){STK[id]={id,n,c,k,lv,d};STKL.push(STK[id]);if(typeof UNL!='undefined')UNL['sk:'+id]=lv}
const SK_DEF=['uav','care','precision'];

/* ---------- models ---------- */
function skModel(id){const g=new THREE.Group(),M={},mat=c=>M[c]||(M[c]=new THREE.MeshLambertMaterial({color:c})),em=c=>M['e'+c]||(M['e'+c]=new THREE.MeshBasicMaterial({color:c}));
 const B=(w,h,d,x,y,z,c,rx,ry,rz)=>{const m=new THREE.Mesh(bg,typeof c=='object'?c:mat(c));m.scale.set(w,h,d);m.position.set(x,y,z);m.rotation.set(rx||0,ry||0,rz||0);g.add(m);return m},
  Cy=(r,len,x,y,z,c,ax,rt)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(rt==null?r:rt,r,len,16),typeof c=='object'?c:mat(c));if(ax=='z')m.rotation.x=Math.PI/2;else if(ax=='x')m.rotation.z=Math.PI/2;m.position.set(x,y,z);g.add(m);return m},
  Sp=(r,x,y,z,c,sx,sy,sz)=>{const m=new THREE.Mesh(sg,typeof c=='object'?c:mat(c));m.scale.set(r*(sx||1),r*(sy||1),r*(sz||1));m.position.set(x,y,z);g.add(m);return m},
  Co=(r,len,x,y,z,c,ax)=>{const m=new THREE.Mesh(new THREE.ConeGeometry(r,len,14),typeof c=='object'?c:mat(c));if(ax=='z')m.rotation.x=Math.PI/2;else if(ax=='-z')m.rotation.x=-Math.PI/2;m.position.set(x,y,z);g.add(m);return m},
  rotor=(x,y,z,r,c)=>{Cy(.03,.05,x,y,z,0x222222);Cy(r,.012,x,y+.03,z,c||0x333840)},
  GRY=0x6a7078,DK=0x2a2d32,TAN=0xb8a070,OLV=0x4a5a38,RED=0xc0392b,ORG=0xd9822b,BLK=0x16181b,WHT=0xd8d8d0,STE=0x9aa0a8;
 const wheel=(x,y,z,r)=>{Cy(r,.1,x,y,z,0x151515,'x')},dish=(x,y,z,r,c)=>{Co(r,r*.5,x,y,z,c||WHT,'z')};
 const legs=(x,z,h,sp,c)=>{for(const a of[0,2.09,4.19])Cy(.02,h,x+Math.cos(a)*sp*.5,h/2,z+Math.sin(a)*sp*.5,c||DK).rotation.set(Math.sin(a)*.45,0,-Math.cos(a)*.45)};
 const jet=(w,l,c)=>{Cy(.35*w,l,0,0,0,c,'z',.04*w);Co(.35*w,l*.3,0,0,l*.65,c,'z');B(w*3.2,.05*w,l*.45,0,0,-.05*l,c,0,0,0);B(w*1.4,.05*w,l*.25,0,0,-.4*l,c);for(const s of[-1,1])B(.05*w,.55*w,.28*l,s*.45*w,.3*w,-.42*l,c,0,0,s*.25);B(.4*w,.28*w,.35*l,0,.28*w,.1*l,0x1b2a38)};
 const heli=(c,big)=>{const s=big?1.35:1;B(1.1*s,1.0*s,2.8*s,0,0,0,c);Sp(.6*s,0,.1*s,1.2*s,c,1,.9,1.1);B(.1*s,.1*s,2.6*s,0,.35*s,-2.4*s,c);B(.05*s,.7*s,.5*s,0,.7*s,-3.6*s,c);Cy(.05,.4,0,.65*s,0,DK);Cy(2.4*s,.03,0,.9*s,0,0x2a2e33);B(5*s,.03,.15,0,.9*s,0,0x2a2e33,0,.8);Cy(.5*s,.03,.15*s,.4*s,-3.55*s,0x2a2e33,'x');B(1.5*s,.06,.4,0,-.5*s,.4*s,DK);for(const sd of[-1,1]){B(.04,.5*s,1.8*s,sd*.5*s,-.6*s,.2,DK);B(.1,.1,1.6*s,sd*.8*s,-.9*s,.2,DK)}B(.9*s,.55*s,.6*s,0,.1*s,1.6*s,0x1b2a38)};
 const dog=(c)=>{B(.28,.3,.7,0,.55,0,c);B(.2,.22,.3,0,.7,.5,c);B(.1,.1,.18,0,.66,.72,BLK);Co(.05,.12,.07,.9,.45,c);Co(.05,.12,-.07,.9,.45,c);for(const sx of[-1,1])for(const sz of[-1,1])B(.08,.45,.1,sx*.12,.22,sz*.25,c);B(.06,.06,.45,0,.62,-.5,c,.5);B(.3,.06,.1,0,.68,.4,RED)};
 const soldier=(c)=>{B(.5,.7,.3,0,1.2,0,c);Sp(.17,0,1.78,0,0xc8a98a);B(.38,.18,.36,0,1.88,0,c);for(const s of[-1,1]){B(.2,.8,.22,s*.15,.5,0,0x2a2f35);B(.14,.6,.14,s*.38,1.2,.05,c)}B(.08,.08,.8,.1,1.15,.4,BLK)};
 switch(id){
 case'uav':B(.4,.35,3,0,0,0,GRY);Cy(.2,2.4,0,0,0,0x7a8088,'z',.04);Co(.2,.8,0,0,1.6,0x7a8088,'z');B(5.4,.06,.8,0,0,-.5,GRY,0,0,0);for(const s of[-1,1])B(.9,.05,.4,s*2.9,0,-1,GRY);B(1.6,.05,.5,0,0,-1.3,GRY);B(.06,.5,.4,0,.35,-1.3,GRY);Sp(.18,0,-.25,.5,0x1b2a38);break;
 case'advuav':B(.5,.4,3.2,0,0,0,0x3a4048);Co(.5,3,0,0,0,0x3a4048,'z').scale.set(1,1,1);B(6,.06,2.4,0,0,-.4,0x4a5058).rotation.y=0;Sp(.3,0,.3,.4,0x1b2a38,1,.8,1.4);for(const s of[-1,1])B(.06,.5,.7,s*2.6,.3,-1.2,0x4a5058);Sp(.1,0,-.3,1,0x62e0f0);break;
 case'pradar':Sp(.35,0,0,0,0x4a5058);for(const a of[.785,2.356,3.93,5.5]){B(.08,.05,.9,Math.cos(a)*.6,0,Math.sin(a)*.6,DK,0,-a+1.57,0);rotor(Math.cos(a)*1.0,.03,Math.sin(a)*1.0,.38)}dish(0,.45,0,.28,WHT);Sp(.08,0,.2,.28,0x62e0f0);break;
 case'motion':legs(0,0,.7,.7);Cy(.14,.5,0,.85,0,GRY);Sp(.2,0,1.2,0,0x3a4048);dish(0,1.35,0,.25,STE);Sp(.05,.1,1.3,.12,RED);B(.06,.5,.06,.15,1.45,0,DK);break;
 case'cuav':B(.3,.3,1.8,0,0,0,0x4a5058);for(const s of[-1,1]){B(2.4,.04,.5,s*1.3,0,-.2,0x4a5058);Cy(.1,.5,s*2.2,0,-.2,DK,'z')}Cy(.04,.6,0,.4,0,DK);dish(0,.75,0,.55,WHT);Sp(.07,0,.78,.1,0x62e0f0);break;
 case'emp':Cy(.25,2.6,0,0,0,0x3a4048,'z');Co(.25,.8,0,0,1.7,0x3a4048,'z');for(const a of[0,1.57,3.14,4.71])B(.04,.55,.7,Math.cos(a)*.3,Math.sin(a)*.3,-1,0x3a4048,0,0,a);{const t=new THREE.Mesh(new THREE.TorusGeometry(.35,.04,8,20),em(0x62e0f0));t.position.z=.5;g.add(t);const t2=t.clone();t2.position.z=-.2;g.add(t2)}break;
 case'flak':B(1.4,.3,1.4,0,.15,0,DK);Cy(.35,.6,0,.6,0,GRY);B(.9,.5,1,0,1,0,OLV);for(const s of[-1,1]){Cy(.07,2,s*.35,1.1,1.3,DK,'z');Cy(.1,.25,s*.35,1.1,2.3,STE,'z')}B(.5,.3,.5,0,1.35,-.3,DK);Sp(.12,.4,1.2,-.5,RED);break;
 case'care':B(1.4,1,1.4,0,.5,0,0x6a5a30);for(const s of[-1,1]){B(1.42,.08,.18,0,.5,s*.4,0xd8c070);B(.18,.08,1.42,s*.4,.5,0,0xd8c070)}B(1.2,.1,1.2,0,1.02,0,0x7a6a3a);Sp(1.4,0,2.9,0,0xc8483a,1,.65,1);for(const a of[0,1.57,3.14,4.71])B(.02,1.9,.02,Math.cos(a)*.55,1.95,Math.sin(a)*.55,0x2a2a2a,Math.sin(a)*.5,0,-Math.cos(a)*.5);Sp(.14,0,1.12,0,0xe84030);break;
 case'airdrop':Cy(.7,9,0,0,0,0x7a8088,'z',.55);Co(.55,2.4,0,0,5.6,0x7a8088,'z');B(14,.18,2,0,.45,0,0x8a9098);B(6,.14,1.5,0,.3,-4.2,0x8a9098);B(.14,2,1.5,0,1.2,-4.2,0x8a9098);for(const x of[-5,-2.4,2.4,5])Cy(.38,.9,x,.25,.6,DK,'z');B(1,.8,2,0,.2,-4.6,DK);break;
 case'vests':B(1.2,.9,1.2,0,.45,0,0x2a3a2a);B(1.22,.12,1.22,0,.9,0,0x3a4a3a);B(.7,.5,.04,0,.5,.62,0x1b1b1b);Sp(.18,0,.5,.65,0x62e0f0,1,1,.2);B(.9,.06,.06,0,.9,.4,0xe8e8e0);break;
 case'ammo':B(1.3,.8,.9,0,.4,0,0x4a5030);B(1.32,.1,.92,0,.82,0,0x5a6040);B(1.34,.18,.2,0,.4,.46,0xd8c030);B(.3,.1,.1,.4,.9,0,0x2a2a2a);for(let i=0;i<4;i++)Cy(.07,.4,-.45+i*.3,.95,0,0xc8a030);break;
 case'sim':legs(0,0,.5,.8);Cy(.28,.3,0,.6,0,GRY);for(let i=0;i<4;i++){const a=i*1.57+.78;Cy(.08,.8,Math.cos(a)*.22,.95,Math.sin(a)*.22,DK).rotation.set(Math.sin(a)*.3,0,-Math.cos(a)*.3)}Sp(.07,0,.8,.28,RED);B(.4,.1,.4,0,.5,0,DK);break;
 case'dcvt':B(.7,.28,1.3,0,.28,0,0xc0392b);B(.5,.2,.6,0,.5,-.1,0x2a3a48);B(.8,.1,.35,0,.15,.55,DK);B(.8,.06,.3,0,.5,-.65,DK);for(const sx of[-1,1])for(const sz of[-1,1])wheel(sx*.42,.17,sz*.45,.2);B(.02,.6,.02,.25,.8,-.5,DK);Sp(.05,.25,1.1,-.5,RED);break;
 case'bombdrone':Sp(.25,0,0,0,0x3a4048,1,.6,1.3);for(const a of[.785,2.356,3.93,5.5]){B(.06,.04,.8,Math.cos(a)*.45,.02,Math.sin(a)*.45,DK,0,-a+1.57,0);rotor(Math.cos(a)*.8,.05,Math.sin(a)*.8,.3)}Cy(.14,.5,0,-.3,0,RED);Co(.14,.2,0,-.62,0,0x2a2a2a);Sp(.06,0,.1,.3,0x62e0f0);break;
 case'hunter':Cy(.12,1,0,0,0,0x4a5058,'z');Co(.12,.35,0,0,.65,0x4a5058,'z');for(const a of[0,1.57,3.14,4.71])B(.03,.35,.3,Math.cos(a)*.15,Math.sin(a)*.15,-.35,0x4a5058,0,0,a);Sp(.05,0,.05,.4,RED);for(const s of[-1,1])rotor(s*.22,.08,0,.14);break;
 case'sentry':legs(0,0,.9,.9);Cy(.18,.2,0,.95,0,GRY);B(.34,.3,.7,0,1.15,0,OLV);Cy(.05,.9,0,1.15,.8,DK,'z');Cy(.07,.2,0,1.15,1.25,STE,'z');B(.28,.2,.3,.28,1.05,0,0x3a3a30);Sp(.06,0,1.3,.35,RED);break;
 case'shieldt':legs(0,0,.8,1);B(.4,.35,.8,0,1.05,0,OLV);Cy(.06,1,0,1.05,.9,DK,'z');B(1.3,1.3,.1,0,1.3,1.1,0x3a4a52);B(1.1,.9,.02,0,1.3,1.16,0x1b2a38);B(.3,.2,.3,.3,.95,0,0x3a3a30);break;
 case'pal':B(1.6,.3,1.8,0,.15,0,DK);Cy(.35,.5,0,.5,0,GRY);B(1.2,.7,1.8,0,1.1,0,OLV).rotation.x=-.5;for(const sx of[-1,1])for(const sy of[0,1]){const m=Cy(.12,1.6,sx*.3,1.3+sy*.35,.4,0xd8d8d0,'z');m.rotation.x=-.5-1.57+1.57;Co(.12,.35,sx*.3,1.3+sy*.35,1.3,RED,'z')}break;
 case'guardian':legs(0,0,1.2,1.3);Cy(.12,.3,0,1.3,0,GRY);dish(0,1.75,.2,.9,0xd8d0b0);Cy(.04,.7,0,1.75,.65,DK,'z');Sp(.1,0,1.75,.9,0xff6a3a);B(.3,.3,.3,0,1.35,-.2,DK);break;
 case'groundsis':B(1.1,.4,1.8,0,.5,0,OLV);for(const s of[-1,1]){B(.3,.4,2,s*.7,.3,0,0x2a2a2a);for(let i=-3;i<=3;i++)Cy(.18,.28,s*.7,.22,i*.28,0x151515,'x')}B(.8,.35,.9,0,.85,-.1,0x5a6a42);Cy(.1,.9,0,.95,.8,DK,'z');Sp(.12,0,.95,1.3,STE);Cy(.03,.5,-.3,1.3,-.4,DK);Sp(.08,-.3,1.6,-.4,RED);break;
 case'terminator':Cy(.28,4.2,0,0,0,0xd8d8d0,'z');Co(.28,1.4,0,0,2.8,0xc0392b,'z');for(const a of[0,1.57,3.14,4.71])B(.05,.9,1.1,Math.cos(a)*.4,Math.sin(a)*.4,-1.7,0x8a9098,0,0,a);Cy(.3,.6,0,0,-2.3,0x2a2a2e,'z',.2);Cy(.2,.5,0,0,-2.7,0xff9a30,'z',.05);break;
 case'glide':Sp(.5,0,0,0,0x4a5030,1,1,2.4);Co(.35,.9,0,0,1.55,0x3a4028,'z');for(const a of[0,1.57,3.14,4.71])B(.04,.7,.8,Math.cos(a)*.5,Math.sin(a)*.5,-1.2,0x6a7058,0,0,a);B(2.4,.05,.6,0,0,-.2,0x6a7058);Cy(.3,.2,0,0,-1.5,DK,'z');Sp(.08,0,0,1.9,RED);break;
 case'knight':Cy(.18,2,0,0,0,0xd8d8d0,'z');Co(.18,.6,0,0,1.3,RED,'z');for(const a of[0,1.57,3.14,4.71])B(.04,.5,.55,Math.cos(a)*.25,Math.sin(a)*.25,-.8,0x8a9098,0,0,a);Cy(.2,.3,0,0,-1.1,DK,'z',.12);Sp(.1,0,0,-1.3,0xffb050);break;
 case'gilded':B(1.4,.18,2.4,0,0,0,0x1b1d22).scale.set(1,1,1);Co(.9,2,0,0,0,0x1b1d22,'z').scale.set(1.6,.2,1);for(const s of[-1,1])B(.05,.4,.7,s*.5,.18,-.8,0x1b1d22,0,0,s*.4);Sp(.2,0,.12,.3,0x0a0a0c,1,.7,1.8);Sp(.05,0,.1,1,0xff3a2a);for(const s of[-1,1])Cy(.06,.5,s*.5,-.1,.2,0x3a3a40,'z');break;
 case'precision':jet(1,6,0x6a7078);for(const s of[-1,1])Cy(.18,2,s*.25,-.12,-1.9,0x3a3a40,'z');Sp(.1,0,0,-3.3,0xffa040);break;
 case'mortar':B(1.2,.12,1.2,0,.06,0,DK);Cy(.14,1.6,0,.9,0,0x4a5030).rotation.x=.5;legs(0,0,.8,1.2);Cy(.1,.7,.7,.2,0,0xd8c030,'x');Co(.1,.3,.7,.2,.5,RED,'z').rotation.z=1.57;break;
 case'stealth':{const w=new THREE.Mesh(bg,mat(0x25272c));w.scale.set(12,.5,3.6);g.add(w);const a=B(12.4,.28,6,0,-.08,.6,0x1b1d22);Co(.9,2,0,0,2.4,0x25272c,'z').scale.set(1.4,.3,1);Sp(.4,0,.35,1,0x0a1018,1.2,.7,2);for(const s of[-1,1])B(2.2,.22,2.4,s*3.4,-.05,-1.8,0x1b1d22);}break;
 case'napalm':Cy(.4,2.4,0,0,0,0xd9822b,'z',.38);Sp(.4,0,0,1.2,0xd9822b,1,1,.7);Sp(.38,0,0,-1.2,0xd9822b,1,1,.5);for(const z of[-.6,.6])Cy(.41,.12,0,0,z,0x2a2a2a,'z');B(.06,.7,.6,0,.5,-1.1,0x8a4a1a);B(.7,.06,.6,0,0,-1.1,0x8a4a1a);Sp(.28,0,.5,.3,0xff5a1a,.5,.5,.5);break;
 case'dogs':dog(0x6a4a2a);break;
 case'achopper':heli(0x3a4a3a);break;
 case'gunner':heli(0x2f3a4a);B(.08,.08,1.2,1.15,0,.8,DK);Cy(.05,1.1,1.45,0,1.1,DK,'z');Sp(.15,1.2,0,.6,STE);B(.5,.4,.6,1.0,0,.4,0x3a3a40);break;
 case'dc260':Cy(.9,16,0,0,0,0x6a7078,'z',.7);Co(.7,3.4,0,0,9.6,0x6a7078,'z');B(24,.3,3.2,0,.7,.4,0x7a8088);for(const x of[-9,-4.2,4.2,9])Cy(.42,1.6,x,.2,.8,DK,'z');B(.3,3,2,0,1.7,-7.2,0x6a7078);B(7,.24,1.6,0,.5,-7.2,0x6a7078);Cy(.22,3.2,-1.05,-.5,2,0x2a2a2e,'z');Cy(.14,2.4,-1.05,-.5,4.4,0x2a2a2e,'z');Cy(.09,1.6,-1.05,-.5,-1,0x2a2a2e,'z');B(1.8,.7,3,-1,-.4,.2,DK);break;
 case'overwatch':heli(0x25282d,true);for(const s of[-1,1]){Cy(.12,1.8,s*1.2,-.2,.6,DK,'z');Co(.12,.4,s*1.2,-.2,1.6,RED,'z')}B(1.7,1.1,.15,0,.1,1.9,0x2a3038);break;
 case'tolv':jet(1.3,7,0x5a6068);for(const s of[-1,1]){Cy(.55,1.3,s*2.2,.1,.4,DK);Cy(.42,.08,s*2.2,.76,.4,0x151515)}for(const z of[-.8,.4])Cy(.16,1.2,0,-.25,z,RED);Sp(.1,0,.1,-3.7,0xffa040);break;
 case'cube':B(8,5,8,0,0,0,0x3a3e44);B(8.4,.4,8.4,0,2.6,0,0x2a2d32);B(8.4,.4,8.4,0,-2.6,0,0x2a2d32);for(const x of[-3.4,3.4])for(const z of[-3.4,3.4])Cy(.8,3.4,x,-3.8,z,0x25282d,'y');for(let i=0;i<4;i++){B(8.1,.14,.5,0,-1.6+i*1.2,4.1,0x1b2a38);B(.5,.14,8.1,4.1,-1.6+i*1.2,0,0x1b2a38)}Sp(.9,0,-3,0,0x4a5058);Cy(.14,2.4,0,-3,1.4,DK,'z');Cy(.14,2.4,.3,-3,1.4,DK,'z');break;
 case'jugg':B(.8,1.1,.5,0,1.6,0,0x2a2e32);B(.34,.34,.34,0,2.35,0,0x1b1d22);B(.5,.1,.4,0,2.5,0,0x3a3e44);for(const s of[-1,1]){B(.34,1.1,.38,s*.28,.55,0,0x3a3e44);B(.3,.9,.3,s*.7,1.7,.1,0x2a2e32);B(.4,.4,.4,s*.65,2.15,0,0x3a3e44)}Cy(.1,1.3,.5,1.3,.8,DK,'z');for(let i=0;i<3;i++)Cy(.04,1.2,.5+(i-1)*.07,1.3,.9,STE,'z');B(.8,.12,.6,0,2.05,0,0x4a4e54);break;
 case'goliath':for(const s of[-1,1]){B(.7,1.6,.8,s*.8,.8,0,0x4a5058);B(.9,.3,1.3,s*.8,.15,.2,0x3a3e44);B(.5,.8,.5,s*.8,1.9,0,0x5a6068)}B(2.2,1.5,1.4,0,2.9,0,0x4a5058);B(1.2,.8,1,0,3.9,.1,0x3a3e44);Sp(.3,0,3.95,.55,0x62e0f0,1.2,.5,.3);for(const s of[-1,1]){B(.7,.7,.8,s*1.6,3,0,0x5a6068);Cy(.14,1.6,s*1.7,2.8,.9,DK,'z');for(let i=0;i<3;i++)Cy(.05,1.2,s*1.7+(i-1)*.1,2.9,1.2,STE,'z')}B(1.4,.6,.5,0,3.3,-.9,DK);break;
 case'para':soldier(0x4a5a38);Sp(1.4,0,3.9,0,0x4a5a38,1,.6,1);for(const a of[0,1.57,3.14,4.71])B(.02,2.1,.02,Math.cos(a)*.7,2.8,Math.sin(a)*.7,0x2a2a2a,Math.sin(a)*.3,0,-Math.cos(a)*.3);break;
 case'guarddog':dog(0x3a3a3e);break;
 case'fear':Cy(.12,.5,0,0,-.2,DK,'z');for(let i=0;i<6;i++){const a=i*1.047;Cy(.028,1.4,Math.cos(a)*.09,Math.sin(a)*.09,.7,STE,'z')}Cy(.14,.14,0,0,1.4,GRY,'z');Cy(.14,.14,0,0,.5,GRY,'z');B(.2,.3,.4,0,-.25,.1,DK);B(.1,.3,.1,0,-.35,.1,BLK);B(.4,.3,.3,.25,-.1,.3,OLV);break;
 case'boom':Cy(.1,1,0,0,.2,0x4a5030,'z');Cy(.2,.45,0,0,.4,GRY,'z');B(.1,.5,.14,0,-.3,.1,DK);B(.4,.1,.1,0,-.1,-.4,DK);B(.1,.2,.5,0,.2,-.7,DK);Cy(.09,.14,0,0,.75,ORG,'z');Sp(.04,0,.14,.1,RED);break;
 case'flame':Cy(.08,1.4,0,0,.2,GRY,'z');Cy(.1,.18,0,0,.95,DK,'z');Co(.05,.14,0,0,1.0,ORG,'z');B(.1,.3,.1,0,-.2,.1,DK);Cy(.28,.9,0,.1,-.8,0xb8b8b0,'y');Cy(.29,.05,0,.6,-.8,RED);Cy(.12,.1,0,.65,-.8,DK);Cy(.02,1,0,.4,-.35,DK,'z');break;
 case'satellite':B(1.2,1.2,2,0,0,0,0xc8b060);B(7,.05,1.6,0,0,0,0x1a2a6a);B(.2,.2,.2,0,0,0,DK);for(const s of[-1,1])for(let i=0;i<6;i++)B(1,.06,1.5,s*(1.2+i*1.05),0,0,0x2a3a8a);dish(0,.9,.4,.6,WHT);Cy(.03,1.2,0,.9,.4,DK);Sp(.12,0,1.6,.4,0x62e0f0);Cy(.12,1.2,0,-.2,1.5,0x6a7078,'z');break;
 case'annihil':Cy(.9,3,0,0,0,0x3a3e44,'z');Cy(1.3,.5,0,0,1.8,0x2a2d32,'z',1.3);{const t=new THREE.Mesh(new THREE.TorusGeometry(1.1,.12,10,28),em(0x62e0f0));t.position.z=1.1;g.add(t);const t2=t.clone();t2.position.z=-.6;g.add(t2)}Cy(.45,.4,0,0,2.2,0x62e0f0,'z',.1);Cy(.5,.6,0,0,-1.7,0x3a3e44,'z');for(const s of[-1,1])B(5,.06,1.4,s*3.6,0,-.4,0x1a2a6a);break;
 case'nuke':Sp(.8,0,0,0,0x3a3e3a,1,1,2.6);Co(.8,1.5,0,0,2.6,0x2a2d2a,'z');for(const a of[0,1.57,3.14,4.71])B(.05,1.2,1.4,Math.cos(a)*.85,Math.sin(a)*.85,-1.9,0x6a6e6a,0,0,a);Cy(.84,.5,0,0,.3,0xd8c030,'z');Cy(.84,.4,0,0,.9,BLK,'z');Sp(.3,0,.86,.3,0xd8c030,1,1,.1);Cy(.4,.5,0,0,-2.7,DK,'z',.3);break;
 default:B(1,1,1,0,.5,0,GRY)}
 return g}
