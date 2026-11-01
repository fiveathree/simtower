// 新手教學：逐步檢查玩家做咗未，唔會阻住遊戲
import {TYPES,TUT_KEY,W,fi} from '../config.js';
import {G} from '../state.js';

const $=s=>document.querySelector(s);
const STEPS=[
 {t:'揀「樓面」，喺 6F 拖一行地板（至少 10 格）。',ok:()=>G.S.slab[fi(5)].filter(v=>v).length>=14||G.S.units.some(u=>u.f===5&&u.type==='office')},
 {t:'揀「辦公室」，喺 6F 起一間。有電梯到先會有人租。',ok:()=>G.S.units.some(u=>u.type==='office'&&u.f>=5)},
 {t:'揀「查看」，點電梯，按「加轎廂」。人多就靠佢唔使等。',ok:()=>G.S.units.some(u=>TYPES[u.type].lift&&u.cars.length>1)},
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
  if(step<0||!W)return;
  if(STEPS[step].ok()){step++;if(step>=STEPS.length)finish();else render();}
}
export function tutorialSeen(){try{return !!localStorage.getItem(TUT_KEY);}catch(e){return true;}}
