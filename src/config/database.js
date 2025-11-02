const mongoose = require('mongoose');

const connectDB = async () =>
{
  await mongoose.connect("mongodb+srv://nikhilcoding:nikhilcoding08@devtinder.jlmsqld.mongodb.net/devTinder");
}

// connectDB()
//   .then(() =>
//   {
//     console.log("Database connection established");
// })
// .catch((err) =>
// {
//   console.error("Database cannot be connected");

// })

module.exports = connectDB;
