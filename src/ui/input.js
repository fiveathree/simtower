// 滑鼠、觸控、鍵盤
import {TYPES,CW,FH,W,MINF,MAXF,fi,fname} from '../config.js';
import {G,cam,V,clampCam} from '../state.js';
import {place,paint,bulldozeAt} from '../build.js';
import {dirty} from '../route.js';
import {log,openInfo,closeInfo} from './panels.js';
import {setTool} from './tools.js';
import {setSpeed} from './hud.js';

const $=s=>document.querySelector(s);
function toWorld(sx,sy){const wx=(sx-V.VW/2)/cam.z+cam.x,wy=(sy-V.VH/2)/cam.z+cam.y;return{f:Math.floor(-wy/FH),cell:Math.floor(wx/CW)};}
const pts=new Map();
let paintErr=null;
function doPaint(f,x){const err=paint(G.tool,f,x);if(err&&err!=='skip')paintErr=err;else if(!err)dirty();}
function click(w){
  if(G.tool==='inspect'){const id=(w.f>=MINF&&w.f<=MAXF&&w.cell>=0&&w.cell<W)?G.occ[fi(w.f)][w.cell]:0;if(id)openInfo(id);else closeInfo();return;}
  if(G.tool==='bulldoze'){bulldozeAt(w.f,w.cell);return;}
  const d=TYPES[G.tool];const err=place(G.tool,w.f,w.cell-Math.floor(d.w/2));
  if(err)log(err,'bad');else log(`起咗 ${fname(w.f)} ${d.name}`);
}

export function initInput(){
const cvs=V.cvs;
cvs.addEventListener('contextmenu',e=>e.preventDefault());
cvs.addEventListener('pointerdown',e=>{
  cvs.setPointerCapture(e.pointerId);pts.set(e.pointerId,{x:e.offsetX,y:e.offsetY});
  if(pts.size===2){const[p,q]=[...pts.values()];G.drag={mode:'pinch',d:Math.hypot(p.x-q.x,p.y-q.y),z:cam.z};return;}
  const w=toWorld(e.offsetX,e.offsetY),pan=e.button===1||e.button===2;
  G.drag={mode:pan?'pan':'press',sx:e.offsetX,sy:e.offsetY,cx:cam.x,cy:cam.y,moved:false};
  if(!pan&&TYPES[G.tool].paint){G.drag.mode='paint';G.drag.f=w.f;G.drag.last=w.cell;doPaint(w.f,w.cell);}
  else if(!pan&&G.tool==='elevator'){G.drag.mode='elev';G.drag.f0=G.drag.f1=w.f;G.drag.x=w.cell-2;}
});
cvs.addEventListener('pointermove',e=>{
  if(e.pointerType==='mouse')G.hover=toWorld(e.offsetX,e.offsetY);
  if(!pts.has(e.pointerId))return;pts.set(e.pointerId,{x:e.offsetX,y:e.offsetY});
  if(!G.drag)return;
  if(G.drag.mode==='pinch'&&pts.size===2){const[p,q]=[...pts.values()];cam.z=G.drag.z*Math.hypot(p.x-q.x,p.y-q.y)/G.drag.d;clampCam();return;}
  const dx=e.offsetX-G.drag.sx,dy=e.offsetY-G.drag.sy;if(Math.hypot(dx,dy)>6)G.drag.moved=true;
  if(G.drag.mode==='press'&&G.drag.moved)G.drag.mode='pan';
  if(G.drag.mode==='pan'){cam.x=G.drag.cx-dx/cam.z;cam.y=G.drag.cy-dy/cam.z;clampCam();}
  else if(G.drag.mode==='paint'){const w=toWorld(e.offsetX,e.offsetY);const a=Math.min(G.drag.last,w.cell),b=Math.max(G.drag.last,w.cell);for(let c=a;c<=b;c++)doPaint(G.drag.f,c);G.drag.last=w.cell;}
  else if(G.drag.mode==='elev'){G.drag.f1=toWorld(e.offsetX,e.offsetY).f;}
});
function endPtr(e){
  pts.delete(e.pointerId);if(!G.drag)return;
  const w=toWorld(e.offsetX,e.offsetY);
  if(G.drag.mode==='press'&&!G.drag.moved){if(e.pointerType!=='mouse')G.hover=w;click(w);}
  else if(G.drag.mode==='elev'){const f=Math.min(G.drag.f0,G.drag.f1),h=Math.abs(G.drag.f1-G.drag.f0)+1;
    if(h<2)log('電梯要由一層拖到另一層（至少跨兩層）','bad');else if(h>30)log('電梯最多跨 30 層','bad');
    else{const err=place('elevator',f,G.drag.x,h);if(err)log(err,'bad');else log(`起咗電梯 ${fname(f)}–${fname(f+h-1)}`);}}
  else if(G.drag.mode==='paint'&&paintErr){log(paintErr,'bad');}
  paintErr=null;
  if(pts.size===0)G.drag=null;else if(G.drag.mode==='pinch')G.drag=null;
}
cvs.addEventListener('pointerup',endPtr);cvs.addEventListener('pointercancel',endPtr);
cvs.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse')G.hover=null;});
cvs.addEventListener('wheel',e=>{e.preventDefault();const r=cvs.getBoundingClientRect(),mx=e.clientX-r.left,my=e.clientY-r.top;
  const wx=(mx-V.VW/2)/cam.z+cam.x,wy=(my-V.VH/2)/cam.z+cam.y;cam.z*=Math.exp(-e.deltaY*.0015);clampCam();cam.x=wx-(mx-V.VW/2)/cam.z;cam.y=wy-(my-V.VH/2)/cam.z;clampCam();},{passive:false});
window.addEventListener('keydown',e=>{
  if(!$('#modal').hidden)return;
  const k=e.key,step=60/cam.z;
  if(k==='ArrowLeft'||k==='a')cam.x-=step;else if(k==='ArrowRight'||k==='d')cam.x+=step;
  else if(k==='ArrowUp'||k==='w')cam.y-=step;else if(k==='ArrowDown'||k==='s')cam.y+=step;
  else if(k==='+'||k==='=')cam.z*=1.15;else if(k==='-')cam.z/=1.15;
  else if(k===' '){e.preventDefault();setSpeed(G.speed?0:1);}
  else if(k==='Escape'){setTool('inspect');closeInfo();}
  else return;clampCam();
});
}
