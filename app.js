//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose")
const _ = require("lodash");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//establish connection to database
mongoose.connect("mongodb+srv://Ahmed-Hamdy:Lolo123Lala@cluster0.2msekct.mongodb.net/todolistDB");

const itemsSchema = {
  name:String
};

//creating a collection
const Item = mongoose.model("item",itemsSchema);

const item1 = new Item({
    name:"Welcome to your to do list"
});
const item12 = new Item({
    name:"press the + button to add a new item"
});
const item0 = new Item({
    name:"<-- hit this to delete an item"
});
const deflt = [item1,item12,item0];
// Item.insertMany(deflt);

const listSchema = {
    name:String,
    items:[itemsSchema]
}

const List = mongoose.model("List",listSchema);



//Getting all the tasks for Today List
app.get("/", function(req, res) {
    async function Gettasks(){
        const query = Item.find({},);
        const doc = await query.exec();
        if(doc.length == 0){
            Item.insertMany(deflt);
        }

        res.render("list", {listTitle: "Today", newListItems: doc});
    }
  Gettasks();
  
});

//creating new custom to do lists or getting an already created one
app.get("/:jelly", function(req,res){
    const listNme = _.capitalize(req.params.jelly);
    async function getTasksCustm(){
    const query =List.findOne({name:listNme});
    const doc = await query.exec()
    if(!doc)
    {
        const list = new List({
            name:listNme,
            items:deflt
        })
        list.save();
        res.render("list", {listTitle: listNme, newListItems:deflt });
    }
    else
    {
        res.render("list", {listTitle: listNme, newListItems:doc.items });
    }
}
getTasksCustm();
});


//Adding Tasks to Today and Custom lists
app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const lstName = req.body.list;
const itemDoc = new Item({
  name:itemName
});

  if(lstName==="Today"){
    itemDoc.save();
    res.redirect("/")
}
else
{
    async function addtaskCustm(){
    const query= List.findOne({name:lstName})
    const doc = await query.exec();
    doc.items.push(itemDoc);
    doc.save();
    res.render("list", {listTitle: lstName, newListItems:doc.items });

}
    addtaskCustm();
}

});

//deleting Tasks from Today list and custom lists
app.post("/delete",function(req,res){
    const checkeditemID = (req.body.checkbox);
    const listName = req.body.listName;

    async function rem(id){
        await Item.findByIdAndDelete(id);
        res.redirect("/");
    }
    async function remcustomlist(id){
       await List.findOneAndUpdate({name:listName},{$pull:{items:{_id:id}}});
        res.redirect("/"+listName);
    }
    if(listName === "Today"){
        rem(checkeditemID);
    }
    else
    {
        remcustomlist(checkeditemID);
    }
})




app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});









