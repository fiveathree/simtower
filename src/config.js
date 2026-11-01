// 設施資料、常數同小工具。轉 domain 時改 SITE_URL，同時改 index.html 嘅 og／twitter 網址。
export const SITE_URL='https://fiveathree.github.io/simtower/';
export const SAVE_VERSION=2;
export const SAVE_KEY='skytower_save',LEGACY_KEY='skytower_v1',HELP_KEY='skytower_v1_help';
export const CW=8,FH=28,W=120,MINF=-6,MAXF=60,NF=MAXF-MINF+1,WALK=7,ESPD=5,CAP=15;
export const MPS=[0,10,25,60];
export const fi=f=>f-MINF;
export const rnd=(a,b)=>a+Math.random()*(b-a);
export const fmt=n=>(n<0?'−$':'$')+Math.abs(Math.round(n)).toLocaleString('en-US');
export const fname=f=>f>=0?(f+1)+'F':'B'+(-f);

export const TYPES={
 inspect:{name:'查看',tool:true,star:1,desc:'點單位睇詳情；拖曳移動畫面、滾輪縮放'},
 floor:{name:'樓面',w:1,h:1,cost:500,star:1,paint:true,desc:'空樓面，用嚟承托上一層。可拖曳連續鋪'},
 lobby:{name:'大堂',w:1,h:1,cost:1000,star:1,paint:true,desc:'只可以起喺 1F，所有人經大堂出入'},
 office:{name:'辦公室',w:9,h:1,cost:40000,star:1,pop:6,rent:10000,desc:'6 人返工，每季交租 $10,000'},
 condo:{name:'住宅',w:12,h:1,cost:80000,star:1,pop:3,sale:150000,desc:'有人入住即賣出 $150,000'},
 food:{name:'快餐店',w:12,h:1,cost:50000,star:1,desc:'午餐同訪客幫襯，每位 $40'},
 stairs:{name:'樓梯',w:6,h:2,cost:5000,star:1,desc:'連接呢層同上一層，只適合短距離'},
 elevator:{name:'電梯',w:4,cost:30000,per:4000,star:1,desc:'由一層拖到另一層；每層 +$4,000，最多 30 層'},
 hotel:{name:'酒店房',w:5,h:1,cost:20000,star:2,pop:2,night:1500,desc:'每晚有客 $1,500'},
 shop:{name:'商店',w:8,h:1,cost:60000,star:2,rent:12000,desc:'每季交租 $12,000，吸引訪客'},
 security:{name:'保安室',w:12,h:1,cost:100000,star:2,upkeep:20000,desc:'升 3★ 必需，每季開支 $20,000'},
 cathedral:{name:'天台教堂',w:24,h:3,cost:3000000,star:4,minF:29,desc:'只可起喺 30F 或以上；建成並夠人口即 TOWER'},
 bulldoze:{name:'拆卸',tool:true,star:1,desc:'拆走單位或空樓面（無退款）'},
};
export const ORDER=['inspect','floor','lobby','office','condo','food','stairs','elevator','hotel','shop','security','cathedral','bulldoze'];
export const SW={inspect:'#98a0a9',floor:'#77736a',lobby:'#ece5d6',office:'#9fc4d6',condo:'#e8c99a',food:'#f0a04b',stairs:'#b9ae98',elevator:'#d9dde2',hotel:'#c6a6dd',shop:'#7fcfa0',security:'#6f8fd0',cathedral:'#f2d27a',bulldoze:'#ff6b5d'};
export const REQ={2:{pop:200},3:{pop:600,sec:1},4:{pop:1500,hotel:10},5:{pop:3000,cath:1}};
