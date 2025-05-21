import User from "../models/User.js";
import { Webhook } from "svix";

const clerkWebhooks = async (req, res) => {
  try {
    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

    const headers = {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    };

    const payloadString = req.body.toString("utf8");
    const evt = wh.verify(payloadString, headers);
    const { data, type } = evt;

    const userData = {
      _id: data.id,
      email: data.email_addresses[0].email_address,
      username: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
      image: data.image_url,
    };

    console.log("➡️ Clerk webhook received:", type);
    console.log("➡️ User data to insert/update:", userData);

    switch (type) {
      case "user.created":
        await User.create(userData);
        console.log("✅ User created in DB");
        break;

      case "user.updated":
        await User.findByIdAndUpdate(data.id, userData, { new: true });
        console.log("✅ User updated in DB");
        break;

      case "user.deleted":
        await User.findByIdAndDelete(data.id);
        console.log("✅ User deleted from DB");
        break;

      default:
        console.log("⚠️ Unhandled webhook type:", type);
    }

    res.status(200).json({ success: true, message: "Webhook received" });
  } catch (error) {
    console.error("❌ Webhook processing error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export default clerkWebhooks;
