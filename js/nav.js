/* ===================== nav.js ===================== */
/* ---------- real navigation for zombies and Multiplayer bots ----------
   A 1 unit grid of the whole map where every cell closer than 0.62 to a wall is blocked (agents have radius 0.45), so anything that follows a path of free cells cannot clip a corner.
   Zombies share one Dijkstra flow field per player and follow it with look-ahead; bots run A* with string pulling (the shortest straight-line path through the free cells).
   Both use grid line-of-sight to cut corners safely, and an unstick routine (side step, re-plan, finally snap to the nearest free cell) so nobody stays wedged. */
const NAV={n:0,g:null,r:.62,st:null,gs:null,par:null,stamp:0};
function navBuild(){const n=Math.ceil(H*2),g=new Uint8Array(n*n),r=NAV.r;
 for(const k of bx){if(k.h<=.5||(k.y0||0)>=2)continue;const i0=Math.max(0,Math.floor(k.x0-r+H)),i1=Math.min(n-1,Math.floor(k.x1+r+H)),j0=Math.max(0,Math.floor(k.z0-r+H)),j1=Math.min(n-1,Math.floor(k.z1+r+H));
  for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const cx=i+.5-H,cz=j+.5-H;if(cx>k.x0-r&&cx<k.x1+r&&cz>k.z0-r&&cz<k.z1+r)g[j*n+i]=1}}
 for(let i=0;i<n;i++){g[i]=g[(n-1)*n+i]=g[i*n]=g[i*n+n-1]=1}
 NAV.n=n;NAV.g=g;NAV.st=new Int32Array(n*n);NAV.gs=new Float64Array(n*n);NAV.par=new Int32Array(n*n);NAV.stamp=0}
const navCell=(x,z)=>{const n=NAV.n;return[cl(Math.floor(x+H),0,n-1),cl(Math.floor(z+H),0,n-1)]},navCtr=(i,j)=>[i+.5-H,j+.5-H];
function navSnap(i,j){const n=NAV.n,g=NAV.g;for(let r=1;r<8;r++){let best=null,bd=1e9;for(let a=-r;a<=r;a++)for(let b=-r;b<=r;b++){if(Math.max(Math.abs(a),Math.abs(b))!=r)continue;const x=i+a,y=j+b;if(x<0||y<0||x>=n||y>=n||g[y*n+x])continue;const d=a*a+b*b;if(d<bd){bd=d;best=[x,y]}}if(best)return best}return[i,j]}
function navLos(x0,z0,x1,z1){const g=NAV.g;if(!g)return true;const n=NAV.n,d=Math.hypot(x1-x0,z1-z0),st=Math.max(1,Math.ceil(d/.35));for(let s=0;s<=st;s++){const t=s/st;if(t*d<.75)continue;const i=Math.floor(x0+(x1-x0)*t+H),j=Math.floor(z0+(z1-z0)*t+H);if(i<0||j<0||i>=n||j>=n||g[j*n+i])return false}return true}
/* tiny binary heap of (cost, cell) */
function mkHeap(){const k=[],v=[];return{n:()=>k.length,push(c,x){let i=k.length;k.push(c);v.push(x);while(i>0){const p=(i-1)>>1;if(k[p]<=k[i])break;[k[p],k[i]]=[k[i],k[p]];[v[p],v[i]]=[v[i],v[p]];i=p}},
 pop(){const c=k[0],x=v[0],lk=k.pop(),lv=v.pop();if(k.length){k[0]=lk;v[0]=lv;let i=0;for(;;){let l=2*i+1,r=l+1,m=i;if(l<k.length&&k[l]<k[m])m=l;if(r<k.length&&k[r]<k[m])m=r;if(m==i)break;[k[m],k[i]]=[k[i],k[m]];[v[m],v[i]]=[v[i],v[m]];i=m}}return[c,x]}}}
const N8=[[1,0,1],[-1,0,1],[0,1,1],[0,-1,1],[1,1,1.4142],[1,-1,1.4142],[-1,1,1.4142],[-1,-1,1.4142]];
/* flow field: distance (in cells) to the target from every reachable cell, -1 if unreachable */
function navFlow(tx,tz){const n=NAV.n,g=NAV.g;if(!g)return null;const d=new Float64Array(n*n).fill(-1);let[si,sj]=navCell(tx,tz);if(g[sj*n+si])[si,sj]=navSnap(si,sj);const h=mkHeap();d[sj*n+si]=0;h.push(0,sj*n+si);
 while(h.n()){const[c,u]=h.pop();if(c>d[u]+1e-4)continue;const x0=u%n,y0=(u/n)|0;for(const[dx,dz,w]of N8){const x=x0+dx,y=y0+dz;if(x<0||y<0||x>=n||y>=n)continue;const k=y*n+x;if(g[k])continue;if(dx&&dz&&(g[y0*n+x]||g[y*n+x0]))continue;const nc=c+w;if(d[k]<0||nc<d[k]){d[k]=nc;h.push(nc,k)}}}
 return d}
/* next point to walk to on a flow field: follow the gradient a few cells, then aim at the farthest of them that is in clear sight */
function navFlowTarget(fl,x,z){const n=NAV.n,g=NAV.g;let[i,j]=navCell(x,z);const pts=[];let cur=fl[j*n+i];
 const best=(i,j,cv)=>{let bi=-1,bj=-1,bv=cv<0?1e9:cv;for(const[dx,dz]of N8){const a=i+dx,b=j+dz;if(a<0||b<0||a>=n||b>=n||g[b*n+a])continue;if(dx&&dz&&(g[j*n+a]||g[b*n+i]))continue;const v=fl[b*n+a];if(v>=0&&v<bv-1e-4){bv=v;bi=a;bj=b}}return bi<0?null:[bi,bj,bv]};
 for(let s=0;s<12;s++){const r=best(i,j,cur);if(!r)break;i=r[0];j=r[1];cur=r[2];pts.push(navCtr(i,j));if(cur<=.01)break}
 if(!pts.length)return null;for(let k=pts.length-1;k>=0;k--)if(navLos(x,z,pts[k][0],pts[k][1]))return pts[k];return pts[0]}
/* A* with octile heuristic, then string pulling. Returns waypoints in world coordinates. */
function navPath(sx,sz,tx,tz){const n=NAV.n,g=NAV.g;if(!g)return null;let[si,sj]=navCell(sx,sz),[ti,tj]=navCell(tx,tz);if(g[sj*n+si])[si,sj]=navSnap(si,sj);if(g[tj*n+ti])[ti,tj]=navSnap(ti,tj);
 const s=sj*n+si,t=tj*n+ti,{st,gs,par}=NAV,S=++NAV.stamp,hf=k=>{const dx=Math.abs((k%n)-ti),dz=Math.abs(((k/n)|0)-tj);return Math.max(dx,dz)+.4142*Math.min(dx,dz)},h=mkHeap();
 st[s]=S;gs[s]=0;par[s]=-1;h.push(hf(s),s);let ex=0,bestK=s,bestH=hf(s),done=false;
 while(h.n()&&ex<7000){const[,u]=h.pop();if(u==t){done=true;bestK=t;break}ex++;const hu=hf(u);if(hu<bestH){bestH=hu;bestK=u}const x0=u%n,y0=(u/n)|0;
  for(const[dx,dz,w]of N8){const x=x0+dx,y=y0+dz;if(x<0||y<0||x>=n||y>=n)continue;const k=y*n+x;if(g[k])continue;if(dx&&dz&&(g[y0*n+x]||g[y*n+x0]))continue;const ng=gs[u]+w;if(st[k]!=S||ng<gs[k]){st[k]=S;gs[k]=ng;par[k]=u;h.push(ng+hf(k),k)}}}
 const cells=[];for(let k=bestK;k>=0;k=par[k])cells.push(k);cells.reverse();const pts=cells.map(k=>navCtr(k%n,(k/n)|0));if(done)pts.push([tx,tz]);
 const out=[];let cx=sx,cz=sz,i=0;while(i<pts.length){let j=pts.length-1;while(j>i&&!navLos(cx,cz,pts[j][0],pts[j][1]))j--;out.push(pts[j]);cx=pts[j][0];cz=pts[j][1];i=j+1}return out}
function navUnstick(b){const n=NAV.n,[i,j]=navCell(b.x,b.z),[a,c]=NAV.g[j*n+i]?navSnap(i,j):[i,j],p=navCtr(a,c);b.x+=(p[0]-b.x)*.8;b.z+=(p[1]-b.z)*.8}
/* move an agent one step towards (tx,tz) around obstacles; fl is a flow field for the target (zombies) or omitted (A*). Returns the straight distance left. */
function navMove(b,dt,tx,tz,sp,fl){const dx=tx-b.x,dz=tz-b.z,D=Math.hypot(dx,dz);let gx=tx,gz=tz;
 if(D>1.4&&!navLos(b.x,b.z,tx,tz)){
  if(fl){const r=navFlowTarget(fl,b.x,b.z);if(r){gx=r[0];gz=r[1]}}
  else{b.nt=(b.nt||0)-dt;if(!b.np||b.nt<=0||Math.hypot(tx-(b.ntx||0),tz-(b.ntz||0))>3){b.np=navPath(b.x,b.z,tx,tz);b.nt=.6+Math.random()*.4;b.ni=0;b.ntx=tx;b.ntz=tz}
   const p=b.np;if(p&&p.length){while(b.ni<p.length-1&&(Math.hypot(p[b.ni][0]-b.x,p[b.ni][1]-b.z)<.9||navLos(b.x,b.z,p[b.ni+1][0],p[b.ni+1][1])))b.ni++;gx=p[b.ni][0];gz=p[b.ni][1]}}}
 b.sk=(b.sk||0)+dt;if(b.sk>=.5){const mvd=Math.hypot(b.x-(b.skx==null?b.x:b.skx),b.z-(b.skz==null?b.z:b.skz));b.skx=b.x;b.skz=b.z;b.sk=0;
  if(D>1.8&&mvd<sp*.5*.25){b.stk=(b.stk||0)+1;b.np=null;b.nt=0;b.esc=.45;b.ea=(Math.random()<.5?1:-1)*(1.1+Math.random()*.6);if(b.stk>=3){navUnstick(b);b.stk=0}}else if(mvd>sp*.5*.5)b.stk=0}
 let ang=Math.atan2(gx-b.x,gz-b.z);if(b.esc>0){b.esc-=dt;ang+=b.ea}
 mv(b,Math.sin(ang)*sp*dt,Math.cos(ang)*sp*dt,.45);b.mva=ang;return D}
const _bm=buildMap;buildMap=function(){const r=_bm.apply(this,arguments);navBuild();return r};
