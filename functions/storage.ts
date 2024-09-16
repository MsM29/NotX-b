import multer from "multer";

const storage = multer.diskStorage({
  destination: "./public/mediaPublication/",
  filename: function (req, file, cb) {
    cb(null, req.headers.name);
  },
});
export const upload = multer({ storage: storage });

const storageProfilePhoto = multer.diskStorage({
  destination: "./public/mediaProfile/profilePhoto/",
  filename: function (req, file, cb) {
    cb(null, req.headers.name);
  },
});
export const uploadProfilePhoto = multer({ storage: storageProfilePhoto });

const storageWallpaper = multer.diskStorage({
  destination: "./public/mediaProfile/wallpaper/",
  filename: function (req, file, cb) {
    cb(null, req.headers.name);
  },
});
export const uploadWallpaper = multer({ storage: storageWallpaper });

const storageComment = multer.diskStorage({
  destination: "./public/mediaComment/",
  filename: function (req, file, cb) {
    cb(null, req.headers.name);
  },
});
export const uploadComment = multer({ storage: storageComment });
