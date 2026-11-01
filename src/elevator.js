// 轎廂邏輯：每條電梯井一條候梯隊，多個轎廂各自 SCAN，由派車分配呼叫
import {TYPES,MAX_CARS,CAR_COST} from './config.js';
import {G} from './state.js';
import {nextLeg} from './agents.js';

const newCar=(cfg,pos)=>({cfg,pos,dir:0,riders:[],stop:0,moving:false,next:pos,calls:new Set(),prev:new Set(),park:null});
export function makeShaft(u){const d=TYPES[u.type];G.cars.set(u.id,{u,q:new Map(),stops:[],cap:d.cap,spd:d.spd,cars:u.cars.map(c=>newCar(c,c.home))});}
export function stopsOf(type,f0,h){const d=TYPES[type],a=[];for(let f=f0;f<f0+h;f++)if(!d.express||f===0||G.skyFloors.has(f))a.push(f);return a;}
// 樓層圖變咗之後更新停站；停唔到嘅站上嘅人當走咗
export function syncStops(s){
  s.stops=stopsOf(s.u.type,s.u.f,s.u.h);
  for(const[g,q]of s.q)if(!s.stops.includes(g))for(const a of q)a.dead=true;
  for(const c of s.cars)for(const a of c.riders)if(!s.stops.includes(a.to))a.dead=true;
}
export function addCar(u){
  const s=G.cars.get(u.id);if(!s)return '搵唔到呢部電梯';
  if(s.cars.length>=MAX_CARS)return `每部電梯最多 ${MAX_CARS} 個轎廂`;
  if(G.S.money<CAR_COST)return '資金不足';
  G.S.money-=CAR_COST;
  const cfg={home:s.stops[Math.floor(s.stops.length*s.cars.length/MAX_CARS)]??s.u.f,rush:true};
  u.cars.push(cfg);s.cars.push(newCar(cfg,cfg.home));return null;
}
// 平日返工 7:30–9:30、放工 16:40–19:00
export function peak(){const t=G.S.t;if(Math.floor(t/1440)%3===2)return null;const m=t%1440;return m>=450&&m<570?'am':m>=1000&&m<1140?'pm':null;}
function nearestStop(s,f){let b=f,bd=1e9;for(const g of s.stops){const d=Math.abs(g-f);if(d<bd){bd=d;b=g;}}return b;}
function parkFloor(s,c,pk){
  if(c.cfg.rush&&pk)return pk==='am'?nearestStop(s,0):s.stops[s.stops.length-1];
  return nearestStop(s,c.cfg.home);
}
function nextStop(s,f,dir){
  if(dir>0){for(const g of s.stops)if(g>f)return g;}
  else for(let i=s.stops.length-1;i>=0;i--)if(s.stops[i]<f)return s.stops[i];
  return null;
}
function hasAhead(c,dir,f){
  for(const a of c.riders)if((a.to-f)*dir>0)return true;
  for(const g of c.calls)if((g-f)*dir>0)return true;
  return c.park!=null&&(c.park-f)*dir>0;
}
function nearestDir(c,f){
  let best=0,bd=1e9;
  for(const a of c.riders){const d=Math.abs(a.to-f);if(d>0&&d<bd){bd=d;best=Math.sign(a.to-f);}}
  for(const g of c.calls)if(g!==f){const d=Math.abs(g-f);if(d<bd){bd=d;best=Math.sign(g-f);}}
  return best;
}
function callCost(s,c,g,d,pk){
  let k=Math.abs(c.pos-g)+c.riders.length/s.cap*20;
  if(c.prev.has(g))k-=20; // 跟返上一步嘅派車，唔好轉嚟轉去
  if(c.riders.length&&c.dir){if((g-c.pos)*c.dir<0)k+=30;else if(c.dir!==d)k+=15;} // 空轎廂邊個方向都接得
  if(c.cfg.rush&&pk)k+=d===(pk==='am'?1:-1)?-40:40;
  return k;
}
// 每層每個方向派最就手嘅轎廂，人多過一架就派多架，唔會成班轎廂追同一個呼叫；
// 等得耐嘅呼叫唔理繁忙策略，免得逆方向嘅人一直冇車
function dispatch(s,pk){
  for(const c of s.cars){const t=c.prev;c.prev=c.calls;c.calls=t;t.clear();}
  for(const[g,q]of s.q){
    if(!q.length)continue;
    let up=0,oldUp=0,oldDn=0;for(const a of q)if(a.dir>0){up++;oldUp=Math.max(oldUp,a.wait);}else oldDn=Math.max(oldDn,a.wait);
    for(const[d,n,old]of[[1,up,oldUp],[-1,q.length-up,oldDn]]){
      if(!n)continue;
      let left=n;const p=old>6?null:pk;
      for(const c of [...s.cars].sort((a,b)=>callCost(s,a,g,d,p)-callCost(s,b,g,d,p))){c.calls.add(g);left-=s.cap-c.riders.length;if(left<=0)break;}
    }
  }
}
function stepCar(s,c,dt,pk){
  for(let i=c.riders.length-1;i>=0;i--)if(c.riders[i].dead)c.riders.splice(i,1);
  if(c.stop>0){c.stop-=dt;return;}
  if(c.moving){
    let b=s.spd*dt;
    for(;;){
      const d=Math.abs(c.next-c.pos);
      if(d>b){c.pos+=Math.sign(c.next-c.pos)*b;return;}
      b-=d;c.pos=c.next;
      const f=c.next,q=s.q.get(f)||[];
      const skip=c.cfg.rush&&pk&&c.dir!==(pk==='am'?1:-1)&&!c.calls.has(f); // 繁忙時回程唔兜路
      const stop=c.riders.some(a=>a.to===f)||(!skip&&c.riders.length<s.cap&&q.some(a=>a.dir===c.dir))||!hasAhead(c,c.dir,f);
      const n=stop?null:nextStop(s,f,c.dir);
      if(n==null){c.moving=false;break;}
      c.next=n;
    }
  }
  const f=Math.round(c.pos);c.pos=f;let act=false;
  if(c.calls.size||c.riders.length)c.park=null;
  for(let i=c.riders.length-1;i>=0;i--){const a=c.riders[i];if(a.to===f){c.riders.splice(i,1);a.f=f;a.x=s.u.x+s.u.w/2;a.state='walk';a.li++;nextLeg(a);act=true;}}
  const q=s.q.get(f)||[];
  if(c.dir===0||!hasAhead(c,c.dir,f)){
    if(q.some(a=>a.dir===c.dir)&&c.dir!==0){}
    else if(q.length&&!c.riders.length)c.dir=q[0].dir;
    else c.dir=nearestDir(c,f);
  }
  if(c.dir!==0)for(let i=0;i<q.length&&c.riders.length<s.cap;){const a=q[i];if(a.dir===c.dir){q.splice(i,1);a.state='ride';c.riders.push(a);act=true;}else i++;}
  if(act){c.stop=.45;return;}
  if(c.dir!==0&&!hasAhead(c,c.dir,f))c.dir=nearestDir(c,f);
  if(c.dir===0){const h=parkFloor(s,c,pk);if(h!==f){c.park=h;c.dir=Math.sign(h-f);}}
  if(c.dir!==0){const n=nextStop(s,f,c.dir);if(n==null)c.dir=0;else{c.moving=true;c.next=n;}}
}
export function stepShaft(s,dt){
  for(const q of s.q.values())for(let i=q.length-1;i>=0;i--)if(q[i].dead)q.splice(i,1);
  const pk=peak();
  dispatch(s,pk);
  for(const c of s.cars)stepCar(s,c,dt,pk);
}
