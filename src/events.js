// 隨機事件：火警、炸彈勒索、VIP 到訪、聖誕
import {TYPES,fi,fmt,fname,rnd} from './config.js';
import {G,earn,hooks} from './state.js';
import {route,lobbyX} from './route.js';
import {trip} from './agents.js';
import {addEv} from './schedule.js';
import {removeUnit} from './build.js';

const pick=a=>a[Math.floor(Math.random()*a.length)];
const FIRE_MIN=120,SPREAD_MIN=90,BOMB_MIN=240,MAX_SPREAD=2;
export const isXmas=d=>d%12>=9; // 每年第四季
const units=t=>G.S.units.filter(u=>u.type===t);

function sendGuard(s,f,x,data){return trip(s.f,s.x+Math.random()*s.w,f,x,'guard',{svc:true,sid:s.id,...data});}

export function dailyEvents(d){
  if(d%12===9)hooks.log('聖誕到喇！大堂有聖誕樹，訪客會多五成','good');
  if(G.fire||G.bomb||G.S.stars<2||d<6)return;
  const r=Math.random(),at=G.S.t+rnd(240,900);
  if(r<.05)addEv(at,'evFire');
  else if(r<.07)addEv(at,'evBomb');
  else if(r<.11&&G.S.stars>=3)addEv(at,'evVip');
}
export function eventHandle(e,u){
  switch(e.k){
    case 'evFire':return startFire();
    case 'evBomb':return startBomb();
    case 'evVip':return startVip();
    case 'burn':return burn(u);
    case 'bombFound':
      if(G.bomb){hooks.alert(null);hooks.log('保安搵到炸彈，拆除成功！','good');G.bomb=null;}
      return;
    case 'bombBoom':return boom();
  }
}

/* ---------- 火警 ---------- */
export function startFire(){
  const cs=G.S.units.filter(u=>!TYPES[u.type].lift&&u.type!=='stairs'&&u.f>=0);if(!cs.length)return;
  const u=pick(cs);G.fire={id:u.id,f:u.f,x:u.x,spread:0};
  const name=`${fname(u.f)} ${TYPES[u.type].name}`;
  const guards=units('security').filter(s=>route(s.f,u.f,true)).sort((a,b)=>Math.abs(a.f-u.f)-Math.abs(b.f-u.f)).slice(0,2);
  hooks.alert(guards.length?`${name} 火警！保安趕緊去`:`${name} 火警！冇保安室，救唔到`,u.f,u.x);
  for(const s of guards)sendGuard(s,u.f,u.x+u.w/2,{job:'fire'});
  addEv(G.S.t+FIRE_MIN,'burn',u.id);
}
function burn(u){
  if(!G.fire||!u||G.fire.id!==u.id)return;
  const o=G.occ[fi(u.f)],nb=[G.byId.get(o[u.x-1]),G.byId.get(o[u.x+u.w])].filter(v=>v&&!TYPES[v.type].lift&&v.type!=='stairs');
  hooks.log(`${fname(u.f)} ${TYPES[u.type].name}燒毀咗`,'bad');removeUnit(u);
  if(nb.length&&G.fire.spread<MAX_SPREAD){const v=pick(nb);G.fire={id:v.id,f:v.f,x:v.x,spread:G.fire.spread+1};addEv(G.S.t+SPREAD_MIN,'burn',v.id);hooks.alert(`火勢蔓延到 ${TYPES[v.type].name}！`,v.f,v.x);}
  else{G.fire=null;hooks.alert(null);}
}
export function guardArrive(a){
  if(a.job==='fire'&&G.fire&&G.fire.f===a.f){G.fire=null;hooks.alert(null);hooks.log('保安撲熄咗火警','good');}
  const s=G.byId.get(a.sid);if(s)trip(a.f,a.x,s.f,s.x+Math.random()*s.w,'vo',{svc:true});
}

/* ---------- 炸彈勒索 ---------- */
export function startBomb(){
  const cs=G.S.units.filter(u=>!TYPES[u.type].lift&&u.f>=0);if(!cs.length)return;
  const ransom=Math.max(300000,Math.round(G.S.money*.15/10000)*10000);
  hooks.ask('恐怖分子勒索',`有人話喺大廈放咗炸彈，要 ${fmt(ransom)} 贖金。唔俾嘅話，保安要喺 4 個鐘內搵到炸彈；保安室越多越快。`,[
    {label:'唔俾，叫保安搵',fn:()=>refuse(pick(cs))},
    {label:`俾 ${fmt(ransom)}`,primary:true,disabled:G.S.money<ransom,fn:()=>{earn('event',-ransom);hooks.log(`俾咗贖金 ${fmt(ransom)}`,'bad');}},
  ]);
}
export function refuse(u){
  const k=units('security').length,floors=new Set(G.S.units.map(v=>v.f)).size;
  G.bomb={f:u.f,x:u.x};
  hooks.alert(k?'保安搜索炸彈中……':'冇保安室，搵唔到炸彈！',u.f,u.x);
  if(k){
    const need=rnd(60,200)*floors/(k*20);
    if(need<BOMB_MIN)addEv(G.S.t+need,'bombFound');
    for(const s of units('security'))for(let i=0;i<3;i++){const v=pick(G.S.units);if(route(s.f,v.f,true))sendGuard(s,v.f,v.x+v.w/2,{job:'sweep'});}
  }
  addEv(G.S.t+BOMB_MIN,'bombBoom');
}
function boom(){
  if(!G.bomb)return;
  const {f,x}=G.bomb;G.bomb=null;hooks.alert(null);
  const hit=G.S.units.filter(u=>u.f===f&&!TYPES[u.type].lift&&Math.abs(u.x+u.w/2-x)<30);
  for(const u of hit)removeUnit(u);
  for(const u of G.S.units)u.sat=Math.max(0,u.sat-10);
  hooks.log(`炸彈喺 ${fname(f)} 爆炸，炸毀 ${hit.length} 個單位！`,'bad');
}

/* ---------- VIP ---------- */
export function startVip(){
  const rooms=G.S.units.filter(u=>TYPES[u.type].night&&!u.occ&&!u.dirty&&!u.unreach).sort((a,b)=>TYPES[b.type].night-TYPES[a.type].night);
  if(!rooms.length){G.S.rep=Math.max(0,G.S.rep-5);hooks.log('VIP 嚟到冇房住，走咗，名氣下跌','bad');return;}
  const r=rooms[0],lx=lobbyX();if(lx==null)return;
  if(!trip(0,lx,r.f,r.x+r.w/2,'vip',{tid:r.id}))return;
  r.occ=true;earn('hotel',TYPES[r.type].night);
  hooks.log(`VIP 到訪！佢要去 ${fname(r.f)} ${TYPES[r.type].name}，唔好俾佢等電梯`,'good');
}
export function vipArrive(a){
  if(a.wait<=5){G.S.rep+=15;hooks.log('VIP 好滿意，名氣上升','good');}
  else{
    G.S.rep=Math.max(0,G.S.rep-15);G.S.starHold=Math.floor(G.S.t/1440)+6;
    hooks.log(`VIP 等咗 ${Math.round(a.wait)} 分鐘好唔開心，名氣下跌，兩季內唔可以升星`,'bad');
  }
}
