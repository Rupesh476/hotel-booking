import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import connectDB from './configs/db.js'
import { clerkMiddleware } from '@clerk/express'
import clerkWebhooks from './controllers/clerkWebhooks.js'

connectDB()

const app = express()
app.use(cors()) //Enable cross-origin Resource Sharing


//Middleware of clerk
app.post("/api/clerk", express.raw({ type: "*/*" }), clerkWebhooks);

app.use(express.json())
app.use(clerkMiddleware())

//Api to listen to clerk webhooks


app.get('/', (req,res)=> res.send("API is working "))

const PORT = process.env.PORT || 3000;

app.listen(PORT, ()=> console.log(`server is running on port ${PORT}`));
