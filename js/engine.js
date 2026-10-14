/* ---------- engine ---------- */
const R=new THREE.WebGLRenderer({antialias:true});R.setPixelRatio(Math.min(devicePixelRatio,1.5));R.setSize(innerWidth,innerHeight);document.body.prepend(R.domElement);
const S=new THREE.Scene(),C=new THREE.PerspectiveCamera(78,innerWidth/innerHeight,.1,200);C.rotation.order='YXZ';S.add(C);
S.add(new THREE.HemisphereLight(0xffffff,0x445566,.85));const sun=new THREE.DirectionalLight(0xffffff,.7);sun.position.set(30,50,20);S.add(sun);
addEventListener('resize',()=>{R.setSize(innerWidth,innerHeight);C.aspect=innerWidth/innerHeight;C.updateProjectionMatrix()});
const sg=new THREE.SphereGeometry(1,12,8),bg=new THREE.BoxGeometry(1,1,1);
const gun=new THREE.Group(),gb=new THREE.Mesh(bg,new THREE.MeshLambertMaterial()),gf=new THREE.Mesh(bg,new THREE.MeshBasicMaterial({color:0xffdd66}));
gf.scale.set(.06,.06,.12);gun.add(gb,gf);C.add(gun);
let mapG,bx=[],H=30,bots=[],fx=[],grs=[],wp=[],cur=0,rel=0,nf=0,P={},yaw=0,pitch=0,kick=0,fr=1,AA=1,sens=1,run=0,paused=0,over=0,mode,t0=0,kills=0,deaths=0,shots=0,hits=0,wave=0,tl=90,gc=0,dmA=0,hmT=0,msT=0,rt=0,lastHit=0,tg=null;
const key={},CONE=.06;let trig=0,fresh=0;
let ac;function beep(f,d,ty,v){try{ac=ac||new AudioContext();const o=ac.createOscillator(),g=ac.createGain();o.type=ty||'square';o.frequency.setValueAtTime(f,ac.currentTime);o.frequency.exponentialRampToValueAtTime(f/2,ac.currentTime+d);g.gain.setValueAtTime((v||.05)*vol,ac.currentTime);g.gain.exponentialRampToValueAtTime(.0001,ac.currentTime+d);o.connect(g).connect(ac.destination);o.start();o.stop(ac.currentTime+d)}catch(e){}}
function eff(k,at){const w={...W[k]};for(const a of at)for(const p in A[a])if(p!='t')w[p]*=A[a][p];w.m=Math.round(w.m);w.k=k;return w}
function buildMap(){if(mapG)S.remove(mapG);const M=MAPS[sel.map];H=M.H;mapG=new THREE.Group();S.add(mapG);S.background=new THREE.Color(M.sky);S.fog=new THREE.Fog(M.sky,30,110);bx=[];
 const f=new THREE.Mesh(new THREE.PlaneGeometry(H*2,H*2),new THREE.MeshLambertMaterial({color:M.gr}));f.rotation.x=-Math.PI/2;mapG.add(f);
 const gr=new THREE.GridHelper(H*2,H,0x000000,0x000000);gr.position.y=.02;gr.material.transparent=true;gr.material.opacity=.18;mapG.add(gr);
 const cm={};for(const [x,z,w,d,h,y0=0,col] of M.b()){bx.push({x0:x-w/2,x1:x+w/2,z0:z-d/2,z1:z+d/2,h,y0});const k=col==null?'h'+h:col;const m=new THREE.Mesh(bg,cm[k]||(cm[k]=new THREE.MeshLambertMaterial({color:col==null?new THREE.Color(M.bc).offsetHSL(0,0,(h-2)*.025):new THREE.Color(col)})));m.scale.set(w,h-y0,d);m.position.set(x,(h+y0)/2,z);mapG.add(m)}
 for(const [x,z,w,d] of[[0,-H-1,2*H+4,2],[0,H+1,2*H+4,2],[-H-1,0,2,2*H],[H+1,0,2,2*H]]){const m=new THREE.Mesh(bg,new THREE.MeshLambertMaterial({color:M.bc}));m.scale.set(w,10,d);m.position.set(x,5,z);mapG.add(m)}}
function mv(o,dx,dz,r){o.x+=dx;o.z+=dz;for(const b of bx){if((o.y||0)>=b.h-.31||(o.y||0)+1.8<=(b.y0||0))continue;if(o.x>b.x0-r&&o.x<b.x1+r&&o.z>b.z0-r&&o.z<b.z1+r){const c=[o.x-(b.x0-r),b.x1+r-o.x,o.z-(b.z0-r),b.z1+r-o.z],i=c.indexOf(Math.min(...c));if(i==0)o.x=b.x0-r;else if(i==1)o.x=b.x1+r;else if(i==2)o.z=b.z0-r;else o.z=b.z1+r}}o.x=cl(o.x,-H+r,H-r);o.z=cl(o.z,-H+r,H-r)}
function gnd(o){let g=0;for(const b of bx)if(o.x>b.x0-.3&&o.x<b.x1+.3&&o.z>b.z0-.3&&o.z<b.z1+.3&&b.h<=o.y+.31&&b.h>g)g=b.h;return g}
function rb(o,d,b){let t0=0,t1=1e9,a,c,e;e=d.x;if(Math.abs(e)<1e-8){if(o.x<b.x0||o.x>b.x1)return 1e9}else{a=(b.x0-o.x)/e;c=(b.x1-o.x)/e;if(a>c){e=a;a=c;c=e}if(a>t0)t0=a;if(c<t1)t1=c;if(t0>t1)return 1e9}
 e=d.y;if(Math.abs(e)<1e-8){if(o.y<(b.y0||0)||o.y>b.h)return 1e9}else{a=((b.y0||0)-o.y)/e;c=(b.h-o.y)/e;if(a>c){e=a;a=c;c=e}if(a>t0)t0=a;if(c<t1)t1=c;if(t0>t1)return 1e9}
 e=d.z;if(Math.abs(e)<1e-8){if(o.z<b.z0||o.z>b.z1)return 1e9}else{a=(b.z0-o.z)/e;c=(b.z1-o.z)/e;if(a>c){e=a;a=c;c=e}if(a>t0)t0=a;if(c<t1)t1=c;if(t0>t1)return 1e9}return t0}
function castW(o,d,max){let t=max;if(d.y<0)t=Math.min(t,-o.y/d.y);for(const b of bx)t=Math.min(t,rb(o,d,b));return t}
function rs(o,d,c,r){const oc=o.clone().sub(c),b=oc.dot(d),D=b*b-(oc.dot(oc)-r*r);if(D<0)return 1e9;const t=-b-Math.sqrt(D);return t>0?t:1e9}
const aimDir=()=>{const p=pitch+kick;return V(-Math.sin(yaw)*Math.cos(p),Math.sin(p),-Math.cos(yaw)*Math.cos(p))};
function findT(){const o=C.position,d=aimDir();let best=null,ba=9;if(AA<=0)return null;for(const b of bots){if(!b.al||ally(b))continue;const v=V(b.x-o.x,1.1-o.y,b.z-o.z),D=v.length();if(D>55)continue;v.divideScalar(D);const a=Math.acos(Math.min(1,v.dot(d))),cone=CONE*AA*(1-D/75);if(a<cone&&a<ba&&castW(o,v,D)>=D-.9){ba=a;best={b,v,a,cone}}}return best}
function tr(o,d,len,col,life){const g=new THREE.BufferGeometry().setFromPoints([o.clone().add(d.clone().multiplyScalar(.6)).add(V(0,-.12,0)),o.clone().add(d.clone().multiplyScalar(len))]);const m=new THREE.Line(g,new THREE.LineBasicMaterial({color:col}));S.add(m);fx.push({m,l:life||.06,line:1})}
