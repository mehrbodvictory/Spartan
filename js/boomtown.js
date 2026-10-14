/* ---------- Boomtown (large): bat-wing layout traced from the reference mini-map; two enterable two-story houses, cars on the central street ---------- */
(()=>{const S1=1.4,N=40,H0=40*S1,CS=2*H0/N;
const PO=[[-29.25,-16.35],[-11.6,-10.1],[-6.4,-13.1],[.75,-15],[8.6,-12.75],[12,-11.6],[29.25,-16.1],[34.9,-7.3],[37.9,2.25],[11.25,9.75],[6.75,8.85],[6.4,15.6],[-4.9,15.75],[-5.25,9.75],[-10.5,7.9],[-11.25,10.5],[-37.5,1.9],[-33.75,-9.75]].map(([x,z])=>[x*S1,z*S1]);
const inside=(x,z)=>{let c=0;for(let i=0,j=PO.length-1;i<PO.length;j=i++){const[a,b]=PO[i],[p,q]=PO[j];if((b>z)!=(q>z)&&x<(p-a)*(z-b)/(q-b)+a)c=!c}return c};
MAPS.Boomtown={d:'Large bat-wing suburb: two 2-story houses, cars on the central street',H:H0,sky:0xe3c9a0,gr:0xb59d6c,bc:0xc2b48f,fb:[[-37.8,-1.4],[43.4,-2.8]],b(){
 const a=[],bxr=(x0,x1,z0,z1,top,y0,col)=>a.push([(x0+x1)/2,(z0+z1)/2,x1-x0,z1-z0,top,y0,col]);
 /* wall along x (hz=1) or z (hz=0) with openings [centre,width,bottom,top] */
 const wall=(hz,cx,cz,len,t,y0,y1,ops,col)=>{const c0=(hz?cx:cz)-len/2;let cur=c0;const add=(s,e,lo,hi)=>{if(e-s<.02||hi-lo<.02)return;const c=(s+e)/2,l=e-s;a.push(hz?[c,cz,l,t,hi,lo,col]:[cx,c,t,l,hi,lo,col])};
  for(const[c,w,b,tp]of ops.slice().sort((p,q)=>p[0]-q[0])){const s=(hz?cx:cz)+c-w/2,e=s+w;add(cur,s,y0,y1);add(s,e,y0,b);add(s,e,tp,y1);cur=e}add(cur,c0+len,y0,y1)};
 /* two-story house; s=+1 when the street is on the +x side, -1 when on the -x side */
 const house=(cx,cz,w,d,s,col,roof)=>{const T=.4,hx=w/2,hz=d/2,xi=cx+s*hx,xo=cx-s*hx,L=(h,x,z,len,y0,y1,ops)=>wall(h,x,z,len,T,y0,y1,ops,col);
  L(0,xi,cz,d,0,3.2,[[-5.5,2,1,2.4],[0,1.9,0,2.5],[5.5,2,1,2.4]]);L(0,xi,cz,d,3.5,6.5,[[-5.5,2.2,4.5,6],[0,2.2,4.5,6],[5.5,2.2,4.5,6]]);
  L(0,xo,cz,d,0,3.2,[[-4,1.9,0,2.5],[4.5,2,1,2.4]]);L(0,xo,cz,d,3.5,6.5,[[-4,2.2,4.5,6],[4.5,2.2,4.5,6]]);
  for(const zz of[cz-hz,cz+hz]){L(1,cx,zz,w,0,3.2,[[0,2,1,2.4]]);L(1,cx,zz,w,3.5,6.5,[[0,2.2,4.5,6]])}
  const xs=xo+s*1.6,zs=cz+hz-.7,zn=zs-6.05;for(let i=0;i<11;i++)bxr(xs-1.1,xs+1.1,zn+.55*i,zn+.55*(i+1),(i+1)*.3,0,0x8a6a45);
  const hx0=xs-1.1,hx1=xs+1.1,hz0=zn,hz1=zs+.3,x0=cx-hx,x1=cx+hx,z0=cz-hz,z1=cz+hz,fl=0x9a948a;
  bxr(x0,hx0,z0,z1,3.5,3.2,fl);bxr(hx1,x1,z0,z1,3.5,3.2,fl);bxr(hx0,hx1,z0,hz0,3.5,3.2,fl);bxr(hx0,hx1,hz1,z1,3.5,3.2,fl);
  bxr(x0,x1,z0,z1,6.8,6.5,roof);bxr(cx-1.7,cx+1.7,cz+1.45,cz+2.55,.9,0,0x6b5b4b);bxr(cx-1,cx+1,cz-2.6,cz-1.4,4.4,3.5,0x5a4a3a)};
 /* cars: lower body + dark cabin (vans are one tall box) */
 const car=(x,z,alongZ,len,col,van)=>{const W=1.9,bw=alongZ?W:len,bd=alongZ?len:W;if(van){a.push([x,z,alongZ?2.3:len,alongZ?len:2.3,2.3,0,col]);return}
  a.push([x,z,bw,bd,1,0,col]);a.push([x,z,alongZ?W*.9:len*.5,alongZ?len*.5:W*.9,1.65,1,0x27333c])};
 for(const[x,z,w,d,h]of[[-31.4,-7.75,5.8,4.3,4],[-26.25,3.9,4.1,4,3.5],[-23.45,-13.5,2.9,2.2,3],[21.9,-12.3,3.35,3.9,3.5],[27.55,4.3,1.9,2.35,3]])a.push([x*S1,z*S1,w*S1,d*S1,h]);
 for(const[x,z]of[[-6,-3],[7,-6],[24,0],[-24,-3]])a.push([x*S1,z*S1,2.6,2.6,1]);
 for(const[x,z,az,l,c,v]of[[2.7,-.3,1,7,0xd9d4c4,1],[-2,8.7,1,4.6,0xb23a2e],[-1.1,-12.3,1,4.6,0x2f5f9e],[1.2,19.5,0,4.6,0xd9b13b],[7,-4,0,4.6,0x3a7a4a],[-6,3,0,4.6,0x8a8d93],[5,13,1,4.6,0xb23a2e],[-4,-7,0,4.6,0xd9b13b]])car(x,z,az,l,c,v);
 house(-18.2,-.7,15,17,1,0x9fc49a,0x6b7a62);house(21.3,-.7,15,17,-1,0xd9c97c,0x7a5a4a);
 /* boundary walls following the traced outline */
 const rows=[];for(let j=0;j<N;j++){let s=-1;for(let i=0;i<=N;i++){const o=i<N&&!inside(-H0+(i+.5)*CS,-H0+(j+.5)*CS);if(o&&s<0)s=i;if(!o&&s>=0){rows.push([s,i,j]);s=-1}}}
 const open={},out=[];for(const[i0,i1,j]of rows){const k=i0+','+i1,o=open[k];if(o&&o[3]==j)o[3]=j+1;else{const q=[i0,i1,j,j+1];open[k]=q;out.push(q)}}
 for(const[i0,i1,j0,j1]of out)a.push([-H0+(i0+i1)/2*CS,-H0+(j0+j1)/2*CS,(i1-i0)*CS,(j1-j0)*CS,9]);return a}};
try{const sv=JSON.parse(localStorage.getItem('sd-load'));if(sv&&sv.sel&&(sv.sel.map=='Boomtown'||sv.sel.map=='Nuketown')){sel.map='Boomtown';ui()}}catch(e){}})();
