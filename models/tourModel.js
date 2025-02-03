const mongoose = require("mongoose");
const tourSchema = new mongoose.Schema({
    name: {
      type: String,
      required: [true, "Um tour deve ter um nome"],
      unique: true
    },
    duration: {
      type: Number,
      required: [true, "Um tour deve ter uma duração"]
    },
    maxGroupSize: {
      type: Number,
      required: [true, "Um tour deve ter um tamanho de grupo máximo"],
    }, 
    ratingsAverage: {
      type: Number,
      default: 4.5,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    difficulty: {
      type: String,
      required: [true, "Um tour deve ter uma dificuldade"],
    },
    price: {
      type: Number,
      required: [true, "Um tour deve ter um preço"],
    },
    priceDiscount: Number,
    summary: {
      type: String,
      trim: true,
      required: [true, "Um tour deve ter um resumo"]
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, "Um tour deve ter uma imagem de capa"]
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false
    },
    startDates: [Date],
  });
  const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;