const express = require("express");
const morgan = require("morgan");
const fs = require("fs");

const app = express();

app.use(express.json());
app.use(morgan("dev"));

const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`, "utf-8"));
console.log(tours);

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

const getAllTours = (req, res) => {
  console.log(req.requestTime);
  res.status(200).json({
      status: "success",
      results: tours.length,
      data: {
        tours,
      },
    });
};

const getTourById = (req, res) => {
  console.log(req.params);
  const id = req.params.id * 1;
  const tour = tours.find(el => el.id === id);

  if (!tour) {
    return res.status(404).json({
      status: "fail",
      message: "ID não encontrado",
    });
  }

  res.status(200).json({
    status: "success",
    data: {
      tour,
    },
  });
}

const createTour = (req, res) => {
  //console.log(req.body);
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId}, req.body);

  tours.push(newTour);
  fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {
     res.status(201).json({
       status: "success",
       data: {
         tour: newTour,
       },
     });
  })
}

const updateTour = (req, res) => {
  if (req.params.id*1 > tours.length) {
    return res.status(404).json({
      status: "fail",
      message: "ID não encontrado",
    });
  }
  res.status(200).json({
    status: "success",
    data: {
      tour: "<Tour atualizado aqui...>",
    },
  });
};

const deleteTour = (req, res) => {
  if (req.params.id*1 > tours.length) {
    return res.status(404).json({
      status: "fail",
      message: "ID não encontrado",
    });
  }
  res.status(204).json({
    status: "success",
    data: null
  });
};

const getAllUsers = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "Rota não implementada ainda...",
  });
}

const getUserById = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "Rota não implementada ainda...",
  });
}

const createUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "Rota não implementada ainda...",
  });
}

const updateUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "Rota não implementada ainda...",
  });
}

const deleteUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "Rota não implementada ainda...",
  });
}


// app.get("/api/v1/tours", getAllTours);
// app.get("/api/v1/tours/:id", getTourByUser);
// app.post("/api/v1/tours", createTour);
// app.patch("/api/v1/tours/:id", updateTour);
// app.delete("/api/v1/tours/:id", deleteTour);

app.route("/api/v1/tours").get(getAllTours).post(createTour);

app.route("/api/v1/tours/:id").get(getTourById).patch(updateTour).delete(deleteTour);

app.route("/api/v1/users").get(getAllUsers).post(createUser);

app.route("/api/v1/users/:id").get(getUserById).patch(updateUser).delete(deleteUser);

const port = 3000;
app.listen(port, () => {
  console.log(`App rodando na porta ${port}...`);
});