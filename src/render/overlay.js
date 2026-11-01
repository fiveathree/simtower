// 幽靈預覽、評價視圖、浮動文字
import {TYPES,CW,FH,fmt} from '../config.js';
import {G,V,R,SX,SY} from '../state.js';
import {checkPlace,costOf} from '../build.js';

export function evalTint(u,X,Y,Wd,Hd){
  const t=u.type;
  if(G.evalView&&['office','condo','shop','hotel'].includes(t)&&(u.occ||u.unreach)){
    const s=u.unreach?0:u.sat;R(X,Y,Wd,Hd,s>=60?'rgba(60,200,110,.45)':s>=30?'rgba(240,200,60,.5)':'rgba(230,60,50,.55)');
  }
}
export function drawFloats(z){
  V.ctx.font=`700 ${Math.max(10,11*Math.min(z,1.4))}px "Share Tech Mono",monospace`;V.ctx.textAlign='center';
  for(const f of G.floats){V.ctx.globalAlpha=Math.max(0,1-f.t/12);V.ctx.fillStyle=f.col;V.ctx.fillText(f.txt,SX(f.x*CW),SY(-f.f*FH)-f.t*1.6*z);}
  V.ctx.globalAlpha=1;V.ctx.textAlign='left';
}
export function drawGhost(z){
  const d=TYPES[G.tool];if(!G.hover&&!(G.drag&&G.drag.mode==='elev'))return;
  if(d.tool){if(G.tool==='bulldoze'&&G.hover){R(SX(G.hover.cell*CW),SY(-(G.hover.f+1)*FH),CW*z,FH*z,'rgba(255,107,93,.45)');}return;}
  let f,x,h,err;
  if(G.drag&&G.drag.mode==='elev'){f=Math.min(G.drag.f0,G.drag.f1);h=Math.abs(G.drag.f1-G.drag.f0)+1;x=G.drag.x;err=h<2?'至少跨兩層':h>d.maxH?`最多跨 ${d.maxH} 層`:checkPlace(G.tool,f,x,h);}
  else if(d.paint){f=G.hover.f;x=G.hover.cell;h=1;err=null;}
  else{f=G.hover.f;x=G.hover.cell-Math.floor(d.w/2);h=d.h||1;err=checkPlace(G.tool,f,x,h);}
  const X=SX(x*CW),Y=SY(-(f+h)*FH),Wd=(d.w||1)*CW*z,Hd=h*FH*z;
  R(X,Y,Wd,Hd,err?'rgba(255,90,80,.38)':'rgba(120,230,150,.38)');V.ctx.strokeStyle=err?'#ff6b5d':'#62d38f';V.ctx.lineWidth=1.5;V.ctx.strokeRect(X,Y,Wd,Hd);
  V.ctx.font=`700 12px "Noto Sans TC",sans-serif`;const txt=err||fmt(d.lift?costOf(G.tool,Math.max(2,h)):d.cost)+(d.paint?' / 格':'');
  const tw=V.ctx.measureText(txt).width;R(X,Y-18,tw+10,16,'rgba(10,12,16,.85)');V.ctx.fillStyle=err?'#ff8a7a':'#ffd27a';V.ctx.fillText(txt,X+5,Y-6);
}
