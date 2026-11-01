// 天空、城市背景、地面、樓面、單位
import {W,CW,FH,MINF,MAXF,fi,fname} from '../config.js';
import {G,V,R,cam,SX,SY} from '../state.js';
import {drawUnit} from './units.js';
import {drawCars,drawAgents} from './people.js';
import {drawFloats,drawGhost} from './overlay.js';

export function resize(){const r=V.cvs.parentElement.getBoundingClientRect();V.DPR=Math.min(2,window.devicePixelRatio||1);V.VW=r.width;V.VH=r.height;V.cvs.width=Math.round(V.VW*V.DPR);V.cvs.height=Math.round(V.VH*V.DPR);}
const SKY=[[0,'#070b1e','#18204a'],[5,'#0d1433','#2e2d5c'],[6.3,'#e98b5f','#6f86c4'],[7.6,'#86bde9','#d4e8f6'],[16.5,'#7ab2e3','#cfe3f2'],[18,'#ee8150','#56669f'],[19.3,'#151d48','#352d5c'],[24,'#070b1e','#18204a']];
const hx=c=>[1,3,5].map(i=>parseInt(c.slice(i,i+2),16));
const lerpC=(a,b,t)=>{const A=hx(a),B=hx(b);return`rgb(${A.map((v,i)=>Math.round(v+(B[i]-v)*t)).join(',')})`;};
function skyAt(h){for(let i=0;i<SKY.length-1;i++){const[a,t1,b1]=SKY[i],[b,t2,b2]=SKY[i+1];if(h>=a&&h<=b){const t=(h-a)/(b-a);return[lerpC(t1,t2,t),lerpC(b1,b2,t)];}}return[SKY[0][1],SKY[0][2]];}
const nightF=h=>h<5?1:h<6.5?1-(h-5)/1.5:h<18?0:h<19.5?(h-18)/1.5:1;
let seed=11;const sr=()=>(seed=(seed*16807)%2147483647)/2147483647;
const STARS=Array.from({length:90},()=>[sr(),sr(),sr()<.2?2:1]);
const CITY=[];for(let x=-900;x<W*CW+900;){const w=30+sr()*70,h=40+sr()*260;if(x<-20||x>W*CW+20)CITY.push({x,w,h,win:Array.from({length:Math.floor(h/14)},()=>sr())});x+=w+4+sr()*14;}

export function render(){
  const z=cam.z;V.ctx.setTransform(V.DPR,0,0,V.DPR,0,0);
  const hr=(G.S.t%1440)/60,sky=skyAt(hr),nf=nightF(hr);
  const g=V.ctx.createLinearGradient(0,0,0,V.VH);g.addColorStop(0,sky[0]);g.addColorStop(1,sky[1]);V.ctx.fillStyle=g;V.ctx.fillRect(0,0,V.VW,V.VH);
  if(nf>0){V.ctx.fillStyle=`rgba(255,255,255,${.75*nf})`;for(const s of STARS)V.ctx.fillRect(s[0]*V.VW,s[1]*V.VH*.75,s[2],s[2]);}
  const gy=SY(0);
  // skyline
  V.ctx.fillStyle=lerpC('#5d6b85','#141a30',nf);
  for(const b of CITY){const x=SX(b.x),w=b.w*z;if(x+w<0||x>V.VW)continue;V.ctx.fillRect(x,gy-b.h*z,w,b.h*z);}
  if(nf>.3){V.ctx.fillStyle=`rgba(255,210,120,${.55*nf})`;for(const b of CITY){const x=SX(b.x),w=b.w*z;if(x+w<0||x>V.VW)continue;b.win.forEach((v,i)=>{if(v>.55)V.ctx.fillRect(x+w*v*.8,gy-(i*14+10)*z,3*z,3*z);});}}
  // ground
  if(gy<V.VH){const gg=V.ctx.createLinearGradient(0,gy,0,gy+400*z);gg.addColorStop(0,'#5a4631');gg.addColorStop(1,'#2c2117');V.ctx.fillStyle=gg;V.ctx.fillRect(0,gy,V.VW,V.VH-gy);R(0,gy,V.VW,3*z,'#6e6a62');}
  // lot markers
  V.ctx.fillStyle='rgba(255,255,255,.18)';V.ctx.fillRect(SX(0)-1,gy,2,8*z);V.ctx.fillRect(SX(W*CW)-1,gy,2,8*z);
  // visible floors
  const yMin=cam.y-V.VH/2/z,yMax=cam.y+V.VH/2/z;
  const fLo=Math.max(MINF,Math.floor(-yMax/FH)-1),fHi=Math.min(MAXF,Math.ceil(-yMin/FH));
  for(let f=fLo;f<=fHi;f++){
    const s=G.S.slab[fi(f)],Y=SY(-(f+1)*FH),H=FH*z;
    for(let x=0;x<W;){const v=s[x];if(!v){x++;continue;}let e=x;while(e<W&&s[e]===v)e++;
      const X=SX(x*CW),Wd=(e-x)*CW*z;
      if(X+Wd>=0&&X<=V.VW){
        if(v===2){R(X,Y,Wd,H,'#efe9dd');R(X,Y+H*.78,Wd,H*.22,'#d8cdb8');for(let c=x;c<e;c++)if(c%8===0)R(SX(c*CW),Y,3*z,H*.78,'#cbbfa6');
          if(nf>.3)R(X,Y,Wd,H,'rgba(255,220,150,.08)');}
        else R(X,Y,Wd,H,f<0?'#5b5751':'#77736a');
      }
      x=e;}
  }
  for(const u of G.S.units){
    if(u.f+u.h-1<fLo||u.f>fHi)continue;
    const X=SX(u.x*CW),Y=SY(-(u.f+u.h)*FH),Wd=u.w*CW*z,Hd=u.h*FH*z;if(X+Wd<0||X>V.VW)continue;
    drawUnit(u,X,Y,Wd,Hd,z,nf>.5);
    if(G.sel===u.id){V.ctx.strokeStyle='#ffb23f';V.ctx.lineWidth=2;V.ctx.strokeRect(X+1,Y+1,Wd-2,Hd-2);}
  }
  // slab beams + floor labels
  V.ctx.font=`${Math.max(9,10*Math.min(z,1.2))}px "Share Tech Mono",monospace`;V.ctx.textAlign='right';
  for(let f=fLo;f<=fHi;f++){
    const s=G.S.slab[fi(f)],yb=SY(-f*FH);
    for(let x=0;x<W;){if(!s[x]){x++;continue;}let e=x;while(e<W&&s[e])e++;R(SX(x*CW),yb-2.2*z,(e-x)*CW*z,2.2*z,'#433f39');x=e;}
    if(G.hasSlab[fi(f)]&&z>=.45){V.ctx.fillStyle=nf>.5?'#c8c0b0':'#2c2a26';V.ctx.fillText(fname(f),SX(0)-6,yb-FH*z*.3);}
  }
  V.ctx.textAlign='left';
  drawCars(z);
  drawAgents(z);
  drawFloats(z);
  drawGhost(z);
}
