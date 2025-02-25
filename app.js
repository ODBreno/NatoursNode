const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");

const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");

const app = express();

// Middlewares
// Segurança HTTP
app.use(helmet());

// Body parser, lendo dados do body da requisição
app.use(express.json({limit: "10kb"}));

// Sanitização contra NoSQL Injection
app.use(mongoSanitize());

// Sanitização contra XSS
app.use(xss());

// Prevenção contra poluição de parâmetros HTTP
app.use(hpp({
  whitelist: [
    "duration",
    "ratingsQuantity",
    "ratingsAverage",
    "maxGroupSize",
    "difficulty",
    "price"
  ]
}));

// Serve arquivos estáticos
app.use(express.static(`${__dirname}/public`));

// Logger de requisições
if(process.env.NODE_ENV === "development"){
  app.use(morgan("dev"));
}

// Middleware para adicionar a data da requisição
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// Limitador de requisições
const limiter = rateLimit({
  max: 40,
  windowMs: 30 * 60 * 1000,
  message: "Muitas requisições a partir deste IP, tente novamente em meia hora."
});


app.use("/api", limiter);

// Rotas
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Não foi possível encontrar ${req.originalUrl} nesta rota`, 404));
});

app.use(globalErrorHandler);

module.exports = app;