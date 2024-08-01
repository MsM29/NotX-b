import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { generateAccessToken } from "./jwt";
import mysql from "mysql2";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: __dirname + "/.env" });

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
        if (Object.keys(results).length === 0)
          res
            .status(400)
            .json({ message: "Ошибка! Такого пользователя не существует" });
        else {
          const token = generateAccessToken(
            results[0].id,
            results[0].login,
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
        fs.copyFile(
          "../../NotX-f/vite-express-project/images/defaultPhotoProfile.png",
          `../../NotX-f/vite-express-project/mediaProfile/profilePhoto/${values[0]}.png`,
          (err) => {
            if (err) console.log(err);
            else
              fs.copyFile(
                "../../NotX-f/vite-express-project/images/defaultPhotoProfile.png",
                `../../NotX-f/vite-express-project/mediaProfile/wallpaper/${values[0]}.png`,
                (err) => {
                  if (err) console.log(err);
                  else res.sendStatus(200);
                },
              );
          },
        );
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
        res.sendStatus(200);
      }
    },
  );
}

export function getPublicationDB(values, offset, res) {
  let rows: mysql.QueryResult;
  let maxPage: number;
  connection.query(
    "SELECT * FROM publications WHERE user=? ORDER BY date DESC LIMIT 10 OFFSET ?",
    [values, parseInt(offset) * 10],
    (err, results) => {
      if (err) {
        console.log(err);
        res.sendStatus(400);
      } else {
        rows = results;
        connection.query(
          "SELECT COUNT(*) FROM publications WHERE user=?",
          [values],
          (err, results) => {
            if (err) {
              console.log(err);
              res.sendStatus(400);
            } else {
              maxPage = Math.ceil(results[0]["COUNT(*)"] / 10);
              res.status(200).json({ rows, maxPage });
            }
          },
        );
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

export function searchDB(values, offset, res) {
  let rows: mysql.QueryResult;
  let maxPage: number;
  connection.query(
    "SELECT id, name, login, photoProfile, bio FROM users WHERE name LIKE ? OR login LIKE ? LIMIT 10 OFFSET ?",
    [...values, parseInt(offset) * 10],
    (err, results) => {
      if (err) {
        console.log(err);
        res.sendStatus(400);
      } else {
        rows = results;
        connection.query(
          "SELECT COUNT(*) FROM users WHERE name LIKE ? OR login LIKE ?",
          [...values],
          (err, results) => {
            if (err) {
              console.log(err);
              res.sendStatus(400);
            } else {
              maxPage = Math.ceil(results[0]["COUNT(*)"] / 10);
              res.status(200).json({ rows, maxPage });
            }
          },
        );
      }
    },
  );
}

export function deletePublicationDB(values, res) {
  connection.query(
    "DELETE FROM publications WHERE id_post=?",
    values,
    (err) => {
      if (err) {
        console.log(err);
        res.sendStatus(400);
      } else {
        res.sendStatus(200);
      }
    },
  );
}

export function editProfileDB(values, res) {
  connection.query(
    "UPDATE users SET name=?, bio=? WHERE id=?;",
    values,
    (err) => {
      if (err) {
        console.log(err);
        res.sendStatus(400);
      } else {
        res.sendStatus(200);
      }
    },
  );
}

export function userDB(values, res) {
  connection.query(
    "SELECT * FROM users WHERE login=?",
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

export function subscribeDB(values, res) {
  connection.query(
    "INSERT INTO subscriptions (`user`, `sub`) VALUES (?);",
    [values],
    (err) => {
      if (err) {
        console.log(err);
        res.sendStatus(400);
      } else {
        res.sendStatus(200);
      }
    },
  );
}

export function unsubscribeDB(values, res) {
  connection.query(
    "DELETE FROM subscriptions WHERE user=? AND sub=?",
    values,
    (err) => {
      if (err) {
        console.log(err);
        res.sendStatus(400);
      } else {
        res.sendStatus(200);
      }
    },
  );
}

export function checkSubscriptionDB(values, res) {
  connection.query(
    "SELECT * FROM subscriptions WHERE user=? AND sub=?",
    values,
    (err, results) => {
      if (err) {
        console.log(err);
        res.sendStatus(400);
      } else {
        if (Object.keys(results).length === 0) res.sendStatus(400);
        else return res.sendStatus(200);
      }
    },
  );
}

export function subscriptionsDB(values, offset, res) {
  let rows: mysql.QueryResult;
  let maxPage: number;
  connection.query(
    "SELECT u.* FROM users u JOIN subscriptions s ON u.login = s.sub WHERE s.user = ? LIMIT 10 OFFSET ?;",
    [values, parseInt(offset) * 10],
    (err, results) => {
      if (err) {
        console.log(err);
        res.sendStatus(400);
      } else {
        if (Object.keys(results).length === 0) res.sendStatus(400);
        else {
          rows = results;
          connection.query(
            "SELECT COUNT(*) FROM users u JOIN subscriptions s ON u.login = s.sub WHERE s.user = ?",
            [values],
            (err, results) => {
              if (err) {
                console.log(err);
                res.sendStatus(400);
              } else {
                maxPage = Math.ceil(results[0]["COUNT(*)"] / 10);
                res.status(200).json({ rows, maxPage });
              }
            },
          );
        }
      }
    },
  );
}

export function subscribersDB(values, offset, res) {
  let rows: mysql.QueryResult;
  let maxPage: number;
  connection.query(
    "SELECT u.* FROM users u JOIN subscriptions s ON u.login = s.user WHERE s.sub = ? LIMIT 10 OFFSET ?;",
    [values, parseInt(offset) * 10],
    (err, results) => {
      if (err) {
        console.log(err);
        res.sendStatus(400);
      } else {
        if (Object.keys(results).length === 0) res.sendStatus(400);
        else {
          rows = results;
          connection.query(
            "SELECT COUNT(*) FROM users u JOIN subscriptions s ON u.login = s.user WHERE s.sub = ?",
            [values],
            (err, results) => {
              if (err) {
                console.log(err);
                res.sendStatus(400);
              } else {
                maxPage = Math.ceil(results[0]["COUNT(*)"] / 10);
                res.status(200).json({ rows, maxPage });
              }
            },
          );
        }
      }
    },
  );
}

export function feedDB(values, offset, res) {
  let rows: mysql.QueryResult;
  let maxPage: number;
  connection.query(
    "SELECT p.*, u.* FROM publications AS p INNER JOIN users AS u ON p.user = u.login WHERE u.login IN ( SELECT u.login FROM users u JOIN subscriptions s ON u.login = s.sub WHERE s.user = ?) ORDER BY p.date DESC LIMIT 10 OFFSET ?;",
    [values, parseInt(offset) * 10],
    (err, results) => {
      if (err) {
        console.log(err);
        res.sendStatus(400);
      } else {
        if (Object.keys(results).length === 0) res.sendStatus(400);
        else {
          rows = results;
          connection.query(
            "SELECT COUNT(*) FROM publications AS p INNER JOIN users AS u ON p.user = u.login WHERE u.login IN ( SELECT u.login FROM users u JOIN subscriptions s ON u.login = s.sub WHERE s.user = ?)",
            [values],
            (err, results) => {
              if (err) {
                console.log(err);
                res.sendStatus(400);
              } else {
                maxPage = Math.ceil(results[0]["COUNT(*)"] / 10);
                res.status(200).json({ rows, maxPage });
              }
            },
          );
        }
      }
    },
  );
}
