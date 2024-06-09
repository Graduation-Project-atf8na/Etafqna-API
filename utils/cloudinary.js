const cloudinary = require('cloudinary').v2;
const asyncHandler = require('express-async-handler');
// const catchAsync = require('./catchAsync');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const cloudinaryUploadImage = asyncHandler(async (fileToUpload, folder) => {
  const data = await cloudinary.uploader.upload(fileToUpload, {
    resource_type: 'auto',
    folder: folder
  });

  return data;
});

const cloudinaryDeleteImage = asyncHandler(async (imagePublicId) => {
  const result = await cloudinary.uploader.destroy(imagePublicId);

  return result;
});

module.exports = { cloudinaryUploadImage, cloudinaryDeleteImage };
