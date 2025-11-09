const express = require('express');
const userRouter = express.Router();
const { userAuth } = require("./middlewares/auth");
const User = require('../models/user');
const connectionRequestModel = require('../models/connectionRequest');

const USER_SAFE_DATA = "firstName lastName photoUrl age gender";

// get all pending connection requests for the loggedin user
userRouter.get("/user/requests/received", userAuth, async (req, res) =>
{
  try {
    const loggedinUser = req.user;
    const connectionRequests = await connectionRequestModel.find({
      toUserId: loggedinUser._id,
      status: "intrested"
    }).populate("fromUserId", ["firstName", "lastName", "age", "gender"]); // i don't want data regarding connection requests
    // also populate data which is only needed. don't give all data to users in get request
    // in loopback also we have similar things while querying to get related data
    // like include keyword
    // this is one way - to connect collections
    // other way- i need to loop given connectionrequests data and do query on user model using id's - bad way


    return res.json({
      message: "Data fetched successfully",
      connectionRequests,
    });
  }
  catch (err)
  {
    res.status(400).send("ERROR: " + err.message);
  }
})

//people who accepted my requests
userRouter.get("/user/requests/connections", userAuth, async(req, res) =>
{
  try {
    const loggedinUser = req.user;
    const connectionRequests = await connectionRequestModel.find({
      $or: [
        { fromUserId: loggedinUser._id, status: "accepted" },
        { toUserId: loggedinUser._id, status: "accepted" }
      ]
    }).populate("fromUserId", USER_SAFE_DATA).populate("toUserId", USER_SAFE_DATA);

    // i got a bug here. read that
    // cannot compare two mongodb id's with === method
    const data = connectionRequests.map(row => {
      if (row.fromUserId._id.toString() === loggedinUser._id.toString()) {
        return row.toUserId;
      }
      return row.fromUserId
    });
    if (!connectionRequests) return res.json({ message: "No connections found" });
    return res.json({
      message: "All connections found",
      data
    });
  }

  catch (err) {
    res.status(400).send("Error :" + err.message);

  }

})

module.exports = userRouter;