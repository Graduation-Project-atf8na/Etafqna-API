class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
    excludedFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v'); // Exclude __v field
    }

    return this;
  }

  search(modelName) {
    if (this.queryString.search) {
      let searchQuery = {};

      if (modelName === 'Product') {
        searchQuery.$or = [
          { name: { $regex: this.queryString.search, $options: 'i' } },
          { description: { $regex: this.queryString.search, $options: 'i' } }
        ];
      } else {
        searchQuery = {
          $or: [
            { name: { $regex: this.queryString.search, $options: 'i' } }
            // Add more fields to search as needed
          ]
        };
      }

      this.query = this.query.find(searchQuery);
    }

    return this; // Return the modified APIFeatures object for chaining
  }

  paginate(countDocuments) {
    const page = this.queryString.page * 1 || 1; // Convert string to number
    const limit = this.queryString.limit * 1 || 50;
    const skip = (page - 1) * limit;
    //-------------------------------------------
    const endPageIndex = page * limit; // index of last product in current page

    // Pagination Results
    const pagination = {};
    pagination.currentPage = page;
    pagination.docPerPage = limit;
    pagination.numberOfPages = Math.ceil(countDocuments / limit);

    // next page
    if (endPageIndex < countDocuments) {
      pagination.nextPage = page + 1;
    }

    // Prev page
    if (skip > 0) {
      pagination.prevPage = page - 1;
    }
    //--------------------------------------------

    this.query = this.query.skip(skip).limit(limit);
    this.paginationRes = pagination;

    return this;
  }
}

module.exports = APIFeatures;
