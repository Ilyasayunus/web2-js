const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const mysql = require("mysql2");

const app = express();
const PORT = 3000;

// Koneksi ke database
const db = mysql.createConnection({
  host: "localhost",
  user: "root",      // ganti sesuai user MySQL kamu
  password: "",      // ganti kalau pakai password
  database: "web3_js"
});

db.connect(err => {
  if (err) throw err;
  console.log("Connected to MySQL");
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: "secret_key",
  resave: false,
  saveUninitialized: true
}));
app.use(express.static("public"));

// Default route
app.get("/", (req, res) => {
  if (req.session.loggedin) {
    res.redirect("/dashboard.html");
  } else {
    res.redirect("/login.html");
  }
});

// Route Login
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  db.query(
    "SELECT * FROM users WHERE username = ? AND password = ?",
    [username, password],
    (err, result) => {
      if (err) throw err;
      if (result.length > 0) {
        req.session.loggedin = true;
        req.session.username = username;
        res.redirect("/dashboard.html");
      } else {
        res.send("Login gagal! <a href='/login.html'>Coba lagi</a>");
      }
    }
  );
});

// Proteksi dashboard
app.get("/dashboard.html", (req, res, next) => {
  if (req.session.loggedin) {
    next(); // lanjut ke file dashboard.html di public/
  } else {
    res.redirect("/login.html");
  }
});

// Logout
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login.html");
  });
});

// Jalankan server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
