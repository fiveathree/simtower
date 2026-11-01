// 樓層圖、Dijkstra 路線、快取
import {TYPES,W,NF,MINF,WALK,SKY_FLOORS,fi} from './config.js';
import {G} from './state.js';
import {syncStops} from './elevator.js';

export function dirty(){
  G.byId=new Map(G.S.units.map(u=>[u.id,u]));
  G.lobbyCells=[];for(let x=0;x<W;x++)if(G.S.slab[fi(0)][x]===2)G.lobbyCells.push(x);
  G.hasSlab=G.S.slab.map(r=>r.some(v=>v));
  G.skyFloors=new Set(SKY_FLOORS.filter(f=>G.S.slab[fi(f)].includes(2)));
  for(const s of G.cars.values())syncStops(s);
  G.adj=Array.from({length:NF},()=>[]);
  for(const u of G.S.units){
    const d=TYPES[u.type];
    if(d.lift){const st=G.cars.get(u.id).stops,per=d.express?.1:.25;for(const a of st)for(const b of st)if(a!==b)G.adj[fi(a)].push({b,c:3+Math.abs(a-b)*per,t:'elev',id:u.id,svc:!!d.service});}
    else if(u.type==='stairs'){G.adj[fi(u.f)].push({b:u.f+1,c:2.2,t:'stairs'});G.adj[fi(u.f+1)].push({b:u.f,c:2.2,t:'stairs'});}
  }
  G.rcache=new Map();
  G.rampDepth=0;const ramps=new Set(G.S.units.filter(u=>u.type==='ramp').map(u=>u.f));while(ramps.has(-G.rampDepth-1))G.rampDepth++;
  for(const u of G.S.units){
    if(u.type==='parking')u.on=-u.f<=G.rampDepth;
    if(TYPES[u.type].quiet){const o=G.occ[fi(u.f)],l=G.byId.get(o[u.x-1]),r=G.byId.get(o[u.x+u.w]);u.noisy=!!((l&&TYPES[l.type].noisy)||(r&&TYPES[r.type].noisy));}
  }
}
// 候梯人多嘅電梯計貴啲，等人分散去其他電梯或者轉梯
function congestion(id,f){const s=G.cars.get(id),q=s.q.get(f);return q?q.length/(s.cap*s.cars.length)*6:0;}
export function route(f1,f2,svc){
  if(f1===f2)return[];
  const k=(f1+100)*1000+f2+100+(svc?1e6:0);if(G.rcache.has(k))return G.rcache.get(k);
  const dist=new Array(NF).fill(Infinity),prev=new Array(NF).fill(null),done=new Array(NF).fill(false);
  dist[fi(f1)]=0;
  for(;;){
    let bi=-1,bd=Infinity;for(let i=0;i<NF;i++)if(!done[i]&&dist[i]<bd){bd=dist[i];bi=i;}
    if(bi<0||bi===fi(f2))break;done[bi]=true;
    for(const e of G.adj[bi]){
      if(e.svc&&!svc)continue;
      const j=fi(e.b),nd=bd+(e.svc?e.c*.5:e.c)+(e.t==='elev'?congestion(e.id,bi+MINF):0);
      if(nd<dist[j]){dist[j]=nd;prev[j]={from:bi+MINF,t:e.t,to:e.b,id:e.id};}
    }
  }
  let res=null;
  if(dist[fi(f2)]<Infinity){res=[];let cur=f2;while(cur!==f1){const p=prev[fi(cur)];res.unshift({t:p.t,to:p.to,id:p.id});cur=p.from;}}
  G.rcache.set(k,res);return res;
}
export const reach=u=>G.lobbyCells.length>0&&route(0,u.f)!==null;
// 同類電梯入面揀行路近、人少嗰部
export function pickLift(f,to,x,id){
  const t=G.byId.get(id);if(!t)return null;
  let b=null,bd=1e9;
  for(const s of G.cars.values()){
    const u=s.u;if(u.type!==t.type||!s.stops.includes(f)||!s.stops.includes(to))continue;
    const q=s.q.get(f),d=Math.abs(u.x+u.w/2-x)/WALK+(q?q.length:0)/(s.cap*s.cars.length)*6;
    if(d<bd){bd=d;b=u;}
  }
  return b;
}
export function nearestStairs(f,to,x){const lo=Math.min(f,to);let b=null,bd=1e9;for(const u of G.S.units)if(u.type==='stairs'&&u.f===lo){const d=Math.abs(u.x+3-x);if(d<bd){bd=d;b=u;}}return b;}
export const lobbyX=()=>G.lobbyCells.length?G.lobbyCells[Math.floor(Math.random()*G.lobbyCells.length)]+Math.random():null;
