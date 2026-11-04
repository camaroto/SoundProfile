/* eslint-disable */
// Moldura Kraken (animação em canvas). Código original da moldura, com a proteção `dead` abaixo.
/* KrakenFrame — anima a moldura em camadas (canvas 2D). Sem dependências.
   new KrakenFrame(canvas,{frame:url,red:url,disc:url,level:0|1|2}) */
class KrakenFrame{
 constructor(c,o){
  this.c=c;this.x=c.getContext('2d');this.level=o.level??1;this.t=0;this.last=0;this.vis=true;
  this.W0=2167;this.H0=726;this.P=[];this.G=[];this.img={};
  this.AMP=[.6,2,4.2];this.RED=[.25,.5,.8];this.SH=[.14,.26,.42];this.NB=[8,16,30];this.NG=[2,4,8];this.ROT=[4,8,14];
  this.STARS=[[126,123],[1253,80],[432,418],[1227,430],[2072,142],[2082,410]];
  this.mq=matchMedia('(prefers-reduced-motion: reduce)');
  Promise.all(['frame','red','disc'].map(k=>new Promise(r=>{const i=new Image();i.onload=()=>{this.img[k]=i;r()};i.src=o[k]}))).then(()=>this.init());
 }
 init(){
  if(this.dead)return;
  this.fp=this.sample(this.img.frame);this.rp=this.sample(this.img.red);
  this.ro=new ResizeObserver(()=>this.resize());this.ro.observe(this.c);
  this.io=new IntersectionObserver(e=>{this.vis=e[0].isIntersecting;this.sync()});this.io.observe(this.c);
  this.mq.addEventListener('change',()=>this.sync());
  document.addEventListener('visibilitychange',this.vc=()=>this.sync());
  this.resize();this.sync();
 }
 sample(img){const s=4,c=document.createElement('canvas');c.width=img.width/s|0;c.height=img.height/s|0;
  const g=c.getContext('2d');g.drawImage(img,0,0,c.width,c.height);const d=g.getImageData(0,0,c.width,c.height).data,p=[];
  for(let i=0;i<d.length;i+=4)if(d[i+3]>150){const n=i/4;p.push([(n%c.width)*s/img.width*this.W0,(n/c.width|0)*s/img.height*this.H0])}
  return p}
 resize(){
  const w=Math.min(Math.round(this.c.clientWidth*Math.min(devicePixelRatio||1,2)),1800);if(!w)return;
  this.c.width=w;this.c.height=Math.round(w*this.H0/this.W0);
  this.tmp=document.createElement('canvas');this.tmp.width=this.c.width;this.tmp.height=this.c.height;
  this.x.imageSmoothingQuality='high';this.draw(this.t,this.mq.matches);
 }
 setLevel(n){this.level=n;if(this.mq.matches)this.draw(0,true)}
 sync(){const on=this.vis&&!document.hidden&&!this.mq.matches;
  if(on&&!this.raf){this.last=performance.now();this.raf=requestAnimationFrame(n=>this.loop(n))}
  if(!on){cancelAnimationFrame(this.raf);this.raf=0;if(this.mq.matches)this.draw(0,true)}}
 loop(n){this.raf=requestAnimationFrame(n=>this.loop(n));if(n-this.last<33)return;
  const dt=Math.min(.1,(n-this.last)/1000);this.last=n;this.t+=dt;this.draw(this.t,false,dt)}
 dyf(i,t,A){return A*(Math.sin(i*.011+t)+.5*Math.sin(i*.027-t*1.7))}
 dxf(j,t,A){return A*.8*Math.sin(j*.02+t*.9)}
 off(px,py,t,A,w){return[(px<.14*w||px>.86*w)?this.dxf(py,t,A):0,this.dyf(px,t,A)]}
 warp(img,op,al,A,t){
  const x=this.x,w=this.c.width,h=this.c.height;x.globalCompositeOperation=op;x.globalAlpha=al;
  if(!A){x.drawImage(img,0,0,w,h);return}
  const T=this.tmp,tx=T.getContext('2d'),sw=Math.max(3,Math.round(w/260)),sx=img.width/w;
  tx.clearRect(0,0,w,h);
  for(let i=0;i<w;i+=sw)tx.drawImage(img,i*sx,0,(sw+1)*sx,img.height,i,this.dyf(i,t,A),sw+1,h);
  const m0=w*.14|0,m1=w*.86|0,sh=3;
  x.drawImage(T,m0,0,m1-m0,h,m0,0,m1-m0,h);
  for(let j=0;j<h;j+=sh){const d=this.dxf(j,t,A);
   x.drawImage(T,0,j,m0,sh+1,d,j,m0,sh+1);x.drawImage(T,m1,j,w-m1,sh+1,m1+d,j,w-m1,sh+1)}
 }
 glow(x,px,py,r,col,a){const g=x.createRadialGradient(px,py,0,px,py,r);g.addColorStop(0,`rgba(${col},${a})`);g.addColorStop(1,`rgba(${col},0)`);x.fillStyle=g;x.fillRect(px-r,py-r,2*r,2*r)}
 draw(t,st,dt=0){
  if(!this.img.frame)return;
  const x=this.x,w=this.c.width,h=this.c.height,k=w/this.W0,L=this.level,A=st?0:this.AMP[L]*w/1800;
  x.setTransform(1,0,0,1,0,0);x.globalAlpha=1;x.globalCompositeOperation='source-over';x.clearRect(0,0,w,h);
  this.warp(this.img.frame,'source-over',1,A,t);
  if(!st){
   // reflexos de água percorrendo a borda (só sobre pixels da moldura)
   x.globalCompositeOperation='source-atop';
   [[.11,'120,255,235',1],[-.08,'90,255,160',.6]].forEach(([v,col,m],i)=>{
    const cx=(((t*v+i*.5)%1.4+1.4)%1.4-.2)*w,bw=w*.1,g=x.createLinearGradient(cx-bw,0,cx+bw,0);
    g.addColorStop(0,`rgba(${col},0)`);g.addColorStop(.5,`rgba(${col},${this.SH[L]*m})`);g.addColorStop(1,`rgba(${col},0)`);
    x.globalAlpha=1;x.fillStyle=g;x.fillRect(0,0,w,h)});
   // iluminação vermelha ocasional
   const p=Math.pow(Math.max(0,Math.sin(t*.7)),3),ra=this.RED[L]*p;
   if(ra>.02)this.warp(this.img.red,'lighter',ra,A,t);
  }
  x.globalAlpha=1;x.globalCompositeOperation='lighter';
  // estrelas verdes
  this.STARS.forEach(([sx,sy],i)=>{
   const tw=st?.35:Math.pow(Math.max(0,Math.sin(t*1.3+i*1.9)),4),[ox,oy]=this.off(sx*k,sy*k,t,A,w),px=sx*k+ox,py=sy*k+oy;
   this.glow(x,px,py,(18+22*tw)*k*1.6,'110,255,170',(.25+.6*tw)*(.6+.2*L));
   if(tw>.45){const l=30*k*tw;x.strokeStyle=`rgba(200,255,225,${tw*.8})`;x.lineWidth=1.2*k+.4;x.beginPath();x.moveTo(px-l,py);x.lineTo(px+l,py);x.moveTo(px,py-l);x.lineTo(px,py+l);x.stroke()}});
  if(!st){
   // brilhos nas ventosas
   if(this.G.length<this.NG[L]&&Math.random()<.08)this.G.push({p:this.rp[Math.random()*this.rp.length|0],a:0,d:.7+Math.random()*.8});
   this.G=this.G.filter(g=>(g.a+=dt)<g.d);
   this.G.forEach(g=>{const f=Math.sin(Math.PI*g.a/g.d),[ox,oy]=this.off(g.p[0]*k,g.p[1]*k,t,A,w);
    this.glow(x,g.p[0]*k+ox,g.p[1]*k+oy,9*k*1.6,'210,255,255',f*.9)});
   // bolhas
   while(this.P.length<this.NB[L]&&this.fp.length)this.P.push(this.bub(true));
   this.P.forEach((b,i)=>{b.a+=dt/b.d;if(b.a>=1)return this.P[i]=this.bub();
    const px=(b.p[0]+Math.sin(b.a*6+b.ph)*8)*k,py=(b.p[1]-b.a*90)*k,al=Math.sin(Math.PI*b.a)*.7;
    x.strokeStyle=`rgba(170,255,250,${al})`;x.lineWidth=Math.max(1,k*1.4);x.beginPath();x.arc(px,py,b.r*k,0,7);x.stroke();
    x.fillStyle=`rgba(255,255,255,${al})`;x.fillRect(px-b.r*k*.4,py-b.r*k*.45,k*1.6,k*1.6)});
  }
  // bússola flutuando
  x.globalCompositeOperation='source-over';
  const [ox,oy]=this.off(292*k,629*k,t,A,w),R=50*k,bob=st?0:Math.sin(t*.8)*1.5*k;
  x.save();x.translate(292*k+ox,629*k+oy+bob);x.rotate(st?0:Math.sin(t*.45)*this.ROT[L]*Math.PI/180);
  x.drawImage(this.img.disc,-R,-R,2*R,2*R);x.restore();
 }
 bub(init){const p=this.fp[Math.random()*this.fp.length|0];return{p,a:init?Math.random():0,d:3+Math.random()*3,r:2+Math.random()*3.5,ph:Math.random()*6}}
 destroy(){this.dead=true;cancelAnimationFrame(this.raf);this.ro&&this.ro.disconnect();this.io&&this.io.disconnect();this.vc&&document.removeEventListener('visibilitychange',this.vc)}
}

export { KrakenFrame };
