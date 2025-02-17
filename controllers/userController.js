const Tour = require("../models/tourModel");
const catchAsync = require("../utils/catchAsync");

exports.getAllUsers = catchAsync( async (req, res, next) => {
    const users = await User.find();
    res.status(200).json({
        status: "success",
        results: users.length,
        data: {
            users,
        },
    });
});
  
exports.getUserById = (req, res) => {
    res.status(500).json({
        status: "error",
        message: "Rota não implementada ainda...",
    });
}

exports.createUser = (req, res) => {
    res.status(500).json({
        status: "error",
        message: "Rota não implementada ainda...",
    });
}

exports.updateUser = (req, res) => {
    res.status(500).json({
        status: "error",
        message: "Rota não implementada ainda...",
    });
}

exports.deleteUser = (req, res) => {
    res.status(500).json({
        status: "error",
        message: "Rota não implementada ainda...",
    });
}