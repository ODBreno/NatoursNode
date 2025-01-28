const fs = require("fs");

const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`, "utf-8"));

exports.checkId = (req, res, next, val) => {
  console.log(`Tour id é: ${val}`);
  if (req.params.id*1 > tours.length) {
    return res.status(404).json({
      status: "fail",
      message: "ID não encontrado",
    });
  }
  next();
}

exports.checkBody = (req, res, next) => {
  console.log("Checando corpo da requisição...");
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: "fail",
      message: "Faltando nome ou preço",
    });
  }
  next();
}

exports.getAllTours = (req, res) => {
    console.log(req.requestTime);
    res.status(200).json({
        status: "success",
        results: tours.length,
        data: {
          tours,
        },
      });
  };
  
exports.getTourById = (req, res) => {
    console.log(req.params);
    const id = req.params.id * 1;
    const tour = tours.find(el => el.id === id);
  
    res.status(200).json({
      status: "success",
      data: {
        tour,
      },
    });
  }
  
  exports.createTour = (req, res) => {
    //console.log(req.body);
    const newId = tours[tours.length - 1].id + 1;
    const newTour = Object.assign({ id: newId}, req.body);
  
    tours.push(newTour);
    fs.writeFile(`${__dirname}/../dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {
       res.status(201).json({
         status: "success",
         data: {
           tour: newTour,
         },
       });
    })
  }
  
  exports.updateTour = (req, res) => {
    res.status(200).json({
      status: "success",
      data: {
        tour: "<Tour atualizado aqui...>",
      },
    });
  };
  
  exports.deleteTour = (req, res) => {
    res.status(204).json({
      status: "success",
      data: null
    });
  };