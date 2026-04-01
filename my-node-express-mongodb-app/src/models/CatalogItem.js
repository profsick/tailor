const mongoose = require("mongoose");

const catalogItemSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["clothing", "fabric"],
      required: true,
      index: true,
    },
    name: {
      type: String,
      trim: true,
      default: "",
    },
    image: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

module.exports = mongoose.model("CatalogItem", catalogItemSchema);
