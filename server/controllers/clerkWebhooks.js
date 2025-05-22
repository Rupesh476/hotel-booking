import User from "../models/User.js";
import { Webhook } from "svix";

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

const clerkWebhooks = async (req, res) => {
  try {
    const wh = new Webhook(webhookSecret);

    const headers = {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    };

    const payload = req.body; // raw Buffer
    const bodyString = payload.toString(); // Convert to string for svix verify

    const evt = wh.verify(bodyString, headers);
    const { data, type } = evt;

    console.log(" Verified Clerk webhook:", type);
    console.log(" Data:", JSON.stringify(data, null, 2));

    const userData = {
      _id: data.id,
      email: data.email_addresses[0]?.email_address || "",
      username: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
      image: data.image_url || "",
      recentSearchedCities: [], // Provide default value if required
    };

    switch (type) {
      case "user.created":
        await User.create(userData);
        break;

      case "user.updated":
        await User.findByIdAndUpdate(data.id, userData);
        break;

      case "user.deleted":
        await User.findByIdAndDelete(data.id);
        break;

      default:
        console.log("⚠️ Unhandled webhook type:", type);
        break;
    }

    res.status(200).json({ success: true, message: "Webhook received" });
  } catch (err) {
    console.error(" Webhook error:", err.message);
    res.status(400).json({ success: false, error: err.message });
  }
};

export default clerkWebhooks;
