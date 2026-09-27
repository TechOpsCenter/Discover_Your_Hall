import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js";
import { getApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";

let app, db, auth, storage, config;
export async function initFirebase(){
  if(app) return {app,db,auth,storage,config};
  config = window.FIREBASE_CONFIG;
  if(!config){
    const r = await fetch("/__/firebase/init.json",{cache:"no-store"});
    if(!r.ok) throw new Error(`تعذر تحميل إعداد Firebase (${r.status})`);
    config = await r.json();
    window.FIREBASE_CONFIG=config;
  }
  app = getApps().length ? getApp() : initializeApp(config);
  db=getFirestore(app); auth=getAuth(app); storage=getStorage(app);
  return {app,db,auth,storage,config};
}
export function firebaseState(){ return {app,db,auth,storage,config}; }
