/* ===================== maps.js ===================== */
/* ---------- shared building toolkit + the map Rust ----------
   Box format: [x,z,w,d,top,y0,colour,texture] (collision + visuals). Visual only (V and deco): [x,z,w,d,top,y0,colour,shape,texture], shape b box, e glow, g glass, s sphere, c cylinder, k cone.
   Open maps have no tall walls. The play area is enclosed by a fence with an invisible wall on top (barrierLine) and the rest of the world is detailed beyond the fence. */
const MK={
 rnd(seed){let s=seed||7;return()=>(s=(s*16807)%2147483647)/2147483647},
 /* wall along x (hz) or z with openings ops=[[offset from centre,width,bottom,top]...] measured from y0 */
 wall(B,hz,cx,cz,len,t,y0,y1,ops,c,k){ops=(ops||[]).slice().sort((p,q)=>p[0]-q[0]);let cur=-len/2;
  const put=(a,b,lo,hi)=>{if(b-a<.03||hi-lo<.03)return;const m=(a+b)/2,l=b-a;B(hz?cx+m:cx,hz?cz:cz+m,hz?l:t,hz?t:l,hi,lo,c,k)};
  for(const[o,w,bt,tp]of ops){put(cur,o-w/2,y0,y1);put(o-w/2,o+w/2,y0,y0+bt);put(o-w/2,o+w/2,y0+tp,y1);cur=o+w/2}put(cur,len/2,y0,y1)},
 /* four walls with doors / windows per side (n = -z, s = +z, w = -x, e = +x) and an optional flat roof */
 room(B,o){const{x,z,w,d,h,y0=0,t=.35,c,k,roof=1,rc,rk,rt=.3,dr={},wn={}}=o,ops=s=>[...(dr[s]||[]).map(([f,wd,ht])=>[f,wd||1.8,0,ht||2.4]),...(wn[s]||[]).map(([f,wd])=>[f,wd||1.2,1.1,2.1])],W=MK.wall;
  W(B,1,x,z-d/2+t/2,w,t,y0,y0+h,ops('n'),c,k);W(B,1,x,z+d/2-t/2,w,t,y0,y0+h,ops('s'),c,k);W(B,0,x-w/2+t/2,z,d-2*t,t,y0,y0+h,ops('w'),c,k);W(B,0,x+w/2-t/2,z,d-2*t,t,y0,y0+h,ops('e'),c,k);
  if(roof)B(x,z,w+.2,d+.2,y0+h+rt,y0+h,rc||c,rk||k)},
 /* stairs: n steps rising .3 each, running in direction dir ('n','s','e','w'), starting at (x,z) = bottom centre */
 stairs(B,x,z,wd,n,dir,c,k,rise=.3,run=.62,y0=0){for(let i=0;i<n;i++){const o=(i+.5)*run,top=y0+rise*(i+1),px=dir=='e'?x+o:dir=='w'?x-o:x,pz=dir=='s'?z+o:dir=='n'?z-o:z,hz=dir=='e'||dir=='w';B(px,pz,hz?run:wd,hz?wd:run,top,y0,c,k)}},
 /* a floor slab with a rectangular hole (hx,hz centre, hw,hd size) so a stairwell can pass through */
 slab(B,x,z,w,d,top,y0,c,k,hole){if(!hole){B(x,z,w,d,top,y0,c,k);return}const[hx,hz,hw,hd]=hole,x0=x-w/2,x1=x+w/2,z0=z-d/2,z1=z+d/2,a=hx-hw/2,b=hx+hw/2,e=hz-hd/2,f=hz+hd/2;
  if(a-x0>.05)B((x0+a)/2,z,a-x0,d,top,y0,c,k);if(x1-b>.05)B((b+x1)/2,z,x1-b,d,top,y0,c,k);if(e-z0>.05)B(hx,(z0+e)/2,hw,e-z0,top,y0,c,k);if(z1-f>.05)B(hx,(f+z1)/2,hw,z1-f,top,y0,c,k)}
};

/* ===================== RUST ===================== */
/* An abandoned desert oil refinery. Layout traced from the reference top-down map (1 map pixel = .075 m): a central drilling tower with a conveyor stair, a tank farm top right,
   sheds on the left, a pit and low barriers right of centre, a tanker truck and pickup bottom right. Play area 51 x 59 m inside a fence; dunes, a pipeline, a derrick,
   a rail line with train cars, containers, rocks and pylons surround it. */
MAPS.Rust={d:'Desert oil refinery: tower with a conveyor stair, tank farm, sheds and a pit',H:31,open:1,sky:0xdcc79f,gr:0xcdb78a,gt:'sand',bc:0xc4a878,hemi:.95,hemiC:0xfff2d8,hemiG:0x8a7650,sunI:.95,sunC:0xfff0d0,fogF:150,
 fb:[[-6,-27],[6,27]],zn:[[-10,14],[2,-3],[17,-10]],tb:[-25.8,-29.8,25.8,29.8],
 inside:(x,z)=>Math.abs(x)<24&&Math.abs(z)<28,
 lights:[[-2.6,17.2,-5.3,0xff8a30,1.6,46],[-2.6,4,-5,0xffd9a0,.5,14]],
 b(){const a=[],v=MAPS.Rust._v,B=(x,z,w,d,h,y0,c,k)=>a.push([x,z,w,d,h,y0||0,c,k]),V=(x,z,w,d,h,y0,c,s,t)=>v.push([x,z,w,d,h,y0||0,c,s||'b',t]),
  X=p=>(p-948)*.075,Z=p=>(p-945)*.075,R=(x0,y0,x1,y1)=>[(X(x0)+X(x1))/2,(Z(y0)+Z(y1))/2,(x1-x0)*.075,(y1-y0)*.075],rnd=MK.rnd(11),
  TAN=0xc9ad7c,SAND=0xd8c398,RUST=0x8a4a2a,DRUST=0x5a3320,STEEL=0x7a8087,RED=0xa03a2a,WHITE=0xd9d4c4,CONC=0xb5ac98,YEL=0xd7a82a,BLK=0x222426,OLIVE=0x6b6a45;
  const barrel=(x,z,c)=>{B(x,z,.7,.7,1.05,0,c||RUST,'rust');V(x,z,.74,.74,1.05,0,c||RUST,'c','rust');V(x,z,.78,.78,.08,.5,0x2a2a2a,'c')},
   crate=(x,z,w,d,h,c)=>{B(x,z,w,d,h,0,c||0x9a7a4a,'plank')},
   jersey=(x,z,hz,n)=>{for(let i=0;i<n;i++){const p=(i-(n-1)/2)*3.1,bx=hz?x+p:x,bz=hz?z:z+p;B(bx,bz,hz?3:.7,hz?.7:3,1.05,0,CONC,'concrete');V(bx,bz,hz?2.9:.9,hz?.9:2.9,.5,0,CONC,'b','concrete')}},
   sand=(x,z,w,d)=>{B(x,z,w,d,1.0,0,0xb89a60);V(x,z,w+.1,d+.1,1.1,.55,0xa88a52,'s')},
   container=(x,z,hz,c,h0)=>{const L=6,Wd=2.5,y=h0||0;B(x,z,hz?L:Wd,hz?Wd:L,y+2.6,y,c,'rust');for(let i=-2;i<=2;i++)V(hz?x+i*1.1:x,hz?z:z+i*1.1,hz?.08:Wd+.04,hz?Wd+.04:.08,y+2.55,y+.1,0x00000000+(c==RED?0x7a2a1e:0x4a4a3a),'b')};
  /* ---- ground: tarmac patches, oil stains, tracks and cracks ---- */
  const pad=(x0,y0,x1,y1,c)=>{const r=R(x0,y0,x1,y1);V(r[0],r[1],r[2],r[3],.05,0,c||0x7d7466,'b','concrete')};
  pad(860,800,1100,1100);pad(640,1080,800,1260,0x8a8070);pad(1090,1090,1280,1260,0x8a8070);pad(1100,640,1280,800,0x8f8574);pad(700,640,860,780,0x8a8070);
  for(let i=0;i<26;i++){const x=(rnd()-.5)*46,z=(rnd()-.5)*54;V(x,z,1+rnd()*3.5,1+rnd()*3,.04,0,0x3a2c22,'s')}
  for(let i=0;i<14;i++)V((rnd()-.5)*44,(rnd()-.5)*54,.12,2+rnd()*4,.045,0,0x5a4e3a,'b','concrete');
  for(let i=0;i<30;i++)V((rnd()-.5)*48,(rnd()-.5)*56,.5+rnd()*1.2,.5+rnd()*1.2,.3+rnd()*.3,0,0xbfa574,'s');
  /* ---- the central tower: open bay under a steel deck, a tall body above, and a conveyor stair up the south side ---- */
  const T=R(870,830,960,925),TB=R(897,852,943,903);
  for(const sx of[-1,1])for(const sz of[-1,1]){B(T[0]+sx*(T[2]/2-.45),T[1]+sz*(T[3]/2-.45),.7,.7,3.2,0,RUST,'rust');V(T[0]+sx*(T[2]/2-.45),T[1]+sz*(T[3]/2-.45),.9,.9,3.2,0,DRUST,'b','rust')}
  B(T[0],T[1],.7,.7,3.2,0,RUST,'rust');B(T[0]-2.4,T[1],.6,.6,3.2,0,RUST,'rust');B(T[0]+2.4,T[1],.6,.6,3.2,0,RUST,'rust');
  B(T[0],T[1],T[2],T[3],3.6,3.2,STEEL,'metal');                                   /* deck */
  B(TB[0],TB[1],TB[2],TB[3],14.5,3.6,TAN,'metal');                                 /* tower body */
  V(TB[0],TB[1],TB[2]+.4,TB[3]+.4,9.5,3.6,0x7d8590,'b','metal');V(TB[0],TB[1]+TB[3]/2+.25,3,.1,12.6,6.5,0xf2f0e6,'b','plank');V(TB[0],TB[1]+TB[3]/2+.32,2,.05,11.6,8.0,0xc8362a,'e');
  for(const sx of[-1,1])for(let i=0;i<4;i++){V(TB[0]+sx*(TB[2]/2+.05),TB[1]-1.4+i*1.1,.08,.7,6.6,4.6,0x1b2430,'g');V(TB[0]-1.2+i*.8,TB[1]-TB[3]/2-.05,.5,.08,9.2,5.6,0x1b2430,'g')}
  /* upper section with railings, two tall exhaust stacks with a flame */
  V(TB[0],TB[1],TB[2]-1,TB[3]-1,18,14.5,0x8a8f96,'b','metal');V(TB[0]-.8,TB[1],.9,.9,22,18,0xb9a070,'c','metal');V(TB[0]+.8,TB[1],.9,.9,22,18,0xb9a070,'c','metal');V(TB[0]-.8,TB[1],.5,.5,24.5,22,0xff8a30,'k');V(TB[0]-.8,TB[1],.3,.3,25.5,22.6,0xffd070,'e');
  for(let i=0;i<10;i++){const q=i/10*6.28;V(TB[0]+Math.cos(q)*2.5,TB[1]+Math.sin(q)*2.5,.1,.1,15.6,14.5,0x2a2a2e,'b','metal')}V(TB[0],TB[1]-2.5,5.2,.08,15.5,15.4,0x2a2a2e,'b');V(TB[0],TB[1]+2.5,5.2,.08,15.5,15.4,0x2a2a2e,'b');
  /* catwalk bracing under the deck and a ladder up the west leg */
  for(let i=0;i<8;i++){V(T[0]-T[2]/2+.2,T[1]+T[3]/2-.4-i*.8,.05,.05,.3+i*.4,0,YEL,'b')}
  for(let i=0;i<9;i++)V(T[0]-T[2]/2-.12,T[1]+T[3]/2-.8,.04,.5,.4+i*.38,.3+i*.38,YEL,'b');
  crate(T[0]-1.8,T[1]+1.2,1.4,1.4,1.4);crate(T[0]+2,T[1]-1.6,1.2,1.2,1.1,0x6a5a3a);barrel(T[0]+1.3,T[1]+2,DRUST);barrel(T[0]+.5,T[1]+2.4,0x8a2a1a);barrel(T[0]-2.4,T[1]-1.8,0x2a4a6a);
  B(T[0]+1.8,T[1]+1.5,.9,.9,1.2,0,0x6a6a60,'metal');V(T[0]+1.8,T[1]+1.5,.95,.95,1.25,0,0x6a6a60,'b','metal');
  /* conveyor stair: 12 steps (.3 each) up to a bridge that meets the deck at 3.6 */
  const SX=-1.6;MK.stairs(B,SX,Z(1095),2.4,12,'n',0x8a8f96,'metal',.3,.625);
  B(SX,(Z(995)+Z(925))/2,2.4,Z(995)-Z(925),3.6,3.2,0x8a8f96,'metal');
  for(const sd of[-1,1]){V(SX+sd*1.25,(Z(1095)+Z(925))/2+1.2,.08,Z(1095)-Z(925)-2.4,1.1,0,0x6a6f76,'b','metal');for(let i=0;i<12;i++)V(SX+sd*1.25,Z(1095)-.4-i*.625,.08,.08,.3*(i+1)+1.0,.3*i,0x2a2a2e,'b');V(SX+sd*1.25,(Z(995)+Z(925))/2,.08,Z(995)-Z(925),4.7,4.6,0x2a2a2e,'b')}
  for(let i=0;i<6;i++){V(SX,Z(1095)-1+i*1.2,2.5,.14,.3*(2*i+3)+.02,.3*(2*i+3),0xd7a82a,'b')}
  B(SX-1.0,Z(990),.5,.5,3.2,0,RUST,'rust');B(SX+1.0,Z(990),.5,.5,3.2,0,RUST,'rust');B(SX,Z(935),.5,.5,3.2,0,RUST,'rust');
  V(SX,Z(945),.5,.7,.04,0,0x7a2a1e,'b');
  /* ---- tank farm top right: concrete bund, three tanks, pipes and a ramp ---- */
  const TF=R(1130,640,1250,785);V(TF[0],TF[1],TF[2],TF[3],.35,0,0xa8a08c,'b','concrete');
  for(const[px,py]of[[1172,692],[1218,692],[1195,744]]){const x=X(px),z=Z(py);B(x,z,4.2,4.2,7,0,RUST,'rust');V(x,z,4.4,4.4,7,0,0x8c5030,'c','rust');V(x,z,4.3,4.3,7.7,7,0x6a3a24,'k');V(x,z,4.6,4.6,.2,5.2,DRUST,'c');V(x,z,4.6,4.6,.2,2.4,DRUST,'c');V(x+2.4,z,.25,.25,5.5,.3,0x5a5a60,'c')}
  B(TF[0]-2.8,TF[1]+5.2,6,.4,1.0,0,CONC,'concrete');B(TF[0]+4.5,TF[1]+5.2,5,.4,1.0,0,CONC,'concrete');crate(TF[0]-4,TF[1]+3,1.6,1.6,1.3);barrel(TF[0]+5,TF[1]-1,RED);barrel(TF[0]+5.8,TF[1]-.5,RUST);
  V(TF[0],TF[1]-4,10,.35,2.3,1.9,0x5a5a60,'b','metal');for(let i=-4;i<=4;i+=2)V(TF[0]+i,TF[1]-4,.2,.2,2,0,0x4a4a50,'b');
  /* ---- top left sheds (two) ---- */
  const s1=R(748,683,792,767),s2=R(795,688,830,767);
  MK.room(B,{x:s1[0],z:s1[1],w:s1[2],d:s1[3],h:3.2,c:TAN,k:'rust',rc:DRUST,rk:'metal',dr:{s:[[-.4,1.9]],e:[[.8,1.6]]},wn:{n:[[0,1.2]],w:[[-1.4,1.2]]}});
  MK.room(B,{x:s2[0],z:s2[1],w:s2[2],d:s2[3],h:3.0,c:0xb8997a,k:'rust',rc:DRUST,rk:'metal',dr:{s:[[.4,1.9]],w:[[.8,1.6]]},wn:{n:[[0,1.2]],e:[[-1,1.2]]}});
  crate(s1[0]-.3,s1[1]-1.5,1.3,1.3,1.2);barrel(s2[0]+.6,s2[1]-1.8);barrel(s2[0]-.2,s2[1]-1.6,0x2a4a6a);
  /* ---- big shed bottom left with two doors, windows and crates inside ---- */
  const bs=R(683,1090,773,1183);
  MK.room(B,{x:bs[0],z:bs[1],w:bs[2],d:bs[3],h:3.8,c:0xcfb58a,k:'rust',rc:0x6a4a30,rk:'metal',dr:{n:[[.8,2.2]],e:[[-.5,2.2]],w:[[1.5,1.8]]},wn:{s:[[-1.5,1.4],[1.5,1.4]],n:[[-2,1.2]],e:[[2.1,1.2]]}});
  crate(bs[0]-1.8,bs[1]+1.6,1.6,1.6,1.5);crate(bs[0]-1.8,bs[1]+.1,1.2,1.2,1.1,0x6a5a3a);crate(bs[0]+1.8,bs[1]+2.2,1.3,2,1.0,0x6a5a3a);barrel(bs[0]+2.2,bs[1]-1.8);B(bs[0],bs[1]+.5,1.6,.5,1.0,0,0x555a5e,'metal');
  V(bs[0],bs[1],bs[2]-.6,bs[3]-.6,.06,0,0x6a5a46,'b','plank');V(bs[0]+1,bs[1]-2.9,.9,.9,3.7,3.4,0xffe0a0,'e');
  /* ---- two containers bottom left, a container stack bottom centre ---- */
  const c1=R(673,1185,728,1215),c2=R(673,1218,728,1245);container(c1[0],c1[1],1,RED);container(c2[0],c2[1],1,0x4a5a6a);
  const c3=R(876,1215,958,1275);container(c3[0],c3[1],1,0x6b6a45);container(c3[0]+.6,c3[1]+.2,1,RED,2.6);for(let i=0;i<5;i++)B(c3[0]-3.3+i*.3,c3[1]+1.7+i*.3,.4,.4,.4+i*.1,0,0x6a4a2a);
  MK.stairs(B,c3[0]-3.3,c3[1]+3.3,1,8,'n',0x6a4a2a,'plank',.3,.34);   /* pallet ramp */
  /* ---- right shed, with a loading dock ---- */
  const rs=R(1190,827,1280,960);
  MK.room(B,{x:rs[0],z:rs[1],w:rs[2],d:rs[3],h:3.6,c:0xd1b894,k:'rust',rc:0x5a3a28,rk:'metal',dr:{w:[[-2,2],[3,2]],s:[[1.4,2.2]]},wn:{e:[[-2.5,1.4],[.5,1.4],[3.2,1.4]],n:[[0,1.4]]}});
  B(rs[0]-4.4,rs[1]+1.6,2,6,.9,0,CONC,'concrete');crate(rs[0]+1,rs[1]-2,1.5,1.5,1.5);crate(rs[0]-1.4,rs[1]-2.6,1.2,1.2,1.2,0x6a5a3a);barrel(rs[0]+2,rs[1]+3);barrel(rs[0]+2.8,rs[1]+3.2,0x8a2a1a);
  /* ---- guard shack mid left ---- */
  const gs=R(753,878,805,922);MK.room(B,{x:gs[0],z:gs[1],w:gs[2],d:gs[3],h:2.8,c:0xc4a878,k:'rust',rc:DRUST,rk:'metal',dr:{e:[[0,1.6]]},wn:{n:[[0,1]],s:[[0,1]],w:[[0,1]]}});B(gs[0]-1,gs[1],.8,1.8,.9,0,0x6a5a3a,'plank');
  /* ---- long walls on the left: a lane with two gaps ---- */
  MK.wall(B,0,X(700),(Z(712)+Z(1000))/2,Z(1000)-Z(712),.45,0,2.4,[[-4,2.4,0,2.4],[3,2.4,0,2.4]],CONC,'concrete');
  MK.wall(B,1,(X(700)+X(850))/2,Z(810),X(850)-X(700),.45,0,2.4,[[-4,2.4,0,2.4]],CONC,'concrete');
  for(let i=0;i<7;i++)V(X(700),Z(715)+i*3,.7,.5,2.6,2.4,0x8f8878,'b','concrete');
  /* ---- pit and low walls right of centre ---- */
  const pt=R(1005,1010,1075,1050);B(pt[0],pt[1]+pt[3]/2-.2,pt[2],.4,1.25,0,CONC,'concrete');B(pt[0]-pt[2]/2+.2,pt[1],.4,pt[3],1.25,0,CONC,'concrete');B(pt[0]+pt[2]/2-.2,pt[1],.4,pt[3],1.25,0,CONC,'concrete');
  V(pt[0],pt[1],pt[2]-.8,pt[3]-.8,.06,0,0x2a2118,'b','concrete');crate(pt[0]+.4,pt[1]-.3,1.4,1.4,1.3);barrel(pt[0]-1.4,pt[1]+.2,BLK);B(pt[0]+pt[2]/2+.6,pt[1]+.2,.5,pt[3]+.4,1.0,0,CONC,'concrete');
  /* ---- barrier strip right of centre ---- */
  jersey(X(1075),Z(965),1,4);jersey(X(1130),Z(965),1,2);
  /* ---- tanker truck and pickup bottom right, derelict car upper left ---- */
  B(18,12.4,2.6,2.6,2.9,0,WHITE,'metal');V(18,11.6,2.5,.1,2.4,1.6,0x2a3a4a,'g');V(18,12.4,2.7,2.7,.2,2.9,0x6a6a60,'b','metal');B(18,17.4,2.6,7,2.7,.4,0x9a5a2a,'rust');V(18,17.4,2.7,7.1,2.9,2.7,0x7a4a26,'b','rust');
  for(const sx of[-1,1])for(const zz of[11.8,16,18.5])V(18+sx*1.4,zz,.35,.9,.9,0,BLK,'c');for(const zz of[14,20.7])V(18,zz,2.65,.15,2.7,.4,0x5a3a20,'b');V(18,14.4,.8,.4,3.4,2.9,0x4a4a50,'c');
  B(7.7,19.3,2.2,4.8,1.1,0,0x4a4f52,'metal');B(7.7,18.2,2,1.8,1.85,.9,0x3a3f42,'metal');V(7.7,17.3,1.9,.08,1.75,1.1,0x1a2430,'g');for(const sx of[-1,1])for(const zz of[17.9,20.5])V(7.7+sx*1.05,zz,.3,.7,.7,0,BLK,'c');
  B(-9,-24,2,4.4,1.3,0,0x6a5a4a,'rust');V(-9,-24,1.95,4.3,1.9,1.2,0x4a3f35,'b','rust');B(14,-3,4.4,2,1.3,0,0x3a4a5a,'rust');V(14,-3,3,1.9,1.95,1.2,0x2a3a4a,'b','rust');
  /* ---- scattered cover: barrels, crates, sandbags, jersey barriers, pallets ---- */
  jersey(-4,-13,1,3);jersey(10,-8,0,2);jersey(-8,5,0,2);jersey(-23,3,0,2);jersey(23,-10,0,2);jersey(0,26,1,3);jersey(-22,-23,1,2);
  sand(-1,15,3.4,1);sand(-9,22,1,3.2);sand(13,6,3.2,1);sand(21,22,1,3.2);sand(-12,-5.8,1,3);
  barrel(-6,9.5);barrel(-6.8,9.8,0x2a4a6a);barrel(3,10,0x8a2a1a);barrel(12,-2.5);barrel(-3,-15.8,DRUST);barrel(-1.8,-16.3);barrel(10.5,24,0x2a4a6a);barrel(22,6,RUST);barrel(22.8,6.4,RED);barrel(-21,-8.5,RUST);
  crate(-2,9,1.6,1.6,1.4);crate(8,12,1.4,1.4,1.2,0x6a5a3a);crate(1.5,-12,1.3,1.3,1.2);crate(-15,-9,1.5,1.5,1.5);crate(-14.5,-7.2,1.2,1.2,1.1,0x6a5a3a);crate(10,26,1.5,1.5,1.4);crate(22,-5,1.3,1.3,1.1,0x6a5a3a);crate(-10,26,1.7,1.7,1.5);
  B(-6.3,-12.8,1.5,.8,.9,0,0x7a7a7a,'metal');B(4,-8,.9,.9,1.9,0,0x5a5a60,'metal');B(12,18.5,.6,.6,2.2,0,0x5a5a60,'metal');
  /* ---- pipes on the ground (low, mantle-able), sign posts, lamps, hazard lines, tyres ---- */
  B(-3,-22,7,.7,.7,0,0x6a4a34,'rust');V(-3,-22,7.2,.8,.8,0,0x7a5a40,'b','rust');B(11,-26,.7,6,.7,0,0x6a4a34,'rust');V(11,-26,.8,6.2,.8,0,0x7a5a40,'b','rust');
  for(const[x,z]of[[-12,-10],[4,-25],[14,10],[-6,19],[22,-17],[-20,24]]){V(x,z,.18,.18,5.2,0,0x3a3a3e,'c');V(x+.5,z,1.2,.5,5.4,4.9,0x2a2a2e,'b');V(x+.9,z,.35,.35,5.0,4.8,0xfff0c0,'e')}
  for(const[x,z]of[[-18.8,-5],[17,-2.6],[2,19]]){for(let i=0;i<3;i++)B(x,z,.9,.9,.5+i*.5,0,0x1b1b1c,'c'),V(x,z,1,1,.5+i*.5,i*.5,0x1b1b1c,'c')}
  for(let i=0;i<6;i++){V(-23+i*2.6,26.3,1.2,.18,.06,0,i%2?YEL:BLK,'b')}for(let i=0;i<6;i++)V(23,-26+i*2.6,.18,1.2,.06,0,i%2?YEL:BLK,'b');
  /* ---- the fence ---- */
  barrierLine(a,-25.6,-29.6,25.6,-29.6,0);barrierLine(a,-25.6,29.6,25.6,29.6,1);barrierLine(a,-25.6,-29.6,-25.6,29.6,2);barrierLine(a,25.6,-29.6,25.6,29.6,0);
  return a},
 /* ---- the world beyond the fence ---- */
 deco(){const o=[],rnd=MK.rnd(23),V=(x,z,w,d,h,y0,c,s,t)=>o.push([x,z,w,d,h,y0||0,c,s||'b',t]),RUST=0x8a4a2a,DR=0x5a3320,SD=[0xcdb78a,0xc7b080,0xd3bd90,0xbfa874];
  /* dunes in rings, bigger further out, with a pale crest on top */
  for(let r=0;r<150;r++){const q=rnd()*6.283,d=34+rnd()*100,x=Math.cos(q)*d,z=Math.sin(q)*d*1.05;if(Math.abs(x)<28&&Math.abs(z)<32)continue;const w=14+rnd()*30+d*.12,hh=2+rnd()*7+d*.045;V(x,z,w,w*(.6+rnd()*.8),hh-hh*.4,-hh*.8,SD[r&3],'s','sand')}
  for(let i=0;i<12;i++){const q=i/12*6.283+.2;V(Math.cos(q)*125,Math.sin(q)*125,80,60,34,-8,0xc2a874,'s','sand')}
  for(let r=0;r<80;r++){const q=rnd()*6.283,d=30+rnd()*50,x=Math.cos(q)*d,z=Math.sin(q)*d;if(Math.abs(x)<27.5&&Math.abs(z)<31.5)continue;V(x,z,.6+rnd()*1.6,.5+rnd()*1.4,.5+rnd()*1.1,0,0x8a7a62,'s')}
  /* pipeline along the west side with flanges, supports and a riser */
  for(let i=0;i<6;i++){const z=-52+i*20;V(-34,z+7,2.4,16.4,2.7,.4,0x8a6a4a,'b','rust');V(-34,z-1.5,2.8,.5,2.9,.2,0x5a4a3a,'b');V(-34,z+15,2.8,.5,2.9,.2,0x5a4a3a,'b');for(const dz of[3,11])V(-34,z+dz,.7,.7,.5,0,0x4a3a2a,'b','concrete')}
  V(-34,-60,2.4,2.4,5,.4,0x8a6a4a,'b','rust');V(-34,66,2.4,2.4,5,.4,0x8a6a4a,'b','rust');V(-41,20,2.2,30,2.4,.2,0x7a5a3e,'b','rust');V(-41,36,2.6,.6,2.9,.1,0x4a3a2a,'b');
  /* the derrick: four legs narrowing upward, rings and X braces, crown block and a platform */
  const lat=(x,z,hh,w0)=>{for(let lv=0;lv<10;lv++){const y=lv*hh/10,w=w0*(1-lv*.075),y1=y+hh/10;for(const sx of[-1,1])for(const sz of[-1,1])V(x+sx*w/2,z+sz*w/2,.32,.32,y1,y,0x8a5a3a,'b','rust');V(x,z+w/2,w,.14,y+.2,y,0x7a4a2a,'b');V(x,z-w/2,w,.14,y+.2,y,0x7a4a2a,'b');V(x+w/2,z,.14,w,y+.2,y,0x7a4a2a,'b');V(x-w/2,z,.14,w,y+.2,y,0x7a4a2a,'b');
    for(const sd of[-1,1]){V(x+sd*w*.25,z+w/2,.1,.1,y1,y,0x6a3a22,'b');V(x+sd*w*.25,z-w/2,.1,.1,y1,y,0x6a3a22,'b')}}V(x,z,w0*.4,w0*.4,hh+2.4,hh,0x5a5a60,'b','metal');V(x,z,w0*.8,w0*.8,hh*.62,hh*.6,0x6a6a60,'b','metal')};
  lat(-38,-38,34,7);lat(46,-52,20,4.6);
  /* power pylons on a diagonal, with a catenary of dark cables suggested by thin beams */
  for(let i=0;i<5;i++){const x=-70+i*34,z=60-i*30;lat(x,z,22,3.6);V(x,z,10,.3,21.2,20.6,0x2a2a2e,'b');V(x,z,8,.3,18.5,18,0x2a2a2e,'b')}
  /* the rail line to the east: track, sleepers, tank cars, a locomotive and a boxcar */
  V(40,0,.2,160,.2,0,0x3a3a3e,'b');V(41.6,0,.2,160,.2,0,0x3a3a3e,'b');for(let i=-38;i<38;i++)V(40.8,i*2.1,2.8,.5,.22,0,0x3a2a1e,'b','plank');
  const car=(z,len,c,h)=>{V(40.8,z,2.9,len,h+.6,.7,c,'b','rust');V(40.8,z,2.4,len-1.2,h+1.2,h+.5,0x4a3a2a,'b','rust');for(const dz of[-1,1])for(const dx of[-1,1])V(40.8+dx*1.1,z+dz*len*.32,.4,1.6,.9,0,0x1b1b1c,'c')};
  car(-52,11,0x3a3a3e,2.6);car(-39,11,0x6a2a1e,2.8);car(-26,12,0x2a2a2e,2.4);car(-12,10,0x5a3a22,2.6);car(6,12,0x3a3a3e,2.6);car(24,11,0x6a4a2a,2.8);car(40,12,0x4a4a50,2.6);
  V(40.8,-66,3.4,13,4.6,.7,0x2a2f36,'b','metal');V(40.8,-66,2.8,6,5.6,4.2,0x1b2028,'b');V(40.8,-60.4,3.5,2.2,3.4,.6,0xd7a82a,'b');
  /* shipping containers stacked east and south east beyond the fence */
  for(let i=0;i<6;i++){const c=[0x9a3a2a,0x3a5a6a,0x6b6a45,0x8a5a2a][i&3];V(32,-4+i*6.4,2.7,6.1,2.7,0,c,'b','rust');if(i%2==0)V(32,-4+i*6.4+.5,2.7,6,5.4,2.7,[0x3a5a6a,0x9a3a2a][(i>>1)&1],'b','rust')}
  /* rocky cliff and rubble to the south with scrub and a ruined shed */
  for(let r=0;r<40;r++){const x=(rnd()-.5)*70,z=36+rnd()*18,w=3+rnd()*7;V(x,z,w,w*.8,w*.7,-w*.2,0x8a7a62+((rnd()*20|0)<<8),'s')}
  for(let r=0;r<30;r++){const x=(rnd()-.5)*62,z=33+rnd()*14;V(x,z,.8+rnd(),.8+rnd(),.5+rnd()*.7,0,0x6a6a3a,'s')}
  V(24,40,6,5,3,0,0x9a7a52,'b','rust');V(24,40,6.4,5.4,3.3,3,0x5a3a28,'b','metal');V(-6,45,4,3,2.6,0,0x8a6a4a,'b','rust');
  /* palms near the south east corner and by the fence */
  const palm=(x,z)=>{V(x,z,.35,.35,5,0,0x6a4a2a,'c');for(let i=0;i<7;i++){const q=i/7*6.283;V(x+Math.cos(q)*1.1,z+Math.sin(q)*1.1,2.6,.35,5.4-Math.abs(Math.sin(q))*.2,5,0x4a6a2a,'b')}V(x,z,.7,.7,5.5,4.9,0x3a5a22,'s')};
  palm(36,28);palm(38,31);palm(-30,38);palm(33,-36);for(let i=0;i<8;i++){const q=rnd()*6.283;V(Math.cos(q)*60,Math.sin(q)*60,1.2,1.2,1.4,0,0x6a6a3a,'s')}
  /* fence posts and sagging mesh outside the play wall for atmosphere, warning signs and a gate */
  for(let i=-12;i<=12;i++){V(i*2.1,-30.3,.12,.12,2.6,0,0x6a6a6e,'b');V(i*2.1,30.3,.12,.12,2.6,0,0x6a6a6e,'b')}for(let i=-14;i<=14;i++){V(-26.3,i*2.1,.12,.12,2.6,0,0x6a6a6e,'b');V(26.3,i*2.1,.12,.12,2.6,0,0x6a6a6e,'b')}
  V(0,-30.4,5,.08,2.5,.2,0xc8362a,'b');V(-8,30.4,2.4,.08,1.6,.8,0xe8d040,'b');V(26.4,10,.08,2.4,1.6,.8,0xe8d040,'b');
  /* wrecked vehicle and drums west of the fence, a burnt-out bus on the north side */
  V(-30,-12,4.6,2.2,1.5,0,0x4a3f35,'b','rust');V(-30,-12,2.6,2,2.2,1.2,0x2a2a2e,'b');V(-4,-36,10,2.7,3,.3,0x6a5a3a,'b','rust');V(-4,-36,9.2,2.6,3.4,3,0x4a4a46,'b','metal');
  for(let i=0;i<5;i++)V(-29+i*.8,6+(i%2)*.7,.7,.7,1.05,0,i%2?0x8a2a1a:RUST,'c','rust');
  return o}};
