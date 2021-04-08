const express = require("express");
const app = express();
app.use(express.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");
const port = 4000;

const mongoose = require("mongoose");
mongoose.connect(
   "mongodb://localhost:27017/todolistDB",
   {
      useNewUrlParser:true,
      useUnifiedTopology:true
   });

const itemSchema = mongoose.Schema({
   name: String
});

app.get("/", (req, res) => {
   res.render("index");
});

app.listen(port, () => {
   console.log(`Server running at port ${port}.`);
});