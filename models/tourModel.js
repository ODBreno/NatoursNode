const mongoose = require("mongoose");
const slugify = require("slugify");
const validator = require("validator");
const { stackTraceLimit } = require("../utils/appError");

const tourSchema = new mongoose.Schema({
    name: {
      type: String,
      required: [true, "Um tour deve ter um nome"],
      unique: true,
      maxlenght: [40, "Um nome de tour deve ter no máximo 40 caracteres"],
      minlenght: [6, "Um nome de tour deve ter no mínimo 10 caracteres"],
      // validate: [validator.isAlpha, "O nome do tour deve conter apenas letras"] não deu certo, não aceita espaços
    },
    slug: String,
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
      min: [1, "A avaliação deve ser maior ou igual a 1.0"],
      max: [5, "A avaliação deve ser menor ou igual a 5.0"],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    difficulty: {
      type: String,
      required: [true, "Um tour deve ter uma dificuldade"],
      enum: {
        values: ["easy", "medium", "difficult"],
        message: "Dificuldade deve ser fácil (easy), média (medium) ou difícil (difficult)"
      }
    },
    price: {
      type: Number,
      required: [true, "Um tour deve ter um preço"],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function(val) {
          // this só funciona para novo documento, não para atualização
          return val < this.price;
        },
        message: "Desconto ({VALUE}) deve ser menor que o preço"
      }
    },
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
    secretTour: {
      type: Boolean,
      default: false
    },
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: "Point",
        enum: ["Point"]
      },
      coordinates: [Number],
      address: String,
      description: String
    },
    locations: [
      {
        type: {
          type: String,
          default: "Point",
          enum: ["Point"]
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
      }
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  },
);

tourSchema.virtual("durationWeeks").get(function() {
  return this.duration / 7;
});

// DOCUMENT MIDDLEWARE: runs before .save() and .create()
tourSchema.pre("save", function(next){
  this.slug = slugify(this.name, { lower: true });
  next();
});

// tourSchema.pre("save", function(next){
//   console.log("Will save document...");
//   next();
// });

// tourSchema.post("save", function(doc, next){
//   console.log(doc);
//   next();
// });

// QUERY MIDDLEWARE
tourSchema.pre(/^find/, function(next){
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function(docs, next){
  console.log(`Query levou ${Date.now() - this.start} milisegundos`);
  next();
});

// AGGREGATION MIDDLEWARE
tourSchema.pre("aggregate", function(next){
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  console.log(this.pipeline());
  next();
});

const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;