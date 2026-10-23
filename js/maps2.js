/* ===================== maps2.js ===================== */
/* ---------- Blockfort, Pillars and Canyon, rebuilt from scratch as detailed, lived-in places (they replace the old simple versions):
   Blockfort: a medieval castle with a keep, gatehouse, barracks, chapel, smithy, stables and market, with a countryside around it.
   Pillars:   a ruined Roman forum with colonnades, an amphitheatre, a temple, baths, a triumphal arch and cypress hills.
   Canyon:    a winding mining gorge with a trestle bridge, a mill, a mine tunnel, a water tower, rail carts, saloon and ledges you can climb. ---------- */
/* multi storey building: walls with windows per floor, door gaps on the ground floor, slabs with a stairwell hole, stairs between floors, roof slab */
function multi(B,o){const{x,z,w,d,fl=2,fh=3.6,t=.45,c,k='stucco',rc,rk,dr={},wn={},roof=1,wlo=1.1,whi=2.4,step=3.4,rnd=Math.random}=o,S=['n','s','w','e'],
 pos=s=>s=='n'?[x,z-d/2+t/2,1,w]:s=='s'?[x,z+d/2-t/2,1,w]:s=='w'?[x-w/2+t/2,z,0,d-2*t]:[x+w/2-t/2,z,0,d-2*t];
 for(let f=0;f<fl;f++){const y0=f*fh;for(const s of S){const[px,pz,hz,len]=pos(s),dd=f==0?(dr[s]||[]).map(([q,wd,ht])=>[q,Math.max(2.4,wd||2.4),0,ht||2.5]):[],ww=[];if(wn[s]!==0){for(let q=-len/2+2;q<len/2-1.3;q+=step){if((dr[s]||[]).some(([a,b])=>f==0&&Math.abs(q-a)<Math.max(2.4,b||2.4)/2+1.1))continue;ww.push([q,1.2,wlo,whi])}}MK.wall(B,hz,px,pz,len,t,y0,y0+fh,[...dd,...ww],c,k)}}
 const stw=1.7,n=Math.ceil(fh/.3),run=n*.55;
 for(let f=1;f<=fl;f++){const y=f*fh,fl_=f-1,north=fl_%2==0,zz=north?z-d/2+t+stw/2+.1:z+d/2-t-stw/2-.1,x0=x-w/2+t+.3;if(f<fl)MK.slab(B,x,z,w-2*t,d-2*t,y,y-.35,rc||c,'concrete',[x0+run/2,zz,run+.4,stw+.3]);else if(roof)B(x,z,w+.3,d+.3,y+.3,y-.1,rc||c,rk||'concrete')}
 for(let f=0;f<fl-1;f++){const north=f%2==0,zz=north?z-d/2+t+stw/2+.1:z+d/2-t-stw/2-.1,x0=x-w/2+t+.3;MK.stairs(B,x0,zz,stw,n,'e',rc||c,'concrete',fh/n,.55,f*fh)}}
const EDGE=(a,x0,z0,x1,z1,h,c,k,t=1.2)=>{const hz=Math.abs(x1-x0)>=Math.abs(z1-z0),L=hz?Math.abs(x1-x0):Math.abs(z1-z0),cx=(x0+x1)/2,cz=(z0+z1)/2;a.push([cx,cz,hz?L:t,hz?t:L,h,0,c,k]);a.push([cx,cz,hz?L:t,hz?t:L,14,0,0,'n'])};
const free_=(a,x,z,m=1)=>!a.some(b=>b[4]>.5&&b[5]<2&&x>b[0]-b[2]/2-m&&x<b[0]+b[2]/2+m&&z>b[1]-b[3]/2-m&&z<b[1]+b[3]/2+m);

/* =============================== BLOCKFORT =============================== */
MAPS.Blockfort={d:'Medieval castle: keep, gatehouse, barracks, chapel, smithy, stables and a market court',H:40,open:1,sky:0x9ec9ea,gr:0x5f7f48,gt:'grass',bc:0x9a958a,hemi:.9,hemiC:0xf4f8ff,hemiG:0x4a5a3a,sunI:.95,sunC:0xfff4dc,fogF:140,
 fb:[[-27,5],[26,0]],zn:[[-21,8],[0,-9],[21,9]],tb:[-35,-30,35,30],inside:(x,z)=>Math.abs(x)<32&&Math.abs(z)<27.5,
 lights:[[-24,2.6,17,0xff7a2a,1.5,16],[18,5,-6,0xffc070,.9,18],[-20,5,-12,0xffc070,.9,18],[0,3.6,26,0xffa040,1.0,14],[0,3.6,-26.5,0xffa040,.8,14],[26,4.5,12,0xffd9a0,.8,14]],
 b(){const a=[],v=MAPS.Blockfort._v,B=(x,z,w,d,h,y0,c,k)=>a.push([x,z,w,d,h,y0||0,c,k]),V=(x,z,w,d,h,y0,c,s,t)=>v.push([x,z,w,d,h,y0||0,c,s||'b',t]),rnd=MK.rnd(3),pick=q=>q[rnd()*q.length|0],
  STN=0x9a958a,DST=0x7a766c,WD=0x6a4a30,RF=[0x8a3a2a,0x6a4a3a,0x5a5a60],COL=[0xb83a2a,0x2a5aa8,0xd8a020,0x3a8a4a,0x7a3a8a];
  const barrel=(x,z)=>{B(x,z,.8,.8,1.1,0,WD,'plank');V(x,z,.85,.85,1.1,0,WD,'c','plank');V(x,z,.9,.9,.1,.3,0x2a2a2a,'c');V(x,z,.9,.9,.1,.8,0x2a2a2a,'c')},
   crate=(x,z,s)=>{B(x,z,s,s,s*.9,0,0x8a6a3a,'plank')},hay=(x,z)=>{B(x,z,1.5,1,.9,0,0xc8a850,'plank');V(x,z,1.6,1.1,.95,0,0xd8b860,'b','plank')},
   torch=(x,z,h=2.4)=>{V(x,z,.12,.12,h,0,WD,'c');V(x,z,.3,.3,h+.5,h,0xff8a30,'e');V(x,z,.15,.15,h+.9,h+.4,0xffd060,'k')},
   banner=(x,z,hz,c,h=4.4)=>{V(x,z,.14,.14,h+.9,0,WD,'c');V(x+(hz?0:.34),z+(hz?.34:0),hz?.9:.06,hz?.06:.9,h,h-2,c,'b')},
   tree=(x,z,s=1)=>{B(x,z,.7,.7,2.4*s,0,0x5a4030,'plank');V(x,z,.8,.8,2.6*s,0,0x5a4030,'c');V(x,z,4*s,4*s,5.4*s,1.8*s,0x3f7a34,'s');V(x+.8,z+.6,3*s,3*s,6*s,3*s,0x4f8a3c,'s')},
   stall=(x,z,c)=>{B(x,z,2.6,1.1,1.0,0,WD,'plank');for(const s of[-1,1])V(x+s*1.2,z-.4,.1,.1,2.4,0,WD,'b');V(x,z-.1,2.9,1.8,2.7,2.35,c,'b');V(x,z,2.2,.9,1.18,1,pick(COL),'b'),V(x-.5,z,.4,.4,1.3,1,0xc83a2a,'s'),V(x+.5,z,.4,.4,1.3,1,0xe0c040,'s')},
   dummy=(x,z)=>{V(x,z,.14,.14,1.8,0,WD,'c');V(x,z,.8,.14,1.5,1.3,WD,'b');V(x,z,.4,.4,2.1,1.7,0xc8b080,'s');B(x,z,.4,.4,1.8,0,WD,'plank')},
   cart=(x,z,hz)=>{B(x,z,hz?2.6:1.6,hz?1.6:2.6,.9,.4,WD,'plank');for(const s of[-1,1])V(x+(hz?0:s*.9),z+(hz?s*.9:0),hz?1:.14,hz?.14:1,1,0,0x3a2a1a,'c');V(x,z,hz?2.4:1.4,hz?1.4:2.4,1.2,.9,0xc8a850,'b','plank')};
  /* ground: cobbled courts, dirt tracks, grass tufts, puddles */
  V(0,0,62,52,.07,0,0x8a8070,'b','cobble');V(0,27.5,8,6,.08,0,0x6a5a46,'b','concrete');V(0,36,6,18,.06,0,0x7a6a50,'b','concrete');V(36,-3,16,6,.06,0,0x7a6a50,'b','concrete');
  for(let i=0;i<30;i++)V((rnd()-.5)*58,(rnd()-.5)*48,.8+rnd()*2,.8+rnd()*2,.08,0,pick([0x4a6a3a,0x5a7a40]),'b','grass');for(let i=0;i<8;i++)V((rnd()-.5)*50,(rnd()-.5)*40,1.5+rnd(),1+rnd(),.075,0,0x4a5a68,'s');
  /* curtain wall: stone, 4 m high, with four gates; crenellations, buttresses and a wall walk on the inside of the north and west walls */
  const wallLine=(x0,z0,x1,z1,gaps)=>{const hz=z0==z1,L=hz?x1-x0:z1-z0,cx=(x0+x1)/2,cz=(z0+z1)/2;MK.wall(B,hz,cx,cz,L,1.4,0,4.2,gaps.map(g=>[g[0],g[1],0,g[2]||4.2]),STN,'brick');
   B(cx,cz,hz?L:1.4,hz?1.4:L,14,0,0,'n');for(let q=-L/2+1;q<L/2;q+=2.2){if(gaps.some(g=>Math.abs(q-g[0])<g[1]/2+.6))continue;V(hz?cx+q:cx,hz?cz:cz+q,hz?1.1:1.5,hz?1.5:1.1,5.0,4.2,STN,'b','brick')}for(let q=-L/2+3;q<L/2;q+=7){if(gaps.some(g=>Math.abs(q-g[0])<g[1]/2+1.2))continue;V(hz?cx+q:cx,hz?cz:cz+q,hz?1.2:2.4,hz?2.4:1.2,3.6,0,DST,'b','brick')}};
  wallLine(-33,-28,33,-28,[[-13,2.6],[10,0.01]]);wallLine(-33,28,33,28,[[0,6]]);wallLine(-33,-28,-33,28,[[11.5,2.8]]);wallLine(33,-28,33,28,[[0,5.2]]);
  /* gate arches and gate towers */
  B(0,28,6.4,1.4,8.4,5.2,STN,'brick');for(const s of[-1,1]){multi(B,{x:s*6.6,z:25.8,w:5,d:5,fl:2,fh:4,c:STN,k:'brick',rc:DST,dr:{n:[[0,1.8,2.5]]},wn:{s:0,w:0,e:0},rnd});V(s*3.2,28.9,.3,.3,4.4,1.1,0x3a3a3e,'b','metal')}for(let i=-3;i<=3;i++)V(i*.8,28.8,.1,.1,5,0,0x2a2a2e,'b');V(0,28.8,6,.1,5.2,5,0x2a2a2e,'b');
  B(33,0,1.4,5.4,7.6,4.6,STN,'brick');for(const s of[-1,1])multi(B,{x:30.6,z:s*5.8,w:5,d:5,fl:2,fh:4,c:STN,k:'brick',rc:DST,dr:{w:[[0,1.8,2.5]]},wn:{e:0,n:0,s:0},rnd});
  /* corner towers (two floors, stair, walkable roof with crenels) */
  for(const sx of[-1,1])for(const sz of[-1,1]){const x=sx*31,z=sz*26;multi(B,{x,z,w:7,d:7,fl:2,fh:4.2,c:DST,k:'brick',rc:STN,dr:{[sz>0?'n':'s']:[[0,1.8,2.5]]},wn:{},rnd});for(let i=0;i<8;i++)V(x+(i<4?-3.4+i*2.27:(i%2?3.4:-3.4)),z+(i<4?(i%2?3.4:-3.4):-3.4+(i-4)*2.27),1,1,9.4,8.7,DST,'b','brick');V(x,z,.4,.4,12,8.7,WD,'c');V(x+.8,z,1.5,.06,11.8,10.6,COL[(sx+sz+2)%5],'b')}
  /* wall walks: platform behind the north and west walls, reached by stairs at the corners */
  B(-4,-26,50,2.6,3.4,3.0,0x8a7a5a,'plank');MK.stairs(B,-29,-26,1.8,10,'e',STN,'concrete',.3,.6,0);B(-31.4,-8,2.6,36,3.4,3.0,0x8a7a5a,'plank');MK.stairs(B,-31.4,17,1.8,10,'n',STN,'concrete',.3,.6,0);
  /* keep: raised on a stepped plinth, three floors, battlements */
  const kx=20,kz=-14;for(let i=0;i<3;i++)B(kx,kz,22-i*1.4,18-i*1.4,.28*(i+1),0,STN,'concrete');multi(B,{x:kx,z:kz,w:15,d:12,fl:3,fh:4,c:STN,k:'brick',rc:DST,dr:{s:[[-2,2.8,3.4],[4,1.8,2.5]],w:[[0,1.8,2.5]]},wn:{},wlo:1.6,whi:3,rnd});
  for(let i=0;i<14;i++)V(kx-7.5+i*1.15,kz-6,.9,.5,13.8,13.1,DST,'b','brick');for(let i=0;i<14;i++)V(kx-7.5+i*1.15,kz+6,.9,.5,13.8,13.1,DST,'b','brick');V(kx,kz,3,.2,15,12,0xb83a2a,'b');banner(kx+8,kz+3,0,0xb83a2a,10);banner(kx-8,kz-3,0,0x2a5aa8,10);B(kx-2,kz,2,5,1.1,0,WD,'plank');B(kx+3,kz+1,1.4,1.4,1.0,0,WD,'plank');
  /* barracks (west), second barracks, great hall with a long table */
  multi(B,{x:-21,z:-17,w:14,d:8,fl:2,fh:3.6,c:0xa89a7a,k:'stucco',rc:RF[0],rk:'shingle',dr:{s:[[-3,1.8,2.5],[3,1.8,2.5]]},rnd});multi(B,{x:-21,z:-6,w:14,d:7,fl:2,fh:3.6,c:0xa8987a,k:'stucco',rc:RF[1],rk:'shingle',dr:{n:[[-2,1.8,2.5]],s:[[3,1.8,2.5]]},rnd});
  for(let i=0;i<4;i++){B(-25+i*3.3,-17,.9,2,.6,0,WD,'plank')}B(-21,-6,8,1.1,.95,0,WD,'plank');V(-21,-6,8.4,1.4,.1,.95,0x6a5a48,'b','plank');
  /* chapel with bell cote */
  multi(B,{x:22,z:14,w:9,d:13,fl:1,fh:6.4,c:0xb0a890,k:'stucco',rc:RF[2],rk:'shingle',dr:{n:[[0,2.4,3.6]]},wlo:2.2,whi:5,rnd});B(22,19.5,1.2,.7,1.0,0,STN,'concrete');for(let i=0;i<3;i++){B(19.4,15+i*1.6,1.6,.6,.8,0,WD,'plank');B(24.6,15+i*1.6,1.6,.6,.8,0,WD,'plank')}V(22,8,1,1,10,7.6,STN,'b','brick');V(22,8,.5,.5,9.6,8.4,0xc8a030,'s');V(22,7.4,.3,.3,12,10,0xc0c0c0,'b');
  /* smithy with a glowing forge, open front, anvil and weapon racks */
  B(-24,17,9,.4,3,0,WD,'plank');B(-28.3,19.5,.4,5.6,3,0,WD,'plank');B(-19.7,19.5,.4,5.6,3,0,WD,'plank');B(-24,19.5,9.4,6.4,3.4,3,RF[0],'shingle');B(-27,20.5,2.2,1.6,1.1,0,0x5a5650,'brick');V(-27,20.5,1.4,.8,1.1,1.0,0xff5a20,'e');B(-23,20,.9,.6,.9,0,0x2a2a2e,'metal');B(-21,21,.8,.8,.7,0,0x4a4a4a,'concrete');V(-24,17.3,.1,2,2.4,.8,0x6a6a70,'b','metal');
  /* stables: roof on posts, stall dividers and hay */
  B(-5,18.5,15,5.6,3.6,3.2,RF[1],'shingle');for(let i=0;i<6;i++){B(-11.5+i*2.5,16,.3,.3,3.2,0,WD,'plank');B(-11.5+i*2.5,21,.3,.3,3.2,0,WD,'plank')}for(let i=1;i<5;i++)B(-11.5+i*2.5,19.8,.12,3.2,1.2,0,WD,'plank');B(-5,22,15,.3,1.6,0,WD,'plank');hay(-9,20.6);hay(-4,20.8);hay(1,20.4);
  /* market court: stalls, a well, carts, barrels, hay, a fountain-plinth in the centre */
  const wx=0,wz=-4;for(const s of[-1,1]){B(wx+s*1.6,wz,.5,3.4,1.0,0,STN,'concrete');B(wx,wz+s*1.6,3.4,.5,1.0,0,STN,'concrete')}V(wx,wz,2.6,2.6,.1,.1,0x2a4a68,'b');V(wx-1.6,wz-1.6,.2,.2,3.4,0,WD,'b');V(wx+1.6,wz-1.6,.2,.2,3.4,0,WD,'b');V(wx,wz-1.6,3.6,.2,3.6,3.2,WD,'b');V(wx,wz,3.8,2.6,3.9,3.5,RF[0],'b','shingle');
  for(let i=0;i<4;i++)B(wx,wz,9-i*1.4,9-i*1.4,.2*(i+1),0,0x8a8576,'concrete');
  stall(-8,2,COL[0]);stall(-4,5,COL[1]);stall(4,5,COL[2]);stall(8,2,COL[3]);stall(-9,-8,COL[4]);stall(9,-8,COL[1]);cart(-12,3,1);cart(12,4,0);cart(-3,-12,1);
  for(const[x,z]of[[-12,-11],[12,-12],[-6,9],[6,9],[-2,-12.8],[3.4,-12],[26,6],[-26,10],[-14,12]])barrel(x,z);for(const[x,z,s]of[[-13,9,1.2],[13,9.6,1.3],[28,-12,1.4],[-28,-12,1.2],[3,13,1.4],[-8,-12,1.1]])crate(x,z,s);for(const[x,z]of[[-12,6.5],[-13.5,6],[10,-10],[11.5,-10.6],[27,3],[-4.5,22.5]])hay(x,z);
  dummy(-12,-22);dummy(-9,-22);dummy(-6,-22);for(const x of[-14,-10,-6]){B(x,-26,1.6,.5,1.8,0,0xc8a850,'plank');V(x,-25.7,1.4,.08,1.7,.4,0xc83a2a,'c')}
  for(const[x,z]of[[-8,9],[8,9],[-16,-1],[16,-1],[0,-17],[11,-3],[-11,-4],[-27,-24],[27,24],[5,22],[-5,14]])torch(x,z);banner(-6,-6,1,COL[0]);banner(6,-6,1,COL[1]);banner(-3,26.6,1,COL[0],5);banner(3,26.6,1,COL[1],5);banner(-27,0,0,COL[3]);banner(27,-12,0,COL[4]);
  for(const[x,z,s]of[[-27,12,1],[-30,-14,1.1],[27,22,1],[10,-24,.9],[-14,24,1],[28,-22,1]])tree(x,z,s);
  /* a moat-like ditch outside the wall is just visual (grass banks); a few cats on walls would be cute but cost polys */
  return a},
 deco(){const o=[],rnd=MK.rnd(61),V=(x,z,w,d,h,y0,c,s,t)=>o.push([x,z,w,d,h,y0||0,c,s||'b',t]),pick=q=>q[rnd()*q.length|0];
  /* countryside: rolling hills, a forest in rings, fields, a river with a bridge, a windmill, a camp with siege engines, distant mountains */
  for(let i=0;i<90;i++){const q=rnd()*6.283,d=40+rnd()*100,x=Math.cos(q)*d*1.15,z=Math.sin(q)*d;if(Math.abs(x)<36&&Math.abs(z)<32)continue;const w=14+rnd()*34,h=3+rnd()*9;V(x,z,w,w*(.6+rnd()*.6),h*.6,-h*.5,pick([0x5f8a48,0x6a9a50,0x557a40,0x7a9a58]),'s','grass')}
  for(let i=0;i<10;i++){const q=i/10*6.283+.3;V(Math.cos(q)*140,Math.sin(q)*130,110,70,42,-10,pick([0x6a7a8a,0x7a8a9a,0x5a6a7a]),'s')}
  for(let i=0;i<150;i++){const q=rnd()*6.283,d=40+rnd()*60,x=Math.cos(q)*d*1.1,z=Math.sin(q)*d;if(Math.abs(x)<35&&Math.abs(z)<31)continue;if(x>-6&&x<6&&z>30)continue;const s=.8+rnd()*1.2;V(x,z,.5*s,.5*s,2*s,0,0x5a4030,'c');V(x,z,3.4*s,3.4*s,6*s,1.4*s,pick([0x2f6a2c,0x3f7a34,0x2a5a2a]),'k')}
  for(let i=0;i<12;i++){const x=-70+i*14,z=-52+((i*7)%3)*3;V(x,z,12,16,.12,0,pick([0xc8b050,0x8aa04a,0x6a8a3a]),'b','grass');for(let k=0;k<6;k++)V(x-5+k*2,z,.15,15,.5,0,0xb89a3a,'b')}
  V(0,52,8,50,.1,0,0x7a6a50,'b','concrete');V(-60,12,10,150,.14,-.02,0x3a6a98,'b');V(-60,12,10.3,150,.1,0,0x6a8aa8,'g');for(let i=0;i<4;i++)V(-60,6+i*1.2,14,1.8,1.6+.4,1.2,0x7a7a72,'b','concrete');V(-60,2,14,.6,2.2,1.5,0x6a4a30,'b','plank');
  V(48,32,.9,.9,12,0,0x8a7a60,'c');V(48,32,5,5,10,0,0xcaba98,'k');for(let k=0;k<4;k++){const q=k*1.5708;V(48+Math.cos(q)*4,32,.5,8,16,8,0xe8dcc0,'b');V(48,32+Math.sin(q)*4,8,.5,16,8.2,0xe8dcc0,'b')}
  for(let i=0;i<7;i++){const x=-58+i*3.4,z=-42+(i%2)*3;V(x,z,3.2,3.2,2.6,0,pick([0xd8d0b8,0xb8a888,0xc8483a]),'b');V(x,z,3.4,3.4,3.8,2.6,pick([0xb83a2a,0x2a5aa8]),'k')}V(-52,-48,6,3,3,.6,0x6a4a30,'b','plank');V(-52,-48,.4,.4,6,3,0x6a4a30,'c');V(-54,-48,7,.4,6.4,5.8,0x6a4a30,'b','plank');V(-48,-47,4,2,.6,.3,0x6a4a30,'b','plank');
  for(let i=0;i<14;i++){V(-38+i*5.6,-33,2.6,2,.5,0,0x6a6a62,'s');V(-38+i*5.6,33,2.4,2,.5,0,0x6a6a62,'s')}
  for(let i=-6;i<=6;i++){V(i*5.5,-34.6,3.2,1.3,4.2,0,0x6a655c,'b','brick');V(i*5.5,34.6,3.2,1.3,4.2,0,0x6a655c,'b','brick')}for(let i=-5;i<=5;i++){V(-37,i*5.5,1.3,3.2,4.2,0,0x6a655c,'b','brick');V(37,i*5.5,1.3,3.2,4.2,0,0x6a655c,'b','brick')}
  return o}};

/* =============================== PILLARS =============================== */
MAPS.Pillars={d:'Ruined Roman forum: colonnades, amphitheatre, temple, baths and a triumphal arch',H:44,open:1,sky:0xa8cdee,gr:0x93885e,gt:'cobble',bc:0xe0d9c6,hemi:1,hemiC:0xfff6e4,hemiG:0x8a7a52,sunI:1,sunC:0xfff0d0,fogF:150,
 fb:[[-31,0],[31,0]],zn:[[-24,-2],[0,12],[24,3]],tb:[-38,-34,38,34],inside:(x,z)=>Math.abs(x)<36&&Math.abs(z)<32,
 lights:[[0,6,-2,0xffe8c0,.5,40]],
 b(){const a=[],v=MAPS.Pillars._v,B=(x,z,w,d,h,y0,c,k)=>a.push([x,z,w,d,h,y0||0,c,k]),V=(x,z,w,d,h,y0,c,s,t)=>v.push([x,z,w,d,h,y0||0,c,s||'b',t]),rnd=MK.rnd(9),pick=q=>q[rnd()*q.length|0],
  MAR=0xe4ddcb,DM=0xc9c0a8,OLD=0xb0a68c,BRK=0x9a5a40,GRS=0x5a7a3a,PINK=0xd8a89a;
  const col=(x,z,h,full=1,w=1.7)=>{B(x,z,w+.5,w+.5,.5,0,DM,'concrete');B(x,z,w,w,h,.5,MAR,'concrete');V(x,z,w+.2,w+.2,h,.5,MAR,'c','concrete');for(let i=0;i<3;i++)V(x,z,w+.14,w+.14,h*.2+i*h*.3,h*.1+i*h*.3,0xc8c0a8,'c');if(full){B(x,z,w+.7,w+.7,h+.7,h,DM,'concrete');V(x,z,w+1,w+1,h+.9,h+.4,MAR,'b','concrete')}else{V(x+.4,z+.2,w*.8,w*.7,.5+rnd()*.5,0,DM,'s')}},
   beam=(x,z,hz,L,y)=>{B(x,z,hz?L:1.5,hz?1.5:L,y+1,y,MAR,'concrete');V(x,z,hz?L:1.6,hz?1.6:L,y+1.25,y+.9,DM,'b','concrete')},
   fallen=(x,z,hz,L)=>{B(x,z,hz?L:1.6,hz?1.6:L,1.45,0,MAR,'concrete');V(x,z,hz?L:1.5,hz?1.5:L,1.5,.1,MAR,'c','concrete');V(x+(hz?L/2:0),z+(hz?0:L/2),1.8,1.8,.4,0,DM,'b')},
   plinth=(x,z,s,h,c)=>{B(x,z,s,s,h,0,DM,'concrete');V(x,z,s*.6,s*.6,h+2.4,h,c||MAR,'s','concrete');V(x,z,s*.3,s*.3,h+3.1,h+1.8,c||MAR,'s')},
   cypress=(x,z,s=1)=>{B(x,z,.8,.8,2*s,0,0x4a3a2a,'plank');V(x,z,2.2*s,2.2*s,8*s,.8,0x2a5a2e,'k')},olive=(x,z)=>{B(x,z,.7,.7,2.2,0,0x6a5a42,'plank');V(x,z,.8,.8,2.4,0,0x6a5a42,'c');V(x,z,4,4,4.4,2,0x6a8a5a,'s');V(x+.9,z-.5,3,3,4.8,2.6,0x7a9a68,'s')},
   steps=(x,z,w,d,n,dir,c)=>MK.stairs(B,x,z,dir=='e'||dir=='w'?d:w,n,dir,c||MAR,'concrete',.3,.7),
   ivy=(x,z,hz,L,h)=>{for(let i=0;i<Math.max(3,L/1.1|0);i++)V(hz?x-L/2+rnd()*L:x,hz?z:z-L/2+rnd()*L,hz?.6+rnd():.12,hz?.12:.6+rnd(),.6+rnd()*h,0,pick([GRS,0x3a5a2a,0x6a8a3a]),'b','grass')};
  /* ground: tile mosaics, grass in the cracks, fallen leaves, a dry river bed of pale sand to the south */
  V(0,0,76,64,.07,0,0xa89c80,'b','cobble');for(let i=0;i<34;i++)V((rnd()-.5)*72,(rnd()-.5)*60,2+rnd()*5,1.5+rnd()*4,.09,0,pick([GRS,0x6a8a3a,0x4a6a2e]),'b','grass');V(0,0,60,6.4,.1,0,0xc9bf9e,'b','concrete');V(0,0,8,60,.1,0,0xc9bf9e,'b','concrete');
  for(let i=0;i<20;i++)V((rnd()-.5)*60,(rnd()-.5)*50,2,2,.11,0,pick([0x8a4a3a,0x4a6a8a,0xc8b080]),'b','concrete');
  /* the avenue: two colonnades with a stone entablature on top (walk beneath), some columns broken */
  for(let i=-5;i<=5;i++)for(const s of[-1,1]){const x=i*5.8,br=(i*7+s*3)%11==0;col(x,s*9.5,br?2.4+rnd()*1.5:8,!br);if(!br&&i<5)beam(x+2.9,s*9.5,1,4.1,8.7)}
  /* amphitheatre in the middle: stepped rings around a raised stage, with four stair ramps and a ring of pillars */
  for(let i=0;i<5;i++){const r=20-i*2.6;MK.wall(B,1,0,-r*.72,r*2*.9,1.2,0,.35+i*.3,[[0,4,0,5]],OLD,'concrete');MK.wall(B,1,0,r*.72,r*2*.9,1.2,0,.35+i*.3,[[0,4,0,5]],OLD,'concrete')}
  for(let i=0;i<3;i++)B(0,-2,16-i*2.2,10-i*1.4,.28*(i+1),0,0xd0c6aa,'concrete');B(0,-2,10,5,1.3,.3,0xe0d6ba,'concrete');
  for(const[x,z]of[[-4.4,-4.2],[4.4,-4.2],[-4.4,.2],[4.4,.2]])col(x,z,4.6,1,1.2);V(0,-2,8,3.6,1.34,1.3,0xb0302a,'b');plinth(0,3.4,2.2,.8,0xc8b078);
  /* temple to the north: stylobate steps, six front columns, cella with a door, fallen roof, statue inside */
  const tx=-4,tz=-26;for(let i=0;i<3;i++)B(tx,tz,22-i*1.4,13-i*1.2,.3*(i+1),0,MAR,'concrete');MK.room(B,{x:tx,z:tz-1,w:11,d:9,h:7.4,t:.7,y0:.9,c:MAR,k:'concrete',roof:0,dr:{s:[[0,3,4.6]]},wn:{}});
  for(let i=0;i<6;i++)col(tx-8.8+i*3.52,tz+4.7,i==2?3.6:8,i!=2);for(const s of[-1,1])for(let i=0;i<2;i++)col(tx+s*9.8,tz-1+i*5,8,1);beam(tx,tz+4.7,1,19,9.7);B(tx,tz-1,5,3,8.9,8.3,DM,'concrete');plinth(tx,tz-3,2.6,.9+.4,0xe8e0cc);fallen(tx+6,tz+8.5,1,6);fallen(tx-9,tz+10.6,1,4);V(tx,tz+6,19,.5,11.8,9.7,DM,'b','concrete');
  /* baths in the south: sunken pool shown as a rim and water, arcaded hall on both sides */
  const bx=3,bz=24;B(bx,bz,15,.7,1,0,MAR,'concrete');B(bx,bz+6.4,15,.7,1,0,MAR,'concrete');B(bx-7.2,bz+3.2,.7,6.4,1,0,MAR,'concrete');B(bx+7.2,bz+3.2,.7,6.4,1,0,MAR,'concrete');V(bx,bz+3.2,14,5.8,.7,.1,0x4a9ab8,'g');
  for(const s of[-1,1]){MK.wall(B,0,bx+s*11,bz+3,16,.9,0,5.6,[[-4.6,2.8,0,3.6],[0,2.8,0,3.6],[4.6,2.8,0,3.6]],PINK,'stucco');B(bx+s*11,bz+3,1.2,16.4,6.1,5.6,DM,'concrete');for(let i=0;i<3;i++)V(bx+s*(11+.5),bz-2.3+i*4.6+3,.2,2.6,4.8,3.4,0x2a2a2a,'b')}
  B(bx,bz+9,28,.9,5.6,0,PINK,'stucco');for(let i=0;i<5;i++)V(bx-10+i*5,bz+8.4,2.4,.2,3.6,.1,0x2a2a2a,'b');
  /* stoas: long covered halls east and west with doorways */
  for(const s of[-1,1])MK.room(B,{x:s*28,z:-18,w:6,d:20,h:5.4,t:.6,c:OLD,k:'concrete',rc:BRK,rk:'shingle',dr:{w:[[-5,2.6,3.6],[5,2.6,3.6]],e:[[-5,2.6,3.6],[5,2.6,3.6]],n:[[0,2.4,3]]},wn:{[s>0?'e':'w']:[[-6,1.4],[0,1.4],[6,1.4]]}});
  /* triumphal arch at the east end of the avenue: two piers and a lintel high enough to walk under */
  for(const s of[-1,1]){B(33.5,s*3.6,5,3.2,10,0,MAR,'concrete');V(33.5,s*3.6,5.4,3.6,10.2,7,DM,'b','concrete')}B(33.5,0,5,10.4,11.4,7.4,MAR,'concrete');V(33.5,0,5.4,10.8,12,11.2,DM,'b','concrete');V(33.5,0,2,3,13.6,12,0xc8a24a,'b');for(const s of[-1,1])steps(30.4,s*3.6,1,3.2,3,'e');
  /* statues on plinths, fountains, fallen columns, broken walls, benches of stone, cypress and olive groves */
  for(const[x,z]of[[-14,-3],[14,-3],[-14,3],[14,3],[-26,16],[26,16],[-24,-30],[18,-30]])plinth(x,z,2.4,1.3);
  for(const[x,z]of[[-20,-1],[20,2]]){B(x,z,4.4,4.4,.9,0,MAR,'concrete');V(x,z,3.6,3.6,.3,.7,0x4a9ab8,'g');B(x,z,.8,.8,2.8,0,MAR,'concrete')}
  fallen(-14,13,1,6);fallen(-23,-12,0,6.5);fallen(12,-13,1,5.5);fallen(25,12,0,6);fallen(-30,9,1,5);fallen(8,12,0,5);fallen(19,23,1,6);
  for(const[x,z,w,d]of[[-12,17,5,.8],[-29,-6,.8,6],[28,9,.8,7],[15,-11,5,.8],[-20,13,.8,5],[-8,-12,.8,4.5],[22,-8,.8,4]]){B(x,z,w,d,1.2+rnd()*1.2,0,OLD,'concrete');ivy(x,z,w>d,Math.max(w,d),1.8)}
  for(const[x,z,h]of[[-16,10.5,1],[16,10.5,1],[-16,-10.5,1],[16,-10.5,1],[-8,16,0],[8,18,0]])B(x,z,h?2.2:.6,h?.6:2.2,.55,0,MAR,'concrete');
  for(const[x,z]of[[-32,-25],[-32,-12],[-32,24],[32,-26],[32,22],[10,-33],[-14,-33],[-34,6],[34,10],[-18,28],[24,28]])cypress(x,z,1+rnd()*.4);for(const[x,z]of[[-23,24],[-27,22],[-26,28],[24,-27],[28,-24],[22,-30],[-10,29],[14,30]])olive(x,z);
  /* the edge of the site: an old low wall covered in ivy with an invisible barrier above it */
  EDGE(a,-37,-33,37,-33,2.2,OLD,'concrete',1.1);EDGE(a,-37,33,37,33,2.2,OLD,'concrete',1.1);EDGE(a,-37,-33,-37,33,2.2,OLD,'concrete',1.1);EDGE(a,37,-33,37,33,2.2,OLD,'concrete',1.1);
  for(let i=-18;i<=18;i++){ivy(i*2,-33,1,2,2);ivy(i*2,33,1,2,2)}for(let i=-15;i<=15;i++){ivy(-37,i*2.1,0,2,2);ivy(37,i*2.1,0,2,2)}for(let i=-17;i<=17;i++){V(i*2.2,-33,1.3,1.4,2.7,2.2,OLD,'b','concrete');V(i*2.2,33,1.3,1.4,2.7,2.2,OLD,'b','concrete')}
  return a},
 deco(){const o=[],rnd=MK.rnd(77),V=(x,z,w,d,h,y0,c,s,t)=>o.push([x,z,w,d,h,y0||0,c,s||'b',t]),pick=q=>q[rnd()*q.length|0];
  /* hills with terraces and vineyards, an aqueduct, villas with red roofs, cypress rows, a coast line to the south and mountains */
  for(let i=0;i<100;i++){const q=rnd()*6.283,d=44+rnd()*90,x=Math.cos(q)*d*1.15,z=Math.sin(q)*d;if(Math.abs(x)<38&&Math.abs(z)<35)continue;const w=14+rnd()*34,h=3+rnd()*10;V(x,z,w,w*(.6+rnd()*.7),h*.6,-h*.5,pick([0x8a9a5a,0x7a8a50,0x9aa868,0x6a7a48]),'s','grass')}
  for(let i=0;i<10;i++){const q=i/10*6.283+.1;V(Math.cos(q)*150,Math.sin(q)*140,110,80,50,-12,pick([0x8a8a9a,0x9a9aaa,0x7a7a8a]),'s')}
  for(let i=-8;i<=8;i++){V(i*7,-62,2.6,2.6,14,0,0xcbbf9e,'b','concrete');if(i<8){V(i*7+3.5,-62,4.4,2.2,12,0,0x1a1a1a,'b');V(i*7+3.5,-62,7,2.8,15.6,12.2,0xcbbf9e,'b','concrete')}V(i*7,-62,2.8,3,15.8,14,0xdacdac,'b','concrete')}
  for(let i=0;i<16;i++){const x=-70+i*9.4,z=48+rnd()*10;V(x,z,6,6,4,0,pick([0xe8dcc0,0xd8c8a8]),'b','stucco');V(x,z,6.6,6.6,5.6,4,0xb8503a,'k');for(let k=0;k<3;k++)V(x-2+k*2,z+3.05,.9,.1,3,1.4,0x2a3a4a,'g')}
  for(let i=0;i<8;i++){const x=-80+i*21;for(let k=0;k<18;k++)V(x+k*1.1,-48,.8,.8,3.4,0,0x3a5a2e,'c');V(x+10,-42,22,4,.12,0,pick([0x8aa04a,0x6a8a3a]),'b','grass');for(let k=0;k<10;k++)V(x+k*2.2,-42,.15,4,.5,0,0x7a6a3a,'b')}
  V(0,100,300,50,.2,-.1,0x3a7aa8,'b');V(0,100,300,50,.1,0,0x6aa8d0,'g');for(let i=0;i<9;i++)V(-60+i*18,86+(i%2)*3,9,3,2,0,0x8a7a62,'s');
  for(let i=0;i<60;i++){const q=rnd()*6.283,d=40+rnd()*60,x=Math.cos(q)*d*1.15,z=Math.sin(q)*d;if(Math.abs(x)<38&&Math.abs(z)<35)continue;V(x,z,2.2,2.2,8,.8,0x2a5a2e,'k');V(x,z,.7,.7,1,0,0x4a3a2a,'c')}
  for(let i=0;i<12;i++){const x=(rnd()-.5)*120,z=(rnd()-.5)*110;if(Math.abs(x)<38&&Math.abs(z)<35)continue;V(x,z,1.7,1.7,7,.4,0xe4ddcb,'c','concrete');V(x,z,2.4,2.4,7.6,7,0xc9c0a8,'b','concrete')}
  return o}};

/* =============================== CANYON =============================== */
MAPS.Canyon={d:'Mining gorge: trestle bridge, mill, mine tunnel, water tower, rail carts and climbable ledges',H:44,open:1,sky:0xe0a070,gr:0xb4693e,gt:'sand',bc:0xb9774c,hemi:.85,hemiC:0xffc8a0,hemiG:0x8a4a3a,sunI:1.05,sunC:0xffb070,fogF:150,
 fb:[[-33,8],[33,-6]],zn:[[-26,6],[0,-2],[27,-4]],tb:[-44,-44,44,44],inside:(x,z)=>Math.abs(x)<40&&Math.abs(z)<40,
 lights:[[30,3.6,-18,0xffa040,1.2,16],[-6,3.2,-12,0xffd9a0,.9,16],[22,2.5,-30,0xffa040,1,14],[-20,3,16,0xffc070,.9,16]],
 b(){const a=[],v=MAPS.Canyon._v,B=(x,z,w,d,h,y0,c,k)=>a.push([x,z,w,d,h,y0||0,c,k]),V=(x,z,w,d,h,y0,c,s,t)=>v.push([x,z,w,d,h,y0||0,c,s||'b',t]),rnd=MK.rnd(17),pick=q=>q[rnd()*q.length|0],
  RK=[0xb9774c,0xa8683e,0xc98858,0x9a5a38,0xd09868],WD=0x7a5a3a,WDL=0x9a7a52,MET=0x6a6a62,RS=0x8a4a2a;
  const rock=(x,z,w,d,h,y0)=>{B(x,z,w,d,h,y0||0,pick(RK),'sand');const s=Math.min(w,d);for(let i=0;i<3;i++)V(x+(rnd()-.5)*w*.8,z+(rnd()-.5)*d*.8,s*.5,s*.4,h+.2+rnd()*.5,h-.4,pick(RK),'s','sand')},
   /* a terraced cliff: n ledges stepping away from the canyon floor, each one .3 up from the last for the first few so they can be climbed */
   cliff=(x0,z0,len,hz,dir,steps)=>{for(let i=0;i<steps.length;i++){const[off,wd,h]=steps[i],px=hz?x0+len/2:x0+dir*(off+wd/2),pz=hz?z0+dir*(off+wd/2):z0+len/2;rock(px,pz,hz?len:wd,hz?wd:len,h)}},
   cactus=(x,z)=>{B(x,z,.6,.6,2.4,0,0x4a7a3a,'plank');V(x,z,.7,.7,2.5,0,0x4a7a3a,'c');V(x-.6,z,.6,.3,1.9,1.5,0x4a7a3a,'c');V(x+.6,z,.6,.3,1.5,1.1,0x4a7a3a,'c')},
   boulder=(x,z,r)=>{B(x,z,r,r,r*.7,0,pick(RK),'sand');V(x,z,r*1.1,r*1.05,r*.8,0,pick(RK),'s','sand')},
   barrel=(x,z,c)=>{B(x,z,.8,.8,1.1,0,c||WD,'plank');V(x,z,.85,.85,1.1,0,c||WD,'c','plank');V(x,z,.9,.9,.1,.5,0x2a2a2a,'c')},crate=(x,z,s)=>B(x,z,s,s,s*.9,0,0x9a7a4a,'plank'),
   dead=(x,z)=>{B(x,z,.5,.5,2.6,0,0x5a4a3a,'plank');V(x,z,.5,.5,3,0,0x5a4a3a,'c');for(let i=0;i<4;i++){const q=i*1.6+rnd();V(x+Math.cos(q)*.8,z+Math.sin(q)*.8,1.8,.12,2.6+rnd()*1.2,2.2+rnd(),0x4a3a2a,'b')}},
   cart=(x,z,hz,full)=>{B(x,z,hz?2.6:1.5,hz?1.5:2.6,1.15,.3,0x5a5a60,'metal');V(x,z,hz?2.7:1.6,hz?1.6:2.7,1.2,1.0,0x3a3a3e,'b','metal');if(full)V(x,z,hz?2.3:1.2,hz?1.2:2.3,1.5,1.1,0x2a2a2e,'s');for(const s of[-1,1])V(x+(hz?s*.9:0),z+(hz?0:s*.9),.5,.5,.5,0,0x1b1b1c,'c')},
   shack=(x,z,w,d,fl,dr)=>multi(B,{x,z,w,d,fl,fh:3.4,c:WDL,k:'plank',rc:0x6a4a30,rk:'plank',dr,rnd,step:3,wlo:1.1,whi:2.2});
  /* ground: wheel ruts, railway, scrub, dry riverbed in pale sand */
  V(0,0,92,92,.06,0,0xb4693e,'b','sand');V(-2,2,80,10,.07,0,0xd0a870,'b','sand');V(14,-12,10,50,.07,0,0xd0a870,'b','sand');V(-22,18,30,8,.07,0,0xd0a870,'b','sand');
  for(let i=0;i<36;i++){const x=(rnd()-.5)*86,z=(rnd()-.5)*86;V(x,z,1+rnd()*3,.8+rnd()*2,.08,0,pick([0x8a9a4a,0x6a7a3a,0xa0a050]),'b','grass')}
  V(-1,-9,80,.2,.12,0,0x4a4a4e,'b');V(-1,-7.6,80,.2,.12,0,0x4a4a4e,'b');for(let i=-19;i<=19;i++)V(-1+i*2.1,-8.3,.5,2.2,.14,0,0x5a3a22,'b','plank');
  /* canyon walls: terraced on the north and south with climbable ledges and rock tops; east and west are wide cliff masses with gaps */
  const N=[[0,3,.3],[3,3,.6],[6,3,.9],[9,3,1.2],[12,4,3.4],[16,4,5.4],[20,5,8.6]],M=[[0,3,.3],[3,3,.6],[6,3,.9],[9,4,3],[13,4,5],[17,6,9]];
  cliff(-40,-40,28,1,1,N.map(([o,w,h])=>[o,w,h]));cliff(12,-40,28,1,1,N.map(([o,w,h])=>[o+(o>9?0:0),w,h*(1+(rnd()<.5?0:.2))]));cliff(-40,40,34,1,-1,M);cliff(-2,40,42,1,-1,M);
  rock(-40,-24,6,28,10);rock(-40,24,6,28,11);rock(40,-26,6,26,10);rock(40,18,6,34,10);rock(-37,0,4,10,4);rock(37,-4,4,8,3);rock(-34.5,-6,3,5,2);
  /* gaps in the south cliff form two side canyons; a pair of ledges lets you climb out of the north side onto a mesa shelf */
  B(-24,-31,12,4,4.6,0,pick(RK),'sand');B(-10,-33,10,5,6.2,0,pick(RK),'sand');MK.stairs(B,-20,-27,3,15,'n',pick(RK),'sand',.3,.6,0);rock(-4,-35,8,4,6.8);
  /* mine tunnel through the east cliff: timber frames and a roof high above the rails */
  const mx=34,mz=-18;B(mx,mz-4.5,14,4,3,0,pick(RK),'sand');B(mx,mz+4.5,14,4,3,0,pick(RK),'sand');B(mx,mz,14,5,14,3.6,pick(RK),'sand');B(mx+2,mz,10,5.2,14,3.6,pick(RK),'sand');for(let i=0;i<5;i++){V(mx-5.5+i*2.8,mz-2.4,.5,.5,3.4,0,WD,'b','plank');V(mx-5.5+i*2.8,mz+2.4,.5,.5,3.4,0,WD,'b','plank');V(mx-5.5+i*2.8,mz,.5,5.2,3.7,3.3,WD,'b','plank')}
  V(mx,mz,12,2,.14,0,0x4a4a4e,'b');for(let i=0;i<8;i++)V(mx-5+i*1.5,mz,.4,2.4,.15,0,0x5a3a22,'b','plank');V(mx,mz-1.6,8,.9,1.2,.1,0x2a2a2e,'s');B(mx-3,mz+1.6,1.4,1.2,1.0,0,0x5a5a60,'metal');V(mx-6.6,mz,.1,3,3,.2,0xffd9a0,'e');
  /* water tower on legs with a tank (walk under it); stairs up to a catwalk */
  const wt=[-14,-16];for(const sx of[-1,1])for(const sz of[-1,1]){B(wt[0]+sx*2.4,wt[1]+sz*2.4,.6,.6,8,0,WD,'plank')}B(wt[0],wt[1],6.2,6.2,8.4,8,WD,'plank');V(wt[0],wt[1],6,6,13,8.4,0x7a5a3a,'c','plank');V(wt[0],wt[1],6.3,6.3,14.4,13,0x5a3a22,'k');for(let i=0;i<4;i++)V(wt[0],wt[1],6.1,6.1,.25,9+i*1.2,0x3a3a3a,'c');MK.stairs(B,wt[0]-3.4,wt[1]+3.4,1.4,26,'n',WD,'plank',.31,.45,0);for(const[dx,dz]of[[-2.4,0],[2.4,0],[0,-2.4],[0,2.4]])V(wt[0]+dx,wt[1]+dz,dx?.1:4.8,dx?4.8:.1,6.5,.4,0x4a3a2a,'b');
  /* ore mill: three floors with a hopper, a chute and a big wheel */
  multi(B,{x:-4,z:-17,w:12,d:9,fl:3,fh:3.8,c:0x8a7a62,k:'plank',rc:0x5a4a38,rk:'plank',dr:{s:[[-2,2.6,3.2]],e:[[0,1.8,2.6]]},rnd,step:3.4});V(-4,-12.3,10,1,12,3,0x5a4a38,'b','plank');V(-10.4,-17,.5,5,5.4,.5,0x4a3a2a,'c','plank');V(-10.4,-17,.4,8,7,3,RS,'c','rust');B(-4,-23.6,3,3,7,0,WD,'plank');V(-4,-23.6,3.4,3.4,9,7,RS,'k','rust');V(1.2,-13.5,3,.6,2.4,.2,0x4a3a2a,'b','plank');
  /* saloon and boarding house with covered porch, hotel and bank facades along the main street */
  multi(B,{x:-22,z:-2,w:14,d:9,fl:2,fh:3.6,c:0xa86a46,k:'plank',rc:0x6a4a30,rk:'plank',dr:{s:[[-3,2.4,2.8],[3,1.8,2.5]],n:[[0,1.8,2.5]]},rnd,step:3.4});B(-22,3.5,14.6,2.6,3.2,3,0x6a4a30,'plank');for(let i=0;i<5;i++)B(-28+i*3,4.6,.3,.3,3,0,WD,'plank');V(-22,-6.6,10,.1,5.4,4.4,0xe8d4a0,'b','plank');B(-22,-5,5,.1,5.2,3.8,0,'n');
  multi(B,{x:-8,z:3,w:9,d:8,fl:2,fh:3.6,c:0x9a8a6a,k:'plank',rc:0x5a4a38,rk:'plank',dr:{n:[[-1,2.4,2.8]],e:[[0,1.8,2.5]]},rnd});shack(10,-24,7,6,1,{s:[[0,1.8,2.5]]});shack(-30,24,8,6,1,{n:[[0,1.8,2.5]],e:[[0,1.8,2.5]]});shack(8,22,7,7,2,{w:[[0,1.8,2.5]],n:[[2,1.8,2.5]]});shack(24,12,6,5,1,{w:[[0,1.8,2.5]]});
  MK.room(B,{x:-34,z:-24,w:3.4,d:3.4,h:2.6,c:0x6a4a30,k:'plank',rc:0x4a3a28,dr:{e:[[0,1.2,2.2]]},wn:{}});V(-34,-24,3.8,3.8,3.5,2.6,0xc8362a,'b');
  /* trestle bridge across the gulch at height 5: timber legs, a deck with rails, stairs up at both ends */
  const bz=-30,b0=-32,b1=6;for(let x=b0;x<=b1;x+=4)for(const s of[-1,1]){B(x,bz+s*1.5,.7,.7,4.6,0,WD,'plank');V(x,bz+s*1.5,.9,.9,4.7,0,0x5a3a22,'b','plank')}for(let x=b0+2;x<b1;x+=4){V(x,bz,.3,3.4,3.8,.8,WDL,'b');V(x,bz,.2,4,3.2,2.6,0x5a3a22,'b')}B((b0+b1)/2,bz,b1-b0+2,3.6,5,4.6,WDL,'plank');for(const s of[-1,1])for(let x=b0;x<=b1;x+=2)V(x,bz+s*1.7,.12,.12,6.1,5,0x4a3a2a,'b');for(const s of[-1,1])V((b0+b1)/2,bz+s*1.7,b1-b0+2,.1,6,5.9,0x4a3a2a,'b');
  MK.stairs(B,b0-1.8,bz,3.2,16,'e',WDL,'plank',.2875,.62,0);MK.stairs(B,b1+1.8,bz,3.2,16,'w',WDL,'plank',.2875,.62,0);
  /* corral, cart track, cargo stacks, dynamite shed, windmill and plenty of scatter */
  for(let i=0;i<6;i++){B(18+i*2.2,28,.2,.2,1.5,0,WD,'plank');B(18+i*2.2,36,.2,.2,1.5,0,WD,'plank')}for(let i=0;i<4;i++){B(18+i*2.2+1.1,28,2.2,.1,1.2,.5,WD,'plank');B(18+i*2.2+1.1,36,2.2,.1,1.2,.5,WD,'plank')}
  for(const[x,z,h,f]of[[6,-8.3,1,1],[10,-8.3,1,0],[14,-8.3,1,1],[-12,-8.3,1,0],[24,-8.3,1,1]])cart(x,z,h,f);
  for(const[x,z]of[[-10,10],[-6,14],[10,12],[20,2],[26,-10],[2,18],[-18,24],[16,-30],[-26,12],[30,20],[22,-22],[0,-24]])boulder(x,z,1.6+rnd()*1.8);
  for(const[x,z]of[[-30,10],[-16,8],[6,6],[28,6],[32,-8],[-8,22],[14,30],[-34,18],[24,-34],[4,-14],[-20,-14]])cactus(x,z);for(const[x,z]of[[-27,-12],[12,-14],[26,24],[-14,30],[30,-26]])dead(x,z);
  for(const[x,z]of[[-28,-6],[-27,-6.9],[-27.8,-7.8],[6,12],[6.9,12.6],[12,-22],[12.8,-22.8],[24,20],[-16,22],[-15,22.8]])barrel(x,z,pick([WD,RS,0x2a4a6a]));for(const[x,z,s]of[[-1,12,1.4],[1,12.6,1.2],[2.2,-3,1.5],[-12,6,1.4],[22,8,1.3],[-6,-4,1.2],[8,-18,1.4],[28,-10,1.5]])crate(x,z,s);
  for(const[x,z]of[[-24,-8],[-12,12],[16,6],[30,-14],[-34,12]]){V(x,z,.14,.14,3.6,0,WD,'c');V(x,z,1.4,.08,3.5,2.8,0xe8d4a0,'b','plank');V(x,z,.3,.3,3.9,3.6,0xffc060,'e')}
  /* the railroad ends in buffers; a small signal; a mine office with a safe */
  B(-40.5,-8.3,1.6,3.2,1.6,0,0x5a5a60,'metal');for(const x of[-30,-6,18,36])V(x,-10.4,.14,.14,3.2,0,0x3a3a3e,'c'),V(x,-10.4,.7,.1,3.2,2.6,0x8a2a1a,'b');
  return a},
 deco(){const o=[],rnd=MK.rnd(33),V=(x,z,w,d,h,y0,c,s,t)=>o.push([x,z,w,d,h,y0||0,c,s||'b',t]),pick=q=>q[rnd()*q.length|0],RK=[0xb9774c,0xa8683e,0xc98858,0x9a5a38,0xd09868,0x8a4a30];
  /* the gorge continues: huge terraced mesas on every side, spires, arches, a distant river and desert scrub, vultures, wind-carved ridges */
  for(let i=0;i<60;i++){const q=rnd()*6.283,d=52+rnd()*95,x=Math.cos(q)*d*1.1,z=Math.sin(q)*d;if(Math.abs(x)<44&&Math.abs(z)<44)continue;const w=10+rnd()*30,h=10+rnd()*34;V(x,z,w,w*(.7+rnd()*.6),h,0,pick(RK),'b','sand');V(x,z,w*.78,w*.7,h+h*.3,h,pick(RK),'b','sand');V(x,z,w*.5,w*.5,h*1.5,h*1.3,pick(RK),'b','sand')}
  for(let i=0;i<26;i++){const q=rnd()*6.283,d=48+rnd()*60,x=Math.cos(q)*d,z=Math.sin(q)*d;if(Math.abs(x)<44&&Math.abs(z)<44)continue;V(x,z,3+rnd()*3,3+rnd()*3,12+rnd()*18,0,pick(RK),'c','sand');V(x,z,5,5,13+rnd()*19,11,pick(RK),'s','sand')}
  for(let i=0;i<8;i++){const x=-60+i*16,z=-62;V(x,z,3,3,14,0,pick(RK),'b','sand');V(x+4,z,3,3,14,0,pick(RK),'b','sand');V(x+2,z,9,3.4,17,14,pick(RK),'b','sand')}
  for(let i=0;i<90;i++){const q=rnd()*6.283,d=40+rnd()*80,x=Math.cos(q)*d*1.1,z=Math.sin(q)*d;if(Math.abs(x)<44&&Math.abs(z)<44)continue;V(x,z,.8,.8,1.6+rnd()*1.2,0,0x4a7a3a,'c')}
  V(0,100,300,40,.2,-.1,0x3a7aa8,'b');for(let i=0;i<6;i++)V(-50+i*20,-80,.3,.3,34+i*3,28,0x1a1a1a,'s');
  for(let i=-8;i<=8;i++){V(-1+i*5,-52.6,.5,.5,3.8,0,0x6a5a42,'b','plank')}for(let i=0;i<5;i++)V(-46+i*22,-54,4,2,.8,0,0x5a5a60,'b','metal');
  V(-58,-8,24,.14,.2,0,0x3a3a3e,'b');V(-58,-6.6,24,.14,.2,0,0x3a3a3e,'b');
  return o}};
