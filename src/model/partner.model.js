const mongoose = require("mongoose");

const partnerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  logo: {
    type: String,
    required: true,
  },
  siret: {
    type: String,
    required: false,
    default: "",
  },
  capital: {
    type: String,
    required: false,
  },
  address: {
    type: String,
    required: true,
  },
  email: {
    unique: true,
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  postalCode: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  website: {
    type: String,
    required: false,
    default: "",
  },
  users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
  ],
  campaigns: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "campaigns",
    },
  ],
  invoicesUrl: [{
    type: String,
    required: false,
    default: "",
  }],
  contractsUrl: [{
    type: String,
    required: false,
    default: "",
  }],
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

partnerSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("partners", partnerSchema);
