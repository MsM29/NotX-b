import express from "express";
import ViteExpress from "vite-express";
import mysql from "mysql2";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import auth from "./middleware/auth";
const app = express();
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: __dirname + "/.env" });
ViteExpress.listen(app, 3000, () =>
  console.log("Server is listening on port 3000...")
);

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

let connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB,
  password: process.env.DB_PASSWORD,
});

const secretKey = "secret";

function generateAccessToken(id, name, email) {
  const payload = {
    id,
    name,
    email,
  };
  return jwt.sign(payload, secretKey, { expiresIn: "24h" });
}

const sqlLogin = `SELECT * FROM users WHERE email=? AND password=?;`;

app.post("/login", (req, res) => {
  try {
    let { email, password } = req.body;
    const hash = crypto.createHash("md5").update(password).digest("hex");
    connection.query(sqlLogin, [email, hash], function (err, results) {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: "Внутренняя ошибка сервера" });
      } else {
        if (Object.keys(results).length === 0)
          res
            .status(500)
            .json({ message: "Такого пользователя не существует!" });
        else {
          const token = generateAccessToken(
            results[0].id,
            results[0].name,
            results[0].email
          );
          res.cookie("token", `Bearer ${token}`, {
            httpOnly: true,
          });
          return res.sendStatus(200);
        }
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Внутренняя ошибка сервера" });
  }
});

const sqlRegistration = `INSERT INTO users(name, login, email, password) VALUES(?)`;

app.post("/registration", (req, res) => {
  try {
    let { name, email, password } = req.body;
    const hash = crypto.createHash("md5").update(password).digest("hex");
    let values = [name, name, email, hash];

    connection.query(sqlRegistration, [values], function (err, results) {
      if (err) {
        console.log(err);
        return res.status(400).json({
          message: "Ошибка! Пользователь с такой почтой уже существует!",
        });
      } else {
        return res.sendStatus(200);
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Внутренняя ошибка сервера" });
  }
});

const sqlHome = "SELECT * FROM users WHERE id=?";
import { Request } from "express"; // Пример с express

interface MyRequest extends Request {
  user: {
    id: number;
    name: string;
    login: string;
    bio: string;
    photoProfile: string;
    wallpaper: string;
  };
}

app.get("/home", auth, (req: MyRequest, res) => {
  connection.query(sqlHome, [req.user.id], function (err, results) {
    if (err) {
      console.log(err);
    } else {
      console.log(results);
      res.status(200).send(results);
    }
  });
});

app.get("/logout", (req, res) => {
  try {
    res.clearCookie("token").sendStatus(200);
  } catch (err) {
    console.log(err)
    res.sendStatus(400);
  }
});
