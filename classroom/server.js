const express = require("express");
const app = express();
const seesion = require("express-session");
const flash = require("connect-flash");
const session = require("express-session");
const path = require("path");


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));



const sessionOptions = {
  secret: "mysupersecreatString",
  resave: false,
  saveUninitialized: true,
};

app.use(session(sessionOptions));
app.use(flash());
app.use((req,res,next)=>{
  res.locals.succecemsg=req.flash("succefull");
  res.locals.errormsg=req.flash("error");
  next();
})

app.get("/register", (req, res) => {
  let { name = "parhitv" } = req.query;
  req.session.name = name;
  if(name==="parhitv"){
    req.flash("error","user not register");
  }else{
    req.flash("succefull","user Registered succefully!");
  }
  res.redirect("/hello");
});

app.get("/hello", (req, res) => {
  res.render("page.ejs",{name:req.session.name});
});

// app.get("/reqcount", (req, res) => {
//   if (req.session.value) {
    // req.session.value++;
//   } else {
    // req.session.value = 1;
//   }
// 
//   res.send(`You sent a request is ${req.session.value} time`);
// });

// app.get("/test",(req,res)=>{
//     res.send("Test working succefully");
// })

app.listen(3000, () => {
  console.log("server is working..");
});
