const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

// name, email, photo, password, passwordConfirm
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Por favor, informe seu nome"]	
    },
    email: {
        type: String,
        required: [true, "Por favor, informe seu email"],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, "Por favor, informe um email válido"]
    },
    photo: String,
    password: {
        type: String,
        required: [true, "Por favor, informe uma senha"],
        minlenght: 8,
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, "Por favor, confirme sua senha"],
        validate: {
            validator: function(val) {
                return val === this.password;
            },
            message: "As senhas não são iguais"
        }
    },
    passwordChangedAt: Date
});

userSchema.pre("save", async function(next) {
    // Só executa se a senha foi modificada
    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
    next();
});

userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
}

userSchema.methods.changePasswordAfter = function(JWTTimestamp) {
    if (this.passwordChangedAt) {
        // Dividindo por 1000 porque passwordChangedAt é em milisegundos e JWTTimestamp em segundos
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return JWTTimestamp < changedTimestamp;
    }
    return false;
}

const User = mongoose.model("User", userSchema);

module.exports = User;