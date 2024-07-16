import express from "express";
import ViteExpress from "vite-express";

const app = express();

ViteExpress.listen(app, 3000, () =>
  console.log("Server is listening on port 3000..."),
);

app.use(express.urlencoded({ extended: false }));

app.get("/hello", (request, response) => {
  try {
    console.log("Запрос на главную страницу");
  } catch (error) {
    console.error("Ошибка при отправке файла:", error);
    response.status(500).send("Внутренняя ошибка сервера");
  }
});

app.post("/login", (req, res) => {
  try {
    if (!req.body || !req.body.email) {
      return res.status(400).send("Отсутствует email в теле запроса");
    }
    console.log("Полученный email:", req.body.email);
    res.status(200).send("Email получен");
  } catch (error) {
    console.error("Ошибка при обработке запроса на вход:", error);
    res.status(500).send("Ошибка при обработке запроса на вход");
  }
});
