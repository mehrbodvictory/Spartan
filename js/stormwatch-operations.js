/* Original Stormwatch operations and Citadel reward rules. */
var StormwatchOperations = (() => {
 const DAY=86400000, WEEK=7*DAY;
 const missions={
  defense:{name:'Relay Defense',brief:'Recover two power cells, fortify the marked approaches, and launch five assaults from the relay.'},
  seal:{name:'Seal the Breach',brief:'Recover three Flux Crystals, fortify the Rift Anchor, and activate it to begin a four-minute siege.'},
  nests:{name:'Clear the Nests',brief:'Track down five Hollow nests, defeat their guardians, and shatter their cores before the storm closes.'},
  payload:{name:'Secure the Payload',brief:'Fortify the landing zone, then defend the recovery pod while the safe zone contracts.'}
 };
 const rewards={
  defense:{planks:18,gears:8,cells:3},
  seal:{quartz:12,charge:8,cells:3},
  nests:{powder:16,parts:10,charge:4},
  payload:{parts:16,gears:10,cells:4}
 };
 const sectors=['timbervale','ironridge','canyonlands','obsidian'];
 const campaign=[
  {region:'timbervale',mission:'defense',title:'A Light on the Ridge',brief:'Bring Timbervale’s relay back online so stranded survey crews can call for help.',reward:{planks:14,parts:10,powder:6}},
  {region:'timbervale',mission:'payload',title:'The Last Transmission',brief:'Recover the relay’s transmissions from a courier pod before the storm swallows the landing site.',reward:{gears:12,parts:15}},
  {region:'timbervale',mission:'seal',title:'Beyond the Static',brief:'Seal the breach interfering with the relay. The recovered signal opens a path to Ironridge.',reward:{quartz:10,cells:6}},
  {region:'ironridge',mission:'nests',title:'The Foundry Below',brief:'Clear the nests choking the roads around the old foundry.',reward:{powder:20,parts:12}},
  {region:'ironridge',mission:'defense',title:'Hold the Pass',brief:'Raise a second relay under heavier fire to reopen the supply route.',reward:{planks:24,gears:16}},
  {region:'ironridge',mission:'payload',title:'Drawn in Copper',brief:'Extract the foundry’s route survey. Its beacon points to a safe approach to Canyonlands.',reward:{parts:20,cells:8}},
  {region:'canyonlands',mission:'seal',title:'The Hollow Current',brief:'Close the breach feeding the storm through the canyon.',reward:{quartz:18,charge:14}},
  {region:'canyonlands',mission:'nests',title:'Cut the Tethers',brief:'Break the nests drawing energy from the canyon floor before the storm closes in.',reward:{powder:26,gears:18}},
  {region:'canyonlands',mission:'defense',title:'The Long Reach',brief:'Keep the ridge relay alive long enough to chart a route into Obsidian Peaks.',reward:{parts:25,cells:12}},
  {region:'obsidian',mission:'payload',title:'Cold Signal',brief:'Recover the survey team’s final report from a frostbound drop zone.',reward:{parts:30,gears:20}},
  {region:'obsidian',mission:'seal',title:'Where the Storm Begins',brief:'Follow the signal to the high breach and hold the Anchor through the full siege.',reward:{quartz:25,charge:18}},
  {region:'obsidian',mission:'defense',title:'The Northern Line',brief:'Defend the Frostline Relay against Stormbreaker and finish the northern warning network.',reward:{parts:36,cells:18}}
 ].map((chapter,index)=>({...chapter,index,key:chapter.region+'/'+chapter.mission,marks:index%3===2?3:1}));
 function campaignProgress(profile){
  const claimed=profile.campaign?.claimed||{},wins=profile.campaign?.wins||{};
  const active=campaign.find(chapter=>!claimed[chapter.key]);
  const unlocked=sectors.filter((_,index)=>index===0||claimed[campaign[index*3-1].key]);
  return {active,claimed,wins,unlocked,chapters:campaign};
 }
 function fieldMarks(region){
  return sectors.indexOf(region)+1;
 }
 function payout(mission,region){
  if(!Object.hasOwn(rewards,mission)||!sectors.includes(region))return {};
  const rate=1+sectors.indexOf(region)*.35;
  return Object.fromEntries(Object.entries(rewards[mission]).map(([item,count])=>[item,Math.round(count*rate)]));
 }
 function assaultFronts(seed,lanes){
  const compass=[0,2,3,1];
  const shift=(seed>>>0)%compass.length,sign=seed&4?-1:1;
  return lanes.map(lane=>compass[(shift+sign*compass.indexOf(lane)+compass.length)%compass.length]);
 }
 function assaultGroups(wave,fronts,players){
  const groups=[];
  for(let start=0;start<wave.units.length;start+=3){
   const units=wave.units.slice(start,start+3);
   for(let seat=1;seat<players;seat++)units.push(seat===2?'husk':'runner');
   groups.push({lane:fronts[groups.length%fronts.length],units});
  }
  return groups;
 }
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
 return {missions,windows,statline,dailyAlert,roll,accrue,board,archiveGoals,hollowIds,payout,assaultFronts,assaultGroups,campaignProgress,fieldMarks};
})();
