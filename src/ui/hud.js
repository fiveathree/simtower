// 頂欄
import {REQ,fmt} from '../config.js';
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
  const m=$('#money');m.textContent=fmt(G.S.money);m.classList.toggle('neg',G.S.money<0);
  $('#pop').textContent=pop().toLocaleString('en-US');
  $('#stars').textContent=G.S.stars>=5?'TOWER':'★'.repeat(G.S.stars)+'☆'.repeat(5-G.S.stars);
  const d=Math.floor(G.S.t/1440),y=Math.floor(d/12)+1,q=Math.floor(d/3)%4+1,mn=Math.floor(G.S.t%1440),hh=String(Math.floor(mn/60)).padStart(2,'0'),mm=String(mn%60).padStart(2,'0');
  $('#dateL').textContent=`第${y}年 Q${q} ${d%3===2?'週末':'平日'}`;$('#clock').textContent=`${hh}:${mm}`;
  const nx=G.S.stars+1,r=REQ[nx];
  if(!r)$('#goal').innerHTML='<b>TOWER 級達成</b>，繼續擴建同保持住客滿意';
  else{const items=[`人口 ${pop()} / ${r.pop}`];if(r.sec)items.push(`保安室 ${count('security')?'✓':'未起'}`);if(r.hotel)items.push(`酒店房 ${count('hotel')} / ${r.hotel}`);if(r.cath)items.push(`天台教堂 ${count('cathedral')?'✓':'未起'}`);
    $('#goal').innerHTML=`<b>升 ${nx===5?'TOWER':nx+'★'}：</b>${items.join('・')}`;}
  updInfo();
}
