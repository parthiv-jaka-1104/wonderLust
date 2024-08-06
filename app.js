const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const method_override = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const flash = require("connect-flash");

const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");



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

//set and use
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(method_override("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

// port coonection
const port = 8080;
app.listen(port, () => {
  console.log(`A port start with ${port}.`);
});

//session
const sessionOptions = {
  secret: "mysupersecreatString",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    // httpOnly: true,
  },
};

// Url
app.get("/", (req, res) => {
  res.send("This is a root");
});

app.use(session(sessionOptions));
app.use(flash());

app.use((req, res, next) => {
  res.locals.parthiv = req.flash("parthiv");
  next();
});

app.use("/listings", listings);
app.use("/listings/:id/reviews", reviews);

//
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page not found"));
});

// error handaling for the form validation
app.use((err, req, res, next) => {
  let { statuscode = 500, message = "something went wrong" } = err;
  res.status(statuscode).render("listings/error.ejs", { message });
});
