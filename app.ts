import express from "express";
import ViteExpress from "vite-express";
import mysql from "mysql2";
import crypto from "crypto";
import session from "express-session";
const app = express();

ViteExpress.listen(app, 3000, () =>
  console.log("Server is listening on port 3000...")
);

app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: "something secret",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(express.json());

let connection = mysql.createConnection({
  host: "localhost",
  user: "not_root",
  database: "notx",
  password: "not_root_password",
});

const sqlRegistration = `INSERT INTO users(name, email, password) VALUES(?)`;
const sqlLogin = `SELECT * FROM users WHERE email=? AND password=?;`;

app.get("/hello", (request, response) => {
  try {
    console.log("Запрос на главную страницу");
  } catch (error) {
    response.status(500).send("Внутренняя ошибка сервера");
  }
});

app.post("/login", (req, res) => {
  console.log(req.body);
  try {
    let { email, password } = req.body;
    const hash = crypto.createHash("md5").update(password).digest("hex");
    connection.query(sqlLogin, [email, hash], function (err, results) {
      if (err) {
        console.log(err);
        return res.sendStatus(400);
      } else {
        if (Object.keys(results).length === 0) res.redirect("/");
        else return res.sendStatus(200);
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Внутренняя ошибка сервера");
  }
});

app.post("/registration", (req, res) => {
  try {
    let { name, email, password } = req.body;
    const hash = crypto.createHash("md5").update(password).digest("hex");
    let values = [name, email, hash];

    connection.query(sqlRegistration, [values], function (err, results) {
      if (err) {
        console.log(err);
        return res.sendStatus(400);
      } else {
        return res.sendStatus(200);
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Внутренняя ошибка сервера");
  }
});
