// 貼設施圖，再疊上會變嘅嘢：小人、招租、夜晚燈光
import {TYPES,CW,FH,fname} from '../config.js';
import {G,V,R,SY} from '../state.js';
import {person} from './people.js';
import {evalTint} from './overlay.js';
import {ART,sprite,liftCell} from './art.js';

const VAR={office:3,condo:3,shop:3,parking:5};
function tag(txt,X,Y,Wd,Hd,z,col){
  if(z<.6)return;
  const c=V.ctx,fs=Math.max(9,Math.min(13,9*z));c.font=`700 ${fs}px "Noto Sans TC",sans-serif`;c.textAlign='center';
  const tw=c.measureText(txt).width+8*Math.min(z,1.2);
  c.fillStyle='rgba(14,17,20,.78)';c.beginPath();c.roundRect(X+Wd/2-tw/2,Y+Hd*.5-fs*.72,tw,fs*1.44,3);c.fill();
  c.fillStyle=col;c.textBaseline='middle';c.fillText(txt,X+Wd/2,Y+Hd*.5);c.textBaseline='alphabetic';c.textAlign='left';
}
function drawLift(u,X,Y,Wd,Hd,z){
  const t=u.type,fh=FH*z,c=V.ctx,small=fh<9;
  for(let f=u.f;f<u.f+u.h;f++){
    const y=SY(-(f+1)*FH);if(y+fh<0||y>V.VH)continue;
    const stop=t!=='express'||f===0||G.skyFloors.has(f);
    c.drawImage(sprite(`lift:${t}:${u.w}:${stop}`,u.w*CW,FH,(g,w,h)=>liftCell(g,w,h,t,stop)),X,y,Wd,fh);
    if(small)continue;
    c.fillStyle=stop?(t==='express'?'#a8d6ff':t==='service'?'#8ee8b3':'#ffc66b'):'#6a7480'; // 每格顯示自己係幾樓
    c.font=`700 ${Math.min(13,fh*.25)}px "Share Tech Mono",monospace`;c.textAlign='center';c.textBaseline='middle';
    c.fillText(fname(f),X+Wd/2,y+fh*(stop?.12:.5));c.textBaseline='alphabetic';c.textAlign='left';
  }
}
export function drawUnit(u,X,Y,Wd,Hd,z,night){
  const t=u.type,d=TYPES[t],flY=Y+Hd,c=V.ctx;
  if(d.lift){drawLift(u,X,Y,Wd,Hd,z);return;}
  const v=t==='cinema'?(u.film?1:0):VAR[t]?u.id%VAR[t]:0;
  c.drawImage(sprite(`${t}:${v}`,u.w*CW,u.h*FH,(g,w,h)=>ART[t](g,w,h,v)),X,Y,Wd,Hd);
  const people=(n,col)=>{const m=Math.min(n,12);for(let i=0;i<m;i++)person(X+(i+.7)*Wd/(m+.6),flY-3*z,z*.9,col,u.id+i,0);};
  const lit=u.occ||!d.pop;
  if(t==='billboard'){evalTint(u,X,Y,Wd,Hd);return;}
  switch(t){
    case 'office':if(u.occ)people(u.present,'#2b3444');break;
    case 'condo':if(u.occ)people(u.present,'#6a4438');break;
    case 'hotel':case 'suite':if(u.occ&&u.present)people(u.present,'#5a3f70');break;
    case 'food':people(u.present,'#7a4a30');break;
    case 'shop':if(u.occ)people(u.present,'#2f6a50');break;
    case 'conference':people(u.present,'#2b3346');break;
    case 'cinema':if(u.present)people(Math.min(12,u.present),'#1a0c0e');break;
    case 'security':person(X+Wd*.3,flY-3*z,z*.9,'#1c2b4a',u.id,0);break;
  }
  if(night&&t!=='metro'&&t!=='parking'&&t!=='ramp'&&t!=='recycle'&&t!=='cinema'&&t!=='cathedral'){
    if(!lit||(u.present===0&&t!=='clinic'))R(X,Y,Wd,Hd,'rgba(10,14,34,.5)');
    else R(X,Y,Wd,Hd,'rgba(255,190,90,.1)');
  }
  if((t==='office'||t==='shop')&&!u.occ){R(X,Y,Wd,Hd,'rgba(16,20,28,.62)');tag('招租',X,Y,Wd,Hd,z,'#ffd27a');}
  if(t==='condo'&&!u.occ){R(X,Y,Wd,Hd,'rgba(16,20,28,.62)');tag('待售',X,Y,Wd,Hd,z,'#ffd27a');}
  if(d.night&&!u.occ&&!u.dirty)R(X,Y,Wd,Hd,'rgba(16,20,28,.4)');
  if(u.dirty){R(X,Y,Wd,Hd,'rgba(90,70,30,.55)');tag('污糟',X,Y,Wd,Hd,z,'#ffd27a');}
  if(t==='parking'&&!u.on){R(X,Y,Wd,Hd,'rgba(16,20,28,.62)');tag('未連斜路',X,Y,Wd,Hd,z,'#ffd27a');}
  if(t==='cinema')tag(u.film?u.film.name:'未揀片',X,Y+Hd*.08,Wd,Hd*.3,z,u.film?'#ffe9b0':'#ffd27a');
  if(u.unreach)tag('無法到達',X,Y,Wd,Hd,z,'#ff8a7a');
  evalTint(u,X,Y,Wd,Hd);
  if(z>=1.3&&t!=='stairs'&&t!=='ramp'){c.fillStyle='rgba(0,0,0,.5)';c.font=`${Math.min(10,6*z)}px "Noto Sans TC",sans-serif`;c.fillText(d.name,X+3*z,Y+9*z);}
}
