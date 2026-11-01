// 每日日程、事件佇列、模擬一步
import {rnd} from './config.js';
import {G,floatTxt,save} from './state.js';
import {route,reach,lobbyX} from './route.js';
import {trip,stepAgent} from './agents.js';
import {stepShaft} from './elevator.js';
import {pop,hourTick,quarterEnd} from './economy.js';

export function addEv(t,k,id,id2){const e={t,k,id,id2};let lo=G.evi,hi=G.events.length;while(lo<hi){const m=(lo+hi)>>1;if(G.events[m].t<=t)lo=m+1;else hi=m;}G.events.splice(lo,0,e);}
export function genDay(d,from){
  const base=d*1440,wk=d%3!==2;
  const ev=(t,k,id)=>{if(t>=from)addEv(t,k,id);};
  let shops=0,foods=0;
  for(const u of G.S.units){
    if(u.type==='food'){foods++;ev(base+rnd(540,630),'svc',u.id);}
    if(u.type==='shop'&&u.occ)shops++;
    if(u.type==='office'&&u.occ){u.present=0;if(wk)for(let i=0;i<6;i++){ev(base+rnd(450,540),'in',u.id);if(Math.random()<.45)ev(base+rnd(715,770),'lunch',u.id);ev(base+rnd(1010,1110),'out',u.id);}}
    else if(u.type==='condo'&&u.occ){u.present=3;for(let i=0;i<3;i++)if(wk||Math.random()<.5){const o=wk?rnd(420,540):rnd(600,840);ev(base+o,'out',u.id);ev(base+(wk?rnd(1020,1260):o+rnd(120,360)),'in',u.id);}}
    else if(u.type==='hotel'){if(Math.random()<.25)ev(base+rnd(620,720),'svc',u.id);if(u.occ){u.present=2;ev(base+rnd(470,560),'out',u.id);ev(base+rnd(470,580),'out',u.id);ev(base+605,'hfree',u.id);}ev(base+1020+rnd(0,30),'hotel',u.id);}
    else if(u.type==='food'||u.type==='shop')u.present=0;
  }
  if(foods+shops>0){
    const n=Math.min(320,Math.round((pop()*.08+shops*5+foods*8)*(wk?1:1.5)));
    for(let i=0;i<n;i++)ev(base+rnd(660,1200),'visit',0);
  }
}
export function handle(e){
  const u=G.byId.get(e.id);
  switch(e.k){
    case 'in':{if(!u||!u.occ)return;const lx=lobbyX();if(lx==null)return;if(!trip(0,lx,u.f,u.x+.5+Math.random()*(u.w-1),'in',{uid:u.id}))u.sat=Math.max(0,u.sat-2);break;}
    case 'out':{if(!u)return;u.present=Math.max(0,u.present-1);const lx=lobbyX();if(lx==null)return;trip(u.f,u.x+Math.random()*u.w,0,lx,'out',{uid:u.id});break;}
    case 'lunch':{
      if(!u||!u.occ||u.present<=0)return;
      const fs=G.S.units.filter(v=>v.type==='food'&&route(u.f,v.f)).sort((a,b)=>Math.abs(a.f-u.f)-Math.abs(b.f-u.f)).slice(0,3);
      if(!fs.length)return;const fd=fs[Math.floor(Math.random()*fs.length)];
      u.present--;trip(u.f,u.x+Math.random()*u.w,fd.f,fd.x+1+Math.random()*(fd.w-2),'lunch',{uid:u.id,fid:fd.id});break;}
    case 'lunchBack':{const fd=G.byId.get(e.id2);if(!u)return;if(fd)fd.present=Math.max(0,fd.present-1);
      const sf=fd?fd.f:0,sx=fd?fd.x+Math.random()*fd.w:(lobbyX()||0);trip(sf,sx,u.f,u.x+Math.random()*u.w,'back',{uid:u.id});break;}
    case 'visit':{
      const ts=G.S.units.filter(v=>(v.type==='food'||(v.type==='shop'&&v.occ))&&!v.unreach);if(!ts.length)return;
      const tg=ts[Math.floor(Math.random()*ts.length)];const lx=lobbyX();if(lx==null)return;
      trip(0,lx,tg.f,tg.x+1+Math.random()*(tg.w-2),'visit',{tid:tg.id});break;}
    case 'vout':{if(!u)return;u.present=Math.max(0,u.present-1);const lx=lobbyX();if(lx==null)return;trip(u.f,u.x+Math.random()*u.w,0,lx,'vo',{});break;}
    case 'svc':{if(!u)return;const lx=lobbyX();if(lx==null)return;trip(0,lx,u.f,u.x+Math.random()*u.w,'svc',{tid:u.id,svc:true});break;}
    case 'svcOut':{if(!u)return;const lx=lobbyX();if(lx==null)return;trip(u.f,u.x+Math.random()*u.w,0,lx,'vo',{svc:true});break;}
    case 'hotel':{
      if(!u||u.occ||!reach(u))return;
      if(Math.random()<.3+u.sat/250+G.S.stars*.06){u.occ=true;G.S.money+=1500;floatTxt(u.x+2.5,u.f+1,'+$1,500','#ffd27a');
        addEv(G.S.t+rnd(0,180),'in',u.id);addEv(G.S.t+rnd(0,180),'in',u.id);}
      break;}
    case 'hfree':if(u){u.occ=false;u.present=0;}break;
  }
}

export function sim(dt){
  G.S.t+=dt;
  const d=Math.floor(G.S.t/1440);
  if(d!==G.lastDay){G.lastDay=d;G.events=G.events.slice(G.evi);G.evi=0;if(d%3===0)quarterEnd();genDay(d,G.S.t-dt);save();}
  if(Math.floor(G.S.t/5)!==Math.floor((G.S.t-dt)/5))G.rcache=new Map(); // 候梯人數變咗，路線要重新計
  const h=Math.floor(G.S.t/60);if(h!==G.lastHour){G.lastHour=h;hourTick();}
  while(G.evi<G.events.length&&G.events[G.evi].t<=G.S.t)handle(G.events[G.evi++]);
  for(const a of G.agents)if(!a.dead)stepAgent(a,dt);
  for(const s of G.cars.values())stepShaft(s,dt);
  if(G.agents.some(a=>a.dead))G.agents=G.agents.filter(a=>!a.dead);
  for(const f of G.floats)f.t+=dt;G.floats=G.floats.filter(f=>f.t<12);
}
