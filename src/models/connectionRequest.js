const mongoose = require('mongoose');

const connectionRequestSchema = new mongoose.Schema({
  fromUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", //reference to user colelction
    required: true
  },
  toUserId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User"
  },
  status: {
    type: String,
    required: true,
    enum: {
      values: ["ignored", "intrested", "accepted", "rejected"],// kind of schema validation . read about enum
      message: `{VALUE} is incorrect status type`
    }            // to restrict values we use enum
  },
  timestamps: true,
})

//ConnectionRequest.find({fromUserId, toUserId}) - query wil be fast
connectionRequestSchema.index({ fromUserId: 1 , toUserId: 1 }); // creating an compound index on fromUserId

// kind of hook
//every time a connection request instance is saved, it will be called
connectionRequestSchema.pre("save", function (next) {
  const connectionRequest = this;
  //check if my fromUserId, and toUserId are same
  if (connectionRequest.fromUserId.equals(connectionRequest.toUserId))
  {
    throw new Error("Cannot send Connection request to yourself");
  }
  next(); // this is needed since it's like a software
})

const connectionRequestModel = new mongoose.model("ConnectionRequest", connectionRequestSchema);

module.exports = connectionRequestModel;
// check necessarily need not be same
//i have done this while exporting did i have to import in similar way