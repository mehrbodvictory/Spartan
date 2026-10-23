/* ===================== lanes.js ===================== */
/* ---------- the three lane layout ----------
   Every multiplayer map is built as three main pathways running from one team's side to the other: a north lane, a middle lane and a south lane. Long dividers (shipping containers, wrecks,
   stone walls, ruined walls, rock ridges, hedges, adobe walls, depending on the map) separate the lanes, with crossover gaps every so often so players can rotate between lanes. Each lane
   also gets its own tint on the ground so it reads at a glance. Dividers are only placed where nothing already stands, so the map's own buildings act as divider pieces too.
   The Hollow Estate zombies map is a survival layout and is not divided. ---------- */
const LANES={
 Rust:{zs:[-10,10],x:[-20,20],style:'container',seg:6,gap:4.4,col:[0x9a3a2a,0x3a5a6a,0x6b6a45,0x8a5a2a],tint:[0x8a7a5a,0x9a8660,0x7a7258]},
 Decay:{zs:[-15,16],x:[-40,40],style:'wreck',seg:8,gap:4.6,col:[0x6a6a2a,0x3a4a5a,0x5a2a2a,0x4a4a4a],tint:[0x5a5a52,0x4e4e4a,0x56564c]},
 Blockfort:{zs:[-9.5,9.5],x:[-27,27],style:'stone',seg:8,gap:4.4,col:[0x9a958a],tint:[0x6a6a60,0x7a7468,0x6a6a60]},
 Pillars:{zs:[-11,11],x:[-31,31],style:'ruin',seg:7,gap:4.6,col:[0xd0c8b0,0xc0b69c],tint:[0xb0a688,0xc2b894,0xb0a688]},
 Canyon:{zs:[-6,8.5],x:[-34,34],style:'rock',seg:8,gap:5,col:[0xb9774c,0xa8683e,0xc98858],tint:[0xc08a58,0xd0a070,0xb87a4a]},
 Suburbia:{zs:[-19,19],x:[-45,45],style:'hedge',seg:9,gap:5,col:[0x3f7a34],tint:[0x5a8a46,0x66954e,0x5a8a46]},
 Boomtown:{zs:[-8,8],x:[-44,44],style:'adobe',seg:9,gap:5,col:[0xc2a878,0xb8996a],tint:[0xb59d6c,0xc0a878,0xb59d6c]}};
MK.lanes=function(a,v,name){const C_=LANES[name];if(!C_)return;const rnd=MK.rnd(name.length*31+7),B=(x,z,w,d,h,y0,c,k)=>a.push([x,z,w,d,h,y0||0,c,k]),V_=(x,z,w,d,h,y0,c,s,t)=>v.push([x,z,w,d,h,y0||0,c,s||'b',t]),pick=q=>q[rnd()*q.length|0];
 const free=(x,z,w,d,m)=>!a.some(b=>b[4]>.5&&(b[5]||0)<2&&Math.abs(x-b[0])<(w+b[2])/2+m&&Math.abs(z-b[1])<(d+b[3])/2+m);
 const M=MAPS[name],hx=M.H||40;
 /* ground tint ribbons: one per lane */
 const zb=[-hx,C_.zs[0],C_.zs[1],hx],ext=C_.x[1]*1.15;for(let i=0;i<3;i++){const z0=Math.max(zb[i],-(M.H-4)),z1=Math.min(zb[i+1],M.H-4);V_(0,(z0+z1)/2,ext*2,z1-z0-.6,.045,0,C_.tint[i],'b','concrete')}
 const piece=(x,z,len,zi)=>{const c=pick(C_.col);
  if(C_.style=='container'){B(x,z,len,2.5,2.6,0,c,'rust');for(let i=-2;i<=2;i++)V_(x+i*1.15,z,.08,2.56,2.55,.1,0x2a2a2a,'b');if(rnd()<.4)V_(x,z,len-.4,2.4,2.7,2.6,pick(C_.col),'b','rust')}
  else if(C_.style=='wreck'){B(x,z,len,2.8,2.8,0,c,'rust');V_(x,z,len-.3,2.9,3.0,2.8,0x2a2a2e,'b','metal');for(let i=-3;i<=3;i++)V_(x+i*1.1,z+1.42,.9,.05,2.4,1.4,0x1a2a32,'g');B(x+len/2+.9,z+.2,1.8,.8,1.05,0,0xb5b0a2,'concrete')}
  else if(C_.style=='stone'){B(x,z,len,1.3,3.6,0,c,'brick');for(let i=-len/2+.6;i<len/2;i+=1.5)V_(x+i,z,.9,1.5,4.3,3.6,c,'b','brick');V_(x,z-.8,len,.2,.9,0,0x4a4a44,'b','concrete')}
  else if(C_.style=='ruin'){B(x,z,len,1.2,2.6+rnd()*1.6,0,pick(C_.col),'concrete');for(let i=0;i<5;i++)V_(x+(rnd()-.5)*len,z+(rnd()>.5?.65:-.65),.5+rnd(),.1,.8+rnd()*2.4,0,pick([0x4f7a3a,0x3a5a2a,0x6a8a3a]),'b','grass')}
  else if(C_.style=='rock'){B(x,z,len,3.2,3.4+rnd()*1.6,0,c,'sand');for(let i=0;i<3;i++)V_(x+(rnd()-.5)*len*.8,z+(rnd()-.5)*2,2.4,2,4.6+rnd()*1.2,2,pick(C_.col),'s','sand')}
  else if(C_.style=='hedge'){B(x,z,len,1.4,2.2,0,0x3f7a34,'grass');V_(x,z,len+.2,1.6,2.35,1.4,0x4f8a3c,'b','grass');for(let i=0;i<6;i++)V_(x+(rnd()-.5)*len,z+(rnd()-.5)*1.2,.6,.6,2.5,2,pick([0xe8c030,0xd84a6a,0xffffff]),'s')}
  else{B(x,z,len,1.2,3,0,c,'stucco');V_(x,z,len+.1,1.4,3.3,3,0x9a8460,'b','concrete');for(let i=-len/2+1.2;i<len/2;i+=3)V_(x+i,z-.65,.9,.05,2.2,.9,0x5a3a22,'b')}};
 for(let k=0;k<2;k++){const z=C_.zs[k],step=C_.seg+C_.gap;let x=C_.x[0]+(k?step*.5:0);while(x+C_.seg<=C_.x[1]){const len=C_.seg*(.8+.4*rnd()),cx=x+len/2,jz=z+(rnd()-.5)*.8;if(free(cx,jz,len,2.2,1.0))piece(cx,jz,len,k);x+=step}}}
for(const n of Object.keys(LANES)){const M=MAPS[n];if(!M||!M.b)continue;const _b=M.b;M.b=function(){const a=_b.apply(this,arguments);this._v=this._v||[];MK.lanes(a,this._v,n);return a}}
