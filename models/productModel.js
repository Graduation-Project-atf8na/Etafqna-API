const mongoose = require('mongoose');
// const { bool } = require('sharp');

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
    price: {
      type: Number,
      required: [true, 'Product Price is required']
    },
    // options: [
    //   {
    //     type: String,
    //     enum: ['sell', 'exchange', 'donate']
    //   }
    // ],
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
        ref: 'SubCategory',
        required: [true, 'Product must be belong Atleast to one subcategory']
      }
    ]
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

productSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'product'
});

// Mongoose Query Middleware
productSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'category',
    select: 'name _id'
  }).populate({
    path: 'comments',
    select: 'comment user -product'
  });

  next();
});

module.exports = mongoose.model('Product', productSchema);
