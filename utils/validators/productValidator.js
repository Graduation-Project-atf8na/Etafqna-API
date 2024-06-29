const slugify = require('slugify');
const { check, body } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');
const Category = require('../../models/categoryModel');
const SubCategory = require('../../models/subcategoryModel');
// const User = require('../../models/userModel');
const Product = require('../../models/productModel');

exports.createProductValidator = [
  check('name')
    .isLength({ min: 3 })
    .withMessage('must be at least 3 chars')
    .notEmpty()
    .withMessage('Product Name required')
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check('description')
    .notEmpty()
    .withMessage('Product description is required')
    .isLength({ min: 20 })
    .withMessage('Too short description')
    .isLength({ max: 2000 })
    .withMessage('Too long description'),

  check('price')
    .notEmpty()
    .withMessage('Product price is required')
    .isNumeric()
    .withMessage('Product price must be a number')
    .isLength({ max: 32 })
    .withMessage('To long price'),

  // check if imagecover is attached, **not working**
  // check('imageCover').notEmpty().withMessage('Product imageCover is required'),

  check('images')
    .optional()
    .isArray()
    .withMessage('images should be array of string'),

  check('category')
    .notEmpty()
    .withMessage('Product must be belong to a category')
    .isMongoId()
    .withMessage('Invalid ID formate')
    .custom((categoryId) =>
      Category.findById(categoryId).then((category) => {
        if (!category) {
          return Promise.reject(
            new Error(`No category for this id: ${categoryId}`)
          );
        }
      })
    ),

  check('subcategories')
    .notEmpty()
    .withMessage('Product must be belong to a subcategory')
    // .isMongoId()
    // .withMessage('Invalid ID formate For Testing')
    .custom((subcategoriesIds) =>
      SubCategory.find({
        _id: { $exists: true, $in: subcategoriesIds.split(',') }
      }).then((result) => {
        // console.log('result', result);
        const subCategoriesIdsInArr = [];
        subcategoriesIds.split(',').forEach((subCategory) => {
          subCategoriesIdsInArr.push(subCategory.toString());
        });

        // console.log('result.length', result.length);
        // console.log('subcategoriesIdsInArr', subCategoriesIdsInArr);
        // // console.log('subcategoriesIds.length', subcategoriesIds.length);
        // console.log(
        //   'subCategoriesIdsInArr.length',
        //   subCategoriesIdsInArr.length
        // );

        if (
          result.length < 1 ||
          result.length !== subCategoriesIdsInArr.length
        ) {
          return Promise.reject(new Error(`Invalid subcategories Ids`));
        }
      })
    )
    .custom((val, { req }) =>
      SubCategory.find({ category: req.body.category }).then(
        (subcategories) => {
          const subCategoriesIdsInDB = [];
          subcategories.forEach((subCategory) => {
            subCategoriesIdsInDB.push(subCategory._id.toString());
          });

          // check if subcategories ids in db include subcategories in req.body (true)
          // console.log('val', val);

          const subCategoriesIdsInBody = [];
          val.split(',').forEach((subCategory) => {
            subCategoriesIdsInBody.push(subCategory.toString());
          });

          // console.log('subCategoriesInBody', subCategoriesIdsInBody);
          // console.log('subCategoriesIdsInDB', subCategoriesIdsInDB);

          const checker = (target, arr) => target.every((v) => arr.includes(v));

          let notIncludedValues = [];
          notIncludedValues = subCategoriesIdsInBody.filter(
            (value) => !subCategoriesIdsInDB.includes(value)
          );

          if (!checker(subCategoriesIdsInBody, subCategoriesIdsInDB)) {
            return Promise.reject(
              new Error(
                `Subcategories: (${notIncludedValues}) not belong to This Category`
              )
            );
          }
        }
      )
    ),
  check('address')
    .notEmpty()
    .withMessage('Product address is required')
    .isString()
    .custom((val, { req }) => {
      req.body.location = {
        type: 'Point',
        coordinates: [req.body.lng, req.body.lat],
        address: val.address
      };
      return true;
    }),
  check('lng')
    .notEmpty()
    .withMessage('Product lng is required')
    .isNumeric()
    .withMessage('Product lng must be a number')
    .custom((val, { req }) => {
      req.body.location = {
        type: 'Point',
        coordinates: [val, req.body.lat],
        address: req.body.address
      };
      return true;
    }),
  check('lat')
    .notEmpty()
    .withMessage('Product lat is required')
    .isNumeric()
    .withMessage('Product lat must be a number')
    .custom((val, { req }) => {
      req.body.location = {
        type: 'Point',
        coordinates: [req.body.lng, val],
        address: req.body.address
      };
      return true;
    }),

  // put coordinates and address in location object
  //   check('location')
  //     .notEmpty()
  //     .withMessage('Product location is required')
  //     .isObject()
  //     .withMessage('Location must be an object')
  //     .custom((val, { req }) => {
  //       // val is the location object
  //       req.body.location = {
  //         type: 'Point',
  //         coordinates: [val.long.Map(Number), val.lat.Map(Number)], // convert to number
  //         address: val.address
  //       };
  //       return true;
  //     }),

  //   check('user')
  //     .notEmpty()
  //     .withMessage('Product must be belong to a user')
  //     .isMongoId()
  //     .withMessage('Invalid ID formate')
  //     .custom((userId, { req }) =>
  //       User.findById(userId).then((user) => {
  //         if (!user) {
  //           return Promise.reject(new Error(`No user for this id: ${userId}`));
  //         }
  //         req.body.user = user._id;
  //       })
  //     ),

  validatorMiddleware
];

exports.getProductValidator = [
  check('id')
    .isMongoId()
    .withMessage('Invalid ID formate')
    // checl if product exist
    .custom((val) =>
      Product.findById(val).then((product) => {
        if (!product) {
          return Promise.reject(new Error(`No product for this id: ${val}`));
        }
      })
    ),
  validatorMiddleware
];

exports.updateProductValidator = [
  check('id')
    .isMongoId()
    .withMessage('Invalid ID formate')
    // checl if product exist
    .custom((val) =>
      Product.findById(val).then((product) => {
        if (!product) {
          return Promise.reject(new Error(`No product for this id: ${val}`));
        }
      })
    )
    // check if user is the Owner of the product
    .custom(async (val, { req }) => {
      //   console.log('val', val);
      const product = await Product.findById(val);
      //   console.log('product', product);

      const ownerID = product.owner._id;

      if (ownerID.toString() !== req.user.id.toString()) {
        console.log('userID', ownerID);
        console.log('req.user.id', req.user.id);

        return Promise.reject(
          new Error('You are not allowed to update this product!')
        );
      }
      return true;
    }),

  body('name')
    .optional()
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),

  body('category')
    .optional()
    .notEmpty()
    .isMongoId()
    .withMessage('Invalid ID format')
    // check if category exist
    .custom((categoryId) =>
      Category.findById(categoryId).then((category) => {
        if (!category) {
          return Promise.reject(
            new Error(`No category for this id: ${categoryId}`)
          );
        }
      })
    ),

  body('subcategories')
    .optional()
    // .isMongoId()
    // .withMessage('Invalid ID formate For Testing')

    // check if subcategories exist
    .custom((subcategoriesIds) =>
      SubCategory.find({
        _id: { $exists: true, $in: subcategoriesIds.split(',') }
      }).then((result) => {
        // console.log('result', result);

        const subCategoriesIdsInArr = [];
        subcategoriesIds.split(',').forEach((subCategory) => {
          subCategoriesIdsInArr.push(subCategory.toString());
        });

        // get non existing subcategories ids
        // const notExistingValues = subCategoriesIdsInArr
        // console.log('notExistingValues', notExistingValues);

        if (
          result.length < 1 ||
          result.length !== subCategoriesIdsInArr.length
        ) {
          return Promise.reject(new Error(`Invalid subcategories Ids`));
        }
      })
    )
    // check if subcategories belong to category
    .custom((val, { req }) =>
      SubCategory.find({ category: req.body.category }).then(
        (subcategories) => {
          const subCategoriesIdsInDB = [];
          subcategories.forEach((subCategory) => {
            subCategoriesIdsInDB.push(subCategory._id.toString());
          });
          // console.log('subCategoriesIdsInDB', subCategoriesIdsInDB);

          // check if subcategories ids in db include subcategories in req.body (true)
          // console.log('val', val);

          const subCategoriesIdsInBody = [];
          val.split(',').forEach((subCategory) => {
            subCategoriesIdsInBody.push(subCategory.toString());
          });

          // console.log('subCategoriesInBody', subCategoriesIdsInBody);
          // console.log('subCategoriesIdsInDB', subCategoriesIdsInDB);

          const checker = (target, arr) => target.every((v) => arr.includes(v));

          let notIncludedValues = [];
          notIncludedValues = subCategoriesIdsInBody.filter(
            (value) => !subCategoriesIdsInDB.includes(value)
          );

          if (!checker(subCategoriesIdsInBody, subCategoriesIdsInDB)) {
            return Promise.reject(
              new Error(`${notIncludedValues} not belong to category`)
            );
          }
        }
      )
    ),
  check('address')
    .optional()
    .notEmpty()
    .withMessage('Product address is required')
    .isString()
    .custom((val, { req }) => {
      req.body.location = {
        type: 'Point',
        coordinates: [req.body.lng, req.body.lat],
        address: val
      };
      return true;
    }),
  check('lng')
    .optional()
    .notEmpty()
    .withMessage('Product lng is required')
    .isNumeric()
    .withMessage('Product lng must be a number')
    .custom((val, { req }) => {
      req.body.location = {
        type: 'Point',
        coordinates: [val, req.body.lat],
        address: req.body.address
      };
      return true;
    }),
  check('lat')
    .optional()
    .notEmpty()
    .withMessage('Product lat is required')
    .isNumeric()
    .withMessage('Product lat must be a number')
    .custom((val, { req }) => {
      req.body.location = {
        type: 'Point',
        coordinates: [req.body.lng, val],
        address: req.body.address
      };
      return true;
    }),

  validatorMiddleware
];

exports.deleteProductValidator = [
  check('id')
    .isMongoId()
    .withMessage('Invalid ID formate')
    // checl if product exist
    .custom((val) =>
      Product.findById(val).then((product) => {
        if (!product) {
          return Promise.reject(new Error(`No product for this id: ${val}`));
        }
      })
    )
    // check if user is the Owner of the product
    .custom(async (val, { req }) => {
      //   console.log('val', val);
      const product = await Product.findById(val);
      //   console.log('product', product);

      const ownerID = product.owner._id;
      // console.log('userID', userID);
      // console.log('req.user._id', req.user._id);
      // console.log('req.user.role', req.user.role);

      if (
        ownerID.toString() !== req.user._id.toString() &&
        req.user.role !== 'admin'
      ) {
        return Promise.reject(
          new Error('You are not allowed to delete this product!')
        );
      }
      return true;
    }),

  validatorMiddleware
];
