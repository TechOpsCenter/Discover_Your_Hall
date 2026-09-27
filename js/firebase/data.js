import { collection, doc, getDoc, getDocs, query, where, orderBy, limit, startAfter, setDoc, updateDoc, deleteDoc, writeBatch, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { initFirebase } from "./core.js";

export const COLLECTIONS = Object.freeze({
  schedule:"schedule", requests:"requests", years:"app_meta", audit:"audit_logs", backups:"backups"
});
export async function ctx(){ return initFirebase(); }
export async function getYearRows(year){
  const {db}=await ctx();
  const s=await getDocs(query(collection(db,COLLECTIONS.schedule),where("year","==",year)));
  if(!s.empty) return s.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(a.order??0)-(b.order??0));
  if(year==="2026 - 2027"){
    const legacy=await getDocs(collection(db,COLLECTIONS.schedule));
    return legacy.docs.filter(d=>!d.data().year).map(d=>({id:d.id,...d.data()})).sort((a,b)=>(a.order??0)-(b.order??0));
  }
  return [];
}
export async function getYearSettings(){
  const {db}=await ctx(); const s=await getDoc(doc(db,COLLECTIONS.years,"year_settings"));
  return s.exists()?s.data():{activeYear:"2026 - 2027",years:["2026 - 2027"],semesters:{}};
}
export async function saveYearSettings(data){
  const {db}=await ctx(); await setDoc(doc(db,COLLECTIONS.years,"year_settings"),{...data,updatedAt:serverTimestamp()},{merge:true});
}
export async function addScheduleRow(row){
  const {db}=await ctx(); const ref=doc(collection(db,COLLECTIONS.schedule)); await setDoc(ref,row); return ref.id;
}
export async function updateScheduleRow(id,row){
  const {db}=await ctx(); await updateDoc(doc(db,COLLECTIONS.schedule,id),row);
}
export async function deleteScheduleRow(id){
  const {db}=await ctx(); await deleteDoc(doc(db,COLLECTIONS.schedule,id));
}
export async function listRequests(){
  const {db}=await ctx(); const s=await getDocs(collection(db,COLLECTIONS.requests));
  return s.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>((b.createdAt?.seconds||0)-(a.createdAt?.seconds||0)));
}
export async function getRequest(id,studentId){
  const {db}=await ctx(); const s=await getDoc(doc(db,COLLECTIONS.requests,id.toUpperCase()));
  if(!s.exists()) return null; const d=s.data();
  return String(d.studentId||"")===String(studentId||"")?{id:s.id,...d}:null;
}
export async function updateRequest(id,patch){
  const {db}=await ctx(); await updateDoc(doc(db,COLLECTIONS.requests,id.toUpperCase()),{...patch,updatedAt:serverTimestamp()});
}
export async function writeAudit(action,details,meta={}){
  try{const {db}=await ctx(); await setDoc(doc(collection(db,COLLECTIONS.audit)),{action,details,meta,at:serverTimestamp()});}catch(e){console.warn("Audit log:",e)}
}
export async function listBackups(year){
  const {db}=await ctx(); const s=await getDocs(query(collection(db,COLLECTIONS.backups),where("year","==",year)));
  return s.docs.map(d=>({id:d.id,...d.data()}));
}
export async function createBackup(year,rows,reason="نسخة احتياطية"){
  const {db}=await ctx(); const ref=doc(collection(db,COLLECTIONS.backups));
  await setDoc(ref,{year,rows,count:rows.length,reason,createdAt:serverTimestamp()}); return ref.id;
}
