const Tour = require("../models/tourModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const User = require("../models/userModel");

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach( el => {
        if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
}

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

exports.updateMe = catchAsync( async (req, res, next) => {
    if (req.body.password || req.body.passwordConfirm) {
        return next(new AppError("Esta rota não é para atualização de senha. Por favor, utilize /updateMyPassword.", 400));
    }

    // Atualizando o usuário
    const filteredBody = filterObj(req.body, "name", "email");
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({
        status: "success",
        data: {
            user: updatedUser
        },
    });
});

exports.deleteMe = catchAsync( async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, {active: false});

    res.status(204).json({
        status: "success",
        data: null,
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