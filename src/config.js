// 設施資料、常數同小工具。轉 domain 時改 SITE_URL，同時改 index.html 嘅 og／twitter 網址。
export const SITE_URL='https://fiveathree.github.io/simtower/';
export const SAVE_VERSION=6;
export const SAVE_KEY='skytower_save',LEGACY_KEY='skytower_v1',HELP_KEY='skytower_v1_help',SLOT_KEY='skytower_slot',SLOTS=3;
export const CW=8,FH=28,MINF=-6,WALK=7,ESPD=5,CAP=15;
// 地點：req 係人口目標倍數，towerPop 係 TOWER 額外人口，metro 係地鐵客量倍數，cap 係商業容量倍數，rent 係租金倍數。classic 只俾舊存檔用
export const SITES={
 classic:{name:'天際市',w:120,top:60,money:2000000,req:1,metro:1,rent:1,ban:[],seed:11,tint:'#7ab2e3',mix:0,city:'#5d6b85',hMax:260,wMin:30,wVar:70,desc:''},
 kaohsiung:{name:'高雄',diff:'容易',w:120,top:39,money:5000000,req:.55,metro:1,rent:1,ban:[],seed:23,tint:'#f6c48a',mix:.22,city:'#6d7f8f',hMax:170,wMin:40,wVar:80,land:'crane',desc:'資金多，最高 40F，人口目標低四成半'},
 hongkong:{name:'香港',diff:'中等',w:80,top:99,money:2000000,req:1.05,metro:1,rent:1,ban:[],seed:37,tint:'#a9c6dc',mix:.18,city:'#566273',hMax:380,wMin:24,wVar:44,land:'hill',desc:'地盤窄（80 格），可以起到 100F，要靠快速電梯'},
 tokyo:{name:'東京',diff:'困難',w:120,top:60,money:1500000,req:1,towerPop:12000,metro:1.6,cap:1.2,rent:1.2,ban:['condo'],seed:53,tint:'#d9a6c0',mix:.2,city:'#5c5c78',hMax:300,wMin:26,wVar:50,land:'tower',desc:'以辦公室為主：冇住宅、資金少，租金高兩成，TOWER 要 12,000 人'},
};
export let SITE,W,MAXF,NF,SKY_FLOORS;
export function setSite(id){
  SITE={id,...SITES[id]};W=SITE.w;MAXF=SITE.top;NF=MAXF-MINF+1;
  SKY_FLOORS=[];for(let f=15;f<MAXF;f+=15)SKY_FLOORS.push(f);
}
setSite('classic');
export const MPS=[0,10,25,60];
export const MAX_CARS=8,CAR_COST=20000;
export const LEDGER={rent:'租金',sale:'住宅售出',food:'餐飲',hotel:'酒店',ticket:'戲院',conf:'會議',ad:'廣告',build:'建築',upkeep:'電梯維修',ops:'設施開支',film:'買片',event:'事件'};
export const RENT=[{name:'低',mul:.7,occ:1.4,sat:1.5},{name:'中',mul:1,occ:1,sat:0},{name:'高',mul:1.4,occ:.5,sat:-1.5}];
export const rentOf=u=>RENT[u.rentLv??1];
export const NAMES={
 office:['金輝貿易','大發物流','恆昌會計','新星設計','永利保險','宏達工程','天行軟件','富華地產','卓越顧問','明德律師行','盛世廣告','東方船務'],
 condo:['陳生一家','李太','黃氏夫婦','何小姐','張家','林生','梁太一家','吳伯伯','鄭生夫婦','周小姐','馮家','羅生'],
 shop:['金鳳茶餐室手信','小王子玩具','時代書局','好運士多','美麗時裝','快捷電器','老友記鐘錶','花花世界'],
 hotel:['王先生','Ms. Tanaka','Mr. Smith','趙女士','劉先生','Mme. Dubois','孫小姐','Mr. Kim'],
};
export const tenantName=u=>{const a=NAMES[TYPES[u.type].night?'hotel':u.type];return a?a[u.id%a.length]:null;};
export const TOWER_STAR=6; // 5★ 之後嘅 TOWER
export const REP_MAX=300; // 名氣滿分要約 300 日，即 4× 大約 2 粒鐘
export const PARK_SLOTS=10,TICKET=300,CONF_FEE=8000,AD_PER_FLOOR=500;
export const FILMS=[{name:'動作大片',cost:200000,a:1},{name:'愛情喜劇',cost:120000,a:.7},{name:'獨立電影',cost:50000,a:.35}];
export const filmAppeal=(u,day)=>u.film?u.film.a*Math.max(.05,1-(day-u.film.day)/12):0; // 上映一年就冇人睇
export const fi=f=>f-MINF;
export const rnd=(a,b)=>a+Math.random()*(b-a);
export const fmt=n=>(n<0?'−$':'$')+Math.abs(Math.round(n)).toLocaleString('en-US');
export const fname=f=>f>=0?(f+1)+'F':'B'+(-f);

export const TYPES={
 inspect:{name:'查看',tool:true,star:1,desc:'點單位睇詳情；拖曳移動畫面、滾輪縮放'},
 floor:{name:'樓面',w:1,h:1,cost:500,star:1,paint:true,desc:'空樓面，用嚟承托上一層。可拖曳連續鋪'},
 lobby:{name:'大堂',w:1,h:1,cost:1000,star:1,paint:true,desc:'只可以起喺 1F，所有人經大堂出入'},
 office:{name:'辦公室',w:9,h:1,cost:40000,star:1,pop:6,rent:10000,noisy:true,desc:'6 人返工，每季交租 $10,000'},
 condo:{name:'住宅',w:12,h:1,cost:80000,star:1,pop:3,sale:150000,quiet:true,desc:'有人入住即賣出 $150,000'},
 food:{name:'快餐店',w:12,h:1,cost:50000,star:1,noisy:true,desc:'午餐同訪客幫襯，每位 $40'},
 stairs:{name:'樓梯',w:6,h:2,cost:5000,star:1,desc:'連接呢層同上一層，只適合短距離'},
 elevator:{name:'電梯',w:4,cost:30000,per:4000,star:1,lift:true,maxH:30,cap:CAP,spd:ESPD,carUpkeep:10000,desc:'每層都停。由一層拖到另一層；每層 +$4,000，最多跨 30 層；點電梯可以加轎廂'},
 express:{name:'快速電梯',w:6,cost:60000,per:6000,star:3,lift:true,express:true,maxH:999,cap:30,spd:12,carUpkeep:20000,desc:'只停 1F 大堂同空中大堂，可以跨全幢。每層 +$6,000，每季每轎廂維修 $20,000'},
 service:{name:'貨梯',w:4,cost:30000,per:4000,star:2,lift:true,service:true,maxH:30,cap:CAP,spd:ESPD,carUpkeep:10000,desc:'只俾酒店清潔同餐廳送貨用，住客同訪客唔會搭'},
 skylobby:{name:'空中大堂',w:1,h:1,cost:1000,star:3,paint:true,desc:'只可以起喺 16F、31F、46F……每 15 層一個，係快速電梯嘅轉梯點'},
 hotel:{name:'酒店房',w:5,h:1,cost:20000,star:2,pop:2,night:1500,quiet:true,desc:'每晚有客 $1,500；退房後要清潔先可以再租'},
 suite:{name:'酒店套房',w:10,h:1,cost:60000,star:3,pop:4,night:4000,quiet:true,desc:'每晚有客 $4,000；升 4★ 必需'},
 housekeeping:{name:'清潔房',w:12,h:1,cost:50000,star:2,staff:6,always:true,upkeep:10000,desc:'6 個清潔員。冇清潔房，退咗房嘅房間會一直污糟租唔出'},
 shop:{name:'商店',w:8,h:1,cost:60000,star:2,rent:12000,desc:'每季交租 $12,000，吸引訪客'},
 security:{name:'保安室',w:12,h:1,cost:100000,star:2,upkeep:20000,desc:'升 3★ 必需，每季開支 $20,000'},
 conference:{name:'會議廳',w:16,h:1,cost:100000,star:3,always:true,desc:'平日租俾辦公室開會，每次 $8,000'},
 cinema:{name:'戲院',w:24,h:2,cost:500000,star:3,always:true,desc:'晚上同週末吸客，每位 $300。要揀片，舊片會冇人睇'},
 clinic:{name:'醫療中心',w:16,h:1,cost:500000,star:3,always:true,upkeep:30000,desc:'升 4★ 必需，每季開支 $30,000'},
 billboard:{name:'天台廣告牌',w:12,h:2,cost:50000,star:2,always:true,roof:true,desc:'要起喺天台，每季 $20,000，每高一層多 $500'},
 parking:{name:'停車場',w:12,h:1,cost:30000,star:3,always:true,basement:true,upkeep:2000,desc:'地庫。要有斜路連到地面；車位夠多，住宅同酒店評價會升'},
 ramp:{name:'斜路',w:6,h:1,cost:20000,star:3,always:true,basement:true,desc:'由 B1 一層層向下連，停車場要連到斜路先用得'},
 recycle:{name:'回收中心',w:16,h:1,cost:500000,star:3,always:true,basement:true,upkeep:30000,desc:'地庫。升 4★ 必需，每季開支 $30,000'},
 metro:{name:'地鐵站',w:30,h:3,cost:1000000,star:4,always:true,basement:true,fixF:-6,desc:'只可以起喺 B6–B4，要有電梯或樓梯連到 B4。帶嚟大量訪客，TOWER 必需'},
 cathedral:{name:'天台教堂',w:24,h:3,cost:3000000,star:5,minF:29,always:true,desc:'只可起喺 30F 或以上；TOWER 必需'},
 bulldoze:{name:'拆卸',tool:true,star:1,desc:'拆走單位或空樓面（無退款）'},
};
export const ORDER=['inspect','floor','lobby','office','condo','food','stairs','elevator','express','skylobby','service','hotel','suite','housekeeping','shop','security','conference','cinema','clinic','billboard','parking','ramp','recycle','metro','cathedral','bulldoze'];
export const SW={inspect:'#98a0a9',floor:'#77736a',lobby:'#ece5d6',office:'#9fc4d6',condo:'#e8c99a',food:'#f0a04b',stairs:'#b9ae98',elevator:'#d9dde2',express:'#6fb6ff',skylobby:'#f4dfae',service:'#62d38f',hotel:'#c6a6dd',shop:'#7fcfa0',security:'#6f8fd0',suite:'#a884d0',housekeeping:'#8fd4c4',conference:'#b9c8e6',cinema:'#c0505a',clinic:'#f2f2f2',billboard:'#ffd27a',parking:'#7b7f86',ramp:'#a59b86',recycle:'#6db36d',metro:'#4f9de0',cathedral:'#f2d27a',bulldoze:'#ff6b5d'};
export const reqOf=n=>{const r=REQ[n];if(!r)return r;return{...r,pop:n===TOWER_STAR?SITE.towerPop||0:Math.round(r.pop*SITE.req)};};
export const REQ={2:{pop:300},3:{pop:1000,need:['security']},4:{pop:5000,need:['clinic','recycle','suite']},5:{pop:10000},6:{pop:0,need:['cathedral','metro']}};
