// 遊戲狀態：G 係全部會被換走嘅執行中資料；G.S 係會存檔嘅部分。
import {SAVE_VERSION,SAVE_KEY,LEGACY_KEY,NF,W,CW,FH,MINF,MAXF} from './config.js';
import {dirty} from './route.js';
import {mark,paint,place} from './build.js';
import {makeShaft} from './elevator.js';
import {genDay} from './schedule.js';

export const G={S:null,occ:null,byId:null,cars:null,skyFloors:new Set(),agents:null,events:null,evi:0,adj:null,rcache:null,lobbyCells:null,floats:null,lastDay:0,lastHour:0,hasSlab:null,rampDepth:0,fire:null,bomb:null,
  tool:'inspect',evalView:false,speed:1,sel:null,hover:null,drag:null,hourly:{moveIn:0,sold:0,soldAmt:0}};
export const cam={x:480,y:-140,z:1};
export const V={cvs:null,ctx:null,DPR:1,VW:0,VH:0};
export const hooks={log(){},closeInfo(){},buildTools(){},alert(){},ask(t,b,btns){btns[0].fn();}}; // 由 UI 接駁，等模擬部分唔使掂 DOM

export const SX=wx=>(wx-cam.x)*cam.z+V.VW/2,SY=wy=>(wy-cam.y)*cam.z+V.VH/2;
export function earn(cat,n){G.S.money+=n;G.S.led[cat]=(G.S.led[cat]||0)+n;} // 所有收支都經呢度，財務報表先齊
export function R(x,y,w,h,c){V.ctx.fillStyle=c;V.ctx.fillRect(x,y,w,h);}
export function clampCam(){cam.z=Math.min(3,Math.max(.3,cam.z));cam.x=Math.min(W*CW+300,Math.max(-300,cam.x));cam.y=Math.min((-MINF+3)*FH,Math.max(-(MAXF+3)*FH,cam.y));}
export function floatTxt(x,f,txt,col){G.floats.push({x,f,txt,col,t:0});if(G.floats.length>60)G.floats.shift();}

function blank(){return{version:SAVE_VERSION,money:2000000,t:7*60+10,stars:1,units:[],nextId:1,visitors:0,vToday:0,vLog:[],rep:0,led:{},fin:[],starHold:0,slab:Array.from({length:NF},()=>Array(W).fill(0)),tower:false};}
export function initRuntime(){
  G.occ=Array.from({length:NF},()=>new Int32Array(W));
  G.cars=new Map();G.agents=[];G.events=[];G.evi=0;G.floats=[];G.fire=null;G.bomb=null;hooks.alert(null);
  for(const u of G.S.units){mark(u,u.id);if(u.cars)makeShaft(u);}
  dirty();
  G.lastDay=Math.floor(G.S.t/1440);G.lastHour=Math.floor(G.S.t/60);
  genDay(G.lastDay,G.S.t);
}

/* ---------- 存檔 ---------- */
// 每個版本升上下一版嘅步驟；key 係舊版本號
const MIGRATIONS={
  1:o=>{delete o.v;return o;}, // v1 用 v 做版本欄位，資料結構不變
  2:o=>{for(const u of o.units)if(u.type==='elevator')u.cars=[{home:u.f,rush:true}];return o;}, // 電梯可以有多個轎廂
  3:o=>{o.visitors=0;o.vToday=0;o.vLog=[];o.rep=0;return o;}, // 人口開始計訪客
  4:o=>{o.rep??=0;o.led={};o.fin=[];o.starHold=0;return o;}, // 財務報表
};
export function migrate(o){
  if(!o||typeof o!=='object')return null;
  let ver=o.version??o.v;
  if(!Number.isInteger(ver)||ver<1||ver>SAVE_VERSION)return null;
  for(;ver<SAVE_VERSION;ver++){o=MIGRATIONS[ver](o);o.version=ver+1;}
  return Array.isArray(o.units)&&Array.isArray(o.slab)?o:null;
}
export function save(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(G.S));}catch(e){}}
export function load(){
  for(const k of [SAVE_KEY,LEGACY_KEY]){
    try{const s=localStorage.getItem(k);if(s){const o=migrate(JSON.parse(s));if(o)return o;}}catch(e){}
  }
  return null;
}

/* ---------- 新遊戲 ---------- */
export function newGame(){
  G.S=blank();G.occ=Array.from({length:NF},()=>new Int32Array(W));G.cars=new Map();dirty();
  for(let x=20;x<100;x++)paint('lobby',0,x,true);dirty();
  place('elevator',0,58,6,true);place('stairs',0,94,2,true);
  const offX=[22,31,40,49,62,71,80];
  const layout={1:offX.map(x=>['office',x]),2:offX.map(x=>['office',x]),3:[22,34,46,62,74,86].map(x=>['condo',x]),4:[['food',22],['condo',62],['condo',74]],5:[]};
  for(let f=1;f<=5;f++){
    for(const[t,x]of layout[f]){const err=place(t,f,x,null,true);if(!err){const u=G.S.units[G.S.units.length-1];
      if(t==='office')u.occ=f===1||x<45;if(t==='condo')u.occ=f===3&&x<60;}}
    if(f<5)for(let x=20;x<100;x++)paint('floor',f,x,true);
    dirty();
  }
  initRuntime();
  cam.x=60*CW;cam.y=-3*FH;cam.z=Math.min(1.8,Math.max(.4,V.VW/(95*CW)));clampCam();
  hooks.closeInfo();save();hooks.buildTools();
}
