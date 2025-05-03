const mongoose = require('mongoose');
require('dotenv').config();

const url = process.env.MONGO_URI;

mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Database connected successfully');
})
.catch((error) => {
  console.error('❌ Database connection failed:', error.message);
});