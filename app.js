const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const method_override = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const Review = require("./models/review.js");
const { listingSchema, reviewSchema } = require("./schema.js");

const listings = require("./routes/listing.js");

//set and use
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(method_override("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));
app.use("/listings", listings);

//Databse connection

main()
  .then((res) => {
    console.log("connection succefull");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}

// port coonection
const port = 8081;
app.listen(port, () => {
  console.log(`A port start with ${port}.`);
});

// Url
app.get("/", (req, res) => {
  res.send("This is a root");
});

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
app.post(
  "/listings/:id/reviews",
  validatReview,
  wrapAsync(async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(req.params.id);
    let newrev = new Review(req.body.review);

    listing.reviews.push(newrev);

    await newrev.save();
    await listing.save();

    console.log("new review saved");
    res.redirect(`/listings/${id}`);
  })
);

// Delete reviews Route
app.delete(
  "/listings/:id/reviews/:reviewId",
  wrapAsync(async (req, res) => {
    let { id, reviewId } = req.params;

    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/listings/${id}`);
  })
);

//
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page not found"));
});

// error handaling for the form validation
app.use((err, req, res, next) => {
  let { statuscode = 500, message = "something went wrong" } = err;
  res.status(statuscode).render("listings/error.ejs", { message });
});
