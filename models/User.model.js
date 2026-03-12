const mongoose = require("mongoose")

const userSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,   // prevents case mismatch
      trim: true,
      index: true,       // ⚡ VERY IMPORTANT → fast login
    },

    password: {
      type: String,
      required: true,
      select: false,     // 🔐 hide password by default
    },

    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model("User", userSchema)