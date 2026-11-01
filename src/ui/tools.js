// 工具列
import {TYPES,ORDER,SW,SITE,CW,FH,fmt} from '../config.js';
import {G,V} from '../state.js';
import {ART,sprite} from '../render/art.js';
import {log} from './panels.js';

const $=s=>document.querySelector(s);
export function buildTools(){
  const nav=$('#tools');nav.innerHTML='';
  for(const k of ORDER){const d=TYPES[k],ban=SITE.ban.includes(k),locked=ban||d.star>G.S.stars;
    const b=document.createElement('button');b.className='tool'+(locked?' locked':'');b.id='tool-'+k;b.style.setProperty('--sw',SW[k]);
    b.setAttribute('aria-pressed',G.tool===k);
    b.innerHTML=`<i>${ART[k]?`<canvas width="56" height="40"></canvas>`:''}</i><b>${d.name}</b><small>${ban?'呢度冇':locked?d.star+'★ 解鎖':d.tool?'—':d.lift?fmt(d.cost)+'+':fmt(d.cost)}</small>`;
    b.title=d.desc;b.onclick=()=>{if(locked){log(ban?`${SITE.name}冇得起${d.name}`:`${d.name}要 ${d.star}★ 先解鎖`,'bad');return;}setTool(k);};
    nav.appendChild(b);
    if(ART[k]){const c=b.querySelector('canvas'),g=c.getContext('2d'),w=d.w*CW,h=(d.h||1)*FH,im=sprite(`${k}:0`,w,h,(q,a,e)=>ART[k](q,a,e,0)),sh=Math.min(im.width,im.height*1.4);g.drawImage(im,0,0,sh,sh/1.4,0,0,56,40);}}
}
export function setTool(k){G.tool=k;document.querySelectorAll('.tool').forEach(b=>b.setAttribute('aria-pressed',b.id==='tool-'+k));const d=TYPES[k];
  $('#hint').innerHTML=`<b>${d.name}</b> ${d.desc}`;V.cvs.style.cursor=k==='inspect'?'grab':'crosshair';}
