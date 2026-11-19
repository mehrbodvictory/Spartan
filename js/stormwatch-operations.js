/* Original Stormwatch operations and Citadel reward rules. */
var StormwatchOperations = (() => {
 const DAY=86400000, WEEK=7*DAY;
 const missions={
  defense:{name:'ATLAS Defense',brief:'Fortify the relay and keep it online through five waves.'},
  seal:{name:'Seal the Breach',brief:'Fuel the Rift Anchor with three Flux Crystals, then hold it for four minutes.'},
  nests:{name:'Clear the Nests',brief:'Track down five Hollow nests, defeat their guardians, and shatter their cores before the storm closes.'},
  payload:{name:'Secure the Payload',brief:'Fortify the landing zone, then defend the recovery pod while the safe zone contracts.'}
 };
 const modifiers=[
  {id:'quick',name:'Quickened Rift',description:'Hollows advance 22% faster. The Citadel pays extra salvage.',bonus:{gears:6,cells:2}},
  {id:'tough',name:'Hardened Brood',description:'Hollows arrive with 28% more health. The Citadel pays extra salvage.',bonus:{parts:10,quartz:4}},
  {id:'surge',name:'Pressure Front',description:'Hollow attacks deal 22% more damage. The Citadel pays extra salvage.',bonus:{powder:10,charge:4}}
 ];
 const daily=[
  {id:'salvage',name:'Salvage Crew',description:'Break 8 resource objects during operations.',metric:'breaks',goal:8,reward:{parts:5,quartz:2}},
  {id:'defender',name:'Rift Sweep',description:'Defeat 20 Hollows during operations.',metric:'kills',goal:20,reward:{powder:7,cells:2}},
  {id:'build',name:'Field Engineer',description:'Place 10 structures or mounted traps.',metric:'builds',goal:10,reward:{planks:8,gears:4}},
  {id:'scout',name:'Supply Sweep',description:'Recover 5 crates or supply caches.',metric:'caches',goal:5,reward:{parts:6,charge:3}},
  {id:'striker',name:'Mission Ready',description:'Complete one operation.',metric:'wins',goal:1,reward:{cells:3,quartz:4}}
 ];
 const weekly={id:'survey',name:'Frontline Survey',description:'Win three different operation types this week.',goal:3,reward:{parts:14,quartz:12,cells:5}};
 const metrics=['breaks','kills','builds','caches','wins'];
 const statline=()=>Object.fromEntries(metrics.map(metric=>[metric,0]));
 const archiveGoals=[
  {goal:6,reward:{planks:10,parts:5}},
  {goal:15,reward:{gears:8,quartz:5}},
  {goal:24,reward:{parts:14,cells:5}},
  {goal:34,reward:{quartz:15,cells:8}}
 ];
 const hollowIds=['husk','runner','spitter','brute','boss','mortar','demolisher','beam','phantasm','catapult','juggernaut'];
 function windows(time){
  const stamp=Math.floor(time/DAY);
  return {day:stamp,week:Math.floor((stamp+3)/7)};
 }
 const choose=(list,index)=>list[(index%list.length+list.length)%list.length];
 function dailyAlert(day){
  const [mission]=choose(Object.entries(missions),day);
  return {...choose(modifiers,day+Math.floor(day/4)),mission};
 }
 function blankOrders(now){
  const {day,week}=windows(now);
  return {day,week,stats:statline(),dailyClaimed:false,weeklyClaimed:false,alertClaimed:false,wins:[],receipts:[]};
 }
 function roll(saved,now){
  const next=blankOrders(now);
  if(!saved)return next;
  if(saved.day===next.day){
   next.stats={...next.stats,...saved.stats};
   next.dailyClaimed=!!saved.dailyClaimed;next.alertClaimed=!!saved.alertClaimed;next.receipts=[...(saved.receipts||[])];
  }
  if(saved.week===next.week){next.wins=[...(saved.wins||[])];next.weeklyClaimed=!!saved.weeklyClaimed}
  return next;
 }
 function accrue(orders,action){
  const {day,week}=windows(action.started);
  if(day!==orders.day||orders.receipts.includes(action.id))return;
  orders.receipts.push(action.id);
  for(const key of metrics){
   const gain=action.delta[key];
   if(Number.isInteger(gain)&&gain>0)orders.stats[key]=Math.min(99999,orders.stats[key]+gain);
  }
  if(action.delta.wins>0&&week===orders.week&&!orders.wins.includes(action.mission))orders.wins.push(action.mission);
 }
 function board(profile,now){
  const orders=roll(profile.orders,now),contract=choose(daily,orders.day),alert=dailyAlert(orders.day);
  const count=Object.keys(profile.blueprints||{}).filter(key=>!key.startsWith('trap/')).length+
   Object.keys(profile.archive?.hollows||{}).length+Object.keys(profile.archive?.operations||{}).length+
   Object.keys(profile.archive?.traps||{}).length;
  return {orders,alert,contract,weekly,count,archiveGoals};
 }
 return {missions,windows,statline,dailyAlert,roll,accrue,board,archiveGoals,hollowIds};
})();
