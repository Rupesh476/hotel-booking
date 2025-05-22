import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import connectDB from './configs/db.js';
import { clerkMiddleware } from '@clerk/express';
import clerkWebhooks from './controllers/clerkWebhooks.js';

connectDB();

const app = express();
app.use(cors());

//  Clerk webhook route - raw body needed
app.post("/api/clerk", express.raw({ type: 'application/json' }), clerkWebhooks);

//  JSON parser for all other routes
app.use(express.json());

//  Clerk auth middleware
app.use(clerkMiddleware());

//  Example test route
app.get('/', (req, res) => res.send("API is working"));

//  Other API routes (after body parser + auth)
app.use("/api/some-other-route", yourOtherRouteHandler); // optional

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(` Server running on port ${PORT}`));
