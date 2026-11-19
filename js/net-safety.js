/* Transport-independent limits for decoded peer messages. A burst allowance
   leaves room for a reconnect snapshot or a large destruction update. */
function peerPackets(link,field,receive,reject){
 const capacity=280,refill=170,byteCapacity=512*1024,byteRefill=256*1024;
 let tokens=capacity,bytes=byteCapacity,last=performance.now(),strikes=0,lastStrike=last,closed=false;
 link.on('data',data=>{
  if(closed)return;
  const now=performance.now(),seconds=(now-last)/1000;
  last=now;tokens=Math.min(capacity,tokens+seconds*refill);
  bytes=Math.min(byteCapacity,bytes+seconds*byteRefill);
  const size=tokens>=1?peerPacketSize(data,field):0;
  if(size&&size<=bytes){tokens--;bytes-=size;receive(data);return}
  if(now-lastStrike>5000)strikes=0;
  lastStrike=now;
  if(++strikes>=24){closed=true;reject()}
 });
}

function peerPacketSize(data,field){
 if(!data||Object.getPrototypeOf(data)!==Object.prototype||
    !Object.prototype.hasOwnProperty.call(data,field)||
    typeof data[field]!=='string'||!data[field]||data[field].length>36)return 0;
 const limit=160*1024;
 let size=0;
 function visit(value,depth){
  if(depth>10)return false;
  if(value==null||typeof value==='boolean')size+=5;
  else if(typeof value==='number'){if(!Number.isFinite(value))return false;size+=12}
  else if(typeof value==='string')size+=value.length*3+3;
  else if(Array.isArray(value)){
   if(value.length>12000)return false;
   size+=2+value.length;
   for(const item of value)if(!visit(item,depth+1))return false;
  }else if(value&&Object.getPrototypeOf(value)===Object.prototype){
   const keys=Object.keys(value);
   if(keys.length>128)return false;
   for(const key of keys){
    if(key==='__proto__'||key==='constructor'||key==='prototype')return false;
    size+=key.length*3+4;
    if(size>limit||!visit(value[key],depth+1))return false;
   }
  }else return false;
  return size<=limit;
 }
 return visit(data,0)?size:0;
}
