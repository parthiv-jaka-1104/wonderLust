const mongoose = require("mongoose");
const initdata=require("./data.js");
const Listing=require("../models/listing.js");

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

const initDb=async ()=>{
    await Listing.deleteMany({});
    await Listing.insertMany(initdata.data);
    console.log("Data was saved");
}
initDb();