import { initFirebase } from "../firebase/core.js";
import { doc,runTransaction } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
export async function createRequest(payload){
 const {db}=await initFirebase();
 for(let i=0;i<10;i++){
  const id="REQ-"+crypto.randomUUID().replaceAll("-","").slice(0,5).toUpperCase(),ref=doc(db,"requests",id);
  try{await runTransaction(db,async tx=>{if((await tx.get(ref)).exists())throw new Error("duplicate");tx.set(ref,{...payload,requestId:id})});return id}catch(e){if(e.message!=="duplicate")throw e}
 }
 throw new Error("تعذر توليد رقم طلب فريد");
}
