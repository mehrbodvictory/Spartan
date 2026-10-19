/* ===================== zombies.js ===================== */
/* ---------- Zombies: rounds of undead that arrive in waves, points for every shot and kill, locked doors, mystery boxes,
   Pack-a-Punch and soda perk machines. Solo or up to 4 player co-op through a private lobby.
   Co-op: the host simulates every zombie, round and door; guests see the zombies as puppets, report their hits to the host and get
   their kill points back. Points, perks and weapons belong to each player. Teammates revive you by holding E; downed players come back
   at the next round; the run ends when everybody is down. ---------- */
let zq=null,zG=null,zi=[],zdoors=[],zboxes=[],zgr=null,zfls={},zdead=[],zhc='',zbT=0,zsT=0;
const PERKS={vit:{n:'Vitality Cola',c:0xd8332a,cost:2500,t:'+50 max health'},spd:{n:'Quick Fizz',c:0x39c85a,cost:3000,t:'Reload twice as fast'},dbl:{n:'Double Pop',c:0xf0c21e,cost:2000,t:'Double damage, faster fire'},rev:{n:'Revive Soda',c:0x2f7de0,cost:500,t:'Revive yourself once'},stam:{n:'Stamin Fizz',c:0xa04ad8,cost:2000,t:'Run 20% faster and shoot while sprinting'},mule:{n:'Mule Soda',c:0xf08a2a,cost:4000,t:'Carry a third weapon'}};
/* perk hooks used by the weapon code (all neutral outside Zombies) */
const zrl=()=>zq&&mode=='Zombies'&&zq.perks.spd?0.5:1,zfr=()=>zq&&mode=='Zombies'&&zq.perks.dbl?0.75:1,zsm=()=>zq&&mode=='Zombies'&&zq.perks.stam?1.2:1,
 zmul=w=>mode=='Zombies'&&zq?ZW*(w.pm||1)*(zq.perks.dbl&&!w.ex&&w.k!='RG'?2:1):1;
const zHp=r=>{const bs=n=>100+30*(n-1)+5*n*(n-1);return Math.round(r<=10?bs(r):bs(10)*Math.pow(1.07,r-10))},zDm=r=>Math.min(55,18+r*1.3),zAc=r=>Math.max(.7,1.1-r*.015),zTot=r=>Math.min(56,Math.round(5+r*2.4)),ZW=2.2,ZE=3,RGB=3000,FACE={s:0,n:Math.PI,e:Math.PI/2,w:-Math.PI/2};
const zMe=()=>netOn?myId:'solo',zCli=()=>netOn&&!isHost;

/* ---------- the zombie map: an abandoned, half-collapsed mansion. Four ruined wings (Foyer, Ballroom, Conservatory, Kitchen) joined by four boarded-up doors.
   Walls are 8 high with no ledges beside them so nobody can climb out; light comes only from lamps, sconces, barrels and a fallen chandelier. ---------- */
MAPS['Hollow Estate']={d:'Zombies map: an abandoned, collapsed mansion with four ruined wings, locked doors, perk machines, mystery boxes and Pack-a-Punch',zm:1,H:44,sky:0x141a24,gr:0x2c302a,bc:0x5e584e,ps:[-22,28],skyk:'night',hemi:.62,hemiC:0x8aa0d0,hemiG:0x1a2030,sunI:.3,sunC:0x9fb4ff,fogF:85,gt:'concrete',
 zs:[[-40,40,0],[-8,40,0],[-40,6,0],[40,40,1],[8,40,1],[40,6,1],[-40,-40,2],[-8,-40,2],[-40,-6,2],[40,-40,3],[8,-40,3],[40,-6,3]],
 dr:[{x:0,z:22,w:1.2,d:5,c:1000,a:0,b:1,n:'Ballroom'},{x:-22,z:0,w:5,d:1.2,c:1250,a:0,b:2,n:'Conservatory'},{x:22,z:0,w:5,d:1.2,c:1500,a:1,b:3,n:'Kitchen'},{x:0,z:-22,w:1.2,d:5,c:2000,a:2,b:3,n:'Kitchen'}],
 mc:[{t:'vit',x:-14,z:42,f:'n'},{t:'rev',x:-42,z:22,f:'e'},{t:'dbl',x:42,z:14,f:'w'},{t:'mule',x:14,z:42,f:'n'},{t:'spd',x:-42,z:-14,f:'e'},{t:'stam',x:-14,z:-42,f:'s'},{t:'pap',x:30,z:-42,f:'s'},{t:'box',x:-32,z:4,f:'s'},{t:'box',x:8,z:-4,f:'n'}],
 b(){const M=MAPS['Hollow Estate'],a=[],vv=M._v||(M._v=[]),B=(x,z,w,d,h,y0,c,k)=>a.push([x,z,w,d,h,y0||0,c,k]),V=(x,z,w,d,h,y0,c,s,t)=>vv.push([x,z,w,d,h,y0||0,c,s,t]);
  let sd=17;const r=()=>(sd=(sd*16807)%2147483647)/2147483647,ri=(lo,hi)=>lo+r()*(hi-lo),lights=M.lights=[],wc=0x6e675c,occ=[],keep=[];
  for(const m of M.mc)keep.push([m.x,m.z,4.2]);for(const d of M.dr)keep.push([d.x,d.z,6.5]);for(const s of M.zs)keep.push([s[0],s[1],3.2]);keep.push([M.ps[0],M.ps[1],5]);
  /* tall boundary walls between the wings (8 high, ragged crowns) */
  for(const[x,z,w,d]of[[0,-34.25,1.2,19.5],[0,0,1.2,39],[0,34.25,1.2,19.5],[-34.25,0,19.5,1.2],[0,0,39,1.2],[34.25,0,19.5,1.2]]){B(x,z,w,d,8,0,wc,'brick');const L=Math.max(w,d);for(let t=-L/2+1;t<L/2-1;t+=2.4+r()*2)V(w>d?x+t:x,w>d?z:z+t,w>d?1.4+r():w+.2,w>d?d+.2:1.4+r(),8+.3+r()*1.2,8,0x4a463e,'b','brick')}
  /* the ruined wings */
  const WN=[
   {c:[-22,22],fl:[0x4a3a2c,'plank'],P:[[-18,-9,8,.8],[-14,-18.5,.8,7],[12,-8,.8,10],[16.5,-13,9,.8],[-12,12,.8,10],[-17,7,10,.8]],F:['couch','couch','table','table','piano','bookcase','bookcase','bookcase','bookcase','wardrobe','crate','rubble','rubble','rubble','rubble'],lamp:[6,-6],chan:[-4,14]},
   {c:[22,22],fl:[0x5a5a58,'tile'],P:[[-14,-4,.8,8],[14,6,.8,8],[-9,-8,1.6,1.6,7],[9,-8,1.6,1.6,7],[-9,6,1.6,1.6,7],[9,14,1.6,1.6,7]],F:['couch','couch','table','table','table','piano','crate','crate','rubble','rubble','rubble','rubble','rubble','wardrobe'],chan:[0,2],sconce:[21.85,2,1]},
   {c:[-22,-22],fl:[0x3f5a34,'grass'],P:[[-3,12,10,.8,3.2,'glass'],[14,-6,.8,10,3.2,'glass'],[-16,-2,8,.8],[0,-1,4,4,1],[-8,-8,10,2,.9],[8,5,10,2,.9]],F:['planter','planter','crate','crate','rubble','rubble','rubble','rubble','tree','tree','tree','table'],barrel:[-6,-14],lamp:[0,-1,1],lc:0x9ad0ff},
   {c:[22,-22],fl:[0x6a6c66,'tile'],P:[[-12,-8,.8,8],[-17,-12,10,.8],[14,6,.8,10],[18,1,8,.8],[0,-6,8,2.2,1.1],[-2,3,6,2.2,1.1]],F:['counter','counter','fridge','fridge','table','crate','crate','crate','rubble','rubble','rubble','wardrobe'],lamp:[-3,-6,1.1],barrel:[6,10]}];
  const TY={couch:[2.2,.95,.85,0x6a3a3a,'plank'],table:[2,1.1,.9,0x5a4028,'plank'],bookcase:[2.2,.5,2.3,0x4a3420,'plank'],piano:[1.7,1.3,1.1,0x15171a,'plank'],wardrobe:[1.4,.7,2.1,0x5a4a38,'plank'],crate:[1.1,1.1,1,0x6a5a3a,'plank'],planter:[2.4,1.1,.8,0x4a3a2a,'concrete'],counter:[3,.8,1,0x8a8a84,'tile'],fridge:[.9,.9,2,0xb5b8b4,'metal'],tree:[.6,.6,3.2,0x3a2d22,'plank']};
  const hit=(x,z,w,d,m)=>occ.some(o=>Math.abs(x-o[0])<(w+o[2])/2+m&&Math.abs(z-o[1])<(d+o[3])/2+m),clear=(x,z,rad)=>keep.every(k=>Math.hypot(x-k[0],z-k[1])>k[2]+rad);
  for(const W of WN){const[cx,cz]=W.c,wx=u=>cx+u,wz=v=>cz+v;
   B(cx,cz,43,43,.05,0,W.fl[0],W.fl[1]);
   for(const[u,v,w,d,h,k]of W.P){B(wx(u),wz(v),w,d,h||4.5,0,k=='glass'?0x3a5a54:wc,k||'brick');occ.push([u,v,w,d]);
    if(!k&&!h&&Math.max(w,d)>4){const L=Math.max(w,d);for(let t=-L/2;t<L/2-.5;t+=1.2+r()*1.5)V(w>d?wx(u+t):wx(u),w>d?wz(v):wz(v+t),w>d?1+r()*1.2:w+.1,w>d?d+.1:1+r()*1.2,4.5+.2+r()*.7,4.5,0x4a463e,'b','brick')}}
   /* furniture and rubble scattered on the floor, kept clear of machines, doors, spawns and each other */
   for(const t of W.F){for(let n=0;n<60;n++){const u=ri(-19,19),v=ri(-19,19);let[w,d,h,c,k]=t=='rubble'?[ri(1.4,3.2),ri(1.4,3),ri(.7,1.2),0x6a665c,'concrete']:TY[t];if(r()<.5)[w,d]=[d,w];
     if(!clear(wx(u),wz(v),Math.max(w,d)/2)||hit(u,v,w,d,1.6))continue;occ.push([u,v,w,d]);
     B(wx(u),wz(v),w,d,h,0,c,k);
     if(t=='rubble'){V(wx(u)+ri(-.8,.8),wz(v)+ri(-.8,.8),ri(.5,1),ri(.5,1),h+ri(.1,.4),0,0x7a7468,'b','concrete');V(wx(u)+1.4,wz(v)-.6,.7,1.2,.3,0,0x5a564e,'b','concrete')}
     else if(t=='tree'){V(wx(u),wz(v),2.6,2.6,5,2.6,0x2e3a26,'s');V(wx(u)+.4,wz(v)-.5,1.8,1.8,5.6,3.4,0x26321f,'s')}
     else if(t=='piano')V(wx(u),wz(v),w*.9,d*.9,h+.18,h,0x0c0d0f,'b','plank');
     else if(t=='couch'||t=='table')V(wx(u),wz(v),w*.95,d*.95,h+.12,h,t=='couch'?0x7a4646:0x6a5030,'b','plank');
     break}}
   /* torn rugs, stains and debris, flat on the floor (walkable) */
   for(let k=0;k<7;k++){const u=ri(-18,18),v=ri(-18,18);V(wx(u),wz(v),ri(2.4,4.6),ri(1.8,3.4),.04,.05,[0x5a1a1a,0x1f3a3a,0x4a3a1a][k%3],'b','plank')}
   for(let k=0;k<18;k++){const u=ri(-20,20),v=ri(-20,20);V(wx(u),wz(v),ri(.5,1.6),ri(.5,1.6),.05,.05,0x3a0808,'b','concrete')}
   for(let k=0;k<26;k++){const u=ri(-20,20),v=ri(-20,20);V(wx(u),wz(v),ri(.2,.7),ri(.2,.7),ri(.1,.28),.05,[0x5a554c,0x4a4640,0x6a5a45][k%3],'b','concrete')}
   /* open roof: a few surviving rafters across the sky */
   for(let k=-3;k<=3;k++){const L=ri(14,30);V(wx(0),wz(k*6.5),L,.45,7.9,7.4,0x2a2118,'b','plank');if(k%2)V(wx(k*6.5),wz(0),.45,ri(10,24),7.9,7.4,0x2a2118,'b','plank')}
   /* light sources that are actually part of the room */
   if(W.lamp){const[u,v,y]=[W.lamp[0],W.lamp[1],W.lamp[2]||0],x=wx(u),z=wz(v);V(x,z,.35,.35,y+.1,y,0x2a2a2a,'c');V(x,z,.06,.06,y+1.7,y,0x3a3a3a,'c');V(x,z,.5,.5,y+2.1,y+1.7,W.lc||0xffe0a0,'e');lights.push([x,y+1.9,z,W.lc||0xffc890,1.5,30])}
   if(W.chan){const x=wx(W.chan[0]),z=wz(W.chan[1]);V(x,z,2.6,2.6,.5,0,0x8a6a2a,'c');V(x,z,1.7,1.7,.9,.45,0x6a4a1a,'c');for(let q=0;q<6;q++){const ag=q*1.047;V(x+Math.cos(ag)*1.3,z+Math.sin(ag)*1.3,.18,.18,.62,.5,0xffe4b0,'e')}V(x+2.1,z+.7,.1,1.6,.15,0,0xaab8c0,'g');B(x,z,2.6,2.6,.25,0,0x8a6a2a,'n');lights.push([x,1.4,z,0xffb070,1.8,34])}
   if(W.barrel){const x=wx(W.barrel[0]),z=wz(W.barrel[1]);V(x,z,.95,.95,1,0,0x4a3a30,'c','metal');V(x,z,.7,.7,1.25,1,0xff7a1a,'e');B(x,z,.95,.95,1,0,0x4a3a30,'metal');lights.push([x,1.8,z,0xff8a3a,1.7,28])}
   if(W.sconce){const[u,v,s]=W.sconce,x=wx(u),z=wz(v),dx=s==1?-1:s==0?0:0;V(x,z,.3,.5,3,2.5,0x2a2a2a,'b');V(x+dx*.3,z,.18,.18,3.3,2.95,0xffcf8a,'e');lights.push([x+dx*.8,3.1,z,0xffc080,1.2,22])}}
  return a}};

/* ---------- small helpers ---------- */
const zTex=(w,h,fn)=>{const c=document.createElement('canvas');c.width=w;c.height=h;fn(c.getContext('2d'),w,h);return new THREE.CanvasTexture(c)};
function zSprite(txt,col,sz,depth){const c=document.createElement('canvas');c.width=256;c.height=64;const t=new THREE.CanvasTexture(c),s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,depthTest:!!depth}));s.scale.set(sz*4,sz,1);s.userData={c,t};zSet(s,txt,col);return s}
function zSet(s,txt,col){const g=s.userData.c.getContext('2d');g.clearRect(0,0,256,64);g.font='700 40px Teko,Impact,sans-serif';g.textAlign='center';g.textBaseline='middle';g.lineWidth=5;g.strokeStyle='#000';g.strokeText(txt,128,34);g.fillStyle=col;g.fillText(txt,128,34);s.userData.t.needsUpdate=true}
const hex=c=>'#'+c.toString(16).padStart(6,'0'),zf=m=>{beep(140,.2,'sawtooth',.07);msg(m,1)};
function zSolid(x,z,w,d,h){const b={x0:x-w/2,x1:x+w/2,z0:z-d/2,z1:z+d/2,h,y0:0};bx.push(b);return b}
function zUnsolid(b){const i=bx.indexOf(b);if(i>=0)bx.splice(i,1);zGrid()}

/* ---------- weapons the player holds ---------- */
function zGunObj(k){const w={k,...eff(k,[])};w.mag=w.m;w.rs=k=='RG'?3:(w.rs==null?4:w.rs);w.res=w.m*w.rs;return w}
function zGive(k){const w=zGunObj(k),i=wp.findIndex(x=>x.k==k);if(i>=0){wp[i]=w;cur=i}else if(wp.length<zq.cap){wp.push(w);cur=wp.length-1}else wp[cur]=w;rel=0;setGun();msg(W[k].n,1.5)}
function zPick(by){const own=by==zMe()?wp.map(w=>w.k):[];if(Math.random()<.03&&!own.includes('RG'))return 'RG';const pool=['AR','SMG','BR','SG','MP','VMP','SN','RL','CY','MG'].filter(k=>!own.includes(k));return pool.length?pool[Math.random()*pool.length|0]:'SMG'}
function zPap(w){const B=W[w.k],t=(w.pap||0)+1;w.pap=t;w.pm=t==1?2.2:3.6;if(w.k=='RG')w.pm=t==1?3:6;w.m=Math.round(B.m*(t==1?1.5:2));w.r=B.r*(t==1?.9:.8);w.pn=B.n+(t==1?' PaP':' PaP II');w.mag=w.m;w.res=w.m*w.rs;rel=0;setGun()}
const _zsg=setGun;setGun=function(){_zsg();gf.material.color.setHex(mode=='Zombies'&&cw().pap?0xc080ff:0xffdd66)};

/* ---------- building the level objects: doors, machines, boxes ---------- */
function zStart(){document.body.classList.toggle('zom',mode=='Zombies');$('#zh').style.display=mode=='Zombies'?'block':'none';$('#zp').textContent='';zhc='';
 if(zG&&zG.parent)zG.parent.remove(zG);zG=null;zi=[];zdoors=[];zboxes=[];zdead=[];zfls={};zbT=zsT=0;if(mode!='Zombies'){zq=null;return}
 const M=MAPS[sel.map];zq={r:0,pts:500,perks:{},cap:2,revBuys:0,revM:null,st:'prep',tm:6,toSpawn:0,spT:0,open:{0:1},fl:0,cur:null,gn:3,brutes:0,down:0,out:0,dnT:0,rvT:0,ad:0};
 wp=[zGunObj('CT')];cur=0;rel=0;gc=L.g?2:0;P.mhp=50;P.hp=50;setGun();
 if(netOn){const k=Object.keys(names).sort().indexOf(myId);P.x+=(k%2?1.6:-1.6);P.z+=(k>1?1.6:0)}
 zG=new THREE.Group();mapG.add(zG);M.dr.forEach((d,i)=>zDoor(d,i));for(const m of M.mc){if(m.t=='box')zMakeBox(m);else zMachine(m)}zGrid()}
function zDoor(d,idx){const m=new THREE.Group(),body=new THREE.Mesh(bg,new THREE.MeshLambertMaterial({color:0x5b4636}));body.scale.set(d.w,8,d.d);body.position.y=4;m.add(body);
 const sg_=new THREE.MeshBasicMaterial({map:zTex(256,64,(g,w,h)=>{g.fillStyle='#1b1410';g.fillRect(0,0,w,h);g.fillStyle='#ffd24a';g.font='700 40px Teko,Impact,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('DOOR  '+d.c,w/2,h/2+2)})}),thin=d.d<d.w;
 for(const s of[1,-1]){const p=new THREE.Mesh(new THREE.PlaneGeometry(3.2,.8),sg_);if(thin){p.position.set(0,2.3,s*(d.d/2+.03));p.rotation.y=s>0?0:Math.PI}else{p.position.set(s*(d.w/2+.03),2.3,0);p.rotation.y=s>0?Math.PI/2:-Math.PI/2}m.add(p)}
 m.position.set(d.x,0,d.z);zG.add(m);const o={d,m,box:zSolid(d.x,d.z,d.w,d.d,8),open:0};zdoors.push(o);
 zi.push({x:d.x,z:d.z,r:3.4,txt:()=>o.open?'':'Open door to the '+d.n,cost:()=>o.open?0:d.c,act:()=>{if(o.open)return;if(zq.pts<d.c)return zf('Not enough points');if(zCli())return void netSend({t:'zqd',i:idx});zq.pts-=d.c;zOpenDoor(idx,zMe())}})}
function zOpenDoor(i,by){const o=zdoors[i];if(!o||o.open)return;o.open=1;o.sink=1;zUnsolid(o.box);zq.open[o.d.a]=zq.open[o.d.b]=1;zq.fl=0;beep(200,.4,'sawtooth',.09);msg(o.d.n+' unlocked',1.8);if(netOn&&isHost)netSend({t:'zd',i,by})}
function zFace(p){return zTex(128,192,(g,w,h)=>{const col=hex(p.c);g.fillStyle='#14181c';g.fillRect(0,0,w,h);const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,col);gr.addColorStop(1,'#050505');g.fillStyle=gr;g.fillRect(6,6,w-12,h-12);
 g.fillStyle='#e9eef1';g.fillRect(36,28,56,86);g.fillStyle=col;g.fillRect(36,56,56,32);g.fillStyle='#bfc7cc';g.fillRect(36,22,56,8);g.fillRect(36,112,56,6);
 g.fillStyle='#fff';g.font='700 28px Teko,Impact,sans-serif';g.textAlign='center';const wd=p.n.toUpperCase().split(' ');g.fillText(wd[0],w/2,150);g.fillText(wd[1]||'',w/2,177)})}
function zMachine(m){const pap=m.t=='pap',p=pap?{n:'Pack-a-Punch',c:0x7a3ad8,cost:0}:PERKS[m.t],g=new THREE.Group(),M=c=>new THREE.MeshLambertMaterial({color:c}),
  Bm=(w,h,d,x,y,z,mt)=>{const o=new THREE.Mesh(bg,mt);o.scale.set(w,h,d);o.position.set(x,y,z);g.add(o);return o},W_=pap?2.6:1.4,Hh=pap?2.8:2.4,D_=pap?1.4:1;
 Bm(W_,Hh,D_,0,Hh/2,0,M(pap?0x1d2540:0x2b2f35));Bm(W_+.1,.12,D_+.1,0,Hh+.02,0,M(p.c));
 const face=new THREE.Mesh(new THREE.PlaneGeometry(W_-.2,Hh-.55),new THREE.MeshBasicMaterial({map:pap?zTex(256,192,(c,w,h)=>{c.fillStyle='#120a22';c.fillRect(0,0,w,h);const gr=c.createLinearGradient(0,0,w,h);gr.addColorStop(0,'#7a3ad8');gr.addColorStop(1,'#2a6ad8');c.fillStyle=gr;c.fillRect(8,8,w-16,h-16);c.fillStyle='#fff';c.textAlign='center';c.font='700 52px Teko,Impact,sans-serif';c.fillText('PACK-A',w/2,76);c.fillText('A-PUNCH',w/2,128);c.font='600 22px Rajdhani,sans-serif';c.fillText('UPGRADE YOUR WEAPON',w/2,166)}):zFace(p)}));
 face.position.set(0,Hh/2+.1,D_/2+.01);g.add(face);const lb=zSprite(p.n,'#ffffff',.5,1);lb.position.y=Hh+.8;g.add(lb);
 if(pap){const bm=new THREE.Mesh(new THREE.CylinderGeometry(.5,.5,9,12),new THREE.MeshBasicMaterial({color:0x8a4aff,transparent:true,opacity:.18,depthWrite:false}));bm.position.y=Hh+4.5;g.add(bm)}
 g.position.set(m.x,0,m.z);g.rotation.y=FACE[m.f];zG.add(g);const side=m.f=='e'||m.f=='w',bxo=zSolid(m.x,m.z,side?D_:W_,side?W_:D_,Hh);
 if(pap){zi.push({x:m.x,z:m.z,r:3.4,txt:()=>{const w=cw(),t=w.pap||0;return t>=2?'Weapon fully upgraded':'Pack-a-Punch the '+(w.pn||W[w.k].n)},cost:()=>[5000,10000][cw().pap||0]||0,act:()=>{const w=cw(),c=[5000,10000][w.pap||0];if(!c)return zf('Already fully upgraded');if(zq.pts<c)return zf('Not enough points');zq.pts-=c;zPap(w);beep(300,.15,'sawtooth',.09);setTimeout(()=>beep(900,.3,'triangle',.09),120);msg('Pack-a-Punched!',2)}})}
 else{const o={gone:0};if(m.t=='rev')zq.revM={g,bxo,o};zi.push({x:m.x,z:m.z,r:2.6,txt:()=>o.gone?'':zq.perks[m.t]?'':p.n+': '+p.t,cost:()=>o.gone||zq.perks[m.t]?0:p.cost,act:()=>zPerk(m.t)})}}
function zPerk(t){const p=PERKS[t];if(zq.perks[t])return zf('You already have '+p.n);if(t=='rev'&&zq.revBuys>=4)return zf('Out of stock');if(zq.pts<p.cost)return zf('Not enough points');zq.pts-=p.cost;zq.perks[t]=1;
 if(t=='vit'){P.mhp=100;P.hp=100}if(t=='mule')zq.cap=3;
 if(t=='rev'){if(zCli())netSend({t:'zqr'});else{zq.revBuys++;zRevCount(zq.revBuys);if(netOn)netSend({t:'zrev',n:zq.revBuys})}}
 beep(520,.1,'triangle',.08);setTimeout(()=>beep(780,.15,'triangle',.08),90);msg(p.n+': '+p.t,2)}
/* the Revive Soda machine runs dry after four purchases (counted across every player) */
function zRevCount(n){zq.revBuys=n;const o=zq.revM;if(n>=4&&o&&!o.o.gone){o.g.visible=false;o.o.gone=1;zUnsolid(o.bxo);setTimeout(()=>msg('The Revive Soda machine is empty',2),1800)}}
function zMakeBox(m){const g=new THREE.Group(),M=c=>new THREE.MeshLambertMaterial({color:c}),Bm=(w,h,d,x,y,z,mt)=>{const o=new THREE.Mesh(bg,mt);o.scale.set(w,h,d);o.position.set(x,y,z);g.add(o)};
 Bm(1.8,.8,.9,0,.4,0,M(0x6b4a2b));Bm(1.85,.24,.95,0,.92,0,M(0x4a3320));Bm(.12,.84,.96,-.55,.42,0,M(0xd9b13b));Bm(.12,.84,.96,.55,.42,0,M(0xd9b13b));Bm(.22,.22,.06,0,.75,.46,M(0xffd24a));
 const beam=new THREE.Mesh(new THREE.CylinderGeometry(.5,.5,8,12),new THREE.MeshBasicMaterial({color:0xffd24a,transparent:true,opacity:.2,depthWrite:false})),lab=zSprite('?','#ffd24a',.6);beam.position.y=4.5;beam.visible=false;lab.position.y=2.4;lab.visible=false;g.add(beam,lab);
 g.position.set(m.x,0,m.z);g.rotation.y=FACE[m.f];zG.add(g);const side=m.f=='e'||m.f=='w';zSolid(m.x,m.z,side?.9:1.8,side?1.8:.9,.9);
 const idx=zboxes.length,o={st:0,t:0,cy:0,item:null,by:'',beam,lab};zboxes.push(o);
 zi.push({x:m.x,z:m.z,r:2.8,txt:()=>o.st==0?'Mystery Box':o.st==2&&o.by==zMe()?'Take the '+W[o.item].n:'',cost:()=>o.st==0?950:0,act:()=>zBoxAct(o,idx)})}
function zBoxAct(o,i){if(o.st==0){if(zq.pts<950)return zf('Not enough points');if(zCli())return void netSend({t:'zqb',i});zq.pts-=950;zBoxStart(o,i,zMe())}
 else if(o.st==2&&o.by==zMe()){zGive(o.item);if(zCli())netSend({t:'zqe',i});zBoxEnd(o,i)}}
function zBoxStart(o,i,by){o.st=1;o.t=0;o.cy=0;o.by=by;beep(300,.2,'triangle',.08);if(netOn&&isHost)netSend({t:'zbs',i,st:1,by})}
function zBoxEnd(o,i){o.st=0;o.beam.visible=o.lab.visible=false;if(netOn&&isHost)netSend({t:'zbs',i,st:0})}
function zBoxTick(o,i,dt,auth){if(o.st==1){o.t+=dt;o.cy-=dt;o.beam.visible=o.lab.visible=true;if(o.cy<=0){o.cy=.12;zSet(o.lab,['KN-115','SMG','Battle Rifle','Shotgun','Magnum','Machine Pistol','VMP-X','Sniper Rifle','Rocket Launcher','Coyote'][Math.random()*10|0],'#ffd24a');beep(500+Math.random()*300,.05,'square',.03)}
  if(auth&&o.t>3.2){o.item=zPick(o.by);o.st=2;o.t=0;zSet(o.lab,W[o.item].n,o.item=='RG'?'#ff4a4a':'#7bf08a');beep(900,.2,'triangle',.09);if(netOn&&isHost)netSend({t:'zbs',i,st:2,item:o.item,by:o.by})}}
 else if(o.st==2&&auth){o.t+=dt;if(o.t>9)zBoxEnd(o,i)}}

/* ---------- navigation: a coarse grid and a breadth-first flow field towards each player ---------- */
function zGrid(){navBuild();zgr=NAV}
function zFlow(pl){return navFlow(pl.x,pl.z)}
/* everyone the zombies can attack: the host and every connected player who is on their feet */
function zPlayers(){const a=[];if(!P.dead)a.push({id:zMe(),x:P.x,z:P.z,y:P.y,me:1});if(netOn)for(const b of bots)if(b.net&&!b.hb&&b.al)a.push({id:b.id,x:b.x,z:b.z,y:b.y||0});return a}

/* ---------- zombies ---------- */
function zModel(r,big){const m=new THREE.Group(),t=Math.min(3,r/5|0),pk=a=>a[Math.random()*a.length|0],
 rig=mkHuman(m,{zombie:1,skin:[0xa9b98a,0xb3b58a,0xa89aa8,0xb27a62][t],shirt:big?0x5a1a14:pk([0x5a6a7a,0x6a5a4a,0x4a5a46,0x7a6a5a,0x3a3a44,0x6a4a4a]),pants:pk([0x2f3340,0x3a3a30,0x4a3f35,0x26282c]),hair:pk([0x1a1410,0x2a2018,0x3a342a]),eye:r>=15?0xff9a2a:0xff2a2a});
 S.add(m);if(big)m.scale.setScalar(1.35);return{m,rig}}
function mkZombie(x,z,big){const r=zq.r,{m,rig}=zModel(r,big),hp=Math.round(zHp(r)*(big?3:1)),run=r>=25||(r>=6&&Math.random()<Math.min(.6,(r-5)*.06)),
 b={i:botId++,m,rig,x,z,y:0,hp,mhp:hp,sh:0,msh:0,lh:-9,al:1,team:'z',zom:1,big:!!big,nm:big?'Brute':'Zombie',cd:.5,k:0,df:1,dm:Math.min(zDm(r)*(big?1.5:1),big?70:55),ac:zAc(r),sp:(Math.min(4.2,1.6+r*.11+Math.random()*.5)+(run?1:0))*(big?.75:1)};
 m.position.set(x,0,z);bots.push(b);burst(V(x,1,z),big?30:14,big?0xaa3a2a:0x6a9a4a,5,.7,.14);return b}
function zPuppet(i,x,z,big,r){const{m,rig}=zModel(r,big),b={i,m,rig,x,z,tx:x,tz:z,y:0,hp:1e9,mhp:1e9,sh:0,msh:0,lh:-9,al:1,team:'z',zom:1,zp:1,big:!!big,nm:big?'Brute':'Zombie',df:1,k:0};m.position.set(x,0,z);bots.push(b);return b}
function zSpawn(M,big){const open=M.zs.filter(s=>zq.open[s[2]]),pl=zPlayers(),far=open.filter(s=>pl.every(p=>Math.hypot(s[0]-p.x,s[1]-p.z)>16)),s=(far.length?far:open)[Math.random()*(far.length||open.length)|0];mkZombie(s[0]+(Math.random()-.5)*3,s[1]+(Math.random()-.5)*3,big)}
/* damage to a zombie: 10 points per hit, kill 50 (60 explosive), headshot kill 100, melee kill 130; the RayGun kills anything.
   Guests send their hits to the host (zqh) and get the kill points back (zk). */
const _zhb=hitBot;hitBot=function(b,d,head){if(b.zom)return zHit(b,d,head);if(mode=='Zombies')return;_zhb(b,d,head)};
function zHit(b,d,head){if(!b.al)return;const w=wp.find(x=>x.k==srcK);if(srcK=='RG')d=RGB*(w&&w.pm?w.pm:1)*(b.big?2:1);else if(w&&w.ex)d*=ZE*(w.pm||1);else if(!srcK&&src!='Melee')d*=ZE;
 if(b.zp){hits++;juiceHit(b,Math.min(d,9999),head);$('#hm').className='on'+(head?' hd':'');hmT=.12;beep(head?900:600,.05,'square',.04);if(src!='Melee')zq.pts+=10;netSend({t:'zqh',i:b.i,d,h:head?1:0,k:srcK,m:src=='Melee'?1:0});return}
 zDamage(b,d,head,zMe(),srcK,src=='Melee')}
function zDamage(b,d,head,by,k,mel){if(!b.al)return;b.hp-=d;b.lh=t0;const mine=by==zMe();
 if(mine){hits++;$('#hm').className='on'+(head?' hd':'');hmT=.12;beep(head?900:600,.05,'square',.04)}juiceHit(b,Math.min(d,9999),head);
 if(b.hp>0){if(mine&&!mel)zq.pts+=10;return}
 b.al=0;const pt=mel?130:head?100:(k=='RL'||k=='RG')?60:50;zdead.push({b,t:0});{const kp=mine?P:bots.find(x=>x.net&&x.id==by);ragStart(b,kp?b.x-kp.x:0,kp?b.z-kp.z:0,b.big?2.2:(k=='SG'||k=='RL'||k=='RG'?6:3.4))}
 if(mine){kills++;zq.pts+=pt;floatTxt(V(b.x,2.8,b.z),'+'+pt,'#ffd24a');juiceKill(b,head);wzkill(k);killXP(head)}
 else{const nb=bots.find(x=>x.net&&x.id==by);if(nb)nb.k=(nb.k||0)+1;netSend({t:'zk',to:by,pts:pt,k,h:head?1:0})}}
function zMove(dt){const zs=bots.filter(b=>b.zom&&b.al),pls=zPlayers();
 for(const b of zs){let pl=null,bd=1e9;for(const p of pls){const d=Math.hypot(p.x-b.x,p.z-b.z);if(d<bd){bd=d;pl=p}}if(!pl)continue;
  let sps=b.sp;if(b.stun>0){b.stun-=dt;sps*=.15}const D=navMove(b,dt,pl.x,pl.z,sps,zfls[pl.id]);b.m.position.set(b.x,0,b.z);b.tyaw=D<4?Math.atan2(pl.x-b.x,pl.z-b.z):(b.mva==null?b.m.rotation.y:b.mva);
  b.cd-=dt;if(D<1.5*(b.big?1.3:1)&&Math.abs(pl.y)<1.4){if(b.cd<=0){b.cd=b.ac;b.lunge=.3;if(pl.me)hurt(b.dm,b);else netSend({t:'hit',to:pl.id,d:b.dm,bot:b.i})}}else b.cd=Math.max(b.cd,.35)}
 for(let i=0;i<zs.length;i++)for(let j=i+1;j<zs.length;j++){const a=zs[i],c=zs[j],dx=c.x-a.x,dz=c.z-a.z,d=Math.hypot(dx,dz);if(d<.8&&d>.001){const p=(.8-d)*.5/d;mv(a,-dx*p,-dz*p,.45);mv(c,dx*p,dz*p,.45)}}
 zq.gn-=dt;if(zq.gn<=0&&zs.length){zq.gn=2+Math.random()*2;const b=zs[Math.random()*zs.length|0],d=Math.hypot(b.x-P.x,b.z-P.z);if(d<25)beep(70+Math.random()*50,.4,'sawtooth',Math.max(.01,.05-d*.002))}}
function zAnim(dt){for(let i=zdead.length-1;i>=0;i--){const d=zdead[i];d.t+=dt;ragTick(d.b,dt);if(d.t>6&&d.b.rag)d.b.rag.sink=(d.t-6)*1.4;if(d.t>7.2){S.remove(d.b.m);const j=bots.indexOf(d.b);if(j>=0)bots.splice(j,1);zdead.splice(i,1)}}
 for(const o of zdoors)if(o.sink){o.m.position.y-=dt*6;if(o.m.position.y<-5){zG.remove(o.m);o.sink=0}}}

/* ---------- round flow ---------- */
/* what a new round does for every player (host and guests): restock ammo, camo check, bring downed players back */
function zRoundFx(){const z=zq;zRoundDone(z.r);for(const w of wp){w.mag=w.m;w.res=w.m*(w.rs==null?4:w.rs)}if(L.g)gc=Math.min(3,gc+1);rel=0;if(netOn&&P.dead)zRespawn();
 msg(z.brutes?'Round '+z.r+' · Brutes incoming':'Round '+z.r,3);beep(110,.5,'sawtooth',.1);setTimeout(()=>beep(80,.6,'sawtooth',.1),250)}
function zNewRound(){const z=zq;z.r++;z.st='run';z.toSpawn=zTot(z.r);z.brutes=z.r%5==0?Math.floor(z.r/5):0;z.spT=.6;zRoundFx();if(netOn)netSend({t:'zs',r:z.r,st:z.st,tm:0,br:z.brutes})}
function zEndRound(){const z=zq;z.st='prep';z.tm=8;msg('Round '+z.r+' survived',2.5);beep(660,.2,'triangle',.08);setTimeout(()=>beep(880,.3,'triangle',.08),180);if(netOn)netSend({t:'zs',r:z.r,st:z.st,tm:z.tm})}
function zRoundSync(d){const z=zq;if(d.r>z.r){z.r=d.r;z.brutes=d.br||0;zRoundFx()}else if(d.st=='prep'&&z.st!='prep'){msg('Round '+z.r+' survived',2.5);beep(660,.2,'triangle',.08)}z.st=d.st;z.tm=d.tm}
/* per-frame work shared by the host and by guests */
function zCommon(dt){const z=zq;if(!P.dead&&t0-lastHit>6&&P.hp<P.mhp)P.hp=Math.min(P.mhp,P.hp+12*dt);
 if(z.down){z.dnT-=dt;if(z.dnT<=0){z.down=0;z.out=1;msg('You bled out. You return next round',3)}}
 if(z.cur&&z.cur.rv&&key.KeyF&&!P.dead){z.rvT+=dt;$('#zp').textContent=`Reviving ${z.cur.rv.nm}… ${Math.min(100,Math.round(z.rvT/2*100))}%`;if(z.rvT>=2){z.rvT=0;netSend({t:'zqv',to:z.cur.rv.id});z.pts+=100;feed('You revived '+z.cur.rv.nm)}}else z.rvT=0;
 zAnim(dt);zInteract();zMarkers()}
function zomTick(dt){const z=zq;if(!z||mode!='Zombies')return;const M=MAPS[sel.map];
 let alive=0;for(const b of bots)if(b.zom&&b.al)alive++;
 if(z.st=='prep'){z.tm-=dt;if(z.tm<=0)zNewRound()}
 else{z.spT-=dt;if(z.toSpawn>0&&z.spT<=0){const room=Math.min(24,6+z.r*2)-alive;if(room>0){const n=Math.min(room,z.toSpawn,2+(z.r>3?1:0)+(z.r>8?1:0));for(let i=0;i<n;i++){const big=z.brutes>0&&(z.toSpawn-i<=z.brutes||Math.random()<.2);if(big)z.brutes--;zSpawn(M,big)}z.toSpawn-=n;z.spT=Math.max(1.2,3.2-z.r*.12)}else z.spT=.4}
  if(z.toSpawn<=0&&alive<=0)zEndRound()}
 z.fl-=dt;if(z.fl<=0&&zgr){z.fl=.35;zfls={};for(const pl of zPlayers())zfls[pl.id]=zFlow(pl)}
 zMove(dt);zCommon(dt);zboxes.forEach((o,i)=>zBoxTick(o,i,dt,1));
 if(netOn){zbT+=dt;if(zbT>.1){zbT=0;netSend({t:'zb',r:z.r,l:bots.filter(b=>b.zom&&b.al).map(b=>[b.i,+b.x.toFixed(1),+b.z.toFixed(1),b.big?1:0])})}
  zsT+=dt;if(zsT>.5){zsT=0;netSend({t:'zs',r:z.r,st:z.st,tm:Math.ceil(z.tm),br:z.brutes})}
  if(!zPlayers().length&&!over){z.ad+=dt;if(z.ad>6)endGame('You reached round '+z.r)}else z.ad=0}
 $('#ob').textContent=z.st=='prep'?(z.r?`Round ${z.r} survived  ·  next round in ${Math.ceil(z.tm)}`:`Get ready  ·  first round in ${Math.ceil(z.tm)}`):`Round ${z.r}  ·  Zombies left ${z.toSpawn+alive}`;zHud()}
/* guests: the host runs the world, guests move the puppets and handle their own interactions */
function zcTick(dt){const z=zq;if(!z||mode!='Zombies')return;const k=Math.min(1,dt*10);
 for(const b of bots)if(b.zp&&b.al){const ox=b.x,oz=b.z;b.x+=(b.tx-b.x)*k;b.z+=(b.tz-b.z)*k;b.m.position.set(b.x,0,b.z);if(Math.hypot(b.tx-ox,b.tz-oz)>.02)b.tyaw=Math.atan2(b.tx-ox,b.tz-oz)}
 zCommon(dt);zboxes.forEach((o,i)=>zBoxTick(o,i,dt,0));zHud()}
function zSync(d){const seen=new Set();for(const[i,x,z,big]of d.l){seen.add(i);let b=bots.find(q=>q.zp&&q.i==i);if(!b)b=zPuppet(i,x,z,big,d.r);b.tx=x;b.tz=z}
 for(const b of bots)if(b.zp&&b.al&&!seen.has(b.i)){b.al=0;zdead.push({b,t:0});ragStart(b,b.x-P.x,b.z-P.z,3)}}
function zInteract(){const z=zq;let best=null,bd=1e9;if(!P.dead){for(const it of zi){const d=Math.hypot(P.x-it.x,P.z-it.z);if(d<it.r&&d<bd&&it.txt()){bd=d;best=it}}
  if(netOn)for(const b of bots)if(b.net&&!b.hb&&!b.al&&b.dn){const d=Math.hypot(P.x-b.x,P.z-b.z);if(d<2.6&&d<bd){bd=d;best={rv:b,txt:()=>'Hold F to revive '+b.nm,cost:()=>0,act:()=>{}}}}}
 z.cur=best;const e=$('#zp');if(P.dead&&z.down){e.textContent=`DOWN · bleeding out in ${Math.ceil(z.dnT)}s · a teammate can revive you`;e.className='bad';return}if(best){const c=best.cost();e.textContent=best.rv?best.txt():`[F] ${best.txt()}${c?'  ['+c+']':''}`;e.className=c>z.pts?'bad':''}else{e.textContent='';e.className=''}}
function zUse(){if(!zq||P.dead||over)return;if(zq.cur)zq.cur.act()}
function zHud(){const z=zq,ic=Object.keys(z.perks).filter(k=>z.perks[k]).map(k=>`<i style="background:${hex(PERKS[k].c)}">${PERKS[k].n[0]}</i>`).join(''),tm=netOn?bots.filter(b=>b.net&&!b.hb).map(b=>`${esc(b.nm)} ${b.zpts|0}${b.al?'':b.dn?' ✚':' ✖'}`).join('<br>'):'',k=z.r+'|'+z.pts+'|'+ic+'|'+tm+'|'+(z.down?1:0);if(k==zhc)return;zhc=k;$('#zr').textContent=z.r||'';$('#zpt').textContent=z.pts+(z.down?' · DOWN':'');$('#zpk').innerHTML=ic;$('#zt').innerHTML=tm}
/* downed: Revive Soda brings you back by yourself, a teammate can revive you (co-op), otherwise the run ends */
function zDown(){const z=zq;if(!z)return;P.rt=1e9;const rev=z.perks.rev;z.perks={};P.mhp=50;z.cap=2;if(wp.length>2){wp.length=2;if(cur>1){cur=1;setGun()}}gun.visible=false;
 if(rev){msg('Reviving in 4…',3);setTimeout(()=>{if(run&&mode=='Zombies'&&!over&&P.dead&&!z.out)zRevive()},4000)}
 else if(netOn){z.down=1;z.dnT=45;msg('You are down. Hold on until a teammate revives you',3);netSend({t:'zdn'})}
 else setTimeout(()=>{if(mode=='Zombies')endGame('You reached round '+z.r)},2600)}
/* knocked: you lie on the floor (low camera, slow crawl) instead of ragdolling */
function zDownCam(dt){const f=(key.KeyW?1:0)-(key.KeyS?1:0),s=(key.KeyD?1:0)-(key.KeyA?1:0);if((f||s)&&zq&&!over){const sy=Math.sin(yaw),cy=Math.cos(yaw),n=Math.hypot(f,s)||1;mv(P,(-sy*f+cy*s)/n*1.5*dt,(-cy*f-sy*s)/n*1.5*dt,.4)}
 C.position.set(P.x,.42+Math.sin(t0*2)*.01,P.z);C.rotation.set(Math.max(-.6,Math.min(.4,pitch*.5))-.1,yaw,.18)}
/* every player on their feet sees a marker over a downed teammate */
function zMarkers(){if(!netOn)return;for(const b of bots){if(!b.net||b.hb)continue;const need=!b.al&&b.dn&&!P.dead;if(need&&!b.zmk){b.zmk=zSprite('','#ff5a3a',.8,0);S.add(b.zmk);b.zmt=0}if(!need&&b.zmk){S.remove(b.zmk);b.zmk=null}
  if(b.zmk){b.zmk.position.set(b.x,2.3,b.z);if(t0>b.zmt){b.zmt=t0+.4;zSet(b.zmk,'✚ '+b.nm+' '+Math.round(Math.hypot(P.x-b.x,P.z-b.z))+'m','#ff5a3a')}}}}
function zRevive(){endDeath();P.dead=0;P.hp=P.mhp*.6;P.sh=P.msh;gun.visible=true;rel=0;zq.down=zq.out=0;if(isHost||!netOn)for(const b of bots)if(b.zom&&b.al){const dx=b.x-P.x,dz=b.z-P.z,d=Math.hypot(dx,dz);if(d<7&&d>.01)mv(b,dx/d*(7-d),dz/d*(7-d),.45)}msg('Revived!',2);beep(660,.2,'triangle',.1)}
/* a downed or bled-out player returns at the start of the next round with a pistol (points are kept) */
function zRespawn(){const z=zq,ps=MAPS[sel.map].ps;endDeath();P.dead=0;z.down=z.out=0;z.perks={};z.cap=2;P.mhp=50;P.hp=50;P.sh=P.msh;wp=[zGunObj('CT')];cur=0;rel=0;setGun();P.x=ps[0];P.z=ps[1];P.y=0;gun.visible=true;msg('Back in the fight',2)}
/* network messages: types starting with z (longer than one letter) are routed here from onMsg */
function zNet(d){const z=zq;if(!z||mode!='Zombies')return;
 switch(d.t){
 case'zqh':if(isHost){const b=bots.find(x=>x.zom&&!x.zp&&x.i==d.i&&x.al);if(b)zDamage(b,d.d,d.h,d.id,d.k,d.m)}break;
 case'zqd':if(isHost)zOpenDoor(d.i,d.id);break;
 case'zqb':if(isHost&&zboxes[d.i]&&zboxes[d.i].st==0)zBoxStart(zboxes[d.i],d.i,d.id);break;
 case'zqe':if(isHost){const o=zboxes[d.i];if(o&&o.st==2&&o.by==d.id)zBoxEnd(o,d.i)}break;
 case'zqr':if(isHost){z.revBuys++;zRevCount(z.revBuys);netSend({t:'zrev',n:z.revBuys})}break;
 case'zqv':if(d.to==myId&&P.dead&&z.down)zRevive();break;
 case'zd':if(!isHost){if(d.by==myId&&zdoors[d.i])z.pts-=zdoors[d.i].d.c;zOpenDoor(d.i,d.by)}break;
 case'zbs':if(!isHost){const o=zboxes[d.i];if(!o)break;if(d.st==1){if(d.by==myId)z.pts-=950;o.st=1;o.t=0;o.cy=0;o.by=d.by}else if(d.st==2){o.item=d.item;o.st=2;o.t=0;o.by=d.by;o.beam.visible=o.lab.visible=true;zSet(o.lab,W[d.item].n,d.item=='RG'?'#ff4a4a':'#7bf08a')}else{o.st=0;o.beam.visible=o.lab.visible=false}}break;
 case'zdn':if(d.id!=myId){const nm=names[d.id]||'A teammate';popup('PLAYER DOWN',nm+' needs a revive!');feed(nm+' is down');beep(260,.25,'sawtooth',.1);setTimeout(()=>beep(200,.3,'sawtooth',.1),220)}break;
 case'zrev':if(!isHost)zRevCount(d.n);break;
 case'zk':if(!isHost&&d.to==myId){z.pts+=d.pts;kills++;wzkill(d.k);killXP(d.h);beep(900,.06,'square',.05)}break;
 case'zb':if(!isHost)zSync(d);break;
 case'zs':if(!isHost)zRoundSync(d);break}}
fixZM();ui();buildMap();
loadSet();
addEventListener('pagehide',saveSet);addEventListener('beforeunload',saveSet);document.addEventListener('visibilitychange',()=>{if(document.hidden)saveSet()});
/* audio: resume the shared context whenever the tab comes back or the browser suspended it */
const audioKick=()=>{try{if(ac&&ac.state!='running')ac.resume().catch(()=>{})}catch(e){}};
document.addEventListener('visibilitychange',audioKick);addEventListener('focus',audioKick);addEventListener('pageshow',audioKick);for(const ev of['pointerdown','keydown','touchstart'])addEventListener(ev,audioKick,true);setInterval(()=>{if(!document.hidden)audioKick()},700);
