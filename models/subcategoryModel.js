const mongoose = require('mongoose');

const subcategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'SubCategory must have a Name!'],
      unique: [true, 'SubCategory must be unique'],
      minlength: [2, 'Too short SubCategory name, at least 2'],
      maxlength: [32, 'Too long SubCategory name']
    },
    slug: {
      type: String,
      lowercase: true
    },
    category: {
      type: mongoose.Schema.ObjectId,
      ref: 'Category',
      required: [true, 'SubCategory must be belong to parent Category']
    },
    image: {
      type: Map,
      of: String
    }
  },
  { timestamps: true }
);

// Mongoose Query Middleware
subcategorySchema.pre(/^find/, function (next) {
  this.populate({
    path: 'category',
    select: 'name'
  });
  next();
});

module.exports = mongoose.model('Subcategory', subcategorySchema);
