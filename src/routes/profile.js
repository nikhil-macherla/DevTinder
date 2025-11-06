const express = require('express');
const profileRouter = express.Router();
const { userAuth } = require("./middlewares/auth");
const { validateEditProfileData } = require("../utils/validation");

profileRouter.get("/profile/view", userAuth, async (req, res) =>
{
  // validate my cookie
  try {
    const user = req.user;
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

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    if (!validateEditProfileData(req))
      throw new Error("Invalid return request");
    // return res.status(400).send("Invalid edit request");
    const loggedInUser = req.user;
    // loggedInUser.firstName = req.body.firstName //bad writing learn this
    Object.keys(req.body).forEach((key) => (loggedInUser[key] = req.body[key]));
    console.log(loggedInUser); // updated data
    await loggedInUser.save();
    res.send(`${loggedInUser.firstName}, your Profile updated Successfully!`);
    // we can also write ike this
    //res.json({
    // message:`${loggedInUser.firstName}, your profile edited successfully`};
    // data : loggedInUser
    //});
  }
  catch (err)
  {
    res.status(400).send("ERROR:" + err.message);
  }
})

module.exports = profileRouter;