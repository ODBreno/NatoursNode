const jwt = require("jsonwebtoken");
const AppError = require("../utils/appError");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");


const signToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
}

exports.signup = catchAsync( async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
    });
    
    const token = signToken(newUser._id);

    res.status(201).json({
        status: "success",
        token,
        data: {
            user: newUser,
        },
    });
});

exports.login = catchAsync( async (req, res, next) => {
    const {email, password} = req.body;
    if (!email || !password) {
        return next(new AppError("Por favor, informe seu email e senha!", 400));
    }
    
    const user = await User.findOne({email}).select("+password");
    
    if (!user || !await user.correctPassword(password, user.password)) {
        return next(new AppError("Email ou senha incorretos!", 401));
    }

    const token = signToken(user._id);

    res.status(200).json({
        status: "success",
        token,
    });
});

exports.protect = catchAsync( async (req, res, next) => {
    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
        return next(new AppError("Você não está logado! Por favor, faça login para obter acesso.", 401));
    }

    const decoded = await jwt.verify(token, process.env.JWT_SECRET);

    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return next(new AppError("O usuário que pertence a este token não existe mais.", 401));
    }

    if (currentUser.changePasswordAfter(decoded.iat)) {
        return next(new AppError("Senha alterada recentemente. Por favor, faça login novamente.", 401));
    }

    req.user = currentUser;
    next();
});