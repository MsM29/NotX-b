import multer from "multer";

const storage = multer.diskStorage({
  destination: "./mediaPublication/",
  filename: function (req, file, cb) {
    cb(null, req.headers.name);
  },
});
export const upload = multer({ storage: storage });

const storageProfilePhoto = multer.diskStorage({
  destination: "./mediaProfile/profilePhoto/",
  filename: function (req, file, cb) {
    cb(null, req.headers.name);
  },
});
export const uploadProfilePhoto = multer({ storage: storageProfilePhoto });

const storageWallpaper = multer.diskStorage({
  destination: "./mediaProfile/wallpaper/",
  filename: function (req, file, cb) {
    cb(null, req.headers.name);
  },
});
export const uploadWallpaper = multer({ storage: storageWallpaper });
