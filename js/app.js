import { getYearRows, getYearSettings, saveYearSettings, addScheduleRow, listRequests, getRequest, updateRequest, writeAudit } from "./firebase/data.js";
import { initFirebase } from "./firebase/core.js";
import { login, logout, watchAuth } from "./firebase/auth.js";
import { createPdfFromElement } from "./export/pdf.js";

const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const DAYS=["السبت","الأحد","الإثنين","الثلاثاء","الأربعاء","الخميس","الجمعة"];
const LEVELS=["الأول","الثاني","الثالث","الرابع","الصيفي"];
let rows=[], settings={activeYear:"2026 - 2027",years:["2026 - 2027"]}, profile={};

function toast(msg){const t=$("#toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),3200)}
function setBusy(btn,busy,label="جارٍ التنفيذ..."){btn.disabled=busy;if(busy){btn.dataset.old=btn.textContent;btn.textContent=label}else if(btn.dataset.old){btn.textContent=btn.dataset.old}}
function fillSelect(el,items,placeholder="اختر"){el.innerHTML=`<option value="">${placeholder}</option>`+[...new Set(items.filter(Boolean))].map(x=>`<option>${escapeHtml(x)}</option>`).join("")}
function escapeHtml(v){return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function norm(v){return String(v??"").trim()}
function time(v){return v==null||v===""?"—":String(v).includes(":")?v:`${v}:00`}
function rowMatches(r,p){return (!p.college||r.college===p.college)&&(!p.major||r.major===p.major)&&(!p.level||r.level===p.level)&&(!p.group||!r.group||r.group===p.group)&&(!p.day||r.day===p.day)}
async function load(){
  try{
    settings=await getYearSettings(); fillSelect($("#year"),settings.years||["2026 - 2027"]); $("#year").value=settings.activeYear||settings.years?.[0]||"2026 - 2027";
    rows=await getYearRows($("#year").value);
    initSelectors(); renderSchedule([]);
  }catch(e){console.error(e);toast("تعذر الاتصال بقاعدة البيانات. تحقق من إعداد Firebase والصلاحيات.");}
}
function initSelectors(){
  fillSelect($("#college"),rows.map(r=>r.college)); fillSelect($("#request-major"),rows.map(r=>r.major));
  fillSelect($("#level"),LEVELS); fillSelect($("#day"),DAYS); $("#day").value=DAYS[(new Date().getDay()+6)%7]||"السبت";
  $("#college").onchange=()=>{fillSelect($("#major"),rows.filter(r=>r.college===$("#college").value).map(r=>r.major));fillSelect($("#level"),LEVELS);fillSelect($("#group"),[""]);};
  $("#major").onchange=()=>{fillSelect($("#group"),rows.filter(r=>r.major===$("#major").value).map(r=>r.group),"الكل");};
}
function renderSchedule(data){
  const body=$("#schedule-table tbody"); body.innerHTML="";
  if(!data.length){$("#empty").style.display="block";return} $("#empty").style.display="none";
  for(const r of data){const cells=[r.degree,r.major,r.level,r.course,r.type,r.day,r.teacher,r.timeFrom,r.timeTo,r.duration,r.room,r.group,r.period,r.conflict,r.conflictType,r.conflictCount,r.notes];
    const tr=document.createElement("tr"); tr.innerHTML=cells.map((v,i)=>`<td class="${v==null||v===""?"missing":""}">${escapeHtml(v??"غير متوفر")}</td>`).join(""); body.appendChild(tr);
  }
  $("#schedule-meta").textContent=`${data.length} سجل — ${$("#year").value}`;
}
function discover(){
  const p={college:$("#college").value,major:$("#major").value,level:$("#level").value,group:$("#group").value,day:$("#day").value};
  if(!p.college||!p.major||!p.level){toast("اختر الكلية والتخصص والمستوى أولًا");return}
  profile=p; renderSchedule(rows.filter(r=>rowMatches(r,p))); location.hash="schedule";
}
async function changeYear(){
  try{rows=await getYearRows($("#year").value);initSelectors();toast("تم تحميل السنة المحددة من Firebase");}
  catch(e){toast("تعذر تحميل السنة المحددة");}
}
async function submitRequest(ev){
  ev.preventDefault(); const btn=$("#request-submit"), sid=norm($("#student-id").value);
  if(!/^\d{9}$/.test(sid)){toast("الرقم الجامعي يجب أن يكون 9 أرقام بالضبط");return}
  setBusy(btn,true,"جارٍ الحفظ...");
  try{
    await initFirebase();
    let id; for(let i=0;i<8;i++){id="REQ-"+crypto.randomUUID().replace(/-/g,"").slice(0,5).toUpperCase(); const exists=await getRequest(id,"__probe__"); if(!exists)break;}
    const payload={requestId:id,studentId:sid,major:$("#request-major").value,type:$("#request-type").value,title:$("#request-title").value.trim(),description:$("#request-details").value.trim(),status:"جديد",adminReply:"",createdAt:new Date().toISOString()};
    const {db}=await initFirebase(); const {doc,runTransaction}=await import("https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js");
    const ref=doc(db,"requests",id); await runTransaction(db,async tx=>{const s=await tx.get(ref);if(s.exists())throw new Error("duplicate");tx.set(ref,payload)});
    $("#request-success").className="success";$("#request-success").innerHTML=`تم إرسال طلبك بنجاح.<br><strong>رقم الطلب: ${escapeHtml(id)}</strong> <button class="copy" data-copy="${id}">نسخ</button>`;
    $("#request-form").reset(); toast("تم إرسال الطلب بنجاح"); await writeAudit("Request create","إنشاء طلب "+id,{requestId:id});
  }catch(e){console.error(e);toast(e.code==="permission-denied"?"لا تملك صلاحية حفظ الطلب. تحقق من Firestore Rules.":"تعذر حفظ الطلب: "+(e.message||"خطأ غير معروف"))}
  finally{setBusy(btn,false)}
}
async function track(ev){
  ev.preventDefault(); const id=norm($("#track-id").value).toUpperCase(),sid=norm($("#track-student").value),out=$("#track-result");
  if(!/^REQ-[A-Z0-9]{3,40}$/.test(id)||!/^\d{9}$/.test(sid)){toast("تحقق من رقم الطلب والرقم الجامعي");return}
  try{const r=await getRequest(id,sid);out.innerHTML=r?`<div class="track-card"><b>${escapeHtml(r.title)}</b><span>الحالة: ${escapeHtml(r.status||"جديد")}</span><span>النوع: ${escapeHtml(r.type)}</span><span>آخر تحديث: ${escapeHtml(r.updatedAt?.toDate?.()?.toLocaleString("ar-YE")||"غير متوفر")}</span><p>${escapeHtml(r.adminReply||"لا يوجد رد من الإدارة بعد.")}</p></div>`:"<div class='empty'>لم يتم العثور على طلب مطابق.</div>";}
  catch(e){toast("تعذر متابعة الطلب");console.error(e)}
}
async function search(){
  const q=norm($("#search-input").value).toLowerCase(),type=$("#search-type").value,out=$("#search-results");
  if(!q){out.innerHTML="";return}
  let all=rows;
  if(type==="student"){out.innerHTML="<div class='empty'>بحث الطالب يعتمد على مجموعة بيانات الطلاب إذا كانت موجودة في قاعدة Firebase الحالية.</div>";return}
  const map={course:"course",teacher:"teacher",room:"room"}; if(type!=="all")all=all.filter(r=>norm(r[map[type]]).toLowerCase().includes(q));
  else all=all.filter(r=>["course","teacher","room","major","college"].some(k=>norm(r[k]).toLowerCase().includes(q)));
  out.innerHTML=all.slice(0,50).map(r=>`<div class="result"><b>${escapeHtml(r.course||"")}</b><span>${escapeHtml(r.teacher||"")} — ${escapeHtml(r.room||"")} — ${escapeHtml(r.day||"")} ${time(r.timeFrom)}-${time(r.timeTo)}</span></div>`).join("")||"<div class='empty'>لا توجد نتائج.</div>";
}
$("#discover").onclick=discover; $("#weekly").onclick=()=>{const p={...profile,day:""};renderSchedule(rows.filter(r=>rowMatches(r,p)).sort((a,b)=>DAYS.indexOf(a.day)-DAYS.indexOf(b.day)));};
$("#pdf").onclick=async()=>{const data=rows.filter(r=>rowMatches(r,profile)); if(!data.length){toast("لا توجد بيانات قابلة للتصدير");return} try{await createPdfFromElement($("#schedule-table"),`جدول_${profile.major||"التخصص"}_${profile.level||""}_${$("#year").value}.pdf`)}catch(e){toast("تعذر إنشاء PDF");console.error(e)}};
$("#year").onchange=changeYear; $("#request-form").onsubmit=submitRequest; $("#track-form").onsubmit=track; $("#search-btn").onclick=search;
document.addEventListener("click",e=>{const c=e.target.closest("[data-copy]");if(c){navigator.clipboard?.writeText(c.dataset.copy);toast("تم نسخ رقم الطلب");} const eye=e.target.closest("[data-eye]");if(eye){const x=$("#"+eye.dataset.eye);x.type=x.type==="password"?"text":"password";}});
$("#admin-open").onclick=()=>$("#admin-dialog").showModal(); $("#admin-close").onclick=()=>$("#admin-dialog").close();
$("#login-form").onsubmit=async e=>{e.preventDefault();const b=e.submitter;setBusy(b,true,"جارٍ التحقق...");try{await login($("#admin-email").value,$("#admin-password").value);location.href="admin.html"}catch(err){toast(err.code==="auth/invalid-credential"?"بيانات الدخول غير صحيحة":"تعذر تسجيل الدخول");}finally{setBusy(b,false)}};
load();
