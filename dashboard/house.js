// ภาพบ้าน AI House: ห้องตามแผนก พนักงาน AI ขยับทำงาน สถานะจาก catalog.json
(function(){
const ROOMS=[
 {k:'head',name:'ห้องหัวหน้าบ้าน',who:'Claude',x:15,y:150,w:350,h:140,wall:'#fff1c9',shirt:'#e8833a',hat:'cap',hatCol:'#1b1b2f',screen:'brain'},
 {k:'video',name:'แผนกคลิป',who:'ผู้กำกับ',x:15,y:300,w:170,h:140,wall:'#efe2ff',shirt:'#7b4fd6',hat:'beret',hatCol:'#2b2b2b',screen:'play'},
 {k:'affiliate',name:'แอฟฟิลิเอต',who:'นักขาย',x:195,y:300,w:170,h:140,wall:'#ffe6d6',shirt:'#ff6b2c',hat:'cap',hatCol:'#ff2d55',screen:'cart'},
 {k:'safety',name:'ความปลอดภัย',who:'จป.',x:15,y:450,w:170,h:140,wall:'#dcf7e3',shirt:'#f4f4f4',hat:'helmet',hatCol:'#27b04a',vest:'#35c95a',screen:'shield'},
 {k:'teaching',name:'สอน AI',who:'ครู',x:195,y:450,w:170,h:140,wall:'#dcecff',shirt:'#2f7de1',hat:'none',hatCol:'#222',screen:'ai'},
 {k:'personal',name:'ผู้ช่วยส่วนตัว',who:'เลขา',x:15,y:600,w:170,h:140,wall:'#ffe0ef',shirt:'#e0559a',hat:'bun',hatCol:'#3a2a20',screen:'list'},
];
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

function status(C,k){
  if(k==='head') return ['สั่งงานได้เลย','#ffd23f'];
  const it=C.items.filter(i=>i.dept===k), rv=it.filter(i=>i.status==='review').length, wip=it.filter(i=>i.status==='wip').length;
  if(wip) return ['กำลังทำ…','#6fb6ff'];
  if(rv) return [`รอคุณดู ${rv}`,'#ffd23f'];
  if(it.length) return [`เสร็จ ${it.length} งาน`,'#4fd67a'];
  return k==='affiliate'?['รอลิงก์สินค้า','#ff8a8a']:['ว่าง รองาน','#cfcbe8'];
}
function hat(r,cx,hy){
  const c=r.hatCol;
  if(r.hat==='helmet') return `<path d="M${cx-15} ${hy-2} q0 -18 15 -18 q15 0 15 18 z" fill="${c}"/><rect x="${cx-18}" y="${hy-3}" width="36" height="5" rx="2" fill="${c}"/>`;
  if(r.hat==='cap') return `<path d="M${cx-14} ${hy-4} q0 -14 14 -14 q14 0 14 14 z" fill="${c}"/><rect x="${cx}" y="${hy-6}" width="18" height="4" rx="2" fill="${c}"/>`;
  if(r.hat==='beret') return `<ellipse cx="${cx-2}" cy="${hy-9}" rx="16" ry="7" fill="${c}"/><circle cx="${cx+2}" cy="${hy-16}" r="2.5" fill="${c}"/>`;
  if(r.hat==='bun') return `<path d="M${cx-14} ${hy} q0 -16 14 -16 q14 0 14 16 q-6 -8 -14 -8 q-8 0 -14 8z" fill="${c}"/><circle cx="${cx}" cy="${hy-19}" r="6" fill="${c}"/>`;
  return `<path d="M${cx-14} ${hy} q0 -16 14 -16 q14 0 14 16 q-5 -7 -14 -7 q-9 0 -14 7z" fill="${c}"/>`;
}
function screen(r,sx,sy){
  const g={play:`<path d="M${sx+22} ${sy+9} l14 8 l-14 8z" fill="#fff"/>`,
    cart:`<path d="M${sx+16} ${sy+10} h4 l4 11 h12 l3 -8 h-17" stroke="#fff" stroke-width="2.4" fill="none"/><circle cx="${sx+26}" cy="${sy+25}" r="2" fill="#fff"/><circle cx="${sx+34}" cy="${sy+25}" r="2" fill="#fff"/>`,
    shield:`<path d="M${sx+29} ${sy+7} l10 4 v7 q0 8 -10 12 q-10 -4 -10 -12 v-7z" fill="#fff"/><path d="M${sx+24} ${sy+18} l4 4 l7 -8" stroke="#27b04a" stroke-width="2.4" fill="none"/>`,
    ai:`<text x="${sx+29}" y="${sy+24}" text-anchor="middle" font-size="14" font-weight="900" fill="#fff">AI</text>`,
    list:`<g stroke="#fff" stroke-width="2.4"><path d="M${sx+18} ${sy+11} h4 M${sx+26} ${sy+11} h14 M${sx+18} ${sy+18} h4 M${sx+26} ${sy+18} h14 M${sx+18} ${sy+25} h4 M${sx+26} ${sy+25} h10"/></g>`,
    brain:`<circle cx="${sx+29}" cy="${sy+17}" r="9" fill="none" stroke="#fff" stroke-width="2.4"/><path d="M${sx+29} ${sy+8} v18 M${sx+20} ${sy+17} h18" stroke="#fff" stroke-width="2"/>`};
  return g[r.screen]||'';
}
function worker(r,cx,fy,i){
  const hy=fy-52, d=(i*0.37).toFixed(2);
  return `<g class="bob" style="animation-delay:-${d}s">
   <rect x="${cx-15}" y="${fy-34}" width="30" height="30" rx="9" fill="${r.shirt}"/>
   ${r.vest?`<path d="M${cx-15} ${fy-30} h9 l6 14 l6 -14 h9 v26 h-30z" fill="${r.vest}"/><path d="M${cx-12} ${fy-16} h24" stroke="#e8f8ff" stroke-width="2.5"/>`:''}
   <circle cx="${cx}" cy="${hy+4}" r="15" fill="#f0c090"/>
   <circle cx="${cx-5}" cy="${hy+4}" r="2" fill="#222"/><circle cx="${cx+5}" cy="${hy+4}" r="2" fill="#222"/>
   <path d="M${cx-4} ${hy+11} q4 3 8 0" stroke="#7a3b2a" stroke-width="1.8" fill="none"/>
   <circle cx="${cx-9}" cy="${hy+9}" r="2.6" fill="#ff9a9a" opacity=".6"/><circle cx="${cx+9}" cy="${hy+9}" r="2.6" fill="#ff9a9a" opacity=".6"/>
   ${hat(r,cx,hy)}
   ${r.k==='head'?`<path d="M${cx-16} ${hy+2} q0 -20 16 -20 q16 0 16 20" stroke="#333" stroke-width="2.5" fill="none"/><rect x="${cx+13}" y="${hy}" width="5" height="9" rx="2" fill="#333"/>`:''}
  </g>
  <g class="type" style="animation-delay:-${d}s"><rect x="${cx+10}" y="${fy-28}" width="20" height="7" rx="3.5" fill="${r.shirt}"/><circle cx="${cx+30}" cy="${fy-24.5}" r="4" fill="#f0c090"/></g>
  <g class="type2" style="animation-delay:-${d}s"><rect x="${cx-30}" y="${fy-28}" width="20" height="7" rx="3.5" fill="${r.shirt}"/><circle cx="${cx-30}" cy="${fy-24.5}" r="4" fill="#f0c090"/></g>`;
}
function room(r,i,C){
  const [st,sc]=status(C,r.k), fy=r.y+r.h-14, cx=r.x+(r.k==='head'?110:58);
  const dx=cx+14, sx=cx+18, sy=fy-74;
  let s=`<g class="room" data-k="${r.k}" tabindex="0" role="button" aria-label="${esc(r.name)} ${esc(st)}">
  <rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" fill="${r.wall}"/>
  <rect x="${r.x}" y="${r.y+r.h-14}" width="${r.w}" height="14" fill="#c9a77a"/>
  <rect x="${r.x+6}" y="${r.y+6}" width="${esc(r.name).length*7.6+18}" height="20" rx="10" fill="#1b1b2f"/>
  <text x="${r.x+15}" y="${r.y+20}" font-size="12" font-weight="700" fill="#fff">${esc(r.name)}</text>`;
  // จอและโต๊ะ
  s+=`<rect x="${sx}" y="${sy}" width="58" height="34" rx="4" fill="#1b1b2f"/><rect class="glow" x="${sx+3}" y="${sy+3}" width="52" height="28" rx="2" fill="${r.k==='safety'?'#27b04a':r.k==='video'?'#7b4fd6':r.k==='affiliate'?'#ff6b2c':r.k==='teaching'?'#2f7de1':r.k==='personal'?'#e0559a':'#e8833a'}" style="animation-delay:-${i*0.5}s"/>${screen(r,sx,sy)}
  <rect x="${sx+25}" y="${sy+34}" width="8" height="8" fill="#555"/>`;
  s+=worker(r,cx,fy,i);
  s+=`<rect x="${cx-34}" y="${fy-22}" width="${dx-cx+90}" height="9" rx="2" fill="#8a5a33"/><rect x="${cx-28}" y="${fy-13}" width="6" height="13" fill="#6b4426"/><rect x="${dx+48}" y="${fy-13}" width="6" height="13" fill="#6b4426"/>`;
  if(r.k==='head') s+=`<g transform="translate(${r.x+240} ${r.y+62})"><rect width="84" height="52" rx="6" fill="#fff" stroke="#1b1b2f" stroke-width="2"/><text x="42" y="18" text-anchor="middle" font-size="10" font-weight="700" fill="#1b1b2f">แผนงานวันนี้</text><g class="ticks">${[0,1,2].map(j=>`<rect x="10" y="${26+j*8}" width="${50-j*10}" height="4" rx="2" fill="#cfcbe8"/><circle cx="70" cy="${28+j*8}" r="3" fill="#4fd67a"/>`).join('')}</g></g>`;
  // ป้ายสถานะ
  const bw=st.length*8.6+20, bx=r.x+r.w-bw-8, by=r.y+90;
  s+=`<g class="pop" style="animation-delay:-${i*0.6}s"><rect x="${bx}" y="${r.y+30}" width="${bw}" height="22" rx="11" fill="${sc}" stroke="#1b1b2f" stroke-width="2"/><text x="${bx+bw/2}" y="${r.y+45}" text-anchor="middle" font-size="12" font-weight="700" fill="#1b1b2f">${esc(st)}</text></g>`;
  return s+`</g>`;
}
function owner(x,y){ // เจ้าของบ้าน (จป.) ยืนหน้าประตู โบกมือ ถือมือถือ
  return `<g transform="translate(${x} ${y})">
   <rect x="-13" y="-34" width="26" height="30" rx="8" fill="#f4f4f4"/><path d="M-13 -30 h8 l5 12 l5 -12 h8 v26 h-26z" fill="#35c95a"/>
   <rect x="-12" y="-6" width="10" height="8" fill="#2d3b6b"/><rect x="2" y="-6" width="10" height="8" fill="#2d3b6b"/>
   <circle cy="-48" r="14" fill="#e8b886"/><circle cx="-5" cy="-48" r="2" fill="#222"/><circle cx="5" cy="-48" r="2" fill="#222"/><path d="M-4 -42 q4 3 8 0" stroke="#7a3b2a" stroke-width="1.8" fill="none"/>
   <path d="M-15 -50 q0 -18 15 -18 q15 0 15 18 z" fill="#27b04a"/><rect x="-18" y="-51" width="36" height="5" rx="2" fill="#27b04a"/>
   <g class="wave"><rect x="11" y="-44" width="6" height="18" rx="3" fill="#f4f4f4"/><circle cx="14" cy="-46" r="4" fill="#e8b886"/></g>
   <rect x="-20" y="-26" width="9" height="14" rx="2" fill="#1b1b2f"/><rect x="-19" y="-25" width="7" height="10" fill="#6fb6ff"/>
   <rect x="-34" y="4" width="68" height="16" rx="8" fill="#e6242b"/><text y="16" text-anchor="middle" font-size="10" font-weight="700" fill="#fff">เจ้าของบ้าน</text></g>`;
}
function ghost(x,y){
  return `<g class="float" transform="translate(${x} ${y})" opacity=".92">
   <path d="M-14 0 q0 -26 14 -26 q14 0 14 26 l-5 -5 l-4 5 l-5 -5 l-5 5 l-4 -5z" fill="#bff3ff"/>
   <circle cx="-5" cy="-12" r="2.2" fill="#1b1b2f"/><circle cx="5" cy="-12" r="2.2" fill="#1b1b2f"/>
   <path d="M-15 -20 q0 -16 15 -16 q15 0 15 16 z" fill="#ffcc1f"/><rect x="-17" y="-21" width="34" height="4" rx="2" fill="#ffcc1f"/>
   <rect x="-26" y="6" width="52" height="15" rx="7" fill="#1b1b2f"/><text y="17" text-anchor="middle" font-size="9" font-weight="700" fill="#bff3ff">ลุงช่าง</text></g>`;
}
window.houseSVG=function(C){
  const W=380,G=600,H=G+160;
  // พัสดุงานไหลลงท่อไปที่ช่องส่งงาน
  const pk=[0,1.4,2.8].map(b=>`<g><rect x="-7" y="-6" width="14" height="12" rx="2" fill="#ffd23f" stroke="#1b1b2f" stroke-width="1.5"/><animateMotion dur="4.2s" begin="${b}s" repeatCount="indefinite" path="M369 160 V${G+90} H330"/></g>`).join('');
  const belt=[0,1,2,3].map(j=>`<g><rect x="-8" y="-12" width="16" height="12" rx="2" fill="${['#ffd23f','#4fd67a','#6fb6ff','#ff8a8a'][j]}" stroke="#1b1b2f" stroke-width="1.5"/><animateMotion dur="6s" begin="${j*1.5}s" repeatCount="indefinite" path="M300 ${G+118} H200"/></g>`).join('');
  return `<svg class="house" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" font-family="Kanit,sans-serif">
  <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a2550"/><stop offset="1" stop-color="#5b4a9a"/></linearGradient></defs>
  <rect width="${W}" height="${H}" rx="18" fill="url(#sky)"/>
  ${[[40,30],[90,60],[300,24],[340,70],[250,50]].map(([a,b],j)=>`<circle class="tw" style="animation-delay:-${j*.7}s" cx="${a}" cy="${b}" r="1.8" fill="#fff"/>`).join('')}
  <circle cx="330" cy="40" r="14" fill="#fff3a0"/>
  <path d="M5 150 L190 40 L375 150 Z" fill="#e6242b" stroke="#1b1b2f" stroke-width="3"/>
  <rect x="100" y="92" width="180" height="46" rx="10" fill="#1b1b2f" stroke="#ffd23f" stroke-width="2.5"/>
  <text x="190" y="114" text-anchor="middle" font-size="19" font-weight="900" fill="#ffd23f">AI HOUSE</text>
  <text x="190" y="131" text-anchor="middle" font-size="11" font-weight="700" fill="#fff">ภนว | AI Guide</text>
  ${ghost(330,128)}
  <rect x="10" y="145" width="360" height="${G-3}" fill="#3b3456" stroke="#1b1b2f" stroke-width="3"/>
  ${ROOMS.map((r,i)=>room(r,i,C)).join('')}
  <rect x="195" y="${G}" width="170" height="140" fill="#fff6d8"/><rect x="195" y="${G+126}" width="170" height="14" fill="#c9a77a"/>
  <rect x="203" y="${G+6}" width="94" height="20" rx="10" fill="#1b1b2f"/><text x="250" y="${G+20}" text-anchor="middle" font-size="12" font-weight="700" fill="#fff">ช่องส่งงาน</text>
  <rect x="190" y="${G+118}" width="120" height="10" rx="5" fill="#555"/>${[0,1,2,3,4,5].map(j=>`<circle cx="${198+j*21}" cy="${G+123}" r="3" fill="#999"/>`).join('')}
  ${belt}
  <rect x="314" y="${G+66}" width="44" height="60" rx="4" fill="#8a5a33" stroke="#1b1b2f" stroke-width="2"/><circle cx="350" cy="${G+98}" r="3" fill="#ffd23f"/>
  <rect x="362" y="150" width="14" height="${G-60}" fill="#6b6390"/>
  ${pk}
  ${owner(232,G+104)}
  <rect x="0" y="${G+140}" width="${W}" height="20" fill="#4a8f3c"/>
  </svg>`;
};
window.PHASES=[
 ['ระบบคลิปการ์ตูนหลายเสียง (ผีเฝ้าไซต์)',100],['ระบบคลิปขายของภาพจริง ✓ (3 สินค้าพร้อม)',100],['โครงบ้าน 5 แผนก',100],['หน้าเว็บคลังผลงาน (ลิงก์ถาวร)',100],
 ['ทุกแผนกทำงานจริง',95],['ข้อมูล TikTok ✓ (รายงานทุกจันทร์)',100],['ย้ายขึ้น GitHub/Cloudflare ✓',100],['งานอัตโนมัติ (ไอเดียทุกเช้า ✓, LINE)',70]];
})();
