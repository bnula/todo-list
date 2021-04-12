const _ = require("lodash");
const express = require("express");
const app = express();
app.use(express.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");
const port = process.env.PORT || 4000;

const accData = require("./config.json");
const acc = accData.mongo.acc;
const pwd = accData.mongo.pwd;

const mongoose = require("mongoose");
mongoose.connect(
   `mongodb+srv://${acc}:${pwd}@cluster0.1eajp.mongodb.net/toDoList?retryWrites=true&w=majority`,
   {
      useNewUrlParser:true,
      useUnifiedTopology:true,
      useFindAndModify: false
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
   res.render("list", {listTitle: "To Do List", items: listItems});
});

app.post("/", async (req, res) => {
   const type = _.lowerCase(req.body.listName);
   const itemName = req.body.addItem;
   const item = new Item(
      {
         name: itemName
      });
   if (type === "to do list") {
      item.save();
      res.redirect("/");
   } else {
      List.findOneAndUpdate({name: type}, {$push: {items: item}}, (err) => {
         if (err) {
            console.log(err)
         } else {
            console.log("Item added");
            res.redirect(`/${type}`);
         };
      });
   }
});

app.post("/delete", async (req, res) => {
   const type = _.lowerCase(req.body.listName);
   const itemId = req.body.removeItem;
   if (type === "to do list")
   {
      await Item.deleteOne({_id: itemId});
      res.redirect("/");
   } else {
      List.findOneAndUpdate({name: type}, {$pull: {items: {_id: itemId}}}, (err) => {
         if (err) {
            console.log(err)
         };
      });
      res.redirect(`/${type}`);
   };
});

app.get("/:type", (req, res) => {
   const type = _.lowerCase(req.params.type);
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
                     res.render("list", {listTitle: _.capitalize(type), items: listItems});
               }
         };
   });
});

app.listen(port, () => {
   console.log(`Server running at port ${port}.`);
});