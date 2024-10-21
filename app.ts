import express, { Request } from "express";
import crypto from "crypto";
import { auth } from "./functions/jwt";
import { Express } from "multer";
import * as db from "./functions/dbOperations";
import * as storage from "./functions/storage";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

app.listen(3000, () => console.log("Server is listening on port 3000..."));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(
  "/",
  express.static(path.dirname(__dirname) + "/NotX-f/vite-express-project/dist/")
);

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const hash = crypto.createHash("md5").update(password).digest("hex");
  db.loginDB([email, email, hash], res);
});

app.post("/registration", (req, res) => {
  const { name, email, password } = req.body;
  const hash = crypto.createHash("md5").update(password).digest("hex");
  db.registrationDB([name, name, email, hash], res);
});

interface MyRequest extends Request {
  body: any;
  query: any;
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
      db.addMediaDB([req.file.filename, brokenName[0], brokenName[1]], res);
    }
  }
);

app.get("/getPublication", auth, (req: MyRequest, res) => {
  const offset = req.query.page || 0;
  db.getPublicationDB([req.user.login, req.user.login], offset, res);
});

app.get("/search", auth, (req: MyRequest, res) => {
  const offset = req.query.page || 0;
  db.searchDB(
    req.user.login,
    [`%${req.query.user}%`, `%${req.query.user}%`],
    offset,
    res
  );
});

app.get("/delete", auth, (req, res) => {
  db.deletePublicationDB([req.query.id_post], res);
});

app.get("/deleteComment", auth, (req, res) => {
  db.deleteCommentDB([req.query.id_post], res);
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
  }
);

app.post(
  "/editWallpaperProfile",
  auth,
  storage.uploadWallpaper.single("filedata"),
  (req, res) => {
    res.sendStatus(200);
  }
);

app.get("/users", auth, (req: MyRequest, res) => {
  db.userDB([req.query.user], res);
});

app.get("/getUserPublication", auth, (req: MyRequest, res) => {
  const offset = req.query.page || 0;
  db.getPublicationDB([req.query.login, req.query.login], offset, res);
});

app.get("/subscribe", auth, (req: MyRequest, res) => {
  if (req.query.privateStatus === "1")
    db.subscribeDB([req.user.login, req.query.login, 0], res);
  else db.subscribeDB([req.user.login, req.query.login, 1], res);
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

app.post("/setPrivacy", auth, (req: MyRequest, res) => {
  db.privacyDB([req.body.privacy, req.user.id], res);
});

app.post("/editPassword", auth, (req: MyRequest, res) => {
  const { oldPassword, newPassword } = req.body;
  const oldHash = crypto.createHash("md5").update(oldPassword).digest("hex");
  const newHash = crypto.createHash("md5").update(newPassword).digest("hex");
  db.editPasswordDB([newHash, oldHash, req.user.id], res);
});

app.get("/like", auth, (req: MyRequest, res) => {
  db.likePublicationDB([req.query.post, req.user.login], res);
});

app.get("/likeComment", auth, (req: MyRequest, res) => {
  db.likeCommentDB([req.query.post, req.user.login], res);
});

app.get("/likes", auth, (req: MyRequest, res) => {
  const offset = req.query.page || 0;
  db.likesUserDB(req.query.post, req.user.login, offset, res);
});

app.get("/likesComment", auth, (req: MyRequest, res) => {
  const offset = req.query.page || 0;
  db.likesCommentUserDB(req.query.post, req.user.login, offset, res);
});

app.get("/post", auth, (req: MyRequest, res) => {
  db.postDB([req.query.post], res);
});

app.post("/makeComment", auth, (req: MyRequest, res) => {
  db.makeCommentDB(
    [req.user.login, req.body.text, new Date(), req.body.post],
    res
  );
});

app.post(
  "/addMediaComment",
  auth,
  storage.uploadComment.single("filedata"),
  (req: MyRequest, res) => {
    const filedata = req.file;
    if (filedata) {
      const brokenName = req.file.filename.split("_");
      db.addMediaCommentDB(
        [req.file.filename, brokenName[0], brokenName[1]],
        res
      );
    }
  }
);

app.get("/getComments", auth, (req: MyRequest, res) => {
  const offset = req.query.page || 0;
  db.getCommentsDB([req.query.post, req.query.post], offset, res);
});

app.get("/acceptApplication", auth, (req: MyRequest, res) => {
  db.acceptApplicationDB([req.query.user, req.user.login], res);
});

app.get("/rejectApplication", auth, (req: MyRequest, res) => {
  db.rejectApplicationDB([req.query.user, req.user.login], res);
});
