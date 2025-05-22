import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import connectDB from './configs/db.js';
import { clerkMiddleware } from '@clerk/express';
import clerkWebhooks from './controllers/clerkWebhooks.js';

connectDB();

const app = express();
app.use(cors());

//  Webhook route must come BEFORE body parsers or middleware
app.use("/api/clerk", clerkWebhooks);

//  JSON parser AFTER webhook
app.use(express.json());

//  Clerk middleware AFTER webhook
app.use(clerkMiddleware());

app.use("/api/clerk", clerkWebhooks);

//  Regular routes
app.get('/', (req, res) => res.send("API is working"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
