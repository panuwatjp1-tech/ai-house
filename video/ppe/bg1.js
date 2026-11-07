// ---------- background ----------
function background(t,o={}){
  const day=o.day||0;
  let s='';
  s+=`<rect width="540" height="960" fill="url(#sky)"/>`;
  if(day>0) s+=`<rect width="540" height="960" fill="url(#skyDay)" opacity="${day}"/>`;
  // stars
  if(day<1){for(let i=0;i<40;i++){const x=rnd(i)*540,y=rnd(i+99)*420,tw=.4+.6*Math.abs(Math.sin(t*2+i));
    s+=`<circle cx="${x}" cy="${y}" r="${rnd(i+5)*1.3+.4}" fill="#fff" opacity="${tw*(1-day)*.8}"/>`;}}
  // moon
  s+=`<g opacity="${1-day}"><circle cx="440" cy="300" r="90" fill="url(#moonGlow)"/><circle cx="440" cy="300" r="36" fill="#f6edc8"/>
   <circle cx="428" cy="290" r="7" fill="#e6dab0"/><circle cx="452" cy="312" r="5" fill="#e6dab0"/><circle cx="446" cy="284" r="3" fill="#e6dab0"/></g>`;
  // far city silhouettes
  s+=`<g fill="${day?'#6f8fb8':'#3a2252'}">`;
  const bx=[0,40,95,150,330,380,450,500];const bh=[150,210,170,230,190,240,160,200];
  bx.forEach((x,i)=>{s+=`<rect x="${x}" y="${700-bh[i]-60}" width="${48}" height="${bh[i]+60}"/>`});
  s+=`</g>`;
  // crane
  const cr=day?'#c98a1c':'#5b3a74';
  s+=`<g stroke="${cr}" stroke-width="3" fill="none">
   <line x1="190" y1="700" x2="190" y2="285"/><line x1="206" y1="700" x2="206" y2="285"/>`;
  for(let y=300;y<700;y+=24) s+=`<line x1="190" y1="${y}" x2="206" y2="${y+24}"/>`;
  s+=`<line x1="150" y1="285" x2="520" y2="285"/><line x1="150" y1="298" x2="520" y2="298"/>`;
  for(let x=160;x<520;x+=22) s+=`<line x1="${x}" y1="285" x2="${x+22}" y2="298"/>`;
  s+=`<line x1="198" y1="285" x2="198" y2="255"/><line x1="198" y1="255" x2="150" y2="285"/><line x1="198" y1="255" x2="400" y2="285"/>
   <line x1="420" y1="298" x2="420" y2="${360+Math.sin(t*1.3)*6}" stroke-width="1.5"/></g>
   <rect x="140" y="288" width="22" height="20" fill="${cr}"/>
   <path d="M413 ${360+Math.sin(t*1.3)*6} h14 l-7 10z" fill="${cr}"/>`;
  // building under construction
  const col=day?'#9aa2ad':'#6d6a80', slab=day?'#b9c0c9':'#857f98', win=day?'#4f5b6b':'#2a1f3a';
  s+=`<g>`;
  for(let f=0;f<4;f++){const y=380+f*82;
    s+=`<rect x="250" y="${y}" width="270" height="${82}" fill="${win}"/>`;
    s+=`<rect x="246" y="${y}" width="278" height="12" fill="${slab}"/>`;}
  [250,320,390,460,512].forEach(x=>s+=`<rect x="${x}" y="380" width="12" height="320" fill="${col}"/>`);
  // rebar sticking out top
  for(let x=254;x<520;x+=18) s+=`<line x1="${x}" y1="380" x2="${x+2}" y2="352" stroke="${col}" stroke-width="2"/>`;
  // lit window
  s+=`<rect x="402" y="474" width="58" height="62" fill="#ffd36b" opacity="${day?0:.25}"/>`;
  s+=`</g>`;
  // scaffold
  const sc=day?'#ff8a1f':'#d06a26', pl=day?'#e9b84a':'#b88c3a';
  s+=`<g>`;
  [266,336,406,476].forEach(x=>s+=`<rect x="${x}" y="360" width="5" height="340" fill="${sc}"/>`);
  for(let f=0;f<4;f++){const y=455+f*82;s+=`<rect x="258" y="${y}" width="232" height="9" fill="${pl}" stroke="#00000033"/>`;
    s+=`<line x1="268" y1="${y-78}" x2="338" y2="${y}" stroke="${sc}" stroke-width="2.5"/><line x1="408" y1="${y-78}" x2="478" y2="${y}" stroke="${sc}" stroke-width="2.5"/>`;}
  s+=`</g>`;
  // floodlight
  const fl=o.flicker!=null?o.flicker:1;
  s+=`<rect x="128" y="420" width="6" height="280" fill="#3a3448"/>
   <rect x="112" y="408" width="38" height="18" rx="3" fill="#2d2838"/>
   <rect x="115" y="422" width="32" height="5" fill="#fff8c4" opacity="${.3+.7*fl}"/>
   <path d="M114 426 L148 426 L330 700 L-40 700 Z" fill="url(#beam)" opacity="${fl*(1-day)}"/>`;
  // ground
  s+=`<rect x="0" y="700" width="540" height="160" fill="${day?'#8d8a96':'#4b4560'}"/>
   <rect x="0" y="700" width="540" height="8" fill="${day?'#a5a2ad':'#5e5775'}"/>
   <rect x="0" y="860" width="540" height="100" fill="${day?'#8a6245':'#4d3527'}"/>`;
  for(let i=0;i<14;i++) s+=`<ellipse cx="${rnd(i+30)*540}" cy="${870+rnd(i+60)*80}" rx="${4+rnd(i)*7}" ry="3" fill="#00000030"/>`;
  // rubble & material
  s+=`<g><rect x="380" y="682" width="120" height="10" rx="5" fill="#7d7d88"/><rect x="390" y="672" width="110" height="10" rx="5" fill="#8d8d98"/>
     <circle cx="383" cy="687" r="5" fill="#55555f"/><circle cx="393" cy="677" r="5" fill="#55555f"/></g>`;
  // cones
  [[230,700],[520,700]].forEach(([x,y])=>s+=`<path d="M${x-10} ${y} L${x} ${y-30} L${x+10} ${y} Z" fill="#ff6a13"/><rect x="${x-6}" y="${y-18}" width="12" height="5" fill="#fff"/><rect x="${x-13}" y="${y-3}" width="26" height="4" fill="#d84f0a"/>`);
  return s;
}

function shrine(t,o={}){
  const x=72,smoke=o.smoke!=null?o.smoke:1;
  let s=`<g>`;
  s+=`<rect x="${x-7}" y="560" width="14" height="140" fill="#e9e2d6"/><rect x="${x-14}" y="692" width="28" height="8" fill="#cfc6b6"/>`;
  s+=`<rect x="${x-40}" y="552" width="80" height="10" fill="#c79a2b"/>`;
  s+=`<rect x="${x-28}" y="505" width="56" height="48" fill="#b8282c"/><rect x="${x-12}" y="520" width="24" height="33" fill="#5a1214"/>`;
  s+=`<path d="M${x-38} 508 L${x} 470 L${x+38} 508 Z" fill="#e6b52e"/><path d="M${x-28} 482 L${x} 452 L${x+28} 482 Z" fill="#f1c84a"/>`;
  s+=`<line x1="${x}" y1="452" x2="${x}" y2="436" stroke="#f1c84a" stroke-width="3"/>`;
  s+=`<path d="M${x-38} 508 q-6 -6 -4 -14" stroke="#e6b52e" stroke-width="3" fill="none"/><path d="M${x+38} 508 q6 -6 4 -14" stroke="#e6b52e" stroke-width="3" fill="none"/>`;
  // garland
  s+=`<path d="M${x-26} 510 q26 20 52 0" stroke="#ffcf3a" stroke-width="4" fill="none" stroke-dasharray="3 3"/>`;
  // incense
  [-8,0,8].forEach(d=>s+=`<line x1="${x+d+34}" y1="552" x2="${x+d+36}" y2="530" stroke="#d14b2b" stroke-width="1.6"/><circle cx="${x+d+36}" cy="530" r="1.6" fill="#ff8b3d"/>`);
  if(smoke>0){for(let k=0;k<3;k++){let p=`M${x+36+(k-1)*8} 528`;for(let j=1;j<8;j++){p+=` Q${x+36+(k-1)*8+Math.sin(t*2+j+k)*10} ${528-j*12+6} ${x+36+(k-1)*8+Math.sin(t*2.3+j*1.3+k)*8} ${528-j*12}`;}
     s+=`<path d="${p}" stroke="#e8e2ff" stroke-width="2" fill="none" opacity="${.35*smoke}" stroke-linecap="round"/>`;}}
  s+=`</g>`;return s;
}

