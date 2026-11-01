// 每日日程、事件佇列、模擬一步
import {TYPES,REP_MAX,PARK_SLOTS,CONF_FEE,filmAppeal,fmt,rnd} from './config.js';
import {G,floatTxt,hooks,save} from './state.js';
import {route,reach,lobbyX} from './route.js';
import {trip,stepAgent} from './agents.js';
import {stepShaft} from './elevator.js';
import {tenants,rollVisitors,hourTick,quarterEnd} from './economy.js';

export function addEv(t,k,id,id2){const e={t,k,id,id2};let lo=G.evi,hi=G.events.length;while(lo<hi){const m=(lo+hi)>>1;if(G.events[m].t<=t)lo=m+1;else hi=m;}G.events.splice(lo,0,e);}
export function genDay(d,from){
  const base=d*1440,wk=d%3!==2;
  const ev=(t,k,id)=>{if(t>=from)addEv(t,k,id);};
  let shops=0,foods=0,slots=0,guests=0,dirty=0;
  for(const u of G.S.units){
    const D=TYPES[u.type];
    if(u.type==='parking'&&u.on)slots+=PARK_SLOTS;
    if(D.quiet)guests++;
    if(u.type==='housekeeping')u.busy=0;
    if(u.type==='food'){foods++;ev(base+rnd(540,630),'svc',u.id);}
    if(u.type==='shop'&&u.occ)shops++;
    if(u.type==='office'&&u.occ){u.present=0;if(wk)for(let i=0;i<6;i++){ev(base+rnd(450,540),'in',u.id);if(Math.random()<.45)ev(base+rnd(715,770),'lunch',u.id);ev(base+rnd(1010,1110),'out',u.id);}}
    else if(u.type==='condo'&&u.occ){u.present=3;for(let i=0;i<3;i++)if(wk||Math.random()<.5){const o=wk?rnd(420,540):rnd(600,840);ev(base+o,'out',u.id);ev(base+(wk?rnd(1020,1260):o+rnd(120,360)),'in',u.id);}}
    else if(D.night){if(u.dirty){dirty++;ev(base+630+rnd(0,60),'clean',u.id);}if(u.occ){u.present=D.pop;for(let i=0;i<D.pop;i++)ev(base+rnd(470,570),'out',u.id);ev(base+605,'hfree',u.id);}ev(base+1020+rnd(0,30),'hotel',u.id);}
    else if(u.type==='conference'){u.present=0;if(wk&&!u.unreach)ev(base+rnd(570,900),'conf',u.id);}
    else if(u.type==='cinema'){
      u.present=0;
      const aud=Math.min(120,Math.round(80*filmAppeal(u,d)*(wk?1:1.5)));
      for(const start of wk?[1140]:[840,1140])for(let i=0;i<aud;i++)ev(base+start-rnd(0,60),'movie',u.id);
    }
    else if(u.type==='food'||u.type==='shop')u.present=0;
  }
  if(dirty&&d%3===0)hooks.log(`${dirty} 間酒店房污糟緊，要有清潔房先租得出`,'bad');
  const ratio=guests?Math.min(1,slots/guests):0;
  if(ratio)for(const u of G.S.units)if(TYPES[u.type].quiet)u.sat=Math.min(100,u.sat+3*ratio);
  if(foods+shops>0){
    const m=G.S.units.find(u=>u.type==='metro'&&route(u.f+u.h-1,0)),fame=.15+.85*G.S.rep/REP_MAX,extra=m?(wk?4000:6500)*fame:0;
    const base2=(tenants()*.08+shops*70+foods*80)*(wk?1:1.5)*fame;
    const n=Math.min(shops*160+foods*180,Math.round(base2+extra));
    for(let i=0;i<n;i++)ev(base+rnd(660,1200),'visit',m&&Math.random()<extra/(base2+extra)?m.id:0);
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
      const tg=ts[Math.floor(Math.random()*ts.length)];
      const from=u?u.f+u.h-1:0,fx=u?u.x+Math.random()*u.w:lobbyX();if(fx==null)return;
      trip(from,fx,tg.f,tg.x+1+Math.random()*(tg.w-2),'visit',{tid:tg.id,mid:e.id});break;}
    case 'movie':{if(!u||u.unreach)return;const lx=lobbyX();if(lx==null)return;trip(0,lx,u.f,u.x+1+Math.random()*(u.w-2),'visit',{tid:u.id});break;}
    case 'vout':{
      if(!u)return;u.present=Math.max(0,u.present-1);
      const m=G.byId.get(e.id2),to=m?m.f+m.h-1:0,tx=m?m.x+Math.random()*m.w:lobbyX();if(tx==null)return;
      trip(u.f,u.x+Math.random()*u.w,to,tx,'vo',{});break;}
    case 'conf':{
      if(!u)return;
      const os=G.S.units.filter(v=>v.type==='office'&&v.occ&&v.present>0&&!v.unreach&&route(v.f,u.f));if(!os.length)return;
      G.S.money+=CONF_FEE;floatTxt(u.x+8,u.f+1,'+'+fmt(CONF_FEE),'#ffd27a');
      for(let i=0;i<8;i++){const o=os[Math.floor(Math.random()*os.length)];if(o.present<=0)continue;o.present--;trip(o.f,o.x+Math.random()*o.w,u.f,u.x+1+Math.random()*(u.w-2),'meet',{uid:o.id,fid:u.id});}
      break;}
    case 'clean':{
      if(!u||!u.dirty)return;
      const hk=G.S.units.filter(v=>v.type==='housekeeping'&&(v.busy||0)<TYPES.housekeeping.staff&&route(v.f,u.f,true)).sort((a,b)=>Math.abs(a.f-u.f)-Math.abs(b.f-u.f))[0];
      if(!hk)return; // 冇人手就等聽日
      if(trip(hk.f,hk.x+Math.random()*hk.w,u.f,u.x+Math.random()*u.w,'clean',{tid:u.id,hk:hk.id,svc:true}))hk.busy=(hk.busy||0)+1;
      break;}
    case 'cleaned':{
      if(u)u.dirty=false;
      const hk=G.byId.get(e.id2);if(!hk)return;hk.busy=Math.max(0,(hk.busy||0)-1);
      if(u)trip(u.f,u.x+Math.random()*u.w,hk.f,hk.x+Math.random()*hk.w,'vo',{svc:true});
      break;}
    case 'svc':{if(!u)return;const lx=lobbyX();if(lx==null)return;trip(0,lx,u.f,u.x+Math.random()*u.w,'svc',{tid:u.id,svc:true});break;}
    case 'svcOut':{if(!u)return;const lx=lobbyX();if(lx==null)return;trip(u.f,u.x+Math.random()*u.w,0,lx,'vo',{svc:true});break;}
    case 'hotel':{
      if(!u||u.occ||u.dirty||!reach(u))return;
      if(Math.random()<.3+u.sat/250+G.S.stars*.06){
        const D=TYPES[u.type];u.occ=true;G.S.money+=D.night;floatTxt(u.x+u.w/2,u.f+1,'+'+fmt(D.night),'#ffd27a');
        for(let i=0;i<D.pop;i++)addEv(G.S.t+rnd(0,180),'in',u.id);}
      break;}
    case 'hfree':if(u){u.occ=false;u.present=0;u.dirty=true;addEv(G.S.t+rnd(10,60),'clean',u.id);}break;
  }
}

export function sim(dt){
  G.S.t+=dt;
  const d=Math.floor(G.S.t/1440);
  if(d!==G.lastDay){G.lastDay=d;G.events=G.events.slice(G.evi);G.evi=0;rollVisitors();if(d%3===0)quarterEnd();genDay(d,G.S.t-dt);save();}
  if(Math.floor(G.S.t/5)!==Math.floor((G.S.t-dt)/5))G.rcache=new Map(); // 候梯人數變咗，路線要重新計
  const h=Math.floor(G.S.t/60);if(h!==G.lastHour){G.lastHour=h;hourTick();}
  while(G.evi<G.events.length&&G.events[G.evi].t<=G.S.t)handle(G.events[G.evi++]);
  for(const a of G.agents)if(!a.dead)stepAgent(a,dt);
  for(const s of G.cars.values())stepShaft(s,dt);
  if(G.agents.some(a=>a.dead))G.agents=G.agents.filter(a=>!a.dead);
  for(const f of G.floats)f.t+=dt;G.floats=G.floats.filter(f=>f.t<12);
}
