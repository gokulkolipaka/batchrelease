/* ---------- demo “DB” ---------- */
const users = [
  {user:"admin",pass:"admin123",mustChange:true,email:"admin@example.com",name:"Admin"}
];
let currentUser = null;
/* ---------- helpers ---------- */
const $ = id => document.getElementById(id);
const show   = el => el.classList.remove('hidden');
const hide   = el => el.classList.add   ('hidden');
const toast = msg=>{
  const t=$('toast'); t.textContent=msg; show(t);
  setTimeout(()=>hide(t),2500);
};
/* ---------- theme toggle ---------- */
$('themeToggle').onclick=()=>{
  document.body.classList.toggle('dark');
  $('themeToggle').firstElementChild.classList.toggle('fa-sun');
};
/* ---------- screen switch ---------- */
function goto(screen){
  ['loginScreen','signupScreen','forgotScreen'].forEach(id=>hide($(id)));
  show($(screen));
}
$('openSignup').onclick=e=>{e.preventDefault();goto('signupScreen');};
$('openForgot').onclick=e=>{e.preventDefault();goto('forgotScreen');};
['backToLogin1','backToLogin2'].forEach(id=>$(id).onclick=e=>{e.preventDefault();goto('loginScreen');});
/* ---------- login ---------- */
$('loginForm').onsubmit=e=>{
  e.preventDefault();
  const u=$('loginUser').value.trim(), p=$('loginPass').value;
  const user=users.find(u0=>u0.user===u);
  if(!user||user.pass!==p){toast('Invalid credentials');return;}
  currentUser=user;
  if(user.mustChange){showPwModal();return;}
  launchApp();
};
/* ---------- forced password change ---------- */
const showPwModal=()=>{show($('pwModal'));};
$('pwForm').onsubmit=e=>{
  e.preventDefault();
  const p1=$('newPw').value, p2=$('newPw2').value;
  if(p1!==p2||p1.length<8){toast('Passwords must match & be 8+ chars');return;}
  currentUser.pass=p1; currentUser.mustChange=false;
  hide($('pwModal')); launchApp();
};
/* ---------- signup ---------- */
$('signupForm').onsubmit=e=>{
  e.preventDefault();
  const name=$('suName').value.trim(), email=$('suEmail').value.trim(),
        user=$('suUser').value.trim(), pass=$('suPass').value;
  if(users.some(u=>u.user===user)){toast('Username taken');return;}
  users.push({user,pass,email,name,mustChange:false});
  toast('Account created, log in'); goto('loginScreen');
};
/* ---------- forgot pw (simulated) ---------- */
$('forgotForm').onsubmit=e=>{
  e.preventDefault();
  const mail=$('fpEmail').value.trim();
  toast(`Reset link sent to ${mail}`); goto('loginScreen');
};
/* ---------- app launcher ---------- */
function launchApp(){
  hide($('loginScreen')); hide($('signupScreen')); hide($('forgotScreen'));
  show($('app'));
  document.querySelectorAll('.nav-btn').forEach(btn=>{
    btn.onclick=()=>switchSec(btn);
  });
  $('logoutBtn').onclick=()=>{location.reload();};
  initUpload();
}
/* ---------- nav sections ---------- */
function switchSec(btn){
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  ['dash','docs','comp','rep'].forEach(s=>hide($(s)));
  show($(btn.dataset.sec));
}
/* ---------- file upload ---------- */
function initUpload(){
  const drop=$('dropArea'), inp=$('fileInp'), list=$('docList'), box=$('analysis');
  const handleFiles=files=>{
    [...files].forEach(f=>{
      const li=document.createElement('li');
      li.textContent=`${f.name} – ${(f.size/1024).toFixed(1)} KB`;
      list.append(li);
      // mock analysis
      box.textContent='Analyzing…';
      setTimeout(()=>box.textContent='✓ Batch parameters extracted',800);
    });
  };
  drop.onclick=()=>inp.click();
  inp.onchange=e=>handleFiles(e.target.files);
  drop.ondragover=e=>{e.preventDefault();drop.classList.add('hover');};
  drop.ondragleave=e=>drop.classList.remove('hover');
  drop.ondrop=e=>{
    e.preventDefault();drop.classList.remove('hover');
    handleFiles(e.dataTransfer.files);
  };
}
/* ---------- start on login screen ---------- */
goto('loginScreen');
