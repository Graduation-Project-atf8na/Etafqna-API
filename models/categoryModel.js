const mongoose = require('mongoose');

// 1- Create Schema
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: [true, 'Category must be Unique'],
      required: [true, 'Category Name required!']
    },
    slug: {
      type: String,
      lowercase: true
    },
    image: {
      type: Map,
      of: String
    }
  },
  {
    timestamps: true
  }
);

// 2- Create Model
const CategoryModel = mongoose.model('Category', categorySchema);

module.exports = CategoryModel;
