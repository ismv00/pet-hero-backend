import multer, { MulterError } from 'multer';
import path from 'path';
import crypto from 'crypto';

const fileFilter = (req: any, file: any, cb: any) => {
  const allowedMimeTyoes = ["image/jpg", "image/png", "image/jpeg"];
  if(allowedMimeTyoes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type."));
  }
};

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, path.resolve(__dirname, "..", "..", "tmp", "uploads"));
  },
  filename: function(req, file, cb) {
    crypto.randomBytes(16, (err, hash) => {
      const fileName = `${hash.toString("hex")}-${file.originalname}`;

      cb(null, fileName);
    });
  }
});

export const uploads = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024}
})
