var StormwatchHub=(()=>{
 function pads(){
  try{return [...navigator.getGamepads()].filter(g=>g?.connected&&g.axes.length>=4)}catch{return []}
 }
 function controllerPad(){
  const assigned=window.SD_SPLIT?.pad;
  return pads().find(g=>assigned==null||g.index===assigned);
 }
 function launchLocal(settings,url){
  const [first,second]=pads();if(!second)return;
  url.searchParams.delete('openStormwatch');
  const room=Math.random().toString(36).slice(2,12).padEnd(6,'0');
  for(const [key,value] of Object.entries({...settings,split:room,g1:first.index,g2:second.index}))url.searchParams.set(key,value);
  location.assign(url);
 }
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
  :host([hidden]){display:none!important}
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
  #squad-panel,#inventory-panel,#citadel-panel,#audio-panel,#campaign-panel{background:radial-gradient(ellipse at 87% 12%,#25454b,#131f27 69%)}
  .stack{max-width:900px;margin:auto;display:grid;gap:16px}.card{background:#182b35;border:1px solid #507078;border-radius:8px;padding:16px;display:grid;gap:12px}
  .cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(154px,1fr));gap:8px}.resource{min-height:95px}.resource b{font-size:1.7rem;color:#a6f3df}
  .row{display:flex;gap:7px;flex-wrap:wrap;align-items:center}label.slot{display:grid;gap:5px}
  .audio-control{display:grid;grid-template-columns:minmax(0,1fr) 5ch;gap:6px 12px;align-items:center;padding:11px 0;border-bottom:1px solid #405961}
  .audio-control span{grid-column:1/-1}.audio-control input{width:100%;accent-color:#94e3cb}.audio-control output{text-align:right;font-variant-numeric:tabular-nums}
  .audio-checkbox span{grid-column:1}.audio-checkbox input{justify-self:end;width:19px;height:19px}
  #invite-keys{display:grid;grid-template-columns:repeat(auto-fit,minmax(39px,1fr));gap:4px}
  #invite-keys button{padding:.4rem}
  @media(max-height:450px){header{padding:5px 10px;gap:4px}header h1{font-size:1.45rem}nav button{padding:.32rem .52rem}.panel{padding:9px}.campaign-hero{min-height:initial;padding:14px}.campaign-hero h2{font-size:2rem}}
  #campaign-panel .stack{max-width:1120px}
  .campaign-hero{position:relative;isolation:isolate;overflow:hidden;min-height:300px;grid-template-columns:minmax(0,1fr);gap:14px;align-content:center;padding:clamp(18px,4vw,54px);border-color:#78959a;border-left:4px solid var(--chapter-signal,#addac6);background:#1a2b35;box-shadow:0 18px 32px #08101a8c}
  .campaign-hero #campaign-scene{z-index:-2;position:absolute;width:100%;height:100%;object-fit:cover;object-position:right center}
  .campaign-hero::before{content:"";position:absolute;inset:0;background:linear-gradient(90deg,#102128 0%,#102128ee 26%,#1021288f 53%,#10212822 100%);z-index:-1}
  .campaign-hero .chapter-copy,.campaign-pay{max-width:min(575px,66%)}
  .campaign-hero .eyebrow{color:var(--chapter-signal,#addac6)}
  .campaign-hero h2{margin:5px 0 9px;font:850 clamp(2.25rem,5.5vw,5.55rem)/.88 'Barlow Condensed','Arial Narrow',system-ui;letter-spacing:-.027em;text-transform:uppercase;text-shadow:0 5px 20px #071016}
  .campaign-hero p{line-height:1.5;color:#edf8ee}.campaign-pay{display:grid;gap:5px;align-content:center;border-top:1px solid #c4eeb765;padding-top:9px}
  .campaign-hero progress,.operation-card progress{width:100%;accent-color:#94e3cb;height:8px}
  .campaign-actions{display:flex;flex-wrap:wrap;gap:7px;grid-column:1/-1}
  .campaign-route{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px}
  .campaign-region{display:grid;gap:8px;align-content:start;border-top:3px solid var(--sector);min-width:0;position:relative;background:linear-gradient(160deg,#20323a,#14252d)}
  .campaign-region h3{margin:0;font-size:1rem}.campaign-region ul{display:grid;gap:7px;padding:0;list-style:none;line-height:1.45}
  .campaign-region li{display:grid;gap:2px;padding:5px 7px 5px 17px;position:relative;border-left:1px solid #53636c;color:#bccdcd;font-size:.79rem}
  .campaign-region li::before{content:"";position:absolute;left:-4px;top:10px;width:7px;height:7px;background:#637e82;transform:rotate(45deg)}
  .campaign-region li[data-won]::before{background:var(--sector)}
  .campaign-region li[aria-current=step]{border-color:var(--sector);color:#f2fff9;background:#2a444a}
  .campaign-region li[aria-current=step]::before{background:var(--sector);box-shadow:0 0 11px var(--sector);animation:tracking 2.6s ease-out infinite}
  .campaign-region small{color:#a7d9cc}.campaign-foot{min-height:1.1em;color:#b0e9cf}
  #campaign-panel:not([hidden]) .campaign-hero{animation:dispatch-enter .4s cubic-bezier(.2,.7,.3,1) both}
  @keyframes dispatch-enter{from{opacity:0;transform:translateY(9px)}}
  @keyframes tracking{65%{box-shadow:0 0 1px var(--sector)}}
  .citadel-content{display:grid;gap:14px}.citadel-content p,.citadel-content small{line-height:1.5}
  .citadel-rating,.citadel-stock{display:flex;flex-wrap:wrap;align-items:center;gap:9px 14px;padding:12px;background:#192e37;border:1px solid #496873;border-radius:6px}
  .citadel-rating strong,.citadel-stock span{color:#a6f3df}
  .citadel-tabs{display:flex;flex-wrap:wrap;gap:6px}.citadel-tabs [aria-selected=true]{border-color:#87d7c2;color:#a6f3df;background:#233e48}
  .citadel-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(195px,1fr));gap:10px}
  .citadel-grid fieldset,.operation-card,.citadel-blueprints article{min-width:0;border:1px solid #496873;background:#182b35;border-radius:6px;padding:12px}
  .citadel-select,.operation-card,.citadel-blueprints{display:grid;align-content:start;gap:7px;min-width:0}
  .citadel-select select,.citadel-catalog{width:100%;min-width:0}.operation-card h3,.citadel-blueprints h3{margin:0}
  .citadel-blueprints article{display:grid;gap:8px}.citadel-blueprints .citadel-grid button{min-width:0}
  @media(max-width:840px){.campaign-route{grid-template-columns:repeat(2,minmax(0,1fr))}}
  @media(max-width:520px){.campaign-route{grid-template-columns:1fr}.campaign-hero :is(.chapter-copy,.campaign-pay){max-width:100%}.campaign-hero::before{background:linear-gradient(90deg,#102128f5,#10212885)}}
  input[type=text],select{border:1px solid #618089;background:#101e27;border-radius:4px;padding:.59rem .75rem}
  #code{font-size:1.6rem;color:#a6f3df;letter-spacing:.21em}#members{padding-left:1.2rem;line-height:1.8}
  #status{min-height:1.5em}#citadel-root{max-width:1020px;margin:auto}
  @media(max-width:760px){header{flex-wrap:wrap}nav{order:3;width:100%}#map-panel{grid-template-columns:1fr}#viewport{min-height:clamp(290px,51vh,490px)}aside{padding:12px}.pin.world{font-size:.68rem;padding:.42rem}}
  @media(prefers-reduced-motion:reduce){.pin.node,#campaign-panel:not([hidden]) .campaign-hero,.campaign-region li[aria-current=step]::before{animation:none}}
 </style>`;
 function mount(options){
  const host=document.createElement('article');host.id='stormwatch-command';
  const root=host.attachShadow({mode:'open'});
  root.innerHTML=css+`<main>
   <header><h1>Stormwatch</h1><nav aria-label="Stormwatch">
    <button data-tab="campaign">Campaign</button><button data-tab="map">World Map</button><button data-tab="squad">Squad</button>
    <button data-tab="inventory">Armory</button><button data-tab="citadel">Citadel</button><button data-tab="audio">Audio</button>
   </nav><div class="row"><span id="power" class="power"></span><button id="exit">Mode Select</button></div></header>
   <section id="campaign-panel" class="panel" hidden><div class="stack">
    <article class="card campaign-hero">
     <canvas id="campaign-scene" width="1120" height="425" aria-hidden="true"></canvas>
     <div class="chapter-copy"><span id="chapter-region" class="eyebrow"></span><h2 id="chapter-title">The Northern Line</h2><p id="chapter-brief"></p></div>
     <div class="campaign-pay"><b class="eyebrow" id="chapter-payout-label">Chapter reward</b><p id="chapter-payout" class="small"></p>
      <progress id="campaign-progress" aria-label="Campaign progress"></progress><small id="campaign-count" class="small"></small>
     </div>
     <div class="campaign-actions"><button id="chapter-mission" class="primary">Find operation on map</button><button id="chapter-claim" class="primary" hidden>Claim chapter reward</button><button id="to-research">Citadel research</button></div>
    </article>
    <div id="campaign-route" class="campaign-route"></div><p id="chapter-status" class="small campaign-foot" role="status"></p>
   </div></section>
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
     <div id="operation-pay" class="small" hidden><b class="eyebrow">Victory payout</b><p id="pay-detail"></p></div>
     <div id="ops" hidden></div><label class="alert small" id="alert-label" hidden><input id="alert" type="checkbox"><span id="alert-copy"></span></label>
     <div class="actions" id="deploy-actions" hidden>
      <button id="queue" class="primary">Find Squad</button><button id="solo">Deploy Solo</button>
     </div>
     <p id="map-status" role="status" class="small"></p>
    </aside>
   </section>
   <section id="squad-panel" class="panel" hidden><div class="stack">
    <div class="card"><h2>Squad</h2><p id="status" role="status" class="small"></p>
     <button id="local-split" type="button" hidden>Play local split screen</button><p id="local-help" class="small" hidden></p>
     <div class="row" id="room" hidden><strong id="code"></strong><button id="copy">Copy Code</button><button id="room-lock" hidden></button><button id="leave">Leave Squad</button></div>
     <ul id="members"></ul>
     <form class="row" id="join-form"><button id="create" type="button">Create Private Squad</button><input type="text" id="join-code" maxlength="14" aria-label="Squad code" placeholder="XXXX-XXXX-XXXX" autocomplete="off"><button>Join</button></form>
     <div id="invite-keys" aria-label="Squad code keypad" hidden></div>
    </div>
   </div></section>
   <section id="inventory-panel" class="panel" hidden><div class="stack">
    <div class="card" id="pattern-card" hidden><h2>Recovered Patterns</h2><p id="pattern-status" class="small" role="status"></p><div class="cards" id="patterns"></div></div>
    <div class="card"><h2>Stored Salvage</h2><p class="small" id="inventory-status" role="status"></p><div class="cards" id="resources"></div></div>
    <div class="card"><h2>Deployment Loadout</h2><div class="row" id="loadout"></div></div>
    <div class="card"><h2>Blueprints</h2><div class="cards" id="schematics"></div></div>
   </div></section>
   <section id="citadel-panel" class="panel" hidden><div id="citadel-root"><p id="citadel-loading" class="small">Loading Citadel…</p></div></section>
   <section id="audio-panel" class="panel" hidden><div class="stack"><div class="card"><h2>Audio</h2>
    ${PlayerAudio.controls(true)}
   </div></div></section>
  </main>`;
  document.body.append(host);
  const $=id=>root.getElementById(id),cv=$('viewport').querySelector('canvas'),ctx=cv.getContext('2d');
  const unbindAudio=PlayerAudio.bind($('audio-panel'));
  $('exit').textContent=options.local?'Exit split screen':'Mode Select';
  $('local-split').hidden=$('local-help').hidden=!options.split;
  const tabs=[...root.querySelectorAll('[data-tab]')].map(button=>button.dataset.tab);
  const controller=new AbortController(),{signal}=controller;
  const listen=(target,name,fn)=>target.addEventListener(name,fn,{signal});
  let padFocus=null;
  listen(root,'focusin',event=>{padFocus=event.target});
  const ops=StormwatchOperations.missions;
  let account=null,loadError=false,unmountCitadel=null,worldView=true,region='timbervale',mission='defense',tab='campaign',squadState=null;
  let selection=null,animation=0,drag=null,cam={x:480,y:330},aim={...cam},zoom=1,hidden=false,saving=false;
  let citadelView={},claiming=false,licensing=false,paintedSector='',commandAudio=null;
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
   $('room').hidden=!!options.local||!value.room;
   $('copy').hidden=$('code').hidden=value.publicRoom;
   $('code').textContent=value.room.toUpperCase();
   $('room-lock').hidden=!value.isHost||value.publicRoom;
   $('room-lock').textContent=value.locked?'Unlock room':'Lock room';
   $('room-lock').setAttribute('aria-pressed',String(value.locked));
   $('leave').textContent=options.connectSquad?'Leave Party':'Leave Squad';
   $('join-form').hidden=!!value.room;
   $('members').replaceChildren(...value.members.map(m=>{
    const li=document.createElement('li');li.textContent=m.name+(m.host?' (Host)':'');
    if(!options.local&&value.isHost&&!m.host){
     const button=document.createElement('button');
     button.type='button';button.textContent='Remove';button.setAttribute('aria-label','Remove '+m.name);
     button.onclick=()=>squad.remove(m.id);li.append(' ',button);
    }
    return li;
   }));
   showInfo();
  }
  function allow(id=region){
   return level()>=world[id].floor||StormwatchOperations.campaignProgress(profile()).unlocked.includes(id);
  }
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
   $('summary').textContent=worldView?'Select a pin to inspect its region and find a mission.':current.brief+(allow()?'':' Unlock through the campaign or reach Power '+entry.floor+'.');
   $('operation-pay').hidden=worldView;
   if(!worldView)$('pay-detail').textContent=model.payoutText(mission,region);
   $('alert-label').hidden=worldView||daily.mission!==mission;
   if(daily.mission!==mission)$('alert').checked=false;
   $('alert-copy').textContent=daily.name+(orders.alertClaimed?' · Reward collected':' · Bonus salvage');
   $('deploy-actions').hidden=worldView;
   const room=squadState?.room,hostReady=squadState?.connected&&squadState?.isHost;
   $('queue').textContent=options.local?(hostReady?'Deploy both players':'Waiting for Player 1'):
    room?(options.connectSquad?'Deploy Party':'Deploy Squad'):'Find Squad';
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
    const next=StormwatchOperations.campaignProgress(profile()).active;
    const campaignMission=next&&next.region===values.region&&next.mission===values.mission;
    if(account)account.refresh().then(()=>{showInfo();if(tab==='inventory')inventory();if(tab==='campaign')renderCampaign()}).catch(()=>{});
    setTab(campaignMission?'campaign':'map');queueFrame();
   });
  }
  function setTab(next,view={}){
   if(tab==='citadel'&&next!=='citadel'){unmountCitadel?.();unmountCitadel=null}
   tab=next;
   for(const b of root.querySelectorAll('[data-tab]'))b.setAttribute('aria-current',String(b.dataset.tab===tab));
   for(const id of tabs)$(id+'-panel').hidden=id!==tab;
   if(tab==='map')queueFrame();
   if(tab==='campaign')renderCampaign();
   if(tab==='inventory')inventory();
   if(tab==='citadel'){citadelView=view;mountCitadel()}
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
    const unmount=attach(socket,citadelView);
    unmountCitadel=()=>{unmount();socket.remove();showInfo()};
   }catch{if(!signal.aborted){$('citadel-loading').hidden=false;$('citadel-loading').textContent='Citadel management could not load.'}}
   finally{citadelMounting=false}
  }
  function tile(title,detail){
   const card=document.createElement('div'),name=document.createElement('span'),value=document.createElement('b');
   card.className='card resource';name.textContent=title;value.textContent=detail;card.append(name,value);return card;
  }
  function campaignScene(id){
   if(id===paintedSector)return;
   paintedSector=id;
   const canvas=$('campaign-scene'),c=canvas.getContext('2d'),w=canvas.width,h=canvas.height;
   const sector=world[id],rand=randomFrom(28+Object.keys(world).indexOf(id)*1471);
   const sky=c.createLinearGradient(0,0,0,h);
   sky.addColorStop(0,'#11182c');sky.addColorStop(.6,'#3d4562');sky.addColorStop(1,'#17262c');
   c.fillStyle=sky;c.fillRect(0,0,w,h);
   const glow=c.createRadialGradient(858,155,18,858,155,260);
   glow.addColorStop(0,'#b389e774');glow.addColorStop(.5,'#607f9570');glow.addColorStop(1,'#627aa800');
   c.fillStyle=glow;c.fillRect(0,0,w,h);
   c.lineWidth=1;
   for(let i=0;i<17;i++){
    c.strokeStyle=i%4?'#bac2e72c':'#d9deb762';c.beginPath();
    c.ellipse(853,134,90+i*19,20+i*7,-.14,3.1,6.45);c.stroke();
   }
   const ridge=(top,amplitude,fill)=>{
    c.beginPath();c.moveTo(0,h);
    for(let x=0;x<=w+24;x+=22){
     const offset=Math.sin(x*.009+top)*.34+Math.sin(x*.026-top)*.17+rand()*.49;
     c.lineTo(x,top-offset*amplitude);
    }
    c.lineTo(w,h);c.closePath();c.fillStyle=fill;c.fill();
   };
   ridge(310,158,'#47566a');ridge(358,133,'#344554');ridge(402,118,'#233842');
   const sweep=(points,color,width)=>{
    c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));
    c.strokeStyle=color;c.lineWidth=width;c.stroke();
   };
   for(let i=0;i<3;i++){
    const start=960+i*33,points=[[start,-6],[start-31,44],[start-7,45],[start-62,119],[start-47,122],[start-92,186]];
    sweep(points,'#bd94f64a',6);sweep(points,'#dec8f0ad',1.5);
   }
   const silhouette=(points,fill)=>{
    c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=fill;c.fill();
   };
   silhouette([[673,425],[714,355],[765,342],[796,307],[854,305],[908,332],[955,328],[1009,371],[1120,393],[1120,425]],'#111e29');
   for(let i=0;i<25;i++){
    const x=652+rand()*461,y=354+rand()*53,size=8+rand()*28;
    const slope=id==='obsidian'?size*.46:size*.31;
    silhouette([[x-slope,y],[x,y-size],[x+slope,y],[x+2,y+3],[x+2,y+8],[x-2,y+8],[x-2,y+2]],i%3?'#172832':'#273e45');
   }
   silhouette([[783,329],[812,259],[859,252],[899,278],[925,342],[876,356]],'#172330');
   silhouette([[800,275],[853,245],[890,276],[845,296]],'#4b535d');
   silhouette([[810,279],[844,289],[844,338],[795,326]],'#253543');
   silhouette([[844,288],[891,276],[912,330],[845,346]],'#202c38');
   for(let i=0;i<4;i++){
    c.fillStyle=i%2?sector.high:'#ffbf7e';
    c.fillRect(857+i*9,301-i*3,5,6);c.fillRect(808+i*7,301+i*2,4,5);
   }
   sweep([[821,268],[835,137],[858,259],[821,268]],'#8a98a0',3);
   sweep([[826,237],[849,216],[829,199],[841,181],[832,164]],'#829195',2);
   sweep([[794,198],[871,198],[835,161],[794,198]],'#819198',3);
   c.shadowColor=sector.high;c.shadowBlur=30;c.fillStyle='#feddad';
   c.beginPath();c.arc(835,137,4.5,0,Math.PI*2);c.fill();
   c.shadowBlur=0;c.strokeStyle=sector.high+'90';c.lineWidth=1;
   for(const r of [20,31,48]){c.beginPath();c.arc(835,137,r,0,Math.PI*2);c.stroke()}
   for(let i=0;i<55;i++){
    const x=610+rand()*506,y=13+rand()*337;
    c.fillStyle=i%3?sector.high+'55':'#fff1b090';c.fillRect(x,y,i%4?1:2,1);
   }
  }
  function renderCampaign(){
   const {active,chapters,claimed,wins,unlocked}=StormwatchOperations.campaignProgress(profile());
   const count=chapters.filter(chapter=>claimed[chapter.key]).length;
   const finished=!active,cleared=!!active&&!!wins[active.key];
   const sector=active?.region||'obsidian';
   campaignScene(sector);
   $('campaign-scene').parentElement.style.setProperty('--chapter-signal',world[sector].high);
   $('chapter-region').textContent=active?'The Northern Line · '+world[active.region].name:'The Northern Line';
   $('chapter-title').textContent=active?.title||'The network is online';
   $('chapter-brief').textContent=active?active.brief:'All four regions are connected. Replay operations, raise your Citadel research, or take on daily alerts.';
   $('chapter-payout-label').textContent=finished?'Campaign progress':'Chapter reward';
   $('chapter-payout').hidden=finished;
   $('chapter-payout').textContent=active?[...Object.entries(active.reward).map(([id,n])=>n+' '+model.components[id]),active.marks+' Field Mark'+(active.marks===1?'':'s')].join(' · '):'';
   $('campaign-progress').max=chapters.length;$('campaign-progress').value=count;
   $('campaign-count').textContent=count+' / '+chapters.length+' chapters completed';
   $('chapter-claim').hidden=!cleared;$('chapter-claim').disabled=claiming||!account;
   $('chapter-mission').hidden=finished||cleared;
   $('chapter-mission').disabled=!active||!allow(active.region);
   $('to-research').textContent='Citadel research · '+(profile().marks||0)+' Marks';
   $('campaign-route').replaceChildren(...Object.entries(world).map(([id,sector])=>{
    const panel=document.createElement('article'),title=document.createElement('h3'),access=document.createElement('small'),list=document.createElement('ul');
    panel.className='card campaign-region';panel.style.setProperty('--sector',sector.high);
    title.textContent=sector.name;
    access.textContent=unlocked.includes(id)?'Campaign clearance':allow(id)?'Open by Power':'Campaign locked';
    for(const chapter of chapters.filter(entry=>entry.region===id)){
     const row=document.createElement('li'),label=document.createElement('strong'),missionName=document.createElement('small');
     label.textContent=chapter.title;
     missionName.textContent=ops[chapter.mission].name+(claimed[chapter.key]?' · Claimed':wins[chapter.key]?' · Victory recorded':'');
     if(active?.key===chapter.key)row.setAttribute('aria-current','step');
     if(wins[chapter.key])row.dataset.won='';
     row.append(label,missionName);list.append(row);
    }
    panel.append(title,access,list);return panel;
   }));
  }
  $('chapter-mission').onclick=()=>{
   const chapter=StormwatchOperations.campaignProgress(profile()).active;
   if(!chapter||!allow(chapter.region))return;
   setRegion(chapter.region);select(chapter.mission);
   aim.x=selection.x;aim.y=selection.y;setTab('map');
   const deploy=$('solo').hidden?$('queue'):$('solo');
   if(deploy.disabled)$('ops').querySelector('[aria-current=true]')?.focus();else deploy.focus();
  };
  $('chapter-claim').onclick=async()=>{
   const {active,unlocked}=StormwatchOperations.campaignProgress(profile());
   if(!account||!active||claiming)return;
   claiming=true;$('chapter-claim').disabled=true;
   try{
    if(!commandAudio&&window.AudioContext)commandAudio=new AudioContext();
    commandAudio?.resume().catch(()=>{});
   }catch{}
   const saved=await account.dispatch({type:'claim-chapter',id:active.key});
   claiming=false;if(signal.aborted)return;
   const opened=StormwatchOperations.campaignProgress(profile()).unlocked.find(id=>!unlocked.includes(id));
   $('chapter-status').textContent=saved?(opened?'Clearance granted for '+world[opened].name+'.':'Chapter reward added to the Citadel.'):'The chapter reward could not be claimed.';
   renderCampaign();showInfo();
   if(saved){
    if(!matchMedia('(prefers-reduced-motion: reduce)').matches)$('campaign-scene').animate?.([{filter:'brightness(1.65)'},{filter:'brightness(1)'}],{duration:520});
    if(commandAudio?.state==='running')for(const [i,pitch] of [392,523,659].entries()){
     const note=commandAudio.createOscillator(),gain=commandAudio.createGain(),start=commandAudio.currentTime+i*.072;
     note.type='triangle';note.frequency.value=pitch;gain.gain.value=.001;
     gain.gain.setValueAtTime(.001,start);gain.gain.linearRampToValueAtTime(.052,start+.02);gain.gain.exponentialRampToValueAtTime(.001,start+.27);
     note.connect(gain).connect(PlayerAudio.output(commandAudio,'effects',true));note.start(start);note.stop(start+.28);
    }
   }
   if(tab==='campaign')($('chapter-claim').hidden?$('chapter-mission').hidden?$('to-research'):$('chapter-mission'):$('chapter-claim')).focus();
  };
  $('to-research').onclick=()=>setTab('citadel',{panel:'Research'});
  function inventory(){
   const save=profile();
   $('inventory-status').textContent=loadError?'Browser storage is unavailable.':account?'Salvage and blueprints carry over between operations.':'Loading saved inventory…';
   $('resources').replaceChildren(...Object.entries(model.components).map(([id,name])=>tile(name,String(save.inventory[id]||0))));
   const patterns=Object.entries(save.patterns||{});
   $('pattern-card').hidden=!patterns.length;
   $('pattern-status').textContent=(save.marks||0)+' Field Marks available · Unlock a blueprint for 1 Field Mark.';
   $('patterns').replaceChildren(...patterns.map(([id,name])=>{
    const card=tile(name,'Unlicensed'),button=document.createElement('button');
    button.textContent='Unlock blueprint';button.disabled=!account||licensing||!(save.marks>0);
    button.onclick=async()=>{
     licensing=true;
     for(const action of $('patterns').querySelectorAll('button'))action.disabled=true;
     const saved=await account.dispatch({type:'license-pattern',id});
     licensing=false;if(signal.aborted)return;
     inventory();if(!saved)$('pattern-status').textContent='Could not unlock the blueprint.';
     else if(tab==='inventory')$('schematics').querySelector('[data-plan="'+id+'"]')?.focus();
    };
    card.append(button);return card;
   }));
   $('schematics').replaceChildren(...Object.entries(save.blueprints).map(([id,b])=>{
    const card=tile(b.name,'Lv. '+b.level),button=document.createElement('button');
    button.dataset.plan=id;button.textContent='Upgrade';button.disabled=!account;
    button.setAttribute('aria-label','Upgrade '+b.name);
    button.onclick=()=>setTab('citadel',{panel:'Blueprints',item:id});card.append(button);
    return card;
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
  $('local-split').onclick=()=>options.split?.();
  function splitStatus(){
   if(!options.split)return;
   const ready=pads().length>=2;
   $('local-split').disabled=!ready||!!squadState?.room;
   $('local-help').textContent=ready?'Two controllers ready.':'Connect two controllers and press a button on each.';
  }
  const keyPanel=$('invite-keys'),codeInput=$('join-code');
  function closeKeypad(){
   keyPanel.hidden=true;codeInput.focus();
  }
  function showKeypad(){
   keyPanel.hidden=false;keyPanel.firstElementChild.focus();
  }
  for(const char of [...inviteAlphabet,'Delete','Done']){
   const button=document.createElement('button');button.type='button';button.textContent=char;
   button.onclick=()=>{
    if(char==='Done'){closeKeypad();$('join-form').querySelector('button:last-child').focus();return}
    const plain=codeInput.value.replace(/[\s-]/g,'').toUpperCase();
    codeInput.value=(char==='Delete'?plain.slice(0,-1):(plain+char).slice(0,inviteLength)).match(/.{1,4}/g)?.join('-')||'';
   };
   keyPanel.append(button);
  }
  model.open().then(saved=>{
   if(signal.aborted){saved.close();return}
   account=saved;showInfo();if(tab==='inventory')inventory();if(tab==='citadel')mountCitadel();if(tab==='campaign')renderCampaign();
  }).catch(()=>{
   if(signal.aborted)return;
   loadError=true;$('citadel-loading').textContent='Citadel storage is unavailable.';
   $('chapter-status').textContent='Browser storage is unavailable. Campaign progress cannot be saved.';if(tab==='inventory')inventory();
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
  let previousPad=[],previousIndex=-1,stickDirection=0;
  const padTimer=setInterval(()=>{
   if(hidden||document.hidden)return;
   if(tab==='squad')splitStatus();
   const pad=controllerPad();
   if(!pad){previousPad=[];previousIndex=-1;stickDirection=0;return}
   const buttons=Array.from(pad.buttons,b=>b.pressed),edge=i=>pad.index===previousIndex&&buttons[i]&&!previousPad[i];
   const nintendo=/057e|nintendo|switch|joy-con|wii/i.test(pad.id);
   const stick=Math.abs(pad.axes[1])>.58?Math.sign(pad.axes[1]):0;
   const direction=edge(12)?-1:edge(13)?1:edge(14)?-1:edge(15)?1:stick!==stickDirection?stick:0;
   stickDirection=stick;
   const control=root.activeElement||(options.local&&padFocus?.getClientRects().length&&!padFocus.disabled?padFocus:null);
   if(control?.matches('select,input[type=range]')&&(edge(14)||edge(15))){
    if(control.matches('select')){
     control.selectedIndex=Math.max(0,Math.min(control.options.length-1,control.selectedIndex+(edge(14)?-1:1)));
     control.dispatchEvent(new Event('change',{bubbles:true}));
    }else{
     if(edge(14))control.stepDown();else control.stepUp();
     control.dispatchEvent(new Event('input',{bubbles:true}));
    }
   }else if(direction){
    const focusable=[...(keyPanel.hidden?root:keyPanel).querySelectorAll('button:not(:disabled),input:not(:disabled),select:not(:disabled)')]
     .filter(e=>e.getClientRects().length&&(!e.classList.contains('pin')||worldView||
      e.getBoundingClientRect().left>=view.getBoundingClientRect().left&&e.getBoundingClientRect().right<=view.getBoundingClientRect().right));
    const index=focusable.indexOf(control);
    if(focusable.length){
     const next=focusable[(index<0?0:(index+direction+focusable.length)%focusable.length)];
     next.focus({preventScroll:true});next.scrollIntoView({block:'nearest',inline:'nearest'});
    }
   }
   if(tab==='map'&&!worldView){
    const x=pad.axes[0]||0,y=pad.axes[1]||0;
    if(Math.abs(x)>.28||Math.abs(y)>.28)pan(x*21,y*21);
   }
   if(edge(nintendo?1:0)){
    if(control===codeInput)showKeypad();
    else if(control?.matches('button,input[type=checkbox]'))control.click();
    else if(!control)root.querySelector('[data-tab='+tab+']').focus();
   }
   if(edge(nintendo?0:1)){
    if(!keyPanel.hidden)closeKeypad();
    else if(!worldView&&tab==='map')showWorld();
   }
   if(keyPanel.hidden&&(edge(4)||edge(5))){
    const index=(tabs.indexOf(tab)+(edge(4)?-1:1)+tabs.length)%tabs.length;
    setTab(tabs[index]);root.querySelector('[data-tab='+tab+']').focus();
   }
   previousPad=buttons;previousIndex=pad.index;
  },50);
  worldChart();const atlas=document.createElement('canvas');atlas.width=960;atlas.height=660;atlas.getContext('2d').drawImage(chart,0,0);
  setTab('campaign');showWorld();squad.status();
  return {close(){
   controller.abort();clearInterval(padTimer);cancelAnimationFrame(animation);unsubscribe();unbindAudio();squad.close();unmountCitadel?.();account?.close();host.remove();
   if(commandAudio){PlayerAudio.release(commandAudio);commandAudio.close()}
  }};
 }
 return {mount,controllerPad,launchLocal};
})();
