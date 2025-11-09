const express = require('express');
const connectDB = require('./config/database');
const app = express(); // instance of express app
const User = require("./models/user");
// const { validateSignUpData } = require("./utils/validation");
const bcrypt = require('bcrypt');
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { userAuth } = require("./middlewares/auth");

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/requests");
const userRouter = require('./routes/user');

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);

// // app.use((req, res) => // , so even if i do /test, /hello response wil be coming from here
// // {
// //   res.send("hello from the server!");
// // })

// // this will only handle GET call to /user
// app.get("/user", (req, res) => {
//   res.send(
//     {
//       firstname: 'nikhil',
//       lastname: 'Macherla'
//     })
// });


// // this will match all the http methods api calls to /test
// app.use("/test", (req, res)=>
// {
//   res.send("test test");
// })

// app.use("/hello", (req, res)=>
// {
//   res.send("hello");
// })

// // order of routes does matter



// first connect to db and then start server
// there may be a case where server is started but db connection failed.
// to avoid that folllow  this process





app.use(express.json()); // middleware to convert readbale stream to json
app.use(cookieParser());








app.get("/feed", async (req, res) =>
{

  try {
    const users = await User.find({});
    res.send(users);
  }
  catch (err)
  {
    res.status(404).send("something went wrong!");
  }

})

app.delete("/user", async (req, res) =>
{
  const userId = req.body.userId;
  try {
    const user = await User.findByIdAndDelete(userId);
    res.send("User Deleted Successfully");
  }
  catch (err) {
  res.status(404).send("something went wrong!");
  }

})

app.patch("/user/:userId", async (req, res) => {
  //const userId = req.body.userId;
  const userId = req.params?.userId;
  const data = req.body;
  try {
     const ALLOWED_UPDATES = [
    "photoUrl", "about", "gender", "age", "userId", "age", "skills"
  ];

  const isUpdateAllowed = Object.keys(data).every((k) => ALLOWED_UPDATES.includes(k));
    if (!isUpdateAllowed) res.status(400).send("Update not allowed");
    const user = await User.findByIdAndUpdate({ _id: userId }, data, {
      returnDocument: "after",
      runValidators: true
    });
    console.log(user);
    res.send("User Updated Successfully");
  } catch (error) {
    res.status(400).send("UPDATE FAILED:"+ err.message);
  }
});




connectDB()
  .then(() =>
  {
    console.log("Database connection established");
    app.listen(3000, () =>
{
  console.log("server is listening on port 3000");
});
})
.catch((err) =>
{
  console.error("Database cannot be connected");

})

