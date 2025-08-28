// routes/review.js

const express = require("express");
const router = express.Router({ mergeParams: true });

const { isLoggedIn, isReviewAuthor, wrapAsync } = require("../middleware.js");
const reviewController = require("../controllers/reviews.js");

// Create Review Route
router.post("/", isLoggedIn, wrapAsync(reviewController.createReview));

// Delete Review Route
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(reviewController.destroyReview));

module.exports = router;