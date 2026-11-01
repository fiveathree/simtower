// 樓層圖、Dijkstra 路線、快取
import {W,NF,MINF,fi} from './config.js';
import {G} from './state.js';

export function dirty(){
  G.byId=new Map(G.S.units.map(u=>[u.id,u]));
  G.lobbyCells=[];for(let x=0;x<W;x++)if(G.S.slab[fi(0)][x]===2)G.lobbyCells.push(x);
  G.hasSlab=G.S.slab.map(r=>r.some(v=>v));
  G.adj=Array.from({length:NF},()=>[]);
  for(const u of G.S.units){
    if(u.type==='elevator'){const a0=u.f,a1=u.f+u.h-1;for(let a=a0;a<=a1;a++)for(let b=a0;b<=a1;b++)if(a!==b)G.adj[fi(a)].push({b,c:3+Math.abs(a-b)*.25,t:'elev'});}
    else if(u.type==='stairs'){G.adj[fi(u.f)].push({b:u.f+1,c:2.2,t:'stairs'});G.adj[fi(u.f+1)].push({b:u.f,c:2.2,t:'stairs'});}
  }
  G.rcache=new Map();
}
export function route(f1,f2){
  if(f1===f2)return[];
  const k=f1*1000+f2;if(G.rcache.has(k))return G.rcache.get(k);
  const dist=new Array(NF).fill(Infinity),prev=new Array(NF).fill(null),done=new Array(NF).fill(false);
  dist[fi(f1)]=0;
  for(;;){
    let bi=-1,bd=Infinity;for(let i=0;i<NF;i++)if(!done[i]&&dist[i]<bd){bd=dist[i];bi=i;}
    if(bi<0||bi===fi(f2))break;done[bi]=true;
    for(const e of G.adj[bi]){const j=fi(e.b),nd=bd+e.c;if(nd<dist[j]){dist[j]=nd;prev[j]={from:bi+MINF,t:e.t,to:e.b};}}
  }
  let res=null;
  if(dist[fi(f2)]<Infinity){res=[];let cur=f2;while(cur!==f1){const p=prev[fi(cur)];res.unshift({t:p.t,to:p.to});cur=p.from;}}
  G.rcache.set(k,res);return res;
}
export const reach=u=>G.lobbyCells.length>0&&route(0,u.f)!==null;
export function nearestElev(f,to,x){let b=null,bd=1e9;for(const u of G.S.units)if(u.type==='elevator'&&u.f<=Math.min(f,to)&&u.f+u.h-1>=Math.max(f,to)){const d=Math.abs(u.x+2-x);if(d<bd){bd=d;b=u;}}return b;}
export function nearestStairs(f,to,x){const lo=Math.min(f,to);let b=null,bd=1e9;for(const u of G.S.units)if(u.type==='stairs'&&u.f===lo){const d=Math.abs(u.x+3-x);if(d<bd){bd=d;b=u;}}return b;}
export const lobbyX=()=>G.lobbyCells.length?G.lobbyCells[Math.floor(Math.random()*G.lobbyCells.length)]+Math.random():null;
