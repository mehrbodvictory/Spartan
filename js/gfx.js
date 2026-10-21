/* ===================== gfx.js ===================== */
/* ---------- graphics: textured, merged level geometry, shadows, sky dome, window facades, flickering lights.
   Map boxes are [x,z,w,d,h,y0,colour,kind]: kind is a texture (brick stucco plank concrete asphalt grass shingle tile metal), 'glass' / 'glow', or 'n' for collision only.
   Visual-only extras (map._v and map.deco) are [x,z,w,d,h,y0,colour,shape,texture] with shape b box, e glow box, g glass box, s sphere, c cylinder, k cone. ---------- */
let gfxQ='high',skyM=null,gfxL=[],gt_=0;
try{gfxQ=localStorage.getItem('sdrill-gfx')||(matchMedia('(pointer:coarse)').matches?'low':'high')}catch(e){}
R.shadowMap.enabled=true;R.shadowMap.type=THREE.PCFSoftShadowMap;
sun.shadow.mapSize.set(2048,2048);{const k=sun.shadow.camera;k.left=k.bottom=-46;k.right=k.top=46;k.near=1;k.far=150}sun.shadow.bias=-.0007;S.add(sun.target);
function setGfx(q){gfxQ=q;sun.castShadow=q=='high';try{localStorage.setItem('sdrill-gfx',q)}catch(e){}}setGfx(gfxQ);

/* procedural grey-scale textures, tinted by each box's colour */
const TEXC={},TS={brick:2.4,stucco:3,plank:1.6,concrete:3,asphalt:4,grass:4,shingle:1.8,tile:2,metal:2,sand:3.2,rust:2,cobble:2.2};
function gTex(kind){if(TEXC[kind])return TEXC[kind];const N=128,c=document.createElement('canvas');c.width=c.height=N;const g=c.getContext('2d');let sd=kind.length*7919;const rnd=()=>(sd=(sd*16807)%2147483647)/2147483647,gr=(v,a)=>`rgba(${v|0},${v|0},${v|0},${a})`;
 g.fillStyle=gr(180,1);g.fillRect(0,0,N,N);const sp=(n,lo,hi,a,s)=>{for(let i=0;i<n;i++){g.fillStyle=gr(lo+rnd()*(hi-lo),a);g.fillRect(rnd()*N,rnd()*N,s*(.5+rnd()),s*(.5+rnd()))}};
 if(kind=='brick'){g.fillStyle=gr(120,1);g.fillRect(0,0,N,N);for(let r=0;r<8;r++)for(let k=-1;k<4;k++){g.fillStyle=gr(165+rnd()*60,1);g.fillRect(k*32+(r%2?16:0)+1,r*16+1,30,14)}sp(500,110,230,.18,2)}
 else if(kind=='stucco'||kind=='concrete'){g.fillStyle=gr(kind=='stucco'?200:175,1);g.fillRect(0,0,N,N);sp(900,120,235,.22,2);if(kind=='concrete'){g.strokeStyle=gr(110,.5);for(let i=0;i<3;i++){g.beginPath();let x=rnd()*N,y=rnd()*N;g.moveTo(x,y);for(let j=0;j<5;j++){x+=rnd()*20-10;y+=rnd()*20;g.lineTo(x,y)}g.stroke()}}}
 else if(kind=='plank'){for(let r=0;r<8;r++){g.fillStyle=gr(150+rnd()*70,1);g.fillRect(0,r*16,N,15);g.fillStyle=gr(90,.9);g.fillRect(0,r*16+15,N,1)}for(let i=0;i<260;i++){g.fillStyle=gr(110+rnd()*60,.25);g.fillRect(rnd()*N,rnd()*N,10+rnd()*30,1)}}
 else if(kind=='asphalt'){g.fillStyle=gr(150,1);g.fillRect(0,0,N,N);sp(1400,60,230,.35,1.5)}
 else if(kind=='grass'){g.fillStyle=gr(165,1);g.fillRect(0,0,N,N);for(let i=0;i<1600;i++){g.strokeStyle=gr(110+rnd()*120,.35);const x=rnd()*N,y=rnd()*N;g.beginPath();g.moveTo(x,y);g.lineTo(x+rnd()*3-1.5,y-2-rnd()*4);g.stroke()}}
 else if(kind=='sand'){g.fillStyle=gr(196,1);g.fillRect(0,0,N,N);sp(1500,150,235,.22,1.6);g.strokeStyle=gr(150,.25);for(let i=0;i<9;i++){g.beginPath();let y=rnd()*N;g.moveTo(0,y);for(let x=0;x<=N;x+=16)g.lineTo(x,y+Math.sin(x*.09+i)*3);g.stroke()}}
 else if(kind=='rust'){g.fillStyle=gr(170,1);g.fillRect(0,0,N,N);for(let i=0;i<22;i++){g.fillStyle=gr(120+rnd()*100,.55);g.fillRect(i*6,0,5,N)}sp(700,70,200,.3,2);for(let i=0;i<14;i++){g.fillStyle=gr(70,.5);g.fillRect(rnd()*N,rnd()*N,3+rnd()*9,2+rnd()*6)}}
 else if(kind=='cobble'){g.fillStyle=gr(90,1);g.fillRect(0,0,N,N);for(let r=0;r<8;r++)for(let k=0;k<8;k++){g.fillStyle=gr(150+rnd()*80,1);g.beginPath();g.ellipse(k*16+(r%2?8:0)+8,r*16+8,7,6.5,0,0,7);g.fill()}}
 else if(kind=='shingle'){for(let r=0;r<8;r++)for(let k=-1;k<5;k++){const x=k*28+(r%2?14:0),y=r*16;g.fillStyle=gr(140+rnd()*80,1);g.beginPath();g.moveTo(x,y);g.lineTo(x+26,y);g.lineTo(x+26,y+10);g.quadraticCurveTo(x+13,y+20,x,y+10);g.fill()}}
 else if(kind=='tile'){g.fillStyle=gr(100,1);g.fillRect(0,0,N,N);for(let r=0;r<4;r++)for(let k=0;k<4;k++){g.fillStyle=gr(185+rnd()*50,1);g.fillRect(k*32+1,r*32+1,30,30)}sp(300,150,240,.15,2)}
 else{g.fillStyle=gr(185,1);g.fillRect(0,0,N,N);for(let i=0;i<90;i++){g.fillStyle=gr(140+rnd()*100,.25);g.fillRect(rnd()*N,0,1+rnd()*2,N)}}
 const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;return TEXC[kind]=t}
const GM={};function gMat(kind,col){const k=kind+col;if(GM[k])return GM[k];return GM[k]=kind=='glow'?new THREE.MeshBasicMaterial({color:col}):kind=='glass'?new THREE.MeshLambertMaterial({color:col,emissive:0x0a1626}):kind=='flat'?new THREE.MeshLambertMaterial({color:col}):new THREE.MeshLambertMaterial({color:col,map:gTex(kind)})}
function texKind(w,d,h,y0,col){const c=new THREE.Color(col),lum=c.r*.3+c.g*.59+c.b*.11,t=h-y0,th=Math.min(w,d);
 if(t<.3)return c.g>c.r*1.1&&c.g>c.b*1.1?'grass':lum<.32?'asphalt':'concrete';
 if(y0>=2.5&&t<1.6)return 'shingle';if(h>3.2&&th<2)return 'brick';
 if(c.r>c.g*1.05&&c.g>c.b*1.1&&lum<.55)return 'plank';if(t<=1.8&&th<.5)return 'plank';
 if(h>=2.2)return lum>.5?'stucco':'brick';return 'concrete'}
/* box with tiled UVs, appended to a merged geometry accumulator */
function addBox(a,x,yc,z,sx,sy,sz,ts){const hx=sx/2,hy=sy/2,hz=sz/2,F=[[[0,1,0],[[-hx,hy,-hz],[-hx,hy,hz],[hx,hy,hz],[hx,hy,-hz]],sx,sz],[[0,-1,0],[[-hx,-hy,hz],[-hx,-hy,-hz],[hx,-hy,-hz],[hx,-hy,hz]],sx,sz],[[0,0,1],[[-hx,-hy,hz],[hx,-hy,hz],[hx,hy,hz],[-hx,hy,hz]],sx,sy],[[0,0,-1],[[hx,-hy,-hz],[-hx,-hy,-hz],[-hx,hy,-hz],[hx,hy,-hz]],sx,sy],[[1,0,0],[[hx,-hy,hz],[hx,-hy,-hz],[hx,hy,-hz],[hx,hy,hz]],sz,sy],[[-1,0,0],[[-hx,-hy,-hz],[-hx,-hy,hz],[-hx,hy,hz],[-hx,hy,-hz]],sz,sy]];
 for(const[n,vs,w,h]of F){const b=a.p.length/3;for(let i=0;i<4;i++){a.p.push(x+vs[i][0],yc+vs[i][1],z+vs[i][2]);a.n.push(n[0],n[1],n[2])}a.u.push(0,0,w/ts,0,w/ts,h/ts,0,h/ts);a.i.push(b,b+1,b+2,b,b+2,b+3)}}
const cyC=new THREE.ConeGeometry(1,1,10);
function gfxVis(e,acc){const[x,z,w,d,h,y0=0,col,sh,tex]=e,t=h-y0,yc=(h+y0)/2;
 if(!sh||sh=='b'){const k=tex||texKind(w,d,h,y0,col);addBox(acc(k+col,gMat(k,col)),x,yc,z,w,t,d,TS[k]||2)}
 else if(sh=='e')addBox(acc('glow'+col,gMat('glow',col)),x,yc,z,w,t,d,1);
 else if(sh=='g')addBox(acc('glass'+col,gMat('glass',col)),x,yc,z,w,t,d,1);
 else{const m=new THREE.Mesh(sh=='s'?sg:sh=='c'?cyS:cyC,gMat('flat',col));m.scale.set(w/2,sh=='s'?t/2:t,d/2);m.position.set(x,sh=='s'?yc:y0+t/2,z);m.castShadow=true;m.receiveShadow=true;mapG.add(m)}}
/* windows and a cornice on every tall building of maps flagged facade */
function facade(list,acc){const gl=acc('fw',gMat('glass',0x2a3a4a)),fr=acc('ff',gMat('plank',0xe8e4d8)),co=acc('fc',gMat('concrete',0x55524c));
 for(const[x,z,w,d,h,y0,col,kind]of list){if(kind=='n'||(y0||0)>0||h<2.4||w<3.5||d<3.5||h>14)continue;const rows=h>5.2?2:1;
  for(const sd of[[1,0],[-1,0],[0,1],[0,-1]]){const L=sd[0]?d:w,n=Math.max(1,Math.floor(L/3.2));for(let i=0;i<n;i++){const t=((i+.5)/n-.5)*L;for(let r=0;r<rows;r++){const yy=1.9+r*2.5;if(yy+.7>h-.3)continue;
    const cx=sd[0]?x+sd[0]*(w/2+.03):x+t,cz=sd[1]?z+sd[1]*(d/2+.03):z+t;addBox(gl,cx,yy,cz,sd[0]?.06:1.2,1.4,sd[0]?1.2:.06,1);addBox(fr,cx,yy,cz,sd[0]?.04:1.45,1.65,sd[0]?1.45:.04,1.6)}}}
  addBox(co,x,h+.15,z,w+.5,.3,d+.5,3)}}
function gfxSky(M){const night=M.skyk=='night',c=document.createElement('canvas');c.width=512;c.height=256;const g=c.getContext('2d'),hz='#'+new THREE.Color(M.sky).getHexString(),gr=g.createLinearGradient(0,0,0,256);
 gr.addColorStop(0,night?'#04060c':'#2d63c4');gr.addColorStop(.3,night?'#0a1020':'#5f9ee6');gr.addColorStop(.5,hz);gr.addColorStop(1,hz);g.fillStyle=gr;g.fillRect(0,0,512,256);let sd=11;const rnd=()=>(sd=(sd*16807)%2147483647)/2147483647;
 if(night){for(let i=0;i<220;i++){g.fillStyle=`rgba(255,255,255,${.3+rnd()*.7})`;g.fillRect(rnd()*512,rnd()*120,1+rnd(),1+rnd())}const mg=g.createRadialGradient(360,60,4,360,60,46);mg.addColorStop(0,'rgba(230,240,255,1)');mg.addColorStop(.25,'rgba(200,215,255,.55)');mg.addColorStop(1,'rgba(150,170,230,0)');g.fillStyle=mg;g.fillRect(300,10,120,100)}
 else{const s2=g.createRadialGradient(150,70,2,150,70,70);s2.addColorStop(0,'rgba(255,250,220,1)');s2.addColorStop(.2,'rgba(255,240,190,.6)');s2.addColorStop(1,'rgba(255,230,160,0)');g.fillStyle=s2;g.fillRect(60,0,180,150);for(let i=0;i<16;i++){const x=rnd()*512,y=30+rnd()*90,w=40+rnd()*70;g.fillStyle='rgba(255,255,255,.28)';g.beginPath();g.ellipse(x,y,w,8+rnd()*8,0,0,7);g.fill();g.beginPath();g.ellipse(x+w*.3,y-6,w*.55,7+rnd()*6,0,0,7);g.fill()}}
 skyM=new THREE.Mesh(new THREE.SphereGeometry(180,24,12),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),side:THREE.BackSide,fog:false,depthWrite:false}));skyM.renderOrder=-1;mapG.add(skyM)}
/* build everything visible for a map: ground, sky, merged textured boxes, extras, lights */
function gfxMap(M,list){
 hemi.intensity=M.hemi||.85;hemi.color.setHex(M.hemiC||0xffffff);hemi.groundColor.setHex(M.hemiG||0x445566);sun.intensity=M.sunI==null?.7:M.sunI;sun.color.setHex(M.sunC||0xffffff);
 const gk=M.gt||(M.skyk=='night'?'concrete':'grass'),gs=TS[gk]||4,GS=H*2+(M.open?360:0),gt=gTex(gk).clone();gt.needsUpdate=true;gt.repeat.set(GS/gs,GS/gs);
 const f=new THREE.Mesh(new THREE.PlaneGeometry(GS,GS),new THREE.MeshLambertMaterial({color:M.gr,map:gt}));f.rotation.x=-Math.PI/2;f.receiveShadow=true;mapG.add(f);
 gfxSky(M);
 const accs={},acc=(key,mat)=>accs[key]||(accs[key]={mat,p:[],n:[],u:[],i:[]});
 for(const e of list){const[x,z,w,d,h,y0=0,col,kind]=e;if(kind=='n')continue;const c=col==null?new THREE.Color(M.bc).offsetHSL(0,0,(h-2)*.025).getHex():col;
  if(kind=='glass'||kind=='glow'){addBox(acc(kind+c,gMat(kind,c)),x,(h+y0)/2,z,w,h-y0,d,1);continue}const k=kind||texKind(w,d,h,y0,c);addBox(acc(k+c,gMat(k,c)),x,(h+y0)/2,z,w,h-y0,d,TS[k]||2)}
 for(const e of M._v||[])gfxVis(e,acc);if(M.deco)for(const e of M.deco())gfxVis(e,acc);if(M.facade)facade(list,acc);
 if(!M.open)for(const[x,z,w,d]of[[0,-H-1,2*H+4,2],[0,H+1,2*H+4,2],[-H-1,0,2,2*H],[H+1,0,2,2*H]])addBox(acc('wall'+M.bc,gMat('brick',M.bc)),x,5,z,w,10,d,TS.brick);
 for(const k in accs){const a=accs[k],g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(a.p,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(a.n,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(a.u,2));g.setIndex(a.i);const m=new THREE.Mesh(g,a.mat);m.castShadow=m.receiveShadow=true;mapG.add(m)}
 gfxL=[];for(const[x,y,z,col,I,dist]of M.lights||[]){const l=new THREE.PointLight(col,I,dist);l.position.set(x,y,z);mapG.add(l);gfxL.push({l,b:I,p:Math.random()*6})}}
function gfxTick(dt){gt_+=dt;if(skyM)skyM.position.copy(C.position);const cx=C.position.x,cz=C.position.z;sun.target.position.set(cx,0,cz);sun.position.set(cx+30,50,cz+20);sun.target.updateMatrixWorld();
 for(const o of gfxL)o.l.intensity=o.b*(.84+.1*Math.sin(gt_*(7+o.p)+o.p*9)+.06*Math.sin(gt_*23+o.p)+(Math.random()<.008?-.45:0))}
