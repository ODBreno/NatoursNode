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
    }
});

userSchema.pre("save", async function(next) {
    // Só executa se a senha foi modificada
    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
    next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;