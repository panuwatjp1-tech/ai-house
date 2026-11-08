// ออฟฟิศสด: ทีม AI นั่งทำงานจริงตามสถานะใน status.json
(function(){
const ROOMS=[
 {k:'head',name:'หัวหน้าบ้าน',role:'Claude',x:10,y:62,w:340,h:128,col:'#ffd23f',shirt:'#f08a24'},
 {k:'video',name:'แผนกคลิป',role:'ตัดต่อ เสียง ลายน้ำ',x:10,y:200,w:166,h:120,col:'#a78bfa',shirt:'#7c3aed'},
 {k:'affiliate',name:'แอฟฟิลิเอต',role:'TikTok Shop',x:184,y:200,w:166,h:120,col:'#fb7185',shirt:'#e11d48'},
 {k:'safety',name:'ความปลอดภัย',role:'JSA WI แบบตรวจ',x:10,y:330,w:166,h:120,col:'#34d399',shirt:'#059669'},
 {k:'teaching',name:'สอน AI',role:'สื่อสอนกลุ่ม LINE',x:184,y:330,w:166,h:120,col:'#60a5fa',shirt:'#2563eb'},
 {k:'personal',name:'ผู้ช่วยส่วนตัว',role:'สรุปงาน นัดหมาย',x:10,y:460,w:166,h:120,col:'#fbbf24',shirt:'#d97706'},
 {k:'inbox',name:'รออนุมัติ',role:'',x:184,y:460,w:166,h:120,col:'#f472b6',shirt:''}
];
const ST={working:['กำลังทำ','#22c55e'],waiting:['รอคุณ','#f59e0b'],idle:['ว่าง','#64748b'],done:['เสร็จ','#38bdf8']};
const e=s=>String(s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const CM=/[\u0E31\u0E34-\u0E3A\u0E47-\u0E4E]/;
function wrap(t,n,max){const len=x=>[...x].filter(c=>!CM.test(c)).length,o=[];let l='';
  for(let w of String(t||'').split(/\s+/)){while(len(w)>n){if(l){o.push(l);l='';}let a=[...w],k=0,c=0;while(k<a.length&&(c<n||CM.test(a[k]))){if(!CM.test(a[k]))c++;k++;}o.push(a.slice(0,k).join(''));w=a.slice(k).join('');}
   if(!w)continue;if(l&&len(l)+1+len(w)>n){o.push(l);l=w;}else l=l?l+' '+w:w;}
  if(l)o.push(l);if(o.length>max){o.length=max;o[max-1]+='…';}return o;}
function agent(x,y,r,st,i){
  const w=st.state==='working', d=(i*0.37).toFixed(2);
  return `<g transform="translate(${x},${y})">
   <rect x="-26" y="10" width="52" height="6" rx="2" fill="#3b3157"/>
   <rect x="-18" y="-22" width="36" height="24" rx="3" fill="#0b1020" stroke="#475569"/>
   <rect x="-15" y="-19" width="30" height="18" rx="1" fill="${w?r.col:'#1e293b'}" opacity="${w?.28:1}"/>
   ${w?`<g class="scr" style="animation-delay:-${d}s"><rect x="-12" y="-16" width="18" height="2" fill="${r.col}"/><rect x="-12" y="-12" width="24" height="2" fill="#e2e8f0" opacity=".7"/><rect x="-12" y="-8" width="14" height="2" fill="#e2e8f0" opacity=".7"/><rect x="-12" y="-4" width="20" height="2" fill="${r.col}"/></g>`:''}
   <rect x="-3" y="2" width="6" height="8" fill="#475569"/>
   <g class="${w?'bob':''}" style="animation-delay:-${d}s">
    <rect x="-13" y="20" width="26" height="22" rx="9" fill="${r.shirt}"/>
    <circle cx="0" cy="13" r="10" fill="#f6c9a0"/>
    <path d="M-10 11 Q-9 1 0 2 Q10 1 10 11 Q6 6 0 7 Q-6 6 -10 11Z" fill="#2b1d14"/>
    ${w?`<g class="type" style="animation-delay:-${d}s"><rect x="-17" y="19" width="7" height="5" rx="2" fill="#f6c9a0"/><rect x="10" y="19" width="7" height="5" rx="2" fill="#f6c9a0"/></g>`:`<rect x="-15" y="28" width="6" height="5" rx="2" fill="#f6c9a0"/><rect x="9" y="28" width="6" height="5" rx="2" fill="#f6c9a0"/>`}
   </g>
   ${st.state==='idle'?`<text class="zz" x="14" y="2" font-size="9" fill="#94a3b8">z z</text>`:''}
   ${st.state==='waiting'?`<g class="ping"><circle cx="16" cy="-2" r="7" fill="#f59e0b"/><text x="16" y="1.5" font-size="9" font-weight="700" text-anchor="middle" fill="#111">!</text></g>`:''}
  </g>`;
}
function plant(x,y){return `<g transform="translate(${x},${y})"><rect x="-5" y="0" width="10" height="9" rx="2" fill="#7c5c3b"/><circle cx="-4" cy="-3" r="5" fill="#16a34a"/><circle cx="4" cy="-4" r="5" fill="#22c55e"/><circle cx="0" cy="-8" r="5" fill="#15803d"/></g>`;}
window.officeSVG=function(C,S){
  S=S||{}; const pend=C.items.filter(i=>i.status==='review');
  const cnt={}; C.items.forEach(i=>cnt[i.dept]=(cnt[i.dept]||0)+1);
  let h=`<svg class="office" viewBox="0 0 360 590" xmlns="http://www.w3.org/2000/svg" font-family="Kanit,sans-serif">
  <defs><linearGradient id="og" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0f172a"/><stop offset="1" stop-color="#1e1b4b"/></linearGradient>
  <pattern id="fl" width="16" height="16" patternUnits="userSpaceOnUse"><rect width="16" height="16" fill="#241f3a"/><path d="M0 16H16V0" fill="none" stroke="#2f2950" stroke-width="1"/></pattern></defs>
  <rect width="360" height="590" rx="18" fill="url(#og)"/>
  <g opacity=".35">${[...Array(14)].map((_,i)=>`<rect x="${14+i*24}" y="${16+(i*37%22)}" width="${8+(i%3)*4}" height="${30-(i*37%22)}" fill="#1e293b"/><rect class="win" style="animation-delay:-${i*0.7}s" x="${16+i*24}" y="${22+(i*37%22)}" width="2" height="2" fill="#fde68a"/>`).join('')}</g>
  <text x="18" y="30" font-size="15" font-weight="800" fill="#fff">AI HOUSE <tspan fill="#ffd23f">OFFICE</tspan></text>
  <text x="18" y="46" font-size="9" fill="#94a3b8">ภนว | AI Guide · ทีม AI ${ROOMS.length-1} ตัว · อัปเดต ${e(S.updated||C.updated)}</text>
  <g transform="translate(300,34)"><circle r="5" fill="#22c55e" class="ping"/><text x="9" y="3.5" font-size="9" fill="#86efac">LIVE</text></g>`;
  ROOMS.forEach((r,i)=>{
    const st=r.k==='inbox'?{}:(S[r.k]||{state:'idle',task:'รองานใหม่'}), s=ST[st.state]||ST.idle;
    h+=`<g class="room" data-k="${r.k}" style="cursor:pointer"><rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" rx="12" fill="url(#fl)" stroke="${r.col}" stroke-opacity=".55" stroke-width="1.5"/>
     <rect x="${r.x}" y="${r.y}" width="${r.w}" height="22" rx="12" fill="${r.col}" opacity=".16"/>
     <text x="${r.x+10}" y="${r.y+15}" font-size="11" font-weight="700" fill="#fff">${r.name}</text>`;
    if(r.k==='inbox'){
      h+=`<g transform="translate(${r.x+r.w/2},${r.y+62})"><g class="${pend.length?'bell':''}"><path d="M-14 8 Q-14 -14 0 -14 Q14 -14 14 8 L18 12 H-18Z" fill="#f472b6"/><circle cy="15" r="4" fill="#f472b6"/></g>
        <circle cx="14" cy="-12" r="10" fill="#ef4444"/><text x="14" y="-8" font-size="11" font-weight="800" text-anchor="middle" fill="#fff">${pend.length}</text></g>
        <text x="${r.x+r.w/2}" y="${r.y+r.h-14}" font-size="9.5" text-anchor="middle" fill="#fbcfe8">${pend.length?'แตะเพื่อตรวจและอนุมัติ':'ไม่มีงานค้าง'}</text></g>`;return;}
    h+=`<g transform="translate(${r.x+r.w-8},${r.y+11})"><rect x="-${s[0].length*6+14}" y="-8" width="${s[0].length*6+14}" height="16" rx="8" fill="${s[1]}" opacity=".2"/><circle cx="-${s[0].length*6+6}" r="3" fill="${s[1]}" class="${st.state==='working'?'ping':''}"/><text x="-4" y="3.5" font-size="9" text-anchor="end" fill="${s[1]}">${s[0]}</text></g>`;
    const big=r.k==='head', ax=big?r.x+70:r.x+42, ay=r.y+48;
    h+=agent(ax,ay,r,st,i);
    if(big){h+=`<g transform="translate(${r.x+322},${r.y+108})">${plant(0,0)}</g>`;}
    const tx=big?r.x+118:r.x+82, tw=big?210:76, lines=wrap(st.task,big?30:12,big?2:3);
    h+=`<g><rect x="${tx-6}" y="${r.y+30}" width="${tw}" height="${big?46:48}" rx="8" fill="#0b1020" opacity=".75" stroke="${r.col}" stroke-opacity=".35"/>
      ${lines.map((l,j)=>`<text x="${tx}" y="${r.y+(big?46:44)+j*(big?14:12)}" font-size="${big?11:9}" fill="#e2e8f0">${e(l)}</text>`).join('')}</g>`;
    h+=`<text x="${r.x+10}" y="${r.y+r.h-10}" font-size="9" fill="#94a3b8">${big?'สั่งงานผ่านแชต Claude ได้ตลอด 24 ชม.':e(r.role)+' · '+(cnt[r.k]||0)+' งาน'}</text></g>`;
  });
  h+=`</svg>`; return h;
};
window.inboxHTML=function(C){
  const p=C.items.filter(i=>i.status==='review');
  if(!p.length)return `<div class="card">ไม่มีงานรออนุมัติ 🎉</div>`;
  return p.map(i=>`<div class="card inb"><div class="meta">${e(i.date)} · ${e((ROOMS.find(r=>r.k===i.dept)||{}).name||i.dept)}</div><b>${e(i.title)}</b><div class="note">${e(i.note||'')}</div>
   <div class="acts"><button onclick="ask('อนุมัติ: ${e(i.title).replace(/'/g,'')}',this)">✅ อนุมัติ</button><button onclick="ask('ขอแก้: ${e(i.title).replace(/'/g,'')} → ',this)">✏️ ขอแก้</button></div></div>`).join('');
};
window.ask=function(t,b){const go=()=>{b.textContent='คัดลอกแล้ว วางในแชต Claude ✓';setTimeout(()=>location.href='https://claude.ai/code/session_013hRtPmV7aLMFepYWfmHj9N',700);};
  navigator.clipboard.writeText(t).then(go).catch(()=>{prompt('คัดลอกข้อความนี้ไปวางในแชต Claude',t);});};
})();
