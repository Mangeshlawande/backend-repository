
// as early as possible import and configure env 
//require('dotenv').config({ path : "./env"}) // works well but violate consistency
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";


dotenv.config({
    path: "./env"
});

// return a promise 
connectDB()
    .then(()=>{
        app.on("error", ()=>{
            console.log(`❌ Express server error::  ${error}`);
        });
        app.listen(process.env.PORT || 8001, ()=>{
            console.log(`Server running in ${process.env.NODE_ENV || 'development!!'} mode on port ${process.env.PORT}`);

        });
    }).catch((error) => {
        console.log("MongoDB connection failed !!!  ", error);
    })


/*

*/



/**  1st approach
 // pollute index file.

 const app = express();
(async () =>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);

        app.on("error", (error) =>{
            console.error("Error, app is not connected to the DB :",error);
            throw error
        });

        app.listen(process.env.PORT, () =>{
            console.log(`App is Listening on port ${process.env.PORT}`);
            
        })

    } catch (error) {
        console.error("Error : ",error);
        throw error;
    }
})();

*/