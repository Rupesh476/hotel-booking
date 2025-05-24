import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import connectDB from './configs/db.js';
import { clerkMiddleware } from '@clerk/express';
import clerkWebhooks from './controllers/clerkWebhooks.js';
import userRouter from './routes/userRoutes.js';
import hotelRouter from './routes/hotelRoutes.js';
import connectClodinary from './configs/cloudinary.js';
import roomRouter from './routes/roomRoutes.js';
import bookingRouter from './routes/bookingRoutes.js';

connectDB();
connectClodinary()

const app = express();
app.use(cors());

//  Clerk webhook route - raw body needed
app.post("/api/clerk", express.raw({ type: 'application/json' }), clerkWebhooks);

//  JSON parser for all other routes
app.use(express.json());

//  Clerk auth middleware
app.use(clerkMiddleware());

//api routers
app.use('/api/user', userRouter)
app.use('/api/hotels', hotelRouter)
app.use('/api/rooms', roomRouter)
app.use('/api/bookings', bookingRouter)

//  Example test route
app.get('/', (req, res) => res.send("API is working"));



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(` Server running on port ${PORT}`));
