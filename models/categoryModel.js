const mongoose = require('mongoose');

// 1- Create Schema
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category Name required!'],
      unique: [true, 'Category must be Unique'],
      minlength: [3, 'Too short category name'],
      maxlength: [32, 'Too long category name']
    },
    slug: {
      type: String,
      lowercase: true
    },
    image: String
  },
  {
    timestamps: true
  }
);

// MONGOOSE MIDDLEWARE
// Rename image value to full path in response
// work for getAll, getOne, Update
//

// 2- Create Model
const CategoryModel = mongoose.model('Category', categorySchema);

module.exports = CategoryModel;
