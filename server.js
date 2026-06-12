require("dotenv").config();

const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();

const db = mysql.createConnection(process.env.DB_URL);

/* ========== MIDDLEWARE ========== */
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// ================= ADMIN SESSION SETUP =================
const session = require('express-session');
app.use(session({
    secret: process.env.SESSION_SECRET || "My$tr0ngS3cretKey!2026",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24*60*60*1000 } // 1 day
}));

/* ========== FRONTEND ROUTE ========== */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

/* ========== MYSQL CONNECTION ========== */
// Old connection remove karo
// const db = mysql.createConnection({...});

// Replace with this single line:


db.connect((err) => {
  if (err) {
    console.error("DB Connection Error:", err);
  } else {
    console.log("✅ MySQL Connected");
  }
});

/* ========== REGISTER ========== */
app.post("/register", (req, res) => {
  const { name, email, regNo, password } = req.body;
  const sql = "INSERT INTO users(name,email,regNo,password) VALUES(?,?,?,?)";

  db.query(sql, [name, email, regNo, password], (err, result) => {
    if (err) return res.status(400).send("User already exists or invalid data");
    res.send("✅ Registered");
  });
});

/* ========== LOGIN ========== */
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (email === "admin@gmail.com" && password === "220082") {
    // Create session
    req.session.admin = { email: "admin@gmail.com", name: "DSU Admin" };

    return res.json({
      role: "admin",
      user: {
        name: "DSU Admin",
        email: "admin@gmail.com",
        regNo: "Admin"
      }
    });
  }

  // Student login as before
  db.query(
    "SELECT * FROM users WHERE email=? AND password=?",
    [email, password],
    (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: "Database error" });
      }

      if (result.length === 0) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      res.json({
        role: "student",
        user: result[0]
      });
    }
  );
});
/* ========== ADMIN MIDDLEWARE ========== */

function isAdmin(req, res, next) {
  if (req.session && req.session.admin) {
    next();
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
}
/* ================= ADMIN DASHBOARD ================= */
app.get("/admin/dashboard", isAdmin, (req, res) => {
  res.render("dashboard", { admin: req.session.admin });
});


/* ================= ADMIN LOGOUT ================= */
app.get("/admin/logout", (req,res)=>{
    req.session.destroy(err=>{
        if(err) return res.status(500).send("Error logging out");
        res.redirect("/login");
    });
});
/* ========== ADD EXAM ========== */
app.post("/addExam", (req, res) => {
  const { name, marks, duration, teacherEmail } = req.body;

  db.query(
    "INSERT INTO exams(name, marks, duration, teacherEmail) VALUES(?,?,?,?)",
    [name, marks, duration, teacherEmail],
    (err) => {
      if(err) return res.status(500).send(err);
      res.send("✅ Exam Added");
    }
  );
});
/* ========== ADD MCQ ========== */
/* ================= ADD MCQ ================= */

app.post("/addMCQ", (req, res) => {
  const { exam, question, option1, option2, option3, option4, correct } = req.body;

  if (!exam || !question || !option1 || !option2 || !option3 || !option4 || correct === "") {
    return res.status(400).send("Fill all MCQ fields");
  }

  const sql = `
    INSERT INTO questions
    (exam, question, option1, option2, option3, option4, correctAnswer)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [exam, question, option1, option2, option3, option4, correct], (err) => {
    if (err) {
      console.log(err);
      return res.status(500).send("MCQ not added");
    }

    res.send("✅ MCQ Added");
  });
});

/* ================= DELETE EXAM ================= */

app.delete("/deleteExam/:name", (req, res) => {
  const examName = req.params.name;

  db.query("DELETE FROM questions WHERE exam = ?", [examName], (err) => {
    if (err) {
      console.log(err);
      return res.status(500).send("Questions not deleted");
    }

    db.query("DELETE FROM exams WHERE name = ?", [examName], (err2) => {
      if (err2) {
        console.log(err2);
        return res.status(500).send("Exam not deleted");
      }

      res.send("✅ Exam Deleted");
    });
  });
});
/* ========== GET EXAMS ========== */
app.get("/exams", (req, res) => {
  db.query("SELECT * FROM exams", (err, result) => {
    if (err) return res.status(500).json({ message: "Database error" });
    res.json(result);
  });
});

/* ================= GET QUESTIONS ================= */

app.get("/questions", (req, res) => {
  db.query("SELECT * FROM questions", (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send(err);
    }

    res.json(result);
  });
});

/* ========== SUBMIT RESULT ========== */
app.post("/submitResult", (req, res) => {
  const { student, regNo, exam, score, total, date } = req.body;
  const sql = "INSERT INTO results(student,regNo,exam,score,total,date) VALUES(?,?,?,?,?,?)";

  db.query(sql, [student, regNo, exam, score, total, date], (err, result) => {
    if (err) return res.status(400).send(err);
    res.send("✅ Result Saved");
  });
});

/* ========== GET RESULTS ========== */
app.get("/results", (req, res) => {
  db.query("SELECT * FROM results", (err, result) => {
    if (err) return res.status(500).send(err);
    res.send(result);
  });
});

/* ========== SERVER START ========== */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});