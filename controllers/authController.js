const jwt = require("jsonwebtoken");
const AppError = require("../utils/appError");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const sendEmail = require("../utils/email");
const crypto = require("crypto"); 

const signToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
}

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    
    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true,
    };

    if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

    res.cookie("jwt", token, cookieOptions); 
    // Só pra não retornar a senha no response, sem dar save não vai salvar no banco
    user.password = undefined;

    res.status(statusCode).json({
        status: "success",
        token,
        data: {
            user,
        },
    });
}

exports.signup = catchAsync( async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        role: req.body.role,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
    });
    
    createSendToken(newUser, 201, res);
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
    createSendToken(user, 200, res);
});

exports.protect = catchAsync( async (req, res, next) => {
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
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

    // Extremamente importante pra conseguir ver a role depois
    req.user = currentUser;
    next();
});

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError("Você não tem permissão para realizar esta ação.", 403));
        }
        next();
    }
}

exports.forgotPassword = catchAsync( async (req, res, next) => {
    // Procurar usuário com email fornecido
    const user = await User
        .findOne({email: req.body.email});
    
    if (!user) {
        return next(new AppError("Não existe usuário com este email.", 404));
    }

    // Gerar token aleatório
    const resetToken = user.createPasswordResetToken();
    await user.save({validateBeforeSave: false});

    const resetURL = `${req.protocol}://${req.get("host")}/api/v1/users/resetPassword/${resetToken}`;

    const message = `Esqueceu sua senha? Envie PATCH request com sua nova senha e confirmação para: ${resetURL}.
    \nSe você não esqueceu sua senha, por favor, ignore este email.`;	

    try{
        await sendEmail({
            email: user.email,
            subject: "Seu token de redefinição de senha (válido por 10 minutos)",
            message,
        });
    } catch(err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({validateBeforeSave: false});
        return next(new AppError("Houve um erro ao enviar o email. Tente novamente mais tarde!", 500));
    }
    res.status(200).json({
        status: "success",
        message: "Token enviado para email!",
    });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: {$gt: Date.now()},
    });

    if(!user) {
        return next(new AppError("Token inválido ou expirado.", 400));
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id).select("+password");
    console.log(user.name);
    if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
        return next(new AppError("Sua senha atual está incorreta.", 401));
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    createSendToken(user, 200, res);
});