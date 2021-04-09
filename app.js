const _ = require("lodash");
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

app.get("/:type", (req, res) => {
   const type = req.params.type;
   let listItems;
   List.findOne({name: type}, (err, data) => {
         if (err) {
               console.log(err);
         } else {
               if (!data) {
                     const list = new List({
                           name: type,
                           items: defaultItems
                     });
                     listItems = defaultItems;
                     list.save();
                     res.redirect(`/${type}`);
               } else {
                     listItems = data.items;
                     res.render("list", {listTitle: `${_.capitalize(type)} List`, items: listItems, pageName: `/${type}`});
               }
         };
   });
});

app.post("/:type", async (req, res) => {
   const type = req.params.type;
   if (type !== "delete") {
         const itemName = req.body.addItem;
   const item = new Item ({
         name: itemName
   });
   List.findOne({name: type}, (err, data) => {
         if (err) {
               console.log(err);
         } else {
               data.items.push(item);
               data.save();
         };
         });
         res.redirect(`/${type}`);
   } else {
         const itemId = req.body.removeItem;
         await Item.deleteOne({_id: itemId});
         res.redirect("/");
   };
});

app.post("/:type/delete", async (req, res) => {
   const type = req.params.type;
   const itemName = req.body.addItem;
   const item = new Item ({
         name: itemName
   });
   List.findOne({name: type}, async (err, data) => {
         if (err) {
               console.log(err);
         } else {
               data.items.pop(item);
               await data.save();
         };
   });
   res.redirect(`/${type}`);
});

app.listen(port, () => {
   console.log(`Server running at port ${port}.`);
});