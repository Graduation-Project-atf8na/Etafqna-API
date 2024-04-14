const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: [3, 'Too short Product Title'],
      maxlength: [100, 'Too long Product Title']
    },
    slug: {
      type: String,
      required: true,
      lowercase: true
    },
    description: {
      type: String,
      required: [true, 'Product Description is required'],
      minlength: [20, 'Too short product Description']
    },
    quantity: {
      type: Number,
      required: [true, 'Product Quatity is required']
    },
    sold: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      trim: true
    },
    priceAfterDiscount: {
      type: Number
    },
    colors: [String],

    imageCover: {
      type: Map,
      of: String,
      required: [true, 'Product Image Cover is required']
    },
    images: [
      {
        type: Map,
        of: String
      }
    ],
    category: {
      type: mongoose.Schema.ObjectId,
      ref: 'Category',
      required: [true, 'Product must be belong to category']
    },
    subcategories: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'SubCategory'
      }
    ],
    ratingsAverage: {
      type: Number,
      min: [1, 'Your Rating must be above or equal to 1.0'],
      max: [5, 'Your Rating must be below or equal to 5.0']
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);
// Mongoose Query Middleware
productSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'category',
    select: 'name _id'
  });
  // .populate({
  //   path: 'subcategories',
  //   select: 'name _id'
  // });

  next();
});

module.exports = mongoose.model('Product', productSchema);
