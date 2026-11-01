// 每種設施嘅畫法
import {TYPES,FH} from '../config.js';
import {G,V,R} from '../state.js';
import {person} from './people.js';
import {evalTint} from './overlay.js';

export function drawUnit(u,X,Y,Wd,Hd,z,night){
  const fh=FH*z,t=u.type,flY=Y+Hd;
  const label=(txt,col)=>{if(z<.7)return;V.ctx.fillStyle=col;V.ctx.font=`700 ${Math.max(9,9*z)}px "Noto Sans TC",sans-serif`;V.ctx.textAlign='center';V.ctx.fillText(txt,X+Wd/2,Y+Hd*.55);V.ctx.textAlign='left';};
  const people=(n,col)=>{const m=Math.min(n,12);for(let i=0;i<m;i++){const px=X+(i+.7)*Wd/(m+.6);person(px,flY-2*z,z*.9,col||'#2b2b33');}};
  switch(t){
   case 'office':{
     R(X,Y,Wd,Hd,'#dde6ea');R(X,Y+2*z,Wd,fh*.32,'#c3d3db');
     for(let i=0;i<3;i++){const dx=X+(i+.18)*Wd/3;R(dx,flY-fh*.32,Wd/3*.62,3*z,'#8a6d4c');R(dx+Wd/3*.18,flY-fh*.32-6*z,5*z,5*z,'#33414d');R(dx+2*z,flY-fh*.32+3*z,2*z,fh*.32-5*z,'#7a5d3c');}
     if(u.occ)people(u.present);
     if(!u.occ){R(X,Y,Wd,Hd,'rgba(18,22,28,.6)');label('招租','#ffd27a');}
     else if(night&&!u.present)R(X,Y,Wd,Hd,'rgba(8,12,28,.35)');
     break;}
   case 'condo':{
     R(X,Y,Wd,Hd,'#f3e4cc');for(let i=0;i<Wd;i+=6*z)R(X+i,Y,2*z,Hd,'#ead5b2');
     R(X+Wd*.08,flY-9*z,Wd*.3,7*z,'#b5523b');R(X+Wd*.08,flY-12*z,4*z,5*z,'#b5523b');
     R(X+Wd*.55,flY-7*z,Wd*.3,5*z,'#fdfbf6');R(X+Wd*.55,flY-9*z,6*z,3*z,'#7aa0c8');
     R(X+Wd*.45,Y+4*z,3*z,4*z,'#ffd36b');
     if(u.occ)people(u.present,'#3a2a2a');
     if(!u.occ){R(X,Y,Wd,Hd,'rgba(18,22,28,.6)');label('待售','#ffd27a');}
     else if(night&&u.present)R(X,Y,Wd,Hd,'rgba(255,200,90,.12)');
     break;}
   case 'hotel':case 'suite':{
     R(X,Y,Wd,Hd,u.occ?'#efe4f4':'#a69fae');
     R(X+Wd*.15,flY-7*z,Wd*.7,5*z,'#fff');R(X+Wd*.15,flY-9*z,5*z,3*z,'#d8cbe6');R(X+Wd*.15,flY-6*z,Wd*.7,2*z,'#8d6fb3');
     if(u.occ&&u.present)people(u.present,'#3b2d4a');
     if(u.dirty){R(X,Y,Wd,Hd,'rgba(90,70,30,.55)');label('污糟','#ffd27a');}
     break;}
   case 'food':{
     R(X,Y,Wd,Hd,'#fbe7bd');
     for(let i=0;i<Wd;i+=6*z)R(X+i,Y,3*z,4*z,(i/(6*z))%2<1?'#d6402e':'#fff4e0');
     R(X+2*z,flY-10*z,Wd*.22,8*z,'#c0392b');
     for(let i=0;i<4;i++){const tx=X+Wd*(.35+i*.16);R(tx,flY-8*z,7*z,2*z,'#8a5a2b');R(tx+3*z,flY-6*z,1.2*z,6*z,'#8a5a2b');}
     people(u.present,'#3a2a20');if(u.unreach)label('無法到達','#c0392b');
     break;}
   case 'shop':{
     R(X,Y,Wd,Hd,'#dcf1e5');
     for(let i=0;i<3;i++){const sx=X+Wd*(.1+i*.3);R(sx,Y+5*z,Wd*.2,Hd-7*z,'#9bc7ae');for(let j=0;j<3;j++)R(sx+2*z,Y+(8+j*6)*z,Wd*.2-4*z,3*z,['#e05a6d','#4a90d9','#f1c232'][(i+j)%3]);}
     if(u.occ)people(u.present,'#24402f');
     if(!u.occ){R(X,Y,Wd,Hd,'rgba(18,22,28,.6)');label('招租','#ffd27a');}
     break;}
   case 'security':{
     R(X,Y,Wd,Hd,'#cfdaf0');R(X+Wd*.1,Y+5*z,Wd*.45,9*z,'#2b3a55');for(let i=0;i<4;i++)R(X+Wd*.12+i*Wd*.11,Y+7*z,Wd*.08,5*z,'#7fd0ff');
     R(X+Wd*.6,flY-8*z,Wd*.3,3*z,'#46567a');person(X+Wd*.75,flY-2*z,z*.9,'#1c2b4a');label('保安','#1c2b4a');
     break;}
   case 'stairs':{
     R(X,Y,Wd,Hd,'#cbbfa8');V.ctx.strokeStyle='#5a4e3c';V.ctx.lineWidth=Math.max(1,1.5*z);V.ctx.beginPath();
     const n=10;V.ctx.moveTo(X,flY);for(let i=0;i<n;i++){const sx=X+Wd*i/n,sy=flY-Hd*(i+1)/n+2*z;V.ctx.lineTo(sx,sy);V.ctx.lineTo(X+Wd*(i+1)/n,sy);}V.ctx.stroke();
     R(X+Wd*.5,Y+fh-2*z,Wd*.5,2*z,'#4a463f');
     break;}
   case 'housekeeping':{
     R(X,Y,Wd,Hd,'#d8ebe6');for(let i=0;i<4;i++){const cx=X+Wd*(.12+i*.22);R(cx,flY-9*z,Wd*.12,7*z,'#7fb5a8');R(cx,flY-11*z,Wd*.12,2*z,'#fff');}
     label('清潔','#2c5a50');break;}
   case 'conference':{
     R(X,Y,Wd,Hd,'#e6ecf6');R(X+Wd*.15,flY-8*z,Wd*.7,3*z,'#7a5d3c');R(X+Wd*.45,flY-5*z,2*z,5*z,'#7a5d3c');R(X+Wd*.04,Y+4*z,Wd*.08,10*z,'#fff');
     people(u.present,'#2b3346');break;}
   case 'cinema':{
     R(X,Y,Wd,Hd,'#3a1518');R(X+Wd*.15,Y+5*z,Wd*.7,Hd*.42,u.film?'#dfe6f2':'#3c3438');
     for(let r=0;r<3;r++)for(let i=0;i<12;i++)R(X+Wd*(.1+i*.067),flY-(5+r*5)*z,Wd*.04,3*z,'#8d2f38');
     people(u.present,'#120809');label(u.film?u.film.name:'未揀片',u.film?'#23272f':'#ffd27a');break;}
   case 'clinic':{
     R(X,Y,Wd,Hd,'#f6f7f8');R(X+Wd*.45,Y+6*z,Wd*.1,Hd-12*z,'#d83a3a');R(X+Wd*.5-Hd*.3,Y+Hd*.5-2*z,Hd*.6,4*z,'#d83a3a');break;}
   case 'billboard':{
     R(X+Wd*.2,Y+Hd*.6,3*z,Hd*.4,'#555');R(X+Wd*.75,Y+Hd*.6,3*z,Hd*.4,'#555');R(X,Y,Wd,Hd*.62,'#ffd27a');R(X,Y,Wd,3*z,'#d6402e');label('廣告位','#3a2a10');break;}
   case 'parking':{
     R(X,Y,Wd,Hd,'#54575d');for(let i=0;i<4;i++){const cx=X+Wd*(.06+i*.24);R(cx,flY-7*z,Wd*.18,5*z,['#b8423a','#3f6fb0','#d9d9d9','#3b9068'][i]);}
     if(!u.on){R(X,Y,Wd,Hd,'rgba(18,22,28,.6)');label('未連斜路','#ffd27a');}break;}
   case 'ramp':{
     R(X,Y,Wd,Hd,'#6b6558');V.ctx.fillStyle='#a59b86';V.ctx.beginPath();V.ctx.moveTo(X,Y+3*z);V.ctx.lineTo(X+Wd,flY);V.ctx.lineTo(X,flY);V.ctx.fill();break;}
   case 'recycle':{
     R(X,Y,Wd,Hd,'#3f5a42');for(let i=0;i<5;i++)R(X+Wd*(.06+i*.19),flY-11*z,Wd*.13,9*z,['#6db36d','#4f9de0','#e3b341','#6db36d','#c0c0c0'][i]);break;}
   case 'metro':{
     R(X,Y,Wd,Hd,'#c9d6e2');R(X,flY-5*z,Wd,5*z,'#3c4148');R(X+Wd*.1,flY-Hd*.42,Wd*.8,Hd*.34,'#4f9de0');
     for(let i=0;i<9;i++)R(X+Wd*(.13+i*.085),flY-Hd*.38,Wd*.05,Hd*.12,'#dff0fb');label('地鐵站','#1c2b4a');break;}
   case 'elevator':case 'express':case 'service':{
     R(X,Y,Wd,Hd,t==='express'?'#27333f':t==='service'?'#26332c':'#2f343a');R(X+Wd*.2,Y,1,Hd,'#55606b');R(X+Wd*.8,Y,1,Hd,'#55606b');
     V.ctx.strokeStyle='#7d8791';V.ctx.lineWidth=1;for(let i=0;i<u.h;i++){const f=u.f+u.h-1-i;if(t!=='express'||f===0||G.skyFloors.has(f))V.ctx.strokeRect(X+1.5,Y+i*fh+fh*.25,Wd-3,fh*.75-2);}
     break;}
   case 'cathedral':{
     R(X,Y,Wd,Hd,'#f6f1e6');
     const win=(cx,w,h,cols)=>{V.ctx.beginPath();V.ctx.moveTo(cx-w/2,flY-4*z);V.ctx.lineTo(cx-w/2,flY-h+w/2);V.ctx.quadraticCurveTo(cx-w/2,flY-h,cx,flY-h-w*.4);V.ctx.quadraticCurveTo(cx+w/2,flY-h,cx+w/2,flY-h+w/2);V.ctx.lineTo(cx+w/2,flY-4*z);V.ctx.closePath();
       const g=V.ctx.createLinearGradient(0,flY-h,0,flY);cols.forEach((c,i)=>g.addColorStop(i/(cols.length-1),c));V.ctx.fillStyle=g;V.ctx.fill();};
     win(X+Wd*.18,Wd*.1,Hd*.6,['#3f7fd6','#e0453b','#f2c94c']);win(X+Wd*.82,Wd*.1,Hd*.6,['#3f7fd6','#e0453b','#f2c94c']);
     win(X+Wd*.5,Wd*.16,Hd*.55,['#7b4fd6','#3f7fd6','#2fa36b']);
     V.ctx.beginPath();V.ctx.arc(X+Wd*.5,Y+Hd*.22,Math.min(Wd*.08,Hd*.14),0,7);V.ctx.fillStyle='#e0453b';V.ctx.fill();V.ctx.strokeStyle='#f2c94c';V.ctx.lineWidth=2*z;V.ctx.stroke();
     R(X+Wd*.3,flY-5*z,Wd*.4,3*z,'#b89a6a');
     break;}
  }
  V.ctx.fillStyle='rgba(0,0,0,.35)';V.ctx.fillRect(X,Y,Math.max(1,z*.8),Hd);V.ctx.fillRect(X+Wd-Math.max(1,z*.8),Y,Math.max(1,z*.8),Hd);
  evalTint(u,X,Y,Wd,Hd);
  if(z>=1.3&&!TYPES[t].lift&&t!=='stairs'){V.ctx.fillStyle='rgba(0,0,0,.45)';V.ctx.font=`${Math.min(11,7*z)}px "Noto Sans TC",sans-serif`;V.ctx.fillText(TYPES[t].name,X+3*z,Y+8*z);}
}
