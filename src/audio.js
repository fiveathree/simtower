// 音效：全部即場合成，預設靜音，每次開遊戲都要玩家按掣先開（瀏覽器規定）
const GAP={ding:1200,coin:500,alarm:4000}; // 同一種音最少隔幾耐（ms）
let ac=null,master=null,crowd=null,on=false,volume=.25;
const last={};

export const soundOn=()=>on;
export function setVolume(v){volume=v;if(master)master.gain.value=v;}
function ensure(){
  if(ac)return;
  ac=new (window.AudioContext||window.webkitAudioContext)();
  master=ac.createGain();master.gain.value=volume;master.connect(ac.destination);
  // 人群聲：濾波白噪音，音量跟人數
  const buf=ac.createBuffer(1,ac.sampleRate*2,ac.sampleRate),d=buf.getChannelData(0);
  for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
  const src=ac.createBufferSource();src.buffer=buf;src.loop=true;
  const f=ac.createBiquadFilter();f.type='bandpass';f.frequency.value=700;f.Q.value=.6;
  crowd=ac.createGain();crowd.gain.value=0;
  src.connect(f);f.connect(crowd);crowd.connect(master);src.start();
}
export function setSound(v){
  on=v;
  if(v){ensure();ac.resume();}else if(ac)ac.suspend();
}
function tone(freq,at,dur,peak,type='sine'){
  const o=ac.createOscillator(),g=ac.createGain(),t=ac.currentTime+at;
  o.type=type;o.frequency.value=freq;
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(peak,t+.01);g.gain.exponentialRampToValueAtTime(.001,t+dur);
  o.connect(g);g.connect(master);o.start(t);o.stop(t+dur+.02);
}
export function sfx(name){
  if(!on||!ac)return;
  const now=performance.now();if(now-(last[name]||0)<GAP[name])return;last[name]=now;
  if(name==='ding'){tone(1320,0,.5,.3);tone(990,.14,.7,.3);}
  else if(name==='coin'){tone(1568,0,.09,.2,'square');tone(2093,.07,.22,.2,'square');}
  else if(name==='alarm')for(let i=0;i<3;i++){tone(880,i*.4,.18,.3,'sawtooth');tone(660,i*.4+.2,.18,.3,'sawtooth');}
}
export function setCrowd(n){if(crowd&&on)crowd.gain.value=Math.min(.12,n/4000);}
