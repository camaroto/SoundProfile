/* eslint-disable */
// Moldura Sakura (animação em canvas, sem imagens). Código original da moldura.
/* SakuraFrame — moldura vetorial animada (canvas 2D, sem imagens, sem dependências).
   new SakuraFrame(canvas,{level:0|1|2}) · setLevel(n) · destroy()
   Mesmos "encaixes" da moldura Kraken: banner em (140,90)-(2026,410) e avatar em (207,540) r=75, base 2167x726. */
class SakuraFrame{
 constructor(c,o={}){
  this.c=c;this.x=c.getContext('2d');this.level=o.level??1;this.t=0;this.last=0;this.vis=true;this.W0=2167;this.H0=726;
  this.AMP=[.5,1,1.8];this.NP=[6,14,26];this.GL=[.08,.16,.3];this.SH=[.2,.32,.48];this.P=[];
  this.mq=matchMedia('(prefers-reduced-motion: reduce)');
  this.build();this.sprite();
  this.ro=new ResizeObserver(()=>this.resize());this.ro.observe(c);
  this.io=new IntersectionObserver(e=>{this.vis=e[0].isIntersecting;this.sync()});this.io.observe(c);
  this.mq.addEventListener('change',()=>this.sync());
  document.addEventListener('visibilitychange',this.vc=()=>this.sync());
  this.resize();this.sync();
 }
 build(){
  let s=11;const R=()=>(s=(s*16807)%2147483647)/2147483647;this.B=[];this.T=[];
  const mk=(x,y,r)=>({x,y,r,rot:R()*6.28,ph:R()*6.28});
  for(let i=0;i<17;i++){const a=.35*Math.PI+i/16*1.55*Math.PI,d=96+R()*34;this.B.push(mk(207+Math.cos(a)*d,540+Math.sin(a)*d,15+R()*17))}
  const cl=(x0,y0,x1,y1,n,r0,r1)=>{const a=[];for(let i=0;i<n;i++)a.push(mk(x0+R()*(x1-x0),y0+R()*(y1-y0),r0+R()*(r1-r0)));
   a.sort((p,q)=>p.x-q.x);for(let i=1;i<n;i++){const p=a[i-1],q=a[i];this.T.push([p.x,p.y,(p.x+q.x)/2+(R()-.5)*50,(p.y+q.y)/2+(R()-.5)*60,q.x,q.y])}this.B.push(...a)};
  cl(120,40,600,130,15,13,28);cl(1880,40,2110,170,9,13,25);cl(1960,330,2110,470,7,13,23);cl(100,380,200,440,3,13,19);cl(150,610,430,690,6,12,22);
 }
 sprite(){
  const s=this.S=document.createElement('canvas');s.width=s.height=128;const x=s.getContext('2d');x.translate(64,64);
  for(let i=0;i<5;i++){x.save();x.rotate(i*Math.PI*2/5);x.beginPath();x.moveTo(0,0);
   x.bezierCurveTo(-26,-10,-30,-50,-9,-58);x.lineTo(0,-50);x.lineTo(9,-58);x.bezierCurveTo(30,-50,26,-10,0,0);
   const g=x.createRadialGradient(0,-8,2,0,-30,48);g.addColorStop(0,'#ffe6f1');g.addColorStop(.55,'#ff9cc6');g.addColorStop(1,'#ee4f98');
   x.fillStyle=g;x.fill();x.strokeStyle='rgba(255,255,255,.35)';x.lineWidth=1;x.stroke();x.restore()}
  x.fillStyle='#b3225f';x.beginPath();x.arc(0,0,5,0,7);x.fill();
  for(let i=0;i<6;i++){const a=i*1.047;x.beginPath();x.arc(Math.cos(a)*13,Math.sin(a)*13,2.2,0,7);x.fillStyle='#ffd35e';x.fill()}
 }
 resize(){
  const w=Math.min(Math.round(this.c.clientWidth*Math.min(devicePixelRatio||1,2)),1800);if(!w)return;
  this.c.width=w;this.c.height=Math.round(w*this.H0/this.W0);this.cache();this.draw(this.t,this.mq.matches);
 }
 cache(){ // camada estática: bordas, anel, galhos
  const w=this.c.width,h=this.c.height,k=w/this.W0,g=this.K=document.createElement('canvas');g.width=w;g.height=h;
  const x=g.getContext('2d'),gr=x.createLinearGradient(0,0,this.W0*k,0);
  gr.addColorStop(0,'#ffb3da');gr.addColorStop(.5,'#ff6fb2');gr.addColorStop(1,'#ffb3da');
  x.scale(k,k);x.strokeStyle=gr;x.shadowColor='rgba(255,90,170,.85)';x.shadowBlur=14*k;
  const rr=(a,b,c,d,r)=>{x.beginPath();x.roundRect(a,b,c,d,r)};
  x.lineWidth=5;rr(140,90,1886,320,16);x.stroke();x.lineWidth=2;rr(152,102,1862,296,10);x.stroke();
  x.lineWidth=7;x.beginPath();x.arc(207,540,88,0,7);x.stroke();x.lineWidth=2.5;x.beginPath();x.arc(207,540,79,0,7);x.stroke();
  x.shadowBlur=0;x.fillStyle='#ffd0e6';for(let i=0;i<36;i++){const a=i/36*6.283;x.beginPath();x.arc(207+Math.cos(a)*83.5,540+Math.sin(a)*83.5,1.6,0,7);x.fill()}
  x.lineCap='round';this.T.forEach(t=>{x.strokeStyle='#6b2349';x.lineWidth=5;x.beginPath();x.moveTo(t[0],t[1]);x.quadraticCurveTo(t[2],t[3],t[4],t[5]);x.stroke();
   x.strokeStyle='#c4588f';x.lineWidth=1.6;x.stroke()});
 }
 setLevel(n){this.level=n;if(this.mq.matches)this.draw(0,true)}
 sync(){const on=this.vis&&!document.hidden&&!this.mq.matches;
  if(on&&!this.raf){this.last=performance.now();this.raf=requestAnimationFrame(n=>this.loop(n))}
  if(!on){cancelAnimationFrame(this.raf);this.raf=0;if(this.mq.matches)this.draw(0,true)}}
 loop(n){this.raf=requestAnimationFrame(n=>this.loop(n));if(n-this.last<33)return;
  const dt=Math.min(.1,(n-this.last)/1000);this.last=n;this.t+=dt;this.draw(this.t,false,dt)}
 petal(init){return{x:100+Math.random()*2000,y:init?40+Math.random()*640:30+Math.random()*60,vy:28+Math.random()*38,s:4+Math.random()*4,rot:Math.random()*6,vr:(Math.random()-.5)*2,ph:Math.random()*6}}
 draw(t,st,dt=0){
  if(!this.K)return;
  const x=this.x,w=this.c.width,h=this.c.height,k=w/this.W0,L=this.level,A=st?0:this.AMP[L];
  x.setTransform(1,0,0,1,0,0);x.globalAlpha=1;x.globalCompositeOperation='source-over';x.clearRect(0,0,w,h);
  x.drawImage(this.K,0,0);
  if(!st){
   x.globalCompositeOperation='lighter';x.globalAlpha=this.GL[L]*(.5+.5*Math.sin(t*1.2));x.drawImage(this.K,0,0);
   x.globalCompositeOperation='source-atop';x.globalAlpha=1;
   const cx=(((t*.1)%1.4+1.4)%1.4-.2)*w,bw=w*.1,g=x.createLinearGradient(cx-bw,0,cx+bw,0);
   g.addColorStop(0,'rgba(255,230,245,0)');g.addColorStop(.5,`rgba(255,230,245,${this.SH[L]})`);g.addColorStop(1,'rgba(255,230,245,0)');
   x.fillStyle=g;x.fillRect(0,0,w,h);
  }
  x.setTransform(k,0,0,k,0,0);x.globalAlpha=1;
  if(!st){ // brilho percorrendo o anel do avatar
   x.globalCompositeOperation='lighter';x.lineCap='round';x.strokeStyle='rgba(255,225,240,.85)';x.lineWidth=5;
   const an=t*.7;x.beginPath();x.arc(207,540,88,an,an+.9);x.stroke();x.beginPath();x.arc(207,540,88,an+3.14,an+3.64);x.stroke();
  }
  x.globalCompositeOperation='source-over';
  this.B.forEach(b=>{const sw=Math.sin(t*.8+b.ph),sc=b.r/58;x.save();
   x.translate(b.x+sw*1.5*A,b.y+Math.sin(t*.6+b.ph)*2*A);x.rotate(b.rot+sw*.12*A);x.scale(sc,sc);x.drawImage(this.S,-64,-64);x.restore()});
  if(!st){
   x.globalCompositeOperation='lighter';
   this.B.forEach((b,i)=>{const tw=Math.pow(Math.max(0,Math.sin(t*1.1+i*2.3)),14);if(tw<.05)return;
    const g=x.createRadialGradient(b.x,b.y,0,b.x,b.y,b.r*1.3);g.addColorStop(0,`rgba(255,240,250,${tw*.9})`);g.addColorStop(1,'rgba(255,240,250,0)');
    x.fillStyle=g;x.fillRect(b.x-b.r*1.3,b.y-b.r*1.3,b.r*2.6,b.r*2.6)});
   x.globalCompositeOperation='source-over';
   while(this.P.length<this.NP[L])this.P.push(this.petal(true));if(this.P.length>this.NP[L])this.P.length=this.NP[L];
   this.P.forEach((p,i)=>{p.y+=p.vy*dt;p.rot+=p.vr*dt;if(p.y>700)return this.P[i]=this.petal();
    const px=p.x+Math.sin(p.y*.012+p.ph)*28,al=Math.min(1,p.y/80)*Math.min(1,(700-p.y)/80)*.85;
    x.save();x.translate(px,p.y);x.rotate(p.rot);x.globalAlpha=al;x.fillStyle='#ff9fcb';x.beginPath();x.ellipse(0,0,p.s,p.s*.55,0,0,7);x.fill();
    x.fillStyle='rgba(255,255,255,.45)';x.beginPath();x.ellipse(-p.s*.2,-p.s*.12,p.s*.45,p.s*.18,0,0,7);x.fill();x.restore()});
  }
 }
 destroy(){cancelAnimationFrame(this.raf);this.ro.disconnect();this.io.disconnect();document.removeEventListener('visibilitychange',this.vc)}
}

export { SakuraFrame };
