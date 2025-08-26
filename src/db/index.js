import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";



/** 
 * DB is in another continent
  connect database through mongoose 

  throw automatically exit process  , no need  exit(1), 0,

  process comes from nodejs
  current app run on existing process &where the process refer to 

 */
mongoose.set('debug', true); 

const connectDB = async () => {
    try {
        // mongodb returns an object as response 
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        // console.log(`\n MongoDB Connected !! : DB Host: ${connectionInstance} `);
        console.log(`\n MongoDB Connected !! : DB Host: ${connectionInstance.connection.host} `);
        // to which db is connected, ie test , production , server 

    } catch (error) {
        console.error("MongoDB Connection FAILED : ", error);
        process.exit(1);
    }
};

export default connectDB 