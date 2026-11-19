/* ---------- The 1 Room Challenge ---------- */
const LOCKBOX_CEILING=3.7;
const LOCKBOX_WINDOW={z:-3.7,approach:-4.30,inside:-2.5,boards:6,repairTime:.8,vaultTime:1.15};

MAPS[ROOM_CHALLENGE]={
 d:'Zombies map: One room, one boardable window, exclusive Bolt Brew and a fixed Mystery Box.',
 zm:1,lockbox:true,noHounds:true,playerRoom:3.5,ceilingY:LOCKBOX_CEILING,skySeed:10760,boardRay:lockboxBoardRay,H:8,open:1,sky:0x253441,gr:0x777c80,bc:0x62727a,gt:'concrete',
 hemi:1.1,hemiC:0xe2eeff,hemiG:0x797b80,sunI:.35,ps:[0,.6],dr:[],zs:[[0,-6,0]],
 lights:[[0,3.25,1.25,0xffdfaf,1.5,9],[0,2.62,-2.4,0xffe9cf,1.1,5],
         [0,2.9,-5.5,0xa9bdd8,1.25,7]],
 mc:[
  {t:'vit',x:-2.88,z:-1.52,f:'e'},{t:'spd',x:-2.88,z:.19,f:'e'},{t:'dbl',x:-2.88,z:1.85,f:'e'},
  {t:'rev',x:2.88,z:-1.85,f:'w'},{t:'ammo',x:2.88,z:0,f:'w'},
  {t:'pap',x:-2.3,z:-2.99,f:'s'},{t:'bolt',x:-1.13,z:2.88,f:'n'},{t:'box',x:1.13,z:2.88,f:'n',rect:true,lockbox:true},
  {t:'wall',k:'HC',x:-3.47,z:-2.05,f:'e',y:3.09,scale:.67,focus:true},
  {t:'wall',k:'BP',x:-3.47,z:1.64,f:'e',y:3.09,scale:.67,focus:true},
  {t:'wall',k:'OH',x:3.47,z:-2.05,f:'w',y:3.09,scale:.67,focus:true},
  {t:'wall',k:'KTS',x:3.47,z:1.64,f:'w',y:3.09,scale:.67,focus:true},
  {t:'wall',k:'MP',x:0,z:3.47,f:'n',y:3.15,scale:.65,focus:true}
 ],
 b(){
  return [
   [-3.7,0,.4,7.8,3.7,0,0x59646b,'concrete'],[3.7,0,.4,7.8,3.7,0,0x59646b,'concrete'],
   [0,3.7,7,.4,3.7,0,0x59646b,'concrete'],
   [-2.32,-3.7,2.36,.4,3.7,0,0x59646b,'concrete'],[2.32,-3.7,2.36,.4,3.7,0,0x59646b,'concrete'],
   [0,-3.7,2.28,.4,.75,0,0x59646b,'concrete'],[0,-3.7,2.28,.4,3.7,2.75,0x59646b,'concrete'],
   [0,0,7.8,7.8,3.95,LOCKBOX_CEILING,0x47545d,'concrete']
  ];
 },
 post(g){
  EST.dyn=[];EST.spots=[];EST.pool=[];EST.fog=[];EST.pts={H:{p:[],c:[],f:[],base:[]}};
  EST.mapG=g;EST.tm=0;EST.amb=1;EST.lt={next:60,flash:0,rep:0};
  const trim=eM(0x28333b,0,.48,.65),light=eBasic(0xffe6ba,1);
  eMk(g,EG.box,trim,0,3.59,1.25,2.4,.22,.36);
  eMk(g,EG.box,light,0,3.47,1.25,2.14,.045,.22);
  const z=LOCKBOX_WINDOW.z;
  for(const x of[-1.14,1.14])eMk(g,EG.box,trim,x,1.75,z,.13,2.12,.49);
  for(const y of[.75,2.75])eMk(g,EG.box,trim,0,y,z,2.4,.12,.52);
  eMk(g,EG.pl,eSign(ROOM_CHALLENGE,0xffc677,576,96),0,3.22,z+.22,2.88,.48,1);
 },
 objs(){
  const z=LOCKBOX_WINDOW.z;
  const wood=lockboxWood(0xc2956d),edge=eM(0x634731,0,.8,0),bolt=eM(0x293237,0,.5,.55),strap=eM(0x78908f,0,.46,.65);
  const meshes=Array.from({length:LOCKBOX_WINDOW.boards},(_,i)=>{
   const board=new THREE.Group();
   const slot=[5,0,4,1,3,2][i];
   const y=[.89,1.16,1.43,1.94,2.24,2.59][slot];
   const tilt=[-.06,.08,-.05,.095,-.074,.047][slot];
   const width=[2.34,2.4,2.38,2.46,2.32,2.45][slot],height=[.14,.19,.16,.18,.16,.15][slot];
   const depth=.1,x=[-.022,.056,-.038,.018,.032,-.044][slot],mountedZ=z+.19+(slot%2)*.046;
   board.userData={x,y,z:mountedZ,tilt,cos:Math.cos(tilt),sin:Math.sin(tilt),width,height,depth};
   eMk(board,EG.box,wood,0,0,0,width,height,depth);
   eMk(board,EG.box,edge,0,-height/2+.014,.053,width-.04,.022,.016);
   for(const n of[-1.04,1.04])eMk(board,EG.box,bolt,n,0,.062,.042,.042,.022);
   const braces=new THREE.Group();
   for(const x of [-.8,.8])eMk(braces,EG.box,strap,x,0,.06,.13,height+.025,.05);
   braces.visible=false;
   board.userData.braces=braces;
   board.add(braces);
   board.position.set(x,y,mountedZ);
   board.rotation.z=tilt;
   zG.add(board);
   return board;
  });
  const w=zq.barricade={count:meshes.length,reinforced:0,meshes,nextTear:0,nextRepair:0,nextRequest:0,shockArmed:false};
  zi.push({x:0,z,r:1.95,hold:true,
   txt:()=>w.count<w.meshes.length?'Hold to rebuild window · '+w.count+'/6':'Window boarded · 6/6',
   cost:()=>0,act:()=>{}
  });
  EST.dyn.push({tick:lockboxBoardTick});
 },
 spawn(big){
  mkZombie((Math.random()-.5)*3,-6-Math.random(),big);
 },
 entry:lockboxEntry
};

function lockboxBoards(count,reinforced=zq.barricade?.reinforced){
 const w=zq.barricade;
 if(!w)return;
 reinforced&=(1<<count)-1;
 if(w.count===count&&w.reinforced===reinforced)return;
 const old=w.count;
 w.count=count;
 w.reinforced=reinforced;
 for(let i=0;i<count;i++)w.meshes[i].userData.braces.visible=!!(reinforced&(1<<i));
 for(let i=Math.min(old,count);i<Math.max(old,count);i++){
  const board=w.meshes[i];
  board.userData.motion=i<count?'rise':'fall';
  board.userData.age=0;
  board.visible=true;
  if(i<count){
   board.position.set((i%2?1:-1)*.45,.2,LOCKBOX_WINDOW.z+1);
   board.rotation.set(.8,0,(i%2?1:-1)*.4);
  }
 }
 noise(count>old?.12:.22,count>old?650:330,.2);
}

function lockboxBoardTick(dt){
 const w=zq.barricade;
 for(const board of w.meshes){
  const d=board.userData;
  if(!d.motion)continue;
  d.age+=dt;
  const u=Math.min(1,d.age/(d.motion==='rise'?.36:.55)),s=zsm_(u);
  if(d.motion==='rise'){
   const side=w.meshes.indexOf(board)%2?1:-1;
   board.position.set(side*.45*(1-s)+d.x*s,.2+(d.y-.2)*s+Math.sin(u*Math.PI)*.35,LOCKBOX_WINDOW.z+1+(d.z-LOCKBOX_WINDOW.z-1)*s);
   board.rotation.set(.8*(1-s),0,side*.4*(1-s)+d.tilt*s);
  }else{
   board.position.set(d.x+.65*u,d.y+.5*u-2.1*u*u,d.z-1.3*u);
   board.rotation.set(u*2.3,u*.45,d.tilt+u*1.7);
  }
  if(u===1){board.visible=d.motion==='rise';d.motion=null}
 }
}

function lockboxRepair(player,quick,reinforced){
 const w=zq.barricade;
 if(!w||!player||(w.climber?.al&&w.climber.crossing)||t0<w.nextRepair||w.count===w.meshes.length||
    Math.hypot(player.x,player.z-LOCKBOX_WINDOW.z)>=1.95)return false;
 w.nextRepair=t0+lockboxRepairTime(quick);
 lockboxBoards(w.count+1,w.reinforced|(reinforced?1<<w.count:0));
 if(w.count===w.meshes.length&&(w.reinforced&1))w.shockArmed=true;
 return true;
}
function lockboxRepairTime(quick){return LOCKBOX_WINDOW.repairTime*(quick?.5:1)}

function lockboxHold(){
 const w=zq.barricade;
 if(!w||!zq.cur?.hold||P.dead||!key.KeyF||w.count===w.meshes.length)return;
 const quick=!!zq.perks.spd,reinforced=!!zq.perks.bolt;
 if(zCli()){
  if(t0<w.nextRequest)return;
  w.nextRequest=t0+lockboxRepairTime(quick);
  netSend({t:'zqw',quick,reinforced});
 }else lockboxRepair(P,quick,reinforced);
}

function lockboxTearPose(b){
 if(!b.tear)return null;
 const u=Math.min(1,b.tear),reach=zsm_(u/.45),pull=zsm_((u-.45)/.4);
 const y=b.tearY??.25;
 return {lean:.28*reach-.5*pull,tw:.18*pull,bob:-.12*reach,hx:-.34*reach,hy:0,
  R:[.1,y,.3+.38*reach-.52*pull],L:[-.1,y+.07,.32+.34*reach-.49*pull],
  hR:[.6,-1,-.3],hL:[-.6,-1,-.3],jaw:.25+.5*pull};
}

function lockboxShock(){
 zq.barricade.shockArmed=false;
 for(const zombie of bots){
  if(zombie.zom&&zombie.al&&!zombie.entered&&!zombie.crossing&&
     Math.hypot(zombie.x,zombie.z-LOCKBOX_WINDOW.z)<4){
   zombie.stun=Math.max(zombie.stun||0,2);
  }
 }
 lockboxShockFx();
 if(netOn)netSend({t:'zbt'});
}
function lockboxShockFx(){
 const at=V(0,1.4,LOCKBOX_WINDOW.z);
 burst(at,24,0x77e9ff,6,.46,.064);
 JX.h.addSp({p:at,s0:.6,s1:2.8,life:.28,c:[.4,1.5,2.2],op:.85});
 beep(125,.28,'sawtooth',.09);
 msg('Bolt Brew · Window discharge',1.5);
}

function lockboxEntry(b,dt){
 const w=zq.barricade,entry=LOCKBOX_WINDOW;
 if(b.entered)return false;
 if(b.crossing){
  lockboxVaultStep(b,Math.min(1,b.crossing+dt/entry.vaultTime));
  if(b.crossing===1){
   b.entered=true;b.crossing=0;b.vaultPose=null;b.y=0;
   w.nextTear=t0+.24;
   burst(V(0,.12,entry.inside),6,0x918372,2,.26,.055);
  }
  return true;
 }
 if(b.tear){
  const reinforced=!b.tore&&w.count>0&&(w.reinforced&(1<<(w.count-1)));
  b.tear+=dt/(reinforced?1.08:.72);
  if(b.tear>=.76&&!b.tore){
   b.tore=true;
   if(w.count)lockboxBoards(w.count-1);
   if(reinforced&&!w.count&&w.shockArmed)lockboxShock();
   burst(V(0,1.45,entry.z),10,0xb7986b,3,.5,.065);
  }
  if(b.tear>=1)b.tear=0;
  return true;
 }
 let rank=0;
 for(const other of bots){
  if(other.zom&&other.al&&other.i<b.i&&!other.crossing&&!other.entered)rank++;
 }
 const row=Math.floor((rank-1)/7),lane=(rank-1)%7;
 const x=rank?Math.ceil(lane/2)*(lane%2?-1:1)*.9:0;
 const target=rank?-5.18-row*.74:entry.approach;
 const dx=x-b.x,dz=target-b.z,d=Math.hypot(dx,dz);
 const step=Math.min(d,b.sp*dt*(b.stun>0?.15:1));
 b.stun=Math.max(0,(b.stun||0)-dt);
 if(d>0){
  b.x+=dx*step/d;
  b.z=step===d?target:b.z+dz*step/d;
  b.tyaw=Math.atan2(dx,dz);
 }
 b.m.position.set(b.x,0,b.z);
 if(!rank&&!(w.climber?.al&&w.climber.crossing)&&d<.08&&t0>=w.nextTear&&!(b.stun>0)){
  if(w.count){
   w.nextTear=t0+.95;
   b.tear=.01;b.tore=false;
   b.tearY=cl((w.meshes[w.count-1].userData.y/(b.big?1.35:1))-1.45,-.52,.42);
   b.tyaw=0;
  }else{
   w.climber=b;
   lockboxVaultStep(b,.001);
  }
 }
 return true;
}

zMapScreen();

function perkCabinet(m,t,p,g){
 const iron=eM(0x252c29,0,.58,.46),brass=eM(0xb5a584,0,.42,.55),cream=eM(0xcfc2a1,0,.54,.12);
 const enamel=eM(new THREE.Color(p.c).multiplyScalar(.72).getHex(),0,.46,.24);
 const glass=eBasic(p.c,.48),light=eBasic(p.c,1);
 const box=(mat,x,y,z,w,h,d,r=.035)=>eMk(g,hvR(w,h,d,r),mat,x,y,z,w,h,d);
 const cyl=(mat,x,y,z,r,h,rx=0)=>eMk(g,EG.cyl,mat,x,y,z,r,h,r,rx);
 const front=(mat,x,y,z,w,h)=>eMk(g,EG.pl,mat,x,y,z,w,h,1);
 const sign=eSign(p.n,p.c);
 const rack=new THREE.Group();rack.userData.dyn=true;g.add(rack);
 let badge,dock;
 switch(t){
  case 'vit': { // A wall of enamel first-aid drawers.
   box(enamel,0,1.24,-.04,1.37,2.36,.9,.13);
   box(cream,0,1.49,.419,1.15,1.17,.08,.09);
   box(enamel,0,1.62,.476,.52,.13,.03);box(enamel,0,1.62,.477,.13,.52,.031);
   for(const y of [.32,.63]){
    box(cream,0,y,.421,.92,.235,.06);
    box(brass,0,y,.47,.39,.049,.07);
   }
   badge=[0,2.23,.424,1.13,.30];dock=[0,.91,.48];
   break;
  }
  case 'spd': { // A narrow chrome tower with a finned accelerator.
   box(iron,0,.13,0,1.27,.22,1.0);
   box(enamel,0,1.32,-.12,.82,2.48,.69,.09);
   for(const x of [-.46,.46]){
    cyl(brass,x,1.26,.03,.07,2.04);
    box(iron,x,1.69,.19,.24,.76,.38,.055);
    for(let i=0;i<6;i++)box(brass,x,1.39+i*.116,.4,.25,.028,.055);
   }
   for(let i=0;i<4;i++)box(light,0,1.08+i*.22,.249,.46-i*.075,.064,.019);
   badge=[0,2.37,.27,1.02,.30];dock=[0,.65,.28];
   break;
  }
  case 'dbl': { // Two soda drums on a low service stand.
   box(iron,0,.48,-.04,1.44,.87,.91,.07);
   for(const x of [-.36,.36]){
    cyl(enamel,x,1.42,-.05,.33,1.03);
    for(const y of [.96,1.62,1.92])cyl(brass,x,y,-.05,.341,.065);
    cyl(iron,x,2,-.05,.1,.14);cyl(light,x,2.10,-.05,.046,.08);
   }
   box(iron,0,1.17,.34,1.31,.35,.19);
   badge=[0,1.18,.442,1.18,.27];dock=[0,.64,.48];
   break;
  }
  case 'rev': { // An upright with a round viewing port.
   box(enamel,0,1.23,-.03,1.29,2.36,.88,.085);
   cyl(iron,0,1.54,.44,.51,.13,Math.PI/2);
   cyl(brass,0,1.54,.52,.451,.052,Math.PI/2);
   cyl(iron,0,1.54,.56,.407,.05,Math.PI/2);
   cyl(glass,0,1.54,.60,.387,.015,Math.PI/2);
   for(const [x,y,w,a] of [[-.21,1.53,.18,0],[-.069,1.575,.14,.88],[.024,1.57,.19,-1.0],[.152,1.52,.18,.3]])
    eMk(rack,EG.box,cream,x,y,.619,w,.03,.013,0,0,a);
   badge=[0,2.21,.42,1.1,.28];dock=[0,.74,.47];
   break;
  }
  case 'stam': { // Fuel-pump silhouette, meter and hose.
   box(enamel,0,1.17,-.11,.86,2.18,.74,.11);
   box(iron,0,.16,0,1.29,.23,1.02);
   cyl(brass,0,2.34,-.12,.33,.17,Math.PI/2);
   cyl(cream,0,2.34,-.018,.258,.024,Math.PI/2);
   eMk(rack,EG.box,iron,.012,2.39,.015,.026,.16,.018,0,0,-.57);
   eMk(g,EG.tor,iron,.54,1.02,.123,.18,.66,.14);
   eMk(g,EG.box,brass,.58,1.56,.25,.11,.30,.108,0,0,-.33);
   for(const y of [.83,.97,1.11])box(brass,0,y,.27,.54,.031,.028);
   badge=[0,1.87,.272,.86,.28];dock=[0,.54,.28];
   break;
  }
  case 'mule': { // A squat tool chest with a cubby and drawer pulls.
   for(const x of [-.61,.61])box(iron,x,.45,0,.12,.87,.98);
   box(enamel,0,.87,-.035,1.45,1.35,.84,.04);
   box(iron,0,1.57,.002,1.52,.13,1.04);
   for(const y of [.43,.72]){
    box(brass,-.21,y,.416,.8,.21,.078);
    box(iron,-.21,y,.47,.28,.043,.055);
   }
   for(const [x,y,w] of [[-.42,1.76,.44],[.25,1.74,.55],[.18,2.02,.44]]){
    box(iron,x,y,0,w,.26,.59);
    box(enamel,x,y+.071,.324,w*.93,.053,.052);
   }
   badge=[0,1.21,.423,1.20,.28];dock=[.43,.74,.46];
   break;
  }
  case 'bolt': { // Riveted housing around an exposed hydraulic press.
   box(iron,0,.26,-.03,1.18,.47,1.04,.12);
   box(enamel,0,1.32,-.29,1.18,1.69,.45,.08);
   box(enamel,0,2.21,0,1.28,.39,.91,.08);
   for(const x of [-.51,.51]){
    box(iron,x,1.31,.10,.20,1.55,.68);
    for(const y of [.66,1.91])eMk(g,EG.cyl8,brass,x,y,.46,.059,.045,.059,Math.PI/2);
   }
   cyl(brass,0,1.63,.17,.23,.70);
   cyl(cream,0,1.19,.17,.097,.47);
   box(iron,0,.94,.17,.65,.09,.48);
   box(light,0,.79,.43,.33,.045,.024);
   badge=[0,2.23,.466,1.12,.27];dock=[0,.56,.5];
   break;
  }
  case 'crypt': { // Cemetery stonework around a stained-glass reliquary.
   box(iron,0,.22,-.04,1.45,.43,1.05,.065);
   box(enamel,0,1.23,-.05,1.23,1.71,.84,.065);
   for(const x of [-.57,.57]){
    box(cream,x,1.19,.365,.12,1.63,.17);
    box(brass,x,1.86,.399,.16,.07,.14);
   }
   box(cream,0,2.19,-.05,1.08,.32,.8,.055);
   eMk(g,EG.cyl8,brass,0,1.47,.413,.39,.05,.39,Math.PI/2);
   eMk(g,EG.cyl8,glass,0,1.47,.451,.34,.024,.34,Math.PI/2);
   for(const x of [-.15,0,.15])box(iron,x,1.47,.474,.027,x===0?.64:.51,.024);
   box(brass,0,1.47,.478,.64,.026,.022);
   badge=[0,2.21,.371,1.09,.25];dock=[0,.62,.41];
   break;
  }
  case 'line': { // Substation switchgear with paired insulators and an analog meter.
   box(iron,0,.22,0,1.31,.42,1.03,.055);
   box(enamel,0,1.22,-.03,1.24,1.64,.91,.07);
   box(iron,0,1.32,.455,1.05,1.13,.13,.065);
   for(const x of [-.37,.37]){
    cyl(cream,x,2.12,-.10,.085,.30);
    for(const y of [2.15,2.25,2.35])cyl(brass,x,y,-.10,.135,.045);
    box(light,x,1.4,.53,.075,.21,.023);
   }
   eMk(g,EG.cyl,cream,0,1.46,.53,.25,.054,.25,Math.PI/2);
   eMk(g,EG.box,iron,.015,1.51,.566,.033,.19,.022,0,0,-.66);
   for(const y of [.93,1.01,1.09])box(brass,0,y,.531,.78,.024,.03);
   badge=[0,1.96,.432,1.07,.25];dock=[0,.60,.465];
   break;
  }
 }
 front(sign,...badge);
 const [x,y,z]=dock;
 box(iron,x,y,z,.36,.23,.06);
 const flap=eMk(g,EG.box,brass,x,y+.084,z+.047,.29,.046,.072);
 flap.userData.dyn=true;
 front(eSign(String(p.cost),p.c,128,56),x,y-.17,z+.037,.39,.14);
 const [width,depth]=eSwap(m.f,1.65,1.15),bxo=zSolid(m.x,m.z,width,depth,2.59);
 eFlatten(g,.52,.26);zG.add(g);
 return {g,t,ph:erand()*6,sign,rack,flap,bxo,c:p.c,x0:m.x,dispenser:[x,y,z+.10]};
}

/* Stained timber, corner irons and a stencilled mark on the rectangular lid. */
const LOCKBOX_WOOD={};
function lockboxWood(color){
 if(!LOCKBOX_WOOD.grain){
  const grain=zTex(256,128,(g,w,h)=>{
   g.fillStyle='#d0b89e';g.fillRect(0,0,w,h);
   for(let i=0;i<104;i++){
    const y=i*h/104,f=.8+(i%7)*.29;
    g.strokeStyle=i%4?'rgba(47,26,15,.17)':'rgba(255,237,204,.34)';
    g.beginPath();g.moveTo(0,y);g.bezierCurveTo(65,y+Math.sin(i*7)*f,175,y+Math.cos(i*11)*f,w,y);
    g.stroke();
   }
   for(const [x,y] of [[89,35],[205,92]]){
    g.strokeStyle='rgba(48,32,20,.2)';
    for(let k=1;k<6;k++){g.beginPath();g.ellipse(x,y,k*3.5,k*1.33,-.03,0,2*Math.PI);g.stroke()}
   }
  });
  grain.encoding=THREE.sRGBEncoding;LOCKBOX_WOOD.grain=grain;
 }
 return LOCKBOX_WOOD[color]||(LOCKBOX_WOOD[color]=new THREE.MeshLambertMaterial({color,map:LOCKBOX_WOOD.grain}));
}

function lockboxChest(g,lid){
 const timber=lockboxWood(0x8e654a),rim=eM(0x303934,0,.58,.66),brass=eM(0xb28b52,0,.44,.75);
 eMk(g,EG.box,rim,0,.13,0,1.94,.18,1.02);
 for(const s of [-1,1]){
  for(const y of [.28,.445,.61,.775])eMk(g,EG.box,timber,0,y,s*.455,1.85,.16,.09);
  eMk(g,EG.box,timber,s*.89,.529,0,.088,.64,.94);
  const handle=eMk(g,EG.tor,brass,s*.962,.542,0,.125,.086,.125,0,Math.PI/2);
  handle.castShadow=false;
  for(const x of [-.77,.77]){
   eMk(g,EG.box,rim,x,.535,s*.507,.12,.613,.047);
   for(const y of [.31,.74])eMk(g,EG.sph,brass,x,y,s*.541,.025,.025,.017);
  }
  eMk(g,EG.box,rim,0,.846,s*.47,1.92,.069,.098);
 }
 eMk(g,EG.box,rim,0,.71,.511,.32,.22,.085);
 eMk(g,EG.box,brass,0,.718,.565,.142,.168,.048);
 eMk(g,EG.box,rim,0,.713,.594,.039,.058,.012);
 for(const x of [-.77,.77]){
  eMk(lid,EG.box,rim,x,.128,.51,.14,.083,1.03);
  eMk(lid,EG.cyl,brass,x,.027,.005,.045,.218,.045,0,0,Math.PI/2);
 }
 eMk(lid,hvR(1.94,.146,1.022,.035),timber,0,.073,.51,1.94,.146,1.022);
 const marks=eCanvasMat(256,112,(c,w,h)=>{
  c.textAlign='center';c.textBaseline='middle';c.font='bold 85px Georgia';
  c.shadowColor='#e9a844';c.shadowBlur=17;c.fillStyle='#f9d78a';
  for(const x of [72,184])c.fillText('?',x,h*.48);
 },true);
 eMk(lid,EG.pl,marks,0,.15,.51,1.16,.67,1,-Math.PI/2).castShadow=false;
}

/* Boards block only the space their timber occupies. Use the same swept
   collision for pellets and thrown equipment, with clearance for the grenade. */
function lockboxBoardRay(o,d,limit,r=0){
 const w=zq?.barricade;
 if(!w||Math.abs(d.z)<1e-8)return limit;
 for(let i=0;i<w.count;i++){
  const board=w.meshes[i].userData;
  if(board.motion)continue;
  const x=o.x-board.x,y=o.y-board.y,{cos,sin}=board;
  const origin={x:x*cos+y*sin,y:y*cos-x*sin,z:o.z-board.z};
  const dir={x:d.x*cos+d.y*sin,y:d.y*cos-d.x*sin,z:d.z};
  const halfW=board.width/2+r,halfH=board.height/2+r,halfD=board.depth/2+r;
  limit=Math.min(limit,rb(origin,dir,{x0:-halfW,x1:halfW,y0:-halfH,h:halfH,z0:-halfD,z1:halfD}));
 }
 return limit;
}

function lockboxEquipmentHit(from,to){
 const d=to.clone().sub(from),r=.055;
 if(lockboxBoardRay(from,d,2,r)<=1)return true;
 return bx.some(b=>rb(from,d,{x0:b.x0-r,x1:b.x1+r,y0:b.y0-r,h:b.h+r,z0:b.z0-r,z1:b.z1+r})<=1);
}

/* Time, root depth and lift, torso lean, then right and left ankle targets.
   The trailing foot stays raised until it clears the inside edge of the frame. */
const LOCKBOX_VAULT=[
 [0,-4.30,0,.30,-4.23,.03,-4.41,.03],
 [.16,-4.49,-.09,.49,-4.45,.16,-4.65,.04],
 [.28,-4.43,.39,.86,-4.18,.97,-4.47,.56],
 [.34,-4.23,.36,.95,-3.81,1.00,-4.40,.61],
 [.53,-3.79,.49,1.16,-3.39,1.08,-4.11,1.05],
 [.70,-3.29,.39,.98,-3.02,.52,-3.69,1.03],
 [.85,-2.91,.11,.59,-2.67,.08,-3.10,.85],
 [1,-2.50,0,.30,-2.44,.04,-2.70,.04]
];

function lockboxVaultStep(b,u){
 const next=LOCKBOX_VAULT.findIndex(frame=>frame[0]>=u),end=LOCKBOX_VAULT[Math.max(1,next)],start=LOCKBOX_VAULT[Math.max(0,next-1)];
 const f=zsm_((u-start[0])/(end[0]-start[0]));
 const [,z,lift,lean,rz,ry,lz,ly]=start.map((v,i)=>v+(end[i]-v)*f);
 b.crossing=u;b.x=0;b.z=z;b.y=lift;b.tyaw=0;
 b.vaultPose={lean,rz,ry,lz,ly};
 b.m.position.set(b.x,b.y,b.z);
 b.m.rotation.y=b.ry=0;
}

function lockboxVaultPose(b){
 const u=b.crossing,{lean}=b.vaultPose,sc=b.big?1.35:1;
 const brace=zsm_(u/.19)*(1-zsm_((u-.49)/.25));
 const push=zsm_((u-.55)/.31)*(1-zsm_((u-.86)/.14));
 const y=(.96-b.y)/sc-1-.5*Math.cos(lean),z=(-3.66-b.z)/sc-.5*Math.sin(lean);
 return {vault:true,lean,tw:.12*push,bob:0,hx:-.23*brace,hy:0,
  R:[.08*brace,-.12*(1-brace)+y*brace,.55*(1-brace)+z*brace],
  L:[-.08*brace,-.12*(1-brace)+y*brace,.56*(1-brace)+z*brace],
  hR:[.6,-1,-.3],hL:[-.6,-1,-.3],jaw:.25+.35*push};
}

function lockboxVaultLegs(b,r){
 const {rz,ry,lz,ly}=b.vaultPose,sc=b.big?1.35:1;
 for(const [thigh,shin,z,y] of [[r.legR,r.shinR,rz,ry],[r.legL,r.shinL,lz,ly]]){
  const dy=.98-(y-b.y)/sc,dz=(z-b.z)/sc;
  const bend=Math.acos(Math.min(1,Math.hypot(dy,dz)/.92));
  thigh.position.y=.98;
  thigh.rotation.x=-Math.atan2(dz,dy)-bend;
  shin.rotation.x=2*bend;
 }
}

function lockboxVaultHitPts(b){
 const {lean}=b.vaultPose,s=b.big?1.35:1;
 return [V(b.x,b.y+(1+.80*Math.cos(lean))*s,b.z+.80*Math.sin(lean)*s),
         V(b.x,b.y+(1+.24*Math.cos(lean))*s,b.z+.24*Math.sin(lean)*s),.22*s,.42*s];
}

/* A compact, two-roller workshop press with its own enamel marquee. */
function lockboxPapMachine(m){
 const g=new THREE.Group();g.position.set(m.x,0,m.z);g.rotation.y=eFace(m.f);
 const teal=eM(0x4a8882,0,.61,.44),steel=eM(0x9aada8,0,.35,.68);
 const dark=eM(0x202623,0,.66,.30),copper=eM(0xaa7247,0,.53,.53),ivory=eM(0xd9c9a2,0,.58,.10);
 const metal=(mat,x,y,z,w,h,d,r=.035)=>eMk(g,hvR(w,h,d,r),mat,x,y,z,w,h,d);
 metal(dark,0,.28,-.03,1.92,.38,.92,.11);
 for(const x of [-.83,.83]){
  eMk(g,EG.box,steel,x,.17,.05,.14,.35,.64,-.18,0,x*.24);
  metal(teal,x,1.06,-.02,.39,1.51,.87,.12);
  metal(steel,x,1.10,.448,.33,1.45,.07,.035);
 }
 metal(dark,0,1.13,-.33,1.39,1.28,.23);
 metal(teal,0,.63,.09,1.62,.41,.81,.09);
 metal(steel,0,.848,.152,1.53,.07,.76);
 metal(teal,0,1.71,-.02,1.58,.35,.88,.12);
 metal(steel,0,1.54,.43,1.60,.077,.104);
 for(let i=0;i<9;i++){
  eMk(g,EG.box,dark,-.56+i*.14,.624,.506,.085,.037,.025,0,0,-.31);
 }
 const rolls=[];
 for(const y of [1.026,1.38]){
  const spindle=new THREE.Group();spindle.position.set(0,y,.12);spindle.userData.dyn=true;g.add(spindle);
  eMk(spindle,EG.cyl,steel,0,0,0,.145,1.36,.145,0,0,Math.PI/2);
  for(let i=0;i<10;i++){
   const a=i*Math.PI/5;
   eMk(spindle,EG.box,copper,0,Math.sin(a)*.145,Math.cos(a)*.145,1.16,.046,.025,-a);
  }
  rolls.push(spindle);
 }
 for(const x of [-.55,.58])metal(steel,x,2.05,-.17,.13,.54,.21,.027);
 metal(dark,0,2.44,-.12,2.07,.54,.48,.105);
 metal(teal,0,2.46,.11,2.0,.47,.107,.092);
 const sign=eCanvasMat(512,124,(c,w,h)=>{
  c.fillStyle='#decda5';c.fillRect(0,0,w,h);
  c.fillStyle='#ad5940';c.fillRect(0,15,22,h-30);
  c.fillStyle='#37645b';c.fillRect(w-39,15,39,h-30);
  c.strokeStyle='#6d6f48';c.lineWidth=3;c.strokeRect(8,8,w-16,h-16);
  c.font='bold 51px Georgia';c.fillStyle='#243a35';c.textAlign='center';c.textBaseline='middle';
  c.fillText('PACK-A-PUNCH',w*.48,h*.52);
 },true);
 eMk(g,EG.pl,sign,0,2.46,.167,1.86,.385,1).castShadow=false;
 metal(ivory,.77,1.88,.411,.28,.19,.078,.045);
 const dial=eMk(g,EG.cyl,dark,.77,1.88,.458,.066,.027,.066,Math.PI/2);dial.castShadow=false;
 const channel=eBasic(0xffce79,.24,1);
 eMk(g,EG.pl,channel,0,1.184,.441,1.22,.28,1).castShadow=false;
 const hov=new THREE.Group();hov.position.set(0,1.18,.69);hov.userData.dyn=true;g.add(hov);
 eFlatten(g,.58,.48);
 const [w,d]=eSwap(m.f,2.08,1.03);
 zSolid(m.x,m.z,w,d,2.68);zG.add(g);
 EST.objs.pap={g,m,rolls,hov,sign,channel,t:0,act:0};
 zq.mp.push({k:'pap',x:m.x,z:m.z,f:m.f,n:'Pack-a-Punch'});
 const pos=[m.x,m.z+.71];
 zi.push({x:pos[0],z:pos[1],r:1.42,txt:()=>zPapTxt(),cost:()=>zPapCost(),act:()=>zPapAct(pos)});
}

function lockboxPapTick(o,dt,t){
 o.t+=dt;
 const speed=o.act?9:.4;
 o.rolls.forEach((roller,i)=>roller.rotation.x+=dt*speed*(i?1:-1));
 o.channel.opacity=o.act?.38+.18*Math.sin(t*17):.09;
 o.sign.color.setGray(.88+.10*Math.sin(t*5));
 if(o.item){
  o.hov.position.y=1.20+Math.sin(t*4)*.06;
  o.hov.rotation.y+=dt*2;
 }
 if(o.fin&&o.t>.8)o.fin=0;
}

if(sel.mode==='Zombies'&&sel.zmap===ROOM_CHALLENGE){sel.map=ROOM_CHALLENGE;buildMap();ui()}
