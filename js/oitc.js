/* ===================== oitc.js ===================== */
/* ---------- One in the Chamber: everyone spawns with a pistol holding a single bullet and three lives. Any hit kills (you and the bots), each kill earns one bullet back, melee kills as well,
   and with no bullets left you still have your melee. Run out of lives and you are out. Last one standing wins. In private matches the host's bots take part, the other players are
   tracked through an 'oi' message when someone runs out of lives. The bot count comes from the private match slider. ---------- */
const OI={on:0,lives:3};
const oiMode=()=>mode=='One in the Chamber';
{const _s=startGame;startGame=function(){if(!netOn)PBOTS=null;_s.apply(this,arguments);OI.on=oiMode()?1:0;if(!OI.on)return;OI.lives=3;OI.sent=0;
  /* one pistol, one bullet, a pocket of nothing else */
  wp=[{k:'CT',...eff('CT',[]),d:999}];wp[0].m=8;wp[0].mag=1;wp[0].res=0;wp[0].rs=0;cur=0;rel=0;gc=0;ST.tN=0;ST.plates=0;setGun();
  for(const b of bots){if(b.net)continue;b.mhp=b.hp=1;b.msh=b.sh=0;b.dc=0;setHeld(b,'CT')}msg('One in the Chamber · 3 lives',2.5)}}
function oiBullet(){const w=cw();if(!w)return;w.mag=Math.min(w.m,w.mag+1);beep(1200,.08,'triangle',.06);msg('+1 bullet · '+w.mag+' in the chamber',1.4)}
{const _fk=featKill;featKill=function(){_fk.apply(this,arguments);if(OI.on)oiBullet()}}
{const _h=hurt;hurt=function(d,b){if(OI.on&&d>0&&!P.dead){P.sh=0;P.hp=0;d=1e4}_h.call(this,d,b)}}
{const _sr=startRel;startRel=function(){if(OI.on)return;_sr.apply(this,arguments)}}
{const _d=die;die=function(){const was=P.dead;_d.apply(this,arguments);if(!OI.on||was)return;OI.lives--;if(OI.lives<=0){if(netOn&&!OI.sent){OI.sent=1;netSend({t:'oi',out:myId})}setTimeout(()=>endGame(netOn?'Eliminated':'Out of lives'),1400)}}}
{const _r=respawn;respawn=function(){_r.apply(this,arguments);if(OI.on&&wp[0]){wp[0].mag=1;wp[0].res=0;msg('Lives left: '+OI.lives,1.4)}}}
/* bots that used their three lives stay dead */
{const _sp=spawn;spawn=function(b){if(OI.on&&!b.net&&(b.dc||0)>=3){b.al=0;b.out=1;b.m.visible=false;b.rt=1e9;return}_sp.apply(this,arguments)}}
function oiTick(dt){const aiLeft=bots.filter(b=>!b.net&&!b.out).length,humans=bots.filter(b=>b.net&&!b.hb&&!b.out).length,left=aiLeft+humans;
 $('#ob').textContent=`Lives ${Math.max(0,OI.lives)} · Kills ${kills} · Opponents left ${left}`;
 if(P.dead&&OI.lives<=0)return;
 if(!netOn||isHost){if(left==0&&OI.lives>0)endGame('Victory');else if(netOn&&OI.lives<=0&&left<=1&&!over)endGame(left==1?(bots.find(b=>b.net&&!b.hb&&!b.out)||{nm:'A player'}).nm+' wins':'Defeat')}}

/* private match: the bot slider is shown for every mode except players-only free-for-all and zombies */
{const sl=$('#pbots'),pm=$('#pmode');if(sl){sl.oninput=()=>{$('#pbv').textContent=sl.value};const upd=()=>{const L_=$('#pbL');if(L_&&pm&&pm.value=='Private')L_.style.opacity=.45;else if(L_)L_.style.opacity=1};if(pm)pm.addEventListener('change',upd);upd()}}
