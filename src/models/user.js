const mongoose = require('mongoose');
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(   // newmongoose.Schema or only mongoose.Schema
  {
    firstName: {
      type: String,
      required: true,
      minLength: 4,
      maxLength: 50,
    },
    lastName: {
      type: String
    },
    emailId: {
      type: String,
      lowercase: true,
      required: true,
      unique: true,
      trime: true,
      validate(value)
      {
        if (!validator.isEmail(value))
        {
          throw new Error("Invalid email address:" + value);
        }
      }
    },
    password: {
      type: String,
      required: true
    },
    age: {
      type: Number,
      min : 18,
    },
    gender: {
      type: String,
      validate(value) {
        if (!["male", "female", "others"].includes(value))
        {
          throw new Error("Gender data is not valid");
        }
      },
    },
    photoUrl: {
      type: String,
      validate(value)
      {
        if (validator.isURL(value))
        {
          throw new Error("Invalid Photo URL address:" + value);
        }
      }
    },
    about: {
      type: String,
      default: "This is a default about of the user"
    },
    skills: {
      type:[String],
    }
  },
  {
    timestamps: true,
  }
);


// this aree schema methods
userSchema.methods.getJWT = async function () // don't write arrow function here it breaks
{
  const user = this; // this function has different implemnation in arrow function
  const token = await jwt.sign({ _id: user._id }, "DEV@Tinder123", {
    expiresIn: "7d"
  });

  return token;

  }

userSchema.methods.validatePassword = async function (passwordInputByUser)
{
  const user = this;
  const passwordHash = user.password;
  const isPasswordValid = await bcrypt.compare(passwordInputByUser, passwordHash);
  return isPasswordValid;
    }
const User = mongoose.model("User", userSchema); // pass modelName and Schema for the Model here

module.exports = User; // modelName should be capital