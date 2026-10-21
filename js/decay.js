/* ===================== decay.js ===================== */
/* ---------- Decay: an abandoned downtown, years after everyone left. Completely new layout.
   Boulevard east to west with a dry plaza at the crossing, an avenue north and south. Enterable buildings: Saint Aldric church with a ruined tower, Harlow Court apartments,
   a row of shops with a bank vault, the Meridian Hotel with a collapsed east wing and a rubble ramp to its second floor, a half built office skeleton, a parking deck with ramps,
   a market hall full of stalls, a metro entrance, a gas station with a canopy, a warehouse with a mezzanine and a derailed train on the boulevard.
   The play area is fenced (barrierLine: fence plus an invisible wall) and a whole ruined city continues beyond it. ---------- */
MAPS.Decay={d:'Abandoned downtown: ruined hotel, church, market hall, parking deck and a derailed train',H:52,open:1,sky:0x9aa5a3,gr:0x6a6a62,gt:'concrete',bc:0x9a968a,hemi:.8,hemiC:0xdfe6e4,hemiG:0x4a4a42,sunI:.5,sunC:0xf0ece0,fogF:125,
 fb:[[-38,1],[42,-2]],zn:[[-24,1],[-1,9],[24,-9]],tb:[-46,-46,46,46],
 inside:(x,z)=>Math.abs(x)<44&&Math.abs(z)<44,
 lights:[[18,5,-27,0xff3a2a,1.3,22],[-34,6,-30,0xa0c0ff,.9,22],[38,5,-10,0xffd080,1.0,24],[38,6,26,0xffe0b0,1.1,28],[-31,5,18,0xffd8a0,1.0,26],[-12,2.5,1,0xff7a3a,1.0,16],[16,4,-8,0xffb060,.7,16]],
 b(){const a=[],v=MAPS.Decay._v,B=(x,z,w,d,h,y0,c,k)=>a.push([x,z,w,d,h,y0||0,c,k]),V=(x,z,w,d,h,y0,c,s,t)=>v.push([x,z,w,d,h,y0||0,c,s||'b',t]),rnd=MK.rnd(5),
  CONC=0xa8a498,DCON=0x7d7a70,BRK=0x8a5a48,PLS=0xb9b09a,GRN=0x4a6a3a,DG=0x35502e,RST=0x7a4a2e,WOOD=0x6a5a44,BLK=0x1f2022,GLS=0x2a3a42;
  const pick=a_=>a_[rnd()*a_.length|0];
  /* ---------- props ---------- */
  const car=(x,z,hz,c,burnt)=>{const L=4.4,Wd=1.9,l=hz?L:Wd,d=hz?Wd:L;B(x,z,l,d,.95,0,burnt?0x2a2420:c,'concrete');B(x,z,hz?2.4:Wd-.1,hz?Wd-.1:2.4,1.5,.9,burnt?0x1b1816:c,'concrete');V(x,z,hz?2.2:Wd,hz?Wd:2.2,1.46,1.0,GLS,'g');for(const sx of[-1,1])for(const sz of[-1,1])V(x+(hz?sx*1.4:sz*.9),z+(hz?sz*.9:sx*1.4),.7,.7,.7,0,BLK,'c');if(burnt)V(x,z,l*.9,d*.9,1.0,.9,0x3a1a0c,'b','rust')},
   rub=(x,z,r,n,mx)=>{for(let i=0;i<n;i++){const q=rnd()*6.28,dd=rnd()*r,w=.7+rnd()*1.9,h=.3+rnd()*(mx||1.1);B(x+Math.cos(q)*dd,z+Math.sin(q)*dd,w,.7+rnd()*1.6,h,0,pick([CONC,DCON,BRK,PLS]),'concrete')}for(let i=0;i<n*2;i++){const q=rnd()*6.28,dd=rnd()*r*1.1;V(x+Math.cos(q)*dd,z+Math.sin(q)*dd,.3+rnd()*.9,.3+rnd()*.8,.25+rnd()*.4,0,pick([CONC,DCON,0x5a5448]),'s')}},
   tree=(x,z)=>{B(x,z,.5,.5,3.4,0,0x4a3f35,'plank');V(x,z,.7,.7,3.4,0,0x3a3028,'c');for(let i=0;i<6;i++){const q=i*1.05+rnd();V(x+Math.cos(q)*.9,z+Math.sin(q)*.9,1.8,.12,3.2+rnd()*1.4,3+rnd(),0x3a3028,'b')}},
   lamp=(x,z,bent)=>{V(x,z,.16,.16,5.4,0,0x3a3d40,'c');V(x+(bent?-.9:.7),z,1.6,.2,5.5,5.3,0x3a3d40,'b');if(!bent)V(x+1.4,z,.4,.25,5.3,5.15,0xd8d0a8,'e')},
   bench=(x,z,hz)=>{B(x,z,hz?1.8:.5,hz?.5:1.8,.5,0,WOOD,'plank');V(x+(hz?0:-.25),z+(hz?-.25:0),hz?1.8:.1,hz?.1:1.8,.95,.5,WOOD,'b','plank')},
   dump=(x,z,hz,c)=>{B(x,z,hz?2.2:1.2,hz?1.2:2.2,1.3,0,c||0x3a5a3a,'metal');V(x,z,hz?2.3:1.3,hz?1.3:2.3,1.38,1.3,0x2a2a2a,'b')},
   sand=(x,z,hz,L)=>{B(x,z,hz?L:1,hz?1:L,1.0,0,0xa8946a);V(x,z,hz?L+.1:1.1,hz?1.1:L+.1,1.1,.6,0x9a8660,'s')},
   jers=(x,z,hz,n)=>{for(let i=0;i<n;i++){const p=(i-(n-1)/2)*3.1,bx=hz?x+p:x,bz=hz?z:z+p;B(bx,bz,hz?3:.7,hz?.7:3,1.05,0,0xb5b0a2,'concrete')}},
   vine=(x,z,hz,L,h)=>{for(let i=0;i<Math.max(2,L/1.3|0);i++){const o=-L/2+rnd()*L,hh=1+rnd()*(h||5);V(hz?x+o:x,hz?z:z+o,hz?.5+rnd()*.7:.12,hz?.12:.5+rnd()*.7,hh,0,pick([GRN,DG,0x5a7a3a]),'b','grass')}},
   graf=(x,z,hz,L)=>{for(let i=0;i<3;i++){const o=(rnd()-.5)*L*.7;V(hz?x+o:x,hz?z:z+o,hz?.5+rnd()*1.5:.06,hz?.06:.5+rnd()*1.5,1.2+rnd()*1.2,.8,pick([0xc8362a,0x2a7ac8,0xe8c020,0x40c060,0xe8e8e8]),'b')}};
  const ops=(L,skip,lo,hi,step)=>{const r=[];for(let o=-L/2+2;o<L/2-1.3;o+=step||3.4){if(skip.some(([s,w])=>Math.abs(o-s)<w/2+1.1))continue;if(rnd()<.14)continue;r.push([o,1.3,lo,hi])}return r};
  /* generic building: walls per floor with windows, doors on the ground floor, floor slabs with stairwell holes, stairs, flat roof. o.col collapses the east end */
  const bld=o=>{const{x,z,w,d,fl=2,fh=3.6,t=.4,c=CONC,k='stucco',dr={},wlo=.9,whi=2.4,roof=1,rc=DCON,rf=0,col=null,st=[0,'n'],nowin=0,gl=0}=o,S=['n','s','w','e'],
   L=s=>(s=='n'||s=='s')?w:d,pos=s=>s=='n'?[x,z-d/2+t/2,1]:s=='s'?[x,z+d/2-t/2,1]:s=='w'?[x-w/2+t/2,z,0]:[x+w/2-t/2,z,0];
   for(let f=0;f<fl;f++){const y0=f*fh;for(const s of S){if(col&&col.side==s&&f>=col.wall)continue;const[px,pz,hz]=pos(s),len=hz?w:d-2*t,dd=(dr[s]||[]).filter(()=>f==0).map(([o,wd,ht])=>[o,wd||1.8,0,ht||2.5]);
      const wn=nowin?[]:ops(len,(dr[s]||[]).map(([o,wd])=>[o,wd||1.8]),wlo,whi,Math.max(3.2,len/5|0?3.4:3.4));MK.wall(B,hz,px,pz,len,t,y0,y0+fh,[...dd,...wn],c,k)}}
   /* floors */
   const stw=1.7,run=Math.ceil(fh/.3)*.55;
   for(let f=1;f<=fl;f++){const y=f*fh,last=f==fl;if(last&&!roof)continue;let sx=x,sw=w-2*t,sz=z,sd=d-2*t;if(col&&f>=col.slab){const dp=col.depth;sw-=dp;sx-=dp/2}
     const sdir=st[1],hole=f==fl?null:null;let hx,hz_,hw,hd;
     if(!last||roof){const fl_=f-1,flight=(fl_%2==0)?'n':'s',zz=flight=='n'?z-d/2+t+stw/2+.1:z+d/2-t-stw/2-.1,x0=x-w/2+t+.3,hole=f<=fl&&!last?[x0+run/2,zz,run+.3,stw+.3]:null;
      MK.slab(B,sx,sz,sw,sd,y,y-.35,rc,'concrete',f-1>=0&&f<=fl&&!last?[x0+run/2,zz,run+.4,stw+.3]:null);if(f==fl)B(x,z,w+.3,d+.3,y+.3,y,rc,'concrete')}}
   /* stair flights: floor 0->1 along the north wall rising east, 1->2 along the south wall, ... (the hole above each flight is cut in the slab) */
   for(let f=0;f<fl-1;f++){const flight=(f%2==0)?'n':'s',zz=flight=='n'?z-d/2+t+stw/2+.1:z+d/2-t-stw/2-.1,x0=x-w/2+t+.3;MK.stairs(B,x0,zz,stw,Math.ceil(fh/.3),'e',DCON,'concrete',fh/Math.ceil(fh/.3),.55,f*fh)}
   if(fl>=2&&true){/* ground to first floor flight is always present */}
   /* weathering */
   for(const s of S){const[px,pz,hz]=pos(s),len=hz?w:d;const off=s=='n'?-.3:s=='s'?.3:s=='w'?-.3:.3;if(rnd()<.8)vine(hz?x:x+(s=='e'?1:-1)*(w/2+.1),hz?z+(s=='s'?1:-1)*(d/2+.1):z,hz,len*.8,fl*fh-1);if(rnd()<.4)graf(hz?x:x+(s=='e'?1:-1)*(w/2+.06),hz?z+(s=='s'?1:-1)*(d/2+.06):z,hz,len)}
   V(x,z,w-1,d-1,fl*fh+.7,fl*fh+.3,0x4a4a44,'b','concrete');for(let i=0;i<4;i++)V(x+(rnd()-.5)*w*.7,z+(rnd()-.5)*d*.7,.9+rnd()*1.3,.9+rnd()*1.3,fl*fh+1.1+rnd()*.8,fl*fh+.3,pick([0x5a5448,0x6a665a]),'b','concrete');
   if(gl)for(const s of S){const[px,pz,hz]=pos(s);for(let i=0;i<6;i++){const o=(rnd()-.5)*(hz?w:d)*.8;V(hz?x+o:px,hz?pz:z+o,hz?.7:.05,hz?.05:.7,.5,.0,0x8aa0a8,'g')}}};
  /* ====================== STREETS, GROUND ====================== */
  V(0,1,100,10,.06,0,0x4a4b4a,'b','asphalt');V(-1,-25,10,42,.06,0,0x4a4b4a,'b','asphalt');V(-1,27,10,42,.06,0,0x4a4b4a,'b','asphalt');
  for(const s of[-1,1])for(const[xx,zz,w,d]of[[0,1+s*5.6,100,2.2],[-1+s*5.6,-25,2.2,42],[-1+s*5.6,27,2.2,42]])V(xx,zz,w,d,.14,0,0x8a8678,'b','concrete');
  for(let i=-46;i<46;i+=5){V(i,1,2.6,.18,.07,0,0xd8c030,'b');V(-1,i<-4?i:i+8,.18,2.6,.07,0,0xd8c030,'b')}
  for(let i=0;i<5;i++){V(-1.6+i*.8,-4.6,.45,1.4,.07,0,0xe0e0d8,'b');V(-1.6+i*.8,6.6,.45,1.4,.07,0,0xe0e0d8,'b')}
  for(let i=0;i<28;i++){const x=(rnd()-.5)*88,z=(rnd()-.5)*88;V(x,z,2+rnd()*5,1+rnd()*4,.09,0,pick([GRN,DG,0x5a6a3a]),'b','grass')}
  for(let i=0;i<40;i++)V((rnd()-.5)*90,(rnd()-.5)*90,.14,2+rnd()*6,.075,0,0x2a2a2a,'b');
  for(let i=0;i<10;i++){const x=(rnd()-.5)*80,z=(rnd()-.5)*80;V(x,z,.8,.8,.08,0,0x1b1b1b,'c')}
  /* ====================== PLAZA ====================== */
  const fx=-1,fz=1;for(const s of[-1,1]){B(fx,fz+s*2.6,5.4,.5,.9,0,0x9a9688,'concrete');B(fx+s*2.6,fz,.5,5.4,.9,0,0x9a9688,'concrete')}B(fx,fz,1.2,1.2,2.6,0,0x8a8678,'concrete');V(fx,fz,1.6,1.6,.5,0,0x7a7a70,'c');V(fx,fz,4.4,4.4,.08,.1,0x3a4a38,'b','grass');V(fx,fz+1.6,.3,.3,3,2.6,0x6a6a60,'b');
  for(const[x,z,h]of[[3.5,-3,1],[-5.5,5.2,1],[3.8,5.3,1]])bench(x,z,h);tree(-4.4,-1.8);tree(2.6,4);rub(-6.6,3.8,2,4,.9);
  /* overturned bus */
  MK.room(B,{x:-15,z:1.2,w:10.6,d:2.8,h:2.7,c:0xb8a030,k:'rust',rc:0x8a7a24,rk:'rust',t:.2,dr:{n:[[-1.2,1.3,2.3]],s:[[2.4,1.3,2.3]]},wn:{n:[[-3.6,1.2],[1,1.2],[3.6,1.2]],s:[[-4.2,1.2],[-1.2,1.2],[4.2,1.2]]}});for(let i=0;i<4;i++)B(-18+i*2,1.2,.4,2,.7,0,0x4a3f35,'plank');
  /* news kiosk, bus shelter, phone booth, hydrants */
  B(-8,-3,2.4,1.6,2.4,0,0x6a2a2a,'rust');V(-8,-3,2.6,1.8,2.9,2.4,0x4a4a44,'b','metal');V(-8,-2.1,2,.06,2.1,1.2,GLS,'g');B(7,-3.5,3.6,.4,2.5,0,0x4a5a6a,'metal');B(8.7,-2.7,.2,1.4,2.5,0,0x4a5a6a,'metal');V(7,-2.5,3.8,1.8,2.7,2.5,0x3a4a5a,'b','metal');
  for(const[x,z]of[[-9,6.8],[9,6.8],[4.6,-4.8],[-6.4,-4.8]])V(x,z,.4,.4,.8,0,0xb03030,'c');
  /* ====================== CHURCH ====================== */
  const chx=-36,chz=-33;
  bld({x:chx,z:chz,w:16,d:20,fl:1,fh:9,t:.55,c:0x9a968a,k:'concrete',dr:{s:[[3,2.8,4.2]],e:[[-5,2.4,3.4]],w:[[2,2.2,3]]},wlo:2.2,whi:7,roof:0,nowin:0,gl:1});
  B(chx+4,chz-1,8.5,.2,.1,0,0x000000,'n');B(chx,chz-22.5+12.5+0,1,1,.1,0,0,'n');
  for(const z of[-6,-2.5,1,4.5])for(const s of[-1,1])B(chx+s*3.4,chz+z,2.6,.7,.95,0,WOOD,'plank');
  B(chx,chz-8.4,4.4,1.4,1.2,0,0x8a8678,'concrete');B(chx,chz-9.4,1,1,2.2,0,0x8a8678,'concrete');V(chx,chz-9.6,3.2,.2,6.8,3,0x4a2a24,'b');rub(chx-1,chz+3,3,7,1.2);
  /* roof: two broken slabs and trusses */
  B(chx-5,chz,6,20.4,9.4,9,0x5a5448,'concrete');B(chx+6,chz-6,4,8,9.4,9,0x5a5448,'concrete');for(let i=0;i<8;i++){V(chx,chz-9+i*2.6,16,.3,10.4,9.2,0x3a2f26,'b','plank')}
  /* bell tower, ruined */
  B(chx-6,chz-9,4.8,4.8,20,0,0x8a867a,'concrete');V(chx-6,chz-9,3.4,3.4,24,20,0x7a766a,'b','concrete');V(chx-6,chz-9,.9,.9,29,24,0x5a5448,'k');V(chx-6,chz-6.5,2.4,.1,17,12,0x1b1b1b,'b');V(chx-6,chz-6.5,1.6,.1,17,12.8,0x050505,'b');
  V(chx+8.1,chz,.2,5,7.5,4,0xc89a30,'g');V(chx+8.1,chz,.15,3.5,9.2,7.7,0x2a7ac8,'g');for(let i=0;i<5;i++)V(chx+8.15,chz-6+i*3,.2,1.2,7.4,2.6,0x1a1a1c,'g');
  /* ====================== HARLOW COURT (apartments) ====================== */
  bld({x:-17,z:-33,w:16,d:18,fl:3,fh:3.4,dr:{s:[[0,2.4,2.6]],w:[[4,1.8,2.5]],n:[[-4,1.8,2.5]]},c:BRK,k:'brick',rc:0x6a5a4a,col:{side:'e',wall:2,slab:2,depth:5}});
  rub(-8,-30,4,10,1.4);rub(-9.5,-37,2.5,5,.9);V(-17,-24.1,2.4,.2,3.6,3.4,0xc89a30,'g');
  /* ====================== SHOP ROW NORTH (z -20 .. -6) ====================== */
  for(const[i,sx,wd,cl]of[[0,-39.5,9,0xa89a7a],[1,-29.5,9,0x9a8a8a],[2,-19.5,9,0x8a96a0],[3,-10.5,8,0xb0a088]])
   bld({x:sx,z:-13,w:wd,d:14,fl:2,fh:3.6,c:cl,k:'stucco',dr:{s:[[0,3.4,2.8]],n:[[-1.5,1.8,2.4]]},wlo:1.1,whi:2.5,rc:0x5a5448,gl:1});
  /* bank vault in the third shop */
  MK.room(B,{x:-19.5,z:-17.8,w:4,d:3.6,h:3,t:.6,c:0x6a6a70,k:'metal',roof:0,dr:{s:[[1.2,1.4,2.4]]}});V(-19.5,-15.9,1.5,.1,2.4,.2,0x8a8a92,'c','metal');B(-24,-8,.1,.1,.1,0,0,'n');
  /* ====================== HOTEL ====================== */
  bld({x:18,z:-30,w:20,d:24,fl:4,fh:3.6,c:0xb0a894,k:'stucco',dr:{s:[[-3,4.4,3.2],[5,1.8,2.5]],n:[[0,1.8,2.5]],w:[[-4,1.8,2.5]]},wlo:1,whi:2.6,rc:0x5a564c,col:{side:'e',wall:2,slab:2,depth:7},gl:1});
  /* rubble ramp up the east face to the first floor (12 steps of .3) */
  MK.stairs(B,29.2,-18.2,3.4,12,'n',DCON,'concrete',.3,.5,0);rub(31,-21,3,6,1.2);rub(25,-26,3,5,.9);
  /* lobby: desk, pillars, a fallen chandelier, lounge furniture; second floor rooms */
  B(14,-23,6,.9,1.15,0,0x4a3a2e,'plank');for(const px of[11,17,24])B(px,-26,.8,.8,3.6,0,0x9a968a,'concrete');V(20,-27,1.6,1.6,.6,.0,0xc8a040,'s');B(14,-34,4.2,.7,.5,0,0x6a2a2a,'plank');B(22,-33,3.6,1.1,.5,0,0x4a3a5a,'plank');
  for(let i=0;i<4;i++){B(12+i*2.8,-38.5,2.2,.12,3.4,0,0x6a5a46,'plank')}B(16.5,-32,1.7,1.7,3.6,0,0x5a5a62,'metal');B(16.5,-32,1.7,1.7,7.2,3.6,0x5a5a62,'metal');
  V(18,-18.1,6,.12,4,3.3,0xc8362a,'e');V(18,-18.1,5.6,.1,3.8,3.4,0x1b1b1c,'b');
  /* ====================== OFFICE SKELETON ====================== */
  const ox=38.5,oz=-35;for(let f=0;f<3;f++){const y=f*3.8;if(f>0){MK.slab(B,ox,oz,11,14,y,y-.4,0x8a867a,'concrete',f==1?[ox+3,oz-4.5,4.4,4.2]:[ox-3,oz+3,4,4])}}
  for(const px of[-4.6,0,4.6])for(const pz of[-6,-1.6,2.8,6.4])B(ox+px,oz+pz,.8,.8,11.4,0,0x8a867a,'concrete');B(ox+3.8,oz-5,3,3,11.4,0,0x7a766a,'concrete');MK.stairs(B,ox-5.2,oz-5.4,1.7,13,'e',DCON,'concrete',3.8/13,.55,0);MK.stairs(B,ox-5.2,oz+5.4,1.7,13,'e',DCON,'concrete',3.8/13,.55,3.8);
  MK.wall(B,1,ox,oz+6.9,11,.3,0,3.8,[[-3,3.2,0,2.6]],0x9a968a,'concrete');MK.wall(B,0,ox-5.6,oz,10,.3,3.8,7.6,[[0,4,.9,2.4]],0x9a968a,'concrete');
  for(let i=0;i<8;i++)V(ox-5+i*1.4,oz-6.8,.05,.05,12.5,11.4,0x5a3a2a,'b');V(ox,oz,12,15,11.5,11.4,0x2a2a2a,'b');rub(ox,oz+8.5,3,6,1.1);V(ox+1,oz+3,2.4,2.4,12.6,11.4,0xd7a82a,'b');
  /* ====================== PARKING DECK ====================== */
  const px0=38,pz0=-13;for(let f=1;f<3;f++)MK.slab(B,px0,pz0,14,20,f*3.2,f*3.2-.35,0x8a867a,'concrete',[px0-4.5,pz0+7.8,5.5,3.8]);
  for(const cx of[-5.5,0,5.5])for(const cz of[-8,-2.6,2.8,8])B(px0+cx,pz0+cz,.7,.7,6.4,0,0x8a867a,'concrete');
  for(let f=0;f<3;f++){const y=f*3.2;for(const s of[-1,1]){B(px0,pz0+s*9.8,14,.3,y+1.1,y,0x9a968a,'concrete');B(px0+s*6.8,pz0,.3,20,y+1.1,y,0x9a968a,'concrete')}}
  MK.stairs(B,px0-4.5-3.2,pz0+7.8,3.4,11,'e',DCON,'concrete',3.2/11,.58,0);MK.stairs(B,px0+5,pz0+7.8,3.2,11,'w',DCON,'concrete',3.2/11,.58,3.2);
  car(px0-2,pz0-4,1,0x4a5a6a,0);car(px0+2.5,pz0-4,1,0x6a2a2a,1);car(px0-2,pz0+1,1,0x9a9a8a,0);car(px0+1,pz0-4,0,0x2a4a2a,1);
  for(let f=1;f<3;f++){car(px0-3.5,pz0-5,1,pick([0x6a2a2a,0x4a5a6a,0x9a9a8a]),f==2);car(px0+2,pz0+2,1,0x3a3a3a,1)}
  /* ====================== MARKET HALL ====================== */
  const mx=-31,mz=18;bld({x:mx,z:mz,w:26,d:16,fl:1,fh:6,t:.45,c:0x9a8a6a,k:'stucco',dr:{n:[[-9,3.2,4],[0,3.2,4],[9,3.2,4]],e:[[-3,2.2,3]],w:[[-4,2.2,3]]},wlo:2.4,whi:4.8,roof:1,rc:0x5a4a38});
  for(let r=0;r<4;r++)for(let c=0;c<5;c++){if((r+c)%7==3)continue;const x=mx-9+c*4.6,z=mz-4.6+r*3.1;B(x,z,2.4,1.1,1.05,0,WOOD,'plank');V(x,z,2.9,1.8,2.6,2.1,pick([0xb8402a,0x2a6a8a,0xc89a30,0x4a8a4a,0x8a4a8a]),'b');V(x-1,z,.08,.08,2.1,0,0x3a3a3a,'b');V(x+1,z,.08,.08,2.1,0,0x3a3a3a,'b')}
  rub(mx+4,mz+4,3,8,1.3);V(mx,mz,26,16,6.4,6,0x3a3a34,'b');
  /* metro entrance */
  MK.room(B,{x:-11,z:13,w:6,d:7,h:3.4,c:0x6a7078,k:'concrete',rc:0x4a4e54,dr:{n:[[0,2.6,2.8]]},wn:{}});B(-11,12.6,4.6,2,1.9,0,0x4a4a4a,'concrete');V(-11,9.4,5.6,.2,4.2,3.0,0xff4a30,'e');V(-11,9.3,5.2,.12,4,3.2,0x1b1b1c,'b');
  /* ====================== SHOPS SOUTH ====================== */
  for(const[sx,cl]of[[-38.5,0x9a8a7a],[-26.5,0x8a9a90],[-14.5,0xa89a8a]])bld({x:sx,z:37,w:11,d:12,fl:2,fh:3.6,c:cl,k:'stucco',dr:{n:[[0,3.4,2.8]],s:[[-3,1.8,2.4]]},rc:0x5a5448,gl:1});
  /* ====================== GAS STATION ====================== */
  MK.room(B,{x:12,z:24,w:8,d:6,h:3.2,c:0xb8b0a0,k:'stucco',rc:0x5a5448,dr:{e:[[-.8,1.8,2.5]],n:[[2,1.8,2.5]]},wn:{s:[[-2,1.2],[2,1.2]],n:[[-2,1.2]]}});B(12,22.8,5.6,.7,1.1,0,0x4a4a44,'metal');
  for(const sx of[0,1])for(const sz of[0,1])B(20.4+sx*7.2,13+sz*8,.7,.7,4.4,0,0x9a968a,'concrete');B(24,17,10,11.4,4.75,4.4,0xb03a2a,'metal');V(24,17,10.4,11.8,4.9,4.75,0xd8d0c0,'b','metal');
  for(const z of[14,20])for(const x of[21.2,26.8]){B(x,z,.6,1.2,1.3,0,0xb03a2a,'metal');V(x,z,.7,1.3,1.5,1.3,0x2a2a2a,'b')}car(24,16.5,0,0x3a5a7a,1);car(30,28,1,0x2a2a2a,1);V(31,10.5,.5,.5,10,0,0x3a3a3e,'c');V(31,10.5,3.2,.4,12.4,9,0xe8c020,'e');
  /* ====================== WAREHOUSE ====================== */
  const wx=38,wz=26;bld({x:wx,z:wz,w:14,d:30,fl:1,fh:8,t:.45,c:0x6a7078,k:'metal',dr:{w:[[-8,4,4.2],[6,4,4.2]],s:[[0,2.2,3]]},wlo:5.5,whi:7,roof:1,rc:0x4a4e54});
  for(let r=0;r<3;r++)for(let c=0;c<4;c++){if(c==1)continue;B(wx+1.5+r*2.6,wz-11+c*5.4,.9,4.6,3.6,0,0x8a5a2a,'metal');V(wx+1.5+r*2.6,wz-11+c*5.4,1,4.7,3.7,3.6,0x6a4a2a,'b')}
  B(wx+5.2,wz,2.6,24,4.3,4,0x5a5e64,'metal');MK.stairs(B,wx+3.8,wz+11.6,1.6,14,'n',DCON,'concrete',4/14,.58,0);B(wx-4,wz-8,2.4,6,2.6,0,0x9a3a2a,'rust');B(wx-4,wz+6,2.4,6,2.6,0,0x3a5a6a,'rust');B(wx-3,wz-12.5,1.3,2.4,1.7,0,0xc8a030,'metal');
  /* ====================== DERAILED TRAIN ====================== */
  const trainCar=(x0,len,c)=>{MK.room(B,{x:x0+len/2,z:1,w:len,d:3.2,h:3.6,c,k:'rust',rc:0x3a3a3e,rk:'metal',t:.25,dr:{n:[[-2.5,1.5,2.6],[2.5,1.5,2.6]],s:[[0,1.5,2.6]]},wn:{n:[[-5,1.2],[0,1.2],[5,1.2]],s:[[-5,1.2],[-2.5,1.2],[2.5,1.2],[5,1.2]]}});for(let i=0;i<5;i++)B(x0+1.6+i*2,.1,1.1,.5,.6,0,0x4a3a2e,'plank');V(x0+len/2,1,len,3.4,.7,.6,0x1b1b1b,'b')};
  trainCar(10,11.6,0x5a6a7a);trainCar(22.4,11.6,0x7a4a3a);MK.room(B,{x:37.2,z:1,w:6.4,d:3.4,h:3.8,c:0x2a3a4a,k:'metal',rc:0x2a2a2e,t:.3,dr:{w:[[0,1.5,2.6]]},wn:{n:[[1,1.4]],s:[[1,1.4]]}});V(37.2,1,6.4,3.5,4.5,3.8,0x1a1a1c,'b');
  /* ====================== STREET LIFE: cars, wrecks, barricades, trees, lamps, trash ====================== */
  car(-33,-2.2,1,0x6a2a2a,0);car(-28,3.8,1,0x2a4a6a,1);car(-22,-2,1,0x8a8a7a,0);car(-5,-1.8,1,0x3a3a3a,1);car(6,3.8,1,0x5a2a2a,0);car(40,3.8,1,0x4a4a3a,1);car(-1.6,-12,0,0x6a6a2a,0);car(.4,-22,0,0x2a2a2a,1);car(-2,-33,0,0x5a3a2a,0);car(-1.2,15,0,0x4a5a3a,1);car(-2,24,0,0x7a2a2a,0);car(.2,35,0,0x2a3a5a,1);
  car(-6.6,-30,0,0x8a8a6a,0);car(4.3,-38,0,0x3a3a3a,1);car(-8,28,1,0x3a5a3a,1);car(4,32,1,0x6a6a6a,0);car(-44,10,0,0x4a4a4a,1);
  jers(-9.5,-4.6,1,2);jers(7.5,6.6,1,2);jers(-1,-18.5,1,3);jers(-1,20.5,1,3);sand(-4,-6,1,5);sand(6,8.4,1,6);sand(-6.2,12,0,5);sand(4.2,-14,0,5);
  for(const[x,z]of[[-42,-2],[-35,-5.6],[-24,-5.8],[-12,-5.8],[10,-5.5],[27,-5.7],[41,-5.6],[-42,8],[-26,8.2],[10,8.4],[34,8.4],[-8,22],[-8,-24],[7,-8],[7,28],[-8,36]])tree(x,z);
  for(const[x,z,b]of[[-42,-4.6,0],[-30,-4.6,1],[-18,-4.6,0],[-6.8,-4.6,0],[6.4,-4.6,1],[20,-4.6,0],[34,-4.6,0],[-42,7,0],[-30,7,1],[-12,7,0],[6.4,7,0],[20,7,1],[34,7,0],[-6.4,-18,0],[4.4,-26,1],[-6.4,26,0],[4.4,18,0]])lamp(x,z,b);
  for(const[x,z,h,c]of[[-6.9,-9,0,0x3a5a3a],[-6.9,-30,0,0x3a5a3a],[6,-19.6,1,0x2a4a6a],[4.6,29,0,0x3a5a3a],[-20,6.8,1,0x2a4a6a],[-44,-7,0,0x5a3a2a],[-9,24,1,0x3a5a3a],[30,7,1,0x5a3a2a]])dump(x,z,h,c);
  for(let i=0;i<10;i++){const x=(rnd()-.5)*84,z=(rnd()-.5)*84;if(!a.some(b=>b[4]>.4&&b[5]<1&&x>b[0]-b[2]/2-1.2&&x<b[0]+b[2]/2+1.2&&z>b[1]-b[3]/2-1.2&&z<b[1]+b[3]/2+1.2))rub(x,z,2,4+(i&3),.8)}
  for(const[x,z]of[[-1,-8],[-1,-27],[-1,12],[-1,30],[-20,1],[22,-1]])rub(x,z,2.4,5,.7);
  for(let i=0;i<8;i++){const x=-42+rnd()*84,z=-4+rnd()*10;V(x,z,.6,.5,.3,0,pick([0xc8c8c0,0x8a8a80,0x7a5a3a]),'b')}
  /* fence around the play area, then the city continues */
  const F=45.8;barrierLine(a,-F,-F,F,-F,0);barrierLine(a,-F,F,F,F,1);barrierLine(a,-F,-F,-F,F,2);barrierLine(a,F,-F,F,F,0);
  return a},
 /* ---------- the ruined city beyond the fence ---------- */
 deco(){const o=[],rnd=MK.rnd(41),V=(x,z,w,d,h,y0,c,s,t)=>o.push([x,z,w,d,h,y0||0,c,s||'b',t]),pick=a=>a[rnd()*a.length|0],GL=0x1c2a34,W=[0x8a867a,0x7a7a74,0x9a9488,0x6f7068,0x8c8274];
  /* ruined towers in rings: window grids with missing panes, ragged tops, rebar, balconies */
  const tower=(x,z,w,d,h,c)=>{V(x,z,w,d,h,0,c,'b','concrete');const rows=Math.floor(h/3.4),cols=Math.max(2,Math.floor(w/2.6)),cd=Math.max(2,Math.floor(d/2.6));
   for(let r=1;r<rows;r++){for(let i=0;i<cols;i++){if(rnd()<.18)continue;const px=x-w/2+(i+.5)*w/cols;V(px,z+d/2+.05,1.4,.1,r*3.4+2.3,r*3.4+.8,rnd()<.2?0x0a0a0c:GL,'g');if(rnd()<.45)V(px,z-d/2-.05,1.4,.1,r*3.4+2.3,r*3.4+.8,GL,'g')}
     for(let i=0;i<cd;i++){if(rnd()<.2)continue;const pz=z-d/2+(i+.5)*d/cd;V(x+w/2+.05,pz,.1,1.4,r*3.4+2.3,r*3.4+.8,GL,'g');if(rnd()<.4)V(x-w/2-.05,pz,.1,1.4,r*3.4+2.3,r*3.4+.8,GL,'g')}
     if(rnd()<.3)V(x,z+d/2+.5,w*.8,1,r*3.4+.2,r*3.4,0x6a665a,'b','concrete')}
   for(let i=0;i<4;i++)V(x+(rnd()-.5)*w*.8,z+(rnd()-.5)*d*.8,w*.3,d*.3,h+1+rnd()*3.5,h,c,'b','concrete');for(let i=0;i<5;i++)V(x+(rnd()-.5)*w,z+(rnd()-.5)*d,.08,.08,h+1.6+rnd()*2,h,0x6a3a24,'b');
   if(rnd()<.5){V(x+w/2,z,w*.15,d*.6,h*.6,h*.3,0x0a0a0c,'b')}for(let i=0;i<3;i++)V(x+(rnd()-.5)*w,z+d/2+.04,.5+rnd()*1.4,.05,h*.9,rnd()*h*.7,pick([GRN_,DG_]),'b','grass')};
  const GRN_=0x4a6a3a,DG_=0x35502e;
  for(let i=0;i<30;i++){const q=i/30*6.283+rnd()*.15,d=62+rnd()*45,x=Math.cos(q)*d,z=Math.sin(q)*d;if(Math.abs(x)<50&&Math.abs(z)<50)continue;tower(x,z,9+rnd()*10,9+rnd()*10,16+rnd()*48,pick(W))}
  for(let i=0;i<22;i++){const q=rnd()*6.283,d=52+rnd()*22,x=Math.cos(q)*d,z=Math.sin(q)*d;if(Math.abs(x)<49&&Math.abs(z)<49)continue;tower(x,z,7+rnd()*8,7+rnd()*8,6+rnd()*14,pick(W))}
  /* rubble fields between the towers and the fence, overgrown with grass and dead trees */
  for(let i=0;i<130;i++){const x=(rnd()-.5)*140,z=(rnd()-.5)*140;if(Math.abs(x)<48&&Math.abs(z)<48)continue;const r=1+rnd()*3.5;V(x,z,r*1.6,r*1.3,r*.5,0,pick([0x7a766a,0x6a665a,0x8a8478,0x5a5448]),'s')}
  for(let i=0;i<50;i++){const x=(rnd()-.5)*130,z=(rnd()-.5)*130;if(Math.abs(x)<48&&Math.abs(z)<48)continue;V(x,z,3+rnd()*7,2+rnd()*5,.12,0,pick([GRN_,DG_,0x5a6a3a]),'b','grass')}
  const dt=(x,z)=>{V(x,z,.6,.6,5,0,0x3a3028,'c');for(let i=0;i<5;i++){const q=i*1.3+rnd();V(x+Math.cos(q)*1.2,z+Math.sin(q)*1.2,2.2,.14,4.6+rnd()*2,4+rnd(),0x3a3028,'b')}};
  for(let i=0;i<40;i++){const x=(rnd()-.5)*130,z=(rnd()-.5)*130;if(Math.abs(x)<49&&Math.abs(z)<49)continue;dt(x,z)}
  /* elevated highway on pillars north of the city with a collapsed span */
  for(let i=-6;i<=6;i++){V(i*14,-62,2.2,2.2,9,0,0x7a766a,'b','concrete');if(i!=2&&i!=3)V(i*14+7,-62,12,9,10.4,9,0x6a665a,'b','concrete');V(i*14+7,-62,12.2,.5,11.4,10.4,0x8a867a,'b','concrete');V(i*14+7,-57.6,12.2,.4,11.2,10.4,0x6a665a,'b')}
  V(34,-62,7,8,5,0,0x5a5448,'s');V(37,-60,6,7,4,0,0x6a665a,'s');V(30.4,-62,5,7,10,9.2,0x6a665a,'b','concrete');
  /* train gantry crane and a water tower to the south, billboard to the west */
  V(-30,70,1.4,1.4,34,0,0x8a5a2a,'b','rust');V(-30,70,1.4,1.4,34,0,0x8a5a2a,'b','rust');V(-10,70,1.4,1.4,34,0,0x8a5a2a,'b','rust');V(-20,70,22,1.6,34,32.4,0x8a5a2a,'b','rust');V(-20,70,1,1,32,26,0x5a5a60,'b');V(-20,70,3,2.4,26,23,0x4a4a44,'b','metal');
  for(const sx of[-1,1])for(const sz of[-1,1])V(60+sx*3,-4+sz*3,.5,.5,16,0,0x5a4a3a,'b','rust');V(60,-4,9.4,9.4,22,16,0x6a5a4a,'c','rust');V(60,-4,9.6,9.6,.5,16,0x3a2a22,'c');V(60,-4,9.8,9.8,24.5,22,0x5a4a3a,'k');
  V(-58,-12,.6,.6,10,0,0x4a4a4a,'b');V(-58,12,.6,.6,10,0,0x4a4a4a,'b');V(-58,0,.5,26,16,9.6,0x2a3a4a,'b');V(-58.4,0,.1,22,15,10.4,0x4a6a8a,'b');V(-58.5,-6,.1,3,13,11,0xc8362a,'b');V(-58.5,5,.1,6,12.5,11.5,0xe8c020,'b');
  /* the continuation of the streets beyond the fence, wrecks in them, a bus, bridge pieces and smoke columns */
  V(0,-80,10,70,.06,0,0x4a4b4a,'b','asphalt');V(0,80,10,70,.06,0,0x4a4b4a,'b','asphalt');V(-80,1,70,10,.06,0,0x4a4b4a,'b','asphalt');V(80,1,70,10,.06,0,0x4a4b4a,'b','asphalt');
  for(let i=0;i<22;i++){const t=i%4,d=52+rnd()*30,s=(rnd()<.5?-1:1),x=t==0?(rnd()-.5)*5:t==1?(rnd()-.5)*5:s*d,z=t==0?s*d:t==1?-s*d:1+(rnd()-.5)*5;V(x,z,t<2?1.9:4.4,t<2?4.4:1.9,1.2,0,pick([0x3a3a3a,0x5a2a2a,0x3a4a5a,0x4a4a3a]),'b','rust');V(x,z,t<2?1.7:2.2,t<2?2.2:1.7,1.8,1.1,0x1f2a30,'b')}
  V(-70,40,14,3,3.4,0,0x9a8a30,'b','rust');V(-70,40,13,2.8,3.8,3.4,0x8a7a24,'b','rust');V(60,-30,3,13,3,0,0x2a4a6a,'b','rust');
  for(let i=0;i<4;i++){const x=(rnd()-.5)*140,z=(rnd()-.5)*140;if(Math.abs(x)<60&&Math.abs(z)<60)continue;for(let k=0;k<8;k++)V(x+Math.sin(k)*.5,z+Math.cos(k*2)*.5,2+k*.6,2+k*.6,10+k*8,6+k*8,0x555a58,'s')}
  /* a ring of the playable area's own streets: guard rail posts and warning tape outside the fence */
  for(let i=-22;i<=22;i++){V(i*2.1,-46.7,.12,.12,2.6,0,0x6a6a6e,'b');V(i*2.1,46.7,.12,.12,2.6,0,0x6a6a6e,'b');V(-46.7,i*2.1,.12,.12,2.6,0,0x6a6a6e,'b');V(46.7,i*2.1,.12,.12,2.6,0,0x6a6a6e,'b')}
  for(const[x,z,hz]of[[0,-46.9,1],[20,46.9,1],[-46.9,-12,0],[46.9,18,0]])V(x,z,hz?5:.08,hz?.08:5,2.5,.2,0xe8d040,'b');
  return o}};
