// 天空、城市背景、地面、樓面、單位
import {W,CW,FH,MINF,MAXF,SITE,fi,fname} from '../config.js';
import {G,V,R,cam,SX,SY} from '../state.js';
import {drawUnit} from './units.js';
import {isTransport} from '../build.js';
import {drawCars,drawAgents} from './people.js';
import {drawEventFx,drawFloats,drawGhost} from './overlay.js';
import {sprite,lobbyTile,lobbyDoor,reception,shell,car} from './art.js';

export function resize(){const r=V.cvs.parentElement.getBoundingClientRect();V.DPR=Math.min(2,window.devicePixelRatio||1);V.VW=r.width;V.VH=r.height;V.cvs.width=Math.round(V.VW*V.DPR);V.cvs.height=Math.round(V.VH*V.DPR);}
const BASE_SKY=[[0,'#070b1e','#18204a'],[5,'#0d1433','#2e2d5c'],[6.3,'#e98b5f','#6f86c4'],[7.6,'#86bde9','#d4e8f6'],[16.5,'#7ab2e3','#cfe3f2'],[18,'#ee8150','#56669f'],[19.3,'#151d48','#352d5c'],[24,'#070b1e','#18204a']];
let SKY=BASE_SKY;
const hx=c=>[1,3,5].map(i=>parseInt(c.slice(i,i+2),16));
const lerpC=(a,b,t)=>{const A=hx(a),B=hx(b);return`rgb(${A.map((v,i)=>Math.round(v+(B[i]-v)*t)).join(',')})`;};
function skyAt(h){for(let i=0;i<SKY.length-1;i++){const[a,t1,b1]=SKY[i],[b,t2,b2]=SKY[i+1];if(h>=a&&h<=b){const t=(h-a)/(b-a);return[lerpC(t1,t2,t),lerpC(b1,b2,t)];}}return[SKY[0][1],SKY[0][2]];}
const nightF=h=>h<5?1:h<6.5?1-(h-5)/1.5:h<18?0:h<19.5?(h-18)/1.5:1;
let seed=11;const sr=()=>(seed=(seed*16807)%2147483647)/2147483647;
const STARS=Array.from({length:90},()=>[sr(),sr(),sr()<.2?2:1]);
const CLOUDS=Array.from({length:7},()=>[sr(),sr()*.42+.04,.6+sr()*.9,sr()]);
const mix=(c,t,k)=>{const A=hx(c),B=hx(t);return'#'+A.map((v,i)=>Math.round(v+(B[i]-v)*k).toString(16).padStart(2,'0')).join('');};
const OUT=900,LH=560; // 城市圖向外延伸同高度
let layers=null,ground=null,decor=[];

// 一層城市：day/night 各一張，near 喺地盤外，far 喺後面成排
function skyline(near,night){
  const c=document.createElement('canvas');c.width=W*CW+OUT*2;c.height=LH;const g=c.getContext('2d');
  const st=seed;
  const base=night?(near?'#141a30':'#1a2040'):(near?mix(SITE.city,'#c8d6e6',.25):mix(SITE.city,mix(SITE.tint,'#d4e8f6',.6),.74));
  for(let x=0;x<c.width;){
    const w=SITE.wMin+sr()*SITE.wVar,h=(near?30:60)+sr()*SITE.hMax*(near?.55:.75),r=sr();
    const wx=x-OUT;
    if(!near||wx<-20||wx>W*CW+20){
      const y=LH-h;g.fillStyle=base;g.fillRect(x,y,w,h);
      if(r<.3){g.fillRect(x+w*.2,y-14,w*.6,14);g.fillRect(x+w*.5-1,y-34,2,20);}
      else if(r<.5){g.fillRect(x+w*.3,y-10,w*.14,10);g.fillRect(x+w*.6,y-7,w*.2,7);}
      else if(r<.65){g.beginPath();g.moveTo(x,y);g.lineTo(x+w/2,y-16);g.lineTo(x+w,y);g.fill();}
      g.fillStyle=night?'rgba(0,0,0,0)':'rgba(255,255,255,.1)';if(!night)g.fillRect(x,y,w*.16,h);
      g.fillStyle=night?'rgba(0,0,0,0)':'rgba(0,0,0,.08)';if(!night)g.fillRect(x+w*.8,y,w*.2,h);
      for(let yy=y+7;yy<LH-8;yy+=near?11:9)for(let xx=x+4;xx<x+w-5;xx+=near?8:7){
        const k=sr();
        if(night){if(k>.56){g.fillStyle=k>.9?'#ffe9b0':k>.75?'#ffc978':'#e6a95a';g.globalAlpha=near?.9:.55;g.fillRect(xx,yy,near?4:3,near?5:4);g.globalAlpha=1;}}
        else{g.fillStyle=k>.8?'rgba(255,255,255,.16)':near?'rgba(20,30,50,.14)':'rgba(20,30,50,.06)';g.fillRect(xx,yy,near?4:3,near?5:4);}
      }
    }
    x+=w+(near?4:1)+sr()*(near?14:7);
  }
  seed=st;
  return c;
}
function landmark(night){
  const c=document.createElement('canvas');c.width=W*CW+OUT*2;c.height=LH;const g=c.getContext('2d');
  const hill=night?'#0f1a22':'#55786a',steel=night?'#3a1a22':'#d8583c',crane=night?'#141a30':'#c9673c';
  const X=x=>x+OUT;
  if(SITE.land==='hill'){
    for(const[col,pts]of[[night?'#0c141c':'#7a9a8c',[[-900,240],[-560,420],[-200,300],[260,540],[640,360],[1000,520],[1500,340]]],[hill,[[-900,150],[-420,300],[-60,190],[420,380],[820,230],[1200,340],[1500,180]]]]){
      g.fillStyle=col;g.beginPath();g.moveTo(0,LH);for(const[x,h]of pts)g.lineTo(X(x),LH-h);g.lineTo(c.width,LH);g.fill();
    }
  }else if(SITE.land==='tower'){ // 東京：紅色鐵塔
    const x=X(-230);g.strokeStyle=steel;g.lineWidth=2.4;g.fillStyle=steel;
    g.beginPath();g.moveTo(x-46,LH);g.quadraticCurveTo(x-8,LH-200,x-2,LH-470);g.lineTo(x+2,LH-470);g.quadraticCurveTo(x+8,LH-200,x+46,LH);g.closePath();g.stroke();
    for(let i=1;i<14;i++){const y=LH-i*30,w=46*(1-i/14)**1.6;g.beginPath();g.moveTo(x-w,y);g.lineTo(x+w,y-15);g.moveTo(x+w,y);g.lineTo(x-w,y-15);g.stroke();}
    g.fillRect(x-26,LH-150,52,7);g.fillRect(x-13,LH-300,26,7);g.fillRect(x-1,LH-510,2,50);
  }else if(SITE.land==='crane'){ // 高雄：港口吊臂
    for(const x0 of[-640,-360,W*CW+240,W*CW+540]){const x=X(x0);g.fillStyle=crane;g.fillRect(x,LH-170,8,170);g.fillRect(x+34,LH-170,8,170);g.fillRect(x-60,LH-176,170,8);g.fillRect(x+12,LH-205,18,30);g.fillRect(x-40,LH-168,3,60);g.fillRect(x-48,LH-110,20,14);}
  }
  return c;
}
function paintGround(){
  const c=document.createElement('canvas');c.width=W*CW+OUT*2;c.height=(-MINF+3)*FH;const g=c.getContext('2d');
  const l=g.createLinearGradient(0,0,0,c.height);l.addColorStop(0,'#6b5137');l.addColorStop(.35,'#54402c');l.addColorStop(1,'#2c2117');g.fillStyle=l;g.fillRect(0,0,c.width,c.height);
  const st=seed;
  for(let i=0;i<4;i++){g.fillStyle=`rgba(0,0,0,${.05+i*.02})`;let y=26+i*44;g.beginPath();g.moveTo(0,y);for(let x=0;x<=c.width;x+=60)g.lineTo(x,y+Math.sin(x/90+i)*5);g.lineTo(c.width,y+14);g.lineTo(0,y+14);g.fill();}
  for(let i=0;i<520;i++){const x=sr()*c.width,y=10+sr()*(c.height-10),r=.8+sr()*2.4;g.fillStyle=sr()>.5?'rgba(190,170,140,.22)':'rgba(30,20,12,.3)';g.beginPath();g.ellipse(x,y,r*1.3,r,0,0,7);g.fill();}
  seed=st;
  g.fillStyle='#8c8a86';g.fillRect(0,0,c.width,5);g.fillStyle='#b4b2ad';g.fillRect(0,0,c.width,1.4);
  for(let x=0;x<c.width;x+=22){g.fillStyle='rgba(0,0,0,.2)';g.fillRect(x,0,.8,5);}
  return c;
}
// 地盤兩邊嘅樹同街燈
function tree(g,w,h){
  g.fillStyle='#6a4a32';g.fillRect(w/2-1.4,h-20,2.8,20);
  for(const[x,y,r,c]of[[.5,.32,.3,'#3f8150'],[.3,.45,.22,'#4e9a5c'],[.7,.47,.23,'#4e9a5c'],[.5,.2,.2,'#5eab6a']]){g.fillStyle=c;g.beginPath();g.arc(w*x,h*y,w*r,0,7);g.fill();}
}
function street(g,w,h,on){
  g.fillStyle='#3d434b';g.fillRect(w/2-.7,6,1.4,h-6);g.fillRect(w/2,5,9,1.2);g.fillStyle=on?'#ffe39c':'#c8ccd0';g.fillRect(w/2+6,6.2,4.4,1.3);
  if(on){const r=g.createRadialGradient(w/2+8,8,0,w/2+8,8,16);r.addColorStop(0,'rgba(255,225,150,.5)');r.addColorStop(1,'rgba(255,225,150,0)');g.fillStyle=r;g.fillRect(0,0,w,34);}
}
export function buildCity(){
  seed=SITE.seed;
  SKY=BASE_SKY.map(([h,a,b])=>[h,mix(a,SITE.tint,SITE.mix),mix(b,SITE.tint,SITE.mix)]);
  layers={far:[skyline(false,false),skyline(false,true)],near:[skyline(true,false),skyline(true,true)],land:SITE.land?[landmark(false),landmark(true)]:null};
  ground=paintGround();
  decor=[];for(const[a,b]of[[-260,-20],[W*CW+20,W*CW+260]])for(let x=a;x<b;x+=44)decor.push([x,(decor.length%3===1)?'lamp':'tree']);
}
function layer(pair,par,gy,z0,nf,k=1){
  const z=z0*k,x=SX(-OUT)+(cam.x-W*CW/2)*z0*par-(pair[0].width*(z-z0))/2,h=LH*z,c=V.ctx;
  const sx=Math.max(0,-x/z),sw=Math.min(pair[0].width-sx,V.VW/z+1),dx=x+sx*z;if(sw<=0||gy-h>V.VH)return;
  if(nf<1)c.drawImage(pair[0],sx,0,sw,LH,dx,gy-h,sw*z,h);
  if(nf>0){c.globalAlpha=nf;c.drawImage(pair[1],sx,0,sw,LH,dx,gy-h,sw*z,h);c.globalAlpha=1;}
}
function drawSky(hr,nf){
  const c=V.ctx;
  if(hr>5.5&&hr<19){
    const a=(hr-5.5)/13.5,x=V.VW*(.08+.84*a),y=V.VH*(.78-.68*Math.sin(Math.PI*a)),warm=1-Math.sin(Math.PI*a),r=26+warm*14;
    const col=warm>.5?'255,170,100':'255,240,200',gl=c.createRadialGradient(x,y,0,x,y,r*5);
    gl.addColorStop(0,`rgba(${col},.6)`);gl.addColorStop(.25,`rgba(${col},.2)`);gl.addColorStop(1,`rgba(${col},0)`);c.fillStyle=gl;c.fillRect(x-r*5,y-r*5,r*10,r*10);
    c.fillStyle=warm>.5?'#ffd2a0':'#fff6dc';c.beginPath();c.arc(x,y,r*.6,0,7);c.fill();
  }
  if(nf>.3){
    const a=((hr+5)%24)/10,x=V.VW*(.15+.7*a),y=V.VH*(.42-.3*Math.sin(Math.PI*Math.min(1,a)));c.globalAlpha=nf;
    c.fillStyle='#eef0e0';c.beginPath();c.arc(x,y,17,0,7);c.fill();c.fillStyle='rgba(180,185,190,.5)';c.beginPath();c.arc(x-5,y-4,3.4,0,7);c.arc(x+5,y+3,2.4,0,7);c.fill();c.globalAlpha=1;
  }
  if(nf>0){c.fillStyle=`rgba(255,255,255,${.75*nf})`;for(const s of STARS)c.fillRect(s[0]*V.VW,s[1]*V.VH*.75,s[2],s[2]);}
  const cl=sprite('cloud',150,50,(g,w,h)=>{g.fillStyle='#fff';for(const[x,y,r]of[[.25,.62,.2],[.42,.42,.27],[.62,.5,.24],[.78,.66,.16],[.5,.72,.3]]){g.beginPath();g.ellipse(w*x,h*y,w*r,h*r*1.5,0,0,7);g.fill();}});
  c.globalAlpha=(1-nf*.86)*.62;
  for(const[px,py,s,sp]of CLOUDS){const w=170*s,x=((px*1.3+G.S.t*.00016*(1+sp))%1.3-.15)*V.VW;c.drawImage(cl,x,py*V.VH,w,w/3);}
  c.globalAlpha=1;
}
function drawStreet(gy,z,nf){
  const c=V.ctx,tr=sprite('tree',34,50,tree),lp=[sprite('lampOff',28,50,(g,w,h)=>street(g,w,h,false)),sprite('lampOn',28,50,(g,w,h)=>street(g,w,h,true))][nf>.4?1:0];
  for(const[x,k]of decor){const s=k==='tree'?tr:lp,w=(k==='tree'?34:28)*z,h=50*z,sx=SX(x);if(sx+w<0||sx>V.VW)continue;c.drawImage(s,sx,gy-h,w,h);}
  // 街上行車，經過大廈背後
  const carS=i=>sprite('car'+i,22,8,(g,w,h)=>car(g,0,h,w,['#b8423a','#3f6fb0','#d9d9d9','#e2b23f'][i]));
  const span=W*CW+1400;
  for(let i=0;i<4;i++){const d=i%2?1:-1,p=((G.S.t*(26+i*6)*d+i*377)%span+span)%span,x=SX(p-700);if(x<-40||x>V.VW+40)continue;c.drawImage(carS(i),x,gy-8.6*z,22*z,8*z);
    if(nf>.3)R(x+(d>0?20:-4)*z,gy-4.6*z,6*z,1.6*z,'rgba(255,235,170,.6)');}
}
function drawFloorRow(f,s,Y,H,z,nf){
  const c=V.ctx,sky=f>0;
  for(let x=0;x<W;){
    const v=s[x];if(!v){x++;continue;}
    let e=x;while(e<W&&s[e]===v)e++;
    const X=SX(x*CW),Wd=(e-x)*CW*z;
    if(X+Wd>=0&&X<=V.VW){
      const tw=8*CW*z,tile=v===2?sprite(sky?'lobbySky':'lobby',8*CW,FH,(g,w,h)=>lobbyTile(g,w,h,sky)):sprite(f<0?'shellB':'shell',8*CW,FH,(g,w,h)=>shell(g,w,h,f<0));
      for(let t=x;t<e;t+=8){const tx=SX(t*CW),k=Math.min(1,(e-t)/8);if(tx+tw<0||tx>V.VW)continue;c.drawImage(tile,0,0,tile.width*k,tile.height,tx,Y,tw*k,H);}
      if(v===2&&(e-x)>=6){
        const d=sprite('lobbyDoor',20,FH,lobbyDoor),dw=20*z;
        if(f===0){c.drawImage(d,X,Y,dw,H);c.drawImage(d,X+Wd-dw,Y,dw,H);
          if(e-x>=24){const rw=52*z;c.drawImage(sprite('reception',52,FH,reception),X+Wd*.32-rw/2,Y,rw,H);}}
        if(nf>.3)R(X,Y,Wd,H,'rgba(255,214,140,.1)');
      }
      if(v!==2&&nf>0)R(X,Y,Wd,H,`rgba(10,14,34,${.6*nf})`);
    }
    x=e;
  }
}
// 背景合成一張：鏡頭郁或者過咗 15 遊戲分鐘先重畫
let bg=null,bgKey='';
function paintBg(z,hr,nf,gy){
  const c=V.ctx,sky=skyAt(hr),g=c.createLinearGradient(0,0,0,V.VH);g.addColorStop(0,sky[0]);g.addColorStop(1,sky[1]);c.fillStyle=g;c.fillRect(0,0,V.VW,V.VH);
  drawSky(hr,nf);
  layer(layers.far,.35,gy,z,nf,.72);
  if(layers.land)layer(layers.land,.2,gy,z,nf);
  layer(layers.near,.12,gy,z,nf,.85);
  if(gy<V.VH){
    const sx=Math.max(0,-SX(-OUT)/z),sw=Math.min(ground.width-sx,V.VW/z+1);c.drawImage(ground,sx,0,sw,ground.height,SX(-OUT)+sx*z,gy,sw*z,ground.height*z);
    const bot=gy+ground.height*z;if(bot<V.VH)R(0,bot,V.VW,V.VH-bot,'#2c2117');
    if(nf>0)R(0,gy,V.VW,V.VH-gy,`rgba(8,10,26,${.55*nf})`);
  }
}
export function render(){
  const z=cam.z,c=V.ctx;c.setTransform(V.DPR,0,0,V.DPR,0,0);c.imageSmoothingQuality='low';
  const hr=(G.S.t%1440)/60,nf=nightF(hr),gy=SY(0);
  if(!layers)buildCity();
  const key=[Math.floor(G.S.t/15),cam.x,cam.y,z,V.cvs.width,V.cvs.height,SITE.id].join();
  if(key!==bgKey){
    if(!bg)bg=document.createElement('canvas');
    if(bg.width!==V.cvs.width||bg.height!==V.cvs.height){bg.width=V.cvs.width;bg.height=V.cvs.height;}
    const bc=bg.getContext('2d');bc.setTransform(V.DPR,0,0,V.DPR,0,0);bc.imageSmoothingQuality='low';
    V.ctx=bc;paintBg(z,hr,nf,gy);V.ctx=c;bgKey=key;
  }
  c.drawImage(bg,0,0,V.VW,V.VH);
  drawStreet(gy,z,nf);
  // 地盤界：未起嘢時有圍板
  const lotL=SX(0),lotR=SX(W*CW);
  R(lotL-1.5*z,gy-16*z,3*z,16*z,'#e8b23a');R(lotR-1.5*z,gy-16*z,3*z,16*z,'#e8b23a');
  if(!G.S.units.length&&!G.lobbyCells.length)for(let x=0;x<W;x+=4){R(SX(x*CW),gy-7*z,CW*2*z,1.6*z,x%8?'#e8b23a':'#2a2c30');}
  // visible floors
  const yMin=cam.y-V.VH/2/z,yMax=cam.y+V.VH/2/z;
  const fLo=Math.max(MINF,Math.floor(-yMax/FH)-1),fHi=Math.min(MAXF,Math.ceil(-yMin/FH));
  for(let f=fLo;f<=fHi;f++)drawFloorRow(f,G.S.slab[fi(f)],SY(-(f+1)*FH),FH*z,z,nf);
  for(const front of [false,true])for(const u of G.S.units){ // 電梯樓梯畫喺單位上面
    if(isTransport(u.type)!==front)continue;
    if(u.f+u.h-1<fLo||u.f>fHi)continue;
    const X=SX(u.x*CW),Y=SY(-(u.f+u.h)*FH),Wd=u.w*CW*z,Hd=u.h*FH*z;if(X+Wd<0||X>V.VW)continue;
    drawUnit(u,X,Y,Wd,Hd,z,nf>.5);
    if(G.sel===u.id){c.strokeStyle='#ffb23f';c.lineWidth=2;c.strokeRect(X+1,Y+1,Wd-2,Hd-2);}
  }
  // 樓板、外牆邊、天台邊、樓層牌
  c.font=`${Math.max(9,10*Math.min(z,1.2))}px "Share Tech Mono",monospace`;c.textAlign='right';
  for(let f=fLo;f<=fHi;f++){
    const s=G.S.slab[fi(f)],up=f<MAXF?G.S.slab[fi(f+1)]:null,yb=SY(-f*FH);
    for(let x=0;x<W;){
      if(!s[x]){x++;continue;}
      let e=x;while(e<W&&s[e])e++;
      R(SX(x*CW),yb-2.4*z,(e-x)*CW*z,2.4*z,f<0?'#2e2b27':'#3f3b35');R(SX(x*CW),yb-2.4*z,(e-x)*CW*z,.6*z,f<0?'#4a4640':'#6a655c');
      if(f>=0){R(SX(x*CW)-1.6*z,yb-FH*z,1.6*z,FH*z,'#55504a');R(SX(e*CW),yb-FH*z,1.6*z,FH*z,'#3c3833');}
      x=e;
    }
    if(f>=0)for(let x=0;x<W;){if(!s[x]||(up&&up[x])){x++;continue;}let e=x;while(e<W&&s[e]&&!(up&&up[e]))e++;R(SX(x*CW)-1.6*z,yb-FH*z-2*z,(e-x)*CW*z+3.2*z,2*z,'#a5a097');R(SX(x*CW)-1.6*z,yb-FH*z-2.6*z,(e-x)*CW*z+3.2*z,.8*z,'#d6d1c6');x=e;}
    if(G.hasSlab[fi(f)]&&z>=.45){c.fillStyle=nf>.5?'#d6d0c2':'#262420';c.fillText(fname(f),SX(0)-8,yb-FH*z*.3);}
  }
  c.textAlign='left';
  drawCars(z);
  drawAgents(z);
  drawEventFx(z);
  drawFloats(z);
  drawGhost(z);
}
