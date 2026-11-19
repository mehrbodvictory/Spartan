/* Articulated survivors and undead for The 1 Room Challenge. */
const LOCKBOX_FABRIC={
 survivor:[0x686e51,0x897a61,0x506167],
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
function lockboxSkull(undead){
 const rings=undead?
  [[.055,.048,.051,.026],[.076,.077,.071,.016],[.105,.083,.089,.011],[.137,.088,.101,.005],
   [.166,.103,.103,0],[.194,.097,.101,-.004],[.222,.072,.08,-.008],[.248,.028,.036,-.01],[.253,0,0,-.01]]:
  [[.001,.024,.04,.042],[.02,.064,.064,.021],[.053,.081,.082,.016],[.093,.09,.095,.01],
   [.128,.095,.101,.005],[.164,.096,.099,0],[.196,.084,.093,-.008],[.225,.049,.06,-.01],[.237,0,0,-.01]];
 const pos=[],uv=[],ix=[],cols=32;
 const bump=(x,y,cx,cy,w,h)=>Math.exp(-(((x-cx)/w)**2+((y-cy)/h)**2));
 for(let j=0;j<rings.length;j++){
  const [y,rx,rz,zc]=rings[j];
  for(let i=0;i<=cols;i++){
   const a=(i/cols-.5)*Math.PI*2,x=rx*Math.sin(a),f=Math.max(0,Math.cos(a))**2,u=Math.abs(x);
   const planes=.015*bump(u,y,.065,.111,.028,.026)+.014*bump(u,y,.04,.173,.039,.022)
    -(undead?.028:.015)*bump(u,y,.038,.143,.027,.021)
    -(undead?.023:.004)*bump(u,y,.066,.083,.022,.028);
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
 const {sp,ss,hm}=G,zb=v.zb;
 a('skin',lockboxSkull(zb),1,1,1,0,0,0);
 for(const s of[-1,1]){
  a('skin',ss,.015,.028,.018,s*.095,.115,-.004,0,0,-s*.24);
  a('shade',ss,zb?.025:.018,zb?.014:.009,.007,s*.04,.142,.091,0,s*.27,-s*.12);
  a('eye',ss,zb?.013:.012,.006,.006,s*.04,.143,.098,0,s*.2,0);
  a('iris',ss,zb?.0038:.005,.005,.0025,s*.04,.143,.103);
  rod(zb?'shade':'hair',s*.022,.165,.102,s*.06,.159,.094,zb?.004:.0035);
 }
 a('skin',ss,.014,.034,.019,0,.132,.106,-.39);
 a('skin',ss,.016,.012,.022,zb?.003:0,.106,.116);
 for(const s of[-1,1])a('shade',ss,.005,.003,.005,s*.007,.101,.13);
 if(zb){
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
 }else{
  a('lip',ss,.033,.006,.009,0,.060,.101);
  a('shade',ss,.028,.0025,.006,0,.058,.107);
  if(v.var===1){
   a('cap',hm,.108,.106,.111,0,.156,-.007);
   a('cap',G.cy,.107,.037,.112,0,.164,-.007);
  }else a('hair',hm,.099,.102,.106,0,.145,-.009,.08);
 }
}

function lockboxShell(rings){
 const positions=[],uvs=[],indices=[],sides=20;
 for(let j=0;j<rings.length;j++){
  const [y,rx,rz,z=0]=rings[j];
  for(let i=0;i<=sides;i++){
   const angle=i/sides*Math.PI*2;
   positions.push(Math.sin(angle)*rx,y,z+Math.cos(angle)*rz);
   uvs.push(i/sides,j/(rings.length-1));
   if(i<sides&&j<rings.length-1){
    const k=j*(sides+1)+i;
    indices.push(k,k+1,k+sides+1,k+1,k+sides+2,k+sides+1);
   }
  }
 }
 const mesh=new THREE.BufferGeometry();
 mesh.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
 mesh.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));
 mesh.setIndex(indices);mesh.computeVertexNormals();
 return mesh;
}

function lockboxClothes(v,a,rod,G){
 const {bx,ss,cy}=G;
 if(v.zb){
  HV.torso(v)(a,rod,G);
  for(const s of[-1,1]){
   a('under',ss,.076,.113,.016,s*.058,.449,.151,0,s*.42,s*.27);
   rod('seam',s*.042,.551,.13,s*.084,.38,.153,.008);
   for(let i=0;i<3;i++)rod('seam',s*(.052+i*.016),.389,.158,s*(.052+i*.016),.36-i*.009,.151,.0028);
  }
  a('shade',ss,.026,.044,.008,.016,.594,.055,0,.25,-.2);
  return;
 }
 // Tailored canvas jacket, turned collar and a cross-body field bag.
 const jacket=lockboxShell([[.015,0,0],[.026,.188,.132],[.12,.205,.145],[.25,.18,.129],
  [.41,.234,.167],[.515,.255,.144],[.553,.23,.122],[.593,.104,.088],[.606,0,0]]);
 a('am',jacket,1,1,1,0,0,0);
 a('skin',cy,.057,.12,.055,0,.62,.007);
 a('under',cy,.078,.046,.075,0,.573,.002);
 for(const side of[-1,1]){
  a('vest2',hvR(.116,.082,.035,.015),.116,.082,.035,side*.067,.526,.117,.34,side*.48,-side*.43);
  a('vest',hvR(.13,.117,.048,.013),.13,.117,.048,side*.138,.323,.114,.06,side*.48,side*.08);
  a('strap',bx,.119,.034,.014,side*.144,.369,.137,0,side*.48,side*.08);
  a('metal',ss,.009,.008,.006,side*.144,.358,.148);
  rod('seam',side*.201,.108,.059,side*.219,.456,.086,.004);
  a('seam',ss,.066,.02,.093,side*.203,.54,.005,0,0,-side*.18);
 }
 rod('seam',0,.06,.143,0,.42,.169,.008);
 rod('seam',0,.42,.169,0,.505,.147,.008);
 for(const y of [.13,.225,.315,.404,.485])a('metal',ss,.008,.007,.004,.017,y,.153+(y>.27?.017:0));
 rod('strap',-.159,.554,.1,.14,.137,.154,.023);
 a('metal',hvR(.051,.035,.015,.008),.051,.035,.015,-.085,.452,.166,0,0,.59);
 a('vest2',hvR(.21,.191,.12,.024),.21,.191,.12,.19,.134,-.082,0,-.36,.14);
 a('strap',hvR(.223,.065,.132,.014),.223,.065,.132,.19,.204,-.082,0,-.36,.14);
 a('vest',hvR(.27,.32,.158,.035),.27,.32,.158,0,.364,-.176);
 a('under',cy,.077,.28,.076,0,.513,-.177,0,0,Math.PI/2);
 for(const x of[-.087,.087])rod('strap',x,.52,-.249,x,.225,-.256,.012);
 if(v.var===0)a('patch',bx,.071,.023,.006,-.128,.412,.143,0,-.5);
 if(v.var===2)a('under',hvR(.12,.08,.06,.013),.12,.08,.06,0,.584,.065);
}

function lockboxSurvivorLeg(a,rod,G,side,lower){
 const {bx,ss,cy}=G;
 if(!lower){
  a('pants',lockboxShell([[-.493,0,0],[-.47,.075,.079,.017],[-.36,.091,.088],
   [-.21,.106,.095],[-.055,.109,.108],[.048,.08,.084],[.075,0,0]]),1,1,1,0,0,0);
  a('pants2',hvR(.075,.156,.115,.021),.075,.156,.115,side*.087,-.206,.005,0,0,side*.12);
  rod('seam',side*.116,-.115,.056,side*.089,-.39,.055,.006);
  a('vest',ss,.068,.075,.04,0,-.404,.073);
  return;
 }
 a('pants',lockboxShell([[-.353,0,0],[-.339,.053,.06],[-.233,.069,.067],[-.12,.078,.084],
  [-.016,.076,.078],[.052,.027,.032],[.058,0,0]]),1,1,1,0,0,0);
 a('boots',cy,.069,.114,.072,0,-.322,-.002);
 a('boots',hvR(.137,.102,.287,.031),.137,.102,.287,0,-.428,.067);
 a('vest2',ss,.065,.035,.071,0,-.409,.146);
 a('dk',hvR(.149,.034,.298,.013),.149,.034,.298,0,-.476,.065);
 for(let i=0;i<4;i++){
  const z=.045+i*.024;
  rod('strap',-.037,-.386,z,.034,-.385,z+.017,.004);
  rod('strap',.037,-.386,z,-.034,-.385,z+.017,.004);
 }
 a('metal',bx,.026,.032,.007,side*.048,-.309,.06,0,side*.52);
}

function lockboxSurvivorArm(a,rod,G,side,length,lower){
 const {bx,ss,cy}=G;
 const radii=lower?[[.02,.053,.056],[.25,.052,.060],[.51,.058,.061],[.85,.074,.075],[.99,.06,.055]]:
  [[.02,.077,.082],[.23,.078,.08],[.54,.084,.092],[.8,.102,.102],[.98,.092,.101]];
 const rings=[[-length,0,0],...radii.map(([u,x,z])=>[-length*(1-u),x,z]),[.09,0,0]];
 a('am',lockboxShell(rings),1,1,1,0,0,0);
 if(lower){
  a('vest2',hvR(.119,.135,.043,.016),.119,.135,.043,0,-length*.74,-.047,.12);
  a('under',cy,.058,.037,.06,0,-length+.015,0);
  rod('seam',side*.052,-length*.22,-.02,side*.045,-length*.87,-.059,.0055);
  for(const y of [.66,.78])a('metal',ss,.009,.008,.005,side*.041,-length*y,-.068);
 }else{
  a('vest2',hvR(.044,.115,.14,.017),.044,.115,.14,side*.077,-length*.20,.011,0,0,-side*.15);
  a('patch',bx,.009,.05,.049,side*.101,-length*.18,.013,0,0,-side*.15);
 }
}

function lockboxGlove(a,rod,G,side){
 const {ss}=G;
 const part=(slot,w,h,d,x,y,z,rx=0,rz=0)=>a(slot,hvR(w,h,d,.009),w,h,d,x,y,z,rx,0,rz);
 part('glove',.094,.116,.049,0,-.054,0);
 part('dk',.077,.082,.012,0,-.06,-.027);
 a('glove',ss,.041,.025,.033,0,-.011,0);
 for(let i=0;i<4;i++){
  const x=(i-1.5)*.0225,l=[.044,.05,.049,.041][i];
  part('glove',.021,l,.022,x,-.135,-.005,-.55);
  part('glove',.020,l*.8,.02,x,-.149,.031,-1.47);
  a('vest2',ss,.010,.012,.009,x,-.107,-.023);
 }
 part('glove',.024,.054,.024,-side*.053,-.081,.024,-.52,-side*.48);
 part('glove',.021,.04,.022,-side*.039,-.116,.049,-1.18,-side*.4);
}
function lockboxActorMaterials(zb,kind){
 const id=(zb?'z':'p')+kind;
 if(LOCKBOX_MATERIALS[id])return LOCKBOX_MATERIALS[id];
 const palette=zb?LOCKBOX_FABRIC.undead:LOCKBOX_FABRIC.survivor;
 const skinColor=zb?LOCKBOX_FABRIC.skin[kind]:[0xd3ae8e,0xab8265,0xba8f78][kind];
 const cloth=lockboxFabric(zb?'worn':'canvas'),leather=lockboxFabric('leather');
 const mat=(color,map)=>new THREE.MeshLambertMaterial(map?{color,map}:{color});
 const paint=mat(palette[kind],cloth),skin=mat(skinColor);
 return LOCKBOX_MATERIALS[id]={am:paint,skin,under:mat(zb?0xa89983:0x3a3b30,cloth),seam:mat(zb?0x504035:0x85785c),
  shade:mat(zb?0x51423a:0x785649),lip:mat(0x936854),mouth:mat(0x281b1a),
  hair:mat(zb?0x393027:0x45372f),cap:mat(0x414641,cloth),eye:mat(zb?0xd9d5b9:0xe2d8bf),
  iris:mat(zb?0x797464:0x564838),bone:mat(0xd2bea0),pants:mat(zb?0x45423e:0x53594d,cloth),
  pants2:mat(zb?0x625b4b:0x646556,cloth),boots:mat(0x38312a,leather),glove:mat(0x5f4a38,leather),
  vest:mat(0x4b4637,cloth),vest2:mat(0x645b47,cloth),strap:mat(0x5d5441,cloth),dk:mat(0x292623),
  patch:mat(0xaaa18a),metal:mat(0x958b73),wound:mat(0x574039),blood:mat(0x643b33)};
}

function lockboxCharacter(m,o){
 const zb=!!o.zombie,kind=o.variant==null?Math.random()*3|0:o.variant%3;
 const M=lockboxActorMaterials(zb,kind);
 const v={zb,var:kind,bare:zb&&kind===1},id='lockbox-'+(zb?'z':'p')+kind;
 const key=new THREE.Mesh(bg,new THREE.MeshLambertMaterial({color:0xa7a08b}));key.visible=false;m.add(key);m.rotation.order='YXZ';
 const sh=new THREE.Group(),head=new THREE.Group();sh.position.y=1;head.position.y=.68;sh.add(head);m.add(sh);
 const hip=HV.put(m,id+'hip',zb?HV.hip(v):(a,rod,G)=>{
  a('pants',G.cy,.188,.19,.12,0,.976,0);
  a('under',G.cy,.198,.042,.135,0,1.015,0);
  a('metal',hvR(.055,.031,.014,.006),.055,.031,.014,0,1.015,.135);
 },M);
 HV.put(sh,id+'torso',(a,rod,G)=>lockboxClothes(v,a,rod,G),M);
 HV.put(head,id+'head',(a,rod,G)=>lockboxFace(v,a,rod,G),M);
 let jaw=null;
 if(zb){
  jaw=new THREE.Group();jaw.position.set(0,.051,.023);head.add(jaw);
  HV.put(jaw,id+'jaw',(a,rod,G)=>{
   a('skin',G.sp,.072,.033,.065,0,-.016,.034);
   a('mouth',G.ss,.057,.013,.055,0,.001,.038);
   for(let i=0;i<5;i++)a('bone',G.ss,.006,.009,.008,(i-2)*.014,.005,.089-Math.abs(i-2)*.005);
  },M);
 }
 const leg=side=>{
  const upper=new THREE.Group(),shin=new THREE.Group();upper.position.set(side*.1,.98,0);shin.position.y=-.46;
  upper.add(shin);m.add(upper);
  HV.put(upper,id+'thigh'+side,zb?HV.legU(v,side):(a,rod,G)=>lockboxSurvivorLeg(a,rod,G,side,false),M);
  HV.put(shin,id+'shin'+side,zb?HV.legL({...v,bare:v.bare&&side===1},side):(a,rod,G)=>lockboxSurvivorLeg(a,rod,G,side,true),M);
  return [upper,shin];
 };
 const [legL,shinL]=leg(-1),[legR,shinR]=leg(1);
 const makeArm=side=>{
  if(zb)return mkArm2(m,v,-side,M);
  const up=new THREE.Group(),fo=new THREE.Group(),hand=new THREE.Group();
  const L1=.36,L2=.36;
  HV.put(up,'room-sleeve'+side,(a,rod,G)=>lockboxSurvivorArm(a,rod,G,side,L1,false),M);
  HV.put(fo,'room-bracer'+side,(a,rod,G)=>lockboxSurvivorArm(a,rod,G,side,L2,true),M);
  HV.put(hand,'room-glove'+side,(a,rod,G)=>lockboxGlove(a,rod,G,side),M);
  hand.scale.setScalar(.87);hand.position.y=-L2;fo.add(hand);m.add(up,fo);
  return {up,fo,L1,L2};
 };
 const armR=makeArm(1),armL=makeArm(-1);
 return {hip,legL,legR,shinL,shinR,armR,armL,sh,head,jaw,mat:M};
}

/* Keep the standard posing groups and bottle/weapon grip anchors. */
function lockboxFirstPerson(active){
 for(const [name,arm] of Object.entries(fpArm)){
  if(!arm.roomView&&active){
   const side=name==='r'?1:-1,materials=lockboxActorMaterials(false,0);
   const originalHand=arm.hand.children.filter(o=>o.isMesh);
   const original=[...arm.up.children,...arm.fo.children.filter(o=>o!==arm.hand),...originalHand];
   const customHand=HV.put(arm.hand,'room-glove'+side,(a,rod,G)=>lockboxGlove(a,rod,G,side),materials);
   for(const item of originalHand)item.userData.roomGlove=false;
   for(const item of customHand)item.userData.roomGlove=true;
   const custom=[
    ...HV.put(arm.up,'room-fp-sleeve'+side,(a,rod,G)=>lockboxSurvivorArm(a,rod,G,side,arm.L1,false),materials),
    ...HV.put(arm.fo,'room-fp-bracer'+side,(a,rod,G)=>lockboxSurvivorArm(a,rod,G,side,arm.L2,true),materials),
    ...customHand
   ];
   for(const item of custom)item.castShadow=false;
   arm.roomView={original,custom};
  }
  if(!arm.roomView||arm.roomView.active===active)continue;
  arm.roomView.active=active;
  for(const item of arm.roomView.original)item.visible=!active;
  for(const item of arm.roomView.custom)item.visible=active;
 }
}
