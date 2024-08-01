import express, { Request } from "express";
import ViteExpress from "vite-express";
import crypto from "crypto";
import { auth } from "./functions/jwt";
import { Express } from "multer";
import * as db from "./functions/dbOperations";
import * as storage from "./functions/storage";

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
  db.makePublicationDB([req.user.login, req.body.text, new Date()], res);
});

app.post(
  "/addMedia",
  auth,
  storage.upload.single("filedata"),
  (req: MyRequest, res) => {
    const filedata = req.file;
    if (filedata) {
      const brokenName = req.file.filename.split("_");
      db.addMediaDB([brokenName[2], req.file.filename, brokenName[0]], res);
    }
  },
);

app.get("/getPublication", auth, (req: MyRequest, res) => {
  const offset = req.query.page || 0;
  db.getPublicationDB(req.user.login, offset, res);
});

app.post("/getMedia", auth, (req: MyRequest, res) => {
  db.getMediaDB([req.body.id_post], res);
});

app.get("/search", auth, (req, res) => {
  const offset = req.query.page || 0;
  db.searchDB([`%${req.query.user}%`, `%${req.query.user}%`], offset, res);
});

app.get("/delete", auth, (req, res) => {
  db.deletePublicationDB([req.query.id_post], res);
});

app.post("/editProfile", auth, (req: MyRequest, res) => {
  db.editProfileDB([req.body.name, req.body.bio, req.user.id], res);
});

app.post(
  "/editPhotoProfile",
  auth,
  storage.uploadProfilePhoto.single("filedata"),
  (req, res) => {
    res.sendStatus(200);
  },
);

app.post(
  "/editWallpaperProfile",
  auth,
  storage.uploadWallpaper.single("filedata"),
  (req, res) => {
    res.sendStatus(200);
  },
);

app.get("/users", auth, (req: MyRequest, res) => {
  db.userDB([req.query.user], res);
});

app.get("/getUserPublication", auth, (req: MyRequest, res) => {
  const offset = req.query.page || 0;
  db.getPublicationDB(req.query.login, offset, res);
});

app.get("/subscribe", auth, (req: MyRequest, res) => {
  db.subscribeDB([req.user.login, req.query.login], res);
});

app.get("/unsubscribe", auth, (req: MyRequest, res) => {
  db.unsubscribeDB([req.user.login, req.query.login], res);
});

app.get("/checkSubscription", auth, (req: MyRequest, res) => {
  db.checkSubscriptionDB([req.user.login, req.query.login], res);
});

app.get("/subscriptions", auth, (req: MyRequest, res) => {
  const offset = req.query.page || 0;
  db.subscriptionsDB(req.user.login, offset, res);
});

app.get("/subscribers", auth, (req: MyRequest, res) => {
  const offset = req.query.page || 0;
  db.subscribersDB(req.user.login, offset, res);
});

app.get("/feed", auth, (req: MyRequest, res) => {
  const offset = req.query.page || 0;
  db.feedDB(req.user.login, offset, res);
});
