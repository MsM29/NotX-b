import express, { Request } from "express";
import ViteExpress from "vite-express";
import crypto from "crypto";
import { auth } from "./functions/jwt";
import multer, { Express } from "multer";
import * as db from "./functions/dbOperations";

const app = express();

ViteExpress.listen(app, 3000, () =>
  console.log("Server is listening on port 3000..."),
);

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const hash = crypto.createHash("md5").update(password).digest("hex");
  db.loginDB([email, hash], res);
});

app.post("/registration", (req, res) => {
  const { name, email, password } = req.body;
  const hash = crypto.createHash("md5").update(password).digest("hex");
  db.registrationDB([name, name, email, hash], res);
});

interface MyRequest extends Request {
  user: {
    id: number;
    name: string;
    login: string;
    bio: string;
    photoProfile: string;
    wallpaper: string;
  };
  file?: Express.Multer.File;
}

app.get("/home", auth, (req: MyRequest, res) => {
  db.homeDB([req.user.id], res);
});

app.get("/logout", (req, res) => {
  try {
    res.clearCookie("token").sendStatus(200);
  } catch (err) {
    console.log(err);
    res.sendStatus(400);
  }
});

app.post("/makePublication", auth, (req: MyRequest, res) => {
  db.makePublicationDB([req.user.name, req.body.text, new Date()], res);
});

const storage = multer.diskStorage({
  destination: "./mediaPublication/",
  filename: function (req, file, cb) {
    cb(null, req.headers.name);
  },
});
const upload = multer({ storage: storage });

app.post(
  "/addMedia",
  auth,
  upload.single("filedata"),
  (req: MyRequest, res) => {
    const filedata = req.file;
    if (filedata) {
      const brokenName = req.file.filename.split("_");
      db.addMediaDB([brokenName[2], req.file.filename, brokenName[0]], res);
    }
  },
);

app.get("/getPublication", auth, (req: MyRequest, res) => {
  db.getPublicationDB([req.user.name], res);
});

app.post("/getMedia", auth, (req: MyRequest, res) => {
  db.getMediaDB([req.body.id_post], res);
});

app.get("/search", auth, (req, res) => {
  db.searchDB([`%${req.query.user}%`, `%${req.query.user}%`], res);
});
