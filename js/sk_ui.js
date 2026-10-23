/* ===================== sk_ui.js ===================== */
/* ---------- killstreak loadout: 3 selected streaks (L.ks), awarding by kills, the HUD, using them (keys 3 to 6 use the ready ones in the order you earned them),
   and the SCORESTREAKS screen: a grid of every streak with its model, description and cost, three SELECTED slots at the bottom. Opened from the Killstreaks tile in the loadout screen. ---------- */
const skSel=()=>{if(!Array.isArray(L.ks)||L.ks.length!=3)L.ks=SK_DEF.slice();return L.ks};
const skOK=id=>!!STK[id]&&(typeof unlocked=='function'?unlocked('sk:'+id):true);
{const _san=sanitize;sanitize=function(){_san.apply(this,arguments);const k=skSel();for(let i=0;i<3;i++)if(!skOK(k[i]))k[i]=SK_DEF[i]}}
function skAward(){if(mode=='Zombies')return;for(const id of skSel()){const s=STK[id];if(!s||SK.got[id]||q.includes(id))continue;if(ks>=Math.max(1,s.k-hl())){SK.got[id]=1;q.push(id);msg(s.n+' ready: press '+(2+q.length),2.5);if(typeof popup=='function')popup(s.n.toUpperCase(),'KILLSTREAK READY')}}
 if(ks>=Math.max(1,STK.nuke.k-hl())&&!SK.got.nuke&&skOK('nuke')&&!q.includes('nuke')){SK.got.nuke=1;q.push('nuke');msg('NUKE available',3)}}
useStreak=function(i){i=i||0;if(mode=='Zombies')return zUse();if(P.dead||SK.rc||q.length<=i)return;const id=q[i],f=SKB[id];if(!f){q.splice(i,1);return}q.splice(i,1);beep(500,.2,'sine',.1);f()};
ksHud=function(){const sel=skSel(),row=(id)=>{const s=STK[id],t=Math.max(1,s.k-hl()),qi=q.indexOf(id),rdy=qi>=0,used=!rdy&&SK.got[id];return `<div class="kt ${rdy?'rdy':used?'used':''}"><b>${s.n}</b><i>${rdy?'['+(qi+3)+'] READY':used?'USED':Math.min(ks,t)+' / '+t}</i></div>`},
 h=sel.map(row).join('')+q.filter(id=>!sel.includes(id)).map(row).join('');if(h!=ksC){ksC=h;$('#kst').innerHTML=`<small>KILLSTREAKS · ${ks}</small>`+h}};
/* ---------- images ---------- */
const skImg=id=>{const u=objImg('sk_'+id,()=>skModel(id));return u||''};
const skTag=id=>{const u=skImg(id);return u?`<img src="${u}" alt="">`:''};
/* ---------- screen ---------- */
const SKU={sel:'uav',slot:0,cat:-1};
function skOpen(){SKU.sel=skSel()[SKU.slot]||'uav';$$('#nav button').forEach(x=>x.classList.remove('on'));$$('.pn').forEach(p=>p.classList.toggle('on',p.id=='p-ks'));skRender()}
function skBack(){const b=document.querySelector('#nav button[data-p="load"]');if(b)b.click()}
function skRender(){const e=$('#p-ks');if(!e)return;const sel=skSel(),cur=STK[SKU.sel]||STK.uav,lock=!skOK(cur.id),hid=cur.id=='nuke'&&lock;
 const tiles=STKL.filter(s=>SKU.cat<0||s.c==SKU.cat).map(s=>{const lk=!skOK(s.id),hd=s.id=='nuke'&&lk,on=sel.includes(s.id);return `<button class="sk ${SKU.sel==s.id?'sel':''} ${lk?'lk':''} ${on?'eq':''}" data-sk="${s.id}"><span class="skc">${hd?'':s.k}</span>${lk?`<u>🔒</u>`:''}<span class="ski">${hd?'':skTag(s.id)}</span><b>${hd?'???':s.n}</b>${lk&&!hd?`<small>Level ${s.lv}</small>`:''}</button>`}).join('');
 const slots=sel.map((id,i)=>{const s=STK[id];return `${i?'<i class="ar">▸</i>':''}<button class="ss ${SKU.slot==i?'on':''}" data-ss="${i}"><span class="ski">${skTag(id)}</span><b>${s.k}</b><small>${s.n}</small></button>`}).join('');
 e.innerHTML=`<div class="skp"><div class="sk-top"><button class="cu-back" data-skact="back">‹</button><h2>SCORESTREAKS</h2><div class="sk-cats"><button data-skcat="-1" class="${SKU.cat<0?'on':''}">ALL</button>${SKC.map((n,i)=>`<button data-skcat="${i}" class="${SKU.cat==i?'on':''}" title="${n}">${i+1}</button>`).join('')}</div></div>
  <div class="sk-main"><div class="sk-grid">${tiles}</div><aside class="sk-info"><h3>${hid?'???':cur.n}</h3><p class="sk-d">${hid?'A hidden streak. Reach the level to reveal it.':cur.d}</p><p class="sk-m">${SKC[cur.c]} · ${cur.k} kills${lock?` · unlocks at level ${cur.lv}`:''}</p><div class="sk-big">${hid?'':skTag(cur.id)}</div>
   <button class="big sk-eq" data-skact="equip" ${lock?'disabled':''}>${sel.includes(cur.id)?'Selected in slot '+(sel.indexOf(cur.id)+1):'Equip to slot '+(SKU.slot+1)}</button></aside></div>
  <div class="sk-sel"><h4>SELECTED</h4><div class="sk-slots">${slots}</div><p class="sk-h">Pick a slot, then a streak. Streaks are earned in a row without dying: the kills number is how many kills each needs. Press 3, 4, 5 to use them in the order you earn them.</p></div></div>`}
document.addEventListener('click',e=>{const t=e.target;const op=t.closest('.ls[data-slot="ks"]');if(op){e.stopImmediatePropagation();skOpen();return}if(!t.closest('#p-ks'))return;
 const a=t.closest('[data-skact]');if(a){if(a.dataset.skact=='back')skBack();else if(a.dataset.skact=='equip'){const id=SKU.sel;if(!skOK(id))return;const sel=skSel(),j=sel.indexOf(id);if(j>=0&&j!=SKU.slot){const tmp=sel[SKU.slot];sel[SKU.slot]=id;sel[j]=tmp}else sel[SKU.slot]=id;try{ui()}catch(er){}skRender()}return}
 const c=t.closest('[data-skcat]');if(c){SKU.cat=+c.dataset.skcat;skRender();return}const s=t.closest('[data-sk]');if(s){SKU.sel=s.dataset.sk;skRender();return}const sl=t.closest('[data-ss]');if(sl){SKU.slot=+sl.dataset.ss;SKU.sel=skSel()[SKU.slot];skRender()}},true);

try{ldRender()}catch(e){}
