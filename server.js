const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

const mongoose = require("mongoose");

const app = require("./app");
console.log(process.env);

const DB = process.env.DATABASE.replace("<PASSWORD>", process.env.DATABASE_PASSWORD);
mongoose.connect(DB).then(() => console.log("Conexão com o banco de dados estabelecida..."));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App rodando na porta ${port}...`);
});