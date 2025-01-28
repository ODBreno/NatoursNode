const mongoose = require("mongoose");
const tourSchema = new mongoose.Schema({
    name: {
      type: String,
      required: [true, "Um tour deve ter um nome"],
      unique: true
    },
    rating: {
      type: Number,
      default: 4.5,
    },
    price: {
      type: Number,
      required: [true, "Um tour deve ter um preço"],
    }
  });
  const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;