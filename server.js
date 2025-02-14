const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

process.on("uncaughtException", err => {
  console.log(err.name, err.message);
  console.log("UNCAUGHT EXCEPTION! Desconectando...");
  process.exit(1);
});

const mongoose = require("mongoose");
const app = require("./app");
// console.log(process.env);

const DB = process.env.DATABASE.replace("<PASSWORD>", process.env.DATABASE_PASSWORD);
mongoose.connect(DB).then(() => console.log("Conexão com o banco de dados estabelecida..."));

// Iniciando Servidor
const port = process.env.PORT || 3000;
const servidor = app.listen(port, () => {
  console.log(`App rodando na porta ${port}...`);
});

process.on("unhandledRejection", err => {
  console.log(err.name, err.message);
  console.log("UNHANDLED REJECTION! Desconectando...");
  servidor.close(() => {
    process.exit(1);
  });
});

