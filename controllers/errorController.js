const AppError = require("../utils/appError");

const handleCastErrorDB = (err) => {
  const message = `${err.path} inválido: ${err.value}.`;
  return new AppError(message, 400);
};

const handleJWTExpiredError = () => new AppError("Token expirado. Faça login novamente!", 401);
const handleJWTError = () => new AppError("Token inválido. Faça login novamente!", 401);

const handleDuplicateFieldsDB = (err) => {
  const value = err.errorResponse.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Valor duplicado: ${value}, por favor, utilize outro valor.`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Dados inválidos: ${errors.join(". ")}`;
  return new AppError(message, 400);
}

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack 
  });
};

const sendErrorProduction = (err, res) => {
  // Erros operacionais, enviando mensagem para o cliente
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  // Erros de programação ou outros erros desconhecidos
  } else {
    // console.error("ERROR: ", err);
    res.status(500).json({
      status: "error",
      message: "Algo deu errado!"
    });
  }
}

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";
    // Enviando mensagem de erro diferente dependendo do ambiente
    if(process.env.NODE_ENV === "development") {
        sendErrorDev(err, res);
    } else if (process.env.NODE_ENV === "production") {
        let error = { ...err };
        // console.log(error.name); não sei porque, mas ao passar err descontruido para error, não passa o atributo name
        error.name = err.name;
        // console.log(error.name);
        if(error.name === "CastError") error = handleCastErrorDB(error);
        if(error.code === 11000) error = handleDuplicateFieldsDB(error);
        if(error.name === "ValidationError") error = handleValidationErrorDB(error);
        if(error.name === "JsonWebTokenError") error = handleJWTError();
        if(error.name === "TokenExpiredError") error = handleJWTExpiredError();
        sendErrorProduction(error, res);
    };
};