// require('dotenv').config({path: './env'})
import dotenv from 'dotenv';

import connectDB from './db/index.js';
import { app } from './app.js';

dotenv.config({
    path: './env'
})


connectDB()
    .then(() => {
        app.listen(process.env.PORT || 3000, () => {
            console.log(`Server is running at ${process.env.PORT}`)
        })
    })

    .catch((err) => {
            console.log("MongoDB connection failed: " + err);
    })




























/*
import express from 'express';

const app = express();

(async () => {
    try {
        mongoose.connect(`${process.env.DATABASE_URL}/${DB_NAME}`)
        app.on("error", (error) => {
            console.error("error: ", error);
            throw error;
        })

        app.listen(process.env.PORT, () => {
            console.log(`App is listening on port ${process.env.PORT}`)
        })

    } catch (error) {
        console.error("error: ", error);
        throw error;
    }
})()

*/