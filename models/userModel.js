const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

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
    role: {
        type: String,
        default: "user",
        enum: ["user", "guide", "lead-guide", "admin"],
        // default: "user"
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
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    }
});

userSchema.pre("save", async function(next) {
    // Só executa se a senha foi modificada
    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
    next();
});

userSchema.pre("save", function(next) {
    if (!this.isModified("password") || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 1000;
    next();
});

userSchema.pre(/^find/, function(next) {
    this.find({active: {$ne: false}});
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

userSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString("hex");
    this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    return resetToken;
}

const User = mongoose.model("User", userSchema);

module.exports = User;