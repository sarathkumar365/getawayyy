/* Builds the standalone motion test: static SVG rigs + the exported pose/script
   data + a vanilla port of the motion controller. No React, no bundler. */
import { readFileSync, writeFileSync } from "node:fs";

const SCR = process.argv[2];
const embed = readFileSync(".next/server/app/embed.html", "utf-8");
const rig = readFileSync(`${SCR}/rig.json`, "utf-8");

const grab = (id) => {
  const m = embed.match(new RegExp(`<div id="${id}">(.*?)</div>`, "s"));
  if (!m) throw new Error(`missing ${id}`);
  return m[1].replace(/<!--\$-->|<!--\/\$-->|<!--\?-->/g, "");
};
const sun = grab("rig-sun");
const curse = grab("rig-curse");

const html = `<title>The Walk Test</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500&display=swap">
<style>
:root{
  --stock:#F0EAE0;--surface:#F8F4ED;--ink:#211E1A;--muted:#6E675C;--faint:#93897B;
  --rule:#D6CCBB;--stage:#FBF8F2;--stage-rule:#E2D9C9;--sun:#FF7A2F;--curse:#C1121F;--focus:#2F6F8F;
  --sans:"IBM Plex Sans",system-ui,-apple-system,sans-serif;
  --display:"Bricolage Grotesque",var(--sans);
  --mono:"IBM Plex Mono",ui-monospace,Menlo,monospace;
  --pad:clamp(1rem,4vw,2.5rem);
}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){
  --stock:#16151A;--surface:#1E1C23;--ink:#E9E4DB;--muted:#9C9389;--faint:#7B7369;
  --rule:#343039;--stage:#211F27;--stage-rule:#33303B;--focus:#7FC4E6;}}
:root[data-theme="dark"]{
  --stock:#16151A;--surface:#1E1C23;--ink:#E9E4DB;--muted:#9C9389;--faint:#7B7369;
  --rule:#343039;--stage:#211F27;--stage-rule:#33303B;--focus:#7FC4E6;}
:root[data-ground="night"]{--stage:#101016;--stage-rule:#26262F;}
:root[data-ground="field"]{--stage:#6C7A6E;--stage-rule:#55614F;}

*{box-sizing:border-box}
body{margin:0;background:var(--stock);color:var(--ink);font-family:var(--sans);line-height:1.6;
  -webkit-text-size-adjust:100%;overflow-x:hidden}
:focus-visible{outline:2px solid var(--focus);outline-offset:2px}
.wrap{max-width:1040px;margin:0 auto;padding:clamp(1.75rem,5vw,3.5rem) var(--pad) 5rem}
.stamp{font-family:var(--mono);font-size:.66rem;letter-spacing:.16em;text-transform:uppercase;
  color:var(--faint);display:flex;flex-wrap:wrap;gap:.3rem 1.3rem;margin:0 0 1.4rem}
.stamp b{font-weight:500;color:var(--muted)}
h1{font-family:var(--display);font-weight:700;font-size:clamp(2.1rem,6.5vw,3.6rem);line-height:1;
  letter-spacing:-.03em;margin:0 0 .9rem;text-wrap:balance}
.lede{max-width:62ch;color:var(--muted);margin:0 0 2rem}
.lede strong{color:var(--ink);font-weight:500}

.bar{display:flex;flex-wrap:wrap;gap:.75rem 1.6rem;align-items:center;margin:0 0 1rem}
.ctl{display:flex;align-items:center;gap:.5rem}
.ctl>span{font-family:var(--mono);font-size:.62rem;letter-spacing:.14em;text-transform:uppercase;color:var(--faint)}
.seg{display:flex;border:1px solid var(--rule);border-radius:3px;overflow:hidden}
.seg button{font-family:var(--mono);font-size:.72rem;padding:.42rem .8rem;background:transparent;
  color:var(--muted);border:0;cursor:pointer;min-height:38px}
.seg button+button{border-left:1px solid var(--rule)}
.seg button[aria-pressed="true"]{background:var(--ink);color:var(--stock)}

.stage{position:relative;height:min(46vh,380px);border:1px solid var(--stage-rule);border-radius:8px;
  background:var(--stage);overflow:hidden;margin:0 0 1rem}
.stage::after{content:"";position:absolute;inset:auto 0 0 0;height:1px;background:var(--stage-rule)}
.actor{position:absolute;bottom:0;transform:translateX(-50%);height:82%;
  transition:left 1.9s cubic-bezier(.4,0,.2,1);opacity:0}
.actor.on{opacity:1;transition:left 1.9s cubic-bezier(.4,0,.2,1),opacity .4s ease}
.actor svg{height:100%;width:auto;display:block}
[data-brow],[data-eye],[data-mouth],[data-emote]{display:none}

.bubble{position:relative;max-width:56ch;padding:.9rem 1.05rem 1.7rem;border:1.5px solid var(--ink);
  border-radius:12px;background:var(--surface);cursor:pointer;-webkit-user-select:none;user-select:none;
  box-shadow:3px 3px 0 var(--accent,var(--ink));min-height:4.2rem}
.bubble[data-who="sun"]{--accent:var(--sun);margin-right:auto}
.bubble[data-who="curse"]{--accent:var(--curse);margin-left:auto}
.bubble::after{content:"";position:absolute;top:-9px;width:14px;height:14px;background:var(--surface);
  border-left:1.5px solid var(--ink);border-top:1.5px solid var(--ink);transform:rotate(45deg)}
.bubble[data-who="sun"]::after{left:28px}
.bubble[data-who="curse"]::after{right:28px}
.bubble p{margin:0;font-size:clamp(1rem,2.2vw,1.1rem);line-height:1.55;min-height:1.55em}
.caret{display:inline-block;width:.5ch;height:1.05em;margin-left:1px;background:var(--accent);
  vertical-align:-.16em;animation:blink .8s steps(1) infinite}
@keyframes blink{50%{opacity:0}}
.hint{position:absolute;right:.85rem;bottom:.45rem;font-family:var(--mono);font-size:.58rem;
  letter-spacing:.09em;text-transform:uppercase;color:var(--faint)}
.dots{display:flex;gap:4px;margin:.85rem 0 2.4rem}
.dots span{height:2px;flex:1;background:var(--rule);border-radius:2px}
.dots span[data-on="1"]{background:var(--ink)}

.beats{display:flex;flex-wrap:wrap;gap:.3rem;margin:0 0 2rem}
.beats button{font-family:var(--mono);font-size:.66rem;padding:.34rem .55rem;border:1px solid var(--rule);
  border-radius:3px;background:transparent;color:var(--muted);cursor:pointer;min-height:34px}
.beats button[aria-pressed="true"]{background:var(--ink);color:var(--stock);border-color:var(--ink)}

h2{font-family:var(--display);font-size:1.15rem;font-weight:500;margin:2.5rem 0 .5rem;
  padding-top:1.8rem;border-top:1px solid var(--rule)}
.note{max-width:66ch;color:var(--muted);font-size:.93rem;margin:0 0 .9rem}
.note code{font-family:var(--mono);font-size:.86em;color:var(--ink)}
@media (prefers-reduced-motion:reduce){.caret{animation:none}.actor{transition:none}}
</style>

<div class="wrap">
  <p class="stamp">
    <span><b>Phase</b> 1</span><span><b>Design</b> 2 · detailed</span>
    <span><b>Beats</b> 30</span><span><b>Lines</b> 86</span><span><b>Walk</b> 8 frames</span>
  </p>
  <h1>The Walk Test</h1>
  <p class="lede">
    The rig, moving. This is the question a still sheet cannot answer — whether the walk
    reads as <strong>animated</strong> or as a puppet. Judge it on the iPad, in your hand,
    at the size it will actually appear. If the walk disappoints here, the fix is Rive for
    the characters only and nothing else changes.
  </p>

  <div class="bar">
    <div class="ctl"><span>Motion</span>
      <div class="seg" id="seg-walk" role="group" aria-label="Walk">
        <button type="button" data-walk="0" aria-pressed="true">Idle</button>
        <button type="button" data-walk="1" aria-pressed="false">Walk</button>
      </div>
    </div>
    <div class="ctl"><span>Ground</span>
      <div class="seg" id="seg-ground" role="group" aria-label="Ground">
        <button type="button" data-ground="paper" aria-pressed="true">Paper</button>
        <button type="button" data-ground="field" aria-pressed="false">Field</button>
        <button type="button" data-ground="night" aria-pressed="false">Night</button>
      </div>
    </div>
    <div class="ctl"><span>Cross</span>
      <div class="seg" id="seg-cross" role="group" aria-label="Cross the stage">
        <button type="button" id="cross" aria-pressed="false">Send them over</button>
      </div>
    </div>
  </div>

  <div class="stage" id="stage">
    <div class="actor" id="a-sun" style="left:32%">${sun}</div>
    <div class="actor" id="a-curse" style="left:68%">${curse}</div>
  </div>

  <div class="bubble" id="bubble" data-who="sun" role="button" tabindex="0">
    <p id="line"></p><span class="hint" id="hint">tap to skip</span>
  </div>
  <div class="dots" id="dots"></div>

  <div class="beats" id="beats"></div>

  <h2>What you are looking at</h2>
  <p class="note">
    One <code>requestAnimationFrame</code> loop drives every joint. Breath, head drift and
    weight shift run on three sine waves with deliberately unrelated periods — 4.1s, 5.7s
    and 7.3s — so they never line up and the idle never reads as a loop.
  </p>
  <p class="note">
    Hair is on second-order springs, one per layer, with different stiffness each. Watch the
    head turn and then stop: the strands overshoot first, the front crown follows, and the
    back mass is still arriving after the head has already settled. That trailing is the
    single biggest difference between a puppet and an animation.
  </p>
  <p class="note">
    The eight walk frames are sampled continuously, not stepped, and the walk itself springs
    in and out — so starting and stopping are eased rather than snapped. Blinks fire on a
    random 2–6 second interval, and the two eyes are offset by a few milliseconds so they
    never shut in perfect unison.
  </p>
  <p class="note">
    Every line is from the written script, and every fact in B's mouth comes from the trip
    file. He is not being pessimistic for effect — that is genuinely what the research says.
  </p>
</div>

<script>
(function(){
var D = ${rig};
var root = document.documentElement;
root.dataset.ground = "paper";
var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- rig plumbing ---------- */
function joint(svg, part){
  var el = svg.querySelector('[data-part="'+part+'"]');
  if(!el) return null;
  var o = (el.getAttribute("data-origin")||"0 0").trim().split(/\\s+/);
  return {el:el, ox:+o[0]||0, oy:+o[1]||0};
}
function pick(svg, part){ return svg.querySelector('[data-part="'+part+'"]'); }
function rot(j,a){ if(j) j.el.setAttribute("transform","rotate("+a.toFixed(2)+" "+j.ox+" "+j.oy+")"); }

function readRig(svg){
  return {svg:svg, root:pick(svg,"root"), spine:joint(svg,"spine"), head:joint(svg,"head"),
    armL:joint(svg,"arm-l"), foreL:joint(svg,"forearm-l"),
    armR:joint(svg,"arm-r"), foreR:joint(svg,"forearm-r"),
    legL:joint(svg,"leg-l"), shinL:joint(svg,"shin-l"),
    legR:joint(svg,"leg-r"), shinR:joint(svg,"shin-r"),
    hairFront:joint(svg,"hair-front"), hairBack:joint(svg,"hair-back"), strands:joint(svg,"strands"),
    blinkL:pick(svg,"blink-l"), blinkR:pick(svg,"blink-r"), mouth:pick(svg,"mouth-anim")};
}

var KEYS=["bob","lean","headTilt","headTurn","shoulderL","elbowL","shoulderR","elbowR",
          "hipL","kneeL","hipR","kneeR"];
function blend(a,b,t){ var o={},i,k; for(i=0;i<KEYS.length;i++){k=KEYS[i];o[k]=a[k]+(b[k]-a[k])*t;} return o; }
function frame(i){ var n=D.walk.length; return D.walk[((i%n)+n)%n]; }

function Spring(k,c){ this.k=k; this.c=c; this.x=0; this.v=0; }
Spring.prototype.step=function(target,dt){
  var a=-this.k*(this.x-target)-this.c*this.v; this.v+=a*dt; this.x+=this.v*dt; return this.x; };

function createMotion(svg, opts){
  var rig=readRig(svg), turn=opts.turn||0, flip=!!opts.flip, pivot=opts.headPivotY||70;
  var cadence=opts.cadence||0.85, base=opts.rest, walking=0, walkT=0, talking=0, talkT=0;
  var phase=0, t=0, pop=0, last=0;
  var sF=new Spring(150,15), sB=new Spring(78,11), sS=new Spring(110,13);
  var nbL=1.2+Math.random()*2.3, nbR=nbL+0.03, bL=-10, bR=-10, BD=0.125;
  function lid(now,at){ var d=now-at; if(d<0||d>BD) return 1; return 1-0.94*Math.sin((d/BD)*Math.PI); }

  function apply(p,x){
    if(rig.root) rig.root.setAttribute("transform",
      (flip?"scale(-1 1) ":"")+"scale("+(1-0.2*Math.abs(turn)).toFixed(3)+" 1) translate(0 "+p.bob.toFixed(2)+")");
    rot(rig.spine,p.lean);
    if(rig.head) rig.head.el.setAttribute("transform",
      "rotate("+p.headTilt.toFixed(2)+" 0 "+pivot+") translate("+(p.headTurn+turn*-6).toFixed(2)+" 0)");
    rot(rig.armL,p.shoulderL); rot(rig.foreL,p.elbowL);
    rot(rig.armR,p.shoulderR); rot(rig.foreR,p.elbowR);
    rot(rig.legL,p.hipL); rot(rig.shinL,-p.kneeL);
    rot(rig.legR,p.hipR); rot(rig.shinR,-p.kneeR);
    rot(rig.hairFront,x.hf); rot(rig.hairBack,x.hb); rot(rig.strands,x.st);
    if(rig.blinkL) rig.blinkL.setAttribute("transform","scale(1 "+x.lL.toFixed(3)+")");
    if(rig.blinkR) rig.blinkR.setAttribute("transform","scale(1 "+x.lR.toFixed(3)+")");
    if(rig.mouth){ var sy=0.2+0.8*x.mo, sx=1+0.12*(1-x.mo);
      rig.mouth.setAttribute("transform","scale("+sx.toFixed(3)+" "+sy.toFixed(3)+")"); }
  }

  if(reduced){
    apply(base,{hf:0,hb:0,st:0,lL:1,lR:1,mo:1});
    return {setBase:function(){},walk:function(){},talk:function(){},bounce:function(){}};
  }

  function tick(now){
    var dt=Math.min((now-(last||now))/1000,1/24); last=now; t+=dt;
    walking+=(walkT-walking)*Math.min(1,dt*6);
    talking+=(talkT-talking)*Math.min(1,dt*12);
    pop=Math.max(0,pop-dt*2.6);
    if(walking>0.002) phase=(phase+dt*cadence*walking)%1;
    var f=phase*8, i=Math.floor(f);
    var live=blend(base, blend(frame(i),frame(i+1),f-i), walking);
    var breath=Math.sin(t*Math.PI*2/4.1), micro=Math.sin(t*Math.PI*2/5.7), sway=Math.sin(t*Math.PI*2/7.3);
    var still=1-walking, pe=pop*pop*(3-2*pop);
    var p={};
    for(var n=0;n<KEYS.length;n++) p[KEYS[n]]=live[KEYS[n]];
    p.bob=live.bob+breath*0.9*still-pe*5;
    p.lean=live.lean+sway*0.7*still;
    p.headTilt=live.headTilt+micro*0.9*still+pe*2.5;
    p.shoulderL=live.shoulderL-pe*7; p.shoulderR=live.shoulderR+pe*7;
    var ht=p.headTilt*1.7+sway*1.3*still+walking*Math.sin(phase*Math.PI*2)*3.5;
    if(t>=nbL){ bL=t; nbL=t+2.1+Math.random()*4.3; }
    if(t>=nbR){ bR=t; nbR=nbL+0.01+Math.random()*0.05; }
    var open = talking>0.01 ? Math.abs(Math.sin(t*9.3)*0.62+Math.sin(t*14.9)*0.38) : 1;
    apply(p,{hf:sF.step(ht,dt),hb:sB.step(ht*0.8,dt),st:sS.step(ht*1.15,dt),
             lL:lid(t,bL),lR:lid(t,bR),mo:1-talking*(1-open)});
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
  return {
    setBase:function(p){ base=p; },
    walk:function(on){ walkT=on?1:0; },
    talk:function(on){ talkT=on?1:0; },
    bounce:function(){ pop=1; }
  };
}

/* ---------- actors ---------- */
function mk(hostId, who, flip){
  var host=document.getElementById(hostId), svg=host.querySelector("svg");
  var m=createMotion(svg,{turn:0.5,flip:flip,headPivotY:D.headPivot[who],
    rest:D.rest[who], cadence: who==="sun"?0.95:0.74});
  host.classList.add("on");
  return {host:host, svg:svg, m:m, who:who};
}
var A={sun:mk("a-sun","sun",false), curse:mk("a-curse","curse",true)};

function setVariant(svg,kind,value){
  var all=svg.querySelectorAll("[data-"+kind+"]");
  for(var i=0;i<all.length;i++) all[i].style.display = all[i].getAttribute("data-"+kind)===value ? "" : "none";
}
function express(who,line){
  var s=A[who].svg;
  setVariant(s,"brow",line.brow||(who==="curse"?"flat":"neutral"));
  setVariant(s,"eye",line.eye||(who==="curse"?"half":"open"));
  setVariant(s,"mouth",line.mouth||(who==="curse"?"closed":"smile"));
  setVariant(s,"emote",line.emote||"none");
  var m=A[who].m;
  if(line.arms==="crossed") m.setBase(D.armsCrossed?Object.assign({},D.rest.curse):D.rest[who]);
  else if(line.arms && D.armPoses[line.arms]){
    var base=Object.assign({},D.rest[who]), ap=D.armPoses[line.arms];
    base.shoulderL=ap.shoulderL; base.elbowL=ap.elbowL;
    base.shoulderR=ap.shoulderR; base.elbowR=ap.elbowR;
    m.setBase(base); m.bounce();
  } else m.setBase(D.rest[who]);
}
express("sun",{}); express("curse",{});

/* ---------- dialogue ---------- */
var bubble=document.getElementById("bubble"), lineEl=document.getElementById("line"),
    hint=document.getElementById("hint"), dots=document.getElementById("dots"),
    beatsEl=document.getElementById("beats");
var keys=Object.keys(D.dialogue), key="arrival", idx=0, shown=0, done=false, timer=null;

function delayAfter(ch){
  if(ch==="."||ch==="!"||ch==="?") return 260;
  if(ch===","||ch===";"||ch===":") return 130;
  if(ch==="\\u2014") return 170;
  return 26;
}
function lines(){ return D.dialogue[key]||[]; }
function renderDots(){
  dots.innerHTML="";
  lines().forEach(function(_,n){
    var s=document.createElement("span"); s.setAttribute("data-on", n<=idx?"1":"0"); dots.appendChild(s);
  });
}
function paint(){
  var L=lines()[idx]; if(!L) return;
  lineEl.textContent=L.text.slice(0,shown);
  if(!done){ var c=document.createElement("span"); c.className="caret"; lineEl.appendChild(c); }
  hint.textContent = done ? "tap to continue" : "tap to skip";
}
function stopTyping(){ if(timer){clearTimeout(timer); timer=null;} }
function play(){
  stopTyping();
  var L=lines()[idx]; if(!L) return;
  bubble.setAttribute("data-who",L.who);
  express(L.who,L);
  shown=0; done=false; paint();
  if(reduced){ shown=L.text.length; done=true; paint(); return; }
  A[L.who].m.talk(true);
  var i=0;
  (function step(){
    i++; shown=i; paint();
    if(i>=L.text.length){ done=true; A[L.who].m.talk(false); paint(); return; }
    timer=setTimeout(step, delayAfter(L.text.charAt(i-1)));
  })();
}
function advance(){
  var L=lines()[idx];
  if(!done){ stopTyping(); shown=L.text.length; done=true; if(L) A[L.who].m.talk(false); paint(); return; }
  idx = (idx+1) % lines().length;
  renderDots(); play();
}
bubble.addEventListener("click",advance);
bubble.addEventListener("keydown",function(e){
  if(e.key==="Enter"||e.key===" "){ e.preventDefault(); advance(); }});

keys.forEach(function(k){
  var b=document.createElement("button");
  b.type="button"; b.textContent=k; b.setAttribute("aria-pressed", String(k===key));
  b.addEventListener("click",function(){
    key=k; idx=0;
    [].forEach.call(beatsEl.children,function(c){ c.setAttribute("aria-pressed", String(c===b)); });
    renderDots(); play();
  });
  beatsEl.appendChild(b);
});
renderDots(); play();

/* ---------- controls ---------- */
function seg(id,fn){
  var el=document.getElementById(id);
  el.addEventListener("click",function(e){
    var b=e.target.closest("button"); if(!b) return;
    [].forEach.call(el.querySelectorAll("button"),function(x){ x.setAttribute("aria-pressed",String(x===b)); });
    fn(b);
  });
}
seg("seg-walk",function(b){ var on=b.dataset.walk==="1"; A.sun.m.walk(on); A.curse.m.walk(on); });
seg("seg-ground",function(b){ root.dataset.ground=b.dataset.ground; });

var over=false;
document.getElementById("cross").addEventListener("click",function(){
  over=!over;
  A.sun.host.style.left = over ? "72%" : "32%";
  A.curse.host.style.left = over ? "28%" : "68%";
  A.sun.m.walk(true); A.curse.m.walk(true);
  [].forEach.call(document.querySelectorAll("#seg-walk button"),function(x){
    x.setAttribute("aria-pressed", String(x.dataset.walk==="1")); });
  setTimeout(function(){
    A.sun.m.walk(false); A.curse.m.walk(false);
    [].forEach.call(document.querySelectorAll("#seg-walk button"),function(x){
      x.setAttribute("aria-pressed", String(x.dataset.walk==="0")); });
  }, 1950);
});
})();
</script>`;

writeFileSync(`${SCR}/walk-test.html`, html, "utf-8");
console.log(`wrote walk-test.html — ${(html.length / 1024).toFixed(0)} KB`);
