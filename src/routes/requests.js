const express = require('express');
const requestRouter = express.Router();
const { userAuth } = require("./middlewares/auth");
const connectionRequestModel = require('../models/connectionRequest');
const User = require('../models/user');


//can i use same api for intrested and ignored? can i make it dynamic?
// this api is for intrested or ignored.//validate the data
// corner case- same user sending request to same user
requestRouter.post("/request/send/:status/:toUserId", userAuth, async (req, res) => {
  try {
    const fromUserId = req.user._id;
    const toUserId = req.params.toUserId;
    const status = req.params.status;
    const allowedStatus = ["ignored", "interested"];
    if (!allowedStatus.includes(status))
    {
      return res.status(400).json({
        message: "Invalid status type" + status
      })
    }

    const toUser = await User.findById(toUserId);
    if (!toUser) { // User should be present to send connection request
      return res.status(404).json({
        message: "User not found"
      });
    }

    // if there is an existing connection request don't send again
    // my query will be slow if there are lot of data like one million records in connectionRequest model
    const existingConnectionRequest = await connectionRequestModel.findOne({
      $or: [
        { fromUserId, toUserId },
        { fromUserId: toUserId, toUserId: fromUserId } // create a compund index for this
      ]
    });

    if (existingConnectionRequest)
    {
      return res.status(400).send({
        message: "Connection Requesr Already Exists!!"
      });
    }
    const connectionRequest = new connectionRequestModel({
      fromUserId,
      toUserId,
      status
    })
    const data = await connectionRequest.save();

    console.log("sending connection request");
    res.json({
      message: req.user.firstName + " is"+ status + "in"+ toUser.firstName,
      data
    });
  }
  catch (err) {
    res.status(400).send("ERROR:" + err.message);
  }
});

module.exports = requestRouter;