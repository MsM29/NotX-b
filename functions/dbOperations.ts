import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: __dirname + "/.env" });
import { generateAccessToken } from "./jwt";
import mysql from "mysql2";

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB,
  password: process.env.DB_PASSWORD,
});

export function loginDB(values, res) {
  connection.query(
    `SELECT * FROM users WHERE email=? AND password=?;`,
    values,
    (err, results) => {
      if (err) {
        console.log(err);
        return res.status(400).json({ message: "Ошибка входа" });
      } else {
        console.log(results);
        if (Object.keys(results).length === 0)
          res
            .status(400)
            .json({ message: "Ошибка! Такого пользователя не существует" });
        else {
          const token = generateAccessToken(
            results[0].id,
            results[0].name,
            results[0].email,
          );
          res.cookie("token", `Bearer ${token}`, {
            httpOnly: true,
          });
          return res.sendStatus(200);
        }
      }
    },
  );
}

export function registrationDB(values, res) {
  connection.query(
    "INSERT INTO users(name, login, email, password) VALUES(?)",
    [values],
    function (err) {
      if (err) {
        console.log(err);
        return res.status(400).json({
          message: "Ошибка! Пользователь с такой почтой уже существует!",
        });
      } else {
        return res.sendStatus(200);
      }
    },
  );
}

export function homeDB(values, res) {
  connection.query(
    "SELECT * FROM users WHERE id=?",
    values,
    function (err, results) {
      if (err) {
        console.log(err);
      } else {
        res.status(200).send(results);
      }
    },
  );
}

export function makePublicationDB(values, res) {
  connection.query(
    "INSERT INTO publications (`user`, `text`, `date`) VALUES (?);",
    [values],
    (err, results) => {
      if (err) {
        console.log(err);
        res.sendStatus(400);
      } else {
        res.status(200).send(results);
      }
    },
  );
}

export function addMediaDB(values, res) {
  connection.query(
    "INSERT INTO media_publication (`id_post`, `media_name`, `format`) VALUES (?);",
    [values],
    (err) => {
      if (err) {
        console.log(err);
        res.sendStatus(400);
      } else {
        res.status(200);
      }
    },
  );
}

export function getPublicationDB(values, res) {
  connection.query(
    "SELECT * FROM publications WHERE user=? ORDER BY date DESC",
    values,
    (err, results) => {
      if (err) {
        console.log(err);
        res.sendStatus(400);
      } else {
        res.status(200).send(results);
      }
    },
  );
}

export function getMediaDB(values, res) {
  connection.query(
    "SELECT * FROM media_publication WHERE id_post=?",
    values,
    (err, results) => {
      if (err) {
        console.log(err);
        res.sendStatus(400);
      } else {
        res.status(200).send(results);
      }
    },
  );
}

export function searchDB(values, res) {
  connection.query(
    "SELECT name, login, photoProfile, bio FROM users WHERE name LIKE ? OR login LIKE ?",
    values,
    (err, results) => {
      if (err) {
        console.log(err);
        res.sendStatus(400);
      } else {
        res.status(200).send(results);
      }
    },
  );
}
