const express = require("express");
const app = express();
const { MongoClient, ObjectId } = require("mongodb");

const url = "mongodb+srv://admin:admin@cluster0.vfeta.mongodb.net/data?retryWrites=true&w=majority";
const client = new MongoClient(url, { useUnifiedTopology: true });
const dbName = "data";

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: false}))

let db, shoesDb;

//home page route
app.get('/', (req, res) => {

    res.send('Home Page of the project')

})

//Get all the shoes in the database
app.get('/shoes', (req, res) => {

    async function findShoes() {
        const foundShoes = await shoesDb.find().toArray();
        res.json(foundShoes);
    }
    findShoes();

})

//Get one shoes by id
app.get('/shoes/:id', (req, res) => {

    async function findOneShoes() {
        const foundOneShoes = await shoesDb.findOne({"_id": ObjectId(req.params.id)})
        res.json(foundOneShoes);
    }
    findOneShoes();

})

//post shoes route
app.post('/shoes', (req, res) =>{
    console.log('I have received a post request in the /shoes route');
    //create a shoes object
    let shoes = new Shoes(req.body.model, req.body.availability, req.body.price, req.body.stock)
    //insert it to the database
    shoesDb.insertOne(shoes)
    res.sendStatus(200)
})

// Shoes router to delete
app.delete('/shoes', (req, res) =>{

    console.log('Shoes router to delete shoes');

    shoesDb.deleteOne({"_id": ObjectId(req.body.id)})

    async function findShoes() {
        const foundShoes = await  shoesDb.findOne({"_id": ObjectId(req.body.id)})

        if(foundShoes !== null){
            res.send("The entry was not deleted")
        }
        res.send("The entry was deleted")
    }
    findShoes();
})

// Shoes router for the update
app.put('/shoes', (req, res) => {
    console.log(' Shoes router for update ');
    async function findShoes() {
        try{
            const foundShoes = await  shoesDb.findOne({"_id": ObjectId(req.body.id)})

            if(foundShoes !== null){
                let shoes = new Shoes(foundShoes.model, foundShoes.availability, foundShoes.price, foundShoes.stock)

                shoes.model = req.body.model;
                shoes.availability = req.body.availability;
                shoes.price = req.body.price;
                shoes.stock = req.body.stock;

                try{
                    await shoesDb.updateOne(
                        {"_id": ObjectId(req.body.id)},
                        {$set:shoes});
                } catch(err){
                    console.log(err.stack)
                }
                res.send("The shoes were updated");
            } else {
                //if the shoes is not found send a message to the user saying that this entry doe not exist
                res.send("The shoes were not updated");
            }}catch(err){
            res.send("Object id is invalid")
        }
    }
    findShoes();
})

//Code used to start our application
async function run() {
    // try to start the application only if the database is connected correctly
    try {
        //connect to the database
        await client.connect();
        console.log("Connected correctly to server");
        //connect to the right database ("data")
        db = client.db(dbName);

        //get reference to our shoes "table"
        shoesDb = db.collection("shoes");

        //start listening to requests (get/post/etc.)
        app.listen(3000);
    } catch (err) {
        //in case we couldn't connect to our database throw the error in the console
        console.log(err.stack);
    }
}

run().catch(console.dir);

class Shoes {

    constructor(model, availability = false, price, stock) {
        this.model = model;
        this.availability = availability;
        this.price = price;
        this.stock = stock;
    }
}
