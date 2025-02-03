const Tour = require("./../models/tourModel");

// const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`, "utf-8"));

// exports.checkId = (req, res, next, val) => {
//   console.log(`Tour id é: ${val}`);
//   if (req.params.id*1 > tours.length) {
//     return res.status(404).json({
//       status: "fail",
//       message: "ID não encontrado",
//     });
//   }
//   next();
// }

// exports.checkBody = (req, res, next) => {
//   console.log("Checando corpo da requisição...");
//   if (!req.body.name || !req.body.price) {
//     return res.status(400).json({
//       status: "fail", 
//       message: "Faltando nome ou preço",
//     });
//   }
//   next();
// }

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = "5";
  req.query.sort = "-ratingsAverage,price";
  req.query.fields = "name,price,ratingsAverage,summary,difficulty";
  next();
}

class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    // Montando a query
    const queryObj = { ...this.queryString };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach(el => delete queryObj[el]);
    
    // Filtragem
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, operator => `$${operator}`);

    this.query = this.query.find(JSON.parse(queryStr));
    // let query = Tour.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }

  limitFields() {
    // Limitando campos
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }
    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

exports.getAllTours = async (req, res) => {
  try{
    // // Montando a query
    // const queryObj = { ...req.query };
    // const excludedFields = ["page", "sort", "limit", "fields"];
    // excludedFields.forEach(el => delete queryObj[el]);
    // console.log(req.query, queryObj);
    
    // // Filtragem
    // let queryStr = JSON.stringify(queryObj);
    // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, operator => `$${operator}`);
    // let query = Tour.find(JSON.parse(queryStr));

    // Ordenação
    // if (req.query.sort) {
    //   const sortBy = req.query.sort.split(",").join(" ");
    //   query = query.sort(sortBy);
    // } else {
    //   query = query.sort("-createdAt");
    // }
    
    // Limitando campos
    // if (req.query.fields) {
    //   const fields = req.query.fields.split(",").join(" ");
    //   query = query.select(fields);
    // } else {
    //   query = query.select("-__v");
    // }

    // Paginação
    // const page = req.query.page * 1 || 1;
    // const limit = req.query.limit * 1 || 100;
    // const skip = (page - 1) * limit;
    // query = query.skip(skip).limit(limit);

    // if (req.query.page) {
    //   const numTours = await Tour.countDocuments();
    //   if (skip >= numTours) throw new Error("Esta página não existe");
    // }

    // Executando a query
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const tours = await features.query;

    // Enviando resposta
    res.status(200).json({
      status: "success",
      results: tours.length,
      data: {
        tours,
      },
    });
    } catch (err) {
      res.status(404).json({
        status: "fail",
        message: err
      });
    }
  };
  
exports.getTourById = async (req, res) => {
    try{
      const tour = await Tour.findById(req.params.id);
      res.status(200).json({
        status: "success",
        data: {
          tour,
        },
      });
    } catch (err) {
      res.status(404).json({
        status: "fail",
        message: err
      });
    }
  }
  
exports.createTour = async (req, res) => {
  try{
  const newTour = await Tour.create(req.body);

  res.status(201).json({
    status: "success",
    data: {
      tour: newTour,
    },
  });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: "Dados inválidos!",
    });
  }
}
  
exports.updateTour = async (req, res) => {
  try{
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      status: "success",
      data: {
        tour
      },
    });
  } catch(err) {
    res.status(404).json({
      status: "fail",
      message: err
    });
  }
};
  
exports.deleteTour = async (req, res) => {
  try{
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: "success",
      data: null
    });
  } catch(err) {
    res.status(404).json({
      status: "fail",
      message: err
    });
  }
};