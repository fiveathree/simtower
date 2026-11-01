// 啟動、主迴圈
import {SITE_URL,CW,FH,MPS} from './config.js';
import {G,V,cam,clampCam,hooks,load,save,initRuntime,newGame} from './state.js';
import {sim} from './schedule.js';
import {render,resize} from './render/world.js';
import {buildTools,setTool} from './ui/tools.js';
import {initHud,setSpeed,updHUD} from './ui/hud.js';
import {log,closeInfo,ask,alertBar,initPanels,firstRunHelp} from './ui/panels.js';
import {initInput} from './ui/input.js';

const $=s=>document.querySelector(s);
for(const[q,attr,file]of[['meta[property="og:image"]','content','og.png'],['meta[name="twitter:image"]','content','og.png'],['meta[property="og:url"]','content',''],['link[rel=canonical]','href','']])
  $(q)?.setAttribute(attr,SITE_URL+file);

V.cvs=$('#cv');V.ctx=V.cvs.getContext('2d');
Object.assign(hooks,{log,closeInfo,buildTools,ask,alert:alertBar});
initHud();initPanels();initInput();
resize();window.addEventListener('resize',resize);
const saved=load();
if(saved){G.S=saved;initRuntime();cam.x=60*CW;cam.y=-4*FH;cam.z=Math.min(1.8,Math.max(.4,V.VW/(95*CW)));clampCam();buildTools();}
else newGame();
setTool('inspect');setSpeed(1);updHUD();
firstRunHelp();
document.addEventListener('visibilitychange',()=>{if(document.hidden)save();});
setInterval(updHUD,200);
let lastTs=performance.now();
function frame(ts){const dt=Math.min(.1,(ts-lastTs)/1000);lastTs=ts;
  if(G.speed>0&&$('#modal').hidden){let gm=dt*MPS[G.speed];while(gm>0){const d=Math.min(.5,gm);sim(d);gm-=d;}}
  render();requestAnimationFrame(frame);}
requestAnimationFrame(frame);
