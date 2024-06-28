// validationMiddleware.js

const validateLocation = (req, res, next) => {
  const { location } = req.body;

  if (
    !location ||
    !location.coordinates ||
    !Array.isArray(location.coordinates) ||
    location.coordinates.length !== 2
  ) {
    return res.status(400).json({
      status: 'fail',
      message:
        "Invalid location: 'coordinates' array must contain exactly two numeric elements."
    });
  }

  // Validate that the coordinates are numbers and not strings
  // Convert the coordinates to numbers
  const [longitude, latitude] = location.coordinates.map(Number);

  //   console.log(longitude, latitude);
  //   console.log(typeof longitude, typeof latitude);
  if (typeof longitude !== 'number' || typeof latitude !== 'number') {
    return res.status(400).json({
      status: 'fail',
      message:
        "Invalid location: 'coordinates' array must contain numeric elements."
    });
  }

  next();
};

module.exports = validateLocation;
