/* All silhouettes are baked into the existing animated joints. Models stay in
   the same coordinate system as the studio, network avatars and Stormwatch. */
const operatorDesigns={
 breaker:{
  torso({a,box,G}){
   a('stitch',G.cu,.183,.55,.15,0,.31,0);
   box('armor',.49,.29,.322,0,.405,.005,.09);
   box('stitch',.363,.186,.19,0,.185,.079,.13);
   for(let i=0;i<4;i++)box(i%2?'trim':'armor',.414-i*.057,.051,.151,0,.494-i*.064,.164+i*.012,.12);
   for(const side of [-1,1])box('stitch',.11,.243,.236,side*.239,.396,-.015,0,side*.14);
  },
  head({a,box,G}){
   box('armor',.233,.247,.246,0,.12,0);
   box('stitch',.209,.074,.06,0,.144,.141);
   box('optic',.17,.024,.02,0,.152,.174);
   box('armor',.172,.092,.067,0,.06,.14,-.22);
   for(let i=0;i<5;i++)a('stitch',G.bx,.01,.051,.008,(i-2)*.026,.063,.178,-.22);
  },
  limbs:{arm:['armor',.24,.23,.252],forearm:['stitch',.151,.24,.164],leg:['armor',.177,.29,.147],shin:['armor',.169,.27,.152]}
 },
 peregrine:{
  torso({a,box,rod,G}){
   a('fabric',G.cu,.165,.54,.104,0,.297,0);
   a('stitch',G.sp,.164,.139,.118,0,.485,.005);
   for(const side of [-1,1]){
    a('armor',G.bx,.102,.28,.062,side*.091,.331,.117,.14,0,-side*.28);
    rod('trim',side*.16,.488,.101,side*.068,.183,.119,.014);
    box('armor',.117,.292,.094,side*.138,.326,-.161,0,side*.18);
    a('stitch',G.cy,.049,.073,.051,side*.119,.148,-.16);
   }
  },
  head({a,box,gem,G}){
   a('fabric',G.sp,.092,.117,.1,0,.119,0);
   a('armor',G.sp,.106,.129,.128,0,.143,-.033,-.18);
   a('armor',gem,.117,.073,.176,0,.106,.086,0,0,0);
   for(const side of [-1,1]){
    box('optic',.068,.035,.035,side*.047,.143,.128,.08,-side*.23);
    a('armor',gem,.057,.121,.064,side*.093,.192,-.038,0,0,side*.43);
   }
  },
  limbs:{forearm:['armor',.111,.185,.111],shin:['trim',.062,.268,.095]}
 },
 lantern:{
  torso({a,box,rod,G}){
   a('fabric',G.sp,.192,.29,.126,0,.316,0);
   a('armor',G.cu,.197,.38,.149,0,.34,-.039);
   for(const side of [-1,1]){
    a('trim',G.cy,.073,.326,.077,side*.115,.324,-.161,.06,0,side*.13);
    a('stitch',G.cy,.074,.037,.079,side*.123,.463,-.155);
    rod('stitch',side*.111,.465,-.158,side*.027,.55,.149,.019);
   }
   box('stitch',.24,.195,.119,0,.311,.123,.11);
   a('optic',G.cy,.062,.018,.062,0,.33,.19,Math.PI/2);
  },
  head({a,box,G}){
   a('stitch',G.sp,.099,.119,.105,0,.12,0);
   a('armor',G.cy,.131,.026,.133,0,.184,.001);
   a('armor',G.hm,.113,.105,.112,0,.177,0);
   a('stitch',G.cy,.073,.103,.071,0,.099,.096,Math.PI/2);
   a('trim',G.cy,.06,.022,.06,0,.098,.15,Math.PI/2);
   a('optic',G.cy,.049,.016,.049,0,.098,.166,Math.PI/2);
   box('trim',.039,.044,.089,0,.236,.062,.18);
  },
  limbs:{arm:['fabric',.165,.165,.155],forearm:['trim',.138,.133,.13],leg:['armor',.145,.162,.14],shin:['fabric',.145,.3,.124]}
 },
 surveyor:{
  torso({a,rod,G}){
   a('fabric',G.sp,.211,.301,.142,0,.325,0);
   a('stitch',G.cy,.151,.094,.144,0,.548,0);
   a('armor',G.bx,.269,.24,.129,-.01,.342,-.148,.16);
   for(let i=0;i<20;i++){
    const side=i%2?1:-1,y=.52-Math.floor(i/2)*.039,x=side*(.139+(i%5)*.024),z=i%3===0?.09:-.064;
    a(i%5?'fabric':'trim',G.bx,.081+i%3*.025,.065,.018,x,y,z,.35,side*.23,side*.63);
   }
   rod('trim',-.144,.32,-.169,-.265,.72,-.185,.009);
  },
  head({a,box,G}){
   a('skin',G.sp,.092,.115,.106,0,.112,0);
   a('fabric',G.cy,.161,.027,.142,0,.166,-.009,0,0,-.14);
   a('fabric',G.sp,.095,.071,.098,0,.176,-.015,0,0,-.13);
   box('optic',.149,.036,.027,0,.127,.111,.13);
   for(let i=0;i<8;i++)a(i%3?'fabric':'trim',G.bx,.038,.133,.017,(i-3.5)*.034,.086,-.111,-.05*(i%2),.23*(i-3.5),.06*(i-3.5));
  },
  limbs:{arm:['fabric',.196,.227,.184],forearm:['fabric',.133,.216,.145],shin:['fabric',.16,.26,.154]}
 },
 crosswind:{
  torso({a,box,rod,G}){
   a('fabric',G.sp,.182,.287,.12,0,.308,0);
   a('armor',G.sp,.146,.182,.069,.063,.337,.114,.13,0,-.35);
   a('trim',G.sp,.15,.08,.147,0,.533,.04,.24);
   for(const side of [-1,1]){
    a('fabric',G.bx,.136,.46,.033,side*.089,.055,-.149,.2,side*.17,side*.15);
    rod('trim',side*.08,.48,-.109,side*.198,.28,-.185,.009);
   }
   box('stitch',.205,.087,.24,0,.131,0,-.08,.24);
  },
  head({a,box,G}){
   a('fabric',G.sp,.119,.129,.123,0,.111,-.022,.1);
   a('stitch',G.sp,.101,.1,.063,0,.109,.081);
   a('skin',G.sp,.078,.05,.043,0,.132,.105);
   for(const side of [-1,1])a('optic',G.ss,.032,.02,.017,side*.035,.139,.14);
   a('trim',G.sp,.114,.051,.069,0,.06,.079,.09,.07,-.19);
   box('fabric',.092,.19,.027,.093,.005,-.089,-.52,.39);
  },
  limbs:{arm:['fabric',.139,.18,.132],leg:['fabric',.145,.26,.063],shin:['armor',.135,.241,.112]}
 },
 machinist:{
  torso({a,box,rod,G}){
   a('fabric',G.cu,.18,.54,.115,0,.312,0);
   box('armor',.253,.369,.193,0,.331,-.143,.11);
   for(const side of [-1,1]){
    rod('trim',side*.095,.47,-.237,side*.229,.533,.048,.025);
    rod('stitch',side*.229,.533,.048,side*.115,.173,.151,.025);
    a('armor',G.cy,.055,.198,.055,side*.127,.26,.111,.14,0,-side*.21);
   }
   box('optic',.214,.17,.072,-.046,.387,.131,.12,-.11);
   box('stitch',.102,.059,.025,-.033,.389,.174,.12);
  },
  head({a,box,rod,G}){
   a('skin',G.sp,.096,.115,.104,0,.108,0);
   a('armor',G.hm,.12,.11,.121,0,.142,-.002,.09);
   a('stitch',G.cy,.11,.017,.114,0,.14,.004);
   box('armor',.155,.071,.06,0,.064,.112,-.18);
   a('trim',G.cy,.05,.06,.05,-.052,.137,.117,Math.PI/2);
   a('optic',G.cy,.038,.014,.038,-.052,.137,.157,Math.PI/2);
   rod('trim',-.089,.173,0,-.143,.308,-.045,.007);
  },
  limbs:{arm:['armor',.147,.173,.173],forearm:['armor',.163,.237,.151],leg:['stitch',.148,.197,.14]}
 },
 meridian:{
  torso({a,box,rod,gem,G}){
   a('stitch',G.cu,.152,.548,.104,0,.304,0);
   a('armor',gem,.269,.306,.14,0,.393,.035,-.14,0,0);
   a('optic',gem,.098,.145,.075,0,.413,.166,0,0,0);
   for(const side of [-1,1]){
    for(let i=0;i<3;i++)a('armor',gem,.143,.078,.166,side*(.184-i*.028),.472-i*.108,-.064,-.09,side*.29,side*.44);
    rod('trim',side*.115,.222,-.122,side*.227,.647,-.197,.014);
   }
   box('stitch',.21,.065,.114,0,.139,.097);
  },
  head({a,box,gem,G}){
   a('stitch',G.sp,.093,.121,.102,0,.113,0);
   a('armor',gem,.142,.181,.136,0,.148,-.006,-.2,0,0);
   a('armor',gem,.108,.116,.115,0,.071,.061,.19,0,0);
   for(const side of [-1,1]){
    box('optic',.09,.018,.029,side*.044,.144,.122,.12,-side*.48);
    a('armor',gem,.038,.109,.11,side*.103,.164,-.033,-.39,0,side*.53);
   }
  },
  limbs:{arm:['armor',.195,.17,.172],forearm:['armor',.152,.257,.125],leg:['armor',.146,.282,.126],shin:['optic',.087,.27,.1]}
 },
 bellwatch:{
  torso({a,box,rod,ring,G}){
   a('fabric',G.cu,.172,.557,.137,0,.314,0);
   a('armor',G.cy,.216,.207,.122,0,.43,.052,.26);
   a('trim',ring,.119,.119,.57,0,.403,.135);
   a('stitch',G.cy,.109,.049,.109,0,.403,.132,Math.PI/2);
   a('optic',G.cy,.08,.012,.08,0,.403,.165,Math.PI/2);
   rod('trim',0,.403,.178,.048,.462,.178,.006);
   rod('stitch',0,.403,.179,-.047,.392,.179,.007);
   for(const side of [-1,1]){
    a('armor',G.cy,.048,.313,.052,side*.129,.25,-.133,.13,0,-side*.12);
    a('fabric',G.bx,.106,.389,.046,side*.067,.048,-.126,-.18,0,side*.21);
   }
   box('trim',.25,.031,.26,0,.15,0);
  },
  head({a,box,rod,bell,G}){
   a('stitch',G.sp,.091,.107,.091,0,.109,.009);
   a('armor',bell,.15,.267,.147,0,.135,-.003);
   a('trim',G.cy,.158,.021,.157,0,.021,0);
   box('stitch',.212,.07,.041,0,.118,.119);
   for(let i=0;i<5;i++)box(i%2?'trim':'optic',.019,.055,.033,(i-2)*.036,.118,.146);
   a('trim',G.cy,.053,.037,.053,0,.276,-.001);
   rod('trim',-.032,.27,0,.035,.27,0,.019);
  },
  limbs:{arm:['trim',.174,.184,.198],forearm:['armor',.159,.199,.149],leg:['fabric',.15,.268,.144],shin:['trim',.12,.224,.127]}
 },
 estatewarden:{
  torso({a,rod,gem,G}){
   a('fabric',G.cu,.178,.54,.132,0,.31,0);
   a('stitch',G.sp,.237,.162,.142,0,.461,-.002);
   for(const side of [-1,1]){
    for(let i=0;i<4;i++){
     a('armor',gem,.085,.093,.082,side*(.208-i*.023),.51-i*.051,.07,-.19,0,side*.66);
     rod('trim',side*.081,.177+i*.072,.132,side*.159,.23+i*.071,.136,.009);
    }
    a('fabric',G.bx,.185,.57,.032,side*.104,.014,-.123,-.19,side*.22,side*.14);
   }
   a('optic',gem,.069,.123,.048,0,.355,.145,0,0,0);
  },
  head({a,box,rod,gem,G}){
   a('stitch',G.sp,.125,.141,.128,0,.125,-.019,-.12);
   a('armor',gem,.09,.124,.083,0,.125,.082,0,0,0);
   a('trim',G.sp,.06,.065,.046,0,.104,.116,.33);
   for(const side of [-1,1]){
    box('optic',.06,.02,.016,side*.044,.142,.153,.09,-side*.33);
    rod('trim',side*.069,.188,.033,side*.133,.264,-.036,.026);
    rod('trim',side*.133,.264,-.036,side*.106,.368,-.091,.019);
    rod('trim',side*.115,.274,-.045,side*.184,.329,-.035,.014);
    rod('trim',side*.109,.314,-.068,side*.147,.374,-.097,.011);
   }
  },
  limbs:{arm:['armor',.188,.219,.173],forearm:['trim',.118,.243,.121],leg:['fabric',.15,.294,.137],shin:['armor',.132,.306,.12]}
 }
};
let operatorForms;
function drawOperator(id,part){
 return (a,rod,G)=>{
  operatorForms ||= {gem:new THREE.OctahedronGeometry(1),ring:new THREE.TorusGeometry(1,.12,7,24),bell:new THREE.CylinderGeometry(.46,1,1,12)};
  const box=(mat,w,h,d,x,y,z,rx=0,rz=0)=>a(mat,G.bx,w,h,d,x,y,z,rx,0,rz);
  operatorDesigns[id][part]({a,rod,G,box,...operatorForms});
 };
}
function operatorTorso(id){
 if(id==='recruit')return scoutTorso;
 const build=drawOperator(id,'torso');
 return (a,rod,G)=>{
  // Join the helmet or hood to the shoulders without a visible gap.
  const wrapped=['breaker','peregrine','lantern','meridian','bellwatch','estatewarden'].includes(id);
  a(wrapped?'stitch':'fabric',G.cu,.081,.153,.087,0,.587,0);
  a(wrapped?'armor':'fabric',G.cu,.115,.098,.106,0,.552,0);
  build(a,rod,G);
 };
}
function operatorHead(id){return id==='recruit'?scoutHead:drawOperator(id,'head')}
function operatorMaterials(id){
 const kit=OPERATORS[id],shared=(part,color,options={})=>{
  const key=part+'-'+id;
  return HV.m[key]||(HV.m[key]=new THREE.MeshLambertMaterial({color,...options}));
 };
 const glow=id==='meridian'?.51:hasOwn(ZQUEST_OPERATORS,id)?.22:0;
 return {
  fabric:shared('fabric',kit.tone,{map:operatorWeave()}),armor:shared('armor',kit.plate),
  trim:shared('trim',kit.trim),stitch:shared('stitch',0x202327),
  optic:shared('optic',kit.optic,{emissive:id==='meridian'?0x1c8585:kit.optic,emissiveIntensity:glow})
 };
}
const operatorTeamMaterials=new Map();
function markOperatorTeam(rig,team){
 if(team!=='A'&&team!=='B')return;
 let material=operatorTeamMaterials.get(team);
 if(!material){
  material=new THREE.MeshLambertMaterial({color:team==='A'?0x57b8ff:0xff6251,
   emissive:team==='A'?0x11496e:0x671c13,emissiveIntensity:.6});
  operatorTeamMaterials.set(team,material);
 }
 for(const arm of [rig.armL,rig.armR]){
  const band=new THREE.Mesh(HV.G().cy,material);
  band.scale.set(.09,.048,.094);band.position.y=-.227;arm.up.add(band);
 }
}
function operatorViewGear(id,side,part,length){
 return (a,rod,G)=>{
  const {bx,cy,cu,sp}=G,angle=side*.13;
  const box=(mat,w,h,d,x,y,z,roll=0)=>a(mat,bx,w,h,d,x,y,z,0,0,roll);
  if(part==='arm'){
   a('fabric',cu,.081,length,.082,0,-length/2,0);
   a('fabric',sp,.088,.087,.086,0,0,0);
   if(id!=='crosswind')operatorGear(id,side,'arm')(a,rod,G);
   if(id==='crosswind')for(let i=0;i<4;i++)a(i%2?'trim':'armor',cy,.087,.044,.086,0,-.2-i*.066,0,0,0,angle);
   return;
  }
  if(part==='hand'){
   if(id==='surveyor'||id==='crosswind'){
    for(let i=0;i<3;i++)box(i===1?'trim':'fabric',.087,.017,.068,0,-.033-i*.025,0,angle);
   }else{
    const width=id==='breaker'?.108:.089;
    box('armor',width,.077,.032,0,-.064,-.034,angle);
    for(let i=0;i<4;i++)a(i===0?'trim':'armor',sp,.013,.017,.012,(i-1.5)*.022,-.113,-.031);
    if(id==='estatewarden'||id==='meridian')for(let i=0;i<3;i++)
     box('optic',.008,.045,.005,(i-1)*.025,-.062,-.052,angle);
   }
   return;
  }
  a('fabric',sp,.076,.067,.076,0,0,0);
  a('fabric',cu,.069,length,.072,0,-length/2,0);
  a('stitch',cy,.059,.07,.061,0,.019-length,0);
  const y=-length*.65;
  if(id==='recruit'){
   box('armor',.096,.207,.044,side*.029,y,-.063,angle);
   for(const dy of [-.08,.08])a('stitch',cy,.076,.031,.077,0,y+dy,0);
   box('trim',.046,.027,.009,side*.028,y,-.089,angle);
  }else if(id==='breaker'){
   box('stitch',.134,.317,.078,0,y,-.061);
   for(let i=0;i<5;i++)box('armor',.146-i*.009,.044,.052,0,y+.119-i*.05,-.107,angle);
   box('trim',.014,.194,.014,side*.034,y,-.138,angle);
  }else if(id==='peregrine'){
   const fin=new THREE.OctahedronGeometry(1);
   a('armor',fin,.077,.197,.073,side*.037,y,-.071,0,-angle,-angle);
   a('trim',fin,.017,.148,.018,side*.09,y+.014,-.111,0,0,-angle);
   box('armor',.063,.148,.035,-side*.042,y-.04,-.065);
  }else if(id==='lantern'){
   a('trim',cy,.048,.248,.048,side*.077,y,-.039,0,0,angle);
   for(const dy of [-.1,.1])a('armor',cy,.056,.054,.056,side*.077,y+dy,-.039,0,0,angle);
   box('optic',.024,.119,.018,side*.077,y,-.083,angle);
  }else if(id==='surveyor'||id==='crosswind'){
   for(let i=0;i<7;i++)a(i%3?'fabric':'trim',cy,.076,.049,.083,0,y+.137-i*.04,0,0,0,angle*(i%2?1:-1));
   if(id==='crosswind')box('optic',.072,.094,.025,side*.009,y,-.089,side*.32);
  }else if(id==='machinist'){
   box('stitch',.133,.22,.061,0,y,-.064,angle);
   for(let i=0;i<3;i++){
    a('armor',cy,.024,.233,.024,side*(.033+i*.029),y,-.089,0,0,angle);
    a('trim',cy,.026,.042,.025,side*(.033+i*.029),y-.12,-.089,0,0,angle);
   }
  }else if(id==='meridian'){
   const fin=new THREE.OctahedronGeometry(1);
   for(const x of [-.044,.044]){
    a('armor',fin,.052,.17,.065,x,y,-.063,0,0,side*.19);
    a('optic',fin,.013,.089,.014,x,y,-.118,0,0,side*.19);
   }
  }else if(id==='bellwatch'){
   for(const dy of [-.09,.08])a('trim',cy,.083,.026,.085,0,y+dy,0,0,0,angle);
   a('armor',cy,.079,.05,.079,0,y,-.077,Math.PI/2);
   a('trim',cy,.057,.018,.057,0,y,-.108,Math.PI/2);
   a('optic',cy,.048,.009,.048,0,y,-.12,Math.PI/2);
   box('stitch',.007,.036,.007,0,y+.015,-.127,.6);
  }else if(id==='estatewarden'){
   for(const x of [-.053,.053]){
    rod('armor',x,y-.114,-.054,x*1.45,y+.124,-.06,.02);
    rod('optic',x*.79,y-.08,-.079,x*1.2,y+.109,-.081,.006);
   }
   for(let i=0;i<4;i++)box('trim',.137-i*.014,.017,.038,0,y+.071-i*.044,-.076,angle*(i%2?1:-1));
  }
 };
}
function operatorGear(id,side,part){
 return (a,rod,G)=>{
  if(id==='recruit'){scoutGear(a,G,side,part);return}
  const item=operatorDesigns[id].limbs[part];if(!item)return;
  const [material,w,h,d]=item;
  const bulky=id==='breaker'||id==='machinist',spectral=id==='estatewarden'||id==='meridian';
  const geo=spectral?new THREE.OctahedronGeometry(1):bulky?G.bx:G.cy;
  const y=part==='arm'?-.064:part==='forearm'?-.167:part==='leg'?-.215:-.143;
  a(material,geo,geo===G.bx?w:w*.59,geo===G.cy?h:geo===G.bx?h:h*.72,
   geo===G.bx?d:d*.59,side*(part==='arm'?.035:.013),y,part==='shin'?.049:.016,.06,0,side*.11);
  if(id==='bellwatch')for(let i=0;i<3;i++)a('trim',G.cy,w*.62,.015,d*.61,side*.02,y+(i-1)*h*.37,.023);
  if(spectral)a('optic',G.bx,w*.16,h*.49,.016,side*.024,y,d*.62,0,0,side*.13);
 };
}

function operatorPanel(a,material,stations,offset=[0,0,0],roll=0){
 const geometry=weaponLoft(stations.map(([y,width,back,front,round])=>[y,width,-front,-back,round]));
 geometry.rotateX(-Math.PI/2);
 a(material,geometry,1,1,1,...offset,0,0,roll);
}
function scoutTorso(a,rod,G){
 const shell=(mat,rows,offset,roll)=>operatorPanel(a,mat,rows,offset,roll);
 shell('fabric',[[-.037,.292,-.095,.1,.036],[.052,.314,-.104,.114,.053],[.206,.302,-.101,.114,.057],
  [.389,.389,-.127,.137,.068],[.497,.438,-.109,.126,.083],[.565,.307,-.087,.104,.067],[.598,.155,-.061,.077,.031]]);
 shell('stitch',[[.149,.341,-.128,.133,.044],[.224,.391,-.14,.182,.048],[.424,.397,-.13,.175,.048],[.501,.302,-.109,.15,.051],[.535,.238,-.096,.129,.044]]);
 shell('armor',[[.247,.305,.137,.181,.023],[.278,.349,.135,.196,.03],[.417,.341,.134,.193,.03],[.447,.261,.124,.178,.03],[.472,.212,.115,.147,.02]]);
 shell('stitch',[[.539,.158,-.07,.09,.034],[.567,.175,-.083,.096,.041],[.625,.136,-.065,.081,.035],[.642,.116,-.06,.079,.024]]);
 shell('fabric',[[.611,.117,-.05,.069,.024],[.644,.091,-.043,.053,.022],[.694,.091,-.042,.058,.023],
  [.723,.112,-.053,.058,.024]]);
 for(const side of [-1,1]){
  a('fabric',G.sp,.096,.081,.096,side*.228,.494,-.009,0,0,-side*.33);
  rod('stitch',side*.166,.402,.15,side*.108,.548,.015,.024);
  rod('stitch',side*.154,.385,-.125,side*.108,.545,.035,.022);
  rod('trim',side*.164,.409,.172,side*.126,.494,.088,.007);
  shell('armor',[[.163,.069,.14,.213,.016],[.186,.083,.143,.231,.016],[.252,.078,.146,.228,.015],[.274,.067,.15,.21]], [side*.113,0,0]);
  shell('stitch',[[.232,.077,.207,.228],[.245,.086,.21,.236],[.269,.075,.199,.229]], [side*.113,0,0]);
  for(let i=0;i<3;i++)a('trim',G.bx,.057,.007,.004,side*.105,.301+i*.028,.198);
 }
 shell('fabric',[[.159,.067,.169,.221,.014],[.18,.082,.169,.239,.019],[.255,.083,.169,.242,.017],[.282,.076,.169,.226,.015]]);
 a('trim',G.bx,.093,.028,.005,-.092,.425,.187,0,0,-.05);
 a('stitch',G.bx,.058,.01,.006,-.099,.425,.191,0,0,-.05);
 shell('armor',[[.17,.202,-.199,-.091,.034],[.21,.285,-.232,-.106,.038],[.432,.284,-.235,-.103,.051],[.486,.228,-.211,-.102,.044],[.509,.15,-.188,-.101,.033]]);
 shell('stitch',[[.229,.172,-.25,-.203,.025],[.276,.226,-.257,-.211,.037],[.384,.22,-.255,-.211,.032],[.421,.175,-.241,-.208,.019]]);
 rod('trim',-.112,.42,-.195,-.173,.681,-.152,.006);
 rod('stitch',.106,.443,-.187,.149,.31,.143,.009);
}
function scoutHead(a,rod,G){
 const shell=(mat,rows,offset,roll)=>operatorPanel(a,mat,rows,offset,roll);
 shell('skin',[[.032,.115,-.06,.083,.028],[.061,.155,-.077,.094,.036],[.128,.166,-.092,.104,.044],
  [.175,.162,-.089,.103,.044],[.214,.134,-.073,.077,.044],[.225,.093,-.057,.07,.029]]);
 shell('fabric',[[.025,.124,-.067,.082,.024],[.046,.163,-.075,.091,.034],[.09,.17,-.079,.105,.04],[.115,.146,-.068,.117,.036]]);
 shell('stitch',[[.071,.125,.073,.112,.021],[.092,.144,.074,.119,.029],[.121,.158,.079,.124,.032],[.137,.133,.083,.124,.024]]);
 shell('optic',[[.099,.137,.111,.126,.021],[.105,.164,.106,.135,.024],[.131,.158,.101,.137,.027],[.143,.126,.105,.125,.02]]);
 shell('armor',[[.124,.189,-.098,.089,.042],[.151,.221,-.113,.119,.054],[.19,.211,-.117,.112,.054],
  [.229,.174,-.1,.085,.045],[.249,.115,-.062,.048,.037]]);
 shell('stitch',[[.136,.21,-.088,.113,.032],[.15,.225,-.095,.131,.043],[.161,.207,-.097,.124,.04]]);
 for(const side of [-1,1]){
  a('stitch',G.cy,.037,.022,.038,side*.102,.113,-.017,0,0,Math.PI*.5);
  a('armor',G.cy,.027,.006,.027,side*.118,.113,-.017,0,0,Math.PI*.5);
  rod('stitch',side*.106,.119,-.002,side*.076,.049,.073,.008);
  rod('trim',side*.09,.163,.078,side*.104,.168,-.042,.005);
 }
 rod('stitch',.107,.085,-.014,.048,.056,.111,.004);
 a('stitch',G.ss,.013,.008,.006,.043,.054,.114);
}
function scoutGear(a,G,side,part){
 const panel=(mat,w,h,d,x,y,z,rx=0,rz=0)=>a(mat,hvR(w,h,d,Math.min(.018,d*.35)),w,h,d,x,y,z,rx,0,rz);
 if(part==='arm'){
  operatorPanel(a,'armor',[[-.147,.088,-.047,.056,.022],[-.106,.127,-.067,.068,.025],
   [-.037,.155,-.074,.078,.035],[.02,.132,-.054,.055,.034]],[side*.014,0,0],side*.15);
  panel('stitch',.06,.04,.01,0,-.042,.072,0,side*.11);
 }else if(part==='forearm')panel('armor',.083,.115,.039,0,-.152,.039);
 else if(part==='leg'){
  operatorPanel(a,'stitch',[[-.329,.124,-.053,.092,.031],[-.252,.159,-.073,.092,.038],[-.144,.169,-.086,.087,.04],
   [-.014,.167,-.079,.077,.04]]);
  panel('fabric',.085,.124,.02,side*.025,-.161,.092,0,side*.12);
 }else{
  operatorPanel(a,'fabric',[[-.398,.13,-.056,.069,.031],[-.28,.14,-.067,.07,.032],[-.126,.152,-.068,.078,.035],[-.035,.142,-.062,.089,.035]]);
  panel('armor',.119,.139,.049,0,-.021,.082,.1);
  panel('stitch',.105,.034,.026,0,-.088,.091,.15);
 }
}
