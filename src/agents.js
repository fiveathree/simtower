// 小人行為
import {TICKET,WALK,rnd} from './config.js';
import {G,floatTxt} from './state.js';
import {route,pickLift,nearestStairs} from './route.js';
import {addEv} from './schedule.js';

export function trip(f1,x1,f2,x2,kind,data){
  const legs=route(f1,f2,data&&data.svc);if(!legs)return null;
  const a=Object.assign({f:f1,x:x1,legs,li:0,finalX:x2,kind,wait:0,age:0,state:'walk',tx:x1},data);
  G.agents.push(a);nextLeg(a);return a;
}
export function nextLeg(a){
  if(a.li>=a.legs.length){a.state='walk';a.tx=a.finalX;a.after='end';return;}
  const L=a.legs[a.li];
  if(L.t==='elev'){
    const e=pickLift(a.f,L.to,a.x,L.id);if(!e){a.dead=true;return;}
    a.elev=e;a.to=L.to;a.dir=Math.sign(L.to-a.f);a.state='walk';a.tx=Math.max(0,e.x-.8-Math.random()*3.2);a.after='wait';
  }else{
    const s=nearestStairs(a.f,L.to,a.x);if(!s){a.dead=true;return;}
    a.st=s;a.to=L.to;a.state='walk';a.tx=L.to>a.f?s.x+.5:s.x+s.w-.5;a.after='climb';
  }
}
export function stepAgent(a,dt){
  a.age+=dt;
  if(a.state==='walk'){
    const d=a.tx-a.x,s=WALK*dt;
    if(Math.abs(d)>s){a.x+=Math.sign(d)*s;return;}
    a.x=a.tx;
    if(a.after==='wait'){const c=G.cars.get(a.elev.id);if(!c){a.dead=true;return;}a.state='wait';let q=c.q.get(a.f);if(!q){q=[];c.q.set(a.f,q);}q.push(a);}
    else if(a.after==='climb'){a.state='climb';a.cp=0;a.cf=a.f;a.cx=a.x;a.ex=a.to>a.f?a.st.x+a.st.w-.5:a.st.x+.5;}
    else arrive(a);
  }else if(a.state==='wait'){a.wait+=dt;}
  else if(a.state==='climb'){a.cp+=dt/1.3;if(a.cp>=1){a.f=a.to;a.x=a.ex;a.li++;nextLeg(a);}}
  if(a.age>360&&!a.dead){a.dead=true;const u=G.byId.get(a.uid);if(u)u.sat=Math.max(0,u.sat-6);}
}
export function stress(u,w){if(!u)return;if(w<3)u.sat=Math.min(100,u.sat+.8);else u.sat=Math.max(0,u.sat-(w-3)*.6);}
export function arrive(a){
  a.dead=true;
  const u=G.byId.get(a.uid);
  switch(a.kind){
    case 'in':case 'back': if(u){u.present++;stress(u,a.wait);}break;
    case 'out': stress(u,a.wait);break;
    case 'lunch':{const fd=G.byId.get(a.fid);if(fd){G.S.money+=40;fd.present++;floatTxt(a.x,a.f+1,'+$40','#ffd27a');}stress(u,a.wait);addEv(G.S.t+rnd(22,40),'lunchBack',a.uid,a.fid);break;}
    case 'meet':{const c=G.byId.get(a.fid);if(c)c.present++;stress(u,a.wait);addEv(G.S.t+rnd(60,120),'lunchBack',a.uid,a.fid);break;}
    case 'clean':addEv(G.S.t+rnd(15,25),'cleaned',a.tid,a.hk);break;
    case 'svc':addEv(G.S.t+rnd(5,15),'svcOut',a.tid);break;
    case 'visit':{const tg=G.byId.get(a.tid);G.S.vToday++;if(tg){tg.present++;if(tg.type==='food'){G.S.money+=40;floatTxt(a.x,a.f+1,'+$40','#ffd27a');}else if(tg.type==='cinema')G.S.money+=TICKET;stress(tg,a.wait);}addEv(G.S.t+(tg&&tg.type==='cinema'?rnd(100,130):rnd(20,50)),'vout',a.tid,a.mid);break;}
  }
}
