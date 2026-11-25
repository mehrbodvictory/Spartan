/* Shared by the arena modes and both Stormwatch entry points. */
var PlayerAudio=(()=>{
 const key='sd-audio-options',options={master:1,effects:1,ambience:1,captions:false};
 try{
  const master=localStorage.getItem('sdrill-vol');
  if(master!==null&&Number.isFinite(Number(master)))options.master=Math.max(0,Math.min(1,Number(master)));
  const saved=JSON.parse(localStorage.getItem(key))||{};
  for(const channel of ['effects','ambience']){
   if(Number.isFinite(saved[channel]))options[channel]=Math.max(0,Math.min(1,saved[channel]));
  }
  options.captions=saved.captions===true;
 }catch{}
 const contexts=new WeakMap(),levels=new Set(),listeners=new Set();
 function set(name,value){
  if(!Object.prototype.hasOwnProperty.call(options,name))return;
  const next=name==='captions'?value===true:Math.max(0,Math.min(1,Number(value)));
  if((name!=='captions'&&!Number.isFinite(next))||options[name]===next)return;
  options[name]=next;
  try{
   if(name==='master')localStorage.setItem('sdrill-vol',String(next));
   else localStorage.setItem(key,JSON.stringify({effects:options.effects,ambience:options.ambience,captions:options.captions}));
  }catch{}
  for(const item of levels){
   if(item.context.state==='closed'){levels.delete(item);continue}
   if(item.channel===name||name==='master'&&item.master){
    item.gain.gain.setTargetAtTime(options[item.channel]*(item.master?options.master:1),item.context.currentTime,.025);
   }
  }
  for(const callback of listeners)callback(name,next);
 }
 function output(context,channel='effects',master=false){
  let buses=contexts.get(context);
  if(!buses){buses=new Map();contexts.set(context,buses)}
  const id=channel+Number(master);
  if(buses.has(id))return buses.get(id);
  const gain=context.createGain();
  gain.gain.value=options[channel]*(master?options.master:1);
  gain.connect(context.destination);buses.set(id,gain);
  levels.add({context,gain,channel,master});
  return gain;
 }
 function release(context){
  for(const item of levels)if(item.context===context)levels.delete(item);
  contexts.delete(context);
 }
 function subscribe(callback){listeners.add(callback);return ()=>listeners.delete(callback)}
 function bind(root){
  const fields=[...root.querySelectorAll('[data-audio-option]')];
  for(const field of fields){
   const name=field.dataset.audioOption;
   const apply=()=>set(name,name==='captions'?field.checked:field.value);
   field.addEventListener('input',apply);
   field.addEventListener('change',apply);
  }
  const update=()=>{
   for(const field of fields){
    const name=field.dataset.audioOption,value=options[name];
    if(name==='captions')field.checked=value;
    else{
     field.value=value;
     const output=field.parentElement.querySelector('output');
     if(output)output.textContent=Math.round(value*100)+'%';
    }
   }
  };
  update();return subscribe(update);
 }
 function controls(master=false){
  const slider=(name,label)=>`<label class="audio-control"><span>${label}</span><input type="range" min="0" max="1" step="0.05" value="1" aria-label="${label}" data-audio-option="${name}"><output aria-hidden="true">100%</output></label>`;
  return (master?slider('master','Master volume'):'')+slider('effects','Sound effects')+slider('ambience','Ambience')+
   '<label class="audio-control audio-checkbox"><span>Sound captions</span><input type="checkbox" data-audio-option="captions"></label>';
 }
 function direction(angle){
  if(!Number.isFinite(angle))return '';
  const sector=((Math.round(angle/(Math.PI/4))%8)+8)%8;
  return ['Ahead','Ahead right','Right','Behind right','Behind','Behind left','Left','Ahead left'][sector];
 }
 function captions(container){
  const rows=new Map();
  function remove(id){
   const item=rows.get(id);if(!item)return;
   clearTimeout(item.timer);item.line.remove();rows.delete(id);
   container.hidden=!rows.size;
  }
  function clear(){for(const id of rows.keys())remove(id)}
  const unsubscribe=subscribe((name,value)=>{if(name==='captions'&&!value)clear()});
  function show(label,angle){
   if(!options.captions||!container.isConnected)return;
   const heading=direction(angle),id=label+'\n'+heading;
   let item=rows.get(id);
   if(!item){
    if(rows.size>=3)remove(rows.keys().next().value);
    const line=document.createElement('div'),text=document.createElement('b');
    text.textContent=label;line.append(text);
    if(heading){const dir=document.createElement('span');dir.textContent=heading;line.append(dir)}
    item={line,timer:0};rows.set(id,item);container.append(line);
   }
   container.hidden=false;
   clearTimeout(item.timer);item.timer=setTimeout(()=>remove(id),1850);
  }
  return {show,clear,close(){unsubscribe();clear()}};
 }
 return {set,output,release,subscribe,bind,controls,captions,get master(){return options.master},get captionsOn(){return options.captions}};
})();
