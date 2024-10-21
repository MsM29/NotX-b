import multer from "multer";

const storage = multer.diskStorage({
  destination: "../NotX-f/vite-express-project/public/mediaPublication/",
  filename: function (req, file, cb) {
    cb(null, req.headers.name);
  },
});
export const upload = multer({ storage: storage });

const storageProfilePhoto = multer.diskStorage({
  destination: "../NotX-f/vite-express-project/public/mediaProfile/profilePhoto/",
  filename: function (req, file, cb) {
    cb(null, req.headers.name);
  },
});
export const uploadProfilePhoto = multer({ storage: storageProfilePhoto });

const storageWallpaper = multer.diskStorage({
  destination: "../NotX-f/vite-express-project/public/mediaProfile/wallpaper/",
  filename: function (req, file, cb) {
    cb(null, req.headers.name);
  },
});
export const uploadWallpaper = multer({ storage: storageWallpaper });

const storageComment = multer.diskStorage({
  destination: "../NotX-f/vite-express-project/public/mediaComment/",
  filename: function (req, file, cb) {
    cb(null, req.headers.name);
  },
});
export const uploadComment = multer({ storage: storageComment });
