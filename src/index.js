const BASE={"version":4,"people":[],"vans":[{"id":"v1","name":"รถตู้คันที่ 1 บ่อวิน","origin":"บ่อวิน","capacity":10,"driver":"","meeting":""},{"id":"v2","name":"Hyundai H-1 เมืองทอง","origin":"เมืองทอง","capacity":6,"driver":"","meeting":""}],"executives":[{"id":"e1","name":"ผู้บริหารท่านที่ 1"},{"id":"e2","name":"ผู้บริหารท่านที่ 2"},{"id":"e3","name":"ผู้บริหารท่านที่ 3"}],"roomBookings":[]};
const PERSON_FIELDS=['name','dept','origin','van','status','sub','note','seat'];
const VAN_FIELDS=['name','origin','driver','meeting','capacity'];
function cleanPatch(p){
 if(!p||typeof p!=='object'||Array.isArray(p))throw Error('รูปแบบข้อมูลไม่ถูกต้อง');
 const out={people:[],vans:[],removePeople:[],removeVans:[],executives:[],roomBookings:[]};
 for(const [key,fields,limit] of [['people',PERSON_FIELDS,35],['vans',VAN_FIELDS,10]]){
   const rows=p[key]||[];
   if(!Array.isArray(rows)||rows.length>limit)throw Error('จำนวนรายการเกินกำหนด');
   for(const row of rows){
     if(!row||typeof row.id!=='string'||!/^[a-zA-Z0-9_-]{1,70}$/.test(row.id)||!row.changes||typeof row.changes!=='object')throw Error('รหัสหรือข้อมูลไม่ถูกต้อง');
     const changes={};
     for(const [field,value] of Object.entries(row.changes)){
       if(!fields.includes(field))throw Error('ฟิลด์ไม่ได้รับอนุญาต');
       if(field==='seat') {
         if(value!==null&&(!Number.isInteger(Number(value))||Number(value)<1||Number(value)>10))throw Error('เลขที่นั่งไม่ถูกต้อง');
         changes.seat=value===null?null:Number(value);
       }else if(field==='capacity'){
         if(!Number.isInteger(Number(value))||Number(value)<1||Number(value)>30)throw Error('จำนวนที่นั่งไม่ถูกต้อง');changes.capacity=Number(value);
       }else if(field==='status'){
         if(!['รอตอบรับ','ยืนยันไป','ไม่สะดวก','หาคนแทน','สำรอง','ยกเลิก'].includes(value))throw Error('สถานะไม่ถูกต้อง');changes.status=value;
       }else {
         if(typeof value!=='string'||value.length>400)throw Error('ข้อมูลตัวอักษรยาวเกินไป');
         changes[field]=value;
       }
     }
     if(Object.keys(changes).length)out[key].push({id:row.id,changes});
   }
 }
 for(const key of ['removePeople','removeVans']){
   const ids=p[key]||[];
   if(!Array.isArray(ids)||ids.length>30||ids.some(id=>typeof id!=='string'||!/^[a-zA-Z0-9_-]{1,70}$/.test(id)))throw Error('รหัสรายการลบไม่ถูกต้อง');
   out[key]=ids;
 }
 const exec=p.executives||[];
 if(!Array.isArray(exec)||exec.length>3)throw Error('จำนวนชื่อผู้บริหารเกินกำหนด');
 for(const row of exec){
  if(!row||!/^e[1-3]$/.test(String(row.id||''))||
   typeof row.name!=='string'||row.name.trim().length<2||row.name.length>65)
   throw Error('ชื่อผู้บริหารไม่ถูกต้อง');
  out.executives.push({id:row.id,name:row.name.trim()});
 }
 const bookings=p.roomBookings||[];
 if(!Array.isArray(bookings)||bookings.length>20)throw Error('รายการเลือกห้องเกินกำหนด');
 const seen=new Set();
 for(const r of bookings){
  if(!r||typeof r.guestId!=='string'||!/^(p[a-zA-Z0-9_-]{1,69}|e[1-3])$/.test(r.guestId)||
    (r.roomId!==null&&!/^(s[1-3]|d[1-9])$/.test(r.roomId||'')))
   throw Error('ข้อมูลห้องพักไม่ถูกต้อง');
  if(seen.has(r.guestId))throw Error('ชื่อผู้เข้าพักซ้ำ');
  seen.add(r.guestId);out.roomBookings.push({guestId:r.guestId,roomId:r.roomId});
 }
 return out;
}
function roomGroupOf_(state,person){
 const origin=String(person?.origin||'').trim();
 if(origin.includes('บ่อวิน'))return 'บ่อวิน';
 if(origin.includes('เมืองทอง'))return 'เมืองทอง';
 const van=state.vans.find(v=>v.id===person?.van);
 const vanOrigin=String(van?.origin||'');
 if(vanOrigin.includes('บ่อวิน'))return 'บ่อวิน';
 if(vanOrigin.includes('เมืองทอง'))return 'เมืองทอง';
 if(person?.van==='v1')return 'บ่อวิน';
 if(person?.van==='v2')return 'เมืองทอง';
 return null;
}
function applyPatch(state,patch,strict){
 for(const id of patch.removePeople||[]){
  state.people=state.people.filter(p=>p.id!==id);
  state.roomBookings=(state.roomBookings||[]).filter(b=>b.guestId!==id);
 }
 for(const id of patch.removeVans||[])state.vans=state.vans.filter(v=>v.id!==id);
 for(const row of patch.vans||[]){
   let van=state.vans.find(v=>v.id===row.id);
   if(!van){van={id:row.id,name:'',origin:'',capacity:10,driver:'',meeting:''};state.vans.push(van)}
   Object.assign(van,row.changes);
 }
 for(const row of patch.people||[]){
   const old=state.people.find(p=>p.id===row.id);
   const next=Object.assign({},old||{id:row.id,name:'',dept:'',origin:'',van:'',status:'รอตอบรับ',sub:'',note:'',seat:null},row.changes);
   if(next.seat!=null){
     const van=state.vans.find(v=>v.id===next.van);
     if(strict&&(!van||Number(next.seat)>(Number(van.capacity)||10)))return 'ที่นั่งเกินจำนวนที่รถรองรับ กรุณาเลือกที่นั่งใหม่';
   }
   if(next.seat!=null && !['ไม่สะดวก','ยกเลิก'].includes(next.status)){
     const occupied=state.people.find(p=>p.id!==next.id&&p.van===next.van&&Number(p.seat)===Number(next.seat)&&!['ไม่สะดวก','ยกเลิก'].includes(p.status));
     if(occupied){if(strict)return 'ที่นั่ง '+next.seat+' มีผู้จองแล้ว';next.seat=old?.seat??null; }
   }
   if(['ไม่สะดวก','ยกเลิก'].includes(next.status)){
    next.seat=null;
    state.roomBookings=(state.roomBookings||[]).filter(b=>b.guestId!==next.id);
   }
   if(old)Object.assign(old,next);else state.people.push(next);
 }
 if(!Array.isArray(state.executives))state.executives=JSON.parse(JSON.stringify(BASE.executives));
 if(!Array.isArray(state.roomBookings))state.roomBookings=[];
 for(const row of patch.executives||[]){
  const e=state.executives.find(x=>x.id===row.id);
  if(e)e.name=row.name;
 }
 for(const row of patch.roomBookings||[]){
  const person=state.people.find(p=>p.id===row.guestId);
  const isExecutive=state.executives.some(e=>e.id===row.guestId);
  if((!person&&!isExecutive)||(person&&['ไม่สะดวก','ยกเลิก'].includes(person.status))){
   if(strict)return 'ไม่พบผู้เข้าพักหรือผู้เดินทางไม่เข้าร่วม';
   continue;
  }
  if(row.roomId&&((isExecutive&&!row.roomId.startsWith('s'))||(!isExecutive&&!row.roomId.startsWith('d')))){
   if(strict)return 'ผู้บริหารพักห้องเดี่ยว ผู้ร่วมงานพักห้องคู่';
   continue;
  }
  if(row.roomId&&!isExecutive){
   if(person.status!=='ยืนยันไป'){
    if(strict)return 'ต้องยืนยันเดินทางก่อนจึงจะเลือกห้องพักได้';
    continue;
   }
   const group=roomGroupOf_(state,person);
   if(!group){
    if(strict)return 'ไม่พบกลุ่มเดินทางของพนักงาน';
    continue;
   }
   const limit=group==='บ่อวิน'?10:7;
   const other=state.roomBookings.filter(b=>b.guestId!==row.guestId&&b.roomId?.startsWith('d')&&
      roomGroupOf_(state,state.people.find(p=>p.id===b.guestId))===group).length;
   if(other>=limit){
    if(strict)return 'โควตาห้องพักกลุ่ม'+group+' ครบ '+limit+' คนแล้ว';
    continue;
   }
  }
  if(row.roomId){
   const capacity=row.roomId.startsWith('s')?1:2;
   const occupied=state.roomBookings.filter(b=>b.roomId===row.roomId&&b.guestId!==row.guestId).length;
   if(occupied>=capacity){
    if(strict)return 'ห้องพักนี้เต็มแล้ว กรุณาเลือกห้องอื่น';
    continue;
   }
  }
  state.roomBookings=state.roomBookings.filter(b=>b.guestId!==row.guestId);
  if(row.roomId)state.roomBookings.push({guestId:row.guestId,roomId:row.roomId});
 }
 return null;
}

const json=(value,status=200)=>new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store, max-age=0'}});
async function readState(DB){
 const row=await DB.prepare('SELECT version, data FROM trip_state WHERE id=1').first();
 if(!row)throw Error('UAT_DB_NOT_SEEDED');
 return {version:Number(row.version),state:JSON.parse(row.data)};
}
function emptyPatch(p){return !p.people.length&&!p.vans.length&&!p.removePeople.length&&!p.removeVans.length&&!p.executives.length&&!p.roomBookings.length}
async function tripApi(request,env){
 if(request.method!=='GET'&&request.method!=='POST')return json({ok:false,error:'Method not allowed'},405);
 if(!env.DB)return json({ok:false,error:'ยังไม่ได้เชื่อม Cloudflare D1'},503);
 try{
   if(request.method==='GET'){
     const current=await readState(env.DB);
     const version=String(current.version);
     if(new URL(request.url).searchParams.get('version')===version)return json({ok:true,changed:false,version});
     return json({ok:true,changed:true,version,data:current.state});
   }
   const raw=await request.text();
   if(raw.length>35000)return json({ok:false,error:'ข้อมูลมีขนาดใหญ่เกินกำหนด'},413);
   const parsed=JSON.parse(raw);
   const patch=cleanPatch(parsed?.patch||parsed);
   for(let attempt=0;attempt<5;attempt++){
     const before=await readState(env.DB);
     if(emptyPatch(patch))return json({ok:true,changed:false,version:String(before.version),data:before.state});
     const state=structuredClone(before.state);
     const error=applyPatch(state,patch,true);
     if(error)return json({ok:false,error,version:String(before.version),data:before.state},409);
     const result=await env.DB.prepare('UPDATE trip_state SET version=?, data=?, updated_at=CURRENT_TIMESTAMP WHERE id=1 AND version=?')
       .bind(before.version+1,JSON.stringify(state),before.version).run();
     if(result.meta.changes===1)return json({ok:true,changed:true,version:String(before.version+1),data:state});
   }
   return json({ok:false,error:'ข้อมูลถูกแก้ไขพร้อมกัน กรุณาลองใหม่'},409);
 }catch(err){
   console.error('csr7-d1:',err?.message||String(err));
   return json({ok:false,error:'ไม่สามารถเชื่อมฐานข้อมูล D1 ได้'},503);
 }
}
export default {
 async fetch(request,env){
   const pathname=new URL(request.url).pathname;
   if(pathname==='/api/trip')return tripApi(request,env);
   if(pathname==='/api/health'){
     try{const current=await readState(env.DB);return json({ok:true,service:'csr7-trip-uat',database:'D1',revision:current.version,mode:'snapshot-2026-11-06'});}
     catch(e){return json({ok:false,error:'D1 unavailable'},503)}
   }
   return env.ASSETS.fetch(request);
 }
};
