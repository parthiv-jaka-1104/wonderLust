const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema } = require("../schema.js");

// const method_override = require("method-override");
// router.use(method_override("_method"));

const validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    console.log(error);
    throw new ExpressError(400, error);
  } else {
    next();
  }
};

// Index Route
router.get(
  "/",
  wrapAsync(async (req, res) => {
    let allData = await Listing.find({});
    res.render("listings/index.ejs", { allData });
  })
);

// new add item route
router.get("/new", (req, res) => {
  res.render("listings/new.ejs");
});

// Show route
router.get(
  "/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listings = await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs", { listings });
  })
);

// add items
router.post(
  "/",
  validateListing,
  wrapAsync(async (req, res, next) => {
    const newlisting = new Listing(req.body.listing);
    await newlisting.save();
    req.flash("parthiv","new Item added");
    res.redirect("/listings");
  })
);

// edit iteam
router.get(
  "/:id/edit",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listings = await Listing.findById(id);
    res.render("listings/edit.ejs", { listings });
  })
);

// update route
router.put(
  "/:id",
  validateListing,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, {
      ...req.body.listing,
    });
    req.flash("parthiv","Item Updated");
    res.redirect(`/listings/${id}`);
  })
);

// delete route
router.delete(
  " /:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    console.log(id);
    let value = await Listing.findByIdAndDelete(id);
    // req.flash("parthiv","Item id Deleted");
    res.redirect("");
  })
);

module.exports = router;
