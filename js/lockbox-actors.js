/* Articulated undead for The 1 Room Challenge. */
const LOCKBOX_FABRIC={
 undead:[0x6b554b,0x515e63,0x756951],
 skin:[0xaaa58c,0x969c8c,0xb4a394]
};
const LOCKBOX_TEXTURES={},LOCKBOX_MATERIALS={};

function lockboxFabric(name){
 if(LOCKBOX_TEXTURES[name])return LOCKBOX_TEXTURES[name];
 const worn=name==='worn',leather=name==='leather';
 const map=zTex(128,128,(g,w,h)=>{
  let seed=919;
  const rand=()=>(seed=seed*16807%2147483647)/2147483647;
  const pixels=g.createImageData(w,h);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
   const weave=leather?0:((x%3===0?1:-.3)+(y%3===0?1:-.3))*8;
   const grain=Math.sin(x*.16+y*.21)*5+Math.sin(x*.34-y*.13)*6;
   const p=(x+y*w)*4,value=224+weave+grain+(rand()-.5)*29;
   pixels.data[p]=pixels.data[p+1]=pixels.data[p+2]=value;pixels.data[p+3]=255;
  }
  g.putImageData(pixels,0,0);
  for(let i=0;i<22;i++){
   const x=rand()*w,y=rand()*h,r=6+rand()*19,stain=g.createRadialGradient(x,y,0,x,y,r);
   stain.addColorStop(0,worn?'rgba(57,34,28,.32)':'rgba(44,40,31,.15)');
   stain.addColorStop(1,'rgba(44,40,31,0)');
   g.fillStyle=stain;g.fillRect(x-r,y-r,r*2,r*2);
  }
 });
 map.encoding=THREE.sRGBEncoding;
 return LOCKBOX_TEXTURES[name]=map;
}

/* Cheekbones, brow and eye sockets are built into the head surface. */
function lockboxSkull(){
 const rings=[[.055,.048,.051,.026],[.076,.077,.071,.016],[.105,.083,.089,.011],[.137,.088,.101,.005],
  [.166,.103,.103,0],[.194,.097,.101,-.004],[.222,.072,.08,-.008],[.248,.028,.036,-.01],[.253,0,0,-.01]];
 const pos=[],uv=[],ix=[],cols=32;
 const bump=(x,y,cx,cy,w,h)=>Math.exp(-(((x-cx)/w)**2+((y-cy)/h)**2));
 for(let j=0;j<rings.length;j++){
  const [y,rx,rz,zc]=rings[j];
  for(let i=0;i<=cols;i++){
   const a=(i/cols-.5)*Math.PI*2,x=rx*Math.sin(a),f=Math.max(0,Math.cos(a))**2,u=Math.abs(x);
   const planes=.015*bump(u,y,.065,.111,.028,.026)+.014*bump(u,y,.04,.173,.039,.022)
    -.028*bump(u,y,.038,.143,.027,.021)
    -.023*bump(u,y,.066,.083,.022,.028);
   pos.push(x,y,zc+rz*Math.cos(a)+f*planes);uv.push(i/cols,j/(rings.length-1));
   if(j<rings.length-1&&i<cols){const k=j*(cols+1)+i;ix.push(k,k+1,k+cols+1,k+1,k+cols+2,k+cols+1)}
  }
 }
 const g=new THREE.BufferGeometry();
 g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
 g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
 g.setIndex(ix);g.computeVertexNormals();return g;
}

function lockboxFace(v,a,rod,G){
 const {sp,ss,hm}=G;
 a('skin',lockboxSkull(),1,1,1,0,0,0);
 for(const s of[-1,1]){
  a('skin',ss,.015,.028,.018,s*.095,.115,-.004,0,0,-s*.24);
  a('shade',ss,.025,.014,.007,s*.04,.142,.091,0,s*.27,-s*.12);
  a('eye',ss,.013,.006,.006,s*.04,.143,.098,0,s*.2,0);
  a('iris',ss,.0038,.005,.0025,s*.04,.143,.103);
  rod('shade',s*.022,.165,.102,s*.06,.159,.094,.004);
 }
 a('skin',ss,.014,.034,.019,0,.132,.106,-.39);
 a('skin',ss,.016,.012,.022,.003,.106,.116);
 for(const s of[-1,1])a('shade',ss,.005,.003,.005,s*.007,.101,.13);
  a('mouth',sp,.056,.022,.021,0,.066,.089);
  const scar=v.var%2?1:-1;
  a('shade',ss,.023,.032,.009,scar*.067,.092,.082,0,scar*.42,scar*.32);
  for(let i=0;i<5;i++){
   if(i===v.var)continue;
   const x=(i-2)*.015;
   a('bone',ss,.006,.011+(i%2)*.002,.006,x,.065,.109-Math.abs(x)*.35,0,0,x*4);
  }
  if(v.var!==1)a('hair',hm,.105,.103,.106,-.006,.172,-.014,0,0,.09);
  rod('shade',scar*.062,.186,.083,scar*.078,.166,.073,.0029);
}

function lockboxClothes(v,a,rod,G){
 const {ss}=G;
  HV.zombieTorso(v)(a,rod,G);
  for(const s of[-1,1]){
   a('under',ss,.076,.113,.016,s*.058,.449,.151,0,s*.42,s*.27);
   rod('seam',s*.042,.551,.13,s*.084,.38,.153,.008);
   for(let i=0;i<3;i++)rod('seam',s*(.052+i*.016),.389,.158,s*(.052+i*.016),.36-i*.009,.151,.0028);
  }
  a('shade',ss,.026,.044,.008,.016,.594,.055,0,.25,-.2);
}

function lockboxZombieMaterials(kind){
 if(LOCKBOX_MATERIALS[kind])return LOCKBOX_MATERIALS[kind];
 const cloth=lockboxFabric('worn'),leather=lockboxFabric('leather');
 const mat=(color,map)=>new THREE.MeshLambertMaterial(map?{color,map}:{color});
 return LOCKBOX_MATERIALS[kind]={
  am:mat(LOCKBOX_FABRIC.undead[kind],cloth),skin:mat(LOCKBOX_FABRIC.skin[kind]),
  under:mat(0xa89983,cloth),seam:mat(0x504035),shade:mat(0x51423a),mouth:mat(0x281b1a),
  hair:mat(0x393027),eye:mat(0xd9d5b9),iris:mat(0x797464),bone:mat(0xd2bea0),
  pants:mat(0x45423e,cloth),pants2:mat(0x625b4b,cloth),boots:mat(0x38312a,leather),
  dk:mat(0x292623),wound:mat(0x574039),blood:mat(0x643b33)
 };
}

function lockboxZombie(m,o){
 const kind=o.variant==null?Math.random()*3|0:o.variant%3;
 const M=lockboxZombieMaterials(kind),v={zb:true,var:kind,bare:kind===1},id='lockbox-z'+kind;
 m.rotation.order='YXZ';
 const sh=new THREE.Group(),head=new THREE.Group();sh.position.y=1;head.position.y=.68;sh.add(head);m.add(sh);
 const hip=HV.put(m,id+'hip',HV.hip(v),M);
 HV.put(sh,id+'torso',(a,rod,G)=>lockboxClothes(v,a,rod,G),M);
 HV.put(head,id+'head',(a,rod,G)=>lockboxFace(v,a,rod,G),M);
 const jaw=new THREE.Group();jaw.position.set(0,.051,.023);head.add(jaw);
 HV.put(jaw,id+'jaw',(a,rod,G)=>{
  a('skin',G.sp,.072,.033,.065,0,-.016,.034);
  a('mouth',G.ss,.057,.013,.055,0,.001,.038);
  for(let i=0;i<5;i++)a('bone',G.ss,.006,.009,.008,(i-2)*.014,.005,.089-Math.abs(i-2)*.005);
 },M);
 const leg=side=>{
  const upper=new THREE.Group(),shin=new THREE.Group();upper.position.set(side*.1,.98,0);shin.position.y=-.46;
  upper.add(shin);m.add(upper);
  HV.put(upper,id+'thigh'+side,HV.legU(v,side),M);
  HV.put(shin,id+'shin'+side,HV.legL({...v,bare:v.bare&&side===1},side),M);
  return [upper,shin];
 };
 const [legL,shinL]=leg(-1),[legR,shinR]=leg(1),armR=mkArm2(m,v,-1,M),armL=mkArm2(m,v,1,M);
 return {hip,legL,legR,shinL,shinR,armR,armL,sh,head,jaw,mat:M};
}
