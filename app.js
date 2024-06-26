const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const authRouter = require('./routes/authRoutes');
const userRouter = require('./routes/userRoutes');
const categoryRouter = require('./routes/categoryRoutes');
const subcategoryRouter = require('./routes/subcategoryRoutes');
const productRouter = require('./routes/productRoutes');

const app = express();
//app.set('trust proxy', 3); // Trust first 3 proxies (for Heroku)

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Enable CORS
app.use(cors());
// for preflight requests {Put, Patch, Update, Delete}
app.options('*', cors());

// Set security HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: false
  })
);

// Limit requests from same IP
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 3000, // start blocking after 3000 requests
  message: 'Too many requests from this IP, please try again in an hour!',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false // Disable the `X-RateLimit-*` headers
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'name',
      'email',
      'phone',
      'address',
      'category',
      'subcategory',
      'product',
      'comment',
      'rating',
      'createdAt',
      'updatedAt'
    ]
  })
);

// ROUTES
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/categories', categoryRouter);
app.use('/api/v1/subcategories', subcategoryRouter);
app.use('/api/v1/products', productRouter);

// Test Route
app.get('/api/v1/test', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Test Route'
  });
});

// Root Route
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Welcome to Etafqna API'
  });
});

// ERROR HANDLING MIDDLEWARE
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
