var StormwatchHub=(()=>{
 const world={
  timbervale:{name:'Timbervale',site:'Relay Ridge',floor:1,ceiling:19,pin:[30,45],color:'#638c64',high:'#acc17c',water:'#527774',terrain:'Pine forests and the old relay road'},
  ironridge:{name:'Ironridge',site:'Foundry Pass',floor:19,ceiling:46,pin:[53,29],color:'#8c8d71',high:'#d2bd8d',water:'#516c6e',terrain:'Ironworks along the mountain pass'},
  canyonlands:{name:'Canyonlands',site:'Copper Wash',floor:46,ceiling:70,pin:[67,70],color:'#ac6a4e',high:'#e4ad79',water:'#47767a',terrain:'Dry washes and abandoned mining camps'},
  obsidian:{name:'Obsidian Peaks',site:'Frostline Relay',floor:70,ceiling:140,pin:[78,27],color:'#728aa6',high:'#dae5e4',water:'#4c617c',terrain:'Glacial ridges and isolated research stations'}
 };
 const points=[
  {id:'defense',x:212,y:320,icon:'⬢',tint:'#76ebd0'},
  {id:'seal',x:491,y:197,icon:'◇',tint:'#e4a9ed'},
  {id:'nests',x:747,y:358,icon:'⌾',tint:'#ffaf92'},
  {id:'payload',x:560,y:517,icon:'↓',tint:'#b4d8ff'}
 ];
 const css=`<style>
  :host{color:#edf6f4;font:500 14px system-ui;position:fixed;inset:0;z-index:1001;display:block;background:#111d24}
  *{box-sizing:border-box}[hidden]{display:none!important}button,input,select{font:inherit;color:inherit}
  button{cursor:pointer;background:#233942;border:1px solid #5c7881;border-radius:5px;padding:.62rem .88rem;font-weight:650}
  button:disabled{opacity:.38;cursor:default}button:not(:disabled):is(:hover,:focus-visible){border-color:#b5ffeb;background:#315760}
  button:focus-visible,select:focus-visible,input:focus-visible{outline:2px solid #b5ffeb;outline-offset:3px}
  h1,h2,p,ul{margin:0}main{height:100%;display:flex;flex-direction:column}
  header{flex:none;display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:13px clamp(12px,2.4vw,35px);background:#14232b;border-bottom:1px solid #425862}
  h1{font:800 clamp(1.45rem,2.9vw,2.48rem)/1 'Barlow Condensed','Arial Narrow',system-ui;letter-spacing:.045em;text-transform:uppercase}
  nav{display:flex;gap:.38rem;flex-wrap:wrap}nav button{background:transparent;border-color:transparent}nav [aria-current=true]{border-color:#87d7c2;color:#a6f3df;background:#233e48}
  .power{color:#a6f3df;font-weight:750;white-space:nowrap}.small{font-size:.82rem;color:#b6c9cb}.eyebrow{color:#9bd7ca;font-size:.73rem;font-weight:760;letter-spacing:.12em;text-transform:uppercase}
  .panel{min-height:0;overflow:auto;flex:1;padding:clamp(12px,2vw,28px)}
  #map-panel{display:grid;grid-template-columns:minmax(0,1fr) minmax(235px,305px);gap:16px}
  #viewport{position:relative;isolation:isolate;overflow:hidden;min-height:330px;border:1px solid #59727b;border-radius:8px;background:#233e4a;touch-action:none}
  #viewport.dragging{cursor:grabbing}canvas,#pins{position:absolute;inset:0;width:100%;height:100%}#pins{pointer-events:none}
  .pin{position:absolute;transform:translate(-50%,-50%);pointer-events:auto;white-space:nowrap;background:#182b34ec;box-shadow:0 7px 14px #14282580;z-index:1}
  .pin[aria-pressed=true]{z-index:2;border-color:var(--signal,#b5ffeb);box-shadow:0 0 0 3px #f8fff22b,0 8px 16px #15292baa}
  .pin.world{display:flex;align-items:center;gap:7px}.pin.world span{color:var(--signal);font-size:1.05rem}
  .pin.node{padding:.22rem .55rem .28rem;color:var(--signal);font-size:1.47rem;min-width:39px;animation:float 2.9s ease-in-out infinite}
  .pin.node::after{content:"";position:absolute;top:100%;left:calc(50% - 1px);width:2px;height:15px;background:linear-gradient(var(--signal),transparent)}
  @keyframes float{50%{margin-top:-5px}}
  .map-tag{position:absolute;top:13px;left:13px;padding:6px 9px;background:#192d37e8;border-radius:4px;pointer-events:none}
  .map-tools{position:absolute;left:12px;bottom:12px;display:flex;gap:5px;z-index:3}
  .map-tools button{padding:.32rem .53rem;background:#172c37f2}
  aside{display:flex;flex-direction:column;gap:14px;align-self:start;background:#182931;border:1px solid #465e67;border-radius:8px;padding:18px}
  aside h2{font-size:1.45rem;line-height:1.1}aside p{line-height:1.5}
  .actions{display:grid;gap:8px}.actions .primary,.primary{background:#94e3cb;color:#122c33;border-color:#a2f2dc;font-weight:800}
  .actions .primary:not(:disabled):hover{background:#c1ffe7}.alert{display:flex;align-items:start;gap:7px}
  #ops{display:grid;gap:4px}#ops button{text-align:left;padding:.5rem;background:#1f323b}#ops button[aria-current=true]{color:#b4f8e6;border-color:#9adacb}
  #squad-panel,#inventory-panel,#citadel-panel{background:radial-gradient(ellipse at 87% 12%,#25454b,#131f27 69%)}
  .stack{max-width:900px;margin:auto;display:grid;gap:16px}.card{background:#182b35;border:1px solid #507078;border-radius:8px;padding:16px;display:grid;gap:12px}
  .cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(154px,1fr));gap:8px}.resource{min-height:95px}.resource b{font-size:1.7rem;color:#a6f3df}
  .row{display:flex;gap:7px;flex-wrap:wrap;align-items:center}label.slot{display:grid;gap:5px}
  input[type=text],select{border:1px solid #618089;background:#101e27;border-radius:4px;padding:.59rem .75rem}
  #code{font-size:1.6rem;color:#a6f3df;letter-spacing:.21em}#members{padding-left:1.2rem;line-height:1.8}
  #status{min-height:1.5em}#citadel-root{max-width:1020px;margin:auto}
  @media(max-width:760px){header{flex-wrap:wrap}nav{order:3;width:100%}#map-panel{grid-template-columns:1fr}#viewport{min-height:clamp(290px,51vh,490px)}aside{padding:12px}.pin.world{font-size:.68rem;padding:.42rem}}
  @media(prefers-reduced-motion:reduce){.pin.node{animation:none}}
 </style>`;
 function mount(options){
  const host=document.createElement('article');host.id='stormwatch-command';
  const root=host.attachShadow({mode:'open'});
  root.innerHTML=css+`<main>
   <header><h1>Stormwatch</h1><nav aria-label="Stormwatch">
    <button data-tab="map">World Map</button><button data-tab="squad">Squad</button>
    <button data-tab="inventory">Inventory</button><button data-tab="citadel">Citadel</button>
   </nav><div class="row"><span id="power" class="power"></span><button id="exit">Mode Select</button></div></header>
   <section id="map-panel" class="panel" aria-label="World Map">
    <div id="viewport" tabindex="0" aria-label="Operation map. Use the arrow keys to pan a region.">
     <canvas aria-hidden="true"></canvas><div id="pins"></div>
     <div class="map-tag eyebrow" id="map-name"></div>
     <div class="map-tools" id="tools" hidden>
      <button id="world">World Map</button><button data-pan="-1,0" aria-label="Pan left">←</button>
      <button data-pan="0,-1" aria-label="Pan up">↑</button><button data-pan="0,1" aria-label="Pan down">↓</button>
      <button data-pan="1,0" aria-label="Pan right">→</button>
     </div>
    </div>
    <aside><span class="eyebrow" id="region-name"></span><h2 id="title"></h2><p class="small" id="summary"></p>
     <div id="ops" hidden></div><label class="alert small" id="alert-label" hidden><input id="alert" type="checkbox"><span id="alert-copy"></span></label>
     <div class="actions" id="deploy-actions" hidden>
      <button id="queue" class="primary">Find Squad</button><button id="solo">Deploy Solo</button>
     </div>
     <p id="map-status" role="status" class="small"></p>
    </aside>
   </section>
   <section id="squad-panel" class="panel" hidden><div class="stack">
    <div class="card"><h2>Squad</h2><p id="status" role="status" class="small"></p>
     <div class="row" id="room" hidden><strong id="code"></strong><button id="copy">Copy Code</button><button id="room-lock" hidden></button><button id="leave">Leave Squad</button></div>
     <ul id="members"></ul>
     <form class="row" id="join-form"><button id="create" type="button">Create Private Squad</button><input type="text" id="join-code" maxlength="6" aria-label="Squad code" placeholder="SQUAD CODE" autocomplete="off"><button>Join</button></form>
     <p class="small">Up to four players. The host picks a mission and deploys the squad together.</p>
    </div>
   </div></section>
   <section id="inventory-panel" class="panel" hidden><div class="stack">
    <div class="card"><h2>Stored Salvage</h2><p class="small" id="inventory-status" role="status"></p><div class="cards" id="resources"></div></div>
    <div class="card"><h2>Deployment Loadout</h2><div class="row" id="loadout"></div></div>
    <div class="card"><h2>Recovered Blueprints</h2><div class="cards" id="schematics"></div></div>
   </div></section>
   <section id="citadel-panel" class="panel" hidden><div id="citadel-root"><p id="citadel-loading" class="small">Loading Citadel…</p></div></section>
  </main>`;
  document.body.append(host);
  const $=id=>root.getElementById(id),cv=root.querySelector('canvas'),ctx=cv.getContext('2d');
  const controller=new AbortController(),{signal}=controller;
  const listen=(target,name,fn)=>target.addEventListener(name,fn,{signal});
  const ops=StormwatchOperations.missions;
  let account=null,loadError=false,unmountCitadel=null,worldView=true,region='timbervale',mission='defense',tab='map',squadState=null;
  let selection=null,animation=0,drag=null,cam={x:480,y:330},aim={...cam},zoom=1,hidden=false,saving=false;
  const model=StormwatchCitadel;
  const profile=()=>account?.snapshot()||model.blank();
  const level=()=>model.rating(profile()).power;
  const alert=()=>StormwatchOperations.board(profile(),Date.now());
  const spec=()=>({region,mission,alert:$('alert').checked});
  const squad=options.connectSquad?options.connectSquad(updateSquad):StormwatchSquad.open(options.name||'Operator',updateSquad,options.peerConfig);
  const unsubscribe=squad.subscribe(d=>{
   if(d.type==='launch')start({...d.spec,squad,round:d.round});
  });
  function updateSquad(value){
   squadState=value;
   $('status').textContent=value.message;
   $('map-status').textContent=value.room?value.message:'';
   $('room').hidden=!value.room;
   $('copy').hidden=$('code').hidden=value.publicRoom;
   $('code').textContent=value.room.toUpperCase();
   $('room-lock').hidden=!value.isHost||value.publicRoom;
   $('room-lock').textContent=value.locked?'Unlock room':'Lock room';
   $('room-lock').setAttribute('aria-pressed',String(value.locked));
   $('leave').textContent=options.connectSquad?'Leave Party':'Leave Squad';
   $('join-form').hidden=!!value.room;
   $('members').replaceChildren(...value.members.map(m=>{
    const li=document.createElement('li');li.textContent=m.name+(m.host?' (Host)':'');
    if(value.isHost&&!m.host){
     const button=document.createElement('button');
     button.type='button';button.textContent='Remove';button.setAttribute('aria-label','Remove '+m.name);
     button.onclick=()=>squad.remove(m.id);li.append(' ',button);
    }
    return li;
   }));
   showInfo();
  }
  function allow(){return level()>=world[region].floor}
  function select(id){
   const refresh=mission!==id;
   mission=id;selection=points.find(p=>p.id===id);
   if(refresh)$('alert').checked=false;
   setPins();showInfo();
  }
  function setRegion(id){
   region=id;worldView=false;cam={x:480,y:330};aim={...cam};
   $('alert').checked=false;makeRegion();select('defense');queueFrame();
  }
  function showWorld(){
   worldView=true;$('map-name').textContent='World Map';setPins();showInfo();queueFrame();
  }
  function showInfo(){
   const entry=world[region],current=ops[mission],{alert:daily,orders}=alert();
   $('power').textContent='Power '+level();
   $('tools').hidden=worldView;$('ops').hidden=worldView;
   $('region-name').textContent=worldView?'Operations command':entry.name+' · Power '+entry.floor+'–'+entry.ceiling;
   $('title').textContent=worldView?'Choose a region':current.name;
   $('summary').textContent=worldView?'Select a pin to inspect its region and find a mission.':current.brief+(allow()?'':' Requires Power '+entry.floor+'.');
   $('alert-label').hidden=worldView||daily.mission!==mission;
   if(daily.mission!==mission)$('alert').checked=false;
   $('alert-copy').textContent=daily.name+(orders.alertClaimed?' · Reward collected':' · Bonus salvage');
   $('deploy-actions').hidden=worldView;
   const room=squadState?.room,hostReady=squadState?.connected&&squadState?.isHost;
   $('queue').textContent=room?(options.connectSquad?'Deploy Party':'Deploy Squad'):'Find Squad';
   $('queue').disabled=!allow()||!!room&&(!hostReady||squadState.starting||squadState.publicRoom);
   $('solo').hidden=!!room;$('solo').disabled=!allow();
   if(!worldView)$('map-name').textContent=entry.site+' / Sector Map';
   for(const b of $('ops').children)b.setAttribute('aria-current',String(b.dataset.id===mission));
  }
  function start(values){
   if(hidden){if(!values.squad||values.squad.host)return;options.clearMission?.()}
   hidden=true;host.hidden=true;cancelAnimationFrame(animation);animation=0;
   options.deploy(values,()=>{
    hidden=false;host.hidden=false;if(values.squad)squad.returns();
    if(account)account.refresh().then(()=>{showInfo();inventory()}).catch(()=>{});
    setTab('map');queueFrame();
   });
  }
  function setTab(next){
   if(tab==='citadel'&&next!=='citadel'){unmountCitadel?.();unmountCitadel=null}
   tab=next;
   for(const b of root.querySelectorAll('[data-tab]'))b.setAttribute('aria-current',String(b.dataset.tab===tab));
   for(const id of ['map','squad','inventory','citadel'])$(id+'-panel').hidden=id!==tab;
   if(tab==='map')queueFrame();
   if(tab==='inventory')inventory();
   if(tab==='citadel')mountCitadel();
  }
  let citadelMounting=false;
  async function mountCitadel(){
   if(unmountCitadel||!account||citadelMounting)return;
   citadelMounting=true;
   try{
    const attach=await account.prepareUI();
    if(signal.aborted||tab!=='citadel')return;
    $('citadel-loading').hidden=true;
    const socket=document.createElement('div');$('citadel-root').append(socket);
    const unmount=attach(socket);
    unmountCitadel=()=>{unmount();socket.remove();showInfo()};
   }catch{if(!signal.aborted){$('citadel-loading').hidden=false;$('citadel-loading').textContent='Citadel management could not load.'}}
   finally{citadelMounting=false}
  }
  function tile(title,detail){
   const card=document.createElement('div'),name=document.createElement('span'),value=document.createElement('b');
   card.className='card resource';name.textContent=title;value.textContent=detail;card.append(name,value);return card;
  }
  function inventory(){
   const save=profile();
   $('inventory-status').textContent=loadError?'Browser storage is unavailable.':account?'Salvage and blueprints carry over between operations.':'Loading saved inventory…';
   $('resources').replaceChildren(...Object.entries(model.components).map(([id,name])=>tile(name,String(save.inventory[id]||0))));
   $('schematics').replaceChildren(...Object.values(save.blueprints).map(b=>{
    const card=tile(b.name,'Lv. '+b.level);return card;
   }));
   const weapons=Object.entries(save.blueprints).filter(([id,b])=>b.kind==='weapon'&&options.canEquip?.(id));
   $('loadout').replaceChildren(...[0,1].map(slot=>{
    const wrap=document.createElement('label'),select=document.createElement('select');
    wrap.className='slot';wrap.textContent=slot?'Secondary':'Primary';
    select.add(new Option('Spartan Drill loadout',''));
    for(const [id,b] of weapons)select.add(new Option(b.name,id));
    select.value=save.fieldLoadout?.[slot]||'';select.disabled=!account||saving||!weapons.length;
    select.onchange=async()=>{
     saving=true;const result=await account.dispatch({type:'field-loadout',slot,id:select.value});
     saving=false;if(signal.aborted)return;
     inventory();if(!result)$('inventory-status').textContent='Loadout could not be saved.';
    };
    wrap.append(select);return wrap;
   }));
  }
  for(const [id,op] of Object.entries(ops)){
   const b=document.createElement('button');b.textContent=op.name;b.dataset.id=id;b.onclick=()=>{
    select(id);aim.x=selection.x;aim.y=selection.y;queueFrame();
   };$('ops').append(b);
  }
  root.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>setTab(b.dataset.tab));
  $('world').onclick=showWorld;$('exit').onclick=options.exit;
  $('solo').onclick=()=>{if(allow())start(spec())};
  $('queue').onclick=()=>{
   if(!allow())return;
   if(squad.room){squad.launch(spec());return}
   if(worldView)return;
   squad.quick(spec());setTab('squad');
  };
  $('create').onclick=()=>squad.create();
  $('leave').onclick=()=>squad.leave();
  $('room-lock').onclick=()=>squad.toggleLock();
  $('copy').onclick=async()=>{
   try{await navigator.clipboard.writeText(squad.room.toUpperCase());$('status').textContent='Squad code copied.'}
   catch{$('status').textContent='Share code '+squad.room.toUpperCase()}
  };
  $('join-form').onsubmit=e=>{e.preventDefault();squad.join($('join-code').value)};
  model.open().then(saved=>{
   if(signal.aborted){saved.close();return}
   account=saved;showInfo();if(tab==='inventory')inventory();if(tab==='citadel')mountCitadel();
  }).catch(()=>{
   if(signal.aborted)return;
   loadError=true;$('citadel-loading').textContent='Citadel storage is unavailable.';if(tab==='inventory')inventory();
  });
  const chart=document.createElement('canvas'),paint=chart.getContext('2d');
  chart.width=960;chart.height=660;
  const land=[[74,306],[128,242],[105,201],[158,156],[279,160],[316,108],[380,109],[418,62],[522,120],[560,106],[637,132],[699,67],[788,107],[853,177],[819,225],[878,279],[815,344],[846,385],[763,415],[773,490],[686,540],[643,581],[542,564],[483,531],[407,548],[374,508],[319,505],[274,438],[198,441],[157,404],[93,398],[115,351]];
  function trace(c,coords,close=false){
   c.beginPath();coords.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));if(close)c.closePath();
  }
  function randomFrom(seed){
   return ()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
  }
  function grid(c,width,height,gap,color){
   c.beginPath();c.strokeStyle=color;c.lineWidth=1;
   for(let x=0;x<width;x+=gap){c.moveTo(x+.5,0);c.lineTo(x+.5,height)}
   for(let y=0;y<height;y+=gap){c.moveTo(0,y+.5);c.lineTo(width,y+.5)}
   c.stroke();
  }
  function ridge(c,x,y,s,color){
   c.fillStyle='#15232c52';trace(c,[[x+s*.15,y-s*.64],[x-s*.65,y+s*.45],[x+s*.78,y+s*.51]],true);c.fill();
   c.fillStyle=color;trace(c,[[x-s*.08,y-s*.76],[x-s*.73,y+s*.34],[x+s*.5,y+s*.39]],true);c.fill();
   c.fillStyle='#24374066';trace(c,[[x-s*.08,y-s*.76],[x-s*.02,y+s*.36],[x+s*.5,y+s*.39]],true);c.fill();
  }
  function worldChart(){
   const c=paint,r=randomFrom(24);
   c.fillStyle='#335763';c.fillRect(0,0,960,660);grid(c,960,660,40,'#b6d9db22');
   trace(c,land,true);c.strokeStyle='#829d9f';c.lineWidth=12;c.stroke();
   c.fillStyle='#7c9479';c.fill();c.save();c.clip();
   const wash=c.createLinearGradient(150,100,800,530);
   wash.addColorStop(0,'#83a476');wash.addColorStop(.35,'#9cb09a');wash.addColorStop(.66,'#7c8e83');wash.addColorStop(1,'#be8a61');
   c.fillStyle=wash;c.fillRect(0,0,960,660);
   for(let i=0;i<38;i++){
    const x=r()*960,y=r()*660,s=25+r()*105;
    c.strokeStyle=i%2?'#cbd1ad60':'#263f3b4c';c.lineWidth=1.25;
    for(let k=1;k<=3;k++){c.beginPath();c.ellipse(x,y,s*k*.32,s*k*.16,.35,0,Math.PI*2);c.stroke()}
   }
   for(let i=0;i<66;i++){const x=r()*960,y=r()*660;ridge(c,x,y,8+r()*29,y<270?'#d2dbcb':'#a8aa78')}
   c.strokeStyle='#4d7880';c.lineWidth=15;c.beginPath();c.moveTo(722,137);c.bezierCurveTo(633,280,412,180,398,319);c.bezierCurveTo(390,390,491,472,523,562);c.stroke();
   c.strokeStyle='#e0c5939e';c.lineWidth=3;c.setLineDash([7,7]);trace(c,[[285,311],[396,256],[510,191],[730,180],[719,337],[640,467]]);c.stroke();c.setLineDash([]);
   c.restore();
   c.font='700 15px system-ui';c.letterSpacing='3px';c.fillStyle='#c6e2df';c.fillText('WESTERN SEA',103,505);c.fillText('N',887,100);
   trace(c,[[893,108],[893,141]]);c.lineWidth=1;c.strokeStyle='#c6e2df';c.stroke();
  }
  function building(c,x,y,w,h,kind){
   c.fillStyle='#15252a52';c.fillRect(x+6,y+7,w,h);
   c.fillStyle=kind?'#373f48':'#684f42';c.fillRect(x,y,w,h);
   c.fillStyle=kind?'#aebbc0':'#d9a78a';c.fillRect(x+2,y+2,w-4,h*.48);
   c.fillStyle=kind?'#657681':'#9a6c57';c.fillRect(x+2,y+h*.5,w-4,h*.5-2);
   c.fillStyle='#f3dba9';c.fillRect(x+w*.43,y+h-3,4,5);
  }
  function makeRegion(){
   const entry=world[region],c=paint,r=randomFrom(Object.keys(world).indexOf(region)*543+100);
   c.fillStyle=entry.color;c.fillRect(0,0,960,660);
   const bands=[];
   for(let i=0;i<31;i++)bands.push([r()*960,r()*660,37+r()*120]);
   for(const [x,y,s] of bands){
    for(let k=4;k>0;k--){
     c.fillStyle=k%2?'#f4f4d811':'#15243119';c.strokeStyle='#e3e9cf5c';c.lineWidth=1;
     c.beginPath();c.ellipse(x,y,s*k*.24,s*k*.14,.52,0,Math.PI*2);c.fill();c.stroke();
    }
   }
   c.lineJoin='round';c.lineCap='round';
   c.strokeStyle=entry.water;c.lineWidth=35;c.beginPath();c.moveTo(-40,514);c.bezierCurveTo(231,565,248,134,528,112);c.bezierCurveTo(653,81,751,189,985,117);c.stroke();
   c.strokeStyle='#b5d0bd70';c.lineWidth=1.5;c.stroke();
   const road=[[45,370],[153,366],[212,320],[355,292],[446,214],[491,197],[642,240],[747,358],[672,435],[560,517],[406,584],[281,622]];
   trace(c,road);c.strokeStyle='#353c36a6';c.lineWidth=21;c.stroke();
   c.strokeStyle='#d0b894b5';c.lineWidth=14;c.stroke();
   c.strokeStyle='#f8e6bf96';c.lineWidth=1.5;c.setLineDash([9,9]);c.stroke();c.setLineDash([]);
   for(let i=0;i<205;i++){
    const x=r()*960,y=r()*660;
    if(road.some(([a,b])=>Math.hypot(a-x,b-y)<48)||points.some(p=>Math.hypot(p.x-x,p.y-y)<65))continue;
    if(region==='timbervale'||region==='ironridge'){
     c.fillStyle='#253c31';c.beginPath();c.arc(x+2,y+3,3+r()*4,0,Math.PI*2);c.fill();
     c.fillStyle=i%3?'#3d684d':'#8fae6f';c.beginPath();c.arc(x,y,3+r()*5,0,Math.PI*2);c.fill();
    }else ridge(c,x,y,5+r()*15,entry.high);
   }
   for(const [index,p] of points.entries()){
    c.fillStyle='#17252c30';c.fillRect(p.x-49,p.y-25,98,66);
    c.strokeStyle=p.tint+'85';c.strokeRect(p.x-49,p.y-25,98,66);
    if(index===1){c.strokeStyle=p.tint;c.beginPath();c.arc(p.x,p.y+8,23,0,Math.PI*2);c.stroke()}
    for(let k=0;k<5;k++)building(c,p.x+(k%3-1)*29-8,p.y+(k<3?19:-15),12+r()*10,11+r()*9,index!==0);
   }
   grid(c,960,660,48,'#eef4dd39');
  }
  const pins=new Map();
  function setPins(){
   $('pins').replaceChildren();pins.clear();
   const list=worldView?Object.entries(world).map(([id,i])=>({id,...i})):points;
   for(const item of list){
    const button=document.createElement('button');button.className='pin '+(worldView?'world':'node');
    button.style.setProperty('--signal',worldView?item.high:item.tint);
    button.setAttribute('aria-pressed',String(worldView?item.id===region:item.id===mission));
    if(worldView){
     const icon=document.createElement('span');icon.textContent='◆';button.append(icon,item.name);
     button.title=item.terrain+' · Power '+item.floor+'–'+item.ceiling;
     button.onclick=()=>{setRegion(item.id);pins.get('defense')?.focus({preventScroll:true})};
    }else{
     button.textContent=item.icon;button.title=ops[item.id].name;button.setAttribute('aria-label',button.title);
     button.onclick=()=>{select(item.id);pins.get(item.id)?.focus({preventScroll:true})};
    }
    pins.set(item.id,button);$('pins').append(button);
   }
   queueFrame();
  }
  function queueFrame(){if(!animation&&!hidden&&tab==='map')animation=requestAnimationFrame(draw)}
  function draw(){
   animation=0;
   const w=cv.clientWidth,h=cv.clientHeight;if(!w||!h)return;
   const ratio=Math.min(devicePixelRatio||1,2),width=Math.round(w*ratio),height=Math.round(h*ratio);
   if(cv.width!==width||cv.height!==height){cv.width=width;cv.height=height}
   ctx.setTransform(ratio,0,0,ratio,0,0);
   const s=Math.min(w/960,h/660);
   zoom=worldView?s:Math.max(w/960,h/660)*1.36;
   const dx=aim.x-cam.x,dy=aim.y-cam.y;
   cam.x+=Math.abs(dx)<.3?dx:dx*.18;cam.y+=Math.abs(dy)<.3?dy:dy*.18;
   const tx=worldView?(w-960*zoom)/2:w/2-cam.x*zoom;
   const ty=worldView?(h-660*zoom)/2:h/2-cam.y*zoom;
   ctx.fillStyle=worldView?'#335763':world[region].color;ctx.fillRect(0,0,w,h);
   ctx.drawImage(worldView?atlas:chart,tx,ty,960*zoom,660*zoom);
   for(const [id,b] of pins){
    const p=worldView?world[id].pin.map((n,i)=>n*.01*(i===0?960:660)):(()=>{const entry=points.find(p=>p.id===id);return [entry.x,entry.y-19]})();
    b.style.left=tx+p[0]*zoom+'px';b.style.top=ty+p[1]*zoom+'px';
   }
   if(Math.abs(dx)+Math.abs(dy)>.5)queueFrame();
  }
  function pan(dx,dy){
   const keep=(n,min,max)=>Math.max(min,Math.min(n,max));
   aim.x=keep(aim.x+dx,147,819);aim.y=keep(aim.y+dy,127,556);queueFrame();
  }
  const view=$('viewport');
  for(const button of root.querySelectorAll('[data-pan]'))button.onclick=()=>pan(...button.dataset.pan.split(',').map(n=>Number(n)*80));
  listen(view,'keydown',e=>{
   if(worldView)return;
   const dir={ArrowLeft:[-65,0],ArrowRight:[65,0],ArrowUp:[0,-65],ArrowDown:[0,65],a:[-65,0],d:[65,0],w:[0,-65],s:[0,65]}[e.key];
   if(dir){e.preventDefault();pan(...dir)}
  });
  listen(view,'pointerdown',e=>{
   if(worldView||e.button!==0||e.composedPath().some(n=>n.tagName==='BUTTON'))return;
   drag={id:e.pointerId,x:e.clientX,y:e.clientY};view.setPointerCapture(e.pointerId);view.classList.add('dragging');
  });
  listen(view,'pointermove',e=>{
   if(drag?.id!==e.pointerId)return;
   pan((drag.x-e.clientX)/zoom,(drag.y-e.clientY)/zoom);drag.x=e.clientX;drag.y=e.clientY;
  });
  listen(view,'lostpointercapture',()=>{drag=null;view.classList.remove('dragging')});
  listen(window,'resize',queueFrame);
  const padTabs=['map','squad','inventory','citadel'];
  let previousPad=[];
  const padTimer=setInterval(()=>{
   if(hidden||document.hidden)return;
   const pad=Array.from(navigator.getGamepads?.()||[]).find(g=>g?.connected);
   if(!pad){previousPad=[];return}
   const buttons=Array.from(pad.buttons,b=>b.pressed),edge=i=>buttons[i]&&!previousPad[i];
   const direction=edge(12)?-1:edge(13)?1:edge(14)?-1:edge(15)?1:0;
   if(direction){
    const focusable=[...root.querySelectorAll('button:not(:disabled),input:not(:disabled),select:not(:disabled)')]
     .filter(e=>e.getClientRects().length&&(!e.classList.contains('pin')||worldView||
      e.getBoundingClientRect().left>=view.getBoundingClientRect().left&&e.getBoundingClientRect().right<=view.getBoundingClientRect().right));
    const index=focusable.indexOf(root.activeElement);
    if(focusable.length)focusable[(index<0?0:(index+direction+focusable.length)%focusable.length)]?.focus({preventScroll:true});
   }
   if(tab==='map'&&!worldView){
    const x=pad.axes[0]||0,y=pad.axes[1]||0;
    if(Math.abs(x)>.28||Math.abs(y)>.28)pan(x*21,y*21);
   }
   if(edge(0)&&root.activeElement?.matches('button,input[type=checkbox]'))root.activeElement.click();
   if(edge(1)&&worldView===false&&tab==='map')showWorld();
   if(edge(4)||edge(5)){
    const index=(padTabs.indexOf(tab)+(edge(4)?-1:1)+padTabs.length)%padTabs.length;
    setTab(padTabs[index]);root.querySelector('[data-tab='+tab+']').focus();
   }
   previousPad=buttons;
  },50);
  worldChart();const atlas=document.createElement('canvas');atlas.width=960;atlas.height=660;atlas.getContext('2d').drawImage(chart,0,0);
  setTab('map');showWorld();squad.status();
  return {close(){
   controller.abort();clearInterval(padTimer);cancelAnimationFrame(animation);unsubscribe();squad.close();unmountCitadel?.();account?.close();host.remove();
  }};
 }
 return {mount};
})();
