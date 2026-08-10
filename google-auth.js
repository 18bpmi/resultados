import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { getDatabase, ref, get, set, update, push } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";
import { firebaseConfig } from "./firebase-config.js?v=20260810-1";

const ADMIN_EMAILS = ["rpfenille@gmail.com", "18bpmip3@gmail.com"];
const isPermanentAdmin = email => ADMIN_EMAILS.includes(String(email || "").toLowerCase());
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const provider = new GoogleAuthProvider();
provider.setCustomParameters({prompt:"select_account"});

const loginScreen = document.getElementById("loginScreen");
const loginButton = document.getElementById("googleLogin");
const loginMessage = document.getElementById("loginMessage");

function showError(message){
  loginMessage.textContent = message;
  loginMessage.style.display = "block";
}

async function loadProfile(user){
  const email = String(user.email || "").toLowerCase();
  const profileRef = ref(db, `usuarios/${user.uid}`);
  const snapshot = await get(profileRef);
  let profile = snapshot.val();
  if(!profile){
    profile = {email,nome:user.displayName||email,perfil:isPermanentAdmin(email)?"admin":"usuario",ativo:true,provedor:"google",criadoEm:Date.now(),ultimoAcesso:Date.now()};
    await set(profileRef, profile);
  }else{
    await update(profileRef,{email,nome:user.displayName||profile.nome||email,provedor:"google",ultimoAcesso:Date.now()});
    profile = {...profile,email,nome:user.displayName||profile.nome||email};
  }
  if(isPermanentAdmin(email) && (profile.perfil!=="admin" || !profile.ativo)){
    await update(profileRef,{perfil:"admin",ativo:true});
    profile.perfil="admin"; profile.ativo=true;
  }
  if(!profile.ativo) throw new Error("Esta conta foi desativada pelo administrador.");
  return profile;
}

function releaseApp(user, profile){
  window.qapGoogleUser = {uid:user.uid,email:profile.email,nome:profile.nome,perfil:profile.perfil};
  window.qapGetToken = () => user.getIdToken();
  window.qapRegistrarAuditoria = async ({acao,lancamentoId,antes=null,depois=null}) => {
    const keys = new Set([...Object.keys(antes||{}),...Object.keys(depois||{})]);
    const camposAlterados = [...keys].filter(key=>JSON.stringify(antes?.[key])!==JSON.stringify(depois?.[key]));
    await set(push(ref(db,"auditoria")),{
      acao,lancamentoId,usuarioUid:user.uid,usuarioEmail:profile.email,usuarioNome:profile.nome,
      dataHora:new Date().toISOString(),camposAlterados,dadosAnteriores:antes,dadosNovos:depois,origem:"central-resultados-18bpm"
    });
  };
  document.getElementById("userName").textContent = profile.nome;
  document.getElementById("userEmail").textContent = profile.email;
  if(profile.perfil==="admin" || isPermanentAdmin(profile.email)) document.getElementById("adminLink").hidden=false;
  document.body.classList.remove("auth-pending");
  loginScreen.remove();
}

loginButton.addEventListener("click", async ()=>{
  loginButton.disabled=true; loginMessage.style.display="none";
  try{
    const credential=await signInWithPopup(auth,provider);
    const profile=await loadProfile(credential.user);
    releaseApp(credential.user,profile);
  }catch(error){
    console.error(error);
    if(auth.currentUser) await signOut(auth);
    showError(error?.message?.replace(/^Firebase:\s*/i,"") || "Não foi possível entrar com o Google.");
  }finally{loginButton.disabled=false;}
});

document.getElementById("logoutButton").addEventListener("click",async()=>{await signOut(auth);location.reload();});

onAuthStateChanged(auth,async user=>{
  if(!user || window.qapGoogleUser) return;
  try{const profile=await loadProfile(user);releaseApp(user,profile);}
  catch(error){await signOut(auth);showError(error.message);}
});
