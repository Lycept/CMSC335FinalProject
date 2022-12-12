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


const uname = process.env.MONGO_DB_USERNAME;
const passwd = process.env.MONGO_DB_PASSWORD;
const databaseAndCollection = {db: process.env.MONGO_DB_NAME, collection: process.env.MONGO_COLLECTION};

app.set("views", path.resolve(__dirname, "templates"));
app.set("view engine", "ejs");

// add express endpoints here, use two modules above in endpoint code
// main page get
app.get("/", (request, response) => {
    response.render("index");
});

app.get("/addAccount", (request, response) => {
    response.render("addAccount");
})

app.post("/createAccountProcessed", (request, response) => {
    response.render("createAccountProcessed");
})

app.get("/addMeal", (request, response) => {
    response.render("addMeal");
});

// request that reads user info from request, calls API, add record to database
app.use(bodyParser.urlencoded({extended:false}));
app.post("/addMealProcessed", async (request, response) => {
    let {name, email, desc} = request.body;
    const calories = await nutrientFetch.getNutrientInfo(desc);
    const variables = {
        name: name,
        email: email,
        desc: desc,
        calories: calories
    }

    // desc not found
    if (calories == undefined) {
        response.render("caloriesNotFound", {desc: desc});
    } else {
        response.render("addMealProcessed", variables);
    }
    
});

app.get("/displayCalories", (request, response) => {
    response.render("displayCalories");
});

app.post("/displayCaloriesProcessed", (request, response) => {

    const variables = {
        elements: "<tr><td>SampleData</td><td>100</td></tr>"
    }

    response.render("displayCaloriesProcessed", variables);
})

// server setup
process.stdin.setEncoding("utf8");
const portNumber = 3000
app.listen(portNumber);

const prompt = `Web server started and running at http://localhost:${portNumber}\nStop to shutdown the server: `;
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

