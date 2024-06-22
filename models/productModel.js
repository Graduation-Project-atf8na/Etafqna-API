const mongoose = require('mongoose');
// const { bool } = require('sharp');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      minlength: [3, 'Too short Product Title'],
      maxlength: [100, 'Too long Product Title'],
      required: true
    },
    slug: {
      type: String,
      lowercase: true,
      required: true
    },
    description: {
      type: String,
      minlength: [20, 'Too short product Description'],
      required: [true, 'Product Description is required']
    },
    price: {
      type: Number,
      required: [true, 'Product Price is required']
    },
    donate: {
      type: Boolean,
      default: false
    },
    exchange: {
      type: Boolean,
      default: false
    },
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
    owner: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Product must be belong to a user']
    },
    location: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String
    },
    category: {
      type: mongoose.Schema.ObjectId,
      ref: 'Category',
      required: [true, 'Product must be belong to category']
    },
    subcategories: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Subcategory',
        required: [true, 'Product must be belong at least to one subcategory']
      }
    ]
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Mongoose Query Middleware
productSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'category',
    select: 'name _id'
  })
    .populate({
      path: 'owner',
      select: 'name _id'
    })
    .populate({
      path: 'subcategories',
      select: 'name _id -category'
    });

  next();
});

module.exports = mongoose.model('Product', productSchema);
