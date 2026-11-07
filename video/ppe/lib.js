
// ---------- helpers ----------
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const lerp=(a,b,t)=>a+(b-a)*t;
const ease=t=>{t=clamp(t);return t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2};
const easeOut=t=>{t=clamp(t);return 1-Math.pow(1-t,3)};
const back=t=>{t=clamp(t);const c1=1.9,c3=c1+1;return 1+c3*Math.pow(t-1,3)+c1*Math.pow(t-1,2)};
const prog=(t,a,b)=>clamp((t-a)/(b-a));
function rnd(seed){const x=Math.sin(seed*127.1+311.7)*43758.5453;return x-Math.floor(x)}
function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;')}

// rich text: segments marked with *...* are highlighted
function rich(str,hl='#ffd23f',base='#fff'){
  return str.split('*').map((s,i)=>`<tspan fill="${i%2?hl:base}">${esc(s)}</tspan>`).join('');
}

// ---------- defs ----------
const DEFS=`<defs>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
 <stop offset="0" stop-color="#1d1438"/><stop offset=".55" stop-color="#4a2160"/><stop offset="1" stop-color="#8a3166"/></linearGradient>
<linearGradient id="skyDay" x1="0" y1="0" x2="0" y2="1">
 <stop offset="0" stop-color="#3a7bd5"/><stop offset=".6" stop-color="#7fb8ec"/><stop offset="1" stop-color="#ffd9a0"/></linearGradient>
<radialGradient id="moonGlow"><stop offset="0" stop-color="#fff6d0" stop-opacity=".55"/><stop offset="1" stop-color="#fff6d0" stop-opacity="0"/></radialGradient>
<linearGradient id="beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff3a8" stop-opacity=".55"/><stop offset="1" stop-color="#fff3a8" stop-opacity="0"/></linearGradient>
<radialGradient id="aura"><stop offset="0" stop-color="#9ef0ff" stop-opacity=".7"/><stop offset=".6" stop-color="#6fd3ff" stop-opacity=".25"/><stop offset="1" stop-color="#6fd3ff" stop-opacity="0"/></radialGradient>
<radialGradient id="vig" cx=".5" cy=".55" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".6"/></radialGradient>
<filter id="blur4"><feGaussianBlur stdDeviation="4"/></filter>
<filter id="blur2"><feGaussianBlur stdDeviation="2"/></filter>
<filter id="glow"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<filter id="shadow" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="4" stdDeviation="0" flood-color="#000" flood-opacity=".35"/></filter>
</defs>`;

// ---------- characters ----------
function helmetShape(cx,cy,sc=1,col='#ffcc1f',rot=0,dent=0){
  return `<g transform="translate(${cx} ${cy}) rotate(${rot}) scale(${sc})">
   <path d="M-33 0 Q-33 -36 0 -38 Q33 -36 33 0 Z" fill="${col}" stroke="#00000040" stroke-width="2"/>
   <rect x="-40" y="-4" width="80" height="9" rx="4" fill="${col}" stroke="#00000040" stroke-width="2"/>
   <path d="M-6 -37 L-6 -6 M6 -37 L6 -6" stroke="#00000022" stroke-width="3"/>
   <path d="M-22 -24 Q-18 -32 -8 -34" stroke="#fff" stroke-width="4" fill="none" opacity=".6" stroke-linecap="round"/>
   ${dent?`<path d="M8 -36 l6 8 l-8 2 l6 7" stroke="#8a6500" stroke-width="2.5" fill="none" opacity="${dent}"/>`:''}
  </g>`;
}

function yantraMark(x,y,sc=1){return `<g transform="translate(${x} ${y}) scale(${sc})" stroke="#b5121b" stroke-width="2.2" fill="none" stroke-linecap="round"><path d="M-14 6 L0 -12 L14 6 Z"/><circle cx="0" cy="0" r="4"/><path d="M-18 9 h36 M-10 -2 q-6 -4 -2 -9 M10 -2 q6 -4 2 -9"/></g>`;}
function person(o){
  const P=Object.assign({x:270,y:700,sc:1,skin:'#f4c79a',shirt:'#3b82c4',pants:'#2d3b6b',hair:'#2b2018',
    helmet:false,vest:false,gloves:false,boots:false,hipHelmet:false,eyes:'normal',mouth:'smile',walk:0,walkAmt:0,
    armL:20,armR:-20,lean:0,op:1,dent:0,tint:0,stiff:false,bob:0,flip:1,thumb:false,hat:null,capCol:'#d23b3b',glasses:false,chin:false,badge:null,tie:false,towel:false,bag:false,sweat:0,phone:false,cup:false,shirtSleeve:null,clip:false,amulet:0,takrut:false,glowAm:0,sit:0,yantra:false,bib:null,mustache:false,tears:0,bump:0,medal:false,hop:0,plugs:false},o);
  const ph=P.walk*Math.PI*2, a=P.walkAmt;
  const legA=Math.sin(ph)*28*a, legB=-legA;
  const bob=(P.bob||Math.abs(Math.sin(ph))*-4*a);
  let s=`<g transform="translate(${P.x} ${P.y}) scale(${P.sc*P.flip} ${P.sc})" opacity="${P.op}">`;
  s+=`<ellipse cx="0" cy="2" rx="34" ry="6" fill="#000" opacity=".25"/>`;
  s+=`<g transform="translate(0 ${bob}) rotate(${P.lean} 0 -60)">`;
  // legs
  const leg=(ang,dx)=>{let g=`<g transform="translate(${dx} -58) rotate(${ang})"><rect x="-7" y="0" width="14" height="54" rx="6" fill="${P.pants}"/>`;
    if(P.boots) g+=`<path d="M-9 44 h18 v12 h10 q4 0 4 5 v3 h-32 z" fill="#2a2a2a"/><rect x="-9" y="62" width="32" height="3" fill="#ffcc1f"/>`;
    else g+=`<path d="M-6 54 h12 q10 0 12 6 h-24 z" fill="${P.skin}"/><rect x="-7" y="59" width="27" height="4" rx="2" fill="#2a7ad1"/><path d="M-2 54 l6 6" stroke="#2a7ad1" stroke-width="3"/>`;
    return g+`</g>`};
  if(P.sit){s+=`<g transform="translate(0 ${-4})">`+leg(-80,-10).replace('translate(-10 -58)','translate(-10 -20)')+leg(-70,10).replace('translate(10 -58)','translate(10 -20)')+`</g><g transform="translate(0 38)">`;}
  else if(P.hop) s+=leg(-10,-10)+`<g transform="translate(0 -26)">`+leg(-95,10)+`</g>`;
  else s+=leg(legA,-10)+leg(legB,10);
  // body
  s+=`<rect x="-25" y="-122" width="50" height="70" rx="12" fill="${P.shirt}"/>`;
  if(P.vest) s+=`<path d="M-25 -112 q0 -10 10 -10 h4 l11 30 l11 -30 h4 q10 0 10 10 v58 h-50 z" fill="${P.vestCol||'#ff7a1a'}"/>
     <rect x="-25" y="-86" width="50" height="7" fill="#e9eef2"/><rect x="-25" y="-68" width="50" height="7" fill="#e9eef2"/>
     <rect x="-25" y="-86" width="50" height="7" fill="#fff" opacity=".4"/>`;
  if(P.bib) s+=`<rect x="-15" y="-108" width="30" height="26" rx="3" fill="#fff" stroke="#1b1b1b" stroke-width="1.5"/><text x="0" y="-88" text-anchor="middle" font-size="19" font-weight="900" fill="#e6242b">${P.bib}</text>`;
  if(P.tie) s+=`<path d="M-8 -122 l8 10 l8 -10 z" fill="#fff"/><path d="M-3 -114 h6 l3 34 l-6 8 l-6 -8 z" fill="#1f3f8f"/>`;
  if(P.badge) s+=`<g transform="translate(${P.vest?-14:12} -100)"><line x1="0" y1="-10" x2="0" y2="-2" stroke="#333" stroke-width="1.5"/><rect x="-8" y="-2" width="16" height="20" rx="2" fill="#fff" stroke="#333" stroke-width="1.2"/><rect x="-8" y="-2" width="16" height="6" fill="${P.badge}"/><circle cx="0" cy="9" r="3" fill="#999"/></g>`;
  s+=`<rect x="-25" y="-58" width="50" height="8" fill="#3a2a1e"/>`;
  if(P.towel) s+=`<path d="M-26 -124 q20 14 34 2 l6 6 q-20 16 -42 0 z" fill="#c4413c"/><path d="M-22 -120 l4 -3 M-12 -114 l4 -4 M-2 -112 l4 -5" stroke="#3b6fd1" stroke-width="3"/><rect x="10" y="-122" width="12" height="40" fill="#c4413c"/><path d="M10 -112 h12 M10 -100 h12 M10 -88 h12" stroke="#3b6fd1" stroke-width="3"/>`;
  if(P.hipHelmet) s+=helmetShape(26,-58,.42,'#ffcc1f',25);
  if(P.takrut) s+=`<g>${[-16,-6,4,14].map(x=>`<rect x="${x}" y="-60" width="7" height="16" rx="3" fill="#d9a520" stroke="#7a5a00" stroke-width="1"/>`).join('')}<line x1="-24" y1="-56" x2="24" y2="-56" stroke="#b22" stroke-width="2"/></g>`;
  if(P.amulet){const n=P.amulet;let g=`<path d="M-18 -122 Q0 -84 18 -122" stroke="#d9a520" stroke-width="2.5" fill="none"/>`;
    for(let i=0;i<n;i++){const u=(i+.5)/n, ax=lerp(-16,16,u), ay=-120+Math.sin(u*Math.PI)*30+(P.glowAm?Math.sin(i*2+P.glowAm*30)*2:0);
      g+=`<g transform="translate(${ax} ${ay})"><rect x="-4" y="0" width="8" height="11" rx="2" fill="#f2cf5b" stroke="#8a6200" stroke-width="1.2"/><rect x="-2" y="2" width="4" height="6" fill="#a8741a"/></g>`;}
    if(P.glowAm) g=`<ellipse cx="0" cy="-100" rx="30" ry="22" fill="#fff3a0" opacity="${.35*clamp(P.glowAm)}" filter="url(#blur4)"/>`+g;
    s+=g;}
  // arms
  const arm=(ang,dx,side)=>{const hand=P.gloves?'#f0b81e':P.skin;
    let g=`<g transform="translate(${dx} -112) rotate(${ang})"><rect x="-6" y="0" width="12" height="50" rx="6" fill="${P.vest&&false?'#ff7a1a':P.shirt}"/>`;
    g+=`<circle cx="0" cy="52" r="8" fill="${hand}"/>`;
    if(P.gloves) g+=`<rect x="-8" y="44" width="16" height="6" fill="#d39a0c"/>`;
    if(P.thumb&&side>0) g+=`<rect x="-3" y="36" width="7" height="14" rx="3" fill="${hand}"/>`;
    if(P.bag&&side>0) g+=`<g transform="rotate(${-ang} 0 52)"><rect x="-20" y="56" width="40" height="26" rx="4" fill="#7a4a24" stroke="#3e2410" stroke-width="2"/><path d="M-8 56 q8 -10 16 0" stroke="#3e2410" stroke-width="3" fill="none"/><rect x="-20" y="64" width="40" height="4" fill="#3e2410"/></g>`;
    if(P.phone&&side>0) g+=`<rect x="-6" y="38" width="12" height="22" rx="3" fill="#222" transform="rotate(20 0 50)"/>`;
    if(P.cup&&side<0) g+=`<g transform="rotate(${-ang} 0 52)"><path d="M-8 40 h16 l-2 20 h-12 z" fill="#fff" stroke="#555" stroke-width="1.5"/><rect x="-8" y="46" width="16" height="6" fill="#8a5a2b"/><path d="M-2 36 q3 -6 0 -10 M4 36 q3 -6 0 -10" stroke="#ccc" stroke-width="1.5" fill="none"/></g>`;
    return g+`</g>`};
  s+=arm(P.armL,-25,-1)+arm(P.armR,25,1);
  // head
  s+=`<g transform="translate(0 -152)">`;
  if(P.eyes==='white') s+=`<circle r="44" fill="url(#aura)"/>`;
  s+=`<rect x="-8" y="22" width="16" height="10" fill="${P.skin}"/><circle r="31" fill="${P.skin}"/>`;
  if(P.tint) s+=`<circle r="31" fill="#8fd8ff" opacity="${P.tint*.45}"/>`;
  if(!P.helmet) s+=`<path d="M-31 -4 Q-30 -34 0 -34 Q30 -34 31 -4 Q20 -18 0 -18 Q-16 -18 -31 -4 Z" fill="${P.hair}"/>`;
  if(!P.helmet&&P.hat==='cap') s+=`<path d="M-30 -8 Q-30 -36 0 -36 Q30 -36 30 -8 Z" fill="${P.capCol}"/><path d="M0 -10 h44 q4 0 2 5 h-46 z" fill="${P.capCol}" stroke="#00000030"/><circle cx="0" cy="-35" r="3" fill="#00000040"/>`;
  if(!P.helmet&&P.hat==='guard') s+=`<path d="M-30 -10 L-34 -30 Q0 -44 34 -30 L30 -10 Z" fill="#1d2b55"/><rect x="-31" y="-14" width="62" height="7" fill="#11193a"/><path d="M-26 -8 q26 10 52 0 l2 4 q-28 10 -56 0 z" fill="#0b1026"/><circle cx="0" cy="-26" r="5" fill="#ffd23f"/>`;
  s+=`<ellipse cx="-31" cy="4" rx="5" ry="7" fill="${P.skin}"/><ellipse cx="31" cy="4" rx="5" ry="7" fill="${P.skin}"/>`;
  if(P.plugs) s+=`<circle cx="-31" cy="4" r="4.5" fill="#ff7a1a" stroke="#a84a00" stroke-width="1.2"/><circle cx="31" cy="4" r="4.5" fill="#ff7a1a" stroke="#a84a00" stroke-width="1.2"/>`;
  if(P.eyes==='white') s+=`<circle cx="-11" cy="0" r="7.5" fill="#fff" filter="url(#glow)"/><circle cx="11" cy="0" r="7.5" fill="#fff" filter="url(#glow)"/>`;
  else if(P.eyes==='wide') s+=`<circle cx="-11" cy="0" r="7" fill="#fff" stroke="#222" stroke-width="1.5"/><circle cx="11" cy="0" r="7" fill="#fff" stroke="#222" stroke-width="1.5"/><circle cx="-11" cy="1" r="3" fill="#222"/><circle cx="11" cy="1" r="3" fill="#222"/>`;
  else if(P.eyes==='x') s+=`<path d="M-16 -5 l10 10 M-6 -5 l-10 10 M6 -5 l10 10 M16 -5 l-10 10" stroke="#222" stroke-width="2.8" stroke-linecap="round"/>`;
  else if(P.eyes==='squeeze') s+=`<path d="M-17 -4 l10 4 l-10 4 M17 -4 l-10 4 l10 4" stroke="#222" stroke-width="2.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  else if(P.eyes==='closed') s+=`<path d="M-17 1 q6 4 12 0 M5 1 q6 4 12 0" stroke="#222" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
  else if(P.eyes==='lazy') s+=`<path d="M-17 -1 h12 M5 -1 h12" stroke="#222" stroke-width="2.5" stroke-linecap="round"/><circle cx="-11" cy="2" r="3" fill="#222"/><circle cx="11" cy="2" r="3" fill="#222"/>`;
  else s+=`<circle cx="-11" cy="0" r="3.6" fill="#222"/><circle cx="11" cy="0" r="3.6" fill="#222"/>`;
  s+=`<circle cx="-19" cy="10" r="5" fill="#ff8a8a" opacity=".35"/><circle cx="19" cy="10" r="5" fill="#ff8a8a" opacity=".35"/>`;
  const m={smile:`<path d="M-9 12 q9 8 18 0" stroke="#222" stroke-width="2.5" fill="none" stroke-linecap="round"/>`,
    grin:`<path d="M-11 11 q11 12 22 0 z" fill="#7a1c1c"/>`,
    o:`<ellipse cx="0" cy="14" rx="5" ry="7" fill="#7a1c1c"/>`,
    flat:`<path d="M-7 14 h14" stroke="#222" stroke-width="2.5" stroke-linecap="round"/>`,
    smirk:`<path d="M-8 14 q10 4 14 -3" stroke="#222" stroke-width="2.5" fill="none" stroke-linecap="round"/>`,
    ghost:`<path d="M-10 12 q5 -4 10 0 q5 4 10 0" stroke="#fff" stroke-width="2.5" fill="none"/>`}[P.mouth];
  s+=m;
  if(P.mustache) s+=`<path d="M-14 10 q7 -6 14 -1 q7 -5 14 1 q-7 5 -14 1 q-7 4 -14 -1 z" fill="${P.hair}"/>`;
  if(P.tears) s+=`<path d="M-12 5 q-3 12 -1 ${16+P.tears*10}" stroke="#5cc8ff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".9"/><path d="M12 5 q3 12 1 ${16+P.tears*10}" stroke="#5cc8ff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".9"/>`;
  if(P.glasses) s+=`<g><rect x="-21" y="-8" width="42" height="15" rx="6" fill="#bfefff" fill-opacity=".45" stroke="#1b1b1b" stroke-width="2.2"/><line x1="-21" y1="-1" x2="-31" y2="-3" stroke="#1b1b1b" stroke-width="2.2"/><line x1="21" y1="-1" x2="31" y2="-3" stroke="#1b1b1b" stroke-width="2.2"/><path d="M-15 -4 l6 -2" stroke="#fff" stroke-width="2" opacity=".8"/></g>`;
  if(P.sweat) for(let i=0;i<2;i++) s+=`<path transform="translate(${26+i*8} ${-18+i*10}) scale(${P.sweat})" d="M0 -7 Q6 2 0 6 Q-6 2 0 -7 Z" fill="#7fd0ff" stroke="#2b7bb5" stroke-width="1"/>`;
  if(P.helmet&&P.chin) s+=`<path d="M-30 -8 Q-22 34 0 34 Q22 34 30 -8" stroke="#3a3a3a" stroke-width="2.5" fill="none"/>`;
  if(P.bump&&!P.helmet) s+=`<ellipse cx="6" cy="-34" rx="${9*P.bump}" ry="${7*P.bump}" fill="#f08a7a" stroke="#c0503f" stroke-width="1.5"/>`;
  if(P.helmet) s+=helmetShape(0,-12,1,P.helmetCol||'#ffcc1f',0,P.dent)+(P.yantra?yantraMark(0,-30,.8):'');
  if(P.medal) s+=`<g transform="translate(0 52)"><path d="M-12 -22 L0 8 L12 -22" stroke="#1f5aa6" stroke-width="5" fill="none"/><circle cx="0" cy="18" r="13" fill="#ffcf33" stroke="#b8860b" stroke-width="2.5"/><text x="0" y="24" text-anchor="middle" font-size="15" font-weight="900" fill="#b8860b">1</text></g>`;
  s+=`</g>`;
  if(P.sit) s+=`</g>`;
  s+=`</g></g>`;
  return s;
}

function ghost(x,y,op,t,o={}){
  let s=`<g opacity="${op}" transform="translate(0 ${Math.sin(t*2)*6})">`;
  s+=`<ellipse cx="${x}" cy="${y-110}" rx="80" ry="120" fill="url(#aura)"/>`;
  s+=`<g filter="url(#glow)">`;
  s+=person({x,y:y-20,skin:'#dff6ff',shirt:'#bfe6f7',pants:'#bfe6f7',hair:'#cfe7f0',helmet:true,chin:true,glasses:!!o.glasses,vest:true,gloves:true,boots:false,eyes:o.eyes||'closed',mouth:o.mouth||'smile',armR:o.armR!=null?o.armR:-150,armL:o.armL!=null?o.armL:12,op:.92,flip:o.flip||1,thumb:!!o.thumb});
  if(o.amulet) s+=`<g transform="translate(${x} ${y-20})"><path d="M-14 -122 Q0 -96 14 -122" stroke="#fff" stroke-width="2" fill="none"/><rect x="-5" y="-104" width="10" height="13" rx="2" fill="#fff6c4" stroke="#c9a227"/></g>`;
  if(o.clip) s+=`<g transform="translate(${x-40} ${y-110}) rotate(-12)"><rect x="-18" y="-24" width="36" height="48" rx="3" fill="#e8d9b5" stroke="#8a7650" stroke-width="2"/><rect x="-8" y="-28" width="16" height="8" rx="2" fill="#888"/><path d="M-11 -10 h22 M-11 -2 h22 M-11 6 h16 M-11 14 h18" stroke="#8a7650" stroke-width="2"/></g>`;
  // tail over legs
  s+=`<path d="M${x-26} ${y-80} L${x+26} ${y-80} L${x+26} ${y-30} q-9 ${14+Math.sin(t*5)*4} -17 0 q-9 ${-12} -18 0 q-9 ${12} -17 0 Z" fill="#bfe6f7"/>`;
  // mustache old man
  s+=`<path d="M${x-10} ${y-158} q10 -6 20 0" stroke="#fff" stroke-width="4" fill="none"/>`;
  s+=`</g></g>`;
  return s;
}

// ---------- UI ----------
function topUI(chip){
  let s=`<g filter="url(#shadow)"><rect x="14" y="20" width="156" height="30" rx="15" fill="#e6242b"/>
   <circle cx="31" cy="35" r="5" fill="#fff"/><text x="42" y="41" font-size="15" font-weight="900" fill="#fff">SAFETY ALERT</text></g>`;
  if(chip){const w=chip.length*12+34;
    s+=`<g filter="url(#shadow)"><rect x="${526-w}" y="20" width="${w}" height="30" rx="15" fill="#ffd23f" stroke="#1b1b1b" stroke-width="2"/>
    <text x="${526-w/2}" y="41" text-anchor="middle" font-size="16" font-weight="900" fill="#1b1b1b">${esc(chip)}</text></g>`;}
  return s;
}
function titleCard(lines,t,fs=30){
  const p=back(prog(t,0,.35)), op=clamp(t/.15);
  const h=lines.length*(fs+12)+30;
  let s=`<g opacity="${op}" transform="translate(270 ${66+h/2}) scale(${.85+.15*p}) translate(-270 ${-(66+h/2)})">`;
  s+=`<rect x="14" y="66" width="512" height="${h}" rx="16" fill="#2a1636" fill-opacity=".9" stroke="#ffffff30" stroke-width="2"/>`;
  lines.forEach((l,i)=>s+=`<text x="270" y="${66+22+fs+i*(fs+12)}" text-anchor="middle" font-size="${fs}" font-weight="700" fill="#fff" paint-order="stroke" stroke="#2a1636" stroke-width="2">${rich(l)}</text>`);
  return s+`</g>`;
}
function burst(x,y,text,t,o={}){
  const sc=back(prog(t,0,.25))*(o.sc||1), rot=o.rot||-8, fill=o.fill||'#fff', col=o.col||'#e6242b';
  if(t<0) return '';
  let pts=[];const n=14;for(let i=0;i<n*2;i++){const r=i%2?60:92;const a=i/(n*2)*Math.PI*2;pts.push([Math.cos(a)*r*1.45,Math.sin(a)*r*.75]);}
  return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${sc})">
   <polygon points="${pts.map(p=>p.join(',')).join(' ')}" fill="${fill}" stroke="#1b1b1b" stroke-width="4"/>
   <text y="13" text-anchor="middle" font-size="${o.fs||40}" font-weight="900" fill="${col}" paint-order="stroke" stroke="#1b1b1b" stroke-width="5">${esc(text)}</text></g>`;
}
function tag(x,y,text,t,o={}){
  if(t<0) return '';
  const sc=back(prog(t,0,.25)); const w=text.length*(o.fs||16)*.62+26;
  return `<g transform="translate(${x} ${y}) rotate(${o.rot||-4}) scale(${sc})" filter="url(#shadow)">
   <rect x="${-w/2}" y="-17" width="${w}" height="34" rx="9" fill="${o.bg||'#ffd23f'}" stroke="#1b1b1b" stroke-width="2.5"/>
   <text y="7" text-anchor="middle" font-size="${o.fs||16}" font-weight="900" fill="${o.col||'#1b1b1b'}">${esc(text)}</text></g>`;
}
function bubble(x,y,lines,t){
  if(t<0) return '';
  const sc=back(prog(t,0,.3)); const w=Math.max(...lines.map(l=>l.length))*13+40, h=lines.length*30+24;
  let s=`<g transform="translate(${x} ${y}) scale(${sc})" filter="url(#shadow)"><path d="M${-w/2} ${-h} h${w} v${h} h${-w/2+50} l-30 26 l4 -26 h${-w/2+-24+20} z" fill="#fff" stroke="#1b1b1b" stroke-width="3" stroke-linejoin="round"/>`;
  lines.forEach((l,i)=>s+=`<text x="0" y="${-h+36+i*30}" text-anchor="middle" font-size="23" font-weight="700" fill="#1b1b1b">${rich(l,'#e6242b','#1b1b1b')}</text>`);
  return s+`</g>`;
}
function windLines(t,op){let s=`<g stroke="#d8e9ff" stroke-width="3" stroke-linecap="round" fill="none" opacity="${op}">`;
  for(let i=0;i<6;i++){const x=((t*420+i*150)%800)-200, y=430+i*48+Math.sin(t*3+i)*10;
    s+=`<path d="M${x} ${y} q40 -14 80 0 t80 0"/>`;} return s+`</g>`;}
function xMark(x,y,t){if(t<0)return'';const sc=back(prog(t,0,.25));return `<g transform="translate(${x} ${y}) scale(${sc})"><circle r="13" fill="#e6242b" stroke="#fff" stroke-width="2.5"/><path d="M-5 -5 L5 5 M5 -5 L-5 5" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/></g>`}
function check(x,y,t){if(t<0)return'';const sc=back(prog(t,0,.25));return `<g transform="translate(${x} ${y}) scale(${sc})"><circle r="13" fill="#1fb35a" stroke="#fff" stroke-width="2.5"/><path d="M-6 0 L-2 5 L6 -5" stroke="#fff" stroke-width="3.5" fill="none" stroke-linecap="round"/></g>`}
function sparkles(x,y,t,n=8,r=70){let s='';for(let i=0;i<n;i++){const a=i/n*Math.PI*2+t, rr=r*(.6+.4*Math.sin(t*4+i));const p=clamp(1-t*.6);
  s+=`<path transform="translate(${x+Math.cos(a)*rr} ${y+Math.sin(a)*rr}) scale(${.6+.4*Math.sin(t*6+i)})" d="M0 -9 L2.5 -2.5 L9 0 L2.5 2.5 L0 9 L-2.5 2.5 L-9 0 L-2.5 -2.5 Z" fill="#fff36b" opacity="${p}"/>`;}return s;}
function ppeIcon(kind,x,y,sc=1){
  let g=`<g transform="translate(${x} ${y}) scale(${sc})"><circle r="38" fill="#1f6fd1" stroke="#fff" stroke-width="4"/>`;
  if(kind==='helmet') g+=helmetShape(0,10,.62,'#ffcc1f');
  if(kind==='vest') g+=`<path d="M-18 -20 h10 l8 14 l8 -14 h10 v40 h-36 z" fill="#ff7a1a"/><rect x="-18" y="0" width="36" height="5" fill="#eee"/><rect x="-18" y="10" width="36" height="5" fill="#eee"/>`;
  if(kind==='gloves') g+=`<path d="M-12 18 v-22 q0 -4 4 -4 v-10 q0 -4 4 -4 q4 0 4 4 v8 v-12 q0 -4 4 -4 q4 0 4 4 v12 v-8 q0 -4 4 -4 q4 0 4 4 v22 q0 14 -14 14 q-12 0 -14 -6 z" fill="#f0b81e" stroke="#b58500" stroke-width="2"/>`;
  if(kind==='glasses') g+=`<rect x="-26" y="-10" width="52" height="20" rx="8" fill="#bfefff" stroke="#1b1b1b" stroke-width="3"/><path d="M-18 -4 l8 -3" stroke="#fff" stroke-width="3"/>`;
  if(kind==='rope') g+=`<g fill="none" stroke="#e8c27a" stroke-width="5"><ellipse rx="20" ry="14"/><ellipse rx="12" ry="8"/></g><path d="M18 6 q10 10 4 22" stroke="#e8c27a" stroke-width="5" fill="none"/>`;
  if(kind==='plugs') g+=`<path d="M-14 -14 q-10 14 0 28" stroke="#1b1b1b" stroke-width="3" fill="none"/><path d="M14 -14 q10 14 0 28" stroke="#1b1b1b" stroke-width="3" fill="none"/><circle cx="-12" cy="0" r="8" fill="#ff7a1a"/><circle cx="12" cy="0" r="8" fill="#ff7a1a"/>`;
  if(kind==='boots') g+=`<path d="M-20 -18 h18 v20 h14 q8 0 8 8 v6 h-40 z" fill="#2a2a2a"/><rect x="-20" y="14" width="40" height="5" fill="#ffcc1f"/>`;
  return g+`</g>`;
}
const PPE_NAMES={plugs:'ที่อุดหู',rope:'เชือกนำทาง',glasses:'แว่นเซฟตี้',helmet:'หมวกนิรภัย',vest:'เสื้อสะท้อนแสง',gloves:'ถุงมือ',boots:'รองเท้าเซฟตี้'};


function cabinet(x,y,open=0){
  let s=`<g><rect x="${x}" y="${y-110}" width="86" height="110" rx="4" fill="#2f6fb3"/><rect x="${x+4}" y="${y-106}" width="78" height="102" rx="3" fill="#3d83cc"/>`;
  s+=`<rect x="${x+16}" y="${y-100}" width="54" height="20" rx="4" fill="#ffd23f"/><text x="${x+43}" y="${y-84}" text-anchor="middle" font-size="16" font-weight="900" fill="#1b1b1b">PPE</text>`;
  if(open>0){ s+=`<rect x="${x+6}" y="${y-74}" width="74" height="68" fill="#18304d"/>`;
    s+=helmetShape(x+24,y-50,.7,'#ffcc1f')+`<rect x="${x+44}" y="${y-62}" width="22" height="28" fill="#ff7a1a"/><rect x="${x+44}" y="${y-52}" width="22" height="4" fill="#eee"/>`;
    s+=`<rect x="${x+12}" y="${y-28}" width="20" height="14" rx="3" fill="#222"/><rect x="${x+50}" y="${y-28}" width="20" height="14" rx="3" fill="#222"/>`;
    s+=`<rect x="${x+4}" y="${y-74}" width="${78*(1-open)+6}" height="68" fill="#3d83cc" stroke="#2f6fb3"/>`;}
  else s+=`<line x1="${x+43}" y1="${y-74}" x2="${x+43}" y2="${y-6}" stroke="#2f6fb3" stroke-width="2"/><rect x="${x+36}" y="${y-44}" width="4" height="12" fill="#ddd"/><rect x="${x+46}" y="${y-44}" width="4" height="12" fill="#ddd"/>`;
  return s+`</g>`;
}


const Z=1.18;
function watermark(){return `<g opacity=".88"><rect x="392" y="902" width="130" height="28" rx="14" fill="#000" fill-opacity=".43"/>
 <text x="457" y="922" text-anchor="middle" font-size="16" font-weight="600" fill="#fff">ภนว | AI Guide</text></g>`;}
window.render=(n,t,d)=>{let out=SC[n](t,d);const i=out.indexOf('<!--UI-->');
  if(i>=0) out=`<g transform="translate(270 700) scale(${Z}) translate(-270 -700)">`+out.slice(0,i)+`</g>`+out.slice(i);
  document.getElementById('v').innerHTML=DEFS+(window.EXTRA_DEFS||'')+out+watermark();};
const SC={};
