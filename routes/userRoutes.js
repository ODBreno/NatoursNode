const express = require("express");
const userController = require("./../controllers/userController");
const authController = require("./../controllers/authController");

const router = express.Router();

router.route("/signup").post(authController.signup);
router.route("/login").post(authController.login);
router.route("/forgotPassword").post(authController.forgotPassword);
router.route("/resetPassword/:token").patch(authController.resetPassword);
router.route("/updateMe").patch(authController.protect, userController.updateMe);
router.route("/deleteMe").delete(authController.protect, userController.deleteMe);

router.patch("/updateMyPassword", authController.protect, authController.updatePassword);

router.route("/").get(userController.getAllUsers).post(userController.createUser);
router.route("/:id").get(userController.getUserById).patch(userController.updateUser).delete(userController.deleteUser);


module.exports = router; 