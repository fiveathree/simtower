// 資訊面板、訊息、對話框
import {TYPES,SITES,SLOTS,MAX_CARS,CAR_COST,FILMS,PARK_SLOTS,LEDGER,RENT,rentOf,tenantName,filmAppeal,HELP_KEY,fname,fmt} from '../config.js';
import {G,cam,clampCam,newGame,enter,load,save,useSlot,deleteSlot} from '../state.js';
import {removeUnit} from '../build.js';
import {addCar} from '../elevator.js';
import {setFilm,setRent,reasons} from '../economy.js';

const $=s=>document.querySelector(s);
export function log(msg,cls){const el=document.createElement('div');el.textContent=msg;if(cls)el.className=cls;const L=$('#log');L.appendChild(el);while(L.children.length>4)L.firstChild.remove();setTimeout(()=>el.remove(),6500);}
export function openInfo(id){
  G.sel=id;$('#info').hidden=false;
  $('#info').innerHTML='<div id="infoBody"></div><div id="infoCfg"></div><div class="acts"><button class="danger" id="infoDel">拆卸</button><button id="infoClose">關閉</button></div>';
  // 掣只起一次：內容每 200ms 更新，重畫掣會食咗撳擊
  $('#infoDel').onclick=()=>{const u=G.byId.get(G.sel);if(!u)return;removeUnit(u);log(`拆咗 ${fname(u.f)} ${TYPES[u.type].name}`);};
  $('#infoClose').onclick=closeInfo;
  updInfo();buildCfg();
}
// 電梯設定：同 updInfo 分開，下拉選單先唔會俾定時更新閂咗
function buildCfg(){
  const u=G.byId.get(G.sel),s=u&&G.cars.get(u.id),el=$('#infoCfg');
  if(u&&u.type==='cinema'){
    el.innerHTML=`<div class="films">${FILMS.map((f,i)=>`<button data-film="${i}">${f.name} ${fmt(f.cost)}</button>`).join('')}</div>`;
    el.onchange=null;
    el.onclick=e=>{const i=e.target.dataset.film;if(i==null)return;const err=setFilm(u,+i);if(err)log(err,'bad');else log(`戲院換片：${FILMS[+i].name}`,'good');};
    return;
  }
  if(u&&(TYPES[u.type].rent||TYPES[u.type].night||TYPES[u.type].sale)){
    const lv=u.rentLv??1;
    el.innerHTML=`<div class="rentRow"><span>${TYPES[u.type].sale?'售價':'租金'}</span>${RENT.map((r,i)=>`<button data-rent="${i}" aria-pressed="${i===lv}">${r.name}</button>`).join('')}</div>`;
    el.onchange=null;
    el.onclick=e=>{const i=e.target.dataset.rent;if(i==null)return;setRent(u,+i);buildCfg();updInfo();};
    return;
  }
  if(!s){el.innerHTML='';return;}
  const opts=c=>[...s.stops].reverse().map(f=>`<option value="${f}"${f===c.cfg.home?' selected':''}>${fname(f)}</option>`).join('');
  el.innerHTML=`<div class="carList">${s.cars.map((c,i)=>`<div class="car"><b>${i+1}</b><label>待命<select data-i="${i}" aria-label="轎廂 ${i+1} 待命樓層">${opts(c)}</select></label><button data-r="${i}" aria-pressed="${c.cfg.rush}" title="早上優先向上，傍晚優先向下">繁忙</button></div>`).join('')}</div>
  <button id="addCar"${s.cars.length>=MAX_CARS?' disabled':''}>加轎廂 ${fmt(CAR_COST)}</button>`;
  el.onchange=e=>{const i=e.target.dataset.i;if(i!=null)s.cars[+i].cfg.home=+e.target.value;};
  el.onclick=e=>{
    if(e.target.dataset.r!=null){const c=s.cars[+e.target.dataset.r];c.cfg.rush=!c.cfg.rush;e.target.setAttribute('aria-pressed',c.cfg.rush);}
    else if(e.target.id==='addCar'){const err=addCar(u);if(err)log(err,'bad');buildCfg();}
  };
}
export function closeInfo(){G.sel=null;$('#info').hidden=true;}
export function updInfo(){
  if(G.sel==null)return;const u=G.byId.get(G.sel);if(!u){closeInfo();return;}
  const d=TYPES[u.type],rows=[];
  const rng=u.h>1?`${fname(u.f)}–${fname(u.f+u.h-1)}`:fname(u.f);
  let status='運作中';
  if(['office','shop'].includes(u.type))status=u.unreach?'無法到達':u.occ?'已出租':'招租中';
  if(u.type==='condo')status=u.unreach?'無法到達':u.occ?'已售出':'待售';
  if(d.night)status=u.unreach?'無法到達':u.occ?'今晚有客':u.dirty?'污糟，等清潔':'空房';
  if(u.type==='parking')status=u.on?`${PARK_SLOTS} 個車位`:'未連斜路';
  if(u.type==='cinema'){const a=filmAppeal(u,Math.floor(G.S.t/1440));status=u.unreach?'無法到達':u.film?u.film.name:'未揀片';rows.push(['吸引力',u.film?Math.round(a*100)+'%':'—']);}
  if(u.type==='food')status=u.unreach?'無法到達':'營業中';
  const nm=(u.occ||u.type==='shop')&&tenantName(u);
  if(nm&&u.occ)rows.push(['租戶',nm]);
  rows.push(['位置',rng],['狀態',status]);
  if(d.lift){const s=G.cars.get(u.id);let w=0,r=0;for(const q of s.q.values())w+=q.length;for(const c of s.cars)r+=c.riders.length;rows.push(['轎廂',`${s.cars.length} / ${MAX_CARS}`],['載客',`${r} / ${s.cap*s.cars.length}`],['候梯人數',w],['維修費',`每季 ${fmt(d.carUpkeep*s.cars.length)}`]);}
  else if(d.pop||['food','shop','conference','cinema'].includes(u.type))rows.push(['而家喺度',u.present+' 人']);
  const mul=rentOf(u).mul;if(d.rent)rows.push(['租金',`每季 ${fmt(d.rent*mul)}`]);if(d.sale)rows.push(['售價',fmt(d.sale*mul)]);if(d.night)rows.push(['房租',`每晚 ${fmt(d.night*mul)}`]);if(d.upkeep)rows.push(['開支',`每季 ${fmt(d.upkeep)}`]);
  const hasSat=['office','condo','shop','hotel','suite'].includes(u.type);const s=Math.round(u.sat);
  $('#infoBody').innerHTML=`<h3>${d.name}</h3>${rows.map(r=>`<div class="row"><span>${r[0]}</span><span>${r[1]}</span></div>`).join('')}
  ${hasSat?`<div class="row"><span>評價</span><span>${s}</span></div><div class="bar"><i style="width:${s}%;background:${s>=60?'#62d38f':s>=30?'#f0c840':'#ff6b5d'}"></i></div>${reasons(u).length?`<div class="row"><span>原因</span><span>${reasons(u).join('、')}</span></div>`:''}`:''}`;
}
export function showHelp(){
  $('#mcard').innerHTML=`<h2>天際大廈 <span>點樣玩</span></h2>
  <p>喺空地起一座摩天大廈：放租辦公室、賣住宅、開酒店，安排好電梯等住客唔使等太耐，將大廈由 1★ 經營到 <b>TOWER</b>。</p>
  <ul>
   <li>所有人都由 <b>1F 大堂</b>出入。上層要有<b>電梯</b>（由一層拖到另一層）或<b>樓梯</b>先上得到。</li>
   <li>每一層下面要有樓面承托；用「樓面」可以拖曳鋪空地板。</li>
   <li>高樓用<b>快速電梯</b>：喺 16F、31F、46F 起<b>空中大堂</b>，快速電梯只停大堂，再轉普通電梯。用「查看」點電梯可以加轎廂、設待命樓層同繁忙策略。</li>
   <li><b>貨梯</b>專俾酒店清潔同餐廳送貨用，唔會同住客爭電梯。</li>
   <li>小心<b>火警</b>同<b>炸彈勒索</b>：要有保安室先救得切。<b>VIP</b> 嚟到唔好俾佢等電梯。點單位可以揀租金高中低，同睇評價原因。</li>
   <li>辦公室每季交租、住宅入住即賣出、快餐店靠午餐同訪客、酒店每晚收房租。</li>
   <li>小人顏色：黑＝正常、粉紅＝等得有啲耐、紅＝好嬲。等太耐租戶會喺季尾搬走。按「評價」睇邊度有問題。</li>
   <li>酒店退房後要<b>清潔房</b>執房先租得出。住宅同酒店唔好貼住辦公室或者快餐店，太嘈會扣評價。地庫<b>停車場</b>要用<b>斜路</b>由 B1 連落去。<b>戲院</b>要揀片，舊片冇人睇。</li>
   <li>人口＝租戶＋每日訪客。住客滿意，名氣就會慢慢升，訪客越嚟越多。升級條件：2★ 人口 300；3★ 人口 1,000＋保安室；4★ 人口 5,000＋醫療中心＋回收中心＋酒店套房；5★ 人口 10,000（高雄低四成半、香港高 5%）；TOWER 5★＋天台教堂＋地鐵站。</li>
  </ul>
  <p>操作：拖曳移動畫面、滾輪或雙指縮放、右鍵拖曳都可以移動；鍵盤 <kbd>WASD</kbd> 移動、<kbd>空白鍵</kbd> 暫停、<kbd>Esc</kbd> 取消工具。進度會自動儲存喺呢部機。</p>
  <div class="acts"><button class="primary" id="mOk">開始</button></div>`;
  $('#modal').hidden=false;$('#mOk').onclick=()=>{$('#modal').hidden=true;try{localStorage.setItem(HELP_KEY,'1');}catch(e){}};$('#mOk').focus();
}
export function askNew(){showSites(false);}
// 揀地點：first 係第一次玩，唔可以取消
export function showSites(first,then){
  const ids=['kaohsiung','hongkong','tokyo'];
  $('#mcard').innerHTML=`<h2>揀 <span>地點</span></h2>${first?'':`<p>會喺第 ${G.slot} 格重新開始，呢格目前嘅大廈會被清除。</p>`}
  <div class="sites">${ids.map(id=>{const s=SITES[id];return `<button data-site="${id}"><b>${s.name}</b><em>${s.diff}</em><small>${s.desc}</small><small>起始資金 ${fmt(s.money)}</small></button>`;}).join('')}</div>
  ${first?'':'<div class="acts"><button id="mNo">取消</button></div>'}`;
  $('#modal').hidden=false;
  if(!first)$('#mNo').onclick=()=>{$('#modal').hidden=true;};
  $('#mcard').querySelectorAll('[data-site]').forEach(b=>b.onclick=()=>{$('#modal').hidden=true;newGame(b.dataset.site);log(`${SITES[b.dataset.site].name}開工！`,'good');then&&then();});
}
function slotLine(n){
  const o=load(n);if(!o)return '空';
  const d=Math.floor(o.t/1440);
  return `${SITES[o.site].name}・${o.stars>=6?'TOWER':o.stars+'★'}・第${Math.floor(d/12)+1}年・${fmt(o.money)}`;
}
export function showSlots(){
  save();
  const rows=[];for(let n=1;n<=SLOTS;n++){const has=!!load(n);rows.push(`<div class="slot"><div><b>第 ${n} 格${n===G.slot?'（玩緊）':''}</b><small>${slotLine(n)}</small></div>
    <button data-open="${n}"${n===G.slot?' disabled':''}>${has?'讀取':'開新'}</button><button data-del="${n}"${has?'':' disabled'} class="danger">刪除</button></div>`);}
  $('#mcard').innerHTML=`<h2>存檔 <span>三格</span></h2><p>進度自動儲存喺而家玩緊嗰格。</p>${rows.join('')}<div class="acts"><button class="primary" id="mOk">關閉</button></div>`;
  $('#modal').hidden=false;$('#mOk').onclick=()=>{$('#modal').hidden=true;};
  $('#mcard').querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>{
    const n=+b.dataset.open,o=load(n);useSlot(n);
    if(o){enter(o);$('#modal').hidden=true;log(`讀取第 ${n} 格`,'good');}else showSites(true);
  });
  $('#mcard').querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{
    const n=+b.dataset.del;
    ask('刪除存檔？',`第 ${n} 格（${slotLine(n)}）會永久刪除。`,[
      {label:'取消',fn:showSlots},
      {label:'刪除',primary:true,fn:()=>{deleteSlot(n);if(n===G.slot)showSites(true);else showSlots();}},
    ]);
  });
}
export function initPanels(){$('#helpBtn').onclick=showHelp;$('#newBtn').onclick=askNew;$('#finBtn').onclick=showFinance;$('#slotBtn').onclick=showSlots;}
// 遊戲內對話框：開住時模擬會暫停
export function ask(title,body,btns){
  $('#mcard').innerHTML=`<h2>${title}</h2><p>${body}</p><div class="acts">${btns.map((b,i)=>`<button data-b="${i}"${b.primary?' class="primary"':''}${b.disabled?' disabled':''}>${b.label}</button>`).join('')}</div>`;
  $('#modal').hidden=false;
  $('#mcard').querySelectorAll('[data-b]').forEach(el=>el.onclick=()=>{$('#modal').hidden=true;btns[+el.dataset.b].fn();});
}
export function alertBar(msg,f,x){
  const el=$('#alert');el.hidden=!msg;if(!msg)return;
  el.innerHTML=`<span></span><button>去睇</button>`;el.firstChild.textContent=msg;
  el.lastChild.onclick=()=>{cam.x=x*8;cam.y=-f*28;cam.z=Math.max(cam.z,1);clampCam();};
}
const sumLed=(l,sign)=>Object.values(l).reduce((a,v)=>a+(v*sign>0?v:0),0);
export function showFinance(){
  const qs=[...G.S.fin,{y:0,q:0,led:G.S.led,now:true}].slice(-5).filter(x=>!x.now);
  const max=Math.max(1,...qs.flatMap(q=>[sumLed(q.led,1),-sumLed(q.led,-1)]));
  const bars=qs.length?qs.map(q=>{const a=sumLed(q.led,1),b=-sumLed(q.led,-1);return `<div class="fq"><div class="fbars"><i class="in" style="height:${a/max*100}%" title="收入 ${fmt(a)}"></i><i class="out" style="height:${b/max*100}%" title="支出 ${fmt(b)}"></i></div><small>${q.y}年Q${q.q}</small></div>`;}).join(''):'<p class="fnone">未夠一季，季尾先有數</p>';
  const last=G.S.fin[G.S.fin.length-1],cols=[['今季至今',G.S.led],...(last?[[`${last.y}年Q${last.q}`,last.led]]:[])];
  const keys=Object.keys(LEDGER).filter(k=>cols.some(c=>c[1][k]));
  const net=l=>Object.values(l).reduce((a,v)=>a+v,0);
  $('#mcard').innerHTML=`<h2>財務 <span>報表</span></h2>
  <div class="flegend"><span><i class="in"></i>收入</span><span><i class="out"></i>支出</span></div>
  <div class="fchart">${bars}</div>
  <div class="ftable"><table><thead><tr><th></th>${cols.map(c=>`<th>${c[0]}</th>`).join('')}</tr></thead><tbody>
  ${keys.map(k=>`<tr><td>${LEDGER[k]}</td>${cols.map(c=>`<td>${c[1][k]?fmt(c[1][k]):'—'}</td>`).join('')}</tr>`).join('')}
  <tr class="ftotal"><td>淨額</td>${cols.map(c=>`<td>${fmt(net(c[1]))}</td>`).join('')}</tr></tbody></table></div>
  <div class="acts"><button class="primary" id="mOk">關閉</button></div>`;
  $('#modal').hidden=false;$('#mOk').onclick=()=>{$('#modal').hidden=true;};
}
export function firstRunHelp(then){let seen=false;try{seen=!!localStorage.getItem(HELP_KEY);}catch(e){}if(seen)then&&then();else{showHelp();const ok=$('#mOk').onclick;$('#mOk').onclick=()=>{ok();then&&then();};}}
