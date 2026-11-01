// 收入、支出、季度結算、升星
import {TYPES,reqOf,SITE,FILMS,REP_MAX,TOWER_STAR,AD_PER_FLOOR,rentOf,fmt} from './config.js';
import {G,earn,floatTxt,hooks,save} from './state.js';
import {reach} from './route.js';

export function tenants(){let p=0;for(const u of G.S.units)if(u.occ&&TYPES[u.type].pop)p+=TYPES[u.type].pop;return p;}
// 人口 = 租戶 + 近 3 日平均每日訪客（原作都計商業人流；單靠租戶呢個地盤到唔到 10,000）
export const pop=()=>tenants()+G.S.visitors;
export const setRent=(u,i)=>{u.rentLv=i;};
export function rollVisitors(){const L=G.S.vLog;L.push(G.S.vToday);if(L.length>3)L.shift();G.S.vToday=0;G.S.visitors=Math.round(L.reduce((a,b)=>a+b,0)/L.length);
  // 名氣跟住客滿意度慢慢累積，訪客量隨名氣增長
  let sum=0,n=0;for(const u of G.S.units)if(u.occ&&TYPES[u.type].pop){sum+=u.sat;n++;}
  G.S.rep=Math.min(REP_MAX,G.S.rep+(n?Math.min(1,sum/n/60):0));}
export function setFilm(u,i){
  const f=FILMS[i];if(G.S.money<f.cost)return '資金不足';
  earn('film',-f.cost);u.film={name:f.name,a:f.a,day:Math.floor(G.S.t/1440)};return null;
}
export const count=t=>G.S.units.filter(u=>u.type===t).length;

export function hourTick(){
  G.hourly={moveIn:0,sold:0,soldAmt:0};
  const h=Math.floor(G.S.t/60)%24,day=h>=8&&h<=20;
  G.vTargets=null;
  for(const u of G.S.units){
    const t=u.type;
    if(t==='office'||t==='condo'||t==='shop'){
      const r=reach(u);u.unreach=!r;
      if(!u.occ){
        if(r&&Math.random()<(t==='condo'?.16:.22)*(day?1:.3)*rentOf(u).occ){
          u.occ=true;u.sat=65;
          if(t==='condo'){const p=TYPES.condo.sale*rentOf(u).mul;earn('sale',p);G.hourly.sold++;G.hourly.soldAmt+=p;u.present=3;floatTxt(u.x+6,u.f+1,'+'+fmt(p),'#ffd27a');}
          else G.hourly.moveIn++;
        }
      }else if(!r)u.sat=Math.max(0,u.sat-4);
    }else if(TYPES[t].night||t==='food'||t==='cinema'||t==='conference')u.unreach=!reach(u);
    if(u.noisy&&day&&u.occ)u.sat=Math.max(0,u.sat-.6);
    if(u.dirty&&day)u.sat=Math.max(0,u.sat-.3);
  }
  if(G.hourly.moveIn||G.hourly.sold){
    const parts=[];if(G.hourly.moveIn)parts.push(`${G.hourly.moveIn} 間單位有租戶入伙`);if(G.hourly.sold)parts.push(`${G.hourly.sold} 個住宅售出 +${fmt(G.hourly.soldAmt)}`);
    hooks.log(parts.join('，'),G.hourly.sold?'money':'good');
  }
  checkStars();
}
export function quarterEnd(){
  let rent=0,up=0,ops=0,ad=0,left=0;
  for(const u of G.S.units){
    const d=TYPES[u.type];
    if(u.occ&&d.rent)rent+=d.rent*rentOf(u).mul*SITE.rent;
    if(d.roof)ad+=20000+u.f*AD_PER_FLOOR;
    if(d.carUpkeep)up+=d.carUpkeep*u.cars.length;
    if(d.upkeep)ops+=d.upkeep;
    if(u.occ&&(u.type==='office'||u.type==='shop')&&u.sat<25){u.occ=false;u.present=0;left++;}
    if(u.occ&&u.type==='condo'&&u.sat<12){u.occ=false;u.present=0;left++;}
  }
  earn('rent',rent);earn('ad',ad);earn('upkeep',-up);earn('ops',-ops);
  const d=Math.floor(G.S.t/1440)-1;
  G.S.fin.push({y:Math.floor(d/12)+1,q:Math.floor(d/3)%4+1,led:G.S.led});G.S.led={};if(G.S.fin.length>4)G.S.fin.shift();
  hooks.log(`季度結算：租金 +${fmt(rent+ad)}，維修同開支 −${fmt(up+ops).slice(1)}`,'money');
  if(left)hooks.log(`${left} 個租戶嫌等電梯太耐，搬走咗`,'bad');
}
// 點解評價係咁：面板顯示嘅原因
export function reasons(u){
  const a=[];
  if(u.unreach)a.push('去唔到，冇電梯');
  if((u.wAvg||0)>5)a.push('等電梯太耐');
  if(u.noisy)a.push('太嘈');
  if(u.dirty)a.push('房間污糟');
  if((u.rentLv??1)===2)a.push('租金太貴');
  if(!a.length){if((u.rentLv??1)===0)a.push('租金抵');if(TYPES[u.type].quiet&&G.parkOk)a.push('有車位');if(u.sat>=60)a.push('住得舒服');}
  return a;
}
export function checkStars(){
  const nx=G.S.stars+1,r=reqOf(nx);if(!r||G.S.starHold>G.S.t/1440)return;
  if(pop()>=r.pop&&(r.need||[]).every(t=>count(t))){
    G.S.stars=nx;hooks.log(nx===TOWER_STAR?'恭喜！大廈評為 TOWER 級':`大廈升到 ${nx}★，解鎖新設施`,'good');hooks.buildTools();save();
  }
}
