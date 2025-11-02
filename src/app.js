const express = require('express');
const connectDB = require('./config/database');
const app = express(); // instance of express app
const User = require("./models/user");
const { validateSignUpData } = require("./utils/validation");
const bcrypt = require('bcrypt');
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

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

app.post("/signup", async (req, res) => {
  try{
    validateSignUpData(req);
    const { firstName, lastName, emailId, password } = req.body;
    //never trust req.body
    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User(
      {
        firstName, lastName, emailId, password: passwordHash
      });
    await user.save();
    res.send(("User added Successfully!"));
  }
  catch (err) {
    res.status(400).send("Error Saving the User:", err.message);
  }
});

app.post("/login", async (req, res) =>
{
  try {
    const { emailId, password } = req.body;
    if (!validator.isEmail(emailId)) throw new Error("do something");
    const user = await User.findOne({ emailId: emailId });
    if (!user) {
      throw new Error('Email is not present in DB');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (isPasswordValid) {
      const token = await jwt.sign({ _id: user, _id }, "DEV@Tinder");
      console.log(token);
      ///res.cookie("token", "ajahhajaja");
      res.cookie("token", token);

      res.send("Login Successful!!");
    }
    else {
      throw new Error("Passowrd is not correct");
    }
  } catch (err) {

  }
})


app.get("/profile", async (req, res) =>
{
  // validate my cookie
  try {
    const cookies = req.cookies;
    const { token } = req.cookies;
    if (!token)
    {
      throw new Error("Invalid token");
    }
    const decodedMessage = await jwt.verify(token, "DEV@Tinder");
    const { _id } = decodedMessage;

    const user = await User.findById(_id);
    if (!user)
    {
      throw new Error("Login again");
    }
    res.send(user);
    console.log(cookies);
    res.send("Reading cookie");
  }
  catch (err)
  {
    console.log(err);
    res.status(400).send("ERROR : " + err.message);
  }

})

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

