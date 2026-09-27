import { signInWithEmailAndPassword, signOut, onAuthStateChanged, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { initFirebase } from "./core.js";
export async function watchAuth(cb){const {auth}=await initFirebase(); return onAuthStateChanged(auth,cb);}
export async function login(email,password){const {auth}=await initFirebase(); return signInWithEmailAndPassword(auth,email,password);}
export async function logout(){const {auth}=await initFirebase(); return signOut(auth);}
export async function changePassword(current,newPassword){
  const {auth}=await initFirebase(); const u=auth.currentUser; if(!u||!u.email) throw new Error("يجب تسجيل الدخول.");
  await reauthenticateWithCredential(u,EmailAuthProvider.credential(u.email,current)); await updatePassword(u,newPassword);
}
