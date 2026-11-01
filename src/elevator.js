// 轎廂邏輯（SCAN）
import {ESPD,CAP} from './config.js';
import {G} from './state.js';
import {nextLeg} from './agents.js';

export function makeCar(u){G.cars.set(u.id,{u,pos:u.f,dir:0,riders:[],stop:0,moving:false,next:u.f,q:new Map()});}
export function hasAhead(c,dir,f){for(const a of c.riders)if((a.to-f)*dir>0)return true;for(const[g,q]of c.q)if(q.length&&(g-f)*dir>0)return true;return false;}
export function nearestDir(c,f){let best=0,bd=1e9;for(const a of c.riders){const d=Math.abs(a.to-f);if(d>0&&d<bd){bd=d;best=Math.sign(a.to-f);}}for(const[g,q]of c.q)if(q.length&&g!==f){const d=Math.abs(g-f);if(d<bd){bd=d;best=Math.sign(g-f);}}return best;}
export function stepCar(c,dt){
  for(const q of c.q.values())for(let i=q.length-1;i>=0;i--)if(q[i].dead)q.splice(i,1);
  for(let i=c.riders.length-1;i>=0;i--)if(c.riders[i].dead)c.riders.splice(i,1);
  if(c.stop>0){c.stop-=dt;return;}
  if(c.moving){
    const d=c.next-c.pos,s=ESPD*dt;
    if(Math.abs(d)>s){c.pos+=Math.sign(d)*s;return;}
    c.pos=c.next;const f=c.next,q=c.q.get(f)||[];
    const stop=c.riders.some(a=>a.to===f)||(c.riders.length<CAP&&q.some(a=>a.dir===c.dir))||!hasAhead(c,c.dir,f);
    if(!stop){c.next=f+c.dir;return;}
    c.moving=false;
  }
  const f=Math.round(c.pos);c.pos=f;let act=false;
  for(let i=c.riders.length-1;i>=0;i--){const a=c.riders[i];if(a.to===f){c.riders.splice(i,1);a.f=f;a.x=c.u.x+c.u.w/2;a.state='walk';a.li++;nextLeg(a);act=true;}}
  const q=c.q.get(f)||[];
  if(c.dir===0||!hasAhead(c,c.dir,f)){
    if(q.some(a=>a.dir===c.dir)&&c.dir!==0){}
    else if(q.length&&!c.riders.length)c.dir=q[0].dir;
    else c.dir=nearestDir(c,f);
  }
  if(c.dir!==0)for(let i=0;i<q.length&&c.riders.length<CAP;){const a=q[i];if(a.dir===c.dir){q.splice(i,1);a.state='ride';c.riders.push(a);act=true;}else i++;}
  if(act){c.stop=.45;return;}
  if(c.dir!==0&&!hasAhead(c,c.dir,f))c.dir=nearestDir(c,f);
  if(c.dir!==0){c.moving=true;c.next=f+c.dir;}
}
