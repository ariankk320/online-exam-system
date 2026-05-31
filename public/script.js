<script>

/* ================= DATABASE ================= */

let users =
JSON.parse(localStorage.getItem("users")) || [];

let exams =
JSON.parse(localStorage.getItem("exams")) || [];

let questions =
JSON.parse(localStorage.getItem("questions")) || [];

let results =
JSON.parse(localStorage.getItem("results")) || [];

/* ================= ADMIN ================= */

const admin = {

email:"admin@gmail.com",
password:"admin123"

};

let currentUser = "";
let examTimer;
let timeLeft = 0;

/* ================= PAGE SWITCH ================= */

function showRegister(){

document.getElementById("loginPage")
.classList.add("hidden");

document.getElementById("registerPage")
.classList.remove("hidden");

}

function showLogin(){

document.getElementById("registerPage")
.classList.add("hidden");

document.getElementById("loginPage")
.classList.remove("hidden");

}

/* ================= REGISTER ================= */

function register(){

const name =
document.getElementById("registerName").value;

const email =
document.getElementById("registerEmail").value;

const password =
document.getElementById("registerPassword").value;

const regNo =
document.getElementById("registerReg").value;

if(name === "" ||
email === "" ||
regNo === "" ||
password === ""){

alert("Fill all fields");
return;

}

users.push({

name:name,
email:email,
regNo:regNo,
password:password

});

localStorage.setItem(
"users",
JSON.stringify(users)
);

alert("✅ Registration Successful");

showLogin();

}

/* ================= LOGIN ================= */

function login(){

const email =
document.getElementById("loginEmail").value;

const password =
document.getElementById("loginPassword").value;

if(email === admin.email &&
password === admin.password){

document.getElementById("loginPage")
.classList.add("hidden");

document.getElementById("adminDashboard")
.classList.remove("hidden");

loadExamOptions();
loadQuestions();
loadResults();

return;

}

const user = users.find(

u => u.email === email &&
u.password === password

);

if(user){

currentUser = user.name;

document.getElementById("loginPage")
.classList.add("hidden");

document.getElementById("studentDashboard")
.classList.remove("hidden");

loadExams();

}
else{

alert("❌ Invalid Credentials");

}

}

/* ================= ADD EXAM ================= */

function addExam(){

const name =
document.getElementById("examName").value;

const marks =
document.getElementById("examMarks").value;

const duration =
document.getElementById("examDuration").value;

if(name === "" ||
marks === "" ||
duration === ""){

alert("Fill all fields");
return;

}

exams.push({

id:Date.now(),
name:name,
marks:marks,
duration:duration

});

localStorage.setItem(
"exams",
JSON.stringify(exams)
);

alert("✅ Exam Added");

loadExamOptions();
loadExams();

}

/* ================= DELETE EXAM ================= */

function deleteExam(){

const examName =
document.getElementById("deleteExamSelect").value;

exams = exams.filter(
e => e.name !== examName
);

questions = questions.filter(
q => q.exam !== examName
);

localStorage.setItem(
"exams",
JSON.stringify(exams)
);

localStorage.setItem(
"questions",
JSON.stringify(questions)
);

alert("🗑️ Exam Deleted");

loadExamOptions();
loadExams();
loadQuestions();

}

/* ================= LOAD EXAMS ================= */

function loadExams(){

const container =
document.getElementById("examContainer");

container.innerHTML = "";

exams.forEach(exam => {

container.innerHTML += `

<div class="exam-card">

<h2>${exam.name}</h2>

<p>
<strong>Marks:</strong>
${exam.marks}
</p>

<p>
<strong>Duration:</strong>
${exam.duration} Seconds
</p>

<button onclick="startExam('${exam.name}')">
Start Exam
</button>

</div>

`;

});

}

/* ================= LOAD OPTIONS ================= */

function loadExamOptions(){

const mcqSelect =
document.getElementById("mcqExam");

const deleteSelect =
document.getElementById("deleteExamSelect");

mcqSelect.innerHTML = "";
deleteSelect.innerHTML = "";

exams.forEach(exam => {

mcqSelect.innerHTML += `

<option value="${exam.name}">
${exam.name}
</option>

`;

deleteSelect.innerHTML += `

<option value="${exam.name}">
${exam.name}
</option>

`;

});

}

/* ================= ADD MCQ ================= */

function addMCQ(){

const exam =
document.getElementById("mcqExam").value;

const question =
document.getElementById("mcqQuestion").value;

const option1 =
document.getElementById("option1").value;

const option2 =
document.getElementById("option2").value;

const option3 =
document.getElementById("option3").value;

const option4 =
document.getElementById("option4").value;

const correct =
document.getElementById("correctAnswer").value;

if(
question === "" ||
option1 === "" ||
option2 === "" ||
option3 === "" ||
option4 === "" ||
correct === ""
){

alert("Fill all fields");
return;

}

questions.push({

exam:exam,

question:question,

options:[
option1,
option2,
option3,
option4
],

correct:Number(correct)

});

localStorage.setItem(
"questions",
JSON.stringify(questions)
);

alert("✅ MCQ Added");

loadQuestions();

}

/* ================= LOAD QUESTIONS ================= */

function loadQuestions(){

const list =
document.getElementById("questionList");

list.innerHTML = "";

questions.forEach((q,index)=>{

list.innerHTML += `

<div class="question-box">

<h3>
Q${index+1}
</h3>

<p>
${q.question}
</p>

<br>

A) ${q.options[0]}
<br>

B) ${q.options[1]}
<br>

C) ${q.options[2]}
<br>

D) ${q.options[3]}

</div>

`;

});

}

/* ================= START EXAM ================= */

function startExam(name){

const exam =
exams.find(e => e.name === name);

const examQuestions =
questions.filter(q => q.exam === name);

if(examQuestions.length === 0){

alert("No Questions Added");
return;

}

document.getElementById("examModal")
.classList.remove("hidden");

document.getElementById("examTitleDisplay")
.innerText = name;

const area =
document.getElementById("questionArea");

area.innerHTML = "";

examQuestions.forEach((q,index)=>{

area.innerHTML += `

<div class="question-card">

<h3>
Q${index+1}. ${q.question}
</h3>

${q.options.map((opt,i)=>`

<label class="option">

<input type="radio"
name="q${index}"
value="${i}">

${opt}

</label>

`).join("")}

</div>

`;

});

timeLeft = Number(exam.duration);

updateTimer();

clearInterval(examTimer);

examTimer = setInterval(()=>{

timeLeft--;

updateTimer();

if(timeLeft <= 0){

clearInterval(examTimer);

submitExam();

}

},1000);

}

/* ================= TIMER ================= */

function updateTimer(){

const minutes =
Math.floor(timeLeft / 60);

const seconds =
timeLeft % 60;

document.getElementById("timer")
.innerText =

String(minutes).padStart(2,'0')
+
":"
+
String(seconds).padStart(2,'0');

}

/* ================= SUBMIT EXAM ================= */

function submitExam(){

clearInterval(examTimer);

let score = 0;

const examName =
document.getElementById("examTitleDisplay")
.innerText;

const examQuestions =
questions.filter(
q => q.exam === examName
);

examQuestions.forEach((q,index)=>{

const selected =
document.querySelector(
`input[name="q${index}"]:checked`
);

if(selected){

if(Number(selected.value) === q.correct){

score++;

}

}

});

/* SAVE RESULT */

const currentStudent =
users.find(u => u.name === currentUser);

results.push({

student:currentUser,
regNo:currentStudent.regNo,
exam:examName,
score:score,
total:examQuestions.length,
date:new Date().toLocaleString()

});

localStorage.setItem(
"results",
JSON.stringify(results)
);

document.getElementById("examModal")
.classList.add("hidden");

alert(

"✅ Exam Submitted!\n\n" +

"🎯 Score: " +

score +

" / " +

examQuestions.length

);

}

/* ================= LOAD RESULTS ================= */

function loadResults(){

const resultBox =
document.getElementById("resultList");

resultBox.innerHTML = "";

if(results.length === 0){

resultBox.innerHTML = `

<div class="question-box">

No Results Yet

</div>

`;

return;

}

results.forEach(r => {

resultBox.innerHTML += `

<div class="result-card">

<h3>
👨‍🎓 ${r.student}
</h3>

<p>
🎓 Reg No: ${r.regNo}
</p>

<br>

<strong>Exam:</strong>
${r.exam}

<br><br>

<strong>Marks:</strong>
${r.score} / ${r.total}

<br><br>

<strong>Date:</strong>
${r.date}

</div>

`;

});

}

/* ================= LOGOUT ================= */

function logout(){

clearInterval(examTimer);

document.getElementById("studentDashboard")
.classList.add("hidden");

document.getElementById("adminDashboard")
.classList.add("hidden");

document.getElementById("examModal")
.classList.add("hidden");

document.getElementById("loginPage")
.classList.remove("hidden");

}

/* ================= ENTER KEY ================= */

document.addEventListener(
"keypress",
function(e){

if(e.key === "Enter"){

if(!document.getElementById("loginPage")
.classList.contains("hidden")){

login();

}
else if(!document.getElementById("registerPage")
.classList.contains("hidden")){

register();

}

}

});

</script>