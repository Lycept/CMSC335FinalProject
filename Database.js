// add user data that we want into MondoDB,
// TODO: Rushil define the format for info, add format info into googl doc

async function addUserInDatabase(name, email, client, db, collection) {
    try {
        await client.connect();
        let food = []
        let obj = {
            email: email,
            name: name,
            foodItems: food
        }
        const result = await client.db(db).collection(collection).insertOne(obj);
        
        
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

async function addFoodItemInDatabase(info, client, db, collection) {
    try {
        await client.connect();
        let food = {
            foodName: info.foodName,
            calorie: info.calories,
            desc: info.desc,
            date: new Date()
        }
        let filter = {email : info.email};
        let update = { $push: {foodItems: food}};
        
        const result = await client.db(db)
        .collection(collection)
        .updateOne(filter, update);
        
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

// return info from MongoDB, also Rushil define what this format is
async function getUserInfoFromDatabase(info, client, db, collection) {
    
    try {
        await client.connect();
        
        const now = new Date().getTime();
        let start = new Date(now - (now % 86400000));

        start.setDate(start.getDate()-1);
        
        const cursor = await client.db(db).
        collection(collection).
        aggregate([
            {
                $match: {
                    email: info.email
                }
            },
            {
                $project: {
                    foodItems: {
                        $map: {
                            input: "$foodItems",
                            as: "item",
                            in: {
                                $cond: [
                                    { $gte: ["$$item.date", start] },
                                    "$$item",
                                    false
                                ]
                            }
                        }
                    }
                }
            }
        ]);
        let result = await cursor.toArray();
        let sumCals = 0;
        let arr = [];
        for (const doc of result) {
            for (const item of doc.foodItems) {
              arr.push(item)
              sumCals += item.calorie;
            }
          }
          let returner = {
            array: arr,
            totalCalories: sumCals
          }
        return returner;
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

module.exports = {addUserInDatabase, addFoodItemInDatabase, getUserInfoFromDatabase}