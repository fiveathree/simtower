// 頂欄
import {reqOf,TYPES,SITE,REP_MAX,TOWER_STAR,fmt} from '../config.js';
import {G} from '../state.js';
import {pop,count} from '../economy.js';
import {log,updInfo} from './panels.js';

const $=s=>document.querySelector(s);
export function setSpeed(s){G.speed=s;for(let i=0;i<4;i++)$('#sp'+i).setAttribute('aria-pressed',i===s);}
export function initHud(){
  document.querySelectorAll('.speed button').forEach(b=>b.onclick=()=>setSpeed(+b.dataset.s));
  $('#evalBtn').onclick=()=>{G.evalView=!G.evalView;$('#evalBtn').setAttribute('aria-pressed',G.evalView);if(G.evalView)log('評價視圖：綠＝滿意，黃＝一般，紅＝唔滿意（多數因為等電梯太耐）');};
}
export function updHUD(){
  $('#siteName').textContent=SITE.name;
  const m=$('#money');m.textContent=fmt(G.S.money);m.classList.toggle('neg',G.S.money<0);
  $('#pop').textContent=pop().toLocaleString('en-US');
  $('#stars').textContent=G.S.stars>=TOWER_STAR?'TOWER':'★'.repeat(G.S.stars)+'☆'.repeat(5-G.S.stars);
  const d=Math.floor(G.S.t/1440),y=Math.floor(d/12)+1,q=Math.floor(d/3)%4+1,mn=Math.floor(G.S.t%1440),hh=String(Math.floor(mn/60)).padStart(2,'0'),mm=String(mn%60).padStart(2,'0');
  $('#dateL').textContent=`第${y}年 Q${q} ${d%3===2?'週末':'平日'}`;$('#clock').textContent=`${hh}:${mm}`;
  const nx=G.S.stars+1,r=reqOf(nx);
  if(!r)$('#goal').innerHTML='<b>TOWER 級達成</b>，繼續擴建同保持住客滿意';
  else{const items=r.pop?[`人口 ${pop().toLocaleString('en-US')} / ${r.pop.toLocaleString('en-US')}`]:[];for(const t of r.need||[])items.push(`${TYPES[t].name} ${count(t)?'✓':'未起'}`);items.push(`名氣 ${Math.round(G.S.rep/REP_MAX*100)}%`);
    $('#goal').innerHTML=`<b>升 ${nx===TOWER_STAR?'TOWER':nx+'★'}：</b>${items.join('・')}`;}
  updInfo();
}
