nutrientFetch = require('./NutrientFetch')
database = require('./Database')

const http = require("http");
const path = require("path");
const fs = require("fs");
const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config({ path: path.resolve(__dirname, 'creds/.env') }) 
const app = express();
const { MongoClient, ServerApiVersion } = require('mongodb');
const { response } = require('express');
app.use(bodyParser.urlencoded({extended:false}));

const uname = process.env.MONGO_DB_USERNAME;
const passwd = process.env.MONGO_DB_PASSWORD;
const databaseAndCollection = {db: process.env.MONGO_DB_NAME, collection: process.env.MONGO_COLLECTION};
const uri = `mongodb+srv://${uname}:${passwd}@cluster0.v5wvw2q.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
const db = process.env.MONGO_DB_NAME;
const collection = process.env.MONGO_COLLECTION;

app.set("views", path.resolve(__dirname, "templates"));
app.set("view engine", "ejs");
app.use(express.static(__dirname));

// add express endpoints here, use two modules above in endpoint code
// main page get
app.get("/", (request, response) => {
    response.render("index");
});

app.get("/addAccount", (request, response) => {
    response.render("addAccount");
})

app.post("/createAccountProcessed", async (request, response) => {
    console.log(request.body)
    await database.addUserInDatabase(request.body.name, request.body.email, client, db, collection)
    response.render("createAccountProcessed");
})

app.get("/addMeal", (request, response) => {
    response.render("addMeal");
});

// request that reads user info from request, calls API, add record to database
app.post("/addMealProcessed", async (request, response) => {
    let {email, desc} = request.body;
    const foodInfo = await nutrientFetch.getNutrientInfo(desc);
    if (foodInfo == undefined) {
        response.render("caloriesNotFound", {desc: desc});
    }
    const variables = {
        email: email,
        desc: desc,
        foodName: foodInfo.foodName,
        calories: foodInfo.calories
    }

    // desc not found
    if (foodInfo.foodName == undefined) {
        response.render("caloriesNotFound", {desc: desc});
    } else {
        await database.addFoodItemInDatabase(variables, client, db, collection)
        response.render("addMealProcessed", variables);
    }
    
});

app.get("/displayCalories", (request, response) => {
    response.render("displayCalories");
});

app.post("/displayCaloriesProcessed", async (request, response) => {
    let info = await database.getUserInfoFromDatabase({email: request.body.email}, client, db, collection);
    //info.array This is an array containing the food items for today.
    //info.totalCalories This is the sum of calories for the day.

    console.log(info.array)

    let table = ""; 
    info.array.forEach(element => {
        table += "<tr><td>" + element.foodName + "</td><td>" + element.calorie + "</td></tr>";
    });
    table +=  "<tr><td><strong>Total Calories</strong></td><td><strong>" + info.totalCalories + "</strong></td></tr>";
    const variables = {
        elements: table
    }
    response.render("displayCaloriesProcessed", variables);
})

// server setup
process.stdin.setEncoding("utf8");
const portNumber = process.env.PORT || 3000;
app.listen(portNumber);

const prompt = `Web server started and running at port: ${portNumber}\nStop to shutdown the server: `;
process.stdout.write(prompt);

// process input from command line
process.stdin.on("readable", function () {
    let dataInput = process.stdin.read();
    if (dataInput !== null) {
        let command = dataInput.trim();
        if (command === "stop") {
            process.stdout.write("Shutting down the server");
            process.exit(0);
        }
        process.stdin.resume();
  }
});

