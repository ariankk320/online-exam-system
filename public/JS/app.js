const API = "http://localhost:3000";

let currentUser = null;
let currentRole = "student";
let exams = [];
let questions = [];
let results = [];
let examQuestions = [];
let answers = [];
let currentQuestion = 0;
let examTimer = null;
let timeLeft = 0;

function toast(msg){
  const t = document.getElementById("toast");
  t.innerText = msg;
  t.style.display = "block";
  setTimeout(()=>t.style.display="none", 2600);
}

function showRegister(){
  document.getElementById("loginScreen").classList.add("hidden");
  document.getElementById("registerScreen").classList.remove("hidden");
}

function showLogin(){
  document.getElementById("registerScreen").classList.add("hidden");
  document.getElementById("loginScreen").classList.remove("hidden");
}

function toggleSidebar(){
  document.querySelector(".sidebar").classList.toggle("show");
}

function openPage(pageId, el){
  document.querySelectorAll(".page").forEach(p=>p.classList.remove("active-page"));
  document.getElementById(pageId).classList.add("active-page");

  document.querySelectorAll(".sidebar nav a").forEach(a=>a.classList.remove("active"));
  if(el) el.classList.add("active");

  if(pageId==="examsPage") renderExams();
  if(pageId==="resultsPage") loadResults();
}

async function register(){
  const name = document.getElementById("registerName").value.trim();
  const email = document.getElementById("registerEmail").value.trim();
  const regNo = document.getElementById("registerReg").value.trim();
  const password = document.getElementById("registerPassword").value.trim();
  const confirm = document.getElementById("registerConfirm").value.trim();

  if(!name || !email || !regNo || !password || !confirm){
    return toast("Please fill all fields");
  }

  if(password !== confirm){
    return toast("Passwords do not match");
  }

  if(!/^CS-\d{6}$/i.test(regNo)){
    return toast("Registration number format must be CS-123456");
  }

  try{
    const res = await fetch(API + "/register", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        name,
        email,
        regNo:regNo.toUpperCase(),
        password
      })
    });

    const txt = await res.text();
    toast(txt);

    if(res.ok){
      showLogin();
    }
  }
  catch(e){
    toast("Server not connected");
  }
}

async function login(){
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  if(!email || !password){
    return toast("Enter email and password");
  }

  try{
    const res = await fetch(API + "/login", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({email,password})
    });

    const data = await res.json();

    if(!res.ok){
      return toast(data.message || "Invalid credentials");
    }

    if(data.role === "admin"){
      currentRole = "admin";
      currentUser = {
        name:"DSU Admin",
        email:"admin@gmail.com",
        regNo:"Admin"
      };

      document.getElementById("adminNav").classList.remove("hidden");
      document.getElementById("topUserRole").innerText = "Admin";
    }
    else{
      currentRole = "student";
      currentUser = data.user;

      document.getElementById("adminNav").classList.add("hidden");
      document.getElementById("topUserRole").innerText = "Student";
    }

    document.getElementById("topUserName").innerText = currentUser.name || "Student";
    document.getElementById("profileName").innerText = currentUser.name || "Student";
    document.getElementById("profileEmail").innerText = currentUser.email || "";
    document.getElementById("profileReg").innerText = "Registration No: " + (currentUser.regNo || "");

    document.getElementById("loginScreen").classList.add("hidden");
    document.getElementById("registerScreen").classList.add("hidden");
    document.getElementById("appScreen").classList.remove("hidden");

    await refreshAll();
    toast("Login successful");
  }
  catch(e){
    toast("Server not connected");
  }
}

async function refreshAll(){
  await loadExams();
  await loadQuestions();
  await loadResults();

  updateDashboard();
  loadExamOptions();
}

async function loadExams(){
  const res = await fetch(API + "/exams");
  exams = await res.json();
  renderExams();
}

function renderExams(){
  const box = document.getElementById("examContainer");
  const search = (document.getElementById("examSearch")?.value || "").toLowerCase();

  if(!box) return;

  box.innerHTML = "";

  const filtered = exams.filter(e => e.name.toLowerCase().includes(search));

  if(filtered.length === 0){
    box.innerHTML = `<div class="panel">No exams available</div>`;
    return;
  }

  filtered.forEach((exam, i)=>{
    const completed = results.some(r =>
      r.exam === exam.name &&
      (currentRole === "admin" || r.regNo === currentUser.regNo)
    );

    box.innerHTML += `
      <div class="exam-card">
        <div class="icon-box">
          ${["🧠","💻","📘","🧪"][i % 4]}
        </div>

        <div class="exam-info">
          <h3>${exam.name}</h3>
          <p class="muted">Marks: ${exam.marks} | Duration: ${exam.duration} sec</p>
        </div>

        <span class="badge">${completed ? "Completed" : "Upcoming"}</span>

        <button class="start-exam-btn" onclick="startExam('${escapeQuotes(exam.name)}', ${Number(exam.duration)})">
          ${completed ? "Retake" : "Start Exam"}
        </button>
      </div>
    `;
  });
}

function escapeQuotes(str){
  return String(str).replace(/'/g, "\\'");
}

async function loadQuestions(){
  const res = await fetch(API + "/questions");
  questions = await res.json();
  renderQuestions();
}

function renderQuestions(){
  const list = document.getElementById("questionList");

  if(!list) return;

  list.innerHTML = "";

  if(questions.length === 0){
    list.innerHTML = `<div class="question-box">No questions yet</div>`;
    return;
  }

  questions.forEach((q,i)=>{
    list.innerHTML += `
      <div class="question-box">
        <b>Q${i+1} - ${q.exam}</b>
        <p>${q.question}</p>
        <p class="muted">A) ${q.option1} | B) ${q.option2} | C) ${q.option3} | D) ${q.option4}</p>
        <b>Correct: Option ${Number(q.correctAnswer) + 1}</b>
      </div>
    `;
  });
}

function loadExamOptions(){
  const mcq = document.getElementById("mcqExam");
  const del = document.getElementById("deleteExamSelect");

  if(!mcq || !del) return;

  mcq.innerHTML = "";
  del.innerHTML = "";

  exams.forEach(e=>{
    mcq.innerHTML += `<option value="${e.name}">${e.name}</option>`;
    del.innerHTML += `<option value="${e.name}">${e.name}</option>`;
  });
}

async function addExam(){
  const name = document.getElementById("examName").value.trim();
  const marks = document.getElementById("examMarks").value.trim();
  const duration = document.getElementById("examDuration").value.trim();

  if(!name || !marks || !duration){
    return toast("Fill all exam fields");
  }

  const res = await fetch(API + "/addExam", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({name,marks,duration})
  });

  toast(await res.text());
  await refreshAll();
}

async function deleteExam(){
  const examName = document.getElementById("deleteExamSelect").value;

  if(!examName){
    return toast("Select exam");
  }

  if(!confirm("Delete this exam and its questions?")){
    return;
  }

  const res = await fetch(API + "/deleteExam/" + encodeURIComponent(examName), {
    method:"DELETE"
  });

  toast(await res.text());
  await refreshAll();
}

async function addMCQ(){
  const exam = document.getElementById("mcqExam").value;
  const question = document.getElementById("mcqQuestion").value.trim();
  const option1 = document.getElementById("option1").value.trim();
  const option2 = document.getElementById("option2").value.trim();
  const option3 = document.getElementById("option3").value.trim();
  const option4 = document.getElementById("option4").value.trim();
  const correct = document.getElementById("correctAnswer").value;

  if(!exam || !question || !option1 || !option2 || !option3 || !option4 || correct === ""){
    return toast("Fill all MCQ fields");
  }

  const res = await fetch(API + "/addMCQ", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
      exam,
      question,
      option1,
      option2,
      option3,
      option4,
      correct
    })
  });

  toast(await res.text());
  await loadQuestions();
  updateDashboard();
}

async function loadResults(){
  const res = await fetch(API + "/results");
  results = await res.json();
  renderResults();
}

function renderResults(){
  const box = document.getElementById("resultList");

  if(!box) return;

  box.innerHTML = "";

  let visible = currentRole === "admin"
    ? results
    : results.filter(r => r.regNo === currentUser?.regNo);

  if(visible.length === 0){
    box.innerHTML = `<div class="panel">No results yet</div>`;
    return;
  }

  visible.reverse().forEach(r=>{
    const pct = r.total ? Math.round((r.score / r.total) * 100) : 0;
    const grade = pct >= 85 ? "A" : pct >= 70 ? "B" : pct >= 55 ? "C" : pct >= 40 ? "D" : "F";

    box.innerHTML += `
      <div class="result-card">
        <div class="result-top">
          <h3>${r.exam}</h3>
          <span class="badge">${pct >= 40 ? "Passed" : "Failed"}</span>
        </div>

        <p class="muted">${r.date}</p>

        <div class="result-metrics">
          <div class="metric">
            <p>Your Score</p>
            <h2>${pct}%</h2>
          </div>

          <div class="metric">
            <p>Total Marks</p>
            <h2>${r.score}<small> / ${r.total}</small></h2>
          </div>

          <div class="metric">
            <p>Grade</p>
            <div class="grade">${grade}</div>
          </div>
        </div>

        <button onclick="downloadResult('${escapeQuotes(r.student)}','${escapeQuotes(r.exam)}','${pct}','${grade}')">
          Download Result
        </button>
      </div>
    `;
  });
}

function downloadResult(student, exam, pct, grade){
  const text =
`DHA Suffa University
Online Examination Result

Student: ${student}
Exam: ${exam}
Percentage: ${pct}%
Grade: ${grade}`;

  const blob = new Blob([text], {type:"text/plain"});
  const a = document.createElement("a");

  a.href = URL.createObjectURL(blob);
  a.download = "DSU_Result.txt";
  a.click();
}

function updateDashboard(){
  document.getElementById("statTotalExams").innerText = exams.length;
  document.getElementById("statQuestions").innerText = questions.length;

  let visible = currentRole === "admin"
    ? results
    : results.filter(r => r.regNo === currentUser?.regNo);

  document.getElementById("statCompleted").innerText = visible.length;

  const avg = visible.length
    ? Math.round(
        visible.reduce((sum,r)=>sum + (r.total ? r.score / r.total * 100 : 0),0) / visible.length
      )
    : 0;

  document.getElementById("statAverage").innerText = avg + "%";

  const upcoming = document.getElementById("upcomingList");
  upcoming.innerHTML = "";

  exams.slice(0,4).forEach((e,i)=>{
    upcoming.innerHTML += `
      <div class="exam-row">
        <div class="icon-box">${["🧠","🗂️","💻","📗"][i % 4]}</div>
        <div>
          <b>${e.name}</b>
          <p class="muted">Duration: ${e.duration} seconds</p>
        </div>
        <span class="badge">${e.duration} sec</span>
      </div>
    `;
  });

  if(exams.length === 0){
    upcoming.innerHTML = `<p class="muted">No exams added yet.</p>`;
  }
}

function startExam(name, duration){
  examQuestions = questions.filter(q => q.exam === name);

  if(examQuestions.length === 0){
    return toast("No questions added for this exam");
  }

  answers = Array(examQuestions.length).fill(null);
  currentQuestion = 0;

  document.getElementById("appScreen").classList.add("hidden");
  document.getElementById("examScreen").classList.remove("hidden");
  document.getElementById("examTitleDisplay").innerText = name;

  timeLeft = Number(duration);

  renderExamNav();
  renderCurrentQuestion();
  updateTimer();

  clearInterval(examTimer);

  examTimer = setInterval(()=>{
    timeLeft--;
    updateTimer();

    if(timeLeft <= 0){
      submitExam();
    }
  },1000);
}

function renderExamNav(){
  const tabs = document.getElementById("questionTabs");
  const palette = document.getElementById("questionPalette");

  tabs.innerHTML = "";
  palette.innerHTML = "";

  examQuestions.forEach((q,i)=>{
    tabs.innerHTML += `<button class="${i === currentQuestion ? 'active' : ''}" onclick="goQuestion(${i})">${i+1}</button>`;
    palette.innerHTML += `<button class="${answers[i] !== null ? 'answered' : ''} ${i === currentQuestion ? 'active' : ''}" onclick="goQuestion(${i})">${i+1}</button>`;
  });
}

function renderCurrentQuestion(){
  const q = examQuestions[currentQuestion];

  document.getElementById("questionHeading").innerText = `Question ${currentQuestion+1}`;
  document.getElementById("questionText").innerText = q.question;

  const opts = [q.option1, q.option2, q.option3, q.option4];

  document.getElementById("optionArea").innerHTML = opts.map((o,i)=>`
    <label class="option-item ${answers[currentQuestion] === i ? 'selected' : ''}">
      <input
        type="radio"
        name="currentOption"
        value="${i}"
        ${answers[currentQuestion] === i ? 'checked' : ''}
        onchange="selectAnswer(${i})"
      >
      <b>${String.fromCharCode(65+i)}</b> ${o}
    </label>
  `).join("");

  renderExamNav();
}

function selectAnswer(i){
  answers[currentQuestion] = i;
  renderCurrentQuestion();
}

function goQuestion(i){
  currentQuestion = i;
  renderCurrentQuestion();
}

function nextQuestion(){
  if(currentQuestion < examQuestions.length - 1){
    currentQuestion++;
    renderCurrentQuestion();
  }
}

function prevQuestion(){
  if(currentQuestion > 0){
    currentQuestion--;
    renderCurrentQuestion();
  }
}

function clearAnswer(){
  answers[currentQuestion] = null;
  renderCurrentQuestion();
}

function updateTimer(){
  const m = Math.floor(timeLeft / 60);
  const s = timeLeft % 60;

  document.getElementById("timer").innerText =
    `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}

async function submitExam(){
  clearInterval(examTimer);

  const examName = document.getElementById("examTitleDisplay").innerText;

  let score = 0;

  examQuestions.forEach((q,i)=>{
    if(Number(answers[i]) === Number(q.correctAnswer)){
      score++;
    }
  });

  const body = {
    student: currentUser.name,
    regNo: currentUser.regNo,
    exam: examName,
    score,
    total: examQuestions.length,
    date: new Date().toLocaleString()
  };

  await fetch(API + "/submitResult", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(body)
  });

  document.getElementById("examScreen").classList.add("hidden");
  document.getElementById("appScreen").classList.remove("hidden");

  await refreshAll();
  openPage("resultsPage");

  toast(`Exam submitted. Score: ${score}/${examQuestions.length}`);
}

function logout(){
  clearInterval(examTimer);

  currentUser = null;
  currentRole = "student";

  document.getElementById("appScreen").classList.add("hidden");
  document.getElementById("examScreen").classList.add("hidden");
  document.getElementById("loginScreen").classList.remove("hidden");
}

function closeWelcome(){
  const modal = document.getElementById("welcomeModal");

  if(modal){
    modal.classList.add("hidden");
    localStorage.setItem("welcomeShown", "yes");
  }
}

function setupEnterKeyAccess(){
  document.addEventListener("keydown", function(e){
    if(e.key !== "Enter") return;

    const tag = (e.target.tagName || "").toLowerCase();

    if(tag !== "input" && tag !== "select"){
      return;
    }

    e.preventDefault();

    const loginScreen = document.getElementById("loginScreen");
    const registerScreen = document.getElementById("registerScreen");

    if(loginScreen && !loginScreen.classList.contains("hidden")){
      return login();
    }

    if(registerScreen && !registerScreen.classList.contains("hidden")){
      return register();
    }

    const adminVisible = document.getElementById("adminPage")?.classList.contains("active-page");

    if(adminVisible){
      const examFields = ["examName","examMarks","examDuration"];
      const mcqFields = ["mcqExam","mcqQuestion","option1","option2","option3","option4","correctAnswer"];

      if(examFields.includes(e.target.id)){
        return addExam();
      }

      if(mcqFields.includes(e.target.id)){
        return addMCQ();
      }
    }
  });
}

function setupRegNoFormat(){
  const reg = document.getElementById("registerReg");

  if(!reg) return;

  reg.placeholder = "CS-123456";

  reg.addEventListener("focus", ()=>{
    if(!reg.value){
      reg.value = "CS-";
    }
  });

  reg.addEventListener("input", ()=>{
    let v = reg.value.toUpperCase().replace(/[^A-Z0-9-]/g, "");

    if(!v.startsWith("CS-")){
      v = "CS-" + v.replace(/^CS-?/i, "").replace(/-/g, "");
    }

    const digits = v.replace("CS-", "").replace(/\D/g, "").slice(0,6);

    reg.value = "CS-" + digits;
  });
}

window.addEventListener("DOMContentLoaded", ()=>{
  setupEnterKeyAccess();
  setupRegNoFormat();

  setTimeout(()=>{
    const modal = document.getElementById("welcomeModal");

    if(modal && localStorage.getItem("welcomeShown") !== "yes"){
      modal.classList.remove("hidden");
    }
  },250);
});