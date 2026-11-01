// 設施美術：全部用程式畫，第一次用時畫落離屏畫布，之後直接貼圖
const S=2,cache=new Map();
export function sprite(key,w,h,paint){
  let c=cache.get(key);if(c)return c;
  c=document.createElement('canvas');c.width=Math.ceil(w*S);c.height=Math.ceil(h*S);
  const g=c.getContext('2d');g.scale(S,S);paint(g,w,h);cache.set(key,c);return c;
}
const rect=(g,x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x,y,w,h);};
const vgrad=(g,y0,y1,...cols)=>{const l=g.createLinearGradient(0,y0,0,y1);cols.forEach((c,i)=>l.addColorStop(i/(cols.length-1),c));return l;};
const hgrad=(g,x0,x1,...cols)=>{const l=g.createLinearGradient(x0,0,x1,0);cols.forEach((c,i)=>l.addColorStop(i/(cols.length-1),c));return l;};
const round=(g,x,y,w,h,r,c)=>{g.fillStyle=c;g.beginPath();g.roundRect(x,y,w,h,r);g.fill();};
const oval=(g,x,y,rx,ry,c)=>{g.fillStyle=c;g.beginPath();g.ellipse(x,y,rx,ry,0,0,7);g.fill();};

// 房間底：牆、踢腳線、地板
function room(g,w,h,top,bot,fl,flHi){
  g.fillStyle=vgrad(g,0,h,top,bot);g.fillRect(0,0,w,h);
  rect(g,0,h-5,w,1.4,'rgba(0,0,0,.14)');
  g.fillStyle=vgrad(g,h-3.6,h,flHi,fl);g.fillRect(0,h-3.6,w,3.6);
}
// 邊位陰影令房間有深度
function ao(g,w,h){
  g.fillStyle=vgrad(g,0,7,'rgba(0,0,0,.28)','rgba(0,0,0,0)');g.fillRect(0,0,w,7);
  g.fillStyle=hgrad(g,0,5,'rgba(0,0,0,.2)','rgba(0,0,0,0)');g.fillRect(0,0,5,h);
  g.fillStyle=hgrad(g,w-5,w,'rgba(0,0,0,0)','rgba(0,0,0,.2)');g.fillRect(w-5,0,5,h);
}
function lamp(g,x,c='rgba(255,236,190,.34)'){
  rect(g,x-3,1.4,6,1,'#f8f4e6');
  const r=g.createRadialGradient(x,2,0,x,2,13);r.addColorStop(0,c);r.addColorStop(1,'rgba(255,236,190,0)');
  g.fillStyle=r;g.fillRect(x-14,0,28,17);
}
function plant(g,x,fy,c='#4e9a5c'){
  rect(g,x-1.6,fy-3,3.2,3,'#a9673f');rect(g,x-2,fy-3.4,4,.9,'#c07d4f');
  oval(g,x,fy-6,3,3.2,'#3a7d4a');oval(g,x-1.5,fy-7,1.9,2.3,c);oval(g,x+1.6,fy-5.8,1.8,2.1,c);
}
function frame(g,x,y,w,h,c){rect(g,x-.5,y-.5,w+1,h+1,'#5e4a36');rect(g,x,y,w,h,c);}
function windowPane(g,x,y,w,h){
  rect(g,x-.6,y-.6,w+1.2,h+1.2,'#8d97a1');
  g.fillStyle=vgrad(g,y,y+h,'#bfe3f6','#e8f4f8');g.fillRect(x,y,w,h);
  rect(g,x+w/2-.2,y,.4,h,'#8d97a1');
  g.fillStyle='rgba(255,255,255,.45)';g.beginPath();g.moveTo(x+1,y+h);g.lineTo(x+w*.4,y);g.lineTo(x+w*.6,y);g.lineTo(x+2.5,y+h);g.fill();
}
function chair(g,x,fy,c='#39424d'){rect(g,x,fy-5.5,1,3.4,c);rect(g,x,fy-2.6,3,1,c);rect(g,x+1.2,fy-1.8,.7,1.8,'#22282f');}

const OFFICE=[['#e6edf2','#cfdbe3','#7d8c9b','#93a3b2'],['#efe9de','#dcd2c1','#8f7a5f','#a68f72'],['#e2ece4','#cbdace','#6f8473','#869d8a']];
function office(g,w,h,v){
  const[a,b,fl,hi]=OFFICE[v%3],fy=h-3.4;room(g,w,h,a,b,fl,hi);
  windowPane(g,3,5,w*.2,10);frame(g,w*.74,5,w*.18,8,'#fbfbf7');
  rect(g,w*.76,7,w*.09,.7,'#d9534f');rect(g,w*.76,9,w*.13,.7,'#4a90d9');
  for(let i=0;i<3;i++){
    const dx=4+i*(w-8)/3,dw=(w-8)/3-5;
    rect(g,dx,fy-7,dw,1.3,'#8a6a48');rect(g,dx,fy-5.8,dw,.6,'#6f5338');rect(g,dx+1,fy-5.4,1,5.4,'#6f5338');rect(g,dx+dw-2,fy-5.4,1,5.4,'#6f5338');
    rect(g,dx+dw*.42,fy-11.8,7,4.4,'#222a33');rect(g,dx+dw*.42+.5,fy-11.3,6,3.4,'#7fc8ee');rect(g,dx+dw*.42+1,fy-10.6,3.4,.5,'#e6f6ff');rect(g,dx+dw*.42+3,fy-7.4,1,.6,'#222a33');
    chair(g,dx+dw*.1,fy);
  }
  plant(g,w-4,fy);lamp(g,w*.3);lamp(g,w*.7);ao(g,w,h);
}
const CONDO=[['#f4e6cf','#e8d4b4','#a0704a','#b98658','#c8553d'],['#dfeaf0','#c8dae2','#8a6a4c','#a1805f','#3f7fa6'],['#efe0e4','#e0c8cf','#7e5c4c','#96705e','#8d6fb3']];
function condo(g,w,h,v){
  const[a,b,fl,hi,sofa]=CONDO[v%3],fy=h-3.4;room(g,w,h,a,b,fl,hi);
  for(let x=0;x<w;x+=6)rect(g,x,0,1.2,h-5,'rgba(255,255,255,.14)');
  windowPane(g,w*.4,5,w*.16,11);rect(g,w*.39,4,2,13,'rgba(180,60,60,.55)');rect(g,w*.55,4,2,13,'rgba(180,60,60,.55)');
  // 梳化
  round(g,w*.07,fy-8.5,w*.26,5,1.5,sofa);round(g,w*.06,fy-5,w*.28,4,1,sofa);rect(g,w*.08,fy-1.2,1,1.2,'#444');rect(g,w*.31,fy-1.2,1,1.2,'#444');
  rect(g,w*.12,fy-6.2,3,2,'#fff4d8');
  frame(g,w*.13,6,w*.12,6,'#9ec4a8');
  // 廚房
  rect(g,w*.66,fy-7,w*.28,7,'#fbf7ef');rect(g,w*.66,fy-7.6,w*.28,.9,'#7d7468');
  for(let i=1;i<3;i++)rect(g,w*.66+i*w*.093,fy-6.6,.4,6.6,'#d8d0c0');
  rect(g,w*.66,6,w*.28,5,'#efe7d8');rect(g,w*.66,10.6,w*.28,.6,'#b7ad9d');rect(g,w*.86,fy-14,w*.08,14,'#d5dce0');rect(g,w*.86,fy-8,w*.08,.4,'#9aa3a8');
  rect(g,w*.71,fy-9,1.4,1.6,'#c8553d');
  lamp(g,w*.28);ao(g,w,h);
}
function hotel(g,w,h,v){
  const suite=w>60,fy=h-3.4;room(g,w,h,'#efe6f2','#dccbe2','#6c5478','#83689a');
  rect(g,0,h-13,w,.7,'#c6b2d0');
  const bw=suite?w*.42:w*.62,bx=suite?w*.08:w*.2;
  rect(g,bx-1.4,fy-10,1.6,10,'#6d4d36');round(g,bx-1.2,fy-11,bw*.28,4,1,'#8a6a4e');
  rect(g,bx,fy-5,bw,2.4,'#fdfbf5');rect(g,bx,fy-2.8,bw,2,'#8d6fb3');rect(g,bx+bw*.25,fy-5,bw*.75,3.4,'#a487c8');
  rect(g,bx+bw*.02,fy-1,.9,1,'#4a3a2c');rect(g,bx+bw-1,fy-1,.9,1,'#4a3a2c');
  round(g,bx+.4,fy-6.6,bw*.24,2,1,'#fff');
  rect(g,bx+bw+1,fy-3.4,3,3.4,'#6d4d36');rect(g,bx+bw+1.8,fy-6,1.4,2.6,'#f2d9a0');
  const r=g.createRadialGradient(bx+bw+2.5,fy-6,0,bx+bw+2.5,fy-6,8);r.addColorStop(0,'rgba(255,220,150,.5)');r.addColorStop(1,'rgba(255,220,150,0)');g.fillStyle=r;g.fillRect(bx+bw-7,fy-14,20,14);
  frame(g,bx+bw*.3,5,bw*.4,5.6,'#d7bf8f');
  if(suite){
    round(g,w*.66,fy-7,w*.26,3,1,'#c99a4f');round(g,w*.65,fy-4,w*.28,3.6,1,'#b5843c');windowPane(g,w*.7,4.5,w*.18,8);
    rect(g,w*.56,1,.5,3,'#c9a24a');oval(g,w*.56,5,3.2,1.6,'#f2d27a');
  }
  ao(g,w,h);
}
function food(g,w,h){
  const fy=h-3.4;room(g,w,h,'#fdeec9','#f7dea8','#a8553c','#c26c4e');
  for(let y=9;y<h-6;y+=4)for(let x=(y%8?2:0);x<w;x+=4)rect(g,x,y,3.4,3.4,'rgba(255,255,255,.2)');
  for(let i=0;i<w;i+=5)rect(g,i,3,5,3.4,i%10?'#fff4e0':'#d6402e');
  for(let i=0;i<w;i+=5){g.fillStyle=i%10?'#fff4e0':'#d6402e';g.beginPath();g.arc(i+2.5,6.4,2.5,0,3.15);g.fill();}
  rect(g,0,1.6,w,1.6,'#b42d1f');
  // 櫃檯同餐牌
  rect(g,3,fy-7,w*.3,7,'#c8452f');rect(g,3,fy-8,w*.3,1.2,'#f4e2c0');rect(g,4,fy-5.8,w*.3-2,.6,'#f2c14e');
  rect(g,w*.05,fy-13,w*.1,3.6,'#2d2d33');rect(g,w*.17,fy-13,w*.1,3.6,'#2d2d33');rect(g,w*.06,fy-12,w*.05,.4,'#f2c14e');rect(g,w*.18,fy-12,w*.06,.4,'#f2c14e');
  rect(g,w*.08,fy-10,1.6,2,'#c0c0c0');
  for(let i=0;i<3;i++){const tx=w*(.42+i*.19);oval(g,tx+3.5,fy-6.6,4.4,.8,'#f8f0e0');rect(g,tx+3.1,fy-6,.8,6,'#7a5d3c');rect(g,tx+1.5,fy-.5,4,.5,'#7a5d3c');
    rect(g,tx-1.6,fy-3.6,2.2,.9,'#d6402e');rect(g,tx-.9,fy-2.8,.6,2.8,'#555');rect(g,tx+6.8,fy-3.6,2.2,.9,'#d6402e');rect(g,tx+7.5,fy-2.8,.6,2.8,'#555');}
  lamp(g,w*.5,'rgba(255,214,140,.4)');lamp(g,w*.8,'rgba(255,214,140,.4)');ao(g,w,h);
}
const GOODS=['#e05a6d','#4a90d9','#f1c232','#5fbf8f','#b06fd6','#f08a4b'];
function shop(g,w,h,v){
  const fy=h-3.4,k=v%3;room(g,w,h,['#e4f3ea','#fdf0e6','#ecebf7'][k],['#cfe7d9','#f4dcc8','#d9d8ee'][k],'#8d8f92','#a9abae');
  rect(g,0,2,w,3.4,['#2f8f6a','#c76a3a','#5a56a8'][k]);rect(g,w*.5-7,2.7,14,2,'rgba(255,255,255,.9)');
  rect(g,w*.5-5,3.4,10,.5,['#2f8f6a','#c76a3a','#5a56a8'][k]);
  for(let i=0;i<3;i++){
    const sx=3+i*(w-6)/3,sw=(w-6)/3-3;
    rect(g,sx,8,sw,fy-8,'#e9e1d4');
    for(let j=0;j<3;j++){const y=10+j*4.6;rect(g,sx,y+3,sw,.7,'#a58a68');for(let q=0;q<Math.floor(sw/2.2);q++)rect(g,sx+.6+q*2.2,y+.6,1.7,2.4,GOODS[(i*3+j*2+q+k)%6]);}
  }
  lamp(g,w*.25,'rgba(255,245,210,.35)');lamp(g,w*.75,'rgba(255,245,210,.35)');ao(g,w,h);
}
function security(g,w,h){
  const fy=h-3.4;room(g,w,h,'#d3dcef','#bcc9e2','#566080','#6e7a9c');
  rect(g,w*.06,5,w*.5,11,'#1f2a3f');
  for(let r=0;r<2;r++)for(let i=0;i<4;i++){rect(g,w*.08+i*w*.115,6+r*4.8,w*.1,4,'#102238');g.fillStyle=['#62d38f','#7fd0ff','#7fd0ff','#ffd27a'][(i+r)%4];g.fillRect(w*.09+i*w*.115,6.6+r*4.8,w*.08,2.8);}
  rect(g,w*.06,fy-6,w*.5,1.4,'#46567a');rect(g,w*.08,fy-4.6,w*.46,4.6,'#39476a');
  for(let i=0;i<3;i++){rect(g,w*.64+i*w*.1,fy-13,w*.085,13,'#7a8aa8');rect(g,w*.71+i*w*.1,fy-7,.8,1.6,'#d7dee9');rect(g,w*.645+i*w*.1,fy-12,w*.07,.5,'#a0aec6');}
  ao(g,w,h);
}
function stairs(g,w,h){
  g.fillStyle=vgrad(g,0,h,'#cdc4b2','#b9ae9a');g.fillRect(0,0,w,h);
  rect(g,0,h/2-1,w*.55,2,'#8f8674');
  const n=12;g.fillStyle='#8a7f6c';g.beginPath();g.moveTo(0,h);for(let i=0;i<n;i++){const y=h-(h*.92)*(i+1)/n;g.lineTo(w*i/n,y);g.lineTo(w*(i+1)/n,y);}g.lineTo(w,h);g.fill();
  for(let i=0;i<n;i++){const y=h-(h*.92)*(i+1)/n;rect(g,w*i/n,y,w/n,.7,'#e8e0d0');}
  g.strokeStyle='#5a5044';g.lineWidth=.9;g.beginPath();g.moveTo(1,h-9);g.lineTo(w-1,h*.08-9+1);g.stroke();
  for(let i=1;i<n;i+=2){const x=w*i/n,y=h-(h*.92)*(i+1)/n;rect(g,x,y-8,.6,8,'#5a5044');}
  ao(g,w,h);
}
function housekeeping(g,w,h){
  const fy=h-3.4;room(g,w,h,'#dcefe9','#c4e0d7','#7c9a92','#94b2aa');
  for(let i=0;i<3;i++){const x=4+i*14;round(g,x,fy-13,11,13,1,'#f4f6f6');g.fillStyle='#8fb7c8';g.beginPath();g.arc(x+5.5,fy-6.5,3.6,0,7);g.fill();g.fillStyle='#d9eef6';g.beginPath();g.arc(x+5.5,fy-6.5,2.5,0,7);g.fill();rect(g,x+2,fy-12,3,.8,'#9aa3a8');}
  rect(g,w*.62,6,w*.32,.8,'#9a7a56');rect(g,w*.62,11.5,w*.32,.8,'#9a7a56');
  for(let i=0;i<7;i++){rect(g,w*.63+i*w*.044,2.6+(i%2)*.5,w*.038,3.4-(i%2)*.5,['#fff','#e6f0f4','#fff','#d8e6dc'][i%4]);rect(g,w*.63+i*w*.044,8.2,w*.038,3.3,['#d8e6dc','#fff','#e6e0f0'][i%3]);}
  rect(g,w*.68,fy-6,w*.2,5,'#7fb5a8');rect(g,w*.68,fy-7,w*.2,1,'#fff');oval(g,w*.71,fy-.7,.9,.9,'#333');oval(g,w*.85,fy-.7,.9,.9,'#333');
  ao(g,w,h);
}
function conference(g,w,h){
  const fy=h-3.4;room(g,w,h,'#e9eef7','#d2dbea','#5e6b84','#75839e');
  rect(g,w*.03,3.4,w*.3,12,'#fff');rect(g,w*.03,3,w*.3,.8,'#333b46');rect(g,w*.06,6,w*.2,1,'#4a90d9');rect(g,w*.06,8.4,w*.14,1,'#62d38f');rect(g,w*.06,10.8,w*.24,1,'#e05a6d');
  windowPane(g,w*.72,4,w*.22,10);
  round(g,w*.2,fy-7,w*.62,1.8,.9,'#7a5a3c');rect(g,w*.3,fy-5.4,1.4,5.4,'#5a4128');rect(g,w*.7,fy-5.4,1.4,5.4,'#5a4128');
  for(let i=0;i<6;i++)chair(g,w*(.23+i*.095),fy);
  lamp(g,w*.5);ao(g,w,h);
}
function cinema(g,w,h,v){
  const on=v===1;g.fillStyle=vgrad(g,0,h,'#2b0f14','#431a20');g.fillRect(0,0,w,h);
  rect(g,0,h-3,w,3,'#5a2028');
  rect(g,w*.1,0,w*.8,2,'#7d2430');
  for(let i=0;i<w;i+=3)rect(g,i,0,1.5,h*.5,'rgba(120,30,40,.45)');
  rect(g,w*.16,5,w*.68,h*.42,'#0a0a0d');
  if(on){const l=vgrad(g,5,5+h*.42,'#f4f7ff','#bcd0f2');g.fillStyle=l;g.fillRect(w*.17,5.8,w*.66,h*.42-1.6);rect(g,w*.3,h*.32,w*.14,h*.1,'#4a5d86');rect(g,w*.54,h*.26,w*.1,h*.16,'#c0506a');oval(g,w*.7,h*.17,3.6,3.6,'#ffd27a');
    g.fillStyle='rgba(180,210,255,.13)';g.beginPath();g.moveTo(w*.17,h*.5);g.lineTo(w*.83,h*.5);g.lineTo(w,h);g.lineTo(0,h);g.fill();}
  rect(g,w*.13,4,w*.04,h*.48,'#a52e3c');rect(g,w*.83,4,w*.04,h*.48,'#a52e3c');
  for(let r=0;r<3;r++)for(let i=0;i<13;i++){const x=w*(.06+i*.069);round(g,x,h-6-r*5.4,w*.052,4.4,1,r%2?'#a12f3b':'#8d2730');rect(g,x,h-2.4-r*5.4,w*.052,.5,'#4a1218');}
}
function clinic(g,w,h){
  const fy=h-3.4;room(g,w,h,'#f7fafb','#e7f0f3','#9db4bb','#b5cbd1');
  rect(g,0,h-11,w,.8,'#7fc1c9');
  rect(g,w*.08,4,w*.13,10,'#fff');rect(g,w*.08,4,w*.13,10,'rgba(120,190,200,.14)');
  const cx=w*.145;rect(g,cx-.9,5.6,1.8,6.8,'#d83a3a');rect(g,cx-3.4,8.1,6.8,1.8,'#d83a3a');
  rect(g,w*.3,fy-5.4,w*.3,1.6,'#fff');rect(g,w*.3,fy-3.8,w*.3,1,'#7fb7c4');rect(g,w*.3,fy-6.8,1,6.8,'#9aa3a8');rect(g,w*.59,fy-6,1,6,'#9aa3a8');round(g,w*.31,fy-6.8,w*.06,1.5,.7,'#fff');
  rect(g,w*.45,1.6,w*.26,.5,'#8d97a1');for(let i=0;i<7;i++)rect(g,w*.62+i*.9,2,.8,fy-3,i%2?'#a8d4dc':'#bfe3e8');
  rect(g,w*.76,fy-12,w*.17,12,'#eaf2f4');rect(g,w*.77,fy-11,w*.15,4.6,'#cfe3e8');rect(g,w*.77,fy-5.6,w*.15,4.6,'#cfe3e8');
  ao(g,w,h);
}
function billboard(g,w,h){
  rect(g,w*.18,h*.55,1.4,h*.45,'#4a4f56');rect(g,w*.78,h*.55,1.4,h*.45,'#4a4f56');
  g.strokeStyle='#4a4f56';g.lineWidth=.7;g.beginPath();g.moveTo(w*.18,h);g.lineTo(w*.5,h*.62);g.lineTo(w*.8,h);g.stroke();
  rect(g,0,3,w,h*.58,'#20242b');
  g.fillStyle=hgrad(g,1,w-1,'#ff8a4b','#ffd27a','#7fd0ff');g.fillRect(1,4,w-2,h*.58-2);
  oval(g,w*.22,h*.33,8,8,'rgba(255,255,255,.75)');rect(g,w*.42,h*.2,w*.44,3,'#20242b');rect(g,w*.42,h*.34,w*.32,2,'#c0392b');
  for(let i=0;i<5;i++){rect(g,w*(.1+i*.2),.6,.7,2.6,'#555');rect(g,w*(.08+i*.2),.3,2,.9,'#ffe9a8');}
}
const CARS=['#b8423a','#3f6fb0','#d9d9d9','#3b9068','#e2b23f','#4a4a55'];
export function car(g,x,fy,w,c){
  round(g,x,fy-3.6,w,2.8,.9,c);round(g,x+w*.2,fy-5.8,w*.58,2.6,1,c);rect(g,x+w*.26,fy-5.2,w*.2,1.6,'#bfe0ee');rect(g,x+w*.5,fy-5.2,w*.2,1.6,'#bfe0ee');
  oval(g,x+w*.22,fy-.9,1.1,1.1,'#1d1d22');oval(g,x+w*.78,fy-.9,1.1,1.1,'#1d1d22');
}
function parking(g,w,h,v){
  const fy=h-3.4;room(g,w,h,'#5e6168','#494c53','#383a40','#44464d');
  rect(g,0,h-10,w,.8,'#d7b03c');
  for(let i=0;i<3;i++)rect(g,w*(.24+i*.26),2,2.4,fy-2,'#6e7178');
  for(let i=0;i<4;i++){if((i+v)%5===3)continue;car(g,w*(.03+i*.245),fy,w*.2,CARS[(i+v*2)%6]);rect(g,w*(.02+i*.245),fy,.4,3,'#d9d9d9');}
  ao(g,w,h);
}
function ramp(g,w,h){
  const fy=h-3.4;room(g,w,h,'#5e6168','#494c53','#383a40','#44464d');
  g.fillStyle='#7d7f86';g.beginPath();g.moveTo(0,4);g.lineTo(w,fy);g.lineTo(0,fy);g.fill();
  for(let i=0;i<6;i++){g.fillStyle=i%2?'#d7b03c':'#2a2c30';const x=i*w/6,y=4+(fy-4)*(i/6);g.fillRect(x,y-.8,w/6,.9);}
  ao(g,w,h);
}
function recycle(g,w,h){
  const fy=h-3.4;room(g,w,h,'#4d6650','#3e5441','#333b34','#454e46');
  rect(g,0,8,w,1.6,'#6b7a6e');for(let x=2;x<w;x+=5)oval(g,x,8.8,.7,.7,'#2a302b');
  for(let i=0;i<5;i++){const x=w*(.05+i*.19),c=['#6db36d','#4f9de0','#e3b341','#6db36d','#c0c0c0'][i];rect(g,x,fy-9,w*.14,9,c);rect(g,x-.4,fy-10,w*.14+.8,1.3,'#2e3530');rect(g,x+1,fy-7,w*.14-2,.5,'rgba(255,255,255,.5)');}
  ao(g,w,h);
}
function metro(g,w,h){
  const fy=h-3.4;g.fillStyle=vgrad(g,0,h,'#dfe8ef','#c4d2de');g.fillRect(0,0,w,h);
  for(let y=4;y<h*.56;y+=4)rect(g,0,y,w,.4,'rgba(100,120,140,.35)');
  for(let x=0;x<w;x+=8)rect(g,x,0,.4,h*.56,'rgba(100,120,140,.35)');
  rect(g,0,3,w,4,'#2f6fb0');
  for(let i=0;i<3;i++){rect(g,w*(.1+i*.34),3.8,w*.14,2.4,'#fff');rect(g,w*(.12+i*.34),4.6,w*.1,.6,'#2f6fb0');}
  for(let i=0;i<5;i++)rect(g,w*(.08+i*.2),7,2.6,h*.5-7,'#aebccb');
  g.fillStyle=vgrad(g,h*.5,h,'#27313b','#1b222a');g.fillRect(0,h*.5,w,h*.5);
  round(g,w*.04,h*.52,w*.92,h*.38,3,'#4f9de0');rect(g,w*.04,h*.74,w*.92,1.4,'#fff');rect(g,w*.04,h*.78,w*.92,1,'#d6402e');
  for(let i=0;i<10;i++){rect(g,w*(.07+i*.088),h*.57,w*.06,h*.12,'#dff0fb');rect(g,w*(.07+i*.088)+w*.028,h*.57,.4,h*.2,'#2f6fb0');}
  rect(g,0,fy+1,w,2.4,'#3c4148');for(let x=0;x<w;x+=6)rect(g,x,fy+1,3.2,1,'#6a7178');
}
function arch(g,cx,fy,wd,ht,cols){
  g.beginPath();g.moveTo(cx-wd/2,fy);g.lineTo(cx-wd/2,fy-ht+wd/2);g.quadraticCurveTo(cx-wd/2,fy-ht,cx,fy-ht-wd*.5);g.quadraticCurveTo(cx+wd/2,fy-ht,cx+wd/2,fy-ht+wd/2);g.lineTo(cx+wd/2,fy);g.closePath();
  g.fillStyle=vgrad(g,fy-ht,fy,...cols);g.fill();g.strokeStyle='#6d5a3e';g.lineWidth=.8;g.stroke();
}
function cathedral(g,w,h){
  const fy=h-3.4;g.fillStyle=vgrad(g,0,h,'#f5efe2','#e4d9c2');g.fillRect(0,0,w,h);
  for(let y=5;y<h;y+=7)for(let x=(y%14?0:8);x<w;x+=16)rect(g,x,y,15.4,.4,'rgba(120,100,70,.18)');
  rect(g,0,h-3.4,w,3.4,'#b89a6a');
  const C=[['#3f7fd6','#e0453b','#f2c94c'],['#2fa36b','#3f7fd6','#7b4fd6'],['#e0453b','#f2c94c','#2fa36b']];
  for(let i=0;i<6;i++)arch(g,w*(.1+i*.16)+(i>2?w*.0:0),fy-8,w*.07,h*.46,C[i%3]);
  g.fillStyle='#d9c8a4';for(let i=0;i<7;i++)g.fillRect(w*(.02+i*.16),4,2,fy-4);
  const cx=w/2,cy=h*.22;oval(g,cx,cy,h*.15,h*.15,'#6d5a3e');for(let i=0;i<8;i++){g.fillStyle=['#e0453b','#f2c94c','#3f7fd6','#2fa36b'][i%4];g.beginPath();g.moveTo(cx,cy);g.arc(cx,cy,h*.135,i*.785,(i+1)*.785);g.fill();}oval(g,cx,cy,h*.04,h*.04,'#fff6d8');
  for(let r=0;r<2;r++)for(let i=0;i<8;i++)rect(g,w*(.08+i*.115),fy-3-r*3.6,w*.09,1.4,'#7a5a3c');
  rect(g,cx-7,fy-6,14,6,'#efe2c2');rect(g,cx-8,fy-6.6,16,.9,'#c9a24a');rect(g,cx-.5,fy-13,1,7,'#c9a24a');rect(g,cx-2.2,fy-11,4.4,1,'#c9a24a');
}
export const ART={office,condo,hotel,suite:hotel,food,shop,security,stairs,housekeeping,conference,cinema,clinic,billboard,parking,ramp,recycle,metro,cathedral};

// 電梯井每一層
export function liftCell(g,w,h,kind,stop){
  const dark=kind==='express'?'#1f2c3a':kind==='service'?'#1f2c27':'#2a2f36';
  g.fillStyle=hgrad(g,0,w,'#14181d',dark,'#14181d');g.fillRect(0,0,w,h);
  rect(g,w*.16,0,.8,h,'#59636e');rect(g,w*.82,0,.8,h,'#59636e');
  rect(g,0,h-2,w,2,'#3c434c');
  if(stop){
    const acc=kind==='express'?'#6fb6ff':kind==='service'?'#62d38f':'#ffb23f';
    rect(g,1.4,6,w-2.8,h-8,'#59636e');
    g.fillStyle=hgrad(g,2,w-2,'#5c6773','#7f8a96','#5c6773');g.fillRect(2,6.6,w-4,h-8.6);
    rect(g,w/2-.25,6.6,.5,h-8.6,'#2c333b');
    rect(g,w*.16,.8,w*.68,5,'#0c1014');rect(g,w*.16,5.4,w*.68,.5,acc);
  }
}
// 大堂每 8 格一段
export function lobbyTile(g,w,h,sky){
  g.fillStyle=vgrad(g,0,h,sky?'#e8eef4':'#f6efe2',sky?'#d5dfe9':'#ece1cc');g.fillRect(0,0,w,h);
  rect(g,0,0,w,2.6,sky?'#9db4c7':'#c7a768');rect(g,0,2.6,w,.5,'rgba(0,0,0,.2)');
  g.fillStyle=hgrad(g,w*.05,w*.17,'#e9dfc8','#fffaf0','#d8caac');g.fillRect(w*.05,3,w*.12,h-6);
  rect(g,w*.03,3,w*.16,1,'#c7a768');rect(g,w*.03,h-4.4,w*.16,1.2,'#c7a768');
  windowPane(g,w*.3,6,w*.5,h-14);
  g.fillStyle=vgrad(g,h-3.8,h,'#d6c7a8','#b49f78');g.fillRect(0,h-3.8,w,3.8);
  for(let x=0;x<w;x+=16)rect(g,x,h-3.8,.4,3.8,'rgba(0,0,0,.18)');
  rect(g,0,h-3.9,w,.5,'rgba(255,255,255,.5)');
  lamp(g,w*.55,'rgba(255,226,170,.3)');
}
export function lobbyDoor(g,w,h){
  rect(g,0,0,w,h,'#3a4048');
  g.fillStyle=vgrad(g,4,h,'#b6dcef','#e4f2f7');g.fillRect(1.2,5,w-2.4,h-8.4);
  rect(g,w/2-.3,5,.6,h-8.4,'#3a4048');rect(g,w/2-2,h*.55,1,3,'#d6b45a');rect(g,w/2+1,h*.55,1,3,'#d6b45a');
  rect(g,0,0,w,4,'#c7a768');
}
export function reception(g,w,h){
  rect(g,0,h-8.8,w,1.4,'#7a5a3c');g.fillStyle=vgrad(g,h-7.4,h-3.4,'#a57d52','#7d5b38');g.fillRect(1,h-7.4,w-2,4);
  rect(g,w*.2,h-6.6,w*.6,.5,'#e0c080');plant(g,3,h-8.8,'#59a868');rect(g,w*.68,h-11.5,4,2.8,'#222a33');rect(g,w*.68+.4,h-11.1,3.2,2,'#7fc8ee');
}
export function shell(g,w,h,base){
  g.fillStyle=vgrad(g,0,h,base?'#55524c':'#8b877e',base?'#45423d':'#76726a');g.fillRect(0,0,w,h);
  g.fillStyle=hgrad(g,0,5,base?'#6b675f':'#a09b90','#00000000');g.fillRect(0,0,6,h);
  rect(g,0,0,3,h,base?'#6a665e':'#9e998e');rect(g,3,0,.6,h,'rgba(0,0,0,.2)');
  rect(g,0,2.5,w,.6,'rgba(0,0,0,.25)');rect(g,0,h-3,w,3,base?'#3e3b37':'#66625b');
}
