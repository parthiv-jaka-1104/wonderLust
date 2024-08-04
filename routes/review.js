const express = require("express");
const router = express.Router({mergeParams:true});
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const { reviewSchema } = require("../schema.js");
const Reivew=require("../models/review.js")
const ExpressError = require("../utils/ExpressError.js");

const validatReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    console.log(error);
    throw new ExpressError(400, error);
  } else {
    next();
  }
};

// review route
router.post(
  "/",
  validatReview,
  wrapAsync(async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(req.params.id);
    let newrev = new Reivew(req.body.review);

    listing.reviews.push(newrev);

    await newrev.save();
    await listing.save();
    req.flash("parthiv","new review saved");

    console.log("new review saved");
    res.redirect(`/listings/${id}`);
  })
);

// Delete reviews Route
router.delete(
  "/:reviewId",
  wrapAsync(async (req, res) => {
    let { id, reviewId } = req.params;

    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Reivew.findByIdAndDelete(reviewId);

    req.flash("parthiv","Review Deleted");

    res.redirect(`/listings/${id}`);
  })
);


module.exports=router;