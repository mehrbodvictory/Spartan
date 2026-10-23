/* ===================== haptics.js ===================== */
/* ---------- controller vibration, on a gamepad (dual rumble) and in VR (the controller that holds the weapon pulses when you fire, both pulse when you are hurt).
   Triggers: every shot (strength follows the weapon's kick), taking damage, explosions near you (by distance), melee swings, reloads, grenades, kills, death, armor plates,
   field upgrade, landing hard. Settings: Controller vibration On / Off. ---------- */
const HAP={on:1,last:0};try{HAP.on=localStorage.getItem('sdrill-vib')=='0'?0:1}catch(e){}
function hapPad(){try{const l=navigator.getGamepads?navigator.getGamepads():[];for(const p of l)if(p&&p.connected&&(p.vibrationActuator||(p.hapticActuators&&p.hapticActuators.length)))return p}catch(e){}return null}
function haptic(strong,ms,weak,hand){if(!HAP.on)return;strong=Math.max(0,Math.min(1,strong));weak=weak==null?strong*.65:Math.max(0,Math.min(1,weak));
 try{if(typeof xrS!='undefined'&&xrS){const hs=hand=='left'?['left']:hand=='both'?['left','right']:['right'];for(const h of hs){const c=typeof vrHand=='function'?vrHand(h):null,gp=c&&c.userData.gp;if(!gp)continue;const ha=gp.hapticActuators&&gp.hapticActuators[0];
    if(ha&&ha.pulse)ha.pulse(strong,ms);else if(gp.vibrationActuator&&gp.vibrationActuator.playEffect)gp.vibrationActuator.playEffect('dual-rumble',{startDelay:0,duration:ms,strongMagnitude:strong,weakMagnitude:weak})}return}
  const p=hapPad();if(!p)return;const va=p.vibrationActuator;if(va&&va.playEffect)va.playEffect('dual-rumble',{startDelay:0,duration:ms,strongMagnitude:strong,weakMagnitude:weak});else if(p.hapticActuators&&p.hapticActuators[0]&&p.hapticActuators[0].pulse)p.hapticActuators[0].pulse(strong,ms)}catch(e){}}
/* hooks */
{const _gs=gunSnd;gunSnd=function(w){_gs.apply(this,arguments);const n=performance.now();if(n-HAP.last<25)return;HAP.last=n;const rc=w&&w.rc||1,heavy=w&&(w.k=='RL'||w.k=='SN'||w.k=='SG'||w.k=='CY');haptic(Math.min(1,.18+rc*.3+(heavy?.35:0)),heavy?110:48,Math.min(1,.12+rc*.2),'right')}}
{const _h=hurt;hurt=function(d,b){const was=P.dead;_h.apply(this,arguments);if(!was)haptic(Math.min(1,.35+(d||0)/70),130,.8,'both')}}
{const _b=boom;boom=function(p,g){_b.apply(this,arguments);if(g&&g.tac)return;const D=p.distanceTo(C.position),v=1/(1+D*.14);if(v>.12)haptic(Math.min(1,v*1.3),Math.round(160+v*260),v,'both')}}
{const _m=melee;melee=function(){const t=mn;_m.apply(this,arguments);if(mn!=t)haptic(.55,90,.7,'right')}}
{const _rb=rifleBash;rifleBash=function(){const t=mn;_rb.apply(this,arguments);if(mn!=t)haptic(.35,70,.4,'right')}}
{const _sr=startRel;startRel=function(){_sr.apply(this,arguments);haptic(.14,60,.2,'right');setTimeout(()=>haptic(.22,45,.3,'right'),700)}}
{const _tg=throwG;throwG=function(){const g=gc;_tg.apply(this,arguments);if(gc!=g)haptic(.3,80,.4,'right')}}
{const _d=die;die=function(){const was=P.dead;_d.apply(this,arguments);if(!was)haptic(1,420,1,'both')}}
{const _fk=featKill;featKill=function(){_fk.apply(this,arguments);haptic(.3,55,.55,'right')}}
{const _pl=actPlate;actPlate=function(){const n=ST.plates;_pl.apply(this,arguments);if(ST.plates!=n)haptic(.25,100,.4,'both')}}
{const _fu=actField;actField=function(){const n=ST.fieldCd;_fu.apply(this,arguments);if(ST.fieldCd>n)haptic(.5,220,.5,'both')}}
/* settings control */
{const l=document.createElement('label');l.innerHTML='Controller vibration<select id="vib"><option value="1">On</option><option value="0">Off</option></select>';const s=document.querySelector('#p-set');if(s){const g=document.querySelector('#gq');g&&g.parentElement?g.parentElement.after(l):s.appendChild(l);const v=l.querySelector('select');v.value=HAP.on?'1':'0';v.onchange=()=>{HAP.on=+v.value;try{localStorage.setItem('sdrill-vib',v.value)}catch(e){}if(HAP.on)haptic(.6,120,.6,'both')}}}
