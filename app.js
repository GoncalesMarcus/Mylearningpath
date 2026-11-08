/* Educacional — Access Box and notebook roadmaps.
   Content lives in data/notebooks.js; this file only draws it. */
'use strict';
const ROADMAPS = window.NOTEBOOKS || {};
const CROSS = window.CONNECTIONS || [];
const SKIP = /^(Introduction|Conclusion|References)$/;

// Access Box: the three notebooks and their satellite topics, derived from the data file
const POS = [[-.33,-.27],[.33,-.2],[0,.36],[-.3,.3],[.3,.32]];
const MAIN = Object.keys(ROADMAPS).map((id,i)=>{
  const R = ROADMAPS[id], sub = [];
  (R.steps||[]).forEach(st=>{
    if(!SKIP.test(st.title)) sub.push(st.short||st.title);
    (st.topics||[]).forEach(tp=>{ if(!SKIP.test(tp.title)) sub.push(tp.short||tp.title); });
  });
  return {id, label:R.title, pos:POS[i%POS.length], sub:[...new Set(sub)]};
});

/* ---------- canvas ---------- */
const cv=document.getElementById('g'),ctx=cv.getContext('2d');
let W=0,H=0,DPR=1,cam={x:0,y:0,k:1};
const css=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const C={bg:css('--bg'),glow:css('--glow'),haze:css('--haze'),gold:css('--gold'),mist:css('--mist'),ivory:css('--ivory'),line:css('--line')};
function resize(){DPR=Math.min(2,devicePixelRatio||1);W=innerWidth;H=innerHeight;cv.width=W*DPR;cv.height=H*DPR;cam.k=Math.max(.62,Math.min(1,W/1300));}
resize();

/* ---------- nodes ---------- */
const nodes=[],edges=[],byId={};
function add(n){n.vx=0;n.vy=0;nodes.push(n);byId[n.id]=n;return n;}
const WW=()=>W/cam.k, HH=()=>H/cam.k;
MAIN.forEach(m=>{
  const M=add({id:m.id,label:m.label,main:true,x:m.pos[0]*WW(),y:m.pos[1]*HH()});
  const n=m.sub.length;
  m.sub.forEach((s,j)=>{const a=j/n*Math.PI*2+Math.random()*.3;
    const S=add({id:m.id+':'+s,label:s,main:false,parent:m.id,x:M.x+Math.cos(a)*190,y:M.y+Math.sin(a)*150});
    edges.push({a:M,b:S,len:150+Math.random()*60});});
});
for(let i=0;i<3;i++)edges.push({a:byId[MAIN[i].id],b:byId[MAIN[(i+1)%3].id],len:620,main:true});
CROSS.filter(([a,b])=>byId[a]&&byId[b]).forEach(([a,b])=>edges.push({a:byId[a],b:byId[b],len:420,cross:true}));

/* background constellation: unlabeled stars wired to nearby stars and topics, to give the dense web */
const stars=[];
(function(){const N=Math.round(Math.min(140,W*H/14000));
  for(let i=0;i<N;i++)stars.push({x:(Math.random()-.5)*WW()*1.6,y:(Math.random()-.5)*HH()*1.6,r:Math.random()*1.3+.3,ph:Math.random()*6.28,sp:.4+Math.random()*.8});
  stars.forEach((s,i)=>{const near=stars.map((o,j)=>[j,(o.x-s.x)**2+(o.y-s.y)**2]).filter(p=>p[0]!==i).sort((a,b)=>a[1]-b[1]).slice(0,2);
    near.forEach(([j])=>{if(i<j||Math.random()<.5)s.links=(s.links||[]).concat(j);});
    // hub lines: some stars reach toward a topic node, like the fans in Learn Anything
    if(Math.random()<.45){s.to=nodes[Math.floor(Math.random()*nodes.length)];}
  });})();

const FONT_MAIN='600 30px "Jost", system-ui, sans-serif', FONT_SUB='400 16px "Jost", system-ui, sans-serif';
function measure(){nodes.forEach(n=>{ctx.font=n.main?FONT_MAIN:FONT_SUB;n.w=ctx.measureText(n.label).width;n.h=n.main?34:20;});}

/* ---------- physics ---------- */
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
let dragNode=null,t=0;
function step(){
  t+=.01;
  const ex=Math.min(380,W*.42)/cam.k, ey=Math.min(150,H*.2)/cam.k; // keep the headline and search bar clear
  for(let i=0;i<nodes.length;i++){const a=nodes[i];
    for(let j=i+1;j<nodes.length;j++){const b=nodes[j];let dx=b.x-a.x,dy=b.y-a.y,d2=dx*dx+dy*dy+.01,d=Math.sqrt(d2);
      const minD=(a.w+b.w)/2+18;let f=(a.main||b.main?9000:3200)/d2;if(Math.abs(dy)<26&&d<minD)f+=(minD-d)*.05;
      dx/=d;dy/=d;a.vx-=dx*f;a.vy-=dy*f;b.vx+=dx*f;b.vy+=dy*f;}}
  edges.forEach(e=>{let dx=e.b.x-e.a.x,dy=e.b.y-e.a.y,d=Math.hypot(dx,dy)||1;const f=(d-e.len)*(e.cross?.0015:e.main?.002:.01);
    dx/=d;dy/=d;e.a.vx+=dx*f;e.a.vy+=dy*f;e.b.vx-=dx*f;e.b.vy-=dy*f;});
  nodes.forEach((n,i)=>{
    const q=(n.x/ex)**2+(n.y/ey)**2;if(q<1.15){const d=Math.hypot(n.x,n.y)||1;n.vx+=n.x/d*1.2;n.vy+=n.y/d*1.2;}
    // soft walls keep the graph roughly on screen
    const bx=WW()*.47,by=HH()*.45;if(Math.abs(n.x)>bx)n.vx-=Math.sign(n.x)*.6;if(Math.abs(n.y)>by)n.vy-=Math.sign(n.y)*.6;
    if(!reduce){n.vx+=Math.sin(t*.8+i*1.7)*.02;n.vy+=Math.cos(t*.6+i*2.3)*.02;}
    if(n===dragNode){n.vx=n.vy=0;return;}
    n.vx*=.85;n.vy*=.85;n.x+=n.vx;n.y+=n.vy;});
}

/* ---------- drawing ---------- */
let hover=null,focusSet=null;
function toWorld(sx,sy){return [cam.x+(sx-W/2)/cam.k,cam.y+(sy-H/2)/cam.k];}
function related(n){const s=new Set([n]);edges.forEach(e=>{if(e.a===n)s.add(e.b);if(e.b===n)s.add(e.a);});return s;}
function draw(){
  ctx.setTransform(DPR,0,0,DPR,0,0);
  ctx.fillStyle=C.bg;ctx.fillRect(0,0,W,H);
  let g=ctx.createRadialGradient(W*.5,H*.48,0,W*.5,H*.48,Math.max(W,H)*.65);
  g.addColorStop(0,C.glow);g.addColorStop(.55,'rgba(20,32,74,.35)');g.addColorStop(1,'rgba(6,10,24,0)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  g=ctx.createRadialGradient(W*.85,H*.1,0,W*.85,H*.1,W*.5);g.addColorStop(0,'rgba(36,26,70,.55)');g.addColorStop(1,'rgba(36,26,70,0)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  ctx.setTransform(DPR*cam.k,0,0,DPR*cam.k,DPR*(W/2-cam.x*cam.k),DPR*(H/2-cam.y*cam.k));
  const lw=1/cam.k;
  // constellation web
  ctx.strokeStyle='rgba(170,186,240,.07)';ctx.lineWidth=lw;ctx.beginPath();
  stars.forEach(s=>{(s.links||[]).forEach(j=>{ctx.moveTo(s.x,s.y);ctx.lineTo(stars[j].x,stars[j].y);});if(s.to){ctx.moveTo(s.x,s.y);ctx.lineTo(s.to.x,s.to.y);}});ctx.stroke();
  stars.forEach(s=>{const a=reduce?.6:.35+.35*Math.sin(t*s.sp*3+s.ph);ctx.fillStyle=`rgba(220,228,255,${a})`;ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,6.283);ctx.fill();});
  // topic edges
  const rel=hover?related(hover):focusSet;
  edges.forEach(e=>{const on=rel&&rel.has(e.a)&&rel.has(e.b);
    ctx.strokeStyle=on?'rgba(232,201,135,.55)':(e.main?'rgba(232,201,135,.16)':C.line);
    ctx.lineWidth=(on?1.4:1)*lw*(e.main?1.3:1);ctx.setLineDash(e.cross?[3/cam.k,6/cam.k]:[]);
    ctx.beginPath();ctx.moveTo(e.a.x,e.a.y);ctx.lineTo(e.b.x,e.b.y);ctx.stroke();});
  ctx.setLineDash([]);ctx.textAlign='center';ctx.textBaseline='middle';
  nodes.forEach(n=>{const dim=rel&&!rel.has(n);ctx.globalAlpha=dim?.3:1;
    if(n.main){ctx.font=FONT_MAIN;ctx.shadowColor='rgba(232,201,135,.55)';ctx.shadowBlur=n===hover?26:14;ctx.fillStyle=C.gold;ctx.fillText(n.label,n.x,n.y);ctx.shadowBlur=0;
      if(n===hover){ctx.fillStyle=C.gold;ctx.fillRect(n.x-n.w/2,n.y+n.h/2,n.w,1.5);}}
    else{ctx.font=FONT_SUB;ctx.fillStyle=(n===hover||(rel&&rel.has(n)))?C.ivory:C.mist;ctx.fillText(n.label,n.x,n.y);}});
  ctx.globalAlpha=1;
}
function loop(){if(!document.body.classList.contains('rm')){step();draw();}requestAnimationFrame(loop);}

/* ---------- pointer: drag topics, pan, pinch/wheel zoom, click a notebook ---------- */
function hit(sx,sy){const [x,y]=toWorld(sx,sy);for(let i=nodes.length-1;i>=0;i--){const n=nodes[i],p=n.main?12:5;
  if(Math.abs(x-n.x)<=n.w/2+p&&Math.abs(y-n.y)<=n.h/2+p)return n;}return null;}
const ptrs=new Map();let down=null,pinch=0;
cv.addEventListener('pointerdown',e=>{cv.setPointerCapture(e.pointerId);ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(ptrs.size===1){const n=hit(e.clientX,e.clientY);down={x:e.clientX,y:e.clientY,node:n,moved:false};dragNode=n;}
  else{const [a,b]=[...ptrs.values()];pinch=Math.hypot(a.x-b.x,a.y-b.y);dragNode=null;if(down)down.moved=true;}});
cv.addEventListener('pointermove',e=>{
  if(!ptrs.has(e.pointerId)){hover=hit(e.clientX,e.clientY);cv.style.cursor=hover?(hover.main?'pointer':'grab'):'grab';return;}
  const p=ptrs.get(e.pointerId),dx=e.clientX-p.x,dy=e.clientY-p.y;ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(ptrs.size===2){const [a,b]=[...ptrs.values()],d=Math.hypot(a.x-b.x,a.y-b.y);if(pinch)zoomAt(d/pinch,(a.x+b.x)/2,(a.y+b.y)/2);pinch=d;return;}
  if(down&&!down.moved&&Math.hypot(e.clientX-down.x,e.clientY-down.y)>5)down.moved=true;
  if(!down||!down.moved)return;cv.style.cursor='grabbing';
  if(dragNode){const [x,y]=toWorld(e.clientX,e.clientY);dragNode.x=x;dragNode.y=y;}else{cam.x-=dx/cam.k;cam.y-=dy/cam.k;}});
function up(e){ptrs.delete(e.pointerId);
  if(!ptrs.size&&down){if(!down.moved&&down.node)select(down.node);down=null;dragNode=null;cv.style.cursor='grab';}
  if(ptrs.size<2)pinch=0;}
cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
cv.addEventListener('pointerleave',()=>{if(!ptrs.size)hover=null;});
function zoomAt(f,sx,sy){const [wx,wy]=toWorld(sx,sy);cam.k=Math.max(.35,Math.min(2.4,cam.k*f));cam.x=wx-(sx-W/2)/cam.k;cam.y=wy-(sy-H/2)/cam.k;}
cv.addEventListener('wheel',e=>{e.preventDefault();zoomAt(Math.exp(-e.deltaY*(e.ctrlKey?.01:.0015)),e.clientX,e.clientY);},{passive:false});
addEventListener('resize',resize);

/* ---------- selecting: notebooks open next step; topics light up their notebook ---------- */
const toast=document.getElementById('toast');let tt;
function say(msg){toast.textContent=msg;toast.classList.add('show');clearTimeout(tt);tt=setTimeout(()=>toast.classList.remove('show'),2400);}
let pendingFlash=null;
function select(n){
  if(n.main){location.hash=n.id;}
  else{pendingFlash=n.label;location.hash=n.parent;}
}

/* ---------- search ---------- */
const q=document.getElementById('q'),res=document.getElementById('res');let items=[],cur=-1;
const norm=s=>s.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();
function render(){res.innerHTML='';
  if(!items.length){const li=document.createElement('li');li.className='none';li.textContent='Not on the map yet';res.appendChild(li);return;}
  items.forEach((n,i)=>{const li=document.createElement('li');li.role='option';li.className=(n.main?'main ':'')+(i===cur?'on':'');
    li.append(n.label);const s=document.createElement('span');s.textContent=n.main?'Notebook':byId[n.parent].label;li.appendChild(s);
    li.onmousedown=ev=>{ev.preventDefault();choose(n);};res.appendChild(li);});}
q.addEventListener('input',()=>{const v=norm(q.value.trim());if(!v){res.hidden=true;focusSet=null;return;}
  items=nodes.filter(n=>norm(n.label).includes(v)).sort((a,b)=>(b.main-a.main)||(norm(a.label).indexOf(v)-norm(b.label).indexOf(v))).slice(0,6);
  cur=items.length?0:-1;res.hidden=false;render();
  focusSet=items.length?new Set(items.flatMap(n=>[...related(n)])):null;});
q.addEventListener('keydown',e=>{if(res.hidden)return;
  if(e.key==='ArrowDown'){e.preventDefault();cur=Math.min(items.length-1,cur+1);render();}
  else if(e.key==='ArrowUp'){e.preventDefault();cur=Math.max(0,cur-1);render();}
  else if(e.key==='Enter'&&items[cur]){e.preventDefault();choose(items[cur]);}
  else if(e.key==='Escape'){res.hidden=true;}});
q.addEventListener('blur',()=>{res.hidden=true;});
function choose(n){res.hidden=true;q.value='';q.blur();select(n);}

/* placeholder cycles through topics, like Learn Anything */
const names=nodes.map(n=>n.label);let pi=0;
function cyclePH(){if(document.activeElement!==q||!q.value){q.placeholder=names[pi%names.length];pi+=5;}}
cyclePH();setInterval(cyclePH,2200);

/* ---------- roadmaps ---------- */
const STATUS = ['Not started','Studying','Lesson recorded'];
const STATUS_CLS = ['','s1','s2'];
function statusOf(item){ if(item.video) return 2; return {studying:1, recorded:2}[item.status]||0; }
function youtubeId(url){
  if(!url) return null;
  const m = String(url).match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/))([\w-]{11})/);
  return m ? m[1] : null;
}

const rowsEl=document.getElementById('rows'),wires=document.getElementById('wires'),rmBody=document.getElementById('rm-body');
let curRM=null;
function mkBox(cls,item,num,ctx){
  const b=document.createElement('button');b.className='box '+cls;
  const s=statusOf(item);
  const m=document.createElement('i');m.className='mark '+STATUS_CLS[s];b.appendChild(m);
  if(num){const n=document.createElement('span');n.className='n';n.textContent=num;b.appendChild(n);}
  b.append(item.title);b.dataset.label=item.title;b.title=STATUS[s];
  b.onclick=()=>openPanel({...ctx,item,num});return b;}

function buildRoadmap(id){
  const R=ROADMAPS[id];curRM=id;
  document.getElementById('rm-title').textContent=R.title;
  document.getElementById('rm-desc').textContent=R.intro||'';
  document.querySelector('.draft').hidden=!R.draft;
  rowsEl.innerHTML='';
  const cap=document.createElement('div');cap.className='startcap';cap.textContent='Start';rowsEl.appendChild(cap);
  (R.steps||[]).forEach((st,i)=>{
    const row=document.createElement('div');row.className='row';
    const L=document.createElement('div');L.className='side left';
    const Rr=document.createElement('div');Rr.className='side right';
    const mw=document.createElement('div');mw.className='main-wrap';
    const num=st.number!==undefined?st.number:String(i+1).padStart(2,'0');
    mw.appendChild(mkBox('main',st,num,{nb:R.title,step:st,isStep:true}));
    if(st.about){const p=document.createElement('p');p.className='note';p.textContent=st.about;mw.appendChild(p);}
    const tops=st.topics||[];
    tops.forEach((tp,j)=>{
      const tn=tp.number!==undefined?tp.number:(num&&tops.length>1?`${num}.${j+1}`:'');
      // numbered topics stack in order on the right; unnumbered ones alternate sides
      const side=(tn||tops.length===1)?Rr:(j%2?Rr:L);
      side.appendChild(mkBox('sub',tp,tn,{nb:R.title,step:st,stepNum:num}));
    });
    row.append(L,mw,Rr);rowsEl.appendChild(row);
  });
  const end=document.createElement('div');end.className='endcap';end.textContent='The path keeps growing as new topics are taught and connected.';rowsEl.appendChild(end);
  requestAnimationFrame(drawWires);
}
function drawWires(){
  if(!curRM)return;const base=rmBody.getBoundingClientRect();const narrow=innerWidth<=760;
  const r=el=>{const b=el.getBoundingClientRect();return{l:b.left-base.left,r:b.right-base.left,t:b.top-base.top,b:b.bottom-base.top,cx:(b.left+b.right)/2-base.left,cy:(b.top+b.bottom)/2-base.top};};
  let d='',db='';const mains=[...rowsEl.querySelectorAll('.box.main')];
  if(!mains.length){wires.innerHTML='';return;}
  const sx=m=>narrow?m.l+18:m.cx;
  mains.forEach((mEl,i)=>{const m=r(mEl);const wb=r(mEl.parentElement).b+(mEl.parentElement.querySelector('.note')?6:0);
    if(i===0){const c=r(rowsEl.querySelector('.startcap'));d+=`M${sx(m)} ${c.b+6} L${sx(m)} ${m.t}`;}
    if(i<mains.length-1){const n=r(mains[i+1]);d+=`M${sx(m)} ${wb} L${sx(n)} ${n.t}`;}
    else{const e=r(rowsEl.querySelector('.endcap'));d+=`M${sx(m)} ${wb} L${sx(m)} ${e.t}`;}
    mEl.closest('.row').querySelectorAll('.box.sub').forEach(sEl=>{const s=r(sEl);
      if(narrow){db+=`M${m.l+18} ${wb} L${m.l+18} ${s.cy-8} Q${m.l+18} ${s.cy} ${m.l+26} ${s.cy} L${s.l} ${s.cy}`;}
      else{const left=s.cx<m.cx;const x1=left?m.l:m.r,x2=left?s.r:s.l,mx=(x1+x2)/2;db+=`M${x1} ${m.cy} C${mx} ${m.cy} ${mx} ${s.cy} ${x2} ${s.cy}`;}});
  });
  wires.innerHTML=`<path class="branch" d="${db}"/><path class="spine" d="${d}"/>`;
}
addEventListener('resize',()=>requestAnimationFrame(drawWires));

/* ---------- lesson panel ---------- */
const panel=document.getElementById('panel');
function li(list,node){const l=document.createElement('li');l.appendChild(node);list.appendChild(l);}
function openPanel(x){
  const it=x.item;
  const where=x.isStep
    ?(x.num?`${x.nb} · Step ${x.num}`:x.nb)
    :`${x.nb} · ${x.stepNum?x.stepNum+' ':''}${x.step.title}`;
  document.getElementById('p-where').textContent=where;
  document.getElementById('p-title').textContent=(x.num&&!x.isStep?x.num+' ':'')+it.title;
  const s=statusOf(it),chip=document.getElementById('p-status');
  chip.textContent=STATUS[s];chip.className='chip '+STATUS_CLS[s];
  document.getElementById('p-about-wrap').hidden=!it.about;
  document.getElementById('p-about').textContent=it.about||'';

  // lesson video
  const v=document.getElementById('p-video');v.innerHTML='';v.className='video';
  const vid=youtubeId(it.video);
  if(vid){
    v.classList.add('has');
    const f=document.createElement('iframe');
    f.src=`https://www.youtube-nocookie.com/embed/${vid}?rel=0`;
    f.title=it.title;f.loading='lazy';f.allowFullscreen=true;
    f.allow='accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen';
    v.appendChild(f);
  }else if(it.video){
    const a=document.createElement('a');a.href=it.video;a.target='_blank';a.rel='noopener';a.textContent='Open the lesson video';v.appendChild(a);
  }else v.innerHTML='<div>No lesson recorded yet.<br>When you teach this topic, the video lives here.</div>';

  // materials
  const mat=document.getElementById('p-mat');mat.innerHTML='';
  const ms=it.materials||[];
  if(ms.length)ms.forEach(m=>{const a=document.createElement('a');a.href=m.url;a.target='_blank';a.rel='noopener';a.textContent=m.label||m.url;li(mat,a);});
  else mat.innerHTML='<li class="empty">Nothing attached yet.</li>';

  // topics inside a step
  const insWrap=document.getElementById('p-inside-wrap'),ins=document.getElementById('p-inside');ins.innerHTML='';
  insWrap.hidden=!x.isStep;
  if(x.isStep){const tops=it.topics||[];
    if(tops.length)tops.forEach((tp,j)=>{const tn=tp.number!==undefined?tp.number:(x.num&&tops.length>1?`${x.num}.${j+1}`:'');
      const b=document.createElement('button');b.textContent=(tn?tn+' ':'')+tp.title;
      b.onclick=()=>openPanel({nb:x.nb,step:it,stepNum:x.num,item:tp,num:tn});li(ins,b);});
    else ins.innerHTML='<li class="empty">Topics will appear here as this step takes shape.</li>';}

  panel.classList.add('open');panel.setAttribute('aria-hidden','false');
}
function closePanel(){
  panel.classList.remove('open');panel.setAttribute('aria-hidden','true');
  const v=document.getElementById('p-video');if(v.querySelector('iframe'))v.innerHTML=''; // stop playback
}
document.getElementById('close').onclick=closePanel;
addEventListener('keydown',e=>{if(e.key==='Escape')closePanel();});

/* ---------- router: #econ, #general, #lang open a roadmap; no hash shows Access Box ---------- */
const rmEl=document.getElementById('roadmap');
function route(){
  const id=location.hash.slice(1);closePanel();
  if(ROADMAPS[id]){
    if(curRM!==id)buildRoadmap(id);
    document.body.classList.add('rm');rmEl.setAttribute('aria-hidden','false');
    document.title=ROADMAPS[id].title+' · Educacional';
    if(pendingFlash){const bx=[...rowsEl.querySelectorAll('.box')];
      const t=bx.find(b=>b.dataset.label===pendingFlash)||bx.find(b=>b.dataset.label.includes(pendingFlash));
      if(t){setTimeout(()=>{t.scrollIntoView({behavior:reduce?'auto':'smooth',block:'center'});t.classList.add('flash');setTimeout(()=>t.classList.remove('flash'),3400);},380);}
      else rmEl.scrollTop=0;
      pendingFlash=null;}
    else rmEl.scrollTop=0;
    setTimeout(drawWires,50);
  }else{document.body.classList.remove('rm');rmEl.setAttribute('aria-hidden','true');document.title='Educacional';}
}
addEventListener('hashchange',route);
document.getElementById('back').onclick=()=>{if(location.hash)history.pushState(null,'',location.pathname+location.search);route();};

/* ---------- boot ---------- */
(document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve()).then(()=>{measure();for(let i=0;i<400;i++)step();loop();route();});
