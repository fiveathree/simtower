// 資訊面板、訊息、對話框
import {TYPES,CAP,HELP_KEY,fname,fmt} from '../config.js';
import {G,newGame} from '../state.js';
import {removeUnit} from '../build.js';

const $=s=>document.querySelector(s);
export function log(msg,cls){const el=document.createElement('div');el.textContent=msg;if(cls)el.className=cls;const L=$('#log');L.appendChild(el);while(L.children.length>4)L.firstChild.remove();setTimeout(()=>el.remove(),6500);}
export function openInfo(id){
  G.sel=id;$('#info').hidden=false;
  $('#info').innerHTML='<div id="infoBody"></div><div class="acts"><button class="danger" id="infoDel">拆卸</button><button id="infoClose">關閉</button></div>';
  // 掣只起一次：內容每 200ms 更新，重畫掣會食咗撳擊
  $('#infoDel').onclick=()=>{const u=G.byId.get(G.sel);if(!u)return;removeUnit(u);log(`拆咗 ${fname(u.f)} ${TYPES[u.type].name}`);};
  $('#infoClose').onclick=closeInfo;
  updInfo();
}
export function closeInfo(){G.sel=null;$('#info').hidden=true;}
export function updInfo(){
  if(G.sel==null)return;const u=G.byId.get(G.sel);if(!u){closeInfo();return;}
  const d=TYPES[u.type],rows=[];
  const rng=u.h>1?`${fname(u.f)}–${fname(u.f+u.h-1)}`:fname(u.f);
  let status='運作中';
  if(['office','shop'].includes(u.type))status=u.unreach?'無法到達':u.occ?'已出租':'招租中';
  if(u.type==='condo')status=u.unreach?'無法到達':u.occ?'已售出':'待售';
  if(u.type==='hotel')status=u.unreach?'無法到達':u.occ?'今晚有客':'空房';
  if(u.type==='food')status=u.unreach?'無法到達':'營業中';
  rows.push(['位置',rng],['狀態',status]);
  if(u.type==='elevator'){const c=G.cars.get(u.id);let w=0;for(const q of c.q.values())w+=q.length;rows.push(['載客',`${c.riders.length} / ${CAP}`],['候梯人數',w],['維修費','每季 $10,000']);}
  else if(d.pop||u.type==='food'||u.type==='shop')rows.push(['而家喺度',u.present+' 人']);
  if(d.rent)rows.push(['租金',`每季 ${fmt(d.rent)}`]);if(d.sale)rows.push(['售價',fmt(d.sale)]);if(d.night)rows.push(['房租',`每晚 ${fmt(d.night)}`]);if(d.upkeep)rows.push(['開支',`每季 ${fmt(d.upkeep)}`]);
  const hasSat=['office','condo','shop','hotel'].includes(u.type);const s=Math.round(u.sat);
  $('#infoBody').innerHTML=`<h3>${d.name}</h3>${rows.map(r=>`<div class="row"><span>${r[0]}</span><span>${r[1]}</span></div>`).join('')}
  ${hasSat?`<div class="row"><span>評價</span><span>${s}</span></div><div class="bar"><i style="width:${s}%;background:${s>=60?'#62d38f':s>=30?'#f0c840':'#ff6b5d'}"></i></div>`:''}`;
}
export function showHelp(){
  $('#mcard').innerHTML=`<h2>天際大廈 <span>點樣玩</span></h2>
  <p>喺空地起一座摩天大廈：放租辦公室、賣住宅、開酒店，安排好電梯等住客唔使等太耐，將大廈由 1★ 經營到 <b>TOWER</b>。</p>
  <ul>
   <li>所有人都由 <b>1F 大堂</b>出入。上層要有<b>電梯</b>（由一層拖到另一層）或<b>樓梯</b>先上得到。</li>
   <li>每一層下面要有樓面承托；用「樓面」可以拖曳鋪空地板。</li>
   <li>辦公室每季交租、住宅入住即賣出、快餐店靠午餐同訪客、酒店每晚收房租。</li>
   <li>小人顏色：黑＝正常、粉紅＝等得有啲耐、紅＝好嬲。等太耐租戶會喺季尾搬走。按「評價」睇邊度有問題。</li>
   <li>升級條件：2★ 人口 200；3★ 人口 600＋保安室；4★ 人口 1,500＋10 間酒店房；TOWER 人口 3,000＋30F 以上天台教堂。</li>
  </ul>
  <p>操作：拖曳移動畫面、滾輪或雙指縮放、右鍵拖曳都可以移動；鍵盤 <kbd>WASD</kbd> 移動、<kbd>空白鍵</kbd> 暫停、<kbd>Esc</kbd> 取消工具。進度會自動儲存喺呢部機。</p>
  <div class="acts"><button class="primary" id="mOk">開始</button></div>`;
  $('#modal').hidden=false;$('#mOk').onclick=()=>{$('#modal').hidden=true;try{localStorage.setItem(HELP_KEY,'1');}catch(e){}};$('#mOk').focus();
}
export function askNew(){
  $('#mcard').innerHTML=`<h2>開新遊戲？</h2><p>目前嘅大廈會被清除，重新由起步樓宇開始。</p>
  <div class="acts"><button id="mNo">取消</button><button class="primary" id="mYes">開新遊戲</button></div>`;
  $('#modal').hidden=false;$('#mNo').onclick=()=>$('#modal').hidden=true;
  $('#mYes').onclick=()=>{$('#modal').hidden=true;newGame();log('新遊戲開始','good');};
}
export function initPanels(){$('#helpBtn').onclick=showHelp;$('#newBtn').onclick=askNew;}
export function firstRunHelp(){let seen=false;try{seen=!!localStorage.getItem(HELP_KEY);}catch(e){}if(!seen)showHelp();}
