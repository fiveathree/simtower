// 遊戲狀態：G 係全部會被換走嘅執行中資料；G.S 係會存檔嘅部分。
import {SAVE_VERSION,SAVE_KEY,LEGACY_KEY,SLOT_KEY,SITE,setSite,NF,W,CW,FH,MINF,MAXF} from './config.js';
import {dirty} from './route.js';
import {mark} from './build.js';
import {makeShaft} from './elevator.js';
import {genDay} from './schedule.js';

export const G={slot:1,S:null,occ:null,tocc:null,byId:null,cars:null,skyFloors:new Set(),agents:null,events:null,evi:0,adj:null,rcache:null,lobbyCells:null,floats:null,lastDay:0,lastHour:0,hasSlab:null,rampDepth:0,fire:null,bomb:null,
  tool:'inspect',evalView:false,speed:1,sel:null,hover:null,drag:null,hourly:{moveIn:0,sold:0,soldAmt:0}};
export const cam={x:480,y:-140,z:1};
export const V={cvs:null,ctx:null,DPR:1,VW:0,VH:0};
export const hooks={log(){},closeInfo(){},buildTools(){},siteChanged(){},sfx(){},alert(){},ask(t,b,btns){btns[0].fn();}}; // 由 UI 接駁，等模擬部分唔使掂 DOM

export const SX=wx=>(wx-cam.x)*cam.z+V.VW/2,SY=wy=>(wy-cam.y)*cam.z+V.VH/2;
export function earn(cat,n){G.S.money+=n;G.S.led[cat]=(G.S.led[cat]||0)+n;if(n>=1000)hooks.sfx('coin');} // 所有收支都經呢度，財務報表先齊
export function R(x,y,w,h,c){V.ctx.fillStyle=c;V.ctx.fillRect(x,y,w,h);}
export function clampCam(){cam.z=Math.min(3,Math.max(.3,cam.z));cam.x=Math.min(W*CW+300,Math.max(-300,cam.x));cam.y=Math.min((-MINF+3)*FH,Math.max(-(MAXF+3)*FH,cam.y));}
export function floatTxt(x,f,txt,col){G.floats.push({x,f,txt,col,t:0});if(G.floats.length>60)G.floats.shift();}

function blank(){return{version:SAVE_VERSION,site:SITE.id,money:SITE.money,t:7*60+10,stars:1,units:[],nextId:1,visitors:0,vToday:0,vLog:[],rep:0,led:{},fin:[],starHold:0,slab:Array.from({length:NF},()=>Array(W).fill(0)),tower:false};}
export function initRuntime(){
  G.occ=Array.from({length:NF},()=>new Int32Array(W));G.tocc=Array.from({length:NF},()=>new Int32Array(W));
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
  5:o=>{o.site='classic';return o;}, // 地點：舊存檔保留 120 格、61 層
};
export function migrate(o){
  if(!o||typeof o!=='object')return null;
  let ver=o.version??o.v;
  if(!Number.isInteger(ver)||ver<1||ver>SAVE_VERSION)return null;
  for(;ver<SAVE_VERSION;ver++){o=MIGRATIONS[ver](o);o.version=ver+1;}
  return Array.isArray(o.units)&&Array.isArray(o.slab)?o:null;
}
const slotKey=n=>`${SAVE_KEY}_${n}`;
export const keysOf=n=>n===1?[slotKey(1),SAVE_KEY,LEGACY_KEY]:[slotKey(n)]; // 第 1 格接收舊版存檔
export function save(){try{localStorage.setItem(slotKey(G.slot),JSON.stringify(G.S));}catch(e){}}
export function load(n=G.slot){
  for(const k of keysOf(n)){
    try{const s=localStorage.getItem(k);if(s){const o=migrate(JSON.parse(s));if(o)return o;}}catch(e){}
  }
  return null;
}
export function deleteSlot(n){for(const k of keysOf(n))try{localStorage.removeItem(k);}catch(e){}}
export function loadSlotId(){try{const n=+localStorage.getItem(SLOT_KEY);if(n>=1&&n<=3)G.slot=n;}catch(e){}}
export function useSlot(n){G.slot=n;try{localStorage.setItem(SLOT_KEY,String(n));}catch(e){}}
export function frameCam(fy){cam.x=W/2*CW;cam.y=-fy*FH;cam.z=Math.min(1.8,Math.max(.4,V.VW/((Math.min(W,80)+15)*CW)));clampCam();}
export function enter(o){setSite(o.site);hooks.siteChanged();G.S=o;initRuntime();frameCam(4);hooks.closeInfo();hooks.buildTools();}

/* ---------- 新遊戲 ---------- */
export function newGame(id=SITE.id){
  setSite(id);hooks.siteChanged();
  G.S=blank();G.occ=Array.from({length:NF},()=>new Int32Array(W));G.tocc=Array.from({length:NF},()=>new Int32Array(W));G.cars=new Map();dirty();
  initRuntime();
  frameCam(6);
  hooks.closeInfo();save();hooks.buildTools();
}
