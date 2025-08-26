import express from "express";
import cookieParser from "cookie-parser";
import cors from 'cors';
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();

app.use(cors({
    // whitelisting urls
    origin:process.env.CORS_ORIGIN,
    credentials: true,   
}));
app.use(express.json({
    limit:"16kb",
}));
// in  url space = %20
app.use(express.urlencoded({
    extended : true,
    limit:true,
}));
app.use(express.static("public"));
app.use(cookieParser());


app.use(errorHandler); // This must be the last middleware


// routes import
import userRouter from './routes/user.routes.js';


// routes declaration 
app.use('/api/v1/users',userRouter);

// http://localhost:8000/api/v1/users/register

export { app }