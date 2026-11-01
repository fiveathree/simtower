// 小人同轎廂
import {TYPES,FH,CW} from '../config.js';
import {G,V,R,SX,SY} from '../state.js';

export function person(x,y,s,col){V.ctx.fillStyle=col;if(s<.55){V.ctx.fillRect(x-.5,y-5*s,1.4,5*s);return;}V.ctx.fillRect(x-1.1*s,y-6*s,2.2*s,6*s);V.ctx.beginPath();V.ctx.arc(x,y-7.6*s,1.4*s,0,7);V.ctx.fill();}
export function drawCars(z){
  for(const s of G.cars.values()){
    const u=s.u,n=s.cars.length,Wt=u.w*CW*z-3,top=TYPES[u.type].express?'#6fb6ff':TYPES[u.type].service?'#62d38f':'#ffb23f';
    s.cars.forEach((c,i)=>{
      const X=SX(u.x*CW)+1.5+i*Wt/n,Wd=Wt/n-(n>1?1:0),yb=SY(-c.pos*FH);
      R(X,yb-FH*z*.88,Wd,FH*z*.86,'#d9dde2');R(X,yb-FH*z*.88,Wd,2*z,top);
      if(c.riders.length&&z>=.7&&Wd>=10){V.ctx.fillStyle='#1b1f24';V.ctx.font=`700 ${Math.max(8,8*z)}px "Share Tech Mono",monospace`;V.ctx.textAlign='center';V.ctx.fillText(c.riders.length,X+Wd/2,yb-FH*z*.32);V.ctx.textAlign='left';}
    });
  }
}
export function drawAgents(z){
  for(const a of G.agents){
    if(a.state==='ride'||a.dead)continue;
    let f=a.f,x=a.x;if(a.state==='climb'){f=a.cf+(a.to-a.cf)*a.cp;x=a.cx+(a.ex-a.cx)*a.cp;}
    const sx=SX(x*CW),sy=SY(-f*FH)-2.5*z;if(sx<-5||sx>V.VW+5||sy<-10||sy>V.VH+10)continue;
    const w=a.wait;person(sx,sy,z*.9,a.kind==='vip'?'#e6b422':a.kind==='guard'?'#1c2b6a':a.svc?'#2f6f8f':w<5?'#1d1d22':w<10?'#e2609a':'#d42a2a');
  }
}
