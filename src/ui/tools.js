// 工具列
import {TYPES,ORDER,SW,fmt} from '../config.js';
import {G,V} from '../state.js';
import {log} from './panels.js';

const $=s=>document.querySelector(s);
export function buildTools(){
  const nav=$('#tools');nav.innerHTML='';
  for(const k of ORDER){const d=TYPES[k],locked=d.star>G.S.stars;
    const b=document.createElement('button');b.className='tool'+(locked?' locked':'');b.id='tool-'+k;b.style.setProperty('--sw',SW[k]);
    b.setAttribute('aria-pressed',G.tool===k);
    b.innerHTML=`<i></i><b>${d.name}</b><small>${locked?d.star+'★ 解鎖':d.tool?'—':d.lift?fmt(d.cost)+'+':fmt(d.cost)}</small>`;
    b.title=d.desc;b.onclick=()=>{if(locked){log(`${d.name}要 ${d.star}★ 先解鎖`,'bad');return;}setTool(k);};
    nav.appendChild(b);}
}
export function setTool(k){G.tool=k;document.querySelectorAll('.tool').forEach(b=>b.setAttribute('aria-pressed',b.id==='tool-'+k));const d=TYPES[k];
  $('#hint').innerHTML=`<b>${d.name}</b> ${d.desc}`;V.cvs.style.cursor=k==='inspect'?'grab':'crosshair';}
