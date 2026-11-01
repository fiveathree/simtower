// 小人同轎廂
import {TYPES,FH,CW} from '../config.js';
import {G,V,R,SX,SY} from '../state.js';

const SKIN=['#f2cfa8','#e0b088','#c58c5e','#8d5f3c','#f7dcc0'],HAIR=['#2a2320','#4a3324','#7a5230','#1c1c22','#a9a4a0'],LEGS=['#2c3442','#3a3a44','#4a3a30','#27303a'];
export function person(x,y,s,col,id=0,walk=0){
  const c=V.ctx;
  if(s<.55){c.fillStyle=col;c.fillRect(x-.6,y-5*s,1.5,5*s);return;}
  const n=Math.abs(id|0),sw=walk?Math.sin(walk)*1.1*s:0;
  c.fillStyle=LEGS[n%4];c.fillRect(x-1.1*s+sw,y-2.8*s,1*s,2.8*s);c.fillRect(x+.1*s-sw,y-2.8*s,1*s,2.8*s);
  c.fillStyle=col;c.fillRect(x-1.4*s,y-6.4*s,2.8*s,3.8*s);
  c.fillStyle=SKIN[n%5];c.beginPath();c.arc(x,y-7.8*s,1.5*s,0,7);c.fill();
  c.fillStyle=HAIR[(n>>2)%5];c.beginPath();c.arc(x,y-8.2*s,1.5*s,3.14,6.28);c.fill();
}
export function drawCars(z){
  for(const s of G.cars.values()){
    const u=s.u,n=s.cars.length,Wt=u.w*CW*z-3,d=TYPES[u.type],top=d.express?'#6fb6ff':d.service?'#62d38f':'#ffb23f',shaftTop=SY(-(u.f+u.h)*FH);
    s.cars.forEach((c,i)=>{
      const X=SX(u.x*CW)+1.5+i*Wt/n,Wd=Wt/n-(n>1?1:0),yb=SY(-c.pos*FH),H=FH*z*.86,T=yb-FH*z*.9;
      R(X+Wd/2-.5,shaftTop,1,Math.max(0,T-shaftTop),'#4a525c'); // 鋼纜
      const g=V.ctx.createLinearGradient(X,0,X+Wd,0);g.addColorStop(0,'#aab3bc');g.addColorStop(.5,'#eef2f5');g.addColorStop(1,'#aab3bc');
      V.ctx.fillStyle=g;V.ctx.fillRect(X,T,Wd,H);
      R(X,T,Wd,2.4*z,top);R(X,T+H-1.4*z,Wd,1.4*z,'#59636e');
      if(Wd>=6)R(X+Wd*.5-.4,T+2.4*z,.8,H-3.8*z,'#7d8791');
      if(z>=.7&&Wd>=10){
        const m=Math.min(c.riders.length,Math.floor(Wd/(3.6*z)));
        for(let k=0;k<m;k++)person(X+(k+.6)*Wd/(m+.2),T+H-1.8*z,z*.75,'#2b3444',k+u.id,0);
        if(c.riders.length){V.ctx.fillStyle='#1b1f24';V.ctx.font=`700 ${Math.max(8,7*z)}px "Share Tech Mono",monospace`;V.ctx.textAlign='center';V.ctx.fillText(c.riders.length,X+Wd/2,T+8*z);V.ctx.textAlign='left';}
      }
    });
  }
}
const DOT_AT=1500; // 人多過呢個數就用點代替，唔畫頭
export function drawAgents(z){
  const dots=G.agents.length>DOT_AT||z<.6,buckets=new Map(),s=z*.9,t=performance.now()/90;
  for(const a of G.agents){
    if(a.state==='ride'||a.dead)continue;
    let f=a.f,x=a.x;if(a.state==='climb'){f=a.cf+(a.to-a.cf)*a.cp;x=a.cx+(a.ex-a.cx)*a.cp;}
    const sx=SX(x*CW),sy=SY(-f*FH)-3*z;if(sx<-5||sx>V.VW+5||sy<-10||sy>V.VH+10)continue; // 只畫畫面內
    const w=a.wait,col=a.kind==='vip'?'#e6b422':a.kind==='guard'?'#1c2b6a':a.svc?'#2f6f8f':w<5?'#1d1d22':w<10?'#e2609a':'#d42a2a';
    if(!dots){const id=(a.uid||a.tid||0)+Math.floor(a.age*0)+(a.x0??(a.x0=Math.floor(a.x*7)));person(sx,sy,s,col,id,a.state==='walk'&&G.speed?t+id:0);continue;}
    let b=buckets.get(col);if(!b){b=[];buckets.set(col,b);}b.push(sx,sy);
  }
  const dw=Math.max(1.5,2*s),dh=Math.max(2,7*s);
  for(const[col,b]of buckets){V.ctx.fillStyle=col;for(let i=0;i<b.length;i+=2)V.ctx.fillRect(b[i]-dw/2,b[i+1]-dh,dw,dh);}
}
