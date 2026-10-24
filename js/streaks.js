/* ######## sk_data.js ######## */
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
 ['nuke','Nuke',11,30,1,'Launches by itself at 30 kills in a row. It cannot be equipped. When it detonates the match ends and the player who called it wins.']];
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
;
/* ######## sk_core.js ######## */
/* ===================== sk_core.js ===================== */
/* ---------- killstreak engine ----------
   SK.objs: things you placed or called in (turrets, drones, crates, helicopters ...). Every object can have hp: enemy bots with a line of sight shoot it down, an EMP disables it.
   SK.rc: remote control / gunner mode: the camera moves to the vehicle or gun, the player body stands still. SK.ea: enemy air support, the target of Flak Guns, PAL turrets, EMP and your gunships.
   Kills made by killstreaks never feed the killstreak counter. In private matches the streaks are local to the player who earned them. */
const SK={got:{},objs:[],q:[],t:0,uavT:0,advT:0,prT:0,cuavT:0,empT:0,flakT:0,rc:null,suit:null,ping:[],pingT:0,ea:[],eaT:70,nok:0,fp:0,trp:0,air:[],bombs:[],fires:[],lines:[],marks:[],heavyBack:null};
const foes=()=>bots.filter(b=>b.al&&!ally(b)&&!b.out);
function skGnd(x,z){let h=0;for(const b of bx)if((b.y0||0)<.4&&b.h<4&&x>b.x0&&x<b.x1&&z>b.z0&&z<b.z1&&b.h>h)h=b.h;return h}
function skSpot(maxd){maxd=maxd||7;const o=C.position.clone(),d=aimDir(),t=Math.max(1.2,Math.min(maxd,castW(o,d,maxd)-.5)),x=o.x+d.x*t,z=o.z+d.z*t;return V(x,skGnd(x,z),z)}
function skAimPoint(maxd){const o=C.position.clone(),d=aimDir(),t=Math.min(maxd||90,castW(o,d,maxd||90));return o.add(d.multiplyScalar(t))}
/* damage helpers: streak damage is credited to the player and never touches the player */
function skHurt(b,d,name){src=name;srcK='';SK.nok=1;try{hitBot(b,d,0)}catch(e){}SK.nok=0}
function skBlast(p,R,d,name,quiet){src=name;srcK='';SK.nok=1;try{if(quiet){for(const b of foes()){const D=Math.hypot(b.x-p.x,(b.y||0)+1-p.y,b.z-p.z);if(D<R)hitBot(b,d*(1-.5*D/R),0)}burst(p,7,0xffa040,5,.4,.2)}else boom(p,{R,d,own:1,c:0xff8a30})}catch(e){}SK.nok=0;skHitEA(p,R+2,d)}
function skLine(a,b,col,life){const g=new THREE.BufferGeometry().setFromPoints([a,b]),l=new THREE.Line(g,new THREE.LineBasicMaterial({color:col||0xffe080}));S.add(l);SK.lines.push({l,t:life||.07})}
/* objects */
function skAdd(o){o.m.position.set(o.x,o.y,o.z);S.add(o.m);o.t=o.life||60;SK.objs.push(o);return o}
function skRemove(o,boomFx){const i=SK.objs.indexOf(o);if(i>=0)SK.objs.splice(i,1);S.remove(o.m);if(o.end)try{o.end(o)}catch(e){}if(boomFx){burst(V(o.x,o.y+.5,o.z),26,0xff9a30,7,.8,.3);burst(V(o.x,o.y+.5,o.z),14,0x333333,3,1,.5);noise(.4,500,.2)}}
/* bots shoot streak assets they can see */
function skBotsAttack(o,dt){if(!o.hp||o.inv||SK.empT>0&&o.elec)return;let dmg=0;for(const b of foes()){if(b.stun>0)continue;const d=Math.hypot(b.x-o.x,b.z-o.z);if(d>(o.air?26:30)||!navLos(b.x,b.z,o.x,o.z))continue;let f=1;if(o.shield){const a=Math.atan2(b.x-o.x,b.z-o.z),df=Math.abs(((a-o.face+Math.PI*3)%(Math.PI*2))-Math.PI);f=df>2.3?.12:1}dmg+=(o.air?1.1:3.2)*f}
 if(dmg){o.hp-=dmg*dt;if(o.hp<=0){feed('Enemy destroyed your '+(o.n||'streak'));skRemove(o,true)}}}
/* enemy air support: a hostile helicopter now and then. Flak Guns stop new ones, EMP / PAL / gunships / rockets bring them down. */
function skEnemyAir(){const m=skModel('achopper');m.scale.setScalar(.8);m.traverse(e=>{if(e.material&&e.material.color)e.material=e.material.clone(),e.material.color.multiplyScalar(.7).add(new THREE.Color(.25,0,0))});const a=Math.random()*6.28;const e={m,x:Math.cos(a)*40,y:17,z:Math.sin(a)*40,hp:230,ang:a,t:60,cd:1};m.position.set(e.x,e.y,e.z);S.add(m);SK.ea.push(e);msg('Enemy chopper inbound',2);beep(180,.4,'sawtooth',.08)}
function skHitEA(p,R,d){for(let i=SK.ea.length-1;i>=0;i--){const e=SK.ea[i];if(Math.hypot(e.x-p.x,e.y-p.y,e.z-p.z)<R+2){e.hp-=d*(SK.nok?1.5:1);if(e.hp<=0)skEaDie(e)}}}
function skEaDie(e){const i=SK.ea.indexOf(e);if(i<0)return;SK.ea.splice(i,1);S.remove(e.m);burst(V(e.x,e.y,e.z),40,0xff9a30,9,1,.4);noise(.6,300,.25);feed('You ▸ Enemy chopper destroyed');if(typeof popup=='function')popup('CHOPPER DOWN','+300')}
function skEaTick(dt){if(!run||mode=='Zombies')return;SK.eaT-=dt;if(SK.eaT<=0){SK.eaT=75+Math.random()*50;if(SK.flakT<=0&&SK.ea.length<1&&foes().length>2)skEnemyAir()}
 for(let i=SK.ea.length-1;i>=0;i--){const e=SK.ea[i];e.t-=dt;if(SK.empT>0){e.hp-=400*dt}if(e.hp<=0){skEaDie(e);continue}if(e.t<=0||SK.flakT>0&&Math.random()<dt*.35){S.remove(e.m);SK.ea.splice(i,1);continue}
  e.ang+=dt*.35;e.x+=(P.x+Math.cos(e.ang)*26-e.x)*Math.min(1,dt*.6);e.z+=(P.z+Math.sin(e.ang)*26-e.z)*Math.min(1,dt*.6);e.y=17+Math.sin(SK.t*.8)*1.2;e.m.position.set(e.x,e.y,e.z);e.m.rotation.y=Math.atan2(P.x-e.x,P.z-e.z);
  e.cd-=dt;if(e.cd<=0&&!P.dead&&Math.hypot(P.x-e.x,P.z-e.z)<44&&navLos(e.x,e.z,P.x,P.z)){e.cd=.7;skLine(V(e.x,e.y-.6,e.z),V(P.x+(Math.random()-.5)*2,1.2,P.z+(Math.random()-.5)*2),0xff6a40,.08);if(Math.random()<.55)hurt(7)}}}
/* the player's own bullets hit enemy air as well */
function skShotAir(){if(!SK.ea.length)return;const o=C.position.clone(),d=aimDir(),w=cw();for(const e of SK.ea){const v=V(e.x-o.x,e.y-o.y,e.z-o.z),t=v.dot(d);if(t<2||t>90)continue;const off=v.clone().sub(d.clone().multiplyScalar(t)).length();if(off<2.4&&castW(o,d,t)>=t-.5){e.hp-=(w?w.d:20)*.7*skMul(w);if(e.hp<=0)skEaDie(e)}}}
/* ---------- radar types ---------- */
function skRadar(dot,pt,c){for(const b of bots){if(!b.al)continue;if(ally(b)){dot(b.x,b.z,'#62e0f0',3);continue}if(b.out)continue;const d=Math.hypot(b.x-P.x,b.z-P.z);let show=d<28;
  if(SK.advT>0)show=true;else if(SK.prT>0&&d<46)show=true;if(!show&&(b.mvs||0)>1.2)show=SK.objs.some(o=>o.id=='motion'&&Math.hypot(b.x-o.x,b.z-o.z)<o.r);
  if(show){dot(b.x,b.z,'#ff5a3a',3);if(SK.advT>0){const p=pt(b.x,b.z),a=b.m?b.m.rotation.y:0,q=pt(b.x+Math.sin(a)*5,b.z+Math.cos(a)*5);if(p&&q&&Math.hypot(p[0]-75,p[1]-75)<70){c.strokeStyle='#ff9a7a';c.lineWidth=1.5;c.beginPath();c.moveTo(p[0],p[1]);c.lineTo(q[0],q[1]);c.stroke()}}}}
 if(SK.uavT>0&&SK.advT<=0){for(const p of SK.ping){const age=SK.t-p.t,a=Math.max(0,1-age/4.2);if(a<=0)continue;c.globalAlpha=a;dot(p.x,p.z,'#ff5a3a',3);c.globalAlpha=1}}
 if(SK.cuavT>0&&!P.dead){}}
/* ---------- remote control / gunner camera ---------- */
function rcStart(r){if(SK.rc)return false;r.t=r.t||25;r.hy=yaw;r.hp=pitch;r.fireT=0;if(r.m&&r.id=='dcvt')S.add(r.m);SK.rc=r;SK.trp=trig;msg(r.hint||'Remote control',2.5);if(typeof haptic=='function')haptic(.3,100,.4,'both');return true}
function rcEnd(why){const r=SK.rc;if(!r)return;SK.rc=null;if(r.m)S.remove(r.m);if(r.end)try{r.end(r)}catch(e){}gun.visible=true;C.rotation.order='YXZ';const e=$('#rcv');if(e)e.style.display='none';if(why)msg(why,1.5)}
function rcTick(dt){const r=SK.rc;if(!r)return;if(P.dead||SK.empT>0&&r.elec){rcEnd(P.dead?'':'Signal lost');return}r.t-=dt;const edge=trig&&!SK.trp;SK.trp=trig;
 /* heading follows where the player looks, limited by the turn rate */
 if(r.turn){const dy=Math.atan2(Math.sin(yaw-r.hy),Math.cos(yaw-r.hy)),dp=cl(pitch+(r.bias||0),-1.5,1.2)-r.hp,mx=r.turn*dt;r.hy+=cl(dy,-mx,mx);r.hp+=cl(dp,-mx,mx)}else{r.hy=yaw;r.hp=pitch}
 try{r.tick(r,dt,edge)}catch(e){rcEnd('Link lost')}if(!SK.rc)return;if(r.t<=0){if(r.expire)r.expire(r);if(SK.rc===r)rcEnd('Out of time')}
 const e=$('#rcv');if(e){e.style.display='block';e.innerHTML=`<b>${r.n||'REMOTE'}</b> <span>${Math.max(0,Math.ceil(r.t))}s</span><small>${r.hint||''}</small>`}}
function skCam(){const r=SK.rc;if(!r)return;gun.visible=false;if(r.m){r.m.position.set(r.x,r.y,r.z);r.m.rotation.set(-r.hp*.6,r.hy+Math.PI,0)}
 const cp=r.cam?r.cam(r):V(r.x,r.y,r.z);C.position.copy(cp);C.rotation.order='YXZ';C.rotation.set(r.camPitch!=null?r.camPitch:r.hp,r.hy,0)}
/* ---------- tick ---------- */
function skTick(dt){SK.t+=dt;for(const k of['uavT','advT','prT','cuavT','empT','flakT'])if(SK[k]>0)SK[k]-=dt;
 if(SK.uavT>0&&SK.advT<=0){SK.pingT-=dt;if(SK.pingT<=0){SK.pingT=4;SK.ping=foes().map(b=>({x:b.x,z:b.z,t:SK.t}))}}
 for(const b of bots){if(!b.al)continue;b.mvs=Math.hypot(b.x-(b._lx==null?b.x:b._lx),b.z-(b._lz==null?b.z:b._lz))/Math.max(dt,.001);b._lx=b.x;b._lz=b.z}
 if(SK.cuavT>0){SK.cj=(SK.cj||0)-dt;if(SK.cj<=0){SK.cj=.45;for(const b of foes())b.cd=Math.max(b.cd||0,.4)}}
 if(SK.empT>0){SK.ej=(SK.ej||0)-dt;if(SK.ej<=0){SK.ej=.3;for(const b of foes())b.stun=Math.max(b.stun||0,.6)}}
 for(let i=SK.objs.length-1;i>=0;i--){const o=SK.objs[i];if(!o)continue;o.t-=dt;if(o.t<=0){skRemove(o,false);continue}if(!(SK.empT>0&&o.elec))try{if(o.tick)o.tick(o,dt)}catch(e){skRemove(o,false);continue}if(o.m)o.m.position.set(o.x,o.y,o.z);skBotsAttack(o,dt)}
 for(let i=SK.lines.length-1;i>=0;i--){const l=SK.lines[i];l.t-=dt;if(l.t<=0){S.remove(l.l);l.l.geometry.dispose();SK.lines.splice(i,1)}}
 skEaTick(dt);rcTick(dt);if(typeof skAirTick=='function')skAirTick(dt);skTickSuit(dt)}
function skTickSuit(dt){const s=SK.suit;if(!s)return;s.t-=dt;if(s.t<=0||P.dead)skEndSuit(P.dead?'':'Suit powered down')}
function skEndSuit(why){const s=SK.suit;if(!s)return;SK.suit=null;P.mhp=s.mhp;P.msh=s.msh;P.hp=Math.min(P.hp,P.mhp);P.sh=Math.min(P.sh,P.msh);if(s.wk)skDropHeavy(s.wk);if(why)msg(why,1.5)}
function skReset(){for(const o of SK.objs.slice())skRemove(o,false);for(const e of SK.ea)S.remove(e.m);SK.ea=[];rcEnd();for(const l of SK.lines)S.remove(l.l);SK.lines=[];if(typeof skAirClear=='function')skAirClear();SK.suit=null;SK.uavT=SK.advT=SK.prT=SK.cuavT=SK.empT=SK.flakT=0;SK.ping=[];SK.eaT=70;SK.q=[];SK.got={};gun.visible=true}
/* hooks */
{const _ft=featTick;featTick=function(dt){_ft.apply(this,arguments);if(mode!='Zombies')skTick(dt)}}
{const _fr=featReset;featReset=function(){_fr.apply(this,arguments);skReset()}}
{const _gt=gfxTick;gfxTick=function(dt){_gt.apply(this,arguments);skCam()}}
{const _mc=moveCalc;moveCalc=function(){const r=_mc.apply(this,arguments);if(SK.rc)return{f:0,s:0,spt:false,spd:0};if(SK.suit)r.spd*=SK.suit.sp;return r}}
{const _sh=shoot;shoot=function(){if(SK.rc)return;_sh.apply(this,arguments);skShotAir()}}
{const _d=die;die=function(){const was=P.dead;_d.apply(this,arguments);if(!was){rcEnd();skEndSuit('');SK.got={}}}}
{const _b=boom;boom=function(p,g){_b.apply(this,arguments);if(!g||!g.tac)skHitEA(p,(g&&g.R)||4,((g&&g.d)||100)*(g&&g.w=='RL'?3.5:g&&g.w=='RG'?3:1))}}
{const _fk=featKill;featKill=function(b,h){if(SK.nok)ks--;_fk.apply(this,arguments)}}
{const _sw=swap;swap=function(){if(SK.rc)return;_sw.apply(this,arguments)}}
;
/* ######## sk_use.js ######## */
/* ===================== sk_use.js ===================== */
/* ---------- what each killstreak does when you use it ---------- */
const rndI=n=>Math.random()*n|0,rndP=a=>a[rndI(a.length)];
const skNear=(o,max)=>{let b0=null,bd=max||1e9;for(const b of foes()){const d=Math.hypot(b.x-o.x,b.z-o.z);if(d<bd){bd=d;b0=b}}return b0};
const skNearLos=(o,max,h)=>{let b0=null,bd=max||1e9;for(const b of foes()){const d=Math.hypot(b.x-o.x,b.z-o.z);if(d<bd&&navLos(o.x,o.z,b.x,b.z)){bd=d;b0=b}}return b0};
function skM(id,sc,rot){const m=skModel(id);m.scale.setScalar(sc||1);return m}
/* ---------- aircraft that fly a line across the map and drop bombs ---------- */
function skFly(o){const c=skAimPoint(80),f=V(-Math.sin(yaw),0,-Math.cos(yaw)),L=H*1.3,len=2*L,n=o.n||1,px=-f.z,pz=f.x;
 for(let i=0;i<n;i++){const off=(i-(n-1)/2)*(o.gap||0),back=(i%2?7:0),sx=c.x-f.x*(L+back)+px*off,sz=c.z-f.z*(L+back)+pz*off,m=skM(o.model,o.sc||1);m.position.set(sx,o.alt,sz);m.rotation.y=Math.atan2(f.x,f.z);S.add(m);SK.air.push({m,x:sx,z:sz,ox:sx,oz:sz,fx:f.x,fz:f.z,run:0,len,acc:0,o,px,pz})}
 const lg=new THREE.BufferGeometry().setFromPoints([V(c.x-f.x*L,.3,c.z-f.z*L),V(c.x+f.x*L,.3,c.z+f.z*L)]),ln=new THREE.Line(lg,new THREE.LineBasicMaterial({color:0xff4a2a}));S.add(ln);SK.marks.push({m:ln,t:2.6});noise(1.6,260,.22);beep(200,.5,'sawtooth',.08)}
function skBombFall(x,z,o,fx,fz){const m=skM('napalm',.4);if(!o.nap)m.traverse(e=>{});m.position.set(x,o.alt-2,z);m.rotation.x=1.2;S.add(m);SK.bombs.push({m,x,z,y:o.alt-2,vy:0,vx:fx*30*.4,vz:fz*30*.4,o})}
function skAirTick(dt){
 for(let i=SK.marks.length-1;i>=0;i--){const k=SK.marks[i];k.t-=dt;if(k.t<=0){S.remove(k.m);SK.marks.splice(i,1)}}
 for(let i=SK.air.length-1;i>=0;i--){const p=SK.air[i],o=p.o;p.run+=o.spd*dt;p.x=p.ox+p.fx*p.run;p.z=p.oz+p.fz*p.run;p.m.position.set(p.x,o.alt+Math.sin(SK.t*2+i)*.1,p.z);
  p.dr=(p.dr||0)-dt;if(p.dr<=0){p.dr=.6;const dd=Math.hypot(p.x-C.position.x,p.z-C.position.z);beep(70+Math.max(0,40-dd*.5),.55,'sawtooth',Math.max(.01,.07*(1-dd/150)))}
  if(Math.abs(p.x)<H+2&&Math.abs(p.z)<H+2){p.acc+=dt;while(p.acc>=o.iv){p.acc-=o.iv;const sd=(Math.random()-.5)*(o.spread||4);skBombFall(p.x+p.px*sd,p.z+p.pz*sd,o,p.fx,p.fz)}}
  if(p.run>p.len){S.remove(p.m);SK.air.splice(i,1);if(p.o.after&&!SK.air.some(q=>q.o===p.o))p.o.after()}}
 for(let i=SK.bombs.length-1;i>=0;i--){const b=SK.bombs[i];b.vy-=24*dt;b.y+=b.vy*dt;b.x+=b.vx*dt;b.z+=b.vz*dt;b.vx*=Math.exp(-.8*dt);b.vz*=Math.exp(-.8*dt);b.m.position.set(b.x,b.y,b.z);b.m.rotation.x=Math.min(1.5,b.m.rotation.x+dt*1.1);
  if(b.y<=skGnd(b.x,b.z)+.4){S.remove(b.m);SK.bombs.splice(i,1);const p=V(cl(b.x,-H+1,H-1),.3,cl(b.z,-H+1,H-1)),o=b.o;if(o.nap){skFire(p.x,p.z,o.fr||4.5,11);skBlast(p,3,40,o.name)}else skBlast(p,o.R,o.d,o.name)}}
 for(let i=SK.fires.length-1;i>=0;i--){const f=SK.fires[i];f.t-=dt;f.tk-=dt;for(const c of f.m.children)c.scale.y=.7+Math.random()*.9;if(f.tk<=0){f.tk=.25;for(const b of foes())if(Math.hypot(b.x-f.x,b.z-f.z)<f.r)skHurt(b,8,'Napalm Strike')}if(f.t<=0){S.remove(f.m);SK.fires.splice(i,1)}}
 for(let i=SK.shells.length-1;i>=0;i--){const s=SK.shells[i];s.d-=dt;if(s.m){s.m.position.y=Math.max(.3,s.y0*Math.max(0,s.d/s.D));if(s.d<s.D*.7&&!s.w){s.w=1;beep(900,.9,'sine',.04)}}if(s.d<=0){if(s.m)S.remove(s.m);if(s.ring)S.remove(s.ring);SK.shells.splice(i,1);skBlast(V(s.x,.3,s.z),s.R,s.dmg,s.name,s.quiet)}}}
function skAirClear(){for(const p of SK.air)S.remove(p.m);SK.air=[];for(const b of SK.bombs)S.remove(b.m);SK.bombs=[];for(const f of SK.fires)S.remove(f.m);SK.fires=[];for(const s of SK.shells){if(s.m)S.remove(s.m);if(s.ring)S.remove(s.ring)}SK.shells=[];for(const k of SK.marks)S.remove(k.m);SK.marks=[]}
SK.shells=[];
function skFire(x,z,r,t){const g=new THREE.Group();for(let i=0;i<9;i++){const a=Math.random()*6.28,d=Math.random()*r*.85,c=new THREE.Mesh(new THREE.ConeGeometry(.5+Math.random()*.5,1.6,6),new THREE.MeshBasicMaterial({color:i%3?0xff6a20:0xffc040}));c.position.set(Math.cos(a)*d,.6,Math.sin(a)*d);g.add(c)}g.position.set(x,skGnd(x,z),z);S.add(g);SK.fires.push({m:g,x,z,r,t,tk:0})}
function skShell(x,z,R,dmg,name,delay,quiet,fall){const s={x,z,R,dmg,name,d:delay,D:delay,quiet,y0:55};if(fall){const m=skM('mortar',.18);m.position.set(x,55,z);m.rotation.x=Math.PI;S.add(m);s.m=m}const r=new THREE.Mesh(new THREE.RingGeometry(R*.85,R,28),new THREE.MeshBasicMaterial({color:0xff3a2a,transparent:true,opacity:.6,side:THREE.DoubleSide,depthWrite:false}));r.rotation.x=-Math.PI/2;r.position.set(x,skGnd(x,z)+.08,z);S.add(r);s.ring=r;SK.shells.push(s)}
/* ---------- units that walk (dogs, paratroopers, rover) ---------- */
function skUnit(o){o.unit=1;return skAdd(o)}
function skDog(id,n,life,hp,sc){const p=skSpot(3);const a=Math.random()*6.28;return skUnit({id,n,m:skM(id=='guarddog'?'guarddog':'dogs',sc||1),x:p.x+Math.cos(a)*1.5,y:0,z:p.z+Math.sin(a)*1.5,hp,life,cd:0,tick(o,dt){const t=skNear(o,id=='guarddog'?14:60);const tx=t?t.x:P.x+Math.cos(SK.t*.4+o.x)*2.5,tz=t?t.z:P.z+Math.sin(SK.t*.4+o.x)*2.5;navMove(o,dt,tx,tz,t?10:7.5,null);o.m.rotation.y=o.mva||0;o.y=skGnd(o.x,o.z);o.cd-=dt;if(t&&Math.hypot(t.x-o.x,t.z-o.z)<1.7&&o.cd<=0){o.cd=.6;skHurt(t,48,o.n);beep(300,.1,'sawtooth',.06)}}})}
/* ---------- helicopters / VTOL that shoot ---------- */
function skHeli(o){const base={air:1,elec:1,cd:0,ang:Math.random()*6.28,iv:.35,dmg:14,rng:46,hp:400,life:50,y:14,orbit:20,spd:.35,follow:0};o=Object.assign(base,o);o.hp=Math.round(o.hp*2.4);o.mhp=o.hp;o.x=o.x==null?P.x+20:o.x;o.z=o.z==null?P.z:o.z;o.m=skM(o.model,o.sc||1);o.tick=(o,dt)=>{o.ang+=dt*o.spd;const cx=o.follow?P.x:0,cz=o.follow?P.z:0,R=o.follow?o.orbit:Math.min(o.orbit,H*.55);const tx=cx+Math.cos(o.ang)*R,tz=cz+Math.sin(o.ang)*R;o.x+=(tx-o.x)*Math.min(1,dt*1.2);o.z+=(tz-o.z)*Math.min(1,dt*1.2);o.y=o.hy||o.y;const t=skNearLos(o,o.rng);
  o.m.rotation.y=t?Math.atan2(t.x-o.x,t.z-o.z):Math.atan2(-Math.sin(o.ang),Math.cos(o.ang))+0;o.cd-=dt;if(o.cd<=0){const ea=SK.ea.find(e=>Math.hypot(e.x-o.x,e.z-o.z)<60);if(ea){o.cd=o.iv;skLine(V(o.x,o.y-.5,o.z),V(ea.x,ea.y,ea.z),0xffd070,.08);ea.hp-=o.dmg*1.2;if(ea.hp<=0)skEaDie(ea)}else if(t){o.cd=o.iv;skLine(V(o.x,o.y-.5,o.z),V(t.x,1.2,t.z),0xffd070,.08);if(Math.random()<.85)skHurt(t,o.dmg,o.n)}}};return skAdd(o)}
/* ---------- care packages and supply crates ---------- */
function skReward(){const r=Math.random();if(r<.55){const pool=STKL.filter(s=>!['nuke','care','airdrop','satellite','annihil','dc260','cube','goliath','emp'].includes(s.id)&&s.k<=12);const s=rndP(pool);q.push(s.id);msg('Care Package: '+s.n+' (press '+(2+q.length)+')',2.5)}else if(r<.85){skGiveHeavy(rndP(['MNG','GL','FT']))}else{skAmmo();msg('Care Package: ammo and armor',2)}}
function skAmmo(){for(const w of wp){if(w.heavy)continue;w.mag=w.m;w.res=w.m*(w.rs==null?4:w.rs)}gc=Math.max(gc,3);ST.tN=Math.max(ST.tN,2);ST.plates=Math.min(5,ST.plates+1);beep(600,.15,'triangle',.07)}
function skCrate(x,z,type,fall){const m=skM(type=='vests'?'vests':type=='ammo'?'ammo':'care',type=='care'?.9:1);const o={id:'crate',n:'crate',type,m,x,z,y:fall?48:skGnd(x,z),life:100,landed:!fall,sm:0,tick(o,dt){if(!o.landed){o.y-=7*dt;const g=skGnd(o.x,o.z);if(o.y<=g){o.y=g;o.landed=true;m.children.forEach(c=>{if(c.position.y>2.2)c.visible=false});burst(V(o.x,g+.6,o.z),16,0xcccccc,4,.8,.5);noise(.3,200,.15)}return}
   o.sm-=dt;if(o.sm<=0){o.sm=.5;burst(V(o.x,o.y+1.2,o.z),2,type=='care'?0xffd040:0x80e0a0,2,1.4,.5)}
   if(!P.dead&&Math.hypot(P.x-o.x,P.z-o.z)<2.5){if(!o.hint){o.hint=1;msg('Press F to open',1.2)}if(key.KeyF&&!SK.fp){SK.fp=1;if(type=='care')skReward();else if(type=='vests'){P.msh+=50;P.sh=P.msh;ST.plates=Math.min(6,ST.plates+2);msg('Ballistic vest: +50 armor',2)}else{skAmmo();msg('Ammo resupplied',1.6)}skRemove(o,false)}}else o.hint=0}};return skAdd(o)}
/* ---------- heavy weapons ---------- */
W.MNG={n:'Fear Machine',d:15,r:.04,m:200,sp:.035,rc:.45,pel:1,au:1,rl:6,len:.85,col:0x4a4f55};W.GL={n:'Boom Machine',d:120,r:.55,m:12,sp:.01,rc:1.2,pel:1,au:0,rl:3.2,len:.8,col:0x4a5030};W.FT={n:'Flamethrower',d:9,r:.045,m:160,sp:.1,rc:.2,pel:1,au:1,rl:5,len:.7,col:0xd9822b};
WG.MNG=[.85,0x4a4f55,1,0xffa040];WG.GL=[.8,0x4a5030,1,0xffa040];WG.FT=[.7,0xd9822b,1,0xff7a30];RLK.MNG=RLK.GL=RLK.FT='mag';
MODELS.MNG=function(g,rm){const k=gunKit(g,rm),M=k.M,body=rm||M(0x4a4f55),dk=M(0x1b1d21),st=M(0x9aa0a8);k.box(.12,.14,.4,0,0,.1,body);k.cyl(.07,.2,0,0,.4,dk);for(let i=0;i<6;i++){const a=i*1.047;k.cyl(.02,.62,Math.cos(a)*.045,Math.sin(a)*.045,.75,st)}k.cyl(.07,.04,0,0,1.06,dk);k.cyl(.07,.04,0,0,.55,dk);k.box(.1,.2,.1,0,-.17,.0,dk,.3);k.box(.06,.12,.08,0,-.12,.34,dk);k.box(.14,.18,.2,.1,-.05,.0,M(0x4a5030));k.box(.04,.1,.04,0,.1,.0,dk);k.box(.04,.04,.5,0,.1,.3,dk);g.userData.a={r:[0,-.14,0],l:[0,-.08,.34],m:[0,-.05,.0]};g.userData.mags=[];return g};
MODELS.GL=function(g,rm){const k=gunKit(g,rm),M=k.M,body=rm||M(0x4a5030),dk=M(0x1b1d21),st=M(0x9aa0a8);k.cyl(.07,.7,0,.02,.45,body);k.cyl(.085,.34,0,.02,.25,dk);k.cyl(.075,.05,0,.02,.82,dk);k.box(.07,.1,.34,0,-.02,.0,dk);k.box(.04,.14,.05,0,-.1,-.02,dk,.3);k.box(.03,.1,.03,0,-.1,.5,dk);k.box(.04,.04,.4,0,.1,.25,dk);k.cyl(.02,.04,0,.14,.55,st);k.box(.05,.05,.3,0,-.06,-.25,body);k.box(.05,.12,.04,0,-.06,-.42,dk);g.userData.a={r:[0,-.12,-.0],l:[0,-.05,.5],m:[0,-.02,.25]};g.userData.mags=[];return g};
MODELS.FT=function(g,rm){const k=gunKit(g,rm),M=k.M,body=rm||M(0xd9822b),dk=M(0x1b1d21),st=M(0x9aa0a8);k.cyl(.035,.9,0,.04,.5,st);k.cyl(.05,.2,0,.04,.15,dk);k.box(.07,.12,.3,0,0,0,body);k.cyl(.045,.1,0,.04,.98,dk,.025);k.cone(.012,.05,0,.04,1.06,M(0xff7a30));k.box(.04,.14,.05,0,-.1,.0,dk,.3);k.box(.04,.1,.04,0,-.08,.45,dk);k.cyl(.12,.42,-.02,-.2,-.35,M(0xb8b8b0),.12);k.cylY(.12,.4,-.02,-.25,-.4,M(0xb8b8b0));k.cylY(.02,.5,.05,-.1,-.15,dk,0,Math.PI/2);g.userData.a={r:[0,-.1,0],l:[0,-.06,.45],m:[0,0,.1]};g.userData.mags=[];return g};
function skGiveHeavy(wk){if(!W[wk])return;let w=wp.find(x=>x.k==wk);if(w){w.mag=w.m}else{w={k:wk,...eff(wk,[])};w.mag=w.m;w.res=0;w.rs=0;w.heavy=1;wp.push(w)}cur=wp.indexOf(w);setGun();msg(W[wk].n+' equipped',2);beep(500,.2,'square',.06)}
function skDropHeavy(wk){const i=wp.findIndex(w=>w.k==wk);if(i<0)return;wp.splice(i,1);cur=Math.max(0,Math.min(cur,wp.length-1));setGun()}
function skHeavyShot(w){w.mag--;shots++;nf=t0+w.r*zfr();src=W[w.k].n;srcK=w.k;gunSnd(w);kick=Math.max(kick,.4);const o=C.position.clone(),d=aimDir();
 if(w.k=='GL'){const p=skAimPoint(80);skLine(o.clone().add(d.clone().multiplyScalar(1)),p,0xffd070,.12);skBlast(p,4.8,w.d,'Boom Machine')}
 else{for(let i=0;i<3;i++){const p=o.clone().add(d.clone().multiplyScalar(2.5+Math.random()*4)).add(V((Math.random()-.5)*.8,(Math.random()-.5)*.8,(Math.random()-.5)*.8));burst(p,3,Math.random()<.5?0xff7a20:0xffc040,4,.35,.3)}for(const b of foes()){const v=V(b.x-o.x,(b.y||0)+1-o.y,b.z-o.z),D=v.length();if(D<8.5&&v.normalize().dot(d)>.8&&navLos(o.x,o.z,b.x,b.z))skHurt(b,w.d,'Flamethrower')}}}
{const _s=shoot;shoot=function(){const w=cw();if(w&&w.heavy&&(w.k=='GL'||w.k=='FT')){skHeavyShot(w);return}_s.apply(this,arguments)}}
{const _d=die;die=function(){const was=P.dead;_d.apply(this,arguments);if(!was)for(const w of wp.filter(x=>x.heavy))skDropHeavy(w.k)}}
/* ---------- guided / remote control helpers ---------- */
function skMissile(o){return rcStart(Object.assign({elec:1,turn:1.2,spd:30,hint:'Steer with the mouse · LMB detonate',tick(r,dt,edge){const d=V(-Math.sin(r.hy)*Math.cos(r.hp),Math.sin(r.hp),-Math.cos(r.hy)*Math.cos(r.hp)),v=r.spd*dt;r.y-=r.grav?r.grav*dt:0;const t=castW(V(r.x,r.y,r.z),d,v+.6);r.x+=d.x*v;r.y+=d.y*v;r.z+=d.z*v;const hit=t<v+.5||r.y<=skGnd(r.x,r.z)+.3||Math.abs(r.x)>H||Math.abs(r.z)>H;if(hit||edge||r.fuelOut){skBlast(V(cl(r.x,-H,H),Math.max(.3,r.y),cl(r.z,-H,H)),r.R,r.dmg,r.n);if(r.next){r.next(r);return}rcEnd()}if(r.fuel!=null){r.fuel-=dt;if(r.fuel<=0)r.fuelOut=1}},expire(r){skBlast(V(r.x,Math.max(.3,r.y),r.z),r.R,r.dmg,r.n)},cam(r){return V(r.x,r.y,r.z)}},o))}
function skDrone(o){return rcStart(Object.assign({elec:1,turn:2.6,hint:'Mouse steer · W forward · LMB detonate',missiles:0,cd:0,tick(r,dt,edge){const v=key.KeyW?10:key.KeyS?-4:3,d=V(-Math.sin(r.hy)*Math.cos(r.hp),Math.sin(r.hp),-Math.cos(r.hy)*Math.cos(r.hp)),st=Math.abs(v)*dt;const t=castW(V(r.x,r.y,r.z),d.clone().multiplyScalar(Math.sign(v)||1),st+.5);if(t>st+.4){r.x+=d.x*v*dt;r.y+=d.y*v*dt;r.z+=d.z*v*dt}r.y=Math.max(skGnd(r.x,r.z)+.5,Math.min(30,r.y));r.x=cl(r.x,-H+1,H-1);r.z=cl(r.z,-H+1,H-1);r.cd-=dt;
   if(r.missiles){if(edge&&r.cd<=0&&r.missiles>0){r.cd=.45;r.missiles--;const mm=skM('knight',.25),dd=d.clone();mm.position.set(r.x,r.y-.3,r.z);S.add(mm);skAdd({id:'mm',n:'GildedBird',m:mm,x:r.x,y:r.y-.3,z:r.z,life:2.2,vx:dd.x*32,vy:dd.y*32,vz:dd.z*32,tick(o,dt){const tt=castW(V(o.x,o.y,o.z),V(o.vx,o.vy,o.vz).normalize(),32*dt+.4);o.x+=o.vx*dt;o.y+=o.vy*dt;o.z+=o.vz*dt;mm.lookAt(o.x+o.vx,o.y+o.vy,o.z+o.vz);if(tt<32*dt+.4||o.y<=skGnd(o.x,o.z)+.2){skBlast(V(o.x,Math.max(.3,o.y),o.z),3.4,92,'GildedBird',true);skRemove(o,false)}}});beep(700,.12,'sawtooth',.05)}if(r.missiles<=0&&r.cd<=0&&!r.out){r.out=1;r.t=Math.min(r.t,2)}}
   else if(edge){skBlast(V(r.x,r.y,r.z),r.R||5.5,r.dmg||140,r.n);rcEnd()}},expire(r){if(!r.missiles)skBlast(V(r.x,r.y,r.z),r.R||5.5,r.dmg||140,r.n)},cam(r){return V(r.x,r.y,r.z)}},o))}
function skGunner(o){return rcStart(Object.assign({elec:0,fireT:0,hint:'Aim with the mouse · LMB fire',tick(r,dt,edge){r.ang=(r.ang||0)+dt*.25;r.x=Math.cos(r.ang)*r.orbit;r.z=Math.sin(r.ang)*r.orbit;r.fireT-=dt;r.shoot(r,dt,edge)},cam(r){return V(r.x,r.y,r.z)}},o))}
function skGunFire(r,dmg,R,quiet,iv,name){if(r.fireT>0)return;r.fireT=iv;const o=V(r.x,r.y,r.z),d=V(-Math.sin(r.hy)*Math.cos(r.hp),Math.sin(r.hp),-Math.cos(r.hy)*Math.cos(r.hp)),t=Math.min(160,castW(o,d,160)),p=o.clone().add(d.clone().multiplyScalar(t));p.y=Math.max(.3,p.y);skLine(o.clone().add(V(.5,-1,0)),p,0xffe080,.06);skBlast(p,R,dmg,name,quiet)}
/* ---------- the streaks ---------- */
const SKB={
 uav(){SK.uavT=30;uav=30;SK.pingT=0;msg('UAV online',1.5)},
 advuav(){SK.uavT=30;SK.advT=30;uav=30;msg('Advanced UAV online',1.5)},
 pradar(){SK.prT=45;skAdd({id:'pradar',n:'Personal Radar',m:skM('pradar',.5),x:P.x,y:2.3,z:P.z,hp:45,air:1,elec:1,life:45,tick(o,dt){o.x+=(P.x+Math.cos(SK.t*.9)*1.2-o.x)*Math.min(1,dt*3);o.z+=(P.z+Math.sin(SK.t*.9)*1.2-o.z)*Math.min(1,dt*3);o.y=2.4+Math.sin(SK.t*3)*.12;o.m.rotation.y+=dt*2},end(){SK.prT=0}});msg('Personal Radar online',1.5)},
 motion(){const p=skSpot();skAdd({id:'motion',n:'Motion Sensor',m:skM('motion',1),x:p.x,y:p.y,z:p.z,hp:60,elec:1,life:60,r:22,tick(o,dt){o.m.children[2]&&(o.m.rotation.y+=dt*1.2)}});msg('Motion Sensor placed',1.5)},
 cuav(){SK.cuavT=30;msg('Counter-UAV: enemy radar jammed',2);beep(300,.4,'sawtooth',.06)},
 emp(){SK.empT=10;ST.flash=Math.max(ST.flash,1.1);msg('EMP: enemy electronics down',2.5);noise(.8,150,.3);for(const e of SK.ea.slice())skEaDie(e)},
 flak(){SK.flakT=50;const pts=[];for(let i=0;i<3;i++){const a=i*2.09+Math.random();const[x,z]=freeNear(P.x+Math.cos(a)*16,P.z+Math.sin(a)*16);pts.push([x,z])}for(const[x,z]of pts)skAdd({id:'flak',n:'Flak Gun',m:skM('flak',1),x,y:skGnd(x,z),z,hp:150,elec:1,life:50,cd:0,tick(o,dt){o.cd-=dt;const e=SK.ea.find(e=>Math.hypot(e.x-o.x,e.z-o.z)<90);if(e){const a=Math.atan2(e.x-o.x,e.z-o.z);o.m.rotation.y=a;if(o.cd<=0){o.cd=.45;skLine(V(o.x,2.4,o.z),V(e.x+(Math.random()-.5)*3,e.y,e.z),0xffd070,.1);e.hp-=45;if(e.hp<=0)skEaDie(e)}}}});msg('Flak Guns active',2)},
 care(){const p=skAimPoint(40);skCrate(p.x,p.z,'care',true);msg('Care Package inbound',2)},
 airdrop(){const f=V(-Math.sin(yaw),0,-Math.cos(yaw)),c=skAimPoint(60);const m=skM('airdrop',.9);m.rotation.y=Math.atan2(f.x,f.z);S.add(m);let run=0,n=0,acc=0;const L=H*1.3,sx=c.x-f.x*L,sz=c.z-f.z*L;skAdd({id:'plane',n:'Cargo plane',m,x:sx,y:48,z:sz,life:9,hp:0,tick(o,dt){run+=34*dt;o.x=sx+f.x*run;o.z=sz+f.z*run;acc+=dt;if(acc>.9&&n<5&&Math.abs(o.x)<H-4&&Math.abs(o.z)<H-4){acc=0;n++;skCrate(o.x+(Math.random()-.5)*6,o.z+(Math.random()-.5)*6,'care',true)}}});msg('Emergency Airdrop inbound',2.2);noise(1.4,200,.2)},
 vests(){const p=skAimPoint(40);skCrate(p.x,p.z,'vests',true);msg('Ballistic Vests inbound',2)},
 ammo(){const p=skSpot(5);skCrate(p.x,p.z,'ammo',false);msg('Ammo Crate placed',1.5)},
 sim(){const p=skSpot();skAdd({id:'sim',n:'S.I.M.',m:skM('sim',1),x:p.x,y:p.y,z:p.z,hp:70,elec:1,life:70,cd:1,tick(o,dt){o.cd-=dt;if(o.cd>0)return;const t=skNearLos(o,9);if(t){o.cd=2.4;skLine(V(o.x,1.2,o.z),V(t.x,5,t.z),0xffd070,.2);skShell(t.x,t.z,3.3,92,'S.I.M.',.55,false,false);beep(500,.2,'square',.05)}}});msg('S.I.M. deployed',1.5)},
 dcvt(){const f=V(-Math.sin(yaw),0,-Math.cos(yaw));rcStart({id:'dcvt',n:'DC-VT',elec:1,m:skM('dcvt',1),x:P.x+f.x*1.6,z:P.z+f.z*1.6,y:0,ch:yaw,v:0,t:22,hint:'W/S drive · A/D steer · LMB detonate',tick(r,dt,edge){const mvv=(key.KeyW?1:0)-(key.KeyS?.4:0),tg=mvv*13;r.v+=(tg-r.v)*Math.min(1,dt*3);r.ch+=((key.KeyA?1:0)-(key.KeyD?1:0))*dt*2.4*Math.min(1,Math.abs(r.v)/4);const fx=-Math.sin(r.ch),fz=-Math.cos(r.ch);mv(r,fx*r.v*dt,fz*r.v*dt,.5);r.y=skGnd(r.x,r.z);r.hy=r.ch;r.camPitch=-.22;const t=skNear(r,2.4);if(edge||t){skBlast(V(r.x,.4,r.z),6,150,'DC-VT');rcEnd()}},expire(r){skBlast(V(r.x,.4,r.z),6,150,'DC-VT')},cam(r){return V(r.x+Math.sin(r.ch)*3.6,r.y+1.8,r.z+Math.cos(r.ch)*3.6)}});},
 bombdrone(){skDrone({id:'bombdrone',n:'BOMB DRONE',m:skM('bombdrone',1),x:P.x,y:2.2,z:P.z,t:28,R:5.5,dmg:140})},
 hunter(){const p=skSpot(3);skAdd({id:'hunter',n:'Hunter Killer Drone',m:skM('hunter',1),x:p.x,y:2,z:p.z,hp:25,air:1,elec:1,life:16,tick(o,dt){const t=skNear(o,1e9);if(!t){o.y=3+Math.sin(SK.t*3);return}const dx=t.x-o.x,dz=t.z-o.z,D=Math.hypot(dx,dz);const tw=Math.min(1,dt*4);o.x+=dx/D*13*dt;o.z+=dz/D*13*dt;o.y+=(1.4-o.y)*tw;o.m.rotation.y=Math.atan2(dx,dz);if(D<1.5){skBlast(V(o.x,.8,o.z),3.6,118,'Hunter Killer');skRemove(o,false)}}});msg('Hunter Killer launched',1.5)},
 sentry(){const p=skSpot();skAdd({id:'sentry',n:'Sentry Gun',m:skM('sentry',1),x:p.x,y:p.y,z:p.z,hp:130,elec:1,life:65,cd:0,face:yaw+Math.PI,tick(o,dt){const t=skNearLos(o,28);if(t){const a=Math.atan2(t.x-o.x,t.z-o.z);o.face+=Math.atan2(Math.sin(a-o.face),Math.cos(a-o.face))*Math.min(1,dt*7);o.cd-=dt;if(o.cd<=0){o.cd=.1;skLine(V(o.x,1.15,o.z),V(t.x,1.1,t.z),0xffd070,.05);if(Math.random()<.78)skHurt(t,8,'Sentry Gun')}}else o.face+=dt*.5;o.m.rotation.y=o.face}});msg('Sentry Gun deployed',1.5)},
 shieldt(){const p=skSpot();skAdd({id:'shieldt',n:'Shield Turret',m:skM('shieldt',1),x:p.x,y:p.y,z:p.z,hp:280,shield:1,elec:1,life:65,cd:0,face:yaw+Math.PI,tick(o,dt){const t=skNearLos(o,30);if(t){const a=Math.atan2(t.x-o.x,t.z-o.z);o.face+=Math.atan2(Math.sin(a-o.face),Math.cos(a-o.face))*Math.min(1,dt*3);o.cd-=dt;if(o.cd<=0){o.cd=.13;skLine(V(o.x,1.1,o.z),V(t.x,1.1,t.z),0xffd070,.05);if(Math.random()<.8)skHurt(t,14,'Shield Turret')}}o.m.rotation.y=o.face}});msg('Shield Turret deployed',1.5)},
 pal(){const p=skSpot();skAdd({id:'pal',n:'PAL Turret',m:skM('pal',1),x:p.x,y:p.y,z:p.z,hp:160,elec:1,life:70,cd:0,tick(o,dt){o.cd-=dt;const e=SK.ea.find(e=>Math.hypot(e.x-o.x,e.z-o.z)<80);if(e){o.m.rotation.y=Math.atan2(e.x-o.x,e.z-o.z);if(o.cd<=0){o.cd=1.1;skLine(V(o.x,1.4,o.z),V(e.x,e.y,e.z),0xffffff,.25);e.hp-=70;beep(800,.2,'sawtooth',.05);if(e.hp<=0)skEaDie(e)}}}});msg('PAL Turret deployed',1.5)},
 guardian(){const p=skSpot();const m=skM('guardian',1);const cone=new THREE.Mesh(new THREE.ConeGeometry(5,13,20,1,true),new THREE.MeshBasicMaterial({color:0xff7a3a,transparent:true,opacity:.14,side:THREE.DoubleSide,depthWrite:false}));cone.rotation.x=-Math.PI/2;cone.position.set(0,1.75,6.5);m.add(cone);skAdd({id:'guardian',n:'Guardian',m,x:p.x,y:p.y,z:p.z,hp:180,elec:1,life:60,cd:0,face:yaw+Math.PI,tick(o,dt){const t=skNearLos(o,13);if(t){const a=Math.atan2(t.x-o.x,t.z-o.z);o.face+=Math.atan2(Math.sin(a-o.face),Math.cos(a-o.face))*Math.min(1,dt*2.5)}else o.face+=dt*.8;o.m.rotation.y=o.face;o.cd-=dt;if(o.cd<=0){o.cd=.25;for(const b of foes()){const dx=b.x-o.x,dz=b.z-o.z,D=Math.hypot(dx,dz);if(D<13&&Math.cos(Math.atan2(dx,dz)-o.face)>.72&&navLos(o.x,o.z,b.x,b.z)){skHurt(b,5.5,'Guardian');b.stun=Math.max(b.stun||0,.2)}}}}});msg('Guardian deployed',1.5)},
 groundsis(){const p=skSpot(3);skUnit({id:'groundsis',n:'Groundsis',m:skM('groundsis',1),x:p.x,y:0,z:p.z,hp:230,life:70,cd:1,tick(o,dt){const t=skNearLos(o,22),tx=P.x+Math.cos(SK.t*.3)*4,tz=P.z+Math.sin(SK.t*.3)*4;if(Math.hypot(tx-o.x,tz-o.z)>3.2)navMove(o,dt,tx,tz,6,null);o.y=skGnd(o.x,o.z);o.m.rotation.y=t?Math.atan2(t.x-o.x,t.z-o.z):(o.mva||0);o.cd-=dt;if(t&&o.cd<=0){o.cd=1.1;skLine(V(o.x,1.4,o.z),V(t.x,1.2,t.z),0xffd070,.1);skBlast(V(t.x,1.2,t.z),2.7,58,'Groundsis',true)}}});msg('Groundsis deployed',1.5)},
 terminator(){skMissile({bias:-1.0,n:'TERMINATOR',m:skM('terminator',.4),x:P.x,y:75,z:P.z,hy:yaw,hp:-1.2,spd:36,R:7.5,dmg:210,t:30})},
 glide(){skMissile({bias:-.35,n:'GLIDE BOOM',m:skM('glide',.4),x:P.x,y:85,z:P.z,hy:yaw,hp:-.5,spd:20,grav:7,turn:.9,R:10.5,dmg:260,t:30,hint:'Steer the glide with the mouse · LMB detonate'})},
 knight(){const f=V(-Math.sin(yaw),0,-Math.cos(yaw));let left=3;const launch=r=>{r.x=P.x+f.x*.8;r.y=1.6;r.z=P.z+f.z*.8;r.fuel=7;r.fuelOut=0;r.hy=yaw;r.hp=pitch;r.hint='Knight Rocket · '+left+' left · LMB detonate'};const o={n:'KNIGHT ROCKET',m:skM('knight',.35),spd:22,turn:2.2,R:5.5,dmg:165,t:45,fuel:7,next(r){left--;if(left<=0){rcEnd();return}launch(r)},x:P.x+f.x*.8,y:1.6,z:P.z+f.z*.8,hy:yaw,hp:pitch};skMissile(o)},
 gilded(){skDrone({id:'gilded',n:'GILDEDBIRD',m:skM('gilded',.7),x:P.x,y:6,z:P.z,t:32,missiles:8,hint:'Mouse steer · W forward · LMB micro-missile'})},
 precision(){skFly({model:'precision',sc:.9,alt:42,spd:50,iv:.22,spread:3.2,R:4.2,d:135,name:'Precision Airstrike',n:3,gap:6});msg('Precision Airstrike inbound',2)},
 mortar(){const c=skAimPoint(70),pts=foes().sort((a,b)=>Math.hypot(a.x-c.x,a.z-c.z)-Math.hypot(b.x-c.x,b.z-c.z)).slice(0,5).map(b=>[b.x,b.z]);while(pts.length<10)pts.push([c.x+(Math.random()-.5)*20,c.z+(Math.random()-.5)*20]);msg('Mortar Strike: incoming',2);pts.forEach(([x,z],i)=>skShell(cl(x+(Math.random()-.5)*4,-H+2,H-2),cl(z+(Math.random()-.5)*4,-H+2,H-2),4.6,135,'Mortar Strike',2.2+i*.45,false,true))},
 stealth(){skFly({model:'stealth',sc:1,alt:55,spd:46,iv:.09,spread:26,R:5.6,d:145,name:'Stealth Bomber',n:1});msg('Stealth Bomber inbound',2)},
 napalm(){skFly({model:'napalm',sc:1.4,alt:38,spd:42,iv:.5,spread:2,R:3,d:40,nap:1,fr:4.8,name:'Napalm Strike',n:1});msg('Napalm Strike inbound',2)},
 dogs(){for(let i=0;i<4;i++)skDog('dogs','Attack Dog',40,55,1);msg('Attack Dogs released',2)},
 achopper(){skHeli({id:'achopper',n:'Attack Chopper',model:'achopper',sc:1,hp:420,dmg:15,iv:.3,life:50,orbit:22,hy:13});msg('Attack Chopper inbound',2)},
 gunner(){skGunner({n:'CHOPPER GUNNER',x:0,y:42,z:20,orbit:20,t:30,hint:'Aim with the mouse · LMB fire 30mm',shoot(r,dt){if(trig)skGunFire(r,16,2,true,.09,'Chopper Gunner')}})},
 dc260(){skGunner({n:'DC-260',x:0,y:60,z:25,orbit:24,t:38,w:2,hint:'1: 105mm  2: 40mm  3: 25mm · LMB fire',shoot(r,dt){if(key.Digit1)r.w=0;else if(key.Digit2)r.w=1;else if(key.Digit3)r.w=2;if(trig){if(r.w==0)skGunFire(r,260,9,false,2.2,'DC-260 105mm');else if(r.w==1)skGunFire(r,100,3.8,false,.55,'DC-260 40mm');else skGunFire(r,15,1.7,true,.07,'DC-260 25mm')}r.hint=['105mm','40mm','25mm'][r.w]+' selected · keys 1/2/3'}})},
 overwatch(){skHeli({id:'overwatch',n:'Overwatch',model:'overwatch',sc:.7,hp:360,dmg:13,iv:.22,life:46,follow:1,orbit:9,hy:8,rng:42,spd:.5});msg('Overwatch inbound',2)},
 tolv(){skFly({model:'tolv',sc:.9,alt:36,spd:44,iv:.45,spread:3,R:6,d:160,name:'TOLV Planet',n:1,after(){skHeli({id:'tolv',n:'TOLV Planet',model:'tolv',sc:.8,hp:320,dmg:15,iv:.24,life:30,follow:0,orbit:10,hy:18,spd:.25,rng:48})}});msg('TOLV Planet inbound',2)},
 cube(){skGunner({n:'CUBE TURRET',x:0,y:62,z:0,orbit:14,t:35,hint:'LMB minigun · RMB cannon',shoot(r,dt){if(trig)skGunFire(r,18,1.5,true,.05,'Cube Turret');if(ST.adsIn)skGunFire(r,140,5,false,1.4,'Cube Cannon')}})},
 jugg(){skStartSuit('jugg',60,300,.72,'MNG');msg('Juggernaut: minigun online',2)},
 goliath(){skStartSuit('goliath',50,520,.78,'MNG');msg('Goliath online · X to self-destruct',2.5)},
 para(){for(let i=0;i<4;i++){const a=i*1.57+Math.random(),x=cl(P.x+Math.cos(a)*5,-H+3,H-3),z=cl(P.z+Math.sin(a)*5,-H+3,H-3),m=skM('para',1);skUnit({id:'para',n:'Paratrooper',m,x,y:30,z,hp:80,life:65,cd:0,fall:1,tick(o,dt){if(o.fall){o.y-=7*dt;const g=skGnd(o.x,o.z);if(o.y<=g){o.y=g;o.fall=0;m.children.forEach(c=>{if(c.position.y>2.4)c.visible=false})}return}const t=skNearLos(o,28),tx=t?t.x:P.x+Math.cos(i)*3.5,tz=t?t.z:P.z+Math.sin(i)*3.5;if(Math.hypot(tx-o.x,tz-o.z)>(t?14:3))navMove(o,dt,tx,tz,5.5,null);o.y=skGnd(o.x,o.z);o.m.rotation.y=t?Math.atan2(t.x-o.x,t.z-o.z):(o.mva||0);o.cd-=dt;if(t&&o.cd<=0){o.cd=.45;skLine(V(o.x,1.3,o.z),V(t.x,1.1,t.z),0xffd070,.05);if(Math.random()<.55)skHurt(t,13,'Paratroopers')}}})}msg('Paratroopers dropping',2)},
 guarddog(){skDog('guarddog','Guard Dog',90,90,1);msg('Guard Dog at your side',2)},
 fear(){skGiveHeavy('MNG')},boom(){skGiveHeavy('GL')},flame(){skGiveHeavy('FT')},
 satellite(){const pts=foes().sort(()=>Math.random()-.5).slice(0,5).map(b=>[b.x,b.z]);while(pts.length<4)pts.push([(Math.random()-.5)*H,(Math.random()-.5)*H]);msg('Super Satellite: kinetic strike',2.5);pts.forEach(([x,z],i)=>{const rod=new THREE.Mesh(new THREE.CylinderGeometry(.18,.18,70,8),new THREE.MeshBasicMaterial({color:0xffe0a0}));rod.position.set(x,200,z);S.add(rod);let y=200,done=0;const t0_=SK.t+1+i*.6;skAdd({id:'rod',n:'Kinetic rod',m:rod,x,y:200,z,life:9,tick(o,dt){if(SK.t<t0_){o.y=200;return}o.y-=170*dt;if(o.y<=35&&!done){done=1;skBlast(V(x,.3,z),6,230,'Super Satellite');skRemove(o,false)}}})});for(let i=0;i<3;i++){const a=i*2.09;const sx=P.x+Math.cos(a)*6,sz=P.z+Math.sin(a)*6;skAdd({id:'smoke',n:'Smoke',m:new THREE.Group(),x:sx,y:0,z:sz,life:12,tick(o,dt){burst(V(o.x,1.5,o.z),3,0xcccccc,2,2,1.4)}})}const p=skAimPoint(30);skCrate(p.x,p.z,'care',true)},
 annihil(){const c=skAimPoint(80),f=V(-Math.sin(yaw),0,-Math.cos(yaw)),beam=new THREE.Group();const core=new THREE.Mesh(new THREE.CylinderGeometry(.8,1.6,160,16,1,true),new THREE.MeshBasicMaterial({color:0x8af0ff,transparent:true,opacity:.55,depthWrite:false,side:THREE.DoubleSide})),halo=new THREE.Mesh(new THREE.CylinderGeometry(2.4,3.6,160,16,1,true),new THREE.MeshBasicMaterial({color:0x3aa0ff,transparent:true,opacity:.18,depthWrite:false,side:THREE.DoubleSide}));core.position.y=80;halo.position.y=80;beam.add(core,halo);msg('Annihilation: orbital beam',2.5);noise(1.6,120,.3);skAdd({id:'beam',n:'Annihilation',m:beam,x:c.x,y:0,z:c.z,life:8,cd:0,tick(o,dt){o.x=cl(o.x+f.x*5*dt,-H+2,H-2);o.z=cl(o.z+f.z*5*dt,-H+2,H-2);o.y=skGnd(o.x,o.z);beam.rotation.y+=dt*3;if(Math.random()<.5)burst(V(o.x,.6,o.z),2,0x8af0ff,5,.5,.4);o.cd-=dt;if(o.cd<=0){o.cd=.2;for(const b of foes())if(Math.hypot(b.x-o.x,b.z-o.z)<5.2)skHurt(b,28,'Annihilation')}}})},
 nuke(){skNukeStart()},
};
function skStartSuit(k,t,mhp,sp,wk){if(SK.suit)skEndSuit('');SK.suit={k,t,sp,mhp:P.mhp,msh:P.msh,wk};P.mhp=mhp;P.hp=mhp;P.msh=0;P.sh=0;skGiveHeavy(wk)}
{const _f=actField;actField=function(){if(SK.suit&&SK.suit.k=='goliath'){boom(V(P.x,.6,P.z),{R:9.5,d:310,own:1,c:0xff8a30});skEndSuit('Self-destruct');return}_f.apply(this,arguments)}}
;
/* ######## sk_ui.js ######## */
/* ===================== sk_ui.js ===================== */
/* ---------- killstreak loadout: 3 selected streaks (L.ks), awarding by kills, the HUD, using them (keys 3 to 6 use the ready ones in the order you earned them),
   and the SCORESTREAKS screen: a grid of every streak with its model, description and cost, three SELECTED slots at the bottom. Opened from the Killstreaks tile in the loadout screen. ---------- */
const skSel=()=>{if(!Array.isArray(L.ks)||L.ks.length!=3)L.ks=SK_DEF.slice();return L.ks};
const skOK=id=>!!STK[id]&&(typeof unlocked=='function'?unlocked('sk:'+id):true);
{const _san=sanitize;sanitize=function(){_san.apply(this,arguments);const k=skSel();for(let i=0;i<3;i++)if(!skOK(k[i])||k[i]=='nuke')k[i]=SK_DEF[i]}}
function skAward(){if(mode=='Zombies')return;for(const id of skSel()){const s=STK[id];if(!s||SK.got[id]||q.includes(id))continue;if(ks>=Math.max(1,s.k-hl())){SK.got[id]=1;q.push(id);msg(s.n+' ready: press '+(2+q.length),2.5);if(typeof popup=='function')popup(s.n.toUpperCase(),'KILLSTREAK READY')}}
 if(ks>=30&&!SK.got.nuke&&!over&&!P.dead&&!SK.nk){SK.got.nuke=1;if(typeof popup=='function')popup('TACTICAL NUKE','30 KILLS');SKB.nuke()}}
useStreak=function(i){i=i||0;if(mode=='Zombies')return zUse();if(P.dead||SK.rc||q.length<=i)return;const id=q[i],f=SKB[id];if(!f){q.splice(i,1);return}q.splice(i,1);beep(500,.2,'sine',.1);f()};
ksHud=function(){const sel=skSel(),row=(id)=>{const s=STK[id],t=Math.max(1,s.k-hl()),qi=q.indexOf(id),rdy=qi>=0,used=!rdy&&SK.got[id];return `<div class="kt ${rdy?'rdy':used?'used':''}"><b>${s.n}</b><i>${rdy?'['+(qi+3)+'] READY':used?'USED':Math.min(ks,t)+' / '+t}</i></div>`},
 h=sel.map(row).join('')+q.filter(id=>!sel.includes(id)).map(row).join('');if(h!=ksC){ksC=h;$('#kst').innerHTML=`<small>KILLSTREAKS · ${ks}</small>`+h}};
/* ---------- images ---------- */
const skImg=id=>{const u=objImg('sk_'+id,()=>skModel(id));return u||''};
const skTag=id=>{const u=skImg(id);return u?`<img src="${u}" alt="">`:''};
/* ---------- screen ---------- */
const SKU={sel:'uav',slot:0,cat:-1};
function skOpen(){SKU.sel=skSel()[SKU.slot]||'uav';$$('#nav button').forEach(x=>x.classList.remove('on'));$$('.pn').forEach(p=>p.classList.toggle('on',p.id=='p-ks'));skRender()}
function skBack(){const b=document.querySelector('#nav button[data-p="load"]');if(b)b.click()}
function skRender(){const e=$('#p-ks');if(!e)return;const sel=skSel(),cur=STK[SKU.sel]||STK.uav,lock=!skOK(cur.id),hid=cur.id=='nuke'&&lock;
 const tiles=STKL.filter(s=>s.id!='nuke'&&(SKU.cat<0||s.c==SKU.cat)).map(s=>{const lk=!skOK(s.id),hd=s.id=='nuke'&&lk,on=sel.includes(s.id);return `<button class="sk ${SKU.sel==s.id?'sel':''} ${lk?'lk':''} ${on?'eq':''}" data-sk="${s.id}"><span class="skc">${hd?'':s.k}</span>${lk?`<u>🔒</u>`:''}<span class="ski">${hd?'':skTag(s.id)}</span><b>${hd?'???':s.n}</b>${lk&&!hd?`<small>Level ${s.lv}</small>`:''}</button>`}).join('');
 const slots=sel.map((id,i)=>{const s=STK[id];return `${i?'<i class="ar">▸</i>':''}<button class="ss ${SKU.slot==i?'on':''}" data-ss="${i}"><span class="ski">${skTag(id)}</span><b>${s.k}</b><small>${s.n}</small></button>`}).join('');
 e.innerHTML=`<div class="skp"><div class="sk-top"><button class="cu-back" data-skact="back">‹</button><h2>SCORESTREAKS</h2><div class="sk-cats"><button data-skcat="-1" class="${SKU.cat<0?'on':''}">ALL</button>${SKC.map((n,i)=>`<button data-skcat="${i}" class="${SKU.cat==i?'on':''}" title="${n}">${i+1}</button>`).join('')}</div></div>
  <div class="sk-main"><div class="sk-grid">${tiles}</div><aside class="sk-info"><h3>${hid?'???':cur.n}</h3><p class="sk-d">${hid?'A hidden streak. Reach the level to reveal it.':cur.d}</p><p class="sk-m">${SKC[cur.c]} · ${cur.k} kills${lock?` · unlocks at level ${cur.lv}`:''}</p><div class="sk-big">${hid?'':skTag(cur.id)}</div>
   <button class="big sk-eq" data-skact="equip" ${lock?'disabled':''}>${sel.includes(cur.id)?'Selected in slot '+(sel.indexOf(cur.id)+1):'Equip to slot '+(SKU.slot+1)}</button></aside></div>
  <div class="sk-sel"><h4>SELECTED</h4><div class="sk-slots">${slots}</div><p class="sk-h">Pick a slot, then a streak. Streaks are earned in a row without dying: the kills number is how many kills each needs. Press 3, 4, 5 to use them in the order you earn them. The Nuke cannot be equipped: it launches by itself at 30 kills in a row.</p></div></div>`}
document.addEventListener('click',e=>{const t=e.target;const op=t.closest('.ls[data-slot="ks"]');if(op){e.stopImmediatePropagation();skOpen();return}if(!t.closest('#p-ks'))return;
 const a=t.closest('[data-skact]');if(a){if(a.dataset.skact=='back')skBack();else if(a.dataset.skact=='equip'){const id=SKU.sel;if(!skOK(id)||id=='nuke')return;const sel=skSel(),j=sel.indexOf(id);if(j>=0&&j!=SKU.slot){const tmp=sel[SKU.slot];sel[SKU.slot]=id;sel[j]=tmp}else sel[SKU.slot]=id;try{ui()}catch(er){}skRender()}return}
 const c=t.closest('[data-skcat]');if(c){SKU.cat=+c.dataset.skcat;skRender();return}const s=t.closest('[data-sk]');if(s){SKU.sel=s.dataset.sk;skRender();return}const sl=t.closest('[data-ss]');if(sl){SKU.slot=+sl.dataset.ss;SKU.sel=skSel()[SKU.slot];skRender()}},true);

try{ldRender()}catch(e){}
;

/* ===================== sk_net.js ===================== */
/* ---------- killstreaks in multiplayer: every placed device, aircraft and helicopter is mirrored to the other players as a model, they can shoot it down (the owner applies the damage),
   explosions are shown to everybody, and the NUKE is announced to the whole lobby and ends the match for everyone. Rocket Launcher and RayGun deal extra damage to streaks. ---------- */
let NUKE_BY=0;
const skMul=w=>w&&w.k=='RG'?3.5:w&&w.k=='RL'?4:1;
SK.uid=0;SK.gh={};SK.na=0;SK.nk=0;
{const _sm=skModel;skModel=function(id){const g=_sm.apply(this,arguments);if(g&&g.userData)g.userData.mid=id;return g}}
{const _a=skAdd;skAdd=function(o){const r=_a.apply(this,arguments);if(r&&!r.uid)r.uid=++SK.uid;return r}}
function skNetSend(dt){if(!netOn||!run||over)return;SK.na+=dt;if(SK.na<.1)return;SK.na=0;const l=[],mid=m=>m.userData&&m.userData.mid;
 for(const o of SK.objs){if(!o.m||!o.uid)continue;const id=mid(o.m);if(!id)continue;l.push([o.uid,id,+o.x.toFixed(1),+o.y.toFixed(1),+o.z.toFixed(1),+(o.m.rotation.y||0).toFixed(2),+o.m.scale.x.toFixed(2),o.hp>0&&!o.inv?1:0])}
 for(const a of SK.air){if(!a.m)continue;if(!a.uid)a.uid=++SK.uid;const id=mid(a.m);if(!id)continue;l.push([a.uid,id,+a.m.position.x.toFixed(1),+a.m.position.y.toFixed(1),+a.m.position.z.toFixed(1),+a.m.rotation.y.toFixed(2),+a.m.scale.x.toFixed(2),0])}
 const r=SK.rc;if(r&&r.m&&mid(r.m))l.push([-1,mid(r.m),+r.x.toFixed(1),+r.y.toFixed(1),+r.z.toFixed(1),+(r.hy||0).toFixed(2),+r.m.scale.x.toFixed(2),0]);
 netSend({t:'sko',l})}
function skNetObjs(d){if(d.id==myId||!run||over||mode=='Zombies')return;const now=performance.now(),seen=new Set();
 for(const[u,mid,x,y,z,ry,sc,hp]of d.l){const k=d.id+':'+u;seen.add(k);let g=SK.gh[k];
  if(!g){let m;try{m=skModel(mid)}catch(e){continue}m.scale.setScalar(sc||1);m.position.set(x,y,z);S.add(m);let rad=1;try{rad=Math.max(.8,Math.min(5,new THREE.Box3().setFromObject(m).getSize(new THREE.Vector3()).length()*.45))}catch(e){}g=SK.gh[k]={m,own:d.id,u,rad}}
  g.tx=x;g.ty=y;g.tz=z;g.ry=ry;g.t=now;g.hp=hp}
 for(const k in SK.gh)if(k.startsWith(d.id+':')&&!seen.has(k))skGhostDrop(k,true)}
function skGhostDrop(k,fx){const g=SK.gh[k];if(!g)return;if(fx&&g.hp)burst(g.m.position.clone(),18,0xff9a30,6,.7,.25);S.remove(g.m);delete SK.gh[k]}
function skGhostTick(dt){const now=performance.now(),k=Math.min(1,dt*10);for(const key in SK.gh){const g=SK.gh[key];if(now-g.t>1600){skGhostDrop(key,false);continue}const p=g.m.position;p.x+=(g.tx-p.x)*k;p.y+=(g.ty-p.y)*k;p.z+=(g.tz-p.z)*k;g.m.rotation.y=g.ry}}
function skGhostClear(){for(const k in SK.gh)skGhostDrop(k,false)}
/* shooting at someone else's streak */
function skShotGhost(){if(!netOn||!run||P.dead)return;const w=cw();if(!w||!w.k)return;const o=C.position.clone(),d=aimDir(),wall=castW(o,d,90);let best=null,bt=1e9;
 for(const k in SK.gh){const g=SK.gh[k];if(!g.hp)continue;const c=g.m.position.clone();c.y+=g.rad*.4;const t=rs(o,d,c,g.rad);if(t<bt&&t<wall&&t<90){bt=t;best=g}}
 if(best){const dmg=Math.round(Math.min(400,w.d*Math.max(1,w.pel*.5)*skMul(w)));netSend({t:'skh',to:best.own,u:best.u,d:dmg});$('#hm').className='on';hmT=.12}}
function skNetHit(d){if(d.to!=myId||!run)return;const o=SK.objs.find(x=>x.uid==d.u);if(!o||!o.hp||o.inv)return;o.hp-=Math.max(0,Math.min(400,+d.d||0));if(o.hp<=0){feed((names[d.id]||'An enemy')+' destroyed your '+(o.n||'streak'));skRemove(o,true)}}
function skNetFx(d){if(d.id==myId||!run)return;const p=V(d.x,d.y,d.z);burst(p,16,0xffa040,6,.6,.25);const dist=p.distanceTo(C.position);if(dist<70)noise(.4,500,.2*Math.max(0,1-dist/70))}
/* explosions: shown to everyone, and rockets / RayGun shots hurt other players' streaks in the blast */
{const _sb=skBlast;skBlast=function(p,R){_sb.apply(this,arguments);if(netOn)netSend({t:'skx',x:+p.x.toFixed(1),y:+p.y.toFixed(1),z:+p.z.toFixed(1)})}}
{const _b=boom;boom=function(p,g){_b.apply(this,arguments);if(!netOn||!g||g.tac||SK.nok)return;const m=g.w=='RL'?3.5:g.w=='RG'?3:1;for(const k in SK.gh){const gh=SK.gh[k];if(!gh.hp)continue;const D=gh.m.position.distanceTo(p);if(D<(g.R||4)+gh.rad)netSend({t:'skh',to:gh.own,u:gh.u,d:Math.round(Math.min(400,(g.d||100)*m*(1-.5*D/((g.R||4)+gh.rad))))})}}}
{const _sh=shoot;shoot=function(){const w=cw(),was=w?w.mag:0;_sh.apply(this,arguments);if(w&&w.mag<was)skShotGhost()}}
{const _st=skTick;skTick=function(dt){try{_st.apply(this,arguments)}catch(e){}try{skGhostTick(dt);skNetSend(dt);if(run&&!over&&!P.dead)skAward()}catch(e){}}}
{const _sr=skReset;skReset=function(){_sr.apply(this,arguments);skGhostClear();SK.nk=0;NUKE_BY=0}}
/* ---------- the nuke ---------- */
function skNukeStart(){if(SK.nk)return;if(netOn)netSend({t:'nuke',by:myId});skNukeSeq(myId,1)}
function skNukeSeq(by,mine){if(SK.nk)return;SK.nk=1;let n=8;const who=mine?'YOU':String(names[by]||'AN ENEMY').toUpperCase();msg((mine?'NUKE LAUNCHED':'NUKE INBOUND · '+who)+' · '+n,2);noise(2,100,.3);
 const iv=setInterval(()=>{if(!run||over){clearInterval(iv);SK.nk=0;return}n--;msg(n>0?'NUKE IN '+n:'DETONATION',1);beep(400+(8-n)*90,.15,'square',.08);
  if(n<=0){clearInterval(iv);ST.flash=3;const e=$('#flash');if(e)e.style.opacity=1;noise(2.5,80,.4);if(mine)for(const b of foes())skHurt(b,9999,'Nuke');
   setTimeout(()=>{SK.nk=0;if(!run||over)return;
    if(!netOn)endGame('Victory · Nuke');
    else if(isHost){NUKE_BY=by;const win=teamMode()?(mpTeams[by]||myTeam)==myTeam:by==myId;endGame(win?'Victory':'Defeat')}},1800)}},1000)}
/* ---------- power weapons (Rocket Launcher, Sniper) are lost on death and never carried into the next match ---------- */
const PWK=['RL','SN'];
function dropPower(){const had=wp.length;wp=wp.filter(w=>!(w.pw||PWK.includes(w.k)&&!w.heavy));if(!wp.length)wp=[{k:L.p,...eff(L.p,L.pa),mag:0,res:0}];if(wp.length!=had){cur=0;rel=0;try{setGun()}catch(e){}}}
{const _d=die;die=function(){const was=P.dead;_d.apply(this,arguments);if(!was&&mode!='Zombies')dropPower()}}
{const _g=startGame;startGame=function(){wp=wp.filter(w=>!PWK.includes(w.k));_g.apply(this,arguments);if(mode!='Zombies')dropPower()}}
{const _san=sanitize;sanitize=function(){_san.apply(this,arguments);if(PWK.includes(L.p))L.p='AR';if(PWK.includes(L.s))L.s='MG'}}
/* ---------- One in the Chamber: every kill (bullet, melee, or a player you downed) gives one bullet back ---------- */
{const _hb=hitBot;hitBot=function(b,d,head){const was=b.al;_hb.apply(this,arguments);if(OI.on&&was&&!b.al)oiBullet()}}

/* ===================== anticheat.js ===================== */
/* ---------- anti-cheat. Everything lives inside this closure, so it cannot be reached or switched off from the browser console.
   PROGRESS: levels, prestige, weapon kills and camo progress are signed. Anything that changes them outside the game's own functions (console scripts, hack menus, edited storage)
   is caught, flagged, and the profile is reset to a fresh one the next time the game is opened. The dev menu only works from a real mouse click, not from scripts.
   MATCH: god mode (hurt overridden, damage never lowering health, health far above the maximum), double damage (weapon table edited, damage functions replaced, impossible shots) and replaced game functions.
   Browser-side protection stops copy-paste exploits and casual tools; anyone can still edit client code they control, so real security needs a server. ---------- */
(function(){
 const SALT='sd9|'+'q7Zt'+'41xA'+'|spartan',KS='sd-sig',KF='sd-cheat';
 const hs=s=>{let a=0xdeadbeef,b=0x41c6ce57;for(let i=0;i<s.length;i++){const c=s.charCodeAt(i);a=Math.imul(a^c,2654435761);b=Math.imul(b^c,1597334677)}a=Math.imul(a^(a>>>16),2246822507)^Math.imul(b^(b>>>13),3266489909);b=Math.imul(b^(b>>>16),2246822507)^Math.imul(a^(a>>>13),3266489909);return(4294967296*(2097151&b)+(a>>>0)).toString(36)};
 const core=()=>JSON.stringify([prof.lvl,prof.xp,prof.pres,prof.master,prof.ml,prof.all?1:0,prof.zbest||0,Object.keys(prof.wk||{}).sort().map(k=>{const w=prof.wk[k]||{};return[k,w.k|0,w.c|0,w.p|0,w.z|0]}).filter(r=>r[1]||r[2]||r[3]||r[4])]);
 const sig=()=>hs(core()+SALT);
 const store=(k,v)=>{try{if(v==null)localStorage.removeItem(k);else localStorage.setItem(k,v)}catch(e){}};
 const fetch_=k=>{try{return localStorage.getItem(k)}catch(e){return null}};
 let last='',flagged=0,legit=0,devOK=0,slowT=0,overT=0,still=0,hist=[],inShot=0;
 const resync=()=>{last=core();store(KS,sig())};
 /* progress that can never be true for an honest profile */
 const bad=()=>{if(!prof||typeof prof!='object')return'profile';if(prof.all&&!devOK&&fetch_(KS)!==sig())return'unlock-all';if(!(prof.lvl>=1&&prof.lvl<=55)||prof.pres>10||prof.pres<0||prof.ml>1250||prof.ml<1)return'range';
  for(const k in prof.wk||{}){const w=prof.wk[k];if(!w||w.c>w.k+1||w.k<0||w.c<0||w.p>3)return'counters'}
  if(!prof.all){let ok;try{ok=okSet()}catch(e){ok=null}if(ok)for(const k in prof.camo||{}){const v=prof.camo[k];if(v&&typeof v=='string'&&!ok.has(k+':'+v))return'camo'}}return 0};
 const note=m=>{try{const d=document.createElement('div');d.style.cssText='position:fixed;inset:0;z-index:99999;background:#000d;color:#fff;display:flex;align-items:center;justify-content:center;text-align:center;font:600 22px Rajdhani,sans-serif;padding:30px';d.innerHTML='<div><div style="font:700 56px Teko,sans-serif;color:#ff5a3a;letter-spacing:3px">'+m[0]+'</div><p>'+m[1]+'</p><button style="padding:10px 26px;font:700 20px Teko,sans-serif;cursor:pointer" onclick="this.parentNode.parentNode.remove()">OK</button></div>';document.body.appendChild(d)}catch(e){}};
 const wipe=why=>{const fresh={v:1,lvl:1,xp:0,pres:0,master:0,ml:1,wk:{},camo:{}};for(const k of Object.keys(prof))delete prof[k];Object.assign(prof,fresh);try{L.ks=SK_DEF.slice()}catch(e){}store('sd-slots',null);store('sd-slot',null);try{save()}catch(e){}resync();store(KF,null);devOK=0;try{sanitize();showRank()}catch(e){}
  note(['PROGRESS RESET','Cheating or tampering was detected on this profile ('+why+'). Levels, unlocks, weapon progress and camos have been reset.'])};
 /* the strike: remember it, break the signature, end the match. The reset itself happens the next time the game is opened. */
 const strike=why=>{if(flagged)return;flagged=1;store(KF,String(why).slice(0,60));store(KS,'x'+Date.now().toString(36));try{if(run&&!over){run=0;over=1;paused=0;document.exitPointerLock&&document.exitPointerLock();$('#hud').style.display='none';$('#menu').style.display='block'}}catch(e){}
  note(['CHEAT DETECTED','A modified game was detected ('+why+'). The match was ended and this profile will be reset the next time you log in.'])};
 /* on load: flagged last time, stored signature does not match, or an impossible profile */
 {const f=fetch_(KF),sg=fetch_(KS);let why=f?'flagged: '+f:0;if(!why){if(sg==null){why=prof.all?'unlock-all':bad()}else if(sg!==sig())why='profile edited outside the game';else why=bad()}if(why)wipe(why);else resync()}
 /* the game's own progress functions: the signature is refreshed right after they run */
 const guard=name=>{const o=globalThis[name];return function(){legit++;try{return o.apply(this,arguments)}finally{legit--;if(!legit&&!flagged&&!bad())resync()}}};
 giveXP=guard('giveXP');wkill=guard('wkill');wzkill=guard('wzkill');zRoundDone=guard('zRoundDone');wpres=guard('wpres');doPrestige=guard('doPrestige');
 {const dv=$('#dev'),od=dv&&dv.onclick;if(dv&&od)dv.onclick=function(e){if(!e||!e.isTrusted){strike('dev menu used by a script');return}if(e.target&&e.target.dataset&&e.target.dataset.d=='reset')store(KS,null);devOK=1;legit++;try{od.call(this,e)}finally{legit--;if(!flagged)resync()}}}
 /* damage taken while a hit lands: it must lower health, and not be absorbed forever */
 {const _h=hurt;hurt=function(d,b){const was=P.dead,pre=P.hp+P.sh;_h.apply(this,arguments);if(!was&&d>1&&run&&!over&&mode!='Zombies'&&!(typeof OI!='undefined'&&OI.on)&&!P.dead){const post=P.hp+P.sh;if(post>=pre-.0001){if(++still>=5)strike('invulnerable')}else{still=0;hist.push([performance.now(),pre-post])}}}}
 /* a single shot can never deal this much (streaks, the nuke and One in the Chamber are excluded) */
 {const _s=shoot;shoot=function(){inShot++;try{return _s.apply(this,arguments)}finally{inShot--}}}
 {const _hb=hitBot;hitBot=function(b,d,head){if(inShot&&d>480&&mode!='Zombies'&&!SK.nok&&!SK.nk&&!(typeof OI!='undefined'&&OI.on))strike('impossible damage');return _hb.apply(this,arguments)}}
 {const _sg=startGame;startGame=function(){hist=[];still=0;overT=0;return _sg.apply(this,arguments)}}
 /* references to the functions that decide progress and damage, taken now that every script has loaded */
 const names_=['giveXP','wkill','wzkill','zRoundDone','wpres','doPrestige','unlocked','okSet','camos','zcamos','allCamos','wd','hurt','die','hitBot','takeDmg','eff','shoot','respawn','startGame','boom','featKill'],ref=names_.map(n=>globalThis[n]);
 const WSN={};for(const k in W){const w=W[k];WSN[k]=[w.d,w.r,w.m,w.pel,w.sp,w.rc,w.rl,w.ex?w.ex.d:0,w.ex?w.ex.R:0]}
 const wchg=()=>{for(const k in WSN){const w=W[k];if(!w)return k+' removed';const n=[w.d,w.r,w.m,w.pel,w.sp,w.rc,w.rl,w.ex?w.ex.d:0,w.ex?w.ex.R:0],o=WSN[k];for(let i=0;i<n.length;i++)if(n[i]!==o[i])return'weapon table '+k}for(const k in W)if(!WSN[k])return'new weapon '+k;return 0};
 /* cheap checks every frame, the heavy ones about once a second */
 const tick=dt=>{if(flagged)return;
  for(let i=0;i<names_.length;i++)if(globalThis[names_[i]]!==ref[i]){strike('game function replaced: '+names_[i]);return}
  if(run&&!over&&P&&!P.dead){
   if(P.hp>P.mhp+.5||P.sh>P.msh+.5){overT+=dt||.016;if(overT>3)strike('health above maximum')}else overT=0;
   if(P.mhp>400||P.msh>400)strike('health maximum edited');
   const n=performance.now();if(hist.length){hist=hist.filter(x=>n-x[0]<10000);let tot=0;for(const x of hist)tot+=x[1];if(tot>650)strike('took '+Math.round(tot)+' damage without dying')}}
  slowT-=dt||.016;if(slowT>0)return;slowT=.9;
  const b=bad();if(b){strike(b);return}
  if(!legit&&core()!==last){strike('progress edited from outside the game');return}
  const wc=wchg();if(wc){strike(wc);return}
  if(run&&!over&&mode!='Zombies'&&!(typeof OI!='undefined'&&OI.on)&&wp)for(const w of wp){const bs=W[w.k];if(bs&&!w.heavy&&w.d>bs.d*1.34+.01){strike('weapon damage edited: '+w.k);return}}};
 setInterval(()=>tick(.9),900);
 {const _ft=featTick;featTick=function(dt){_ft.apply(this,arguments);tick(dt)}}
 ref[names_.indexOf('hurt')]=hurt;ref[names_.indexOf('hitBot')]=hitBot;ref[names_.indexOf('shoot')]=shoot;ref[names_.indexOf('startGame')]=startGame;
 document.addEventListener('visibilitychange',()=>{if(!document.hidden){slowT=0;tick(.1)}});
})();

/* ===================== topbar.js ===================== */
/* ---------- the match info at the top of the screen (#ob holds the raw text from the game modes; this turns it into a proper scoreboard bar: team panels with progress, a centre badge, status chips) ---------- */
(function(){
 const hud=$('#hud'),ob=$('#ob');if(!hud||!ob)return;const bar=document.createElement('div');bar.id='tbar';hud.appendChild(bar);let last=null;
 const E=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 const chip=t=>{t=t.trim();if(!t)return'';let m;
  if(m=t.match(/^([A-Z])\s+(blue|red|open)$/))return`<span class="tc zn ${m[2]}"><em>${m[1]}</em>${m[2]=='open'?'OPEN':m[2].toUpperCase()}</span>`;
  if(/CONTESTED/i.test(t))return`<span class="tc warn">${E(t)}</span>`;if(/BLUE HOLDING/i.test(t))return`<span class="tc blue">${E(t)}</span>`;if(/RED HOLDING/i.test(t))return`<span class="tc red">${E(t)}</span>`;
  if(/^(Time|Round|Wave)\b/i.test(t))return`<span class="tc big">${E(t)}</span>`;if(/flag/i.test(t))return`<span class="tc ${/^Blue/i.test(t)?'blue':'red'}">${E(t)}</span>`;
  return`<span class="tc">${E(t)}</span>`};
 function render(){const t=ob.textContent.trim();if(t===last)return;last=t;if(!t){bar.innerHTML='';return}
  let m=t.match(/^Blue\s+(\d+)\s*[-–]\s*(\d+)\s+Red(.*)$/)||t.match(/^Blue\s+(\d+)\s*·\s*Red\s+(\d+)(.*)$/);
  if(m){const a=+m[1],b=+m[2];let rest=m[3]||'',tg=0;const tm=rest.match(/(?:first to|\(first to)\s*(\d+)/i);if(tm)tg=+tm[1];rest=rest.replace(/\(?first to\s*\d+\)?/i,'');const chips=rest.split(/\s*·\s*/).map(chip).join('');
   const pa=tg?Math.min(100,a/tg*100):0,pb=tg?Math.min(100,b/tg*100):0;
   bar.innerHTML=`<div class="tr"><div class="tt a"><i>BLUE</i><b>${a}</b><u style="width:${pa}%"></u></div><div class="tm">${tg?`<small>FIRST TO</small><b>${tg}</b>`:'<small>VS</small>'}</div><div class="tt b"><b>${b}</b><i>RED</i><u style="width:${pb}%"></u></div></div>${chips?`<div class="tcs">${chips}</div>`:''}`;return}
  bar.innerHTML=`<div class="tcs solo">${t.split(/\s*·\s*|\s{2,}/).map(chip).join('')}</div>`}
 new MutationObserver(render).observe(ob,{childList:true,characterData:true,subtree:true});setInterval(render,200);
})();

/* ===================== fixes: RayGun ADS, VR menu cube ===================== */
/* RayGun: the power cell and cap sit on the sight line a few centimetres in front of the camera, which showed up as a giant block while aiming. They are hidden while aiming down sights. */
{const _fu=fpUpdate;fpUpdate=function(dt){_fu.apply(this,arguments);try{const m=rgG.userData.mag,w=cw();if(m&&w){const hide=w.k=='RG'&&ST.ads>.2;for(const x of m)x.visible=!hide}}catch(e){}}}
/* VR: outside a match nothing weapon-shaped may be drawn on the controllers or the camera (the white block on the right arm in the main menu) */
{const _vp=vrPost;vrPost=function(dt){_vp.apply(this,arguments);if(!xrS||inMatch())return;try{gun.visible=false;katG.visible=false;for(const a of[fpArm.r,fpArm.l])a.up.visible=a.fo.visible=false;for(const c of xrCtl)for(const ch of c.children)if(ch!==gun&&!(xrWrist&&ch===xrWrist.m))ch.visible=false}catch(e){}}}

/* ---------- held-weapon stability: arm IK is skipped for invalid targets and nudged when the hand sits exactly on the shoulder (zero-length direction), which made arms snap or vanish ---------- */
{const _ik=ik;ik=function(S0,H0,hint,arm){if(!S0||!H0||!arm||!arm.up||!(isFinite(S0.x+S0.y+S0.z+H0.x+H0.y+H0.z)))return;if(H0.distanceToSquared(S0)<1e-5)H0=H0.clone().add(V(0,-.02,-.05));return _ik.call(this,S0,H0,hint||V(0,-1,0),arm)}}
