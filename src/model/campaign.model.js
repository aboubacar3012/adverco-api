const mongoose = require("mongoose");

const CampaignDataSchema = new mongoose.Schema({
  vehicleId: {
    type: String,
    required: true,
  },
  startDate: {
    type: String,
    required: true,
  },
  endDate: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  latitude: {
    type: String,
    default: "0",
    required: true,
  },
  longitude: {
    type: String,
    default: "0",
    required: true,
  },
  duration: {
    type: String,
    required: true,
  },
  distance: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
});

const reportSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  link: {
    type: String,
    required: true,
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



const campaignSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["PREPARATION", "INPROGRESS", "FINISHED", "ARCHIVED"],
    default: "INPROGRESS",
    required: true,
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "clients",
    required: true,
  },
  objective: {
    type: String,
    required: true,
  },
  tool: {
    type: String,
    required: true,
  },
  startDate: {
    type: String,
    required: true,
  },
  endDate: {
    type: String,
    required: true,
  },
  budget: {
    type: Number,
    required: true,
  },
  zones: [{
    type: String,
    required: true,
  }],
  numberOfTrucks: {
    type: Number,
    required: true,
  },
  numberOfFaces: {
    type: Number,
    required: true
  },
  data: [CampaignDataSchema],
  report: reportSchema,
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

// campaignSchema.set("toJSON", {
//   transform: (document, returnedObject) => {
//     returnedObject.id = returnedObject._id.toString();
//     delete returnedObject._id;
//     delete returnedObject.__v;
//   },
// });

module.exports = mongoose.model("campaigns", campaignSchema);
