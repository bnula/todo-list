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

const Item = mongoose.model("Items", itemSchema);

app.get("/", async (req, res) => {
   let listItems = [];
   await Item.find({}, (err, data) => {
      if (err) {
         console.log(err);
      } else {
         listItems = data;
      };
   });
   res.render("list", {items: listItems});
});

app.post("/", async (req, res) => {
   const itemName = req.body.addItem;
   const item = new Item(
      {
         name: itemName
      });
   await item.save();
   res.redirect("/");
});

app.post("/delete", async (req, res) => {
   const itemId = req.body.removeItem;
   await Item.deleteOne({_id: itemId});
   res.redirect("/");
})

app.listen(port, () => {
   console.log(`Server running at port ${port}.`);
});