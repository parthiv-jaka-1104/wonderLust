const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const method_override = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema} = require("./schema.js");

//set and use
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(method_override("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

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
app.get(
  "/listings",
  wrapAsync(async (req, res) => {
    let allData = await Listing.find({});
    res.render("listings/index.ejs", { allData });
  })
);

// new add item route
app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});

// add items
app.post(
  "/listings",
  validateListing,
  wrapAsync(async (req, res, next) => {
    const newlisting = new Listing(req.body.listing);
    await newlisting.save();
    res.redirect("/listings");
  })
);

// Show route
app.get(
  "/listings/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listings = await Listing.findById(id);
    res.render("listings/show.ejs", { listings });
  })
);

// edit iteam
app.get(
  "/listings/:id/edit",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listings = await Listing.findById(id);
    res.render("listings/edit.ejs", { listings });
  })
);

// update route
app.put(
  "/listings/:id",
  validateListing,
  wrapAsync(async (req, res) => {
    if (!req.body.listings) {
      throw new ExpressError(400, "Please valid provide data");
    }
    let { id } = req.params;
    const listings = await Listing.findByIdAndUpdate(id, {
      ...req.body.listings,
    });
    res.redirect(`/listings/${id}`);
  })
);

// delete route
app.delete(
  "/listings/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const value = await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
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
