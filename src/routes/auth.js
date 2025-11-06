const express = require("express");
const authRouter = express.Router();
const bcrypt = require("bcrypt");
const { validateSignUpData } = require("../utils/validation"); //understand . and ..
const User = require("../models/user");
const { userAuth } = require("../middlewares/auth");

authRouter.post("/signup", async (req, res) => {
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

authRouter.post("/login", async (req, res) =>
{
  try {
    const { emailId, password } = req.body;
    if (!validator.isEmail(emailId)) throw new Error("do something");
    const user = await User.findOne({ emailId: emailId });
    if (!user) {
      throw new Error('Email is not present in DB');
    }
    const isPasswordValid = await user.validatePassword(password);
     if (isPasswordValid) {
    //   const token = await jwt.sign({ _id: user, _id }, "DEV@Tinder", {
    //     expiresIn:"1d",});

    const token = await user.getJWT();
      console.log(token);
      ///res.cookie("token", "ajahhajaja");
      //res.cookie("token", token); // you can expire cookies read express docs
      res.cookie("token", token, {
        expires: new Date(Date.now() + 8 * 3600000),
      });
      res.send("Login Successful!!");
    }
    else {
      throw new Error("Passowrd is not correct");
    }
  } catch (err) {

  }
})

authRouter.post("/logout", userAuth, async (req, res) =>
{
  // doesn't matter if he is logged in or not
  //just expire the cookie
  // check if it is hitting auth middleware- homework
  res.cookie("token", null, {
    expires: new Date(Date.now()),
  });
  res.statusCode(200).send("Logout Successful");
})

module.exports = authRouter;