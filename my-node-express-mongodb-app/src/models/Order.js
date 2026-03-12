const mongoose = require("mongoose");

// Embedded schema for each item inside an order.
const itemSchema = new mongoose.Schema(
  {
    clothing: {
      type: String,
      trim: true,
      default: "Item",
    },
    fabric: {
      type: String,
      trim: true,
      default: "Fabric",
    },
    quantity: {
      type: Number,
      min: 1,
      default: 1,
    },
    price: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  { _id: false },
);

// Main order schema storing customer details, measurements, items, totals, and status.
const orderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      default: "",
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    instructions: {
      type: String,
      trim: true,
      default: "",
    },
    items: {
      type: [itemSchema],
      default: [],
    },
    measurements: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    clothing: {
      type: String,
      trim: true,
      default: "",
    },
    fabric: {
      type: String,
      trim: true,
      default: "",
    },
    total: {
      type: Number,
      min: 0,
      default: 0,
    },
    status: {
      type: String,
      enum: ["Pending", "Completed"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Export the Order model used by the controllers for all CRUD operations.
module.exports = mongoose.model("Order", orderSchema);
