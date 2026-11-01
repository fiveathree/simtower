// 新手教學：由空地開始，逐步檢查玩家做咗未，唔會阻住遊戲
import {TYPES,TUT_KEY,fi} from '../config.js';
import {G} from '../state.js';

const $=s=>document.querySelector(s);
const STEPS=[
 {t:'呢度係你嘅空地。揀「大堂」，喺 1F 由左至右拖一行（至少 20 格）。',ok:()=>G.lobbyCells.length>=20},
 {t:'揀「電梯」，喺大堂由 1F 拖上 4F。起好之後撳住頂格拖，可以再拉長。',ok:()=>G.S.units.some(u=>TYPES[u.type].lift&&u.f<=0&&u.f+u.h>2)},
 {t:'揀「樓面」，喺 2F 貼住電梯拖一行地板（至少 10 格）。',ok:()=>G.S.slab[fi(1)].filter(v=>v).length>=14},
 {t:'揀「辦公室」，起喺 2F。有電梯到先會有人租。',ok:()=>G.S.units.some(u=>u.type==='office')},
 {t:'按 4× 快轉，睇住小人返工放工。',ok:()=>G.speed===3},
 {t:'按「評價」，紅色嘅單位就係等得太耐。頂欄有下一級嘅目標，加油！',ok:()=>G.evalView},
];
let step=-1;
export function startTutorial(){step=0;$('#tut').hidden=false;render();}
function finish(){step=-1;$('#tut').hidden=true;try{localStorage.setItem(TUT_KEY,'1');}catch(e){}}
function render(){
  $('#tut').innerHTML=`<small>教學 ${step+1} / ${STEPS.length}</small><p>${STEPS[step].t}</p><button id="tutSkip">跳過教學</button>`;
  $('#tutSkip').onclick=finish;
}
export function tickTutorial(){
  if(step<0)return;
  if(STEPS[step].ok()){step++;if(step>=STEPS.length)finish();else render();}
}
export function tutorialSeen(){try{return !!localStorage.getItem(TUT_KEY);}catch(e){return true;}}
