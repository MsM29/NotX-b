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
  connection.query(
    "SELECT p.*, (SELECT COUNT(*) FROM likes WHERE id_post = p.id_post) AS likes_count, (SELECT COUNT(*) FROM publications WHERE user = ?) AS total_count FROM  publications p WHERE  p.user = ? ORDER BY  p.date DESC LIMIT 10 OFFSET ?;",
    [...values, parseInt(offset) * 10],
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

export function searchDB(values, offset, res) {
  connection.query(
    "SELECT id, name, login, bio, (SELECT COUNT(*) FROM users WHERE name LIKE ? OR login LIKE ?) AS total_count FROM users WHERE name LIKE ? OR login LIKE ? LIMIT 10 OFFSET ?",
    [...values, ...values, parseInt(offset) * 10],
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
  connection.query(
    "SELECT u.*, (SELECT COUNT(*) FROM users u2 JOIN subscriptions s2 ON u2.login = s2.sub WHERE s2.user = ?) AS total_count FROM users u  JOIN subscriptions s ON u.login = s.sub  WHERE s.user = ? LIMIT 10 OFFSET ?;",
    [values, values, parseInt(offset) * 10],
    (err, results) => {
      if (err) {
        console.log(err);
        res.sendStatus(400);
      } else {
        if (Object.keys(results).length === 0) res.sendStatus(400);
        else {
          res.status(200).send(results);
        }
      }
    },
  );
}

export function subscribersDB(values, offset, res) {
  connection.query(
    "SELECT u.*, (SELECT COUNT(*) FROM users u JOIN subscriptions s ON u.login = s.user WHERE s.sub = ? ) AS total_count FROM users u JOIN subscriptions s ON u.login = s.user WHERE s.sub = ? LIMIT 10 OFFSET ?;",
    [values, values, parseInt(offset) * 10],
    (err, results) => {
      if (err) {
        console.log(err);
        res.sendStatus(400);
      } else {
        if (Object.keys(results).length === 0) res.sendStatus(400);
        else {
          res.status(200).send(results);
        }
      }
    },
  );
}

export function feedDB(values, offset, res) {
  connection.query(
    "SELECT p.*, u.*, (SELECT COUNT(*) FROM publications AS p INNER JOIN users AS u ON p.user = u.login WHERE u.login IN ( SELECT u.login FROM users u JOIN subscriptions s ON u.login = s.sub WHERE s.user = ?)) AS total_count, (SELECT COUNT(*) FROM likes WHERE id_post = p.id_post) AS likes_count FROM publications AS p INNER JOIN users AS u ON p.user = u.login WHERE u.login IN ( SELECT u.login FROM users u JOIN subscriptions s ON u.login = s.sub WHERE s.user = ?) ORDER BY p.date DESC LIMIT 10 OFFSET ?;",
    [values, values, parseInt(offset) * 10],
    (err, results) => {
      if (err) {
        console.log(err);
        res.sendStatus(400);
      } else {
        if (Object.keys(results).length === 0) res.sendStatus(400);
        else {
          res.status(200).send(results);
        }
      }
    },
  );
}

export function privacyDB(values, res) {
  connection.query("UPDATE users SET private=? WHERE id=?;", values, (err) => {
    if (err) {
      console.log(err);
      res.sendStatus(400);
    } else {
      res.sendStatus(200);
    }
  });
}

export function editPasswordDB(values, res) {
  connection.query(
    "UPDATE users SET password = ? WHERE password = ? AND id=?",
    values,
    function (err, results) {
      if (err) {
        console.log(err);
        return res.status(400).json({
          message: "Неверный пароль!",
        });
      } else {
        if (Object.entries(results)[1][1] === 0)
          res.status(400).json({
            message: "Неверный пароль!",
          });
        else {
          return res.sendStatus(200);
        }
      }
    },
  );
}

export function likePublicationDB(values, res) {
  connection.query(
    "INSERT INTO likes (id_post, login) VALUES (?);",
    [values],
    (err) => {
      if (err) {
        connection.query(
          "DELETE FROM likes WHERE id_post=? AND login=?",
          values,
          (err) => {
            if (err) {
              res.sendStatus(400);
            } else {
              res.json({ message: "remove" });
            }
          },
        );
      } else {
        res.json({ message: "put" });
      }
    },
  );
}

export function likesUserDB(values, offset, res) {
  connection.query(
    "SELECT *, (SELECT COUNT(*) FROM users WHERE login IN (SELECT login FROM likes WHERE id_post=?)) AS total_count FROM users WHERE login IN (SELECT login FROM likes WHERE id_post=?) LIMIT 10 OFFSET ?;",
    [values, values, offset * 10], 
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

