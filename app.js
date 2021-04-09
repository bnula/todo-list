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

const itemsSchema = mongoose.Schema({
   name: String
});

const Item = mongoose.model("Items", itemsSchema);

const item1 = new Item ({name: "Welcome to your new list"});
const item2 = new Item ({name: "Use + to add an item"});
const item3 = new Item ({name: "<-- click this to delete item"});

const defaultItems = [item1, item2, item3];

const listsSchema = mongoose.Schema({
   name: String,
   items: [itemsSchema]
});

const List = mongoose.model("List", listsSchema);

app.get("/", async (req, res) => {
   let listItems = [];
   await Item.find({}, (err, data) => {
      if (err) {
         console.log(err);
      } else {
         listItems = data;
         };
   });
   res.render("list", {listTitle: "To Do List", items: listItems, pageName: "/"});
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
});

app.get("/:type", async (req, res) => {
   const type = req.params.type;
   const colName = type + "Item";
   const Item = mongoose.model(colName, itemsSchema);
   await Item.find({}, (err, data) => {
         if (err) {
               console.log(err);
         } else {
               listItems = data;
         };
   });
   res.render("list", {listTitle: `${type} To Do List`, items: listItems, pageName: `/${type}`});
});

app.post("/:type", async (req, res) => {
   const type = req.params.type;
   if (type !== "delete") {
         const colName = type + "Item";
         const Item = mongoose.model(colName, itemsSchema);
         if (req.body.addItem !== "") {
               const item = new Item({
                     name: req.body.addItem
               });
               await item.save();
         };
         res.redirect(`/${type}`);
   } else {
         const itemId = req.body.removeItem;
         await Item.deleteOne({_id: itemId}, function (err){
               if (err) console.log(err);
         });
         res.redirect("/");
   }
});

app.listen(port, () => {
   console.log(`Server running at port ${port}.`);
});