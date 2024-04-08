const multer = require('multer');
const AppError = require('./appError');

const multerOptions = () => {
  // Disk Storage and image name
  // const multerStorage = multer.diskStorage({
  //   destination: (req, file, cb) => {
  //     cb(null, 'uploads/categories');
  //   },
  //   filename: (req, file, cb) => {
  //     const ext = file.mimetype.split('/')[1];
  //     const fileName = `catergory-${uuidv4()}-${Date.now()}.${ext}`;
  //     cb(null, fileName);
  //   }
  // });

  // memory storage
  const multerStorage = multer.memoryStorage();

  // for Allow only images
  const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
      cb(null, true);
    } else {
      cb(new AppError('Not an image! Please upload only images.', 400), false);
    }
  };

  const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

  return upload;
};

exports.uploadSingleImage = (fieldName) => multerOptions().single(fieldName);

exports.uploadMultipleImages = (arrOfFields) =>
  multerOptions().fields(arrOfFields);
