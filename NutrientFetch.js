const fetch = require("node-fetch");

const API_KEY = "bc5fffe000503b4532cbd1b310c9cf32";
const API_ID = "1e3eb607";
const url = "https://trackapi.nutritionix.com/v2/natural/nutrients";

// docs: https://trackapi.nutritionix.com/docs/#/default/post_v2_natural_nutrients

// This function will take in a query string, such as the food from a user, return the calorie information for it via API request
async function getNutrientInfo(query) {
    const data = await fetch(url, {
        method: 'POST',
        body: JSON.stringify({"query": query}),
        headers: {'Content-Type': 'application/json', "x-app-id": API_ID, "x-app-key": API_KEY, "x-remote-user-id": 0}
    });
    const json = await data.json();
    //console.log("Calories: " + json["foods"][0][["nf_calories"]]);
    return json["foods"][0][["nf_calories"]]
}

module.exports = {getNutrientInfo}