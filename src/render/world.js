// 天空、城市背景、地面、樓面、單位
import {W,CW,FH,MINF,MAXF,SITE,fi,fname} from '../config.js';
import {G,V,R,cam,SX,SY} from '../state.js';
import {drawUnit} from './units.js';
import {drawCars,drawAgents} from './people.js';
import {drawEventFx,drawFloats,drawGhost} from './overlay.js';

export function resize(){const r=V.cvs.parentElement.getBoundingClientRect();V.DPR=Math.min(2,window.devicePixelRatio||1);V.VW=r.width;V.VH=r.height;V.cvs.width=Math.round(V.VW*V.DPR);V.cvs.height=Math.round(V.VH*V.DPR);}
const BASE_SKY=[[0,'#070b1e','#18204a'],[5,'#0d1433','#2e2d5c'],[6.3,'#e98b5f','#6f86c4'],[7.6,'#86bde9','#d4e8f6'],[16.5,'#7ab2e3','#cfe3f2'],[18,'#ee8150','#56669f'],[19.3,'#151d48','#352d5c'],[24,'#070b1e','#18204a']];
let SKY=BASE_SKY;
const hx=c=>[1,3,5].map(i=>parseInt(c.slice(i,i+2),16));
const lerpC=(a,b,t)=>{const A=hx(a),B=hx(b);return`rgb(${A.map((v,i)=>Math.round(v+(B[i]-v)*t)).join(',')})`;};
function skyAt(h){for(let i=0;i<SKY.length-1;i++){const[a,t1,b1]=SKY[i],[b,t2,b2]=SKY[i+1];if(h>=a&&h<=b){const t=(h-a)/(b-a);return[lerpC(t1,t2,t),lerpC(b1,b2,t)];}}return[SKY[0][1],SKY[0][2]];}
const nightF=h=>h<5?1:h<6.5?1-(h-5)/1.5:h<18?0:h<19.5?(h-18)/1.5:1;
let seed=11;const sr=()=>(seed=(seed*16807)%2147483647)/2147483647;
const STARS=Array.from({length:90},()=>[sr(),sr(),sr()<.2?2:1]);
let CITY=[];
const mix=(c,t,k)=>{const A=hx(c),B=hx(t);return'#'+A.map((v,i)=>Math.round(v+(B[i]-v)*k).toString(16).padStart(2,'0')).join('');};
// 轉地點時重新砌城市：高度、闊度、天色同地標都跟 SITE
export function buildCity(){
  seed=SITE.seed;CITY=[];
  SKY=BASE_SKY.map(([h,a,b])=>[h,mix(a,SITE.tint,SITE.mix),mix(b,SITE.tint,SITE.mix)]);
  for(let x=-900;x<W*CW+900;){const w=SITE.wMin+sr()*SITE.wVar,h=40+sr()*SITE.hMax;if(x<-20||x>W*CW+20)CITY.push({x,w,h,win:Array.from({length:Math.floor(h/14)},()=>sr())});x+=w+4+sr()*14;}
}
function drawLand(gy,z,nf){
  const c=lerpC(SITE.city,'#141a30',Math.min(1,nf+.1));V.ctx.fillStyle=c;
  if(SITE.land==='hill'){ // 香港：山
    V.ctx.fillStyle=lerpC('#4f6b5e','#0f1a22',nf);V.ctx.beginPath();V.ctx.moveTo(SX(-900),gy);
    for(const[x,h]of[[-700,240],[-420,420],[-160,300],[200,520],[520,340],[860,560],[1180,330],[1500,430],[1700,200]])V.ctx.lineTo(SX(x),gy-h*z);
    V.ctx.lineTo(SX(1800),gy);V.ctx.fill();
  }else if(SITE.land==='tower'){ // 東京：鐵塔
    const x=SX(-180),h=430*z;V.ctx.fillStyle=lerpC('#d8583c','#3a1a22',nf);
    V.ctx.beginPath();V.ctx.moveTo(x-34*z,gy);V.ctx.lineTo(x-3*z,gy-h);V.ctx.lineTo(x+3*z,gy-h);V.ctx.lineTo(x+34*z,gy);V.ctx.fill();
  }else if(SITE.land==='crane'){ // 高雄：港口吊臂
    for(const x0 of[-620,-340,W*CW+240,W*CW+520]){const x=SX(x0);R(x,gy-130*z,8*z,130*z,c);R(x-46*z,gy-130*z,100*z,7*z,c);R(x+36*z,gy-124*z,4*z,50*z,c);}
  }
}

export function render(){
  const z=cam.z;V.ctx.setTransform(V.DPR,0,0,V.DPR,0,0);
  const hr=(G.S.t%1440)/60,sky=skyAt(hr),nf=nightF(hr);
  const g=V.ctx.createLinearGradient(0,0,0,V.VH);g.addColorStop(0,sky[0]);g.addColorStop(1,sky[1]);V.ctx.fillStyle=g;V.ctx.fillRect(0,0,V.VW,V.VH);
  if(nf>0){V.ctx.fillStyle=`rgba(255,255,255,${.75*nf})`;for(const s of STARS)V.ctx.fillRect(s[0]*V.VW,s[1]*V.VH*.75,s[2],s[2]);}
  const gy=SY(0);
  if(SITE.land)drawLand(gy,z,nf);
  // skyline
  V.ctx.fillStyle=lerpC(SITE.city,'#141a30',nf);
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
  drawEventFx(z);
  drawFloats(z);
  drawGhost(z);
}
