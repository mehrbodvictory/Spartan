const practiceName='Practice Range';
let practiceSession=null;

const aimOptions={ads:55,shape:'weapon',color:'#f8f8ed',size:100};
try{
 const saved=JSON.parse(localStorage.getItem('sd-aim-options'))||{};
 if(Number.isFinite(saved.ads))aimOptions.ads=cl(saved.ads,25,150);
 if(Number.isFinite(saved.size))aimOptions.size=cl(saved.size,50,200);
 if(['weapon','dot','cross','off'].includes(saved.shape))aimOptions.shape=saved.shape;
 if(typeof saved.color==='string'&&/^#[a-f0-9]{6}$/i.test(saved.color))aimOptions.color=saved.color;
}catch{}
function applyAimOptions(){
 const reticle=$('#cx');
 reticle.dataset.shape=aimOptions.shape;
 reticle.style.setProperty('--crosshair-color',aimOptions.color);
 reticle.style.setProperty('--crosshair-size',aimOptions.size/100);
 for(const field of $$('[data-aim-option]'))field.value=aimOptions[field.dataset.aimOption];
 for(const output of $$('[data-aim-value]'))output.value=aimOptions[output.dataset.aimValue]+'%';
}
for(const field of $$('[data-aim-option]'))field.oninput=()=>{
 aimOptions[field.dataset.aimOption]=field.type==='range'?Number(field.value):field.value;
 applyAimOptions();
 try{localStorage.setItem('sd-aim-options',JSON.stringify(aimOptions))}catch{}
};
applyAimOptions();

const practiceMap={
 H:34,ps:[0,26],sky:0xb4d1dc,gr:0x666b61,gt:'concrete',bc:0x657474,day:1,skyk:'day',fogF:110,
 hemi:1.05,hemiC:0xe7f3f2,sunC:0xffefcf,sunI:1.08,
 inside:(x,z)=>Math.abs(x)<21&&z>-33&&z<32,
 b(){
  const walls=[[-21,0,.85,66,4.7,0,0x53666a,'metal'],[21,0,.85,66,4.7,0,0x53666a,'metal'],
   [0,-33,43,1.4,6,0,0x333f42,'metal'],[0,32,43,.85,4.7,0,0x53666a,'metal']];
  for(const side of [-1,1]){
   walls.push([side*17,27,6,9,3.5,0,0x4c5d62,'metal']);
   for(const z of [-20,-3,14])walls.push([side*17,z,3,2,1.4,0,0x72705e,'concrete']);
   for(const x of [6,12,18])for(const z of [-24,-4,16,26])
    walls.push([side*x,z,.07,5,.02,0,0xb9a76a,'concrete']);
  }
  for(const z of [-24,-4,16,26])walls.push([0,z,36,.09,.022,0,0xd9bd66,'concrete']);
  return walls;
 }
};

function startPractice(guided=false){
 if(run||netOn||window.SD_SPLIT)return;
 if(net||partyActive){
  $('#practice-note').textContent='Leave the online lobby or party to practice solo.';
  return;
 }
 $('#practice-note').textContent='';
 practiceSession={map:sel.map,targets:0,headshots:0,training:guided?{step:0}:null};
 document.body.classList.add('practice-range');
 document.body.classList.toggle('basic-training',guided);
 MAPS[practiceName]=practiceMap;sel.map=practiceName;startGame();
 const reset=$('#practice-reset');
 reset.textContent=guided?'Restart training':'Reset targets and ammo';
 reset.hidden=false;
 if(guided)renderTraining();
}
$('#practice-start').onclick=()=>startPractice();
$('#training-start').onclick=()=>startPractice(true);
$('#practice-reset').onclick=()=>{
 if(!practiceSession)return;
 practiceSession.targets=practiceSession.headshots=0;shots=hits=0;rel=0;
 for(const b of bots){b.hp=b.mhp;b.al=1;b.m.visible=true;b.flash=0;b.rt=0}
 for(const w of wp){w.mag=w.m;w.res=w.m*(w.rs??4)}
 if(practiceSession.training){
  [P.x,P.z]=practiceMap.ps;
  P.y=P.vy=P.mx=P.mz=0;yaw=pitch=kick=0;
  ctlReset();equipLifeWeapons();
  practiceSession.training={step:0};renderTraining();
 }else{gc=LG()?2:0;setGun()}
 lockPtr();
};

const trainingCoach=$('#training-coach');
const trainingTitles=['Get moving','Clear a target','Reload','Switch weapons','Land a sidearm hit','Training complete'];
const trainingDrills=trainingTitles.length-1;
const trainingKey='sd-training-complete';
function trainingComplete(){
 try{return localStorage.getItem(trainingKey)==='1'}catch{return false}
}
function trainingControls(){
 if(xrS)return ['Left stick','Right trigger','Right grip','B'];
 if(PG.on)return [PG.b('ls'),PG.b('rt'),PG.l('reload'),PG.l('swap')];
 if(isTouch)return ['Move stick','Fire area on the right','Reload','Swap'];
 return [['fwd','left','back','right'].map(action=>keyName(bindOf(action))).join(' / '),'Left mouse button',keyName(bindOf('reload')),keyName(bindOf('next'))];
}
function renderTraining(){
 const training=practiceSession.training,[move,fire,reload,swap]=trainingControls();
 const hints=[
  'Move a few steps from the starting line. · '+move,
  'Aim at an orange target and fire short bursts until it drops. · '+fire,
  'Fire once if the magazine is full, then reload. · '+reload,
  'Equip your Magnum sidearm. · '+swap,
  'Hit an orange target with the Magnum. · '+fire,
  'Keep practicing or exit from the pause menu.'
 ];
 trainingCoach.hidden=false;
 trainingCoach.children[0].textContent=training.step===trainingDrills?'All drills cleared':'Basic training · '+(training.step+1)+' / '+trainingDrills;
 trainingCoach.children[1].textContent=trainingTitles[training.step];
 trainingCoach.children[2].textContent=hints[training.step];
 training.input=xrS?'xr':PG.on?PG.type:isTouch?'touch':'mouse';
}
function advanceTraining(training){
 training.step++;
 training.targets=practiceSession.targets;
 training.hits=hits;
 if(training.step===trainingDrills){
  try{localStorage.setItem(trainingKey,'1')}catch{}
  beep(880,.22,'triangle',.07);
 }
 renderTraining();
}
function trainingTick(training){
 switch(training.step){
  case 0:
   if(Math.hypot(P.x-practiceMap.ps[0],P.z-practiceMap.ps[1])>=3)advanceTraining(training);
   break;
  case 1:
   if(practiceSession.targets>training.targets)advanceTraining(training);
   break;
  case 2:{
   const weapon=cw();
   if(rel>0){
    training.reloadWeapon=weapon;training.reloadMagazine=weapon.mag;
   }else if(training.reloadWeapon){
    if(training.reloadWeapon===weapon&&weapon.mag>training.reloadMagazine)advanceTraining(training);
    training.reloadWeapon=null;
   }
   break;
  }
  case 3:
   if(cw().k==='MG')advanceTraining(training);
   break;
  case 4:
   if(cw().k==='MG'&&hits>training.hits)advanceTraining(training);
   else if(cw().k!=='MG')training.hits=hits;
 }
 if(training.input!==(xrS?'xr':PG.on?PG.type:isTouch?'touch':'mouse'))renderTraining();
}

function practiceSetup(){
 const materials={
  stand:new THREE.MeshLambertMaterial({color:0x343e45}),
  shell:new THREE.MeshLambertMaterial({color:0xf6a944}),
  plate:new THREE.MeshLambertMaterial({color:0x38505d}),
  light:new THREE.MeshBasicMaterial({color:0xffe5a0})
 };
 mapG.addEventListener('removed',()=>{for(const material of Object.values(materials))material.dispose()});
 for(const [x,z,travel,speed] of [[0,16,0,0],[-5,5,0,0],[7,0,3,1.65],[-10,-9,2,.95],[0,-15,4,1.45],[11,-21,2,1.1],[-8,-24,0,0]]){
  const b=addBot(85,1,null,true);
  b.m.clear();mapG.add(b.m);
  b.practice=true;b.rig=null;b.hp=b.mhp=85;b.sh=b.msh=0;b.al=1;
  b.x=b.startX=x;b.z=z;b.travel=travel;b.speed=speed;b.flash=0;b.rt=0;b.nm='Target';
  const box=(name,w,h,d,y)=>{
   const piece=new THREE.Mesh(bg,materials[name]);
   piece.scale.set(w,h,d);piece.position.y=y;b.m.add(piece);return piece;
  };
  box('stand',.62,.1,.55,.05);box('stand',.17,.73,.16,.39);
  box('plate',.65,.73,.25,.98);box('shell',.48,.56,.12,1.02).position.z=.139;
  box('stand',.14,.13,.13,1.42);box('plate',.37,.33,.24,1.69);
  box('shell',.265,.215,.056,1.73).position.z=.128;
  b.lead=box('light',.31,.038,.07,1.15);b.lead.position.z=.209;
 }
}

function practiceHit(b,damage,head){
 takeDmg(b,damage);hits++;b.flash=.13;
 $('#hm').className='on'+(head?' hd':'');hmT=.12;
 if(head)practiceSession.headshots++;
 beep(head?1050:650,.065,'square',.055);
 if(b.hp>0)return;
 b.al=0;b.rt=1.15;practiceSession.targets++;
 burst(V(b.x,head?1.69:1,b.z),12,0xffbd64,4,.4,.064);
}

function practiceTick(dt){
 for(const b of bots){
  b.flash=Math.max(0,b.flash-dt);
  if(b.al)b.x=b.startX+Math.sin(t0*b.speed)*b.travel;
  else if((b.rt-=dt)<=0){b.hp=b.mhp;b.al=1}
  b.lead.visible=b.al&&b.flash<=0;
  b.m.position.set(b.x,0,b.z);
  b.m.rotation.x=b.al?0:-Math.min(1.3,(1.15-b.rt)*7);
 }
 for(const w of wp)w.res=w.m*(w.rs??4);
 if(practiceSession.training)trainingTick(practiceSession.training);
 const percentage=shots?Math.min(100,Math.round(hits/shots*100)):0;
 const stats='Practice Range · '+practiceSession.targets+' cleared · '+practiceSession.headshots+' head hits · '+percentage+'% accuracy';
 const objective=$('#ob');if(objective.textContent!==stats)objective.textContent=stats;
}
