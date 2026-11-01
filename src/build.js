// 放置規則、承托、拆卸、費用
import {TYPES,MINF,MAXF,W,SKY_FLOORS,fi,fmt,fname} from './config.js';
import {G,floatTxt,hooks} from './state.js';
import {dirty} from './route.js';
import {makeShaft,stopsOf} from './elevator.js';

export function mark(u,val){for(let f=u.f;f<u.f+u.h;f++){const o=G.occ[fi(f)],s=G.S.slab[fi(f)];for(let x=u.x;x<u.x+u.w;x++){o[x]=val;if(val&&!s[x])s[x]=1;}}}
export function costOf(type,h){const d=TYPES[type];return d.lift?d.cost+d.per*h:d.cost;}
export function checkPlace(type,f,x,h){
  const d=TYPES[type];h=h||d.h||1;
  if(d.star>G.S.stars)return `要 ${d.star}★ 先解鎖`;
  if(x<0||x+d.w>W)return '超出地盤範圍';
  if(f<MINF||f+h-1>MAXF)return '超出可建高度';
  if(d.minF&&f<d.minF)return '只可以起喺 30F 或以上';
  if(d.express&&stopsOf(type,f,h).length<2)return '要經過至少兩個大堂或者空中大堂';
  const transport=d.lift||type==='stairs';
  for(let ff=f;ff<f+h;ff++)for(let xx=x;xx<x+d.w;xx++){
    if(G.occ[fi(ff)][xx])return '位置已被佔用';
    if(!transport&&G.S.slab[fi(ff)][xx]===2)return '大堂位置只可以放電梯或樓梯';
  }
  if(f!==0){const sf=f>0?f-1:f+1;for(let xx=x;xx<x+d.w;xx++)if(!G.S.slab[fi(sf)][xx])return f>0?'下面要有樓面承托':'上面要有樓面先可以挖地庫';}
  if(G.S.money<costOf(type,h))return '資金不足';
  return null;
}
export function place(type,f,x,h,free){
  const err=checkPlace(type,f,x,h);if(err&&!(free&&err==='資金不足'))return err;
  const d=TYPES[type];h=h||d.h||1;
  if(!free)G.S.money-=costOf(type,h);
  const u={id:G.S.nextId++,type,f,x,w:d.w,h,occ:!!d.lift||['food','security','cathedral','stairs'].includes(type),sat:70,present:0};
  if(d.lift)u.cars=[{home:f,rush:true}];
  G.S.units.push(u);mark(u,u.id);if(d.lift)makeShaft(u);dirty();
  if(!free)floatTxt(x+d.w/2,f+h,'−'+fmt(costOf(type,h)).slice(1),'#ff8a7a');
  return null;
}
export function paint(type,f,x,free){
  if(x<0||x>=W||f<MINF||f>MAXF)return '超出地盤範圍';
  const s=G.S.slab[fi(f)];
  if(type==='lobby'||type==='skylobby'){
    const sky=type==='skylobby';
    if(sky?!SKY_FLOORS.includes(f):f!==0)return sky?'空中大堂只可以起喺 16F、31F、46F':'大堂只可以起喺 1F';
    if(s[x]===2)return 'skip';if(G.occ[fi(f)][x])return '位置已被佔用';
    if(sky&&!s[x]&&!G.S.slab[fi(f-1)][x])return '下面要有樓面承托';
    if(!free){if(G.S.money<1000)return '資金不足';G.S.money-=1000;}
    s[x]=2;return null;
  }
  if(s[x])return 'skip';
  if(f!==0){const sf=f>0?f-1:f+1;if(!G.S.slab[fi(sf)][x])return f>0?'下面要有樓面承托':'上面要有樓面先可以挖地庫';}
  if(!free){if(G.S.money<500)return '資金不足';G.S.money-=500;}
  s[x]=1;return null;
}
export function removeUnit(u){
  mark(u,0);
  // keep slabs so floors above stay supported
  for(let f=u.f;f<u.f+u.h;f++)for(let x=u.x;x<u.x+u.w;x++)G.S.slab[fi(f)][x]=Math.max(1,G.S.slab[fi(f)][x]);
  G.S.units=G.S.units.filter(v=>v!==u);
  if(TYPES[u.type].lift){const s=G.cars.get(u.id);if(s){for(const c of s.cars)for(const a of c.riders)a.dead=true;for(const q of s.q.values())for(const a of q)a.dead=true;}G.cars.delete(u.id);}
  for(const a of G.agents)if(a.elev===u||a.st===u)a.dead=true;
  if(G.sel===u.id)hooks.closeInfo();
  dirty();
}
export function bulldozeAt(f,x){
  if(f<MINF||f>MAXF||x<0||x>=W)return;
  const id=G.occ[fi(f)][x];
  if(id){const u=G.byId.get(id);removeUnit(u);hooks.log(`拆咗 ${fname(u.f)} ${TYPES[u.type].name}`);return;}
  const s=G.S.slab[fi(f)];if(!s[x])return;
  if(s[x]===2&&f>0){s[x]=1;dirty();return;} // 空中大堂拆返做普通樓面
  const dep=f>=0?f+1:f-1;
  if(dep>=MINF&&dep<=MAXF&&G.S.slab[fi(dep)][x]){hooks.log('上面仲有嘢承托緊，唔可以拆','bad');return;}
  s[x]=0;dirty();
}
