import express from "express";
import cookieParser from "cookie-parser";
import cors from 'cors'

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


export { app }