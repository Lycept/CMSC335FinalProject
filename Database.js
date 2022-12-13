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
            desc: info.desc
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
async function getUserInfoFromDatabase(info) {
    
}

module.exports = {addUserInDatabase, addFoodItemInDatabase, getUserInfoFromDatabase}