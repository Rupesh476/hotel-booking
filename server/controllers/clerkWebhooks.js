import User from "../models/User.js";
import { Webhook } from "svix";
import getRawBody from "raw-body"; // <-- to read raw body

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

const clerkWebhooks = async (req, res) => {
  try {
    //create a Svix instance with clerk webhook secret
    const whook = process.env.CLERK_WEBHOOK_SECRET;

    // Getting headers
    const headers = {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    };

    // Verify the webhook using svix
    await whook.verify(JSON.stringify(req.body), headers)

    //Getting Data from request body
    const { data, type } = req.body

    const userData = {
      _id: data.id,
      email: data.email_addresses?.[0].email_address,
      username: data.first_name + " " + data.last_name,
      image: data.image_url ,
    };

    //switch case for differnt events
    switch (type) {
      case "user.created":{
        await User.create(userData)
      break;
      }
      
      case "user.updated":{
        await User.findByIdAndUpdate(data.id, userData);
        break;
      }

      case "user.deleted":{
        await User.findByIdAndDelete(data.id);
        break;
      }

      default:
        break;
    }

    return res.status(200).json({ success: true, message: "Webhook received" });
  } catch (err) {
    console.error(" Webhook Error:", err.message);
    return res.status(400).json({ success: false, message: "user not authorized" });
  }
};

export default clerkWebhooks;
