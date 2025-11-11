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
userRouter.get("/user/connections", userAuth, async(req, res) =>
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

userRouter.get("/feed", userAuth, async (req, res) =>
{
  try
  {
    /// user should see all the user cards except
    // 0. his own card
    // 1. his connections
    // 2. ignored people
    // 3. already sent the connection request.
    const loggedInUser = req.user;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    limit = limit > 50 ? 50 : limit; // to sanitize the data..atatcker limit as 1 lakh - mongod server goes down since it will be an expensive call
    const skip = (page - 1) * limit;

    // learnt difference between req.parms and req.query
    // /skip:/params - etc
    //find all connection requests (sent + received)
    const connectionRequests = await connectionRequestModel.find(
      {
        $or: [
          { fromUserId: loggedInUser._id },
          { toUserId: loggedInUser._id }
        ]
      }
    ).select("fromUserId toUserId");
      // .populate("fromUserId", "firstName")
    // .populate("toUserId", "firstName");


    const hideUsersFromFeed = new Set(); // to find unique people
    connectionRequests.forEach(req => {
      hideUsersFromFeed.add(req.fromUserId.toString());
      hideUsersFromFeed.add(req.toUserId.toString());
    })

    // console.log(hideUsersFromFeed);

    // can i use object destructuring instead of Array.from() - please check nikki

    const feedData = await User.find({
      $and: [
        { _id: { $nin: Array.from(hideUsersFromFeed) } },
        { _id: { $ne: loggedInUser._id } } // i don't think this is needed. please check nikki
      ],
    }).select(USER_SAFE_DATA).skip(skip).limit(limit);
    // console.log(feedData);
    // add pagination - you don't want to send all existing users to newly signed up user.
    // send only 10 maybeee
    //  res.send(connectionRequests);

    res.send(feedData);

  }
  catch (err)
  {
    res.status(400).json({ message: err.message });
  }
})

module.exports = userRouter;