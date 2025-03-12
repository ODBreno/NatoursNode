const mongoose = require("mongoose");
const fs = require("fs");
const dotenv = require("dotenv");
const Tour = require("../../models/tourModel");


dotenv.config({ path: "./config.env" });

const DB = process.env.DATABASE.replace("<PASSWORD>", process.env.DATABASE_PASSWORD);

mongoose.connect(DB).then(() => console.log("Conexão com o banco de dados estabelecida..."));

// Lendo arquivo JSON
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, "utf-8"));

// Importando dados para o banco de dados
const importData = async () => {
    try{
        await Tour.create(tours);
        console.log("Dados importados com sucesso...");
    } catch(err) {
        console.log(err);
    }
    process.exit();
}

// Deletando todos os dados do banco de dados
const deleteData = async () => {
    try{
        await Tour.deleteMany();
        console.log("Dados deletados com sucesso...");
    } catch(err) {
        console.log(err);
    }
    process.exit();
}

//console.log(process.argv);
if (process.argv[2] === "--import") {
    importData();
} else if (process.argv[2] === "--delete") {
    deleteData();
}
