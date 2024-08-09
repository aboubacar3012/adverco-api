const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["ADMIN", "PARTNER"],
    default: "PARTNER",
    required: true,
  },
  phone: {
    type: String,
    required: false,
    default: "",
  },
  email: {
    unique: true,
    type: String,
    required: true,
  },
  isFirstLogin: {
    type: Boolean,
    required: true,
    default: true,
  },
  hashedPassword: {
    type: String,
    required: false,
    default: "",
  },
  password: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    required: true,
    default: true,
  },
  partnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "partners",
    required: false,
    default: null,
  },
  createdAt: {
    default: Date.now,
    type: Date,
    required: true,
  },
  updatedAt: {
    default: Date.now,
    type: Date,
    required: true,
  },
});

// userSchema.set("toJSON", {
//   transform: (document, returnedObject) => {
//     returnedObject.id = returnedObject._id.toString();
//     delete returnedObject._id;
//     delete returnedObject.__v;
//   },
// });

module.exports = mongoose.model("users", userSchema);
