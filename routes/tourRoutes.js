const express = require("express");
const tourController = require("./../controllers/tourController");
authController = require("./../controllers/authController");

const router = express.Router();

// router.param("id", tourController.checkId);

router.route("/").get(authController.protect, tourController.getAllTours).post(tourController.createTour);
router.route("/tours-stats").get(tourController.getTourStats);
router.route("/monthly-plan/:year").get(tourController.getMonthlyPlan);
router.route("/top-5-cheap").get(tourController.aliasTopTours, tourController.getAllTours);
router.route("/:id")
    .get(tourController.getTourById)
    .patch(tourController.updateTour)
    .delete(authController.protect, authController.restrictTo("admin", "lead-guide"), tourController.deleteTour);

module.exports = router;