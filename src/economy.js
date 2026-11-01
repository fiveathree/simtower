// 收入、支出、季度結算、升星
import {TYPES,REQ,FILMS,REP_MAX,TOWER_STAR,AD_PER_FLOOR,fmt} from './config.js';
import {G,floatTxt,hooks,save} from './state.js';
import {reach} from './route.js';

export function tenants(){let p=0;for(const u of G.S.units)if(u.occ&&TYPES[u.type].pop)p+=TYPES[u.type].pop;return p;}
// 人口 = 租戶 + 近 3 日平均每日訪客（原作都計商業人流；單靠租戶呢個地盤到唔到 10,000）
export const pop=()=>tenants()+G.S.visitors;
export function rollVisitors(){const L=G.S.vLog;L.push(G.S.vToday);if(L.length>3)L.shift();G.S.vToday=0;G.S.visitors=Math.round(L.reduce((a,b)=>a+b,0)/L.length);
  // 名氣跟住客滿意度慢慢累積，訪客量隨名氣增長
  let sum=0,n=0;for(const u of G.S.units)if(u.occ&&TYPES[u.type].pop){sum+=u.sat;n++;}
  G.S.rep=Math.min(REP_MAX,G.S.rep+(n?Math.min(1,sum/n/60):0));}
export function setFilm(u,i){
  const f=FILMS[i];if(G.S.money<f.cost)return '資金不足';
  G.S.money-=f.cost;u.film={name:f.name,a:f.a,day:Math.floor(G.S.t/1440)};return null;
}
export const count=t=>G.S.units.filter(u=>u.type===t).length;

export function hourTick(){
  G.hourly={moveIn:0,sold:0,soldAmt:0};
  const h=Math.floor(G.S.t/60)%24,day=h>=8&&h<=20;
  for(const u of G.S.units){
    const t=u.type;
    if(t==='office'||t==='condo'||t==='shop'){
      const r=reach(u);u.unreach=!r;
      if(!u.occ){
        if(r&&Math.random()<(t==='condo'?.16:.22)*(day?1:.3)){
          u.occ=true;u.sat=65;
          if(t==='condo'){G.S.money+=150000;G.hourly.sold++;G.hourly.soldAmt+=150000;u.present=3;floatTxt(u.x+6,u.f+1,'+$150,000','#ffd27a');}
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
  let rent=0,up=0,left=0;
  for(const u of G.S.units){
    const d=TYPES[u.type];
    if(u.occ&&d.rent)rent+=d.rent;
    if(d.roof)rent+=20000+u.f*AD_PER_FLOOR;
    if(d.carUpkeep)up+=d.carUpkeep*u.cars.length;
    if(d.upkeep)up+=d.upkeep;
    if(u.occ&&(u.type==='office'||u.type==='shop')&&u.sat<25){u.occ=false;u.present=0;left++;}
    if(u.occ&&u.type==='condo'&&u.sat<12){u.occ=false;u.present=0;left++;}
  }
  G.S.money+=rent-up;
  hooks.log(`季度結算：租金 +${fmt(rent)}，維修 −${fmt(up).slice(1)}`,'money');
  if(left)hooks.log(`${left} 個租戶嫌等電梯太耐，搬走咗`,'bad');
}
export function checkStars(){
  const nx=G.S.stars+1,r=REQ[nx];if(!r)return;
  if(pop()>=r.pop&&(r.need||[]).every(t=>count(t))){
    G.S.stars=nx;hooks.log(nx===TOWER_STAR?'恭喜！大廈評為 TOWER 級':`大廈升到 ${nx}★，解鎖新設施`,'good');hooks.buildTools();save();
  }
}
